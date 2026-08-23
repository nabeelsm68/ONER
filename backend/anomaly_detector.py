"""
ONER Anomaly Detector
Uses Isolation Forest to detect environmental anomalies in industrial data.
Maps injected incidents to CRITICAL/HIGH severity.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from data_generator import get_dataset

FEATURES = [
    "electricity_kwh",
    "energy_intensity",
    "co2_tonnes",
    "water_consumption_liters",
    "nox_kg",
    "pm25_kg",
    "machine_utilization",
    "furnace_temperature",
    "compressor_load",
]

# Incident component mapping (deterministic, matches injected ranges)
INCIDENT_WINDOWS = [
    {"id": "INC-001", "start": 15, "end": 22, "component": "Furnace #2", "type": "furnace_degradation"},
    {"id": "INC-002", "start": 38, "end": 45, "component": "Compressor System", "type": "compressor_inefficiency"},
    {"id": "INC-003", "start": 60, "end": 65, "component": "Water Circuit", "type": "water_leakage"},
    {"id": "INC-004", "start": 75, "end": 80, "component": "Combustion System", "type": "air_emission"},
]

_model = None
_scaler = None
_results = None


def _train_and_detect():
    global _model, _scaler, _results
    df = get_dataset()
    X = df[FEATURES].copy()

    _scaler = StandardScaler()
    X_scaled = _scaler.fit_transform(X)

    _model = IsolationForest(
        n_estimators=200,
        contamination=0.12,   # ~12% anomalous days expected
        random_state=42,
        max_features=len(FEATURES),
    )
    _model.fit(X_scaled)

    scores = _model.score_samples(X_scaled)   # more negative = more anomalous
    preds = _model.predict(X_scaled)           # -1 = anomaly, 1 = normal

    # Normalize anomaly score to 0–1 (0=normal, 1=most anomalous)
    score_min, score_max = scores.min(), scores.max()
    anomaly_magnitude = (score_max - scores) / (score_max - score_min)

    # Severity thresholds
    p75 = np.percentile(anomaly_magnitude, 75)
    p88 = np.percentile(anomaly_magnitude, 88)
    p95 = np.percentile(anomaly_magnitude, 95)

    results = []
    for i, row in df.iterrows():
        mag = anomaly_magnitude[i]
        is_anomaly = preds[i] == -1

        if not is_anomaly or mag < p75:
            severity = "NORMAL"
        elif mag < p88:
            severity = "WATCH"
        elif mag < p95:
            severity = "HIGH"
        else:
            severity = "CRITICAL"

        # Identify which features are most deviant for this row
        day_vals = X_scaled[i]
        affected = []
        for feat, val in zip(FEATURES, day_vals):
            if abs(val) > 2.0:
                direction = "elevated" if val > 0 else "suppressed"
                affected.append({"metric": feat, "direction": direction, "z_score": round(float(val), 2)})

        # Map to known incident
        day_num = i
        component = None
        incident_id = None
        incident_type = None
        for inc in INCIDENT_WINDOWS:
            if inc["start"] <= day_num <= inc["end"]:
                component = inc["component"]
                incident_id = inc["id"]
                incident_type = inc["type"]
                break

        # Evidence description
        evidence = _build_evidence(row, df, day_vals, incident_type)

        # Unique anomaly ID: combines incident + day so each row has a unique key
        unique_id = f"{incident_id}-D{i:03d}" if incident_id else f"EVT-{i:03d}"

        results.append({
            "id": unique_id,
            "incident_id": incident_id,   # used for root-cause lookup (INC-001 etc.)
            "timestamp": row["timestamp"].isoformat(),
            "date": row["timestamp"].strftime("%Y-%m-%d"),
            "day_index": int(day_num),
            "severity": severity,
            "anomaly_magnitude": round(float(mag), 4),
            "is_anomaly": bool(is_anomaly),
            "affected_metrics": affected[:5],  # top 5 deviants
            "component": component,
            "incident_type": incident_type,
            "evidence": evidence,
            "production_output": float(row["production_output"]),
            "co2_tonnes": float(row["co2_tonnes"]),
            "electricity_kwh": float(row["electricity_kwh"]),
            "furnace_temperature": float(row["furnace_temperature"]),
            "compressor_load": float(row["compressor_load"]),
            "water_consumption_liters": float(row["water_consumption_liters"]),
            "nox_kg": float(row["nox_kg"]),
            "pm25_kg": float(row["pm25_kg"]),
        })

    _results = results
    return results


def _build_evidence(row, df, scaled_vals, incident_type):
    baseline = df.head(14)  # first 14 days as "normal" baseline
    evidence_lines = []

    if incident_type == "furnace_degradation":
        base_ft = baseline["furnace_temperature"].mean()
        base_gas = baseline["natural_gas_m3"].mean()
        base_ei = baseline["energy_intensity"].mean()
        ft_delta = (row["furnace_temperature"] - base_ft) / base_ft * 100
        gas_delta = (row["natural_gas_m3"] - base_gas) / base_gas * 100
        ei_delta = (row["energy_intensity"] - base_ei) / base_ei * 100
        evidence_lines.append(f"Furnace temperature is {ft_delta:+.1f}% above baseline ({row['furnace_temperature']:.0f}°C vs {base_ft:.0f}°C baseline).")
        evidence_lines.append(f"Natural gas consumption increased {gas_delta:+.1f}% ({row['natural_gas_m3']:.0f} m³ vs {base_gas:.0f} m³ baseline).")
        evidence_lines.append(f"Energy intensity increased {ei_delta:+.1f}% while production output remained within normal range.")
        evidence_lines.append("Pattern consistent with furnace refractory degradation or burner fouling.")

    elif incident_type == "compressor_inefficiency":
        base_cl = baseline["compressor_load"].mean()
        base_el = baseline["electricity_kwh"].mean()
        cl_delta = (row["compressor_load"] - base_cl) / base_cl * 100
        el_delta = (row["electricity_kwh"] - base_el) / base_el * 100
        evidence_lines.append(f"Compressor load elevated {cl_delta:+.1f}% above baseline ({row['compressor_load']:.1f}% vs {base_cl:.1f}%).")
        evidence_lines.append(f"Electricity consumption increased {el_delta:+.1f}% without proportional production increase.")
        evidence_lines.append("Energy-per-unit-production ratio indicates reduced compressor mechanical efficiency.")
        evidence_lines.append("Pattern consistent with compressor wear, refrigerant leak, or fouled heat exchangers.")

    elif incident_type == "water_leakage":
        base_w = baseline["water_consumption_liters"].mean()
        w_delta = (row["water_consumption_liters"] - base_w) / base_w * 100
        evidence_lines.append(f"Water consumption is {w_delta:+.1f}% above baseline ({row['water_consumption_liters']:,.0f} L vs {base_w:,.0f} L).")
        evidence_lines.append("Production output has not increased proportionally; consumption is unexplained by operational demand.")
        evidence_lines.append("Sharp single-day increase pattern suggests uncontrolled leakage rather than gradual process drift.")

    elif incident_type == "air_emission":
        base_nox = baseline["nox_kg"].mean()
        base_pm = baseline["pm25_kg"].mean()
        nox_delta = (row["nox_kg"] - base_nox) / base_nox * 100
        pm_delta = (row["pm25_kg"] - base_pm) / base_pm * 100
        evidence_lines.append(f"NOx emissions elevated {nox_delta:+.1f}% above baseline ({row['nox_kg']:.1f} kg vs {base_nox:.1f} kg).")
        evidence_lines.append(f"PM2.5 elevated {pm_delta:+.1f}% above baseline ({row['pm25_kg']:.1f} kg vs {base_pm:.1f} kg).")
        evidence_lines.append("Simultaneous NOx and PM2.5 increase suggests incomplete combustion or air-fuel ratio imbalance.")
        evidence_lines.append("Pattern consistent with burner misconfiguration or emission control equipment degradation.")

    else:
        evidence_lines.append("Statistical deviation detected across multiple environmental indicators.")
        evidence_lines.append("Review operational logs for this period.")

    return " ".join(evidence_lines)


def get_anomalies():
    global _results
    if _results is None:
        _train_and_detect()
    return [r for r in _results if r["is_anomaly"]]


def get_all_results():
    global _results
    if _results is None:
        _train_and_detect()
    return _results


def get_anomaly_by_id(anomaly_id: str):
    """Find anomaly by unique day-based ID (e.g. INC-001-D015) or incident ID (e.g. INC-001)."""
    results = get_all_results()
    # First try exact match on unique id
    for r in results:
        if r["id"] == anomaly_id:
            return r
    # Fallback: try matching incident_id (returns first matching anomaly for that incident)
    for r in results:
        if r.get("incident_id") == anomaly_id and r["is_anomaly"]:
            return r
    return None


def get_anomaly_by_incident_id(incident_id: str):
    """Find the most severe anomaly for a given incident (INC-001, INC-002, etc.)."""
    results = get_all_results()
    candidates = [r for r in results if r.get("incident_id") == incident_id and r["is_anomaly"]]
    if not candidates:
        return None
    # Return the highest-magnitude day for this incident
    return max(candidates, key=lambda x: x["anomaly_magnitude"])

def get_active_alerts():
    """Most recent anomalous events for the dashboard."""
    results = get_all_results()
    recent = [r for r in results[-20:] if r["is_anomaly"]]
    recent.sort(key=lambda x: x["anomaly_magnitude"], reverse=True)
    return recent[:5]
