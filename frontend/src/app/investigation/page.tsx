'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import AlertBanner from '@/components/AlertBanner';
import { api } from '@/lib/api';
import { ChevronRight } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';

const PANEL  = '#0a0a0a';
const BORDER = '#1c1c1c';

// Semantic severity colors — preserved
const SEV_COLOR: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH:     '#f59e0b',
  WATCH:    '#60a5fa',
  NORMAL:   '#00d4a4',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-2 shadow-2xl" style={{ background: '#111', border: `1px solid ${BORDER}` }}>
      <p className="text-xs mb-1" style={{ color: '#555' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value?.toFixed(3)}
        </p>
      ))}
    </div>
  );
};

function InvestigationContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [selected,  setSelected]  = useState<string | null>(initialId);
  const [detail,    setDetail]    = useState<any>(null);
  const [loading,       setLoading]       = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadAnomalies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.anomalies();
      const sorted = [...(res.anomalies || [])].sort((a: any, b: any) => b.anomaly_magnitude - a.anomaly_magnitude);
      setAnomalies(sorted);
      setSelected(prev => prev ?? (sorted.length > 0 ? sorted[0].id : null));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await api.rootCause(id);
      setDetail(res);
    } catch (e) { console.error(e); }
    finally { setDetailLoading(false); }
  }, []);

  useEffect(() => { loadAnomalies(); }, [loadAnomalies]);
  useEffect(() => {
    if (selected) {
      const anomaly = anomalies.find((a: any) => a.id === selected);
      const lookupId = anomaly?.incident_id || selected;
      loadDetail(lookupId);
    }
  }, [selected, anomalies, loadDetail]);

  const sevColor = detail ? SEV_COLOR[detail.severity] || '#8a8a8a' : '#8a8a8a';

  return (
    <AppLayout>
      <div className="p-6 animate-fade-in">
        <div className="mb-6">
          <div className="uppercase tracking-widest text-xs mb-2 flex items-center gap-2" style={{ color: '#555', fontSize: 10 }}>
            <span className="w-3 h-px inline-block" style={{ background: '#e6ff3f' }} />
            Anomaly Detection
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', color: '#f5f5f5', letterSpacing: '-0.01em' }}
          >
            AI Investigation
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#8a8a8a' }}>
            Root cause analysis · Environmental impact assessment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Anomaly List */}
          <div className="lg:col-span-2 space-y-2">
            <div className="uppercase tracking-wider text-xs mb-2" style={{ color: '#555', fontSize: 10 }}>
              Detected Anomalies ({anomalies.length})
            </div>
            {loading ? (
              <div className="text-center py-8 text-sm" style={{ color: '#555' }}>Analyzing data...</div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                {anomalies.map((a: any) => (
                  <div
                    key={a.id}
                    onClick={() => setSelected(a.id)}
                    className={`cursor-pointer transition-all duration-200 rounded-xl ${
                      selected === a.id
                        ? 'shadow-lg'
                        : 'opacity-70 hover:opacity-90'
                    }`}
                    style={selected === a.id ? {
                      outline: `2px solid rgba(230,255,63,0.40)`,
                      outlineOffset: 1,
                    } : {}}
                  >
                    <AlertBanner
                      id={a.id}
                      severity={a.severity}
                      component={a.component}
                      date={a.date}
                      evidence={a.evidence?.slice(0, 120) + '...'}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-3 space-y-4">
            {detailLoading ? (
              <div
                className="rounded-xl p-8 text-center text-sm"
                style={{ background: PANEL, border: `1px solid ${BORDER}`, color: '#555' }}
              >
                Running root cause analysis...
              </div>
            ) : detail && !detail.error ? (
              <>
                {/* Anomaly → Root Cause flow header */}
                <div
                  data-prox
                  className="prox-card rounded-xl p-5"
                  style={{ background: PANEL, border: `1px solid ${sevColor}25` }}
                >
                  {/* Flow badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-4 text-xs">
                    {['ANOMALY DETECTED', '→', 'ROOT CAUSE', '→', 'ENVIRONMENTAL IMPACT', '→', 'RECOMMENDED ACTION'].map((s, i) =>
                      s === '→' ? (
                        <ChevronRight key={i} size={11} style={{ color: '#555' }} />
                      ) : (
                        <span
                          key={i}
                          className="px-2 py-1 rounded font-semibold"
                          style={{
                            background: i === 0 ? 'rgba(239,68,68,0.12)' : i === 4 ? 'rgba(245,158,11,0.12)' : i === 6 ? 'rgba(0,212,164,0.12)' : 'rgba(255,255,255,0.04)',
                            color:      i === 0 ? '#ef4444'               : i === 4 ? '#f59e0b'               : i === 6 ? '#00d4a4'               : '#8a8a8a',
                          }}
                        >
                          {s}
                        </span>
                      )
                    )}
                  </div>

                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="px-2 py-1 rounded text-xs font-bold border"
                      style={{ color: sevColor, borderColor: `${sevColor}40`, background: `${sevColor}10` }}
                    >
                      {detail.severity}
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: '#f5f5f5' }}>{detail.component}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#555' }}>{detail.anomaly_id}</div>
                    </div>
                    <div
                      className="ml-auto text-xs px-2 py-1 rounded font-semibold"
                      style={{
                        background: detail.urgency === 'CRITICAL' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                        color:      detail.urgency === 'CRITICAL' ? '#ef4444'               : '#f59e0b',
                      }}
                    >
                      {detail.urgency} URGENCY
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="uppercase tracking-wider text-xs mb-1" style={{ color: '#555', fontSize: 10 }}>Root Cause</div>
                      <div className="font-semibold text-sm" style={{ color: '#f5f5f5' }}>{detail.root_cause}</div>
                    </div>
                    <div>
                      <div className="uppercase tracking-wider text-xs mb-1" style={{ color: '#555', fontSize: 10 }}>Mechanism</div>
                      <div className="text-xs leading-relaxed" style={{ color: '#8a8a8a' }}>{detail.likely_mechanism}</div>
                    </div>
                    <div>
                      <div className="uppercase tracking-wider text-xs mb-1" style={{ color: '#555', fontSize: 10 }}>Evidence</div>
                      <div
                        className="text-xs leading-relaxed p-3 rounded-xl"
                        style={{ background: 'rgba(0,212,164,0.04)', border: '1px solid rgba(0,212,164,0.14)', color: '#8a8a8a' }}
                      >
                        {detail.evidence}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supporting Metrics */}
                {detail.supporting_metrics?.length > 0 && (
                  <div
                    data-prox
                    className="prox-card rounded-xl p-4"
                    style={{ background: PANEL, border: `1px solid ${BORDER}` }}
                  >
                    <div className="uppercase tracking-wider text-xs mb-3" style={{ color: '#555', fontSize: 10 }}>
                      Metric Deviations vs Baseline
                    </div>
                    <div className="space-y-2">
                      {detail.supporting_metrics.map((m: any) => (
                        <div key={m.metric} className="flex items-center gap-3">
                          <div className="text-xs w-40 flex-shrink-0" style={{ color: '#8a8a8a' }}>{m.metric}</div>
                          <div className="flex-1 h-2 rounded-full relative overflow-hidden" style={{ background: '#1c1c1c' }}>
                            <div
                              className="absolute top-0 h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${Math.min(100, Math.abs(m.deviation_pct))}%`,
                                background: m.deviation_pct > 0 ? '#ef4444' : '#00d4a4',
                              }}
                            />
                          </div>
                          <div
                            className="text-xs font-bold font-mono w-16 text-right"
                            style={{ color: m.deviation_pct > 0 ? '#ef4444' : '#00d4a4' }}
                          >
                            {m.deviation_pct > 0 ? '+' : ''}{m.deviation_pct}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline Chart */}
                {detail.timeline?.length > 0 && (
                  <div
                    data-prox
                    className="prox-card rounded-xl p-4"
                    style={{ background: PANEL, border: `1px solid ${BORDER}` }}
                  >
                    <div className="uppercase tracking-wider text-xs mb-3" style={{ color: '#555', fontSize: 10 }}>
                      Anomaly Timeline — CO₂ & Energy Intensity
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={detail.timeline} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
                        <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 9 }} />
                        <YAxis tick={{ fill: '#555', fontSize: 9 }} />
                        <Tooltip content={<CustomTooltip />} />
                        {detail.timeline.filter((t: any) => t.is_anomaly_day).map((t: any) => (
                          <ReferenceLine key={t.date} x={t.date} stroke="#ef4444" strokeDasharray="4 2"
                            label={{ value: '⚠', fill: '#ef4444', fontSize: 12 }} />
                        ))}
                        <Line type="monotone" dataKey="co2_tonnes"       name="CO₂ (t)"         stroke="#ef4444" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="energy_intensity" name="Energy Intensity" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="production_output" name="Production"       stroke="#00d4a4" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Financial Impact */}
                {detail.financial_impact && (
                  <div
                    data-prox
                    className="prox-card rounded-xl p-4"
                    style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.18)' }}
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#ef4444' }}>
                      Estimated Daily Impact
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs" style={{ color: '#555' }}>Excess CO₂/day</div>
                        <div className="font-bold" style={{ color: '#ef4444' }}>{detail.financial_impact.excess_co2_per_day_tonnes} t</div>
                        <div className="text-xs mt-0.5" style={{ color: '#555' }}>${detail.financial_impact.daily_co2_cost_usd}/day</div>
                      </div>
                      <div>
                        <div className="text-xs" style={{ color: '#555' }}>Excess Electricity/day</div>
                        <div className="font-bold" style={{ color: '#f59e0b' }}>{detail.financial_impact.excess_electricity_per_day_kwh.toLocaleString()} kWh</div>
                        <div className="text-xs mt-0.5" style={{ color: '#555' }}>${detail.financial_impact.daily_electricity_cost_usd}/day</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 flex justify-between" style={{ borderTop: '1px solid rgba(239,68,68,0.15)' }}>
                      <span className="text-xs" style={{ color: '#555' }}>Total Daily Cost</span>
                      <span className="font-bold text-sm" style={{ color: '#ef4444' }}>${detail.financial_impact.total_daily_cost_usd}</span>
                    </div>
                    <div className="text-xs mt-2" style={{ color: '#333' }}>
                      {detail.financial_impact.co2_price_assumption} · {detail.financial_impact.elec_price_assumption}
                    </div>
                  </div>
                )}

                {/* Recommended Action */}
                <div
                  data-prox
                  className="prox-card rounded-xl p-4"
                  style={{ background: 'rgba(0,212,164,0.04)', border: '1px solid rgba(0,212,164,0.20)' }}
                >
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#00d4a4' }}>
                    Recommended Action
                  </div>
                  <div className="text-sm font-medium" style={{ color: '#f5f5f5' }}>{detail.recommended_action}</div>
                </div>
              </>
            ) : (
              <div
                className="rounded-xl p-8 text-center text-sm"
                style={{ background: PANEL, border: `1px solid ${BORDER}`, color: '#555' }}
              >
                {selected ? 'Loading investigation details...' : 'Select an anomaly to investigate'}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function InvestigationPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="p-6 text-sm" style={{ color: '#555' }}>Loading...</div>
      </AppLayout>
    }>
      <InvestigationContent />
    </Suspense>
  );
}
