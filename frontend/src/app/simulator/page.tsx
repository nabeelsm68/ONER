'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { api, Scenario } from '@/lib/api';
import {
  SlidersHorizontal,
  Flame,
  Wind,
  Clock,
  Sun,
  Snowflake,
  Droplets,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ICON_MAP: Record<string, React.ReactNode> = {
  flame: <Flame size={15} />,
  wind: <Wind size={15} />,
  clock: <Clock size={15} />,
  sun: <Sun size={15} />,
  snowflake: <Snowflake size={15} />,
  droplets: <Droplets size={15} />,
};

export default function SimulatorPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['peak_shifting', 'furnace_optimization']));
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadScenarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.simulateAll();
      setScenarios(res.scenarios || []);
    } catch (err) {
      console.error('Simulator load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  const toggleScenario = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const portfolio = useMemo(() => {
    const active = scenarios.filter((s) => selectedIds.has(s.intervention_id));
    const totalCO2Cut = active.reduce((sum, s) => sum + s.annual_co2_reduction_tonnes, 0);
    const totalSavings = active.reduce((sum, s) => sum + s.annual_monetary_savings_usd, 0);
    const totalCost = active.reduce((sum, s) => sum + s.implementation_cost_usd, 0);
    const avgPayback = totalSavings > 0 ? totalCost / totalSavings : 0;

    return {
      activeCount: active.length,
      totalCO2Cut: totalCO2Cut.toFixed(1),
      totalSavingsUSD: Math.round(totalSavings).toLocaleString(),
      totalCostUSD: Math.round(totalCost).toLocaleString(),
      paybackYears: avgPayback.toFixed(1),
    };
  }, [scenarios, selectedIds]);

  const chartData = useMemo(() => {
    return scenarios.map((s) => ({
      name: s.name.length > 18 ? s.name.slice(0, 16) + '...' : s.name,
      fullName: s.name,
      co2Cut: +s.annual_co2_reduction_tonnes.toFixed(1),
      savings: Math.round(s.annual_monetary_savings_usd / 1000),
      selected: selectedIds.has(s.intervention_id),
    }));
  }, [scenarios, selectedIds]);

  return (
    <AppLayout
      title="Intervention"
      subtitle="Engineering Decision Workspace & Counterfactual Modeling"
      onRefresh={loadScenarios}
      isRefreshing={loading}
    >
      <div className="space-y-6 text-[#F1F3EE]">
        {/* ── CENTRAL ENGINEERING COMPARISON ─────────────────────── */}
        <div className="p-6 rounded-xl bg-[#0E1110] border border-[#242A27]">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            <div>
              <div className="text-[10px] font-mono text-[#A8C83A] uppercase font-bold tracking-wider">
                COUNTERFACTUAL DECISION MODEL &bull; THERMODYNAMIC SIMULATION
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EE] mt-0.5">
                Physical Intervention Benchmarking
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#929A95]">
              <span>Selected Interventions:</span>
              <span className="px-2.5 py-1 rounded bg-[#141817] text-[#A8C83A] font-bold border border-[#A8C83A]/30 font-mono text-[11px]">
                {portfolio.activeCount} OF {scenarios.length} ACTIVE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: CURRENT BASELINE */}
            <div className="p-5 rounded-lg bg-[#080A09] border border-[#242A27] flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#929A95] tracking-wider">
                  1. BASELINE STATE
                </div>
                <div className="text-2xl font-bold font-mono text-zinc-100 mt-2">
                  18.2 <span className="text-xs font-normal text-zinc-400">t CO₂ / day</span>
                </div>
                <p className="text-xs text-[#929A95] mt-2 leading-relaxed font-sans">
                  Operating with detected combustion drift in Furnace F-101 and unmitigated peak-tariff electrical demand.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#181E1C] text-[10px] font-mono text-[#626A65]">
                CAPEX: $0 &bull; OPEX Drift: High
              </div>
            </div>

            {/* Card 2: DO NOTHING */}
            <div className="p-5 rounded-lg bg-[#080A09] border border-red-500/25 flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                  2. COUNTERFACTUAL: DO NOTHING
                </div>
                <div className="text-2xl font-bold font-mono text-red-400 mt-2">
                  +14.2% <span className="text-xs font-normal text-red-400/80">Drift Surge</span>
                </div>
                <p className="text-xs text-[#929A95] mt-2 leading-relaxed font-sans">
                  Refractory degradation accelerates burner imbalance. Annual emissions increase by +320 t CO₂ with regulatory penalty exposure.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#181E1C] text-[10px] font-mono text-red-400">
                Cumulative Waste Cost: +$184,000 / yr
              </div>
            </div>

            {/* Card 3: ONER INTERVENTION */}
            <div className="p-5 rounded-lg bg-[#141817] border border-[#A8C83A]/40 flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#A8C83A] tracking-wider">
                  3. ONER INTERVENTION PORTFOLIO
                </div>
                <div className="text-2xl font-bold font-mono text-[#A8C83A] mt-2">
                  -{portfolio.totalCO2Cut} <span className="text-xs font-normal text-zinc-400">t CO₂e / yr</span>
                </div>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed font-sans">
                  Executing selected closed-loop interventions captures ${portfolio.totalSavingsUSD}/yr in energy and fuel cost abatement.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#242A27] text-[10px] font-mono text-zinc-300 flex items-center justify-between">
                <span>Capex: ${portfolio.totalCostUSD}</span>
                <span className="text-[#A8C83A] font-bold">Payback: {portfolio.paybackYears} yrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCENARIO BENCHMARKING CHART ──────────────────────── */}
        <div className="p-6 rounded-xl bg-[#0E1110] border border-[#242A27]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-mono text-[#929A95] uppercase tracking-wider">
                SCENARIO ABATEMENT BENCHMARKING
              </div>
              <h2 className="text-base font-bold text-[#F1F3EE] mt-0.5">
                Annual CO₂ Reduction (Tonnes) by Intervention Scenario
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-zinc-200">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#A8C83A]" />
                Active in Portfolio
              </span>
              <span className="flex items-center gap-1.5 text-[#929A95]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#242A27]" />
                Inactive
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#181E1C" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#626A65', fontSize: 10, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#242A27' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#626A65', fontSize: 10, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#242A27' }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-lg bg-[#0E1110] border border-[#242A27] text-xs font-mono shadow-xl">
                        <div className="text-zinc-200 font-bold">{d.fullName}</div>
                        <div className="text-[#A8C83A] mt-1">CO₂ Cut: -{d.co2Cut} tonnes/yr</div>
                        <div className="text-teal-400">Savings: ${d.savings}k /yr</div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="co2Cut" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.selected ? '#A8C83A' : '#141817'}
                      stroke={entry.selected ? '#A8C83A' : '#242A27'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── RANKED INTERVENTION DECISION MATRIX ──────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Available Autopilot Interventions ({scenarios.length})
            </span>
            <span className="text-[10px] font-mono text-[#929A95]">
              Ranked by Marginal Abatement Cost
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scenarios.map((s, idx) => {
              const isSelected = selectedIds.has(s.intervention_id);
              const isExpanded = expandedId === s.intervention_id;

              return (
                <div
                  key={s.intervention_id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-[#141817] border-[#A8C83A]/40'
                      : 'bg-[#0E1110] border-[#242A27] opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-[#080A09] text-[#A8C83A] border border-[#242A27] flex-shrink-0 mt-0.5">
                        {ICON_MAP[s.icon] || <SlidersHorizontal size={15} />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-zinc-100 truncate">
                            {s.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#080A09] text-[#929A95] border border-[#242A27]">
                            #{idx + 1}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#080A09] text-zinc-300 border border-[#242A27]">
                            {s.category}
                          </span>
                        </div>

                        <p className="text-xs text-[#929A95] mt-1 leading-relaxed font-sans">
                          {s.description}
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleScenario(s.intervention_id)}
                      className="w-4 h-4 rounded accent-[#A8C83A] cursor-pointer flex-shrink-0 mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#181E1C] text-center">
                    <div>
                      <div className="text-[9px] text-[#929A95] uppercase font-sans">CO₂ Cut</div>
                      <div className="text-xs font-mono font-bold text-[#A8C83A] mt-0.5">
                        -{s.annual_co2_reduction_tonnes.toFixed(1)} t/yr
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#929A95] uppercase font-sans">Annual Savings</div>
                      <div className="text-xs font-mono font-bold text-zinc-200 mt-0.5">
                        ${Math.round(s.annual_monetary_savings_usd).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#929A95] uppercase font-sans">Payback</div>
                      <div className="text-xs font-mono font-bold text-zinc-200 mt-0.5">
                        {s.payback_years?.toFixed(1) || '0.0'} yr
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#181E1C] flex items-center justify-between text-[10px] font-mono text-[#929A95]">
                    <span>Capex: ${s.implementation_cost_usd.toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : s.intervention_id)}
                      className="hover:text-zinc-200 flex items-center gap-1 font-sans cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Specs' : 'View Specs'}</span>
                      {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 p-3 rounded-lg bg-[#080A09] border border-[#242A27] text-[11px] font-mono text-[#929A95] space-y-1">
                      <div className="flex justify-between">
                        <span>Energy Savings:</span>
                        <span className="text-zinc-200">{Math.round(s.annual_energy_savings_kwh).toLocaleString()} kWh/yr</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Environmental Impact Score:</span>
                        <span className="text-[#A8C83A]">{s.environmental_impact_score.toFixed(1)} / 100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rank Score (Abatement/Cost):</span>
                        <span className="text-zinc-200">{s.rank_score.toFixed(4)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
