'use client';

import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  change_pct?: number;
  icon?: ReactNode;
  accent?: 'green' | 'red' | 'amber' | 'blue' | 'teal' | 'default';
  subtitle?: string;
  sparklineData?: number[];
  isCompact?: boolean;
}

export default function KPICard({
  title,
  value,
  unit,
  change_pct,
  icon,
  accent = 'default',
  subtitle,
  isCompact = false,
}: KPICardProps) {
  const isUp = change_pct !== undefined && change_pct > 0;
  const isDown = change_pct !== undefined && change_pct < 0;

  const isIncreaseNegative = accent !== 'blue' && accent !== 'teal';
  const trendColor =
    change_pct === undefined || change_pct === 0
      ? 'text-zinc-500'
      : isUp
      ? isIncreaseNegative
        ? 'text-amber-400'
        : 'text-emerald-400'
      : isIncreaseNegative
      ? 'text-emerald-400'
      : 'text-zinc-400';

  if (isCompact) {
    return (
      <div className="py-2.5 px-3 flex flex-col justify-between group">
        <div className="flex items-center justify-between gap-1 text-[#929A95] mb-1">
          <span className="text-[11px] font-medium text-[#929A95] truncate">
            {title}
          </span>
          {icon && <span className="text-[#626A65] group-hover:text-zinc-300 transition-colors">{icon}</span>}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[#F1F3EE]">
            {value}
          </span>
          {unit && (
            <span className="text-[11px] font-mono text-[#929A95]">
              {unit}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px]">
          {change_pct !== undefined ? (
            <div className={`flex items-center gap-0.5 font-mono ${trendColor}`}>
              {isUp ? <TrendingUp size={11} /> : isDown ? <TrendingDown size={11} /> : <Minus size={11} />}
              <span>{isUp ? '+' : ''}{change_pct.toFixed(1)}%</span>
            </div>
          ) : (
            <span className="text-zinc-500 font-mono truncate">{subtitle || 'nominal'}</span>
          )}
          {subtitle && change_pct !== undefined && (
            <span className="text-[#929A95] truncate ml-1">{subtitle}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-[#0E1110] border border-[#242A27] hover:border-[#343E3A] transition-all flex flex-col justify-between group">
      <div>
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-[#929A95] truncate">
            {title}
          </span>
          {icon && (
            <div className="text-[#626A65] group-hover:text-zinc-300 transition-colors">
              {icon}
            </div>
          )}
        </div>

        {/* Large Telemetry Value */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F1F3EE]">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-mono text-[#929A95] font-medium">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Context footer */}
      <div className="mt-3 pt-2 border-t border-[#181E1C] flex items-center justify-between text-xs">
        {change_pct !== undefined ? (
          <div className={`flex items-center gap-1 font-mono text-[11px] ${trendColor}`}>
            {isUp ? <TrendingUp size={12} /> : isDown ? <TrendingDown size={12} /> : <Minus size={12} />}
            <span>
              {isUp ? '+' : ''}{change_pct.toFixed(1)}%
            </span>
            <span className="text-[#626A65] text-[10px] ml-1 font-sans">vs 7d avg</span>
          </div>
        ) : subtitle ? (
          <span className="text-[11px] text-[#929A95] font-sans truncate">{subtitle}</span>
        ) : (
          <span className="text-[11px] text-zinc-500 font-mono">NOMINAL</span>
        )}
      </div>
    </div>
  );
}
