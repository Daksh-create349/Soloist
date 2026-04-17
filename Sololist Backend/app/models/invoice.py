from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, func
from app.database import Base


class Invoice(Base):
    """Invoice ORM model — tracks client invoices."""

    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    invoice_number = Column(String(20), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(20), nullable=False, default="draft")  # draft/sent/paid/overdue
    due_date = Column(Date, nullable=True)
    paid_date = Column(Date, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
