#!/usr/bin/env python3
"""
Google Drive Service for RAG-based Placement Chatbot
Reads files from Google Drive and processes them for the chatbot.
"""

import os
import logging
from typing import List, Dict, Any, Optional
import pandas as pd
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GoogleDriveService:
    def __init__(self, credentials_file: str = "placementor-ai.json"):
        """Initialize the Google Drive service."""
        self.credentials_file = os.path.join(os.path.dirname(__file__), credentials_file)
        self.drive_service = None
        self._authenticate_drive()
    
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
    
    def list_files(self, folder_id: str = None) -> List[Dict[str, Any]]:
        """List files from Google Drive folder."""
        try:
            query = "trashed=false"
            
            if folder_id:
                query += f" and '{folder_id}' in parents"
            
            # Focus on Excel files (.xlsx) and CSV files
            query += " and (mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or mimeType='text/csv')"
            
            results = self.drive_service.files().list(
                q=query,
                fields="files(id,name,mimeType,size,modifiedTime)",
                orderBy="modifiedTime desc"
            ).execute()
            
            files = results.get('files', [])
            logger.info(f"Found {len(files)} Excel/CSV files in Google Drive")
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
    
    def get_csv_data(self, file_id: str) -> Optional[pd.DataFrame]:
        """Get CSV data from a Google Drive file."""
        try:
            file_content = self.download_file(file_id)
            if not file_content:
                return None
            
            # Convert bytes to string and read as CSV
            content_str = file_content.decode('utf-8')
            df = pd.read_csv(io.StringIO(content_str))
            
            logger.info(f"Successfully loaded CSV with {len(df)} rows")
            return df
            
        except Exception as e:
            logger.error(f"Error processing CSV file: {e}")
            return None
    
    def get_excel_data(self, file_id: str) -> Optional[pd.DataFrame]:
        """Get Excel data from a Google Drive file."""
        try:
            file_content = self.download_file(file_id)
            if not file_content:
                return None
            
            # Read Excel file from bytes
            df = pd.read_excel(io.BytesIO(file_content))
            
            logger.info(f"Successfully loaded Excel file with {len(df)} rows")
            return df
            
        except Exception as e:
            logger.error(f"Error processing Excel file: {e}")
            return None
    
    def get_file_data(self, file_id: str, mime_type: str) -> Optional[pd.DataFrame]:
        """Get data from a Google Drive file based on its MIME type."""
        try:
            if mime_type == 'text/csv':
                return self.get_csv_data(file_id)
            elif mime_type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                return self.get_excel_data(file_id)
            else:
                logger.warning(f"Unsupported file type: {mime_type}")
                return None
                
        except Exception as e:
            logger.error(f"Error processing file: {e}")
            return None
