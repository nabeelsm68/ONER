'use client';

import React from 'react';

export type HorizonLevel = 'field' | 'control' | 'impact';

interface HorizonLineProps {
  activeLevel?: HorizonLevel;
  onLevelChange?: (level: HorizonLevel) => void;
  showLabels?: boolean;
  className?: string;
}

/**
 * HorizonLine Primitive
 * 
 * A 1px continuous hairline that divides the citizen world (Field)
 * from the industrial decision instrument (Control) and macroeconomic outcome (Impact).
 * Source: docs/ONER_Antigravity_Prompt_Pack.md §0.8, design-reference/oner-directions.html
 */
export default function HorizonLine({
  activeLevel,
  onLevelChange,
  showLabels = true,
  className = '',
}: HorizonLineProps) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={`relative w-full h-[1px] bg-[var(--line)] my-6 select-none ${className}`}
    >
      {showLabels && (
        <div className="absolute -top-3 left-0 right-0 flex items-center justify-between px-4 sm:px-8 text-[11px] font-mono tracking-wider pointer-events-auto">
          {/* Left Endpoint: Field */}
          <button
            type="button"
            onClick={() => onLevelChange?.('field')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeLevel === 'field'
                ? 'text-[var(--accent)] font-semibold bg-[var(--surface)]'
                : 'text-[var(--ink-3)] hover:text-[var(--ink-2)] bg-[var(--bg)]'
            }`}
          >
            FIELD
          </button>

          {/* Optional Middle Endpoint: Impact */}
          {activeLevel && onLevelChange && (
            <button
              type="button"
              onClick={() => onLevelChange?.('impact')}
              className={`px-2 py-0.5 rounded transition-colors text-[10px] ${
                activeLevel === 'impact'
                  ? 'text-[var(--accent)] font-semibold bg-[var(--surface)]'
                  : 'text-[var(--ink-3)] hover:text-[var(--ink-2)] bg-[var(--bg)]'
              }`}
            >
              IMPACT
            </button>
          )}

          {/* Right Endpoint: Control */}
          <button
            type="button"
            onClick={() => onLevelChange?.('control')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeLevel === 'control'
                ? 'text-[var(--accent)] font-semibold bg-[var(--surface)]'
                : 'text-[var(--ink-3)] hover:text-[var(--ink-2)] bg-[var(--bg)]'
            }`}
          >
            CONTROL
          </button>
        </div>
      )}
    </div>
  );
}
