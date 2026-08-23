"""
ONER Root Cause Engine
Deterministic, evidence-based root cause analysis for detected anomalies.
Does NOT use LLM for causal reasoning — uses actual data relationships.
"""
import numpy as np
import pandas as pd
from data_generator import get_dataset

INCIDENT_RULES = {
    "furnace_degradation": {
        "root_cause": "Furnace #2 — Thermal Efficiency Degradation",
        "likely_mechanism": "Refractory lining degradation or burner fouling causing thermal inefficiency.",
        "primary_metric": "furnace_temperature",
        "affected_systems": ["Natural gas combustion system", "CO₂ emissions", "Energy efficiency"],
        "recommended_action": "Inspect and service Furnace #2 burner assembly and refractory lining.",
        "urgency": "HIGH",
    },
    "compressor_inefficiency": {
        "root_cause": "Compressor System — Mechanical Efficiency Loss",
        "likely_mechanism": "Compressor wear, refrigerant leak, or fouled heat exchangers increasing power draw without proportional compression output.",
        "primary_metric": "compressor_load",
        "affected_systems": ["Electricity consumption", "Energy efficiency", "CO₂ emissions"],
        "recommended_action": "Inspect compressor seals, valve plates, and heat exchanger condition.",
        "urgency": "MODERATE",
    },
    "water_leakage": {
        "root_cause": "Cooling/Process Water Circuit — Uncontrolled Leakage",
        "likely_mechanism": "Pipe joint failure, valve failure, or heat exchanger breach causing unaccounted water loss.",
        "primary_metric": "water_consumption_liters",
        "affected_systems": ["Water consumption", "Water intensity", "Operational efficiency"],
        "recommended_action": "Conduct immediate pressure test on cooling water circuit. Inspect joints and valves in sectors B and C.",
        "urgency": "HIGH",
    },
    "air_emission": {
        "root_cause": "Combustion System — Air-Fuel Ratio Imbalance",
        "likely_mechanism": "Burner misconfiguration, O2 trim control failure, or emission control equipment degradation causing incomplete combustion.",
        "primary_metric": "nox_kg",
        "affected_systems": ["NOx emissions", "PM2.5 emissions", "Regulatory compliance"],
        "recommended_action": "Recalibrate burner air-fuel ratio controls. Inspect particulate filter and SCR system.",
        "urgency": "CRITICAL",
    },
}


def get_root_cause(anomaly_id: str) -> dict:
    from anomaly_detector import get_anomaly_by_id

    anomaly = get_anomaly_by_id(anomaly_id)
    if anomaly is None:
        return {"error": f"Anomaly {anomaly_id} not found"}

    df = get_dataset()
    incident_type = anomaly.get("incident_type")

    # Baseline: first 14 days of data (clean period)
    baseline = df.head(14)

    # Window: the anomaly day ± 3 days
    day_idx = anomaly["day_index"]
    window_start = max(0, day_idx - 3)
    window_end = min(len(df) - 1, day_idx + 3)
    window = df.iloc[window_start:window_end + 1]

    # Compute deviations
    def pct_change(metric):
        base_val = baseline[metric].mean()
        window_val = window[metric].mean()
        if base_val == 0:
            return 0.0
        return round((window_val - base_val) / base_val * 100, 1)

    metric_deviations = {
        "electricity_kwh": pct_change("electricity_kwh"),
        "natural_gas_m3": pct_change("natural_gas_m3"),
        "co2_tonnes": pct_change("co2_tonnes"),
        "energy_intensity": pct_change("energy_intensity"),
        "carbon_intensity": pct_change("carbon_intensity"),
        "water_consumption_liters": pct_change("water_consumption_liters"),
        "nox_kg": pct_change("nox_kg"),
        "pm25_kg": pct_change("pm25_kg"),
        "furnace_temperature": pct_change("furnace_temperature"),
        "compressor_load": pct_change("compressor_load"),
        "production_output": pct_change("production_output"),
        "machine_utilization": pct_change("machine_utilization"),
    }

    # Select top deviating metrics
    significant = {k: v for k, v in metric_deviations.items() if abs(v) > 5.0}
    top_metrics = sorted(significant.items(), key=lambda x: abs(x[1]), reverse=True)[:6]

    # Rule lookup
    rule = INCIDENT_RULES.get(incident_type, {
        "root_cause": "Multi-metric Environmental Anomaly",
        "likely_mechanism": "Correlated deviations across multiple operational parameters detected.",
        "primary_metric": top_metrics[0][0] if top_metrics else "electricity_kwh",
        "affected_systems": ["Multiple systems"],
        "recommended_action": "Review operational logs and perform system inspection.",
        "urgency": anomaly["severity"],
    })

    # Build supporting evidence narrative
    evidence_items = []
    for metric, pct in top_metrics:
        label = metric.replace("_", " ").title()
        direction = "above" if pct > 0 else "below"
        evidence_items.append({
            "metric": label,
            "deviation_pct": pct,
            "direction": direction,
            "baseline_value": round(float(baseline[metric].mean()), 3),
            "anomaly_value": round(float(window[metric].mean()), 3),
        })

    # Timeline: 14 days centered on anomaly
    tl_start = max(0, day_idx - 7)
    tl_end = min(len(df), day_idx + 7)
    timeline_df = df.iloc[tl_start:tl_end][["timestamp", "co2_tonnes", "electricity_kwh", "energy_intensity", "production_output"]]
    timeline = []
    for _, r in timeline_df.iterrows():
        timeline.append({
            "date": r["timestamp"].strftime("%Y-%m-%d"),
            "co2_tonnes": float(r["co2_tonnes"]),
            "electricity_kwh": float(r["electricity_kwh"]),
            "energy_intensity": float(r["energy_intensity"]),
            "production_output": float(r["production_output"]),
            "is_anomaly_day": (r["timestamp"].date() == df.iloc[day_idx]["timestamp"].date()),
        })

    # Financial impact estimate
    baseline_co2_daily = float(baseline["co2_tonnes"].mean())
    anomaly_co2_daily = float(window["co2_tonnes"].mean())
    excess_co2_per_day = max(0, anomaly_co2_daily - baseline_co2_daily)
    co2_price_per_tonne = 65.0  # USD, indicative carbon price
    daily_co2_cost = excess_co2_per_day * co2_price_per_tonne

    baseline_elec = float(baseline["electricity_kwh"].mean())
    anomaly_elec = float(window["electricity_kwh"].mean())
    excess_elec_per_day = max(0, anomaly_elec - baseline_elec)
    elec_price_per_kwh = 0.12
    daily_elec_cost = excess_elec_per_day * elec_price_per_kwh

    return {
        "anomaly_id": anomaly_id,
        "severity": anomaly["severity"],
        "component": anomaly.get("component", "Unknown"),
        "incident_type": incident_type,
        "root_cause": rule["root_cause"],
        "likely_mechanism": rule["likely_mechanism"],
        "affected_systems": rule["affected_systems"],
        "recommended_action": rule["recommended_action"],
        "urgency": rule["urgency"],
        "evidence": anomaly["evidence"],
        "supporting_metrics": evidence_items,
        "metric_deviations": metric_deviations,
        "timeline": timeline,
        "financial_impact": {
            "excess_co2_per_day_tonnes": round(excess_co2_per_day, 3),
            "daily_co2_cost_usd": round(daily_co2_cost, 2),
            "excess_electricity_per_day_kwh": round(excess_elec_per_day, 1),
            "daily_electricity_cost_usd": round(daily_elec_cost, 2),
            "total_daily_cost_usd": round(daily_co2_cost + daily_elec_cost, 2),
            "co2_price_assumption": f"${co2_price_per_tonne}/tonne (indicative)",
            "elec_price_assumption": f"${elec_price_per_kwh}/kWh",
        },
    }
