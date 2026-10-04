'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  AlertTriangle,
  SlidersHorizontal,
  FileCheck2,
  Sparkles,
  Compass,
  CheckCircle2,
  Camera,
  Users,
  Factory,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string | null;
  badgeType?: 'amber' | 'healthy' | 'teal' | 'neutral';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'COMMUNITY',
    items: [
      { href: '/report', label: 'Report Pollution', icon: Camera },
      { href: '/community', label: 'Community', icon: Users },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { href: '/', label: 'Overview', icon: LayoutDashboard },
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/investigation', label: 'AI Investigation', icon: AlertTriangle, badge: '1 Anomaly', badgeType: 'amber' },
      { href: '/simulator', label: 'Intervention', icon: SlidersHorizontal },
    ],
  },
  {
    title: 'INDUSTRY',
    items: [
      { href: '/industry', label: 'Facility Operations', icon: Factory },
      { href: '/industry#pact', label: 'Environmental Pact', icon: ShieldCheck, badge: 'Pact Active', badgeType: 'healthy' },
      { href: '/carbon', label: 'Carbon & MRV', icon: FileCheck2 },
    ],
  },
  {
    title: 'GOVERNMENT',
    items: [
      { href: '/government', label: 'Command Center', icon: ShieldCheck },
    ],
  },
  {
    title: 'AI',
    items: [
      { href: '/copilot', label: 'Ask ONER', icon: Sparkles },
    ],
  },
  {
    title: 'SCALE',
    items: [
      { href: '/impact', label: 'Impact & Scale', icon: TrendingUp },
    ],
  },
  {
    title: 'EXPERIENCE',
    items: [
      { href: '/experience', label: 'Cinematic Experience', icon: Compass },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-40 bg-[#080909] border-r border-[#202525] select-none text-[#F2F3EF]">
      {/* ── Brand Header ─────────────────────────────────────── */}
      <div className="p-4 border-b border-[#202525]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded bg-[#121515] border border-[#202525] flex items-center justify-center font-bold text-sm text-[#F2F3EF] group-hover:border-[#B7D83D]/50 transition-colors">
            O
          </div>
          <div>
            <div className="font-semibold text-sm tracking-wide text-[#F2F3EF] flex items-center gap-1.5">
              <span>ONER</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#121515] text-[#B7D83D] border border-[#B7D83D]/30">
                NETWORK
              </span>
            </div>
            <div className="text-[10px] tracking-wider uppercase font-medium text-[#8D9490]">
              Community-to-Industry
            </div>
          </div>
        </Link>

        {/* Accountability Loop Indicator */}
        <div className="mt-3 p-2 rounded bg-[#0D0F0F] border border-[#202525]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wider text-[#8D9490] font-medium">Environmental Pact</span>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ACTIVE
            </span>
          </div>
          <div className="text-xs font-semibold text-zinc-200 mt-0.5 truncate">
            Orion Refining Complex
          </div>
          <div className="text-[9px] font-mono text-amber-400/90 mt-0.5 flex items-center justify-between">
            <span>NOx Breach: +31.4%</span>
            <span className="text-zinc-500">Sector 4</span>
          </div>
        </div>
      </div>

      {/* ── Navigation Links ─────────────────────────────────── */}
      <nav className="flex-1 px-2.5 py-3 space-y-3.5 overflow-y-auto custom-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-0.5">
            <div className="px-2 pb-1 text-[9px] uppercase tracking-wider text-[#5D6561] font-semibold">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#151c17] text-white border border-[#2a3a2e] shadow-sm'
                      : 'text-[#8D9490] hover:text-[#F2F3EF] hover:bg-[#121515]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon
                      size={14}
                      className={isActive ? 'text-[#B7D83D]' : 'text-[#8D9490]'}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[8px] font-mono px-1 py-0.2 rounded border ${
                        item.badgeType === 'amber'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                          : item.badgeType === 'healthy'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : item.badgeType === 'teal'
                          ? 'bg-teal-500/10 text-teal-400 border-teal-500/25'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Operational Status Footer ────────────────────────── */}
      <div className="p-2.5 border-t border-[#202525] bg-[#080909]">
        <div className="p-2 rounded bg-[#0D0F0F] border border-[#202525]">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-[#B7D83D]" />
              <span className="font-semibold text-zinc-200">Accountability Loop</span>
            </div>
            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              DEMO MODE
            </span>
          </div>
          <div className="text-[9px] font-mono text-[#8D9490] mt-1">
            Simulated Telemetry · Citizen Evidence
          </div>
        </div>
      </div>
    </aside>
  );
}

