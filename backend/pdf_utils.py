from __future__ import annotations

import io
from typing import Optional

try:
    import pdfplumber
except Exception:  # pragma: no cover
    pdfplumber = None

try:
    from PyPDF2 import PdfReader  # type: ignore
except Exception:  # pragma: no cover
    PdfReader = None  # type: ignore

# Optional OCR fallback for scanned PDFs
try:  # pragma: no cover - optional dependency
    import pytesseract  # type: ignore
    from pdf2image import convert_from_bytes  # type: ignore
    from PIL import Image  # type: ignore
except Exception:
    pytesseract = None  # type: ignore
    convert_from_bytes = None  # type: ignore
    Image = None  # type: ignore


def extract_text_from_pdf_bytes(data: bytes) -> str:
    """Extract text content from PDF bytes using pdfplumber.

    This replaces the Node patch that tweaked pdf-parse test paths. We avoid Node altogether.
    """
    text_parts = []

    # First try pdfplumber (accurate for many PDFs)
    if pdfplumber:
        try:
            with pdfplumber.open(io.BytesIO(data)) as pdf:
                for page in pdf.pages:
                    txt = page.extract_text() or ""
                    if txt:
                        text_parts.append(txt)
        except Exception:
            pass

    text = "\n".join(text_parts).strip()
    if text:
        return text

    # Fallback to PyPDF2 which works for some text-based PDFs
    if PdfReader:
        try:
            reader = PdfReader(io.BytesIO(data))
            fallback_text_parts = []
            for page in getattr(reader, "pages", []) or []:
                try:
                    t = page.extract_text() or ""
                except Exception:
                    t = ""
                if t:
                    fallback_text_parts.append(t)
            text = "\n".join(fallback_text_parts).strip()
            if text:
                return text
        except Exception:
            pass

    # If all else fails, return empty
    # Last resort: OCR if available (helps for scanned/image-based PDFs)
    if pytesseract and convert_from_bytes:
        try:
            images = convert_from_bytes(data, fmt="png")
            ocr_parts = []
            for img in images:
                try:
                    txt = pytesseract.image_to_string(img) or ""
                except Exception:
                    txt = ""
                if txt:
                    ocr_parts.append(txt)
            text = "\n".join(ocr_parts).strip()
            if text:
                return text
        except Exception:
            pass

    return ""

























