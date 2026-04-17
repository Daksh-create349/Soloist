from pydantic import BaseModel
from typing import Optional
from datetime import date

class InvoiceBase(BaseModel):
    client_id: int
    invoice_number: str
    amount: float
    status: str = "sent"
    due_date: date
    paid_date: Optional[date] = None

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceResponse(InvoiceBase):
    id: int

    class Config:
        from_attributes = True
