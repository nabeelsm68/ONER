'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import AtmosphericShell from '@/components/shell/AtmosphericShell';
import { ConvergenceChain, VerticalChain, CompactChain } from '@/components/chain';
import HorizonLine from '@/components/primitives/HorizonLine';
import DemoTag from '@/components/primitives/DemoTag';
import { CANONICAL_CASE } from '@/lib/seed';
import { ArrowRight, Camera, Factory, ShieldCheck, Check, Play, Pause, RotateCcw } from 'lucide-react';

interface SeedRow {
  id: string;
  label: string;
  signals: number[];
  status: string;
  score: string;
}

const SEED_CASES: SeedRow[] = [
  { id: '00421', label: 'COMM-2026-00421 · Orion Refining', signals: [42, 96, 94, 95, 92, 96], status: 'Measured result', score: '89.4' },
  { id: '00398', label: 'COMM-2026-00398 · Canal Outfall 3', signals: [70, 80, 60, 75, 20, 40], status: 'Government review', score: '64.2' },
  { id: '00405', label: 'COMM-2026-00405 · West Gate Colony', signals: [90, 85, 80, 80, 75, 82], status: 'Resolved', score: '82.1' },
  { id: '00376', label: 'COMM-2026-00376 · Deccan Clinker', signals: [30, 15, 0, 0, 0, 0], status: 'Corroborating', score: '31.0' },
  { id: '00412', label: 'COMM-2026-00412 · CT-3 Fan Rotor', signals: [80, 75, 78, 80, 70, 78], status: 'Industry action', score: '78.5' },
];

export default function HomePage() {
  // Evidence fusion interactive toggle state: all 6 signals active by default
  const allSignalIds = useMemo(() => CANONICAL_CASE.signals.map((s) => s.id), []);
  const [activeSignalIds, setActiveSignalIds] = useState<string[]>(allSignalIds);

  // Animation cycle & timing state machine
  // 0: Field observation (0.0s - 1.2s)
  // 1: Seed to Horizon (1.2s - 2.0s)
  // 2: Horizon transport pulse & Evidence Convergence (2.0s - 4.0s)
  // 3: Core Corroboration (4.0s - 5.0s)
  // 4: Likely Cause (5.0s - 6.0s)
  // 5: Action (6.0s - 6.8s)
  // 6: Measured Result (6.8s - 7.8s)
  // 7: Return Loop (7.8s - 9.5s)
  // 8: Loop Complete & Citizen Credit (9.5s - 11.5s)
  const [animStage, setAnimStage] = useState<number>(0);
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const [returnLoopCompleted, setReturnLoopCompleted] = useState<boolean>(false);

  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Controlled Animation Sequencer
  useEffect(() => {
    // If user has interacted, pause the automatic cycling
    if (!isPlaying) {
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      return;
    }

    const stageTimings = [
      1200, // 0 -> 1 (Field observation)
      800,  // 1 -> 2 (Seed travels to Horizon)
      2000, // 2 -> 3 (Evidence convergence pipes draw)
      1000, // 3 -> 4 (Core corroboration locks)
      1000, // 4 -> 5 (Likely cause reveals)
      800,  // 5 -> 6 (Action damper trim reveals)
      1000, // 6 -> 7 (Measured result reveals)
      1700, // 7 -> 8 (Return signal loops to citizen plate)
      2000, // 8 -> 0 (Hold final state then reset cycle)
    ];

    loopTimerRef.current = setTimeout(() => {
      setAnimStage((prev) => {
        if (prev === 7) {
          setReturnLoopCompleted(true);
        }
        if (prev >= 8) {
          // Soft restart cycle
          setCycleCount((c) => c + 1);
          setReturnLoopCompleted(false);
          return 0;
        }
        return prev + 1;
      });
    }, stageTimings[animStage] || 1500);

    return () => {
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    };
  }, [animStage, isPlaying, cycleCount]);

  // Interactive toggle actions
  const toggleSignal = (id: string) => {
    setUserInteracted(true);
    setIsPlaying(false); // Pause loop so user has full control
    setAnimStage(8);     // Jump to resolved state to see changes immediately
    setActiveSignalIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const setOnlyPhoto = () => {
    setUserInteracted(true);
    setIsPlaying(false);
    setAnimStage(8);
    setActiveSignalIds(['sig-1']);
  };

  const resetAllSignals = () => {
    setUserInteracted(false);
    setIsPlaying(true);
    setActiveSignalIds(allSignalIds);
    setAnimStage(0);
    setCycleCount((c) => c + 1);
  };

  // Compute live corroboration score from active signals
  const activeCorroborationScore = useMemo(() => {
    return CANONICAL_CASE.signals.reduce((total, sig) => {
      return activeSignalIds.includes(sig.id) ? total + sig.earned : total;
    }, 0);
  }, [activeSignalIds]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      {/* ── 1. Top 56px Atmospheric Shell ───────────────────────── */}
      <AtmosphericShell />

      {/* ── 2. Hero Composition (Board A: Daylight meets Instrument) ── */}
      <main className="flex-1 flex flex-col">
        {/* ── Field Band (Daylight Citizen World) ────────────────── */}
        <section className="bg-[#F4F3EC] text-[#1B211C] border-b border-[#DAD8CC] px-4 sm:px-8 lg:px-14 py-8 lg:py-12 select-none relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Headline & Definition */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[2px] bg-[#E8E6DC] text-[#4F5851] text-[11px] font-mono tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F6A0E] animate-pulse" />
                <span>ENVIRONMENTAL EVIDENCE INTELLIGENCE</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-normal leading-[1.08] text-[#1B211C] tracking-tight max-w-[18ch]">
                A community report becomes verified environmental action.
              </h1>

              <p className="text-[#4F5851] text-base sm:text-lg max-w-[46ch] font-sans font-normal leading-relaxed">
                ONER turns community pollution reports into evidence-backed environmental action.
                Residents report what they see. ONER fuses evidence, finds the cause, and returns measured results.
              </p>

              {/* Action Buttons & Narrative Play/Pause Controller */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/report"
                  className="px-5 py-2.5 rounded-[2px] bg-[#A8C83A] hover:bg-[#99B732] text-[#121A0A] font-medium text-sm transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Report pollution</span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  href="/experience"
                  className="px-4 py-2.5 rounded-[2px] bg-[#FFFFFF] hover:bg-[#F9F9F6] border border-[#DAD8CC] text-[#1B211C] font-medium text-sm transition-colors"
                >
                  Watch 3D twin
                </Link>

                {/* Narrative Loop Play/Pause button */}
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="px-3 py-2 rounded-[2px] border border-[#DAD8CC] bg-[#FBFAF5] hover:bg-[#FFFFFF] text-[#4F5851] text-xs font-mono transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  title={isPlaying ? 'Pause narrative sequence' : 'Play narrative sequence'}
                >
                  {isPlaying ? (
                    <>
                      <Pause size={12} className="text-[#4F6A0E]" />
                      <span>Sequence active</span>
                    </>
                  ) : (
                    <>
                      <Play size={12} className="text-[#4F6A0E]" />
                      <span>Resume sequence</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: SVG Landscape Seed & Precision Documentary Field Plate */}
            <div className="lg:col-span-5 relative w-full h-[260px] sm:h-[300px] rounded-[2px] overflow-hidden bg-gradient-to-b from-[#E6E8E2] to-[#D5D8D0] border border-[#DAD8CC] flex items-center justify-center shadow-inner">
              {/* Restrained Industrial SVG Landscape */}
              <svg
                viewBox="0 0 420 300"
                className="w-full h-full object-cover pointer-events-none"
                preserveAspectRatio="xMidYMax slice"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="smokePlume" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0" stopColor="#8d928a" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#cfd0c8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Smoke Plume Ellipses */}
                <ellipse cx="300" cy="90" rx="90" ry="46" fill="url(#smokePlume)" />
                <ellipse cx="250" cy="60" rx="70" ry="30" fill="url(#smokePlume)" />
                {/* Industrial Stacks */}
                <rect x="270" y="130" width="12" height="130" fill="#2B3326" />
                <rect x="310" y="150" width="10" height="110" fill="#2B3326" />
                {/* Perimeter Hills */}
                <path d="M0 260 Q100 225 200 250 T420 240V300H0Z" fill="#2B3326" />
              </svg>

              {/* Precision Documentary Field Evidence Plate (The Observation Seed) */}
              <div className={`absolute left-4 bottom-4 bg-[#FFFFFF] p-3 rounded-[2px] border transition-all duration-500 max-w-[240px] shadow-lg ${
                returnLoopCompleted || animStage >= 7
                  ? 'border-[#A8C83A] ring-2 ring-[#A8C83A]/30'
                  : 'border-[#DAD8CC]'
              }`}>
                {/* Viewfinder frame with corners */}
                <div className="relative w-full h-[96px] rounded-[1px] bg-[#161C18] text-[#E0E4DE] p-2 flex flex-col justify-between overflow-hidden">
                  {/* Framing Reticle Corners */}
                  <div className="absolute top-1 left-1 text-[8px] font-mono text-[#8C9A8E]">⌜</div>
                  <div className="absolute top-1 right-1 text-[8px] font-mono text-[#8C9A8E]">⌝</div>
                  <div className="absolute bottom-1 left-1 text-[8px] font-mono text-[#8C9A8E]">⌞</div>
                  <div className="absolute bottom-1 right-1 text-[8px] font-mono text-[#8C9A8E]">⌟</div>

                  {/* Optical Scan Line */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-[#A8B0A8]">
                    <span>CEMS · AQ-04 SYNC</span>
                    <span className="text-[#C4DF61] font-semibold">REC ●</span>
                  </div>

                  {/* Simulated plume density waveform */}
                  <div className="w-full flex items-end gap-1 h-5 my-auto px-1 opacity-70">
                    <div className="w-1.5 h-2 bg-[#6E7B70]" />
                    <div className="w-1.5 h-3 bg-[#6E7B70]" />
                    <div className="w-1.5 h-4 bg-[#A8C83A]" />
                    <div className="w-1.5 h-5 bg-[#C4DF61]" />
                    <div className="w-1.5 h-4 bg-[#A8C83A]" />
                    <div className="w-1.5 h-2.5 bg-[#6E7B70]" />
                    <div className="w-1.5 h-2 bg-[#6E7B70]" />
                  </div>

                  <div className="text-[9px] font-mono text-[#8C9A8E] flex justify-between">
                    <span>17.4399° N, 78.3845° E</span>
                    <span>12m GPS</span>
                  </div>
                </div>

                {/* Evidence Metadata Plate */}
                <div className="mt-2 text-[10px] font-mono text-[#4F5851] space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Citizen observation</span>
                    <span className="text-[#4F6A0E]">09:42 IST</span>
                  </div>
                  <div className="text-[9px] text-[#7B837C] truncate">
                    N. Sharma · Sector 4 North Gate
                  </div>

                  {/* Return Loop Impact Badge */}
                  {(returnLoopCompleted || animStage >= 7) && (
                    <div className="pt-1.5 border-t border-[#DAD8CC] text-[#4F6A0E] font-semibold text-[10px] flex items-center gap-1.5 animate-in fade-in duration-300">
                      <span className="w-2 h-2 rounded-full bg-[#4F6A0E] shrink-0" />
                      <span>Returned: -14.2 tCO₂e/day · +50 pts</span>
                    </div>
                  )}
                </div>

                {/* Physical Signal Seed Dot leaving toward the Horizon in Stage 1 */}
                {animStage === 1 && isPlaying && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#A8C83A] animate-ping" />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Horizon Boundary (1px hairline with transport pulse) ─ */}
        <div className="relative">
          <HorizonLine
            activeLevel="control"
            className={`my-0 transition-all duration-300 ${
              animStage === 2 ? 'horizon-transport-pulse shadow-sm' : ''
            }`}
          />
          {/* Subtle pulse label when evidence crosses the boundary */}
          {animStage === 1 && (
            <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#A8C83A] bg-[#080A09] px-2 py-0.5 border border-[#A8C83A]/40 rounded-full animate-bounce">
              SIGNAL ENTERING ONER CONTROL SURFACE ↓
            </div>
          )}
        </div>

        {/* ── 4. Control Band (Instrument / Night Operational World) ─ */}
        <section className={`bg-[#080A09] text-[#F1F3EE] px-4 sm:px-8 lg:px-14 py-8 lg:py-10 flex-1 transition-opacity duration-500 ${
          animStage >= 2 || userInteracted ? 'opacity-100' : 'opacity-85'
        }`}>
          <div className="max-w-[1440px] mx-auto space-y-6">
            {/* Actor Line (Positioned over the corresponding chain regions) */}
            <div className="hidden lg:grid grid-cols-12 text-xs font-mono text-[#929A95] border-b border-[#242A27] pb-2 px-2 select-none">
              <span className="col-span-3 text-left">① Community: Citizen Observation</span>
              <span className="col-span-3 text-center">② ONER: Evidence Fusion Core</span>
              <span className="col-span-3 text-center">③ Industry: Actuator Fix</span>
              <span className="col-span-3 text-right">④ Community: Result Returned</span>
            </div>

            {/* Desktop: SVG Convergence Chain */}
            <div className="hidden md:block bg-[#0E1110] border border-[#242A27] rounded-[2px] p-4 lg:p-6 shadow-2xl relative">
              <ConvergenceChain
                activeSignalIds={activeSignalIds}
                coreScore={activeCorroborationScore}
                showReturnLine={true}
                animationCycle={cycleCount}
                isAutoplay={isPlaying}
                onReturnComplete={() => setReturnLoopCompleted(true)}
              />
            </div>

            {/* Mobile: Stacked Vertical Chain */}
            <div className="md:hidden">
              <VerticalChain
                coreScore={activeCorroborationScore}
              />
            </div>

            {/* Six Narrative Beats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-[2px] bg-[#0E1110] border border-[#242A27] space-y-1">
                <div className="font-semibold text-[#F1F3EE] text-[13px] flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#A8C83A]">01</span>
                  <span>Seen</span>
                </div>
                <div className="text-[11px] text-[#929A95]">
                  Resident photographs smoke at 09:42 IST.
                </div>
              </div>

              <div className="p-3 rounded-[2px] bg-[#0E1110] border border-[#242A27] space-y-1">
                <div className="font-semibold text-[#F1F3EE] text-[13px] flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#A8C83A]">02</span>
                  <span>Fused</span>
                </div>
                <div className="text-[11px] text-[#929A95]">
                  Six signals checked ({activeCorroborationScore.toFixed(1)}/100).
                </div>
              </div>

              <div className="p-3 rounded-[2px] bg-[#0E1110] border border-[#242A27] space-y-1">
                <div className="font-semibold text-[#F1F3EE] text-[13px] flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#A8C83A]">03</span>
                  <span>Explained</span>
                </div>
                <div className="text-[11px] text-[#929A95]">
                  Burner refractory fouling isolated on F-101.
                </div>
              </div>

              <div className="p-3 rounded-[2px] bg-[#0E1110] border border-[#242A27] space-y-1">
                <div className="font-semibold text-[#F1F3EE] text-[13px] flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#A8C83A]">04</span>
                  <span>Acted</span>
                </div>
                <div className="text-[11px] text-[#929A95]">
                  Facility applies damper setpoint trim to 1.042.
                </div>
              </div>

              <div className="p-3 rounded-[2px] bg-[#0E1110] border border-[#242A27] space-y-1">
                <div className="font-semibold text-[#F1F3EE] text-[13px] flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#A8C83A]">05</span>
                  <span>Measured</span>
                </div>
                <div className="text-[11px] text-[#929A95]">
                  Result measured: 14.2 tCO₂e/day lower.
                </div>
              </div>

              <div className="p-3 rounded-[2px] bg-[#0E1110] border border-[#242A27] space-y-1">
                <div className="font-semibold text-[#F1F3EE] text-[13px] flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#A8C83A]">06</span>
                  <span>Returned</span>
                </div>
                <div className="text-[11px] text-[#929A95]">
                  Outcome reaches citizen; +50 points credited.
                </div>
              </div>
            </div>

            {/* Case Identifier Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#626A65] pt-1 border-t border-[#181E1C]">
              <span>Representative case COMM-2026-00421 · Orion Refining Complex</span>
              <span>Demo data · Simulated telemetry · Prototype workflow</span>
            </div>
          </div>
        </section>

        {/* ── 5. Evidence Fusion Instrument (Refined Editorial Surface) ─ */}
        <section className="bg-[#0B0E0D] border-t border-[#242A27] px-4 sm:px-8 lg:px-14 py-10">
          <div className="max-w-[1440px] mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#181E1C] pb-3">
              <div>
                <h2 className="text-lg font-medium text-[#F1F3EE] tracking-tight">
                  Evidence Fusion Instrument
                </h2>
                <p className="text-xs text-[#929A95] mt-0.5">
                  One photo is a claim. Six signals are evidence. Toggle sources to observe how the reasoning core reacts.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={setOnlyPhoto}
                  className="text-xs font-mono px-2.5 py-1 rounded-[2px] bg-[#141817] hover:bg-[#1A201E] border border-[#242A27] text-[#929A95] hover:text-[#F1F3EE] transition-colors cursor-pointer"
                >
                  Photo only (4.2)
                </button>
                <button
                  type="button"
                  onClick={resetAllSignals}
                  className="text-xs font-mono px-2.5 py-1 rounded-[2px] bg-[#141817] hover:bg-[#1A201E] border border-[#242A27] text-[#A8C83A] hover:text-[#C4DF61] transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>All six (89.4)</span>
                </button>
              </div>
            </div>

            {/* 6 Precision Hairline Strips (Editorial Evidence Surfaces) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
              {CANONICAL_CASE.signals.map((sig) => {
                const isActive = activeSignalIds.includes(sig.id);
                return (
                  <button
                    key={sig.id}
                    type="button"
                    onClick={() => toggleSignal(sig.id)}
                    className={`p-3 rounded-[2px] border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#141817] border-[#A8C83A]/70 shadow-xs'
                        : 'bg-[#0E1110] border-[#242A27] opacity-40 hover:opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#F1F3EE] truncate">{sig.name}</span>
                      <span
                        className={`w-3.5 h-3.5 rounded-[1px] border flex items-center justify-center text-[9px] ${
                          isActive
                            ? 'bg-[#A8C83A] border-[#A8C83A] text-[#121A0A] font-bold'
                            : 'border-[#343E3A] text-transparent'
                        }`}
                      >
                        {isActive && <Check size={10} />}
                      </span>
                    </div>

                    {/* Weight Micro-bar */}
                    <div className="h-1 bg-[#1A221E] rounded-full my-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isActive ? 'bg-[#A8C83A]' : 'bg-transparent'
                        }`}
                        style={{ width: `${(sig.earned / sig.possible) * 100}%` }}
                      />
                    </div>

                    <div className="text-[11px] font-mono text-[#929A95] flex items-baseline justify-between">
                      <span className="truncate pr-1">{sig.note}</span>
                      <span className={isActive ? 'text-[#A8C83A] font-semibold shrink-0' : 'text-[#626A65] shrink-0'}>
                        +{sig.earned}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Result readout banner */}
            <div className="p-3.5 rounded-[2px] bg-[#0E1110] border border-[#242A27] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#626A65]">
                  Corroboration Score:
                </span>
                <span className="font-mono text-2xl font-light text-[#F1F3EE]">
                  {activeCorroborationScore.toFixed(1)}{' '}
                  <span className="text-xs text-[#626A65]">/ 100</span>
                </span>
                <span className="text-[#929A95] hidden md:inline">
                  {activeCorroborationScore >= 80
                    ? '· High multi-source agreement (Action requested on F-101)'
                    : activeCorroborationScore >= 50
                    ? '· Partial corroboration (Secondary verification ongoing)'
                    : '· Insufficient evidence (Observation logged)'}
                </span>
              </div>

              <div className="text-[11px] font-mono text-[#626A65]">
                Deterministic domain rule evaluation · No probabilistic hallucination
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Active Cases Register (Quiet Editorial List) ───── */}
        <section className="bg-[#080A09] border-t border-[#242A27] px-4 sm:px-8 lg:px-14 py-8">
          <div className="max-w-[1440px] mx-auto space-y-4">
            <div className="flex items-baseline justify-between border-b border-[#181E1C] pb-2">
              <div>
                <h3 className="text-sm font-medium text-[#F1F3EE]">
                  Active Cases in the Network
                </h3>
                <p className="text-xs text-[#626A65] mt-0.5">
                  Every community report follows this convergence path.
                </p>
              </div>
              <Link
                href="/community"
                className="text-xs font-mono text-[#A8C83A] hover:underline"
              >
                View all community reports →
              </Link>
            </div>

            {/* Hairline Register Rows */}
            <div className="divide-y divide-[#181E1C] border-y border-[#242A27]">
              {SEED_CASES.map((row) => (
                <div
                  key={row.id}
                  className={`py-3 flex items-center justify-between text-xs transition-colors px-2 ${
                    row.id === '00421'
                      ? 'bg-[#0E1110] border-l-2 border-l-[#A8C83A]'
                      : 'hover:bg-[#0E1110]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-[#A8C83A] font-semibold">{row.id}</span>
                    <span className="font-medium text-[#F1F3EE]">{row.label}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <CompactChain signals={row.signals} />
                    <span className="font-mono text-[11px] text-[#F1F3EE] w-12 text-right">
                      {row.score}
                    </span>
                    <span className="text-[11px] text-[#929A95] hidden md:inline w-32 text-right">
                      {row.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. The Three Doors (Editorial Entry Portals) ───────── */}
        <section className="bg-[#0B0E0D] border-t border-[#242A27] px-4 sm:px-8 lg:px-14 py-12">
          <div className="max-w-[1440px] mx-auto space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#626A65]">
              System Access Portals
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#181E1C]">
              {/* Door 1: Community */}
              <Link
                href="/report"
                className="pt-4 md:pt-0 md:pr-6 group block space-y-3 cursor-pointer"
              >
                <div className="text-[11px] font-mono text-[#A8C83A]">01 · CITIZEN SENTINEL</div>
                <div className="text-lg font-medium text-[#F1F3EE] group-hover:text-[#A8C83A] transition-colors flex items-center justify-between">
                  <span>I saw something</span>
                  <ArrowRight size={16} className="text-[#626A65] group-hover:text-[#A8C83A] group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-[#929A95] leading-relaxed">
                  File a field note with optical evidence and consensual GPS. Earn points when facility telemetry corroborates your observation.
                </p>
              </Link>

              {/* Door 2: Industry */}
              <Link
                href="/industry"
                className="pt-4 md:pt-0 md:px-6 group block space-y-3 cursor-pointer"
              >
                <div className="text-[11px] font-mono text-[#A8C83A]">02 · FACILITY OPERATOR</div>
                <div className="text-lg font-medium text-[#F1F3EE] group-hover:text-[#A8C83A] transition-colors flex items-center justify-between">
                  <span>I run a facility</span>
                  <ArrowRight size={16} className="text-[#626A65] group-hover:text-[#A8C83A] group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-[#929A95] leading-relaxed">
                  Inspect root causes, simulate damper setpoints, apply work orders, and verify continuous emissions reductions via CEMS.
                </p>
              </Link>

              {/* Door 3: Government */}
              <Link
                href="/government"
                className="pt-4 md:pt-0 md:pl-6 group block space-y-3 cursor-pointer"
              >
                <div className="text-[11px] font-mono text-[#A8C83A]">03 · REGIONAL REGULATOR</div>
                <div className="text-lg font-medium text-[#F1F3EE] group-hover:text-[#A8C83A] transition-colors flex items-center justify-between">
                  <span>I oversee a region</span>
                  <ArrowRight size={16} className="text-[#626A65] group-hover:text-[#A8C83A] group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-[#929A95] leading-relaxed">
                  Prioritize stalled environmental incidents, inspect cross-facility risk profiles, and enforce legal Pact compliance thresholds.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* ── 8. Honesty Footer ─────────────────────────────────── */}
        <footer className="bg-[#080A09] border-t border-[#181E1C] px-4 sm:px-8 lg:px-14 py-6 select-none">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[#626A65]">
            <DemoTag label="Demo data · Simulated telemetry · Prototype workflow" variant="subtle" />
            <span>Potential creditable reduction is an estimate based on sustained CEMS levels, not an issued carbon credit.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
