#!/usr/bin/env python3
"""
Test script for location cleaning functionality
"""

from companies_sheets_service import CompaniesSheetsService

def test_location_cleaning():
    """Test the location cleaning functionality."""
    service = CompaniesSheetsService()
    
    # Test cases
    test_locations = [
        "Ahmedabad (Gujarat)",
        "Ahmedabad [Gujarat]",
        "Mumbai, Maharashtra",
        "Mumbai (Maharashtra)",
        "Bangalore City",
        "Bangalore District",
        "Delhi, India",
        "Delhi (NCR)",
        "Pune, Maharashtra, India",
        "Chennai (Tamil Nadu)",
        "Hyderabad [Telangana]",
        "Kolkata, West Bengal, India",
        "Noida (UP)",
        "Gurgaon, Haryana",
        "Ahmedabad",  # Already clean
        "Mumbai",     # Already clean
        "N/A",
        "",
        "null"
    ]
    
    print("Testing location cleaning functionality:")
    print("=" * 50)
    
    for location in test_locations:
        cleaned = service._clean_location(location)
        print(f"'{location}' -> '{cleaned}'")
    
    print("\n" + "=" * 50)
    print("Location cleaning test completed!")

if __name__ == "__main__":
    test_location_cleaning()


















