"""
ONER FastAPI Backend
Main application with all API routes.
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# Pre-load data and models at startup
from data_generator import get_dataset
from calculations import get_health_score, get_current_kpis, get_analytics_data
from anomaly_detector import get_anomalies, get_all_results, get_active_alerts, get_anomaly_by_id
from forecaster import get_forecast
from root_cause import get_root_cause
from simulator import calculate_scenario, calculate_all_scenarios, INTERVENTIONS
from recommender import get_recommendations
from carbon_mrv import get_carbon_intelligence
from climate import get_climate_intelligence
from copilot import get_copilot_response

app = FastAPI(
    title="ONER Environmental AI Autopilot",
    description="Environmental intelligence and autopilot platform for Orion Manufacturing Plant",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pre-warm models at startup ──────────────────────────────────────────────
print("ONER Backend: Pre-loading dataset and training ML models...")
_df = get_dataset()
_ = get_all_results()   # trains Isolation Forest
_ = get_forecast()      # trains GBR forecaster
print(f"ONER Backend: Ready. Dataset: {len(_df)} records. Anomalies detected: {len(get_anomalies())}")


# ─── Request/Response Models ─────────────────────────────────────────────────

class SimulateRequest(BaseModel):
    intervention_id: str
    custom_params: dict = {}


class CopilotRequest(BaseModel):
    message: str


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/api/overview")
def overview():
    """Executive dashboard: health score, KPIs, alerts, top recommendation."""
    df = get_dataset()
    health = get_health_score(df)
    kpis = get_current_kpis(df)
    alerts = get_active_alerts()
    recs = get_recommendations()
    fc = get_forecast()

    return {
        "facility": "Orion Manufacturing Plant",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "health_score": health,
        "kpis": kpis,
        "active_alerts": alerts[:5],
        "top_recommendation": recs.get("top_recommendation", {}),
        "forecast_summary": fc.get("summary", {}),
        "system_status": {
            "ai_engine": "Online",
            "data_stream": "Healthy",
            "models_loaded": True,
            "last_analysis": datetime.utcnow().isoformat() + "Z",
        },
    }


@app.get("/api/analytics")
def analytics(days: int = 30):
    """Time-series data and correlations for analytics charts."""
    if days not in [7, 30, 90]:
        days = 30
    return get_analytics_data(days)


@app.get("/api/anomalies")
def anomalies():
    """All detected anomalies with severity and evidence."""
    all_anomalies = get_anomalies()
    summary = {
        "CRITICAL": sum(1 for a in all_anomalies if a["severity"] == "CRITICAL"),
        "HIGH": sum(1 for a in all_anomalies if a["severity"] == "HIGH"),
        "WATCH": sum(1 for a in all_anomalies if a["severity"] == "WATCH"),
    }
    return {
        "total": len(all_anomalies),
        "summary": summary,
        "anomalies": all_anomalies,
        "detection_method": "Isolation Forest (sklearn), contamination=0.12, n_estimators=200",
        "features_used": [
            "electricity_kwh", "energy_intensity", "co2_tonnes",
            "water_consumption_liters", "nox_kg", "pm25_kg",
            "machine_utilization", "furnace_temperature", "compressor_load",
        ],
    }


@app.get("/api/forecast")
def forecast():
    """7-day CO2 and energy forecast with historical context."""
    return get_forecast()


@app.get("/api/root-cause/{anomaly_id}")
def root_cause(anomaly_id: str):
    """Evidence-based root cause analysis for a specific anomaly."""
    result = get_root_cause(anomaly_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.post("/api/simulate")
def simulate(req: SimulateRequest):
    """Calculate what-if scenario impact for a given intervention."""
    result = calculate_scenario(req.intervention_id, req.custom_params)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.get("/api/simulate/all")
def simulate_all():
    """Calculate and rank all intervention scenarios."""
    return {"scenarios": calculate_all_scenarios()}


@app.get("/api/interventions")
def interventions_list():
    """List all available intervention types."""
    return {
        "interventions": [
            {"id": k, "name": v["name"], "category": v["category"], "icon": v["icon"]}
            for k, v in INTERVENTIONS.items()
        ]
    }


@app.get("/api/recommendations")
def recommendations():
    """Ranked intervention recommendations with transparent scoring."""
    return get_recommendations()


@app.get("/api/carbon")
def carbon():
    """Carbon intelligence: baseline, potential reduction, MRV readiness."""
    return get_carbon_intelligence()


@app.get("/api/climate")
def climate():
    """Climate risk analysis from temperature/humidity data."""
    return get_climate_intelligence()


@app.post("/api/copilot")
async def copilot(req: CopilotRequest):
    """AI Copilot powered by Gemini with structured facility context."""
    # Gather current system state to inject as context
    df = get_dataset()
    context_data = {
        "overview": {
            "health_score": get_health_score(df),
            "kpis": get_current_kpis(df),
        },
        "anomalies": get_anomalies()[-10:],  # most recent anomalies
        "forecast": get_forecast(),
        "recommendations": get_recommendations(),
    }
    result = await get_copilot_response(req.message, context_data)
    return result


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "ONER Backend", "version": "1.0.0"}


@app.get("/")
def root():
    return {
        "name": "ONER Environmental AI Autopilot",
        "facility": "Orion Manufacturing Plant",
        "docs": "/docs",
        "status": "operational",
    }
