'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AtmosphericShell from '@/components/shell/AtmosphericShell';
import HorizonLine, { HorizonLevel } from '@/components/primitives/HorizonLine';
import StateMark from '@/components/primitives/StateMark';
import DemoTag from '@/components/primitives/DemoTag';
import { api, Scenario } from '@/lib/api';
import { CANONICAL_CASE } from '@/lib/seed';
import {
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
  Flame,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Wrench,
  TrendingDown,
  Info,
} from 'lucide-react';

function SimulatorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawCase = searchParams.get('case') || 'COMM-2026-00421';
  const caseId = rawCase.startsWith('COMM-2026-')
    ? rawCase
    : `COMM-2026-${rawCase.replace(/^COMM-2026-/, '').padStart(5, '0')}`;

  // Interactive damper trim setpoint control (1.000 to 1.100)
  const [setpoint, setSetpoint] = useState<number>(1.042);
  const [activeBranch, setActiveBranch] = useState<'DO_NOTHING' | 'DAMPER_TRIM'>('DAMPER_TRIM');
  const [isApplied, setIsApplied] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);
  const [backendScenario, setBackendScenario] = useState<any>(null);

  // Load backend scenario if available
  useEffect(() => {
    async function fetchBackendSim() {
      try {
        const res = await api.simulate('furnace_optimization', {
          efficiency_gain_pct: Math.round(((setpoint - 1.0) / 0.042) * 12.0),
        });
        if (res && !res.error) {
          setBackendScenario(res);
        }
      } catch (err) {
        console.warn('Backend simulate fallback:', err);
      }
    }
    fetchBackendSim();
  }, [setpoint]);

  // Dynamic Delta Calculations based on setpoint deviation
  const deltaMetrics = useMemo(() => {
    // 1.042 is the optimal setpoint producing canonical 14.2 tCO2e/d and 28.6 kg NOx/d
    const ratio = Math.max(0, (setpoint - 1.0) / 0.042);
    const co2Daily = activeBranch === 'DO_NOTHING' ? 0 : 14.2 * ratio;
    const co2Annual = co2Daily * 365;
    const noxDaily = activeBranch === 'DO_NOTHING' ? 0 : 28.6 * ratio;
    const postNoxPpm = activeBranch === 'DO_NOTHING' ? 131.4 : Math.max(85, 131.4 - noxDaily * 1.5);
    const postCo2Daily = activeBranch === 'DO_NOTHING' ? 104.2 : Math.max(80, 104.2 - co2Daily);
    const costSavingsMonthlyInr = activeBranch === 'DO_NOTHING' ? 0 : Math.round(1070000 * ratio);

    return {
      co2Daily: co2Daily.toFixed(1),
      co2Annual: Math.round(co2Annual).toLocaleString(),
      noxDaily: noxDaily.toFixed(1),
      postNoxPpm: postNoxPpm.toFixed(1),
      postCo2Daily: postCo2Daily.toFixed(1),
      costSavingsMonthlyInr: costSavingsMonthlyInr.toLocaleString(),
      efficiencyGain: activeBranch === 'DO_NOTHING' ? '0.0%' : `+${(2.4 * ratio).toFixed(1)}%`,
    };
  }, [setpoint, activeBranch]);

  const handleApply = () => {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setIsApplied(true);
    }, 700);
  };

  const handleReset = () => {
    setSetpoint(1.042);
    setActiveBranch('DAMPER_TRIM');
    setIsApplied(false);
  };

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
          {/* Breadcrumb back to Investigation */}
          <div className="flex items-center gap-2 font-mono text-xs text-[#929A95]">
            <Link
              href={`/investigation?case=${caseId}`}
              className="inline-flex items-center gap-1.5 text-[#F1F3EE] hover:text-[#A8C83A] transition-colors"
            >
              <ArrowLeft size={13} />
              <span>INVESTIGATION ({caseId})</span>
            </Link>
            <span>/</span>
            <span className="text-[#A8C83A] font-bold">INTERVENTION SIMULATOR</span>
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
            <Link
              href={`/investigation?case=${caseId}`}
              className="text-[#929A95] hover:text-[#F1F3EE] transition-colors pb-1"
            >
              1. INVESTIGATE
            </Link>
            <span className="text-[#A8C83A] font-bold flex items-center gap-1.5 border-b-2 border-[#A8C83A] pb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A8C83A]" />
              <span>2. SIMULATE</span>
            </span>
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
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Header & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#242A27]">
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-[#A8C83A] uppercase font-bold tracking-wider">
              INDUSTRIAL DECISION INSTRUMENT · COUNTERFACTUAL MODELING
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#F1F3EE] font-normal tracking-tight">
              Intervention Simulator
            </h1>
            <p className="text-xs sm:text-sm text-[#929A95]">
              Compare the current operating state with a proposed intervention to evaluate physical emissions and financial deltas before applying setpoint adjustments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded bg-[#0E1110] hover:bg-[#141817] border border-[#242A27] text-xs font-mono text-[#929A95] hover:text-[#F1F3EE] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>RESET DEFAULTS</span>
            </button>
          </div>
        </div>

        {/* ── CURRENT OPERATING STATE (Compact Readout) ─────────── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#929A95] uppercase tracking-wider">
              Current Operating State · Furnace F-101 Baseline Telemetry
            </span>
            <span className="text-amber-400 font-bold">STATUS: ELEVATED / BREACH</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
            <div className="p-3.5 rounded bg-[#0E1110] border border-[#242A27] space-y-1">
              <div className="text-[10px] text-[#626A65] uppercase">NOx Level</div>
              <div className="text-xl sm:text-2xl font-bold text-[#F1F3EE]">131.4</div>
              <div className="text-[10px] text-amber-400">+31.4% (Limit: 100)</div>
            </div>

            <div className="p-3.5 rounded bg-[#0E1110] border border-[#242A27] space-y-1">
              <div className="text-[10px] text-[#626A65] uppercase">Flue Temp Delta</div>
              <div className="text-xl sm:text-2xl font-bold text-[#F1F3EE]">+18.4°C</div>
              <div className="text-[10px] text-[#929A95]">Heat loss in flue</div>
            </div>

            <div className="p-3.5 rounded bg-[#0E1110] border border-[#242A27] space-y-1">
              <div className="text-[10px] text-[#626A65] uppercase">Air/Fuel Ratio</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-400">0.94</div>
              <div className="text-[10px] text-[#626A65]">Sub-stoichiometric</div>
            </div>

            <div className="p-3.5 rounded bg-[#0E1110] border border-[#242A27] space-y-1">
              <div className="text-[10px] text-[#626A65] uppercase">Current Damper Setpoint</div>
              <div className="text-xl sm:text-2xl font-bold text-[#F1F3EE]">1.000</div>
              <div className="text-[10px] text-[#626A65]">Baseline manual</div>
            </div>

            <div className="p-3.5 rounded bg-[#0E1110] border border-[#242A27] space-y-1 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-[#626A65] uppercase">Health Score</div>
              <div className="text-xl sm:text-2xl font-bold text-[#A8C83A]">87.3</div>
              <div className="text-[10px] text-[#626A65]">Facility Health Index</div>
            </div>
          </div>
        </section>

        {/* ── DECISION FORK: DO NOTHING vs PROPOSED INTERVENTION ─── */}
        <section className="space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[#929A95]">
            Engineering Decision Fork
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Branch A: DO NOTHING */}
            <div
              onClick={() => setActiveBranch('DO_NOTHING')}
              className={`p-5 sm:p-6 rounded-lg border transition-all cursor-pointer space-y-4 relative ${
                activeBranch === 'DO_NOTHING'
                  ? 'bg-[#141817] border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.08)]'
                  : 'bg-[#0E1110] border-[#242A27] hover:border-[#3A423D]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  BRANCH A · STATUS QUO
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  DO NOTHING
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#F1F3EE]">
                  Maintain Unadjusted Operation (Setpoint 1.000)
                </h3>
                <p className="text-xs text-[#929A95] mt-1 leading-relaxed">
                  Continue running Furnace F-101 with fouled burner refractory. Ongoing sub-stoichiometric combustion produces soot plumes, elevated NOx emissions, and thermal efficiency losses.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#181E1C] text-xs font-mono">
                <div className="flex items-center justify-between text-red-400">
                  <span>Sustained Emissions Baseline:</span>
                  <span className="font-bold">104.2 tCO₂e / day</span>
                </div>
                <div className="flex items-center justify-between text-amber-400">
                  <span>Stack NOx Concentration:</span>
                  <span className="font-bold">131.4 mg/Nm³ (+31.4% breach)</span>
                </div>
                <div className="flex items-center justify-between text-[#929A95]">
                  <span>Pact Non-Compliance Penalty Risk:</span>
                  <span className="text-[#F1F3EE]">₹485,000 / month</span>
                </div>
              </div>
            </div>

            {/* Branch B: DAMPER TRIM COMPENSATION */}
            <div
              onClick={() => setActiveBranch('DAMPER_TRIM')}
              className={`p-5 sm:p-6 rounded-lg border transition-all cursor-pointer space-y-4 relative ${
                activeBranch === 'DAMPER_TRIM'
                  ? 'bg-[#141817] border-[#A8C83A] shadow-[0_0_20px_rgba(168,200,58,0.1)]'
                  : 'bg-[#0E1110] border-[#242A27] hover:border-[#3A423D]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A8C83A]">
                  BRANCH B · RECOMMENDED INTERVENTION
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#A8C83A]/10 text-[#A8C83A] border border-[#A8C83A]/40 font-bold">
                  DAMPER TRIM ({setpoint.toFixed(3)})
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#F1F3EE]">
                  Damper Trim Compensation to Air-Fuel Loop
                </h3>
                <p className="text-xs text-[#929A95] mt-1 leading-relaxed">
                  Adjust secondary air trim damper to restore stoichiometric excess oxygen (1.05 ratio), restoring radiant flame temperature and resolving incomplete combustion.
                </p>
              </div>

              {/* Setpoint Slider Control */}
              <div className="space-y-2 pt-2 border-t border-[#181E1C]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#929A95]">Damper Setpoint Adjustment:</span>
                  <span className="text-base font-bold text-[#A8C83A] font-mono">
                    {setpoint.toFixed(3)}
                  </span>
                </div>

                <input
                  type="range"
                  min="1.000"
                  max="1.100"
                  step="0.001"
                  value={setpoint}
                  onChange={(e) => {
                    setSetpoint(parseFloat(e.target.value));
                    setActiveBranch('DAMPER_TRIM');
                  }}
                  className="w-full h-1.5 bg-[#242A27] rounded-lg appearance-none cursor-pointer accent-[#A8C83A]"
                />

                <div className="flex items-center justify-between text-[10px] font-mono text-[#626A65]">
                  <span>1.000 (Current)</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSetpoint(1.042);
                      setActiveBranch('DAMPER_TRIM');
                    }}
                    className="text-[#A8C83A] underline font-bold hover:text-white"
                  >
                    1.042 (Recommended)
                  </button>
                  <span>1.100 (Max Trim)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── THE DELTA RAIL (HERO VISUAL COMPARISON) ─────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[#929A95]">
              Counterfactual Delta Rail · DO NOTHING vs DAMPER TRIM {setpoint.toFixed(3)}
            </div>

            {/* Simulation Language Banner */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#141817] border border-dashed border-[#A8C83A]/50 text-[11px] font-mono text-[#A8C83A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A8C83A]" />
              <span>SIMULATED · NOT YET MEASURED</span>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-6">
            {/* The 4 Delta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              {/* NOx Abatement */}
              <div className="p-4 rounded bg-[#080A09] border border-[#242A27] space-y-1.5">
                <div className="text-[10px] text-[#626A65] uppercase">
                  Criteria Pollutant Delta
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#A8C83A]">
                    −{deltaMetrics.noxDaily}
                  </span>
                  <span className="text-xs text-[#929A95]">kg NOx / day</span>
                </div>
                <div className="text-[10px] text-[#929A95]">
                  131.4 → {deltaMetrics.postNoxPpm} mg/Nm³ (Compliant)
                </div>
              </div>

              {/* CO2e Daily Reduction */}
              <div className="p-4 rounded bg-[#080A09] border border-[#242A27] space-y-1.5">
                <div className="text-[10px] text-[#626A65] uppercase">
                  Daily GHG Reduction
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#A8C83A]">
                    −{deltaMetrics.co2Daily}
                  </span>
                  <span className="text-xs text-[#929A95]">tCO₂e / day</span>
                </div>
                <div className="text-[10px] text-[#929A95]">
                  104.2 → {deltaMetrics.postCo2Daily} tCO₂e sustained
                </div>
              </div>

              {/* Annualized Projection */}
              <div className="p-4 rounded bg-[#080A09] border border-[#242A27] space-y-1.5">
                <div className="text-[10px] text-[#626A65] uppercase">
                  Annualized Estimate
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#F1F3EE]">
                    {deltaMetrics.co2Annual}
                  </span>
                  <span className="text-xs text-[#929A95]">tCO₂e / yr</span>
                </div>
                <div className="text-[10px] text-[#626A65]">
                  Calculation: 14.2 × 365 days
                </div>
              </div>

              {/* Net Economic Opportunity */}
              <div className="p-4 rounded bg-[#080A09] border border-[#242A27] space-y-1.5">
                <div className="text-[10px] text-[#626A65] uppercase">
                  Avoided Cost & Penalty
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#A8C83A]">
                    ₹{deltaMetrics.costSavingsMonthlyInr}
                  </span>
                  <span className="text-xs text-[#929A95]">/ mo</span>
                </div>
                <div className="text-[10px] text-[#626A65]">
                  Pact incentive + avoided fuel waste
                </div>
              </div>
            </div>

            {/* Visual Stacked Reduction Wedge Representation */}
            <div className="space-y-2 pt-2 border-t border-[#181E1C]">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#626A65]">
                <span>104.2 tCO₂e/d Baseline Load</span>
                <span className="text-[#A8C83A] font-bold">
                  {activeBranch === 'DO_NOTHING' ? '0% Abatement' : '−13.6% Measured Wedge Area'}
                </span>
                <span>{deltaMetrics.postCo2Daily} tCO₂e/d Projected Exit</span>
              </div>

              <div className="h-6 w-full rounded bg-[#141817] flex overflow-hidden border border-[#242A27]">
                <div
                  className="h-full bg-[#1C221F] flex items-center justify-center text-[10px] font-mono text-[#929A95] transition-all duration-300"
                  style={{ width: activeBranch === 'DO_NOTHING' ? '100%' : '86.4%' }}
                >
                  Sustained Post-Action Base: {deltaMetrics.postCo2Daily} t/d
                </div>
                {activeBranch === 'DAMPER_TRIM' && (
                  <div
                    className="h-full bg-[#A8C83A] flex items-center justify-center text-[10px] font-mono text-[#080A09] font-bold transition-all duration-300"
                    style={{ width: '13.6%' }}
                  >
                    −13.6% WEDGE
                  </div>
                )}
              </div>
            </div>

            {/* Honest Disclosure */}
            <p className="text-[11px] text-[#626A65] font-mono leading-relaxed">
              * Projections are counterfactual simulation results derived from stoichiometric combustion curves and historical sensor baselines. Reductions are not verified until post-intervention CEMS telemetry is confirmed at the MRV verification stage.
            </p>
          </div>
        </section>

        {/* ── ACTION & POST-ACTION EXECUTION ───────────────────────── */}
        <section className="space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[#929A95]">
            Industrial Operational Lifecycle
          </div>

          {!isApplied ? (
            <div className="p-6 rounded-lg bg-[#0E1110] border border-[#242A27] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase tracking-wider">
                    OPERATIONAL SETPOINT DISPATCH
                  </span>
                  <span className="text-xs text-[#626A65]">·</span>
                  <span className="text-[10px] font-mono text-[#C4DF61] px-1.5 py-0.2 rounded bg-[#141817] border border-[#A8C83A]/30">
                    PROTOTYPE WORKFLOW
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#F1F3EE]">
                  Ready to Dispatch Setpoint {setpoint.toFixed(3)} to Orion Control Room
                </h3>
                <p className="text-xs text-[#929A95] max-w-2xl leading-relaxed">
                  Applying this intervention will generate maintenance work order #WO-8821 for Chief Combustion Engineer M. Rao and initiate a 4-hour telemetry tracking window under Pact Clause 4.2.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  disabled={applying || activeBranch === 'DO_NOTHING'}
                  onClick={handleApply}
                  className={`px-6 py-3.5 rounded font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    activeBranch === 'DO_NOTHING'
                      ? 'bg-[#141817] text-[#626A65] border border-[#242A27] cursor-not-allowed'
                      : 'bg-[#A8C83A] hover:bg-[#b8d844] text-[#080A09] shadow-[0_0_20px_rgba(168,200,58,0.25)]'
                  }`}
                >
                  <Wrench size={15} />
                  <span>{applying ? 'DISPATCHING...' : `APPLY INTERVENTION (${setpoint.toFixed(3)})`}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Post-Action Confirmation State */
            <div className="p-6 rounded-lg bg-[#141817] border-2 border-[#A8C83A] space-y-5 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242A27]">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#A8C83A]/20 border border-[#A8C83A] flex items-center justify-center text-[#A8C83A] font-bold">
                    ✓
                  </span>
                  <div>
                    <div className="text-[10px] font-mono text-[#A8C83A] font-bold uppercase tracking-wider">
                      SETPOINT DISPATCH CONFIRMED
                    </div>
                    <h3 className="text-lg font-bold text-[#F1F3EE]">
                      Intervention Applied — Awaiting Measured Verification
                    </h3>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-[#929A95]">
                  <div>Work Order: <strong className="text-[#F1F3EE]">#WO-8821</strong></div>
                  <div>Lead: <strong className="text-[#F1F3EE]">M. Rao (Combustion Lead)</strong></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                  <div className="text-[10px] text-[#626A65] uppercase">Recalibrated Setpoint</div>
                  <div className="text-base font-bold text-[#A8C83A]">{setpoint.toFixed(3)} Damper Trim</div>
                  <div className="text-[10px] text-[#929A95]">Combustion loop manual reset</div>
                </div>

                <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                  <div className="text-[10px] text-[#626A65] uppercase">Expected Daily Drop</div>
                  <div className="text-base font-bold text-[#F1F3EE]">14.2 tCO₂e / day</div>
                  <div className="text-[10px] text-[#A8C83A]">28.6 kg NOx / day abatement</div>
                </div>

                <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                  <div className="text-[10px] text-[#626A65] uppercase">Telemetry Tracking Window</div>
                  <div className="text-base font-bold text-[#F1F3EE]">4 Hours Active</div>
                  <div className="text-[10px] text-amber-400">Clause 4.2 compliance clock</div>
                </div>
              </div>

              {/* Direct Next Step to Carbon & MRV */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-[#929A95]">
                  Proceed to Carbon + MRV to verify post-action optical CEMS streams and assemble audit evidence.
                </div>

                <Link
                  href={`/carbon?case=${caseId}`}
                  className="px-6 py-3 rounded bg-[#A8C83A] hover:bg-[#b8d844] text-[#080A09] font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(168,200,58,0.25)] shrink-0"
                >
                  <span>VERIFY RESULT →</span>
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-[#181E1C] bg-[#0E1110] mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-[#626A65]">
          <div className="flex items-center gap-2">
            <span>PARAMETERIZED COUNTERFACTUAL MODEL</span>
            <span>·</span>
            <span>PACT CLAUSE 4.2 ADVISORY</span>
          </div>
          <div>
            <DemoTag label="Demo data · Simulated telemetry · Prototype workflow" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080A09] text-white p-8">Loading intervention simulator...</div>}>
      <SimulatorInner />
    </Suspense>
  );
}
