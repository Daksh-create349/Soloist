from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class OpportunityBase(BaseModel):
    title: str
    company: str
    source: str
    budget: Optional[str] = None
    match_score: int = 0
    posted_at: str
    description: Optional[str] = None
    platform: Optional[str] = None
    rate: Optional[str] = None
    badge_color: Optional[str] = "bg-solo-blue"
    badge_text: Optional[str] = "text-solo-blue"


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityResponse(OpportunityBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
