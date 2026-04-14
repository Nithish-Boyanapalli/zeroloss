"""
predictive_analytics.py  —  ZeroLoss Phase 3
Place this file at: backend/services/predictive_analytics.py

Uses your existing:
  - backend.database.SessionLocal
  - backend.models (Policy, Payout, Claim)
  - os.getenv("OPENWEATHER_API_KEY")  from your .env
"""

import os
import logging
import httpx
import numpy as np
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

CITY_COORDS = {
    "Hyderabad":  {"lat": 17.3850, "lon": 78.4867},
    "Vijayawada": {"lat": 16.5062, "lon": 80.6480},
    "Mumbai":     {"lat": 19.0760, "lon": 72.8777},
    "Bangalore":  {"lat": 12.9716, "lon": 77.5946},
    "Delhi":      {"lat": 28.6139, "lon": 77.2090},
    "Chennai":    {"lat": 13.0827, "lon": 80.2707},
    "Pune":       {"lat": 18.5204, "lon": 73.8567},
}

# In-memory cache for forecast data (refreshed by scheduler daily)
_forecast_cache: dict = {}


# ─────────────────────────────────────────────
# SYNTHETIC FORECAST (when no API key)
# ─────────────────────────────────────────────
def _synthetic_forecast(city: str) -> list:
    """April baseline synthetic data for Indian cities."""
    np.random.seed(int(datetime.utcnow().timestamp()) % 9999)
    baselines = {
        "Hyderabad":  {"temp": 38, "rain_chance": 0.15, "wind": 20},
        "Vijayawada": {"temp": 39, "rain_chance": 0.20, "wind": 22},
        "Mumbai":     {"temp": 34, "rain_chance": 0.05, "wind": 18},
        "Bangalore":  {"temp": 32, "rain_chance": 0.25, "wind": 15},
        "Delhi":      {"temp": 40, "rain_chance": 0.05, "wind": 25},
        "Chennai":    {"temp": 36, "rain_chance": 0.10, "wind": 20},
        "Pune":       {"temp": 36, "rain_chance": 0.12, "wind": 18},
    }
    b = baselines.get(city, baselines["Hyderabad"])
    days = []
    for i in range(7):
        date = (datetime.utcnow() + timedelta(days=i + 1)).strftime("%Y-%m-%d")
        raining = np.random.random() < b["rain_chance"]
        days.append({
            "date": date,
            "city": city,
            "temp_max": round(b["temp"] + np.random.uniform(-3, 4), 1),
            "temp_min": round(b["temp"] - 8 + np.random.uniform(-2, 2), 1),
            "rain_mm": round(np.random.uniform(18, 65), 1) if raining else round(np.random.uniform(0, 3), 1),
            "wind_kmh": round(b["wind"] + np.random.uniform(-5, 15), 1),
            "humidity": round(np.random.uniform(40, 75), 1),
            "description": "light rain" if raining else "partly cloudy",
            "source": "synthetic",
        })
    return days


# ─────────────────────────────────────────────
# REAL WEATHER FORECAST
# ─────────────────────────────────────────────
async def _fetch_real_forecast(city: str) -> list:
    coords = CITY_COORDS.get(city, CITY_COORDS["Hyderabad"])
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                params={
                    "lat": coords["lat"], "lon": coords["lon"],
                    "appid": OPENWEATHER_API_KEY,
                    "units": "metric", "cnt": 40,
                }
            )
        if resp.status_code != 200:
            return _synthetic_forecast(city)

        data = resp.json()
        daily: dict = {}
        for item in data.get("list", []):
            date_str = item["dt_txt"][:10]
            if date_str not in daily:
                daily[date_str] = {
                    "date": date_str, "city": city,
                    "temp_max": -99, "temp_min": 99,
                    "rain_mm": 0.0, "wind_kmh": 0.0,
                    "humidity_sum": 0, "readings": 0,
                    "description": "",
                }
            d = daily[date_str]
            d["temp_max"] = max(d["temp_max"], item["main"]["temp_max"])
            d["temp_min"] = min(d["temp_min"], item["main"]["temp_min"])
            d["rain_mm"] += item.get("rain", {}).get("3h", 0.0)
            d["wind_kmh"] = max(d["wind_kmh"], item["wind"]["speed"] * 3.6)
            d["humidity_sum"] += item["main"]["humidity"]
            d["readings"] += 1
            if item.get("weather"):
                d["description"] = item["weather"][0]["description"]

        result = []
        for date_str, d in sorted(daily.items())[:7]:
            result.append({
                "date": d["date"], "city": city,
                "temp_max": round(d["temp_max"], 1),
                "temp_min": round(d["temp_min"], 1),
                "rain_mm": round(d["rain_mm"], 1),
                "wind_kmh": round(d["wind_kmh"], 1),
                "humidity": round(d["humidity_sum"] / max(d["readings"], 1), 1),
                "description": d["description"],
                "source": "openweathermap",
            })
        return result

    except Exception as e:
        logger.error(f"Forecast API error for {city}: {e}")
        return _synthetic_forecast(city)


# ─────────────────────────────────────────────
# DISRUPTION PROBABILITY
# ─────────────────────────────────────────────
def _disruption_probabilities(day: dict) -> dict:
    rain = day.get("rain_mm", 0)
    temp = day.get("temp_max", 25)
    wind = day.get("wind_kmh", 0)

    rain_prob = (
        0.95 if rain >= 50 else
        0.75 if rain >= 25 else
        0.50 if rain >= 15 else
        0.20 if rain >= 5  else 0.05
    )
    heat_prob = (
        0.95 if temp >= 44 else
        0.75 if temp >= 42 else
        0.50 if temp >= 40 else
        0.25 if temp >= 38 else 0.05
    )
    wind_prob = (
        0.90 if wind >= 60 else
        0.60 if wind >= 40 else
        0.25 if wind >= 25 else 0.05
    )

    any_prob = float(1 - (1 - rain_prob) * (1 - heat_prob) * (1 - wind_prob))
    dominant = max(
        {"heavy_rain": rain_prob, "extreme_heat": heat_prob, "strong_wind": wind_prob},
        key=lambda k: {"heavy_rain": rain_prob, "extreme_heat": heat_prob, "strong_wind": wind_prob}[k]
    )
    alert = (
        "CRITICAL" if any_prob >= 0.8 else
        "HIGH"     if any_prob >= 0.6 else
        "MEDIUM"   if any_prob >= 0.4 else
        "LOW"      if any_prob >= 0.2 else "MINIMAL"
    )
    return {
        "heavy_rain":    round(rain_prob, 3),
        "extreme_heat":  round(heat_prob, 3),
        "strong_wind":   round(wind_prob, 3),
        "any_disruption": round(any_prob, 3),
        "dominant": dominant,
        "alert_level": alert,
        "high_risk": any_prob > 0.5,
    }


# ─────────────────────────────────────────────
# MASTER FORECAST FUNCTION
# ─────────────────────────────────────────────
async def generate_weekly_forecast(city: str = "Hyderabad", active_policies: int = 0) -> dict:
    """
    Generates 7-day disruption forecast with expected claims.
    Called by scheduler (daily) and by /analytics/forecast endpoint.
    Results are cached in memory.
    """
    # Get active policy count from DB if not provided
    if active_policies == 0:
        try:
            from backend.database import SessionLocal
            from backend.models import Policy
            db = SessionLocal()
            active_policies = db.query(Policy).filter(Policy.status == "active").count()
            db.close()
        except Exception:
            active_policies = 50

    # Fetch weather forecast
    if OPENWEATHER_API_KEY:
        days = await _fetch_real_forecast(city)
    else:
        days = _synthetic_forecast(city)

    daily_forecast = []
    total_claims = 0
    total_payout = 0

    for day in days:
        disruption = _disruption_probabilities(day)
        prob = disruption["any_disruption"]
        expected_claims = round(active_policies * prob * 0.65)
        expected_payout = expected_claims * 320
        total_claims += expected_claims
        total_payout += expected_payout

        daily_forecast.append({
            "date": day["date"],
            "weather": {
                "temp_max": day["temp_max"],
                "temp_min": day["temp_min"],
                "rain_mm": day["rain_mm"],
                "wind_kmh": day["wind_kmh"],
                "humidity": day["humidity"],
                "description": day["description"],
                "source": day.get("source", "synthetic"),
            },
            "disruption": disruption,
            "forecast": {
                "expected_claims": expected_claims,
                "expected_payout_inr": expected_payout,
            },
        })

    high_risk_days = [d for d in daily_forecast if d["disruption"]["high_risk"]]
    worst = max(daily_forecast, key=lambda x: x["disruption"]["any_disruption"])

    result = {
        "generated_at": datetime.utcnow().isoformat(),
        "city": city,
        "active_policies": active_policies,
        "period": {
            "start": daily_forecast[0]["date"] if daily_forecast else None,
            "end":   daily_forecast[-1]["date"] if daily_forecast else None,
        },
        "weekly_summary": {
            "high_risk_days": len(high_risk_days),
            "total_expected_claims": total_claims,
            "total_expected_payout_inr": total_payout,
            "worst_day": worst["date"],
            "worst_day_probability": worst["disruption"]["any_disruption"],
        },
        "daily_forecast": daily_forecast,
        "recommendation": (
            "CRITICAL WEEK: Pre-fund reserves. Alert all workers." if len(high_risk_days) >= 5 else
            "HIGH RISK WEEK: Top up reserves. Tighten trigger monitoring." if len(high_risk_days) >= 3 else
            "MODERATE WEEK: Standard monitoring sufficient." if len(high_risk_days) >= 1 else
            "LOW RISK WEEK: Minimal disruption expected."
        ),
    }

    # Cache the result
    _forecast_cache[city] = result
    return result


def get_cached_forecast(city: str) -> dict | None:
    return _forecast_cache.get(city)


# ─────────────────────────────────────────────
# LOSS RATIO — reads from your existing DB schema
# ─────────────────────────────────────────────
async def compute_loss_ratio() -> dict:
    """
    Uses your existing Payout, Policy, Claim models.
    """
    try:
        from backend.database import SessionLocal
        from backend.models import Policy, Payout, Claim, ClaimStatusEnum, PayoutStatusEnum

        db = SessionLocal()

        total_payouts = sum(
            float(p.amount)
            for p in db.query(Payout).filter(Payout.status == PayoutStatusEnum.completed).all()
        )
        total_premiums = sum(
            float(p.weekly_premium)
            for p in db.query(Policy).filter(Policy.status == "active").all()
        ) * 4  # 4 weeks = 1 month estimate

        approved = db.query(Claim).filter(Claim.status == ClaimStatusEnum.approved).count()
        fraud_flagged = db.query(Claim).filter(Claim.is_fraud == True).count()
        active_policies = db.query(Policy).filter(Policy.status == "active").count()
        db.close()

        loss_ratio = (total_payouts / total_premiums * 100) if total_premiums > 0 else 0
        status = (
            "HEALTHY"        if 40 <= loss_ratio <= 75 else
            "WARNING"        if loss_ratio <= 90 else
            "CRITICAL"       if loss_ratio > 90  else
            "UNDER_UTILIZING"
        )

        return {
            "total_premiums_collected_inr": round(total_premiums, 2),
            "total_payouts_inr": round(total_payouts, 2),
            "loss_ratio_pct": round(loss_ratio, 2),
            "loss_ratio_status": status,
            "approved_claims": approved,
            "fraud_claims_blocked": fraud_flagged,
            "active_policies": active_policies,
            "avg_premium_per_policy": round(total_premiums / max(active_policies, 1) / 4, 2),
            "computed_at": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.error(f"Loss ratio DB error: {e}")
        # Demo fallback so dashboard always shows something
        return {
            "total_premiums_collected_inr": 45200,
            "total_payouts_inr": 28900,
            "loss_ratio_pct": 63.9,
            "loss_ratio_status": "HEALTHY",
            "approved_claims": 87,
            "fraud_claims_blocked": 12,
            "active_policies": 142,
            "avg_premium_per_policy": 233,
            "computed_at": datetime.utcnow().isoformat(),
            "note": "Demo fallback — DB returned error",
        }