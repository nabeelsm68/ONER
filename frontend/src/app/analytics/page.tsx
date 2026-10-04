'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const TIME_OPTIONS = [7, 30, 90] as const;

export default function AnalyticsPage() {
  const [days, setDays] = useState<typeof TIME_OPTIONS[number]>(30);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [primaryMetric, setPrimaryMetric] = useState<'co2' | 'energy' | 'gas'>('co2');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.analytics(days);
      setData(res);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const records = data?.records || [];
  const correlations = data?.correlations || [];

  // Computed summary
  const summary = useMemo(() => {
    if (!records.length) return null;
    const totalCO2 = records.reduce((acc: number, r: any) => acc + (r.co2_tonnes || 0), 0);
    const avgEnergy = records.reduce((acc: number, r: any) => acc + (r.electricity_kwh || 0), 0) / records.length;
    const avgWater = records.reduce((acc: number, r: any) => acc + (r.water_consumption_liters || 0), 0) / records.length;
    const avgIntensity = records.reduce((acc: number, r: any) => acc + (r.carbon_intensity || 0), 0) / records.length;

    return {
      totalCO2: totalCO2.toFixed(1),
      avgEnergyMWh: (avgEnergy / 1000).toFixed(1),
      avgWaterM3: (avgWater / 1000).toFixed(1),
      avgCarbonIntensity: (avgIntensity * 1000).toFixed(1),
    };
  }, [records]);

  // Primary chart series
  const primaryChartData = useMemo(() => {
    return records.map((r: any) => ({
      date: r.date?.slice(5) || '',
      co2: r.co2_tonnes,
      energy: +(r.electricity_kwh / 1000).toFixed(2),
      gas: +(r.natural_gas_m3 * 10.55 / 1000).toFixed(2),
      production: r.production_output,
    }));
  }, [records]);

  return (
    <AppLayout
      title="Environmental Analytics"
      subtitle={`${days}-Day Longitudinal Observation`}
      onRefresh={loadData}
      isRefreshing={loading}
    >
      <div className="space-y-6">
        {/* ── Filter & Time Horizon Bar ─────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4 px-5 py-3 rounded-xl bg-[#0c100e] border border-[#141b16]">
          <div>
            <div className="text-xs font-semibold text-zinc-200">
              Multi-Variable Environmental Trajectory
            </div>
            <div className="text-[11px] text-zinc-400 font-sans">
              Audited continuous physical telemetry and cross-sensor covariance
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#090c0a] border border-[#141b16]">
            {TIME_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  days === d
                    ? 'bg-[#18221b] text-zinc-100 font-semibold border border-[#27372d]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* ── Quieter Telemetry Strip (4 Metrics) ───────────────── */}
        <div className="rounded-xl bg-[#0c100e] border border-[#141b16] overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-[#141c16]">
            <div className="p-4">
              <div className="text-[11px] font-medium text-zinc-400">Cumulative CO₂</div>
              <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                {summary?.totalCO2 || '0.0'} <span className="text-xs font-normal text-zinc-400">t</span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 font-mono">Scope 1 & 2 Audited</div>
            </div>

            <div className="p-4">
              <div className="text-[11px] font-medium text-zinc-400">Avg Daily Electricity</div>
              <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                {summary?.avgEnergyMWh || '0.0'} <span className="text-xs font-normal text-zinc-400">MWh</span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 font-mono">Grid & Cogen Combined</div>
            </div>

            <div className="p-4">
              <div className="text-[11px] font-medium text-zinc-400">Cooling Water Inflow</div>
              <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                {summary?.avgWaterM3 || '0.0'} <span className="text-xs font-normal text-zinc-400">m³/day</span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 font-mono">Recirculation 89.4%</div>
            </div>

            <div className="p-4">
              <div className="text-[11px] font-medium text-zinc-400">Carbon Intensity</div>
              <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                {summary?.avgCarbonIntensity || '0.0'} <span className="text-xs font-normal text-zinc-400">kg/t</span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 font-mono">Per finished product</div>
            </div>
          </div>
        </div>

        {/* ── DOMINANT PRIMARY INVESTIGATION SIGNAL ─────────────── */}
        <div className="p-6 rounded-xl bg-[#0e1310] border border-[#16201a] shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            <div>
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Primary Investigation Signal
              </div>
              <h2 className="text-lg font-semibold text-zinc-100 mt-0.5">
                {primaryMetric === 'co2' ? 'CO₂ Emissions Profile & Production Correlation' : primaryMetric === 'energy' ? 'Electricity Demand Profile (MWh)' : 'Natural Gas Fuel Input (MWh eq)'}
              </h2>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#090c0a] border border-[#141b16]">
              <button
                onClick={() => setPrimaryMetric('co2')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  primaryMetric === 'co2'
                    ? 'bg-[#18221b] text-zinc-100 font-semibold border border-[#27372d]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                CO₂ Emissions
              </button>
              <button
                onClick={() => setPrimaryMetric('energy')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  primaryMetric === 'energy'
                    ? 'bg-[#18221b] text-zinc-100 font-semibold border border-[#27372d]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Electricity
              </button>
              <button
                onClick={() => setPrimaryMetric('gas')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  primaryMetric === 'gas'
                    ? 'bg-[#18221b] text-zinc-100 font-semibold border border-[#27372d]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Natural Gas
              </button>
            </div>
          </div>

          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={primaryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="pElec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="pGas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
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
                  contentStyle={{
                    backgroundColor: '#0e1310',
                    borderColor: '#1e2b22',
                    borderRadius: '8px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px',
                  }}
                />
                {primaryMetric === 'co2' && (
                  <Area
                    type="monotone"
                    dataKey="co2"
                    name="CO₂ (t)"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pCo2)"
                  />
                )}
                {primaryMetric === 'energy' && (
                  <Area
                    type="monotone"
                    dataKey="energy"
                    name="Electricity (MWh)"
                    stroke="#0284c7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pElec)"
                  />
                )}
                {primaryMetric === 'gas' && (
                  <Area
                    type="monotone"
                    dataKey="gas"
                    name="Gas Energy (MWh eq)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pGas)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── QUIETER SECONDARY SIGNALS ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Secondary Signal 1: Air Emissions (NOx, PM2.5) */}
          <div className="lg:col-span-6 p-5 rounded-xl bg-[#0c100e] border border-[#141b16]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-300">
                Stack Air Emissions (kg/day)
              </span>
              <span className="text-[10px] font-mono text-amber-400">NOx & PM2.5 Deviations</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={records.map((r: any) => ({
                    date: r.date?.slice(5),
                    NOx: r.nox_kg,
                    PM25: r.pm25_kg,
                  }))}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
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
                    contentStyle={{
                      backgroundColor: '#0e1310',
                      borderColor: '#1e2b22',
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px',
                    }}
                  />
                  <Line type="monotone" dataKey="NOx" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="PM25" name="PM 2.5" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Signal 2: Water & Process Cooling */}
          <div className="lg:col-span-6 p-5 rounded-xl bg-[#0c100e] border border-[#141b16]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-300">
                Cooling Water Outflow (m³/day)
              </span>
              <span className="text-[10px] font-mono text-teal-400">Canal monitoring</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={records.map((r: any) => ({
                    date: r.date?.slice(5),
                    water: +(r.water_consumption_liters / 1000).toFixed(1),
                  }))}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
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
                    contentStyle={{
                      backgroundColor: '#0e1310',
                      borderColor: '#1e2b22',
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" dataKey="water" stroke="#0d9488" strokeWidth={1.5} fill="#0d9488" fillOpacity={0.12} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── COVARIANCE CORRELATION MATRIX ────────────────────── */}
        <div className="p-5 rounded-xl bg-[#0c100e] border border-[#141b16]">
          <div className="text-xs font-semibold text-zinc-300 mb-3">
            Cross-Sensor Covariance Analysis
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {correlations.map((c: any) => (
              <div key={c.pair} className="p-3.5 rounded-lg bg-[#090c0a] border border-[#141b16]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">{c.pair}</span>
                  <span className="text-xs font-mono font-medium text-emerald-400">
                    r = {c.r?.toFixed(3)}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed font-sans">
                  {c.interpretation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
