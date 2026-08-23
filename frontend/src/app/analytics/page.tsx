'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const PANEL = '#0a0a0a';
const BORDER = '#1c1c1c';
const TIME_OPTIONS = [7, 30, 90] as const;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 shadow-2xl" style={{ background: '#111', border: `1px solid ${BORDER}`, minWidth: 160 }}>
      <p className="text-xs mb-2" style={{ color: '#555' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          <span className="font-semibold">{p.name}:</span>{' '}
          {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      data-prox
      className="prox-card rounded-xl p-4"
      style={{ background: PANEL, border: `1px solid ${BORDER}` }}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#555' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState<typeof TIME_OPTIONS[number]>(30);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.analytics(days);
      setData(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const records      = data?.records      || [];
  const correlations = data?.correlations || [];

  const co2Data       = records.map((r: any) => ({ date: r.date?.slice(5), value: r.co2_tonnes, production: r.production_output }));
  const energyData    = records.map((r: any) => ({ date: r.date?.slice(5), electricity: +(r.electricity_kwh / 1000).toFixed(2), gas: +(r.natural_gas_m3 * 10.55 / 1000).toFixed(2) }));
  const waterData     = records.map((r: any) => ({ date: r.date?.slice(5), water: +(r.water_consumption_liters / 1000).toFixed(1) }));
  const airData       = records.map((r: any) => ({ date: r.date?.slice(5), NOx: r.nox_kg, PM25: r.pm25_kg, SOx: r.sox_kg }));
  const wasteData     = records.map((r: any) => ({ date: r.date?.slice(5), waste: r.waste_tonnes }));
  const intensityData = records.map((r: any) => ({ date: r.date?.slice(5), energy: +r.energy_intensity.toFixed(1), carbon: +(r.carbon_intensity * 1000).toFixed(2) }));

  const tickInterval  = Math.floor(records.length / 6);

  return (
    <AppLayout>
      <div className="p-6 space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="uppercase tracking-widest text-xs mb-2 flex items-center gap-2" style={{ color: '#555', fontSize: 10 }}>
              <span className="w-3 h-px inline-block" style={{ background: '#e6ff3f' }} />
              Historical Trends
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', color: '#f5f5f5', letterSpacing: '-0.01em' }}
            >
              Environmental Analytics
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#8a8a8a' }}>
              Correlations · intensity metrics
            </p>
          </div>

          {/* Time filter buttons */}
          <div className="flex gap-2">
            {TIME_OPTIONS.map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={days === d
                  ? { background: 'rgba(230,255,63,0.08)', border: '1px solid rgba(230,255,63,0.30)', color: '#e6ff3f' }
                  : { background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`, color: '#555' }
                }
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-8 text-sm" style={{ color: '#555' }}>
            Loading {days}-day analytics...
          </div>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* CO₂ — remains red, semantic */}
              <ChartCard title="CO₂ Emissions (tonnes/day)">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={co2Data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="co2g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
                    <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 9 }} interval={tickInterval} />
                    <YAxis tick={{ fill: '#555', fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" name="CO₂ (t)" stroke="#ef4444" fill="url(#co2g)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Energy — amber remains semantic */}
              <ChartCard title="Energy Consumption (MWh equivalent/day)">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={energyData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
                    <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 9 }} interval={tickInterval} />
                    <YAxis tick={{ fill: '#555', fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="electricity" name="Electricity (MWh)" stroke="#f59e0b" fill="url(#eg)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="gas" name="Natural Gas (MWh-eq)" stroke="#0ea5e9" fill="transparent" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                    <Legend wrapperStyle={{ fontSize: '10px', color: '#555' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Water — blue remains semantic */}
              <ChartCard title="Water Consumption (kL/day)">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={waterData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
                    <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 9 }} interval={tickInterval} />
                    <YAxis tick={{ fill: '#555', fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="water" name="Water (kL)" stroke="#0ea5e9" fill="url(#wg)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Air — semantic colors preserved */}
              <ChartCard title="Air Emissions (kg/day)">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={airData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
                    <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 9 }} interval={tickInterval} />
                    <YAxis tick={{ fill: '#555', fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '10px', color: '#555' }} />
                    <Line type="monotone" dataKey="NOx" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="PM25" name="PM2.5" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="SOx" stroke="#a78bfa" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Waste */}
              <ChartCard title="Waste Generation (tonnes/day)">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={wasteData.filter((_: any, i: number) => i % Math.max(1, Math.floor(records.length / 30)) === 0)}
                    margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
                    <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 9 }} />
                    <YAxis tick={{ fill: '#555', fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="waste" name="Waste (t)" fill="#6366f1" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Intensity — teal/red semantic */}
              <ChartCard title="Intensity Metrics">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={intensityData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
                    <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 9 }} interval={tickInterval} />
                    <YAxis tick={{ fill: '#555', fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '10px', color: '#555' }} />
                    <Line type="monotone" dataKey="energy" name="Energy Intensity (kWh/t)" stroke="#00d4a4" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="carbon" name="Carbon Intensity (kg/t)" stroke="#f43f5e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

            </div>

            {/* Correlations */}
            <div
              data-prox
              className="prox-card rounded-xl p-5"
              style={{ background: PANEL, border: `1px solid ${BORDER}` }}
            >
              <h2 className="text-sm font-semibold mb-4" style={{ color: '#f5f5f5' }}>Operational Correlations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {correlations.map((c: any) => (
                  <div
                    key={c.pair}
                    className="rounded-xl p-3"
                    style={{ background: 'rgba(255,255,255,0.015)', border: `1px solid ${BORDER}` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: '#f5f5f5' }}>{c.pair}</span>
                      <span
                        className="text-xs font-bold font-mono"
                        style={{ color: Math.abs(c.r) > 0.7 ? '#00d4a4' : '#f59e0b' }}
                      >
                        r={c.r}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full mb-2" style={{ background: '#1c1c1c' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.abs(c.r) * 100}%`, background: Math.abs(c.r) > 0.7 ? '#00d4a4' : '#f59e0b' }}
                      />
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#555' }}>{c.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
