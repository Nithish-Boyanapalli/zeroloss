from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from backend.database import get_db
from backend.models import Worker, Policy, Claim, Payout
from backend.schemas import WorkerCreate, WorkerUpdate, WorkerResponse, WorkerDashboard, PolicyResponse, ClaimResponse

router = APIRouter()


@router.post("/register", response_model=WorkerResponse, status_code=201)
def register_worker(worker_in: WorkerCreate, db: Session = Depends(get_db)):
    existing = db.query(Worker).filter(Worker.phone == worker_in.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Worker with this phone number already exists")

    worker = Worker(**worker_in.model_dump())
    db.add(worker)
    db.commit()
    db.refresh(worker)
    return worker


@router.get("/", response_model=List[WorkerResponse])
def list_workers(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Worker).filter(Worker.is_active == True).offset(skip).limit(limit).all()


@router.get("/{worker_id}", response_model=WorkerResponse)
def get_worker(worker_id: UUID, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker


@router.put("/{worker_id}", response_model=WorkerResponse)
def update_worker(worker_id: UUID, update: WorkerUpdate, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    for field, value in update.model_dump(exclude_none=True).items():
        setattr(worker, field, value)
    db.commit()
    db.refresh(worker)
    return worker


@router.get("/{worker_id}/dashboard", response_model=WorkerDashboard)
def worker_dashboard(worker_id: UUID, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    active_policy = db.query(Policy).filter(
        Policy.worker_id == worker_id,
        Policy.status == "active"
    ).first()

    all_claims = []
    if active_policy:
        all_claims = db.query(Claim).filter(Claim.policy_id == active_policy.id).all()

    approved = [c for c in all_claims if c.status in ("approved", "paid")]
    total_paid = sum(
        float(p.amount)
        for c in all_claims
        for p in [db.query(Payout).filter(Payout.claim_id == c.id).first()]
        if p and p.status == "completed"
    )

    return WorkerDashboard(
        worker=worker,
        active_policy=active_policy,
        total_claims=len(all_claims),
        approved_claims=len(approved),
        total_paid_out=round(total_paid, 2),
        recent_claims=all_claims[-5:],
    )