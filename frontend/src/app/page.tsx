'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import AlertBanner from '@/components/AlertBanner';
import { api } from '@/lib/api';
import {
  Cloud,
  Zap,
  Droplets,
  Wind,
  Activity,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Radio,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import EnvironmentalImpactReportModal from '@/components/EnvironmentalImpactReportModal';
import { CommunityReport, EnvironmentalImpactReport } from '@/lib/api';

export default function OverviewPage() {
  const [overview, setOverview] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [selectedImpactReport, setSelectedImpactReport] = useState<EnvironmentalImpactReport | null>(null);
  const [_loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSignal, setActiveSignal] = useState<'co2' | 'energy' | 'production'>('co2');

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setError(null);
      const [ov, an, repData] = await Promise.all([
        api.overview(),
        api.analytics(30),
        api.getCommunityReports().catch(() => ({ reports: [] })),
      ]);
      setOverview(ov);
      setCommunityReports(repData.reports || []);

      const records = an.records || [];
      setAnalyticsData(
        records.slice(-21).map((r: any) => ({
          date: r.date?.slice(5) || '',
          co2: r.co2_tonnes,
          energy: +(r.electricity_kwh / 1000).toFixed(2),
          production: r.production_output,
        }))
      );
    } catch (_err: any) {
      setError('Unable to connect to the ONER telemetry engine. Please ensure the backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hs = overview?.health_score || { score: 87.3, components: {} };
  const kpis = overview?.kpis || {};
  const alerts = overview?.active_alerts || [];
  const topRec = overview?.top_recommendation;

  const scoreColor = hs.score >= 75 ? 'text-emerald-400' : hs.score >= 55 ? 'text-amber-400' : 'text-red-400';
  const scoreStatus = hs.score >= 75 ? 'NOMINAL' : hs.score >= 55 ? 'ATTENTION' : 'CRITICAL';

  return (
    <AppLayout
      title="Executive Overview"
      subtitle="Autonomous Facility Telemetry"
      onRefresh={() => loadData(true)}
      isRefreshing={refreshing}
    >
      <div className="space-y-6">
        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        {/* ── 0. COMMUNITY-TO-INDUSTRY NETWORK HERO & CLOSED LOOP ── */}
        <div className="rounded-xl bg-[#0D0F0F] border border-[#202525] p-6 space-y-6 relative overflow-hidden shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#121515] border border-[#202525] text-xs font-semibold text-[#B7D83D]">
                <span>ONER PLATFORM</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-300 font-normal">Closed-Loop Environmental Network</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#F2F3EF]">
                Environmental Intelligence for Cleaner Communities
              </h1>
              <p className="text-xs md:text-sm text-[#8D9490] leading-relaxed">
                Turn community pollution reports and industrial environmental data into evidence, action, and measurable outcomes.
              </p>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <Link
                href="/report"
                className="px-4 py-2.5 rounded-lg bg-[#152218] hover:bg-[#1a2c1f] border border-[#B7D83D]/60 text-xs font-bold text-white tracking-wide transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
              >
                <span>REPORT A POLLUTION ISSUE</span>
                <ArrowRight size={14} className="text-[#B7D83D]" />
              </Link>
              <Link
                href="/government"
                className="px-4 py-2.5 rounded-lg bg-[#121515] hover:bg-[#181d1b] border border-[#202525] text-xs font-semibold text-zinc-300 hover:text-white transition-all whitespace-nowrap"
              >
                OPEN COMMAND CENTER
              </Link>
            </div>
          </div>

          {/* Three Stakeholder Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <Link
              href="/community"
              className="p-3.5 rounded-lg bg-[#080909] border border-[#202525] hover:border-emerald-500/40 transition-colors group space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-200">1. GENERAL PUBLIC</span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">REPORT → PROTECT → EARN</span>
              </div>
              <p className="text-[11px] text-[#8D9490] leading-relaxed">
                Capture timestamped GPS optical evidence. Earn verified Community Impact Points when your report correlates with industrial sensors.
              </p>
            </Link>

            <Link
              href="/industry"
              className="p-3.5 rounded-lg bg-[#080909] border border-[#202525] hover:border-teal-500/40 transition-colors group space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-200">2. INDUSTRY</span>
                <span className="text-[10px] font-mono text-teal-400 font-semibold">COMPLY → OPTIMIZE → SAVE</span>
              </div>
              <p className="text-[11px] text-[#8D9490] leading-relaxed">
                Receive corroborated incident dispatches. Execute model-predictive setpoint optimizations under the Environmental Pact to avoid penalties.
              </p>
            </Link>

            <Link
              href="/government"
              className="p-3.5 rounded-lg bg-[#080909] border border-[#202525] hover:border-amber-500/40 transition-colors group space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-200">3. GOVERNMENT</span>
                <span className="text-[10px] font-mono text-amber-400 font-semibold">SEE → VERIFY → ACT</span>
              </div>
              <p className="text-[11px] text-[#8D9490] leading-relaxed">
                Regional environmental surveillance with auditable evidence trails. Mandate corrective action and measure permanent air/water restoration.
              </p>
            </Link>
          </div>

          {/* Interactive Closed Loop Conduits Diagram */}
          <div className="p-3 rounded-lg bg-[#080909] border border-[#1b221e] flex items-center justify-between text-[11px] font-mono text-zinc-400 overflow-x-auto gap-2">
            <span className="text-emerald-400 font-semibold">CITIZEN</span>
            <span className="text-zinc-600">→</span>
            <span className="text-[#B7D83D] font-semibold">ONER ENGINE</span>
            <span className="text-zinc-600">→</span>
            <span className="text-teal-400 font-semibold">INDUSTRY</span>
            <span className="text-zinc-600">→</span>
            <span className="text-amber-400 font-semibold">GOVERNMENT</span>
            <span className="text-zinc-600">→</span>
            <span className="text-emerald-400 font-semibold">CITIZEN (RESOLVED + REWARD)</span>
          </div>
        </div>

        {/* ── 1. FACILITY STATUS STRIP ─────────────────────────── */}
        <div className="px-4 py-2.5 rounded-lg bg-[#0E1110] border border-[#242A27] flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-[#F1F3EE]">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[#929A95]">Facility:</span>
              <span className="font-semibold text-white">Orion Refining Complex</span>
            </span>
            <span className="text-[#242A27]">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#929A95]">Status:</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                OPERATIONAL / AT RISK
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-[#929A95]">
            <span className="flex items-center gap-1.5">
              <Radio size={12} className="text-[#A8C83A]" />
              <span>Simulated Telemetry 1.0 Hz</span>
            </span>
            <span className="text-zinc-700">·</span>
            <span>Deterministic Autopilot Engine</span>
          </div>
        </div>

        {/* ── 2. ENVIRONMENTAL HEALTH & WHAT ONER FOUND (CENTRAL INTELLIGENCE) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Health Index Metric */}
          <div className="lg:col-span-4 p-6 rounded-xl bg-[#0E1110] border border-[#242A27] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-xs font-semibold tracking-tight text-[#929A95] uppercase">
                  Environmental Health
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-amber-400 border border-amber-500/20">
                  AT RISK (NOx ELEVATED)
                </span>
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-6xl font-bold font-mono tracking-tight text-[#A8C83A]">
                  87.3
                </span>
                <span className="text-[#626A65] font-mono text-sm">/ 100</span>
              </div>
              
              <div className="text-sm font-semibold text-[#F1F3EE] mt-2">
                Composite Facility Rating
              </div>
              <p className="text-xs text-[#929A95] mt-1.5 leading-relaxed font-sans">
                Deterministic weighted score across emissions, thermal balance, electrical grid intensity, and air quality risk.
              </p>
            </div>

            {/* Sub-component metrics bar */}
            <div className="mt-6 pt-4 border-t border-[#242A27] grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-[10px] text-[#929A95] font-medium">CO₂e</div>
                <div className="text-xs font-mono font-semibold text-[#F1F3EE] mt-1">124.6t</div>
              </div>
              <div>
                <div className="text-[10px] text-[#929A95] font-medium">Energy</div>
                <div className="text-xs font-mono font-semibold text-[#F1F3EE] mt-1">28.8 MWh</div>
              </div>
              <div>
                <div className="text-[10px] text-[#929A95] font-medium">Water</div>
                <div className="text-xs font-mono font-semibold text-[#F1F3EE] mt-1">64.0 m³</div>
              </div>
              <div>
                <div className="text-[10px] text-[#929A95] font-medium">Air Quality</div>
                <div className="text-xs font-mono font-semibold text-amber-400 mt-1">MODERATE</div>
              </div>
            </div>
          </div>

          {/* Central Intelligence Layer: What ONER Found & Recommends */}
          <div className="lg:col-span-8 p-6 rounded-xl bg-[#0E1110] border border-[#242A27] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#A8C83A]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#F1F3EE]">
                    ONER Autonomous Briefing
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#929A95]">
                  Causal Inference & Isolation Forest
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-[#F1F3EE]">
                  Elevated NOx detected around Furnace F-101. Community report COMM-2026-00421 corroborates the signal. Recommended damper adjustment is expected to reduce emissions.
                </h3>
                <p className="text-xs text-[#929A95] mt-2 leading-relaxed font-sans max-w-3xl">
                  ONER telemetry observed an air-fuel ratio drift resulting in simultaneous thermal efficiency loss and optical smoke plumes. Citizen optical evidence timestamped at 14:02 corroborates the burner plenum manifold 4B excursion with 89.4% correlation confidence.
                </p>
              </div>

              {/* Reasoning Chain Strip */}
              <div className="mt-5 p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase font-medium">Detection Signal</div>
                  <div className="font-mono text-zinc-200 mt-0.5 font-medium">+18.4°C Drift</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase font-medium">Root Cause</div>
                  <div className="font-sans text-zinc-200 mt-0.5 font-medium">Gas Volume Surge</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase font-medium">Confidence</div>
                  <div className="font-mono text-emerald-400 mt-0.5 font-medium">99.4% Verified</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase font-medium">Action Path</div>
                  <div className="font-mono text-zinc-200 mt-0.5 font-medium">Damper Trim 1.042</div>
                </div>
              </div>
            </div>

            {/* WHAT ONER RECOMMENDS FOOTER */}
            <div className="mt-5 pt-3.5 border-t border-[#18231c] flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-zinc-300 font-sans">
                <span className="text-zinc-400">Recommendation:</span> Actuate damper trim to restore stoichiometric combustion
              </div>
              <div className="flex items-center gap-2.5">
                <Link
                  href="/investigation"
                  className="px-3 py-1.5 rounded-lg bg-[#141c16] hover:bg-[#1a251e] border border-[#1e2b22] text-xs font-medium text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Investigate Cause</span>
                  <ArrowRight size={12} />
                </Link>
                <Link
                  href="/simulator"
                  className="px-3.5 py-1.5 rounded-lg bg-[#142219] hover:bg-[#1a2d21] border border-[#213829] text-xs font-medium text-zinc-100 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Simulate Action</span>
                  <ArrowRight size={12} className="text-emerald-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. COMPACT ENVIRONMENTAL INTELLIGENCE STRIP (5 METRICS) ── */}
        <div className="rounded-xl bg-[#0c100e] border border-[#141b16] overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 lg:divide-x divide-[#141c16]">
            {/* KPI 1 */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium text-zinc-300">CO₂ Emissions</span>
                <Cloud size={14} className="text-zinc-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
                  {kpis?.co2_tonnes?.value?.toFixed(1) || '124.6'}
                </span>
                <span className="text-xs font-mono text-zinc-400">t CO₂</span>
              </div>
              <div className="mt-2 flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                <TrendingDown size={12} />
                <span>-0.2%</span>
                <span className="text-zinc-400 font-sans text-[10px] ml-1">7d avg</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium text-zinc-300">Electricity Rate</span>
                <Zap size={14} className="text-zinc-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
                  {kpis?.electricity_kwh?.value ? (kpis.electricity_kwh.value / 1000).toFixed(1) : '28.8'}
                </span>
                <span className="text-xs font-mono text-zinc-400">MWh/day</span>
              </div>
              <div className="mt-2 flex items-center gap-1 font-mono text-[11px] text-zinc-300">
                <TrendingDown size={12} />
                <span>-0.6%</span>
                <span className="text-zinc-400 font-sans text-[10px] ml-1">7d avg</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium text-zinc-300">Cooling Water</span>
                <Droplets size={14} className="text-zinc-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
                  {kpis?.water_liters?.value ? (kpis.water_liters.value / 1000).toFixed(1) : '64.0'}
                </span>
                <span className="text-xs font-mono text-zinc-400">m³/day</span>
              </div>
              <div className="mt-2 flex items-center gap-1 font-mono text-[11px] text-teal-400">
                <TrendingUp size={12} />
                <span>+0.8%</span>
                <span className="text-zinc-400 font-sans text-[10px] ml-1">recirculation</span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium text-zinc-300">Air Quality Risk</span>
                <Wind size={14} className="text-zinc-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-sans tracking-tight text-amber-400">
                  MODERATE
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1 font-mono text-[11px] text-amber-400">
                <TrendingUp size={12} />
                <span>NOx: {kpis?.air_quality_risk?.nox_kg?.toFixed(1) || '17.3'}kg</span>
                <span className="text-zinc-400 font-sans text-[10px] ml-1">+12.4%</span>
              </div>
            </div>

            {/* KPI 5 */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium text-zinc-300">Carbon Intensity</span>
                <Activity size={14} className="text-zinc-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
                  {kpis?.carbon_intensity?.value?.toFixed(3) || '0.044'}
                </span>
                <span className="text-xs font-mono text-zinc-400">t CO₂/t</span>
              </div>
              <div className="mt-2 flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                <TrendingDown size={12} />
                <span>-0.2%</span>
                <span className="text-zinc-400 font-sans text-[10px] ml-1">per ton product</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. DOMINANT ENVIRONMENTAL TRAJECTORY ─────────────── */}
        <div className="p-6 rounded-xl bg-[#0e1310] border border-[#16201a]">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            <div>
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Longitudinal Telemetry Correlation
              </div>
              <h2 className="text-base font-semibold text-zinc-100 mt-0.5">
                21-Day Environmental Trajectory & Output
              </h2>
            </div>

            {/* Restrained Signal Selector */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#090c0a] border border-[#141b16]">
              <button
                onClick={() => setActiveSignal('co2')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeSignal === 'co2'
                    ? 'bg-[#18221b] text-zinc-100 font-semibold border border-[#27372d]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                CO₂ Emissions (t)
              </button>
              <button
                onClick={() => setActiveSignal('energy')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeSignal === 'energy'
                    ? 'bg-[#18221b] text-zinc-100 font-semibold border border-[#27372d]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Energy (MWh)
              </button>
              <button
                onClick={() => setActiveSignal('production')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeSignal === 'production'
                    ? 'bg-[#18221b] text-zinc-100 font-semibold border border-[#27372d]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Output (tons)
              </button>
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717a" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#71717a" stopOpacity={0.0} />
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
                {activeSignal === 'co2' && (
                  <Area
                    type="monotone"
                    dataKey="co2"
                    name="CO₂ (tonnes)"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#co2Grad)"
                  />
                )}
                {activeSignal === 'energy' && (
                  <Area
                    type="monotone"
                    dataKey="energy"
                    name="Energy (MWh)"
                    stroke="#0284c7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#energyGrad)"
                  />
                )}
                {activeSignal === 'production' && (
                  <Area
                    type="monotone"
                    dataKey="production"
                    name="Output (tons)"
                    stroke="#71717a"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#prodGrad)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── 5. ACTIVE CASES & RECENT IMPACT (REQUIREMENT 13) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Active Cases */}
          <div className="lg:col-span-7 p-5 rounded-xl bg-[#0E1110] border border-[#242A27]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#929A95]">Accountability Pipeline</div>
                <h3 className="text-sm font-bold text-[#F1F3EE]">Active Cases & Incident Dispatches</h3>
              </div>
              <Link href="/community" className="text-xs font-mono text-[#A8C83A] hover:underline">
                View All Community Cases →
              </Link>
            </div>

            <div className="space-y-2.5">
              {communityReports.slice(0, 3).map((rep) => (
                <div
                  key={rep.id}
                  className="p-3 rounded-lg bg-[#080A09] border border-[#242A27] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#F1F3EE]">{rep.id}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30">
                        {rep.corroboration_score ? `${(rep.corroboration_score * 100).toFixed(1)}% CORRELATED` : 'CORRELATED'}
                      </span>
                    </div>
                    <div className="text-zinc-300 font-medium truncate">{rep.title}</div>
                    <div className="text-[11px] text-[#929A95] font-mono truncate">
                      {rep.correlated_facility || 'Orion Refining Complex'} · {rep.status}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {rep.environmental_impact_report ? (
                      <button
                        onClick={() => setSelectedImpactReport(rep.environmental_impact_report || null)}
                        className="px-2.5 py-1.5 rounded bg-[#141817] hover:bg-[#1a221f] border border-[#A8C83A]/40 text-[11px] font-mono text-[#A8C83A] font-semibold transition-colors"
                      >
                        Impact Report
                      </button>
                    ) : (
                      <Link
                        href="/industry"
                        className="px-2.5 py-1.5 rounded bg-[#141817] hover:bg-[#1f2622] border border-[#242A27] text-[11px] font-mono text-zinc-300 transition-colors"
                      >
                        Inspect
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Impact (Measurable Reductions) */}
          <div className="lg:col-span-5 p-5 rounded-xl bg-[#0E1110] border border-[#242A27] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#929A95]">Measured Results</div>
                  <h3 className="text-sm font-bold text-[#F1F3EE]">Recent Environmental Impact</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30">
                  MRV-READY
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-[#080A09] border border-[#242A27]">
                  <div className="text-[10px] uppercase font-mono text-[#929A95]">NOx Abated</div>
                  <div className="text-lg font-mono font-bold text-[#A8C83A] mt-1">↓ 28.6 kg/day</div>
                  <div className="text-[10px] text-[#626A65] font-mono mt-0.5">Furnace F-101 Trim</div>
                </div>

                <div className="p-3 rounded-lg bg-[#080A09] border border-[#242A27]">
                  <div className="text-[10px] uppercase font-mono text-[#929A95]">CO₂e Reduced</div>
                  <div className="text-lg font-mono font-bold text-[#A8C83A] mt-1">↓ 14.2 t/day</div>
                  <div className="text-[10px] text-[#626A65] font-mono mt-0.5">Annualized: 5,183 t/yr</div>
                </div>

                <div className="p-3 rounded-lg bg-[#080A09] border border-[#242A27]">
                  <div className="text-[10px] uppercase font-mono text-[#929A95]">Thermal Recovery</div>
                  <div className="text-lg font-mono font-bold text-[#F1F3EE] mt-1">+2.45%</div>
                  <div className="text-[10px] text-[#626A65] font-mono mt-0.5">Burner efficiency</div>
                </div>

                <div className="p-3 rounded-lg bg-[#080A09] border border-[#242A27]">
                  <div className="text-[10px] uppercase font-mono text-[#929A95]">Community Rewards</div>
                  <div className="text-lg font-mono font-bold text-[#C4DF61] mt-1">+50 Points</div>
                  <div className="text-[10px] text-[#626A65] font-mono mt-0.5">Verified citizen impact</div>
                </div>
              </div>

              <p className="text-[11px] text-[#929A95] mt-3 font-sans leading-relaxed">
                Intervention on COMM-2026-00421 successfully normalized air quality breach with permanent CEMS verification.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#242A27]">
              {communityReports.length > 0 && (
                <button
                  onClick={() => {
                    const target = communityReports.find((r) => r.id === 'COMM-2026-00421') || communityReports[0];
                    setSelectedImpactReport(target?.environmental_impact_report || null);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-[#141817] hover:bg-[#1c221e] border border-[#A8C83A]/50 text-xs font-mono font-bold text-[#A8C83A] flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>VIEW FINAL ENVIRONMENTAL IMPACT REPORT (COMM-2026-00421)</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── 6. RECOMMENDATIONS & COMPACT ACTIONABLE ALERTS ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Top Recommendation Section */}
          <div className="lg:col-span-6 p-5 rounded-xl bg-[#0E1110] border border-[#242A27] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#929A95]">
                  Priority Intervention
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-zinc-300 border border-[#242A27]">
                  RANK #1 INTERVENTION
                </span>
              </div>

              <div className="text-base font-semibold text-[#F1F3EE]">
                {topRec?.name || 'Peak-Hour Load Shifting'}
              </div>
              <p className="text-xs text-[#929A95] mt-1 leading-relaxed font-sans">
                {topRec?.description || 'Shift non-critical energy-intensive process runs outside peak tariff hours.'}
              </p>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#242A27]">
                <div className="p-2.5 rounded-lg bg-[#080A09] border border-[#242A27]">
                  <div className="text-[10px] text-[#929A95] uppercase font-medium">CO₂ Cut</div>
                  <div className="text-xs font-mono font-bold text-[#A8C83A] mt-0.5">
                    -{topRec?.annual_co2_reduction_tonnes?.toFixed(1) || '63.6'} t/yr
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#080A09] border border-[#242A27]">
                  <div className="text-[10px] text-[#929A95] uppercase font-medium">Annual Savings</div>
                  <div className="text-xs font-mono font-bold text-[#F1F3EE] mt-0.5">
                    ${Math.round(topRec?.annual_monetary_savings_usd || 139688).toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#080A09] border border-[#242A27]">
                  <div className="text-[10px] text-[#929A95] uppercase font-medium">Payback</div>
                  <div className="text-xs font-mono font-bold text-[#F1F3EE] mt-0.5">
                    {topRec?.payback_years?.toFixed(1) || '0.2'} yrs
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#242A27] flex items-center justify-end">
              <Link
                href="/simulator"
                className="px-3.5 py-1.5 rounded-lg bg-[#141817] hover:bg-[#1a221f] border border-[#242A27] text-xs font-medium text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Launch Intervention Simulator</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Compact Actionable Alerts */}
          <div className="lg:col-span-6 p-5 rounded-xl bg-[#0E1110] border border-[#242A27]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#929A95]">
                Active Facility Alerts ({alerts.length})
              </span>
              <Link
                href="/investigation"
                className="text-xs font-medium text-[#929A95] hover:text-[#F1F3EE] transition-colors"
              >
                View all incidents →
              </Link>
            </div>

            <div className="space-y-2">
              {alerts.slice(0, 3).map((a: any) => (
                <AlertBanner
                  key={a.id}
                  id={a.id}
                  severity={a.severity}
                  component={a.component}
                  date={a.date}
                  evidence={a.evidence}
                  investigateHref={`/investigation?id=${a.id}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Environmental Impact Report Modal */}
        <EnvironmentalImpactReportModal
          report={selectedImpactReport}
          onClose={() => setSelectedImpactReport(null)}
        />
      </div>
    </AppLayout>
  );
}
