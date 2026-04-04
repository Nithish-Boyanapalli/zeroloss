from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime

from backend.database import get_db
from backend.models import Claim, Policy, Disruption, Worker, ClaimStatusEnum
from backend.schemas import ClaimResponse, ClaimReview
from backend.services.fraud_service import calculate_fraud_score
from backend.services.payout_service import initiate_payout

router = APIRouter()


@router.get("/", response_model=List[ClaimResponse])
def list_claims(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Claim).order_by(Claim.triggered_at.desc()).offset(skip).limit(limit).all()


@router.get("/worker/{worker_id}", response_model=List[ClaimResponse])
def get_worker_claims(worker_id: UUID, db: Session = Depends(get_db)):
    return (
        db.query(Claim)
        .join(Policy, Claim.policy_id == Policy.id)
        .filter(Policy.worker_id == worker_id)
        .order_by(Claim.triggered_at.desc())
        .all()
    )


@router.get("/{claim_id}", response_model=ClaimResponse)
def get_claim(claim_id: UUID, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim


@router.post("/{claim_id}/review", response_model=ClaimResponse)
async def review_claim(
    claim_id: UUID,
    review: ClaimReview,
    db: Session = Depends(get_db),
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    if review.approve:
        claim.status = ClaimStatusEnum.approved
        claim.approved_at = datetime.utcnow()
        claim.reviewer_notes = review.reviewer_notes
        claim.reviewed_by = review.reviewed_by

        # Get worker for payout
        policy = db.query(Policy).filter(Policy.id == claim.policy_id).first()
        worker = db.query(Worker).filter(Worker.id == policy.worker_id).first()
        await initiate_payout(db, claim, worker)
    else:
        claim.status = ClaimStatusEnum.rejected
        claim.rejected_at = datetime.utcnow()
        claim.reviewer_notes = review.reviewer_notes
        claim.reviewed_by = review.reviewed_by

    db.commit()
    db.refresh(claim)
    return claim