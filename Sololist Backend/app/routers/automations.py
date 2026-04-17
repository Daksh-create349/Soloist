from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.automation import AutomationCreate, AutomationUpdate, AutomationResponse
from app.services import automation_service
from typing import Optional

router = APIRouter(prefix="/api/automations", tags=["automations"])


@router.get("", response_model=list[AutomationResponse])
def list_automations(
    search: Optional[str] = Query(None, description="Search by name or trigger"),
    db: Session = Depends(get_db),
):
    """Get all automations, optionally filtered by search term."""
    return automation_service.get_all_automations(db, search=search)


@router.post("", response_model=AutomationResponse, status_code=201)
def create_automation(data: AutomationCreate, db: Session = Depends(get_db)):
    """Create a new automation."""
    return automation_service.create_automation(db, data)


@router.put("/{auto_id}", response_model=AutomationResponse)
def update_automation(auto_id: int, data: AutomationUpdate, db: Session = Depends(get_db)):
    """Update an existing automation."""
    result = automation_service.update_automation(db, auto_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Automation not found")
    return result


@router.patch("/{auto_id}/toggle", response_model=AutomationResponse)
def toggle_automation(auto_id: int, db: Session = Depends(get_db)):
    """Toggle an automation between Active and Paused."""
    result = automation_service.toggle_automation(db, auto_id)
    if not result:
        raise HTTPException(status_code=404, detail="Automation not found")
    return result


@router.delete("/{auto_id}", status_code=204)
def delete_automation(auto_id: int, db: Session = Depends(get_db)):
    """Delete an automation."""
    success = automation_service.delete_automation(db, auto_id)
    if not success:
        raise HTTPException(status_code=404, detail="Automation not found")
