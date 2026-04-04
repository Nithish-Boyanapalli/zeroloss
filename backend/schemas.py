from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from enum import Enum


# ─── Enums (mirroring models.py) ────────────────────
class PlatformEnum(str, Enum):
    zomato = "zomato"
    swiggy = "swiggy"
    amazon = "amazon"
    blinkit = "blinkit"
    zepto = "zepto"
    other = "other"

class PolicyStatusEnum(str, Enum):
    active = "active"
    expired = "expired"
    cancelled = "cancelled"
    pending = "pending"

class DisruptionTypeEnum(str, Enum):
    heavy_rain = "heavy_rain"
    extreme_heat = "extreme_heat"
    poor_aqi = "poor_aqi"
    curfew = "curfew"
    strike = "strike"
    platform_down = "platform_down"
    flood = "flood"

class ClaimStatusEnum(str, Enum):
    auto_triggered = "auto_triggered"
    fraud_review = "fraud_review"
    approved = "approved"
    rejected = "rejected"
    paid = "paid"

class PayoutStatusEnum(str, Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


# ─── WORKER SCHEMAS ───────────────────────────────────

class WorkerCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    email: EmailStr
    city: str = Field(..., min_length=2, max_length=100)
    zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    platform: PlatformEnum
    vehicle_type: Optional[str] = None
    weekly_hours: int = Field(default=40, ge=1, le=168)
    avg_daily_orders: Optional[int] = Field(default=15, ge=0)
    avg_weekly_income: Optional[float] = Field(default=3500.0, ge=0)
    upi_id: Optional[str] = None

class WorkerUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    zone: Optional[str] = None
    weekly_hours: Optional[int] = None
    avg_daily_orders: Optional[int] = None
    avg_weekly_income: Optional[float] = None
    upi_id: Optional[str] = None
    is_active: Optional[bool] = None

class WorkerResponse(BaseModel):
    id: UUID
    name: str
    phone: str
    email: str
    city: str
    zone: Optional[str]
    platform: PlatformEnum
    vehicle_type: Optional[str]
    weekly_hours: int
    avg_daily_orders: Optional[int]
    avg_weekly_income: Optional[float]
    upi_id: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── POLICY SCHEMAS ───────────────────────────────────

class PolicyCreate(BaseModel):
    worker_id: UUID
    auto_renew: bool = True

class PolicyResponse(BaseModel):
    id: UUID
    worker_id: UUID
    status: PolicyStatusEnum
    weekly_premium: float
    coverage_amount: float
    risk_score: float
    risk_level: str
    weather_risk_score: Optional[float]
    aqi_risk_score: Optional[float]
    flood_risk_score: Optional[float]
    historical_disruption_score: Optional[float]
    start_date: date
    end_date: Optional[date]
    auto_renew: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── DISRUPTION SCHEMAS ───────────────────────────────

class DisruptionCreate(BaseModel):
    type: DisruptionTypeEnum
    city: str
    zone: Optional[str] = None
    severity: float
    threshold_value: float
    unit: Optional[str] = None
    source_api: Optional[str] = None

class DisruptionResponse(BaseModel):
    id: UUID
    type: DisruptionTypeEnum
    city: str
    zone: Optional[str]
    severity: float
    threshold_value: float
    unit: Optional[str]
    triggered: bool
    source_api: Optional[str]
    detected_at: datetime

    class Config:
        from_attributes = True


# ─── CLAIM SCHEMAS ────────────────────────────────────

class ClaimResponse(BaseModel):
    id: UUID
    policy_id: UUID
    disruption_id: UUID
    status: ClaimStatusEnum
    claim_amount: float
    fraud_score: Optional[float]
    is_fraud: bool
    fraud_reason: Optional[str]
    triggered_automatically: bool
    triggered_at: datetime
    approved_at: Optional[datetime]

    class Config:
        from_attributes = True

class ClaimReview(BaseModel):
    approve: bool
    reviewer_notes: Optional[str] = None
    reviewed_by: str = "admin"


# ─── PAYOUT SCHEMAS ───────────────────────────────────

class PayoutResponse(BaseModel):
    id: UUID
    claim_id: UUID
    worker_id: UUID
    amount: float
    upi_id: Optional[str]
    razorpay_order_id: Optional[str]
    razorpay_payment_id: Optional[str]
    razorpay_ref: Optional[str]
    status: PayoutStatusEnum
    initiated_at: datetime
    paid_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── DASHBOARD SCHEMAS ────────────────────────────────

class WorkerDashboard(BaseModel):
    worker: WorkerResponse
    active_policy: Optional[PolicyResponse]
    total_claims: int
    approved_claims: int
    total_paid_out: float
    recent_claims: List[ClaimResponse]

class AdminDashboard(BaseModel):
    total_workers: int
    active_policies: int
    total_claims_today: int
    pending_fraud_review: int
    total_payouts_today: float
    recent_disruptions: List[DisruptionResponse]