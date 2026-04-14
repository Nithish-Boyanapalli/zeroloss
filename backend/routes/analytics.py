"""
routes/analytics.py  —  ZeroLoss Phase 3
Place at: backend/routes/analytics.py
"""

from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, date

from backend.database import get_db
from backend.services.predictive_analytics import generate_weekly_forecast, compute_loss_ratio, get_cached_forecast
from backend.services.business_model import get_full_business_model, get_worker_unit_economics
from backend.services.zones import (
    get_zone, zones_for_city, high_risk_zones,
    flood_prone_zones, zone_summary, get_multiplier,
)
from backend.services.scheduler import get_scheduler_status

router = APIRouter()


@router.get("/scheduler/status")
def scheduler_status():
    return {"success": True, "data": get_scheduler_status()}


@router.get("/forecast")
async def get_forecast(
    city: str = Query(default="Hyderabad"),
    use_cache: bool = Query(default=True),
):
    if use_cache:
        cached = get_cached_forecast(city)
        if cached:
            cached["from_cache"] = True
            return {"success": True, "data": cached}
    try:
        result = await generate_weekly_forecast(city=city)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/forecast/all-cities")
async def forecast_all_cities():
    cities = ["Hyderabad", "Vijayawada", "Mumbai", "Bangalore", "Delhi", "Chennai"]
    results = []
    for city in cities:
        try:
            data = await generate_weekly_forecast(city=city)
            results.append({
                "city": city,
                "high_risk_days": data["weekly_summary"]["high_risk_days"],
                "worst_day": data["weekly_summary"]["worst_day"],
                "worst_day_probability": data["weekly_summary"]["worst_day_probability"],
                "total_expected_claims": data["weekly_summary"]["total_expected_claims"],
                "total_expected_payout_inr": data["weekly_summary"]["total_expected_payout_inr"],
                "recommendation": data["recommendation"],
                "alert_level": (
                    "HIGH"   if data["weekly_summary"]["high_risk_days"] >= 3 else
                    "MEDIUM" if data["weekly_summary"]["high_risk_days"] >= 1 else
                    "LOW"
                ),
            })
        except Exception as e:
            results.append({"city": city, "error": str(e)})
    return {"success": True, "cities": results, "count": len(results)}


@router.get("/loss-ratio")
async def get_loss_ratio():
    try:
        result = await compute_loss_ratio()
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/zones/summary")
def zones_summary_route():
    return {"success": True, "data": zone_summary()}


@router.get("/zones/pincode/{pincode}")
def zone_by_pincode(pincode: str):
    return {"success": True, "data": get_zone(pincode)}


@router.get("/zones/city/{city}")
def zones_by_city(city: str):
    zones = zones_for_city(city)
    if not zones:
        raise HTTPException(status_code=404, detail=f"No zones found for: {city}")
    return {"success": True, "city": city, "count": len(zones), "data": zones}


@router.get("/zones/high-risk")
def high_risk_route():
    zones = high_risk_zones()
    return {"success": True, "count": len(zones), "data": zones}


@router.get("/zones/flood-prone")
def flood_zones_route():
    zones = flood_prone_zones()
    return {"success": True, "count": len(zones), "data": zones}


@router.get("/zones/multiplier/{pincode}")
def zone_multiplier(pincode: str):
    return {"pincode": pincode, "premium_multiplier": get_multiplier(pincode)}


@router.get("/business-model")
def business_model():
    return {"success": True, "data": get_full_business_model()}


@router.get("/business-model/unit-economics")
def unit_economics(
    weekly_premium: float = Query(default=233),
    risk_score: float = Query(default=0.5),
):
    return {"success": True, "data": get_worker_unit_economics(weekly_premium, risk_score)}


@router.post("/fraud/analyze")
async def analyze_fraud(payload: dict):
    import math

    def haversine(lat1, lon1, lat2, lon2):
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        return R * 2 * math.asin(math.sqrt(a))

    signals = []
    score = 0.0
    max_speed = 0.0

    location_history = payload.get("location_history", [])
    if len(location_history) >= 2:
        from datetime import datetime as dt
        for i in range(1, len(location_history)):
            prev, curr = location_history[i - 1], location_history[i]
            try:
                dist = haversine(prev["lat"], prev["lon"], curr["lat"], curr["lon"])
                t1 = dt.fromisoformat(prev["timestamp"])
                t2 = dt.fromisoformat(curr["timestamp"])
                hrs = max((t2 - t1).total_seconds() / 3600, 0.0001)
                spd = dist / hrs
                max_speed = max(max_speed, spd)
                if spd > 200:
                    signals.append(f"GPS SPOOFING: Speed {spd:.0f} km/h detected")
                    score += 0.35
            except Exception:
                pass

    wlat = payload.get("worker_lat")
    wlon = payload.get("worker_lon")
    dlat = payload.get("disruption_lat")
    dlon = payload.get("disruption_lon")
    if all(v is not None for v in [wlat, wlon, dlat, dlon]):
        dist = haversine(float(wlat), float(wlon), float(dlat), float(dlon))
        if dist > 25:
            signals.append(f"LOCATION MISMATCH: Worker is {dist:.1f}km from disruption zone")
            score += 0.15

    try:
        from backend.database import SessionLocal
        from backend.services.fraud_service import calculate_fraud_score
        db = SessionLocal()
        policy_id = payload.get("policy_id", "")
        disruption_id = payload.get("disruption_id", "")
        claim_amount = float(payload.get("claim_amount", 0))
        if policy_id and disruption_id:
            result = calculate_fraud_score(db, policy_id, disruption_id, claim_amount)
            score = min(score + result["fraud_score"] * 0.5, 1.0)
            if result["fraud_reason"]:
                signals.append(f"RULE ENGINE: {result['fraud_reason']}")
        db.close()
    except Exception:
        pass

    final_score = round(min(score, 1.0), 3)
    return {
        "success": True,
        "data": {
            "fraud_score": final_score,
            "is_fraud": final_score >= 0.4,
            "fraud_signals": signals,
            "max_speed_kmh": round(max_speed, 1),
            "recommended_action": (
                "REJECT"          if final_score >= 0.7 else
                "FLAG_HIGH_RISK"  if final_score >= 0.4 else
                "FLAG_FOR_REVIEW" if final_score >= 0.2 else
                "APPROVE"
            ),
        }
    }


@router.get("/admin-overview")
async def admin_overview(db: Session = Depends(get_db)):
    from backend.models import Worker, Policy, Claim, Payout, ClaimStatusEnum

    today_start = datetime.combine(date.today(), datetime.min.time())
    total_workers   = db.query(Worker).filter(Worker.is_active == True).count()
    active_policies = db.query(Policy).filter(Policy.status == "active").count()
    claims_today    = db.query(Claim).filter(Claim.triggered_at >= today_start).count()
    fraud_review    = db.query(Claim).filter(Claim.status == ClaimStatusEnum.fraud_review).count()
    payouts_today   = sum(
        float(p.amount)
        for p in db.query(Payout).filter(Payout.initiated_at >= today_start).all()
    )
    loss_ratio_data = await compute_loss_ratio()
    forecast = get_cached_forecast("Hyderabad")
    if not forecast:
        forecast = await generate_weekly_forecast("Hyderabad", active_policies)

    return {
        "success": True,
        "data": {
            "metrics": {
                "total_workers":        total_workers,
                "active_policies":      active_policies,
                "claims_today":         claims_today,
                "fraud_review_pending": fraud_review,
                "payouts_today_inr":    round(payouts_today, 2),
            },
            "financial":        loss_ratio_data,
            "scheduler":        get_scheduler_status(),
            "zones":            zone_summary(),
            "forecast_summary": forecast.get("weekly_summary") if forecast else {},
        }
    }