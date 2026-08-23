"use client";

/**
 * HolographicClouds
 * ------------------
 * Premium, subtle, infinite-loop drifting "holographic dot cloud" background.
 *
 * - Pure #000000 background, tiny glowing golden dots forming cloud contours
 *   and horizontal trailing lines (matches the reference composition:
 *   large upper-left, large upper-right, small upper-center,
 *   large lower-left, small lower-right).
 * - Each cloud drifts slowly right -> left and wraps seamlessly (no jump).
 * - No vertical movement, no rotation, no scaling, no pulsing/flashing.
 * - Fast: each cloud is rasterized ONCE onto an offscreen bitmap (with its
 *   glow baked in), then every frame we just `drawImage` it at a new x.
 *   No per-dot redraw, no per-frame shadowBlur cost -> cheap, 60fps, mobile-safe.
 * - Respects prefers-reduced-motion and pauses when the tab is hidden.
 *
 * Usage: mount once, high in the tree (e.g. app/layout.tsx), as a fixed,
 * full-viewport, pointer-events-none layer behind your actual UI:
 *
 *   <body>
 *     <HolographicClouds />
 *     <div className="relative z-10">{children}</div>
 *   </body>
 */

import { useEffect, useRef } from "react";

// ---------- deterministic PRNG (avoids SSR/CSR hydration mismatch) ----------
function mulberry32(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Dot = { x: number; y: number; r: number; a: number };

interface CloudShape {
  dots: Dot[];
  width: number; // bounding width in "design px" (pre-scale)
  height: number;
}

// Lobe layout roughly matching the reference: one tall dome, a couple of
// medium humps, then small humps trailing off to the right.
const LOBES = [
  { cx: -0.05, cy: 0.05, r: 0.30 },
  { cx: 0.18, cy: -0.12, r: 0.46 },
  { cx: 0.10, cy: 0.14, r: 0.34 },
  { cx: 0.44, cy: -0.02, r: 0.40 },
  { cx: 0.62, cy: 0.16, r: 0.26 },
  { cx: 0.78, cy: 0.22, r: 0.17 },
];

function buildCloudShape(seed: number, baseR: number): CloudShape {
  const rng = mulberry32(seed);
  const dots: Dot[] = [];

  for (let i = 0; i < LOBES.length; i++) {
    const lobe = LOBES[i];
    const r = baseR * lobe.r;
    const cx = baseR * lobe.cx * 2.6;
    const cy = baseR * lobe.cy * 1.4;

    // outer dome arc (top ~200deg sweep)
    const startAngle = Math.PI * 1.04;
    const endAngle = Math.PI * 1.96;
    const outerCount = Math.max(9, Math.round((r * (endAngle - startAngle)) / 6.5));
    for (let d = 0; d < outerCount; d++) {
      const t = d / (outerCount - 1);
      const ang = startAngle + t * (endAngle - startAngle);
      const jitter = (rng() - 0.5) * 1.2;
      dots.push({
        x: cx + Math.cos(ang) * (r + jitter),
        y: cy + Math.sin(ang) * (r + jitter),
        r: 1.0 + rng() * 0.6,
        a: 0.55 + rng() * 0.35,
      });
    }

    // inner, fainter concentric arc -> layered "hologram" read
    const innerR = r * 0.84;
    const innerCount = Math.round(outerCount * 0.55);
    for (let d = 0; d < innerCount; d++) {
      const t = d / Math.max(1, innerCount - 1);
      const ang = startAngle + 0.18 + t * (endAngle - startAngle - 0.36);
      dots.push({
        x: cx + Math.cos(ang) * innerR,
        y: cy + Math.sin(ang) * innerR + r * 0.04,
        r: 0.8 + rng() * 0.5,
        a: 0.20 + rng() * 0.18,
      });
    }
  }

  const domeMinX = Math.min(...dots.map((p) => p.x));
  const domeMaxX = Math.max(...dots.map((p) => p.x));
  const domeMaxY = Math.max(...dots.map((p) => p.y));
  const domeMinY = Math.min(...dots.map((p) => p.y));

  // horizontal dotted trailing rows beneath the cluster, extending right,
  // thinning out / fading as they go (the "atmospheric data" streaks)
  const rowCount = 6 + Math.floor(rng() * 2);
  for (let row = 0; row < rowCount; row++) {
    const rowY = domeMaxY + 2 + row * (baseR * 0.05);
    const rowStart = domeMinX + rng() * baseR * 0.25;
    const reach = baseR * (1.1 + rng() * 2.1) * (1 - row / (rowCount * 1.7));
    const rowEnd = domeMaxX + reach;
    const spacing = baseR * 0.045 + rng() * baseR * 0.015;
    const count = Math.max(4, Math.round((rowEnd - rowStart) / Math.max(2, spacing)));
    const rowBaseAlpha = 0.42 - row * 0.045;
    for (let d = 0; d < count; d++) {
      const t = d / count;
      const fade = 1 - t * 0.88;
      dots.push({
        x: rowStart + t * (rowEnd - rowStart) + (rng() - 0.5) * 2,
        y: rowY + (rng() - 0.5) * 1.4,
        r: 0.7 + rng() * 0.45,
        a: Math.max(0.03, rowBaseAlpha * fade),
      });
    }
  }

  const minX = Math.min(domeMinX, ...dots.map((p) => p.x));
  const maxX = Math.max(...dots.map((p) => p.x));
  const minY = Math.min(domeMinY, ...dots.map((p) => p.y));
  const maxY = Math.max(...dots.map((p) => p.y));

  const shifted = dots.map((p) => ({ ...p, x: p.x - minX, y: p.y - minY }));

  return { dots: shifted, width: maxX - minX, height: maxY - minY };
}

// Rasterize a cloud shape (with glow baked in) to an offscreen canvas once.
// Every animation frame then just does a cheap drawImage() of this bitmap.
function rasterizeCloud(shape: CloudShape, dpr: number): { canvas: HTMLCanvasElement; pad: number } {
  const pad = 14; // room for glow bleed
  const w = Math.ceil(shape.width + pad * 2);
  const h = Math.ceil(shape.height + pad * 2);

  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.ceil(w * dpr));
  off.height = Math.max(1, Math.ceil(h * dpr));
  const ctx = off.getContext("2d");
  if (!ctx) return { canvas: off, pad };

  ctx.scale(dpr, dpr);
  ctx.shadowColor = "rgba(255, 196, 40, 0.55)";
  ctx.shadowBlur = 3.2;

  for (const p of shape.dots) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 205, 60, ${p.a})`;
    ctx.arc(p.x + pad, p.y + pad, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  return { canvas: off, pad };
}

interface CloudConfig {
  seed: number;
  baseR: number; // controls overall cloud size
  topPct: number; // vertical anchor as % of viewport height
  speed: number; // px/sec drift (right -> left)
  phase01: number; // 0..1 initial position within its loop period
  breathe: number; // subtle alpha-breathing amplitude (0 = off)
}

// Composition matches the reference: large upper-left, large upper-right,
// small upper-center, large lower-left, small lower-right.
const CLOUD_CONFIGS: CloudConfig[] = [
  { seed: 11, baseR: 92, topPct: 0.07, speed: 3.4, phase01: 0.06, breathe: 0.05 },
  { seed: 22, baseR: 118, topPct: 0.09, speed: 2.6, phase01: 0.62, breathe: 0.04 },
  { seed: 33, baseR: 56, topPct: 0.33, speed: 4.6, phase01: 0.30, breathe: 0.06 },
  { seed: 44, baseR: 128, topPct: 0.56, speed: 2.3, phase01: 0.82, breathe: 0.04 },
  { seed: 55, baseR: 66, topPct: 0.60, speed: 4.0, phase01: 0.46, breathe: 0.05 },
];

export default function HolographicClouds() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cv = canvas;
    const c = ctx;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cssW = window.innerWidth;
    let cssH = window.innerHeight;

    type Rendered = {
      cfg: CloudConfig;
      shape: CloudShape;
      bitmap: HTMLCanvasElement;
      pad: number;
      x: number; // current position, 0..period
    };

    let rendered: Rendered[] = [];

    function buildAll() {
      rendered = CLOUD_CONFIGS.map((cfg) => {
        const shape = buildCloudShape(cfg.seed, cfg.baseR);
        const { canvas: bitmap, pad } = rasterizeCloud(shape, dpr);
        const period = cssW + shape.width + pad * 2;
        return { cfg, shape, bitmap, pad, x: cfg.phase01 * period };
      });
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = window.innerWidth;
      cssH = window.innerHeight;
      cv.width = Math.ceil(cssW * dpr);
      cv.height = Math.ceil(cssH * dpr);
      cv.style.width = cssW + "px";
      cv.style.height = cssH + "px";
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildAll();
    }

    resize();

    let raf = 0;
    let last = performance.now();
    let hidden = document.hidden;

    function onVisibility() {
      hidden = document.hidden;
      if (!hidden) last = performance.now();
    }
    document.addEventListener("visibilitychange", onVisibility);

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (hidden) return;

      const dt = Math.min(now - last, 50); // clamp to avoid big jumps on tab-refocus
      last = now;

      c.clearRect(0, 0, cssW, cssH);

      for (const r of rendered) {
        const w = r.shape.width + r.pad * 2;
        const h = r.shape.height + r.pad * 2;
        const period = cssW + w;

        if (!reduceMotion) {
          r.x -= (r.cfg.speed * dt) / 1000;
          if (r.x < 0) r.x += period;
        }

        const screenX = r.x - w;
        const screenY = cssH * r.cfg.topPct;

        let alpha = 1;
        if (r.cfg.breathe > 0) {
          alpha = 1 - r.cfg.breathe / 2 + Math.sin(now / 4200 + r.cfg.seed) * (r.cfg.breathe / 2);
        }

        c.globalAlpha = alpha;
        c.drawImage(r.bitmap, screenX, screenY, w, h);
        c.globalAlpha = 1;
      }
    }

    raf = requestAnimationFrame(frame);

    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
        zIndex: 1,
        background: "transparent",
      }}
    />
  );
}
