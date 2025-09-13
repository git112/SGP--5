from pymongo import MongoClient
import os
from uuid import uuid4
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "govcheck_ai")
print("Connecting to MongoDB at:", MONGO_URI)
print("Using database:", DATABASE_NAME)

try:
    client = MongoClient(MONGO_URI)
    # Test the connection
    client.admin.command('ping')
    print("✅ MongoDB connection successful")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    raise

db = client[DATABASE_NAME] 


def get_user_collection():
    return db["users"]

def get_session_collection():
    return db["sessions"]

def create_session(email):
    token = str(uuid4())
    get_session_collection().insert_one({"email": email, "token": token})
    return token

def get_session(token):
    return get_session_collection().find_one({"token": token})

def delete_session(token):
    get_session_collection().delete_one({"token": token})
