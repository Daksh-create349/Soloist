from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.profile import UserConfig
from app.services import ai_service

router = APIRouter(prefix="/api/ai", tags=["ai"])


class EmailDraftRequest(BaseModel):
    client_name: str
    client_email: str = ""
    project: str = ""
    tone: str = "friendly"
    context: Optional[str] = None


class ProposalDraftRequest(BaseModel):
    job_title: str
    company: str
    platform: str = "Upwork"
    rate: str = "$85/hr"
    description: str = ""
    tone: str = "professional"


class ClientIntelligenceRequest(BaseModel):
    client_name: str
    project: str
    health_score: int


@router.post("/draft-email")
async def draft_email(data: EmailDraftRequest, db: Session = Depends(get_db)):
    """Generate an AI-drafted email for a client."""
    profile = db.query(UserConfig).first()
    return await ai_service.generate_email_draft(
        client_name=data.client_name,
        client_email=data.client_email,
        project=data.project,
        tone=data.tone,
        context=data.context,
        user_name=profile.name if profile else "Daksh",
        user_niche=profile.niche if profile else "Solo Operator"
    )


@router.post("/draft-proposal")
async def draft_proposal(data: ProposalDraftRequest, db: Session = Depends(get_db)):
    """Generate an AI-drafted proposal for a job opportunity."""
    profile = db.query(UserConfig).first()
    return await ai_service.generate_proposal_draft(
        job_title=data.job_title,
        company=data.company,
        platform=data.platform,
        rate=data.rate,
        description=data.description,
        tone=data.tone,
        user_name=profile.name if profile else "Daksh Shrivastav",
        user_niche=profile.niche if profile else "Solo Operator"
    )


@router.post("/client-intelligence")
async def client_intelligence(data: ClientIntelligenceRequest):
    """Get AI intelligence insights for a client."""
    return await ai_service.get_client_intelligence(
        client_name=data.client_name,
        project=data.project,
        health_score=data.health_score,
    )
