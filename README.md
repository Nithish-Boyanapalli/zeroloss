# ZeroLoss ⚡

**AI-Powered Income Protection for India's Gig Economy**

> **Built for Guidewire DEVTrails 2026 — Phase 3 (SOAR) Final Submission**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-zeroloss--orza.vercel.app-blue?style=for-the-badge)](https://zeroloss-orza.vercel.app)
[![API Docs](https://img.shields.io/badge/API%20Docs-Swagger%20UI-green?style=for-the-badge)](https://zeroloss-vtc6.onrender.com/docs)

---

## 🎬 Recorded Video

> 📺 **[Watch our 5-Minute Phase 3 Demo Video Here](https://drive.google.com/file/d/1b0GTHdrBho_A54YaRbxAX3PtTE_KawHP/view?usp=sharing)**

Our demo showcases the full end-to-end pipeline: Worker onboarding → AI premium calculation → Live background monitoring → Automated disruption trigger (simulated) → AI fraud validation → Instant Razorpay UPI payout.

## 📊 Pitch Deck

> 📄 **[View our ZeroLoss Pitch Deck (PDF)](https://drive.google.com/file/d/1ChubkgjJ-n4RXDQT69vMxrTLT02RwHsQ/view?usp=sharing)**

Contains our delivery persona analysis, AI & fraud architecture breakdown, TAM/SAM/SOM market sizing, and the business viability of our weekly premium MGA/SaaS model.

---

## 💡 The Problem & Our Solution

**The Problem:** India has over 15 million gig delivery partners (Zomato, Swiggy, Blinkit, etc.). When severe weather (heavy rain, extreme heat) or civic disruptions (curfews, AQI spikes) occur, they cannot work. They lose 20-30% of their monthly income, with zero financial safety net.

**The ZeroLoss Solution:** A fully automated "parametric" insurance platform built on a gig-friendly weekly pricing model.

1. Our backend schedules background API checks (OpenWeather, OpenAQ) every 15 minutes.
2. If a disruption threshold is crossed in a worker's specific pin-code, a claim is generated automatically.
3. Our Isolation Forest ML model scans for fraud (like GPS spoofing).
4. If clean, the worker receives an instant UPI payout for their lost wages. No paperwork, no waiting.

---

## 🧠 AI & Tech Architecture

* **Dynamic Pricing (XGBoost):** Calculates a personalized weekly premium (₹49–₹299) based on 11 features, including city weather history, flood risks, and daily active hours.
* **Fraud Sentinel (Isolation Forest):** Unsupervised anomaly detection that flags suspicious claims (e.g., GPS spoofing, fake weather claims) before payouts occur.
* **Hyper-Local Zone Definitions:** Pin-code level risk mapping across 5 cities, directly addressing Phase 2 judge feedback.
* **Predictive Analytics:** 7-day disruption forecasting and real-time loss ratio tracking for platform admins.

---

## ⚙️ How to Run Locally

Follow these steps to spin up the entire full-stack application on your local machine.

### Prerequisites

* Python 3.10+
* Node.js 18+
* PostgreSQL (or you can use a local SQLite file for quick testing)

### 1. Clone the Repository

```bash
git clone [https://github.com/Nithish-Boyanapalli/zeroloss.git](https://github.com/Nithish-Boyanapalli/zeroloss.git)
cd zeroloss
```

### 2. Backend Setup (FastAPI)

Open a terminal in the root folder and navigate to the backend:

```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r ../requirements.txt

# Environment Variables
# Create a .env file in the backend directory and add your keys:
# DATABASE_URL=postgresql://user:pass@localhost:5432/zeroloss
# OPENWEATHER_API_KEY=your_key_here
# OPENAQ_API_KEY=your_key_here

# Run the server
uvicorn main:app --reload
```

*The backend will be running at `http://localhost:8000`. You can view the interactive API docs at `http://localhost:8000/docs`.*

### 3. Frontend Setup (React/Vite)

Open a **new** terminal window, go to the root folder, and navigate to the frontend:

```bash
cd frontend

# Install Node modules
npm install

# Start the development server
npm run dev
```

*The frontend will be running at `http://localhost:5173`. Open this in your browser.*

---

## 👨‍💻 Our Team

We are a group of engineering students from **KL University, Vijayawada**, competing in the Guidewire DEVTrails 2026 hackathon.

* **Nithish Boyanapalli** (Team Lead / Full Stack / AI)
* **Azeez**
* **Nisschith**
* **Madhu Naga Sai**
* **Venkata Tarun**

---

*Compliance Note: As per the hackathon rules, ZeroLoss strictly covers **loss of income only**. We explicitly exclude health insurance, vehicle repair, or accident coverage to focus purely on the parametric disruption model.*
