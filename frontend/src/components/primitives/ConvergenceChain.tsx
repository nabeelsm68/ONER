'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Camera,
  MapPin,
  Clock,
  Wind,
  Cpu,
  History,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Wrench,
  TrendingDown,
  Award,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import StateBadge from './StateBadge';

export interface ConvergenceChainProps {
  caseId?: string;
  corroborationScore?: number;
  anomalyScore?: number;
  rootCauseConfidence?: number;
  interactive?: boolean;
  className?: string;
}

export default function ConvergenceChain({
  caseId = 'COMM-2026-00421',
  corroborationScore = 89.4,
  anomalyScore = 0.884,
  rootCauseConfidence = 99.4,
  interactive = true,
  className = '',
}: ConvergenceChainProps) {
  const [activeStep, setActiveStep] = useState<number>(2); // Default to Corroborated Core

  const strands = [
    {
      id: 'photo',
      name: 'Resident Photo',
      detail: 'Flue stack smoke opacity >25%',
      source: 'Citizen mobile capture',
      status: 'Captured with metadata',
      weight: '10%',
      icon: Camera,
    },
    {
      id: 'gps',
      name: 'Consensual GPS',
      detail: '0.42 km from North Train (±4.2m)',
      source: 'Captured with consent',
      status: 'Proximity confirmed',
      weight: '20%',
      icon: MapPin,
    },
    {
      id: 'time',
      name: 'ISO Timestamp',
      detail: '14:28:10 UTC (±12s synchronization)',
      source: 'Network NTP clock',
      status: 'Temporal lock',
      weight: '15%',
      icon: Clock,
    },
    {
      id: 'sensor',
      name: 'Ambient PM2.5 Sensor',
      detail: 'Downwind sensor AQI spike (+117%)',
      source: 'Boundary fence network',
      status: 'Signal correlated',
      weight: '15%',
      icon: Wind,
    },
    {
      id: 'telemetry',
      name: 'Facility Telemetry',
      detail: 'Combustion temp +18.4°C / NOx +31.4%',
      source: 'Simulated CEMS & DCS stream',
      status: 'Anomaly 0.884 (Isolation Forest)',
      weight: '30%',
      icon: Cpu,
    },
    {
      id: 'baseline',
      name: 'Historical Baseline',
      detail: 'Exceeds 90-day seasonal percentile',
      source: 'Baseline library',
      status: 'Deviation validated',
      weight: '10%',
      icon: History,
    },
  ];

  const downstreamStages = [
    {
      num: '03',
      name: 'ROOT CAUSE',
      label: 'EXPLAINED',
      badge: '99.4% CONFIDENCE',
      title: 'Burner Refractory Fouling',
      description: 'Thermal efficiency degradation in Furnace F-101 North burner plenum 4B.',
      icon: ShieldCheck,
      link: '/investigation',
    },
    {
      num: '04',
      name: 'ACTION',
      label: 'ACTED',
      badge: 'APPLIED SETPOINT',
      title: 'Damper Trim 1.042',
      description: 'Air-fuel stoichiometric loop reset; excess air trimmed by 4.2%.',
      icon: Wrench,
      link: '/simulator',
    },
    {
      num: '05',
      name: 'VERIFY',
      label: 'VERIFIED',
      badge: 'MRV AUDIT READY',
      title: 'CEMS & Thermal Restoration',
      description: '-14.2 tCO₂e/day (5,183 t/yr) reduction verified via continuous telemetry.',
      icon: TrendingDown,
      link: '/carbon',
    },
    {
      num: '06',
      name: 'RETURN',
      label: 'RETURNED',
      badge: '+50 IMPACT POINTS',
      title: 'Community Notification',
      description: 'Field dossier updated; citizen informed that smoke stack has normalized.',
      icon: Award,
      link: `/case/${caseId}?level=impact`,
    },
  ];

  return (
    <div className={`p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-6 ${className}`}>
      {/* ── TOP BANNER ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#242A27]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A8C83A]">
              The Core Architectural Primitives
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-[#929A95] border border-[#242A27]">
              CASE: {caseId}
            </span>
            <StateBadge state="CORROBORATED" size="sm" />
          </div>
          <h2 className="text-base md:text-lg font-bold text-[#F1F3EE]">
            The Convergence Chain
          </h2>
          <p className="text-xs text-[#929A95] max-w-2xl font-sans mt-0.5">
            Six independent environmental strands converge into a single corroborated event core,
            traversing from citizen observation to measured industrial restoration.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/case/${caseId}`}
            className="px-3 py-1.5 rounded bg-[#141817] hover:bg-[#1D2320] border border-[#242A27] text-xs font-semibold text-[#F1F3EE] hover:text-[#C4DF61] transition-colors flex items-center gap-1.5"
          >
            <span>Open Case Dossier</span>
            <ArrowRight size={13} className="text-[#A8C83A]" />
          </Link>
        </div>
      </div>

      {/* ── DESKTOP CONVERGENCE VISUALIZATION (>= 720px) ────────────────────────── */}
      <div className="hidden lg:block space-y-4">
        <div className="grid grid-cols-12 gap-3 items-stretch">
          {/* LEFT: 6 EVIDENCE STRANDS (4 cols) */}
          <div className="col-span-4 space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-[#626A65] tracking-wider mb-2 flex items-center justify-between">
              <span>01. SIX EVIDENCE STRANDS</span>
              <span>INDEPENDENT FUSION</span>
            </div>
            {strands.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.id}
                  className="p-2 rounded bg-[#080A09] border border-[#242A27] flex items-center justify-between text-xs hover:border-[#38423E] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon size={13} className="text-[#A8C83A] shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold text-[#F1F3EE] truncate">{s.name}</div>
                      <div className="text-[10px] font-mono text-[#626A65] truncate">{s.detail}</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#929A95] shrink-0 ml-2">
                    {s.weight}
                  </span>
                </div>
              );
            })}
          </div>

          {/* CENTER: THE CONVERGED EVENT CORE (3 cols) */}
          <div className="col-span-3 flex flex-col justify-center">
            <div className="text-[10px] font-mono uppercase text-[#626A65] tracking-wider mb-2 text-center">
              02. CORROBORATED CORE
            </div>
            <div className="p-4 rounded-lg bg-[#141817] border border-[#A8C83A]/40 shadow-sm relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#A8C83A] font-bold">
                  EVENT CORE
                </span>
                <span className="w-2 h-2 rounded-full bg-[#A8C83A] animate-pulse" />
              </div>

              <div>
                <div className="text-3xl font-bold font-mono text-[#F1F3EE]">
                  {corroborationScore}%
                </div>
                <div className="text-xs font-semibold text-[#A8C83A] mt-0.5">
                  Multi-Source Corroborated
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#242A27] text-[11px] font-mono">
                <div className="flex justify-between text-[#929A95]">
                  <span>Isolation Forest:</span>
                  <span className="text-[#F1F3EE] font-bold">{anomalyScore}</span>
                </div>
                <div className="flex justify-between text-[#929A95]">
                  <span>NOx Surge:</span>
                  <span className="text-amber-400 font-bold">+31.4%</span>
                </div>
                <div className="flex justify-between text-[#929A95]">
                  <span>Flue Temp:</span>
                  <span className="text-amber-400 font-bold">+18.4°C</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] font-mono text-[#626A65] text-center border-t border-[#242A27]">
                Deterministic Multi-Source Agreement
              </div>
            </div>
          </div>

          {/* RIGHT: DOWNSTREAM PHASES (5 cols) */}
          <div className="col-span-5 space-y-2">
            <div className="text-[10px] font-mono uppercase text-[#626A65] tracking-wider mb-2 flex items-center justify-between">
              <span>03-06. CAUSAL & RESTORATION STAGES</span>
              <span>CONTINUOUS TRACE</span>
            </div>
            <div className="space-y-2">
              {downstreamStages.map((stage) => {
                const Icon = stage.icon;
                return (
                  <Link
                    key={stage.num}
                    href={stage.link}
                    className="block p-2.5 rounded bg-[#080A09] hover:bg-[#141817] border border-[#242A27] hover:border-[#3A4540] transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#626A65]">{stage.num}</span>
                        <span className="font-bold text-[#F1F3EE]">{stage.name}</span>
                        <span className="text-[10px] font-mono text-[#A8C83A]">({stage.label})</span>
                      </div>
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#101412] text-[#929A95] border border-[#242A27]">
                        {stage.badge}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#929A95]">{stage.title}</div>
                    <div className="text-[11px] text-[#626A65] truncate mt-0.5 font-sans">
                      {stage.description}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE / VERTICAL CONVERGENCE CHAIN (< 720px) ────────────────────────── */}
      <div className="lg:hidden space-y-4">
        {/* Step 1: Seen */}
        <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] text-[#A8C83A] font-bold">STEP 01 · SEEN</span>
            <span className="text-[10px] font-mono text-[#626A65]">Resident Observation</span>
          </div>
          <div className="text-xs text-[#F1F3EE]">Resident photographs smoke plume near North Processing Train.</div>
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-mono text-[#929A95]">
            <div className="p-1.5 rounded bg-[#0E1110] border border-[#242A27]">Photo + Metadata</div>
            <div className="p-1.5 rounded bg-[#0E1110] border border-[#242A27]">Consensual GPS</div>
          </div>
        </div>

        {/* Step 2: Fused Core */}
        <div className="p-4 rounded bg-[#141817] border border-[#A8C83A]/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#A8C83A] font-bold">STEP 02 · FUSED</span>
            <StateBadge state="CORROBORATED" size="sm" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1F3EE]">{corroborationScore}% Corroborated</div>
          <div className="text-xs text-[#929A95]">
            6 independent signals verified anomaly: Isolation Forest 0.884, Flue Temp +18.4°C, NOx +31.4%.
          </div>
        </div>

        {/* Step 3: Explained */}
        <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] text-[#A8C83A] font-bold">STEP 03 · EXPLAINED</span>
            <span className="font-mono text-[10px] text-[#929A95]">Support: {rootCauseConfidence}%</span>
          </div>
          <div className="text-xs font-semibold text-[#F1F3EE]">Burner Refractory Fouling</div>
          <div className="text-[11px] text-[#626A65]">Thermal efficiency degradation in Furnace F-101.</div>
        </div>

        {/* Step 4: Acted */}
        <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] text-[#A8C83A] font-bold">STEP 04 · ACTED</span>
            <span className="font-mono text-[10px] text-[#A8C83A]">Damper Trim 1.042</span>
          </div>
          <div className="text-xs font-semibold text-[#F1F3EE]">Air-Fuel Stoichiometric Reset</div>
          <div className="text-[11px] text-[#626A65]">Excess air trimmed by 4.2% on burner train.</div>
        </div>

        {/* Step 5: Verified */}
        <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] text-[#A8C83A] font-bold">STEP 05 · VERIFIED</span>
            <span className="font-mono text-[10px] text-[#A8C83A]">14.2 tCO₂e/day</span>
          </div>
          <div className="text-xs font-semibold text-[#F1F3EE]">MRV Telemetry Confirmation</div>
          <div className="text-[11px] text-[#626A65]">5,183 tCO₂e/yr annualized abatement confirmed by CEMS.</div>
        </div>

        {/* Step 6: Returned */}
        <div className="p-3 rounded bg-[#101412] border border-[#242A27] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] text-[#A8C83A] font-bold">STEP 06 · RETURNED</span>
            <span className="font-mono text-[10px] text-[#C4DF61]">+50 Points</span>
          </div>
          <div className="text-xs font-semibold text-[#F1F3EE]">Citizen Resolution Hand-Off</div>
          <div className="text-[11px] text-[#626A65]">Full outcome delivered to resident field journal.</div>
        </div>
      </div>

      {/* ── FOOTER TRANSPARENCY NOTICE ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#242A27] text-[10px] font-mono text-[#626A65]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A8C83A]" />
          <span>EVIDENCE PRINCIPLE: PHOTO ≠ TRUTH · DETERMINISTIC FUSION</span>
        </div>
        <div>
          <span>DEMO DATA · SIMULATED TELEMETRY</span>
        </div>
      </div>
    </div>
  );
}
