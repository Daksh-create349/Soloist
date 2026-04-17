from sqlalchemy import Column, Integer, DateTime, func
from app.database import Base


class Capacity(Base):
    """Capacity ORM model — single-row config for capacity planner."""

    __tablename__ = "capacity"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    total_hours_weekly = Column(Integer, nullable=False, default=45)
    billable_target = Column(Integer, nullable=False, default=35)
    current_billable = Column(Integer, nullable=False, default=28)
    current_ops = Column(Integer, nullable=False, default=7)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
