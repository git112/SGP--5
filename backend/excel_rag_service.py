import os
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Generator
import logging
from pathlib import Path
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class ExcelRAGService:
    def __init__(self, data_folder: str = "data"):
        self.data_folder = data_folder
        self.documents = []
        self.vectorizer = None
        self.document_vectors = None
        
    def load_docs_from_excel_sheets(self) -> List[Dict]:
        """Load all Excel files from data folder and convert to text documents"""
        documents = []
        # Use absolute path from project root
        data_path = Path(__file__).parent.parent / self.data_folder
        
        if not data_path.exists():
            logger.warning(f"Data folder {self.data_folder} does not exist")
            return documents
            
        excel_files = list(data_path.glob("*.xlsx"))
        logger.info(f"Found {len(excel_files)} Excel files")
        
        for file_path in excel_files:
            try:
                logger.info(f"Processing {file_path.name}")
                
                # Read all sheets from the Excel file
                excel_data = pd.read_excel(file_path, sheet_name=None)
                
                for sheet_name, df in excel_data.items():
                    if df.empty:
                        continue
                        
                    # Convert DataFrame to text
                    text_content = self._dataframe_to_text(df, file_path.name, sheet_name)
                    
                    if text_content.strip():
                        doc = {
                            "content": text_content,
                            "metadata": {
                                "source": str(file_path),
                                "sheet": sheet_name,
                                "file_name": file_path.name,
                                "rows": len(df),
                                "columns": len(df.columns)
                            }
                        }
                        documents.append(doc)
                        
            except Exception as e:
                logger.error(f"Error processing {file_path}: {e}")
                continue
                
        logger.info(f"Loaded {len(documents)} documents from Excel files")
        return documents
    
    def _dataframe_to_text(self, df: pd.DataFrame, file_name: str, sheet_name: str) -> str:
        """Convert DataFrame to readable text format"""
        text_parts = [f"Data from {file_name}, Sheet: {sheet_name}"]
        
        # Add column headers
        if not df.columns.empty:
            text_parts.append(f"Columns: {', '.join(df.columns.astype(str))}")
        
        # Add sample data (first 10 rows)
        sample_df = df.head(10)
        for idx, row in sample_df.iterrows():
            row_text = []
            for col, value in row.items():
                if pd.notna(value):
                    row_text.append(f"{col}: {value}")
            if row_text:
                text_parts.append(f"Row {idx + 1}: {' | '.join(row_text)}")
        
        # Add summary statistics for numeric columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if not numeric_cols.empty:
            text_parts.append("Summary Statistics:")
            for col in numeric_cols:
                stats = df[col].describe()
                text_parts.append(f"{col}: mean={stats['mean']:.2f}, std={stats['std']:.2f}, min={stats['min']:.2f}, max={stats['max']:.2f}")
        
        return "\n".join(text_parts)
    
    def initialize_rag(self):
        """Initialize the RAG system with TF-IDF vectorizer"""
        try:
            logger.info("Initializing RAG system...")
            
            # Load documents
            self.documents = self.load_docs_from_excel_sheets()
            
            if not self.documents:
                logger.warning("No documents loaded, using fallback")
                self.documents = [{
                    "content": "No data available. This is a placement assistance chatbot for students.",
                    "metadata": {"source": "fallback"}
                }]
            
            # Initialize TF-IDF vectorizer with adjusted parameters for small datasets
            self.vectorizer = TfidfVectorizer(
                max_features=1000,
                stop_words='english',
                ngram_range=(1, 2),
                min_df=1,
                max_df=1.0  # Changed from 0.95 to 1.0 to handle single document
            )
            
            # Extract text content from documents
            texts = [doc["content"] for doc in self.documents]
            
            # Handle edge case for single document
            if len(texts) == 1:
                # For single document, use simpler vectorizer settings
                self.vectorizer = TfidfVectorizer(
                    max_features=500,
                    stop_words='english',
                    ngram_range=(1, 1),
                    min_df=1,
                    max_df=1.0
                )
            
            # Fit the vectorizer and transform documents
            self.document_vectors = self.vectorizer.fit_transform(texts)
            logger.info(f"TF-IDF vectorizer fitted with {len(texts)} documents")
            
            logger.info("RAG system initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing RAG: {e}")
            raise
    
    def _simple_qa_response(self, query: str) -> str:
        """Simple QA response using TF-IDF similarity with improved query processing"""
        try:
            if not self.vectorizer or self.document_vectors is None:
                return "RAG system not properly initialized. Please restart the server."
            
            # Enhanced query processing for better matching
            enhanced_query = self._enhance_query(query)
            
            # Transform query to vector
            query_vector = self.vectorizer.transform([enhanced_query])
            
            # Calculate cosine similarity
            similarities = cosine_similarity(query_vector, self.document_vectors).flatten()
            
            # Get top 5 most similar documents (increased from 3)
            top_indices = similarities.argsort()[-5:][::-1]
            
            # Lower similarity threshold for better results
            if similarities[top_indices[0]] < 0.05:  # Reduced from 0.1 to 0.05
                return "I couldn't find relevant information in the data. Please try rephrasing your question or ask about placement statistics, company information, or career guidance."
            
            # Combine relevant documents with better processing
            relevant_docs = []
            for idx in top_indices:
                if similarities[idx] > 0.05:  # Reduced threshold
                    doc = self.documents[idx]
                    # Process content to extract relevant information
                    processed_content = self._extract_relevant_info(doc["content"], query)
                    if processed_content:
                        relevant_docs.append(processed_content)
            
            if not relevant_docs:
                return "I couldn't find relevant information in the data. Please try rephrasing your question."
            
            # Generate better response
            response = self._generate_response(query, relevant_docs)
            
            return response
            
        except Exception as e:
            logger.error(f"Error in QA response: {e}")
            return "I'm sorry, I encountered an error processing your question. Please try again."
    
    def _enhance_query(self, query: str) -> str:
        """Enhance query with related terms for better matching"""
        query_lower = query.lower()
        enhanced = query
        
        # Add related terms for common queries
        if any(word in query_lower for word in ['package', 'salary', 'lpa', 'highest', 'maximum']):
            enhanced += " package salary compensation lpa lakhs per annum"
        if any(word in query_lower for word in ['company', 'companies', 'top', 'best']):
            enhanced += " company companies organization firm"
        if any(word in query_lower for word in ['2023', '2022', '2021', '2024']):
            enhanced += " year annual data"
        if any(word in query_lower for word in ['placement', 'placed', 'job']):
            enhanced += " placement job career employment"
        if any(word in query_lower for word in ['cgpa', 'gpa', 'grade']):
            enhanced += " cgpa gpa grade academic performance"
        
        return enhanced
    
    def _extract_relevant_info(self, content: str, query: str) -> str:
        """Extract relevant information from document content based on query"""
        query_lower = query.lower()
        lines = content.split('\n')
        relevant_lines = []
        
        for line in lines:
            line_lower = line.lower()
            # Check if line contains relevant information
            if any(keyword in line_lower for keyword in query_lower.split()):
                relevant_lines.append(line)
            # Also include lines with key data indicators
            elif any(indicator in line_lower for indicator in ['package', 'lpa', 'company', 'cgpa', 'placed']):
                relevant_lines.append(line)
        
        if relevant_lines:
            return '\n'.join(relevant_lines[:10])  # Limit to 10 most relevant lines
        else:
            return content[:800]  # Return first 800 chars if no specific matches
    
    def _generate_response(self, query: str, relevant_docs: list) -> str:
        """Generate a concise response using the PlaceMentor AI prompt template."""
        # Use the new prompt template format
        context = self._format_context_for_prompt(relevant_docs)
        return self._generate_with_placementor_template(query, context)
    
    def _format_context_for_prompt(self, relevant_docs: list) -> str:
        """Format relevant documents as context for the prompt template."""
        if not relevant_docs:
            return "No relevant data found in the placement sheets."
        
        # Extract key information from documents
        context_parts = []
        for doc in relevant_docs[:3]:  # Limit to top 3 most relevant docs
            # Clean up the document content
            lines = doc.split('\n')
            relevant_lines = []
            
            for line in lines:
                # Include lines with key data indicators
                if any(keyword in line.lower() for keyword in ['package', 'lpa', 'company', 'cgpa', 'placed', 'role', 'salary']):
                    relevant_lines.append(line.strip())
            
            if relevant_lines:
                context_parts.extend(relevant_lines)
        
        return "\n".join(context_parts[:10])  # Limit to 10 most relevant lines
    
    def _generate_with_placementor_template(self, question: str, context: str) -> str:
        """Generate response using the SYSTEM BEHAVIOR template format."""
        query_lower = question.lower()
        
        # Special handling for highest package queries across all data
        if any(word in query_lower for word in ['highest', 'maximum', 'top', 'best']):
            if any(word in query_lower for word in ['package', 'salary', 'lpa']):
                return self._find_highest_package_global(query_lower)
        
        # Year-specific queries
        if any(word in query_lower for word in ['2023', '2022', '2021', '2024', '2025', 'year-wise', 'year wise', 'by year', 'per year']):
            return self._filter_by_year([], query_lower)
        
        # If we have context, provide a concise answer
        if context and context != "No relevant data found in the placement sheets.":
            # Extract key facts from context
            key_facts = self._extract_key_facts_from_context(context, question)
            if key_facts:
                return key_facts
        
        # If no relevant context found - use the new system behavior response
        return "That information is not available in the dataset."
    
    def _extract_key_facts_from_context(self, context: str, question: str) -> str:
        """Extract key facts from context to answer the question concisely."""
        import re
        
        question_lower = question.lower()
        
        # For package-related questions
        if any(word in question_lower for word in ['package', 'salary', 'lpa']):
            packages = []
            for match in re.finditer(r'(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|package)', context.lower()):
                try:
                    val = float(match.group(1))
                    if 0 < val < 200:  # Reasonable package range
                        packages.append(val)
                except:
                    continue
            
            if packages:
                if 'highest' in question_lower or 'maximum' in question_lower:
                    return f"The highest package mentioned is {max(packages):.1f} LPA."
                elif 'average' in question_lower:
                    return f"The average package mentioned is {sum(packages)/len(packages):.1f} LPA."
                else:
                    return f"Packages mentioned range from {min(packages):.1f} to {max(packages):.1f} LPA."
        
        # For company-related questions
        if any(word in question_lower for word in ['company', 'companies']):
            companies = []
            for line in context.split('\n'):
                if 'company' in line.lower() and any(char.isalpha() for char in line):
                    # Extract company name (simple extraction)
                    words = line.split()
                    for i, word in enumerate(words):
                        if 'company' in word.lower():
                            if i > 0:
                                companies.append(words[i-1])
                            break
            
            if companies:
                unique_companies = list(set(companies))[:5]  # Limit to 5 companies
                return f"Companies mentioned: {', '.join(unique_companies)}."
        
        # For general questions, provide a brief summary
        lines = context.split('\n')
        relevant_lines = [line for line in lines if any(keyword in line.lower() for keyword in ['package', 'company', 'placed', 'cgpa'])]
        
        if relevant_lines:
            return f"Based on the data: {relevant_lines[0]}."
        
        return None
    
    def _find_highest_package_global(self, query_lower: str) -> str:
        """Find the highest package across ALL loaded sheets. Supports year-wise if asked."""
        import re

        # Detect if user asked year-wise
        wants_year_wise = any(kw in query_lower for kw in ['year-wise', 'year wise', 'by year', 'per year'])

        # Scan all documents for packages
        max_overall = 0.0
        max_overall_year = None
        year_to_max: Dict[str, float] = {}

        for doc in self.documents:
            text = doc.get("content", "")
            for line in text.split('\n'):
                low = line.lower()
                if 'package' in low or 'lpa' in low:
                    # Extract year and package
                    year_match = re.search(r'(20\d{2})', line)
                    pkg_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|package)', low)
                    if pkg_match:
                        try:
                            val = float(pkg_match.group(1))
                        except Exception:
                            continue
                        if 0 < val < 200:
                            if year_match:
                                y = year_match.group(1)
                                year_to_max[y] = max(year_to_max.get(y, 0.0), val)
                            if val > max_overall:
                                max_overall = val
                                max_overall_year = year_match.group(1) if year_match else max_overall_year

        if wants_year_wise and year_to_max:
            # Build concise year-wise summary (top 4 years by year)
            parts = [f"{y}: {val:.1f} LPA" for y, val in sorted(year_to_max.items())]
            return "Highest package (year-wise): " + "; ".join(parts[:8])

        if max_overall > 0:
            if max_overall_year:
                return f"Highest package: {max_overall:.1f} LPA (in {max_overall_year})."
            return f"Highest package: {max_overall:.1f} LPA."

        return "That information is not available in the dataset."
    
    def _find_top_companies(self, docs: list) -> str:
        """Find top companies from the documents"""
        companies = []
        for doc in docs:
            lines = doc.split('\n')
            for line in lines:
                if 'company' in line.lower():
                    companies.append(line)
        
        if companies:
            # Return concise list, capped
            return "Companies mentioned: " + "; ".join(companies[:5]) + "."
        return "That information is not available in the dataset."
    
    def _calculate_average(self, docs: list, query: str) -> str:
        """Calculate average values from documents"""
        return f"Based on the placement data:\n\n" + "\n\n".join(docs[:2])
    
    def _filter_by_year(self, docs: list, query: str) -> str:
        """Provide concise year-specific answer. If asking highest package for a year, compute it."""
        import re
        year = None
        m = re.search(r'(20\d{2})', query)
        if m:
            year = m.group(1)

        if not year:
            # If no specific year, fall back to year-wise highest across all
            return self._find_highest_package_global('year-wise')

        # Compute highest package for the specified year across all docs
        max_for_year = 0.0
        for doc in self.documents:
            text = doc.get("content", "")
            for line in text.split('\n'):
                if year in line and ('lpa' in line.lower() or 'package' in line.lower()):
                    pm = re.search(r'(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|package)', line.lower())
                    if pm:
                        try:
                            val = float(pm.group(1))
                        except Exception:
                            continue
                        if 0 < val < 200:
                            max_for_year = max(max_for_year, val)

        if max_for_year > 0:
            return f"Highest package in {year}: {max_for_year:.1f} LPA."
        return f"That information is not available in the dataset."

    def _summarize_concise(self, query_lower: str, relevant_docs: list) -> str:
        """Fallback concise summary without dumping raw rows."""
        # Try to extract any package mentions to provide a short fact
        import re
        packages: List[float] = []
        for doc in relevant_docs[:3]:
            for num in re.findall(r'\b(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|package)\b', doc.lower()):
                try:
                    val = float(num)
                    if 0 < val < 200:
                        packages.append(val)
                except Exception:
                    continue

        if packages:
            # Provide min/max to be helpful but brief
            return f"Packages mentioned: {min(packages):.1f}–{max(packages):.1f} LPA."

        # Otherwise, provide a generic concise acknowledgement
        return "I found relevant placement data. Please specify what you need (e.g., highest package, year-wise)."
    
    def process_query(self, query: str) -> str:
        """Process a user query and return response"""
        try:
            return self._simple_qa_response(query)
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return "I'm sorry, I encountered an error processing your question. Please try again."
    
    def process_query_stream(self, query: str) -> Generator[str, None, None]:
        """Process a user query and stream response token by token"""
        try:
            response = self._simple_qa_response(query)
            
            # Simulate streaming by yielding words
            words = response.split()
            for i, word in enumerate(words):
                if i == 0:
                    yield word
                else:
                    yield f" {word}"
                # Small delay to simulate streaming
                import time
                time.sleep(0.05)
                
        except Exception as e:
            logger.error(f"Error processing query stream: {e}")
            yield "I'm sorry, I encountered an error processing your question. Please try again."

# Global instance
excel_rag_service = ExcelRAGService()

