from __future__ import annotations

from typing import Dict, List


MERN_ALIASES = {
    "mongodb": {"mongodb", "mongo"},
    "express": {"express", "expressjs", "express.js"},
    "react": {"react", "reactjs", "react.js"},
    "node": {"node", "nodejs", "node.js"},
    "javascript": {"javascript", "js"},
}


def extract_required_skills(job_description: str) -> Dict:
    """Very lightweight JD skill extraction using shared vocabulary.

    Returns { required_skills: [..] }
    """
    if not job_description:
        return {"required_skills": [], "categories": {}}

    text = job_description.lower()
    # Reuse vocabulary from analyzer
    try:
        from groq_analyzer import KNOWN_SKILLS
    except Exception:
        KNOWN_SKILLS = tuple()

    found = set()
    for skill in KNOWN_SKILLS:
        if skill in text:
            found.add(skill)

    # Common synonyms/variants in JDs
    synonyms = {
        "ml": "machine learning",
        "reactjs": "react",
        "react.js": "react",
        "nodejs": "node",
        "node.js": "node",
        "sklearn": "scikit-learn",
        "postgres": "postgresql",
        "mongo": "mongodb",
        "gitlab ci": "ci/cd",
        "github actions": "ci/cd",
        "rest api": "api development",
        "restful api": "api development",
        "microservices": "microservices",
    }

    for syn, canon in synonyms.items():
        if syn in text:
            found.add(canon)

    # Detect MERN category explicitly if present
    categories: Dict[str, List[str]] = {}
    if any(alias in text for alias in ["mern", "mongodb", "express", "react", "node"]):
        mern_hits = []
        for canon, aliases in MERN_ALIASES.items():
            if any(a in text for a in aliases):
                mern_hits.append(canon)
        if mern_hits:
            categories["mern"] = sorted(set(mern_hits))
            found.update(mern_hits)

    return {"required_skills": sorted(found), "categories": categories}


