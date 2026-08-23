"""
ONER Climate Intelligence
Data-driven climate risk detection from simulated temperature/humidity data.
"""
import numpy as np
import pandas as pd
from data_generator import get_dataset


def get_climate_intelligence() -> dict:
    df = get_dataset()
    recent = df.tail(14)
    forecast_temp = float(df["temperature_c"].tail(7).mean()) + 1.5  # projected slight increase

    # Risk thresholds
    TEMP_HIGH = 30.0
    TEMP_VERY_HIGH = 35.0
    HUMIDITY_HIGH = 75.0
    COOLING_HIGH = 2000.0

    avg_temp = float(recent["temperature_c"].mean())
    avg_humidity = float(recent["humidity_percent"].mean())
    avg_cooling = float(recent["cooling_load"].mean())
    max_temp = float(recent["temperature_c"].max())

    # Correlations
    temp_cooling_corr = round(df["temperature_c"].corr(df["cooling_load"]), 3)

    # Cooling demand trend
    cooling_trend_pct = round(
        (recent["cooling_load"].mean() - df.head(30)["cooling_load"].mean())
        / df.head(30)["cooling_load"].mean() * 100,
        1,
    )

    risks = []

    if avg_temp > TEMP_HIGH:
        risks.append({
            "risk_id": "RISK-TEMP-001",
            "type": "Elevated Ambient Temperature",
            "severity": "HIGH" if avg_temp > TEMP_VERY_HIGH else "MODERATE",
            "current_value": round(avg_temp, 1),
            "threshold": TEMP_HIGH,
            "unit": "°C",
            "impact": "Cooling demand elevated, increasing electricity consumption and CO₂ emissions.",
            "oner_recommendation": (
                f"High-temperature conditions are increasing cooling demand by ~{cooling_trend_pct:.0f}% above seasonal baseline. "
                "ONER recommends shifting non-critical energy-intensive operations to cooler periods (pre-8 AM or post-8 PM) "
                "to reduce concurrent peak cooling and production loads."
            ),
            "affected_metrics": ["cooling_load", "electricity_kwh", "co2_tonnes"],
            "correlation": f"Temperature → Cooling Load correlation: r={temp_cooling_corr}",
        })

    if avg_humidity > HUMIDITY_HIGH:
        risks.append({
            "risk_id": "RISK-HUM-001",
            "type": "High Humidity",
            "severity": "MODERATE",
            "current_value": round(avg_humidity, 1),
            "threshold": HUMIDITY_HIGH,
            "unit": "%",
            "impact": "High humidity reduces thermal efficiency of cooling systems and may accelerate equipment corrosion.",
            "oner_recommendation": (
                "High humidity conditions reduce cooling system COP. "
                "Verify cooling tower chemical treatment and inspect condenser coil surfaces for fouling."
            ),
            "affected_metrics": ["cooling_load", "electricity_kwh"],
        })

    # Projected cooling demand over next 7 days
    projected_days = []
    last_date = df["timestamp"].iloc[-1]
    for i in range(1, 8):
        proj_temp = avg_temp + i * 0.15 + np.random.normal(0, 0.5)
        proj_humidity = avg_humidity + np.random.normal(0, 2)
        proj_cooling = max(200, 800 + (proj_temp - 15) * 40 + (proj_humidity - 50) * 8)
        proj_co2_impact = proj_cooling * 0.8 * 0.41 / 1000  # approximate from cooling electricity
        projected_days.append({
            "date": (pd.Timestamp(last_date) + pd.Timedelta(days=i)).strftime("%Y-%m-%d"),
            "projected_temp_c": round(proj_temp, 1),
            "projected_cooling_kwh": round(proj_cooling, 0),
            "projected_co2_impact_tonnes": round(proj_co2_impact, 3),
        })

    # Temperature trend over facility's recorded history
    temp_trend = []
    for _, row in df.iterrows():
        temp_trend.append({
            "date": row["timestamp"].strftime("%Y-%m-%d"),
            "temperature_c": float(row["temperature_c"]),
            "cooling_load": float(row["cooling_load"]),
            "humidity_percent": float(row["humidity_percent"]),
        })

    return {
        "current_conditions": {
            "avg_temperature_c": round(avg_temp, 1),
            "max_temperature_c": round(max_temp, 1),
            "avg_humidity_pct": round(avg_humidity, 1),
            "avg_cooling_load_kwh": round(avg_cooling, 0),
            "cooling_trend_pct": cooling_trend_pct,
        },
        "climate_risks": risks,
        "risk_count": len(risks),
        "overall_climate_risk": "HIGH" if any(r["severity"] == "HIGH" for r in risks) else ("MODERATE" if risks else "LOW"),
        "projected_conditions": projected_days,
        "temperature_trend": temp_trend,
        "temp_cooling_correlation": temp_cooling_corr,
        "summary": (
            f"Current average temperature is {avg_temp:.1f}°C. "
            f"Cooling load is tracking {cooling_trend_pct:+.1f}% vs seasonal baseline. "
            f"Temperature and cooling demand show r={temp_cooling_corr} correlation. "
            + ("High-temperature risk active." if avg_temp > TEMP_HIGH else "Conditions within normal operating range.")
        ),
    }
