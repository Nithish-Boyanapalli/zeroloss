import os
import json
import random
import httpx
from datetime import datetime
from sqlalchemy.orm import Session
from typing import Optional

from backend.models import Disruption, DisruptionTypeEnum, Policy, Claim, Worker
from backend.services.fraud_service import calculate_fraud_score
from backend.services.payout_service import initiate_payout


# ── Thresholds ──────────────────────────────────────────────────────────
THRESHOLDS = {
    "heavy_rain":   {"key": "rain_mm_hr",   "value": 50.0,  "unit": "mm/hr"},
    "extreme_heat": {"key": "temp_celsius",  "value": 42.0,  "unit": "°C"},
    "poor_aqi":     {"key": "aqi",           "value": 300.0, "unit": "AQI"},
    "curfew":       {"key": "curfew_active", "value": 1.0,   "unit": "boolean"},
    "platform_down":{"key": "disrupted",     "value": 1.0,   "unit": "boolean"},
}

OPENWEATHER_KEY = os.getenv("OPENWEATHER_API_KEY", "")
OPENAQ_KEY      = os.getenv("OPENAQ_API_KEY", "")

CITY_LAT_LON = {
    "mumbai":    (19.0760, 72.8777),
    "delhi":     (28.7041, 77.1025),
    "bangalore": (12.9716, 77.5946),
    "hyderabad": (17.3850, 78.4867),
    "chennai":   (13.0827, 80.2707),
    "kolkata":   (22.5726, 88.3639),
    "pune":      (18.5204, 73.8567),
    "ahmedabad": (23.0225, 72.5714),
}


# ── Mock API responses (used when real API key not available) ───────────

def mock_weather(city: str) -> dict:
    scenarios = [
        {"rain_mm_hr": 72.0, "temp_celsius": 28.0, "condition": "heavy rain"},
        {"rain_mm_hr": 10.0, "temp_celsius": 44.5, "condition": "extreme heat"},
        {"rain_mm_hr": 0.0,  "temp_celsius": 32.0, "condition": "clear"},
        {"rain_mm_hr": 85.0, "temp_celsius": 26.0, "condition": "storm"},
    ]
    return random.choice(scenarios)


def mock_aqi(city: str) -> dict:
    aqi_val = random.choice([45, 180, 220, 350, 410, 470])
    return {"aqi": aqi_val, "pollutant": "PM2.5", "category": "hazardous" if aqi_val > 300 else "moderate"}


def mock_civic(city: str) -> dict:
    return {
        "curfew_active": random.choice([True, False, False, False]),
        "strike_active":  random.choice([True, False, False]),
        "source": "mock_civic_api"
    }


def mock_platform(platform: str) -> dict:
    return {
        "platform":   platform,
        "disrupted":  random.choice([True, False, False, False]),
        "reason":     "Server maintenance" if random.random() > 0.7 else None,
    }


# ── Real API calls ──────────────────────────────────────────────────────

async def fetch_weather(city: str) -> dict:
    if not OPENWEATHER_KEY or OPENWEATHER_KEY == "your_key_here":
        return mock_weather(city)
    lat, lon = CITY_LAT_LON.get(city.lower(), (17.3850, 78.4867))
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_KEY}&units=metric"
    async with httpx.AsyncClient(timeout=8.0) as client:
        r = await client.get(url)
        data = r.json()
    rain = data.get("rain", {}).get("1h", 0.0) * 1.0
    temp = data["main"]["temp"]
    return {"rain_mm_hr": rain, "temp_celsius": temp, "condition": data["weather"][0]["description"]}


async def fetch_aqi(city: str) -> dict:
    if not OPENAQ_KEY or OPENAQ_KEY == "your_key_here":
        return mock_aqi(city)
    url = f"https://api.openaq.org/v3/locations?city={city}&limit=1"
    headers = {"X-API-Key": OPENAQ_KEY}
    async with httpx.AsyncClient(timeout=8.0) as client:
        r = await client.get(url, headers=headers)
        data = r.json()
    results = data.get("results", [])
    aqi = results[0].get("parameters", [{}])[0].get("lastValue", 0) if results else 0
    return {"aqi": float(aqi), "source": "openaq"}


# ── Core trigger scanner ────────────────────────────────────────────────

async def scan_city_for_disruptions(city: str, db: Session) -> list[dict]:
    found = []

    # --- Weather check ---
    weather = await fetch_weather(city)
    rain = weather.get("rain_mm_hr", 0.0)
    temp = weather.get("temp_celsius", 30.0)

    if rain > THRESHOLDS["heavy_rain"]["value"]:
        d = Disruption(
            type=DisruptionTypeEnum.heavy_rain,
            city=city, severity=rain,
            threshold_value=THRESHOLDS["heavy_rain"]["value"],
            unit="mm/hr", triggered=True,
            source_api="openweathermap",
            raw_response=json.dumps(weather),
        )
        db.add(d); db.flush()
        found.append({"disruption": d, "type": "heavy_rain"})

    if temp > THRESHOLDS["extreme_heat"]["value"]:
        d = Disruption(
            type=DisruptionTypeEnum.extreme_heat,
            city=city, severity=temp,
            threshold_value=THRESHOLDS["extreme_heat"]["value"],
            unit="°C", triggered=True,
            source_api="openweathermap",
            raw_response=json.dumps(weather),
        )
        db.add(d); db.flush()
        found.append({"disruption": d, "type": "extreme_heat"})

    # --- AQI check ---
    aqi_data = await fetch_aqi(city)
    aqi = aqi_data.get("aqi", 0.0)
    if aqi > THRESHOLDS["poor_aqi"]["value"]:
        d = Disruption(
            type=DisruptionTypeEnum.poor_aqi,
            city=city, severity=aqi,
            threshold_value=THRESHOLDS["poor_aqi"]["value"],
            unit="AQI", triggered=True,
            source_api="openaq",
            raw_response=json.dumps(aqi_data),
        )
        db.add(d); db.flush()
        found.append({"disruption": d, "type": "poor_aqi"})

    # --- Civic check (mock) ---
    civic = mock_civic(city)
    if civic.get("curfew_active"):
        d = Disruption(
            type=DisruptionTypeEnum.curfew,
            city=city, severity=1.0,
            threshold_value=1.0,
            unit="boolean", triggered=True,
            source_api="mock_civic",
            raw_response=json.dumps(civic),
        )
        db.add(d); db.flush()
        found.append({"disruption": d, "type": "curfew"})

    db.commit()
    return found


# ── Auto-claim trigger ──────────────────────────────────────────────────

async def trigger_claims_for_city(city: str, db: Session) -> dict:
    disruptions = await scan_city_for_disruptions(city, db)
    if not disruptions:
        return {"message": f"No disruptions detected in {city}", "claims_created": 0}

    # Find all active policies for workers in this city
    active_policies = (
        db.query(Policy)
        .join(Worker, Policy.worker_id == Worker.id)
        .filter(
            Worker.city.ilike(city),
            Policy.status == "active",
        )
        .all()
    )

    claims_created = 0
    payouts_sent   = 0

    for policy in active_policies:
        for event in disruptions:
            disruption = event["disruption"]

            # Skip if claim already exists for this policy + disruption
            already = db.query(Claim).filter(
                Claim.policy_id     == policy.id,
                Claim.disruption_id == disruption.id,
            ).first()
            if already:
                continue

            # Calculate claim amount (proportional to severity)
            severity_ratio = min(disruption.severity / disruption.threshold_value, 2.0)
            claim_amount   = round(float(policy.coverage_amount) * min(severity_ratio * 0.5, 1.0), 2)

            # Fraud check
            fraud_result = calculate_fraud_score(
                db, str(policy.id), str(disruption.id), claim_amount
            )

            # Create claim
            claim = Claim(
                policy_id=policy.id,
                disruption_id=disruption.id,
                claim_amount=claim_amount,
                fraud_score=fraud_result["fraud_score"],
                is_fraud=fraud_result["is_fraud"],
                fraud_reason=fraud_result["fraud_reason"],
                triggered_automatically=True,
                status="fraud_review" if fraud_result["is_fraud"] else "approved",
                approved_at=datetime.utcnow() if not fraud_result["is_fraud"] else None,
            )
            db.add(claim)
            db.flush()
            claims_created += 1

            # Auto-payout if not fraud
            if not fraud_result["is_fraud"]:
                await initiate_payout(db, claim, policy.worker)
                payouts_sent += 1

    db.commit()
    return {
        "city":           city,
        "disruptions":    len(disruptions),
        "policies_found": len(active_policies),
        "claims_created": claims_created,
        "payouts_sent":   payouts_sent,
        "events":         [e["type"] for e in disruptions],
    }