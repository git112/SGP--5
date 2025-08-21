#!/usr/bin/env python3
"""
Google Sheets Service for Company Directory
Fetches real-time company data from sheet #5 for the frontend company directory.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CompaniesSheetsService:
    def __init__(self, credentials_file: str = "placementor-ai.json"):
        """Initialize the Google Sheets service for companies."""
        self.credentials_file = os.path.join(os.path.dirname(__file__), credentials_file)
        self.sheets_service = None
        self.spreadsheet_id = os.getenv("GOOGLE_SPREADSHEET_ID")
        self._authenticate_sheets()
    
    def _authenticate_sheets(self):
        """Authenticate with Google Sheets API."""
        try:
            if not os.path.exists(self.credentials_file):
                raise FileNotFoundError(f"Credentials file not found: {self.credentials_file}")
            
            SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
            credentials = Credentials.from_service_account_file(
                self.credentials_file, scopes=SCOPES
            )
            
            self.sheets_service = build('sheets', 'v4', credentials=credentials)
            logger.info("Successfully authenticated with Google Sheets API")
            
        except Exception as e:
            logger.error(f"Google Sheets authentication failed: {e}")
            raise
    
    def get_companies_data(self, sheet_number: int = 5) -> List[Dict[str, Any]]:
        """
        Fetch company data from a specific sheet number.
        Sheet #5 is expected to contain company information.
        """
        try:
            if not self.spreadsheet_id:
                raise ValueError("GOOGLE_SHEETS_ID environment variable not set")
            
            # Get sheet metadata to find the sheet name by index
            sheet_metadata = self.sheets_service.spreadsheets().get(
                spreadsheetId=self.spreadsheet_id
            ).execute()
            
            sheets = sheet_metadata.get('sheets', [])
            if sheet_number > len(sheets):
                logger.error(f"Sheet number {sheet_number} not found. Available sheets: {len(sheets)}")
                return []
            
            # Get the sheet name by index (sheets are 0-indexed in the API)
            sheet_name = sheets[sheet_number - 1]['properties']['title']
            logger.info(f"Fetching data from sheet: {sheet_name}")
            
            # Fetch data from the specific sheet
            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range=f"{sheet_name}!A:Z"  # Read all columns
            ).execute()
            
            values = result.get('values', [])
            if not values:
                logger.warning(f"No data found in sheet {sheet_name}")
                return []
            
            # Parse the data
            companies = self._parse_companies_data(values)
            logger.info(f"Successfully fetched {len(companies)} companies from sheet {sheet_name}")
            
            return companies
            
        except Exception as e:
            logger.error(f"Error fetching companies data: {e}")
            return []
    
    def _parse_companies_data(self, values: List[List[str]]) -> List[Dict[str, Any]]:
        """Parse raw sheet data into structured company objects."""
        if len(values) < 2:  # Need at least header + 1 data row
            return []
        
        # Extract headers (first row)
        headers = [str(header).strip() for header in values[0]]
        logger.info(f"Found headers: {headers}")
        
        companies = []
        
        # Process data rows (skip header)
        for row_index, row in enumerate(values[1:], start=2):
            try:
                # Ensure row has enough columns
                while len(row) < len(headers):
                    row.append("")
                
                # Create company object
                company = self._create_company_object(headers, row, row_index)
                if company:
                    companies.append(company)
                    
            except Exception as e:
                logger.warning(f"Error processing row {row_index}: {e}")
                continue
        
        # Sort companies by package (highest first) and other criteria
        companies = self._sort_companies(companies)
        
        return companies
    
    def _create_company_object(self, headers: List[str], row: List[str], row_index: int) -> Optional[Dict[str, Any]]:
        """Create a company object from row data."""
        try:
            # Create a mapping of header to value
            data = dict(zip(headers, row))
            
            # Extract and clean company name
            company_name = self._extract_value(data, ['Company', 'CompanyName', 'Name', 'Company Name'])
            if not company_name or company_name.lower() in ['', 'n/a', 'null', 'undefined']:
                return None
            
            # Extract package information - handle your "Avg. Package" column
            package_lpa = self._extract_package(data, ['Avg. Package', 'PackageLPA', 'Package', 'Salary', 'LPA', 'Package (LPA)'])
            
            # Extract domain/industry - use default since you don't have this column
            domain = "Technology"  # Default domain since your sheet doesn't have this
            
            # Extract location
            location = self._extract_value(data, ['Location', 'City', 'Address', 'HQ'])
            
            # Extract roles
            roles = self._extract_roles(data, ['Roles', 'Role', 'Positions', 'Job Roles'])
            
            # Extract eligibility - use default since you don't have this column
            eligibility = "CGPA: 7+"  # Default eligibility since your sheet doesn't have this
            
            # Determine status based on package or other criteria
            status = self._determine_status(package_lpa, data)
            
            # Create company icon based on name
            icon = self._generate_company_icon(company_name)
            
            company = {
                "icon": icon,
                "name": company_name.strip(),
                "domain": domain.strip() if domain else "Technology",
                "status": status,
                "packageLPA": package_lpa,
                "packageDisplay": self._get_original_package_display(data, ['Avg. Package', 'PackageLPA', 'Package', 'Salary', 'LPA', 'Package (LPA)']),
                "roles": roles,
                "eligibility": eligibility.strip() if eligibility else "CGPA: 7+",
                "location": location.strip() if location else "N/A",
                "raw_data": data  # Keep raw data for debugging
            }
            
            return company
            
        except Exception as e:
            logger.warning(f"Error creating company object for row {row_index}: {e}")
            return None
    
    def _extract_value(self, data: Dict[str, str], possible_keys: List[str]) -> str:
        """Extract value from data using possible key names."""
        for key in possible_keys:
            if key in data and data[key]:
                return str(data[key]).strip()
        return ""
    
    def _extract_package(self, data: Dict[str, str], possible_keys: List[str]) -> int:
        """Extract package value and convert to integer."""
        for key in possible_keys:
            if key in data and data[key]:
                try:
                    value = str(data[key]).strip()
                    if not value or value.lower() in ['n/a', 'null', 'undefined', '']:
                        continue
                    
                    # Handle ranges like "2.65-4" or "3-4"
                    if '-' in value:
                        # Split range and take average
                        parts = value.split('-')
                        if len(parts) == 2:
                            try:
                                min_val = float(parts[0].strip())
                                max_val = float(parts[1].strip())
                                avg_val = (min_val + max_val) / 2
                                return int(avg_val)
                            except (ValueError, TypeError):
                                continue
                    
                    # Handle single values like "14.5" or "5.7"
                    try:
                        # Remove non-numeric characters except decimal point
                        numeric_value = ''.join(c for c in value if c.isdigit() or c == '.')
                        if numeric_value:
                            return int(float(numeric_value))
                    except (ValueError, TypeError):
                        continue
                        
                except (ValueError, TypeError):
                    continue
        return 0  # Default package
    
    def _extract_roles(self, data: Dict[str, str], possible_keys: List[str]) -> List[str]:
        """Extract roles and convert to list."""
        for key in possible_keys:
            if key in data and data[key]:
                value = str(data[key]).strip()
                if value and value.lower() not in ['n/a', 'null', 'undefined', 'no roles found in data']:
                    # Split by common separators and clean
                    roles = [role.strip() for role in value.replace('|', ',').replace(';', ',').split(',')]
                    roles = [role for role in roles if role and role.lower() not in ['n/a', 'null', 'undefined', 'no roles found in data']]
                    if roles:
                        return roles[:5]  # Limit to 5 roles
        return ["Software Engineer"]  # Default role
    
    def _extract_eligibility(self, data: Dict[str, str], possible_keys: List[str]) -> str:
        """Extract eligibility criteria."""
        for key in possible_keys:
            if key in data and data[key]:
                value = str(data[key]).strip()
                if value and value.lower() not in ['n/a', 'null', 'undefined']:
                    return value
        return "CGPA: 7+"  # Default eligibility
    
    def _determine_status(self, package_lpa: int, data: Dict[str, str]) -> str:
        """Determine company status based on package and other criteria."""
        # Check if there's an explicit status field
        status = self._extract_value(data, ['Status', 'Recruitment Status', 'Hiring Status'])
        if status and status.lower() in ['open', 'upcoming', 'closed', 'active']:
            return status.capitalize()
        
        # Determine status based on package
        if package_lpa >= 40:
            return "Open"  # High-paying companies are usually open
        elif package_lpa >= 25:
            return "Open"  # Medium-paying companies
        else:
            return "Upcoming"  # Lower-paying companies
    
    def _generate_company_icon(self, company_name: str) -> str:
        """Generate emoji icon based on company name."""
        name_lower = company_name.lower()
        
        # Tech companies
        if any(tech in name_lower for tech in ['google', 'microsoft', 'apple', 'meta', 'amazon', 'netflix']):
            return "💻"
        elif 'google' in name_lower:
            return "🔍"
        elif 'microsoft' in name_lower:
            return "🪟"
        elif 'apple' in name_lower:
            return "🍎"
        elif 'amazon' in name_lower:
            return "📦"
        elif 'netflix' in name_lower:
            return "🎬"
        elif 'meta' in name_lower or 'facebook' in name_lower:
            return "📱"
        
        # Other companies
        elif any(word in name_lower for word in ['bank', 'finance', 'insurance']):
            return "💰"
        elif any(word in name_lower for word in ['health', 'medical', 'pharma']):
            return "🏥"
        elif any(word in name_lower for word in ['auto', 'car', 'vehicle']):
            return "🚗"
        elif any(word in name_lower for word in ['food', 'restaurant', 'cafe']):
            return "🍕"
        else:
            return "🏢"  # Default company icon
    
    def _sort_companies(self, companies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sort companies by package (highest first) and other criteria."""
        def sort_key(company):
            # Primary sort: package (highest first)
            package = company.get('packageLPA', 0)
            
            # Secondary sort: status (Open companies first)
            status_priority = 0 if company.get('status') == 'Open' else 1
            
            # Tertiary sort: company name (alphabetical)
            name = company.get('name', '').lower()
            
            return (-package, status_priority, name)
        
        return sorted(companies, key=sort_key)
    
    def _get_original_package_display(self, data: Dict[str, str], possible_keys: List[str]) -> str:
        """Get the original package display format from the sheet."""
        for key in possible_keys:
            if key in data and data[key]:
                value = str(data[key]).strip()
                if value and value.lower() not in ['n/a', 'null', 'undefined', '']:
                    return value
        return "N/A"
    
    def get_companies_for_frontend(self, sheet_number: int = 5) -> Dict[str, Any]:
        """Get companies data formatted for frontend consumption."""
        try:
            companies = self.get_companies_data(sheet_number)
            
            # Get unique locations for filter dropdown
            locations = list(set(company.get('location', 'N/A') for company in companies if company.get('location') and company.get('location') != 'N/A'))
            locations.sort()
            
            # Get unique packages for filter dropdown
            packages = list(set(company.get('packageLPA', 0) for company in companies if company.get('packageLPA', 0) > 0))
            packages.sort(reverse=True)
            
            return {
                "companies": companies,
                "filters": {
                    "locations": locations,
                    "packages": packages
                },
                "total_count": len(companies),
                "last_updated": self._get_last_updated_time()
            }
            
        except Exception as e:
            logger.error(f"Error getting companies for frontend: {e}")
            return {
                "companies": [],
                "filters": {"locations": [], "packages": []},
                "total_count": 0,
                "last_updated": None,
                "error": str(e)
            }
    
    def _get_last_updated_time(self) -> str:
        """Get the last updated time for the data."""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
