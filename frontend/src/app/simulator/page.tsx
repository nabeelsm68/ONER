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

  // Aggregated Portfolio Metrics
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
      title="Intervention Simulator"
      subtitle="Engineering Decision Workspace"
      onRefresh={loadScenarios}
      isRefreshing={loading}
    >
      <div className="space-y-6">
        {/* ── CENTRAL ENGINEERING COMPARISON ─────────────────────── */}
        <div className="p-6 rounded-xl bg-[#0e1310] border border-[#16201a]">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            <div>
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Counterfactual Decision Model
              </div>
              <h1 className="text-xl font-bold text-zinc-100 mt-0.5">
                Physical Intervention Benchmarking
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <span className="text-zinc-400">Selected Portfolio:</span>
              <span className="px-2.5 py-1 rounded-md bg-[#131b15] text-zinc-100 font-semibold border border-[#202d23] font-mono text-[11px]">
                {portfolio.activeCount} of {scenarios.length} Interventions Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: CURRENT BASELINE */}
            <div className="p-5 rounded-lg bg-[#0b0f0c] border border-[#141b16] flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                  1. BASELINE STATE
                </div>
                <div className="text-2xl font-bold font-mono text-zinc-200 mt-2">
                  18.2 <span className="text-xs font-normal text-zinc-400">t CO₂ / day</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-sans">
                  Operating with detected combustion drift in Furnace F-101 and unmitigated peak-tariff electrical demand.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#141b16] text-[10px] font-mono text-zinc-400">
                CAPEX: $0 · OPEX Drift: High
              </div>
            </div>

            {/* Card 2: DO NOTHING */}
            <div className="p-5 rounded-lg bg-[#140e0e] border border-[#2b1717] flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold text-red-400 tracking-wider">
                  2. COUNTERFACTUAL: DO NOTHING
                </div>
                <div className="text-2xl font-bold font-mono text-red-400 mt-2">
                  +14.2% <span className="text-xs font-normal text-red-400/80">Drift Surge</span>
                </div>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed font-sans">
                  Refractory degradation accelerates burner imbalance. Annual emissions increase by +320 t CO₂ with regulatory penalty exposure.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#241515] text-[10px] font-mono text-red-400">
                Cumulative Waste Cost: +$184,000 / yr
              </div>
            </div>

            {/* Card 3: ONER INTERVENTION (Distinct, high-end, NOT neon) */}
            <div className="p-5 rounded-lg bg-[#0f1712] border border-[#213526] flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
                  3. ONER INTERVENTION PORTFOLIO
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                  -{portfolio.totalCO2Cut} <span className="text-xs font-normal text-emerald-400/80">t CO₂e / yr</span>
                </div>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed font-sans">
                  Executing selected closed-loop interventions captures ${portfolio.totalSavingsUSD}/yr in energy and fuel cost abatement.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1c2e21] text-[10px] font-mono text-zinc-300 flex items-center justify-between">
                <span>Capex: ${portfolio.totalCostUSD}</span>
                <span className="text-emerald-400 font-semibold">Payback: {portfolio.paybackYears} yrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCENARIO BENCHMARKING CHART ──────────────────────── */}
        <div className="p-6 rounded-xl bg-[#0e1310] border border-[#16201a]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Scenario Abatement Comparison
              </div>
              <h2 className="text-base font-semibold text-zinc-100 mt-0.5">
                Annual CO₂ Reduction (Tonnes) by Intervention Scenario
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                Active in Portfolio
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#222d25]" />
                Inactive
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: '#1a221d' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: '#1a221d' }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-lg bg-[#0e1310] border border-[#1e2b22] text-xs font-mono shadow-xl">
                        <div className="text-zinc-200 font-semibold">{d.fullName}</div>
                        <div className="text-emerald-400 mt-1">CO₂ Cut: -{d.co2Cut} tonnes/yr</div>
                        <div className="text-sky-400">Savings: ${d.savings}k /yr</div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="co2Cut" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.selected ? '#10b981' : '#222d25'}
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
            <span className="text-xs font-semibold text-zinc-300">
              Available Autopilot Interventions ({scenarios.length})
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
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
                      ? 'bg-[#111813] border-[#1f3024]'
                      : 'bg-[#0e1310] border-[#16201a] opacity-80 hover:opacity-100 hover:border-[#1e2a22]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-[#0b0e0c] text-zinc-300 border border-[#162018] flex-shrink-0 mt-0.5">
                        {ICON_MAP[s.icon] || <SlidersHorizontal size={15} />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-zinc-100 truncate">
                            {s.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/40">
                            #{idx + 1}
                          </span>
                          <span className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-[#131b15] text-zinc-300 border border-[#1d2720]">
                            {s.category}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-sans">
                          {s.description}
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleScenario(s.intervention_id)}
                      className="w-4 h-4 rounded accent-emerald-500 cursor-pointer flex-shrink-0 mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#141b16] text-center">
                    <div>
                      <div className="text-[9px] text-zinc-400 uppercase font-medium">CO₂ Cut</div>
                      <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                        -{s.annual_co2_reduction_tonnes.toFixed(1)} t/yr
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-400 uppercase font-medium">Annual Savings</div>
                      <div className="text-xs font-mono font-bold text-zinc-200 mt-0.5">
                        ${Math.round(s.annual_monetary_savings_usd).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-400 uppercase font-medium">Payback</div>
                      <div className="text-xs font-mono font-bold text-zinc-200 mt-0.5">
                        {s.payback_years?.toFixed(1) || '0.0'} yr
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#141b16] flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>Capex: ${s.implementation_cost_usd.toLocaleString()}</span>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : s.intervention_id)}
                      className="hover:text-zinc-200 flex items-center gap-1 font-sans cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Specs' : 'View Specs'}</span>
                      {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 p-3 rounded-lg bg-[#0b0e0c] border border-[#141b16] text-[11px] font-mono text-zinc-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Energy Savings:</span>
                        <span className="text-zinc-200">{Math.round(s.annual_energy_savings_kwh).toLocaleString()} kWh/yr</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Environmental Impact Score:</span>
                        <span className="text-emerald-400">{s.environmental_impact_score.toFixed(1)} / 100</span>
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
