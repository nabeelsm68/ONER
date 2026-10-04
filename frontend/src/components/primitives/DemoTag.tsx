'use client';

import React from 'react';

interface DemoTagProps {
  label?: string;
  variant?: 'subtle' | 'pill' | 'hairline';
  className?: string;
}

/**
 * DemoTag Primitive
 * 
 * Restrained indicator for simulated prototype data transparency.
 * Source: docs/ONER_Antigravity_Prompt_Pack.md §0.15 Item 6
 */
export default function DemoTag({
  label = 'Demo data · Simulated telemetry · Prototype workflow',
  variant = 'hairline',
  className = '',
}: DemoTagProps) {
  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[var(--surface)] border border-[var(--line)] text-[10px] font-mono text-[var(--ink-3)] select-none ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/70" />
        <span>{label}</span>
      </span>
    );
  }

  if (variant === 'subtle') {
    return (
      <span
        className={`text-[11px] font-mono text-[var(--ink-3)] tracking-tight select-none ${className}`}
      >
        {label}
      </span>
    );
  }

  // Default 'hairline' variant
  return (
    <div
      className={`text-[11px] font-mono text-[var(--ink-3)] tracking-tight select-none py-1 border-t border-[var(--line-subtle)] ${className}`}
    >
      {label}
    </div>
  );
}
