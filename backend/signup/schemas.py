# schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    confirm_password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Removed Google OAuth request schema

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)
    confirm_password: str

class PasswordResetToken(BaseModel):
    email: EmailStr
    token: str
    expires_at: str

class SendOTPRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)

class OTPResponse(BaseModel):
    message: str
    masked_email: str
    expires_in: int  # seconds

class LoginWithOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)