'use client';
import { ReactNode, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  change_pct?: number;
  icon?: ReactNode;
  accent?: 'green' | 'red' | 'amber' | 'blue' | 'default';
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
}

// Semantic accent styles — these represent environmental meaning, DO NOT change to lime
const ACCENT_STYLES = {
  green:   { border: 'rgba(0,212,164,0.25)',   bg: 'rgba(0,212,164,0.05)',   icon: '#00d4a4' },
  red:     { border: 'rgba(239,68,68,0.25)',    bg: 'rgba(239,68,68,0.05)',   icon: '#ef4444' },
  amber:   { border: 'rgba(245,158,11,0.25)',   bg: 'rgba(245,158,11,0.05)', icon: '#f59e0b' },
  blue:    { border: 'rgba(14,165,233,0.25)',   bg: 'rgba(14,165,233,0.05)', icon: '#0ea5e9' },
  default: { border: '#1c1c1c',                  bg: 'rgba(255,255,255,0.01)', icon: '#8a8a8a' },
};

export default function KPICard({ title, value, unit, change_pct, icon, accent = 'default', size = 'md', subtitle }: KPICardProps) {
  const style = ACCENT_STYLES[accent];
  const changeBad  = change_pct !== undefined && change_pct > 0;
  const changeGood = change_pct !== undefined && change_pct < 0;

  return (
    <div
      data-prox
      className="prox-card rounded-xl p-4 transition-all duration-300 animate-fade-in"
      style={{
        background: `linear-gradient(135deg, ${style.bg}, rgba(5,5,5,0.9))`,
        border: `1px solid ${style.border}`,
        boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
        cursor: 'default',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: '#555', letterSpacing: '0.08em' }}
        >
          {title}
        </div>
        {icon && (
          <div className="p-1.5 rounded-lg flex-shrink-0" style={{ color: style.icon, background: style.bg }}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-1.5 flex-wrap">
        <div
          className={`font-bold leading-none ${
            size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl'
          }`}
          style={{
            color: accent === 'default' ? '#f5f5f5' : style.icon,
            fontFamily: 'Space Grotesk, Inter, sans-serif',
          }}
        >
          {value}
        </div>
        {unit && (
          <div className="text-xs mb-0.5" style={{ color: '#555' }}>{unit}</div>
        )}
      </div>

      {subtitle && (
        <div className="text-xs mt-1" style={{ color: '#555' }}>{subtitle}</div>
      )}

      {change_pct !== undefined && (
        <div
          className="flex items-center gap-1 mt-2 text-xs font-medium"
          style={{ color: changeBad ? '#ef4444' : changeGood ? '#00d4a4' : '#555' }}
        >
          {changeBad ? <TrendingUp size={11} /> : changeGood ? <TrendingDown size={11} /> : <Minus size={11} />}
          <span>{Math.abs(change_pct).toFixed(1)}% vs prior week</span>
        </div>
      )}
    </div>
  );
}
