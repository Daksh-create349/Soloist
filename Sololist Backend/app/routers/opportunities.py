from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.schemas.opportunity import OpportunityCreate, OpportunityResponse
from app.models.opportunity import Opportunity
from app.models.profile import UserConfig
from app.services import ai_service
import asyncio

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])


@router.get("", response_model=list[OpportunityResponse])
async def list_opportunities(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Get all opportunities. Triggers AI scouting if the rack is empty."""
    opps = db.query(Opportunity).order_by(Opportunity.match_score.desc()).all()
    
    if not opps:
        # Trigger background scouting
        profile = db.query(UserConfig).first()
        if profile:
            # We don't pass the request's 'db' session to background tasks 
            # as it might close before the task starts.
            background_tasks.add_task(re_scout_immediately, profile.niche)
            
    return opps

async def re_scout_immediately(niche: str):
    """Background task to populate the radar with a fresh session."""
    # Give the response a moment to finish before hammering the DB
    await asyncio.sleep(1)
    
    db = SessionLocal()
    try:
        new_gigs = await ai_service.generate_opportunities(niche)
        for gig in new_gigs:
            db_opp = Opportunity(**gig)
            db.add(db_opp)
        db.commit()
    except Exception as e:
        print(f"Background Scout Error: {e}")
        db.rollback()
    finally:
        db.close()


@router.get("/{opportunity_id}", response_model=OpportunityResponse)
def get_opportunity(opportunity_id: int, db: Session = Depends(get_db)):
    """Get a single opportunity by ID."""
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp


@router.post("", response_model=OpportunityResponse, status_code=201)
def create_opportunity(data: OpportunityCreate, db: Session = Depends(get_db)):
    """Create a new opportunity."""
    db_opp = Opportunity(**data.model_dump())
    db.add(db_opp)
    db.commit()
    db.refresh(db_opp)
    return db_opp


@router.delete("/{opportunity_id}", status_code=204)
def delete_opportunity(opportunity_id: int, db: Session = Depends(get_db)):
    """Delete an opportunity."""
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    db.delete(opp)
    db.commit()
