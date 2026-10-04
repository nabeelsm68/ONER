'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import AlertBanner from '@/components/AlertBanner';
import { api, CommunityReport, EnvironmentalImpactReport as EnvironmentalImpactReportType } from '@/lib/api';
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
  ShieldCheck,
  FileCheck2,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
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
import ScoreDefinitions from '@/components/ScoreDefinitions';
import EvidenceTrustLayer from '@/components/EvidenceTrustLayer';
import { ConvergenceChain, StateBadge, Horizon } from '@/components/primitives';

export default function OverviewPage() {
  const [overview, setOverview] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [selectedImpactReport, setSelectedImpactReport] = useState<EnvironmentalImpactReportType | null>(null);
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

  return (
    <AppLayout
      title="Environmental Intelligence"
      subtitle="Orion Refining Complex · Facility Unit 04"
      onRefresh={() => loadData(true)}
      isRefreshing={refreshing}
    >
      <div className="space-y-6 text-[#F1F3EE]">
        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        {/* ── 0. HOME HERO STATEMENT & DEFINITION (Phase 2) ────────── */}
        <div className="p-6 rounded-lg bg-[#0E1110] border border-[#242A27] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A8C83A]" />
              <span className="text-[10px] font-mono tracking-widest text-[#A8C83A] uppercase font-bold">
                COMMUNITY-TO-INDUSTRY ACCOUNTABILITY NETWORK
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-[#929A95] border border-[#242A27]">
                DEMO DATA · SIMULATED TELEMETRY
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EE]">
              A community report becomes verified environmental action.
            </h1>
            <p className="text-xs text-[#929A95] font-sans leading-relaxed">
              ONER turns community pollution reports into evidence-backed environmental action.
              Six independent evidence strands fuse with industrial telemetry to identify root cause,
              trigger engineering intervention, and verify environmental abatement under ISO 14064 MRV standards.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/case/COMM-2026-00421"
              className="px-3.5 py-2 rounded bg-[#141817] hover:bg-[#1D2320] border border-[#A8C83A]/60 text-xs font-mono font-bold text-[#A8C83A] hover:text-[#C4DF61] transition-all flex items-center gap-1.5"
            >
              <span>INSPECT SEEDED CASE</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* ── PRIMARY VISUAL: THE CONVERGENCE CHAIN ─────────────── */}
        <ConvergenceChain
          caseId="COMM-2026-00421"
          corroborationScore={89.4}
          anomalyScore={0.884}
          rootCauseConfidence={99.4}
        />

        {/* ── 1. ENTERPRISE HEADER STRIP (Section 7) ───────────── */}
        <div className="p-5 rounded-lg bg-[#0E1110] border border-[#242A27] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#A8C83A] uppercase font-bold">
                ONER • ENVIRONMENTAL INTELLIGENCE
              </span>
              <span className="text-[#626A65] font-mono">•</span>
              <span className="text-[10px] font-mono text-[#929A95]">
                FACILITY CONTROL DESK
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EE]">
                Orion Refining Complex
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                STATUS: OPERATIONAL / AT RISK
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ScoreDefinitions variant="button-modal" />
            <Link
              href="/report"
              className="px-3.5 py-1.5 rounded bg-[#141817] hover:bg-[#1a221e] border border-[#A8C83A]/50 text-xs font-mono font-bold text-[#A8C83A] transition-colors flex items-center gap-1.5"
            >
              <span>+ FILE CITIZEN REPORT</span>
            </Link>
          </div>
        </div>

        {/* ── 2. MAIN KPI & AUTONOMOUS BRIEFING (Section 7) ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Main KPI: ENVIRONMENTAL HEALTH 87.3 */}
          <div className="lg:col-span-4 p-6 rounded-lg bg-[#0E1110] border border-[#242A27] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-xs font-semibold tracking-tight text-[#929A95] uppercase">
                  ENVIRONMENTAL HEALTH INDEX
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25 font-bold">
                  ATTENTION / AT RISK
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-6xl font-bold font-mono tracking-tight text-[#A8C83A]">
                  87.3
                </span>
                <span className="text-[#626A65] font-mono text-sm">/ 100</span>
              </div>

              <div className="text-xs font-semibold text-[#F1F3EE] mt-2">
                Operational Environmental Score
              </div>
              <p className="text-[11px] text-[#929A95] mt-1 leading-relaxed">
                Deterministic aggregate score: 100 - Σ(weighted deviation from 30-day baseline). Penalized primarily by Furnace F-101 NOx drift (+31.4%) and thermal degradation.
              </p>
            </div>

            {/* Sub-component metrics row */}
            <div className="mt-5 pt-3.5 border-t border-[#242A27] grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-[10px] text-[#929A95] font-medium">CO₂e</div>
                <div className="text-xs font-mono font-semibold text-[#F1F3EE] mt-0.5">124.6t</div>
              </div>
              <div>
                <div className="text-[10px] text-[#929A95] font-medium">Energy</div>
                <div className="text-xs font-mono font-semibold text-[#F1F3EE] mt-0.5">28.8 MWh</div>
              </div>
              <div>
                <div className="text-[10px] text-[#929A95] font-medium">Water</div>
                <div className="text-xs font-mono font-semibold text-[#F1F3EE] mt-0.5">64.0 m³</div>
              </div>
              <div>
                <div className="text-[10px] text-[#929A95] font-medium">Air Risk</div>
                <div className="text-xs font-mono font-semibold text-amber-400 mt-0.5">HIGH NOx</div>
              </div>
            </div>
          </div>

          {/* ONER AUTONOMOUS BRIEFING */}
          <div className="lg:col-span-8 p-6 rounded-xl bg-[#0E1110] border border-[#242A27] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#A8C83A]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F1F3EE]">
                    ONER Autonomous Briefing
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#929A95]">
                  MODEL: Isolation Forest · Causal Root Cause Engine
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-[#F1F3EE] leading-snug">
                  Elevated NOx detected around Furnace F-101. Community report COMM-2026-00421 corroborates the signal. Recommended intervention is expected to reduce emissions.
                </h3>
                <p className="text-xs text-[#929A95] mt-2 leading-relaxed">
                  CEMS optical density spiked simultaneously with citizen observations at the Sector 4 perimeter. Isolation Forest anomaly magnitude is 0.884 (High Deviation). Root-Cause Confidence is 99.4% pointing to thermal efficiency degradation on Burner F-101B.
                </p>
              </div>

              {/* 4-Column Causal Matrix */}
              <div className="mt-4 p-3 rounded-lg bg-[#080A09] border border-[#242A27] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-[#929A95] uppercase font-sans">1. What Happened?</div>
                  <div className="font-mono text-amber-400 mt-0.5 font-bold">NOx +31.4% (131.4 mg)</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#929A95] uppercase font-sans">2. Why Did It Happen?</div>
                  <div className="font-sans text-zinc-200 mt-0.5">Burner trim drift (0.94)</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#929A95] uppercase font-sans">3. What To Do?</div>
                  <div className="font-mono text-[#A8C83A] mt-0.5 font-bold">Damper Trim 1.042</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#929A95] uppercase font-sans">4. Projected Result</div>
                  <div className="font-mono text-emerald-400 mt-0.5 font-bold">↓ 14.2 tCO₂e / day</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#242A27] flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-[#929A95]">
                Corroborated Case: <strong className="text-zinc-200 font-mono">COMM-2026-00421</strong> (89.4% Confidence)
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/investigation"
                  className="px-3 py-1.5 rounded-lg bg-[#141817] hover:bg-[#1a221e] border border-[#242A27] text-xs font-medium text-zinc-200 hover:text-white transition-colors"
                >
                  Investigate Anomaly
                </Link>
                <Link
                  href="/industry"
                  className="px-3 py-1.5 rounded-lg bg-[#141817] hover:bg-[#1a221e] border border-[#A8C83A]/40 text-xs font-medium text-[#A8C83A] hover:text-[#C4DF61] transition-colors flex items-center gap-1"
                >
                  <span>Execute Industry Action</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. CLEAN KPI STRIP (CO₂e, Energy, Water, Air Quality) ── */}
        <div className="rounded-xl bg-[#0E1110] border border-[#242A27] overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#242A27]">
            {/* KPI: CO₂e */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#929A95] mb-1">
                <span className="font-medium text-zinc-300">CO₂e Emissions</span>
                <Cloud size={14} className="text-[#929A95]" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
                  {kpis?.co2_tonnes?.value?.toFixed(1) || '124.6'}
                </span>
                <span className="text-xs font-mono text-[#929A95]">t CO₂e/7d</span>
              </div>
              <div className="mt-2 flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                <TrendingDown size={12} />
                <span>-0.2%</span>
                <span className="text-[#929A95] font-sans text-[10px] ml-1">vs 7d avg</span>
              </div>
            </div>

            {/* KPI: Energy */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#929A95] mb-1">
                <span className="font-medium text-zinc-300">Electrical Energy</span>
                <Zap size={14} className="text-[#929A95]" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
                  {kpis?.electricity_kwh?.value ? (kpis.electricity_kwh.value / 1000).toFixed(1) : '28.8'}
                </span>
                <span className="text-xs font-mono text-[#929A95]">MWh/day</span>
              </div>
              <div className="mt-2 flex items-center gap-1 font-mono text-[11px] text-zinc-400">
                <TrendingDown size={12} />
                <span>-0.6%</span>
                <span className="text-[#929A95] font-sans text-[10px] ml-1">nominal</span>
              </div>
            </div>

            {/* KPI: Water */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#929A95] mb-1">
                <span className="font-medium text-zinc-300">Water Consumption</span>
                <Droplets size={14} className="text-[#929A95]" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
                  {kpis?.water_liters?.value ? (kpis.water_liters.value / 1000).toFixed(1) : '64.0'}
                </span>
                <span className="text-xs font-mono text-[#929A95]">m³/day</span>
              </div>
              <div className="mt-2 flex items-center gap-1 font-mono text-[11px] text-teal-400">
                <TrendingUp size={12} />
                <span>81.2%</span>
                <span className="text-[#929A95] font-sans text-[10px] ml-1">recirculation</span>
              </div>
            </div>

            {/* KPI: Air Quality */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#929A95] mb-1">
                <span className="font-medium text-zinc-300">Air Quality</span>
                <Wind size={14} className="text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-sans tracking-tight text-amber-400">
                  MODERATE
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1 font-mono text-[11px] text-amber-400">
                <TrendingUp size={12} />
                <span>NOx: 131.4 mg</span>
                <span className="text-[#929A95] font-sans text-[10px] ml-1">(+31.4% excess)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. ENVIRONMENTAL TRAJECTORY (Section 7) ─────────── */}
        <div className="p-6 rounded-xl bg-[#0E1110] border border-[#242A27]">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <div className="text-[10px] font-mono text-[#929A95] uppercase tracking-wider">
                LONGITUDINAL EMISSIONS TELEMETRY
              </div>
              <h2 className="text-base font-bold text-[#F1F3EE] mt-0.5">
                Environmental Trajectory & Production Alignment
              </h2>
            </div>

            {/* Restrained Signal Selector */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#080A09] border border-[#242A27]">
              <button
                onClick={() => setActiveSignal('co2')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  activeSignal === 'co2'
                    ? 'bg-[#141817] text-[#A8C83A] font-bold border border-[#A8C83A]/40'
                    : 'text-[#929A95] hover:text-[#F1F3EE]'
                }`}
              >
                CO₂e (t)
              </button>
              <button
                onClick={() => setActiveSignal('energy')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  activeSignal === 'energy'
                    ? 'bg-[#141817] text-[#A8C83A] font-bold border border-[#A8C83A]/40'
                    : 'text-[#929A95] hover:text-[#F1F3EE]'
                }`}
              >
                Energy (MWh)
              </button>
              <button
                onClick={() => setActiveSignal('production')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  activeSignal === 'production'
                    ? 'bg-[#141817] text-[#A8C83A] font-bold border border-[#A8C83A]/40'
                    : 'text-[#929A95] hover:text-[#F1F3EE]'
                }`}
              >
                Output (t)
              </button>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A8C83A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#A8C83A" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#71717a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#181E1C" />
                <XAxis
                  dataKey="date"
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
                  contentStyle={{
                    backgroundColor: '#0E1110',
                    borderColor: '#242A27',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                />
                {activeSignal === 'co2' && (
                  <Area
                    type="monotone"
                    dataKey="co2"
                    name="CO₂ (tonnes)"
                    stroke="#A8C83A"
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
                    stroke="#929A95"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#prodGrad)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── 5. ACTIVE CASES & RECENT MEASURED IMPACT (Section 7 & 8) ─ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Active Environmental Cases */}
          <div className="lg:col-span-7 p-5 rounded-xl bg-[#0E1110] border border-[#242A27] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#929A95]">
                    ACCOUNTABILITY PIPELINE
                  </div>
                  <h3 className="text-sm font-bold text-[#F1F3EE]">
                    Active Environmental Cases ({communityReports.length})
                  </h3>
                </div>
                <Link href="/community" className="text-xs font-mono text-[#A8C83A] hover:underline">
                  All Cases →
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
                          {rep.corroboration_score}% CORRELATED
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {rep.severity}
                        </span>
                      </div>
                      <div className="text-zinc-300 font-medium truncate">{rep.title}</div>
                      <div className="text-[11px] text-[#929A95] font-mono truncate">
                        {rep.correlated_facility} &bull; {rep.likely_source}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Link
                        href={`/case/${rep.id}`}
                        className="px-2.5 py-1.5 rounded bg-[#141817] hover:bg-[#1f2622] border border-[#242A27] text-[11px] font-mono text-[#F1F3EE] hover:text-[#A8C83A] transition-colors"
                      >
                        Case
                      </Link>
                      {rep.environmental_impact_report ? (
                        <button
                          type="button"
                          onClick={() => setSelectedImpactReport(rep.environmental_impact_report || null)}
                          className="px-2.5 py-1.5 rounded bg-[#141817] hover:bg-[#1a221f] border border-[#A8C83A]/40 text-[11px] font-mono text-[#A8C83A] font-semibold transition-colors cursor-pointer"
                        >
                          MRV Audit
                        </button>
                      ) : (
                        <Link
                          href={`/industry?case=${rep.id}`}
                          className="px-2.5 py-1.5 rounded bg-[#141817] hover:bg-[#1f2622] border border-[#242A27] text-[11px] font-mono text-[#929A95] transition-colors"
                        >
                          Inspect
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#242A27] flex items-center justify-between text-xs text-[#929A95]">
              <span>Citizen Evidence Fused with Physical CEMS Telemetry</span>
              <span className="font-mono text-[11px]">Orion Unit 04</span>
            </div>
          </div>

          {/* Recent Measured Impact */}
          <div className="lg:col-span-5 p-5 rounded-xl bg-[#0E1110] border border-[#242A27] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#929A95]">
                    VERIFIED OUTCOMES
                  </div>
                  <h3 className="text-sm font-bold text-[#F1F3EE]">
                    Recent Measured Environmental Impact
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30">
                  MRV-READY
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-[#080A09] border border-[#242A27]">
                  <div className="text-[10px] uppercase font-mono text-[#929A95]">CO₂e Reduction</div>
                  <div className="text-lg font-mono font-bold text-[#A8C83A] mt-0.5">↓ 14.2 t/day</div>
                  <div className="text-[10px] text-[#626A65] font-mono mt-0.5">5,183 tCO₂e / year</div>
                </div>

                <div className="p-3 rounded-lg bg-[#080A09] border border-[#242A27]">
                  <div className="text-[10px] uppercase font-mono text-[#929A95]">NOx Reduction</div>
                  <div className="text-lg font-mono font-bold text-[#A8C83A] mt-0.5">↓ 28.6 kg/day</div>
                  <div className="text-[10px] text-[#626A65] font-mono mt-0.5">Normalized to 88.5 mg</div>
                </div>

                <div className="p-3 rounded-lg bg-[#080A09] border border-[#242A27]">
                  <div className="text-[10px] uppercase font-mono text-[#929A95]">Cases Resolved</div>
                  <div className="text-lg font-mono font-bold text-[#F1F3EE] mt-0.5">1 Resolved</div>
                  <div className="text-[10px] text-[#626A65] font-mono mt-0.5">Case COMM-2026-00421</div>
                </div>

                <div className="p-3 rounded-lg bg-[#080A09] border border-[#242A27]">
                  <div className="text-[10px] uppercase font-mono text-[#929A95]">Efficiency Recovery</div>
                  <div className="text-lg font-mono font-bold text-teal-400 mt-0.5">+2.45%</div>
                  <div className="text-[10px] text-[#626A65] font-mono mt-0.5">Thermal optimization</div>
                </div>
              </div>

              <p className="text-[11px] text-[#929A95] mt-3 leading-relaxed">
                Post-action measurement period confirmed stable NOx levels below the 100 mg/Nm³ pact threshold following Damper Trim 1.042.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#242A27]">
              <button
                type="button"
                onClick={() => {
                  const target = communityReports.find((r) => r.id === 'COMM-2026-00421') || communityReports[0];
                  setSelectedImpactReport(target?.environmental_impact_report || null);
                }}
                className="w-full py-2 px-3 rounded-lg bg-[#141817] hover:bg-[#1c221e] border border-[#A8C83A]/50 text-xs font-mono font-bold text-[#A8C83A] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileCheck2 size={13} />
                <span>INSPECT FULL ENVIRONMENTAL IMPACT REPORT (COMM-2026-00421)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 6. EVIDENCE TRUST LAYER DEMONSTRATION ────────────── */}
        <EvidenceTrustLayer
          reportId="COMM-2026-00421"
          hasPhoto={true}
          photoQuality="HIGH"
          photoProvenance="UNKNOWN"
          hasGps={true}
          gpsAccuracyMeters={12}
          facilityProximity="380m from Furnace F-101 Stack"
          telemetryAnomalyDetected={true}
          historicalDeviationDetected={true}
          overallQuality="HIGH"
        />

        {/* Environmental Impact Report Modal */}
        <EnvironmentalImpactReportModal
          report={selectedImpactReport}
          onClose={() => setSelectedImpactReport(null)}
        />
      </div>
    </AppLayout>
  );
}
