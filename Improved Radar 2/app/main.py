"""
Soloist Agent — FastAPI Application Entry Point
Serves the API and the static frontend dashboard.
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import STATIC_DIR
from app.core.database import init_db
from app.api.routes import router

app = FastAPI(
    title="Soloist Opportunity Agent",
    description="Autonomous freelance gig discovery engine",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routes ────────────────────────────────────────────────────────────
app.include_router(router)

# ── Static Files ──────────────────────────────────────────────────────────
STATIC_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# ── Serve Frontend ────────────────────────────────────────────────────────
@app.get("/")
async def root():
    """Serve the main frontend dashboard."""
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "Soloist Agent API — Frontend not found. Visit /docs for API."}


# ── Startup ───────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    """Initialize database on startup."""
    init_db()
    print("\n✨ Soloist Opportunity Agent — Ready!")
    print("   Dashboard: http://localhost:8000")
    print("   API Docs:  http://localhost:8000/docs\n")


def run():
    """Entry point for `soloist` command."""
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    run()
