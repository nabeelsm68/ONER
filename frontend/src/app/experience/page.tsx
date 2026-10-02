'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import ExperienceCanvas, { ExperienceState } from './ExperienceCanvas';
import './experience.css';
import {
  ArrowRight,
  Compass,
  Sliders,
  Activity,
  Layers,
  CheckCircle2,
  Wind,
  ShieldAlert,
  GitBranch,
  ChevronDown
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SECTIONS = [
  { id: 'sec-01', title: '01 · HERO', label: 'Hero' },
  { id: 'sec-02', title: '02 · THE ENVIRONMENT', label: 'Environment' },
  { id: 'sec-03', title: '03 · THE PROBLEM', label: 'The Problem' },
  { id: 'sec-04', title: '04 · DETECTION', label: 'Detection' },
  { id: 'sec-05', title: '05 · EXPLANATION', label: 'Explanation' },
  { id: 'sec-06', title: '06 · PREDICTION', label: 'Prediction' },
  { id: 'sec-07', title: '07 · SIMULATION', label: 'Simulation' },
  { id: 'sec-08', title: '08 · ACTION', label: 'Action' },
  { id: 'sec-09', title: '09 · AUTOPILOT', label: 'Autopilot' },
  { id: 'sec-10', title: '10 · CONTROL PLANE', label: 'Control Plane' },
];

export default function ExperiencePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const lenisRef = useRef<Lenis | null>(null);

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [reducedMotionActive, setReducedMotionActive] = useState(false);

  // Decoupled mutable state ref for 60fps RAF canvas engine
  const experienceStateRef = useRef<ExperienceState>({
    scrollProgress: 0,
    activeSection: 0,
    sectionProgress: 0,
    pointer: { x: 0, y: 0, currentX: 0, currentY: 0 },
    reducedMotion: false,
  });

  // Lenis Smooth Scroll & GSAP ScrollTrigger Integration
  useEffect(() => {
    // 1. Reduced motion detection
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReduced = motionQuery.matches;
    setReducedMotionActive(isReduced);
    experienceStateRef.current.reducedMotion = isReduced;

    let lenis: Lenis | null = null;
    let tickerFn: ((time: number) => void) | null = null;

    if (!isReduced) {
      lenis = new Lenis({
        duration: 1.3,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });
      lenisRef.current = lenis;

      lenis.on('scroll', ScrollTrigger.update);

      tickerFn = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    }

    // 2. Overall page scroll progress
    const overallTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        experienceStateRef.current.scrollProgress = self.progress;
      },
    });

    // 3. Section ScrollTriggers
    const sectionTriggers: ScrollTrigger[] = [];

    sectionRefs.current.forEach((sec, idx) => {
      if (!sec) return;

      const trigger = ScrollTrigger.create({
        trigger: sec,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter: () => {
          experienceStateRef.current.activeSection = idx;
          setActiveSectionIndex(idx);
        },
        onEnterBack: () => {
          experienceStateRef.current.activeSection = idx;
          setActiveSectionIndex(idx);
        },
        onUpdate: (self) => {
          if (experienceStateRef.current.activeSection === idx) {
            experienceStateRef.current.sectionProgress = self.progress;
          }
        },
      });
      sectionTriggers.push(trigger);

      // Section internal text fade & subtle drift
      const contentEl = sec.querySelector('.section-content');
      if (contentEl && !isReduced) {
        gsap.fromTo(
          contentEl,
          { opacity: 0.15, y: 30 },
          {
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sec,
              start: 'top 75%',
              end: 'top 35%',
              scrub: 0.5,
            },
          }
        );
      }
    });

    // 4. Cleanup
    return () => {
      overallTrigger.kill();
      sectionTriggers.forEach((t) => t.kill());
      ScrollTrigger.getAll().forEach((t) => {
        if (t.vars.trigger && sectionRefs.current.includes(t.vars.trigger as HTMLElement)) {
          t.kill();
        }
      });
      if (tickerFn) gsap.ticker.remove(tickerFn);
      if (lenis) {
        lenis.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  // Jump to section via Lenis
  const scrollToSection = useCallback((idx: number) => {
    const target = sectionRefs.current[idx];
    if (!target) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: 0, duration: 1.4 });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="experience-root relative w-full min-h-screen text-zinc-100 selection:bg-emerald-500/30 selection:text-white"
      style={{
        background: '#060807',
        zIndex: 20, // Clean isolation over dashboard background
        position: 'relative',
      }}
    >
      {/* ── Persistent Canvas Layer (Separate Ambient + Scroll Animation) ── */}
      <ExperienceCanvas stateRef={experienceStateRef} />

      {/* ── Atmospheric Vignette & Horizon Haze ── */}
      <div className="exp-vignette fixed inset-0 pointer-events-none z-10" />

      {/* ── Top Cinematic HUD ── */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-5 flex items-center justify-between pointer-events-auto">
        {/* Brand & Digital Twin Status */}
        <div className="flex items-center gap-3.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-zinc-100 hover:text-white transition-opacity"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-pulse" />
            <span className="exp-font-display text-sm font-bold tracking-[0.2em] uppercase">
              ONER
            </span>
          </Link>

          <span className="text-zinc-600 text-xs">/</span>

          <span className="exp-font-mono text-[10px] tracking-wider text-zinc-400 uppercase hidden sm:inline-block">
            EXPERIENCE · ORION REFINERY TWIN
          </span>
        </div>

        {/* Active Stage Indicator */}
        <div className="hidden md:flex items-center gap-2 exp-glass-panel-subtle px-3 py-1.5 rounded-full text-zinc-300 text-xs">
          <span className="exp-font-mono text-emerald-400 font-semibold">
            {SECTIONS[activeSectionIndex]?.title}
          </span>
        </div>

        {/* Exit to Dashboard Link */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="exp-button-secondary text-xs"
          >
            <span>DASHBOARD</span>
            <ArrowRight size={13} className="text-emerald-400" />
          </Link>
        </div>
      </header>

      {/* ── Right-Side Narrative Scrollytelling Pips ── */}
      <nav
        aria-label="Story chapters"
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3 pointer-events-auto"
      >
        {SECTIONS.map((sec, idx) => {
          const isActive = idx === activeSectionIndex;
          return (
            <button
              key={sec.id}
              onClick={() => scrollToSection(idx)}
              className="group flex items-center justify-end gap-2.5 py-1 text-right focus:outline-none"
              title={sec.title}
            >
              <span
                className={`exp-font-mono text-[10px] uppercase transition-all duration-300 ${
                  isActive
                    ? 'text-emerald-400 font-semibold opacity-100 translate-x-0'
                    : 'text-zinc-500 opacity-0 group-hover:opacity-80 translate-x-1'
                }`}
              >
                {sec.label}
              </span>
              <div
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-2 h-7 bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.7)]'
                    : 'w-1.5 h-1.5 bg-zinc-600 group-hover:bg-zinc-400'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* ── Bottom Environmental Telemetry HUD Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between pointer-events-none text-zinc-500 text-[10px] exp-font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
            TELEMETRY: STABLE
          </span>
          <span className="hidden sm:inline-block">ENV_ZONE: CALIFORNIA CENTRAL BASIN</span>
          <span className="hidden md:inline-block">CONFIDENCE: 99.4%</span>
        </div>

        <div className="flex items-center gap-3">
          <span>SCROLL TO ADVANCE</span>
          <ChevronDown size={12} className="animate-bounce" />
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════════════════
          SCROLLING NARRATIVE SECTIONS (01 - 10)
          Each section is paced with ample vertical room for cinematic scroll
          ══════════════════════════════════════════════════════════════════ */}
      <main className="relative z-30 pointer-events-auto">

        {/* ── SECTION 01 — HERO ──────────────────────────────────────── */}
        <section
          id="sec-01"
          ref={(el) => { sectionRefs.current[0] = el; }}
          className="min-h-[140vh] flex flex-col items-center justify-center px-6 relative"
        >
          <div className="section-content max-w-4xl mx-auto text-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 exp-telemetry-tag mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>ORION REFINING COMPLEX · SENSOR FIELD 01</span>
            </div>

            <h1 className="exp-font-display text-6xl sm:text-8xl md:text-9xl font-extrabold tracking-tight text-white leading-none">
              ONER
            </h1>

            <div className="space-y-3">
              <p className="exp-font-display text-xl sm:text-2xl md:text-3xl font-medium tracking-[0.18em] text-emerald-400/90 uppercase">
                ENVIRONMENTAL AI AUTOPILOT
              </p>

              <div className="flex items-center justify-center gap-3 text-zinc-400 text-sm tracking-[0.3em] font-medium uppercase exp-font-mono">
                <span>SENSE</span>
                <span className="text-emerald-500/50">·</span>
                <span>PREDICT</span>
                <span className="text-emerald-500/50">·</span>
                <span>ACT</span>
              </div>
            </div>

            <p className="max-w-md mx-auto text-zinc-400 text-sm sm:text-base font-normal tracking-wide leading-relaxed pt-2">
              Environmental intelligence for industrial systems.
            </p>

            <div className="pt-8 flex flex-col items-center gap-2 text-zinc-500">
              <span className="exp-font-mono text-[10px] tracking-widest uppercase">
                SCROLL TO EXPLORE
              </span>
              <div className="w-[1px] h-8 bg-gradient-to-b from-emerald-500/60 to-transparent animate-pulse" />
            </div>
          </div>
        </section>


        {/* ── SECTION 02 — THE ENVIRONMENT ───────────────────────────── */}
        <section
          id="sec-02"
          ref={(el) => { sectionRefs.current[1] = el; }}
          className="min-h-[140vh] flex flex-col items-start justify-center px-8 sm:px-16 max-w-6xl mx-auto relative"
        >
          <div className="section-content max-w-2xl space-y-8">
            <div className="exp-telemetry-tag">
              <Layers size={12} className="text-emerald-400" />
              <span>LAYER 01 · INDUSTRIAL METABOLISM</span>
            </div>

            <h2 className="exp-font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              EVERY FACILITY<br />
              LEAVES A<br />
              <span className="text-emerald-400">SIGNATURE.</span>
            </h2>

            <p className="text-zinc-400 text-base leading-relaxed">
              Every combustion cycle, cooling outflow, and material transfer leaves a physical trace in the atmosphere.
              Continuous scientific sensors layer across the physical site:
            </p>

            {/* Subtle moving telemetry badges representing CO2, Energy, Water, Air, Waste */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {[
                { label: 'CO₂', sub: 'STACK 01', val: '412.8 ppm', col: 'text-emerald-400' },
                { label: 'ENERGY', sub: 'GRID BUS A', val: '84.2 MW', col: 'text-sky-400' },
                { label: 'WATER', sub: 'CANAL INFLOW', val: '1,240 m³/h', col: 'text-teal-400' },
                { label: 'AIR', sub: 'NORTH PERIMETER', val: '21.4 µg/m³', col: 'text-lime-400' },
                { label: 'WASTE', sub: 'BYPRODUCT VOL', val: '0.82 t/batch', col: 'text-amber-400' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="exp-glass-panel p-3.5 rounded-xl border border-white/5 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] exp-font-mono text-zinc-400">
                    <span className="font-semibold text-white">{item.label}</span>
                    <span className="text-zinc-500">{item.sub}</span>
                  </div>
                  <div className={`text-base font-semibold exp-font-mono ${item.col}`}>
                    {item.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ── SECTION 03 — THE PROBLEM ───────────────────────────────── */}
        <section
          id="sec-03"
          ref={(el) => { sectionRefs.current[2] = el; }}
          className="min-h-[140vh] flex flex-col items-start justify-center px-8 sm:px-16 max-w-6xl mx-auto relative"
        >
          <div className="section-content max-w-2xl space-y-8">
            <div className="exp-telemetry-tag">
              <Activity size={12} className="text-amber-400" />
              <span>LAYER 02 · HIGH-VELOCITY TELEMETRY</span>
            </div>

            <div className="space-y-4">
              <h2 className="exp-font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                INDUSTRY<br />
                GENERATES<br />
                DATA.
              </h2>

              <div className="pt-4 border-l-2 border-amber-500/40 pl-6 space-y-2">
                <p className="exp-font-display text-2xl sm:text-4xl font-semibold text-amber-300 leading-tight">
                  BUT DATA<br />
                  DOESN&apos;T<br />
                  EXPLAIN ITSELF.
                </p>
              </div>
            </div>

            <p className="text-zinc-400 text-base leading-relaxed">
              Modern processing plants capture 50,000 telemetry points every second.
              Yet when heat transfer degrades or damper calibration shifts, raw charts hide the underlying physics.
            </p>

            <div className="exp-glass-panel p-4 rounded-xl border border-white/5 space-y-2 max-w-md">
              <div className="flex items-center justify-between text-xs exp-font-mono text-zinc-400">
                <span>COMBUSTION LINE DRIFT</span>
                <span className="text-amber-400">SUBTLE DEVIATION</span>
              </div>
              <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[68%]" />
              </div>
              <p className="text-[11px] text-zinc-500 exp-font-mono">
                Sensor variance detected in furnace fuel ratio (+6.2% uncommanded drift).
              </p>
            </div>
          </div>
        </section>


        {/* ── SECTION 04 — DETECTION ─────────────────────────────────── */}
        <section
          id="sec-04"
          ref={(el) => { sectionRefs.current[3] = el; }}
          className="min-h-[140vh] flex flex-col items-start justify-center px-8 sm:px-16 max-w-6xl mx-auto relative"
        >
          <div className="section-content max-w-2xl space-y-8">
            <div className="exp-telemetry-tag border-amber-500/30 text-amber-300">
              <ShieldAlert size={12} className="text-amber-400" />
              <span>LAYER 03 · UNSUPERVISED ISOLATION FOREST</span>
            </div>

            <h2 className="exp-font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
              ONER<br />
              SEES THE<br />
              <span className="text-amber-400">CHANGE.</span>
            </h2>

            {/* Restrained scientific anomaly notification revealed by the environment */}
            <div className="exp-glass-panel p-6 rounded-2xl border border-amber-500/25 space-y-4 max-w-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                  <span className="exp-font-display font-bold text-sm tracking-wider text-amber-300 uppercase">
                    ANOMALY DETECTED
                  </span>
                </div>
                <span className="exp-font-mono text-xs text-zinc-400">
                  FURNACE F-101
                </span>
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed">
                Rather than an arbitrary static threshold alert, the anomaly emerges organically as multi-dimensional telemetry diverges from its natural thermodynamic envelope.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs exp-font-mono">
                <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                  <div className="text-zinc-500 text-[10px]">ANOMALY SCORE</div>
                  <div className="text-amber-400 font-semibold mt-0.5">0.884 [CRITICAL]</div>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                  <div className="text-zinc-500 text-[10px]">DEVIATION DELTA</div>
                  <div className="text-zinc-200 font-semibold mt-0.5">+18.4°C THERMAL</div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 05 — EXPLANATION ───────────────────────────────── */}
        <section
          id="sec-05"
          ref={(el) => { sectionRefs.current[4] = el; }}
          className="min-h-[150vh] flex flex-col items-start justify-center px-8 sm:px-16 max-w-6xl mx-auto relative"
        >
          <div className="section-content max-w-3xl space-y-8">
            <div className="exp-telemetry-tag">
              <GitBranch size={12} className="text-emerald-400" />
              <span>LAYER 04 · DETERMINISTIC ROOT-CAUSE ENGINE</span>
            </div>

            <h2 className="exp-font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
              ONER<br />
              FINDS THE<br />
              <span className="text-emerald-400">CAUSE.</span>
            </h2>

            <p className="text-zinc-300 text-base leading-relaxed max-w-xl">
              ONER does not guess. Using deterministic directed causal modeling, it isolates the exact mechanism driving excess emissions:
            </p>

            {/* Causal Chain Representation */}
            <div className="exp-glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
              <div className="text-xs exp-font-mono text-zinc-400 uppercase tracking-wider">
                PHYSICS-BASED CAUSAL CHAIN IDENTIFICATION
              </div>

              {/* The required relationships: Furnace -> Temperature -> Natural Gas -> Energy -> NOx -> CO2 */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs exp-font-mono">
                {['Furnace', 'Temperature', 'Natural Gas', 'Energy', 'NOx', 'CO₂'].map((item, i, arr) => (
                  <React.Fragment key={item}>
                    <span className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 font-semibold text-zinc-200">
                      {item}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="text-emerald-400 font-bold">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Deterministic Conclusion Reveal */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] exp-font-mono text-emerald-400 uppercase tracking-widest font-semibold">
                    DETERMINISTIC DIAGNOSIS
                  </div>
                  <div className="exp-font-display text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                    THERMAL EFFICIENCY DEGRADATION
                  </div>
                </div>

                <div className="exp-font-mono text-xs text-zinc-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-full self-start sm:self-auto">
                  CONFIDENCE: 99.4%
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 06 — PREDICTION ────────────────────────────────── */}
        <section
          id="sec-06"
          ref={(el) => { sectionRefs.current[5] = el; }}
          className="min-h-[140vh] flex flex-col items-start justify-center px-8 sm:px-16 max-w-6xl mx-auto relative"
        >
          <div className="section-content max-w-2xl space-y-8">
            <div className="exp-telemetry-tag">
              <Activity size={12} className="text-emerald-400" />
              <span>LAYER 05 · 7-DAY FORECASTING HORIZON</span>
            </div>

            <h2 className="exp-font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
              ONER<br />
              PREDICTS<br />
              <span className="text-emerald-400">WHAT COMES NEXT.</span>
            </h2>

            <p className="text-zinc-300 text-base leading-relaxed">
              Environmental phenomena develop over multi-day timeframes.
              GradientBoosting forecasting projects thermodynamic drift 7 days forward, projecting regulatory threshold breaches before they occur.
            </p>

            <div className="exp-glass-panel p-5 rounded-xl border border-white/5 space-y-3 max-w-md">
              <div className="flex justify-between items-center text-xs exp-font-mono text-zinc-400">
                <span>PROJECTED CO₂ EXCURSION</span>
                <span className="text-amber-400">+14.2 tCO₂e / 7D</span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="bg-emerald-400 w-[60%]" />
                <div className="bg-amber-400 w-[40%]" />
              </div>
              <p className="text-[11px] text-zinc-500 exp-font-mono">
                Conformal prediction boundary anticipates compliance limit breach in 48 hours.
              </p>
            </div>
          </div>
        </section>


        {/* ── SECTION 07 — SIMULATION ────────────────────────────────── */}
        <section
          id="sec-07"
          ref={(el) => { sectionRefs.current[6] = el; }}
          className="min-h-[150vh] flex flex-col items-start justify-center px-8 sm:px-16 max-w-6xl mx-auto relative"
        >
          <div className="section-content max-w-3xl space-y-8">
            <div className="exp-telemetry-tag">
              <Sliders size={12} className="text-sky-400" />
              <span>LAYER 06 · DIGITAL TWIN COUNTERFACTUAL SIMULATOR</span>
            </div>

            <h2 className="exp-font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
              WHAT IF<br />
              <span className="text-sky-400">WE INTERVENED?</span>
            </h2>

            <p className="text-zinc-300 text-base leading-relaxed max-w-xl">
              Before touching physical actuators, ONER runs in-silico counterfactual simulation to evaluate trade-offs across emissions, energy cost, and throughput:
            </p>

            {/* Dual Trajectories: DO NOTHING vs ONER INTERVENTION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Trajectory A */}
              <div className="exp-glass-panel p-5 rounded-xl border border-red-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="exp-font-display font-bold text-sm tracking-wider text-red-400 uppercase">
                    DO NOTHING
                  </span>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Thermal degradation compounds. Natural gas consumption rises 6.2%, triggering threshold breaches and $18,400 in carbon penalty liability.
                </p>
                <div className="pt-2 exp-font-mono text-xs text-red-300">
                  OUTCOME: +14.2% EMISSIONS DRIFT
                </div>
              </div>

              {/* Trajectory B */}
              <div className="exp-glass-panel p-5 rounded-xl border border-emerald-500/30 space-y-3 bg-emerald-950/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="exp-font-display font-bold text-sm tracking-wider text-emerald-400 uppercase">
                    ONER INTERVENTION
                  </span>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Calibrate air-fuel ratio trim to 1.042 and synchronize burner dampers. Restores thermal efficiency to baseline within 180 seconds.
                </p>
                <div className="pt-2 exp-font-mono text-xs text-emerald-300">
                  OUTCOME: -210 tCO₂e / MO SAVED
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 08 — ACTION ────────────────────────────────────── */}
        <section
          id="sec-08"
          ref={(el) => { sectionRefs.current[7] = el; }}
          className="min-h-[140vh] flex flex-col items-start justify-center px-8 sm:px-16 max-w-6xl mx-auto relative"
        >
          <div className="section-content max-w-2xl space-y-8">
            <div className="exp-telemetry-tag">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>LAYER 07 · CLOSED-LOOP DISPATCH</span>
            </div>

            <h2 className="exp-font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
              FROM<br />
              INTELLIGENCE<br />
              <span className="text-emerald-400">TO ACTION.</span>
            </h2>

            <p className="text-zinc-300 text-base leading-relaxed">
              Insight without execution leaves emissions unabated.
              ONER converges predictive analysis into a verified, deterministic actuator command packet sent securely via industrial protocol.
            </p>

            <div className="exp-glass-panel p-5 rounded-xl border border-emerald-500/25 space-y-2 max-w-md">
              <div className="flex items-center justify-between text-xs exp-font-mono">
                <span className="text-zinc-400">DISPATCHED SETPOINT</span>
                <span className="text-emerald-400 font-semibold">APPLIED</span>
              </div>
              <div className="text-sm font-semibold text-white exp-font-mono">
                ACTUATOR: F-101_DAMPER_TRIM = 1.042
              </div>
              <div className="text-[11px] text-zinc-500 exp-font-mono">
                OPC-UA Secure Channel · Return Status: 200 OK · Verification Latency: 12ms
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 09 — AUTOPILOT ─────────────────────────────────── */}
        <section
          id="sec-09"
          ref={(el) => { sectionRefs.current[8] = el; }}
          className="min-h-[150vh] flex flex-col items-center justify-center px-6 max-w-5xl mx-auto text-center relative"
        >
          <div className="section-content space-y-8">
            <div className="exp-telemetry-tag mx-auto">
              <Compass size={12} className="text-emerald-400" />
              <span>LAYER 08 · CONTINUOUS AUTONOMOUS CYCLE</span>
            </div>

            <div className="space-y-3">
              <h2 className="exp-font-display text-5xl sm:text-7xl font-extrabold tracking-tight text-white">
                ONER
              </h2>
              <p className="exp-font-display text-xl sm:text-3xl font-medium tracking-[0.16em] text-emerald-400 uppercase">
                ENVIRONMENTAL AI AUTOPILOT
              </p>
            </div>

            {/* The 6 Pillars: SENSE · DETECT · EXPLAIN · PREDICT · SIMULATE · ACT */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 max-w-4xl mx-auto pt-4">
              {[
                { name: 'SENSE', desc: 'Real-world streams' },
                { name: 'DETECT', desc: 'Isolation forest' },
                { name: 'EXPLAIN', desc: 'Deterministic DAG' },
                { name: 'PREDICT', desc: '7-day horizon' },
                { name: 'SIMULATE', desc: 'Digital twin' },
                { name: 'ACT', desc: 'Closed loop' },
              ].map((step, idx) => (
                <div
                  key={step.name}
                  className="exp-glass-panel p-3.5 rounded-xl border border-white/5 space-y-1 text-center"
                >
                  <div className="exp-font-mono text-[10px] text-emerald-400 font-semibold">
                    0{idx + 1}
                  </div>
                  <div className="exp-font-display text-xs font-bold text-white tracking-wider">
                    {step.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-normal">
                    {step.desc}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed pt-2">
              All environmental and data layers converge into a coherent, self-balancing industrial ecosystem.
            </p>
          </div>
        </section>


        {/* ── SECTION 10 — CONTROL PLANE ─────────────────────────────── */}
        <section
          id="sec-10"
          ref={(el) => { sectionRefs.current[9] = el; }}
          className="min-h-[140vh] flex flex-col items-center justify-center px-6 max-w-4xl mx-auto text-center relative"
        >
          <div className="section-content space-y-8">
            <div className="exp-telemetry-tag mx-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>ORION REFINERY · SYSTEM OPTIMAL</span>
            </div>

            <h2 className="exp-font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
              EXPERIENCE<br />
              THE FULL POWER<br />
              <span className="text-emerald-400">OF ONER.</span>
            </h2>

            <p className="text-zinc-400 text-base max-w-lg mx-auto leading-relaxed">
              Step into the operational command center. Monitor real-time telemetry, run intervention simulations, inspect root-cause trees, and verify carbon MRV balances.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="exp-button-primary"
              >
                <span>ENTER ONER</span>
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="pt-12 text-zinc-600 exp-font-mono text-xs flex items-center justify-center gap-6">
              <span>EXECUTIVE OVERVIEW</span>
              <span>·</span>
              <span>ENVIRONMENTAL ANALYTICS</span>
              <span>·</span>
              <span>AI INVESTIGATION</span>
              <span>·</span>
              <span>CARBON & MRV</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
