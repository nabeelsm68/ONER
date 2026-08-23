'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import { Shield, AlertTriangle, Info } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';

const PANEL  = '#0a0a0a';
const BORDER = '#1c1c1c';

// MRV status colors — semantic, preserved
const MRV_COLOR: Record<string, string> = {
  READY:      '#00d4a4',
  PARTIAL:    '#f59e0b',
  'NOT READY': '#ef4444',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-2 shadow-2xl" style={{ background: '#111', border: `1px solid ${BORDER}` }}>
      <p className="text-xs mb-1" style={{ color: '#555' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function CarbonPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.carbon();
      setData(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const timeline      = data?.evidence_timeline || [];
  const mrvComponents = data?.mrv_readiness?.components || [];

  return (
    <AppLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div>
          <div className="uppercase tracking-widest text-xs mb-2 flex items-center gap-2" style={{ color: '#555', fontSize: 10 }}>
            <span className="w-3 h-px inline-block" style={{ background: '#e6ff3f' }} />
            Measurement · Reporting · Verification
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', color: '#f5f5f5', letterSpacing: '-0.01em' }}
          >
            Carbon Intelligence & MRV
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#8a8a8a' }}>
            Baseline · Potential reduction · MRV readiness
          </p>
        </div>

        {/* Disclaimer — amber warning, semantic */}
        <div
          className="rounded-xl p-4 flex gap-3"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.20)' }}
        >
          <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
          <p className="text-xs leading-relaxed" style={{ color: '#f59e0b', opacity: 0.8 }}>
            {data?.disclaimer || 'Carbon-market eligibility and credit issuance require applicable methodologies and independent verification.'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm" style={{ color: '#555' }}>Loading carbon intelligence...</div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Baseline Annual CO₂', val: `${data?.baseline?.annual_co2_tonnes?.toFixed(0)} t`, sub: data?.baseline?.period, color: '#f5f5f5', border: BORDER, bg: PANEL },
                {
                  label: 'Current Annual CO₂',
                  val: `${data?.current?.annual_co2_tonnes?.toFixed(0)} t`,
                  sub: `${data?.vs_baseline_pct > 0 ? '+' : ''}${data?.vs_baseline_pct}% vs baseline`,
                  color: (data?.vs_baseline_pct || 0) > 0 ? '#ef4444' : '#00d4a4',
                  border: BORDER, bg: PANEL,
                },
                { label: 'Potential Reduction', val: `${data?.potential_reduction?.annual_tonnes?.toFixed(0)} t`, sub: 'Potential (not verified)', color: '#00d4a4', border: 'rgba(0,212,164,0.20)', bg: 'rgba(0,212,164,0.04)' },
                { label: 'Potentially Creditable', val: `${data?.potentially_creditable?.annual_tonnes?.toFixed(0)} t`, sub: 'Subject to verification', color: '#0ea5e9', border: 'rgba(14,165,233,0.20)', bg: 'rgba(14,165,233,0.04)' },
              ].map(({ label, val, sub, color, border, bg }) => (
                <div
                  key={label}
                  data-prox
                  className="prox-card rounded-xl p-4"
                  style={{ background: bg, border: `1px solid ${border}` }}
                >
                  <div className="uppercase tracking-wider text-xs mb-2" style={{ color: '#555', fontSize: 10 }}>{label}</div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color, fontFamily: 'Space Grotesk, Inter, sans-serif' }}
                  >{val}</div>
                  <div className="text-xs mt-1" style={{ color: '#555' }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Indicative Value */}
            <div
              data-prox
              className="prox-card rounded-xl p-4"
              style={{ background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.18)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Info size={13} style={{ color: '#0ea5e9' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#0ea5e9' }}>
                  Indicative Carbon Value
                </span>
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className="text-3xl font-bold"
                  style={{ color: '#0ea5e9', fontFamily: 'Space Grotesk, Inter, sans-serif' }}
                >
                  ${data?.indicative_value_usd?.toLocaleString()}
                </span>
                <span className="text-xs" style={{ color: '#555' }}>
                  at ${data?.co2_price_reference}/t reference carbon price · Potentially creditable reduction
                </span>
              </div>
              <p className="text-xs mt-2" style={{ color: '#555' }}>
                Verification required. Actual market value depends on applicable methodology, registry, and market conditions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reduction Breakdown */}
              <div
                data-prox
                className="prox-card rounded-xl p-5"
                style={{ background: PANEL, border: `1px solid ${BORDER}` }}
              >
                <h2 className="text-sm font-semibold mb-4" style={{ color: '#f5f5f5' }}>Potential Reduction Breakdown</h2>
                <div className="space-y-3">
                  {Object.entries(data?.potential_reduction?.breakdown || {}).map(([key, val]: [string, any]) => {
                    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    const total = data?.potential_reduction?.annual_tonnes || 1;
                    const pct = Math.round(val / total * 100);
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: '#8a8a8a' }}>{label}</span>
                          <span className="font-semibold" style={{ color: '#00d4a4' }}>{val.toFixed(1)} t/yr</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1c1c1c' }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #00d4a4, #0ea5e9)' }}
                          />
                        </div>
                        <div className="text-right text-xs mt-0.5" style={{ color: '#555' }}>{pct}%</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 text-xs" style={{ borderTop: `1px solid ${BORDER}` }}>
                  <div className="font-medium mb-1" style={{ color: '#f5f5f5' }}>
                    {data?.potentially_creditable?.fraction_of_total_pct}% potentially verifiable with proper MRV
                  </div>
                  <div style={{ color: '#555' }}>{data?.potentially_creditable?.note}</div>
                </div>
              </div>

              {/* MRV Readiness */}
              <div
                data-prox
                className="prox-card rounded-xl p-5"
                style={{ background: PANEL, border: `1px solid ${BORDER}` }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={15} style={{ color: '#00d4a4' }} />
                  <h2 className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>MRV Readiness</h2>
                  <span
                    className="ml-auto text-sm font-bold"
                    style={{
                      color: data?.mrv_readiness?.overall_score >= 70 ? '#00d4a4' : '#f59e0b',
                      fontFamily: 'Space Grotesk, Inter, sans-serif',
                    }}
                  >
                    {data?.mrv_readiness?.overall_score}%
                  </span>
                </div>
                <div className="space-y-2">
                  {mrvComponents.map((c: any) => (
                    <div key={c.component} className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: MRV_COLOR[c.status] || '#555' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs">
                          <span className="truncate" style={{ color: '#f5f5f5' }}>{c.component}</span>
                          <span className="font-semibold ml-2" style={{ color: MRV_COLOR[c.status] }}>{c.score}%</span>
                        </div>
                        <div className="h-1 rounded-full mt-1 overflow-hidden" style={{ background: '#1c1c1c' }}>
                          <div className="h-full rounded-full" style={{ width: `${c.score}%`, background: MRV_COLOR[c.status] }} />
                        </div>
                        <div className="text-xs mt-0.5 leading-tight" style={{ color: '#555' }}>{c.notes}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {data?.mrv_readiness?.next_steps && (
                  <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <div className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#555', fontSize: 10 }}>Next Steps</div>
                    <ul className="space-y-1">
                      {data.mrv_readiness.next_steps.map((s: string, i: number) => (
                        <li key={i} className="flex gap-2 text-xs" style={{ color: '#555' }}>
                          <span style={{ color: '#00d4a4' }}>→</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence Timeline */}
            <div
              data-prox
              className="prox-card rounded-xl p-5"
              style={{ background: PANEL, border: `1px solid ${BORDER}` }}
            >
              <h2 className="text-sm font-semibold mb-4" style={{ color: '#f5f5f5' }}>CO₂ Evidence Timeline</h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeline} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
                  <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#555', fontSize: 9 }} />
                  <Tooltip content={<CustomTooltip />} />
                  {/* Baseline reference line — teal, semantic */}
                  <ReferenceLine
                    y={data?.baseline?.daily_co2_tonnes}
                    stroke="#00d4a4"
                    strokeDasharray="6 3"
                    label={{ value: 'Baseline', fill: '#00d4a4', fontSize: 10 }}
                  />
                  <Area type="monotone" dataKey="co2_tonnes" name="CO₂ (t)" stroke="#ef4444" fill="url(#cg2)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-3 text-xs text-center" style={{ color: '#555' }}>
                Green dashed line = 30-day operational baseline
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
