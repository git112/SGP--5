#!/usr/bin/env python3
"""
Data Ingestion Script for RAG-based Placement Chatbot
This script reads CSV files and creates vector embeddings for similarity search.
"""

import os
import pandas as pd
import chromadb
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataIngestion:
    def __init__(self, data_dir: str = "data", db_dir: str = "db"):
        self.data_dir = data_dir
        self.db_dir = db_dir
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.client = chromadb.PersistentClient(path=db_dir)
        
        # Create collection for our embeddings
        self.collection = self.client.get_or_create_collection(
            name="placement_data",
            metadata={"description": "Placement data embeddings for RAG chatbot"}
        )
    
    def read_csv_files(self) -> Dict[str, pd.DataFrame]:
        """Read all CSV files from the data directory."""
        csv_files = {}
        
        if not os.path.exists(self.data_dir):
            logger.error(f"Data directory '{self.data_dir}' not found!")
            return csv_files
        
        for filename in os.listdir(self.data_dir):
            if filename.endswith('.csv'):
                file_path = os.path.join(self.data_dir, filename)
                try:
                    df = pd.read_csv(file_path)
                    csv_files[filename] = df
                    logger.info(f"Successfully loaded {filename} with {len(df)} rows")
                except Exception as e:
                    logger.error(f"Error loading {filename}: {e}")
        
        return csv_files
    
    def generate_text_summaries(self, csv_files: Dict[str, pd.DataFrame]) -> List[Dict[str, Any]]:
        """Generate natural language summaries for each row in the CSV files."""
        documents = []
        
        for filename, df in csv_files.items():
            logger.info(f"Processing {filename}...")
            
            for index, row in df.iterrows():
                # Generate unique ID
                doc_id = f"{filename}_{index}"
                
                # Generate natural language summary based on file type
                if filename == "placements.csv":
                    text = self._summarize_placement(row)
                elif filename == "companies.csv":
                    text = self._summarize_company(row)
                elif filename == "interviews.csv":
                    text = self._summarize_interview(row)
                else:
                    # Generic summary for unknown CSV files
                    text = self._generic_summary(row)
                
                documents.append({
                    "id": doc_id,
                    "text": text,
                    "metadata": {
                        "source_file": filename,
                        "row_index": index,
                        "file_type": filename.replace('.csv', '')
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
    
    def create_embeddings(self, documents: List[Dict[str, Any]]):
        """Create embeddings and store them in ChromaDB."""
        logger.info(f"Creating embeddings for {len(documents)} documents...")
        
        # Extract texts and metadata
        texts = [doc["text"] for doc in documents]
        metadatas = [doc["metadata"] for doc in documents]
        ids = [doc["id"] for doc in documents]
        
        # Generate embeddings
        embeddings = self.model.encode(texts).tolist()
        
        # Add to ChromaDB collection
        self.collection.add(
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )
        
        logger.info(f"Successfully added {len(documents)} documents to ChromaDB")
    
    def run_ingestion(self):
        """Main method to run the complete ingestion process."""
        logger.info("Starting data ingestion process...")
        
        # Read CSV files
        csv_files = self.read_csv_files()
        if not csv_files:
            logger.error("No CSV files found to process!")
            return
        
        # Generate text summaries
        documents = self.generate_text_summaries(csv_files)
        if not documents:
            logger.error("No documents generated!")
            return
        
        # Create embeddings and store in ChromaDB
        self.create_embeddings(documents)
        
        logger.info("Data ingestion completed successfully!")
        
        # Print collection info
        collection_info = self.collection.count()
        logger.info(f"Total documents in collection: {collection_info}")

def main():
    """Main function to run the ingestion script."""
    try:
        ingestion = DataIngestion()
        ingestion.run_ingestion()
    except Exception as e:
        logger.error(f"Error during ingestion: {e}")
        raise

if __name__ == "__main__":
    main()


