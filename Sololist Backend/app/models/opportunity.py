from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base


class Opportunity(Base):
    """Job Opportunity model for the Radar feature."""

    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    company = Column(String(100), nullable=False)
    source = Column(String(50), nullable=False)  # Upwork, LinkedIn, Reddit, etc.
    budget = Column(String(100), nullable=True)
    match_score = Column(Integer, nullable=False, default=0)
    posted_at = Column(String(50), nullable=False) # "2 hours ago", etc.
    description = Column(String(1000), nullable=True)
    platform = Column(String(50), nullable=True)
    rate = Column(String(50), nullable=True)
    
    badge_color = Column(String(50), nullable=True, default="bg-solo-blue")
    badge_text = Column(String(50), nullable=True, default="text-solo-blue")

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
