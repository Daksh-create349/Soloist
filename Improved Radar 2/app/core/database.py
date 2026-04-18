"""
Soloist Agent — SQLite Database & JobLead ORM Model
Uses SQLAlchemy with async-compatible patterns for job caching.
"""

from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import SQLITE_PATH

engine = create_engine(f"sqlite:///{SQLITE_PATH}", echo=False)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class JobLead(Base):
    """Represents a discovered freelance job opportunity."""
    __tablename__ = "job_leads"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(500), nullable=False)
    source = Column(String(50), nullable=False)  # upwork, fiverr, linkedin, reddit, ddg
    url = Column(String(2000), nullable=False)
    description = Column(Text, default="")
    budget = Column(String(200), default="")
    match_score = Column(Float, default=0.0)
    email_draft = Column(Text, default="")
    resume_pdf_path = Column(String(1000), default="")
    resume_markdown = Column(Text, default="")
    status = Column(String(50), default="discovered")  # discovered, filtered, crafted, applied
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "source": self.source,
            "url": self.url,
            "description": self.description,
            "budget": self.budget,
            "match_score": self.match_score,
            "email_draft": self.email_draft,
            "resume_pdf_path": self.resume_pdf_path,
            "resume_markdown": self.resume_markdown,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


def init_db():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Yield a DB session (for FastAPI dependency injection)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def save_job_lead(job: dict) -> JobLead:
    """Persist a single job lead to the database."""
    session = SessionLocal()
    try:
        lead = JobLead(
            title=job.get("title", "Untitled"),
            source=job.get("source", "unknown"),
            url=job.get("url", ""),
            description=job.get("description", ""),
            budget=job.get("budget", ""),
            match_score=job.get("match_score", 0.0),
            email_draft=job.get("email_draft", ""),
            resume_pdf_path=job.get("resume_pdf_path", ""),
            resume_markdown=job.get("resume_markdown", ""),
            status=job.get("status", "discovered"),
        )
        session.add(lead)
        session.commit()
        session.refresh(lead)
        return lead
    finally:
        session.close()


def get_all_jobs() -> list[dict]:
    """Return all job leads as dicts, newest first."""
    session = SessionLocal()
    try:
        leads = session.query(JobLead).order_by(JobLead.created_at.desc()).all()
        return [lead.to_dict() for lead in leads]
    finally:
        session.close()


def clear_all_jobs():
    """Delete all job leads (for fresh runs)."""
    session = SessionLocal()
    try:
        session.query(JobLead).delete()
        session.commit()
    finally:
        session.close()
