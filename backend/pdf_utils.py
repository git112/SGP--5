from __future__ import annotations

import io
from typing import Optional

try:
    import pdfplumber
except Exception:  # pragma: no cover
    pdfplumber = None


def extract_text_from_pdf_bytes(data: bytes) -> str:
    """Extract text content from PDF bytes using pdfplumber.

    This replaces the Node patch that tweaked pdf-parse test paths. We avoid Node altogether.
    """
    if not pdfplumber:
        return ""
    text_parts = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page in pdf.pages:
            txt = page.extract_text() or ""
            if txt:
                text_parts.append(txt)
    return "\n".join(text_parts)






















