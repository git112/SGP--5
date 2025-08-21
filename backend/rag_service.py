#!/usr/bin/env python3
"""
RAG Service for Placement Chatbot
Handles retrieval and generation logic for answering user queries.
"""

import os
import logging
from typing import List, Dict, Any, Optional
import chromadb
from sentence_transformers import SentenceTransformer
import ollama
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self, db_dir: str = "db"):
        """Initialize the RAG service with ChromaDB and embedding model."""
        self.db_dir = db_dir
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize ChromaDB client
        try:
            self.client = chromadb.PersistentClient(path=db_dir)
            self.collection = self.client.get_collection("placement_data")
            logger.info("Successfully connected to existing ChromaDB collection")
        except Exception as e:
            logger.error(f"Error connecting to ChromaDB: {e}")
            raise
        
        # Initialize LLM client (Ollama for local development)
        self.llm_client = self._initialize_llm()
    
    def _initialize_llm(self):
        """Initialize the LLM client based on configuration."""
        # Check if using Ollama (local) or external API
        use_ollama = os.getenv("USE_OLLAMA", "true").lower() == "true"
        
        if use_ollama:
            try:
                # Test Ollama connection
                ollama.list()
                logger.info("Using Ollama for local LLM inference")
                return "ollama"
            except Exception as e:
                logger.warning(f"Ollama not available: {e}")
                logger.info("Falling back to external API")
                use_ollama = False
        
        if not use_ollama:
            # External API configuration (OpenAI, Groq, etc.)
            api_key = os.getenv("LLM_API_KEY")
            api_base = os.getenv("LLM_API_BASE")
            
            if not api_key:
                logger.warning("No LLM API key found. Please set LLM_API_KEY environment variable.")
                return None
            
            logger.info(f"Using external LLM API: {api_base or 'OpenAI'}")
            return "external"
        
        return None
    
    def retrieve_context(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Retrieve relevant context for the given query using similarity search."""
        try:
            # Generate embedding for the query
            query_embedding = self.model.encode([query]).tolist()
            
            # Search for similar documents
            results = self.collection.query(
                query_embeddings=query_embedding,
                n_results=top_k,
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results
            context_chunks = []
            if results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    context_chunks.append({
                        "text": doc,
                        "metadata": results['metadatas'][0][i] if results['metadatas'] and results['metadatas'][0] else {},
                        "similarity_score": 1 - results['distances'][0][i] if results['distances'] and results['distances'][0] else 0
                    })
            
            logger.info(f"Retrieved {len(context_chunks)} context chunks for query: {query[:50]}...")
            return context_chunks
            
        except Exception as e:
            logger.error(f"Error during context retrieval: {e}")
            return []
    
    def generate_response(self, query: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Generate a response using the retrieved context and LLM."""
        try:
            # Construct the prompt
            prompt = self._construct_prompt(query, context_chunks)
            
            # Generate response using LLM
            if self.llm_client == "ollama":
                response = self._generate_with_ollama(prompt)
            elif self.llm_client == "external":
                response = self._generate_with_external_api(prompt)
            else:
                # Fallback response when no LLM is available
                response = self._generate_fallback_response(query, context_chunks)
            
            return response
            
        except Exception as e:
            logger.error(f"Error during response generation: {e}")
            return "I apologize, but I encountered an error while processing your request. Please try again."
    
    def _construct_prompt(self, query: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Construct a prompt for the LLM using retrieved context."""
        # Format context
        context_text = "\n\n".join([
            f"Context {i+1}: {chunk['text']}"
            for i, chunk in enumerate(context_chunks)
        ])
        
        # Create the prompt
        prompt = f"""You are a helpful AI assistant for a university placement website. You help students with questions about placements, companies, and interviews.

Use the following context to answer the user's question. If the context doesn't contain enough information to answer the question completely, say so and provide what information you can.

{context_text}

Question: {query}

Answer:"""
        
        return prompt
    
    def _generate_with_ollama(self, prompt: str) -> str:
        """Generate response using local Ollama instance."""
        try:
            # Use Llama3 model if available, otherwise fallback to any available model
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
    
    def _generate_with_external_api(self, prompt: str) -> str:
        """Generate response using external API (OpenAI, Groq, etc.)."""
        # This is a placeholder for external API integration
        # You can implement OpenAI, Groq, or other API calls here
        logger.info("External API integration not implemented yet")
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


