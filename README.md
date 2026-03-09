# ZeroLoss 💰
### Zero Income Loss for Delivery Partners — AI-Powered Parametric Insurance

> Guidewire DEVTrails 2026 — University Hackathon Submission

---

We started this project after one of our team members noticed something that genuinely bothered him. His neighbor — a Zomato delivery guy named Arjun — didn't come out for three days straight during Bangalore's unusually bad monsoon week last August. When asked why, Arjun said something that stuck with us: *"Bhaiya, niklo toh accident ka darr, mat niklo toh ghar ka kiraya kaun bharega."*

That one sentence is basically why ZeroLoss exists.

---

## What's the actual problem here

India has somewhere around 15 million gig delivery workers. Most of them are on Zomato, Swiggy, Amazon, Zepto or Blinkit. They wake up every morning not knowing exactly what they'll earn. No fixed salary. No sick leave. No employer. Nothing.

Now here's the part that doesn't get talked about enough — when a disruption hits (heavy rain, flood, city curfew, extreme pollution), these workers just... stop earning. Completely. And nobody covers that loss. Not the platform, not the government, not any insurance company because frankly no insurance product was ever designed with them in mind.

The numbers are rough when you actually sit down and calculate:

Arjun earns about ₹1,000 a day on a normal day. During Bangalore's August 2023 flood week, delivery was practically impossible for 3 days. That's ₹3,000 gone in a single week. His weekly earnings potential was around ₹7,000. He lost 43% of it. Rent was due. EMI was due. He borrowed from a friend.

That's the gap. And it's completely preventable.

---

## So what is ZeroLoss

ZeroLoss is a parametric income insurance platform built specifically for food delivery partners on Zomato and Swiggy.

The word "parametric" is important here and worth explaining. Normal insurance works like this — something bad happens, you file a claim, someone investigates, you wait, maybe you get money two weeks later. Parametric insurance flips this entirely. Instead of asking "did you lose money?", it asks "did this specific measurable event happen?" If yes, payout is automatic. No claims form. No investigator. No waiting.

In our case the question is: did rainfall in your zone cross 50mm in 3 hours? Did AQI cross 400? Is there a curfew active in your delivery area? If the answer is yes and you have an active policy — money hits your UPI within minutes. Arjun doesn't have to do anything.

That's the core idea.

---

## Who we're building this for

Our primary persona is food delivery partners — specifically people working on Zomato and Swiggy in Tier 1 Indian cities (Bangalore, Mumbai, Delhi, Hyderabad, Chennai, Pune).

We chose food delivery over e-commerce or grocery delivery for a few reasons. The income volatility is highest in food delivery because it's so dependent on peak hours — dinner time in heavy rain is basically zero orders. The worker base is the largest. And frankly the disruption scenarios are the most dramatic and easy to demonstrate.

A typical worker in our target group:
- Earns ₹800 to ₹1,400 per day depending on how many hours they put in
- Works split shifts — morning lunch rush and evening dinner rush
- Operates on a week-to-week financial cycle (pays rent weekly or bi-weekly)
- Has never had any insurance product in their life
- Uses UPI daily and is comfortable with mobile payments

The weekly pricing structure of ZeroLoss is deliberately designed to match this cycle. We're not asking them to commit to a monthly or annual premium. Every Monday, a small amount is deducted. Every week they have coverage. Simple.

---

## The triggers — what actually fires a claim

We've defined 10 parametric triggers across two categories. These are the conditions that, when crossed, automatically initiate the claim process without any human involvement.

**Weather and environment based:**

Heavy rain is the big one for most Indian cities. Our threshold is rainfall exceeding 50mm over a 3-hour window — this is the point at which roads start flooding and delivery platforms see a 60-70% drop in order acceptance. When this fires, the worker gets 80% of their estimated daily income as payout.

If it gets worse — 100mm+ over 6 hours, which is essentially a flood situation — that's a 100% daily income payout.

Extreme heat above 43°C for 4+ continuous hours covers the brutal north Indian summer months when outdoor work becomes genuinely dangerous. That triggers a 60% payout.

Severe pollution, AQI crossing 400 (Hazardous), triggers 70%. AQI between 300 and 400 (Very Unhealthy) triggers 40%. Delhi workers in November-December will probably use this more than any other trigger.

Cyclone or storm conditions with wind above 60 km/h — 100% payout.

**Social and civic disruptions:**

City or zone curfew (Section 144 active) — 100% payout. This is rare but when it happens income drops to zero instantly.

Transport strike affecting delivery zones — 70% payout.

Zomato or Swiggy platform being down for more than 2 hours — 60% payout. Platform outages are more common than people realize.

Delivery zone sealed or blocked by authorities — 80% payout.

One important rule we built in: if multiple triggers fire simultaneously, we don't stack payouts. The worker gets whichever single trigger offers the highest payout percentage. This prevents double-dipping and keeps the model actuarially sound.

---

## How weekly premium is calculated

This is probably the most technically interesting part of the product, and it's fully AI-driven.

The base rate is ₹35 per week. That's the floor — nobody pays less than this regardless of how safe their zone is.

On top of that, an XGBoost model we trained calculates a risk multiplier based on the worker's zone. A worker in a historically flood-prone area like Mumbai's Dharavi pays more than someone in a zone that's never had significant weather disruption. The multiplier ranges from 0.8x (low risk) to 2.5x (very high risk).

Then there's a coverage multiplier based on the worker's declared daily income. Higher income means higher payout potential, so the premium scales accordingly.

Put it together:

`Weekly Premium = ₹35 × Risk Multiplier × Coverage Multiplier`

Some real examples from our testing data:

Arjun in Bangalore, medium flood zone, earns ₹1,000/day → **₹64/week**, gets up to ₹4,000/week coverage.

Meera in Mumbai coastal zone, earns ₹1,200/day → **₹118/week**, gets up to ₹4,800/week.

Suresh in Pune, historically safe zone, earns ₹700/day → **₹32/week**, gets up to ₹2,800/week.

The premium renews automatically every Monday. Workers can pause or cancel with one week's notice.

---

## The AI models powering everything

We're using three distinct models, each doing a specific job.

**Risk Prediction Model (XGBoost Classifier)**

This runs during onboarding when a new worker signs up. It takes inputs like the city's historical flood frequency, monthly average rainfall, AQI trends over the past year, cyclone zone classification, how often disruption events have occurred in that area, and what shift hours the worker operates. It outputs a risk score between 0 and 1 plus a category label (Low / Medium / High / Very High). This score directly feeds into the premium calculation.

**Premium Calculation Model (XGBoost Regressor)**

Takes the risk score from Model 1 and adds the worker's income data, city tier, platform preference, and claim history (for renewal policies) to output a weekly premium in rupees. Business rules cap it between ₹35 and ₹500 regardless of what the model outputs.

**Fraud Detection Model (Isolation Forest)**

This one runs every time a claim is about to be processed. Isolation Forest is an anomaly detection algorithm — it doesn't need labeled fraud examples to work, which is great for us since we don't have historical fraud data to train on. It looks at GPS coordinates at claim time vs. registered zone, time gap between disruption start and claim filing, how many claims the worker has filed in the past 30 days, whether income declarations have changed significantly, and device/IP level patterns.

If the fraud score is below 0.3 the claim auto-approves. Between 0.3 and 0.7 it gets flagged for manual review. Above 0.7 the claim is blocked and an admin alert fires.

---

## System architecture (brief overview)

The frontend is React with TailwindCSS and Chart.js for analytics. Workers access a dashboard showing their active policy, protected earnings, claims history, and real-time weather conditions in their zone.

The backend is FastAPI (Python). It handles auth, worker management, policy lifecycle, the trigger engine, and coordinates the ML models. The trigger engine runs on a 30-minute polling cycle using APScheduler — it calls the weather and AQI APIs, checks conditions against thresholds, and fires claims automatically when thresholds are crossed.

PostgreSQL stores everything — workers, policies, claims, payouts, trigger events.

The ML models are trained offline and saved as .pkl files. The backend loads them at startup and uses them for inference. No heavy retraining happens in production.

External integrations: OpenWeatherMap API (free tier, 1000 calls/day, more than enough), OpenAQ for air quality data (completely free, no key needed), Razorpay test mode for payment simulation, and custom mock APIs we built for government alerts, traffic data, and platform status since no real public APIs exist for those.

```
Worker (React App)
      ↓ ↑
  FastAPI Backend
   ↙     ↘      ↘
ML Models  PostgreSQL  External APIs
                         (Weather, AQI,
                          Payment Mock)
```

Claim automation flow:
```
API poll detects threshold crossed
        ↓
Find workers in affected zone with active policy
        ↓
Run fraud detection on each claim
        ↓
If clean → calculate payout → Razorpay mock → UPI
If flagged → admin review queue
If blocked → reject + notify admin
        ↓
Worker gets push notification with payout details
```

---

## Tech stack

**Frontend:** React 18, Vite, TailwindCSS, Chart.js, Axios, React Router

**Backend:** Python 3.11, FastAPI, SQLAlchemy, Pydantic v2, Uvicorn, APScheduler, python-jose (JWT auth)

**Database:** PostgreSQL 15, Alembic for migrations

**ML:** XGBoost, Scikit-learn, Isolation Forest, Pandas, NumPy, Joblib

**APIs:** OpenWeatherMap (free), OpenAQ (free), Razorpay test mode (free), custom mocks for the rest

**Infra:** Docker + Docker Compose for local dev, GitHub for version control, Render.com for deployment (free tier)

Total external cost to run this: ₹0.

---

## Project structure

```
zeroloss/
├── README.md
├── docker-compose.yml
├── .env.example
│
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── workers.py
│   │   ├── policies.py
│   │   ├── claims.py
│   │   ├── payouts.py
│   │   ├── triggers.py
│   │   └── admin.py
│   ├── services/
│   │   ├── risk_service.py
│   │   ├── premium_service.py
│   │   ├── fraud_service.py
│   │   ├── claim_service.py
│   │   └── payout_service.py
│   ├── integrations/
│   │   ├── weather_api.py
│   │   ├── aqi_api.py
│   │   ├── platform_api.py
│   │   └── payment_gateway.py
│   └── ml_models/
│       ├── risk_model.pkl
│       ├── premium_model.pkl
│       └── fraud_model.pkl
│
├── ml/
│   ├── datasets/
│   ├── generate_dataset.py
│   ├── risk_model.py
│   ├── premium_model.py
│   └── fraud_model.py
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Policy.jsx
│       │   ├── Claims.jsx
│       │   └── AdminDashboard.jsx
│       └── components/
│
└── docker/
    ├── Dockerfile.backend
    └── Dockerfile.frontend
```

---

## Development timeline

**Phase 1 — March 4 to 20 (this phase)**
Problem research, persona definition, premium model design, architecture planning, this README, and a short video walkthrough of the concept.

**Phase 2 — March 21 to April 4**
The actual build. Database schema, backend APIs, onboarding flow, risk and premium AI models, policy management, trigger engine, basic React frontend. Goal is a working demo with registration → risk profiling → policy creation → claim triggering all functional end to end.

**Phase 3 — April 5 to 17**
Polishing and completing. Fraud detection, payment simulation, worker and admin dashboards with real analytics, Docker setup, deployment, final 5-minute demo video, and pitch deck.

---

## What we're NOT building

Just to be completely clear — ZeroLoss does not cover:

- Health, hospitalization, or medical expenses of any kind
- Vehicle repair, bike damage, or maintenance costs
- Accident claims or personal injury
- Life insurance

We cover one thing: lost income when an external verified disruption makes it impossible or unsafe to work. That's it. We think that focus is actually what makes this product viable — simple to understand, simple to price, and simple to claim.

---

## Team

| Name | Role |
|---|---|
| Nithish Boyanapalli | Team Lead — Full Stack Developer + AI/ML Engineer |
| Madhu Naga Sai Kurapati | Business Analyst — Requirements & Documentation |
| Nisschith Sivakoti | UI/UX Designer — Wireframes & Design Support |
| Azeez Shaik | QA & Testing — Testing & Bug Reporting |
| Venkata Tarun Duddukuri | Research Analyst — Market Research & Data Collection |

Institution: KL University
Hackathon: Guidewire DEVTrails 2026

---

*We built ZeroLoss for Arjun and the 15 million workers like him. Nobody should lose their rent money because it rained.*
