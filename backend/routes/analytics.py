"""
routes/analytics.py
--------------------
New API routes for Phase 3 analytics features.
Add these to your main.py with: app.include_router(analytics_router)
"""

from fastapi import APIRouter, Query, HTTPException
from services.predictive_analytics import generate_weekly_forecast, compute_loss_ratio
from services.business_model import get_business_model_summary, get_unit_economics_for_worker
from services.zones import (
    get_zone_by_pincode, get_all_zones_for_city,
    get_high_risk_zones, get_flood_prone_zones,
    get_zone_stats_summary, list_all_pincodes
)
from services.scheduler import get_scheduler_status

analytics_router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ─────────────────────────────────────────────
# PREDICTIVE ANALYTICS
# ─────────────────────────────────────────────

@analytics_router.get("/forecast")
async def get_disruption_forecast(
    city: str = Query(default="Hyderabad", description="City name"),
    active_policies: int = Query(default=0, description="Override active policy count"),
):
    """
    Returns 7-day disruption forecast with expected claims and payouts.
    Used by Admin Dashboard → Predictive Analytics panel.
    """
    try:
        result = await generate_weekly_forecast(city=city, active_policies=active_policies)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@analytics_router.get("/forecast/all-cities")
async def get_forecast_all_cities():
    """Returns forecast summary for all major cities."""
    cities = ["Hyderabad", "Vijayawada", "Mumbai", "Bangalore", "Delhi"]
    results = []
    for city in cities:
        try:
            forecast = await generate_weekly_forecast(city=city)
            summary = forecast["weekly_summary"]
            summary["city"] = city
            summary["alert_level"] = "HIGH" if summary["high_risk_days"] >= 3 else "LOW"
            results.append(summary)
        except Exception as e:
            results.append({"city": city, "error": str(e)})
    return {"success": True, "cities": results}


# ─────────────────────────────────────────────
# LOSS RATIO & FINANCIAL METRICS
# ─────────────────────────────────────────────

@analytics_router.get("/loss-ratio")
async def get_loss_ratio():
    """
    Returns loss ratio and financial health metrics.
    Used by Admin Dashboard → Financial Analytics panel.
    """
    try:
        result = await compute_loss_ratio()
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# ZONE ANALYTICS
# ─────────────────────────────────────────────

@analytics_router.get("/zones/pincode/{pincode}")
async def get_zone_info(pincode: str):
    """Returns risk information for a specific pin code."""
    zone = get_zone_by_pincode(pincode)
    return {"success": True, "data": zone}


@analytics_router.get("/zones/city/{city}")
async def get_city_zones(city: str):
    """Returns all zones for a city."""
    zones = get_all_zones_for_city(city)
    if not zones:
        raise HTTPException(status_code=404, detail=f"No zones found for city: {city}")
    return {"success": True, "city": city, "zone_count": len(zones), "data": zones}


@analytics_router.get("/zones/high-risk")
async def get_high_risk():
    """Returns all high and critical risk zones."""
    zones = get_high_risk_zones()
    return {"success": True, "count": len(zones), "data": zones}


@analytics_router.get("/zones/flood-prone")
async def get_flood_zones():
    """Returns all flood-prone zones."""
    zones = get_flood_prone_zones()
    return {"success": True, "count": len(zones), "data": zones}


@analytics_router.get("/zones/summary")
async def get_zones_summary():
    """Returns summary stats for all zones."""
    return {"success": True, "data": get_zone_stats_summary()}


@analytics_router.get("/zones/all-pincodes")
async def get_all_pincodes():
    """Returns list of all known pincodes."""
    return {"success": True, "pincodes": list_all_pincodes()}


# ─────────────────────────────────────────────
# BUSINESS MODEL
# ─────────────────────────────────────────────

@analytics_router.get("/business-model")
async def get_business_model():
    """
    Returns complete business model data.
    Used by Business Model page on frontend.
    Judge feedback: explicit business model documentation.
    """
    return {"success": True, "data": get_business_model_summary()}


@analytics_router.get("/business-model/unit-economics")
async def get_unit_economics(
    weekly_premium: float = Query(default=233, description="Worker's weekly premium"),
    risk_score: float = Query(default=0.5, description="AI risk score 0-1"),
    zone_multiplier: float = Query(default=1.0, description="Zone premium multiplier"),
):
    """Returns unit economics for a specific worker premium."""
    result = get_unit_economics_for_worker(weekly_premium, risk_score, zone_multiplier)
    return {"success": True, "data": result}


# ─────────────────────────────────────────────
# SCHEDULER STATUS
# ─────────────────────────────────────────────

@analytics_router.get("/scheduler/status")
async def get_scheduler_status_api():
    """
    Returns current status of all background scheduler jobs.
    Shows admin that automation is running.
    """
    status = get_scheduler_status()
    return {"success": True, "data": status}


# ─────────────────────────────────────────────
# FRAUD ANALYTICS
# ─────────────────────────────────────────────

@analytics_router.post("/fraud/analyze")
async def analyze_single_claim(claim_data: dict):
    """
    Runs full fraud analysis on a single claim.
    Useful for manual review from admin dashboard.
    """
    from services.fraud_detection import analyze_claim_fraud
    try:
        result = await analyze_claim_fraud(
            claim=claim_data,
            location_history=claim_data.pop("location_history", None),
            existing_claims=claim_data.pop("existing_claims", None),
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))