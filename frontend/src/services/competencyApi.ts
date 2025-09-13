export type GenerateQuestionsPayload = {
  num_of_questions: number;
  interview_type: 'technical' | 'behavioral' | 'mixed';
  role: string;
  experience_level: 'fresher' | 'junior' | 'mid' | 'senior';
  company_name?: string;
  company_description?: string;
  job_description?: string;
  focus_area?: string;
  resume_text?: string;
};

export type Question = { question: string; preferred_answer: string };

export async function summarizeResume(rawText: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/competency/summarize-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || 'Failed to summarize');
  return data.summary as string;
}

export async function generateQuestions(payload: GenerateQuestionsPayload) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/competency/generate-questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || 'Failed to generate questions');
  return data.questions as Question[];
}

export async function analyzeAnswer(input: {
  question: string;
  userAnswer: string;
  preferredAnswer: string;
  role?: string;
  experience_level?: 'fresher' | 'junior' | 'mid' | 'senior';
  interview_type?: 'technical' | 'behavioral' | 'mixed';
}) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/competency/analyze-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || 'Failed to analyze answer');
  return data as { score: number; feedback: string };
}

export async function makeSummary(combinedFeedback: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/competency/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ combinedFeedback }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || 'Failed to build summary');
  return data.summary as string;
}














