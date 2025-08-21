#!/usr/bin/env python3
"""
Minimal FastAPI server for Google Sheets integration
Only includes the companies API endpoint without RAG dependencies.
"""

import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="PlaceMentor AI - Companies API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Companies Sheets service
try:
    from companies_sheets_service import CompaniesSheetsService
    companies_service = CompaniesSheetsService()
    logger.info("✅ Companies Sheets service initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize Companies Sheets service: {e}")
    companies_service = None

# Initialize Drive Chatbot service
try:
    from drive_chatbot_service import DriveChatbotService
    chatbot_service = DriveChatbotService()
    logger.info("✅ Drive Chatbot service initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize Drive Chatbot service: {e}")
    chatbot_service = None

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "PlaceMentor AI Companies API",
        "status": "running",
        "endpoints": {
            "companies": "/api/companies",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "services": {
            "companies_sheets": companies_service is not None,
            "drive_chatbot": chatbot_service is not None
        }
    }

@app.get("/api/companies")
async def get_companies(sheet_number: int = 5):
    """Get companies data from Google Sheets for the company directory page."""
    try:
        if not companies_service:
            raise HTTPException(
                status_code=503, 
                detail="Companies service not available. Check backend logs."
            )
        
        # Get companies data from sheet #5 (or specified sheet)
        companies_data = companies_service.get_companies_for_frontend(sheet_number)
        
        return companies_data
        
    except Exception as e:
        logger.error(f"Error in companies endpoint: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred while fetching companies data: {str(e)}"
        )

@app.post("/api/chat")
async def chat_with_bot(request: dict):
    """Intelligent chatbot endpoint that uses Google Drive documents for responses."""
    try:
        query = request.get("query", "").strip()
        
        if not query:
            return {"answer": "Please provide a question or query."}
        
        if not chatbot_service:
            return {
                "answer": "I'm sorry, the chatbot service is not available at the moment. Please try again later."
            }
        
        # Generate response using the Drive Chatbot service
        response = chatbot_service.generate_response(query)
        
        return {"answer": response}
            
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return {"answer": "I'm sorry, I encountered an error. Please try asking your question again."}

@app.post("/api/chat/refresh")
async def refresh_chatbot_documents():
    """Refresh the chatbot documents from Google Drive."""
    try:
        if not chatbot_service:
            return {"success": False, "message": "Chatbot service not available"}
        
        chatbot_service.refresh_documents()
        return {"success": True, "message": "Documents refreshed successfully"}
        
    except Exception as e:
        logger.error(f"Error refreshing chatbot documents: {e}")
        return {"success": False, "message": f"Error refreshing documents: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    
    # Check if required environment variables are set
    if not os.getenv("GOOGLE_SHEETS_ID"):
        logger.error("❌ GOOGLE_SHEETS_ID environment variable not set!")
        logger.error("Please add GOOGLE_SHEETS_ID to your .env file")
        exit(1)
    
    if not os.path.exists("placementor-ai.json"):
        logger.error("❌ placementor-ai.json credentials file not found!")
        logger.error("Please ensure the credentials file is in the backend directory")
        exit(1)
    
    logger.info("🚀 Starting PlaceMentor AI Companies API server...")
    logger.info("📊 Companies will be fetched from Google Sheets sheet #5")
    
    uvicorn.run(
        "main_sheets_only:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
