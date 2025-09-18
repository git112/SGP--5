from pydantic import BaseModel, Field
from typing import List, Optional


class InterviewQuestion(BaseModel):
    question: str
    preferred_answer: str


class InterviewModelPy(BaseModel):
    user_id: str
    interview_name: str
    num_of_questions: int = Field(ge=3, le=10, default=3)
    interview_type: str = Field(pattern=r"^(technical|behavioral|mixed)$")
    company_name: Optional[str] = None
    company_description: Optional[str] = None
    role: str
    experience_level: str = Field(pattern=r"^(fresher|junior|mid|senior)$", default="fresher")
    job_description: Optional[str] = None
    resume_link: Optional[str] = None
    focus_area: Optional[str] = None
    questions: List[InterviewQuestion] = []


class ReportAnswer(BaseModel):
    question: str
    userAnswer: str
    preferredAnswer: str
    score: int
    feedback: str


class ReportModelPy(BaseModel):
    interviewId: str
    userId: str
    answers: List[ReportAnswer]
    finalScore: int | None = None
    summary: str | None = None
    areaOfImprovement: str | None = None
    strengths: str | None = None

















