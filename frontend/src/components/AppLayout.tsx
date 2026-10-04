'use client';

import React, { ReactNode } from 'react';
import AtmosphericShell from './shell/AtmosphericShell';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

/**
 * AppLayout
 * 
 * Replaces the legacy fixed 256px left sidebar with the 56px AtmosphericShell.
 * Preserves all page wrapper interfaces while establishing the new dual-atmosphere shell.
 */
export default function AppLayout({
  children,
  title,
  subtitle,
  onRefresh,
  isRefreshing,
}: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* ── Global 56px Atmospheric Shell (replaces old sidebar + topbar) ── */}
      <AtmosphericShell onRefresh={onRefresh} isRefreshing={isRefreshing} />

      {/* ── Optional Surface Context Header if title passed ───────────── */}
      {title && (
        <div className="border-b border-[var(--line-subtle)] bg-[var(--surface)] px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs select-none">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-[var(--ink)]">{title}</span>
            {subtitle && (
              <>
                <span className="text-[var(--ink-3)]">/</span>
                <span className="font-mono text-[var(--ink-2)] text-[11px]">{subtitle}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Main Content Area ─────────────────────────────────────────── */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1600px] w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
