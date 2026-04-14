"""
business_model.py  —  ZeroLoss Phase 3
Place this file at: backend/services/business_model.py

No external dependencies. Pure data + logic.
Judge feedback: "Explicit business model documentation."
"""

from datetime import datetime


MARKET_DATA = {
    "tam": {
        "label": "Total Addressable Market",
        "workers_count": 15_000_000,
        "annual_inr_cr": 3500,
        "note": "15M gig workers × ₹233/week × 52 weeks",
    },
    "sam": {
        "label": "Serviceable Addressable Market",
        "workers_count": 3_500_000,
        "annual_inr_cr": 820,
        "note": "Food & grocery delivery workers in top 15 Indian cities",
    },
    "som": {
        "label": "Serviceable Obtainable Market",
        "workers_count": 175_000,
        "annual_inr_cr": 41,
        "note": "5% SAM capture in Year 1 via platform partnerships",
    },
}

UNIT_ECONOMICS = {
    "avg_weekly_premium_inr": 233,
    "avg_weekly_coverage_inr": 1000,
    "disruption_probability_pct": 18.5,
    "expected_payout_per_week_inr": 59.2,
    "gross_margin_per_week_inr": 173.8,
    "gross_margin_pct": 74.6,
    "operational_cost_per_week_inr": 45,
    "net_profit_per_worker_per_week_inr": 128.8,
    "annual_premium_per_worker_inr": 12116,
    "annual_expected_payouts_inr": 3078,
    "customer_ltv_3yr_inr": 20094,
    "loss_ratio_target_pct": 68,
    "industry_benchmark_pct": 65,
}

PRICING_TIERS = [
    {
        "tier": "Basic",
        "weekly_premium_inr": 149,
        "coverage_inr": 500,
        "disruptions": ["heavy_rain", "extreme_heat"],
        "target_zones": "Low-risk (Banjara Hills, Gachibowli, Whitefield)",
    },
    {
        "tier": "Standard",
        "weekly_premium_inr": 233,
        "coverage_inr": 1000,
        "disruptions": ["heavy_rain", "extreme_heat", "poor_aqi", "flood"],
        "target_zones": "Medium-risk (Kukatpally, Secunderabad, Benz Circle)",
    },
    {
        "tier": "Premium",
        "weekly_premium_inr": 399,
        "coverage_inr": 2000,
        "disruptions": ["heavy_rain", "extreme_heat", "poor_aqi", "flood", "curfew", "strike"],
        "target_zones": "High-risk (LB Nagar, Mehdipatnam, Patamata, Kurla)",
    },
]

REVENUE_STREAMS = [
    {
        "name": "Weekly Premium Subscription",
        "share_pct": 75,
        "model": "B2C direct + B2B platform partnership",
        "description": "Workers pay ₹149–₹399/week based on AI risk score",
    },
    {
        "name": "Platform Partnership Fee",
        "share_pct": 15,
        "model": "B2B SaaS",
        "description": "Zomato/Swiggy/Amazon pay ₹15/worker/week to offer ZeroLoss as benefit",
    },
    {
        "name": "Reinsurance Float",
        "share_pct": 7,
        "model": "Investment income",
        "description": "Premium reserves in liquid funds at 5–6% return",
    },
    {
        "name": "Disruption Risk Data API",
        "share_pct": 3,
        "model": "B2B data license",
        "description": "Anonymized zone risk data sold to logistics companies and city planners",
    },
]

GROWTH_PROJECTIONS = [
    {
        "year": "Year 1",
        "workers": 10_000,
        "monthly_revenue_lakh": 23.3,
        "annual_revenue_cr": 2.8,
        "net_profit_cr": 0.67,
        "milestones": [
            "Pilot: 500 Zomato workers in Hyderabad",
            "IRDAI Regulatory Sandbox approval",
            "2 platform partnerships live",
        ],
    },
    {
        "year": "Year 2",
        "workers": 75_000,
        "monthly_revenue_lakh": 174.75,
        "annual_revenue_cr": 20.97,
        "net_profit_cr": 5.02,
        "milestones": [
            "Expand to 5 cities",
            "Platform API integration with 3 apps",
            "Data analytics product launch",
        ],
    },
    {
        "year": "Year 3",
        "workers": 250_000,
        "monthly_revenue_lakh": 582.5,
        "annual_revenue_cr": 69.9,
        "net_profit_cr": 16.75,
        "milestones": [
            "Top 15 Indian cities",
            "175K+ active policies",
            "Break-even on operations",
        ],
    },
]

COMPETITIVE_ADVANTAGES = [
    {
        "advantage": "Zero-Touch Parametric Claims",
        "description": "No paperwork, no investigation — triggers fire automatically when API threshold crossed. Average payout time: 90 seconds.",
        "competitors_have": False,
    },
    {
        "advantage": "Hyper-Local Risk Pricing (Pin-Code Level)",
        "description": "Workers in flood-prone pin codes pay different premiums. 30+ zones mapped across 5 cities.",
        "competitors_have": False,
    },
    {
        "advantage": "AI Fraud Detection (GPS Spoofing + Fake Weather)",
        "description": "Isolation Forest + rule engine catches GPS spoofing, duplicate claims, weather data mismatch.",
        "competitors_have": False,
    },
    {
        "advantage": "Weekly Pricing Model",
        "description": "Matches gig worker weekly pay cycle. No annual upfront cost. Workers can pause anytime.",
        "competitors_have": False,
    },
    {
        "advantage": "Platform-Native Integration",
        "description": "Embeds directly into Zomato/Swiggy partner apps. Auto-enrolls during onboarding.",
        "competitors_have": False,
    },
]


def get_full_business_model() -> dict:
    return {
        "company": "ZeroLoss",
        "tagline": "Zero Income Loss. Guaranteed Automatically.",
        "problem": (
            "India's 15M+ gig delivery workers lose 20–30% of monthly income "
            "during weather disruptions with zero safety net."
        ),
        "solution": (
            "AI-powered parametric insurance that auto-detects disruptions "
            "and instantly pays workers via UPI — no claims, no paperwork, 90-second payout."
        ),
        "market": MARKET_DATA,
        "unit_economics": UNIT_ECONOMICS,
        "pricing_tiers": PRICING_TIERS,
        "revenue_streams": REVENUE_STREAMS,
        "growth_projections": GROWTH_PROJECTIONS,
        "competitive_advantages": COMPETITIVE_ADVANTAGES,
        "regulatory": {
            "framework": "IRDAI Regulatory Sandbox",
            "license_type": "Micro-Insurance Product License",
            "compliance": ["KYC via Aadhaar/PAN", "UPI payment compliance", "GST registered"],
        },
        "generated_at": datetime.utcnow().isoformat(),
    }


def get_worker_unit_economics(weekly_premium: float, risk_score: float) -> dict:
    disruption_prob = min(0.5, risk_score * 0.4 + 0.05)
    expected_payout = 320 * disruption_prob
    gross_margin = weekly_premium - expected_payout
    return {
        "weekly_premium_inr": round(weekly_premium, 2),
        "expected_weekly_payout_inr": round(expected_payout, 2),
        "gross_margin_inr": round(gross_margin, 2),
        "gross_margin_pct": round(gross_margin / weekly_premium * 100, 1) if weekly_premium > 0 else 0,
        "annual_premium_inr": round(weekly_premium * 52, 2),
        "annual_expected_payouts_inr": round(expected_payout * 52, 2),
        "worker_protection": f"Pays ₹{weekly_premium:.0f}/week → protected against ₹320/week income loss",
    }