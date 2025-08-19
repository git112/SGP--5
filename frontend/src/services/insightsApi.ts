const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface CGPAData {
  cgpa: string;
  offers: number;
  students: number;
}

export interface CompanyData {
  name: string;
  hires: number;
  color: string;
  other_companies?: string[];
}

export interface RoleData {
  year: string;
  role: string;
  count: number;
  color: string;
}

export interface PackageData {
  year: string;
  avg: number;
  highest: number;
  total: number;
}

export interface StatsOverview {
  metric: string;
  value: string;
  change: string;
}

export interface InsightsData {
  cgpa_data: CGPAData[];
  companies_data: CompanyData[];
  roles_data: RoleData[];
  package_data: PackageData[];
  stats_overview: StatsOverview[];
}

export interface RawCGPAData {
  year: string;
  cgpa: number;
  offers: number;
}

export interface RawCGPAResponse {
  raw_cgpa_data: RawCGPAData[];
  total_records: number;
  message: string;
}

export interface SheetsMetadata {
  title: string;
  sheets: string[];
  last_updated: string;
}

class InsightsApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  getInsights = async (): Promise<InsightsData> => {
    console.log('API Base URL:', this.baseUrl);
    console.log('Making request to:', `${this.baseUrl}/api/insights`);
    return this.request<InsightsData>('/api/insights');
  }

  getInsightsByType = async (dataType: string): Promise<Partial<InsightsData>> => {
    return this.request<Partial<InsightsData>>(`/api/insights/${dataType}`);
  }

  getRawCGPAData = async (): Promise<RawCGPAResponse> => {
    return this.request<RawCGPAResponse>('/api/insights/raw/cgpa');
  }

  getSheetsMetadata = async (): Promise<SheetsMetadata> => {
    return this.request<SheetsMetadata>('/api/sheets/metadata');
  }

  refreshSheetsData = async (): Promise<{ message: string; data: InsightsData }> => {
    return this.request<{ message: string; data: InsightsData }>('/api/sheets/refresh');
  }

  // Helper method to check if data is stale (older than 5 minutes)
  isDataStale(lastUpdated: string): boolean {
    const lastUpdate = new Date(lastUpdated);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    return now.getTime() - lastUpdate.getTime() > fiveMinutes;
  }
}

export const insightsApi = new InsightsApiService();
