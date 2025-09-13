from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any

from services.ai_service_py import (
    summarize_resume_text,
    generate_questions,
    analyze_answer,
    interview_summary,
)


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














