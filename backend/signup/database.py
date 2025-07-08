from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["placementor-ai"] 


def get_user_collection():
    return db["users"]
