from __future__ import annotations

import os
from typing import Dict, List
import re

from pdf_utils import extract_text_from_pdf_bytes


def _extract_skills_from_text(text: str) -> List[str]:
    from groq_analyzer import KNOWN_SKILLS
    if not text:
        return []
    corpus = text.lower()

    # Normalize hyphens/underscores to spaces for matching variants like "scikit-learn"
    norm = re.sub(r"[-_]+", " ", corpus)

    found = set()
    for skill in KNOWN_SKILLS:
        # Build a word-boundary regex for the skill and its hyphen/space variants
        skill_norm = re.sub(r"[-_]+", " ", skill)
        pattern = r"\b" + re.escape(skill_norm) + r"\b"
        if re.search(pattern, norm):
            found.add(skill)
    return sorted(found)


SECTION_HEADINGS = [
    "skills", "technical skills", "technology", "technologies",
    "projects", "personal projects", "work projects",
    "certifications", "certificates", "licenses", "achievements"
]


def _split_sections(text: str) -> Dict[str, str]:
    """Rudimentary section splitter by headings present in many resumes."""
    if not text:
        return {}
    lines = [ln.strip() for ln in text.splitlines()]
    sections: Dict[str, List[str]] = {}
    current = "general"
    sections[current] = []
    for ln in lines:
        low = ln.lower().strip(' :')
        if any(h in low for h in SECTION_HEADINGS) and len(low) <= 40:
            current = next((h for h in SECTION_HEADINGS if h in low), low)
            sections.setdefault(current, [])
        else:
            sections[current].append(ln)
    return {k: "\n".join(v).strip() for k, v in sections.items() if v}


def _extract_list_items(block: str) -> List[str]:
    items: List[str] = []
    for ln in block.splitlines():
        s = ln.strip().lstrip("-•*0123456789. ")
        if not s:
            continue
        items.append(s)
    return items


def _extract_projects(text: str, sections: Dict[str, str]) -> List[str]:
    project_blocks = []
    for key in sections:
        if "project" in key:
            project_blocks.append(sections[key])
    if not project_blocks:
        return []
    projects: List[str] = []
    for blk in project_blocks:
        projects.extend(_extract_list_items(blk))
    # keep short meaningful lines
    return [p for p in projects if len(p) >= 10][:50]


def _extract_certifications(text: str, sections: Dict[str, str]) -> List[str]:
    cert_blocks = []
    for key in sections:
        if any(t in key for t in ["certifications", "certificates", "licenses", "achievements"]):
            cert_blocks.append(sections[key])
    certs: List[str] = []
    for blk in cert_blocks:
        certs.extend(_extract_list_items(blk))
    # Also scan globally for common certificate phrases
    patterns = [r"aws certified[\w\s-]*", r"azure certified[\w\s-]*", r"google cloud (?:certified|certificate)[\w\s-]*",
                r"mongodb (?:certified|university)[\w\s-]*", r"oracle certified[\w\s-]*", r"ibm (?:data|ai).*certificate",
                r"coursera .*certificate", r"udemy .*certificate"]
    low = text.lower()
    for pat in patterns:
        for m in re.finditer(pat, low):
            snippet = text[m.start():m.end()].strip()
            if snippet:
                certs.append(snippet)
    # Normalize and dedupe
    seen = set()
    result = []
    for c in certs:
        key = re.sub(r"\s+", " ", c.lower()).strip()
        if key not in seen:
            seen.add(key)
            result.append(c)
    return result[:50]


def parse_resume_bytes(filename: str, data: bytes) -> Dict:
    name = (filename or "").lower()
    text = ""

    if name.endswith(".pdf"):
        text = extract_text_from_pdf_bytes(data)
    elif name.endswith(".doc") or name.endswith(".docx"):
        # Minimal .doc/.docx support via python-docx if available
        try:
            from docx import Document  # type: ignore
            import io
            doc = Document(io.BytesIO(data))
            text = "\n".join(p.text for p in doc.paragraphs if p.text)
        except Exception:
            text = ""
    else:
        text = ""

    text = (text or "").strip()
    sections = _split_sections(text)
    # Prefer skills listed explicitly in skills section, otherwise detect globally
    skills_from_section: List[str] = []
    for key, blk in sections.items():
        if "skill" in key:
            # split by commas or bullets
            tokens = re.split(r",|\n|•|\u2022|\|", blk)
            skills_from_section.extend([t.strip() for t in tokens if len(t.strip()) >= 2])
    # normalize explicit list using vocabulary matching
    explicit_skills: List[str] = []
    if skills_from_section:
        low = "\n".join(skills_from_section).lower()
        explicit_skills = _extract_skills_from_text(low)
    detected_skills = _extract_skills_from_text(text)
    skills = sorted(set(explicit_skills) | set(detected_skills))

    projects = _extract_projects(text, sections)
    certifications = _extract_certifications(text, sections)

    return {"text": text, "skills": skills, "projects": projects, "certifications": certifications}


