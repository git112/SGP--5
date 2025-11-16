import React, { useState } from 'react';
import { Upload, FileText, Brain, Target, TrendingUp, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from "@/components/ui/button";
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { resumeApi } from '../services/resumeApi';

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

interface AnalysisResult {
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
}

const AnalyzerPage = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const validateFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload a PDF, DOC, or DOCX.";
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setResumeFile(null);
      } else {
        setResumeFile(file);
        setError('');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      setError('Please provide both a resume file and job description');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setResults(null);

    try {
      console.log('Starting analysis...');
      const form = new FormData();
      form.append('resume', resumeFile);
      form.append('jobDescription', jobDescription);
      
      const response = await resumeApi.analyzeResume(form);
      console.log('Analysis complete:', response);
      setResults(response);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Removed score cards per request

  const AnalysisSection = ({ title, items, icon: Icon, color }: { 
    title: string; 
    items: string[]; 
    icon: any; 
    color: string; 
  }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/10">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-cyan-50">
        <Icon className={`h-5 w-5 ${color}`} />
        {title}
      </h2>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-cyan-100">
            <Icon className={`h-5 w-5 mt-1 flex-shrink-0 ${color}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const isFallbackMode = results?.analysis_source === 'fallback';

  return (
    <div className="relative min-h-screen text-foreground overflow-x-hidden">
      {/* Background Layers to match site theme */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f3a] via-[#2d3561] to-[#0f172a]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419]/60 via-transparent to-[#1a1f3a]/80" />
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#36b5d3]/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-[#14788f]/10 blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-[#36b5d3]/15 blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full bg-[#14788f]/15 blur-lg animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Header />
      
      <div className="pt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-glow">
              Resume Analyzer
            </h1>
            <p className="text-[#dee0e1]/80 text-lg">
              Get AI-powered insights for your resume
            </p>
          </div>

          {/* Input Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Resume Upload */}
            <Card className="bg-white/10 backdrop-blur-xl border border-cyan-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300">
                  <Upload className="h-5 w-5 text-cyan-300" />
                  Resume Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-cyan-400/30 rounded-xl p-8 text-center hover:border-cyan-400/60 transition-all">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <FileText className="h-12 w-12 text-cyan-300 mx-auto mb-4" />
                    <p className="text-slate-100 mb-2">
                      {resumeFile ? resumeFile.name : 'Click to upload resume'}
                    </p>
                    <p className="text-sm text-slate-300/70">
                      Supports PDF, DOC, DOCX
                    </p>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card className="bg-white/10 backdrop-blur-xl border border-cyan-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300">
                  <FileText className="h-5 w-5 text-cyan-300" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-64 p-4 bg-slate-800/30 border border-cyan-400/20 rounded-xl text-slate-100 placeholder-slate-300/40 focus:border-cyan-400 focus:outline-none transition-all"
                />
              </CardContent>
            </Card>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          )}

          {/* Analyze Button */}
          <div className="text-center mb-12">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resumeFile || !jobDescription.trim()}
              className="px-8 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  Analyze Resume
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          {results && (
            <div className="space-y-8">
              {/* Fallback Mode Notice */}
              {isFallbackMode && (
                <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-300">
                    Advanced analysis is currently unavailable.
                  </span>
                </div>
              )}

              {/* Scores removed */}

              {/* Main Analysis Sections - Only show if not in fallback mode */}
              {!isFallbackMode && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AnalysisSection
                      title="Strengths"
                      items={results.strengths || []}
                      icon={CheckCircle}
                      color="text-green-400"
                    />
                    <AnalysisSection
                      title="Areas for Improvement"
                      items={results.weaknesses || []}
                      icon={AlertCircle}
                      color="text-red-400"
                    />
                  </div>

                  

                  {/* Recommendations */}
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-cyan-400/20">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-cyan-50">
                      <TrendingUp className="h-5 w-5 text-cyan-300" />
                      Recommendations
                    </h2>
                    <ul className="space-y-4">
                      {results.improvements?.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-3 text-cyan-100">
                          <TrendingUp className="h-5 w-5 mt-1 text-cyan-400 flex-shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AnalyzerPage;