# schemas.py
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    confirm_password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
