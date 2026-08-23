"""
ONER Intervention Simulator
Parameterized what-if scenario calculator.
All values derived from current facility data — no hardcoded results.
"""
import numpy as np
from data_generator import get_dataset

CO2_PRICE_USD = 65.0          # indicative USD/tonne
ELEC_PRICE_USD = 0.12         # USD/kWh
GAS_PRICE_USD = 0.45          # USD/m3
WATER_PRICE_USD = 0.003       # USD/liter


INTERVENTIONS = {
    "furnace_optimization": {
        "name": "Optimize Furnace Operation",
        "description": "Tune furnace #2 burner assembly, inspect refractory lining, and implement combustion optimization controls.",
        "category": "Energy Efficiency",
        "icon": "flame",
        "parameters": {
            "efficiency_gain_pct": 12.0,
            "applies_to": ["natural_gas_m3", "co2_tonnes"],
        },
        "implementation_cost_usd": 85000,
    },
    "compressor_optimization": {
        "name": "Optimize Compressor System",
        "description": "Service compressor units, replace worn seals and valve plates, clean heat exchangers.",
        "category": "Energy Efficiency",
        "icon": "wind",
        "parameters": {
            "efficiency_gain_pct": 9.0,
            "applies_to": ["electricity_kwh"],
        },
        "implementation_cost_usd": 55000,
    },
    "peak_shifting": {
        "name": "Peak-Hour Load Shifting",
        "description": "Shift non-critical energy-intensive operations outside peak tariff hours (8 AM–10 PM).",
        "category": "Demand Management",
        "icon": "clock",
        "parameters": {
            "shift_pct": 18.0,
            "demand_charge_reduction_pct": 22.0,
            "applies_to": ["electricity_kwh"],
        },
        "implementation_cost_usd": 25000,
    },
    "renewable_electricity": {
        "name": "Renewable Electricity Procurement",
        "description": "Switch 30% of electricity procurement to renewable sources (PPA or on-site solar).",
        "category": "Carbon Reduction",
        "icon": "sun",
        "parameters": {
            "renewable_pct": 30.0,
            "applies_to": ["co2_tonnes"],
        },
        "implementation_cost_usd": 180000,
    },
    "cooling_efficiency": {
        "name": "Cooling System Upgrade",
        "description": "Upgrade chiller units and optimize cooling tower operation for improved COP.",
        "category": "Energy Efficiency",
        "icon": "snowflake",
        "parameters": {
            "cop_improvement_pct": 15.0,
            "applies_to": ["electricity_kwh", "cooling_load"],
        },
        "implementation_cost_usd": 120000,
    },
    "water_leakage_reduction": {
        "name": "Water Leakage Remediation",
        "description": "Pressure test and repair cooling water circuit, install automated leak detection sensors.",
        "category": "Water Conservation",
        "icon": "droplets",
        "parameters": {
            "leak_reduction_pct": 40.0,
            "applies_to": ["water_consumption_liters"],
        },
        "implementation_cost_usd": 35000,
    },
}


def calculate_scenario(intervention_id: str, custom_params: dict = None) -> dict:
    df = get_dataset()
    recent = df.tail(30)

    avg_electricity = float(recent["electricity_kwh"].mean())
    avg_gas = float(recent["natural_gas_m3"].mean())
    avg_co2 = float(recent["co2_tonnes"].mean())
    avg_water = float(recent["water_consumption_liters"].mean())
    avg_elec_emission = avg_electricity * 0.41 / 1000  # tonnes
    avg_gas_emission = avg_gas * 2.04 / 1000            # tonnes

    if intervention_id not in INTERVENTIONS:
        return {"error": f"Unknown intervention: {intervention_id}"}

    inv = INTERVENTIONS[intervention_id]
    params = {**inv["parameters"], **(custom_params or {})}
    cost = inv["implementation_cost_usd"]

    annual_co2_reduction = 0.0
    annual_energy_savings_kwh = 0.0
    annual_monetary_savings = 0.0

    if intervention_id == "furnace_optimization":
        eff = params["efficiency_gain_pct"] / 100
        gas_saved_daily = avg_gas * eff
        co2_saved_daily = gas_saved_daily * 2.04 / 1000
        annual_co2_reduction = co2_saved_daily * 365
        annual_energy_savings_kwh = gas_saved_daily * 10.55 * 365
        annual_monetary_savings = gas_saved_daily * GAS_PRICE_USD * 365 + annual_co2_reduction * CO2_PRICE_USD

    elif intervention_id == "compressor_optimization":
        eff = params["efficiency_gain_pct"] / 100
        elec_saved_daily = avg_electricity * eff * 0.25  # compressor is ~25% of electricity
        co2_saved_daily = elec_saved_daily * 0.41 / 1000
        annual_co2_reduction = co2_saved_daily * 365
        annual_energy_savings_kwh = elec_saved_daily * 365
        annual_monetary_savings = annual_energy_savings_kwh * ELEC_PRICE_USD + annual_co2_reduction * CO2_PRICE_USD

    elif intervention_id == "peak_shifting":
        shift = params["shift_pct"] / 100
        demand_red = params["demand_charge_reduction_pct"] / 100
        elec_saved_daily = avg_electricity * shift * 0.08  # 8% unit savings from off-peak rates
        demand_savings_annual = avg_electricity * 12 * demand_red * 1.5  # demand charges
        co2_saved_daily = elec_saved_daily * 0.41 / 1000
        annual_co2_reduction = co2_saved_daily * 365
        annual_energy_savings_kwh = elec_saved_daily * 365
        annual_monetary_savings = annual_energy_savings_kwh * ELEC_PRICE_USD + demand_savings_annual + annual_co2_reduction * CO2_PRICE_USD

    elif intervention_id == "renewable_electricity":
        renewable_frac = params["renewable_pct"] / 100
        co2_avoided_daily = avg_elec_emission * renewable_frac
        annual_co2_reduction = co2_avoided_daily * 365
        annual_energy_savings_kwh = 0  # same energy, different source
        annual_monetary_savings = annual_co2_reduction * CO2_PRICE_USD

    elif intervention_id == "cooling_efficiency":
        cop_gain = params["cop_improvement_pct"] / 100
        cooling_elec_daily = avg_electricity * 0.15  # ~15% of electricity is cooling
        elec_saved_daily = cooling_elec_daily * cop_gain
        co2_saved_daily = elec_saved_daily * 0.41 / 1000
        annual_co2_reduction = co2_saved_daily * 365
        annual_energy_savings_kwh = elec_saved_daily * 365
        annual_monetary_savings = annual_energy_savings_kwh * ELEC_PRICE_USD + annual_co2_reduction * CO2_PRICE_USD

    elif intervention_id == "water_leakage_reduction":
        leak_red = params["leak_reduction_pct"] / 100
        # Assume 20% of water is "excess" from anomaly — recover that * leak_red
        baseline_water = float(df.head(14)["water_consumption_liters"].mean())
        excess_water_daily = max(0, avg_water - baseline_water)
        water_saved_daily = excess_water_daily * leak_red + avg_water * 0.05 * leak_red
        annual_co2_reduction = water_saved_daily * 0.0003 / 1000 * 365  # water treatment energy
        annual_energy_savings_kwh = water_saved_daily * 0.0003 * 365
        annual_monetary_savings = water_saved_daily * WATER_PRICE_USD * 365

    # Payback period
    if annual_monetary_savings > 0:
        payback_years = cost / annual_monetary_savings
    else:
        payback_years = 999

    # Environmental impact score (composite)
    co2_score = min(40, annual_co2_reduction / 10)
    savings_score = min(30, annual_monetary_savings / 10000)
    cost_score = max(0, 20 - cost / 10000)
    payback_score = max(0, 10 - payback_years * 2)
    env_score = round(co2_score + savings_score + cost_score + payback_score, 1)

    # ROI composite rank score
    rank_score = 0.0
    if cost > 0 and payback_years < 100:
        rank_score = (annual_co2_reduction * CO2_PRICE_USD + annual_monetary_savings) / cost * (1 / max(payback_years, 0.5))

    return {
        "intervention_id": intervention_id,
        "name": inv["name"],
        "description": inv["description"],
        "category": inv["category"],
        "icon": inv["icon"],
        "parameters_used": params,
        "implementation_cost_usd": cost,
        "annual_co2_reduction_tonnes": round(annual_co2_reduction, 2),
        "annual_energy_savings_kwh": round(annual_energy_savings_kwh, 0),
        "annual_monetary_savings_usd": round(annual_monetary_savings, 2),
        "payback_years": round(payback_years, 1) if payback_years < 100 else None,
        "environmental_impact_score": env_score,
        "rank_score": round(rank_score, 4),
        "baseline_context": {
            "avg_daily_co2_tonnes": round(avg_co2, 3),
            "avg_daily_electricity_kwh": round(avg_electricity, 0),
            "avg_daily_water_liters": round(avg_water, 0),
        },
    }


def calculate_all_scenarios() -> list:
    results = []
    for inv_id in INTERVENTIONS:
        result = calculate_scenario(inv_id)
        if "error" not in result:
            results.append(result)
    results.sort(key=lambda x: x["rank_score"], reverse=True)
    return results
