#!/usr/bin/env python3
"""
Simple test script for OTP functionality
Run this after starting the backend server to test OTP endpoints
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "test@charusat.edu.in"  # Replace with a valid test email

def test_otp_flow():
    print("🧪 Testing Simple OTP Flow for PlaceMentor AI")
    print("=" * 60)
    
    # Test 1: Send OTP for Login
    print("\n1. Testing send OTP for login...")
    try:
        response = requests.post(f"{BASE_URL}/send-otp", json={"email": TEST_EMAIL})
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ OTP sent successfully!")
            print(f"   Message: {data['message']}")
            print(f"   Masked Email: {data['masked_email']}")
            print(f"   Expires in: {data['expires_in']} seconds")
            
            # In a real test, you would check the email for the OTP
            # For this test, we'll simulate entering an OTP
            test_otp = input("\nEnter the OTP you received in your email: ").strip()
            
            # Test 2: Login with OTP
            print("\n2. Testing login with OTP...")
            login_response = requests.post(f"{BASE_URL}/login-with-otp", json={
                "email": TEST_EMAIL,
                "otp": test_otp
            })
            print(f"Status: {login_response.status_code}")
            
            if login_response.status_code == 200:
                login_data = login_response.json()
                print(f"✅ Login successful!")
                print(f"   Message: {login_data['message']}")
                print(f"   Email: {login_data['email']}")
                print(f"   User Type: {login_data['user_type']}")
                print(f"   Token: {login_data['token'][:50]}...")
            else:
                error_data = login_response.json()
                print(f"❌ Login failed: {error_data.get('detail', 'Unknown error')}")
                
        else:
            error_data = response.json()
            print(f"❌ Send OTP failed: {error_data.get('detail', 'Unknown error')}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server. Make sure it's running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_signup_otp_flow():
    print("\n" + "=" * 60)
    print("3. Testing signup OTP flow...")
    
    # Use a different email for signup testing
    signup_email = "newuser@charusat.edu.in"
    signup_password = "TestPass123!"
    
    try:
        # Test 1: Start signup process
        print(f"Starting signup for: {signup_email}")
        signup_response = requests.post(f"{BASE_URL}/signup", json={
            "email": signup_email,
            "password": signup_password,
            "confirm_password": signup_password
        })
        print(f"Signup status: {signup_response.status_code}")
        
        if signup_response.status_code == 200:
            signup_data = signup_response.json()
            print(f"✅ Signup OTP sent successfully!")
            print(f"   Message: {signup_data['message']}")
            print(f"   Masked Email: {signup_data['masked_email']}")
            print(f"   Expires in: {signup_data['expires_in']} seconds")
            
            # Get OTP from user
            signup_otp = input(f"\nEnter the signup OTP for {signup_email}: ").strip()
            
            # Test 2: Verify signup with OTP
            print("\nVerifying signup with OTP...")
            verify_response = requests.post(f"{BASE_URL}/verify-signup", json={
                "email": signup_email,
                "password": signup_password,
                "otp": signup_otp
            })
            print(f"Verify status: {verify_response.status_code}")
            
            if verify_response.status_code == 200:
                verify_data = verify_response.json()
                print(f"✅ Signup completed successfully!")
                print(f"   Message: {verify_data['message']}")
                print(f"   User Type: {verify_data['user_type']}")
            else:
                error_data = verify_response.json()
                print(f"❌ Signup verification failed: {error_data.get('detail', 'Unknown error')}")
                
        else:
            error_data = signup_response.json()
            print(f"❌ Signup failed: {error_data.get('detail', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Signup test error: {e}")

def test_rate_limiting():
    print("\n" + "=" * 60)
    print("4. Testing rate limiting (1 OTP per 5 minutes)...")
    
    # Send multiple OTP requests quickly to test rate limiting
    for i in range(3):  # Try 3 requests (limit is 1 per 5 minutes)
        try:
            response = requests.post(f"{BASE_URL}/send-otp", json={"email": TEST_EMAIL})
            print(f"Request {i+1}: Status {response.status_code}")
            
            if response.status_code == 429:
                print("✅ Rate limiting working correctly!")
                break
            elif response.status_code == 200:
                print("   OTP sent successfully")
            else:
                print(f"   Error: {response.json().get('detail', 'Unknown error')}")
                
        except Exception as e:
            print(f"   Error: {e}")
            
        time.sleep(1)  # Small delay between requests

def test_invalid_email():
    print("\n" + "=" * 60)
    print("5. Testing invalid email rejection...")
    
    invalid_emails = [
        "invalid@example.com",
        "test@charusat.com",  # Wrong domain
        "notanemail",
        "test@charusat.edu.in"  # This should work
    ]
    
    for email in invalid_emails:
        try:
            response = requests.post(f"{BASE_URL}/send-otp", json={"email": email})
            if response.status_code == 200:
                print(f"✅ {email} - Accepted (valid)")
            else:
                error_data = response.json()
                print(f"❌ {email} - Rejected: {error_data.get('detail', 'Unknown error')}")
        except Exception as e:
            print(f"❌ {email} - Error: {e}")

if __name__ == "__main__":
    print("Make sure the backend server is running: python -m uvicorn main:app --reload")
    print(f"Testing with email: {TEST_EMAIL}")
    print("Press Enter to continue...")
    input()
    
    test_otp_flow()
    test_signup_otp_flow()
    test_rate_limiting()
    test_invalid_email()
    
    print("\n" + "=" * 60)
    print("🎉 OTP testing completed!")
    print("Check the backend logs for detailed information about email sending.")
