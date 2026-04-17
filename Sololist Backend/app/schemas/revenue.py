from pydantic import BaseModel
from typing import Optional


class RevenueMetric(BaseModel):
    """Single revenue metric card data."""
    label: str
    value: str
    trend: str
    trendDir: str
    projected: str


class RevenueMetricsResponse(BaseModel):
    """Full revenue metrics response."""
    metrics: list[RevenueMetric]


class CapacityResponse(BaseModel):
    """Capacity planner data."""
    currentLoad: int  # percentage
    loadStatus: str  # "High Load" / "Optimal" / "Low"
    freeHours: float
    billableHours: int
    billableTarget: int
    opsHours: int
    opsTarget: int
    totalHoursWeekly: int
    aiInsight: str


class CapacityUpdate(BaseModel):
    """Update capacity settings."""
    total_hours_weekly: Optional[int] = None
    billable_target: Optional[int] = None
    current_billable: Optional[int] = None
    current_ops: Optional[int] = None


class ProfitabilitySector(BaseModel):
    """Single sector in profitability breakdown."""
    name: str
    share: int
    income: str
    hourly: str
    status: str


class ProfitabilityResponse(BaseModel):
    """Full profitability response."""
    sectors: list[ProfitabilitySector]
    avgMargin: str
    ltvCac: str
