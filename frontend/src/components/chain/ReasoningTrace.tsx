'use client';

import React from 'react';
import StateMark from '@/components/primitives/StateMark';

interface ReasoningTraceProps {
  className?: string;
  anomalyScore?: number; // 0.884
  supportScore?: number; // 99.4
}

/**
 * ReasoningTrace Primitive / Instrument
 * 
 * Alluvial / Flow-style reasoning visualization tracking how ONER derived
 * the root cause from raw observations through deterministic domain rules.
 * Spec: docs/ONER_Antigravity_Prompt_Pack.md §0.15 & Phase 4 Question 03
 */
export default function ReasoningTrace({
  className = '',
  anomalyScore = 0.884,
  supportScore = 99.4,
}: ReasoningTraceProps) {
  return (
    <div className={`p-5 sm:p-6 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-6 ${className}`}>
      {/* ── Header Strip ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242A27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A8C83A]">
              REASONING TRACE
            </span>
            <span className="text-[#626A65]">·</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#141817] text-[#C4DF61] border border-[#A8C83A]/30">
              DETERMINISTIC DOMAIN LOGIC
            </span>
          </div>
          <h3 className="text-base font-bold text-[#F1F3EE] mt-0.5">
            Causal Graph Traversal: Observations → Rules → Root Cause
          </h3>
          <p className="text-xs text-[#929A95] mt-0.5">
            Rules evaluated against physical combustion thermodynamics and CEMS cross-correlation.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <div className="text-[10px] text-[#626A65] uppercase">Root-Cause Support</div>
            <div className="text-sm font-bold text-[#A8C83A]">{supportScore.toFixed(1)} / 100</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#626A65] uppercase">Isolation Decision</div>
            <div className="text-sm font-bold text-[#F1F3EE]">{anomalyScore.toFixed(3)}</div>
          </div>
        </div>
      </div>

      {/* ── Flow / Alluvial Ribbon Architecture ─────────────────── */}
      <div className="relative">
        {/* Stage Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          {/* COLUMN 1: OBSERVATIONS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#929A95] pb-1 border-b border-[#242A27]">
              <span>1. Observations</span>
              <span className="text-[10px] text-[#626A65]">4 Inputs</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded bg-[#080A09] border border-[#A8C83A]/60 shadow-[0_0_12px_rgba(168,200,58,0.06)] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#A8C83A]">
                  <span>OPTICAL PLUME</span>
                  <span>09:42 IST</span>
                </div>
                <div className="text-xs text-[#F1F3EE] font-medium">Dark smoke at stack head</div>
                <div className="text-[10px] font-mono text-[#626A65]">Resident photo + downwind odor</div>
              </div>

              <div className="p-3 rounded bg-[#080A09] border border-[#A8C83A]/60 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#A8C83A]">
                  <span>CEMS PROBE #2</span>
                  <span>10-sec loop</span>
                </div>
                <div className="text-xs text-[#F1F3EE] font-medium">NOx & thermal elevation</div>
                <div className="text-[10px] font-mono text-[#626A65]">Continuous stack telemetry</div>
              </div>

              <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#929A95]">
                  <span>AQI STATION 4</span>
                  <span>Ambient</span>
                </div>
                <div className="text-xs text-[#F1F3EE]">PM2.5 particulate rise</div>
                <div className="text-[10px] font-mono text-[#626A65]">73.6 µg/m³ downwind</div>
              </div>

              <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#929A95]">
                  <span>90-DAY BASELINE</span>
                  <span>History</span>
                </div>
                <div className="text-xs text-[#F1F3EE]">Outside envelope</div>
                <div className="text-[10px] font-mono text-[#626A65]">Isolation Forest 0.884 score</div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: DEVIATIONS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#929A95] pb-1 border-b border-[#242A27]">
              <span>2. Deviations</span>
              <span className="text-[10px] text-[#A8C83A]">Key Delta</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded bg-[#080A09] border border-[#A8C83A] space-y-1">
                <div className="text-[10px] font-mono text-[#A8C83A] uppercase font-bold">
                  NOx Concentration
                </div>
                <div className="text-base font-bold font-mono text-[#F1F3EE] flex items-baseline gap-1.5">
                  <span>+31.4%</span>
                  <span className="text-[10px] text-[#929A95] font-normal">131.4 mg/Nm³</span>
                </div>
                <div className="text-[10px] font-mono text-amber-400">Exceeds 100 mg/Nm³ limit</div>
              </div>

              <div className="p-3 rounded bg-[#080A09] border border-[#A8C83A] space-y-1">
                <div className="text-[10px] font-mono text-[#A8C83A] uppercase font-bold">
                  Flue Temperature
                </div>
                <div className="text-base font-bold font-mono text-[#F1F3EE] flex items-baseline gap-1.5">
                  <span>+18.4°C</span>
                  <span className="text-[10px] text-[#929A95] font-normal">delta</span>
                </div>
                <div className="text-[10px] font-mono text-[#929A95]">Heat loss via stack flue</div>
              </div>

              <div className="p-3 rounded bg-[#080A09] border border-[#A8C83A] space-y-1">
                <div className="text-[10px] font-mono text-[#A8C83A] uppercase font-bold">
                  Air / Fuel Ratio
                </div>
                <div className="text-base font-bold font-mono text-[#F1F3EE] flex items-baseline gap-1.5">
                  <span>0.94</span>
                  <span className="text-[10px] text-amber-400 font-normal">Sub-stoichiometric</span>
                </div>
                <div className="text-[10px] font-mono text-[#626A65]">Target: 1.05 excess air</div>
              </div>

              <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                <div className="text-[10px] font-mono text-[#929A95] uppercase">
                  Fine Particulate
                </div>
                <div className="text-sm font-bold font-mono text-[#929A95]">
                  +22.7% (73.6 µg/m³)
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: DOMAIN RULES (DETERMINISTIC DOMAIN LOGIC) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#929A95] pb-1 border-b border-[#242A27]">
              <span>3. Domain Rules</span>
              <span className="text-[10px] text-[#626A65]">Evaluated</span>
            </div>

            <div className="space-y-2">
              {/* Winning Rule (Lime) */}
              <div className="p-3.5 rounded bg-[#141817] border-2 border-[#A8C83A] space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase">
                    RULE COMBUST-421 · MATCHED
                  </span>
                  <StateMark state="verified" size="sm" showLabel={false} />
                </div>
                <div className="text-xs font-semibold text-[#F1F3EE]">
                  Sub-Stoichiometric + Thermal Flue Delta
                </div>
                <p className="text-[11px] text-[#929A95] leading-relaxed">
                  When Air/Fuel &lt; 0.98 AND NOx &gt; +20% AND Temp &gt; +10°C, physical cause is incomplete combustion from burner fouling.
                </p>
                <div className="text-[10px] font-mono text-[#A8C83A] pt-1 border-t border-[#242A27] flex items-center justify-between">
                  <span>Support: 99.4 / 100</span>
                  <span className="font-bold">WINNING PATH</span>
                </div>
              </div>

              {/* Alternative Hypothesis 1 (Dashed / Dimmed) */}
              <div className="p-3 rounded bg-[#080A09] border border-dashed border-[#3A423D] opacity-60 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#626A65]">
                  <span>RULE FUEL-VAR-09</span>
                  <span>REJECTED (12.0)</span>
                </div>
                <div className="text-xs text-[#929A95]">Fuel Quality / Gas Supply Drift</div>
                <p className="text-[10px] text-[#626A65]">
                  Rejected: Fuel manifold supply pressure was steady within ±0.4%.
                </p>
              </div>

              {/* Alternative Hypothesis 2 (Dashed / Dimmed) */}
              <div className="p-3 rounded bg-[#080A09] border border-dashed border-[#3A423D] opacity-60 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#626A65]">
                  <span>RULE METEO-INV-02</span>
                  <span>REJECTED (18.5)</span>
                </div>
                <div className="text-xs text-[#929A95]">Meteorological Inversion Trap</div>
                <p className="text-[10px] text-[#626A65]">
                  Rejected: In-stack excess temperature rules out ground-level thermal trap alone.
                </p>
              </div>

              {/* Alternative Hypothesis 3 (Dashed / Dimmed) */}
              <div className="p-3 rounded bg-[#080A09] border border-dashed border-[#3A423D] opacity-60 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#626A65]">
                  <span>RULE SENSOR-FLT-05</span>
                  <span>REJECTED (6.2)</span>
                </div>
                <div className="text-xs text-[#929A95]">CEMS Sensor Drift / Lens Dirt</div>
                <p className="text-[10px] text-[#626A65]">
                  Rejected: Dual optical cross-check confirmed physical particulate plume.
                </p>
              </div>
            </div>
          </div>

          {/* COLUMN 4: LIKELY CAUSE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#929A95] pb-1 border-b border-[#242A27]">
              <span>4. Likely Cause</span>
              <span className="text-[10px] text-[#A8C83A]">Isolated</span>
            </div>

            <div className="p-4 rounded-lg bg-[#141817] border border-[#A8C83A] space-y-3 shadow-[0_0_16px_rgba(168,200,58,0.08)]">
              <div>
                <div className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase tracking-wider">
                  ISOLATED ROOT CAUSE
                </div>
                <h4 className="text-base font-bold text-[#F1F3EE] mt-0.5">
                  Burner Refractory Fouling
                </h4>
                <div className="text-xs text-[#929A95] font-mono mt-0.5">
                  Furnace F-101 (North Processing Train)
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#242A27] text-xs">
                <div className="text-[11px] text-[#F1F3EE] font-medium">
                  Supporting Mechanisms:
                </div>
                <ul className="space-y-1.5 text-[11px] text-[#929A95]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#A8C83A] font-bold">›</span>
                    <span>Thermal efficiency degradation (-2.4% heat transfer)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#A8C83A] font-bold">›</span>
                    <span>Air-fuel stoichiometric imbalance (0.94 air-starved)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#A8C83A] font-bold">›</span>
                    <span>Incomplete combustion yielding soot & unburnt hydrocarbons</span>
                  </li>
                </ul>
              </div>

              <div className="p-2.5 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                <div className="text-[10px] font-mono text-[#626A65] uppercase">
                  Root-Cause Support Score
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-[#A8C83A]">
                    {supportScore.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-[#929A95]">/ 100</span>
                </div>
                <div className="text-[10px] font-mono text-[#626A65]">
                  Deterministic domain score · Not a probability
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
