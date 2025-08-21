#!/usr/bin/env python3
"""
Google Drive RAG Service for Placement Chatbot
Reads files from Google Drive and creates vector embeddings for similarity search.
"""

import os
import logging
from typing import List, Dict, Any, Optional
import pandas as pd
from sentence_transformers import SentenceTransformer
import ollama
from dotenv import load_dotenv
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io
import mimetypes

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GoogleDriveRAGService:
    def __init__(self, credentials_file: str = "placementor-ai.json"):
        """Initialize the Google Drive RAG service."""
        self.credentials_file = os.path.join(os.path.dirname(__file__), credentials_file)
        self.drive_service = None
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize Google Drive service
        self._authenticate_drive()
        
        # Initialize LLM client (Ollama for local development)
        self.llm_client = self._initialize_llm()
        
        # In-memory storage for embeddings (you can replace this with ChromaDB later)
        self.documents = []
        self.embeddings = []
    
    def _authenticate_drive(self):
        """Authenticate with Google Drive API."""
        try:
            if not os.path.exists(self.credentials_file):
                raise FileNotFoundError(f"Credentials file not found: {self.credentials_file}")
            
            SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
            credentials = Credentials.from_service_account_file(
                self.credentials_file, scopes=SCOPES
            )
            
            self.drive_service = build('drive', 'v3', credentials=credentials)
            logger.info("Successfully authenticated with Google Drive API")
            
        except Exception as e:
            logger.error(f"Google Drive authentication failed: {e}")
            raise
    
    def _initialize_llm(self):
        """Initialize the LLM client based on configuration."""
        use_ollama = os.getenv("USE_OLLAMA", "true").lower() == "true"
        
        if use_ollama:
            try:
                ollama.list()
                logger.info("Using Ollama for local LLM inference")
                return "ollama"
            except Exception as e:
                logger.warning(f"Ollama not available: {e}")
                return None
        
        return None
    
    def list_drive_files(self, folder_id: str = None, file_types: List[str] = None) -> List[Dict[str, Any]]:
        """List files from Google Drive folder."""
        try:
            query = "trashed=false"
            
            if folder_id:
                query += f" and '{folder_id}' in parents"
            
            if file_types:
                mime_types = []
                for file_type in file_types:
                    if file_type == 'csv':
                        mime_types.append("'text/csv'")
                    elif file_type == 'pdf':
                        mime_types.append("'application/pdf'")
                    elif file_type == 'txt':
                        mime_types.append("'text/plain'")
                    elif file_type == 'doc':
                        mime_types.append("'application/vnd.google-apps.document'")
                
                if mime_types:
                    query += f" and ({' or '.join(mime_types)})"
            
            results = self.drive_service.files().list(
                q=query,
                fields="files(id,name,mimeType,size,modifiedTime)",
                orderBy="modifiedTime desc"
            ).execute()
            
            files = results.get('files', [])
            logger.info(f"Found {len(files)} files in Google Drive")
            return files
            
        except Exception as e:
            logger.error(f"Error listing Drive files: {e}")
            return []
    
    def download_file(self, file_id: str) -> Optional[bytes]:
        """Download a file from Google Drive."""
        try:
            request = self.drive_service.files().get_media(fileId=file_id)
            file = io.BytesIO()
            downloader = MediaIoBaseDownload(file, request)
            
            done = False
            while done is False:
                status, done = downloader.next_chunk()
                logger.info(f"Download {int(status.progress() * 100)}%")
            
            file.seek(0)
            return file.read()
            
        except Exception as e:
            logger.error(f"Error downloading file {file_id}: {e}")
            return None
    
    def process_csv_file(self, file_content: bytes, filename: str) -> List[Dict[str, Any]]:
        """Process CSV file content and generate text summaries."""
        try:
            # Convert bytes to string and read as CSV
            content_str = file_content.decode('utf-8')
            df = pd.read_csv(io.StringIO(content_str))
            
            documents = []
            logger.info(f"Processing {filename} with {len(df)} rows")
            
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
            
        except Exception as e:
            logger.error(f"Error processing CSV file {filename}: {e}")
            return []
    
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
    
    def ingest_drive_files(self, folder_id: str = None, file_types: List[str] = None):
        """Ingest files from Google Drive and create embeddings."""
        try:
            # List files from Drive
            files = self.list_drive_files(folder_id, file_types)
            if not files:
                logger.warning("No files found in Google Drive")
                return
            
            all_documents = []
            
            for file in files:
                logger.info(f"Processing file: {file['name']} ({file['mimeType']})")
                
                # Download file content
                file_content = self.download_file(file['id'])
                if not file_content:
                    continue
                
                # Process based on file type
                if file['mimeType'] == 'text/csv':
                    documents = self.process_csv_file(file_content, file['name'])
                    all_documents.extend(documents)
                # Add more file type handlers here (PDF, TXT, etc.)
                else:
                    logger.info(f"Skipping unsupported file type: {file['mimeType']}")
            
            if not all_documents:
                logger.warning("No documents generated from Drive files")
                return
            
            # Store documents and create embeddings
            self.documents = all_documents
            self._create_embeddings(all_documents)
            
            logger.info(f"Successfully ingested {len(all_documents)} documents from Google Drive")
            
        except Exception as e:
            logger.error(f"Error during Drive ingestion: {e}")
            raise
    
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
                logger.warning("No embeddings available. Please run ingestion first.")
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
        import numpy as np
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
            
            # Generate response using LLM
            if self.llm_client == "ollama":
                response = self._generate_with_ollama(prompt)
            else:
                # Fallback response when no LLM is available
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
    
    def _generate_with_ollama(self, prompt: str) -> str:
        """Generate response using local Ollama instance."""
        try:
            available_models = ollama.list()
            model_name = "llama3" if "llama3" in [m['name'] for m in available_models['models']] else "mistral"
            
            response = ollama.chat(
                model=model_name,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return response['message']['content']
            
        except Exception as e:
            logger.error(f"Error with Ollama: {e}")
            return self._generate_fallback_response("", [])
    
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
