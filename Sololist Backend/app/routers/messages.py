from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.message import Message
from app.models.client import Client
from app.schemas.message import MessageCreate, MessageResponse, ChatHistoryResponse
from typing import List

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.post("/", response_model=MessageResponse)
def send_message(msg: MessageCreate, db: Session = Depends(get_db)):
    """Send a message to a client (user to client or simulated client to user)."""
    db_msg = Message(**msg.model_dump())
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg


@router.get("/{client_id}", response_model=ChatHistoryResponse)
def get_chat_history(client_id: int, db: Session = Depends(get_db)):
    """Fetch conversation history for a specific client."""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    history = (
        db.query(Message)
        .filter(Message.client_id == client_id)
        .order_by(Message.timestamp.asc())
        .all()
    )

    return ChatHistoryResponse(
        history=history,
        client_name=client.name,
        company=client.company
    )


@router.patch("/{message_id}/read", response_model=MessageResponse)
def mark_as_read(message_id: int, db: Session = Depends(get_db)):
    """Mark a specific message as read."""
    db_msg = db.query(Message).filter(Message.id == message_id).first()
    if not db_msg:
        raise HTTPException(status_code=404, detail="Message not found")
    
    db_msg.is_read = True
    db.commit()
    db.refresh(db_msg)
    return db_msg
