'use client';

import React from 'react';
import { ConvergenceChainProps, ChainSignalNode } from './types';
import { CANONICAL_CASE } from '@/lib/seed';

const DEFAULT_SIGNALS: ChainSignalNode[] = CANONICAL_CASE.signals.map((s) => ({
  name: s.name,
  weight: s.possible,
  earned: s.earned,
  note: s.note,
}));

/**
 * VerticalChain
 * 
 * Mobile-responsive orientation (<768px) of the Convergence Chain.
 * Stacks evidence nodes vertically, feeding into the Event Core and outcome.
 * Spec: docs/ONER_Antigravity_Prompt_Pack.md §0.8 & §0.16
 */
export default function VerticalChain({
  signals = DEFAULT_SIGNALS,
  coreScore = CANONICAL_CASE.scores.corroboration,
  likelyCause = 'Burner fouling',
  actionName = 'Damper trim 1.042',
  measuredOutcome = '14.2',
  measuredUnit = 'tCO₂e per day',
  className = '',
}: ConvergenceChainProps) {
  return (
    <div className={`w-full max-w-sm mx-auto p-4 rounded-[2px] bg-[var(--surface)] border border-[var(--line)] space-y-4 ${className}`}>
      {/* Evidence Nodes */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-3)]">
          Evidence Convergence (6 Signals)
        </div>
        {signals.map((sig) => {
          const pct = Math.round((sig.earned / (sig.weight || 1)) * 100);
          return (
            <div
              key={sig.name}
              className="p-2 rounded-[2px] border border-[var(--line)] bg-[var(--bg)] relative overflow-hidden"
            >
              {/* Earned weight background bar */}
              <div
                className="absolute inset-y-0 left-0 bg-[var(--accent)]/15 pointer-events-none"
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--ink)]">{sig.name}</span>
                <span className="font-mono text-[11px] text-[var(--ink-2)]">
                  {sig.earned}/{sig.weight}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Convergence Indicator */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="w-[1px] h-4 bg-[var(--accent)]" />
        <div className="w-full p-3 rounded-[2px] border border-[var(--accent)] bg-[var(--bg)] text-center my-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-3)]">
            Corroborated Event Core
          </div>
          <div className="text-3xl font-light font-mono text-[var(--ink)] my-0.5">
            {coreScore.toFixed(1)}
          </div>
          <div className="text-[11px] text-[var(--ink-2)]">
            High Confidence Detection
          </div>
        </div>
        <div className="w-[1px] h-4 bg-[var(--accent)]" />
      </div>

      {/* Resolution & Measured Outcome */}
      <div className="p-3 rounded-[2px] border border-[var(--line)] bg-[var(--bg)] space-y-2">
        <div className="flex items-center justify-between text-xs border-b border-[var(--line-subtle)] pb-1.5">
          <span className="text-[var(--ink-3)]">Likely Cause</span>
          <span className="font-medium text-[var(--ink)]">{likelyCause}</span>
        </div>
        <div className="flex items-center justify-between text-xs border-b border-[var(--line-subtle)] pb-1.5">
          <span className="text-[var(--ink-3)]">Actuator Action</span>
          <span className="font-mono text-[var(--ink)]">{actionName}</span>
        </div>
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-xs text-[var(--ink-2)]">Measured Result</span>
          <div className="text-right">
            <span className="text-2xl font-light font-mono text-[var(--ink)]">
              {measuredOutcome}
            </span>{' '}
            <span className="text-[11px] text-[var(--ink-3)]">{measuredUnit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
