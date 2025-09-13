#!/usr/bin/env python3
"""
Simple RAG Service for Placement Chatbot
Works with Google Drive files and uses in-memory storage.
"""

import os
import logging
from typing import List, Dict, Any, Optional
import pandas as pd
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import numpy as np
from drive_service import GoogleDriveService

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleRAGService:
    def __init__(self, drive_folder_id: str = None):
        """Initialize the simple RAG service."""
        self.drive_service = GoogleDriveService()
        self.drive_folder_id = drive_folder_id
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # In-memory storage
        self.documents = []
        self.embeddings = []
        
        # No local LLM client; generation falls back to templates
        self.llm_client = None
        
        # Load data from Google Drive
        self._load_drive_data()
    
    def _initialize_llm(self):
        """Deprecated: LLM initialization removed (no Ollama)."""
        return None
    
    def _load_drive_data(self):
        """Load data from Google Drive and create embeddings."""
        try:
            # List files from Google Drive
            files = self.drive_service.list_files(self.drive_folder_id)
            if not files:
                logger.warning("No CSV files found in Google Drive")
                return
            
            all_documents = []
            
            for file in files:
                logger.info(f"Processing file: {file['name']}")
                
                # Get file data based on MIME type
                df = self.drive_service.get_file_data(file['id'], file['mimeType'])
                if df is None:
                    continue
                
                # Generate text summaries
                documents = self._generate_summaries(df, file['name'])
                all_documents.extend(documents)
            
            if not all_documents:
                logger.warning("No documents generated from Drive files")
                return
            
            # Store documents and create embeddings
            self.documents = all_documents
            self._create_embeddings(all_documents)
            
            logger.info(f"Successfully loaded {len(all_documents)} documents from Google Drive")
            
        except Exception as e:
            logger.error(f"Error loading Drive data: {e}")
            raise
    
    def _generate_summaries(self, df: pd.DataFrame, filename: str) -> List[Dict[str, Any]]:
        """Generate text summaries for DataFrame rows."""
        documents = []
        
        for index, row in df.iterrows():
            # Generate unique ID
            doc_id = f"{filename}_{index}"
            
            # Generate natural language summary based on file type
            if "placement" in filename.lower():
                text = self._summarize_placement(row)
            elif "company" in filename.lower():
                text = self._summarize_company(row)
            elif "interview" in filename.lower():
                text = self._summarize_interview(row)
            else:
                text = self._generic_summary(row)
            
            documents.append({
                "id": doc_id,
                "text": text,
                "metadata": {
                    "source_file": filename,
                    "row_index": index,
                    "file_type": "csv"
                }
            })
        
        return documents
    
    def _summarize_placement(self, row: pd.Series) -> str:
        """Generate summary for placement data."""
        placed_status = "was placed" if row.get('Placed', True) else "was not placed"
        package_info = f"with a package of {row.get('PackageLPA', 'N/A')} LPA" if row.get('Placed', True) else ""
        
        return f"A student with CGPA {row.get('CGPA', 'N/A')} {placed_status} at {row.get('CompanyName', 'N/A')} " \
               f"for the role of {row.get('Role', 'N/A')} {package_info} in {row.get('PlacementYear', 'N/A')}."
    
    def _summarize_company(self, row: pd.Series) -> str:
        """Generate summary for company data."""
        return f"Company {row.get('CompanyName', 'N/A')} made {row.get('Offers', 'N/A')} offers " \
               f"with an average package of {row.get('PackageLPA', 'N/A')} LPA " \
               f"and is located in {row.get('Location', 'N/A')}."
    
    def _summarize_interview(self, row: pd.Series) -> str:
        """Generate summary for interview data."""
        return f"In {row.get('PlacementYear', 'N/A')}, {row.get('CompanyName', 'N/A')} " \
               f"asked a {row.get('QuestionType', 'N/A')} question during interviews for the role of " \
               f"{row.get('Role', 'N/A')}: '{row.get('QuestionText', 'N/A')}'"
    
    def _generic_summary(self, row: pd.Series) -> str:
        """Generate generic summary for unknown CSV files."""
        return f"Data entry: {', '.join([f'{col}: {val}' for col, val in row.items() if pd.notna(val)])}"
    
    def _create_embeddings(self, documents: List[Dict[str, Any]]):
        """Create embeddings for documents."""
        try:
            texts = [doc["text"] for doc in documents]
            self.embeddings = self.model.encode(texts).tolist()
            logger.info(f"Created embeddings for {len(documents)} documents")
        except Exception as e:
            logger.error(f"Error creating embeddings: {e}")
            raise
    
    def retrieve_context(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Retrieve relevant context using similarity search."""
        try:
            if not self.embeddings:
                logger.warning("No embeddings available.")
                return []
            
            # Generate embedding for the query
            query_embedding = self.model.encode([query]).tolist()[0]
            
            # Calculate similarities (cosine similarity)
            similarities = []
            for i, doc_embedding in enumerate(self.embeddings):
                similarity = self._cosine_similarity(query_embedding, doc_embedding)
                similarities.append((similarity, i))
            
            # Sort by similarity and get top k
            similarities.sort(reverse=True)
            top_indices = [idx for _, idx in similarities[:top_k]]
            
            # Return top documents
            context_chunks = []
            for idx in top_indices:
                context_chunks.append({
                    "text": self.documents[idx]["text"],
                    "metadata": self.documents[idx]["metadata"],
                    "similarity_score": similarities[idx][0]
                })
            
            logger.info(f"Retrieved {len(context_chunks)} context chunks for query: {query[:50]}...")
            return context_chunks
            
        except Exception as e:
            logger.error(f"Error during context retrieval: {e}")
            return []
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0
        
        return dot_product / (norm1 * norm2)
    
    def generate_response(self, query: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Generate a response using the retrieved context and LLM."""
        try:
            # Construct the prompt
            prompt = self._construct_prompt(query, context_chunks)
            
            # No LLM configured; use fallback response
            response = self._generate_fallback_response(query, context_chunks)
            
            return response
            
        except Exception as e:
            logger.error(f"Error during response generation: {e}")
            return "I apologize, but I encountered an error while processing your request. Please try again."
    
    def _construct_prompt(self, query: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Construct a prompt for the LLM using retrieved context."""
        context_text = "\n\n".join([
            f"Context {i+1}: {chunk['text']}"
            for i, chunk in enumerate(context_chunks)
        ])
        
        prompt = f"""You are a helpful AI assistant for a university placement website. You help students with questions about placements, companies, and interviews.

Use the following context to answer the user's question. If the context doesn't contain enough information to answer the question completely, say so and provide what information you can.

{context_text}

Question: {query}

Answer:"""
        
        return prompt
    
    # Ollama generation removed
    
    def _generate_fallback_response(self, query: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Generate a fallback response when no LLM is available."""
        if not context_chunks:
            return "I don't have enough information to answer your question. Please try rephrasing or ask about a different topic."
        
        # Simple template-based response
        if "placement" in query.lower() or "placed" in query.lower():
            return f"Based on the available data, I found some relevant information about placements. {context_chunks[0]['text']}"
        elif "company" in query.lower():
            return f"I found some information about companies: {context_chunks[0]['text']}"
        elif "interview" in query.lower():
            return f"Here's some interview-related information: {context_chunks[0]['text']}"
        else:
            return f"I found some relevant information: {context_chunks[0]['text']}"
    
    def process_query(self, query: str) -> str:
        """Main method to process a user query and return a response."""
        try:
            # Retrieve relevant context
            context_chunks = self.retrieve_context(query)
            
            if not context_chunks:
                return "I couldn't find any relevant information for your question. Please try asking about placements, companies, or interviews."
            
            # Generate response using context
            response = self.generate_response(query, context_chunks)
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return "I apologize, but I encountered an error while processing your request. Please try again later."
