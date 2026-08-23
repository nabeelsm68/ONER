'use client';
import { AlertTriangle, AlertCircle, Eye, CheckCircle } from 'lucide-react';

interface AlertBannerProps {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'WATCH' | 'NORMAL';
  component?: string;
  date: string;
  evidence: string;
  onClick?: () => void;
}

// Semantic severity colors — DO NOT change to lime
const SEV_CONFIG = {
  CRITICAL: { icon: AlertCircle,   color: '#ef4444', bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.22)',  label: 'CRITICAL' },
  HIGH:     { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.22)', label: 'HIGH' },
  WATCH:    { icon: Eye,           color: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.22)', label: 'WATCH' },
  NORMAL:   { icon: CheckCircle,   color: '#00d4a4', bg: 'rgba(0,212,164,0.07)',  border: 'rgba(0,212,164,0.22)', label: 'NORMAL' },
};

export default function AlertBanner({ id, severity, component, date, evidence, onClick }: AlertBannerProps) {
  const cfg = SEV_CONFIG[severity] || SEV_CONFIG.WATCH;
  const Icon = cfg.icon;

  return (
    <div
      data-prox
      className="prox-card rounded-xl p-4 cursor-pointer transition-all duration-200 hover:opacity-90 animate-fade-in"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Icon size={15} style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-md"
              style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              {cfg.label}
            </span>
            {component && (
              <span className="text-xs font-semibold" style={{ color: '#f5f5f5' }}>{component}</span>
            )}
            <span className="text-xs ml-auto" style={{ color: '#555' }}>{date}</span>
          </div>
          <p className="text-xs mt-1.5 leading-relaxed line-clamp-2" style={{ color: '#8a8a8a' }}>
            {evidence}
          </p>
        </div>
      </div>
    </div>
  );
}
