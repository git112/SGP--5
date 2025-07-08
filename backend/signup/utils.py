# utils.py
import re
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def validate_email_domain(email: str) -> bool:
    # Matches: abcitxyz@charusat.edu.in or abc.it@charusat.ac.in
    pattern1 = r'^[\w\d]*it[\w\d]*@charusat\.edu\.in$'
    pattern2 = r'^[\w\d]+\.it@charusat\.ac\.in$'
    return bool(re.match(pattern1, email) or re.match(pattern2, email))

def validate_password(password: str) -> bool:
    return bool(
        re.search(r'[!@#$%^&*(),.?":{}|<>]', password) and
        re.search(r'\d', password)
    )

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
