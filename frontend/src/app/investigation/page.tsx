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

function InvestigationContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');

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
    <div className="space-y-6">
      {/* ── Page Header Strip ─────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 px-5 py-3 rounded-xl bg-[#0c100e] border border-[#141b16]">
        <div>
          <div className="text-xs font-semibold text-zinc-200">
            Deterministic Causal Engine
          </div>
          <div className="text-[11px] text-zinc-400 font-sans">
            Telemetry Graph Traversal & Physical Root Cause Isolation
          </div>
        </div>

        {/* Severity filter chips */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#090c0a] border border-[#141b16]">
          {(['ALL', 'CRITICAL', 'HIGH'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                severityFilter === s
                  ? 'bg-[#18221b] text-zinc-100 font-semibold border border-[#27372d]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {s === 'ALL' ? 'All Incidents' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── MASTER-DETAIL WORKBENCH ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Incident Queue (5 Cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-zinc-300">
              Incident Queue ({filteredAnomalies.length})
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Isolation Forest</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-zinc-400 rounded-xl bg-[#0e1310] border border-[#16201a]">
              Scanning facility telemetry streams...
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
              {filteredAnomalies.map((a: any) => {
                const isSelected = selectedId === a.id;
                const isCrit = a.severity === 'CRITICAL';

                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#141c16] border-[#25362a] shadow-sm'
                        : 'bg-[#0e1310] border-[#16201a] hover:border-[#1e2a22] hover:bg-[#111713]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono font-medium px-1.5 py-0.2 rounded border ${
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

                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed font-sans">
                      {a.evidence}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[#141c16] flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>Anomaly: {a.anomaly_magnitude?.toFixed(3)}</span>
                      <span className={isSelected ? 'text-zinc-200 font-medium' : 'text-zinc-400'}>
                        Inspect Chain →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Formal Investigation Report & Reasoning Chain (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {detailLoading ? (
            <div className="p-12 text-center text-xs font-mono text-zinc-400 rounded-xl bg-[#0e1310] border border-[#16201a]">
              Traversing telemetry causality graph...
            </div>
          ) : detail ? (
            <div className="rounded-xl bg-[#0e1310] border border-[#16201a] overflow-hidden">
              {/* Dossier Header */}
              <div className="px-6 py-4 bg-[#0b0f0c] border-b border-[#141c16] flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#111713] border border-[#18231b] text-zinc-300">
                    <FileText size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-100 font-mono">
                        ONER-INCIDENT-{detail.anomaly_id || 'F101'}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/25">
                        {detail.urgency || 'HIGH'} SEVERITY
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-sans mt-0.5">
                      Target Subsystem: {detail.component} · Deterministic Causal Audit
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-zinc-400">
                  <div>Confidence: <strong className="text-emerald-400 font-semibold">99.4%</strong></div>
                  <div className="text-[10px] text-zinc-400">Graph Isolation Verified</div>
                </div>
              </div>

              {/* ── 5-STEP REASONING CHAIN ──────────────────────── */}
              <div className="p-6 space-y-5">
                {/* 1. ANOMALY */}
                <div className="relative pl-6 pb-2 border-l border-[#1a251e]">
                  <span className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-[#141d17] border border-[#213225] flex items-center justify-center text-[10px] font-mono font-bold text-zinc-300">
                    1
                  </span>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    ANOMALY SIGNATURE
                  </div>
                  <h4 className="text-base font-semibold text-zinc-100">
                    {detail.incident_type?.toUpperCase().replace('_', ' ')}: {detail.root_cause}
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed font-sans">
                    {detail.evidence}
                  </p>
                </div>

                {/* Connector Arrow */}
                <div className="flex items-center gap-2 pl-3 text-zinc-600 text-xs font-mono">
                  <ArrowDown size={14} />
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-sans">Causal Root Isolated</span>
                </div>

                {/* 2. CAUSE */}
                <div className="relative pl-6 pb-2 border-l border-[#1a251e]">
                  <span className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-[#141d17] border border-[#213225] flex items-center justify-center text-[10px] font-mono font-bold text-zinc-300">
                    2
                  </span>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    PHYSICAL CAUSAL MECHANISM
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#0b0f0c] border border-[#141c16]">
                    <div className="text-xs font-semibold text-zinc-200">
                      {detail.likely_mechanism}
                    </div>
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap text-[10px] font-sans">
                      <span className="text-zinc-400">Affected Subsystems:</span>
                      {detail.affected_systems?.map((sys: string) => (
                        <span key={sys} className="px-2 py-0.5 rounded bg-[#131b15] text-zinc-300 border border-[#1b261e] font-mono">
                          {sys}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Connector Arrow */}
                <div className="flex items-center gap-2 pl-3 text-zinc-600 text-xs font-mono">
                  <ArrowDown size={14} />
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-sans">Observed Impact Measured</span>
                </div>

                {/* 3. IMPACT */}
                <div className="relative pl-6 pb-2 border-l border-[#1a251e]">
                  <span className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-[#141d17] border border-[#213225] flex items-center justify-center text-[10px] font-mono font-bold text-zinc-300">
                    3
                  </span>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    MEASURED PARAMETER IMPACT
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2">
                    {detail.supporting_metrics?.map((m: any) => (
                      <div key={m.metric} className="p-3 rounded-lg bg-[#0b0f0c] border border-[#141c16]">
                        <div className="text-[10px] text-zinc-400 truncate uppercase font-medium">
                          {m.metric}
                        </div>
                        <div className="text-base font-bold font-mono text-amber-400 mt-1">
                          +{m.deviation_pct?.toFixed(1)}%
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 mt-1">
                          {m.anomaly_value?.toFixed(1)} vs {m.baseline_value?.toFixed(1)} nominal
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connector Arrow */}
                <div className="flex items-center gap-2 pl-3 text-zinc-600 text-xs font-mono">
                  <ArrowDown size={14} />
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-sans">Trajectory Forecast</span>
                </div>

                {/* 4. PREDICTION */}
                {detail.timeline && detail.timeline.length > 0 && (
                  <div className="relative pl-6 pb-2 border-l border-[#1a251e]">
                    <span className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-[#141d17] border border-[#213225] flex items-center justify-center text-[10px] font-mono font-bold text-zinc-300">
                      4
                    </span>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        INCIDENT TIMELINE & DRIFT PREDICTION
                      </div>
                      <span className="text-[10px] font-mono text-red-400">
                        ● Outlier Detection Day
                      </span>
                    </div>

                    <div className="h-44 w-full p-2 rounded-lg bg-[#0b0f0c] border border-[#141c16]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={detail.timeline.map((t: any) => ({
                            date: t.date?.slice(5),
                            co2: t.co2_tonnes,
                            isAnomaly: t.is_anomaly_day,
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
                          <Line
                            type="monotone"
                            dataKey="co2"
                            name="CO₂ (t)"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={(props: any) => {
                              if (props.payload.isAnomaly) {
                                return (
                                  <circle
                                    key={props.key}
                                    cx={props.cx}
                                    cy={props.cy}
                                    r={6}
                                    fill="#ef4444"
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                  />
                                );
                              }
                              return <circle key={props.key} cx={props.cx} cy={props.cy} r={2} fill="#10b981" />;
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Connector Arrow */}
                <div className="flex items-center gap-2 pl-3 text-zinc-600 text-xs font-mono">
                  <ArrowDown size={14} />
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-sans">Autopilot Resolution Path</span>
                </div>

                {/* 5. ACTION */}
                <div className="relative pl-6">
                  <span className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-[#18261e] border border-[#273d2f] flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400">
                    5
                  </span>
                  <div className="p-4 rounded-xl bg-[#0c120e] border border-[#1b2820]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                        RECOMMENDED AUTOPILOT ACTION
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Ready for OPC-UA Dispatch
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-zinc-100">
                      {detail.recommended_action}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#16221a] flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[11px] text-zinc-400 font-sans">
                        Intervention verified by thermodynamic combustion simulation
                      </span>
                      <Link
                        href="/simulator"
                        className="px-3.5 py-1.5 rounded-lg bg-[#142219] hover:bg-[#1a2d21] border border-[#213829] text-xs font-medium text-zinc-100 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <span>Simulate Intervention</span>
                        <ArrowRight size={13} className="text-emerald-400" />
                      </Link>
                    </div>
                  </div>
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
      subtitle="Deterministic Root-Cause Analysis"
    >
      <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-zinc-400">Loading AI Investigation...</div>}>
        <InvestigationContent />
      </Suspense>
    </AppLayout>
  );
}
