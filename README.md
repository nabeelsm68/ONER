# ONER — Environmental AI Autopilot

> **Sense. Predict. Act.**

ONER is an AI-powered environmental intelligence and autopilot platform for industrial facilities. It monitors real-time environmental metrics, detects anomalies using machine learning, forecasts future trends, simulates interventions, and answers complex environmental questions through a Gemini-powered AI copilot.

---

## Overview

ONER provides Orion Manufacturing Plant with a complete environmental intelligence stack:

- **Real-time monitoring** of CO₂, energy, water, NOx, SOx, PM2.5, and waste
- **Isolation Forest anomaly detection** that identifies 4 distinct incident types
- **GradientBoosting forecaster** predicting 7-day CO₂ and energy trends
- **Deterministic root-cause engine** — evidence-based, no hallucination
- **Parameterized intervention simulator** — ROI calculated from live facility data
- **Gemini AI copilot** — context-injected LLM grounded in real facility data
- **Carbon & MRV intelligence** — baseline, reduction potential, and readiness assessment

---

## Architecture

```
┌─────────────────────────────────┐
│         ONER Frontend           │
│  Next.js 16 + React 19 + TS    │
│  Tailwind CSS v4 + Recharts    │
│         localhost:3000          │
└────────────┬────────────────────┘
             │ HTTP API
             ▼
┌─────────────────────────────────┐
│         ONER Backend            │
│  FastAPI + Uvicorn             │
│         localhost:8000          │
├─────────────────────────────────┤
│  data_generator.py  (90-day dataset with 4 incidents)
│  calculations.py    (health score, KPIs, analytics)
│  anomaly_detector.py (Isolation Forest, sklearn)
│  forecaster.py      (GradientBoosting, 7-day)
│  root_cause.py      (deterministic causal engine)
│  simulator.py       (parameterized what-if calculator)
│  recommender.py     (ROI-ranked intervention ranking)
│  carbon_mrv.py      (carbon baseline & MRV readiness)
│  climate.py         (climate risk detection)
│  copilot.py         (Gemini + deterministic fallback)
│  main.py            (FastAPI routes)
└─────────────────────────────────┘
             │
             ▼
     Google Gemini API
     (optional — fallback if unavailable)
```

---

## Features

### Executive Dashboard
- Environmental Health Score (0–100 composite)
- 6 KPI cards: CO₂, energy, air quality, water, waste, carbon intensity
- 7-day AI forecast banner with trend direction
- ONER Alerts section with severity-classified anomalies
- Top-ranked ONER Recommendation with ROI metrics
- 30-day environmental trend charts

### Environmental Analytics
- 6 interactive time-series charts: CO₂, energy, water, air emissions, waste, intensity
- Time range selector: 7 / 30 / 90 days
- Combined energy chart (electricity + natural gas)
- Air emissions chart (NOx + PM2.5 + SOx)
- Intensity metrics chart
- Interactive Recharts tooltips

### AI Investigation
- 11 detected anomalies from Isolation Forest across 90-day dataset
- 4 distinct incident types: Furnace #2, Compressor, Water leak, Air emissions
- Root cause flow: ANOMALY → ROOT CAUSE → ENVIRONMENTAL IMPACT → RECOMMENDED ACTION
- Evidence panel with raw data deviations from baseline
- Metric deviations bar chart
- Anomaly timeline chart (CO₂ + energy intensity with anomaly markers)

### Intervention Simulator
- 6 parameterized interventions: Furnace, Compressor, Load Shifting, Renewable Energy, Cooling, Water
- All values dynamically calculated from current facility data
- Comparison view for multiple selected interventions
- ONER top recommendation highlighted
- Detailed ROI breakdown: cost, CO₂ reduction, energy savings, payback

### Carbon & MRV
- Baseline vs. current annual CO₂
- Potential reduction by intervention type (breakdown chart)
- MRV Readiness score (50.5%) across 5 dimensions
- Evidence timeline of carbon-relevant events
- Carbon value indicator at $65/t reference price
- Legal disclaimer prominently displayed

### Ask ONER (AI Copilot)
- Gemini-powered with structured facility context injection
- 8 suggested prompts for common environmental questions
- Deterministic fallback if Gemini is unavailable
- Context: current KPIs, active anomalies, 7-day forecast, recommendations
- Chat interface optimized for environmental intelligence

---

## AI / ML Components

| Component | Technology | Description |
|---|---|---|
| Anomaly Detection | Isolation Forest (sklearn) | Detects environmental anomalies; n_estimators=200, contamination=0.12 |
| Forecasting | GradientBoostingRegressor (sklearn) | 7-day CO₂ and energy forecast with lag features, day-of-week, operational covariates |
| Root Cause | Deterministic engine | Evidence-based causal analysis without LLM hallucination |
| AI Copilot | Google Gemini 1.5 Flash | Context-injected LLM; graceful fallback to deterministic responses |
| Recommender | Transparent formula | (CO₂ value + annual savings) / implementation cost × (1 / payback) |

---

## Tech Stack

### Backend
- **FastAPI** — REST API framework
- **Uvicorn** — ASGI server
- **pandas / numpy** — Data processing
- **scikit-learn** — Isolation Forest + GradientBoostingRegressor
- **google-generativeai** — Gemini API client
- **python-dotenv** — Environment variable management
- **pydantic** — Request/response validation

### Frontend
- **Next.js 16** — React framework with App Router
- **React 19** — UI library
- **TypeScript** — Type safety
- **Tailwind CSS v4** — Utility-first styling
- **Recharts** — Interactive charts
- **Lucide React** — Icon library
- **framer-motion** — Animations

---

## Project Structure

```
Oner/
├── backend/
│   ├── main.py              # FastAPI app + all routes
│   ├── data_generator.py    # 90-day dataset with 4 injected incidents
│   ├── calculations.py      # Health score, KPIs, analytics data
│   ├── anomaly_detector.py  # Isolation Forest detector
│   ├── forecaster.py        # 7-day GBR forecaster
│   ├── root_cause.py        # Deterministic root cause engine
│   ├── simulator.py         # What-if intervention calculator
│   ├── recommender.py       # ROI-ranked recommendation engine
│   ├── carbon_mrv.py        # Carbon baseline + MRV readiness
│   ├── climate.py           # Climate risk analysis
│   ├── copilot.py           # Gemini copilot + fallback
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx              # Overview dashboard
    │   │   ├── analytics/page.tsx    # Environmental analytics
    │   │   ├── investigation/page.tsx # AI investigation
    │   │   ├── simulator/page.tsx    # Intervention simulator
    │   │   ├── carbon/page.tsx       # Carbon & MRV
    │   │   ├── copilot/page.tsx      # Ask ONER
    │   │   ├── layout.tsx            # Root layout
    │   │   └── globals.css           # Design system
    │   ├── components/
    │   │   ├── AppLayout.tsx         # Shell with sidebar
    │   │   ├── Sidebar.tsx           # Navigation
    │   │   ├── KPICard.tsx           # Metric card
    │   │   └── AlertBanner.tsx       # Severity alert
    │   └── lib/
    │       └── api.ts                # Centralized API client
    ├── .env.local
    └── package.json
```

---

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 9+

### 1. Clone / Enter the directory

```bash
cd c:\Users\nabee\Documents\Kingdoms\Oner
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and optionally add your Gemini API key:

```bash
copy .env.example .env
# Edit .env and add: GEMINI_API_KEY=your_key_here
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

## Starting the Application

### Start the Backend

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

The backend will:
1. Generate the 90-day dataset with 4 injected incidents
2. Train the Isolation Forest model
3. Train the GradientBoosting forecaster
4. Start the API server at http://localhost:8000

API docs available at: http://localhost:8000/docs

### Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend available at: http://localhost:3000

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Google Gemini API key for AI Copilot. If not set, deterministic fallback is used. |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

> **Security note:** The Gemini API key lives exclusively on the backend. It is never exposed through `NEXT_PUBLIC_*` variables or the frontend.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/overview` | Executive dashboard data |
| GET | `/api/analytics?days=30` | Time-series data (7/30/90 days) |
| GET | `/api/anomalies` | All detected anomalies |
| GET | `/api/forecast` | 7-day CO₂ + energy forecast |
| GET | `/api/root-cause/{id}` | Root cause analysis for anomaly |
| POST | `/api/simulate` | Calculate intervention impact |
| GET | `/api/simulate/all` | All ranked intervention scenarios |
| GET | `/api/interventions` | Available intervention types |
| GET | `/api/recommendations` | Ranked recommendations |
| GET | `/api/carbon` | Carbon intelligence + MRV |
| GET | `/api/climate` | Climate risk analysis |
| POST | `/api/copilot` | AI Copilot query |
| GET | `/api/health` | System health check |

---

## Demo Workflow

1. **Overview**: Show Health Score 87.3, 4 active alerts, top recommendation
2. **Alerts**: Click "Combustion System" CRITICAL alert → navigates to AI Investigation
3. **Investigation**: Show root cause "Furnace #2 — Thermal Efficiency Degradation" with evidence
4. **Analytics**: Switch to 90-day view to see the water leak spike and air emission anomaly
5. **Simulator**: Select "Optimize Furnace" + "Peak-Hour Load Shifting" → combined impact
6. **Carbon**: Show 1,670t potential reduction, MRV readiness 50.5%
7. **Ask ONER**: Ask "What should we fix first?" — Gemini (or fallback) responds with ranked interventions

---

## Known Limitations

1. **Simulated data**: All values are generated from a probabilistic model. Not connected to live IoT sensors.
2. **Gemini API**: Requires a valid API key. Deterministic fallback works without it.
3. **Single facility**: Designed for one facility (Orion Manufacturing Plant). Multi-facility support not implemented.
4. **No authentication**: No user login or RBAC. Suitable for demo only.
5. **No persistence**: Data regenerated on backend restart (same seed = reproducible).
6. **Carbon market**: Values are indicative only. No actual market integration.

---

## Carbon Credit / MRV Disclaimer

> **Carbon-market eligibility and credit issuance require applicable methodologies and independent/authorized verification. Values shown represent potential impact estimates based on prototype simulated data. Actual MRV requires regulatory-compliant monitoring, reporting, and verification processes. Projected reductions are NOT certified carbon credits.**

This prototype uses simulated industrial data generated from a statistical model. It does not represent real facility emissions or actual environmental compliance data.

---

*Built as a hackathon MVP demonstrating the intersection of environmental intelligence, ML-based anomaly detection, and AI-powered facility management.*
