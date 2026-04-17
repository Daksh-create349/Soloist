"""Soloist Backend — FastAPI Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database import create_tables
from app.routers import clients, automations, revenue, dashboard, ai, opportunities, messages, profile, invoices
from app.seed import seed


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run on startup: create tables."""
    create_tables()
    yield


app = FastAPI(
    title="Soloist API",
    description="Backend API for Soloist — the AI operating system for solo operators.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(clients.router)
app.include_router(automations.router)
app.include_router(revenue.router)
app.include_router(dashboard.router)
app.include_router(ai.router)
app.include_router(opportunities.router)
app.include_router(messages.router)
app.include_router(profile.router)
app.include_router(invoices.router)


@app.get("/")
def root():
    return {
        "app": "Soloist API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
