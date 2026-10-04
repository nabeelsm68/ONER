'use client';

import React from 'react';
import Link from 'next/link';
import { RefreshCw, Compass } from 'lucide-react';

interface TopbarProps {
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function Topbar({
  title = 'Executive Overview',
  subtitle = 'Orion Industrial Complex · Unit 04',
  onRefresh,
  isRefreshing = false,
}: TopbarProps) {
  return (
    <header className="h-14 border-b border-[#242A27] bg-[#080A09]/90 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* ── Left: Location & Surface Title ───────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold tracking-tight text-[#F1F3EE]">{title}</span>
          <span className="text-[#626A65] text-xs">/</span>
          <span className="text-[11px] font-mono text-[#929A95]">{subtitle}</span>
        </div>
      </div>

      {/* ── Right: Telemetry Controls & Status ───────────────── */}
      <div className="flex items-center gap-3">
        {/* Global Demo Indicator (Requirement 20) */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0E1110] border border-[#242A27] text-[10px] text-[#929A95] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-amber-300 font-semibold">DEMO MODE</span>
          <span className="text-zinc-600">·</span>
          <span>SIMULATED TELEMETRY</span>
        </div>

        {/* 3D Digital Twin Quick Link */}
        <Link
          href="/experience"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E1110] hover:bg-[#141817] border border-[#242A27] hover:border-[#A8C83A]/40 text-xs font-medium text-[#929A95] hover:text-[#F1F3EE] transition-colors"
        >
          <Compass size={13} className="text-[#929A95]" />
          <span>Launch 3D Twin</span>
        </Link>

        {/* Manual Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E1110] hover:bg-[#141817] border border-[#242A27] text-xs font-medium text-[#929A95] hover:text-[#F1F3EE] transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh facility telemetry"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-[#A8C83A]' : 'text-[#929A95]'} />
            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>
        )}
      </div>
    </header>
  );
}
