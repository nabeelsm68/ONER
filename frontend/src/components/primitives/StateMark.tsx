'use client';

import React from 'react';

export type StateType =
  | 'awaiting'
  | 'received'
  | 'corroborated'
  | 'verified'
  | 'conflict'
  | 'simulated';

interface StateMarkProps {
  state: StateType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * StateMark Primitive
 * 
 * Distinct non-color-only status indicator.
 * Employs structural glyph geometry, line weight, and hatching
 * so that simulated projections can never be confused with verified telemetry.
 * Source: docs/ONER_Antigravity_Prompt_Pack.md §0.11 & §0.15
 */
export default function StateMark({
  state,
  label,
  size = 'md',
  showLabel = true,
  className = '',
}: StateMarkProps) {
  const normState = state.toLowerCase() as StateType;

  const sizeClasses = {
    sm: 'text-[11px] gap-1.5',
    md: 'text-xs gap-2',
    lg: 'text-sm gap-2.5',
  }[size];

  const glyphSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  // Structural rendering for each state (shape + line + fill)
  const renderGlyph = () => {
    switch (normState) {
      case 'verified':
        return (
          <span
            className={`${glyphSizes} inline-flex items-center justify-center rounded-[2px] bg-[#A8C83A]/20 border border-[#A8C83A] text-[#A8C83A] font-bold text-[9px]`}
            aria-hidden="true"
          >
            ✓
          </span>
        );

      case 'corroborated':
        return (
          <span
            className={`${glyphSizes} inline-flex items-center justify-center rounded-[2px] bg-[var(--surface)] border border-[#A8C83A]/70 text-[#A8C83A] text-[9px]`}
            aria-hidden="true"
          >
            ●
          </span>
        );

      case 'simulated':
        return (
          <span
            className={`${glyphSizes} inline-flex items-center justify-center rounded-[2px] border border-dashed border-[#A8C83A] pattern-simulated-hatch text-[var(--ink-2)] text-[9px] font-mono`}
            title="Simulated projection (not yet verified)"
            aria-hidden="true"
          >
            //
          </span>
        );

      case 'conflict':
        return (
          <span
            className={`${glyphSizes} inline-flex items-center justify-center rounded-[2px] bg-amber-500/10 border border-amber-500 text-amber-400 font-bold text-[9px]`}
            aria-hidden="true"
          >
            !
          </span>
        );

      case 'received':
        return (
          <span
            className={`${glyphSizes} inline-flex items-center justify-center rounded-[2px] bg-[var(--surface)] border border-[var(--line)] text-[var(--ink-2)] text-[9px]`}
            aria-hidden="true"
          >
            ○
          </span>
        );

      case 'awaiting':
      default:
        return (
          <span
            className={`${glyphSizes} inline-flex items-center justify-center rounded-[2px] border border-dotted border-[var(--ink-3)] text-[var(--ink-3)] text-[9px]`}
            aria-hidden="true"
          >
            ···
          </span>
        );
    }
  };

  const defaultLabels: Record<StateType, string> = {
    verified: 'Verified result',
    corroborated: 'Corroborated',
    simulated: 'Simulated projection',
    conflict: 'Action requested',
    received: 'Received',
    awaiting: 'Awaiting evidence',
  };

  const displayLabel = label || defaultLabels[normState] || normState;

  return (
    <span
      className={`inline-flex items-center font-sans tracking-tight ${sizeClasses} ${className}`}
      role="status"
      aria-label={`Status: ${displayLabel}`}
    >
      {renderGlyph()}
      {showLabel && (
        <span
          className={`font-medium ${
            normState === 'verified'
              ? 'text-[var(--ink)]'
              : normState === 'simulated'
              ? 'text-[var(--ink-2)] font-mono italic'
              : normState === 'conflict'
              ? 'text-amber-400'
              : 'text-[var(--ink-2)]'
          }`}
        >
          {displayLabel}
        </span>
      )}
    </span>
  );
}
