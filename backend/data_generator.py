"""
ONER Data Generator
Generates 90 days of realistic correlated industrial environmental data
for Orion Manufacturing Plant with 4 injected anomaly incidents.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Emission factors (prototype values, clearly defined)
EMISSION_FACTORS = {
    "electricity_kg_per_kwh": 0.41,   # kg CO2/kWh (grid average)
    "natural_gas_kg_per_m3": 2.04,    # kg CO2/m3
    "diesel_kg_per_liter": 2.68,      # kg CO2/liter
}

FACILITY_NAME = "Orion Manufacturing Plant"
START_DATE = datetime(2026, 5, 1)
DAYS = 90
RANDOM_SEED = 42


def generate_dataset() -> pd.DataFrame:
    np.random.seed(RANDOM_SEED)
    dates = [START_DATE + timedelta(days=i) for i in range(DAYS)]
    n = DAYS

    # ─── Base seasonal pattern ───────────────────────────────────────────────
    day_idx = np.arange(n)
    weekday = np.array([d.weekday() for d in dates])   # 0=Mon, 6=Sun
    is_weekend = (weekday >= 5).astype(float)

    # Temperature: summer seasonal curve (Northern hemisphere May–July)
    temp_base = 22 + 8 * np.sin(np.pi * day_idx / 90) + np.random.normal(0, 1.5, n)
    humidity = 55 + 15 * np.sin(np.pi * day_idx / 90 + 0.3) + np.random.normal(0, 4, n)
    humidity = np.clip(humidity, 30, 90)

    # Production output (tonnes/day) — lower on weekends
    production_base = 480 + 30 * np.sin(2 * np.pi * day_idx / 30) + np.random.normal(0, 15, n)
    production_output = production_base * (1 - 0.35 * is_weekend)
    production_output = np.clip(production_output, 50, 600)

    # Machine utilization (%) — correlated with production
    machine_utilization = 65 + (production_output - production_output.mean()) / production_output.std() * 8
    machine_utilization += np.random.normal(0, 2, n)
    machine_utilization = np.clip(machine_utilization, 40, 95)

    # Furnace temperature (°C) — fairly stable, linked to production
    furnace_temp_base = 1180 + (production_output - 300) * 0.08 + np.random.normal(0, 5, n)
    furnace_temperature = np.clip(furnace_temp_base, 1100, 1300)

    # Compressor load (%) — linked to machine utilization
    compressor_load = 55 + machine_utilization * 0.25 + np.random.normal(0, 3, n)
    compressor_load = np.clip(compressor_load, 35, 90)

    # Cooling load (kWh) — driven by temperature
    cooling_load = 800 + (temp_base - 15) * 40 + (humidity - 50) * 8 + np.random.normal(0, 50, n)
    cooling_load = np.clip(cooling_load, 200, 3000)

    # Natural gas (m3) — furnace driven
    natural_gas = (
        2800
        + (furnace_temperature - 1180) * 1.8
        + (production_output - 300) * 0.9
        + np.random.normal(0, 80, n)
    )
    natural_gas = np.clip(natural_gas * (1 - 0.25 * is_weekend), 500, 5000)

    # Electricity (kWh) — production + compressor + cooling
    electricity = (
        18000
        + production_output * 18
        + compressor_load * 60
        + cooling_load * 0.8
        + np.random.normal(0, 400, n)
    )
    electricity = np.clip(electricity * (1 - 0.2 * is_weekend), 5000, 45000)

    # Diesel (liters) — auxiliary, small
    diesel = 150 + production_output * 0.05 + np.random.normal(0, 20, n)
    diesel = np.clip(diesel * (1 - 0.3 * is_weekend), 20, 400)

    # CO2 (tonnes) — derived from energy sources
    co2 = (
        electricity * EMISSION_FACTORS["electricity_kg_per_kwh"]
        + natural_gas * EMISSION_FACTORS["natural_gas_kg_per_m3"]
        + diesel * EMISSION_FACTORS["diesel_kg_per_liter"]
    ) / 1000  # → tonnes

    # Water consumption (liters)
    water = (
        45000
        + production_output * 30
        + temp_base * 400
        + np.random.normal(0, 2000, n)
    )
    water = np.clip(water * (1 - 0.15 * is_weekend), 10000, 120000)

    # Waste (tonnes)
    waste = 3.5 + production_output * 0.006 + np.random.normal(0, 0.3, n)
    waste = np.clip(waste, 0.5, 8)

    # Recycled percentage
    recycled_pct = 62 + np.random.normal(0, 5, n)
    recycled_pct = np.clip(recycled_pct, 45, 85)

    # Air emissions
    nox = 12 + (natural_gas / 1000) * 1.8 + np.random.normal(0, 1.5, n)
    nox = np.clip(nox, 5, 40)
    sox = 3.5 + (natural_gas / 1000) * 0.4 + np.random.normal(0, 0.5, n)
    sox = np.clip(sox, 1, 15)
    pm25 = 4.2 + (production_output / 100) * 0.6 + np.random.normal(0, 0.8, n)
    pm25 = np.clip(pm25, 1.5, 18)

    # ─── Inject Incident 1: Furnace efficiency degradation (Day 15–22) ───────
    inc1 = slice(15, 23)
    furnace_temperature[inc1] += np.linspace(30, 65, 8)        # furnace runs hotter
    natural_gas[inc1] *= np.linspace(1.12, 1.22, 8)            # more gas consumed
    electricity[inc1] *= np.linspace(1.05, 1.12, 8)            # auxiliary electricity up
    co2[inc1] = (
        electricity[inc1] * EMISSION_FACTORS["electricity_kg_per_kwh"]
        + natural_gas[inc1] * EMISSION_FACTORS["natural_gas_kg_per_m3"]
        + diesel[inc1] * EMISSION_FACTORS["diesel_kg_per_liter"]
    ) / 1000
    # production stays roughly stable (already set)

    # ─── Inject Incident 2: Compressor inefficiency (Day 38–45) ─────────────
    inc2 = slice(38, 46)
    compressor_load[inc2] *= np.linspace(1.18, 1.30, 8)        # load spikes
    electricity[inc2] += compressor_load[inc2] * 80             # extra electricity
    co2[inc2] = (
        electricity[inc2] * EMISSION_FACTORS["electricity_kg_per_kwh"]
        + natural_gas[inc2] * EMISSION_FACTORS["natural_gas_kg_per_m3"]
        + diesel[inc2] * EMISSION_FACTORS["diesel_kg_per_liter"]
    ) / 1000

    # ─── Inject Incident 3: Water leakage (Day 60–65) ────────────────────────
    inc3 = slice(60, 66)
    water[inc3] *= np.linspace(1.6, 2.1, 6)                    # sharp water spike

    # ─── Inject Incident 4: Air emission anomaly (Day 75–80) ────────────────
    inc4 = slice(75, 81)
    nox[inc4] *= np.linspace(1.8, 2.4, 6)
    pm25[inc4] *= np.linspace(1.5, 2.0, 6)

    # ─── Derived intensity metrics ────────────────────────────────────────────
    total_energy_kwh = electricity + natural_gas * 10.55 + diesel * 10.4  # kWh equivalent
    energy_intensity = total_energy_kwh / np.maximum(production_output, 1)
    carbon_intensity = co2 / np.maximum(production_output, 1)
    water_intensity = water / np.maximum(production_output, 1)
    waste_intensity = waste / np.maximum(production_output, 1)

    df = pd.DataFrame({
        "timestamp": dates,
        "production_output": np.round(production_output, 2),
        "electricity_kwh": np.round(electricity, 1),
        "natural_gas_m3": np.round(natural_gas, 1),
        "diesel_liters": np.round(diesel, 1),
        "co2_tonnes": np.round(co2, 3),
        "total_energy_kwh": np.round(total_energy_kwh, 1),
        "energy_intensity": np.round(energy_intensity, 3),
        "carbon_intensity": np.round(carbon_intensity, 4),
        "water_consumption_liters": np.round(water, 0),
        "water_intensity": np.round(water_intensity, 2),
        "waste_tonnes": np.round(waste, 3),
        "waste_intensity": np.round(waste_intensity, 4),
        "recycled_percentage": np.round(recycled_pct, 1),
        "nox_kg": np.round(nox, 2),
        "sox_kg": np.round(sox, 2),
        "pm25_kg": np.round(pm25, 2),
        "temperature_c": np.round(temp_base, 1),
        "humidity_percent": np.round(humidity, 1),
        "machine_utilization": np.round(machine_utilization, 1),
        "furnace_temperature": np.round(furnace_temperature, 1),
        "compressor_load": np.round(compressor_load, 1),
        "cooling_load": np.round(cooling_load, 1),
    })

    return df


# Singleton — generate once at import time
_df: pd.DataFrame | None = None


def get_dataset() -> pd.DataFrame:
    global _df
    if _df is None:
        _df = generate_dataset()
    return _df


if __name__ == "__main__":
    df = generate_dataset()
    print(df.head(25).to_string())
    print("\nShape:", df.shape)
    print("\nIncident windows:")
    print("  Inc1 (furnace):", df.iloc[15:23][["timestamp", "furnace_temperature", "natural_gas_m3", "co2_tonnes"]].to_string())
    print("  Inc2 (compressor):", df.iloc[38:46][["timestamp", "compressor_load", "electricity_kwh"]].to_string())
    print("  Inc3 (water):", df.iloc[60:66][["timestamp", "water_consumption_liters"]].to_string())
    print("  Inc4 (air):", df.iloc[75:81][["timestamp", "nox_kg", "pm25_kg"]].to_string())
