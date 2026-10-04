'use client';

import React from 'react';

export type SystemState =
  | 'Awaiting'
  | 'Received'
  | 'Corroborated'
  | 'Verified'
  | 'Conflict'
  | 'Simulated'
  | 'Stalled'
  | 'Resolved';

interface StateBadgeProps {
  state: SystemState | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export default function StateBadge({
  state,
  size = 'md',
  showDot = true,
  className = '',
}: StateBadgeProps) {
  const normalized = (state || 'Awaiting').toUpperCase();

  let badgeClasses = 'bg-[#141817] text-[#929A95] border-[#242A27]';
  let dotColor = 'bg-[#626A65]';
  let isHatched = false;
  let label = state;

  switch (normalized) {
    case 'VERIFIED':
      badgeClasses = 'bg-[#141817] text-[#A8C83A] border-[#A8C83A]/30 font-semibold';
      dotColor = 'bg-[#A8C83A]';
      label = 'VERIFIED';
      break;

    case 'CORROBORATED':
      badgeClasses = 'bg-[#141817] text-[#C4DF61] border-[#C4DF61]/30 font-semibold';
      dotColor = 'bg-[#C4DF61]';
      label = 'CORROBORATED';
      break;

    case 'RECEIVED':
      badgeClasses = 'bg-[#101412] text-[#F1F3EE] border-[#242A27]';
      dotColor = 'bg-[#929A95]';
      label = 'RECEIVED';
      break;

    case 'AWAITING':
    case 'TRIAGING':
    case 'INVESTIGATING':
      badgeClasses = 'bg-[#0E1110] text-[#929A95] border-[#242A27]';
      dotColor = 'bg-[#626A65]';
      label = 'AWAITING';
      break;

    case 'CONFLICT':
    case 'UNCONFIRMED':
    case 'CRITICAL':
      badgeClasses = 'bg-red-950/20 text-red-400 border-red-900/30';
      dotColor = 'bg-red-400';
      label = 'CONFLICT';
      break;

    case 'STALLED':
    case 'AT RISK':
      badgeClasses = 'bg-amber-950/20 text-amber-400 border-amber-900/30';
      dotColor = 'bg-amber-400';
      label = 'STALLED';
      break;

    case 'SIMULATED':
    case 'SIMULATION':
      // Clear visual distinction: hatch pattern treatment so simulated data is NEVER mistaken for verified
      badgeClasses = 'bg-[#0E1110] text-amber-300 border-amber-500/30 pattern-simulated-amber-hatch font-mono';
      dotColor = 'bg-amber-400';
      isHatched = true;
      label = 'SIMULATED · UNVERIFIED';
      break;

    case 'RESOLVED':
      badgeClasses = 'bg-[#141817] text-[#A8C83A] border-[#242A27] font-medium';
      dotColor = 'bg-[#A8C83A]';
      label = 'RESOLVED';
      break;

    default:
      badgeClasses = 'bg-[#0E1110] text-[#929A95] border-[#242A27]';
      dotColor = 'bg-[#626A65]';
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'text-[9px] px-1.5 py-0.5 tracking-wider'
      : size === 'lg'
      ? 'text-xs px-2.5 py-1 tracking-wider'
      : 'text-[10px] px-2 py-0.5 tracking-wider';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border uppercase font-mono transition-colors ${sizeClasses} ${badgeClasses} ${className}`}
      title={isHatched ? 'Simulated analytical projection (not yet verified by CEMS)' : undefined}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      <span>{label}</span>
    </span>
  );
}
