'use client';

import React from 'react';

interface IsolationStripProps {
  score?: number; // e.g. 0.884 (between 0 and 1)
  threshold?: number; // e.g. 0.65
  label?: string;
  showTicks?: boolean;
  className?: string;
}

/**
 * IsolationStrip
 * 
 * Visualizes Isolation Forest decision distribution (0.000 – 1.000).
 * Features a scalar tick at the anomaly score without percentage formatting.
 * Spec: docs/ONER_Antigravity_Prompt_Pack.md §0.11
 */
export default function IsolationStrip({
  score = 0.884,
  threshold = 0.65,
  label = 'Anomaly isolation score',
  showTicks = true,
  className = '',
}: IsolationStripProps) {
  const clampScore = Math.max(0, Math.min(1, score));
  const isAnomalous = clampScore >= threshold;

  return (
    <div className={`space-y-1.5 select-none ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--ink-2)] font-sans">{label}</span>
        <div className="flex items-baseline gap-1.5 font-mono">
          <span className={`text-sm font-medium ${isAnomalous ? 'text-amber-400' : 'text-[var(--ink)]'}`}>
            {clampScore.toFixed(3)}
          </span>
          <span className="text-[10px] text-[var(--ink-3)]">/ 1.000</span>
        </div>
      </div>

      {/* 0-1 Distribution Track */}
      <div className="relative h-2.5 rounded-[1px] bg-[var(--surface)] border border-[var(--line)] overflow-hidden">
        {/* Normal operating band (0.0 to threshold) */}
        <div
          className="absolute inset-y-0 left-0 bg-[var(--line-subtle)]"
          style={{ width: `${threshold * 100}%` }}
        />

        {/* Anomaly zone (> threshold) */}
        <div
          className="absolute inset-y-0 right-0 bg-amber-500/10 border-l border-amber-500/30"
          style={{ width: `${(1 - threshold) * 100}%` }}
        />

        {/* Active Score Marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-amber-400 -ml-0.5 z-10 shadow-xs"
          style={{ left: `${clampScore * 100}%` }}
        />
      </div>

      {showTicks && (
        <div className="flex justify-between text-[9px] font-mono text-[var(--ink-3)] px-0.5">
          <span>0.000 baseline</span>
          <span className="text-amber-400/80">0.650 threshold</span>
          <span>1.000 critical</span>
        </div>
      )}
    </div>
  );
}
