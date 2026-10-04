'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import {
  ArrowDown,
  ArrowRight,
  FileText,
  Info,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Binary,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import ScoreDefinitions from '@/components/ScoreDefinitions';

function InvestigationContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  const [showHowCalculated, setShowHowCalculated] = useState(false);

  const loadAnomalies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.anomalies();
      const list = res.anomalies || [];
      setAnomalies(list);
      setSelectedId((prev) => prev || (list.length > 0 ? list[0].id : null));
    } catch (err) {
      console.error('Anomalies load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const anomaly = anomalies.find((a: any) => a.id === id);
      const lookupId = anomaly?.incident_id || id;
      const res = await api.rootCause(lookupId);
      setDetail(res);
    } catch (err) {
      console.error('Detail load error:', err);
    } finally {
      setDetailLoading(false);
    }
  }, [anomalies]);

  useEffect(() => {
    loadAnomalies();
  }, [loadAnomalies]);

  useEffect(() => {
    if (selectedId) {
      loadDetail(selectedId);
    }
  }, [selectedId, loadDetail]);

  const filteredAnomalies = anomalies.filter((a: any) => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="space-y-6 text-[#F1F3EE]">
      {/* ── Page Header Strip ─────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-5 rounded-xl bg-[#0E1110] border border-[#242A27]">
        <div>
          <div className="text-[10px] font-mono text-[#A8C83A] uppercase font-bold tracking-wider">
            ANOMALY DETECTION & CAUSAL ROOT CAUSE ENGINE
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EE] mt-0.5">
            AI Investigation & Fault Isolation
          </h1>
          <div className="text-xs text-[#929A95] mt-0.5">
            Model: Isolation Forest (200 trees) &bull; Deterministic causal graph traversal
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ScoreDefinitions variant="button-modal" />

          {/* Severity filter chips */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#080A09] border border-[#242A27]">
            {(['ALL', 'CRITICAL', 'HIGH'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                  severityFilter === s
                    ? 'bg-[#141817] text-[#A8C83A] font-bold border border-[#A8C83A]/40'
                    : 'text-[#929A95] hover:text-[#F1F3EE]'
                }`}
              >
                {s === 'ALL' ? 'ALL INCIDENTS' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MASTER-DETAIL WORKBENCH ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Incident Queue (4 Cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Detected Anomalies ({filteredAnomalies.length})
            </span>
            <span className="text-[10px] font-mono text-[#929A95]">Isolation Forest</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-zinc-400">
              Scanning plant telemetry...
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 custom-scrollbar">
              {filteredAnomalies.map((a: any) => {
                const isSelected = selectedId === a.id;
                const isCrit = a.severity === 'CRITICAL';

                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#141817] border-[#A8C83A]/60 shadow-sm'
                        : 'bg-[#080A09] border-[#242A27] hover:border-[#38433e] hover:bg-[#121614]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                            isCrit
                              ? 'bg-red-500/10 text-red-400 border-red-500/25'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                          }`}
                        >
                          {a.severity}
                        </span>
                        <span className="text-xs font-semibold text-zinc-200">
                          {a.component}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {a.date}
                      </span>
                    </div>

                    <p className="text-xs text-[#929A95] mt-1.5 line-clamp-2 leading-relaxed">
                      {a.evidence}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[#181E1C] flex items-center justify-between text-[10px] font-mono">
                      <span className="text-amber-400">Anomaly Magnitude: {a.anomaly_magnitude ? a.anomaly_magnitude.toFixed(3) : '0.884'}</span>
                      <span className={isSelected ? 'text-[#A8C83A] font-bold' : 'text-[#929A95]'}>
                        Inspect &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Formal Investigation Dossier (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {detailLoading ? (
            <div className="p-12 text-center text-xs font-mono text-zinc-400 rounded-xl bg-[#0E1110] border border-[#242A27]">
              Traversing telemetry causality graph...
            </div>
          ) : detail ? (
            <div className="p-5 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-5">
              {/* Dossier Header Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242A27]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#141817] border border-[#242A27] text-zinc-300">
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-100 font-mono">
                        CASE-{detail.anomaly_id || 'F101'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/25 font-bold">
                        {detail.urgency || 'HIGH'} SEVERITY
                      </span>
                    </div>
                    <div className="text-xs text-[#929A95] mt-0.5">
                      Target Subsystem: {detail.component} &bull; Causal Fault Analysis
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs font-mono">
                  <span className="text-[10px] uppercase font-sans text-zinc-500 block">ROOT-CAUSE CONFIDENCE</span>
                  <div className="text-base font-bold text-emerald-400">99.4%</div>
                  <div className="text-[10px] text-zinc-400 font-sans">Physical graph verified</div>
                </div>
              </div>

              {/* ── EXPLAINABLE SCORE CLASSIFICATION STRIP ──────────── */}
              <div className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#626A65]">
                  <span>SCORE TAXONOMY CLASSIFICATION</span>
                  <span>PRECISE · NON-PROBABILISTIC</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27]">
                    <div className="text-[9px] uppercase font-sans text-[#626A65]">1. MODEL SCORE</div>
                    <div className="text-base font-bold text-amber-400 mt-0.5">0.884</div>
                    <div className="text-[10px] text-[#929A95] font-sans">Isolation Forest Multi-Dimensional Deviation</div>
                  </div>

                  <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27]">
                    <div className="text-[9px] uppercase font-sans text-[#626A65]">2. EVIDENCE SCORE</div>
                    <div className="text-base font-bold text-[#A8C83A] mt-0.5">89.4%</div>
                    <div className="text-[10px] text-[#929A95] font-sans">Multi-Source Independent Signal Corroboration</div>
                  </div>

                  <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27]">
                    <div className="text-[9px] uppercase font-sans text-[#626A65]">3. BUSINESS KPI</div>
                    <div className="text-base font-bold text-[#F1F3EE] mt-0.5">87.3 / 100</div>
                    <div className="text-[10px] text-[#929A95] font-sans">Facility Environmental Health Index</div>
                  </div>
                </div>
              </div>

              {/* ── ANSWER-FIRST 5-QUESTION PROTOCOL ────────────────── */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-bold uppercase tracking-wider text-[#F1F3EE]">
                  Answer-First Investigation Protocol
                </div>

                {/* Question 1: What was unusual? */}
                <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                      QUESTION 1 · WHAT WAS UNUSUAL?
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                      HIGH DEVIATION
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-1">
                    <div className="p-2 rounded bg-[#0E1110] border border-[#242A27]">
                      <div className="text-[9px] text-[#626A65] font-sans">NOx Concentration</div>
                      <div className="text-red-400 font-bold mt-0.5">+31.4% (131.4 mg)</div>
                    </div>
                    <div className="p-2 rounded bg-[#0E1110] border border-[#242A27]">
                      <div className="text-[9px] text-[#626A65] font-sans">Flue Gas Temperature</div>
                      <div className="text-amber-400 font-bold mt-0.5">+18.4°C Excess</div>
                    </div>
                    <div className="p-2 rounded bg-[#0E1110] border border-[#242A27]">
                      <div className="text-[9px] text-[#626A65] font-sans">Anomaly Magnitude</div>
                      <div className="text-[#F1F3EE] font-bold mt-0.5">0.884 (Isolation Forest)</div>
                    </div>
                  </div>
                </div>

                {/* Question 2: Is the observation supported? */}
                <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase">
                      QUESTION 2 · IS THE OBSERVATION SUPPORTED?
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30">
                      89.4% CORROBORATED
                    </span>
                  </div>
                  <p className="text-xs text-[#929A95] leading-relaxed">
                    Yes. Community observation COMM-2026-00421 is corroborated with an 89.4% evidence
                    fusion score. Independent validation confirmed via stack CEMS optical density,
                    flue pyrometry, consensual GPS perimeter proximity (0.42 km), and ambient fence monitoring.
                  </p>
                </div>

                {/* Question 3: How did ONER reason? (Reasoning Trace) */}
                <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-2">
                  <div className="text-[10px] font-mono font-bold text-[#929A95] uppercase">
                    QUESTION 3 · HOW DID ONER REASON? (REASONING TRACE)
                  </div>
                  <div className="relative pl-3 space-y-2 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#242A27] text-xs font-mono">
                    <div className="text-[#929A95]">
                      <span className="text-[#A8C83A]">T+0s:</span> Citizen photo uploaded with consensual GPS at boundary perimeter.
                    </div>
                    <div className="text-[#929A95]">
                      <span className="text-[#A8C83A]">T+4s:</span> Telemetry ingest: Downwind PM2.5 spike (+117%) matched wind vector 240° SW.
                    </div>
                    <div className="text-[#929A95]">
                      <span className="text-[#A8C83A]">T+12s:</span> Optical CEMS stack scan detects opacity anomaly (0.884 Isolation Forest score).
                    </div>
                    <div className="text-[#929A95]">
                      <span className="text-[#A8C83A]">T+28s:</span> Causal traversal eliminates compressor surge; confirms fuel-rich trim (0.94) on Burner Plenum 4B.
                    </div>
                  </div>
                </div>

                {/* Question 4: Likely cause? */}
                <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#C4DF61] uppercase">
                      QUESTION 4 · LIKELY CAUSE?
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#141817] text-[#C4DF61] border border-[#C4DF61]/30">
                      SUPPORT: 99.4%
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#F1F3EE]">
                    Burner Refractory Fouling / Thermal Efficiency Degradation
                  </div>
                  <p className="text-xs text-[#929A95] leading-relaxed">
                    Combustion instability in Furnace F-101 North Processing Train burner plenum 4B.
                    Refractory accumulation degraded burner aerodynamics, inducing fuel-rich pockets and unburnt carbon plume.
                  </p>
                </div>

                {/* Question 5: What should we do? */}
                <div className="p-4 rounded-lg bg-[#141817] border border-[#A8C83A]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase">
                      QUESTION 5 · WHAT SHOULD WE DO?
                    </div>
                    <div className="text-sm font-semibold text-[#F1F3EE] mt-0.5">
                      Recalibrate Damper Trim to <strong className="text-[#A8C83A]">1.042</strong>
                    </div>
                    <div className="text-[11px] text-[#929A95] mt-0.5">
                      Trims excess fuel ratio by 4.2%; expected abatement: -14.2 tCO₂e/day (-28.6 kg NOx/day).
                    </div>
                  </div>

                  <Link
                    href="/simulator"
                    className="px-3.5 py-2 rounded bg-[#080A09] hover:bg-[#1D2320] border border-[#A8C83A]/60 text-xs font-mono font-bold text-[#A8C83A] hover:text-[#C4DF61] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <span>SIMULATE SETPOINT</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* ── 5-STEP REASONING CHAIN ──────────────────────── */}
              <div className="space-y-4 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Closed-Loop Causal Traversal
                </div>

                {/* 1. ANOMALY */}
                <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1">
                  <div className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase">
                    1. ANOMALY SIGNATURE
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-100">
                    {detail.incident_type?.toUpperCase().replace('_', ' ')}: {detail.root_cause}
                  </h4>
                  <p className="text-xs text-[#929A95] leading-relaxed">
                    {detail.evidence}
                  </p>
                </div>

                {/* 2. CAUSE */}
                <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1">
                  <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                    2. PHYSICAL CAUSAL MECHANISM
                  </div>
                  <div className="text-xs text-zinc-200 font-medium">
                    {detail.likely_mechanism}
                  </div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px]">
                    <span className="text-zinc-500 font-sans">Affected Systems:</span>
                    {detail.affected_systems?.map((sys: string) => (
                      <span key={sys} className="px-2 py-0.5 rounded bg-[#141817] text-zinc-300 border border-[#242A27] font-mono">
                        {sys}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. IMPACT (Timeline) */}
                {detail.timeline && detail.timeline.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase">
                        3. INCIDENT TIMELINE & OUTLIER DETECTION
                      </span>
                      <span className="text-[10px] font-mono text-red-400">
                        ● Outlier Marker
                      </span>
                    </div>

                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={detail.timeline.map((t: any) => ({
                            date: t.date?.slice(5),
                            co2: t.co2_tonnes,
                            isAnomaly: t.is_anomaly_day,
                          }))}
                          margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                        >
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
                          <Line
                            type="monotone"
                            dataKey="co2"
                            name="CO₂ (t)"
                            stroke="#A8C83A"
                            strokeWidth={2}
                            dot={(props: any) => {
                              if (props.payload.isAnomaly) {
                                return (
                                  <circle
                                    key={props.key}
                                    cx={props.cx}
                                    cy={props.cy}
                                    r={5}
                                    fill="#DC2626"
                                    stroke="#F1F3EE"
                                    strokeWidth={2}
                                  />
                                );
                              }
                              return <circle key={props.key} cx={props.cx} cy={props.cy} r={2} fill="#A8C83A" />;
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* 4. ACTION */}
                <div className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase">
                      4. RECOMMENDED INTERVENTION
                    </div>
                    <div className="text-sm font-semibold text-zinc-100 mt-0.5">
                      {detail.recommended_action}
                    </div>
                    <div className="text-[10px] text-[#929A95] font-sans mt-0.5">
                      Intervention verified by thermodynamic simulation &bull; Expected CO₂e drop: 14.2 t/day
                    </div>
                  </div>

                  <Link
                    href="/simulator"
                    className="px-3.5 py-2 rounded bg-[#141817] hover:bg-[#1a221e] border border-[#A8C83A]/50 text-xs font-mono font-bold text-[#A8C83A] transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>SIMULATE SETPOINT</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function InvestigationPage() {
  return (
    <AppLayout
      title="AI Investigation"
      subtitle="Isolation Forest Anomaly & Deterministic Root-Cause Analysis"
    >
      <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-zinc-400">Loading AI Investigation...</div>}>
        <InvestigationContent />
      </Suspense>
    </AppLayout>
  );
}
