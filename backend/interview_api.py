from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import List, Dict, Any

from services.ai_service_py import (
    summarize_resume_text,
    generate_questions,
    analyze_answer,
    interview_summary,
)

from resume_parser import parse_resume_bytes
from job_description_validator import extract_required_skills
from groq_analyzer import compute_match

router = APIRouter(prefix="/api/competency", tags=["competency-test"])


class GenerateQuestionsRequest(BaseModel):
    num_of_questions: int = Field(ge=3, le=10, default=3)
    interview_type: str = Field(pattern=r"^(technical|behavioral|mixed)$")
    role: str
    experience_level: str = Field(pattern=r"^(fresher|junior|mid|senior)$", default="fresher")
    company_name: str | None = None
    company_description: str | None = None
    job_description: str | None = None
    focus_area: str | None = None
    resume_text: str | None = None


class AnalyzeAnswerRequest(BaseModel):
    question: str
    userAnswer: str
    preferredAnswer: str
    role: str | None = None
    experience_level: str | None = None
    interview_type: str | None = None


@router.post("/summarize-resume")
def summarize_resume(payload: Dict[str, Any]):
    text = (payload.get("rawText") or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="rawText is required")
    return {"summary": summarize_resume_text(text)}


@router.post("/generate-questions")
def generate_questions_endpoint(body: GenerateQuestionsRequest):
    resume_summary = summarize_resume_text(body.resume_text) if body.resume_text else None
    questions = generate_questions(
        num_of_questions=body.num_of_questions,
        interview_type=body.interview_type,
        role=body.role,
        experience_level=body.experience_level,
        company_name=body.company_name,
        company_description=body.company_description,
        job_description=body.job_description,
        focus_area=body.focus_area,
        resume_summary=resume_summary,
    )
    return {"questions": questions}


@router.post("/analyze-answer")
def analyze_answer_endpoint(body: AnalyzeAnswerRequest):
    result = analyze_answer(
        question=body.question,
        user_answer=body.userAnswer,
        preferred_answer=body.preferredAnswer,
        role=body.role,
        experience_level=body.experience_level,
        interview_type=body.interview_type,
    )
    return result


class InterviewSummaryRequest(BaseModel):
    combinedFeedback: str | None = None


@router.post("/summary")
def summary_endpoint(body: InterviewSummaryRequest):
    return {"summary": interview_summary(body.combinedFeedback)}













resume_router = APIRouter(prefix="/api/resume", tags=["resume-analyzer"])


@resume_router.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    jobDescription: str = Form(""),
):
    try:
        # Basic validations
        if not jobDescription.strip():
            raise HTTPException(status_code=400, detail="Job description cannot be empty")

        filename = resume.filename or ""
        lower = filename.lower()
        if not (lower.endswith(".pdf") or lower.endswith(".doc") or lower.endswith(".docx")):
            raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, DOC, DOCX are allowed")

        content = await resume.read()
        parsed = parse_resume_bytes(filename, content)
        jd = extract_required_skills(jobDescription)

        # Use Groq for enhanced analysis
        from services.ai_service_py import analyze_resume_with_ai
        
        # Get basic match first
        basic_match = compute_match(
            parsed.get("skills", []),
            jd.get("required_skills", []),
            certifications=parsed.get("certifications", []),
            projects=parsed.get("projects", []),
        )
        
        # Enhanced analysis with Groq
        enhanced_analysis = analyze_resume_with_ai(
            resume_text=parsed.get("text", ""),
            job_description=jobDescription,
            basic_match=basic_match
        )
        
        return enhanced_analysis
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze resume: {str(e)}")














