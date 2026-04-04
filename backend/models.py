import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Integer, Float, Numeric,
    Boolean, DateTime, Date, Text, ForeignKey, Enum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from backend.database import Base


# ─────────────────────────────────────────────
# ENUMS
# ─────────────────────────────────────────────

class PlatformEnum(str, enum.Enum):
    zomato = "zomato"
    swiggy = "swiggy"
    amazon = "amazon"
    blinkit = "blinkit"
    zepto = "zepto"
    other = "other"


class PolicyStatusEnum(str, enum.Enum):
    active = "active"
    expired = "expired"
    cancelled = "cancelled"
    pending = "pending"


class DisruptionTypeEnum(str, enum.Enum):
    heavy_rain = "heavy_rain"
    extreme_heat = "extreme_heat"
    poor_aqi = "poor_aqi"
    curfew = "curfew"
    strike = "strike"
    platform_down = "platform_down"
    flood = "flood"


class ClaimStatusEnum(str, enum.Enum):
    auto_triggered = "auto_triggered"
    fraud_review = "fraud_review"
    approved = "approved"
    rejected = "rejected"
    paid = "paid"


class PayoutStatusEnum(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


# ─────────────────────────────────────────────
# WORKER MODEL
# ─────────────────────────────────────────────

class Worker(Base):
    __tablename__ = "workers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    phone = Column(String(15), unique=True, nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=False)
    city = Column(String(100), nullable=False)
    zone = Column(String(100), nullable=True)          # e.g. "Koramangala", "Bandra West"
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    platform = Column(Enum(PlatformEnum), nullable=False)
    vehicle_type = Column(String(50), nullable=True)   # bike, cycle, car
    weekly_hours = Column(Integer, nullable=False, default=40)
    avg_daily_orders = Column(Integer, nullable=True, default=15)
    avg_weekly_income = Column(Numeric(10, 2), nullable=True, default=3500.00)
    upi_id = Column(String(100), nullable=True)        # for instant payouts
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    policies = relationship("Policy", back_populates="worker", cascade="all, delete-orphan")
    payouts = relationship("Payout", back_populates="worker")

    def __repr__(self):
        return f"<Worker {self.name} | {self.platform} | {self.city}>"


# ─────────────────────────────────────────────
# POLICY MODEL
# ─────────────────────────────────────────────

class Policy(Base):
    __tablename__ = "policies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id"), nullable=False, index=True)

    status = Column(Enum(PolicyStatusEnum), default=PolicyStatusEnum.active)
    weekly_premium = Column(Numeric(8, 2), nullable=False)   # ₹ per week
    coverage_amount = Column(Numeric(10, 2), nullable=False)  # max payout per week
    risk_score = Column(Float, nullable=False, default=0.5)   # 0.0 to 1.0
    risk_level = Column(String(20), nullable=False, default="medium")  # low/medium/high

    # AI model features stored for audit
    weather_risk_score = Column(Float, nullable=True)
    aqi_risk_score = Column(Float, nullable=True)
    flood_risk_score = Column(Float, nullable=True)
    historical_disruption_score = Column(Float, nullable=True)

    start_date = Column(Date, nullable=False, default=date.today)
    end_date = Column(Date, nullable=True)              # null = ongoing weekly renewal
    auto_renew = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    worker = relationship("Worker", back_populates="policies")
    claims = relationship("Claim", back_populates="policy", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Policy ₹{self.weekly_premium}/week | {self.status} | risk={self.risk_score:.2f}>"


# ─────────────────────────────────────────────
# DISRUPTION MODEL
# ─────────────────────────────────────────────

class Disruption(Base):
    __tablename__ = "disruptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    type = Column(Enum(DisruptionTypeEnum), nullable=False, index=True)
    city = Column(String(100), nullable=False, index=True)
    zone = Column(String(100), nullable=True)

    # Raw sensor values
    severity = Column(Float, nullable=False)            # actual reading (mm rain, AQI, °C)
    threshold_value = Column(Float, nullable=False)     # the threshold that was breached
    unit = Column(String(20), nullable=True)            # "mm/hr", "AQI", "°C"

    triggered = Column(Boolean, default=False)          # did this fire claims?
    source_api = Column(String(100), nullable=True)     # "openweathermap", "openaq", "mock_civic"
    raw_response = Column(Text, nullable=True)          # JSON dump of the API response

    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    claims = relationship("Claim", back_populates="disruption")

    def __repr__(self):
        return f"<Disruption {self.type} | {self.city} | severity={self.severity} | triggered={self.triggered}>"


# ─────────────────────────────────────────────
# CLAIM MODEL
# ─────────────────────────────────────────────

class Claim(Base):
    __tablename__ = "claims"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    policy_id = Column(UUID(as_uuid=True), ForeignKey("policies.id"), nullable=False, index=True)
    disruption_id = Column(UUID(as_uuid=True), ForeignKey("disruptions.id"), nullable=False, index=True)

    status = Column(Enum(ClaimStatusEnum), default=ClaimStatusEnum.auto_triggered, index=True)

    claim_amount = Column(Numeric(10, 2), nullable=False)   # calculated payout amount

    # Fraud detection fields
    fraud_score = Column(Float, nullable=True)              # 0.0 = clean, 1.0 = fraud
    is_fraud = Column(Boolean, default=False)
    fraud_reason = Column(String(255), nullable=True)       # explanation if flagged

    # Audit fields
    triggered_automatically = Column(Boolean, default=True)
    reviewed_by = Column(String(100), nullable=True)        # admin who reviewed (if manual)
    reviewer_notes = Column(Text, nullable=True)

    triggered_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    rejected_at = Column(DateTime, nullable=True)

    # Relationships
    policy = relationship("Policy", back_populates="claims")
    disruption = relationship("Disruption", back_populates="claims")
    payout = relationship("Payout", back_populates="claim", uselist=False)

    def __repr__(self):
        return f"<Claim ₹{self.claim_amount} | {self.status} | fraud={self.is_fraud}>"


# ─────────────────────────────────────────────
# PAYOUT MODEL
# ─────────────────────────────────────────────

class Payout(Base):
    __tablename__ = "payouts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    claim_id = Column(UUID(as_uuid=True), ForeignKey("claims.id"), nullable=False, unique=True)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id"), nullable=False, index=True)

    amount = Column(Numeric(10, 2), nullable=False)
    upi_id = Column(String(100), nullable=True)             # worker's UPI ID
    razorpay_order_id = Column(String(100), nullable=True)  # from Razorpay API
    razorpay_payment_id = Column(String(100), nullable=True)
    razorpay_ref = Column(String(100), nullable=True)

    status = Column(Enum(PayoutStatusEnum), default=PayoutStatusEnum.pending, index=True)
    failure_reason = Column(String(255), nullable=True)

    initiated_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)

    # Relationships
    claim = relationship("Claim", back_populates="payout")
    worker = relationship("Worker", back_populates="payouts")

    def __repr__(self):
        return f"<Payout ₹{self.amount} | {self.status} | UPI={self.upi_id}>"