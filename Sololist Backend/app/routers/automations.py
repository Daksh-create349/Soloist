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

from app.models.automation import Automation
from app.config import get_settings

@router.post("/{auto_id}/execute")
async def execute_automation(auto_id: int, db: Session = Depends(get_db)):
    """Run the automation immediately."""
    from app.integrations.notion import notion_client_factory
    from app.integrations.jira import jira_client_factory
    from app.integrations.calendar import calendar_client_factory
    from app.integrations.email import email_client_factory
    from app.models.profile import UserConfig

    auto = db.query(Automation).filter(Automation.id == auto_id).first()
    if not auto:
        raise HTTPException(status_code=404, detail="Automation not found")
        
    user_config = db.query(UserConfig).first()
    user_integrations = user_config.integrations if user_config else {}
    settings = get_settings()
    action_type = auto.action_type
    
    # helper to get key from user_integrations or settings
    def get_key(key_name, settings_val):
        return user_integrations.get(key_name) or settings_val

    # 1. NOTION
    if action_type == "sync_notion" or "notion" in auto.action.lower():
        api_key = get_key("notion_api_key", settings.NOTION_API_KEY)
        db_id = get_key("notion_database_id", settings.NOTION_DATABASE_ID)
        notion = notion_client_factory(api_key, db_id)
        result = await notion.create_database_entry(
            title=f"Note from Soloist: {auto.name}",
            description="Automated log from Soloist dashboard.",
            status="Inbox"
        )
        return {
            "success": result.get("success", False), 
            "message": result.get("message", "Triggered Notion Sync"), 
            "simulated": result.get("simulated", False),
            "detail": result
        }
        
    # 2. JIRA
    if action_type == "sync_jira" or "jira" in auto.action.lower():
        url = get_key("jira_url", settings.JIRA_URL)
        email = get_key("jira_email", settings.JIRA_EMAIL)
        token = get_key("jira_api_token", settings.JIRA_API_TOKEN)
        jira = jira_client_factory(url, email, token)
        result = await jira.create_issue(
            summary=f"Soloist Alert: {auto.name}",
            description=f"Automated bug report triggered by: {auto.trigger}"
        )
        return {
            "success": result.get("success", False), 
            "message": result.get("message", "Triggered JIRA Sync"), 
            "simulated": result.get("simulated", False),
            "detail": result
        }

    # 3. GOOGLE CALENDAR
    if action_type == "add_calendar" or "calendar" in auto.action.lower():
        creds = get_key("google_calendar_credentials", settings.GOOGLE_CALENDAR_CREDENTIALS_FILE)
        calendar = calendar_client_factory(creds)
        result = calendar.create_event(
            summary=f"Soloist Tasks: {auto.name}",
            description=f"Scheduled by Soloist Automation. Trigger: {auto.trigger}"
        )
        return {
            "success": result.get("success", False), 
            "message": result.get("message", "Triggered Google Calendar"), 
            "simulated": result.get("simulated", False),
            "detail": result
        }

    # 4. EMAIL
    if action_type == "send_email" or "email" in auto.action.lower():
        user = get_key("gmail_user", settings.GMAIL_USER)
        pw = get_key("gmail_app_password", settings.GMAIL_APP_PASSWORD)
        email_client = email_client_factory(user, pw)
        target_email = user if user else "daksh.shrivastav.dev@gmail.com"
        result = email_client.send_email(
            to_email=target_email,
            subject=f"Soloist Automation: {auto.name}",
            body=f"This is an automated email from your Soloist dashboard.\n\nTrigger: {auto.trigger}\nAction: {auto.action}"
        )
        return {
            "success": result.get("success", False), 
            "message": result.get("message", "Triggered Email Send"), 
            "simulated": result.get("simulated", False),
            "detail": result
        }
        
    return {"success": True, "message": f"Simulated successful execution for {auto.name}."}
