# Simple Email OTP Verification Implementation

This document describes the implementation of a simplified email OTP verification system for the PlaceMentor AI placement website.

## Overview

The system now uses **email-only OTP verification** for login. Users only need to enter their CHARUSAT email address, and the system will send a 6-digit OTP for verification.

## ✅ Requirements Implemented

### **Email Domain Validation**
- **Accepts**: Any email ending with `@charusat.edu.in` or `@charusat.ac.in`
- **Rejects**: All other domains immediately

### **OTP Generation & Verification**
- **6-digit numeric OTP** generation
- **5-minute expiry** time
- **Email delivery** via SMTP
- **Secure storage** in MongoDB

### **Rate Limiting**
- **1 OTP per 5 minutes** per email address
- **Prevents abuse** and spam

### **Security Features**
- **Email masking** in confirmation messages (e.g., `j***@charusat.edu.in`)
- **Comprehensive logging** of all OTP attempts
- **Automatic cleanup** of expired OTPs
- **Input validation** and sanitization

## 🔄 User Flow

### **Login Flow**
1. **Enter Email**: User enters their CHARUSAT email address
2. **Send OTP**: System sends 6-digit OTP to their email
3. **Enter OTP**: User enters the OTP code
4. **Verify & Login**: System verifies OTP and logs user in
5. **Access Granted**: User gets JWT token for authenticated session

### **Signup Flow**
1. **Enter Email & Password**: User enters CHARUSAT email and password
2. **Send OTP**: System sends 6-digit OTP to their email
3. **Enter OTP**: User enters the OTP code
4. **Complete Registration**: System verifies OTP and creates account
5. **Account Created**: User can now login with email and password

## 🛠️ Backend Implementation

### **New Files Created**
- `backend/signup/otp_service.py` - Core OTP service
- `backend/test_otp_simple.py` - Test script

### **Modified Files**
- `backend/signup/schemas.py` - Added OTP request/response models
- `backend/signup/utils.py` - Updated email validation patterns
- `backend/main.py` - Added OTP endpoints

### **API Endpoints**

#### 1. Send OTP
```http
POST /send-otp
Content-Type: application/json

{
  "email": "user@charusat.edu.in"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "masked_email": "u***@charusat.edu.in",
  "expires_in": 300
}
```

#### 2. Verify OTP
```http
POST /verify-otp
Content-Type: application/json

{
  "email": "user@charusat.edu.in",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "verified": true
}
```

#### 3. Login with OTP
```http
POST /login-with-otp
Content-Type: application/json

{
  "email": "user@charusat.edu.in",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "email": "user@charusat.edu.in",
  "user_type": "student"
}
```

#### 4. Signup (Send OTP)
```http
POST /signup
Content-Type: application/json

{
  "email": "user@charusat.edu.in",
  "password": "password123",
  "confirm_password": "password123"
}
```

**Response:**
```json
{
  "message": "OTP sent to your email for verification. Please verify your email to complete registration.",
  "masked_email": "u***@charusat.edu.in",
  "expires_in": 300
}
```

#### 5. Verify Signup
```http
POST /verify-signup
Content-Type: application/json

{
  "email": "user@charusat.edu.in",
  "password": "password123",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Account created successfully! You can now login with your email and password.",
  "user_type": "student"
}
```

## 🎨 Frontend Implementation

### **Updated Components**
- `LoginModal.tsx` - Added OTP verification UI
- `AuthContext.tsx` - Added OTP methods
- `emailValidation.ts` - Updated email patterns

### **New UI Features**
- **OTP Verification Modal** with countdown timer
- **Resend OTP** functionality
- **Real-time validation** and feedback
- **Email masking** in success messages
- **Rate limiting** feedback

## 🔧 Configuration

### **Environment Variables**
Add these to your `.env` file:

```env
# OTP Configuration
OTP_EXPIRY_MINUTES=5
MAX_OTP_ATTEMPTS_PER_HOUR=12  # 1 per 5 minutes = 12 per hour

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Database
MONGO_URI=your-mongodb-connection-string
DATABASE_NAME=govcheck_ai
```

## 🧪 Testing

### **Manual Testing**
1. **Start the backend server**:
   ```bash
   cd backend
   python -m uvicorn main:app --reload
   ```

2. **Test the OTP flow**:
   ```bash
   python test_otp_simple.py
   ```

3. **Test via frontend**:
   - Open the login modal
   - Enter a CHARUSAT email
   - Click "Send OTP"
   - Enter the OTP from your email
   - Click "Verify & Login"

### **Test Scenarios**
- ✅ Valid email OTP flow (login)
- ✅ Valid email OTP flow (signup)
- ✅ Invalid email rejection
- ✅ Rate limiting (1 request per 5 minutes)
- ✅ OTP expiry handling (5 minutes)
- ✅ Invalid OTP rejection
- ✅ Resend OTP functionality
- ✅ Signup verification flow

## 📊 Database Schema

### **OTP Collection (`otp_verifications`)**
```javascript
{
  "_id": ObjectId,
  "email": "user@charusat.edu.in",
  "otp": "123456",
  "type": "otp_code", // or "otp_request", "otp_verification_success", etc.
  "created_at": ISODate,
  "expires_at": ISODate,
  "verified": false,
  "verified_at": ISODate // only for verified OTPs
}
```

## 🔒 Security Features

1. **Rate Limiting**: 1 OTP per 5 minutes per email
2. **OTP Expiry**: 5-minute window prevents replay attacks
3. **Email Validation**: Only CHARUSAT domains accepted
4. **Secure Storage**: OTPs stored with expiry timestamps
5. **Logging**: All attempts logged for monitoring
6. **Cleanup**: Expired OTPs automatically removed
7. **Email Masking**: Privacy protection in UI

## 📝 Logging

The system logs:
- OTP generation attempts
- Successful verifications
- Failed verification attempts
- Rate limit violations
- Email delivery status

## 🚀 Deployment

### **Backend**
1. Install dependencies: `pip install -r requirements.txt`
2. Set environment variables
3. Start server: `python -m uvicorn main:app --reload`

### **Frontend**
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`

## 🐛 Troubleshooting

### **Common Issues**

1. **OTP not received**
   - Check SMTP credentials
   - Verify email address format
   - Check spam folder

2. **Rate limiting**
   - Wait 5 minutes or use different email
   - Check logs for abuse patterns

3. **Invalid OTP errors**
   - Ensure 6-digit numeric input
   - Check OTP hasn't expired
   - Verify correct email address

### **Debug Commands**

```bash
# Check OTP collection
mongo your-db-name
db.otp_verifications.find().sort({created_at: -1}).limit(10)

# Check rate limiting
db.otp_verifications.find({type: "otp_request", created_at: {$gte: new Date(Date.now() - 300000)}}).count()
```

## 📈 Monitoring

### **Key Metrics**
- OTP send success rate
- Verification success rate
- Rate limit violations
- Email delivery failures
- User login patterns

### **Alerts**
- High rate limit violations
- Email delivery failures
- Unusual login patterns

## 🔄 Future Enhancements

- [ ] SMS OTP as backup
- [ ] Email templates customization
- [ ] Admin dashboard for monitoring
- [ ] OTP analytics and reporting
- [ ] Multi-language support
- [ ] Remember device functionality

## 📋 Summary

The simplified OTP verification system provides:

✅ **Email-only authentication** (login with OTP only)  
✅ **OTP-verified signup** (signup requires OTP verification)  
✅ **CHARUSAT domain validation** (@charusat.edu.in and @charusat.ac.in)  
✅ **5-minute OTP expiry** for security  
✅ **Rate limiting** (1 OTP per 5 minutes)  
✅ **Comprehensive logging** for monitoring  
✅ **Email masking** for privacy  
✅ **User-friendly UI** with countdown timer  
✅ **Secure account creation** with email verification  

This implementation meets all the specified requirements and provides a secure, user-friendly authentication system for CHARUSAT students and faculty. Both login and signup now require OTP verification for enhanced security.
