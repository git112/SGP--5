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
