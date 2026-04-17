from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base


class Client(Base):
    """Client ORM model — maps to the frontend Client interface."""

    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    company = Column(String(100), nullable=False)
    email = Column(String(150), nullable=True)
    initials = Column(String(4), nullable=False)
    avatar_bg = Column(String(30), nullable=False, default="bg-solo-blue")
    project = Column(String(100), nullable=False, default="Untitled Project")
    project_type = Column(String(50), nullable=True)  # design/dev/marketing/consulting/other
    status = Column(String(20), nullable=False, default="Active")  # Active / Needs attention / At risk
    health_color = Column(String(30), nullable=False, default="bg-solo-teal")
    health_score = Column(Integer, nullable=False, default=80)
    last_active = Column(String(20), nullable=False, default="Just now")
    start_date = Column(String(20), nullable=False, default="")
    progress = Column(Integer, nullable=False, default=0)
    gross_worth = Column(Float, nullable=False, default=0.0)
    collected = Column(Float, nullable=False, default=0.0)
    collected_percent = Column(Integer, nullable=False, default=0)
    source = Column(String(50), nullable=True)  # referral/linkedin/website/upwork/other
    budget = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
