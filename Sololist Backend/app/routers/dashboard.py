from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.dashboard import DashboardStatsResponse
from app.services import revenue_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """Get aggregated dashboard stats."""
    return revenue_service.get_dashboard_stats(db)
