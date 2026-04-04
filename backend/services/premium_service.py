import os
import math
import random
import numpy as np
import joblib
from pathlib import Path

# ── Load trained models ──────────────────────────────────────────────────
MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "ml_models" / "saved"

_risk_model      = None
_premium_model   = None
_disruption_clf  = None
_le_city         = None
_le_platform     = None


def _load_models():
    global _risk_model, _premium_model, _disruption_clf, _le_city, _le_platform
    try:
        _risk_model     = joblib.load(MODELS_DIR / "risk_model.joblib")
        _premium_model  = joblib.load(MODELS_DIR / "premium_model.joblib")
        _disruption_clf = joblib.load(MODELS_DIR / "disruption_classifier.joblib")
        _le_city        = joblib.load(MODELS_DIR / "le_city.joblib")
        _le_platform    = joblib.load(MODELS_DIR / "le_platform.joblib")
        return True
    except Exception:
        return False


_models_loaded = _load_models()

# ── Fallback risk tables (used if models not loaded) ────────────────────
CITY_WEATHER_RISK = {
    "mumbai": 0.85, "chennai": 0.80, "kolkata": 0.78,
    "bangalore": 0.55, "hyderabad": 0.50, "delhi": 0.65,
    "pune": 0.52, "ahmedabad": 0.60, "jaipur": 0.58, "surat": 0.62,
    "default": 0.50,
}
CITY_AQI_RISK = {
    "delhi": 0.90, "kolkata": 0.70, "mumbai": 0.65,
    "hyderabad": 0.50, "bangalore": 0.45, "chennai": 0.48,
    "pune": 0.52, "ahmedabad": 0.60, "default": 0.45,
}
CITY_FLOOD_RISK = {
    "mumbai": 0.90, "chennai": 0.85, "kolkata": 0.80,
    "hyderabad": 0.60, "bangalore": 0.40, "delhi": 0.55,
    "pune": 0.50, "ahmedabad": 0.55, "default": 0.40,
}
PLATFORM_RISK = {
    "zomato": 1.0, "swiggy": 1.0, "blinkit": 1.1,
    "zepto": 1.1, "amazon": 0.9, "other": 1.0,
}

BASE_PREMIUM  = 89.0
MIN_PREMIUM   = 49.0
MAX_PREMIUM   = 299.0


def _get_city_risks(city: str) -> dict:
    c = city.lower().strip()
    return {
        "weather_risk": CITY_WEATHER_RISK.get(c, CITY_WEATHER_RISK["default"]),
        "aqi_risk":     CITY_AQI_RISK.get(c, CITY_AQI_RISK["default"]),
        "flood_risk":   CITY_FLOOD_RISK.get(c, CITY_FLOOD_RISK["default"]),
        "historical_disruption_score": round(random.uniform(0.3, 0.8), 2),
    }


def _encode_city(city: str) -> int:
    try:
        return int(_le_city.transform([city.lower()])[0])
    except Exception:
        return 0


def _encode_platform(platform: str) -> int:
    try:
        return int(_le_platform.transform([platform.lower()])[0])
    except Exception:
        return 0


def calculate_weekly_premium(
    city: str,
    platform: str,
    weekly_hours: int,
    avg_weekly_income: float,
    avg_daily_orders: int = 15,
) -> dict:
    risks = _get_city_risks(city)
    wr = risks["weather_risk"]
    ar = risks["aqi_risk"]
    fr = risks["flood_risk"]
    hr = risks["historical_disruption_score"]
    pf = PLATFORM_RISK.get(platform.lower(), 1.0)
    hf = min(weekly_hours / 60.0, 1.0)

    if _models_loaded:
        # ── XGBoost path ────────────────────────────────────────
        features = np.array([[
            _encode_city(city), _encode_platform(platform),
            weekly_hours, avg_weekly_income, avg_daily_orders,
            wr, ar, fr, hr, hf, pf,
        ]])

        risk_score    = float(np.clip(_risk_model.predict(features)[0], 0.05, 0.99))
        weekly_premium = float(np.clip(
            _premium_model.predict(np.append(features, [[risk_score]], axis=1))[0],
            MIN_PREMIUM, MAX_PREMIUM
        ))
        disruption_prob = float(_disruption_clf.predict_proba(features)[0][1])
        method = "xgboost"

    else:
        # ── Fallback rule-based path ─────────────────────────────
        raw = (wr*0.35 + ar*0.25 + fr*0.25 + hr*0.15) * (0.8 + 0.2*hf) * pf
        risk_score = float(np.clip(raw, 0.05, 0.99))
        rm = 0.5 + risk_score * 2.0
        inc_f = math.log10(max(avg_weekly_income, 1000)/1000 + 1) + 0.8
        raw_p = BASE_PREMIUM * rm * inc_f
        if wr < 0.50:
            raw_p -= 2.0
        weekly_premium = float(np.clip(raw_p, MIN_PREMIUM, MAX_PREMIUM))
        disruption_prob = (wr*0.4 + ar*0.3 + fr*0.3) * pf
        method = "rule_based_fallback"

    if risk_score >= 0.70:
        risk_level = "high"
    elif risk_score >= 0.45:
        risk_level = "medium"
    else:
        risk_level = "low"

    cov_mult = 0.8 + risk_score * 0.4
    coverage_amount = round(min(avg_weekly_income * cov_mult, 7000.0), 2)
    weekly_premium  = round(weekly_premium, 2)

    return {
        "risk_score":                  round(risk_score, 4),
        "risk_level":                  risk_level,
        "weekly_premium":              weekly_premium,
        "coverage_amount":             coverage_amount,
        "weather_risk_score":          round(wr, 4),
        "aqi_risk_score":              round(ar, 4),
        "flood_risk_score":            round(fr, 4),
        "historical_disruption_score": round(hr, 4),
        "disruption_probability":      round(disruption_prob, 4),
        "pricing_method":              method,
        "breakdown": {
            "base_premium":       BASE_PREMIUM,
            "risk_score":         round(risk_score, 4),
            "weekly_premium":     weekly_premium,
            "coverage_amount":    coverage_amount,
            "model_used":         method,
        }
    }


# Keep this for backward compatibility
def calculate_risk_score(city, platform, weekly_hours, avg_weekly_income):
    result = calculate_weekly_premium(city, platform, weekly_hours, avg_weekly_income)
    return {k: result[k] for k in [
        "risk_score", "risk_level", "weather_risk_score",
        "aqi_risk_score", "flood_risk_score", "historical_disruption_score"
    ]}