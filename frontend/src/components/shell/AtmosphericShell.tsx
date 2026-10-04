'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Menu, RefreshCw } from 'lucide-react';
import MoreMenuDrawer from './MoreMenuDrawer';

type Role = 'COMMUNITY' | 'INDUSTRY' | 'GOVERNMENT';

interface AtmosphericShellProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

/**
 * AtmosphericShell
 * 
 * 56px global command bar replacing the legacy 256px sidebar.
 * Features the ONER wordmark, hairline horizon, role switcher,
 * facility context chip (Orion Refining Complex · F-101), and quiet More drawer.
 * Source: docs/ONER_Antigravity_Prompt_Pack.md §0.6 & §0.14
 */
export default function AtmosphericShell({
  onRefresh,
  isRefreshing = false,
}: AtmosphericShellProps) {
  const pathname = usePathname() || '/';
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Derive active role from path
  const currentRole: Role = (() => {
    if (
      pathname.startsWith('/industry') ||
      pathname.startsWith('/investigation') ||
      pathname.startsWith('/simulator') ||
      pathname.startsWith('/carbon')
    ) {
      return 'INDUSTRY';
    }
    if (pathname.startsWith('/government')) {
      return 'GOVERNMENT';
    }
    return 'COMMUNITY';
  })();

  const roleDestinations: Record<Role, string> = {
    COMMUNITY: '/community',
    INDUSTRY: '/industry',
    GOVERNMENT: '/government',
  };

  return (
    <>
      <header className="h-14 w-full border-b border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between select-none">
        {/* ── Left: Wordmark & Hairline Horizon & Dot ──────────── */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer focus-visible:outline-none"
            aria-label="ONER Home"
          >
            <span className="font-sans font-medium text-base sm:text-lg tracking-[0.14em] text-[var(--ink)]">
              ONER
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0 animate-pulse" />
          </Link>

          <div className="h-4 w-[1px] bg-[var(--line)] hidden sm:block" />

          {/* Role Switcher */}
          <nav
            aria-label="Role Switcher"
            className="hidden md:flex items-center gap-1 text-[11px] font-mono tracking-wider p-0.5 rounded-[2px] bg-[var(--surface)] border border-[var(--line)]"
          >
            {(['COMMUNITY', 'INDUSTRY', 'GOVERNMENT'] as Role[]).map((role) => {
              const isActive = currentRole === role;
              return (
                <Link
                  key={role}
                  href={roleDestinations[role]}
                  className={`px-2.5 py-1 rounded-[2px] transition-colors ${
                    isActive
                      ? 'bg-[var(--raised)] text-[var(--ink)] font-semibold shadow-xs'
                      : 'text-[var(--ink-3)] hover:text-[var(--ink-2)]'
                  }`}
                >
                  {role}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Current Role Pill */}
          <div className="md:hidden text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[var(--surface)] border border-[var(--line)] text-[var(--ink-2)]">
            {currentRole}
          </div>
        </div>

        {/* ── Right: Facility Context, Actions & More Drawer ──── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Facility Chip */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[var(--surface)] border border-[var(--line)] text-[11px] font-mono text-[var(--ink-2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[var(--ink)] font-medium">Orion Refining Complex</span>
            <span className="text-[var(--ink-3)]">·</span>
            <span>F-101</span>
          </div>

          {/* Sync Telemetry */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 sm:px-2 sm:py-1 rounded-[2px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--raised)] text-[11px] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Sync telemetry"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-[var(--accent)]' : ''} />
              <span className="hidden xl:inline">Sync</span>
            </button>
          )}

          {/* 3D Experience Link */}
          <Link
            href="/experience"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[var(--surface)] hover:bg-[var(--raised)] border border-[var(--line)] text-[11px] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
            title="Open 3D Digital Twin"
          >
            <Compass size={13} className="text-[var(--ink-3)]" />
            <span className="hidden sm:inline">3D Twin</span>
          </Link>

          {/* System Directory / More Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[var(--surface)] hover:bg-[var(--raised)] border border-[var(--line)] text-[11px] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            aria-label="Open System Directory"
          >
            <Menu size={13} />
            <span className="hidden sm:inline font-mono">Menu</span>
          </button>
        </div>
      </header>

      {/* Slide-over Deep Link Drawer */}
      <MoreMenuDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
