"""
ONER Calculations
Environmental intensity metrics, health score, and derived KPIs.
"""
import numpy as np
import pandas as pd
from data_generator import get_dataset


def get_health_score(df: pd.DataFrame) -> dict:
    """
    Environmental Health Score (0–100).
    Based on normalized deviation of intensity metrics from their 30-day rolling baseline.
    Higher = healthier (better than baseline).
    """
    recent = df.tail(7)
    baseline = df.tail(37).head(30)  # 30-day baseline ending 7 days ago

    def norm_dev(recent_val, base_val):
        """How much worse is recent vs baseline? Positive = worse."""
        if base_val == 0:
            return 0
        return (recent_val - base_val) / base_val

    ci_dev = norm_dev(recent["carbon_intensity"].mean(), baseline["carbon_intensity"].mean())
    ei_dev = norm_dev(recent["energy_intensity"].mean(), baseline["energy_intensity"].mean())
    wi_dev = norm_dev(recent["water_intensity"].mean(), baseline["water_intensity"].mean())
    waste_dev = norm_dev(recent["waste_intensity"].mean(), baseline["waste_intensity"].mean())
    nox_dev = norm_dev(recent["nox_kg"].mean(), baseline["nox_kg"].mean())
    pm_dev = norm_dev(recent["pm25_kg"].mean(), baseline["pm25_kg"].mean())

    # Weighted penalty: each dev is fraction (e.g. 0.15 = 15% over baseline)
    # Scaled so 50% excess on all metrics = score ~0; 10% excess = score ~72
    penalty = (
        min(30, max(0, ci_dev) * 150)
        + min(25, max(0, ei_dev) * 125)
        + min(15, max(0, wi_dev) * 75)
        + min(10, max(0, waste_dev) * 50)
        + min(10, max(0, nox_dev) * 50)
        + min(10, max(0, pm_dev) * 50)
    )

    score = max(0, min(100, 100 - penalty))

    return {
        "score": round(score, 1),
        "components": {
            "carbon_intensity": round(ci_dev * 100, 1),
            "energy_intensity": round(ei_dev * 100, 1),
            "water_intensity": round(wi_dev * 100, 1),
            "waste_intensity": round(waste_dev * 100, 1),
            "nox": round(nox_dev * 100, 1),
            "pm25": round(pm_dev * 100, 1),
        },
        "formula": (
            "score = 100 - Σ(weighted normalized deviation from 30-day baseline). "
            "Weights: CO2 intensity 30%, Energy intensity 25%, Water 15%, Waste 10%, NOx 10%, PM2.5 10%."
        ),
    }


def get_current_kpis(df: pd.DataFrame) -> dict:
    """Last 7-day rolling averages vs previous 7-day period."""
    recent = df.tail(7)
    prev = df.tail(14).head(7)

    def change_pct(r, p):
        pm = p.mean()
        if pm == 0:
            return 0.0
        return round((r.mean() - pm) / pm * 100, 1)

    total_co2 = recent["co2_tonnes"].sum()
    avg_energy = recent["electricity_kwh"].mean()
    avg_water = recent["water_consumption_liters"].mean()
    avg_waste = recent["waste_tonnes"].mean()
    avg_nox = recent["nox_kg"].mean()
    avg_pm25 = recent["pm25_kg"].mean()
    air_risk = "HIGH" if (avg_nox > 20 or avg_pm25 > 7) else ("MODERATE" if (avg_nox > 15 or avg_pm25 > 5) else "NORMAL")

    return {
        "co2_tonnes": {"value": round(total_co2, 2), "unit": "t CO₂ (7d)", "change_pct": change_pct(recent["co2_tonnes"], prev["co2_tonnes"])},
        "electricity_kwh": {"value": round(avg_energy, 0), "unit": "kWh/day avg", "change_pct": change_pct(recent["electricity_kwh"], prev["electricity_kwh"])},
        "water_liters": {"value": round(avg_water, 0), "unit": "L/day avg", "change_pct": change_pct(recent["water_consumption_liters"], prev["water_consumption_liters"])},
        "waste_tonnes": {"value": round(avg_waste, 3), "unit": "t/day avg", "change_pct": change_pct(recent["waste_tonnes"], prev["waste_tonnes"])},
        "air_quality_risk": {"value": air_risk, "nox_kg": round(avg_nox, 2), "pm25_kg": round(avg_pm25, 2)},
        "carbon_intensity": {"value": round(recent["carbon_intensity"].mean(), 4), "unit": "t CO₂/t prod", "change_pct": change_pct(recent["carbon_intensity"], prev["carbon_intensity"])},
        "energy_intensity": {"value": round(recent["energy_intensity"].mean(), 2), "unit": "kWh/t prod", "change_pct": change_pct(recent["energy_intensity"], prev["energy_intensity"])},
        "production_output": {"value": round(recent["production_output"].mean(), 1), "unit": "t/day avg", "change_pct": change_pct(recent["production_output"], prev["production_output"])},
    }


def get_analytics_data(days: int = 30) -> dict:
    df = get_dataset()
    subset = df.tail(days).copy()
    subset["date"] = subset["timestamp"].dt.strftime("%Y-%m-%d")

    records = subset[[
        "date", "co2_tonnes", "electricity_kwh", "natural_gas_m3",
        "water_consumption_liters", "waste_tonnes", "nox_kg", "sox_kg", "pm25_kg",
        "production_output", "energy_intensity", "carbon_intensity",
        "temperature_c", "humidity_percent", "furnace_temperature",
        "compressor_load", "machine_utilization", "cooling_load",
    ]].to_dict(orient="records")

    # Correlations for relationship section
    corr_energy_co2 = round(subset["electricity_kwh"].corr(subset["co2_tonnes"]), 3)
    corr_prod_energy = round(subset["production_output"].corr(subset["electricity_kwh"]), 3)
    corr_temp_cooling = round(subset["temperature_c"].corr(subset["cooling_load"]), 3)
    corr_furnace_gas = round(subset["furnace_temperature"].corr(subset["natural_gas_m3"]), 3)
    corr_comp_elec = round(subset["compressor_load"].corr(subset["electricity_kwh"]), 3)

    return {
        "days": days,
        "records": records,
        "correlations": [
            {"pair": "Energy → CO₂", "r": corr_energy_co2, "interpretation": "Strong positive: higher energy consumption drives CO₂ emissions."},
            {"pair": "Production → Energy", "r": corr_prod_energy, "interpretation": "Positive: increased production requires more energy."},
            {"pair": "Temperature → Cooling Demand", "r": corr_temp_cooling, "interpretation": "High positive: warmer days significantly increase cooling load."},
            {"pair": "Furnace Temp → Natural Gas", "r": corr_furnace_gas, "interpretation": "Positive: furnace operating at higher temperatures consumes more gas."},
            {"pair": "Compressor Load → Electricity", "r": corr_comp_elec, "interpretation": "Positive: compressor inefficiency raises electricity consumption."},
        ],
    }
