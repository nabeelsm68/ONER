'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { api, Scenario } from '@/lib/api';
import { Flame, Wind, Clock, Sun, Snowflake, Droplets, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

const PANEL  = '#0a0a0a';
const BORDER = '#1c1c1c';

// Scenario accent colors — visualization palette, not semantic
const COLORS = ['#00d4a4', '#0ea5e9', '#f59e0b', '#a78bfa', '#f43f5e', '#22d3ee'];

const ICON_MAP: Record<string, React.ReactNode> = {
  flame:     <Flame size={17} />,
  wind:      <Wind size={17} />,
  clock:     <Clock size={17} />,
  sun:       <Sun size={17} />,
  snowflake: <Snowflake size={17} />,
  droplets:  <Droplets size={17} />,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 shadow-2xl" style={{ background: '#111', border: `1px solid ${BORDER}` }}>
      <p className="text-xs mb-1" style={{ color: '#555' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : p.value}
        </p>
      ))}
    </div>
  );
};

function ScenarioCard({
  scenario, index, selected, onToggle
}: { scenario: Scenario; index: number; selected: boolean; onToggle: () => void }) {
  const color = COLORS[index % COLORS.length];
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      data-prox
      className="prox-card rounded-xl transition-all duration-300 cursor-pointer"
      style={{
        background: selected ? `${color}08` : PANEL,
        border: `1px solid ${selected ? color + '40' : BORDER}`,
      }}
    >
      <div className="p-4" onClick={onToggle}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl flex-shrink-0" style={{ background: `${color}18`, color }}>
            {ICON_MAP[scenario.icon] || <BarChart2 size={17} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm" style={{ color: '#f5f5f5' }}>{scenario.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${color}18`, color }}>
                #{index + 1} Ranked
              </span>
            </div>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: '#8a8a8a' }}>{scenario.description}</p>
          </div>
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="mt-1 flex-shrink-0 w-4 h-4 cursor-pointer"
            style={{ accentColor: color }}
            onClick={e => e.stopPropagation()}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="text-center">
            <div className="text-xs" style={{ color: '#555' }}>CO₂ Reduction</div>
            <div className="text-sm font-bold mt-0.5" style={{ color }}>
              {scenario.annual_co2_reduction_tonnes.toFixed(1)}t/yr
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs" style={{ color: '#555' }}>Annual Savings</div>
            <div className="text-sm font-bold mt-0.5" style={{ color: '#22c55e' }}>
              ${Math.round(scenario.annual_monetary_savings_usd).toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs" style={{ color: '#555' }}>Payback</div>
            <div className="text-sm font-bold mt-0.5" style={{ color: '#f5f5f5' }}>
              {scenario.payback_years?.toFixed(1) || 'N/A'} yr
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-1">
        <button
          className="w-full flex items-center justify-center gap-1 py-1.5 text-xs transition-colors hover:opacity-70"
          style={{ color: '#555' }}
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? <><ChevronUp size={11} />Hide details</> : <><ChevronDown size={11} />Show details</>}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 text-xs pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
          {[
            ['Implementation Cost', `$${scenario.implementation_cost_usd.toLocaleString()}`],
            ['Energy Savings', `${Math.round(scenario.annual_energy_savings_kwh).toLocaleString()} kWh/yr`],
            ['Env. Impact Score', scenario.environmental_impact_score.toFixed(1)],
            ['Rank Score', scenario.rank_score.toFixed(4)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span style={{ color: '#555' }}>{k}</span>
              <span style={{ color: '#8a8a8a' }}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SimulatorPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(['furnace_optimization', 'compressor_optimization', 'renewable_electricity'])
  );
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.simulateAll();
      setScenarios(res.scenarios || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = scenarios.filter(s => selected.has(s.intervention_id));
  const top = scenarios[0];

  const barData = filtered.map(s => ({
    name: s.name.replace('Optimize ', '').replace(' Operation', '').replace(' Electricity', '').slice(0, 18),
    'CO₂ t/yr': s.annual_co2_reduction_tonnes,
    'Savings $K': Math.round(s.annual_monetary_savings_usd / 1000),
    'Cost $K': Math.round(s.implementation_cost_usd / 1000),
  }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div>
          <div className="uppercase tracking-widest text-xs mb-2 flex items-center gap-2" style={{ color: '#555', fontSize: 10 }}>
            <span className="w-3 h-px inline-block" style={{ background: '#e6ff3f' }} />
            ROI-Ranked Scenarios
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', color: '#f5f5f5', letterSpacing: '-0.01em' }}
          >
            Environmental Intervention Simulator
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#8a8a8a' }}>
            Compare interventions · All values calculated from current facility data
          </p>
        </div>

        {/* Top recommendation */}
        {top && (
          <div
            data-prox
            className="prox-card rounded-xl p-4"
            style={{ background: PANEL, border: '1px solid rgba(0,212,164,0.22)' }}
          >
            <div className="flex items-start gap-3 flex-wrap">
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: '#00d4a4' }}>
                  ★ ONER Top Recommendation
                </div>
                <div className="font-bold" style={{ color: '#f5f5f5', fontFamily: 'Space Grotesk, Inter, sans-serif' }}>{top.name}</div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: '#8a8a8a' }}>{top.description}</p>
                <div className="text-xs mt-2" style={{ color: '#555' }}>
                  Rank formula: (CO₂ value + annual savings) / implementation cost × (1 / payback years)
                  → Score: <span className="font-mono" style={{ color: '#00d4a4' }}>{top.rank_score.toFixed(4)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 flex-shrink-0">
                {[
                  ['CO₂/yr', `${top.annual_co2_reduction_tonnes.toFixed(0)}t`, '#00d4a4'],
                  ['Savings/yr', `$${Math.round(top.annual_monetary_savings_usd / 1000)}K`, '#22c55e'],
                  ['Payback', `${top.payback_years?.toFixed(1)}yr`, '#f5f5f5'],
                ].map(([k, v, c]) => (
                  <div key={k} className="text-center">
                    <div className="text-xs" style={{ color: '#555' }}>{k}</div>
                    <div className="font-bold text-lg mt-0.5" style={{ color: c, fontFamily: 'Space Grotesk, Inter, sans-serif' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left: Scenario list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider" style={{ color: '#555', fontSize: 10 }}>
                Select Interventions to Compare
              </div>
              <div className="text-xs" style={{ color: '#555' }}>{selected.size} selected</div>
            </div>
            {loading ? (
              <div className="text-center py-8 text-sm" style={{ color: '#555' }}>Calculating scenarios...</div>
            ) : (
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                {scenarios.map((s, i) => (
                  <ScenarioCard
                    key={s.intervention_id}
                    scenario={s}
                    index={i}
                    selected={selected.has(s.intervention_id)}
                    onToggle={() => toggle(s.intervention_id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Comparison charts */}
          <div className="space-y-4">
            {filtered.length > 0 ? (
              <>
                <div data-prox className="prox-card rounded-xl p-4" style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
                  <div className="text-xs uppercase tracking-wider mb-3" style={{ color: '#555', fontSize: 10 }}>CO₂ & Savings Comparison</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 30, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
                      <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 9 }} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fill: '#555', fontSize: 9 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '10px', color: '#555' }} />
                      {/* CO₂ stays red, savings stays teal — semantic */}
                      <Bar dataKey="CO₂ t/yr" fill="#ef4444" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Savings $K" fill="#00d4a4" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Cost $K" fill="#333" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary table */}
                <div data-prox className="prox-card rounded-xl p-4" style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
                  <div className="text-xs uppercase tracking-wider mb-3" style={{ color: '#555', fontSize: 10 }}>Comparison Summary</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                          {['Intervention', 'CO₂ t/yr', 'Savings/yr', 'Cost', 'Payback'].map(h => (
                            <th key={h} className={`py-2 font-medium ${h === 'Intervention' ? 'text-left pr-3' : 'text-right px-2'}`} style={{ color: '#555' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(s => (
                          <tr key={s.intervention_id} style={{ borderBottom: `1px solid #111` }}>
                            <td className="py-2 pr-3">
                              <span className="font-medium" style={{ color: COLORS[scenarios.indexOf(s) % COLORS.length] }}>
                                {s.name.slice(0, 22)}
                              </span>
                            </td>
                            <td className="text-right py-2 px-2 font-mono" style={{ color: '#ef4444' }}>{s.annual_co2_reduction_tonnes.toFixed(1)}</td>
                            <td className="text-right py-2 px-2 font-mono" style={{ color: '#22c55e' }}>${Math.round(s.annual_monetary_savings_usd / 1000)}K</td>
                            <td className="text-right py-2 px-2 font-mono" style={{ color: '#555' }}>${Math.round(s.implementation_cost_usd / 1000)}K</td>
                            <td className="text-right py-2 pl-2 font-mono" style={{ color: '#8a8a8a' }}>{s.payback_years?.toFixed(1) || 'N/A'}yr</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Combined impact */}
                <div data-prox className="prox-card rounded-xl p-4" style={{ background: 'rgba(0,212,164,0.04)', border: '1px solid rgba(0,212,164,0.18)' }}>
                  <div className="text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: '#00d4a4' }}>
                    Combined Impact (Selected)
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      ['Total CO₂ Reduction', `${filtered.reduce((a, s) => a + s.annual_co2_reduction_tonnes, 0).toFixed(1)}t`, 'per year', '#00d4a4'],
                      ['Total Annual Savings', `$${Math.round(filtered.reduce((a, s) => a + s.annual_monetary_savings_usd, 0) / 1000)}K`, 'per year', '#22c55e'],
                      ['Total Investment', `$${Math.round(filtered.reduce((a, s) => a + s.implementation_cost_usd, 0) / 1000)}K`, 'upfront cost', '#f5f5f5'],
                    ].map(([label, val, sub, c]) => (
                      <div key={label}>
                        <div className="text-xs" style={{ color: '#555' }}>{label}</div>
                        <div className="font-bold text-xl mt-1" style={{ color: c, fontFamily: 'Space Grotesk, Inter, sans-serif' }}>{val}</div>
                        <div className="text-xs" style={{ color: '#555' }}>{sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl p-8 text-center text-sm" style={{ background: PANEL, border: `1px solid ${BORDER}`, color: '#555' }}>
                Select interventions on the left to compare them
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
