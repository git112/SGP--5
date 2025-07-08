from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from signup.schemas import UserCreate, UserLogin
from signup.utils import (
    validate_email_domain,
    validate_password,
    hash_password,
    verify_password
)
from signup.database import get_user_collection

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

    return {"message": "Login successful"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 