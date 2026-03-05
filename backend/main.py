import os
import httpx
import json
import logging
import shutil
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

from sse_starlette.sse import EventSourceResponse
from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from dotenv import load_dotenv
from bson.objectid import ObjectId

RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL", "http://localhost:8001")

# Load environment from backend/.env regardless of CWD
_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=_ENV_PATH)

from signup.schemas import UserCreate, UserLogin, ForgotPasswordRequest, ResetPasswordRequest, SendOTPRequest, VerifyOTPRequest, OTPResponse, LoginWithOTPRequest, ResetPasswordWithOTPRequest
from signup.utils import (
    validate_email_domain,
    validate_password,
    hash_password,
    verify_password,
    get_user_type
)
from signup.database import get_user_collection, db
from signup.auth_service import AuthService
from signup.otp_service import OTPService

from sheets_service import sheets_service
from companies_sheets_service import CompaniesSheetsService
from interview_api import router as interview_router
from interview_api import resume_router

# Initialize auth service
auth_service = AuthService()

# Initialize OTP service
otp_service = OTPService()

# Initialize Companies Sheets service
companies_service = CompaniesSheetsService()


app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://placementor-ai-two.vercel.app",
        "http://localhost:8080",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount competency test API (interview endpoints, Python port of Node service)
app.include_router(interview_router)
app.include_router(resume_router)

# Configure logging
logger = logging.getLogger(__name__)

# Global Exception Handler for 500 Errors
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    import traceback
    error_details = traceback.format_exc()
    logger.error(f"Global 500 Error: {str(exc)}\n{error_details}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)}
    )

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
        raise HTTPException(status_code=400, detail="Please use your official Charusat email ID.")

    if not validate_password(user.password):
        raise HTTPException(status_code=400, detail="Password must have at least one number and one special character")

    users = get_user_collection()
    if users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="User already exists")

    # Send OTP for email verification (except dummy admin)
    DUMMY_ADMIN = "abc.it@charusat.ac.in"
    if user.email.lower() == DUMMY_ADMIN:
        # Create or update dummy admin immediately without OTP
        hashed_pw = hash_password(user.password)
        users.update_one(
            {"email": user.email},
            {"$set": {
                "email": user.email,
                "password": hashed_pw,
                "user_type": "faculty",
                "otp_verified": True,
                "created_at": datetime.utcnow()
            }},
            upsert=True
        )
        return OTPResponse(
            message="Dummy admin account created. You can login now without OTP.",
            masked_email=user.email[:2] + "***" + user.email[-10:],
            expires_in=0
        )
    result = otp_service.send_otp(user.email)
    
    if result["success"]:
        return OTPResponse(
            message="OTP sent to your email for verification. Please verify your email to complete registration.",
            masked_email=result["masked_email"],
            expires_in=result["expires_in"]
        )
    else:
        if "retry_after" in result:
            raise HTTPException(
                status_code=429, 
                detail=result["message"],
                headers={"Retry-After": str(result["retry_after"])}
            )
        else:
            raise HTTPException(status_code=500, detail=result["message"])

@app.post("/verify-signup")
def verify_signup(request: dict):
    """Verify OTP and complete user registration"""
    try:
        email = request.get("email")
        password = request.get("password")
        otp = request.get("otp")
        
        if not all([email, password, otp]):
            raise HTTPException(status_code=400, detail="Email, password, and OTP are required")
        
        # Validate email format first
        if not validate_email_domain(email):
            raise HTTPException(status_code=400, detail="Please use your official Charusat email ID.")
        
        # Verify OTP first
        otp_result = otp_service.verify_otp(email, otp)
        if not otp_result["success"]:
            raise HTTPException(status_code=400, detail=otp_result["message"])
        
        # Check if user still exists (in case they tried to signup again)
        users = get_user_collection()
        if users.find_one({"email": email}):
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Validate password
        if not validate_password(password):
            raise HTTPException(status_code=400, detail="Password must have at least one number and one special character")
        
        # Create user account
        hashed_pw = hash_password(password)
        user_type = get_user_type(email)
        
        users.insert_one({
            "email": email, 
            "password": hashed_pw,
            "user_type": user_type,
            "otp_verified": True,
            "created_at": datetime.utcnow()
        })
        
        print(f"✅ New user registered: {email}")
        
        return {
            "message": "Account created successfully! You can now login with your email and password.",
            "user_type": user_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in signup verification: {str(e)}")

@app.post("/login")
def login(user: UserLogin):
    # Validate email format first
    if not validate_email_domain(user.email):
        raise HTTPException(status_code=400, detail="Please use your official Charusat email ID.")
    
    # Direct login for the single dummy admin only (no OTP, no password check)
    DUMMY_ADMIN = "abc.it@charusat.ac.in"
    if user.email.lower() == DUMMY_ADMIN:
        users = get_user_collection()
        user_doc = users.find_one({"email": user.email})
        if not user_doc:
            # Create the dummy admin user if it doesn't exist
            users.insert_one({
                "email": user.email,
                "user_type": "faculty",
                "otp_verified": True,
                "created_at": datetime.utcnow()
            })
        else:
            users.update_one({"email": user.email}, {"$set": {"last_login": datetime.utcnow(), "otp_verified": True}})
        token = auth_service.generate_jwt_token(user.email)
        return {"message": "Login successful", "token": token, "email": user.email, "user_type": "faculty"}

    users = get_user_collection()
    user_doc = users.find_one({"email": user.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(user.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Generate JWT token
    token = auth_service.generate_jwt_token(user.email)
    user_type = user_doc.get("user_type", get_user_type(user.email))
    return {"message": "Login successful", "token": token, "email": user.email, "user_type": user_type}

@app.post("/send-otp")
def send_otp(request: SendOTPRequest):
    """Send OTP to user's email for login verification"""
    try:
        # Validate email format first
        if not validate_email_domain(request.email):
            raise HTTPException(status_code=400, detail="Please use your official Charusat email ID.")
        
        # Send OTP
        result = otp_service.send_otp(request.email)
        
        if result["success"]:
            return OTPResponse(
                message=result["message"],
                masked_email=result["masked_email"],
                expires_in=result["expires_in"]
            )
        else:
            if "retry_after" in result:
                raise HTTPException(
                    status_code=429, 
                    detail=result["message"],
                    headers={"Retry-After": str(result["retry_after"])}
                )
            else:
                raise HTTPException(status_code=500, detail=result["message"])
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending OTP: {str(e)}")

@app.post("/verify-otp")
def verify_otp(request: VerifyOTPRequest):
    """Verify OTP code"""
    try:
        # Validate email format first
        if not validate_email_domain(request.email):
            raise HTTPException(status_code=400, detail="Please use your official Charusat email ID.")
        
        # Verify OTP
        result = otp_service.verify_otp(request.email, request.otp)
        
        if result["success"]:
            return {"message": result["message"], "verified": True}
        else:
            raise HTTPException(status_code=400, detail=result["message"])
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verifying OTP: {str(e)}")

@app.post("/login-with-otp")
def login_with_otp(request: LoginWithOTPRequest):
    """Login using email and OTP (no password required)"""
    try:
        # Validate email format first
        if not validate_email_domain(request.email):
            raise HTTPException(status_code=400, detail="Please use your official Charusat email ID.")
        
        # For the dummy admin, force direct login only, not OTP login
        DUMMY_ADMIN = "abc.it@charusat.ac.in"
        if request.email.lower() == DUMMY_ADMIN:
            raise HTTPException(status_code=400, detail="Use normal login for the dummy admin account (no OTP needed)")

        # Verify OTP for all others
        otp_result = otp_service.verify_otp(request.email, request.otp)
        if not otp_result["success"]:
            raise HTTPException(status_code=400, detail=otp_result["message"])
        
        # Check if user exists, if not create them
        users = get_user_collection()
        user_doc = users.find_one({"email": request.email})
        
        if not user_doc:
            # Create new user with OTP verification
            user_type = get_user_type(request.email)
            users.insert_one({
                "email": request.email,
                "user_type": user_type,
                "otp_verified": True,
                "created_at": datetime.utcnow()
            })
            print(f"✅ New user created: {request.email}")
        else:
            # Update existing user
            users.update_one(
                {"email": request.email},
                {"$set": {"otp_verified": True, "last_login": datetime.utcnow()}}
            )
            print(f"✅ Existing user verified: {request.email}")

        # Generate JWT token
        token = auth_service.generate_jwt_token(request.email)
        user_type = user_doc.get("user_type", get_user_type(request.email)) if user_doc else get_user_type(request.email)
        
        return {
            "message": "Login successful", 
            "token": token, 
            "email": request.email, 
            "user_type": user_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in OTP login: {str(e)}")

# Removed Google OAuth endpoint

@app.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    """Send password reset email"""
    try:
        # Validate email format first
        if not validate_email_domain(request.email):
            raise HTTPException(status_code=400, detail="Please use your official Charusat email ID.")
        
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

@app.post("/reset-password-with-otp")
def reset_password_with_otp(request: ResetPasswordWithOTPRequest):
    """Reset password using an email + OTP flow (no token links)."""
    try:
        if request.new_password != request.confirm_password:
            raise HTTPException(status_code=400, detail="Passwords do not match")

        if not validate_password(request.new_password):
            raise HTTPException(status_code=400, detail="Password must have at least one number and one special character")

        # Validate email format first
        if not validate_email_domain(request.email):
            raise HTTPException(status_code=400, detail="Please use your official Charusat email ID.")

        # Verify OTP
        result = otp_service.verify_otp(request.email, request.otp)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])

        # Update password in database
        users = get_user_collection()
        user_doc = users.find_one({"email": request.email})
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")

        hashed_pw = hash_password(request.new_password)
        users.update_one(
            {"email": request.email},
            {"$set": {"password": hashed_pw}}
        )

        return {"message": "Password reset successfully"}
    except HTTPException:
        raise
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
        "oauth_provider": user_doc.get("oauth_provider", "email"),
        "user_type": user_doc.get("user_type", get_user_type(user_doc["email"]))
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
@app.post("/chat")
async def chat_with_bot(request: dict):
    """
    Chat endpoint. Forwards the query to the separate RAG service.
    Supports both streaming and synchronous modes.
    """
    try:
        query = request.get("query", "").strip()
        stream = request.get("stream", False)
        
        if not query:
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        if stream:
            return await chat_with_bot_stream(request)
            
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{RAG_SERVICE_URL}/chat",
                json={"query": query, "stream": False}
            )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.json().get("detail"))
            
        return response.json()
        
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Chatbot service is unavailable.")
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Route alias to match frontend path
@app.post("/api/chat")
async def api_chat(request: dict):
    return await chat_with_bot(request)


@app.post("/chat/stream")
async def chat_with_bot_stream(request: dict):
    """
    Streaming chat endpoint. Forwards to the RAG service stream.
    """
    try:
        query = request.get("query", "").strip()
        if not query:
            raise HTTPException(status_code=400, detail="Query cannot be empty")

        async def stream_forwarder():
            try:
                async with httpx.AsyncClient(timeout=120.0) as client:
                    async with client.stream(
                        "POST",
                        f"{RAG_SERVICE_URL}/chat/stream",
                        json={"query": query}
                    ) as response:
                        if response.status_code != 200:
                             # Yield a single error chunk
                             error_detail = response.json().get("detail", "Unknown error from RAG service")
                             yield f"data: {json.dumps({'error': error_detail})}\n\n"
                        else:
                            async for chunk in response.aiter_bytes():
                                yield chunk
            except httpx.ConnectError:
                yield f"data: {json.dumps({'error': 'Chatbot service is unavailable.'})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return EventSourceResponse(stream_forwarder())
        
    except Exception as e:
        logger.error(f"Error in streaming chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")

# Route alias to match frontend path
@app.post("/api/chat/stream")
async def api_chat_stream(request: dict):
    return await chat_with_bot_stream(request)

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

# Announcements endpoints
@app.post("/api/announcements")
async def create_announcement(payload: dict, current_user: str = Depends(get_current_user)):
    try:
        users = db["users"]
        user_doc = users.find_one({"email": current_user})
        user_type = user_doc.get("user_type") if user_doc else None
        if user_type != "faculty":
            raise HTTPException(status_code=403, detail="Only admin can create announcements")

        required = ["company", "location", "role", "package", "date"]
        if not all(k in payload and str(payload[k]).strip() for k in required):
            raise HTTPException(status_code=400, detail="Missing required fields")

        announcement = {
            "company": payload.get("company"),
            "location": payload.get("location"),
            "role": payload.get("role"),
            "package": payload.get("package"),
            "date": payload.get("date"),
            "instructions": payload.get("instructions", ""),
            "created_at": datetime.utcnow(),
        }
        result = db["announcements"].insert_one(announcement)
        announcement["_id"] = str(result.inserted_id)
        return announcement
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating announcement: {str(e)}")

@app.get("/api/announcements")
async def list_announcements(sort: str = "newest"):
    try:
        sort_key = ("created_at", -1) if sort == "newest" else ("created_at", 1)
        docs = list(db["announcements"].find({}).sort([sort_key]))
        for d in docs:
            d["_id"] = str(d["_id"])
        return docs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching announcements: {str(e)}")

@app.post("/api/announcements/send-email")
async def send_announcement_email(payload: dict, current_user: str = Depends(get_current_user)):
    try:
        users = db["users"]
        user_doc = users.find_one({"email": current_user})
        user_type = user_doc.get("user_type") if user_doc else None
        if user_type != "faculty":
            raise HTTPException(status_code=403, detail="Only admin can send emails")

        import re
        emails = payload.get("emails", [])
        if isinstance(emails, str):
            # split on commas, semicolons, whitespace or newlines
            emails = re.split(r"[\s,;]+", emails)
        # normalize and validate
        emails = [e.strip() for e in emails if e and isinstance(e, str)]
        email_re = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
        invalid = [e for e in emails if not email_re.match(e)]
        emails = [e for e in emails if email_re.match(e)]
        if not emails:
            raise HTTPException(status_code=400, detail=f"No valid recipient emails provided. Invalid: {invalid[:5]}")

        company = payload.get("company", "")
        location = payload.get("location", "")
        role = payload.get("role", "")
        package = payload.get("package", "")
        date = payload.get("date", "")

        subject = f"\ud83d\udce3 Upcoming Company Announcement \u2013 {company}" if company else "\ud83d\udce3 Upcoming Company Announcement"
        body = (
            "Dear Student,\n\n"
            "Please note the details of the upcoming placement drive:\n\n"
            f"Company: {company}\n"
            f"Location: {location}\n"
            f"Role: {role}\n"
            f"CTC: {package}\n"
            f"Date: {date}\n\n"
            "Please be prepared accordingly.\n\n"
            "Regards,\nPlacement Cell"
        )

        # Use bulk send via BCC for reliability and speed
        bulk_result = auth_service.send_bulk_email(emails, subject, body)
        return {"sent": bulk_result.get("sent", 0), "failed": bulk_result.get("failed", []), "invalid": invalid, "error": bulk_result.get("error")}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending announcement email: {str(e)}")

@app.delete("/api/announcements/{announcement_id}")
async def delete_announcement(announcement_id: str, current_user: str = Depends(get_current_user)):
    try:
        users = db["users"]
        user_doc = users.find_one({"email": current_user})
        user_type = user_doc.get("user_type") if user_doc else None
        if user_type != "faculty":
            raise HTTPException(status_code=403, detail="Only admin can delete announcements")

        try:
            _id = ObjectId(announcement_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid announcement id")

        res = db["announcements"].delete_one({"_id": _id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Announcement not found")
        return {"deleted": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting announcement: {str(e)}")

# Test email endpoint
@app.post("/api/test-email")
async def test_email(payload: dict):
    try:
        test_email = payload.get("email", "test@example.com")
        result = auth_service.send_plain_email(
            test_email, 
            "📣 Test Email from PlaceMentor AI", 
            "This is a test email to verify email functionality is working correctly.\n\nRegards,\nPlaceMentor AI Team"
        )
        return {"success": result, "message": "Test email sent" if result else "Failed to send test email"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending test email: {str(e)}")

@app.post("/api/admin/upload")
async def upload_admin_sheet(
    file: UploadFile = File(...),
    type: str = Form(...),
    year: Optional[str] = Form(None),
    current_user: str = Depends(get_current_user)
):
    """
    Upload a sheet for Insights, Companies, or Chatbot.
    - Insights/Companies: Appends data to Google Sheets.
    - Chatbot: Saves file to chatbot/data and triggers reload.
    """
    # Verify admin access
    users = get_user_collection()
    user_doc = users.find_one({"email": current_user})
    if not user_doc or user_doc.get("user_type") != "faculty":
         raise HTTPException(status_code=403, detail="Only admin can upload sheets")

    try:
        if type == "chatbot":
            # Save to chatbot/data
            chatbot_data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../chatbot/data"))
            os.makedirs(chatbot_data_dir, exist_ok=True)
            
            file_path = os.path.join(chatbot_data_dir, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Trigger reload
            async with httpx.AsyncClient() as client:
                try:
                    resp = await client.post(f"{RAG_SERVICE_URL}/reload", timeout=60.0)
                    if resp.status_code != 200:
                        return {"message": "File uploaded but chatbot reload failed", "details": resp.text}
                except Exception as e:
                     return {"message": "File uploaded but chatbot reload failed", "details": str(e)}
            
            return {"message": f"File uploaded and chatbot reloaded successfully. Saved to {file.filename}"}

        elif type in ["insights", "companies"]:
            # Read file using pandas
            contents = await file.read()
            if file.filename.endswith('.xlsx') or file.filename.endswith('.xls'):
                try:
                    df = pd.read_excel(contents)
                except Exception:
                    # Fallback for engine issues
                    import io
                    df = pd.read_excel(io.BytesIO(contents))
            elif file.filename.endswith('.csv'):
                import io
                df = pd.read_csv(io.BytesIO(contents))
            else:
                raise HTTPException(status_code=400, detail="Invalid file format. Please upload Excel or CSV.")
            
            # Add Year column if provided and missing
            if year and 'year' not in df.columns.str.lower():
                df['Year'] = year
            
            # Convert to list of lists
            # Handle NaN/Inf
            df = df.fillna('')
            values = df.values.tolist()
            
            # Determine target sheet
            target_sheet_name = "Sheet1" # Default
            all_sheets = sheets_service.get_all_sheet_names()
            
            if type == "companies":
                match = next((s for s in all_sheets if "company" in s.lower() or "companies" in s.lower()), None)
                if match: target_sheet_name = match
            elif type == "insights":
                match = next((s for s in all_sheets if "placement" in s.lower() or "data" in s.lower()), None)
                if match: target_sheet_name = match

            sheets_service.append_sheet_data(SPREADSHEET_ID, f"{target_sheet_name}!A1", values)
            
            return {"message": f"Successfully appended {len(values)} rows to {target_sheet_name}"}

        else:
            raise HTTPException(status_code=400, detail="Invalid upload type")

    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 