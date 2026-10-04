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
      { href: '/investigation', label: 'AI Investigation', icon: AlertTriangle, badge: 'Anomaly' },
      { href: '/simulator', label: 'Intervention', icon: SlidersHorizontal },
    ],
  },
  {
    title: 'INDUSTRY',
    items: [
      { href: '/industry', label: 'Facility Operations', icon: Factory },
      { href: '/government/pact', label: 'Environmental Pact', icon: ShieldCheck },
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
      { href: '/ask', label: 'Ask ONER', icon: Sparkles },
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
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-40 bg-[#080A09] border-r border-[#242A27] select-none text-[#F1F3EE]">
      {/* ── Brand Header ─────────────────────────────────────── */}
      <div className="p-4 border-b border-[#242A27]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded bg-[#141817] border border-[#242A27] flex items-center justify-center font-bold text-sm text-[#F1F3EE] group-hover:border-[#A8C83A]/50 transition-colors">
            O
          </div>
          <div>
            <div className="font-semibold text-sm tracking-wide text-[#F1F3EE] flex items-center gap-1.5">
              <span>ONER</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30">
                NETWORK
              </span>
            </div>
            <div className="text-[10px] tracking-wider uppercase font-medium text-[#929A95]">
              Environmental Intelligence
            </div>
          </div>
        </Link>

        {/* Facility Context Strip */}
        <div className="mt-3 p-2.5 rounded bg-[#0E1110] border border-[#242A27] space-y-1">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[#929A95]">
            <span>Facility Telemetry</span>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              AT RISK
            </span>
          </div>
          <div className="text-xs font-semibold text-zinc-200 truncate">
            Orion Refining Complex
          </div>
          <div className="text-[9px] font-mono text-[#929A95] flex items-center justify-between">
            <span>Furnace F-101</span>
            <span className="text-amber-400">NOx +31.4%</span>
          </div>
        </div>
      </div>

      {/* ── Navigation Links ─────────────────────────────────── */}
      <nav className="flex-1 px-3 py-3 space-y-3.5 overflow-y-auto custom-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-0.5">
            <div className="px-2 pb-1 text-[9px] uppercase tracking-wider text-[#626A65] font-bold">
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
                      ? 'bg-[#141817] text-[#F1F3EE] border border-[#A8C83A]/40 shadow-sm'
                      : 'text-[#929A95] hover:text-[#F1F3EE] hover:bg-[#0E1110]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon
                      size={14}
                      className={isActive ? 'text-[#A8C83A]' : 'text-[#929A95]'}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Exact Footer (Section 25) ────────────────────────── */}
      <div className="p-3 border-t border-[#242A27] bg-[#080A09]">
        <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27] space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-mono font-bold text-amber-300">DEMO MODE</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#141817] text-[#929A95] border border-[#242A27]">
              v2.4
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#929A95]">
            SIMULATED TELEMETRY
          </div>
        </div>
      </div>
    </aside>
  );
}
