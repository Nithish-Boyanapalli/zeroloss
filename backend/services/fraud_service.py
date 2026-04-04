from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from pathlib import Path
import numpy as np
import joblib

from backend.models import Claim, Policy, Disruption

MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "ml_models" / "saved"
FRAUD_THRESHOLD = 0.65

_fraud_model  = None
_fraud_scaler = None

def _load():
    global _fraud_model, _fraud_scaler
    try:
        _fraud_model  = joblib.load(MODELS_DIR / "fraud_model.joblib")
        _fraud_scaler = joblib.load(MODELS_DIR / "fraud_scaler.joblib")
        return True
    except Exception:
        return False

_fraud_loaded = _load()


def _ml_fraud_score(
    claim_amount: float,
    claims_last_7_days: int,
    disruption_severity: float,
    hours_since_policy: float,
    worker_age_days: float,
    avg_claim_interval: float,
    location_match: float,
) -> float:
    if not _fraud_loaded:
        return 0.0
    features = np.array([[
        claim_amount, claims_last_7_days, disruption_severity,
        hours_since_policy, worker_age_days, avg_claim_interval,
        location_match,
    ]])
    scaled = _fraud_scaler.transform(features)
    score_raw = _fraud_model.decision_function(scaled)[0]
    # decision_function: more negative = more anomalous
    # Normalize to 0–1 fraud probability
    fraud_prob = float(np.clip(1 / (1 + np.exp(score_raw * 2)), 0.0, 1.0))
    return round(fraud_prob, 4)


def calculate_fraud_score(
    db: Session,
    policy_id: str,
    disruption_id: str,
    claim_amount: float,
) -> dict:
    rule_score = 0.0
    reasons    = []

    # Rule 1 — Duplicate claim
    existing = db.query(Claim).filter(
        Claim.policy_id     == policy_id,
        Claim.disruption_id == disruption_id,
    ).first()
    if existing:
        rule_score += 0.60
        reasons.append("Duplicate claim for same disruption event")

    # Rule 2 — Frequency check
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_claims = db.query(Claim).filter(
        Claim.policy_id    == policy_id,
        Claim.triggered_at >= week_ago,
    ).count()
    if recent_claims >= 3:
        rule_score += 0.25
        reasons.append(f"High claim frequency: {recent_claims} in 7 days")

    # Rule 3 — Amount check
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if policy and claim_amount > float(policy.coverage_amount) * 1.05:
        rule_score += 0.30
        reasons.append("Claim amount exceeds coverage limit")

    # Rule 4 — Disruption threshold
    disruption = db.query(Disruption).filter(Disruption.id == disruption_id).first()
    if disruption and not disruption.triggered:
        rule_score += 0.50
        reasons.append("Disruption did not cross parametric threshold")

    # ML score from Isolation Forest
    worker_age_days    = 365.0  # default — real impl would use worker.created_at
    hours_since_policy = 24.0
    avg_interval       = max(7.0 / max(recent_claims, 1), 1.0)
    sev_ratio          = (disruption.severity / disruption.threshold_value) if disruption else 1.0

    ml_score = _ml_fraud_score(
        claim_amount=claim_amount,
        claims_last_7_days=recent_claims,
        disruption_severity=sev_ratio,
        hours_since_policy=hours_since_policy,
        worker_age_days=worker_age_days,
        avg_claim_interval=avg_interval,
        location_match=1.0,
    )

    # Combine rule-based + ML score
    final_score = round(min((rule_score * 0.6 + ml_score * 0.4), 1.0), 4)
    is_fraud    = final_score >= FRAUD_THRESHOLD

    return {
        "fraud_score":  final_score,
        "is_fraud":     is_fraud,
        "fraud_reason": "; ".join(reasons) if reasons else None,
    }