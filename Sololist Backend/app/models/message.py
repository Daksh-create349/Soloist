from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, func
from app.database import Base


class Message(Base):
    """Messaging model for client communication."""

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' or 'client'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, server_default=func.now())
    is_read = Column(Boolean, default=False)
