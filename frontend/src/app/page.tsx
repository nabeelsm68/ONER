'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import KPICard from '@/components/KPICard';
import AlertBanner from '@/components/AlertBanner';
import { api } from '@/lib/api';
import {
  Cloud, Zap, Droplets, Trash2, Wind, Activity,
  RefreshCw, ChevronRight, TrendingUp,
  AlertTriangle, Target
} from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
import Link from 'next/link';

const PANEL = '#0a0a0a';
const BORDER = '#1c1c1c';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 shadow-2xl" style={{ background: '#111', border: `1px solid ${BORDER}` }}>
      <p className="text-xs mb-1.5" style={{ color: '#555' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      setError(null);
      const [ov, analytics] = await Promise.all([
        api.overview(),
        api.analytics(30),
      ]);
      setOverview(ov);
      const records = analytics.records?.slice(-14) || [];
      setChartData(records.map((r: any) => ({
        date: r.date?.slice(5),
        'CO₂ (t)': r.co2_tonnes,
        'Energy (MWh)': +(r.electricity_kwh / 1000).toFixed(2),
      })));
    } catch (e: any) {
      setError('Backend offline. Ensure the FastAPI server is running on port 8000.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const kpis = overview?.kpis || {};
  const hs = overview?.health_score || {};
  const alerts = overview?.active_alerts || [];
  const topRec = overview?.top_recommendation;
  const fcSummary = overview?.forecast_summary || {};

  // Health score color remains semantic
  const scoreColor = hs.score >= 75 ? '#00d4a4' : hs.score >= 55 ? '#f59e0b' : '#ef4444';
  const scoreLabel = hs.score >= 75 ? 'Good' : hs.score >= 55 ? 'Moderate' : 'Poor';

  return (
    <AppLayout>
      <div className="p-6 space-y-6 animate-fade-in">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="uppercase tracking-widest text-xs mb-2 flex items-center gap-2" style={{ color: '#555', fontSize: 10 }}>
              <span className="w-3 h-px inline-block" style={{ background: '#e6ff3f' }} />
              Orion Manufacturing Plant
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', color: '#f5f5f5', letterSpacing: '-0.01em' }}
            >
              Executive Overview
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#8a8a8a' }}>
              Environmental Intelligence Dashboard
            </p>
          </div>

          <button
            onClick={() => load(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
            style={{
              background: 'rgba(230,255,63,0.05)',
              border: '1px solid rgba(230,255,63,0.15)',
              color: '#8a8a8a',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(230,255,63,0.35)';
              (e.currentTarget as HTMLButtonElement).style.color = '#f5f5f5';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(230,255,63,0.15)';
              (e.currentTarget as HTMLButtonElement).style.color = '#8a8a8a';
            }}
          >
            <RefreshCw size={13} className={refreshing || loading ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)', color: '#ef4444' }}>
            ⚠ {error}
          </div>
        )}

        {/* ── Health Score + Forecast ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Health Score */}
          <div
            data-prox
            className="prox-card rounded-xl p-5 flex flex-col items-center justify-center text-center"
            style={{ background: PANEL, border: `1px solid ${BORDER}` }}
          >
            <div className="uppercase tracking-widest mb-3" style={{ fontSize: 10, color: '#555' }}>
              Environmental Health Score
            </div>
            <div className="relative w-28 h-28 mb-3">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1c1c1c" strokeWidth="7" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={scoreColor} strokeWidth="7"
                  strokeDasharray={`${(hs.score || 0) / 100 * 251.2} 251.2`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${scoreColor}60)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-3xl font-bold"
                  style={{ color: scoreColor, fontFamily: 'Space Grotesk, Inter, sans-serif' }}
                >
                  {hs.score || '--'}
                </span>
                <span className="text-xs font-medium" style={{ color: scoreColor }}>{scoreLabel}</span>
              </div>
            </div>
            <div className="text-xs" style={{ color: '#555' }}>vs. 30-day baseline</div>
          </div>

          {/* Forecast Banner */}
          <div
            data-prox
            className="prox-card lg:col-span-2 rounded-xl p-5"
            style={{ background: PANEL, border: `1px solid ${BORDER}` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={15} style={{ color: '#8a8a8a' }} />
              <span className="uppercase tracking-widest" style={{ fontSize: 10, color: '#555' }}>
                7-Day AI Forecast
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs" style={{ color: '#555' }}>CO₂ Trend</div>
                <div
                  className="text-2xl font-bold mt-1"
                  style={{
                    // Semantic: red = bad, teal = good
                    color: (fcSummary.co2_trend_pct || 0) > 0 ? '#ef4444' : '#00d4a4',
                    fontFamily: 'Space Grotesk, Inter, sans-serif',
                  }}
                >
                  {fcSummary.co2_trend_pct !== undefined
                    ? `${fcSummary.co2_trend_pct > 0 ? '+' : ''}${fcSummary.co2_trend_pct}%`
                    : '--'}
                </div>
                <div className="text-xs capitalize mt-0.5" style={{ color: '#555' }}>
                  {fcSummary.co2_trend_direction || 'analyzing...'}
                </div>
              </div>
              <div>
                <div className="text-xs" style={{ color: '#555' }}>Energy Trend</div>
                <div
                  className="text-2xl font-bold mt-1"
                  style={{
                    color: (fcSummary.elec_trend_pct || 0) > 0 ? '#f59e0b' : '#00d4a4',
                    fontFamily: 'Space Grotesk, Inter, sans-serif',
                  }}
                >
                  {fcSummary.elec_trend_pct !== undefined
                    ? `${fcSummary.elec_trend_pct > 0 ? '+' : ''}${fcSummary.elec_trend_pct}%`
                    : '--'}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#555' }}>Next 7 days</div>
              </div>
            </div>
            <Link
              href="/analytics"
              className="inline-flex items-center gap-1 text-xs mt-3 transition-colors duration-200 hover:opacity-80"
              style={{ color: '#8a8a8a' }}
            >
              View full forecast <ChevronRight size={11} />
            </Link>
          </div>
        </div>

        {/* ── KPI Grid ────────────────────────────────────── */}
        <div>
          <div className="uppercase tracking-widest mb-3" style={{ fontSize: 10, color: '#555' }}>
            Key Environmental Metrics
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <KPICard
              title="CO₂ Emissions"
              value={kpis.co2_tonnes?.value ?? '--'}
              unit={kpis.co2_tonnes?.unit}
              change_pct={kpis.co2_tonnes?.change_pct}
              icon={<Cloud size={13} />}
              accent="red"
            />
            <KPICard
              title="Energy"
              value={kpis.electricity_kwh?.value !== undefined ? Math.round(kpis.electricity_kwh.value / 1000) : '--'}
              unit="MWh/day"
              change_pct={kpis.electricity_kwh?.change_pct}
              icon={<Zap size={13} />}
              accent="amber"
            />
            <KPICard
              title="Air Quality Risk"
              value={kpis.air_quality_risk?.value ?? '--'}
              subtitle={`NOx: ${kpis.air_quality_risk?.nox_kg ?? '--'} kg | PM2.5: ${kpis.air_quality_risk?.pm25_kg ?? '--'} kg`}
              icon={<Wind size={13} />}
              accent={kpis.air_quality_risk?.value === 'HIGH' ? 'red' : kpis.air_quality_risk?.value === 'MODERATE' ? 'amber' : 'green'}
            />
            <KPICard
              title="Water Usage"
              value={kpis.water_liters?.value !== undefined ? Math.round(kpis.water_liters.value / 1000) : '--'}
              unit="kL/day"
              change_pct={kpis.water_liters?.change_pct}
              icon={<Droplets size={13} />}
              accent="blue"
            />
            <KPICard
              title="Waste"
              value={kpis.waste_tonnes?.value ?? '--'}
              unit={kpis.waste_tonnes?.unit}
              change_pct={kpis.waste_tonnes?.change_pct}
              icon={<Trash2 size={13} />}
              accent="default"
            />
            <KPICard
              title="Carbon Intensity"
              value={kpis.carbon_intensity?.value ?? '--'}
              unit={kpis.carbon_intensity?.unit}
              change_pct={kpis.carbon_intensity?.change_pct}
              icon={<Activity size={13} />}
              accent={(kpis.carbon_intensity?.change_pct || 0) > 5 ? 'red' : 'green'}
            />
          </div>
        </div>

        {/* ── Alerts + Recommendation ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Alerts */}
          <div
            data-prox
            className="prox-card lg:col-span-3 rounded-xl p-5"
            style={{ background: PANEL, border: `1px solid ${BORDER}` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
              <h2 className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>ONER Alerts</h2>
              {alerts.length > 0 && (
                <span
                  className="ml-auto px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: 'rgba(239,68,68,0.10)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.22)' }}
                >
                  {alerts.length} Active
                </span>
              )}
            </div>
            <div className="space-y-2">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-sm" style={{ color: '#555' }}>
                  {loading ? 'Analyzing environmental data...' : 'No active alerts'}
                </div>
              ) : (
                alerts.map((alert: any) => (
                  <Link key={alert.id} href={`/investigation?id=${alert.id}`}>
                    <AlertBanner
                      id={alert.id}
                      severity={alert.severity}
                      component={alert.component}
                      date={alert.date}
                      evidence={alert.evidence}
                    />
                  </Link>
                ))
              )}
            </div>
            <Link
              href="/investigation"
              className="flex items-center justify-center gap-1 mt-3 text-xs transition-colors hover:opacity-70"
              style={{ color: '#555' }}
            >
              View all anomalies <ChevronRight size={11} />
            </Link>
          </div>

          {/* Top Recommendation */}
          <div
            data-prox
            className="prox-card lg:col-span-2 rounded-xl p-5"
            style={{ background: PANEL, border: `1px solid ${BORDER}` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Target size={14} style={{ color: '#00d4a4' }} />
              <h2 className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>ONER Recommendation</h2>
            </div>
            {topRec ? (
              <div className="space-y-3">
                <div className="font-semibold text-sm" style={{ color: '#00d4a4', fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                  {topRec.name}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#8a8a8a' }}>{topRec.description}</p>
                <div className="space-y-2 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                  {[
                    ['CO₂ Reduction', `${topRec.annual_co2_reduction_tonnes?.toFixed(1)} t/yr`, '#00d4a4'],
                    ['Annual Savings', `$${topRec.annual_monetary_savings_usd?.toLocaleString()}`, '#22c55e'],
                    ['Payback', `${topRec.payback_years?.toFixed(1)} years`, '#f5f5f5'],
                  ].map(([k, v, c]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span style={{ color: '#555' }}>{k}</span>
                      <span className="font-semibold" style={{ color: c }}>{v}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/simulator"
                  className="flex items-center justify-center gap-1 w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 mt-2 hover:opacity-80"
                  style={{ background: 'rgba(0,212,164,0.08)', border: '1px solid rgba(0,212,164,0.22)', color: '#00d4a4' }}
                >
                  Compare Interventions <ChevronRight size={11} />
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-sm" style={{ color: '#555' }}>
                {loading ? 'Calculating recommendations...' : 'No recommendations available'}
              </div>
            )}
          </div>
        </div>

        {/* ── 30-Day Trend Chart ────────────────────────── */}
        <div
          data-prox
          className="prox-card rounded-xl p-5"
          style={{ background: PANEL, border: `1px solid ${BORDER}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>30-Day Environmental Trends</h2>
            <Link
              href="/analytics"
              className="text-xs flex items-center gap-1 transition-colors hover:opacity-70"
              style={{ color: '#555' }}
            >
              Full analytics <ChevronRight size={11} />
            </Link>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="co2grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="energygrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
                <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} />
                <YAxis tick={{ fill: '#555', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#555' }} />
                {/* CO₂ remains red — semantic */}
                <Area type="monotone" dataKey="CO₂ (t)" stroke="#ef4444" fill="url(#co2grad)" strokeWidth={2} dot={false} />
                {/* Energy remains amber — semantic */}
                <Area type="monotone" dataKey="Energy (MWh)" stroke="#f59e0b" fill="url(#energygrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: '#555' }}>
              {loading ? 'Loading trend data...' : 'No data available'}
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
