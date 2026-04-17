from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse
from app.services import client_service

router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("", response_model=list[ClientResponse])
def list_clients(db: Session = Depends(get_db)):
    """Get all clients."""
    return client_service.get_all_clients(db)


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(client_id: int, db: Session = Depends(get_db)):
    """Get a single client by ID."""
    client = client_service.get_client(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.post("", response_model=ClientResponse, status_code=201)
def create_client(data: ClientCreate, db: Session = Depends(get_db)):
    """Create a new client."""
    return client_service.create_client(db, data)


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, data: ClientUpdate, db: Session = Depends(get_db)):
    """Update an existing client."""
    client = client_service.update_client(db, client_id, data)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.delete("/{client_id}", status_code=204)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    """Delete a client."""
    success = client_service.delete_client(db, client_id)
    if not success:
        raise HTTPException(status_code=404, detail="Client not found")
