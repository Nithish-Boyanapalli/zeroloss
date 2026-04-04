from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, date

from backend.database import get_db
from backend.models import Worker, Policy, Claim, Payout, Disruption, ClaimStatusEnum
from backend.schemas import AdminDashboard, DisruptionResponse

router = APIRouter()


@router.get("/dashboard")
def admin_dashboard(db: Session = Depends(get_db)):
    today = date.today()
    today_start = datetime.combine(today, datetime.min.time())

    total_workers    = db.query(Worker).filter(Worker.is_active == True).count()
    active_policies  = db.query(Policy).filter(Policy.status == "active").count()
    claims_today     = db.query(Claim).filter(Claim.triggered_at >= today_start).count()
    fraud_review     = db.query(Claim).filter(Claim.status == ClaimStatusEnum.fraud_review).count()
    auto_triggered   = db.query(Claim).filter(Claim.triggered_automatically == True).count()

    payouts_today_rows = db.query(Payout).filter(Payout.initiated_at >= today_start).all()
    payouts_today_amt  = sum(float(p.amount) for p in payouts_today_rows)

    recent_disruptions = (
        db.query(Disruption)
        .filter(Disruption.triggered == True)
        .order_by(Disruption.detected_at.desc())
        .limit(10)
        .all()
    )

    cities_covered = db.query(Worker.city).distinct().count()

    return {
        "total_workers":       total_workers,
        "active_policies":     active_policies,
        "total_claims_today":  claims_today,
        "pending_fraud_review":fraud_review,
        "auto_triggered_claims": auto_triggered,
        "total_payouts_today": round(payouts_today_amt, 2),
        "cities_covered":      cities_covered,
        "recent_disruptions":  recent_disruptions,
        "generated_at":        datetime.utcnow().isoformat(),
    }


@router.get("/fraud-alerts")
def fraud_alerts(db: Session = Depends(get_db)):
    flagged = db.query(Claim).filter(
        Claim.is_fraud == True
    ).order_by(Claim.triggered_at.desc()).limit(50).all()
    return {
        "total_flagged": len(flagged),
        "claims": [
            {
                "id": str(c.id),
                "fraud_score": c.fraud_score,
                "fraud_reason": c.fraud_reason,
                "claim_amount": float(c.claim_amount),
                "status": c.status,
                "triggered_at": c.triggered_at.isoformat(),
            }
            for c in flagged
        ]
    }