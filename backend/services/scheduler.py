"""
scheduler.py  —  ZeroLoss Phase 3
Place this file at: backend/services/scheduler.py

Uses APScheduler with AsyncIOScheduler.
Integrates with your existing:
  - trigger_service.scan_city_for_disruptions / trigger_claims_for_city
  - fraud_service.calculate_fraud_score
  - premium_service.calculate_weekly_premium
  - database.SessionLocal  (SQLAlchemy session pattern)
"""

import logging
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

# Cities to monitor automatically
MONITORED_CITIES = [
    "hyderabad", "vijayawada", "mumbai",
    "bangalore", "delhi", "chennai", "pune"
]


# ─────────────────────────────────────────────
# JOB 1 — Disruption triggers every 15 min
# ─────────────────────────────────────────────
async def job_run_all_triggers():
    """
    Automatically runs trigger_claims_for_city for every monitored city.
    This replaces manual POST /disruptions/scan calls.
    """
    from backend.database import SessionLocal
    from backend.services.trigger_service import trigger_claims_for_city

    logger.info(f"[SCHEDULER] Trigger scan started at {datetime.utcnow()}")
    total_claims = 0

    for city in MONITORED_CITIES:
        db = SessionLocal()
        try:
            result = await trigger_claims_for_city(city, db)
            claims = result.get("claims_created", 0)
            total_claims += claims
            if claims > 0:
                logger.info(f"[SCHEDULER] {city}: {claims} claims created")
        except Exception as e:
            logger.error(f"[SCHEDULER] Error scanning {city}: {e}")
        finally:
            db.close()

    logger.info(f"[SCHEDULER] Trigger scan complete. Total claims: {total_claims}")
    return {"total_claims": total_claims}


# ─────────────────────────────────────────────
# JOB 2 — Fraud scan every hour
# ─────────────────────────────────────────────
async def job_fraud_scan():
    """
    Hourly: scans all pending/auto_triggered claims for fraud using
    your existing calculate_fraud_score from fraud_service.py
    """
    from backend.database import SessionLocal
    from backend.models import Claim, Policy, Disruption, ClaimStatusEnum
    from backend.services.fraud_service import calculate_fraud_score

    logger.info(f"[SCHEDULER] Fraud scan at {datetime.utcnow()}")
    db = SessionLocal()
    flagged = 0

    try:
        # Get claims in auto_triggered state (not yet fraud-checked)
        pending = db.query(Claim).filter(
            Claim.status == ClaimStatusEnum.auto_triggered,
            Claim.fraud_score == None,
        ).limit(100).all()

        for claim in pending:
            try:
                result = calculate_fraud_score(
                    db,
                    str(claim.policy_id),
                    str(claim.disruption_id),
                    float(claim.claim_amount),
                )
                claim.fraud_score = result["fraud_score"]
                claim.is_fraud = result["is_fraud"]
                claim.fraud_reason = result["fraud_reason"]

                if result["is_fraud"]:
                    claim.status = ClaimStatusEnum.fraud_review
                    flagged += 1
                else:
                    claim.status = ClaimStatusEnum.approved
                    claim.approved_at = datetime.utcnow()

            except Exception as e:
                logger.error(f"[SCHEDULER] Fraud check error claim {claim.id}: {e}")

        db.commit()
        logger.info(f"[SCHEDULER] Fraud scan done. Checked: {len(pending)}, Flagged: {flagged}")
        return {"checked": len(pending), "flagged": flagged}

    except Exception as e:
        logger.error(f"[SCHEDULER] Fraud scan job error: {e}")
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


# ─────────────────────────────────────────────
# JOB 3 — Weekly premium recalc every Sunday
# ─────────────────────────────────────────────
async def job_weekly_premium_recalculation():
    """
    Every Sunday midnight: recalculates premiums for all active policies
    using your existing calculate_weekly_premium from premium_service.py
    """
    from backend.database import SessionLocal
    from backend.models import Policy, Worker
    from backend.services.premium_service import calculate_weekly_premium

    logger.info(f"[SCHEDULER] Weekly premium recalc at {datetime.utcnow()}")
    db = SessionLocal()
    updated = 0

    try:
        active_policies = db.query(Policy).filter(Policy.status == "active").all()

        for policy in active_policies:
            worker = db.query(Worker).filter(Worker.id == policy.worker_id).first()
            if not worker:
                continue
            try:
                result = calculate_weekly_premium(
                    city=worker.city,
                    platform=worker.platform.value,
                    weekly_hours=worker.weekly_hours,
                    avg_weekly_income=float(worker.avg_weekly_income or 3500),
                    avg_daily_orders=worker.avg_daily_orders or 15,
                )
                policy.weekly_premium = result["weekly_premium"]
                policy.risk_score = result["risk_score"]
                policy.risk_level = result["risk_level"]
                policy.coverage_amount = result["coverage_amount"]
                policy.weather_risk_score = result["weather_risk_score"]
                policy.aqi_risk_score = result["aqi_risk_score"]
                policy.flood_risk_score = result["flood_risk_score"]
                updated += 1
            except Exception as e:
                logger.error(f"[SCHEDULER] Premium recalc error policy {policy.id}: {e}")

        db.commit()
        logger.info(f"[SCHEDULER] Premium recalc done. Updated: {updated}")
        return {"updated": updated}

    except Exception as e:
        logger.error(f"[SCHEDULER] Premium recalc job error: {e}")
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


# ─────────────────────────────────────────────
# JOB 4 — Predictive analytics cache at 6 AM
# ─────────────────────────────────────────────
async def job_predictive_analytics():
    """
    Daily at 6 AM: generates forecast for all cities and caches in memory.
    Admin dashboard reads this cache via GET /analytics/forecast
    """
    from backend.services.predictive_analytics import generate_weekly_forecast
    logger.info(f"[SCHEDULER] Generating predictive analytics at {datetime.utcnow()}")
    try:
        for city in ["Hyderabad", "Vijayawada", "Mumbai", "Bangalore", "Delhi"]:
            await generate_weekly_forecast(city=city)
        logger.info("[SCHEDULER] Predictive analytics cache refreshed.")
    except Exception as e:
        logger.error(f"[SCHEDULER] Predictive analytics error: {e}")


# ─────────────────────────────────────────────
# SETUP + LIFECYCLE
# ─────────────────────────────────────────────
def setup_scheduler():
    scheduler.add_job(
        job_run_all_triggers,
        trigger=IntervalTrigger(minutes=15),
        id="disruption_triggers",
        name="Auto Disruption Trigger (15 min)",
        replace_existing=True,
        max_instances=1,
    )
    scheduler.add_job(
        job_fraud_scan,
        trigger=IntervalTrigger(hours=1),
        id="fraud_scan",
        name="Hourly Fraud Scan",
        replace_existing=True,
        max_instances=1,
    )
    scheduler.add_job(
        job_weekly_premium_recalculation,
        trigger=CronTrigger(day_of_week="sun", hour=0, minute=0),
        id="weekly_premium",
        name="Weekly Premium Recalculation",
        replace_existing=True,
    )
    scheduler.add_job(
        job_predictive_analytics,
        trigger=CronTrigger(hour=6, minute=0),
        id="predictive_analytics",
        name="Daily Predictive Analytics",
        replace_existing=True,
    )
    logger.info("[SCHEDULER] All 4 jobs registered.")


def start_scheduler():
    setup_scheduler()
    scheduler.start()
    logger.info("[SCHEDULER] Started. Background automation active.")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("[SCHEDULER] Stopped.")


def get_scheduler_status() -> dict:
    if not scheduler.running:
        return {"running": False, "jobs": []}
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run": str(job.next_run_time) if job.next_run_time else "N/A",
        })
    return {"running": True, "job_count": len(jobs), "jobs": jobs}