'use client';

import React from 'react';

interface WeightStripProps {
  score?: number; // e.g. 89.4 (out of 100)
  max?: number;   // 100
  label?: string;
  sublabel?: string;
  showSegments?: boolean;
  className?: string;
}

/**
 * WeightStrip
 * 
 * Visualizes multi-source evidence weight accumulation (0.0 – 100.0).
 * Unitless corroboration weight strip, never displayed as a statistical probability or percentage.
 * Spec: docs/ONER_Antigravity_Prompt_Pack.md §0.11
 */
export default function WeightStrip({
  score = 89.4,
  max = 100,
  label = 'Corroboration score',
  sublabel = '6 independent evidence signals',
  showSegments = true,
  className = '',
}: WeightStripProps) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));

  return (
    <div className={`space-y-1.5 select-none ${className}`}>
      <div className="flex items-baseline justify-between text-xs">
        <div>
          <span className="font-medium text-[var(--ink)]">{label}</span>
          {sublabel && (
            <span className="text-[11px] text-[var(--ink-3)] block sm:inline sm:ml-2">
              · {sublabel}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1 font-mono">
          <span className="text-sm font-light text-[var(--ink)]">
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] text-[var(--ink-3)]">/ {max}</span>
        </div>
      </div>

      {/* 100-Unit Weighted Bar with Lime Fill */}
      <div className="h-3 rounded-[1px] bg-[var(--surface)] border border-[var(--line)] relative overflow-hidden flex">
        <div
          className="h-full bg-[var(--accent)] opacity-85 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />

        {showSegments && (
          <div className="absolute inset-0 grid grid-cols-10 pointer-events-none divide-x divide-[var(--line-subtle)] opacity-40" />
        )}
      </div>

      <div className="flex justify-between text-[9px] font-mono text-[var(--ink-3)]">
        <span>0.0 isolated</span>
        <span>50.0 partial</span>
        <span className="text-[var(--accent)]">89.4 corroborated</span>
      </div>
    </div>
  );
}
