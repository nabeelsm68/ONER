'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, TrendingDown, ArrowDownRight, FileText } from 'lucide-react';
import StateBadge from './StateBadge';

interface ReductionWedgeProps {
  dailyReductionTons?: number; // 14.2
  annualizedReductionTons?: number; // 5183
  noxDailyReductionKg?: number; // 28.6
  facilityName?: string;
  sourceName?: string;
  interventionName?: string;
  verificationSources?: string[];
  isVerified?: boolean;
  className?: string;
}

export default function ReductionWedge({
  dailyReductionTons = 14.2,
  annualizedReductionTons = 5183,
  noxDailyReductionKg = 28.6,
  facilityName = 'Orion Refining Complex',
  sourceName = 'Furnace F-101 (North Train)',
  interventionName = 'Damper Trim 1.042 (Automated Air-Fuel Trim Reset)',
  verificationSources = [
    'Continuous Optical CEMS Stream (EPA PS-2 Compliant)',
    'Thermal Flue Gas Pyrometry (-18.4°C normalisation)',
    'Continuous Ambient Opacity Monitoring (<5% visual return)',
    'Fuel Manifold Stoichiometric Differential Consistency',
    'Third-Party Auditor MRV Audit Package Readiness (ISO 14064-2)',
  ],
  isVerified = true,
  className = '',
}: ReductionWedgeProps) {
  return (
    <div className={`p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-5 ${className}`}>
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242A27]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A8C83A]">
              Measured Environmental Restoration
            </span>
            <StateBadge state={isVerified ? 'VERIFIED' : 'SIMULATED'} size="sm" />
          </div>
          <h3 className="text-base font-bold text-[#F1F3EE]">
            The Environmental Reduction Wedge
          </h3>
          <p className="text-xs text-[#929A95] font-mono mt-0.5">
            {facilityName} · {sourceName}
          </p>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-mono text-[#626A65] uppercase">Intervention Applied</div>
          <div className="text-xs font-mono font-semibold text-[#F1F3EE]">{interventionName}</div>
        </div>
      </div>

      {/* ── HERO REDUCTION WEDGE NUMBERS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Hero: Daily CO2e */}
        <div className="p-4 rounded bg-[#080A09] border border-[#242A27] relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#626A65] uppercase mb-1">
            <span>Direct Abatement</span>
            <ArrowDownRight size={13} className="text-[#A8C83A]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#F1F3EE]">
              -{dailyReductionTons.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-[#A8C83A]">tCO₂e / day</span>
          </div>
          <div className="text-[10px] font-mono text-[#929A95] mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A8C83A]" />
            <span>Measured continuous reduction</span>
          </div>
        </div>

        {/* Annualized Projection */}
        <div className="p-4 rounded bg-[#080A09] border border-[#242A27]">
          <div className="text-[10px] font-mono text-[#626A65] uppercase mb-1">
            Annualized Impact
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#F1F3EE]">
              {annualizedReductionTons.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#929A95]">tCO₂e / year</span>
          </div>
          <div className="text-[10px] font-mono text-[#626A65] mt-1.5">
            Calculation: 14.2 × 365 days
          </div>
        </div>

        {/* NOx Criteria Pollutant */}
        <div className="p-4 rounded bg-[#080A09] border border-[#242A27]">
          <div className="text-[10px] font-mono text-[#626A65] uppercase mb-1">
            Community Criteria Air Abatement
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#C4DF61]">
              -{noxDailyReductionKg.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-[#929A95]">kg NOx / day</span>
          </div>
          <div className="text-[10px] font-mono text-[#626A65] mt-1.5">
            131.4 mg/Nm³ → 88.5 mg/Nm³ stack exit
          </div>
        </div>
      </div>

      {/* ── VISUAL WEDGE GRAPHIC ────────────────────────────────────────── */}
      <div className="p-4 rounded bg-[#080A09] border border-[#242A27] space-y-3">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#626A65]">
          <span>BEFORE INTERVENTION (104.2 tCO₂e/d)</span>
          <span className="text-[#A8C83A] font-semibold">REDUCTION WEDGE (-14.2 t/d)</span>
          <span>POST-ACTION (90.0 tCO₂e/d)</span>
        </div>

        {/* Stacked Horizon Bar */}
        <div className="relative h-6 w-full rounded bg-[#141817] flex overflow-hidden border border-[#242A27]">
          {/* Base load */}
          <div
            className="h-full bg-[#1C221F] flex items-center justify-center text-[10px] font-mono text-[#929A95]"
            style={{ width: '86.4%' }}
          >
            Sustained Post-Action Baseline: 90.0 t/d
          </div>
          {/* Abatement Wedge */}
          <div
            className="h-full bg-[#A8C83A] flex items-center justify-center text-[10px] font-mono text-[#080A09] font-bold"
            style={{ width: '13.6%' }}
          >
            -13.6%
          </div>
        </div>
      </div>

      {/* ── VERIFICATION SOURCES ────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#929A95]">
          MRV Verification & Evidence Sources (ISO 14064-2 Compliant)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {verificationSources.map((src, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 rounded bg-[#080A09] border border-[#242A27] text-[#929A95]"
            >
              <CheckCircle2 size={13} className="text-[#A8C83A] shrink-0" />
              <span className="truncate">{src}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MANDATORY CARBON CREDIT DISCLAIMER ──────────────────────────── */}
      <div className="p-3.5 rounded bg-[#101412] border border-[#242A27] text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase font-bold text-[#F1F3EE]">
            Potential Creditable Reduction
          </span>
          <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            AUDIT READINESS ONLY
          </span>
        </div>
        <div className="font-mono text-sm text-[#F1F3EE]">
          Estimated Volume: <strong className="text-[#A8C83A]">5,183 tCO₂e</strong>
        </div>
        <p className="text-[11px] text-[#929A95] leading-relaxed">
          ONER estimates emissions reductions and MRV readiness. Actual environmental or
          carbon-credit issuance requires an applicable methodology, eligibility assessment and
          independent third-party verification.
        </p>
      </div>
    </div>
  );
}
