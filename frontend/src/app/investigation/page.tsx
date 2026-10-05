'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AtmosphericShell from '@/components/shell/AtmosphericShell';
import HorizonLine, { HorizonLevel } from '@/components/primitives/HorizonLine';
import StateMark from '@/components/primitives/StateMark';
import DemoTag from '@/components/primitives/DemoTag';
import { ConvergenceChain, CompactChain, ReasoningTrace } from '@/components/chain';
import { api, CommunityReport } from '@/lib/api';
import { CANONICAL_CASE } from '@/lib/seed';
import {
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
  Activity,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

function InvestigationInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawCase = searchParams.get('case') || 'COMM-2026-00421';
  const caseId = rawCase.startsWith('COMM-2026-')
    ? rawCase
    : `COMM-2026-${rawCase.replace(/^COMM-2026-/, '').padStart(5, '0')}`;

  const [report, setReport] = useState<CommunityReport | null>(null);
  const [rootCauseData, setRootCauseData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load backend intelligence if available
  useEffect(() => {
    async function loadInvestigationData() {
      try {
        setLoading(true);
        // Try to fetch report and root-cause details
        try {
          const reportRes = await api.getCommunityReport(caseId);
          if (reportRes) setReport(reportRes);
        } catch (e) {
          console.warn('Report lookup fallback to canonical seed:', e);
        }

        try {
          // Attempt root cause lookup using default incident id or INC-004
          const rcRes = await api.rootCause('INC-004');
          if (rcRes) setRootCauseData(rcRes);
        } catch (e) {
          console.warn('Root cause lookup fallback to canonical logic:', e);
        }
      } catch (err) {
        console.warn('Investigation load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvestigationData();
  }, [caseId]);

  // Baseline distribution data for Question 1 Anomaly visualization
  const distributionData = [
    { score: 0.1, density: 4, baseline: 'Normal' },
    { score: 0.2, density: 12, baseline: 'Normal' },
    { score: 0.3, density: 38, baseline: 'Normal' },
    { score: 0.4, density: 72, baseline: 'Normal' },
    { score: 0.5, density: 95, baseline: 'Normal' },
    { score: 0.6, density: 55, baseline: 'Normal' },
    { score: 0.7, density: 24, baseline: 'Elevated' },
    { score: 0.8, density: 9, baseline: 'Anomaly Window' },
    { score: 0.884, density: 4, label: 'Current: 0.884', baseline: 'Critical Anomaly' },
    { score: 0.95, density: 1, baseline: 'Extreme' },
  ];

  return (
    <div
      className="min-h-screen flex flex-col bg-[#080A09] text-[#F1F3EE] transition-colors duration-300"
      data-atmosphere="control"
    >
      {/* ── Top 56px Global Command Bar ─────────────────────────── */}
      <AtmosphericShell />

      {/* ── Case Horizon Level Switcher ─────────────────────────── */}
      <div className="border-b border-[#242A27] bg-[#0E1110] select-none">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Breadcrumb back to Case */}
          <div className="flex items-center gap-2 font-mono text-xs text-[#929A95]">
            <Link
              href={`/case/${caseId}?level=control`}
              className="inline-flex items-center gap-1.5 text-[#F1F3EE] hover:text-[#A8C83A] transition-colors"
            >
              <ArrowLeft size={13} />
              <span>CASE {caseId}</span>
            </Link>
            <span>/</span>
            <span className="text-[#A8C83A] font-bold">INVESTIGATION INSTRUMENT</span>
          </div>

          {/* Level Switcher (CONTROL active) */}
          <div className="flex items-center gap-4">
            <HorizonLine
              activeLevel="control"
              onLevelChange={(lvl: HorizonLevel) => router.push(`/case/${caseId}?level=${lvl}`)}
            />
          </div>
        </div>
      </div>

      {/* ── Connected Intelligence Instruments Sub-Nav ─────────── */}
      <div className="border-b border-[#181E1C] bg-[#080A09] px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between overflow-x-auto py-2.5 text-xs font-mono">
          <div className="flex items-center gap-6 shrink-0">
            <span className="text-[#A8C83A] font-bold flex items-center gap-1.5 border-b-2 border-[#A8C83A] pb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A8C83A]" />
              <span>1. INVESTIGATE</span>
            </span>
            <Link
              href={`/simulator?case=${caseId}`}
              className="text-[#929A95] hover:text-[#F1F3EE] transition-colors pb-1"
            >
              2. SIMULATE
            </Link>
            <Link
              href={`/carbon?case=${caseId}`}
              className="text-[#929A95] hover:text-[#F1F3EE] transition-colors pb-1"
            >
              3. CARBON + MRV
            </Link>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#626A65]">
            <span>EQUIPMENT: Furnace F-101</span>
            <span>·</span>
            <span>FACILITY: Orion Refining Complex</span>
          </div>
        </div>
      </div>

      {/* ── Main Instrument Canvas ──────────────────────────────── */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-8 space-y-10">
        {/* Instrument Title & Primary Question */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#242A27]">
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-[#A8C83A] uppercase font-bold tracking-wider">
              ANSWER-FIRST SCIENTIFIC REASONING INSTRUMENT
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#F1F3EE] font-normal tracking-tight">
              What is ONER seeing, and why?
            </h1>
            <p className="text-xs sm:text-sm text-[#929A95]">
              Systematic anomaly decomposition across continuous stack CEMS telemetry, downwind ambient air, and deterministic causal domain rules.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/simulator?case=${caseId}`}
              className="px-4 py-2.5 rounded bg-[#141817] hover:bg-[#1D2320] border border-[#A8C83A]/60 text-xs font-mono font-bold text-[#A8C83A] flex items-center gap-2 transition-all shadow-sm"
            >
              <span>RUN SIMULATION</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* ── QUESTION 01: WHAT WAS UNUSUAL? ───────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-[2px] bg-[#141817] text-[#A8C83A] font-mono text-xs font-bold border border-[#A8C83A]/30">
              QUESTION 01
            </span>
            <h2 className="text-lg font-bold text-[#F1F3EE] tracking-tight">
              What Was Unusual?
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Primary Deviations (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-[#929A95]">
                Primary Sensor Deviations
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                  <div className="text-[10px] text-[#929A95] uppercase">NOx Concentration</div>
                  <div className="text-2xl font-bold text-[#F1F3EE]">+31.4%</div>
                  <div className="text-[10px] text-amber-400">131.4 mg/Nm³ (Limit: 100)</div>
                </div>

                <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                  <div className="text-[10px] text-[#929A95] uppercase">Flue Temperature</div>
                  <div className="text-2xl font-bold text-[#F1F3EE]">+18.4°C</div>
                  <div className="text-[10px] text-[#929A95]">Thermal exhaust delta</div>
                </div>

                <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                  <div className="text-[10px] text-[#929A95] uppercase">Air/Fuel Ratio</div>
                  <div className="text-2xl font-bold text-amber-400">0.94</div>
                  <div className="text-[10px] text-[#626A65]">Sub-stoichiometric</div>
                </div>

                <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                  <div className="text-[10px] text-[#929A95] uppercase">Ambient PM2.5</div>
                  <div className="text-2xl font-bold text-[#F1F3EE]">+22.7%</div>
                  <div className="text-[10px] text-[#929A95]">73.6 µg/m³ at AQ-04</div>
                </div>
              </div>

              <div className="p-3.5 rounded bg-[#141817] border border-[#242A27] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#626A65] uppercase">Metric Isolation</span>
                  <span className="text-[#A8C83A] font-bold">ANOMALY SCORE: 0.884</span>
                </div>
                <p className="text-[11px] text-[#929A95] leading-relaxed">
                  How unusual this operating condition is relative to learned normal patterns (Isolation Forest algorithm across 200 estimators). Not a probability or certainty percentage.
                </p>
              </div>
            </div>

            {/* Distribution Curve (7 cols) */}
            <div className="lg:col-span-7 p-5 rounded-lg bg-[#0E1110] border border-[#242A27] flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#929A95] uppercase tracking-wider">
                  90-Day Operating Baseline Envelope vs Current Anomaly
                </span>
                <span className="text-[#A8C83A] font-bold">Point 0.884 (Outlier)</span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A8C83A" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#A8C83A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#181E1C" />
                    <XAxis
                      dataKey="score"
                      stroke="#626A65"
                      tick={{ fill: '#626A65', fontSize: 10, fontFamily: 'monospace' }}
                    />
                    <YAxis
                      stroke="#626A65"
                      tick={{ fill: '#626A65', fontSize: 10, fontFamily: 'monospace' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#080A09',
                        borderColor: '#242A27',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    />
                    <ReferenceLine x={0.884} stroke="#A8C83A" strokeWidth={2} label={{ value: '0.884', fill: '#A8C83A', fontSize: 11 }} />
                    <Area
                      type="monotone"
                      dataKey="density"
                      stroke="#A8C83A"
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill="url(#curveGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#626A65] pt-2 border-t border-[#181E1C]">
                <span>0.0 Normal Operating Envelope</span>
                <span>0.6 Warning Threshold</span>
                <span className="text-[#A8C83A]">0.884 Critical Outlier Condition</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── QUESTION 02: IS THE OBSERVATION SUPPORTED? ──────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-[2px] bg-[#141817] text-[#A8C83A] font-mono text-xs font-bold border border-[#A8C83A]/30">
                QUESTION 02
              </span>
              <h2 className="text-lg font-bold text-[#F1F3EE] tracking-tight">
                Is The Observation Supported?
              </h2>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[#929A95] uppercase">Corroboration Score:</span>
              <span className="text-base font-bold text-[#A8C83A]">89.4 / 100</span>
              <span className="text-[10px] text-[#626A65]">(Evidence Agreement Score)</span>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <span className="text-[#929A95]">
                Convergence of Six Independent Physical and Telemetric Signal Streams:
              </span>
              <span className="text-[#626A65] text-[11px]">
                This is an evidence-agreement score across sensor layers, not a probability that the report is true.
              </span>
            </div>

            {/* Convergence Chain Instrument */}
            <ConvergenceChain
              coreScore={89.4}
              isAutoplay={true}
            />
          </div>
        </section>

        {/* ── QUESTION 03: HOW DID ONER REASON? ────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-[2px] bg-[#141817] text-[#A8C83A] font-mono text-xs font-bold border border-[#A8C83A]/30">
              QUESTION 03
            </span>
            <h2 className="text-lg font-bold text-[#F1F3EE] tracking-tight">
              How Did ONER Reason?
            </h2>
          </div>

          {/* Reasoning Trace: Flow / Alluvial Ribbon Architecture */}
          <ReasoningTrace anomalyScore={0.884} supportScore={99.4} />
        </section>

        {/* ── QUESTION 04: LIKELY CAUSE? ───────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-[2px] bg-[#141817] text-[#A8C83A] font-mono text-xs font-bold border border-[#A8C83A]/30">
              QUESTION 04
            </span>
            <h2 className="text-lg font-bold text-[#F1F3EE] tracking-tight">
              Likely Cause?
            </h2>
          </div>

          <div className="p-5 sm:p-6 rounded-lg bg-[#0E1110] border border-[#242A27] grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-3">
              <div className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase tracking-wider">
                PRIMARY CAUSAL DIAGNOSIS
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F1F3EE]">
                Burner Refractory Fouling & Stoichiometric Combustion Imbalance
              </h3>
              <p className="text-xs sm:text-sm text-[#929A95] leading-relaxed">
                Natural gas combustion instability combined with refractory thermal lining degradation is creating incomplete combustion at Furnace F-101. The sub-stoichiometric air-fuel ratio (0.94) starves combustion of excess oxygen, while elevated stack exit temperature (+18.4°C) confirms loss of radiant heat transfer efficiency into the process charge.
              </p>

              <div className="pt-3 border-t border-[#181E1C] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <div className="text-[#626A65] text-[10px] uppercase">EQUIPMENT</div>
                  <div className="text-[#F1F3EE] font-medium">Furnace F-101 Stack</div>
                </div>
                <div>
                  <div className="text-[#626A65] text-[10px] uppercase">AFFECTED SYSTEM</div>
                  <div className="text-[#F1F3EE] font-medium">Natural Gas Combustion Loop</div>
                </div>
                <div>
                  <div className="text-[#626A65] text-[10px] uppercase">URGENCY LEVEL</div>
                  <div className="text-red-400 font-bold">HIGH · PACT BREACH</div>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 p-4 rounded bg-[#080A09] border border-[#242A27] flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-[#626A65] uppercase">
                  ROOT-CAUSE SUPPORT
                </div>
                <div className="text-3xl font-bold font-mono text-[#A8C83A]">
                  99.4 <span className="text-xs font-normal text-[#929A95]">/ 100</span>
                </div>
                <div className="text-[10px] font-mono text-[#626A65]">
                  Deterministic domain score · Not a probability
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-[#929A95] pt-2 border-t border-[#181E1C]">
                <div className="flex items-center justify-between">
                  <span>Thermodynamic Rules:</span>
                  <span className="text-[#F1F3EE] font-mono font-bold">100% agreement</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sensor Correlation:</span>
                  <span className="text-[#F1F3EE] font-mono font-bold">98.8% agreement</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Historical Recurrence:</span>
                  <span className="text-[#F1F3EE] font-mono font-bold">Consistent</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── QUESTION 05: WHAT SHOULD WE DO? ───────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-[2px] bg-[#141817] text-[#A8C83A] font-mono text-xs font-bold border border-[#A8C83A]/30">
              QUESTION 05
            </span>
            <h2 className="text-lg font-bold text-[#F1F3EE] tracking-tight">
              What Should We Do?
            </h2>
          </div>

          <div className="p-5 sm:p-6 rounded-lg bg-[#0E1110] border-2 border-[#A8C83A]/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#A8C83A] tracking-wider">
                  RECOMMENDED CORRECTIVE INTERVENTION
                </span>
                <span className="text-xs text-[#626A65]">·</span>
                <span className="text-[10px] font-mono text-[#929A95]">WORK ORDER #WO-8821</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#141817] text-[#C4DF61] border border-[#A8C83A]/30">
                  PROTOTYPE WORKFLOW
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#F1F3EE]">
                Execute Damper Trim Compensation to 1.042
              </h3>
              <p className="text-xs text-[#929A95] max-w-2xl leading-relaxed">
                Recalibrate air damper trim on Burner F-101B from 1.000 to 1.042 to restore excess oxygen to stoichiometric optimum (1.05 simulated target ratio). This will normalize flue gas velocity, eliminate soot emissions, and restore radiant heat transfer.
              </p>

              <div className="flex items-center gap-4 text-xs font-mono pt-1">
                <div>
                  <span className="text-[#626A65]">CURRENT SETPOINT: </span>
                  <span className="text-[#F1F3EE] font-bold">1.000</span>
                </div>
                <div>
                  <span className="text-[#626A65]">RECOMMENDED: </span>
                  <span className="text-[#A8C83A] font-bold">1.042 (+4.2% trim)</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-2">
              <Link
                href={`/simulator?case=${caseId}`}
                className="px-6 py-3 rounded bg-[#A8C83A] hover:bg-[#b8d844] text-[#080A09] font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(168,200,58,0.2)]"
              >
                <span>RUN SIMULATION →</span>
              </Link>
              <span className="text-[10px] font-mono text-[#626A65] text-center">
                Evaluate counterfactual delta before applying
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-[#181E1C] bg-[#0E1110] mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-[#626A65]">
          <div className="flex items-center gap-2">
            <span>ISOLATION FOREST (200 TREES)</span>
            <span>·</span>
            <span>DETERMINISTIC CAUSAL GRAPH</span>
            <span>·</span>
            <span>CEMS PS-2 SPEC (SIMULATED TELEMETRY)</span>
          </div>
          <div>
            <DemoTag label="Demo data · Simulated telemetry · Prototype workflow" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function InvestigationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080A09] text-white p-8">Loading investigation instrument...</div>}>
      <InvestigationInner />
    </Suspense>
  );
}
