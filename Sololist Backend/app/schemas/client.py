from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ClientBase(BaseModel):
    """Base schema shared by create/update/response."""
    name: str = Field(..., min_length=1, max_length=100)
    company: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = None
    project: str = Field(default="Untitled Project", max_length=100)
    project_type: Optional[str] = None
    status: str = Field(default="Active")
    health_score: int = Field(default=80, ge=0, le=100)
    progress: int = Field(default=0, ge=0, le=100)
    gross_worth: float = Field(default=0.0)
    collected: float = Field(default=0.0)
    collected_percent: int = Field(default=0, ge=0, le=100)
    source: Optional[str] = None
    budget: Optional[float] = None


class ClientCreate(ClientBase):
    """Schema for creating a new client."""
    pass


class ClientUpdate(BaseModel):
    """Schema for updating a client — all fields optional."""
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    project: Optional[str] = None
    project_type: Optional[str] = None
    status: Optional[str] = None
    health_score: Optional[int] = Field(default=None, ge=0, le=100)
    progress: Optional[int] = Field(default=None, ge=0, le=100)
    gross_worth: Optional[float] = None
    collected: Optional[float] = None
    collected_percent: Optional[int] = Field(default=None, ge=0, le=100)
    source: Optional[str] = None
    budget: Optional[float] = None


class ClientResponse(BaseModel):
    """Schema returned to frontend — matches the TS Client interface."""
    id: int
    name: str
    company: str
    email: Optional[str] = None
    initials: str
    avatarBg: str
    project: str
    project_type: Optional[str] = None
    status: str
    healthColor: str
    lastActive: str
    healthScore: int
    startDate: str
    progress: int
    grossWorth: str  # Formatted as "$12,000"
    collected: str   # Formatted as "$8,400"
    collectedPercent: int
    source: Optional[str] = None
    budget: Optional[float] = None

    model_config = {"from_attributes": True}
