'use client';

import React from 'react';
import { CompactChainProps } from './types';

/**
 * CompactChain
 * 
 * Inline 6-pip evidence bar for register tables and compact lists.
 * Shows the corroborated earned weight across the 6 signal slots.
 * Reference: design-reference/oner-directions.html Board C
 */
export default function CompactChain({
  signals = [42, 96, 94, 95, 92, 96],
  statusLabel,
  size = 'md',
  className = '',
}: CompactChainProps) {
  const pipDimensions = size === 'sm' ? 'w-4 h-2.5' : 'w-6 h-3.5';

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* 6 Micro Signal Slots */}
      <div className="flex items-center gap-1">
        {signals.map((sig, idx) => {
          const pct = typeof sig === 'number' ? sig : Math.round((sig.earned / (sig.possible || 1)) * 100);
          return (
            <div
              key={idx}
              className={`${pipDimensions} rounded-[1px] border border-[var(--line)] bg-[var(--surface)] relative overflow-hidden`}
              title={`Signal ${idx + 1}: ${pct}% corroborated`}
            >
              {pct > 0 && (
                <div
                  className="absolute left-0 top-0 bottom-0 bg-[var(--accent)] opacity-85 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                />
              )}
            </div>
          );
        })}
      </div>

      {statusLabel && (
        <span className="text-[11px] font-mono text-[var(--ink-2)] truncate">
          {statusLabel}
        </span>
      )}
    </div>
  );
}
