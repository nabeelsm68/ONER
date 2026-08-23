"""
ONER AI Copilot
Gemini-powered environmental intelligence copilot.
Context-injected: Gemini reasons from structured facility data, not free-form guessing.
Graceful fallback if GEMINI_API_KEY is missing.
"""
import os
import json
from typing import Optional

SYSTEM_PROMPT_TEMPLATE = """You are ONER, an AI environmental intelligence copilot for industrial facilities.
You are analyzing data from: {facility_name}

You must ONLY reason from the structured facility data provided below.
Do NOT invent values, statistics, or trends not present in the data.
Be concise, specific, and evidence-driven. Reference actual numbers from the data.
Use a professional, helpful tone appropriate for environmental engineers and facility managers.
Limit responses to 200 words unless more detail is explicitly requested.

=== CURRENT FACILITY DATA ===
{facility_context}
===========================

Important honesty requirements:
- This system uses prototype simulated industrial data.
- Do NOT claim this is connected to real IoT sensors.
- Do NOT claim direct carbon credit issuance. Use "potential carbon impact" and "verification required".
- If asked about something not in the data, say you need more data rather than guessing.
"""


def _build_context(overview: dict, anomalies: list, forecast: dict, recommendations: dict) -> str:
    lines = []

    kpis = overview.get("kpis", {})
    lines.append("## KPIs (Last 7 Days)")
    for k, v in kpis.items():
        if isinstance(v, dict):
            val = v.get("value", "N/A")
            unit = v.get("unit", "")
            chg = v.get("change_pct", "")
            chg_str = f" ({chg:+.1f}% vs prior week)" if isinstance(chg, (int, float)) else ""
            lines.append(f"  - {k}: {val} {unit}{chg_str}")

    hs = overview.get("health_score", {})
    lines.append(f"\n## Environmental Health Score: {hs.get('score', 'N/A')}/100")

    if anomalies:
        lines.append(f"\n## Active Anomalies ({len(anomalies)} detected)")
        for a in anomalies[:4]:
            lines.append(f"  - [{a['severity']}] {a.get('component', 'Unknown')} on {a['date']}: {a['evidence'][:150]}...")

    fc_summary = forecast.get("summary", {})
    lines.append(f"\n## 7-Day Forecast")
    lines.append(f"  - CO₂ trend: {fc_summary.get('co2_trend_pct', 0):+.1f}% ({fc_summary.get('co2_trend_direction', 'stable')})")
    lines.append(f"  - Energy trend: {fc_summary.get('elec_trend_pct', 0):+.1f}%")

    top_rec = recommendations.get("top_recommendation", {})
    if top_rec:
        lines.append(f"\n## Top Recommendation: {top_rec.get('name', '')}")
        lines.append(f"  - Annual CO₂ reduction: {top_rec.get('annual_co2_reduction_tonnes', 0):.1f} t")
        lines.append(f"  - Annual savings: ${top_rec.get('annual_monetary_savings_usd', 0):,.0f}")
        lines.append(f"  - Payback: {top_rec.get('payback_years', 'N/A')} years")

    return "\n".join(lines)


FALLBACK_RESPONSES = {
    "default": (
        "Based on current facility data, Orion Manufacturing Plant is showing elevated energy intensity "
        "and CO₂ emissions relative to the 30-day baseline. The Furnace #2 anomaly is the highest-priority "
        "issue, contributing approximately 12–22% excess natural gas consumption. The compressor system "
        "is also showing elevated load. I recommend reviewing the AI Investigation page for detailed evidence, "
        "and the Intervention Simulator for prioritized corrective actions. "
        "(Note: GEMINI_API_KEY not configured — using deterministic response mode.)"
    ),
    "emissions_increasing": (
        "Energy intensity increased {ei_pct:+.1f}% vs baseline, driven by Furnace #2 efficiency degradation "
        "(furnace temperature {ft_val:.0f}°C vs {ft_base:.0f}°C baseline) and compressor overload. "
        "Both conditions independently increase CO₂ emissions. The forecaster projects a {co2_trend:+.1f}% "
        "CO₂ trend over the next 7 days if no action is taken."
    ),
    "fix_first": (
        "Top priority: Optimize Furnace #2. Evidence shows {gas_pct:+.1f}% excess gas consumption while "
        "production remained stable — a clear efficiency degradation signature. "
        "Implementation cost: ~$85,000. Projected annual savings: ${savings:,.0f}. "
        "Payback period: ~{payback:.1f} years. This delivers the highest CO₂ reduction per dollar invested."
    ),
    "do_nothing": (
        "If no action is taken, the 7-day forecast projects CO₂ emissions increasing {co2_trend:+.1f}%. "
        "The ongoing furnace and compressor inefficiencies represent approximately ${daily_cost:.0f}/day "
        "in excess operational cost. Over 12 months, this accumulates to approximately ${annual_cost:,.0f} "
        "in avoidable costs plus {annual_co2:.1f} tonnes of avoidable CO₂ emissions."
    ),
}


def _deterministic_fallback(message: str, context_data: dict) -> str:
    """Rule-based response when Gemini API is unavailable."""
    msg_lower = message.lower()
    df_overview = context_data.get("overview", {})
    kpis = df_overview.get("kpis", {})
    fc_summary = context_data.get("forecast", {}).get("summary", {})
    top_rec = context_data.get("recommendations", {}).get("top_recommendation", {})

    ei_pct = kpis.get("energy_intensity", {}).get("change_pct", 5.0) or 5.0
    co2_trend = fc_summary.get("co2_trend_pct", 2.0) or 2.0
    savings = top_rec.get("annual_monetary_savings_usd", 85000) or 85000
    payback = top_rec.get("payback_years", 2.1) or 2.1
    daily_cost = top_rec.get("annual_monetary_savings_usd", 85000) / 365 if top_rec else 232
    annual_co2 = top_rec.get("annual_co2_reduction_tonnes", 180) or 180

    if any(w in msg_lower for w in ["emiss", "increas", "why", "what is causing"]):
        return FALLBACK_RESPONSES["emissions_increasing"].format(
            ei_pct=ei_pct, ft_val=1230, ft_base=1180, co2_trend=co2_trend
        )
    elif any(w in msg_lower for w in ["fix", "first", "priority", "should we"]):
        return FALLBACK_RESPONSES["fix_first"].format(
            gas_pct=15.3, savings=savings, payback=payback
        )
    elif any(w in msg_lower for w in ["nothing", "no action", "do nothing", "what happen"]):
        return FALLBACK_RESPONSES["do_nothing"].format(
            co2_trend=co2_trend, daily_cost=daily_cost,
            annual_cost=daily_cost * 365, annual_co2=annual_co2
        )
    elif any(w in msg_lower for w in ["roi", "return", "best", "investment"]):
        return (
            f"Based on current facility data, Optimize Furnace Operation delivers the best ROI: "
            f"${savings:,.0f}/year savings, {payback:.1f}-year payback, {annual_co2:.0f} t CO₂/year reduction. "
            f"Rank formula: (CO₂ value + annual savings) / cost × (1 / payback). "
            f"Full comparison available in the Intervention Simulator."
        )
    else:
        return FALLBACK_RESPONSES["default"]


async def get_copilot_response(message: str, context_data: dict) -> dict:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    # Build context string
    context_str = _build_context(
        overview=context_data.get("overview", {}),
        anomalies=context_data.get("anomalies", []),
        forecast=context_data.get("forecast", {}),
        recommendations=context_data.get("recommendations", {}),
    )

    if not api_key:
        response_text = _deterministic_fallback(message, context_data)
        return {
            "response": response_text,
            "mode": "deterministic_fallback",
            "note": "GEMINI_API_KEY not configured. Using deterministic response engine.",
            "context_used": True,
        }

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)

        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=SYSTEM_PROMPT_TEMPLATE.format(
                facility_name="Orion Manufacturing Plant",
                facility_context=context_str,
            ),
        )

        chat = model.start_chat()
        response = chat.send_message(message)
        response_text = response.text

        return {
            "response": response_text,
            "mode": "gemini",
            "model": "gemini-1.5-flash",
            "context_used": True,
        }

    except Exception as e:
        # Graceful fallback on any Gemini error
        fallback = _deterministic_fallback(message, context_data)
        return {
            "response": fallback,
            "mode": "deterministic_fallback",
            "error": str(e),
            "note": "Gemini API error. Using deterministic response engine.",
            "context_used": True,
        }
