"""
ONER Recommender
Ranks interventions using a transparent formula and produces the top recommendation.
"""
from simulator import calculate_all_scenarios


def get_recommendations() -> dict:
    scenarios = calculate_all_scenarios()

    top = scenarios[0] if scenarios else None
    if not top:
        return {"error": "No scenarios available"}

    # Explanation narrative for top recommendation
    explanation = (
        f"Recommended action: **{top['name']}**\n\n"
        f"This intervention achieves the highest combined score across four factors:\n"
        f"- CO₂ reduction: {top['annual_co2_reduction_tonnes']:.1f} t/year "
        f"(×${65}/t carbon price value = ${top['annual_co2_reduction_tonnes']*65:,.0f}/year)\n"
        f"- Annual cost savings: ${top['annual_monetary_savings_usd']:,.0f}\n"
        f"- Implementation cost: ${top['implementation_cost_usd']:,}\n"
        f"- Projected payback: {top['payback_years']:.1f} years\n\n"
        f"Rank formula: (CO₂_value + annual_savings) / implementation_cost × (1 / payback_years)"
    )

    return {
        "top_recommendation": {
            **top,
            "explanation": explanation,
        },
        "all_scenarios": scenarios,
        "ranking_formula": (
            "rank_score = (annual_co2_reduction × $65/t + annual_monetary_savings)"
            " / implementation_cost × (1 / payback_years)"
        ),
        "total_scenarios_evaluated": len(scenarios),
    }
