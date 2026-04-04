from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import date, timedelta

from backend.database import get_db
from backend.models import Worker, Policy, PolicyStatusEnum
from backend.schemas import PolicyCreate, PolicyResponse
from backend.services.premium_service import calculate_weekly_premium

router = APIRouter()


@router.post("/create", response_model=PolicyResponse, status_code=201)
def create_policy(policy_in: PolicyCreate, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == policy_in.worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    # Cancel any existing active policy
    existing = db.query(Policy).filter(
        Policy.worker_id == policy_in.worker_id,
        Policy.status == PolicyStatusEnum.active
    ).first()
    if existing:
        existing.status = PolicyStatusEnum.cancelled

    # Calculate premium using AI service
    premium_data = calculate_weekly_premium(
        city=worker.city,
        platform=str(worker.platform.value),
        weekly_hours=worker.weekly_hours,
        avg_weekly_income=float(worker.avg_weekly_income or 3500),
    )

    policy = Policy(
        worker_id=worker.id,
        status=PolicyStatusEnum.active,
        weekly_premium=premium_data["weekly_premium"],
        coverage_amount=premium_data["coverage_amount"],
        risk_score=premium_data["risk_score"],
        risk_level=premium_data["risk_level"],
        weather_risk_score=premium_data["weather_risk_score"],
        aqi_risk_score=premium_data["aqi_risk_score"],
        flood_risk_score=premium_data["flood_risk_score"],
        historical_disruption_score=premium_data["historical_disruption_score"],
        start_date=date.today(),
        end_date=date.today() + timedelta(days=7),
        auto_renew=policy_in.auto_renew,
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


@router.get("/worker/{worker_id}", response_model=List[PolicyResponse])
def get_worker_policies(worker_id: UUID, db: Session = Depends(get_db)):
    return db.query(Policy).filter(Policy.worker_id == worker_id).all()


@router.get("/{policy_id}", response_model=PolicyResponse)
def get_policy(policy_id: UUID, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.put("/{policy_id}/cancel", response_model=PolicyResponse)
def cancel_policy(policy_id: UUID, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    policy.status = PolicyStatusEnum.cancelled
    db.commit()
    db.refresh(policy)
    return policy


@router.post("/calculate-premium")
def calculate_premium(
    city: str, platform: str,
    weekly_hours: int = 40,
    avg_weekly_income: float = 3500.0,
):
    return calculate_weekly_premium(city, platform, weekly_hours, avg_weekly_income)