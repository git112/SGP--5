# utils.py
import re
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def validate_email_domain(email: str) -> bool:
    """
    Validate Charusat email formats:
    - Accept any email ending with @charusat.edu.in or @charusat.ac.in
    """
    # General pattern: any email ending with @charusat.edu.in or @charusat.ac.in
    general_pattern = r'^.+@charusat\.(edu|ac)\.in$'
    
    return bool(re.match(general_pattern, email))

def get_user_type(email: str) -> str:
    """
    Identify user type based on email structure
    Returns: 'student', 'd2d_student', or 'faculty'
    """
    student_pattern = r'^(2[1-5])it\d{3}@charusat\.edu\.in$'
    d2d_pattern = r'^d(2[1-5])it\d{3}@charusat\.edu\.in$'
    faculty_pattern = r'^[a-zA-Z0-9_]+\.it@charusat\.ac\.in$'
    
    if re.match(student_pattern, email):
        return 'student'
    elif re.match(d2d_pattern, email):
        return 'd2d_student'
    elif re.match(faculty_pattern, email):
        return 'faculty'
    else:
        return 'unknown'

def validate_password(password: str) -> bool:
    return bool(
        re.search(r'[!@#$%^&*(),.?":{}|<>]', password) and
        re.search(r'\d', password)
    )

def hash_password(password: str) -> str:
    # Explicitly truncate to 72 bytes for bcrypt compatibility
    return pwd_context.hash(password[:72])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Explicitly truncate to 72 bytes for bcrypt compatibility
    return pwd_context.verify(plain_password[:72], hashed_password)
