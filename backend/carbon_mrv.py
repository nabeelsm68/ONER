"""
ONER Carbon & MRV Intelligence
Carbon baseline, potential reduction, MRV readiness assessment.
"""
import numpy as np
import pandas as pd
from data_generator import get_dataset

DISCLAIMER = (
    "Carbon-market eligibility and credit issuance require applicable methodologies "
    "and independent/authorized verification. Values shown represent potential impact estimates "
    "based on prototype simulated data. Actual MRV requires regulatory-compliant monitoring, "
    "reporting, and verification processes."
)


def get_carbon_intelligence() -> dict:
    df = get_dataset()

    # Baseline: first 30 days (clean operational period)
    baseline_df = df.head(30)
    recent_df = df.tail(30)

    baseline_daily_co2 = float(baseline_df["co2_tonnes"].mean())
    current_daily_co2 = float(recent_df["co2_tonnes"].mean())
    baseline_annual_co2 = baseline_daily_co2 * 365
    current_annual_co2 = current_daily_co2 * 365

    # Potential reduction from top intervention (furnace + compressor)
    furnace_gas_reduction = float(recent_df["natural_gas_m3"].mean()) * 0.12 * 2.04 / 1000 * 365
    compressor_elec_reduction = float(recent_df["electricity_kwh"].mean()) * 0.25 * 0.09 * 0.41 / 1000 * 365
    renewable_reduction = float(recent_df["electricity_kwh"].mean()) * 0.41 / 1000 * 0.30 * 365

    total_potential_reduction = furnace_gas_reduction + compressor_elec_reduction + renewable_reduction

    # Potentially creditable reduction (subset with MRV readiness)
    # We assume furnace optimization + renewable are verifiable, peak shifting is harder
    creditable_fraction = 0.72  # 72% potentially verifiable with proper MRV
    potentially_creditable = total_potential_reduction * creditable_fraction

    # MRV Readiness components
    mrv_components = [
        {"component": "Baseline Data Quality", "status": "READY", "score": 88, "notes": "90 days of daily operational records available"},
        {"component": "Monitoring Plan", "status": "PARTIAL", "score": 60, "notes": "Energy meters in place; water and air sensors need calibration certificates"},
        {"component": "Reporting Protocol", "status": "PARTIAL", "score": 55, "notes": "Internal reporting framework exists; third-party audit not yet engaged"},
        {"component": "Additionality Evidence", "status": "PARTIAL", "score": 70, "notes": "Interventions beyond business-as-usual; regulatory test analysis pending"},
        {"component": "Verification Body", "status": "NOT READY", "score": 10, "notes": "Independent verifier not yet engaged"},
        {"component": "Applicable Methodology", "status": "NOT READY", "score": 20, "notes": "CDM/VCS methodology selection required"},
    ]
    overall_mrv = round(np.mean([c["score"] for c in mrv_components]), 1)

    # Evidence timeline
    evidence_timeline = []
    for i, row in df.iterrows():
        if i % 7 == 0 or i in [15, 22, 38, 45, 60, 65, 75, 80]:
            evidence_timeline.append({
                "date": row["timestamp"].strftime("%Y-%m-%d"),
                "co2_tonnes": float(row["co2_tonnes"]),
                "event": _classify_event(i),
                "day_index": i,
            })

    return {
        "disclaimer": DISCLAIMER,
        "baseline": {
            "period": "Days 1–30 (May 1–30, 2026)",
            "daily_co2_tonnes": round(baseline_daily_co2, 3),
            "annual_co2_tonnes": round(baseline_annual_co2, 1),
            "source": "Operational records from prototype simulated dataset",
        },
        "current": {
            "period": "Last 30 days",
            "daily_co2_tonnes": round(current_daily_co2, 3),
            "annual_co2_tonnes": round(current_annual_co2, 1),
        },
        "vs_baseline_pct": round((current_daily_co2 - baseline_daily_co2) / baseline_daily_co2 * 100, 1),
        "potential_reduction": {
            "annual_tonnes": round(total_potential_reduction, 1),
            "breakdown": {
                "furnace_optimization": round(furnace_gas_reduction, 1),
                "compressor_optimization": round(compressor_elec_reduction, 1),
                "renewable_electricity": round(renewable_reduction, 1),
            },
            "label": "Potential Carbon Impact (not yet verified)",
        },
        "potentially_creditable": {
            "annual_tonnes": round(potentially_creditable, 1),
            "fraction_of_total_pct": round(creditable_fraction * 100, 0),
            "label": "Potentially Creditable Reduction",
            "note": "Subject to applicable methodology selection and independent verification",
        },
        "mrv_readiness": {
            "overall_score": overall_mrv,
            "components": mrv_components,
            "status": "PARTIAL" if overall_mrv < 70 else "READY",
            "next_steps": [
                "Engage accredited third-party verification body",
                "Select applicable methodology (e.g., VCS VM0001 or CDM AMS-II.C)",
                "Obtain calibration certificates for all measurement equipment",
                "Complete 12-month continuous monitoring period",
            ],
        },
        "evidence_timeline": evidence_timeline,
        "co2_price_reference": 65.0,
        "indicative_value_usd": round(potentially_creditable * 65.0, 0),
    }


def _classify_event(day_idx: int) -> str:
    if day_idx < 14:
        return "Baseline Period"
    elif 15 <= day_idx <= 22:
        return "Furnace Anomaly (elevated CO₂)"
    elif 38 <= day_idx <= 45:
        return "Compressor Anomaly (elevated electricity)"
    elif 60 <= day_idx <= 65:
        return "Water Anomaly"
    elif 75 <= day_idx <= 80:
        return "Air Emission Anomaly"
    else:
        return "Normal Operation"
