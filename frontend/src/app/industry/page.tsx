'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AtmosphericShell from '@/components/shell/AtmosphericShell';
import StateMark from '@/components/primitives/StateMark';
import DemoTag from '@/components/primitives/DemoTag';
import { CompactChain, ReasoningTrace } from '@/components/chain';
import Signal from '@/components/primitives/Signal';
import Rail, { RailStep } from '@/components/primitives/Rail';
import { ReductionWedge } from '@/components/primitives';
import { api, CommunityReport } from '@/lib/api';
import { CANONICAL_CASE } from '@/lib/seed';
import {
  Factory,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  ArrowRight,
  Zap,
  Check,
  Info,
  TrendingDown,
  Activity,
  AlertTriangle,
  RotateCcw,
  Wrench,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface IndustryCaseSummary {
  id: string;
  equipment: string;
  problem: string;
  category: string;
  deviation: string;
  corroboration: number;
  status: string;
  statusType: 'awaiting' | 'received' | 'corroborated' | 'verified';
  signals: number[];
}

const REGISTERED_CASES: IndustryCaseSummary[] = [
  {
    id: 'COMM-2026-00421',
    equipment: 'Furnace F-101 (North Train)',
    problem: 'NOx elevation & combustion instability',
    category: 'Smoke / Emissions',
    deviation: 'NOx +31.4% · Temp +18.4°C',
    corroboration: 89.4,
    status: 'ACTION REQUESTED',
    statusType: 'verified',
    signals: [42, 96, 94, 95, 92, 96],
  },
  {
    id: 'COMM-2026-00398',
    equipment: 'Canal Outfall 3 (ETP Sump)',
    problem: 'Stormwater diversion valve bypass',
    category: 'Water Pollution',
    deviation: 'DO -42% · TDS +112%',
    corroboration: 64.2,
    status: 'INVESTIGATING',
    statusType: 'corroborated',
    signals: [70, 80, 60, 75, 20, 40],
  },
  {
    id: 'COMM-2026-00405',
    equipment: 'SRU-2 Sulfur Condensate Seal Pot',
    problem: 'Seal pot vapor lock displacement',
    category: 'Odor',
    deviation: 'H2S 0.04 ppm boundary',
    corroboration: 82.1,
    status: 'RESOLVED',
    statusType: 'verified',
    signals: [85, 90, 82, 78, 80, 88],
  },
  {
    id: 'COMM-2026-00376',
    equipment: 'Transit Haul Corridor East',
    problem: 'Dry clinker fugitive dust',
    category: 'Dust',
    deviation: 'PM10 +8.2% marginal',
    corroboration: 31.0,
    status: 'CORROBORATING',
    statusType: 'awaiting',
    signals: [35, 30, 25, 40, 20, 30],
  },
  {
    id: 'COMM-2026-00412',
    equipment: 'Cooling Tower CT-3 Draft Fan #4',
    problem: 'Fan blade aerodynamic pitch imbalance',
    category: 'Noise',
    deviation: 'Vibration 8.4 mm/s · 62 dBA',
    corroboration: 78.5,
    status: 'WORK ORDER ISSUED',
    statusType: 'corroborated',
    signals: [60, 82, 75, 80, 70, 78],
  },
];

function IndustryPortalInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeCaseId = searchParams.get('case') || 'COMM-2026-00421';
  const [selectedCaseId, setSelectedCaseId] = useState<string>(activeCaseId);
  const [activeTab, setActiveTab] = useState<'CASE' | 'SIGNALS'>('CASE');
  const [actionStage, setActionStage] = useState<'SIMULATED' | 'APPLIED' | 'VERIFIED'>('APPLIED');
  const [actionLoading, setActionLoading] = useState(false);
  const [backendCase, setBackendCase] = useState<CommunityReport | null>(null);

  useEffect(() => {
    async function loadActiveCase() {
      try {
        const res = await api.getCommunityReport(selectedCaseId);
        if (res) setBackendCase(res);
      } catch (err) {
        console.warn('Backend case lookup fallback:', err);
      }
    }
    loadActiveCase();
  }, [selectedCaseId]);

  // Operational Lifecycle Rail Steps
  const railSteps: RailStep[] = [
    {
      id: 'ack',
      label: '1. Acknowledge',
      sublabel: '09:45 IST · Control Room',
      status: 'complete',
      value: '✓',
    },
    {
      id: 'inv',
      label: '2. Investigate',
      sublabel: 'Causal engine mapped F-101',
      status: 'complete',
      value: '✓',
    },
    {
      id: 'sim',
      label: '3. Simulate',
      sublabel: 'Damper trim 1.042 projected',
      status: 'complete',
      value: '✓',
    },
    {
      id: 'act',
      label: '4. Apply',
      sublabel: actionStage === 'SIMULATED' ? 'Pending dispatch' : 'WO #WO-8821 dispatched',
      status: actionStage === 'SIMULATED' ? 'active' : 'complete',
      value: actionStage === 'SIMULATED' ? 'Ready' : 'Applied',
    },
    {
      id: 'ver',
      label: '5. Verify',
      sublabel: actionStage === 'VERIFIED' ? 'CEMS Station #2 aligned' : '4-hr tracking window',
      status: actionStage === 'VERIFIED' ? 'complete' : 'active',
      value: actionStage === 'VERIFIED' ? 'Verified' : 'Tracking',
    },
    {
      id: 'res',
      label: '6. Resolve',
      sublabel: actionStage === 'VERIFIED' ? 'Pact compliant · Return sent' : 'Awaiting audit seal',
      status: actionStage === 'VERIFIED' ? 'complete' : 'pending',
      value: actionStage === 'VERIFIED' ? 'Closed' : 'Pending',
    },
  ];

  const handleApplyTrim = async () => {
    setActionLoading(true);
    try {
      await api.takeIndustryAction(
        selectedCaseId,
        'APPLY_DAMPER_TRIM_1042',
        'Combustion setpoint calibrated to 1.042. Maintenance work order #WO-8821 executed.',
        'M. Rao (Chief Combustion Engineer)'
      );
      setActionStage('VERIFIED');
    } catch {
      // Local prototype transition fallback
      setActionStage('VERIFIED');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#080A09] text-[#F1F3EE] transition-colors duration-300"
      data-atmosphere="control"
    >
      {/* ── Top 56px Global Command Bar ─────────────────────────── */}
      <AtmosphericShell />

      {/* ── Facility Header & Environmental Health KPI ──────────── */}
      <header className="border-b border-[#242A27] bg-[#0E1110]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#A8C83A]">
              <Factory size={13} />
              <span>ORION REFINING COMPLEX</span>
              <span className="text-[#626A65]">·</span>
              <span>FURNACE F-101 (NORTH PROCESSING TRAIN)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F3EE]">
              Industrial Environmental Control Surface
            </h1>
            <p className="text-xs text-[#929A95]">
              Real-time case resolution, stoichiometric intervention simulation, and continuous Pact compliance.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Environmental Health Index */}
            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] text-right font-mono min-w-[190px]">
              <div className="text-[10px] text-[#626A65] uppercase">
                Environmental Health Index
              </div>
              <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
                <span className="text-3xl font-bold text-[#A8C83A]">87.3</span>
                <span className="text-xs text-[#929A95]">/ 100</span>
              </div>
              <div className="text-[9px] text-[#626A65] mt-0.5">
                Operational/Environmental KPI (Not %)
              </div>
            </div>

            {/* Action Requested Chip */}
            <div className="p-3.5 rounded-lg bg-[#141817] border border-[#A8C83A]/40 text-center font-mono min-w-[150px]">
              <div className="text-[10px] text-[#626A65] uppercase">Current Directive</div>
              <div className="text-xs font-bold text-[#A8C83A] mt-1 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#A8C83A]" />
                <span>ACTION REQUESTED</span>
              </div>
              <div className="text-[9px] text-[#929A95] mt-1">Clause 4.2 active</div>
            </div>
          </div>
        </div>

        {/* Surface Navigation Tabs */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 border-t border-[#181E1C] flex items-center gap-6 text-xs font-mono">
          <button
            onClick={() => setActiveTab('CASE')}
            className={`py-3 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'CASE'
                ? 'text-[#A8C83A] border-[#A8C83A] font-bold'
                : 'text-[#929A95] border-transparent hover:text-[#F1F3EE]'
            }`}
          >
            ACTIVE CASE (COMM-2026-00421)
          </button>
          <button
            onClick={() => setActiveTab('SIGNALS')}
            className={`py-3 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'SIGNALS'
                ? 'text-[#A8C83A] border-[#A8C83A] font-bold'
                : 'text-[#929A95] border-transparent hover:text-[#F1F3EE]'
            }`}
          >
            OPERATIONAL SIGNALS
          </button>
          <Link
            href="/simulator?case=COMM-2026-00421"
            className="py-3 text-[#929A95] hover:text-[#F1F3EE] transition-colors ml-auto flex items-center gap-1"
          >
            <span>INTERVENTION SIMULATOR</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </header>

      {/* ── Main Instrument Body ─────────────────────────────────── */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-8 space-y-10">
        {activeTab === 'CASE' ? (
          /* ── THE 6-STAGE INDUSTRIAL OPERATOR STORY ─────────────── */
          <div className="space-y-8">
            {/* ── 1. PROBLEM ────────────────────────────────────────── */}
            <section className="p-6 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242A27]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase tracking-wider">
                      STAGE 01 · PROBLEM
                    </span>
                    <span className="text-[#626A65]">·</span>
                    <span className="text-xs font-mono font-bold text-[#F1F3EE]">{selectedCaseId}</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#F1F3EE] mt-1">
                    NOx deviation detected around Furnace F-101
                  </h2>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <div className="text-[10px] text-[#626A65] uppercase">Anomaly Score</div>
                    <div className="text-sm font-bold text-[#F1F3EE]">0.884</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#626A65] uppercase">Corroboration</div>
                    <div className="text-sm font-bold text-[#A8C83A]">89.4 / 100</div>
                  </div>
                </div>
              </div>

              {/* Compact Evidence Chain & Key Deviations */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                <div className="md:col-span-7 space-y-2">
                  <div className="text-xs text-[#929A95]">
                    Six independent physical and telemetry streams corroborated an active combustion anomaly:
                  </div>
                  <CompactChain signals={[42, 96, 94, 95, 92, 96]} size="md" />
                  <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-mono text-[#626A65]">
                    <div>• Optical Evidence</div>
                    <div>• F-101 Proximity</div>
                    <div>• Time Aligned</div>
                    <div>• CEMS NOx +31.4%</div>
                    <div>• AQI Station 4</div>
                    <div>• 90-Day Baseline</div>
                  </div>
                </div>

                <div className="md:col-span-5 grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-0.5">
                    <div className="text-[10px] text-[#626A65] uppercase">NOx Peak</div>
                    <div className="text-lg font-bold text-[#F1F3EE]">+31.4%</div>
                    <div className="text-[10px] text-amber-400">131.4 mg/Nm³</div>
                  </div>

                  <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-0.5">
                    <div className="text-[10px] text-[#626A65] uppercase">Flue Delta</div>
                    <div className="text-lg font-bold text-[#F1F3EE]">+18.4°C</div>
                    <div className="text-[10px] text-[#929A95]">Heat loss in flue</div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 2. CAUSE ──────────────────────────────────────────── */}
            <section className="p-6 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#242A27]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase tracking-wider">
                    STAGE 02 · CAUSE
                  </span>
                  <span className="text-[#626A65]">·</span>
                  <span className="text-[10px] font-mono text-[#C4DF61] px-1.5 py-0.2 rounded bg-[#141817] border border-[#A8C83A]/30">
                    DETERMINISTIC DOMAIN LOGIC
                  </span>
                </div>
                <div className="text-xs font-mono text-[#A8C83A]">
                  Root-Cause Support: <strong>99.4 / 100</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-6 space-y-2">
                  <h3 className="text-lg font-bold text-[#F1F3EE]">
                    Burner Refractory Fouling → Thermal Efficiency Degradation
                  </h3>
                  <p className="text-xs text-[#929A95] leading-relaxed">
                    Combustion air damper drift combined with refractory wall deposits is creating sub-stoichiometric combustion (0.94 air/fuel ratio). This starves the flame of excess oxygen, elevating unburnt NOx precursors and pushing excess heat into the flue stack.
                  </p>
                </div>

                <div className="lg:col-span-6 p-4 rounded bg-[#080A09] border border-[#242A27] space-y-2 text-xs font-mono">
                  <div className="text-[10px] text-[#626A65] uppercase">Causal Evidence Ledger</div>
                  <div className="flex justify-between text-[#929A95]">
                    <span>• Air/Fuel Stoichiometric Imbalance:</span>
                    <span className="text-amber-400">0.94 (sub-stoichiometric)</span>
                  </div>
                  <div className="flex justify-between text-[#929A95]">
                    <span>• Radiant Heat Transfer Loss:</span>
                    <span className="text-amber-400">-2.4% thermal efficiency</span>
                  </div>
                  <div className="flex justify-between text-[#929A95]">
                    <span>• Physical Root Cause Classification:</span>
                    <span className="text-[#A8C83A]">Burner Refractory Fouling</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 3. OPTIONS ────────────────────────────────────────── */}
            <section className="p-6 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#242A27]">
                <span className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase tracking-wider">
                  STAGE 03 · INTERVENTION OPTIONS
                </span>
                <span className="text-xs font-mono text-[#929A95]">
                  Select engineering pathway:
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Option 1: Do Nothing */}
                <div className="p-4 rounded bg-[#080A09] border border-[#242A27] space-y-2">
                  <div className="text-[10px] font-mono text-[#626A65] uppercase">Option A</div>
                  <h4 className="text-sm font-bold text-[#929A95]">Do Nothing</h4>
                  <p className="text-[11px] text-[#626A65]">
                    Sustained 104.2 tCO₂e/day emissions baseline. Ongoing Pact penalty exposure of ₹485,000/mo.
                  </p>
                </div>

                {/* Option 2: Recommended Damper Trim */}
                <div className="p-4 rounded bg-[#141817] border-2 border-[#A8C83A] space-y-2 relative shadow-[0_0_16px_rgba(168,200,58,0.1)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase">
                      Option B · RECOMMENDED
                    </span>
                    <StateMark state="verified" size="sm" showLabel={false} />
                  </div>
                  <h4 className="text-sm font-bold text-[#F1F3EE]">Damper Trim 1.042</h4>
                  <p className="text-[11px] text-[#929A95]">
                    Recalibrate air damper to 1.042 setpoint. Restores 1.05 stoichiometric excess air ratio within 180 seconds.
                  </p>
                </div>

                {/* Option 3: Major Overhaul */}
                <div className="p-4 rounded bg-[#080A09] border border-[#242A27] space-y-2">
                  <div className="text-[10px] font-mono text-[#626A65] uppercase">Option C</div>
                  <h4 className="text-sm font-bold text-[#929A95]">Furnace Shutdown Overhaul</h4>
                  <p className="text-[11px] text-[#626A65]">
                    Full cold shutdown for refractory relining. High operational downtime (4 days) and capital cost ($85,000).
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  href="/simulator?case=COMM-2026-00421"
                  className="px-5 py-2.5 rounded bg-[#A8C83A] hover:bg-[#b8d844] text-[#080A09] font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
                >
                  <span>RUN SIMULATION →</span>
                </Link>
              </div>
            </section>

            {/* ── 4. ACTION RAIL ────────────────────────────────────── */}
            <section className="p-6 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#242A27]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase tracking-wider">
                    STAGE 04 · OPERATIONAL ACTION RAIL
                  </span>
                  <span className="text-[#626A65]">·</span>
                  <span className="text-[10px] font-mono text-[#C4DF61] px-1.5 py-0.2 rounded bg-[#141817] border border-[#A8C83A]/30">
                    PROTOTYPE WORKFLOW
                  </span>
                </div>
                <div className="text-xs font-mono text-[#929A95]">
                  Assigned Lead: <strong>M. Rao (Combustion Engineer)</strong>
                </div>
              </div>

              {/* Horizontal Action Rail Primitive */}
              <Rail steps={railSteps} orientation="horizontal" />

              {/* Direct Execution Action Banner */}
              <div className="p-4 rounded bg-[#080A09] border border-[#242A27] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#F1F3EE]">
                    Operational Directive: Recalibrate Secondary Air Trim Damper to 1.042
                  </div>
                  <div className="text-[11px] text-[#929A95]">
                    Initiates 4-hour CEMS tracking window under Pact Clause 4.2 advisory.
                  </div>
                </div>

                <button
                  type="button"
                  disabled={actionLoading || actionStage === 'VERIFIED'}
                  onClick={handleApplyTrim}
                  className={`px-5 py-2.5 rounded font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    actionStage === 'VERIFIED'
                      ? 'bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/40 cursor-default'
                      : 'bg-[#A8C83A] hover:bg-[#b8d844] text-[#080A09] shadow-sm'
                  }`}
                >
                  <Wrench size={14} />
                  <span>{actionStage === 'VERIFIED' ? 'TRIM 1.042 APPLIED ✓' : 'EXECUTE SETPOINT 1.042'}</span>
                </button>
              </div>
            </section>

            {/* ── 5. RESULT (MEASURED REDUCTION) ───────────────────── */}
            <section className="p-6 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#242A27]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase tracking-wider">
                    STAGE 05 · MEASURED RESULT
                  </span>
                  <span className="text-[#626A65]">·</span>
                  <span className="text-xs font-mono text-[#A8C83A] font-bold">MRV READY</span>
                </div>
                <Link
                  href="/carbon?case=COMM-2026-00421"
                  className="text-xs font-mono text-[#A8C83A] hover:underline flex items-center gap-1"
                >
                  <span>VIEW MRV DOSSIER</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                <div className="p-4 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                  <div className="text-[10px] text-[#626A65] uppercase">Daily GHG Abatement</div>
                  <div className="text-2xl font-bold text-[#A8C83A]">14.2 tCO₂e / day</div>
                  <div className="text-[10px] text-[#929A95]">Continuous stack telemetry</div>
                </div>

                <div className="p-4 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                  <div className="text-[10px] text-[#626A65] uppercase">Criteria Air Pollutant</div>
                  <div className="text-2xl font-bold text-[#A8C83A]">28.6 kg NOx / day</div>
                  <div className="text-[10px] text-[#929A95]">131.4 → 88.5 mg/Nm³ exit</div>
                </div>

                <div className="p-4 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                  <div className="text-[10px] text-[#626A65] uppercase">Annualized Demo Est</div>
                  <div className="text-2xl font-bold text-[#F1F3EE]">5,183 tCO₂e / yr</div>
                  <div className="text-[10px] text-[#626A65]">Calculation: 14.2 × 365</div>
                </div>
              </div>
            </section>

            {/* ── 6. VALUE (ILLUSTRATIVE FINANCIAL/PACT MODEL) ─────── */}
            <section className="p-6 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#242A27]">
                <span className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase tracking-wider">
                  STAGE 06 · OPERATIONAL & PACT VALUE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-[#929A95] border border-[#242A27]">
                  ILLUSTRATIVE ECONOMIC MODEL
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                  <div className="text-[10px] text-[#626A65] uppercase">Avoided Excess Penalty</div>
                  <div className="text-base font-bold text-[#F1F3EE]">₹485,000 / month</div>
                  <div className="text-[10px] text-[#929A95]">Pact Clause 4.2 compliance</div>
                </div>

                <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                  <div className="text-[10px] text-[#626A65] uppercase">Thermal Fuel Recovery</div>
                  <div className="text-base font-bold text-[#F1F3EE]">₹820,000 / month</div>
                  <div className="text-[10px] text-[#929A95]">+2.4% heat transfer efficiency</div>
                </div>

                <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                  <div className="text-[10px] text-[#626A65] uppercase">Net Monthly Opportunity</div>
                  <div className="text-base font-bold text-[#A8C83A]">₹1,070,000 / month</div>
                  <div className="text-[10px] text-[#626A65]">Illustrative policy model</div>
                </div>
              </div>

              <p className="text-[10px] text-[#626A65] font-mono pt-1">
                * Economic numbers represent illustrative regulatory policy models for hackathon demonstration. They do not constitute legal liabilities or audited market values.
              </p>
            </section>
          </div>
        ) : (
          /* ── OPERATIONAL SIGNALS TAB ────────────────────────────── */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#242A27]">
              <div>
                <h3 className="text-base font-bold text-[#F1F3EE]">
                  Furnace F-101 Continuous Telemetry Streams
                </h3>
                <p className="text-xs text-[#929A95]">
                  Stack sensor telemetry cross-referenced against 90-day baseline thresholds.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#A8C83A]">CEMS PS-2 1.0 Hz STREAM</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Signal
                label="Stack NOx Concentration"
                unit="mg/Nm³"
                currentValue={131.4}
                baselineValue={100.0}
                threshold={100}
                anomalyDelta="+31.4%"
                status="ANOMALY"
                points={[92, 94, 91, 95, 98, 102, 115, 128, 131.4, 131.0, 118, 92]}
              />

              <Signal
                label="Flue Gas Temperature"
                unit="°C"
                currentValue="418.4"
                baselineValue="400.0"
                threshold={405}
                anomalyDelta="+18.4°C"
                status="ANOMALY"
                points={[398, 399, 401, 400, 404, 408, 412, 416, 418.4, 415, 405, 401]}
              />

              <Signal
                label="Combustion Air/Fuel Ratio"
                unit="lambda"
                currentValue={0.94}
                baselineValue={1.05}
                threshold={1.0}
                anomalyDelta="-10.5%"
                status="ANOMALY"
                points={[1.05, 1.04, 1.05, 1.02, 0.99, 0.96, 0.94, 0.94, 0.95, 1.01, 1.04, 1.05]}
              />

              <Signal
                label="Process Thermal Recovery"
                unit="%"
                currentValue={81.2}
                baselineValue={85.0}
                threshold={83}
                anomalyDelta="-3.8%"
                status="OPTIMAL"
                points={[85.2, 85.0, 84.8, 83.5, 82.1, 81.2, 81.5, 82.8, 84.0, 85.1, 85.3, 85.2]}
              />
            </div>
          </div>
        )}

        {/* ── FACILITY CASE REGISTER ───────────────────────────────── */}
        <section className="space-y-4 pt-6 border-t border-[#242A27]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#626A65]">
                FACILITY SURVEILLANCE REGISTER
              </div>
              <h3 className="text-base font-bold text-[#F1F3EE]">
                Other Monitored Cases & Industrial Units
              </h3>
            </div>
            <span className="text-xs font-mono text-[#929A95]">5 Cases Active</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#242A27] bg-[#0E1110]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#242A27] bg-[#080A09] text-[10px] text-[#626A65] uppercase">
                <tr>
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Equipment Unit</th>
                  <th className="py-3 px-4">Deviation</th>
                  <th className="py-3 px-4">Evidence Corroboration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181E1C]">
                {REGISTERED_CASES.map((c) => {
                  const isCurrent = c.id === selectedCaseId;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent ? 'bg-[#141817]' : 'hover:bg-[#121614]'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-[#F1F3EE] flex items-center gap-2">
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#A8C83A]" />}
                        <span>{c.id}</span>
                      </td>
                      <td className="py-3 px-4 text-[#929A95]">{c.equipment}</td>
                      <td className="py-3 px-4 text-amber-400">{c.deviation}</td>
                      <td className="py-3 px-4">
                        <CompactChain signals={c.signals} size="sm" statusLabel={`${c.corroboration}%`} />
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#A8C83A]">
                          <StateMark state={c.statusType} size="sm" showLabel={false} />
                          <span>{c.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/case/${c.id}?level=control`}
                          className="text-[#929A95] hover:text-[#A8C83A] inline-flex items-center gap-1"
                        >
                          <span>OPEN CASE</span>
                          <ArrowRight size={11} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-[#181E1C] bg-[#0E1110] mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-[#626A65]">
          <div className="flex items-center gap-2">
            <span>ORION REFINING COMPLEX OPERATIONS</span>
            <span>·</span>
            <span>PACT CLAUSE 4.2 WORKSPACE</span>
          </div>
          <div>
            <DemoTag label="Demo data · Simulated telemetry · Prototype workflow" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function IndustryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080A09] text-white p-8">Loading industry control surface...</div>}>
      <IndustryPortalInner />
    </Suspense>
  );
}
