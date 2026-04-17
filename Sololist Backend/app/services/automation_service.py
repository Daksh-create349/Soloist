from sqlalchemy.orm import Session
from app.models.automation import Automation
from app.schemas.automation import AutomationCreate, AutomationUpdate, AutomationResponse
from typing import Optional


def _to_response(auto: Automation) -> AutomationResponse:
    """Convert ORM model to frontend-compatible response."""
    return AutomationResponse(
        id=auto.id,
        name=auto.name,
        trigger=auto.trigger,
        action=auto.action,
        status=auto.status,
        lastRun=auto.last_run,
        trigger_type=auto.trigger_type,
        action_type=auto.action_type,
        delay_days=auto.delay_days,
        tone=auto.tone,
        conditions=auto.conditions,
    )


def get_all_automations(db: Session, search: Optional[str] = None) -> list[AutomationResponse]:
    query = db.query(Automation)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            Automation.name.ilike(search_term) | Automation.trigger.ilike(search_term)
        )
    automations = query.order_by(Automation.id).all()
    return [_to_response(a) for a in automations]


def create_automation(db: Session, data: AutomationCreate) -> AutomationResponse:
    automation = Automation(
        name=data.name,
        trigger=data.trigger,
        action=data.action,
        status=data.status,
        last_run="Never",
        trigger_type=data.trigger_type,
        action_type=data.action_type,
        delay_days=data.delay_days,
        tone=data.tone,
        conditions=data.conditions,
    )
    db.add(automation)
    db.commit()
    db.refresh(automation)
    return _to_response(automation)


def update_automation(db: Session, auto_id: int, data: AutomationUpdate) -> Optional[AutomationResponse]:
    automation = db.query(Automation).filter(Automation.id == auto_id).first()
    if not automation:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(automation, key, value)

    db.commit()
    db.refresh(automation)
    return _to_response(automation)


def toggle_automation(db: Session, auto_id: int) -> Optional[AutomationResponse]:
    automation = db.query(Automation).filter(Automation.id == auto_id).first()
    if not automation:
        return None

    automation.status = "Paused" if automation.status == "Active" else "Active"
    db.commit()
    db.refresh(automation)
    return _to_response(automation)


def delete_automation(db: Session, auto_id: int) -> bool:
    automation = db.query(Automation).filter(Automation.id == auto_id).first()
    if not automation:
        return False
    db.delete(automation)
    db.commit()
    return True
