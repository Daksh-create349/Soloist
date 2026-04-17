from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.profile import UserConfig
from app.schemas.profile import UserConfigResponse, UserConfigCreate

router = APIRouter(prefix="/api/profile", tags=["profile"])

@router.get("", response_model=UserConfigResponse)
def get_profile(db: Session = Depends(get_db)):
    # We treat ID 1 as the default profile for now
    profile = db.query(UserConfig).filter(UserConfig.id == 1).first()
    if not profile:
        # Return a default empty profile if none exists
        return UserConfigResponse(id=0, name="New User", agency_name="Soloist", niche="B2B SaaS", goals=[])
    return profile

@router.put("", response_model=UserConfigResponse)
def update_profile(profile_data: UserConfigCreate, db: Session = Depends(get_db)):
    profile = db.query(UserConfig).filter(UserConfig.id == 1).first()
    
    if not profile:
        profile = UserConfig(id=1, **profile_data.model_dump())
        db.add(profile)
    else:
        for key, value in profile_data.model_dump().items():
            setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile
