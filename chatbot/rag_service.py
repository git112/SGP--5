#!/usr/bin/env python3
"""
Placementor RAG Service (fixed)
- Keeps all company/role/package info visible
- ONLY redacts student-identifying PII (names, ids, emails, phones, roll numbers)
- Uses Ollama embeddings + chat when available
- Deterministic structured handlers for:
  - Highest package (per year)
  - Top companies
  - Total students placed (per year)
  - Average package (per year)
- Fixes for PII leakage, output formatting, and energetic greetings (Nov 16, 2025)
"""

import os
import re
import logging
from typing import List, Dict, Any, Generator
from pathlib import Path
import pandas as pd
import importlib

# dotenv (safe import)
try:
    from dotenv import load_dotenv
except Exception:
    load_dotenv = lambda *a, **k: None

_log = logging.getLogger(__name__)


def _try_module_attr(module_name: str, attr: str = None):
    try:
        m = importlib.import_module(module_name)
        return getattr(m, attr) if attr else m
    except Exception:
        return None


# --- Compatibility shim ---
Document = (
    _try_module_attr("langchain.schema", "Document")
    or _try_module_attr("langchain_core.documents", "Document")
)

PromptTemplate = (
    _try_module_attr("langchain.prompts.prompt", "PromptTemplate")
    or _try_module_attr("langchain.prompts", "PromptTemplate")
    or _try_module_attr("langchain_core.prompts", "PromptTemplate")
)

PyPDFLoader = (
    _try_module_attr("langchain.document_loaders", "PyPDFLoader")
    or _try_module_attr("langchain_community.document_loaders", "PyPDFLoader")
)

UnstructuredWordDocumentLoader = (
    _try_module_attr("langchain.document_loaders", "UnstructuredWordDocumentLoader")
    or _try_module_attr("langchain_community.document_loaders", "UnstructuredWordDocumentLoader")
)

RecursiveCharacterTextSplitter = (
    _try_module_attr("langchain_text_splitters", "RecursiveCharacterTextSplitter")
    or _try_module_attr("langchain.text_splitter", "RecursiveCharacterTextSplitter")
)

Chroma = (
    _try_module_attr("langchain.vectorstores", "Chroma")
    or _try_module_attr("langchain_community.vectorstores", "Chroma")
    or _try_module_attr("langchain_core.vectorstores", "Chroma")
)

ConversationalRetrievalChain = (
    _try_module_attr("langchain.chains.conversational_retrieval", "ConversationalRetrievalChain")
    or _try_module_attr("langchain_community.chains.conversational_retrieval", "ConversationalRetrievalChain")
    or _try_module_attr("langchain.chains", "ConversationalRetrievalChain")
    or _try_module_attr("langchain_core.chains", "ConversationalRetrievalChain")
)

LLMChain = (
    _try_module_attr("langchain", "LLMChain")
    or _try_module_attr("langchain.chains", "LLMChain")
    or _try_module_attr("langchain_core.chains", "LLMChain")
)

ConversationBufferMemory = (
    _try_module_attr("langchain.memory", "ConversationBufferMemory")
    or _try_module_attr("langchain_core.memory", "ConversationBufferMemory")
)

OllamaEmbeddings = (
    _try_module_attr("langchain_ollama", "OllamaEmbeddings")
    or _try_module_attr("langchain_ollama.embeddings", "OllamaEmbeddings")
)

ChatOllama = (
    _try_module_attr("langchain_ollama.chat_models", "ChatOllama")
    or _try_module_attr("langchain_ollama", "ChatOllama")
)

_missing = [
    name
    for name, obj in [
        ("Document", Document),
        ("PromptTemplate", PromptTemplate),
        ("PyPDFLoader", PyPDFLoader),
        ("UnstructuredWordDocumentLoader", UnstructuredWordDocumentLoader),
        ("RecursiveCharacterTextSplitter", RecursiveCharacterTextSplitter),
        ("Chroma", Chroma),
        ("ConversationalRetrievalChain", ConversationalRetrievalChain),
        ("LLMChain", LLMChain),
        ("ConversationBufferMemory", ConversationBufferMemory),
        ("OllamaEmbeddings", OllamaEmbeddings),
        ("ChatOllama", ChatOllama),
    ]
    if obj is None
]

if _missing:
    _log.warning("LangChain compatibility shim could not find these symbols: %s", _missing)

# load env
load_dotenv()

# logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class PlacementorRAGService:
    """RAG for Placementor: redact only student-identifying PII and answer from data."""

    def __init__(self, data_folder: str = "./data", vector_db_path: str = "./vector_db"):
        self.data_folder = data_folder
        self.vector_db_path = vector_db_path
        self.vector_store = None
        self.qa_chain = None
        self.memory = None
        self.embeddings = None
        self.llm = None
        self.master_df: pd.DataFrame | None = None

        # PII patterns - intentionally conservative so companies/roles aren't matched
        self.pii_patterns = {
            "student_name": re.compile(r"\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b"),
            "student_id": re.compile(r"\b(?:21BCP|22BCP|23BCP|24BCP|25BCP)[A-Z0-9]+\b|\b\d{7,}\b"),
            "email": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
            "phone": re.compile(r"\b(?:\+91|91)?[6-9]\d{9}\b"),
            "roll_number": re.compile(r"\b\d{2}[A-Z]{2,4}\d{3,4}\b"),
        }

        # initialize
        self._initialize_rag()

    # ----------------- models -----------------
    def _initialize_models(self):
        try:
            if OllamaEmbeddings is None or ChatOllama is None:
                raise RuntimeError("Ollama bindings not available (OllamaEmbeddings/ChatOllama missing)")

            self.embeddings = OllamaEmbeddings(model="nomic-embed-text")
            logger.info("OllamaEmbeddings (nomic-embed-text) initialized.")

            self.llm = ChatOllama(model="llama3", temperature=0.2)
            logger.info("ChatOllama initialized: llama3")

        except Exception as e:
            logger.error("Error initializing models: %s", e, exc_info=True)
            raise

    def _initialize_rag(self):
        try:
            logger.info("Initializing Placementor RAG system...")
            # models
            self._initialize_models()

            # vector DB load/create
            if os.path.exists(self.vector_db_path):
                logger.info("Loading existing vector database...")
                try:
                    self.vector_store = Chroma(persist_directory=self.vector_db_path, embedding_function=self.embeddings)
                except Exception:
                    try:
                        self.vector_store = Chroma(persist_directory=self.vector_db_path, embedding=self.embeddings)
                    except Exception as e:
                        logger.error("Failed to load Chroma: %s", e)
                        raise
            else:
                logger.info("Creating new vector DB from data...")
                documents = self._load_and_process_documents()

                if not documents:
                    logger.warning("No documents found; adding fallback doc")
                    if Document is not None:
                        documents = [Document(page_content="No placement data available.", metadata={"source": "fallback"})]
                    else:
                        d = type("D", (), {})()
                        d.page_content = "No placement data available."
                        d.metadata = {"source": "fallback"}
                        documents = [d]

                try:
                    self.vector_store = Chroma.from_documents(documents=documents, embedding=self.embeddings, persist_directory=self.vector_db_path)
                except Exception:
                    try:
                        self.vector_store = Chroma.from_documents(documents=documents, embedding_function=self.embeddings, persist_directory=self.vector_db_path)
                    except Exception:
                        self.vector_store = Chroma(persist_directory=self.vector_db_path, embedding_function=self.embeddings)
                        if hasattr(self.vector_store, "add_documents"):
                            self.vector_store.add_documents(documents)

                logger.info("Created vector database with %d documents.", len(documents))

            # setup chain (may fall back to manual retriever if library classes unavailable)
            self._setup_conversational_chain()
            logger.info("RAG system initialized successfully!")

        except Exception as e:
            logger.error("Error initializing RAG system: %s", e, exc_info=True)
            raise

    # ----------------- data ingestion -----------------
    def _load_and_process_documents(self) -> List[Any]:
        logger.info("Starting data loading and merging...")
        data_path = Path(self.data_folder)
        all_docs: List[Any] = []

        if not data_path.exists():
            logger.warning("Data folder '%s' not found.", self.data_folder)
            return all_docs

        excel_files = list(data_path.glob("**/*.xlsx"))
        logger.info("Found %d Excel files.", len(excel_files))

        all_dfs = []
        for file_path in excel_files:
            try:
                year_match = re.search(r"\b(20\d{2})\b", file_path.name)
                if not year_match:
                    logger.warning("Skipping Excel without year in name: %s", file_path.name)
                    continue
                year = int(year_match.group(1))
                xls = pd.ExcelFile(str(file_path))
                sheet_name = "Sheet1" if "Sheet1" in xls.sheet_names else xls.sheet_names[0]
                df = pd.read_excel(file_path, sheet_name=sheet_name)
                df["Year"] = year
                all_dfs.append(df)
            except Exception as e:
                logger.error("Could not process Excel %s: %s", file_path.name, e, exc_info=True)

        if all_dfs:
            master_df = pd.concat(all_dfs, ignore_index=True)
            logger.info("Created master DataFrame with %d rows.", len(master_df))

            master_df.columns = master_df.columns.str.lower().str.strip()
            column_map = {
                "student name": "name",
                "student_name": "name",
                "branch": "branch",
                "b.tech cgpa (upto 6th sem)": "cgpa",
                "cgpa": "cgpa",
                "company name": "company",
                "company": "company",
                "roles offered": "role",
                "role": "role",
                "package": "package_lpa",
                "package (lpa)": "package_lpa",
                "package_lpa": "package_lpa",
                "locations": "location",
            }
            master_df.rename(columns=column_map, inplace=True)

            # normalize year column
            if "year" not in master_df.columns and "Year" in master_df.columns:
                master_df.rename(columns={"Year": "year"}, inplace=True)
            if "year" not in master_df.columns:
                master_df["year"] = master_df.get("year", pd.NA)

            self.master_df = master_df

            for index, row in master_df.iterrows():
                try:
                    text_chunk = self._row_to_text(row)
                except Exception as e:
                    logger.error("Error converting row %d to text: %s", index, e, exc_info=True)
                    text_chunk = ""

                if text_chunk:
                    # redact PII in text chunk (keeps company/role/package intact)
                    anonymized_chunk = self._anonymize_pii(text_chunk)
                    if Document is not None:
                        all_docs.append(Document(page_content=anonymized_chunk, metadata={"source": f"ExcelData_Year_{row.get('year','UNK')}", "row": int(index), "type": "placement_record"}))
                    else:
                        o = type("D", (), {})()
                        o.page_content = anonymized_chunk
                        o.metadata = {"source": f"ExcelData_Year_{row.get('year','UNK')}", "row": int(index), "type": "placement_record"}
                        all_docs.append(o)
            logger.info("Total documents created from Excel: %d", len(all_docs))

        # PDFs
        pdf_files = list(data_path.glob("**/*.pdf"))
        logger.info("Found %d PDF files.", len(pdf_files))
        for file_path in pdf_files:
            try:
                all_docs.extend(self._process_text_file(PyPDFLoader, file_path, "pdf_jd"))
            except Exception as e:
                logger.error("Error processing PDF %s: %s", file_path.name, e, exc_info=True)

        # DOCX
        docx_files = list(data_path.glob("**/*.docx"))
        logger.info("Found %d DOCX files.", len(docx_files))
        for file_path in docx_files:
            try:
                all_docs.extend(self._process_text_file(UnstructuredWordDocumentLoader, file_path, "docx_jd"))
            except Exception as e:
                logger.error("Error processing DOCX %s: %s", file_path.name, e, exc_info=True)

        logger.info("Total documents processed: %d", len(all_docs))
        return all_docs

    # ----------------- text generation helpers -----------------
    
    def _safe_get(self, r, key, default=pd.NA):
        """
        Safely get a value from a pandas Series (row),
        handling potential duplicate columns or NaNs.
        """
        try:
            val = r.get(key, default)
        except Exception:
            try:
                val = r[key]
            except Exception:
                val = default
        # pandas Series -> scalar (happens with duplicate columns)
        if isinstance(val, pd.Series):
            try:
                v = val.dropna().iloc[0]
                return v if v is not None else default
            except Exception:
                return default
        if isinstance(val, (list, tuple)):
            return val[0] if val else default
        try:
            if pd.isna(val):
                return default
        except Exception:
            pass
        return val

    def _row_to_text(self, row: pd.Series) -> str:
        
        # Use the class method self._safe_get
        year = self._safe_get(row, "year", self._safe_get(row, "Year", "an unknown year"))
        company = str(self._safe_get(row, "company", "N/A")).strip()
        package = self._safe_get(row, "package_lpa", self._safe_get(row, "package", "N/A"))
        name = str(self._safe_get(row, "name", "[STUDENT]")).strip()
        role = str(self._safe_get(row, "role", "an unspecified role")).strip()
        branch = str(self._safe_get(row, "branch", "an unspecified branch")).strip()
        cgpa = self._safe_get(row, "cgpa", "N/A")

        # only create text if company and package present
        if company == "N/A" or package == "N/A" or package is None:
            return ""

        # keep company/role/package intact; redact only in final scrub
        return (
            f"Placement Record (Year: {year}): Student {name} from the {branch} branch with a CGPA of {cgpa} was placed at {company} as a {role} with a package of {package} LPA."
        )

    def _get_company_from_filename(self, filename: str) -> str:
        name_no_ext = Path(filename).stem
        name_normalized = re.sub(r"[_-]", " ", name_no_ext)
        company = name_normalized.split(" ")[0]
        return company.capitalize()

    def _process_text_file(self, loader_class, file_path: Path, doc_type: str) -> List[Any]:
        documents = []
        if loader_class is None:
            logger.warning("No loader available for %s; skipping", file_path)
            return documents
        try:
            loader = loader_class(str(file_path))
            pages = loader.load()
        except Exception as e:
            logger.error("Loader failed for %s: %s", file_path, e, exc_info=True)
            return documents

        text_splitter = None
        if RecursiveCharacterTextSplitter is not None:
            try:
                text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
            except Exception:
                text_splitter = None

        if text_splitter is None:
            for p in pages:
                content = getattr(p, "page_content", str(p))
                anonymized = self._anonymize_pii(content)
                meta = {"source": str(file_path), "type": doc_type}
                if Document is not None:
                    documents.append(Document(page_content=anonymized, metadata=meta))
                else:
                    d = type("D", (), {})()
                    d.page_content = anonymized
                    d.metadata = meta
                    documents.append(d)
            return documents

        try:
            chunks = text_splitter.split_documents(pages)
        except Exception:
            chunks = pages

        company_name = self._get_company_from_filename(file_path.name)
        for i, chunk in enumerate(chunks):
            content = (
                f"This document is a Job Description from the company '{company_name}'. Content (chunk {i+1}): {getattr(chunk, 'page_content', str(chunk))}"
            )
            anonymized_content = self._anonymize_pii(content)
            meta = getattr(chunk, "metadata", {}) if hasattr(chunk, "metadata") else {}
            meta.update({"source": str(file_path), "file_name": file_path.name, "type": doc_type, "company_context": company_name})
            if Document is not None:
                documents.append(Document(page_content=anonymized_content, metadata=meta))
            else:
                d = type("D", (), {})()
                d.page_content = anonymized_content
                d.metadata = meta
                documents.append(d)
        return documents

    def _anonymize_pii(self, text: str) -> str:
        """Redact only student-identifying PII and return text. Company names, roles and packages are preserved."""
        if not isinstance(text, str):
            return ""
        out = text
        for key, pattern in self.pii_patterns.items():
            try:
                # uniform token e.g. [STUDENT_NAME], [EMAIL], [PHONE]
                token = f"[{key.upper()}]"
                out = pattern.sub(token, out)
            except Exception:
                pass
        return out

    def _scrub_output(self, text: str) -> str:
        """
        (FIX) Remove any PII tokens or artifacts that the LLM might have leaked from its output.
        This is a final safety net.
        """
        if not isinstance(text, str):
            return ""
        out = text
        
        # 1. Clean up "A student" artifact seen in user logs
        out = re.sub(r"\bA student\b", "a student", out, flags=re.I)
        
        # 2. Replace PII tokens with generic descriptors
        for key in self.pii_patterns.keys():
            token = f"[{key.upper()}]"
            if key == "student_name":
                out = out.replace(token, "a student")
            elif key in ("student_id", "roll_number"):
                out = out.replace(token, "an ID")
            elif key in ("email", "phone"):
                out = out.replace(token, "[REDACTED CONTACT]")
            else:
                out = out.replace(token, "[REDACTED]")
        
        # 3. Clean up pandas Series string artifacts
        # Example: "company    Eminencets / deloitte (Final)\ncompany                              NaN\nName: 370, dtype: object"
        out = re.sub(r"company\s+NaN\s+Name:\s+\d+,\s+dtype:\s+object", "", out, flags=re.I)
        out = re.sub(r"\s+company\s+NaN\s+Name:\s+\d+,\s+dtype:\s+object", "", out, flags=re.I)
        
        return out.strip()


    # ----------------- LLM wrappers & fallbacks -----------------
    @staticmethod
    def try_extract_text(candidate: Any) -> str | None:
        try:
            if candidate is None:
                return None
            if isinstance(candidate, str):
                return candidate
            if isinstance(candidate, dict):
                if "choices" in candidate and candidate["choices"]:
                    c = candidate["choices"][0]
                    if isinstance(c, dict):
                        return c.get("message", {}).get("content") or c.get("text") or str(candidate)
                return candidate.get("content") or candidate.get("text") or str(candidate)
            if hasattr(candidate, "text"):
                return str(candidate.text)
            if hasattr(candidate, "content"):
                return str(candidate.content)
            if hasattr(candidate, "generations"):
                try:
                    g = candidate.generations
                    if g and isinstance(g, (list, tuple)) and len(g) > 0:
                        first = g[0]
                        if isinstance(first, (list, tuple)):
                            inner = first[0]
                            if hasattr(inner, "text"):
                                return str(inner.text)
                        if hasattr(first, "text"):
                            return str(first.text)
                except Exception:
                    pass
            if isinstance(candidate, (list, tuple)):
                parts = [PlacementorRAGService.try_extract_text(x) for x in candidate]
                parts = [p for p in parts if p]
                return " ".join(parts) if parts else None
            return str(candidate)
        except Exception:
            return None

    def _simple_qa(self, question: str) -> str:
        prompt_text = f"You are Placementor AI. Answer concisely, analytically and NEVER reveal personal names or student IDs.\n\nQuestion: {question}\n\nAnswer:"

        HumanMessage = _try_module_attr("langchain.schema", "HumanMessage") or _try_module_attr("langchain_core.schema", "HumanMessage")
        SystemMessage = _try_module_attr("langchain.schema", "SystemMessage") or _try_module_attr("langchain_core.schema", "SystemMessage")

        # 1) langchain chat-style generate
        try:
            if HumanMessage and SystemMessage and hasattr(self.llm, "generate"):
                sys_msg = SystemMessage(content="You are Placementor AI. Be concise, analytical, and never reveal personal names or student IDs.")
                human_msg = HumanMessage(content=prompt_text)
                try:
                    out = self.llm.generate([[sys_msg, human_msg]])
                    text = self.try_extract_text(out)
                    if text:
                        return text
                except Exception:
                    try:
                        out = self.llm.generate([sys_msg, human_msg])
                        text = self.try_extract_text(out)
                        if text:
                            return text
                    except Exception:
                        pass
        except Exception:
            pass

        # 2) call with messages list/dict
        try:
            if hasattr(self.llm, "__call__") or hasattr(self.llm, "chat") or hasattr(self.llm, "generate_chat"):
                messages = [{"role": "system", "content": "You are Placementor AI. Be concise, analytical, and never reveal personal names or student IDs."}, {"role": "user", "content": prompt_text}]
                try:
                    out = self.llm(messages)
                    text = self.try_extract_text(out)
                    if text:
                        return text
                except Exception:
                    try:
                        out = self.llm.chat(messages)
                        text = self.try_extract_text(out)
                        if text:
                            return text
                    except Exception:
                        pass
        except Exception:
            pass

        # 3) lower-level client patterns
        try:
            client = getattr(self.llm, "client", None) or getattr(self.llm, "api_client", None)
            if client:
                try:
                    if hasattr(client, "chat") and hasattr(client.chat, "create"):
                        out = client.chat.create(model=getattr(self.llm, "model", None) or "llama3", messages=[{"role": "user", "content": prompt_text}])
                        text = self.try_extract_text(out)
                        if text:
                            return text
                except Exception:
                    pass
        except Exception:
            pass

        # 4) callable fallback
        try:
            if callable(self.llm):
                out = self.llm(prompt_text)
                text = self.try_extract_text(out)
                if text:
                    return text
        except Exception:
            pass

        # 5) convenience method attempts
        for attr in ("generate_one", "generate_one_text", "predict", "run", "invoke"):
            try:
                if hasattr(self.llm, attr):
                    fn = getattr(self.llm, attr)
                    out = fn(prompt_text)
                    text = self.try_extract_text(out)
                    if text:
                        return text
            except Exception:
                pass

        logger.error("Minimal LLM call failed: no supported call pattern worked for this llm object. Methods: %s", ", ".join(sorted([m for m in dir(self.llm) if not m.startswith('_')])[:200]))
        return "Sorry, the minimal QA fallback failed."

    def _setup_conversational_chain(self):
        if not self.llm or not self.vector_store:
            self.qa_chain = None
            logger.warning("Cannot setup QA chain because LLM or Vector Store unavailable.")
            return

        self.memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True, output_key="answer") if ConversationBufferMemory is not None else None

        try:
            retriever = self.vector_store.as_retriever(search_type="mmr", search_kwargs={"k": 7, "fetch_k": 20})
        except Exception:
            try:
                retriever = getattr(self.vector_store, "as_retriever", lambda **kw: self.vector_store)(search_type="mmr", search_kwargs={"k": 7, "fetch_k": 20})
            except Exception:
                retriever = None

        # (FIX) Updated prompt to explicitly forbid PII tokens
        template = """
You are 'Placementor AI', an expert placement data analyst for a university.
Answer by aggregating and analyzing the context.
Your primary rule is to NEVER reveal personal student data.
- NEVER reveal personal names or student IDs.
- CRITICALLY: NEVER output the literal tokens like [STUDENT_NAME], [STUDENT_ID], [EMAIL], [PHONE], or [ROLL_NUMBER].
- If you see [STUDENT_NAME] in the context, refer to them as "a student" or "anonymized student". Do not repeat the token.

Context:
{context}

Chat History:
{chat_history}

User's Question:
{question}

Your Answer:
"""

        prompt_template_obj = None
        if PromptTemplate is not None:
            try:
                prompt_template_obj = PromptTemplate.from_template(template) if hasattr(PromptTemplate, "from_template") else PromptTemplate(template=template, input_variables=["context", "chat_history", "question"])
            except Exception:
                prompt_template_obj = None

        # Try ConversationalRetrievalChain
        try:
            if ConversationalRetrievalChain is not None:
                kwargs = {"llm": self.llm, "retriever": retriever, "return_source_documents": True, "verbose": False}
                if self.memory is not None:
                    kwargs["memory"] = self.memory
                if prompt_template_obj is not None:
                    kwargs["combine_docs_chain_kwargs"] = {"prompt": prompt_template_obj}

                if hasattr(ConversationalRetrievalChain, "from_llm"):
                    self.qa_chain = ConversationalRetrievalChain.from_llm(**kwargs)
                else:
                    self.qa_chain = ConversationalRetrievalChain(**kwargs)
                logger.info("Memory-enabled RAG chain initialized using ConversationalRetrievalChain.")
                return
        except Exception as e:
            logger.warning("ConversationalRetrievalChain path failed: %s", e, exc_info=True)

        # RetrievalQA fallback
        try:
            RetrievalQA = _try_module_attr("langchain.chains", "RetrievalQA") or _try_module_attr("langchain.chains.retrieval", "RetrievalQA")
            if RetrievalQA is not None:
                try:
                    if hasattr(RetrievalQA, "from_chain_type"):
                        self.qa_chain = RetrievalQA.from_chain_type(llm=self.llm, chain_type="stuff", retriever=retriever, return_source_documents=True)
                    else:
                        self.qa_chain = RetrievalQA(llm=self.llm, retriever=retriever, return_source_documents=True)
                    logger.info("RetrievalQA fallback chain initialized successfully.")
                    return
                except Exception as e:
                    logger.warning("RetrievalQA creation failed: %s", e, exc_info=True)
        except Exception:
            pass

        # final minimal fallback that still uses LLM via _simple_qa
        logger.info("Using minimal custom QA fallback (manual retriever + LLM wrapper).")

        def _call_minimal(q: str) -> str:
            # manual retrieval: try to get top docs then call the LLM with context
            try:
                retrieved = []
                if retriever is not None:
                    docs = retriever.get_relevant_documents(q) if hasattr(retriever, "get_relevant_documents") else []
                    # take top 4 chunks
                    for d in (docs[:4] if docs else []):
                        retrieved.append(getattr(d, "page_content", str(d)))
                context = "\n\n".join(retrieved)[:4000] if retrieved else ""
                # (FIX) Use the improved prompt template logic
                prompt = f"""
You are 'Placementor AI'. Use the context below.
Your primary rule is to NEVER reveal personal student data.
- NEVER reveal personal names or student IDs.
- CRITICALLY: NEVER output the literal tokens like [STUDENT_NAME], [STUDENT_ID], etc.
- If you see [STUDENT_NAME] in the context, refer to them as "a student".

Context:
{context}

Question: {q}

Answer:
"""
                return self._simple_qa(prompt)
            except Exception:
                return self._simple_qa(q)

        class MinimalChain:
            def __init__(self, func):
                self.func = func

            def invoke(self, inp: Dict[str, Any]):
                return {"answer": self.func(inp.get("question", "")), "source_documents": []}

        self.qa_chain = MinimalChain(_call_minimal)
        logger.info("Minimal custom QA fallback initialized (uses LLM + manual retrieval).")

    # ----------------- structured helpers -----------------
    def get_highest_package_by_year(self, year: int):
        df = getattr(self, "master_df", None)
        if df is None:
            return None
        try:
            df_year = df[df["year"].astype(str).str.contains(str(year), na=False)]
            if df_year.empty:
                return None
            df_year = df_year.copy()
            df_year["package_lpa"] = pd.to_numeric(df_year["package_lpa"], errors="coerce")
            df_year = df_year.dropna(subset=["package_lpa"])
            if df_year.empty:
                return None
            row = df_year.loc[df_year["package_lpa"].idxmax()]
            
            # (FIX) Use _safe_get to avoid pandas Series string output
            company_name = str(self._safe_get(row, "company", "Unknown Company")).strip()
            
            return {"company": company_name, "package_lpa": float(row.get("package_lpa")), "year": int(year)}
        except Exception as e:
            logger.error("Error in get_highest_package_by_year: %s", e, exc_info=True)
            return None

    def get_top_companies(self, limit: int = 5, location: str | None = None):
        df = getattr(self, "master_df", None)
        if df is None:
            return []
        try:
            df2 = df.copy()
            if location:
                df2 = df2[df2.get("location", "").astype(str).str.contains(location, case=False, na=False)]
            df2["package_lpa"] = pd.to_numeric(df2["package_lpa"], errors="coerce")
            grouped = df2.groupby("company", dropna=True)["package_lpa"].max().reset_index()
            top = grouped.sort_values("package_lpa", ascending=False).head(limit)
            return [{"company": r["company"], "package_lpa": float(r["package_lpa"])} for _, r in top.iterrows()]
        except Exception:
            return []

    # (FIX) NEW helper for calculating COUNT
    def get_placement_count_by_year(self, year: int):
        df = getattr(self, "master_df", None)
        if df is None:
            return None
        try:
            df_year = df[df["year"].astype(str).str.contains(str(year), na=False)]
            # Ensure we only count rows that have a valid placement (e.g., a company and package)
            df_placed = df_year.dropna(subset=["company", "package_lpa"])
            if df_placed.empty:
                return 0
            return len(df_placed)
        except Exception as e:
            logger.error("Error in get_placement_count_by_year: %s", e, exc_info=True)
            return None

    # (FIX) NEW helper for calculating AVERAGE
    def get_average_package_by_year(self, year: int):
        df = getattr(self, "master_df", None)
        if df is None:
            return None
        try:
            df_year = df[df["year"].astype(str).str.contains(str(year), na=False)]
            df_year = df_year.copy()
            df_year["package_lpa"] = pd.to_numeric(df_year["package_lpa"], errors="coerce")
            df_placed = df_year.dropna(subset=["package_lpa"])
            if df_placed.empty:
                return 0.0
            avg_pkg = df_placed["package_lpa"].mean()
            return round(avg_pkg, 2) # Round to 2 decimal places
        except Exception as e:
            logger.error("Error in get_average_package_by_year: %s", e, exc_info=True)
            return None

    # ----------------- QA call helper -----------------
    def _call_qa_chain_safe(self, contextual_query: str) -> Dict[str, Any]:
        try:
            if hasattr(self.qa_chain, "invoke"):
                result = self.qa_chain.invoke({"question": contextual_query})
            elif callable(self.qa_chain):
                result = self.qa_chain({"question": contextual_query})
            elif hasattr(self.qa_chain, "run"):
                out = self.qa_chain.run(contextual_query)
                result = {"answer": out, "source_documents": []}
            else:
                return {"answer": "Unable to call QA chain.", "sources": []}
        except Exception as e:
            logger.error("Error invoking QA chain: %s", e, exc_info=True)
            return {"answer": "I apologize, the QA chain failed. Please try again.", "sources": []}

        answer = result.get("answer") if isinstance(result, dict) else str(result)
        
        # (FIX) Use the new output scrubber as a final safety net
        answer = self._scrub_output(answer)
        
        sources = []
        for doc in result.get("source_documents", []):
            try:
                sources.append({"content": getattr(doc, "page_content", str(doc)), "metadata": getattr(doc, "metadata", {})})
            except Exception:
                sources.append({"content": str(doc), "metadata": {}})
        return {"answer": answer, "sources": sources}

    # ----------------- main flow -----------------
    def process_query(self, query: str) -> Dict[str, Any]:
        if not query or not query.strip():
            return {"answer": "Please ask a question about placements or companies.", "sources": []}
        q = query.strip()
        q_lower = q.lower()
        
        # --- (FIX) Expanded Intent Matching ---
        year_match = re.search(r"\b(20\d{2})\b", q, re.I)
        has_avg = re.search(r"average package", q_lower)
        has_count = re.search(r"(how many|total|number of|count of) students placed", q_lower)
        has_highest = re.search(r"(highest|top)\s+package", q_lower)
        has_top_companies = re.search(r"top companies", q_lower)

        # --- (FIX) Updated Router Logic ---

        # 1. Combined Count and Average Query (Catches your exact query)
        if year_match and has_count and has_avg:
            year = int(year_match.group(1))
            count = self.get_placement_count_by_year(year)
            avg = self.get_average_package_by_year(year)
            if count is not None and avg is not None:
                answer = f"Based on the data for {year}:\n- Total Students Placed: {count}\n- Average Package: {avg} LPA"
                return {"answer": answer, "sources": []}
        
        # 2. Count Only Query
        if year_match and has_count:
            year = int(year_match.group(1))
            count = self.get_placement_count_by_year(year)
            if count is not None:
                answer = f"In {year}, a total of {count} students were placed."
                return {"answer": answer, "sources": []}

        # 3. Average Only Query
        if year_match and has_avg:
            year = int(year_match.group(1))
            avg = self.get_average_package_by_year(year)
            if avg is not None:
                answer = f"The average package offered in {year} was {avg} LPA."
                return {"answer": answer, "sources": []}

        # 4. Highest Package Query
        if year_match and has_highest:
            year = int(year_match.group(1))
            structured = self.get_highest_package_by_year(year)
            if structured:
                answer = f"The highest package in {year} was {structured['package_lpa']} LPA at {structured['company']}. I cannot disclose student names or IDs due to privacy."
                return {"answer": answer, "sources": []}
            else:
                logger.warning("Structured handler for 'highest package' matched but returned no data for year %d. Falling back to RAG.", year)
                # Fallthrough to RAG
        
        # 5. Top Companies Query
        if has_top_companies:
            m2 = re.search(r"top companies(?: of| in)?\s*(.*)", q, re.I) # re-run to get location
            loc = m2.group(1).strip() if m2 and m2.group(1) else None
            top = self.get_top_companies(limit=5, location=loc if loc else None)
            if top:
                answer = "Top companies by highest package:\n" + "\n".join([f"{i+1}. {c['company']} — {c['package_lpa']} LPA" for i, c in enumerate(top)])
                return {"answer": answer, "sources": []}
            # Fallthrough to RAG if no companies found

        # 6. Skills for Company Query
        m3 = re.search(r"skills (?:for|needed for|required for) (.+)", q, re.I)
        if m3:
            company = m3.group(1).strip().rstrip("?")
            contextual = f"Find required skills in job descriptions for company {company}. STRICTLY DO NOT RETURN NAMES OR STUDENT IDS. User question: {query}"
            return self._call_qa_chain_safe(contextual)

        # 7. Fallback to RAG
        logger.info("No structured handler matched. Falling back to RAG.")
        return self._call_qa_chain_safe(query)

    def process_query_stream(self, query: str) -> Generator[str, None, None]:
        try:
            lowered = (query or "").strip().lower()
            
            # (FIX) 1. Energetic, emoji-filled greeting
            if lowered in {"hi", "hii", "hiii", "hello", "hey", "yo", "hola", "namaste"} or lowered.startswith(("hi ", "hello ", "hey ")):
                yield "Hello there! 👋 I'm ready to help with your placement questions! 🚀 What's on your mind? 📊"
                return

            # --- (FIX) 2. Check for all structured queries to prevent streaming ---
            q_lower = query.lower()
            year_match = re.search(r"\b(20\d{2})\b", query, re.I)
            has_avg = re.search(r"average package", q_lower)
            has_count = re.search(r"(how many|total|number of|count of) students placed", q_lower)
            has_highest = re.search(r"(highest|top)\s+package", q_lower)
            has_top_companies = re.search(r"top companies", q_lower)

            # Check for any query that should be handled by process_query's structured logic
            if (year_match and (has_avg or has_count or has_highest)) or has_top_companies:
                out = self.process_query(query)
                yield out.get("answer", "")
                return

            # 3. Fallback to streaming RAG (e.g., for "skills" query)
            result = self.process_query(query) # process_query will route to _call_qa_chain_safe
            answer = result.get("answer", "I apologize, but I encountered an error.")
            
            words = answer.split()
            current_chunk = ""
            for word in words:
                current_chunk += word + " "
                if len(current_chunk) > 30:
                    yield current_chunk.strip()
                    current_chunk = ""

            if current_chunk.strip():
                yield current_chunk.strip()

        except Exception as e:
            logger.error("Error in streaming query: %s", e, exc_info=True)
            yield "I apologize, but I encountered an error. Please try again."


    def reload_knowledge_base(self):
        """Reloads the knowledge base by re-processing all documents in the data folder."""
        try:
            logger.info("Reloading knowledge base...")
            
            # Re-process documents
            documents = self._load_and_process_documents()
            
            if not documents:
                logger.warning("No documents found during reload.")
                return {"status": "warning", "message": "No documents found to index."}

            # Try to clear existing collection if possible
            if self.vector_store:
                try:
                    if hasattr(self.vector_store, "delete_collection"):
                        self.vector_store.delete_collection()
                    elif hasattr(self.vector_store, "_collection"):
                         self.vector_store._collection.delete()
                    logger.info("Deleted existing collection data.")
                except Exception as e:
                    logger.warning(f"Could not delete collection data: {e}")
            
            # Re-create / Update
            try:
                self.vector_store = Chroma.from_documents(documents=documents, embedding=self.embeddings, persist_directory=self.vector_db_path)
            except Exception:
                 self.vector_store = Chroma.from_documents(documents=documents, embedding_function=self.embeddings, persist_directory=self.vector_db_path)
            
            # Re-setup chain
            self._setup_conversational_chain()
            
            logger.info("Knowledge base reloaded successfully.")
            return {"status": "success", "message": f"Reloaded with {len(documents)} documents."}
            
        except Exception as e:
            logger.error(f"Error reloading knowledge base: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}


# Global instance
try:
    rag_service = PlacementorRAGService()
    logger.info("Global rag_service instance created.")
except Exception as e:
    logger.critical("Failed to initialize RAGService on startup: %s", e, exc_info=True)
    rag_service = None