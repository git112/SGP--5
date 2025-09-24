#!/usr/bin/env python3
"""
Production-Ready RAG Service for Placementor AI
Handles data ingestion, PII anonymization, vectorization, and querying with ChromaDB and Gemini via LangChain.
"""

import os
import re
import logging
from typing import List, Dict, Any, Optional, Generator
from pathlib import Path
import pandas as pd
from langchain_community.document_loaders import (
    PyPDFLoader,
    UnstructuredWordDocumentLoader
)
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain.schema import Document
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain_community.embeddings import SentenceTransformerEmbeddings
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
except ImportError:
    ChatGoogleGenerativeAI = None
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PlacementorRAGService:
    """
    Production-ready RAG service for Placementor AI with strict PII anonymization.
    """
    
    def __init__(self, data_folder: str = "./data", vector_db_path: str = "./vector_db"):
        """
        Initialize the RAG service.
        
        Args:
            data_folder: Path to the data directory containing files
            vector_db_path: Path to persist the ChromaDB vector store
        """
        self.data_folder = data_folder
        self.vector_db_path = vector_db_path
        self.documents = []
        self.vector_store = None
        self.retrieval_qa = None
        
        # Initialize embeddings and LLM
        self._initialize_models()
        
        # PII anonymization patterns
        self.pii_patterns = {
            'student_name': re.compile(r'\b[A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b'),
            'student_id': re.compile(r'\b(?:21BCP|22BCP|23BCP|24BCP|25BCP)[A-Z0-9]+\b|\b\d{7,}\b'),
            'email': re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
            'phone': re.compile(r'\b(?:\+91|91)?[6-9]\d{9}\b'),
            'roll_number': re.compile(r'\b\d{2}[A-Z]{2,4}\d{3,4}\b')
        }
        
        # Initialize the RAG system
        self._initialize_rag()
    
    def _initialize_models(self):
        """Initialize local embeddings and Gemini LLM via LangChain."""
        try:
            # Embeddings (local)
            self.embeddings = SentenceTransformerEmbeddings(model_name='all-MiniLM-L6-v2')
            logger.info("SentenceTransformerEmbeddings initialized: all-MiniLM-L6-v2")

            # LLM (Gemini via LangChain)
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                logger.warning("GROQ_API_KEY not found. LLM responses will be disabled.")
                self.llm = None
            elif ChatGoogleGenerativeAI is None:
                logger.warning("langchain_google_genai not installed. LLM responses will be disabled.")
                self.llm = None
            else:
                self.llm = ChatGroq(model='llama-3.3-70b-versatile', groq_api_key=api_key, temperature=0.2)
                logger.info("ChatGroq initialized: llama-3.3-70b-versatile")

        except Exception as e:
            logger.error(f"Error initializing models: {e}")
            raise
    
    def _embedding_function(self, texts):
        """Custom embedding function for ChromaDB."""
        try:
            if isinstance(texts, str):
                texts = [texts]
            embeddings = self.embedding_model.encode(texts)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Error creating embeddings: {e}")
            raise
    
    def _create_embedding_function(self):
        """Return LangChain embeddings for Chroma."""
        return self.embeddings
    
    def _initialize_rag(self):
        """Initialize the RAG system by loading or creating the vector database."""
        try:
            logger.info("Initializing Placementor RAG system...")
            
            # Check if vector database exists
            if os.path.exists(self.vector_db_path):
                logger.info("Loading existing vector database...")
                self._load_existing_vector_db()
            else:
                logger.info("Creating new vector database...")
                self._create_new_vector_db()
            
            # Initialize retrieval components
            self._setup_retrieval()
            
            logger.info("RAG system initialized successfully!")
            
        except Exception as e:
            logger.error(f"Error initializing RAG system: {e}")
            raise
    
    def _load_existing_vector_db(self):
        """Load existing ChromaDB vector store."""
        try:
            self.vector_store = Chroma(
                persist_directory=self.vector_db_path,
                embedding_function=self._create_embedding_function()
            )
            logger.info("Successfully loaded existing vector database")
        except Exception as e:
            logger.error(f"Error loading existing vector database: {e}")
            # Fallback to creating new database
            self._create_new_vector_db()
    
    def _create_new_vector_db(self):
        """Create new vector database from data files."""
        try:
            # Load and process documents
            self.documents = self._load_and_process_documents()
            
            if not self.documents:
                logger.warning("No documents loaded, creating fallback document")
                self.documents = [Document(
                    page_content="This is a placement assistance chatbot for students. No placement data is currently available.",
                    metadata={"source": "fallback", "type": "system"}
                )]
            
            # Create vector store
            self.vector_store = Chroma.from_documents(
                documents=self.documents,
                embedding=self._create_embedding_function(),
                persist_directory=self.vector_db_path
            )
            
            logger.info(f"Created vector database with {len(self.documents)} documents")
            
        except Exception as e:
            logger.error(f"Error creating new vector database: {e}")
            raise
    
    def _load_and_process_documents(self) -> List[Document]:
        """Load documents from data folder and process them."""
        documents = []
        data_path = Path(self.data_folder)
        
        if not data_path.exists():
            logger.warning(f"Data folder {self.data_folder} does not exist")
            return documents
        
        # Process Excel files
        excel_files = list(data_path.glob("**/*.xlsx"))
        logger.info(f"Found {len(excel_files)} Excel files")
        
        for file_path in excel_files:
            try:
                excel_docs = self._process_excel_file(file_path)
                documents.extend(excel_docs)
            except Exception as e:
                logger.error(f"Error processing Excel file {file_path}: {e}")
                continue
        
        # Process PDF files
        pdf_files = list(data_path.glob("**/*.pdf"))
        logger.info(f"Found {len(pdf_files)} PDF files")
        
        for file_path in pdf_files:
            try:
                pdf_docs = self._process_pdf_file(file_path)
                documents.extend(pdf_docs)
            except Exception as e:
                logger.error(f"Error processing PDF file {file_path}: {e}")
                continue
        
        # Process DOCX files
        docx_files = list(data_path.glob("**/*.docx"))
        logger.info(f"Found {len(docx_files)} DOCX files")
        
        for file_path in docx_files:
            try:
                docx_docs = self._process_docx_file(file_path)
                documents.extend(docx_docs)
            except Exception as e:
                logger.error(f"Error processing DOCX file {file_path}: {e}")
                continue
        
        logger.info(f"Total documents processed: {len(documents)}")
        return documents
    
    def _process_excel_file(self, file_path: Path) -> List[Document]:
        """Process Excel file and create documents from rows."""
        documents = []
        
        try:
            # Read all sheets from Excel file
            excel_data = pd.read_excel(file_path, sheet_name=None)
            
            for sheet_name, df in excel_data.items():
                if df.empty:
                    continue
                
                # Process each row as a separate document
                for idx, row in df.iterrows():
                    # Convert row to readable text
                    row_text = self._row_to_text(row, file_path.name, sheet_name)
                    
                    # Anonymize PII
                    anonymized_text = self._anonymize_pii(row_text)
                    
                    if anonymized_text.strip():
                        doc = Document(
                            page_content=anonymized_text,
                            metadata={
                                "source": str(file_path),
                                "sheet": sheet_name,
                                "file_name": file_path.name,
                                "row_index": idx,
                                "type": "excel_row"
                            }
                        )
                        documents.append(doc)
                        
        except Exception as e:
            logger.error(f"Error processing Excel file {file_path}: {e}")
        
        return documents
    
    def _row_to_text(self, row: pd.Series, file_name: str, sheet_name: str) -> str:
        """Convert DataFrame row to readable text format."""
        text_parts = [f"Data from {file_name}, Sheet: {sheet_name}"]
        
        # Add row data
        row_data = []
        for col, value in row.items():
            if pd.notna(value) and str(value).strip():
                row_data.append(f"{col}: {value}")
        
        if row_data:
            text_parts.append(" | ".join(row_data))
        
        return "\n".join(text_parts)
    
    def _process_pdf_file(self, file_path: Path) -> List[Document]:
        """Process PDF file and create text chunks."""
        documents = []
        
        try:
            # Load PDF content
            loader = PyPDFLoader(str(file_path))
            pages = loader.load()
            
            # Split text into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=800,
                chunk_overlap=150,
                length_function=len
            )
            
            chunks = text_splitter.split_documents(pages)
            
            for chunk in chunks:
                # Anonymize PII
                anonymized_content = self._anonymize_pii(chunk.page_content)
                
                doc = Document(
                    page_content=anonymized_content,
                    metadata={
                        **chunk.metadata,
                        "source": str(file_path),
                        "file_name": file_path.name,
                        "type": "pdf_chunk"
                    }
                )
                documents.append(doc)
            
        except Exception as e:
            logger.error(f"Error processing PDF file {file_path}: {e}")
        
        return documents
    
    def _process_docx_file(self, file_path: Path) -> List[Document]:
        """Process DOCX file and create text chunks."""
        documents = []
        
        try:
            # Load DOCX content
            loader = UnstructuredWordDocumentLoader(str(file_path))
            pages = loader.load()
            
            # Split text into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=800,
                chunk_overlap=150,
                length_function=len
            )
            
            chunks = text_splitter.split_documents(pages)
            
            for chunk in chunks:
                # Anonymize PII
                anonymized_content = self._anonymize_pii(chunk.page_content)
                
                doc = Document(
                    page_content=anonymized_content,
                    metadata={
                        **chunk.metadata,
                        "source": str(file_path),
                        "file_name": file_path.name,
                        "type": "docx_chunk"
                    }
                )
                documents.append(doc)
            
        except Exception as e:
            logger.error(f"Error processing DOCX file {file_path}: {e}")
        
        return documents
    
    def _anonymize_pii(self, text: str) -> str:
        """
        Anonymize PII in text using regex patterns.
        
        Args:
            text: Input text to anonymize
            
        Returns:
            Anonymized text with PII replaced by placeholders
        """
        anonymized_text = text
        
        # Replace student names
        anonymized_text = self.pii_patterns['student_name'].sub('[STUDENT_NAME]', anonymized_text)
        
        # Replace student IDs
        anonymized_text = self.pii_patterns['student_id'].sub('[STUDENT_ID]', anonymized_text)
        
        # Replace email addresses
        anonymized_text = self.pii_patterns['email'].sub('[EMAIL]', anonymized_text)
        
        # Replace phone numbers
        anonymized_text = self.pii_patterns['phone'].sub('[PHONE]', anonymized_text)
        
        # Replace roll numbers
        anonymized_text = self.pii_patterns['roll_number'].sub('[ROLL_NUMBER]', anonymized_text)
        
        return anonymized_text
    
    def _setup_retrieval(self):
        """Setup retrieval components for RAG (k=5) and build RetrievalQA when LLM is available."""
        try:
            self.retriever = self.vector_store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 5}
            )
            logger.info("Retriever ready (k=5)")

            # Build RetrievalQA chain if LLM is configured
            if self.llm:
                template = (
                    """
        You are 'Placementor AI', a friendly and helpful placement assistant.

        Your Primary Goal: Answer questions based ONLY on the provided context from placement data. Summarize data and never reveal personal information. If you cannot find an answer in the context, say so politely: "I'm sorry, I cannot find that information in the provided placement data."

        For Greetings & Small Talk: If the user's message is a greeting (e.g., "hi", "hello") or unrelated to placements, reply briefly and friendly, for example: "Hello! How can I help you with your placement questions today?" Do not fabricate data.

        Rules:
        - Do not guess or reconstruct any personal data, even if placeholders like [STUDENT_NAME] appear.
        - Prefer aggregated, factual statements from the context (e.g., "The highest package recorded was 45 LPA.").
        - If the answer is not present in the context, use the exact fallback sentence above.
        - Keep answers concise.

        **Context:**
        {context}

        **Question:**
        {question}

        **Answer:**
                    """
                ).strip()
                # 1. Initialize the memory buffer
                self.memory = ConversationBufferMemory(
                    memory_key="chat_history",
                    return_messages=True,
                    output_key='answer' # Important for parsing the output correctly
                )

                # 2. Create the ConversationalRetrievalChain
                self.qa_chain = ConversationalRetrievalChain.from_llm(
                    llm=self.llm,
                    retriever=self.retriever,
                    memory=self.memory,
                    return_source_documents=True, # Ensure sources are returned
                    combine_docs_chain_kwargs={"prompt": PromptTemplate.from_template(template)}
                )
            else:
                self.qa_chain = None
        except Exception as e:
            logger.error(f"Error setting up retrieval: {e}")
            raise
    
    def _generate_answer_with_gemini(self, query: str, context: str) -> str:
        """Generate answer using Gemini with the specified system prompt."""
        try:
            system_prompt = (
                """
        You are 'Placementor AI', a friendly and helpful placement assistant.

        Your Primary Goal: Answer questions based ONLY on the provided context from placement data. Summarize data and never reveal personal information. If you cannot find an answer in the context, say so politely: "I'm sorry, I cannot find that information in the provided placement data."

        For Greetings & Small Talk: If the user's message is a greeting (e.g., "hi", "hello") or unrelated to placements, reply briefly and friendly, for example: "Hello! How can I help you with your placement questions today?" Do not fabricate data.

        Rules:
        - Do not guess or reconstruct any personal data, even if placeholders like [STUDENT_NAME] appear.
        - Prefer aggregated, factual statements from the context (e.g., "The highest package recorded was 45 LPA.").
        - If the answer is not present in the context, use the exact fallback sentence above.
        - Keep answers concise.

        **Context:**
        {context}

        **Question:**
        {question}

        **Answer:**
        """
            ).strip()

            prompt = system_prompt.format(context=context, question=query)

            if not self.llm:
                return "I'm sorry, I cannot find that information in the provided placement data."

            result = self.llm.invoke(prompt)
            return (result.content if hasattr(result, 'content') else str(result)).strip()

        except Exception as e:
            logger.error(f"Error generating answer with Gemini: {e}")
            return "I'm sorry, I cannot find that information in the provided placement data."
    
    def process_query(self, query: str) -> Dict[str, Any]:
        """
        Process a user query and return the answer with sources.
        
        Args:
            query: User's question
            
        Returns:
            Dictionary containing answer and sources
        """
        try:
            if not self.retriever:
                raise ValueError("RAG system not properly initialized")
            
            # Simple greeting/small-talk handling
            lowered = (query or "").strip().lower()
            if lowered in {"hi", "hii", "hiii", "hello", "hey", "yo", "hola", "namaste"} or lowered.startswith("hi ") or lowered.startswith("hello ") or lowered.startswith("hey "):
                return {
                    "answer": "Hello! How can I help you with your placement questions today?",
                    "sources": []
                }

            # Retrieve relevant documents
            source_docs = self.retriever.get_relevant_documents(query)
            
            # Format sources
            sources = []
            context_parts = []
            
            for doc in source_docs:
                source_info = {
                    "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                    "metadata": doc.metadata
                }
                sources.append(source_info)
                context_parts.append(doc.page_content)
            
            # Combine context
            context = "\n\n".join(context_parts)

            # Generate answer preferentially via ConversationalRetrievalChain with memory
            if self.qa_chain:
                # The new chain expects "question" as the input key
                qa_result = self.qa_chain.invoke({"question": query})
                # The answer is now in the "answer" key
                answer = qa_result.get("answer", "I could not generate a response.")
                # The sources are in the "source_documents" key
                retrieved_sources = qa_result.get("source_documents", [])
                # Re-format sources to match expected output
                sources = []
                for doc in retrieved_sources:
                    source_info = {
                        "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                        "metadata": doc.metadata
                    }
                    sources.append(source_info)
            elif self.llm:
                answer = self._generate_answer_with_gemini(query, context)
            else:
                answer = "I'm sorry, I cannot find that information in the provided placement data."
            
            return {
                "answer": answer,
                "sources": sources
            }
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return {
                "answer": "I apologize, but I encountered an error while processing your request. Please try again.",
                "sources": []
            }
    
    def process_query_stream(self, query: str) -> Generator[str, None, None]:
        """
        Process a user query and yield streaming response.
        
        Args:
            query: User's question
            
        Yields:
            Chunks of the response
        """
        try:
            if not self.retriever:
                raise ValueError("RAG system not properly initialized")
            
            # Retrieve relevant documents
            source_docs = self.retriever.get_relevant_documents(query)
            
            # Combine context
            context_parts = [doc.page_content for doc in source_docs]
            context = "\n\n".join(context_parts)
            
            # Generate answer using Gemini
            if self.llm:
                answer = self._generate_answer_with_gemini(query, context)
            else:
                answer = "I'm sorry, I cannot find that information in the provided placement data."
            
            # Stream the answer in chunks
            words = answer.split()
            current_chunk = ""
            
            for word in words:
                current_chunk += word + " "
                if len(current_chunk) > 50:  # Yield chunks of ~50 characters
                    yield current_chunk.strip()
                    current_chunk = ""
            
            # Yield remaining content
            if current_chunk.strip():
                yield current_chunk.strip()
                
        except Exception as e:
            logger.error(f"Error in streaming query: {e}")
            yield "I apologize, but I encountered an error while processing your request. Please try again."

# Global instance for the application
rag_service = PlacementorRAGService()


