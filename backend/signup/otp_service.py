# otp_service.py
import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

class OTPService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.otp_expiry_minutes = 5  # 5 minutes as per requirements
        self.rate_limit_minutes = 5  # 1 OTP per 5 minutes as per requirements
        
        # MongoDB connection
        self.mongo_uri = os.getenv("MONGO_URI")
        self.database_name = os.getenv("DATABASE_NAME", "govcheck_ai")
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client[self.database_name]
        self.otp_collection = self.db["otp_verifications"]
        
    def generate_otp(self) -> str:
        """Generate a 6-digit numeric OTP"""
        return str(random.randint(100000, 999999))
    
    def mask_email(self, email: str) -> str:
        """Mask email for display (e.g., j***@charusat.edu.in)"""
        if '@' not in email:
            return email
        
        local_part, domain = email.split('@', 1)
        if len(local_part) <= 2:
            masked_local = local_part[0] + '*' * (len(local_part) - 1)
        else:
            masked_local = local_part[0] + '*' * (len(local_part) - 2) + local_part[-1]
        
        return f"{masked_local}@{domain}"
    
    def check_rate_limit(self, email: str) -> bool:
        """Check if user has exceeded OTP request rate limit (1 per 5 minutes)"""
        five_minutes_ago = datetime.utcnow() - timedelta(minutes=self.rate_limit_minutes)
        
        recent_attempts = self.otp_collection.count_documents({
            "email": email,
            "created_at": {"$gte": five_minutes_ago},
            "type": "otp_request"
        })
        
        return recent_attempts < 1  # Only 1 OTP per 5 minutes
    
    def store_otp(self, email: str, otp: str) -> None:
        """Store OTP in database with 5-minute expiry"""
        expiry_time = datetime.utcnow() + timedelta(minutes=self.otp_expiry_minutes)
        
        # Remove any existing OTPs for this email
        self.otp_collection.delete_many({"email": email, "type": "otp_code"})
        
        # Store new OTP
        self.otp_collection.insert_one({
            "email": email,
            "otp": otp,
            "type": "otp_code",
            "created_at": datetime.utcnow(),
            "expires_at": expiry_time,
            "verified": False
        })
        
        # Log OTP request
        self.otp_collection.insert_one({
            "email": email,
            "type": "otp_request",
            "created_at": datetime.utcnow()
        })
        
        print(f"📧 OTP stored for {email}: {otp} (expires at {expiry_time})")
    
    def send_otp_email(self, email: str, otp: str) -> bool:
        """Send OTP via email"""
        try:
            if not all([self.smtp_username, self.smtp_password]):
                print("❌ SMTP credentials not configured")
                return False
                
            msg = MIMEMultipart()
            msg['From'] = self.smtp_username
            msg['To'] = email
            msg['Subject'] = "PlaceMentor AI - Login Verification Code"
            
            body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563eb; text-align: center;">PlaceMentor AI</h2>
                    <h3 style="color: #1f2937;">Login Verification Code</h3>
                    
                    <p>Hello,</p>
                    
                    <p>You have requested to login to PlaceMentor AI. Please use the following verification code:</p>
                    
                    <div style="background-color: #f3f4f6; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #1f2937; font-size: 32px; letter-spacing: 4px; margin: 0; font-family: 'Courier New', monospace;">{otp}</h1>
                    </div>
                    
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This code will expire in {self.otp_expiry_minutes} minutes</li>
                        <li>Do not share this code with anyone</li>
                        <li>If you didn't request this verification, please ignore this email</li>
                    </ul>
                    
                    <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                        Best regards,<br>
                        PlaceMentor AI Team
                    </p>
                </div>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(body, 'html'))
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            print(f"✅ OTP email sent to {email}")
            return True
        except Exception as e:
            print(f"❌ Failed to send OTP email: {e}")
            return False
    
    def send_otp(self, email: str) -> Dict[str, Any]:
        """Send OTP to email address"""
        print(f"📧 Sending OTP to {email}")
        
        # Check rate limiting
        if not self.check_rate_limit(email):
            print(f"⏰ Rate limit exceeded for {email}")
            return {
                "success": False,
                "message": f"Please wait {self.rate_limit_minutes} minutes before requesting another OTP.",
                "retry_after": self.rate_limit_minutes * 60
            }
        
        # Generate and store OTP
        otp = self.generate_otp()
        self.store_otp(email, otp)
        
        # Send email
        if self.send_otp_email(email, otp):
            return {
                "success": True,
                "message": "OTP sent successfully",
                "masked_email": self.mask_email(email),
                "expires_in": self.otp_expiry_minutes * 60
            }
        else:
            return {
                "success": False,
                "message": "Failed to send OTP email. Please try again later."
            }
    
    def verify_otp(self, email: str, otp: str) -> Dict[str, Any]:
        """Verify OTP code"""
        print(f"🔍 Verifying OTP for {email}: {otp}")
        
        # Find the OTP record
        otp_record = self.otp_collection.find_one({
            "email": email,
            "type": "otp_code",
            "verified": False
        })
        
        if not otp_record:
            print(f"❌ No OTP found for {email}")
            return {
                "success": False,
                "message": "No OTP found for this email. Please request a new OTP."
            }
        
        # Check if OTP has expired
        current_time = datetime.utcnow()
        expires_at = otp_record["expires_at"]
        
        if current_time > expires_at:
            # Clean up expired OTP
            self.otp_collection.delete_one({"_id": otp_record["_id"]})
            print(f"⏰ OTP expired for {email}")
            return {
                "success": False,
                "message": "OTP has expired. Please request a new OTP."
            }
        
        # Verify OTP
        stored_otp = otp_record["otp"]
        if stored_otp == otp:
            # Mark as verified
            self.otp_collection.update_one(
                {"_id": otp_record["_id"]},
                {"$set": {"verified": True, "verified_at": datetime.utcnow()}}
            )
            
            # Log successful verification
            self.otp_collection.insert_one({
                "email": email,
                "type": "otp_verification_success",
                "created_at": datetime.utcnow()
            })
            
            print(f"✅ OTP verified successfully for {email}")
            return {
                "success": True,
                "message": "OTP verified successfully"
            }
        else:
            # Log failed verification attempt
            self.otp_collection.insert_one({
                "email": email,
                "type": "otp_verification_failed",
                "created_at": datetime.utcnow()
            })
            
            print(f"❌ Invalid OTP for {email}: stored='{stored_otp}', provided='{otp}'")
            return {
                "success": False,
                "message": "Invalid OTP. Please check and try again."
            }
    
    def cleanup_expired_otps(self):
        """Clean up expired OTPs from database"""
        result = self.otp_collection.delete_many({
            "expires_at": {"$lt": datetime.utcnow()},
            "type": "otp_code"
        })
        print(f"🧹 Cleaned up {result.deleted_count} expired OTPs")
    
    def get_otp_stats(self, email: str) -> Dict[str, Any]:
        """Get OTP statistics for monitoring"""
        five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)
        
        stats = {
            "requests_last_5_minutes": self.otp_collection.count_documents({
                "email": email,
                "created_at": {"$gte": five_minutes_ago},
                "type": "otp_request"
            }),
            "failed_attempts_last_5_minutes": self.otp_collection.count_documents({
                "email": email,
                "created_at": {"$gte": five_minutes_ago},
                "type": "otp_verification_failed"
            }),
            "successful_verifications_last_5_minutes": self.otp_collection.count_documents({
                "email": email,
                "created_at": {"$gte": five_minutes_ago},
                "type": "otp_verification_success"
            })
        }
        
        return stats
