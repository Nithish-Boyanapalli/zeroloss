"""
zones.py  —  ZeroLoss Phase 3
Place this file at: backend/services/zones.py

Pin-code level zone definitions for Indian cities.
Judge feedback: "More granular zone definitions."

Used by:
  - premium_service.py  (zone-based multiplier)
  - analytics routes    (zone risk map on admin dashboard)
"""

ZONE_DATA = {

    # ══════════════ HYDERABAD ══════════════
    "500001": {
        "city": "Hyderabad", "area": "Abids / Nampally",
        "risk_level": "medium", "flood_prone": False,
        "waterlogging_score": 4, "avg_aqi": 95,
        "avg_rainfall_mm": 680, "disruptions_per_month": 2.1,
        "premium_multiplier": 1.1, "lat": 17.3850, "lon": 78.4867,
    },
    "500004": {
        "city": "Hyderabad", "area": "Secunderabad",
        "risk_level": "medium", "flood_prone": False,
        "waterlogging_score": 3, "avg_aqi": 88,
        "avg_rainfall_mm": 620, "disruptions_per_month": 1.8,
        "premium_multiplier": 1.05, "lat": 17.4399, "lon": 78.4983,
    },
    "500008": {
        "city": "Hyderabad", "area": "Begumpet",
        "risk_level": "low", "flood_prone": False,
        "waterlogging_score": 2, "avg_aqi": 80,
        "avg_rainfall_mm": 590, "disruptions_per_month": 1.2,
        "premium_multiplier": 1.0, "lat": 17.4418, "lon": 78.4636,
    },
    "500018": {
        "city": "Hyderabad", "area": "Banjara Hills",
        "risk_level": "low", "flood_prone": False,
        "waterlogging_score": 2, "avg_aqi": 75,
        "avg_rainfall_mm": 560, "disruptions_per_month": 1.0,
        "premium_multiplier": 0.95, "lat": 17.4156, "lon": 78.4347,
    },
    "500029": {
        "city": "Hyderabad", "area": "Kukatpally",
        "risk_level": "medium", "flood_prone": True,
        "waterlogging_score": 6, "avg_aqi": 102,
        "avg_rainfall_mm": 700, "disruptions_per_month": 2.8,
        "premium_multiplier": 1.2, "lat": 17.4849, "lon": 78.3996,
    },
    "500032": {
        "city": "Hyderabad", "area": "Madhapur / HiTech City",
        "risk_level": "low", "flood_prone": False,
        "waterlogging_score": 2, "avg_aqi": 72,
        "avg_rainfall_mm": 540, "disruptions_per_month": 0.9,
        "premium_multiplier": 0.9, "lat": 17.4504, "lon": 78.3812,
    },
    "500035": {
        "city": "Hyderabad", "area": "Gachibowli",
        "risk_level": "low", "flood_prone": False,
        "waterlogging_score": 2, "avg_aqi": 68,
        "avg_rainfall_mm": 510, "disruptions_per_month": 0.8,
        "premium_multiplier": 0.9, "lat": 17.4401, "lon": 78.3489,
    },
    "500044": {
        "city": "Hyderabad", "area": "LB Nagar",
        "risk_level": "high", "flood_prone": True,
        "waterlogging_score": 8, "avg_aqi": 118,
        "avg_rainfall_mm": 820, "disruptions_per_month": 4.2,
        "premium_multiplier": 1.4, "lat": 17.3490, "lon": 78.5541,
    },
    "500060": {
        "city": "Hyderabad", "area": "Uppal",
        "risk_level": "high", "flood_prone": True,
        "waterlogging_score": 7, "avg_aqi": 115,
        "avg_rainfall_mm": 790, "disruptions_per_month": 3.8,
        "premium_multiplier": 1.35, "lat": 17.4057, "lon": 78.5591,
    },
    "500072": {
        "city": "Hyderabad", "area": "Mehdipatnam",
        "risk_level": "critical", "flood_prone": True,
        "waterlogging_score": 9, "avg_aqi": 130,
        "avg_rainfall_mm": 900, "disruptions_per_month": 5.5,
        "premium_multiplier": 1.6, "lat": 17.3931, "lon": 78.4385,
    },
    "500097": {
        "city": "Hyderabad", "area": "Miyapur",
        "risk_level": "medium", "flood_prone": False,
        "waterlogging_score": 4, "avg_aqi": 92,
        "avg_rainfall_mm": 650, "disruptions_per_month": 2.2,
        "premium_multiplier": 1.1, "lat": 17.4966, "lon": 78.3571,
    },

    # ══════════════ VIJAYAWADA ══════════════
    "520001": {
        "city": "Vijayawada", "area": "One Town / Central",
        "risk_level": "high", "flood_prone": True,
        "waterlogging_score": 8, "avg_aqi": 108,
        "avg_rainfall_mm": 940, "disruptions_per_month": 4.5,
        "premium_multiplier": 1.45, "lat": 16.5062, "lon": 80.6480,
    },
    "520002": {
        "city": "Vijayawada", "area": "Governorpet",
        "risk_level": "high", "flood_prone": True,
        "waterlogging_score": 7, "avg_aqi": 105,
        "avg_rainfall_mm": 920, "disruptions_per_month": 4.0,
        "premium_multiplier": 1.4, "lat": 16.5167, "lon": 80.6220,
    },
    "520007": {
        "city": "Vijayawada", "area": "Benz Circle",
        "risk_level": "medium", "flood_prone": False,
        "waterlogging_score": 4, "avg_aqi": 95,
        "avg_rainfall_mm": 820, "disruptions_per_month": 2.5,
        "premium_multiplier": 1.15, "lat": 16.5201, "lon": 80.5997,
    },
    "520008": {
        "city": "Vijayawada", "area": "Patamata",
        "risk_level": "critical", "flood_prone": True,
        "waterlogging_score": 10, "avg_aqi": 112,
        "avg_rainfall_mm": 1050, "disruptions_per_month": 6.0,
        "premium_multiplier": 1.7, "lat": 16.4983, "lon": 80.6310,
    },
    "520010": {
        "city": "Vijayawada", "area": "Autonagar",
        "risk_level": "medium", "flood_prone": False,
        "waterlogging_score": 3, "avg_aqi": 120,
        "avg_rainfall_mm": 780, "disruptions_per_month": 2.8,
        "premium_multiplier": 1.2, "lat": 16.5320, "lon": 80.6640,
    },
    "521001": {
        "city": "Vijayawada", "area": "Machavaram",
        "risk_level": "high", "flood_prone": True,
        "waterlogging_score": 8, "avg_aqi": 100,
        "avg_rainfall_mm": 980, "disruptions_per_month": 4.8,
        "premium_multiplier": 1.5, "lat": 16.4882, "lon": 80.6590,
    },

    # ══════════════ MUMBAI ══════════════
    "400001": {
        "city": "Mumbai", "area": "Churchgate / Fort",
        "risk_level": "medium", "flood_prone": False,
        "waterlogging_score": 4, "avg_aqi": 98,
        "avg_rainfall_mm": 2100, "disruptions_per_month": 3.0,
        "premium_multiplier": 1.2, "lat": 18.9322, "lon": 72.8264,
    },
    "400050": {
        "city": "Mumbai", "area": "Bandra West",
        "risk_level": "low", "flood_prone": False,
        "waterlogging_score": 3, "avg_aqi": 85,
        "avg_rainfall_mm": 1900, "disruptions_per_month": 1.8,
        "premium_multiplier": 1.0, "lat": 19.0596, "lon": 72.8295,
    },
    "400097": {
        "city": "Mumbai", "area": "Kurla",
        "risk_level": "critical", "flood_prone": True,
        "waterlogging_score": 9, "avg_aqi": 135,
        "avg_rainfall_mm": 2400, "disruptions_per_month": 6.5,
        "premium_multiplier": 1.75, "lat": 19.0722, "lon": 72.8796,
    },

    # ══════════════ BANGALORE ══════════════
    "560001": {
        "city": "Bangalore", "area": "MG Road / Brigade Road",
        "risk_level": "low", "flood_prone": False,
        "waterlogging_score": 2, "avg_aqi": 78,
        "avg_rainfall_mm": 720, "disruptions_per_month": 1.2,
        "premium_multiplier": 0.95, "lat": 12.9716, "lon": 77.5946,
    },
    "560068": {
        "city": "Bangalore", "area": "Bellandur",
        "risk_level": "critical", "flood_prone": True,
        "waterlogging_score": 10, "avg_aqi": 125,
        "avg_rainfall_mm": 950, "disruptions_per_month": 5.8,
        "premium_multiplier": 1.65, "lat": 12.9246, "lon": 77.6762,
    },
    "560037": {
        "city": "Bangalore", "area": "Whitefield",
        "risk_level": "medium", "flood_prone": False,
        "waterlogging_score": 3, "avg_aqi": 82,
        "avg_rainfall_mm": 780, "disruptions_per_month": 1.9,
        "premium_multiplier": 1.05, "lat": 12.9698, "lon": 77.7499,
    },

    # ══════════════ DELHI ══════════════
    "110001": {
        "city": "Delhi", "area": "Connaught Place",
        "risk_level": "medium", "flood_prone": False,
        "waterlogging_score": 5, "avg_aqi": 185,
        "avg_rainfall_mm": 560, "disruptions_per_month": 3.2,
        "premium_multiplier": 1.25, "lat": 28.6315, "lon": 77.2167,
    },
    "110019": {
        "city": "Delhi", "area": "Kalkaji",
        "risk_level": "high", "flood_prone": True,
        "waterlogging_score": 7, "avg_aqi": 210,
        "avg_rainfall_mm": 620, "disruptions_per_month": 4.5,
        "premium_multiplier": 1.5, "lat": 28.5494, "lon": 77.2560,
    },
    "110045": {
        "city": "Delhi", "area": "Dwarka",
        "risk_level": "medium", "flood_prone": False,
        "waterlogging_score": 4, "avg_aqi": 175,
        "avg_rainfall_mm": 540, "disruptions_per_month": 2.6,
        "premium_multiplier": 1.15, "lat": 28.5921, "lon": 77.0460,
    },
}


# ─────────────────────────────────────────────
# HELPER FUNCTIONS (used by routes + premium_service)
# ─────────────────────────────────────────────

def get_zone(pincode: str) -> dict:
    zone = ZONE_DATA.get(str(pincode).strip())
    if zone:
        return {"pincode": pincode, "found": True, **zone}
    return {
        "pincode": pincode, "found": False,
        "city": "Unknown", "area": "Unknown",
        "risk_level": "medium", "flood_prone": False,
        "waterlogging_score": 4, "avg_aqi": 100,
        "avg_rainfall_mm": 700, "disruptions_per_month": 2.0,
        "premium_multiplier": 1.0,
        "lat": 17.3850, "lon": 78.4867,
    }


def get_multiplier(pincode: str) -> float:
    return get_zone(pincode).get("premium_multiplier", 1.0)


def get_risk_level(pincode: str) -> str:
    return get_zone(pincode).get("risk_level", "medium")


def zones_for_city(city: str) -> list:
    return [
        {"pincode": pc, **data}
        for pc, data in ZONE_DATA.items()
        if data["city"].lower() == city.lower()
    ]


def high_risk_zones() -> list:
    return [
        {"pincode": pc, **data}
        for pc, data in ZONE_DATA.items()
        if data["risk_level"] in ("high", "critical")
    ]


def flood_prone_zones() -> list:
    return [
        {"pincode": pc, **data}
        for pc, data in ZONE_DATA.items()
        if data["flood_prone"]
    ]


def zone_summary() -> dict:
    zones = list(ZONE_DATA.values())
    risk_dist = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    for z in zones:
        risk_dist[z["risk_level"]] = risk_dist.get(z["risk_level"], 0) + 1
    return {
        "total_zones": len(zones),
        "cities": list(set(z["city"] for z in zones)),
        "cities_count": len(set(z["city"] for z in zones)),
        "flood_prone_count": sum(1 for z in zones if z["flood_prone"]),
        "risk_distribution": risk_dist,
        "all_pincodes": list(ZONE_DATA.keys()),
    }