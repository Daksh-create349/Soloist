from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.profile import UserConfig
from app.models.opportunity import Opportunity
from app.schemas.profile import UserConfigResponse, UserConfigCreate
from app.services import ai_service

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
async def update_profile(profile_data: UserConfigCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    profile = db.query(UserConfig).filter(UserConfig.id == 1).first()
    
    old_niche = profile.niche if profile else None
    
    if not profile:
        profile = UserConfig(id=1, **profile_data.model_dump())
        db.add(profile)
    else:
        for key, value in profile_data.model_dump().items():
            setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    
    # If niche changed, trigger re-scouting
    if old_niche != profile_data.niche:
        background_tasks.add_task(re_scout_opportunities, profile_data.niche, db)
        
    return profile

@router.post("/calibrate")
async def calibrate_profile(data: dict):
    """AI-powered profile calibration for onboarding."""
    name = data.get("name", "Operator")
    bio = data.get("bio", "")
    return await ai_service.calibrate_profile(name, bio)

async def re_scout_opportunities(niche: str, db: Session):
    """Background task to refresh opportunities for a new niche."""
    try:
        # 1. Generate new jobs
        new_jobs = await ai_service.generate_opportunities(niche)
        
        # 2. Clear old jobs
        db.query(Opportunity).delete()
        
        # 3. Insert new jobs
        for job in new_jobs:
            db_opp = Opportunity(**job)
            db.add(db_opp)
        
        db.commit()
        print(f"✅ Successfully re-scouted for {niche}")
    except Exception as e:
        db.rollback()
        print(f"❌ Re-scouting failed: {e}")
