from sqlalchemy import Column, Integer, String, DateTime, JSON, func
from app.database import Base


class Automation(Base):
    """Automation ORM model — maps to the frontend Automation interface."""

    __tablename__ = "automations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    trigger = Column(String(200), nullable=False)
    action = Column(String(200), nullable=False)
    status = Column(String(20), nullable=False, default="Active")  # Active / Paused
    last_run = Column(String(30), nullable=False, default="Never")
    trigger_type = Column(String(50), nullable=True)
    action_type = Column(String(50), nullable=True)
    delay_days = Column(Integer, nullable=True, default=3)
    tone = Column(String(20), nullable=True, default="professional")
    conditions = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
