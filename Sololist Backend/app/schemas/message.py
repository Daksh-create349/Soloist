from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class MessageBase(BaseModel):
    client_id: int
    role: str
    content: str


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: int
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    history: List[MessageResponse]
    client_name: str
    company: str
