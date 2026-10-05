'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  Sparkles,
  Compass,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  SlidersHorizontal,
  FileCheck2,
  FileText,
  Home,
  Camera,
  Users,
  Factory,
} from 'lucide-react';

interface MoreMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DrawerLinkItem {
  href: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  badge?: string;
}

const PRIMARY_ROUTES: DrawerLinkItem[] = [
  { href: '/', label: 'Overview', sublabel: 'The 30-second environmental story', icon: Home },
  { href: '/report', label: 'Report Pollution', sublabel: 'Citizen field note filing', icon: Camera },
  { href: '/community', label: 'Community Journal', sublabel: 'Public accountability & points', icon: Users },
  { href: '/case/COMM-2026-00421', label: 'Representative Case', sublabel: 'COMM-2026-00421 dossier', icon: FileText, badge: 'Hero' },
  { href: '/industry', label: 'Industry Console', sublabel: 'Facility operations & setpoint control', icon: Factory },
  { href: '/government', label: 'Regional Command', sublabel: 'Stalled cases & risk oversight', icon: ShieldCheck },
];

const SECONDARY_ROUTES: DrawerLinkItem[] = [
  { href: '/investigation', label: 'AI Investigation', sublabel: '5-question root cause trace', icon: AlertTriangle },
  { href: '/simulator', label: 'Intervention Simulator', sublabel: 'Delta Rail decision instrument', icon: SlidersHorizontal },
  { href: '/carbon', label: 'Carbon & MRV', sublabel: 'Reduction wedge & CEMS verification', icon: FileCheck2 },
  { href: '/government/pact', label: 'Environmental Pact', sublabel: 'Tripartite legal thresholds', icon: ShieldCheck },
  { href: '/analytics', label: 'Signals & Heatmap', sublabel: 'Sensor correlations & telemetry', icon: BarChart3 },
  { href: '/ask', label: 'Ask ONER', sublabel: 'Grounded intelligence co-pilot', icon: Sparkles },
  { href: '/impact', label: 'Impact & Scale', sublabel: 'Macro unit economics & ARR', icon: TrendingUp },
  { href: '/experience', label: '3D Experience', sublabel: 'Interactive cinematic twin', icon: Compass, badge: 'WebGL' },
];

export default function MoreMenuDrawer({ isOpen, onClose }: MoreMenuDrawerProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Directory"
      className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <div
        ref={drawerRef}
        className="relative w-full max-w-md bg-[var(--surface)] text-[var(--ink)] border-l border-[var(--line)] shadow-2xl h-full flex flex-col z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="h-14 px-6 border-b border-[var(--line)] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-[var(--ink)]">
              System Directory
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-[var(--raised)] border border-[var(--line)] text-[var(--ink-3)]">
              ALL ROUTES
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[2px] text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--raised)] transition-colors cursor-pointer"
            aria-label="Close directory"
          >
            <X size={16} />
          </button>
        </div>

        {/* Links Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Primary Operations */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-3)] mb-2 px-2">
              Core Surfaces
            </div>
            <div className="space-y-1">
              {PRIMARY_ROUTES.map((route) => {
                const isActive = pathname === route.href;
                const Icon = route.icon;
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={onClose}
                    className={`flex items-start gap-3 p-2.5 rounded-[2px] transition-colors border ${
                      isActive
                        ? 'bg-[var(--raised)] border-[var(--accent)] text-[var(--ink)]'
                        : 'border-transparent hover:border-[var(--line)] hover:bg-[var(--raised)] text-[var(--ink-2)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <Icon size={16} className={`mt-0.5 shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--ink-3)]'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--ink)]">{route.label}</span>
                        {route.badge && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[var(--surface)] text-[var(--accent)] border border-[var(--accent)]/30">
                            {route.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--ink-3)] truncate mt-0.5">
                        {route.sublabel}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Precision Instruments & Deep Links */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-3)] mb-2 px-2">
              Decision Instruments & Deep Links
            </div>
            <div className="space-y-1">
              {SECONDARY_ROUTES.map((route) => {
                const isActive = pathname === route.href;
                const Icon = route.icon;
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={onClose}
                    className={`flex items-start gap-3 p-2.5 rounded-[2px] transition-colors border ${
                      isActive
                        ? 'bg-[var(--raised)] border-[var(--accent)] text-[var(--ink)]'
                        : 'border-transparent hover:border-[var(--line)] hover:bg-[var(--raised)] text-[var(--ink-2)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <Icon size={16} className={`mt-0.5 shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--ink-3)]'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--ink)]">{route.label}</span>
                        {route.badge && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[var(--surface)] text-[var(--accent)] border border-[var(--accent)]/30">
                            {route.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--ink-3)] truncate mt-0.5">
                        {route.sublabel}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface)] select-none">
          <div className="text-[10px] font-mono text-[var(--ink-3)] text-center">
            ONER · Environmental Intelligence & Accountability Network
          </div>
        </div>
      </div>
    </div>
  );
}
