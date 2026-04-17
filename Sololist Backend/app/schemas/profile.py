from pydantic import BaseModel
from typing import List, Optional

class UserConfigBase(BaseModel):
    name: str
    agency_name: str
    niche: str
    goals: List[str] = []

class UserConfigCreate(UserConfigBase):
    pass

class UserConfigResponse(UserConfigBase):
    id: int

    class Config:
        from_attributes = True
