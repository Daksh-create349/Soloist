from pydantic import BaseModel
from typing import List, Optional

class UserConfigBase(BaseModel):
    name: str
    agency_name: str
    niche: str
    goals: List[str] = []
    integrations: dict = {}

class UserConfigCreate(UserConfigBase):
    pass

class UserConfigUpdate(BaseModel):
    name: Optional[str] = None
    agency_name: Optional[str] = None
    niche: Optional[str] = None
    goals: Optional[List[str]] = None
    integrations: Optional[dict] = None

class UserConfigResponse(UserConfigBase):
    id: int

    class Config:
        from_attributes = True
