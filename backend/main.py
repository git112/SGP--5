from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
import logging
from signup.schemas import UserCreate, UserLogin, ForgotPasswordRequest, ResetPasswordRequest
from signup.utils import (
    validate_email_domain,
    validate_password,
    hash_password,
    verify_password
)
from signup.database import get_user_collection
from signup.auth_service import AuthService
import os
from dotenv import load_dotenv
from typing import Optional

# Load environment from backend/.env regardless of CWD
_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=_ENV_PATH)

from sheets_service import sheets_service
from companies_sheets_service import CompaniesSheetsService
from interview_api import router as interview_router
from excel_rag_service import excel_rag_service

app = FastAPI()

# Initialize auth service
auth_service = AuthService()

# Initialize Excel-based RAG service
excel_rag_service.initialize_rag()

# Initialize Companies Sheets service
companies_service = CompaniesSheetsService()

# Configure logging
logger = logging.getLogger(__name__)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount competency test API (interview endpoints, Python port of Node service)
app.include_router(interview_router)

# Google Sheets configuration
SPREADSHEET_ID = os.getenv("GOOGLE_SPREADSHEET_ID", "your-spreadsheet-id-here")

# Helper function to get current user from JWT token
async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    email = auth_service.verify_jwt_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return email

@app.post("/signup")
def signup(user: UserCreate):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    if not validate_email_domain(user.email):
        raise HTTPException(status_code=400, detail="Only IT department emails allowed")

    if not validate_password(user.password):
        raise HTTPException(status_code=400, detail="Password must have at least one number and one special character")

    users = get_user_collection()
    if users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pw = hash_password(user.password)
    users.insert_one({"email": user.email, "password": hashed_pw})

    return {"message": "User registered successfully"}

@app.post("/login")
def login(user: UserLogin):
    users = get_user_collection()
    user_doc = users.find_one({"email": user.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(user.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Generate JWT token
    token = auth_service.generate_jwt_token(user.email)
    return {"message": "Login successful", "token": token, "email": user.email}

# Removed Google OAuth endpoint

@app.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    """Send password reset email"""
    try:
        # Check if user exists
        users = get_user_collection()
        user_doc = users.find_one({"email": request.email})
        if not user_doc:
            # Don't reveal if user exists or not for security
            return {"message": "If the email exists, a password reset link has been sent"}
        
        # Generate reset token
        reset_token = auth_service.create_password_reset_token(request.email)
        
        # Create reset URL (frontend will handle this)
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:8081")
        reset_url = f"{frontend_url}/reset-password?token={reset_token}"
        
        # Send email
        if auth_service.send_password_reset_email(request.email, reset_url):
            return {"message": "Password reset email sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send reset email")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    """Reset password using token"""
    try:
        if request.new_password != request.confirm_password:
            raise HTTPException(status_code=400, detail="Passwords do not match")
        
        if not validate_password(request.new_password):
            raise HTTPException(status_code=400, detail="Password must have at least one number and one special character")
        
        # Verify reset token
        email = auth_service.verify_password_reset_token(request.token)
        if not email:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        # Update password in database
        users = get_user_collection()
        hashed_pw = hash_password(request.new_password)
        users.update_one(
            {"email": email},
            {"$set": {"password": hashed_pw}}
        )
        
        return {"message": "Password reset successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/me")
def get_current_user_info(current_user: str = Depends(get_current_user)):
    """Get current user information"""
    users = get_user_collection()
    user_doc = users.find_one({"email": current_user})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "email": user_doc["email"],
        "name": user_doc.get("name", ""),
        "picture": user_doc.get("picture", ""),
        "oauth_provider": user_doc.get("oauth_provider", "email")
    }

# Google Sheets API endpoints
@app.get("/api/insights")
async def get_insights():
    """Get all insights data from Google Sheets"""
    try:
        data = sheets_service.get_insights_data(SPREADSHEET_ID)
        # Return partial data if available, don't fail if some sections are empty
        if data:
            return data
        else:
            raise HTTPException(status_code=404, detail="No data found")
    except HTTPException:
        # Let explicit HTTP errors propagate (e.g., 404 No data)
        raise
    except Exception as e:
        # Include last low-level error from the sheets service to aid debugging
        last_err = getattr(sheets_service, "last_error", "")
        detail = f"Error fetching insights: {str(e)}"
        if last_err:
            detail += f" | root: {last_err}"
        raise HTTPException(status_code=500, detail=detail)

@app.get("/api/insights/{data_type}")
async def get_insights_by_type(data_type: str):
    """Get specific type of insights data"""
    try:
        data = sheets_service.get_insights_data(SPREADSHEET_ID)
        if data_type not in data:
            raise HTTPException(status_code=404, detail=f"Data type '{data_type}' not found")
        return {data_type: data[data_type]}
    except HTTPException:
        raise
    except Exception as e:
        last_err = getattr(sheets_service, "last_error", "")
        detail = f"Error fetching {data_type}: {str(e)}"
        if last_err:
            detail += f" | root: {last_err}"
        raise HTTPException(status_code=500, detail=detail)

@app.get("/api/insights/raw/cgpa")
async def get_raw_cgpa_data():
    """Get raw CGPA data from Google Sheets for debugging"""
    try:
        raw_data = sheets_service.get_sheet_data(SPREADSHEET_ID, 'CGPA Data!A2:C')
        if not raw_data:
            # fallbacks to common sheet names
            for rng in ['Sheet1!A2:C', 'Sheet1!A1:C', 'Sheet1!A:C']:
                raw_data = sheets_service.get_sheet_data(SPREADSHEET_ID, rng)
                if raw_data:
                    break
        if not raw_data:
            raise HTTPException(status_code=404, detail="No raw CGPA data found")
        
        # Format raw data
        formatted_data = []
        for row in raw_data:
            if len(row) >= 2:
                try:
                    formatted_data.append({
                        'year': row[0],
                        'cgpa': float(row[1]),
                        'offers': int(row[2]) if len(row) > 2 else 1
                    })
                except (ValueError, IndexError):
                    continue
        
        return {
            'raw_cgpa_data': formatted_data,
            'total_records': len(formatted_data),
            'message': 'Raw CGPA data fetched successfully'
        }
    except HTTPException:
        raise
    except Exception as e:
        last_err = getattr(sheets_service, "last_error", "")
        detail = f"Error fetching raw CGPA data: {str(e)}"
        if last_err:
            detail += f" | root: {last_err}"
        raise HTTPException(status_code=500, detail=detail)

@app.get("/api/insights/cgpa/analysis")
async def get_cgpa_analysis():
    """Get detailed CGPA analysis with offer insights by CGPA ranges"""
    try:
        data = sheets_service.get_insights_data(SPREADSHEET_ID)
        if not data or 'cgpa_data' not in data:
            raise HTTPException(status_code=404, detail="No CGPA data found")
        
        cgpa_data = data['cgpa_data']
        cgpa_insights = data.get('cgpa_insights', {})
        
        # Format the response for better frontend consumption
        analysis_response = {
            'cgpa_ranges': cgpa_data,
            'insights': cgpa_insights,
            'summary': {
                'total_ranges': len(cgpa_data),
                'ranges_analyzed': [item['cgpa_range'] for item in cgpa_data],
                'data_quality': 'high' if len(cgpa_data) == 4 else 'partial',
                'last_updated': 'now'
            }
        }
        
        return analysis_response
        
    except HTTPException:
        raise
    except Exception as e:
        last_err = getattr(sheets_service, "last_error", "")
        detail = f"Error fetching CGPA analysis: {str(e)}"
        if last_err:
            detail += f" | root: {last_err}"
        raise HTTPException(status_code=500, detail=detail)

@app.get("/api/sheets/metadata")
async def get_sheets_metadata():
    """Get Google Sheets metadata"""
    try:
        metadata = sheets_service.get_sheet_metadata(SPREADSHEET_ID)
        return metadata
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching metadata: {str(e)}")

@app.get("/api/sheets/refresh")
async def refresh_sheets_data():
    """Force refresh of Google Sheets data"""
    try:
        # This will re-authenticate and fetch fresh data
        sheets_service._authenticate()
        data = sheets_service.get_insights_data(SPREADSHEET_ID)
        return {"message": "Data refreshed successfully", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing data: {str(e)}")

@app.get("/api/sheets/diagnostics")
async def sheets_diagnostics():
    """Return diagnostics about auth method and ranges used for insights fetching."""
    try:
        data = sheets_service.get_insights_data(SPREADSHEET_ID)
        return {
            "auth_method": getattr(sheets_service, "auth_method", "unknown"),
            "service_account_email": getattr(sheets_service, "service_account_email", ""),
            "last_used_ranges": getattr(sheets_service, "last_used_ranges", {}),
            "ranges_tried": getattr(sheets_service, "ranges_tried", {}),
            "last_error": getattr(sheets_service, "last_error", ""),
            "has_data_keys": list(data.keys()) if isinstance(data, dict) else [],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnostics error: {str(e)}")

@app.get("/api/sheets/debug/values")
async def debug_values(range: str):
    """Fetch raw values for an arbitrary range to debug access and naming issues."""
    try:
        raw = sheets_service.get_sheet_data(SPREADSHEET_ID, range)
        return {
            "range": range,
            "num_rows": len(raw),
            "first_5_rows": raw[:5],
            "note": "If num_rows is 0, either the range is wrong or the sheet has no values in that range."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Debug values error: {str(e)}")

# Chatbot RAG endpoint
@app.post("/api/chat")
async def chat_with_bot(request: dict):
    """Chat endpoint for the RAG-based placement chatbot."""
    try:
        query = request.get("query", "").strip()
        
        if not query:
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Process the query using Excel RAG service
        response = excel_rag_service.process_query(query)
        
        return {"answer": response}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")

# Streaming chat endpoint
@app.post("/api/chat/stream")
async def chat_with_bot_stream(request: dict):
    """Streaming chat endpoint for real-time responses."""
    from fastapi.responses import StreamingResponse
    import json
    
    try:
        query = request.get("query", "").strip()
        
        if not query:
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        def generate_stream():
            try:
                for chunk in excel_rag_service.process_query_stream(query):
                    yield f"data: {json.dumps({'content': chunk})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in streaming chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")

@app.get("/api/companies")
async def get_companies(sheet_number: int = 5):
    """Get companies data from Google Sheets for the company directory page."""
    try:
        # Get companies data from sheet #5 (or specified sheet)
        companies_data = companies_service.get_companies_for_frontend(sheet_number)
        
        return companies_data
        
    except Exception as e:
        logger.error(f"Error in companies endpoint: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching companies data")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 