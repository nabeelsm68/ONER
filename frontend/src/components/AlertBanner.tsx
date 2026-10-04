'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface AlertBannerProps {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'WATCH' | 'NORMAL';
  component?: string;
  date: string;
  evidence: string;
  incident_type?: string;
  onClick?: () => void;
  investigateHref?: string;
}

const SEV_CONFIG = {
  CRITICAL: {
    icon: AlertCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
    badge: 'CRITICAL',
  },
  HIGH: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    badge: 'HIGH DEV',
  },
  WATCH: {
    icon: Info,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/25',
    badge: 'ADVISORY',
  },
  NORMAL: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    badge: 'NOMINAL',
  },
};

export default function AlertBanner({
  severity,
  component,
  date,
  evidence,
  incident_type,
  onClick,
  investigateHref,
}: AlertBannerProps) {
  const cfg = SEV_CONFIG[severity] || SEV_CONFIG.WATCH;
  const Icon = cfg.icon;

  const content = (
    <div
      onClick={onClick}
      className={`px-4 py-3 rounded-lg bg-[#0d120f] border border-[#162018] hover:border-[#223026] hover:bg-[#101713] transition-colors flex items-center justify-between gap-4 group ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-1.5 rounded ${cfg.bg} ${cfg.color} flex-shrink-0`}>
          <Icon size={14} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
              {cfg.badge}
            </span>
            <span className="text-xs font-semibold text-zinc-200 truncate">
              {component || incident_type || 'Facility Sensor Anomaly'}
            </span>
            <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
              · {date}
            </span>
          </div>

          <p className="text-xs text-zinc-400 truncate mt-0.5 max-w-xl">
            {evidence}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors flex items-center gap-1">
          Investigate
          <ChevronRight size={12} />
        </span>
      </div>
    </div>
  );

  if (investigateHref) {
    return <Link href={investigateHref}>{content}</Link>;
  }

  return content;
}
