"""
Soloist Agent — FastAPI API Routes
Upload resume, trigger hunt pipeline, and serve results.
"""

import asyncio
import os
import shutil
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse

from app.config import UPLOAD_DIR, PDF_DIR
from app.core.database import get_all_jobs, clear_all_jobs, init_db
from app.rag.ingest import ingest_resume, extract_skills
from app.rag.vector_store import get_chunk_count
from app.agents.workflow import run_pipeline

router = APIRouter(prefix="/api")

# ── Global pipeline state ─────────────────────────────────────────────────
_pipeline_state = {
    "status": "idle",        # idle, uploading, hunting, complete, error
    "resume_uploaded": False,
    "resume_file": "",
    "resume_text": "",
    "user_skills": [],
    "chunks_count": 0,
    "result": None,
    "error": None,
}


def _reset_state():
    _pipeline_state.update({
        "status": "idle",
        "result": None,
        "error": None,
    })


# ── Upload Resume ─────────────────────────────────────────────────────────
@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a resume file (PDF, DOCX, or TXT).
    Parses it, chunks it, embeds it, and stores in ChromaDB.
    """
    allowed_extensions = {".pdf", ".docx", ".txt"}
    suffix = Path(file.filename).suffix.lower()

    if suffix not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: {suffix}. Use {', '.join(allowed_extensions)}",
        )

    # Save uploaded file
    filepath = UPLOAD_DIR / file.filename
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        # Ingest into vector DB
        result = ingest_resume(str(filepath))

        # Extract skills for search queries
        skills = extract_skills(result["resume_text"])

        # Update global state
        _pipeline_state.update({
            "resume_uploaded": True,
            "resume_file": file.filename,
            "resume_text": result["resume_text"],
            "user_skills": skills,
            "chunks_count": result["chunks_count"],
            "status": "idle",
        })

        return {
            "success": True,
            "filename": file.filename,
            "text_length": result["text_length"],
            "chunks_count": result["chunks_count"],
            "skills_extracted": skills,
            "message": f"Resume ingested successfully! {result['chunks_count']} chunks stored in vector DB.",
        }

    except Exception as e:
        error_msg = str(e)
        status_code = 500
        
        # Catch OpenAI rate limits specifically
        if "rate_limit_exceeded" in error_msg.lower() or "429" in error_msg:
            status_code = 429
            error_msg = f"Rate limit reached. {error_msg.split('Please try again')[0].strip()}. Please try again in 5-10 minutes."
            
        raise HTTPException(status_code=status_code, detail=error_msg)


# ── Trigger Gig Hunt ──────────────────────────────────────────────────────
@router.post("/hunt")
async def start_hunt(background_tasks: BackgroundTasks):
    """
    Trigger the full LangGraph pipeline: sourcing → filter → crafter.
    Runs in the background so the API returns immediately.
    """
    if not _pipeline_state["resume_uploaded"]:
        raise HTTPException(
            status_code=400,
            detail="No resume uploaded. Please upload a resume first.",
        )

    if _pipeline_state["status"] == "hunting":
        raise HTTPException(
            status_code=409,
            detail="Pipeline is already running. Wait for it to complete.",
        )

    # Clear previous results
    clear_all_jobs()
    _pipeline_state.update({
        "status": "hunting",
        "result": None,
        "error": None,
    })

    # Run pipeline in background
    background_tasks.add_task(
        _run_pipeline_task,
        _pipeline_state["resume_text"],
        _pipeline_state["user_skills"],
    )

    return {
        "success": True,
        "status": "hunting",
        "message": "🚀 Gig hunt started! Searching across 5 platforms...",
    }


async def _run_pipeline_task(resume_text: str, user_skills: list[str]):
    """Background task that runs the LangGraph pipeline."""
    try:
        result = await run_pipeline(resume_text, user_skills)
        _pipeline_state.update({
            "status": "complete",
            "result": {
                "crafted_jobs": result.get("crafted_jobs", []),
                "raw_jobs_count": len(result.get("raw_jobs", [])),
                "filtered_jobs_count": len(result.get("filtered_jobs", [])),
                "crafted_jobs_count": len(result.get("crafted_jobs", [])),
                "errors": result.get("errors", []),
            },
        })
    except Exception as e:
        _pipeline_state.update({
            "status": "error",
            "error": str(e),
        })


# ── Get Pipeline Status ──────────────────────────────────────────────────
@router.get("/status")
async def get_status():
    """Return the current pipeline status and resume info."""
    return {
        "status": _pipeline_state["status"],
        "resume_uploaded": _pipeline_state["resume_uploaded"],
        "resume_file": _pipeline_state["resume_file"],
        "skills": _pipeline_state["user_skills"],
        "chunks_count": _pipeline_state["chunks_count"],
        "error": _pipeline_state.get("error"),
    }


# ── Get Job Results ───────────────────────────────────────────────────────
@router.get("/jobs")
async def get_jobs():
    """Return all discovered job leads from the database."""
    # If pipeline completed, return from result (includes email/resume)
    if _pipeline_state["status"] == "complete" and _pipeline_state.get("result"):
        try:
            return {
                "success": True,
                "status": "complete",
                "jobs": _pipeline_state["result"].get("crafted_jobs", []),
                "stats": {
                    "raw_jobs": _pipeline_state["result"].get("raw_jobs_count", 0),
                    "filtered_jobs": _pipeline_state["result"].get("filtered_jobs_count", 0),
                    "crafted_jobs": _pipeline_state["result"].get("crafted_jobs_count", 0),
                },
                "errors": _pipeline_state["result"].get("errors", []),
            }
        except Exception as e:
            # Fallback to DB if dictionary access fails
            pass

    # Otherwise return from DB
    jobs = get_all_jobs()
    return {
        "success": True,
        "status": _pipeline_state["status"],
        "jobs": jobs,
        "stats": {"total": len(jobs)},
    }


# ── Download Generated Resume PDF ────────────────────────────────────────
@router.get("/jobs/{job_id}/resume")
async def download_resume(job_id: str):
    """Serve the generated PDF resume for a specific job."""
    pdf_path = PDF_DIR / f"{job_id}.pdf"
    html_path = PDF_DIR / f"{job_id}.html"

    if pdf_path.exists():
        return FileResponse(
            str(pdf_path),
            media_type="application/pdf",
            filename=f"resume_{job_id}.pdf",
        )
    elif html_path.exists():
        return FileResponse(
            str(html_path),
            media_type="text/html",
            filename=f"resume_{job_id}.html",
        )

    # Try to find it from the pipeline results
    if _pipeline_state["result"]:
        for job in _pipeline_state["result"].get("crafted_jobs", []):
            path = job.get("resume_pdf_path", "")
            if path and job_id in path and os.path.exists(path):
                is_html = path.endswith(".html")
                return FileResponse(
                    path,
                    media_type="text/html" if is_html else "application/pdf",
                    filename=f"resume_{job_id}.{'html' if is_html else 'pdf'}",
                )
    
    raise HTTPException(status_code=404, detail="Resume file not found")


# ── Health Check ──────────────────────────────────────────────────────────
@router.get("/health")
async def health_check():
    """Simple health check endpoint."""
    return {
        "status": "healthy",
        "vector_db_chunks": get_chunk_count(),
    }
