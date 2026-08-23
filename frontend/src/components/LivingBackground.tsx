'use client';
/**
 * ONER Living Interface Background
 *
 * Mounts ONCE at the root layout level.
 * Renders:
 *   - Noise layer (static SVG texture)
 *   - Animated canvas (grid reveal, ambient glow, pulses, particles, cursor core)
 *   - Custom cursor dot
 *
 * All animation runs in requestAnimationFrame — zero React re-renders.
 * Cleans up completely on unmount.
 * Respects prefers-reduced-motion and touch devices.
 */

import { useEffect, useRef } from 'react';

export default function LivingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Create non-null aliases — both are confirmed non-null by the early returns above
    const cv = canvas;
    const c = ctx;

    const cursorEl = document.getElementById('oner-cursor');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    // ── sizing ──────────────────────────────────────────────
    let W = 0, H = 0, DPR = 1;
    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * DPR;
      cv.height = H * DPR;
      cv.style.width = W + 'px';
      cv.style.height = H + 'px';
      c.setTransform(DPR, 0, 0, DPR, 0, 0);
      buildGrid();
    }

    // ── grid ────────────────────────────────────────────────
    const GRID_SIZE = 46;
    let gridPoints: { x: number; y: number }[] = [];
    function buildGrid() {
      gridPoints = [];
      for (let x = 0; x <= W; x += GRID_SIZE) {
        for (let y = 0; y <= H; y += GRID_SIZE) {
          gridPoints.push({ x, y });
        }
      }
    }

    // ── pointer state ────────────────────────────────────────
    let mouseX = -9999, mouseY = -9999;
    let smoothX = 0, smoothY = 0;
    let prevSX = 0, prevSY = 0;
    let velocity = 0;
    let idleTimer = 0;
    let active = false;

    function setPointer(x: number, y: number) {
      mouseX = x;
      mouseY = y;
      active = true;
      idleTimer = 0;
      if (cursorEl) {
        cursorEl.style.left = x + 'px';
        cursorEl.style.top = y + 'px';
      }
      updateProximity(x, y);
    }

    function onMouseMove(e: MouseEvent) {
      setPointer(e.clientX, e.clientY);
    }
    function onTouchMove(e: TouchEvent) {
      if (e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
    }
    function onTouchStart(e: TouchEvent) {
      if (e.touches[0]) {
        setPointer(e.touches[0].clientX, e.touches[0].clientY);
        spawnPulse(e.touches[0].clientX, e.touches[0].clientY, 1);
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('resize', resize);

    // ── proximity for cards + nav ────────────────────────────
    function getProxEls() {
      return Array.from(document.querySelectorAll<HTMLElement>('[data-prox], .nav-prox-item'));
    }

    function updateProximity(x: number, y: number) {
      getProxEls().forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(x - cx, y - cy);
        const maxD = Math.max(r.width, r.height) * 1.5 + 280;
        let strength = Math.max(0, Math.min(1, 1 - d / maxD));
        const px = ((x - r.left) / r.width) * 100;
        const py = ((y - r.top) / r.height) * 100;
        el.style.setProperty('--strength', strength.toFixed(3));
        el.style.setProperty('--px', px.toFixed(1) + '%');
        el.style.setProperty('--py', py.toFixed(1) + '%');
      });
    }

    // ── pulses ───────────────────────────────────────────────
    type Pulse = { x: number; y: number; r: number; alpha: number; maxR: number };
    let pulses: Pulse[] = [];
    let lastPulseTime = 0;
    function spawnPulse(x: number, y: number, strength: number) {
      if (reduceMotion) return;
      pulses.push({ x, y, r: 0, alpha: 0.45 * strength, maxR: 260 + strength * 140 });
    }

    // ── particles ────────────────────────────────────────────
    type Particle = { x: number; y: number; vx: number; vy: number; life: number; size: number };
    let particles: Particle[] = [];
    const MAX_PARTICLES = 40;

    function spawnParticles(x: number, y: number, vel: number) {
      if (reduceMotion) return;
      if (particles.length >= MAX_PARTICLES) return;
      const n = Math.min(2, Math.floor(vel / 7));
      for (let i = 0; i < n; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 12,
          y: y + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          life: 1,
          size: Math.random() * 1.5 + 0.5,
        });
      }
    }

    // ── animation loop ───────────────────────────────────────
    let rafId = 0;
    function tick() {
      // lerp
      prevSX = smoothX; prevSY = smoothY;
      const lerp = reduceMotion ? 1 : 0.13;
      smoothX += (mouseX - smoothX) * lerp;
      smoothY += (mouseY - smoothY) * lerp;

      const dx = smoothX - prevSX;
      const dy = smoothY - prevSY;
      const dist = Math.hypot(dx, dy);
      velocity = velocity * 0.8 + dist * 0.2;

      idleTimer += 16;
      const idle = idleTimer > 250;

      // spawn pulse
      const now = performance.now();
      if (!reduceMotion && velocity > 3 && now - lastPulseTime > 270) {
        spawnPulse(smoothX, smoothY, Math.min(1.5, velocity / 40));
        lastPulseTime = now;
      }
      if (!reduceMotion) spawnParticles(smoothX, smoothY, velocity);

      c.clearRect(0, 0, W, H);

      if (active) {
        // ── ambient wash ────────────────────────────────────
        const ambientAlpha = idle ? 0.045 : 0.08;
        const ambR = 430;
        const grad = c.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, ambR);
        grad.addColorStop(0,   `rgba(230,255,63,${ambientAlpha})`);
        grad.addColorStop(0.4, `rgba(230,255,63,${ambientAlpha * 0.30})`);
        grad.addColorStop(1,   'rgba(230,255,63,0)');
        c.fillStyle = grad;
        c.fillRect(0, 0, W, H);

        // ── grid reveal ──────────────────────────────────────
        const revealR = 235;
        for (let i = 0; i < gridPoints.length; i++) {
          const p = gridPoints[i];
          const d = Math.hypot(p.x - smoothX, p.y - smoothY);
          if (d < revealR) {
            const t = 1 - d / revealR;
            const a = t * t * 0.15;
            c.fillStyle = `rgba(230,255,63,${a})`;
            c.fillRect(p.x, p.y, 1, 1);
            // cross-hairs for inner radius
            if (t > 0.6) {
              c.strokeStyle = `rgba(230,255,63,${a * 0.45})`;
              c.lineWidth = 0.8;
              c.beginPath();
              c.moveTo(p.x - 4, p.y);
              c.lineTo(p.x + 4, p.y);
              c.moveTo(p.x, p.y - 4);
              c.lineTo(p.x, p.y + 4);
              c.stroke();
            }
          }
        }
      }

      // ── pulses ──────────────────────────────────────────────
      pulses.forEach(p => {
        p.r += 3.2 + velocity * 0.04;
        p.alpha *= 0.966;
      });
      pulses = pulses.filter(p => p.alpha > 0.008 && p.r < p.maxR);
      pulses.forEach(p => {
        c.beginPath();
        c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        c.strokeStyle = `rgba(230,255,63,${p.alpha})`;
        c.lineWidth = 1.1;
        c.shadowColor = 'rgba(230,255,63,0.5)';
        c.shadowBlur = 7;
        c.stroke();
        c.shadowBlur = 0;
      });

      // ── particles ──────────────────────────────────────────
      particles.forEach(pt => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.022;
      });
      particles = particles.filter(pt => pt.life > 0);
      particles.forEach(pt => {
        c.beginPath();
        c.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        c.fillStyle = `rgba(242,255,176,${pt.life * 0.45})`;
        c.fill();
      });

      // ── cursor core glow ────────────────────────────────────
      if (active) {
        const coreAlpha = idle ? 0.30 : 0.50;
        const midR = 55 + velocity * 1.0;
        const midGrad = c.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, midR);
        midGrad.addColorStop(0, `rgba(230,255,63,${coreAlpha * 0.45})`);
        midGrad.addColorStop(1, 'rgba(230,255,63,0)');
        c.fillStyle = midGrad;
        c.beginPath();
        c.arc(smoothX, smoothY, midR, 0, Math.PI * 2);
        c.fill();

        c.beginPath();
        c.arc(smoothX, smoothY, 2.2, 0, Math.PI * 2);
        c.fillStyle = `rgba(242,255,176,${coreAlpha})`;
        c.shadowColor = 'rgba(230,255,63,0.9)';
        c.shadowBlur = 12;
        c.fill();
        c.shadowBlur = 0;
      }

      // cursor dot opacity
      if (cursorEl) {
        cursorEl.style.opacity = idle ? '0.45' : '1';
      }

      rafId = requestAnimationFrame(tick);
    }

    // ── init ────────────────────────────────────────────────
    resize();
    if (!isTouch) {
      smoothX = W / 2;
      smoothY = H / 2;
      mouseX  = W / 2;
      mouseY  = H / 2;
    }
    rafId = requestAnimationFrame(tick);

    // ── cleanup ──────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      {/* Layer 0: deep background set by CSS (--bg: #050505) */}
      {/* Layer 1: noise texture */}
      <div id="oner-noise" aria-hidden="true" />
      {/* Layer 2: living canvas */}
      <canvas
        id="oner-living-canvas"
        ref={canvasRef}
        aria-hidden="true"
      />
      {/* Custom cursor dot */}
      <div id="oner-cursor" aria-hidden="true" />
    </>
  );
}
