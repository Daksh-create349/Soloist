"""
Soloist Agent — Document Parser
Extracts raw text from PDF, DOCX, and TXT files for resume ingestion.
"""

from pathlib import Path
import fitz  # PyMuPDF
from docx import Document


def parse_file(filepath: str | Path) -> str:
    """
    Extract raw text from a file based on its extension.

    Supported formats: .pdf, .docx, .txt
    Returns the full text content as a string.
    """
    filepath = Path(filepath)
    suffix = filepath.suffix.lower()

    if suffix == ".pdf":
        return _parse_pdf(filepath)
    elif suffix == ".docx":
        return _parse_docx(filepath)
    elif suffix == ".txt":
        return _parse_txt(filepath)
    else:
        raise ValueError(f"Unsupported file format: {suffix}. Use .pdf, .docx, or .txt")


def _parse_pdf(filepath: Path) -> str:
    """Extract text from all pages of a PDF using PyMuPDF."""
    doc = fitz.open(str(filepath))
    text_parts = []
    for page in doc:
        text_parts.append(page.get_text())
    doc.close()
    return "\n".join(text_parts).strip()


def _parse_docx(filepath: Path) -> str:
    """Extract text from a Word document using python-docx."""
    doc = Document(str(filepath))
    paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
    return "\n".join(paragraphs).strip()


def _parse_txt(filepath: Path) -> str:
    """Read plain text file."""
    return filepath.read_text(encoding="utf-8").strip()
