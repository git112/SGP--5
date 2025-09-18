#!/usr/bin/env python3
"""
Gemini RAG Service for Placement Chatbot
Implements RAG + LLM workflow with Gemini 1.5 Flash and FAISS vector store.
"""

import os
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Generator
import logging
from pathlib import Path
import google.generativeai as genai
import faiss
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiRAGService:
    def __init__(self, data_folder: str = "data"):
        """Initialize the Gemini RAG service."""
        self.data_folder = data_folder
        self.documents = []
        self.embeddings = []
        self.vector_store = None
        self.embedding_model = None
        self.llm_model = None
        
        # Initialize models
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize embedding model and Gemini LLM."""
        try:
            # Initialize embedding model
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Embedding model initialized")
            
            # Initialize Gemini 1.5 Flash
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key or api_key == "your_gemini_api_key_here":
                logger.warning("GEMINI_API_KEY not found. Please set it in your .env file or environment variables.")
                logger.warning("The service will work but LLM responses will be disabled.")
                self.llm_model = None
            else:
                genai.configure(api_key=api_key)
                self.llm_model = genai.GenerativeModel('gemini-1.5-flash')
                logger.info("Gemini 1.5 Flash model initialized")
            
        except Exception as e:
            logger.error(f"Error initializing models: {e}")
            raise
    
    def initialize_rag(self):
        """Phase 1: One-time indexing on startup."""
        try:
            logger.info("Starting Phase 1: One-time indexing...")
            
            # Step 1: Load & Chunk data from Excel files
            self.documents = self._load_and_chunk_excel_files()
            
            if not self.documents:
                logger.warning("No documents loaded, using fallback")
                self.documents = [{
                    "text": "No data available. This is a placement assistance chatbot for students.",
                    "metadata": {"source": "fallback", "chunk_id": 0}
                }]
            
            # Step 2: Embed documents
            self._create_embeddings()
            
            # Step 3: Store in FAISS vector store
            self._build_faiss_index()
            
            logger.info(f"Phase 1 completed: {len(self.documents)} documents indexed")
            
        except Exception as e:
            logger.error(f"Error in Phase 1 initialization: {e}")
            raise
    
    def _load_and_chunk_excel_files(self) -> List[Dict[str, Any]]:
        """Load Excel files and create text chunks."""
        documents = []
        data_path = Path(__file__).parent.parent / self.data_folder
        
        if not data_path.exists():
            logger.warning(f"Data folder {self.data_folder} does not exist")
            return documents
        
        excel_files = list(data_path.glob("*.xlsx"))
        logger.info(f"Found {len(excel_files)} Excel files")
        
        chunk_id = 0
        
        for file_path in excel_files:
            try:
                logger.info(f"Processing {file_path.name}")
                
                # Read all sheets from Excel file
                excel_data = pd.read_excel(file_path, sheet_name=None)
                
                for sheet_name, df in excel_data.items():
                    if df.empty:
                        continue
                    
                    # Create chunks from DataFrame rows
                    chunks = self._create_chunks_from_dataframe(df, file_path.name, sheet_name)
                    
                    for chunk in chunks:
                        chunk["metadata"]["chunk_id"] = chunk_id
                        documents.append(chunk)
                        chunk_id += 1
                        
            except Exception as e:
                logger.error(f"Error processing {file_path}: {e}")
                continue
        
        logger.info(f"Created {len(documents)} document chunks")
        return documents
    
    def _create_chunks_from_dataframe(self, df: pd.DataFrame, file_name: str, sheet_name: str) -> List[Dict[str, Any]]:
        """Create text chunks from DataFrame rows."""
        chunks = []
        
        # Create chunks of 5-10 rows each for better context
        chunk_size = 8
        for i in range(0, len(df), chunk_size):
            chunk_df = df.iloc[i:i+chunk_size]
            
            # Convert chunk to readable text
            text_parts = [f"Placement data from {file_name}, Sheet: {sheet_name}"]
            
            # Add column headers
            if not chunk_df.columns.empty:
                text_parts.append(f"Columns: {', '.join(chunk_df.columns.astype(str))}")
            
            # Add row data
            for idx, row in chunk_df.iterrows():
                row_text = []
                for col, value in row.items():
                    if pd.notna(value):
                        row_text.append(f"{col}: {value}")
                if row_text:
                    text_parts.append(f"Row {idx + 1}: {' | '.join(row_text)}")
            
            chunk_text = "\n".join(text_parts)
            
            chunks.append({
                "text": chunk_text,
                "metadata": {
                    "source": file_name,
                    "sheet": sheet_name,
                    "file_name": file_name,
                    "start_row": i,
                    "end_row": min(i + chunk_size - 1, len(df) - 1),
                    "chunk_size": len(chunk_df)
                }
            })
        
        return chunks
    
    def _create_embeddings(self):
        """Create embeddings for all document chunks."""
        try:
            texts = [doc["text"] for doc in self.documents]
            self.embeddings = self.embedding_model.encode(texts)
            logger.info(f"Created embeddings for {len(texts)} documents")
        except Exception as e:
            logger.error(f"Error creating embeddings: {e}")
            raise
    
    def _build_faiss_index(self):
        """Build FAISS vector store index."""
        try:
            if len(self.embeddings) == 0:
                raise ValueError("No embeddings available")
            
            # Get embedding dimension
            dimension = self.embeddings.shape[1]
            
            # Create FAISS index (using L2 distance)
            self.vector_store = faiss.IndexFlatL2(dimension)
            
            # Add embeddings to index
            self.vector_store.add(self.embeddings.astype('float32'))
            
            logger.info(f"FAISS index built with {self.vector_store.ntotal} vectors")
            
        except Exception as e:
            logger.error(f"Error building FAISS index: {e}")
            raise
    
    def process_query(self, query: str) -> str:
        """Phase 2: Real-time query processing."""
        try:
            # Step 1: Embed query
            query_embedding = self.embedding_model.encode([query])
            
            # Step 2: Retrieve relevant chunks
            context_chunks = self._retrieve_context(query_embedding, top_k=5)
            
            # Step 3: Augment & Generate with Gemini
            response = self._generate_response_with_gemini(query, context_chunks)
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return "I apologize, but I encountered an error while processing your request. Please try again."
    
    def _retrieve_context(self, query_embedding: np.ndarray, top_k: int = 5) -> List[Dict[str, Any]]:
        """Retrieve top-k most relevant document chunks."""
        try:
            if self.vector_store is None:
                logger.warning("Vector store not initialized")
                return []
            
            # Search FAISS index
            distances, indices = self.vector_store.search(query_embedding.astype('float32'), top_k)
            
            # Get relevant documents
            context_chunks = []
            for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
                if idx < len(self.documents):
                    doc = self.documents[idx]
                    context_chunks.append({
                        "text": doc["text"],
                        "metadata": doc["metadata"],
                        "similarity_score": 1 / (1 + distance)  # Convert distance to similarity
                    })
            
            logger.info(f"Retrieved {len(context_chunks)} context chunks")
            return context_chunks
            
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return []
    
    def _generate_response_with_gemini(self, query: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Generate response using Gemini 1.5 Flash with retrieved context."""
        try:
            # Check if Gemini is available
            if self.llm_model is None:
                return self._generate_fallback_response(query, context_chunks)
            
            # Extract actual data from context chunks
            actual_data = self._extract_actual_data(context_chunks, query)
            
            # Create prompt for Gemini
            prompt = f"""You are a friendly and helpful placement assistant. Answer the user's question using ONLY the actual data provided below.

ACTUAL DATA FROM EXCEL SHEETS:
{actual_data}

User Question: {query}

IMPORTANT RULES:
- Use ONLY the data provided above - do not make up or guess any numbers
- If the data doesn't have the exact answer, say "Based on the available data..." 
- Be short, polite, clear and friendly
- Provide specific numbers only if they exist in the data
- If asking about highest package and data shows "8 LPA", say exactly "8 LPA"
- Keep responses concise (2-3 sentences max)

Answer:"""
            
            # Generate response with Gemini
            response = self.llm_model.generate_content(prompt)
            
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating response with Gemini: {e}")
            return self._generate_fallback_response(query, context_chunks)
    
    def _generate_fallback_response(self, query: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Generate fallback response when Gemini is not available."""
        if not context_chunks:
            return "I don't have enough information to answer your question. Please try rephrasing or ask about a different topic."
        
        # Simple template-based response
        context_text = "\n\n".join([
            f"• {chunk['text'][:200]}..." 
            for chunk in context_chunks[:3]
        ])
        
        return f"Based on the placement data, here's what I found:\n\n{context_text}\n\nNote: For more detailed responses, please configure the GEMINI_API_KEY in your environment variables."
    
    def _extract_actual_data(self, context_chunks: List[Dict[str, Any]], query: str) -> str:
        """Extract actual data from context chunks based on the query."""
        query_lower = query.lower()
        
        # Extract relevant data based on query type
        if any(word in query_lower for word in ['highest', 'maximum', 'top', 'best', 'package', 'salary', 'lpa']):
            return self._extract_package_data(context_chunks)
        elif any(word in query_lower for word in ['company', 'companies']):
            return self._extract_company_data(context_chunks)
        elif any(word in query_lower for word in ['2022', '2023', '2024', '2025', 'year']):
            return self._extract_year_data(context_chunks, query_lower)
        else:
            # General data extraction
            return self._extract_general_data(context_chunks)
    
    def _extract_package_data(self, context_chunks: List[Dict[str, Any]]) -> str:
        """Extract package/salary data from chunks."""
        package_data = []
        max_package = 0
        max_company = ""
        
        for chunk in context_chunks:
            lines = chunk['text'].split('\n')
            for line in lines:
                if 'package' in line.lower() or 'lpa' in line.lower():
                    # Extract package values
                    import re
                    # Look for numeric values that could be packages
                    numbers = re.findall(r'\b(\d+(?:\.\d+)?)\b', line)
                    for num_str in numbers:
                        try:
                            num = float(num_str)
                            if 1 <= num <= 100:  # Reasonable package range
                                package_data.append(f"Package: {num} LPA")
                                if num > max_package:
                                    max_package = num
                                    max_company = line
                        except:
                            continue
        
        if max_package > 0:
            return f"Highest package found: {max_package} LPA\nAll packages: {', '.join(package_data[:10])}"
        else:
            return "No package data found in the available records."
    
    def _extract_company_data(self, context_chunks: List[Dict[str, Any]]) -> str:
        """Extract company data from chunks."""
        companies = []
        
        for chunk in context_chunks:
            lines = chunk['text'].split('\n')
            for line in lines:
                if 'company' in line.lower() or 'infostretch' in line.lower() or 'edelta' in line.lower():
                    companies.append(line)
        
        if companies:
            return f"Companies found: {' | '.join(companies[:5])}"
        else:
            return "No company data found in the available records."
    
    def _extract_year_data(self, context_chunks: List[Dict[str, Any]], query: str) -> str:
        """Extract year-specific data from chunks."""
        year_data = []
        target_year = None
        
        # Find year in query
        import re
        year_match = re.search(r'(20\d{2})', query)
        if year_match:
            target_year = year_match.group(1)
        
        for chunk in context_chunks:
            if target_year and target_year in chunk['text']:
                year_data.append(chunk['text'])
            elif not target_year:
                year_data.append(chunk['text'])
        
        if year_data:
            return f"Data for {target_year if target_year else 'requested year'}: {' | '.join(year_data[:3])}"
        else:
            return f"No data found for {target_year if target_year else 'the requested year'}."
    
    def _extract_general_data(self, context_chunks: List[Dict[str, Any]]) -> str:
        """Extract general data from chunks."""
        general_data = []
        
        for chunk in context_chunks[:3]:  # Limit to top 3 chunks
            # Extract key information lines
            lines = chunk['text'].split('\n')
            for line in lines:
                if any(keyword in line.lower() for keyword in ['package', 'company', 'placed', 'cgpa', 'role']):
                    general_data.append(line)
        
        if general_data:
            return f"Available data: {' | '.join(general_data[:5])}"
        else:
            return "Limited data available in the current records."
    
    def process_query_stream(self, query: str) -> Generator[str, None, None]:
        """Process query and stream response token by token."""
        try:
            # Get full response first
            response = self.process_query(query)
            
            # Stream response word by word
            words = response.split()
            for i, word in enumerate(words):
                if i == 0:
                    yield word
                else:
                    yield f" {word}"
                # Small delay for streaming effect
                import time
                time.sleep(0.03)
                
        except Exception as e:
            logger.error(f"Error in streaming: {e}")
            yield "I'm sorry, I encountered an error processing your question. Please try again."

# Global instance
gemini_rag_service = GeminiRAGService()
