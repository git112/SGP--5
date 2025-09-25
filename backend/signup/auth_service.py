import os
import jwt
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
 
import requests as http_requests

class AuthService:
    def __init__(self):
        self.secret_key = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
        # Removed Google OAuth
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        
    # Removed Google token verification
    
    def create_password_reset_token(self, email: str) -> str:
        """Create a password reset token"""
        payload = {
            'email': email,
            'type': 'password_reset',
            'exp': datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
        }
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def verify_password_reset_token(self, token: str) -> Optional[str]:
        """Verify password reset token and return email"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            if payload.get('type') != 'password_reset':
                return None
            return payload.get('email')
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def send_password_reset_email(self, email: str, reset_url: str) -> bool:
        """Send password reset email"""
        try:
            if not all([self.smtp_username, self.smtp_password]):
                print("SMTP credentials not configured")
                return False
                
            msg = MIMEMultipart()
            msg['From'] = self.smtp_username
            msg['To'] = email
            msg['Subject'] = "Password Reset Request"
            
            body = f"""
            Hello,
            
            You have requested to reset your password. Click the link below to reset it:
            
            {reset_url}
            
            This link will expire in 1 hour.
            
            If you didn't request this, please ignore this email.
            
            Best regards,
            Your App Team
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            return True
        except Exception as e:
            print(f"Failed to send password reset email: {e}")
            return False
    
    def generate_jwt_token(self, email: str) -> str:
        """Generate JWT token for user"""
        payload = {
            'email': email,
            'exp': datetime.utcnow() + timedelta(days=7)  # 7 days expiry
        }
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def verify_jwt_token(self, token: str) -> Optional[str]:
        """Verify JWT token and return email"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload.get('email')
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def send_plain_email(self, to_email: str, subject: str, body_text: str) -> bool:
        try:
            if not all([self.smtp_username, self.smtp_password]):
                print("SMTP credentials not configured")
                return False
            msg = MIMEMultipart()
            msg['From'] = self.smtp_username
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body_text, 'plain'))
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.send_message(msg)
            server.quit()
            return True
        except Exception as e:
            print(f"Failed to send email to {to_email}: {e}")
            return False