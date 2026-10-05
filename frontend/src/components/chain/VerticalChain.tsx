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
 * Stacks evidence nodes vertically, feeding into the Event Core and outcome,
 * then returns the measured outcome back to the citizen.
 * 
 * Spec: docs/ONER_Antigravity_Prompt_Pack.md §0.8 & §0.16
 */
export default function VerticalChain({
  signals = DEFAULT_SIGNALS,
  coreScore = CANONICAL_CASE.scores.corroboration,
  likelyCause = 'Burner refractory fouling · F-101',
  actionName = 'Damper trim 1.042',
  measuredOutcome = '14.2',
  measuredUnit = 'tCO₂e per day',
  className = '',
}: ConvergenceChainProps) {
  return (
    <div className={`w-full max-w-md mx-auto p-4 rounded-[2px] bg-[var(--surface)] border border-[var(--line)] space-y-4 select-none ${className}`}>
      {/* Evidence Nodes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--ink-3)]">
          <span>Evidence Sources (6 Strands)</span>
          <span>Earned Weight</span>
        </div>

        <div className="space-y-1.5">
          {signals.map((sig, idx) => {
            const pct = Math.round((sig.earned / (sig.weight || 1)) * 100);
            return (
              <div
                key={sig.name}
                className="p-2.5 rounded-[2px] border border-[var(--line)] bg-[var(--bg)] relative overflow-hidden"
              >
                {/* Earned weight background bar */}
                <div
                  className="absolute inset-y-0 left-0 bg-[var(--accent-dim)] pointer-events-none transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-[var(--ink)] block">{sig.name}</span>
                    <span className="text-[10px] font-mono text-[var(--ink-3)]">{sig.note}</span>
                  </div>
                  <span className="font-mono text-xs text-[var(--accent)] font-semibold">
                    +{sig.earned} <span className="text-[10px] text-[var(--ink-3)]">/ {sig.weight}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Downward Convergence Pulse Arrow */}
      <div className="flex flex-col items-center justify-center py-1">
        <div className="w-[1px] h-5 bg-[var(--accent)] animate-pulse" />
        <div className="w-full p-4 rounded-[2px] border border-[var(--accent)] bg-[var(--bg)] text-center my-1 shadow-lg">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)] font-semibold">
            Corroborated Event Core
          </div>
          <div className="text-4xl font-light font-mono text-[var(--ink)] my-1">
            {coreScore.toFixed(1)}
          </div>
          <div className="text-[11px] text-[var(--ink-2)] font-mono">
            High Confidence Detection · 89.4 / 100
          </div>
        </div>
        <div className="w-[1px] h-5 bg-[var(--accent)]" />
      </div>

      {/* Resolution & Measured Outcome */}
      <div className="p-3.5 rounded-[2px] border border-[var(--line)] bg-[var(--bg)] space-y-2.5">
        <div className="flex items-center justify-between text-xs border-b border-[var(--line-subtle)] pb-2">
          <span className="text-[var(--ink-3)] font-mono text-[11px]">01 · Likely Cause</span>
          <span className="font-medium text-[var(--ink)] text-right">{likelyCause}</span>
        </div>

        <div className="flex items-center justify-between text-xs border-b border-[var(--line-subtle)] pb-2">
          <span className="text-[var(--ink-3)] font-mono text-[11px]">02 · Action</span>
          <span className="font-mono text-[var(--accent)] font-semibold">{actionName}</span>
        </div>

        <div className="flex items-center justify-between text-xs border-b border-[var(--line-subtle)] pb-2">
          <span className="text-[var(--ink-3)] font-mono text-[11px]">03 · Verification</span>
          <span className="text-[var(--ink-2)] text-right">MRV evidence assembled</span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xs text-[var(--ink-2)] block">Measured Result</span>
            <span className="text-[10px] font-mono text-[var(--ink-3)]">5,183 tCO₂e/yr annualized</span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-light font-mono text-[var(--ink)]">
              {measuredOutcome}
            </span>{' '}
            <span className="text-xs text-[var(--ink-2)]">{measuredUnit}</span>
          </div>
        </div>
      </div>

      {/* Return to Citizen Confirmation */}
      <div className="p-2.5 rounded-[2px] bg-[#A8C83A]/10 border border-[#A8C83A]/40 text-center text-xs text-[var(--ink)] font-mono flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
        <span>Return loop: Result returned to resident (+50 pts)</span>
      </div>
    </div>
  );
}
