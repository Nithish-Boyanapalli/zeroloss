from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from backend.database import get_db
from backend.models import Payout
from backend.schemas import PayoutResponse

router = APIRouter()


@router.get("/worker/{worker_id}", response_model=List[PayoutResponse])
def get_worker_payouts(worker_id: UUID, db: Session = Depends(get_db)):
    return db.query(Payout).filter(
        Payout.worker_id == worker_id
    ).order_by(Payout.initiated_at.desc()).all()


@router.get("/{payout_id}", response_model=PayoutResponse)
def get_payout(payout_id: UUID, db: Session = Depends(get_db)):
    payout = db.query(Payout).filter(Payout.id == payout_id).first()
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")
    return payout


@router.get("/", response_model=List[PayoutResponse])
def list_payouts(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Payout).order_by(
        Payout.initiated_at.desc()
    ).offset(skip).limit(limit).all()