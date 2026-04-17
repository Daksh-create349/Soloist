from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.invoice import Invoice
from app.schemas.invoice import InvoiceResponse, InvoiceCreate

router = APIRouter(prefix="/api/invoices", tags=["invoices"])

@router.get("", response_model=List[InvoiceResponse])
def list_invoices(db: Session = Depends(get_db)):
    return db.query(Invoice).all()

@router.get("/client/{client_id}", response_model=List[InvoiceResponse])
def get_client_invoices(client_id: int, db: Session = Depends(get_db)):
    return db.query(Invoice).filter(Invoice.client_id == client_id).all()

@router.post("", response_model=InvoiceResponse, status_code=201)
def create_invoice(data: InvoiceCreate, db: Session = Depends(get_db)):
    db_invoice = Invoice(**data.model_dump())
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice
