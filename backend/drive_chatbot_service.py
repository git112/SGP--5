#!/usr/bin/env python3
"""
Google Drive Chatbot Service
Fetches data from Google Drive files to provide intelligent responses for the chatbot.
"""

import os
import logging
import io
import pandas as pd
from typing import List, Dict, Any, Optional
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DriveChatbotService:
    def __init__(self, credentials_file: str = "placementor-ai.json"):
        """Initialize the Google Drive service for chatbot."""
        self.credentials_file = os.path.join(os.path.dirname(__file__), credentials_file)
        self.drive_service = None
        self.folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
        self._authenticate_drive()
        self._load_documents()
    
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
    
    def _load_documents(self):
        """Load all documents from the Google Drive folder."""
        try:
            if not self.folder_id:
                raise ValueError("GOOGLE_DRIVE_FOLDER_ID environment variable not set")
            
            # Get all files in the folder
            results = self.drive_service.files().list(
                q=f"'{self.folder_id}' in parents and trashed=false",
                fields="files(id, name, mimeType)"
            ).execute()
            
            files = results.get('files', [])
            logger.info(f"Found {len(files)} files in Google Drive folder")
            
            self.documents = []
            
            for file in files:
                try:
                    content = self._download_file_content(file['id'], file['mimeType'])
                    if content:
                        self.documents.append({
                            'name': file['name'],
                            'content': content,
                            'type': file['mimeType']
                        })
                        logger.info(f"Loaded document: {file['name']}")
                except Exception as e:
                    logger.warning(f"Failed to load file {file['name']}: {e}")
                    continue
            
            logger.info(f"Successfully loaded {len(self.documents)} documents")
            
        except Exception as e:
            logger.error(f"Error loading documents: {e}")
            self.documents = []
    
    def _download_file_content(self, file_id: str, mime_type: str) -> Optional[str]:
        """Download and extract content from a Google Drive file."""
        try:
            if 'spreadsheet' in mime_type or 'excel' in mime_type:
                return self._download_excel_content(file_id)
            elif 'document' in mime_type:
                return self._download_document_content(file_id)
            elif 'text' in mime_type or 'csv' in mime_type:
                return self._download_text_content(file_id)
            else:
                logger.warning(f"Unsupported file type: {mime_type}")
                return None
                
        except Exception as e:
            logger.error(f"Error downloading file content: {e}")
            return None
    
    def _download_excel_content(self, file_id: str) -> Optional[str]:
        """Download and extract content from Excel files."""
        try:
            # Download the file
            request = self.drive_service.files().get_media(fileId=file_id)
            file = io.BytesIO()
            downloader = MediaIoBaseDownload(file, request)
            
            done = False
            while done is False:
                status, done = downloader.next_chunk()
            
            file.seek(0)
            
            # Read Excel file
            df = pd.read_excel(file, engine='openpyxl')
            
            # Convert to text
            content = []
            for index, row in df.iterrows():
                row_content = []
                for column, value in row.items():
                    if pd.notna(value):
                        row_content.append(f"{column}: {value}")
                if row_content:
                    content.append(" | ".join(row_content))
            
            return "\n".join(content)
            
        except Exception as e:
            logger.error(f"Error processing Excel file: {e}")
            return None
    
    def _download_document_content(self, file_id: str) -> Optional[str]:
        """Download and extract content from Google Docs."""
        try:
            # For Google Docs, we need to export as text
            request = self.drive_service.files().export_media(
                fileId=file_id, 
                mimeType='text/plain'
            )
            file = io.BytesIO()
            downloader = MediaIoBaseDownload(file, request)
            
            done = False
            while done is False:
                status, done = downloader.next_chunk()
            
            file.seek(0)
            return file.read().decode('utf-8')
            
        except Exception as e:
            logger.error(f"Error processing Google Doc: {e}")
            return None
    
    def _download_text_content(self, file_id: str) -> Optional[str]:
        """Download and extract content from text files."""
        try:
            request = self.drive_service.files().get_media(fileId=file_id)
            file = io.BytesIO()
            downloader = MediaIoBaseDownload(file, request)
            
            done = False
            while done is False:
                status, done = downloader.next_chunk()
            
            file.seek(0)
            return file.read().decode('utf-8')
            
        except Exception as e:
            logger.error(f"Error processing text file: {e}")
            return None
    
    def search_documents(self, query: str) -> List[Dict[str, Any]]:
        """Search through documents for relevant information."""
        try:
            query_lower = query.lower()
            relevant_docs = []
            
            for doc in self.documents:
                content_lower = doc['content'].lower()
                
                # Simple keyword matching
                relevance_score = 0
                keywords = query_lower.split()
                
                for keyword in keywords:
                    if keyword in content_lower:
                        relevance_score += content_lower.count(keyword)
                
                if relevance_score > 0:
                    relevant_docs.append({
                        'name': doc['name'],
                        'content': doc['content'],
                        'relevance_score': relevance_score
                    })
            
            # Sort by relevance score
            relevant_docs.sort(key=lambda x: x['relevance_score'], reverse=True)
            
            return relevant_docs[:3]  # Return top 3 most relevant documents
            
        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            return []
    
    def generate_response(self, query: str) -> str:
        """Generate a response based on the query and available documents."""
        try:
            if not self.documents:
                return "I don't have access to the placement documents at the moment. Please try again later."
            
            # Search for relevant documents
            relevant_docs = self.search_documents(query)
            
            if not relevant_docs:
                # Fallback to general placement knowledge
                return self._get_fallback_response(query)
            
            # Generate response based on relevant documents
            response_parts = []
            response_parts.append("Based on the placement documents, here's what I found:")
            
            for doc in relevant_docs:
                # Extract relevant information from the document
                doc_info = self._extract_relevant_info(query, doc['content'])
                if doc_info:
                    response_parts.append(f"\n📄 **{doc['name']}**:")
                    response_parts.append(doc_info)
            
            if len(response_parts) == 1:
                # No specific info found, use fallback
                return self._get_fallback_response(query)
            
            return "\n".join(response_parts)
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I encountered an error while processing your question. Please try again."
    
    def _extract_relevant_info(self, query: str, content: str) -> Optional[str]:
        """Extract relevant information from document content."""
        try:
            query_lower = query.lower()
            content_lines = content.split('\n')
            relevant_lines = []
            
            for line in content_lines:
                line_lower = line.lower()
                # Check if line contains query keywords
                if any(keyword in line_lower for keyword in query_lower.split()):
                    relevant_lines.append(line.strip())
            
            if relevant_lines:
                return "\n".join(relevant_lines[:5])  # Limit to 5 lines
            return None
            
        except Exception as e:
            logger.error(f"Error extracting relevant info: {e}")
            return None
    
    def _get_fallback_response(self, query: str) -> str:
        """Provide fallback responses when no relevant documents are found."""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ["company", "companies", "placement", "job"]):
            return "I can help you with company information! Check out our Company Directory page to see all available companies with their packages, roles, and eligibility criteria. You can filter by domain and package range to find the best opportunities for you."
        
        elif any(word in query_lower for word in ["interview", "preparation", "tips"]):
            return "Great question! For interview preparation, I recommend: 1) Practice coding problems on platforms like LeetCode, 2) Review data structures and algorithms, 3) Research the company and role, 4) Prepare behavioral questions using the STAR method, 5) Mock interviews with peers. Would you like specific tips for any of these areas?"
        
        elif any(word in query_lower for word in ["package", "salary", "lpa", "compensation"]):
            return "Package information varies by company and role. In our Company Directory, you can see the exact package ranges (like 8-10 LPA, 15-20 LPA) for each company. Higher packages usually indicate more competitive roles. Remember to consider the complete compensation package including benefits, not just the base salary."
        
        elif any(word in query_lower for word in ["eligibility", "cgpa", "requirements"]):
            return "Most companies require a minimum CGPA of 7.0+, though some top-tier companies may require 8.0+. However, CGPA is just one factor - companies also consider technical skills, projects, internships, and interview performance. Focus on building a strong portfolio alongside maintaining good academics."
        
        elif any(word in query_lower for word in ["role", "position", "job title"]):
            return "Common roles include Software Engineer, Data Scientist, Product Manager, and more. Each role has different requirements and responsibilities. Check our Company Directory to see what roles each company is offering, and research the specific skills needed for your target role."
        
        else:
            return "I'm here to help with placement-related questions! You can ask me about companies, interview preparation, packages, eligibility criteria, roles, and more. What specific information would you like to know?"
    
    def refresh_documents(self):
        """Refresh the documents from Google Drive."""
        logger.info("Refreshing documents from Google Drive...")
        self._load_documents()
        logger.info("Documents refreshed successfully")

