from pydantic import BaseModel, Field
from typing import Optional, Any


class AutomationBase(BaseModel):
    """Base schema for automation data."""
    name: str = Field(..., min_length=1, max_length=100)
    trigger: str = Field(..., min_length=1, max_length=200)
    action: str = Field(..., min_length=1, max_length=200)
    status: str = Field(default="Active")
    trigger_type: Optional[str] = None
    action_type: Optional[str] = None
    delay_days: Optional[int] = Field(default=3, ge=0)
    tone: Optional[str] = Field(default="professional")
    conditions: Optional[dict[str, Any]] = None


class AutomationCreate(AutomationBase):
    """Schema for creating a new automation."""
    pass


class AutomationUpdate(BaseModel):
    """Schema for updating an automation."""
    name: Optional[str] = None
    trigger: Optional[str] = None
    action: Optional[str] = None
    status: Optional[str] = None
    trigger_type: Optional[str] = None
    action_type: Optional[str] = None
    delay_days: Optional[int] = Field(default=None, ge=0)
    tone: Optional[str] = None
    conditions: Optional[dict[str, Any]] = None


class AutomationResponse(BaseModel):
    """Schema returned to frontend — matches the TS Automation interface."""
    id: int
    name: str
    trigger: str
    action: str
    status: str
    lastRun: str
    trigger_type: Optional[str] = None
    action_type: Optional[str] = None
    delay_days: Optional[int] = None
    tone: Optional[str] = None
    conditions: Optional[dict[str, Any]] = None

    model_config = {"from_attributes": True}
