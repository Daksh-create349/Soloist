"""
Soloist Agent — Configuration
Loads all environment variables via python-dotenv.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ── Paths ─────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
PDF_DIR = DATA_DIR / "generated_pdfs"
STATIC_DIR = BASE_DIR / "static"
CHROMA_DIR = os.getenv("CHROMADB_PATH", str(BASE_DIR / "chroma_db"))
SQLITE_PATH = os.getenv("SQLITE_PATH", str(BASE_DIR / "sqlite_db" / "soloist.db"))

# Ensure directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
PDF_DIR.mkdir(parents=True, exist_ok=True)
Path(CHROMA_DIR).mkdir(parents=True, exist_ok=True)
Path(SQLITE_PATH).parent.mkdir(parents=True, exist_ok=True)

# ── API Keys ──────────────────────────────────────────────────────────────
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
LINKEDIN_SESSION_COOKIE = os.getenv("LINKEDIN_SESSION_COOKIE", "")

# ── Model Config ──────────────────────────────────────────────────────────
FILTER_MODEL = os.getenv("FILTER_MODEL", "gpt-4o-mini")
CRAFTER_MODEL = os.getenv("CRAFTER_MODEL", "gpt-4o")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

# ── Scraping Config ───────────────────────────────────────────────────────
JOBS_PER_SOURCE = 5          # Target 3–5 per source
MATCH_SCORE_THRESHOLD = 40   # Lowered to allow partial matches through
