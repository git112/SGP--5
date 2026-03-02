// Use environment variable or default to relative path /api
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export type AnalysisResult = {
  ats_score?: number;
  job_match_score?: number;
  format_analysis?: {
    score: number;
    issues: string[];
    strengths: string[];
  };
  strengths?: string[];
  weaknesses?: string[];
  skills_analysis?: {
    matching_skills: string[];
    missing_skills: string[];
    skill_gaps: string[];
  };
  improvements?: string[];
  analysis_source?: string;
  // Legacy fields for backward compatibility
  skillsFound?: string[];
  skillsMissing?: string[];
  matchScore?: number;
  suggestions?: string;
};

export const resumeApi = {
  async analyzeResume(form: FormData): Promise<AnalysisResult> {
    const res = await fetch(`${API_BASE_URL}/api/resume/analyze`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `HTTP ${res.status}`);
    }
    return res.json();
  },
};


