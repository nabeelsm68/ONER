'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AtmosphericShell from '@/components/shell/AtmosphericShell';
import HorizonLine, { HorizonLevel } from '@/components/primitives/HorizonLine';
import StateMark from '@/components/primitives/StateMark';
import DemoTag from '@/components/primitives/DemoTag';
import { ConvergenceChain, CompactChain } from '@/components/chain';
import { api, CommunityReport } from '@/lib/api';
import { CANONICAL_CASE } from '@/lib/seed';
import { useAtmosphere } from '@/lib/atmosphere';
import {
  MapPin,
  Clock,
  Camera,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
  Wrench,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const rawId = resolvedParams.id;
  const caseId = rawId.startsWith('COMM-2026-')
    ? rawId
    : `COMM-2026-${rawId.replace(/^COMM-2026-/, '').padStart(5, '0')}`;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAtmosphere } = useAtmosphere();

  const levelParam = (searchParams.get('level') || 'control') as HorizonLevel;
  const [currentLevel, setCurrentLevel] = useState<HorizonLevel>(levelParam);

  const [report, setReport] = useState<CommunityReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionApplied, setActionApplied] = useState<boolean>(false);

  // Sync atmosphere with current level
  useEffect(() => {
    if (levelParam) {
      setCurrentLevel(levelParam);
      if (levelParam === 'field') {
        setAtmosphere('field');
      } else {
        setAtmosphere('control');
      }
    }
  }, [levelParam, setAtmosphere]);

  const handleLevelChange = (lvl: HorizonLevel) => {
    setCurrentLevel(lvl);
    if (lvl === 'field') {
      setAtmosphere('field');
    } else {
      setAtmosphere('control');
    }
    router.replace(`/case/${caseId}?level=${lvl}`, { scroll: false });
  };

  useEffect(() => {
    async function loadCase() {
      try {
        setLoading(true);
        let data: CommunityReport | null = null;
        try {
          data = await api.getCommunityReport(caseId);
        } catch {
          // If query with full prefix failed, try rawId
          if (rawId !== caseId) {
            data = await api.getCommunityReport(rawId);
          }
        }
        if (data) {
          setReport(data);
        }
      } catch (err) {
        console.warn('Could not fetch case from backend, loading canonical seed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [caseId, rawId]);

  // Use real backend data if present, otherwise fall back to canonical seed
  const displayTitle = report?.title || CANONICAL_CASE.title;
  const displayEquipment = report?.likely_source || CANONICAL_CASE.equipment;
  const displayFacility = report?.correlated_facility || CANONICAL_CASE.facility;
  const displayLocation = report?.location_name || CANONICAL_CASE.locationName;
  const displayTimestamp = report?.timestamp_formatted || CANONICAL_CASE.timestamp;
  const displayPhotoUrl = report?.photo_url || '/evidence/smoke_plume_01.jpg';
  const displayCorroboration = report?.corroboration_score || CANONICAL_CASE.scores.corroboration;

  const isField = currentLevel === 'field';
  const isControl = currentLevel === 'control';
  const isImpact = currentLevel === 'impact';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isField ? 'bg-[#F4F3EC] text-[#1B211C]' : 'bg-[#080A09] text-[#F1F3EE]'
      }`}
      data-atmosphere={isField ? 'field' : 'control'}
    >
      {/* ── Top 56px Atmospheric Shell ───────────────────────── */}
      <AtmosphericShell />

      {/* ── Level Navigation Horizon Header ───────────────────── */}
      <div className={`border-b select-none ${isField ? 'border-[#DAD8CC] bg-[#FBFAF5]' : 'border-[#242A27] bg-[#0E1110]'}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Case Identifier Breadcrumb */}
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <Link
              href="/community"
              className={isField ? 'text-[#7B837C] hover:text-[#1B211C]' : 'text-[#929A95] hover:text-[#F1F3EE]'}
            >
              Cases
            </Link>
            <span className={isField ? 'text-[#DAD8CC]' : 'text-[#626A65]'}>/</span>
            <span className="font-semibold">{caseId}</span>
            <span className={isField ? 'text-[#DAD8CC]' : 'text-[#626A65]'}>·</span>
            <span className={isField ? 'text-[#4F5851]' : 'text-[#929A95]'}>{displayEquipment}</span>
          </div>

          {/* Level Switcher (Field ── Control ── Impact) */}
          <div className="flex items-center gap-1 font-mono text-xs p-0.5 rounded-[2px] border border-[var(--line)] bg-[var(--surface)]">
            {(['field', 'control', 'impact'] as HorizonLevel[]).map((lvl) => {
              const isActive = currentLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleLevelChange(lvl)}
                  className={`px-3 py-1 rounded-[2px] uppercase text-[11px] tracking-wider transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[var(--raised)] text-[var(--accent-ink)] font-semibold shadow-xs'
                      : 'text-[var(--ink-3)] hover:text-[var(--ink)]'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1px Horizon Line dividing surface */}
        <HorizonLine
          activeLevel={currentLevel}
          onLevelChange={handleLevelChange}
          showLabels={false}
          className="my-0"
        />
      </div>

      {/* ── Main Case Content Surface ─────────────────────────── */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* ══════════════════════════════════════════════════════════
            FIELD LEVEL: "What happened with my report?"
            Calm, citizen-readable narrative without raw ML jargon.
            ══════════════════════════════════════════════════════════ */}
        {isField && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Field Header */}
            <div className="space-y-2 border-b border-[#DAD8CC] pb-6">
              <div className="flex items-center gap-2">
                <StateMark state="corroborated" label="Corroborated by available telemetry" />
                <span className="text-[#7B837C] text-xs font-mono">· {displayTimestamp}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#1B211C] tracking-tight">
                {displayTitle}
              </h1>
              <p className="text-sm text-[#4F5851] max-w-2xl leading-relaxed">
                Reported by a resident at {displayLocation.split(',')[0]}. ONER evaluated multiple independent sensor feeds and identified a thermal combustion imbalance at {displayEquipment}.
              </p>
            </div>

            {/* Field Two-Column Layout: Evidence Viewfinder & Chronological Thread */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left 5 Cols: Submitted Evidence Plate */}
              <div className="lg:col-span-5 space-y-4">
                <div className="border border-[#DAD8CC] rounded-[2px] bg-[#FFFFFF] p-3 space-y-3 shadow-sm">
                  {/* Photo container with viewfinder framing */}
                  <div className="relative h-60 rounded-[1px] bg-[#161C18] flex items-center justify-center overflow-hidden">
                    <img
                      src={displayPhotoUrl}
                      alt="Submitted evidence"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 text-[9px] font-mono bg-[#000000]/70 text-[#FFFFFF] px-2 py-0.5 rounded-[1px]">
                      OPTICAL OBSERVATION · 09:42 IST
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs font-mono text-[#4F5851] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#7B837C]">Location</span>
                      <span>{displayLocation}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#7B837C]">Coordinates</span>
                      <span>17.4399° N, 78.3845° E (±12m)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#7B837C]">Nearby equipment</span>
                      <span className="font-semibold text-[#1B211C]">{displayEquipment}</span>
                    </div>
                  </div>
                </div>

                {/* What ONER Checked: Simple Evidence Summary */}
                <div className="p-4 rounded-[2px] border border-[#DAD8CC] bg-[#FFFFFF] space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#7B837C]">
                    What ONER Checked (6 Sources)
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-[#E6E4D9]">
                      <span>1. Resident photograph</span>
                      <span className="font-mono text-[#4F6A0E]">Attached</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[#E6E4D9]">
                      <span>2. Facility proximity model</span>
                      <span className="font-mono text-[#4F6A0E]">F-101 nearby</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[#E6E4D9]">
                      <span>3. Time alignment</span>
                      <span className="font-mono text-[#4F6A0E]">Within ±45s</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[#E6E4D9]">
                      <span>4. Plant stack telemetry</span>
                      <span className="font-mono text-[#4F6A0E]">Elevated NOx (+31.4%)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[#E6E4D9]">
                      <span>5. Regional ambient monitor AQ-04</span>
                      <span className="font-mono text-[#4F6A0E]">PM2.5 spike</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span>6. 90-day historical baseline</span>
                      <span className="font-mono text-[#4F6A0E]">Outside normal</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#7B837C] font-mono pt-1">
                    ONER detected an unusual environmental pattern using multiple sensor channels.
                  </p>
                </div>
              </div>

              {/* Right 7 Cols: Citizen Vertical Chronological Thread */}
              <div className="lg:col-span-7 space-y-4">
                <div className="border border-[#DAD8CC] rounded-[2px] bg-[#FFFFFF] p-6 space-y-6 shadow-sm">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#7B837C] border-b border-[#E6E4D9] pb-2">
                    Case Lifecycle Chronology
                  </div>

                  {/* Vertical Simple Thread */}
                  <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#DAD8CC]">
                    {/* Beat 1: You Reported */}
                    <div className="relative pl-8">
                      <div className="absolute left-2 top-0.5 w-3.5 h-3.5 rounded-full bg-[#4F6A0E] border-2 border-[#FFFFFF]" />
                      <div className="text-xs font-mono text-[#7B837C]">03 Oct 2026, 09:42 IST</div>
                      <div className="text-sm font-semibold text-[#1B211C] mt-0.5">You Reported</div>
                      <p className="text-xs text-[#4F5851] mt-0.5 leading-relaxed">
                        Resident observation filed with optical photo plate and consensual GPS coordinates near Sector 4 perimeter.
                      </p>
                    </div>

                    {/* Beat 2: ONER Checked */}
                    <div className="relative pl-8">
                      <div className="absolute left-2 top-0.5 w-3.5 h-3.5 rounded-full bg-[#4F6A0E] border-2 border-[#FFFFFF]" />
                      <div className="text-xs font-mono text-[#7B837C]">09:42:48 IST</div>
                      <div className="text-sm font-semibold text-[#1B211C] mt-0.5">ONER Checked Evidence</div>
                      <p className="text-xs text-[#4F5851] mt-0.5 leading-relaxed">
                        Six physical telemetry signals evaluated. Continuous CEMS stack probe confirmed combustion drift matching your photograph.
                      </p>
                    </div>

                    {/* Beat 3: Facility Responded */}
                    <div className="relative pl-8">
                      <div className="absolute left-2 top-0.5 w-3.5 h-3.5 rounded-full bg-[#4F6A0E] border-2 border-[#FFFFFF]" />
                      <div className="text-xs font-mono text-[#7B837C]">09:51:30 IST</div>
                      <div className="text-sm font-semibold text-[#1B211C] mt-0.5">Facility Responded</div>
                      <p className="text-xs text-[#4F5851] mt-0.5 leading-relaxed">
                        Orion Refining Complex engineering acknowledged incident. Corrective damper trim setpoint 1.042 applied to Furnace F-101.
                      </p>
                    </div>

                    {/* Beat 4: Result Measured */}
                    <div className="relative pl-8">
                      <div className="absolute left-2 top-0.5 w-3.5 h-3.5 rounded-full bg-[#4F6A0E] border-2 border-[#FFFFFF]" />
                      <div className="text-xs font-mono text-[#7B837C]">10:30:00 IST</div>
                      <div className="text-sm font-semibold text-[#1B211C] mt-0.5">Result Measured</div>
                      <p className="text-xs text-[#4F5851] mt-0.5 leading-relaxed">
                        CEMS optical density normalized. Stack sensors measured 14.2 tCO₂e/day emissions reduction and 28.6 kg/day NOx drop.
                      </p>
                    </div>

                    {/* Beat 5: You Were Informed */}
                    <div className="relative pl-8">
                      <div className="absolute left-2 top-0.5 w-3.5 h-3.5 rounded-full bg-[#4F6A0E] border-2 border-[#FFFFFF]" />
                      <div className="text-xs font-mono text-[#7B837C]">11:00:00 IST</div>
                      <div className="text-sm font-semibold text-[#1B211C] mt-0.5">You Were Informed & Credited</div>
                      <p className="text-xs text-[#4F5851] mt-0.5 leading-relaxed">
                        Verified outcome returned to resident account. +50 Community Impact Points credited for actionable observation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Switch to Operator Control Level prompt */}
                <div className="p-4 rounded-[2px] bg-[#FBFAF5] border border-[#DAD8CC] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#1B211C] block">Are you a facility operator or regulator?</span>
                    <span className="text-[#7B837C] text-[11px]">Inspect the technical evidence ledger and physical root-cause graph.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLevelChange('control')}
                    className="px-3.5 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#DAD8CC] hover:border-[#4F6A0E] text-[#1B211C] font-mono text-xs transition-colors cursor-pointer"
                  >
                    Open Control Level →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            CONTROL LEVEL: "What does ONER know and what do we do?"
            Operator decision instrument & Convergence Chain.
            ══════════════════════════════════════════════════════════ */}
        {isControl && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-[#242A27] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <StateMark state="corroborated" label="Corroboration Score: 89.4 / 100" />
                  <span className="text-[#626A65] text-xs font-mono">· {displayEquipment}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-medium text-[#F1F3EE] mt-1 tracking-tight">
                  {displayTitle}
                </h1>
                <p className="text-xs text-[#929A95] mt-0.5 font-mono">
                  Anomaly Score: 0.884 · Root Cause Support: 99.4/100 · Actuator: Damper Trim 1.042
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/simulator?case=${caseId}`}
                  className="px-3 py-1.5 rounded-[2px] bg-[#141817] hover:bg-[#1A201E] border border-[#242A27] text-xs font-mono text-[#F1F3EE] transition-colors inline-flex items-center gap-1.5"
                >
                  <SlidersHorizontal size={13} className="text-[#A8C83A]" />
                  <span>Open Simulator</span>
                </Link>
              </div>
            </div>

            {/* Flagship Convergence Chain Centerpiece */}
            <div className="bg-[#0E1110] border border-[#242A27] rounded-[2px] p-4 sm:p-6 shadow-xl">
              <ConvergenceChain
                coreScore={displayCorroboration}
                likelyCause="Likely cause"
                causeDetail="Burner fouling · F-101"
                actionName="Action"
                actionDetail="Damper trim 1.042"
                verifiedNotice="Verification"
                verifiedDetail="MRV evidence assembled"
                measuredOutcome="14.2"
                measuredUnit="tCO₂e per day"
                showReturnLine={true}
              />
            </div>

            {/* 5 Precision Control Sections with Hairlines */}
            <div className="space-y-6">
              {/* 1. EVIDENCE */}
              <section className="p-5 rounded-[2px] bg-[#0E1110] border border-[#242A27] space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-[#A8C83A] flex items-center justify-between border-b border-[#181E1C] pb-2">
                  <span>01 · Multi-Source Evidence Ledger</span>
                  <span className="text-[#626A65]">6 of 6 Channels Active</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {CANONICAL_CASE.signals.map((sig) => (
                    <div key={sig.id} className="p-3 rounded-[2px] bg-[#141817] border border-[#242A27] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#F1F3EE]">{sig.name}</span>
                        <span className="font-mono text-[#A8C83A]">+{sig.earned}/{sig.possible}</span>
                      </div>
                      <div className="text-[11px] text-[#929A95]">{sig.description}</div>
                    </div>
                  ))}
                </div>

                {/* Telemetry Deviations */}
                <div className="p-3 rounded-[2px] bg-[#080A09] border border-[#181E1C] font-mono text-xs flex flex-wrap gap-6 text-[#929A95]">
                  <span>NOx Stack: <strong className="text-amber-400">+31.4% (131.4 mg/Nm³)</strong></span>
                  <span>Stack Temp: <strong className="text-amber-400">+18.4°C</strong></span>
                  <span>PM2.5 Ambient: <strong className="text-amber-400">+22.7%</strong></span>
                  <span>Stoichiometric Trim: <strong className="text-amber-400">0.94 (Sub-stoichiometric)</strong></span>
                </div>
              </section>

              {/* 2. CAUSE */}
              <section className="p-5 rounded-[2px] bg-[#0E1110] border border-[#242A27] space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-[#A8C83A] border-b border-[#181E1C] pb-2 flex items-center justify-between">
                  <span>02 · Root Cause Explanation</span>
                  <span className="text-[#929A95] font-mono">Support: 99.4 / 100</span>
                </div>

                <div className="space-y-1">
                  <div className="text-base font-medium text-[#F1F3EE]">
                    Burner refractory fouling + natural gas stoichiometric imbalance
                  </div>
                  <p className="text-xs text-[#929A95] leading-relaxed">
                    Combustion air damper calibration drift caused fuel-rich operating state on Furnace F-101, generating incomplete combustion, unburnt hydrocarbons, and elevated NOx plume visible from boundary fence.
                  </p>
                </div>
              </section>

              {/* 3. OPTIONS */}
              <section className="p-5 rounded-[2px] bg-[#0E1110] border border-[#242A27] space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-[#A8C83A] border-b border-[#181E1C] pb-2">
                  <span>03 · Intervention Decision Matrix</span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Option A: Do Nothing */}
                  <div className="p-3 rounded-[2px] bg-[#141817] border border-[#242A27] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#F1F3EE]">Do Nothing (Maintain Status Quo)</div>
                      <div className="text-[11px] text-[#929A95]">NOx remains +31.4% above regulatory pact limit · Risk of Level 1 notice</div>
                    </div>
                    <span className="font-mono text-amber-400 text-xs">Pact Conflict</span>
                  </div>

                  {/* Option B: Damper Trim (Recommended) */}
                  <div className="p-3 rounded-[2px] bg-[#141817] border border-[#A8C83A]/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#A8C83A] flex items-center gap-2">
                        <span>Damper Trim 1.042 Compensation</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#A8C83A]/20 text-[#A8C83A]">RECOMMENDED</span>
                      </div>
                      <div className="text-[11px] text-[#929A95]">Reset stoichiometric loop · NOx −28.6 kg/day · CO₂e −14.2 t/day drop</div>
                    </div>
                    <span className="font-mono text-[#A8C83A] text-xs font-semibold">14.2 t/day Cut</span>
                  </div>

                  {/* Option C: Overhaul */}
                  <div className="p-3 rounded-[2px] bg-[#141817] border border-[#242A27] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#F1F3EE]">Complete Burner Refractory Overhaul</div>
                      <div className="text-[11px] text-[#929A95]">Requires 48-hour scheduled plant shutdown · Est. cost $85,000</div>
                    </div>
                    <span className="font-mono text-[#929A95] text-xs">Scheduled Window</span>
                  </div>
                </div>
              </section>

              {/* 4. ACTION */}
              <section className="p-5 rounded-[2px] bg-[#0E1110] border border-[#242A27] space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-[#A8C83A] border-b border-[#181E1C] pb-2 flex items-center justify-between">
                  <span>04 · Operational Actuator Lifecycle</span>
                  <span className="text-[#626A65]">Work Order #WO-8821</span>
                </div>

                {/* Lifecycle Step Rail */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-[2px] bg-[#141817] border border-[#A8C83A] text-[#A8C83A]">
                    ✓ Acknowledge
                  </div>
                  <div className="p-2 rounded-[2px] bg-[#141817] border border-[#A8C83A] text-[#A8C83A]">
                    ✓ Investigate
                  </div>
                  <div className="p-2 rounded-[2px] bg-[#141817] border border-[#A8C83A] text-[#A8C83A]">
                    ✓ Simulate
                  </div>
                  <div className={`p-2 rounded-[2px] border ${actionApplied ? 'bg-[#141817] border-[#A8C83A] text-[#A8C83A]' : 'bg-[#141817] border-amber-400 text-amber-400'}`}>
                    {actionApplied ? '✓ Applied' : '● In Progress'}
                  </div>
                  <div className="p-2 rounded-[2px] bg-[#080A09] border border-[#242A27] text-[#626A65]">
                    Verify
                  </div>
                  <div className="p-2 rounded-[2px] bg-[#080A09] border border-[#242A27] text-[#626A65]">
                    Resolve
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs font-mono text-[#929A95]">
                    Lead Engineer: <strong>M. Rao (Chief Combustion Engineer)</strong> · Target: 11:30 IST
                  </div>
                  <button
                    type="button"
                    onClick={() => setActionApplied(true)}
                    className="px-4 py-2 rounded-[2px] bg-[#A8C83A] hover:bg-[#99B732] text-[#121A0A] font-medium text-xs font-mono transition-colors cursor-pointer"
                  >
                    {actionApplied ? 'Damper Trim Applied ✓' : 'Execute Damper Trim 1.042'}
                  </button>
                </div>
              </section>

              {/* 5. VERIFY */}
              <section className="p-5 rounded-[2px] bg-[#0E1110] border border-[#242A27] space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-[#A8C83A] border-b border-[#181E1C] pb-2 flex items-center justify-between">
                  <span>05 · Verification & MRV Assembly</span>
                  <span className="text-[#A8C83A] font-mono">MRV READY</span>
                </div>

                <p className="text-xs text-[#929A95] leading-relaxed">
                  CEMS stack optical density and O2 trim logging continuous verification stream at 1.0 Hz. ISO 14064-2 digital abatement pack assembled. Third-party carbon registry verification pending.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            IMPACT LEVEL: "What changed?"
            Hero Reduction Wedge & Citizen Return Loop.
            ══════════════════════════════════════════════════════════ */}
        {isImpact && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div className="border-b border-[#242A27] pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded-[1px] bg-[#A8C83A]/20 text-[#A8C83A] border border-[#A8C83A]/40 font-semibold">
                  MRV READY
                </span>
                <span className="text-[#929A95] text-xs font-mono">· Measured Reduction Outcome</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-light text-[#F1F3EE] mt-2 font-mono">
                -14.2 tCO₂e / day
              </h1>
              <p className="text-xs text-[#929A95] mt-1 font-mono">
                Annualized Potential: 5,183 tCO₂e/year · NOx drop: 28.6 kg/day · Furnace F-101
              </p>
            </div>

            {/* Hero Reduction Wedge Visualization */}
            <div className="p-6 rounded-[2px] bg-[#0E1110] border border-[#242A27] space-y-6">
              <div className="text-xs font-mono uppercase tracking-wider text-[#A8C83A] border-b border-[#181E1C] pb-2 flex items-center justify-between">
                <span>The Reduction Wedge</span>
                <span className="text-[#626A65]">Baseline vs Post-Intervention CEMS Mean</span>
              </div>

              {/* Wedge SVG Chart */}
              <div className="w-full overflow-x-auto">
                <svg viewBox="0 0 760 300" className="w-full min-w-[650px] h-auto font-sans" role="img" aria-label="Reduction wedge diagram">
                  <defs>
                    <linearGradient id="wedgeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A8C83A" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#A8C83A" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  {/* Wedge polygon: between baseline mean (y=50) and post-action level (y=210) */}
                  <polygon points="380,50 740,50 740,210 380,210" fill="url(#wedgeFill)" stroke="#A8C83A" strokeWidth="1" />

                  {/* Baseline Pre-intervention polyline */}
                  <polyline fill="none" stroke="#929A95" strokeWidth="1.5" points="20,52 60,44 100,58 140,46 180,54 220,42 260,56 300,48 340,52 380,50" />

                  {/* Post-action Measured polyline */}
                  <polyline fill="none" stroke="#A8C83A" strokeWidth="2.5" points="380,50 410,150 450,214 490,206 530,216 570,208 610,214 650,206 690,214 740,210" />

                  {/* Horizontal baseline dashed line */}
                  <line x1="20" y1="50" x2="740" y2="50" stroke="#626A65" strokeDasharray="4 4" />

                  {/* Vertical intervention line */}
                  <line x1="380" y1="20" x2="380" y2="270" stroke="#F1F3EE" strokeWidth="1.5" />

                  {/* Measurement inside wedge */}
                  <text x="410" y="145" fill="#F1F3EE" fontSize="96" fontWeight="300" fontFamily="Geist Mono">14.2</text>
                  <text x="414" y="175" fill="#C9CFC9" fontSize="15">tCO₂e per day, measured</text>

                  {/* Phase Labels along bottom */}
                  <g fill="#929A95" fontSize="12" fontFamily="Geist Mono">
                    <text x="20" y="288">Before: 104.2 tCO₂e/day baseline</text>
                    <text x="392" y="288">Damper trim 1.042 applied</text>
                    <text x="560" y="288">After: 90.0 tCO₂e/day (measured)</text>
                  </g>
                </svg>
              </div>

              {/* Annualized Metric & Disclosure */}
              <div className="pt-4 border-t border-[#181E1C] flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 text-xs">
                <div>
                  <div className="font-mono text-3xl font-light text-[#F1F3EE]">5,183</div>
                  <div className="text-[11px] font-mono text-[#929A95]">tCO₂e per year, annualized (14.2 × 365)</div>
                  <div className="text-[11px] font-mono text-[#A8C83A] mt-1">Potential creditable reduction</div>
                </div>

                <div className="max-w-md text-right font-mono text-[11px] text-[#626A65] leading-relaxed">
                  Notice: Potential creditable reduction is an analytical estimate based on sustained post-action CEMS levels, not an issued carbon credit. Third-party registry audit pending.
                </div>
              </div>
            </div>

            {/* ── Citizen Return Loop (Visual loop closure) ────────── */}
            <div className="p-6 rounded-[2px] bg-[#0E1110] border border-[#A8C83A]/50 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[1px] bg-[#161C18] border border-[#242A27] overflow-hidden shrink-0">
                  <img src={displayPhotoUrl} alt="Citizen evidence" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-mono text-[#A8C83A] font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#A8C83A] animate-pulse" />
                    <span>RETURN LOOP COMPLETED</span>
                  </div>
                  <div className="text-sm font-medium text-[#F1F3EE]">
                    Reported by resident at 09:42 IST · Measured result: 14.2 tCO₂e less per day.
                  </div>
                  <div className="text-xs font-mono text-[#929A95]">
                    Reporter notified in app · +50 Community Impact Points credited.
                  </div>
                </div>
              </div>

              <Link
                href="/community"
                className="px-5 py-2.5 rounded-[2px] bg-[#141817] hover:bg-[#1A201E] border border-[#A8C83A]/40 text-xs font-mono text-[#A8C83A] hover:text-[#F1F3EE] transition-colors shrink-0 cursor-pointer"
              >
                View Community Journal →
              </Link>
            </div>
          </div>
        )}

        {/* Global Prototype Disclosure Footer */}
        <div className="pt-6 border-t border-[var(--line-subtle)] text-[11px] font-mono text-[var(--ink-3)] flex flex-wrap justify-between gap-2 select-none">
          <DemoTag label="Case COMM-2026-00421 · Prototype workflow · Simulated telemetry" variant="subtle" />
          <span>Potential creditable reduction is an estimate, not an issued carbon credit.</span>
        </div>
      </main>
    </div>
  );
}
