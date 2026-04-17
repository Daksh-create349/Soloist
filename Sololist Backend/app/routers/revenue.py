from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.revenue import (
    RevenueMetricsResponse,
    CapacityResponse,
    CapacityUpdate,
    ProfitabilityResponse,
)
from app.services import revenue_service

router = APIRouter(prefix="/api/revenue", tags=["revenue"])


@router.get("/metrics", response_model=RevenueMetricsResponse)
def get_metrics(db: Session = Depends(get_db)):
    """Get revenue metrics (MRR, pipeline, avg project value)."""
    return revenue_service.get_revenue_metrics(db)


@router.get("/capacity", response_model=CapacityResponse)
def get_capacity(db: Session = Depends(get_db)):
    """Get capacity planner data."""
    return revenue_service.get_capacity(db)


@router.put("/capacity", response_model=CapacityResponse)
def update_capacity(data: CapacityUpdate, db: Session = Depends(get_db)):
    """Update capacity settings."""
    return revenue_service.update_capacity(db, data)


@router.get("/profitability", response_model=ProfitabilityResponse)
def get_profitability(db: Session = Depends(get_db)):
    """Get income breakdown by sector."""
    return revenue_service.get_profitability(db)
