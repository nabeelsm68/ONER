'use client';

import React, { useEffect, useRef } from 'react';

export interface ExperienceState {
  scrollProgress: number;     // 0 to 1 overall progress
  activeSection: number;      // 0 to 9
  sectionProgress: number;    // 0 to 1 within current section
  pointer: { x: number; y: number; currentX: number; currentY: number };
  reducedMotion: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  life: number;
  type: 'air' | 'thermal' | 'stream' | 'water';
}

interface Props {
  stateRef: React.RefObject<ExperienceState>;
}

export default function ExperienceCanvas({ stateRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const c = ctx;
    const cv = canvas;

    let animId: number = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isTabVisible = true;
    let lastTime = performance.now();
    let ambientTime = 0;

    // Check reduced motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (stateRef.current) {
      stateRef.current.reducedMotion = reducedMotionQuery.matches;
    }

    const onMotionChange = (e: MediaQueryListEvent) => {
      if (stateRef.current) stateRef.current.reducedMotion = e.matches;
    };
    reducedMotionQuery.addEventListener('change', onMotionChange);

    // Particles pool (pre-allocated)
    const PARTICLE_COUNT = 90;
    const particles: Particle[] = [];

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const typeChoice = Math.random();
        particles.push({
          x: Math.random() * (width || 1200),
          y: Math.random() * (height || 800),
          vx: (Math.random() - 0.3) * 0.4,
          vy: -0.2 - Math.random() * 0.4,
          size: 1 + Math.random() * 2,
          alpha: 0.1 + Math.random() * 0.35,
          baseAlpha: 0.1 + Math.random() * 0.35,
          life: Math.random(),
          type: typeChoice < 0.6 ? 'air' : typeChoice < 0.85 ? 'water' : 'thermal',
        });
      }
    }

    function resize() {
      if (!cv) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      cv.width = Math.floor(width * dpr);
      cv.height = Math.floor(height * dpr);
      cv.style.width = `${width}px`;
      cv.style.height = `${height}px`;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0) {
        initParticles();
      }
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Smooth pointer parallax
    const onMouseMove = (e: MouseEvent) => {
      if (!stateRef.current) return;
      stateRef.current.pointer.x = (e.clientX / width - 0.5) * 2;
      stateRef.current.pointer.y = (e.clientY / height - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Tab visibility handling
    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        lastTime = performance.now();
        animId = requestAnimationFrame(renderLoop);
      } else {
        cancelAnimationFrame(animId);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // ── MAIN RENDER LOOP ──────────────────────────────────────────────
    function renderLoop(currentTime: number) {
      if (!isTabVisible) return;

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const state = stateRef.current;
      const isReduced = state?.reducedMotion ?? false;

      // Increment continuous ambient animation regardless of scroll!
      if (!isReduced) {
        ambientTime += dt;
        // Smooth pointer lerp
        if (state) {
          state.pointer.currentX += (state.pointer.x - state.pointer.currentX) * 0.05;
          state.pointer.currentY += (state.pointer.y - state.pointer.currentY) * 0.05;
        }
      }

      const activeSection = state ? state.activeSection : 0;
      const sectionProgress = state ? state.sectionProgress : 0;
      const overallProgress = state ? state.scrollProgress : 0;
      const ptrX = state ? state.pointer.currentX : 0;
      const ptrY = state ? state.pointer.currentY : 0;

      // 1. Clear & Background Sky / Earth Atmosphere
      drawAtmosphere(c, width, height, ambientTime, overallProgress, ptrX, ptrY);

      // 2. Landscape Topology & Industrial Complex Footprint
      drawIndustrialTopology(c, width, height, ambientTime, activeSection, sectionProgress, ptrX, ptrY);

      // 3. Environmental Particles & Air Currents (Continuous Ambient Motion)
      drawParticles(c, width, height, ambientTime, activeSection, isReduced);

      // 4. Section-Specific Intelligence & Visual Phenomena
      drawNarrativeLayers(c, width, height, ambientTime, activeSection, sectionProgress);

      // 5. Scientific Telemetry Vignette & Coordinate Grids
      drawTelemetryOverlay(c, width, height, ambientTime, activeSection, overallProgress);

      animId = requestAnimationFrame(renderLoop);
    }

    // ── DRAWING PASSES ────────────────────────────────────────────────

    function drawAtmosphere(
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      progress: number,
      px: number,
      py: number
    ) {
      // Natural deep gradient: charcoal / dark slate / forest undertones
      const sunShift = Math.sin(t * 0.15) * 20;
      const grad = c.createRadialGradient(
        w * 0.7 + px * 30 + sunShift,
        h * 0.25 + py * 20,
        50,
        w * 0.5,
        h * 0.6,
        Math.max(w, h) * 0.9
      );

      // Warm atmospheric morning/dawn sunlight filtering through haze
      grad.addColorStop(0, 'rgba(28, 38, 32, 1)');      // Subtle forest morning
      grad.addColorStop(0.35, 'rgba(15, 20, 18, 1)');   // Dark slate
      grad.addColorStop(0.7, 'rgba(9, 12, 11, 1)');     // Charcoal
      grad.addColorStop(1, 'rgba(6, 8, 7, 1)');         // Deep near-black

      c.fillStyle = grad;
      c.fillRect(0, 0, w, h);

      // Volumetric sunlight beam (subtle scientific documentary lighting)
      c.save();
      c.globalCompositeOperation = 'screen';
      const sunBeamGrad = c.createLinearGradient(w * 0.85, 0, w * 0.2, h);
      const beamIntensity = 0.04 + Math.sin(t * 0.25) * 0.015;
      sunBeamGrad.addColorStop(0, `rgba(245, 215, 165, ${beamIntensity * 1.5})`);
      sunBeamGrad.addColorStop(0.4, `rgba(215, 230, 210, ${beamIntensity * 0.7})`);
      sunBeamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      c.fillStyle = sunBeamGrad;
      c.beginPath();
      c.moveTo(w * 0.6, 0);
      c.lineTo(w, 0);
      c.lineTo(w * 0.45, h);
      c.lineTo(0, h * 0.85);
      c.closePath();
      c.fill();
      c.restore();

      // Atmospheric rolling mist (procedural soft sinusoidal bands)
      c.save();
      c.fillStyle = 'rgba(200, 220, 210, 0.012)';
      for (let i = 0; i < 3; i++) {
        const yOffset = h * (0.35 + i * 0.18) + Math.sin(t * 0.2 + i * 1.5) * 25;
        c.beginPath();
        c.moveTo(0, yOffset);
        for (let x = 0; x <= w; x += 60) {
          const wave = Math.sin((x * 0.003) + t * 0.15 + i) * 18 + Math.cos((x * 0.007) - t * 0.1) * 12;
          c.lineTo(x, yOffset + wave);
        }
        c.lineTo(w, h);
        c.lineTo(0, h);
        c.closePath();
        c.fill();
      }
      c.restore();
    }

    function drawIndustrialTopology(
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      section: number,
      prog: number,
      px: number,
      py: number
    ) {
      c.save();
      // Parallax shift based on mouse & section progression
      const zoom = 1.0 + Math.sin(section * 0.2) * 0.05;
      const cx = w * 0.5 + px * 12;
      const cy = h * 0.52 + py * 10;

      // Isometric / aerial perspective center
      const baseX = cx - (w * 0.25) * zoom;
      const baseY = cy - (h * 0.08) * zoom;

      // Topographic elevation lines (natural terrain surrounding facility)
      c.strokeStyle = 'rgba(74, 110, 88, 0.07)';
      c.lineWidth = 1;
      for (let r = 80; r < Math.max(w, h) * 0.7; r += 75) {
        c.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.2) {
          const distort = Math.sin(a * 4 + r * 0.05) * 14 + Math.cos(a * 2 + t * 0.05) * 8;
          const x = cx + Math.cos(a) * (r + distort) * 1.4;
          const y = cy + Math.sin(a) * (r * 0.6 + distort * 0.5);
          if (a === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.closePath();
        c.stroke();
      }

      // Cooling Water Canal (natural blue/slate waterway)
      const canalGrad = c.createLinearGradient(0, cy + 90, w, cy + 180);
      canalGrad.addColorStop(0, 'rgba(12, 28, 38, 0.45)');
      canalGrad.addColorStop(0.5, 'rgba(18, 44, 56, 0.65)');
      canalGrad.addColorStop(1, 'rgba(10, 24, 32, 0.4)');
      c.fillStyle = canalGrad;
      c.beginPath();
      c.moveTo(0, cy + 140);
      c.bezierCurveTo(w * 0.3, cy + 110, w * 0.7, cy + 190, w, cy + 140);
      c.lineTo(w, cy + 210);
      c.bezierCurveTo(w * 0.7, cy + 250, w * 0.3, cy + 170, 0, cy + 210);
      c.closePath();
      c.fill();

      // Water current streamline ripples
      c.strokeStyle = 'rgba(45, 212, 191, 0.12)';
      c.lineWidth = 1;
      c.setLineDash([8, 16]);
      c.lineDashOffset = -t * 18;
      c.beginPath();
      c.moveTo(0, cy + 175);
      c.bezierCurveTo(w * 0.3, cy + 145, w * 0.7, cy + 225, w, cy + 175);
      c.stroke();
      c.setLineDash([]);

      // Forest canopy buffer zone (stylized natural green footprint)
      c.fillStyle = 'rgba(23, 40, 30, 0.35)';
      c.beginPath();
      c.ellipse(cx - w * 0.32, cy - h * 0.12, w * 0.18, h * 0.12, -0.2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = 'rgba(30, 54, 40, 0.25)';
      c.beginPath();
      c.ellipse(cx + w * 0.35, cy + h * 0.15, w * 0.15, h * 0.09, 0.3, 0, Math.PI * 2);
      c.fill();

      // Industrial Structures (Footprint & Architectural Modules)
      // Main Facility Boundary
      c.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      c.lineWidth = 1;
      c.strokeRect(cx - w * 0.22, cy - h * 0.18, w * 0.44, h * 0.36);

      // Grid guidelines within industrial zone
      c.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      for (let gx = cx - w * 0.2; gx <= cx + w * 0.2; gx += 40) {
        c.beginPath();
        c.moveTo(gx, cy - h * 0.18);
        c.lineTo(gx, cy + h * 0.18);
        c.stroke();
      }
      for (let gy = cy - h * 0.16; gy <= cy + h * 0.16; gy += 40) {
        c.beginPath();
        c.moveTo(cx - w * 0.22, gy);
        c.lineTo(cx + w * 0.22, gy);
        c.stroke();
      }

      // ── Facility Unit A: Combustion Furnace F-101 ─────────────────────
      const f101X = cx - w * 0.08;
      const f101Y = cy - h * 0.04;
      const f101W = Math.max(90, w * 0.09);
      const f101H = Math.max(70, h * 0.08);

      // Structure shadow & body
      c.fillStyle = 'rgba(18, 24, 22, 0.9)';
      c.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      c.fillRect(f101X, f101Y, f101W, f101H);
      c.strokeRect(f101X, f101Y, f101W, f101H);

      // Burner grid lines inside Furnace
      c.strokeStyle = 'rgba(245, 158, 11, 0.25)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(f101X + 10, f101Y + f101H * 0.5);
      c.lineTo(f101X + f101W - 10, f101Y + f101H * 0.5);
      c.moveTo(f101X + f101W * 0.5, f101Y + 10);
      c.lineTo(f101X + f101W * 0.5, f101Y + f101H - 10);
      c.stroke();

      // Label: F-101
      c.fillStyle = 'rgba(255, 255, 255, 0.4)';
      c.font = '9px "JetBrains Mono", monospace';
      c.fillText('FURNACE F-101', f101X + 8, f101Y + 16);

      // ── Facility Unit B: Primary Emission Stack 01 ───────────────────
      const stackX = cx + w * 0.09;
      const stackY = cy - h * 0.10;
      c.fillStyle = 'rgba(22, 28, 25, 0.92)';
      c.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      c.beginPath();
      c.arc(stackX, stackY, 18, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      c.beginPath();
      c.arc(stackX, stackY, 8, 0, Math.PI * 2);
      c.fillStyle = 'rgba(10, 14, 12, 1)';
      c.fill();
      c.stroke();

      c.fillStyle = 'rgba(255, 255, 255, 0.4)';
      c.fillText('STACK 01', stackX - 22, stackY - 24);

      // ── Facility Unit C: Power Substation & Turbine Hall ──────────────
      const subX = cx - w * 0.18;
      const subY = cy + h * 0.03;
      c.fillStyle = 'rgba(16, 22, 20, 0.85)';
      c.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      c.fillRect(subX, subY, 70, 50);
      c.strokeRect(subX, subY, 70, 50);
      c.fillStyle = 'rgba(255, 255, 255, 0.35)';
      c.fillText('POWER BUS', subX + 6, subY + 16);

      // Inter-unit pipe rack conduit lines
      c.strokeStyle = 'rgba(74, 222, 128, 0.18)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(subX + 70, subY + 25);
      c.lineTo(f101X, f101Y + 25);
      c.lineTo(f101X + f101W, f101Y + 25);
      c.lineTo(stackX, stackY + 18);
      c.stroke();

      c.restore();
    }

    function drawParticles(
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      section: number,
      isReduced: boolean
    ) {
      if (isReduced) return;

      c.save();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update particle
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) {
          p.y = h;
          p.x = Math.random() * w;
        }

        // Particle rendering based on type
        if (p.type === 'air') {
          // Atmospheric dust/moisture particle
          c.fillStyle = `rgba(200, 225, 215, ${p.alpha * (0.8 + Math.sin(t + i) * 0.2)})`;
          c.beginPath();
          c.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
          c.fill();
        } else if (p.type === 'thermal') {
          // Subtle warm thermal emission drift
          c.fillStyle = `rgba(240, 195, 130, ${p.alpha * 0.6})`;
          c.beginPath();
          c.arc(p.x, p.y, p.size * 1.1, 0, Math.PI * 2);
          c.fill();
        } else {
          // Water vapour particle
          c.fillStyle = `rgba(45, 212, 191, ${p.alpha * 0.5})`;
          c.beginPath();
          c.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          c.fill();
        }
      }
      c.restore();
    }

    function drawNarrativeLayers(
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      section: number,
      prog: number
    ) {
      c.save();

      // SECTION 02: THE ENVIRONMENT (Telemetry Nodes: CO2, Energy, Water, Air, Waste)
      if (section === 1) {
        drawTelemetryPoints(c, w, h, t, prog);
      }
      // SECTION 03: THE PROBLEM (Telemetry Streams with turbulence)
      else if (section === 2) {
        drawDataStreamsWithDeviation(c, w, h, t, prog);
      }
      // SECTION 04: DETECTION (Environmental reveal of anomaly)
      else if (section === 3) {
        drawAnomalyReveal(c, w, h, t, prog);
      }
      // SECTION 05: EXPLANATION (Deterministic Root Cause DAG)
      else if (section === 4) {
        drawRootCauseNetwork(c, w, h, t, prog);
      }
      // SECTION 06: PREDICTION (7-day Trajectory forecast cone)
      else if (section === 5) {
        drawPredictionTrajectory(c, w, h, t, prog);
      }
      // SECTION 07: SIMULATION (Do Nothing vs ONER Intervention)
      else if (section === 6) {
        drawSimulationBranching(c, w, h, t, prog);
      }
      // SECTION 08: ACTION (Convergence into control signal)
      else if (section === 7) {
        drawActionConvergence(c, w, h, t, prog);
      }
      // SECTION 09: AUTOPILOT (Holistic feedback loop)
      else if (section === 8) {
        drawAutopilotNexus(c, w, h, t, prog);
      }
      // SECTION 10: CONTROL PLANE (Restored harmonious equilibrium)
      else if (section >= 9) {
        drawControlPlaneEquilibrium(c, w, h, t, prog);
      }

      c.restore();
    }

    // ── SPECIFIC NARRATIVE RENDERERS ──────────────────────────────────

    function drawTelemetryPoints(
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      prog: number
    ) {
      const alpha = Math.min(prog * 1.5, 1);
      const points = [
        { label: 'CO₂', val: '412.8 ppm', sub: 'STACK 01', x: w * 0.58, y: h * 0.42, color: '#4ade80' },
        { label: 'ENERGY', val: '84.2 MW', sub: 'GRID BUS A', x: w * 0.32, y: h * 0.54, color: '#38bdf8' },
        { label: 'WATER', val: '1,240 m³/h', sub: 'CANAL FLOW', x: w * 0.65, y: h * 0.68, color: '#2dd4bf' },
        { label: 'AIR', val: '21.4 µg/m³', sub: 'PERIMETER N', x: w * 0.28, y: h * 0.36, color: '#a3e635' },
        { label: 'WASTE', val: '0.82 t/batch', sub: 'RECOVERY', x: w * 0.46, y: h * 0.62, color: '#f59e0b' },
      ];

      points.forEach((pt, idx) => {
        const pulse = Math.sin(t * 2 + idx) * 3;
        c.save();
        c.globalAlpha = alpha;

        // Radar ring around coordinate
        c.strokeStyle = pt.color;
        c.lineWidth = 1;
        c.beginPath();
        c.arc(pt.x, pt.y, 6 + pulse, 0, Math.PI * 2);
        c.stroke();

        // Inner solid core
        c.fillStyle = pt.color;
        c.beginPath();
        c.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        c.fill();

        // Hairline leader line to scientific label
        c.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        c.beginPath();
        c.moveTo(pt.x, pt.y);
        c.lineTo(pt.x + 24, pt.y - 18);
        c.lineTo(pt.x + 110, pt.y - 18);
        c.stroke();

        // Telemetry tag box
        c.fillStyle = 'rgba(10, 14, 12, 0.85)';
        c.fillRect(pt.x + 24, pt.y - 34, 96, 28);
        c.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        c.strokeRect(pt.x + 24, pt.y - 34, 96, 28);

        c.fillStyle = '#ffffff';
        c.font = '600 10px "Space Grotesk", sans-serif';
        c.fillText(`${pt.label} · ${pt.val}`, pt.x + 30, pt.y - 20);

        c.fillStyle = 'rgba(255, 255, 255, 0.45)';
        c.font = '8px "JetBrains Mono", monospace';
        c.fillText(pt.sub, pt.x + 30, pt.y - 10);

        c.restore();
      });
    }

    function drawDataStreamsWithDeviation(
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      prog: number
    ) {
      c.save();
      // Flowing telemetry streams through facility corridors
      const startX = w * 0.25;
      const endX = w * 0.75;
      const midY = h * 0.5;

      const lines = [
        { yOffset: -50, label: 'STREAM_01: NATURAL GAS', normal: true },
        { yOffset: -20, label: 'STREAM_02: COMBUSTION TEMP', normal: false }, // Begins deviating
        { yOffset: 15, label: 'STREAM_03: OUTFLOW CO₂', normal: true },
        { yOffset: 45, label: 'STREAM_04: POWER DEMAND', normal: true },
      ];

      lines.forEach((line, lIdx) => {
        c.beginPath();
        c.lineWidth = line.normal ? 1.2 : 2.0;
        c.strokeStyle = line.normal ? 'rgba(74, 222, 128, 0.4)' : 'rgba(245, 158, 11, 0.8)';

        for (let x = startX; x <= endX; x += 15) {
          const ratio = (x - startX) / (endX - startX);
          let deviation = 0;
          if (!line.normal && ratio > 0.45) {
            // Subtle turbulence appears in combustion line
            deviation = Math.sin(ratio * 15 - t * 3) * 16 * Math.min(prog * 2, 1);
          }
          const y = midY + line.yOffset + Math.sin(ratio * 8 + t * 2) * 5 + deviation;
          if (x === startX) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.stroke();

        // Stream pulses
        const pulsePos = (t * 0.35 + lIdx * 0.25) % 1;
        const pulseX = startX + pulsePos * (endX - startX);
        const pulseY = midY + line.yOffset + (line.normal ? 0 : Math.sin(pulsePos * 15 - t * 3) * 12);

        c.fillStyle = line.normal ? '#4ade80' : '#f59e0b';
        c.beginPath();
        c.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
        c.fill();
      });

      c.restore();
    }

    function drawAnomalyReveal(
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      prog: number
    ) {
      c.save();
      const fx = w * 0.42;
      const fy = h * 0.48;

      // Anomaly thermal aura expanding around Furnace F-101
      const auraRad = 50 + Math.sin(t * 3) * 12;
      const auraGrad = c.createRadialGradient(fx, fy, 5, fx, fy, auraRad);
      auraGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
      auraGrad.addColorStop(0.6, 'rgba(239, 68, 68, 0.15)');
      auraGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      c.fillStyle = auraGrad;
      c.beginPath();
      c.arc(fx, fy, auraRad, 0, Math.PI * 2);
      c.fill();

      // Anomaly boundary contour lines
      c.strokeStyle = 'rgba(245, 158, 11, 0.7)';
      c.lineWidth = 1;
      c.setLineDash([4, 4]);
      c.beginPath();
      c.arc(fx, fy, auraRad * 0.8, 0, Math.PI * 2);
      c.stroke();
      c.setLineDash([]);

      // Subtle scientific crosshair & data callout (Revealed by the environment)
      c.strokeStyle = '#ef4444';
      c.beginPath();
      c.moveTo(fx - 15, fy);
      c.lineTo(fx + 15, fy);
      c.moveTo(fx, fy - 15);
      c.lineTo(fx, fy + 15);
      c.stroke();

      // Precision Anomaly Tag
      const cardX = fx + 65;
      const cardY = fy - 40;
      c.fillStyle = 'rgba(12, 16, 14, 0.9)';
      c.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      c.fillRect(cardX, cardY, 190, 68);
      c.strokeRect(cardX, cardY, 190, 68);

      c.fillStyle = '#f59e0b';
      c.font = '600 11px "Space Grotesk", sans-serif';
      c.fillText('ANOMALY DETECTED', cardX + 12, cardY + 20);

      c.fillStyle = '#d4d4d8';
      c.font = '9px "JetBrains Mono", monospace';
      c.fillText('ISOLATION SCORE: 0.884 [ALERT]', cardX + 12, cardY + 36);
      c.fillText('THERMAL DEVIATION: +18.4°C', cardX + 12, cardY + 50);

      c.restore();
    }

    function drawRootCauseNetwork(
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      prog: number
    ) {
      c.save();
      // Directed Acyclic Graph (DAG) representing deterministic root cause
      const nodes = [
        { id: 'Furnace', x: w * 0.22, y: h * 0.50, val: 'F-101 BURNER' },
        { id: 'Temperature', x: w * 0.36, y: h * 0.42, val: '+18.4°C DRIFT' },
        { id: 'Natural Gas', x: w * 0.50, y: h * 0.36, val: '+6.2% FEED' },
        { id: 'Energy', x: w * 0.64, y: h * 0.44, val: 'kWh/ton +4.1%' },
        { id: 'NOx', x: w * 0.76, y: h * 0.38, val: 'NOx +12.8%' },
        { id: 'CO₂', x: w * 0.86, y: h * 0.52, val: 'EXCESS +14.2 t' },
      ];

      // Connecting edges
      for (let i = 0; i < nodes.length - 1; i++) {
        const n1 = nodes[i];
        const n2 = nodes[i + 1];

        c.strokeStyle = 'rgba(74, 222, 128, 0.45)';
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(n1.x, n1.y);
        c.lineTo(n2.x, n2.y);
        c.stroke();

        // Dynamic energy pulse traversing causal chain
        const edgeProgress = ((t * 0.8 + i * 0.2) % 1);
        const px = n1.x + (n2.x - n1.x) * edgeProgress;
        const py = n1.y + (n2.y - n1.y) * edgeProgress;

        c.fillStyle = '#4ade80';
        c.beginPath();
        c.arc(px, py, 3, 0, Math.PI * 2);
        c.fill();
      }

      // Render Nodes
      nodes.forEach((node) => {
        c.fillStyle = 'rgba(12, 18, 15, 0.9)';
        c.strokeStyle = '#4ade80';
        c.lineWidth = 1;
        c.beginPath();
        c.roundRect(node.x - 42, node.y - 20, 84, 40, 8);
        c.fill();
        c.stroke();

        c.fillStyle = '#ffffff';
        c.font = '600 10px "Space Grotesk", sans-serif';
        c.textAlign = 'center';
        c.fillText(node.id, node.x, node.y - 4);

        c.fillStyle = '#4ade80';
        c.font = '8px "JetBrains Mono", monospace';
        c.fillText(node.val, node.x, node.y + 11);
      });
      c.textAlign = 'left';

      // Synthesis Banner: THERMAL EFFICIENCY DEGRADATION
      const synthW = Math.min(w * 0.6, 420);
      const synthX = (w - synthW) * 0.5;
      const synthY = h * 0.68;

      c.fillStyle = 'rgba(15, 22, 18, 0.95)';
      c.strokeStyle = 'rgba(74, 222, 128, 0.5)';
      c.lineWidth = 1;
      c.beginPath();
      c.roundRect(synthX, synthY, synthW, 56, 10);
      c.fill();
      c.stroke();

      c.fillStyle = '#6fe38b';
      c.font = '700 12px "Space Grotesk", sans-serif';
      c.fillText('ROOT CAUSE CONFIRMED', synthX + 20, synthY + 22);

      c.fillStyle = '#ffffff';
      c.font = '600 13px "Space Grotesk", sans-serif';
      c.fillText('THERMAL EFFICIENCY DEGRADATION', synthX + 20, synthY + 41);

      c.restore();
    }

    function drawPredictionTrajectory(
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      prog: number
    ) {
      c.save();
      const originX = w * 0.25;
      const originY = h * 0.55;
      const horizonW = w * 0.55;

      // Forecast Confidence Shading (Conformal prediction bands)
      const grad = c.createLinearGradient(originX, originY, originX + horizonW, originY);
      grad.addColorStop(0, 'rgba(74, 222, 128, 0.05)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0.15)');

      c.fillStyle = grad;
      c.beginPath();
      c.moveTo(originX, originY);
      // Upper bound
      for (let x = 0; x <= horizonW; x += 20) {
        const r = x / horizonW;
        const upper = originY - r * 60 - Math.sin(r * 5 + t) * 8 - r * 35;
        c.lineTo(originX + x, upper);
      }
      // Lower bound
      for (let x = horizonW; x >= 0; x -= 20) {
        const r = x / horizonW;
        const lower = originY - r * 60 + Math.sin(r * 5 + t) * 8 + r * 35;
        c.lineTo(originX + x, lower);
      }
      c.closePath();
      c.fill();

      // Median Expected Trajectory Line
      c.strokeStyle = '#4ade80';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(originX, originY);
      for (let x = 0; x <= horizonW; x += 15) {
        const r = x / horizonW;
        const y = originY - r * 60 + Math.sin(r * 6 - t * 2) * 6;
        c.lineTo(originX + x, y);
      }
      c.stroke();

      // 7-day Time Axis Ticks
      const days = ['NOW', '+24H', '+48H', '+72H', '+5D', '+7D'];
      days.forEach((day, idx) => {
        const tx = originX + (idx / (days.length - 1)) * horizonW;
        c.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        c.beginPath();
        c.moveTo(tx, originY + 25);
        c.lineTo(tx, originY + 35);
        c.stroke();

        c.fillStyle = 'rgba(255, 255, 255, 0.45)';
        c.font = '9px "JetBrains Mono", monospace';
        c.textAlign = 'center';
        c.fillText(day, tx, originY + 50);
      });
      c.textAlign = 'left';

      c.restore();
    }

    function drawSimulationBranching(
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      prog: number
    ) {
      c.save();
      const splitX = w * 0.35;
      const splitY = h * 0.52;
      const branchW = w * 0.45;

      // Trajectory 1: DO NOTHING (Upper, Warning Red/Amber)
      c.strokeStyle = '#f87171';
      c.lineWidth = 2.2;
      c.beginPath();
      c.moveTo(splitX, splitY);
      c.bezierCurveTo(splitX + branchW * 0.4, splitY - 20, splitX + branchW * 0.7, splitY - 90, splitX + branchW, splitY - 110);
      c.stroke();

      // Label: DO NOTHING
      c.fillStyle = '#f87171';
      c.font = '600 12px "Space Grotesk", sans-serif';
      c.fillText('DO NOTHING', splitX + branchW + 12, splitY - 106);
      c.fillStyle = 'rgba(248, 113, 113, 0.7)';
      c.font = '9px "JetBrains Mono", monospace';
      c.fillText('+14.2% CARBON DRIFT · COMPLIANCE BREACH', splitX + branchW + 12, splitY - 92);

      // Trajectory 2: ONER INTERVENTION (Lower, Emerald Green)
      c.strokeStyle = '#4ade80';
      c.lineWidth = 2.2;
      c.beginPath();
      c.moveTo(splitX, splitY);
      c.bezierCurveTo(splitX + branchW * 0.3, splitY + 40, splitX + branchW * 0.6, splitY + 70, splitX + branchW, splitY + 75);
      c.stroke();

      // Label: ONER INTERVENTION
      c.fillStyle = '#4ade80';
      c.font = '600 12px "Space Grotesk", sans-serif';
      c.fillText('ONER INTERVENTION', splitX + branchW + 12, splitY + 72);
      c.fillStyle = 'rgba(74, 222, 128, 0.7)';
      c.font = '9px "JetBrains Mono", monospace';
      c.fillText('-210 tCO₂e/MO · EFFICIENCY RESTORED', splitX + branchW + 12, splitY + 86);

      // Branching Node Marker
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(splitX, splitY, 4, 0, Math.PI * 2);
      c.fill();

      c.restore();
    }

    function drawActionConvergence(
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      prog: number
    ) {
      c.save();
      const cx = w * 0.5;
      const cy = h * 0.52;

      // Streams converging into central clean control signal
      const angles = [0, Math.PI * 0.33, Math.PI * 0.66, Math.PI, Math.PI * 1.33, Math.PI * 1.66];
      angles.forEach((ang, idx) => {
        const radius = 180 - Math.min(prog * 100, 80);
        const sx = cx + Math.cos(ang + t * 0.2) * radius;
        const sy = cy + Math.sin(ang + t * 0.2) * radius;

        c.strokeStyle = 'rgba(74, 222, 128, 0.35)';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(sx, sy);
        c.lineTo(cx, cy);
        c.stroke();

        // Convergence particle
        const rPos = (t * 0.5 + idx * 0.16) % 1;
        const px = sx + (cx - sx) * rPos;
        const py = sy + (cy - sy) * rPos;

        c.fillStyle = '#4ade80';
        c.beginPath();
        c.arc(px, py, 2.5, 0, Math.PI * 2);
        c.fill();
      });

      // Central Control Capsule
      c.fillStyle = 'rgba(12, 18, 15, 0.95)';
      c.strokeStyle = '#4ade80';
      c.lineWidth = 1.5;
      c.beginPath();
      c.roundRect(cx - 130, cy - 35, 260, 70, 12);
      c.fill();
      c.stroke();

      c.fillStyle = '#4ade80';
      c.font = '600 11px "Space Grotesk", sans-serif';
      c.textAlign = 'center';
      c.fillText('OPTIMAL CONTROL DISPATCH', cx, cy - 12);

      c.fillStyle = '#ffffff';
      c.font = '9px "JetBrains Mono", monospace';
      c.fillText('ACTUATOR: DAMPER_TRIM -> 1.042', cx, cy + 4);
      c.fillStyle = 'rgba(255, 255, 255, 0.5)';
      c.fillText('STATUS: CLOSED-LOOP ACTIVE', cx, cy + 18);
      c.textAlign = 'left';

      c.restore();
    }

    function drawAutopilotNexus(
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      prog: number
    ) {
      c.save();
      const cx = w * 0.5;
      const cy = h * 0.52;
      const r = Math.min(w, h) * 0.22;

      // Circular Autopilot Orbital Loop
      c.strokeStyle = 'rgba(74, 222, 128, 0.25)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.stroke();

      // The 6 Pillars of ONER
      const pillars = ['SENSE', 'DETECT', 'EXPLAIN', 'PREDICT', 'SIMULATE', 'ACT'];
      pillars.forEach((p, idx) => {
        const ang = (idx / 6) * Math.PI * 2 - Math.PI / 2 + t * 0.08;
        const px = cx + Math.cos(ang) * r;
        const py = cy + Math.sin(ang) * r;

        // Pillar node
        c.fillStyle = 'rgba(14, 22, 18, 0.95)';
        c.strokeStyle = '#4ade80';
        c.lineWidth = 1;
        c.beginPath();
        c.arc(px, py, 22, 0, Math.PI * 2);
        c.fill();
        c.stroke();

        c.fillStyle = '#ffffff';
        c.font = '600 8.5px "Space Grotesk", sans-serif';
        c.textAlign = 'center';
        c.fillText(p, px, py + 3);
      });

      // Core Hub
      c.fillStyle = '#4ade80';
      c.beginPath();
      c.arc(cx, cy, 6, 0, Math.PI * 2);
      c.fill();

      c.textAlign = 'left';
      c.restore();
    }

    function drawControlPlaneEquilibrium(
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      prog: number
    ) {
      c.save();
      // Whole facility in green/teal harmonious equilibrium
      const cx = w * 0.5;
      const cy = h * 0.48;

      // Soft ambient pulse across the digital twin
      const pulseRad = 120 + Math.sin(t * 1.5) * 15;
      const grad = c.createRadialGradient(cx, cy, 20, cx, cy, pulseRad);
      grad.addColorStop(0, 'rgba(74, 222, 128, 0.08)');
      grad.addColorStop(1, 'rgba(74, 222, 128, 0)');

      c.fillStyle = grad;
      c.beginPath();
      c.arc(cx, cy, pulseRad, 0, Math.PI * 2);
      c.fill();

      c.restore();
    }

    function drawTelemetryOverlay(
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      section: number,
      prog: number
    ) {
      c.save();
      // Subtle corner scientific coordinate labels
      c.fillStyle = 'rgba(255, 255, 255, 0.22)';
      c.font = '9px "JetBrains Mono", monospace';
      c.fillText('SYS_COORD: 37°24\'11"N 122°08\'44"W', 36, h - 32);
      c.fillText(`CADENCE: 60Hz · TIMESTEP: ${(t).toFixed(1)}s`, 36, h - 18);

      c.textAlign = 'right';
      c.fillText(`STAGE: 0${section + 1}/10`, w - 36, h - 32);
      c.fillText(`BUFFER PROGRESS: ${(prog * 100).toFixed(0)}%`, w - 36, h - 18);
      c.textAlign = 'left';

      c.restore();
    }

    // ── CLEANUP ───────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotionQuery.removeEventListener('change', onMotionChange);
    };
  }, [stateRef]);

  return (
    <canvas
      ref={canvasRef}
      id="oner-experience-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}
