'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AtmosphericShell from '@/components/shell/AtmosphericShell';
import HorizonLine, { HorizonLevel } from '@/components/primitives/HorizonLine';
import StateMark from '@/components/primitives/StateMark';
import DemoTag from '@/components/primitives/DemoTag';
import { ReductionWedge } from '@/components/primitives';
import { api, CommunityReport } from '@/lib/api';
import { CANONICAL_CASE } from '@/lib/seed';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Activity,
  Layers,
  Sparkles,
  Camera,
  MapPin,
  Clock,
  TrendingDown,
  Info,
  Award,
} from 'lucide-react';

function CarbonInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawCase = searchParams.get('case') || 'COMM-2026-00421';
  const caseId = rawCase.startsWith('COMM-2026-')
    ? rawCase
    : `COMM-2026-${rawCase.replace(/^COMM-2026-/, '').padStart(5, '0')}`;

  const [report, setReport] = useState<CommunityReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadCaseData() {
      try {
        setLoading(true);
        const data = await api.getCommunityReport(caseId);
        if (data) setReport(data);
      } catch (err) {
        console.warn('Carbon page report lookup fallback to seed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCaseData();
  }, [caseId]);

  return (
    <div
      className="min-h-screen flex flex-col bg-[#080A09] text-[#F1F3EE] transition-colors duration-300"
      data-atmosphere="control"
    >
      {/* ── Top 56px Global Command Bar ─────────────────────────── */}
      <AtmosphericShell />

      {/* ── Case Horizon Level Switcher (IMPACT Active) ─────────── */}
      <div className="border-b border-[#242A27] bg-[#0E1110] select-none">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Breadcrumb back to Simulator */}
          <div className="flex items-center gap-2 font-mono text-xs text-[#929A95]">
            <Link
              href={`/simulator?case=${caseId}`}
              className="inline-flex items-center gap-1.5 text-[#F1F3EE] hover:text-[#A8C83A] transition-colors"
            >
              <ArrowLeft size={13} />
              <span>SIMULATOR ({caseId})</span>
            </Link>
            <span>/</span>
            <span className="text-[#A8C83A] font-bold">CARBON + MRV VERIFICATION</span>
          </div>

          {/* Level Switcher (IMPACT active) */}
          <div className="flex items-center gap-4">
            <HorizonLine
              activeLevel="impact"
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
            <Link
              href={`/simulator?case=${caseId}`}
              className="text-[#929A95] hover:text-[#F1F3EE] transition-colors pb-1"
            >
              2. SIMULATE
            </Link>
            <span className="text-[#A8C83A] font-bold flex items-center gap-1.5 border-b-2 border-[#A8C83A] pb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A8C83A]" />
              <span>3. CARBON + MRV</span>
            </span>
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
        {/* Header Strip & Primary Question */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#242A27]">
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-[#A8C83A] uppercase font-bold tracking-wider">
              MEASUREMENT · REPORTING · VERIFICATION (MRV READY)
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#F1F3EE] font-normal tracking-tight">
              What changed, and can we demonstrate it?
            </h1>
            <p className="text-xs sm:text-sm text-[#929A95]">
              Empirical accounting of verified emissions reductions based on continuous optical CEMS telemetry, thermal pyrometry, and ISO 14064-2 audit package assembly.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27] text-right font-mono text-xs">
              <div className="text-[10px] text-[#626A65] uppercase">Verification Status</div>
              <div className="text-[#A8C83A] font-bold flex items-center gap-1.5 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A8C83A]" />
                <span>MRV EVIDENCE ASSEMBLED</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── THE THREE MRV PILLARS (M · R · V) ──────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* M = MEASURE */}
          <div className="p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-[#141817] text-[#A8C83A] font-mono font-bold text-xs flex items-center justify-center border border-[#A8C83A]/40">
                  M
                </span>
                <span className="font-mono text-xs font-bold text-[#F1F3EE] uppercase tracking-wider">
                  MEASURE
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#A8C83A]">Continuous</span>
            </div>

            <div className="space-y-2 text-xs font-mono pt-1">
              <div className="p-2.5 rounded bg-[#080A09] border border-[#181E1C] flex justify-between">
                <span className="text-[#626A65]">Baseline Rate:</span>
                <span className="text-[#F1F3EE] font-bold">104.2 tCO₂e / day</span>
              </div>
              <div className="p-2.5 rounded bg-[#080A09] border border-[#181E1C] flex justify-between">
                <span className="text-[#626A65]">Post-Action Rate:</span>
                <span className="text-[#A8C83A] font-bold">90.0 tCO₂e / day</span>
              </div>
              <div className="p-2.5 rounded bg-[#080A09] border border-[#181E1C] flex justify-between">
                <span className="text-[#626A65]">Tracking Window:</span>
                <span className="text-[#F1F3EE]">4 Hours (09:51–13:51 IST)</span>
              </div>
            </div>
            <div className="text-[11px] text-[#929A95] leading-relaxed">
              Continuous CEMS Station #2 optical telemetry and thermal pyrometry.
            </div>
          </div>

          {/* R = REPORT */}
          <div className="p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-[#141817] text-[#A8C83A] font-mono font-bold text-xs flex items-center justify-center border border-[#A8C83A]/40">
                  R
                </span>
                <span className="font-mono text-xs font-bold text-[#F1F3EE] uppercase tracking-wider">
                  REPORT
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#A8C83A]">Quantified</span>
            </div>

            <div className="space-y-2 text-xs font-mono pt-1">
              <div className="p-2.5 rounded bg-[#080A09] border border-[#181E1C] flex justify-between">
                <span className="text-[#626A65]">Measured Daily GHG:</span>
                <span className="text-[#A8C83A] font-bold">−14.2 tCO₂e / day</span>
              </div>
              <div className="p-2.5 rounded bg-[#080A09] border border-[#181E1C] flex justify-between">
                <span className="text-[#626A65]">Criteria NOx Cut:</span>
                <span className="text-[#A8C83A] font-bold">−28.6 kg / day</span>
              </div>
              <div className="p-2.5 rounded bg-[#080A09] border border-[#181E1C] flex justify-between">
                <span className="text-[#626A65]">Annualized Demo Est:</span>
                <span className="text-[#F1F3EE] font-bold">5,183 tCO₂e / year</span>
              </div>
            </div>
            <div className="text-[11px] text-[#929A95] leading-relaxed">
              Calculation disclosure: 14.2 × 365 = 5,183 tCO₂e/year (Annualized estimate).
            </div>
          </div>

          {/* V = VERIFY */}
          <div className="p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-[#141817] text-[#A8C83A] font-mono font-bold text-xs flex items-center justify-center border border-[#A8C83A]/40">
                  V
                </span>
                <span className="font-mono text-xs font-bold text-[#F1F3EE] uppercase tracking-wider">
                  VERIFY
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#A8C83A]">4/5 Aligned</span>
            </div>

            <div className="space-y-2 text-xs font-mono pt-1">
              <div className="p-2.5 rounded bg-[#080A09] border border-[#181E1C] flex justify-between items-center">
                <span className="text-[#626A65]">Optical CEMS (PS-2):</span>
                <span className="text-[#A8C83A] font-bold">✓ ALIGNED</span>
              </div>
              <div className="p-2.5 rounded bg-[#080A09] border border-[#181E1C] flex justify-between items-center">
                <span className="text-[#626A65]">Thermal Pyrometry:</span>
                <span className="text-[#A8C83A] font-bold">✓ ALIGNED</span>
              </div>
              <div className="p-2.5 rounded bg-[#080A09] border border-[#181E1C] flex justify-between items-center">
                <span className="text-[#626A65]">Third-Party Audit:</span>
                <span className="text-amber-400 font-bold">⏳ PENDING</span>
              </div>
            </div>
            <div className="text-[11px] text-[#929A95] leading-relaxed">
              Package assembled for independent auditor under ISO 14064-2 guidelines.
            </div>
          </div>
        </section>

        {/* ── HERO REDUCTION WEDGE VISUALIZATION ───────────────────── */}
        <section className="space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[#929A95]">
            Hero Outcome Visualization
          </div>

          {/* Full Reduction Wedge Instrument Component */}
          <ReductionWedge
            dailyReductionTons={14.2}
            annualizedReductionTons={5183}
            noxDailyReductionKg={28.6}
            facilityName="Orion Refining Complex"
            sourceName="Furnace F-101 (North Processing Train)"
            interventionName="Damper Trim Compensation to 1.042 (WO #WO-8821)"
            isVerified={true}
          />
        </section>

        {/* ── VERIFICATION LEDGER & MRV EVIDENCE ────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono uppercase tracking-wider text-[#929A95]">
              Empirical Verification Ledger (ISO 14064-2 Compliant)
            </div>
            <div className="flex items-center gap-2">
              <StateMark state="verified" size="sm" showLabel={false} />
              <span className="font-mono text-xs font-bold text-[#A8C83A]">
                MRV READY · 4 / 5 EVIDENCE CHANNELS ALIGNED
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#F1F3EE] font-bold">1. Optical CEMS Probe Stream</span>
                  <span className="text-[#A8C83A]">ALIGNED</span>
                </div>
                <p className="text-[11px] text-[#929A95] font-sans">
                  EPA PS-2 continuous stack probe records NOx returned to 88.5 mg/Nm³ (below 100 limit).
                </p>
              </div>

              <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#F1F3EE] font-bold">2. Thermal Pyrometry Flue Check</span>
                  <span className="text-[#A8C83A]">ALIGNED</span>
                </div>
                <p className="text-[11px] text-[#929A95] font-sans">
                  Exhaust temperature drop of -18.4°C confirms restoration of internal heat exchange.
                </p>
              </div>

              <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#F1F3EE] font-bold">3. Ambient Optical Opacity</span>
                  <span className="text-[#A8C83A]">ALIGNED</span>
                </div>
                <p className="text-[11px] text-[#929A95] font-sans">
                  Camera and perimeter optical transmissometer show stack plume opacity normalized below 5%.
                </p>
              </div>

              <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#F1F3EE] font-bold">4. Fuel Manifold Stoichiometry</span>
                  <span className="text-[#A8C83A]">ALIGNED</span>
                </div>
                <p className="text-[11px] text-[#929A95] font-sans">
                  Air/fuel ratio telemetry shifted from 0.94 to 1.05 design optimum; unburnt hydrocarbons cleared.
                </p>
              </div>

              <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27] space-y-1 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#F1F3EE] font-bold">5. Third-Party Independent Audit Package</span>
                  <span className="text-amber-400">PENDING AUDIT</span>
                </div>
                <p className="text-[11px] text-[#929A95] font-sans">
                  Digital audit dossier assembled with raw 10-second CEMS logs, maintenance work order #WO-8821, and Pact Clause 4.2 timestamp seals. Ready for certifying body review.
                </p>
              </div>
            </div>

            {/* Mandatory Honesty & Creditable Disclosure */}
            <div className="p-4 rounded bg-[#141817] border border-[#242A27] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#F1F3EE] uppercase tracking-wider">
                  Potential Creditable Reduction
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  AUDIT READINESS ONLY
                </span>
              </div>
              <p className="text-xs text-[#929A95] leading-relaxed">
                Eligibility, methodology, additionality and independent verification would be required before any carbon-credit issuance. ONER does not issue carbon credits or claim third-party certification until formally certified by an accredited registry.
              </p>
            </div>
          </div>
        </section>

        {/* ── RETURN TO COMMUNITY LOOP (FINAL NETWORK CLOSURE) ─────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#A8C83A]" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#A8C83A] font-bold">
              Accountability Loop Closure · Return to Resident
            </h3>
          </div>

          <div className="p-6 rounded-lg bg-[#0E1110] border-2 border-[#A8C83A]/70 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_0_24px_rgba(168,200,58,0.08)]">
            <div className="flex items-start sm:items-center gap-4">
              {/* Photo Thumbnail */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded bg-[#080A09] border border-[#242A27] shrink-0 overflow-hidden relative flex items-center justify-center">
                <img
                  src="/evidence/smoke_plume_01.jpg"
                  alt="Citizen evidence"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback visual glyph
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <Camera size={20} className="text-[#626A65] absolute" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-[#A8C83A]">{caseId}</span>
                  <span className="text-[#626A65]">·</span>
                  <span className="text-[#929A95]">Reported by a resident at 09:42 IST</span>
                </div>
                <h4 className="text-base font-bold text-[#F1F3EE]">
                  Measured result: 14.2 tCO₂e less per day.
                </h4>
                <p className="text-xs text-[#929A95]">
                  Result returned to the resident. The community observation initiated sensor corroboration, engineering setpoint trim, and measurable regional air restoration.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-[2px] bg-[#A8C83A]/10 text-[#A8C83A] font-mono font-bold text-xs border border-[#A8C83A]/30">
                    +50 Community Impact Points Awarded
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <Link
                href="/community"
                className="px-4 py-2.5 rounded bg-[#141817] hover:bg-[#1C221F] border border-[#242A27] text-xs font-mono text-[#F1F3EE] hover:text-[#A8C83A] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>VIEW IN COMMUNITY JOURNAL</span>
                <ArrowRight size={13} />
              </Link>
              <Link
                href={`/case/${caseId}?level=impact`}
                className="px-4 py-2.5 rounded bg-[#A8C83A] hover:bg-[#b8d844] text-[#080A09] text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>RETURN TO CASE</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-[#181E1C] bg-[#0E1110] mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-[#626A65]">
          <div className="flex items-center gap-2">
            <span>ISO 14064-2 MRV PROTOCOL</span>
            <span>·</span>
            <span>EPA PS-2 CEMS SPEC</span>
            <span>·</span>
            <span>PACT CLAUSE 4.2</span>
          </div>
          <div>
            <DemoTag label="Demo data · Simulated telemetry · Prototype workflow" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CarbonPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080A09] text-white p-8">Loading Carbon & MRV instrument...</div>}>
      <CarbonInner />
    </Suspense>
  );
}
