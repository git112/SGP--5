# main.py
from fastapi import FastAPI, HTTPException
from schemas import UserCreate, UserLogin
from utils import (
    validate_email_domain,
    validate_password,
    hash_password,
    verify_password
)
from database import fake_db

app = FastAPI()

@app.post("/signup")
def signup(user: UserCreate):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    if not validate_email_domain(user.email):
        raise HTTPException(status_code=400, detail="Only IT department emails allowed")

    if not validate_password(user.password):
        raise HTTPException(status_code=400, detail="Password must have at least one number and one special character")

    if user.email in fake_db:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pw = hash_password(user.password)
    fake_db[user.email] = hashed_pw

    return {"message": "User registered successfully"}

@app.post("/login")
def login(user: UserLogin):
    if user.email not in fake_db:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    hashed_pw = fake_db[user.email]
    if not verify_password(user.password, hashed_pw):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"message": "Login successful"}
