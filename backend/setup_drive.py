#!/usr/bin/env python3
"""
Setup script for Google Drive integration
This script helps you configure your Google Drive folder ID and test the connection.
"""

import os
from dotenv import load_dotenv
from drive_service import GoogleDriveService

def setup_google_drive():
    """Setup Google Drive integration with your folder."""
    print("🎯 Google Drive Setup for PlaceMentor AI")
    print("=" * 50)
    
    # Load environment variables
    load_dotenv()
    
    # Get current folder ID
    current_folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
    
    if current_folder_id:
        print(f"📁 Current folder ID: {current_folder_id}")
    else:
        print("⚠️  No folder ID configured yet")
    
    # Ask for folder ID
    print("\n🔗 Please provide your Google Drive folder ID:")
    print("   You can find this in your Drive URL:")
    print("   https://drive.google.com/drive/folders/FOLDER_ID_HERE")
    print("   Example: 1a-a8KILesQjsNZDFshRuyjOQttTvczT5")
    
    folder_id = input("\n📝 Enter folder ID (or press Enter to use current): ").strip()
    
    if not folder_id and current_folder_id:
        folder_id = current_folder_id
        print(f"✅ Using existing folder ID: {folder_id}")
    elif not folder_id:
        print("❌ No folder ID provided. Please run this script again.")
        return
    
    # Test the connection
    print(f"\n🔍 Testing connection to folder: {folder_id}")
    
    try:
        drive_service = GoogleDriveService()
        print("✅ Google Drive service initialized successfully")
        
        # List files in the specific folder
        files = drive_service.list_files(folder_id)
        
        if files:
            print(f"\n✅ Found {len(files)} Excel/CSV files in your folder:")
            for file in files:
                print(f"   📄 {file['name']} ({file['mimeType']})")
            
            # Check for required files
            required_files = ['placements', 'companies', 'interviews']
            found_files = [file['name'].lower() for file in files]
            
            print(f"\n📋 Checking required files:")
            for required in required_files:
                if any(required in found for found in found_files):
                    print(f"   ✅ {required} data found")
                else:
                    print(f"   ⚠️  {required} data not found")
            
            # Update .env file
            update_env_file(folder_id)
            
            print(f"\n🎉 Setup complete! Your system is ready to use folder: {folder_id}")
            print("\n📋 Next steps:")
            print("1. Start the backend: python main.py")
            print("2. Test the chatbot!")
            
        else:
            print("⚠️  No Excel/CSV files found in the specified folder")
            print("   Please ensure your folder contains .xlsx or .csv files")
            
    except Exception as e:
        print(f"❌ Error during setup: {e}")
        print("\n📖 Please check:")
        print("1. Your service account credentials (placementor-ai.json)")
        print("2. The folder ID is correct")
        print("3. The service account has access to the folder")

def update_env_file(folder_id: str):
    """Update the .env file with the folder ID."""
    env_file = ".env"
    env_content = f"""# Google Drive Configuration
GOOGLE_DRIVE_FOLDER_ID={folder_id}
"""
    
    try:
        with open(env_file, 'w') as f:
            f.write(env_content)
        print(f"✅ Updated {env_file} with folder ID: {folder_id}")
    except Exception as e:
        print(f"⚠️  Could not update {env_file}: {e}")
        print(f"   Please manually add: GOOGLE_DRIVE_FOLDER_ID={folder_id}")

def main():
    """Main setup function."""
    setup_google_drive()

if __name__ == "__main__":
    main()
