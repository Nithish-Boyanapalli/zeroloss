from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from backend.database import get_db
from backend.models import Disruption
from backend.schemas import DisruptionCreate, DisruptionResponse
from backend.services.trigger_service import trigger_claims_for_city, scan_city_for_disruptions

router = APIRouter()


@router.post("/scan/{city}")
async def scan_city(city: str, db: Session = Depends(get_db)):
    result = await trigger_claims_for_city(city, db)
    return result


@router.get("/active/{city}", response_model=List[DisruptionResponse])
def get_active_disruptions(city: str, db: Session = Depends(get_db)):
    return db.query(Disruption).filter(
        Disruption.city.ilike(city),
        Disruption.triggered == True
    ).order_by(Disruption.detected_at.desc()).limit(20).all()


@router.get("/", response_model=List[DisruptionResponse])
def list_disruptions(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Disruption).order_by(
        Disruption.detected_at.desc()
    ).offset(skip).limit(limit).all()


@router.post("/manual", response_model=DisruptionResponse, status_code=201)
def create_manual_disruption(data: DisruptionCreate, db: Session = Depends(get_db)):
    from backend.models import DisruptionTypeEnum
    disruption = Disruption(
        type=data.type,
        city=data.city,
        zone=data.zone,
        severity=data.severity,
        threshold_value=data.threshold_value,
        unit=data.unit,
        triggered=data.severity >= data.threshold_value,
        source_api=data.source_api or "manual",
    )
    db.add(disruption)
    db.commit()
    db.refresh(disruption)
    return disruption