from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.opportunity import OpportunityCreate, OpportunityResponse
from app.models.opportunity import Opportunity

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])


@router.get("", response_model=list[OpportunityResponse])
def list_opportunities(db: Session = Depends(get_db)):
    """Get all opportunities."""
    return db.query(Opportunity).order_by(Opportunity.match_score.desc()).all()


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
