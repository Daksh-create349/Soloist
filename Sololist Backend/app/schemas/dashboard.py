from pydantic import BaseModel


class DashboardStat(BaseModel):
    """Single stat card on the dashboard."""
    label: str
    value: str
    subtext: str
    trend: str  # "positive" / "neutral" / "negative"
    href: str


class DashboardStatsResponse(BaseModel):
    """All dashboard stats combined."""
    stats: list[DashboardStat]
