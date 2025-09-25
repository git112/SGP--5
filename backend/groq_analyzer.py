from __future__ import annotations

from typing import Iterable, List, Set, Tuple, Dict
import re

# Central skills vocabulary used across resume and JD extraction
KNOWN_SKILLS: Tuple[str, ...] = (
    # Programming languages
    "python", "java", "javascript", "typescript", "c", "c++", "c#", "go", "rust",
    # Data / ML
    "sql", "mysql", "postgresql", "mongodb", "pandas", "numpy", "scikit-learn", "sklearn",
    "machine learning", "deep learning", "nlp", "data analysis", "data analytics", "data scientist",
    "data engineering", "feature engineering", "model deployment", "model serving",
    # Cloud / DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "git", "ci/cd", "linux",
    # Web / frameworks
    "react", "node", "node.js", "express", "fastapi", "django", "flask", "next.js", "vite",
    "html", "css", "tailwind", "typescript",
    # Soft skills
    "communication", "leadership", "teamwork", "problem solving",
)


def normalize_skill_name(name: str) -> str:
    return name.strip().lower()


def infer_skills_from_certifications(certifications: Iterable[str]) -> Set[str]:
    inferred: Set[str] = set()
    if not certifications:
        return inferred
    low = "\n".join(c.lower() for c in certifications)
    mapping = {
        "aws": ["aws", "amazon web services"],
        "mongodb": ["mongodb", "mongo"],
        "gcp": ["google cloud"],
        "azure": ["microsoft azure", "azure"],
        "python": ["python"],
        "react": ["react"],
        "node": ["node", "node.js", "nodejs"],
    }
    for skill, needles in mapping.items():
        if any(n in low for n in needles):
            inferred.add(skill)
    return inferred


def infer_skills_from_projects(projects: Iterable[str]) -> Set[str]:
    inferred: Set[str] = set()
    if not projects:
        return inferred
    low = "\n".join(p.lower() for p in projects)
    vocab = {
        "mongodb": ["mongodb", "mongo"],
        "express": ["express", "expressjs", "express.js"],
        "react": ["react", "reactjs", "react.js"],
        "node": ["node", "nodejs", "node.js"],
        "javascript": ["javascript", "js"],
        "api development": ["rest api", "restful api", "graphql", "api"],
        "docker": ["docker"],
        "kubernetes": ["kubernetes", "k8s"],
        "aws": ["aws", "s3", "ec2", "lambda"],
    }
    for skill, needles in vocab.items():
        if any(n in low for n in needles):
            inferred.add(skill)
    return inferred


def compute_match(resume_skills: Iterable[str], jd_skills: Iterable[str], *,
                  certifications: Iterable[str] | None = None,
                  projects: Iterable[str] | None = None) -> Dict:
    rs: Set[str] = {normalize_skill_name(s) for s in resume_skills if s}
    js: Set[str] = {normalize_skill_name(s) for s in jd_skills if s}

    # Expand aliases
    aliases = {
        "node": {"node", "node.js"},
        "scikit-learn": {"scikit-learn", "sklearn"},
        "javascript": {"javascript", "js"},
        "react": {"react", "reactjs", "react.js"},
        "ci/cd": {"ci/cd", "cicd"},
        "machine learning": {"machine learning", "ml"},
    }

    def expand(skills: Set[str]) -> Set[str]:
        expanded: Set[str] = set(skills)
        for canon, alias_set in aliases.items():
            if canon in skills or alias_set & skills:
                expanded.update(alias_set)
        return expanded

    inferred_from_certs = infer_skills_from_certifications(certifications or [])
    inferred_from_projects = infer_skills_from_projects(projects or [])

    rs_all = rs | inferred_from_certs | inferred_from_projects

    rsx, jsx = expand(rs_all), expand(js)

    skills_found = sorted(s for s in rsx if s in jsx)
    skills_missing = sorted(s for s in jsx if s not in rsx)

    total_required = max(len(jsx), 1)
    match_score = round(100 * (len(skills_found) / total_required))

    suggestions_parts: List[str] = []
    if skills_missing:
        suggestions_parts.append(
            f"Consider adding or improving: {', '.join(skills_missing[:8])}."
        )
    if match_score < 80 and skills_found:
        suggestions_parts.append(
            f"Highlight your experience with {', '.join(skills_found[:6])} more explicitly."
        )
    if not suggestions_parts:
        suggestions_parts.append("Great alignment. Consider adding metrics and outcomes to strengthen impact.")

    return {
        "skillsFound": skills_found,
        "skillsMissing": skills_missing,
        "matchScore": match_score,
        "suggestions": " ".join(suggestions_parts),
    }

