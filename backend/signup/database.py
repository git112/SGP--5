from pymongo import MongoClient
import os
from uuid import uuid4

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["placementor-ai"] 


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
