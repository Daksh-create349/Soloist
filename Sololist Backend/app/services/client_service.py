from sqlalchemy.orm import Session
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse
from typing import Optional
from datetime import datetime

# Rotating avatar backgrounds
AVATAR_BGS = ["bg-solo-blue", "bg-zinc-800", "bg-solo-teal", "bg-solo-amber", "bg-solo-coral"]

# Map health score to status & color
def _compute_health(score: int) -> tuple[str, str]:
    if score > 75:
        return "Active", "bg-solo-teal"
    elif score > 45:
        return "Needs attention", "bg-solo-amber"
    else:
        return "At risk", "bg-solo-coral"


def _generate_initials(name: str) -> str:
    parts = name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[-1][0]).upper()
    return name[:2].upper()


def _format_currency(amount: float) -> str:
    if amount >= 1000:
        return f"${amount:,.0f}"
    return f"${amount:.0f}"


def _format_start_date() -> str:
    now = datetime.now()
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return f"{months[now.month - 1]} '{str(now.year)[-2:]}"


def _to_response(client: Client) -> ClientResponse:
    """Convert ORM model to the frontend-compatible response schema."""
    return ClientResponse(
        id=client.id,
        name=client.name,
        company=client.company,
        email=client.email,
        initials=client.initials,
        avatarBg=client.avatar_bg,
        project=client.project,
        project_type=client.project_type,
        status=client.status,
        healthColor=client.health_color,
        lastActive=client.last_active,
        healthScore=client.health_score,
        startDate=client.start_date,
        progress=client.progress,
        grossWorth=_format_currency(client.gross_worth),
        collected=_format_currency(client.collected),
        collectedPercent=client.collected_percent,
        source=client.source,
        budget=client.budget,
    )


def get_all_clients(db: Session) -> list[ClientResponse]:
    clients = db.query(Client).order_by(Client.id).all()
    return [_to_response(c) for c in clients]


def get_client(db: Session, client_id: int) -> Optional[ClientResponse]:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        return None
    return _to_response(client)


def create_client(db: Session, data: ClientCreate) -> ClientResponse:
    # Auto-compute derived fields
    initials = _generate_initials(data.name)
    avatar_bg = AVATAR_BGS[db.query(Client).count() % len(AVATAR_BGS)]
    status, health_color = _compute_health(data.health_score)

    # Allow explicit status override
    if data.status and data.status != "Active":
        status = data.status

    client = Client(
        name=data.name,
        company=data.company,
        email=data.email,
        initials=initials,
        avatar_bg=avatar_bg,
        project=data.project,
        project_type=data.project_type,
        status=status,
        health_color=health_color,
        health_score=data.health_score,
        last_active="Just now",
        start_date=_format_start_date(),
        progress=data.progress,
        gross_worth=data.gross_worth,
        collected=data.collected,
        collected_percent=data.collected_percent,
        source=data.source,
        budget=data.budget,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return _to_response(client)


def update_client(db: Session, client_id: int, data: ClientUpdate) -> Optional[ClientResponse]:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        return None

    update_data = data.model_dump(exclude_unset=True)

    # Recompute derived fields if health_score changes
    if "health_score" in update_data:
        status, health_color = _compute_health(update_data["health_score"])
        if "status" not in update_data:
            update_data["status"] = status
        update_data["health_color"] = health_color

    # Recompute initials if name changes
    if "name" in update_data:
        update_data["initials"] = _generate_initials(update_data["name"])

    for key, value in update_data.items():
        setattr(client, key, value)

    client.last_active = "Just now"
    db.commit()
    db.refresh(client)
    return _to_response(client)


def delete_client(db: Session, client_id: int) -> bool:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        return False
    db.delete(client)
    db.commit()
    return True
