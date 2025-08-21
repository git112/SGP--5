/**
 * Companies API Service
 * Fetches real-time company data from Google Sheets via backend API
 */

export interface Company {
  icon: string;
  name: string;
  domain: string;
  status: "Open" | "Upcoming";
  packageLPA: number;
  packageDisplay: string; // Original package format from sheet (e.g., "8-10", "14.5")
  roles: string[];
  eligibility: string;
  location: string;
  raw_data?: any; // For debugging
}

export interface CompaniesResponse {
  companies: Company[];
  filters: {
    locations: string[];
    packages: number[];
  };
  total_count: number;
  last_updated: string | null;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class CompaniesApiService {
  private static instance: CompaniesApiService;
  private cache: CompaniesResponse | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): CompaniesApiService {
    if (!CompaniesApiService.instance) {
      CompaniesApiService.instance = new CompaniesApiService();
    }
    return CompaniesApiService.instance;
  }

  /**
   * Fetch companies data from the backend API
   * @param sheetNumber - The sheet number to fetch from (default: 5)
   * @param forceRefresh - Force refresh even if cache is valid
   */
  async getCompanies(sheetNumber: number = 5, forceRefresh: boolean = false): Promise<CompaniesResponse> {
    try {
      // Check cache first
      if (!forceRefresh && this.cache && this.isCacheValid()) {
        console.log('Using cached companies data');
        return this.cache;
      }

      console.log(`Fetching companies data from sheet ${sheetNumber}...`);
      
      const response = await fetch(`${API_BASE_URL}/api/companies?sheet_number=${sheetNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CompaniesResponse = await response.json();
      
      // Update cache
      this.cache = data;
      this.lastFetch = Date.now();
      
      console.log(`Successfully fetched ${data.companies.length} companies`);
      return data;
      
    } catch (error) {
      console.error('Error fetching companies:', error);
      
      // Return cached data if available, even if expired
      if (this.cache) {
        console.log('Returning cached data due to fetch error');
        return {
          ...this.cache,
          error: `Failed to fetch fresh data: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
      
      // Return empty response with error
      return {
        companies: [],
        filters: { locations: [], packages: [] },
        total_count: 0,
        last_updated: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(): boolean {
    return Date.now() - this.lastFetch < this.CACHE_DURATION;
  }

  /**
   * Force refresh the cache
   */
  async refreshCache(sheetNumber: number = 5): Promise<CompaniesResponse> {
    return this.getCompanies(sheetNumber, true);
  }

  /**
   * Get cached data if available
   */
  getCachedData(): CompaniesResponse | null {
    return this.isCacheValid() ? this.cache : null;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }

  /**
   * Get cache status
   */
  getCacheStatus(): { hasCache: boolean; isValid: boolean; age: number } {
    return {
      hasCache: !!this.cache,
      isValid: this.isCacheValid(),
      age: this.lastFetch ? Date.now() - this.lastFetch : 0
    };
  }
}

// Export singleton instance
export const companiesApi = CompaniesApiService.getInstance();
