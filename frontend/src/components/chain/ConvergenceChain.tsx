'use client';

import React, { useState, useEffect } from 'react';
import { ChainSignalNode } from './types';
import { CANONICAL_CASE } from '@/lib/seed';

export interface ConvergenceChainProps {
  signals?: ChainSignalNode[];
  activeSignalIds?: string[];
  coreScore?: number;
  likelyCause?: string;
  causeDetail?: string;
  actionName?: string;
  actionDetail?: string;
  verifiedNotice?: string;
  verifiedDetail?: string;
  measuredOutcome?: string;
  measuredUnit?: string;
  isAutoplay?: boolean;
  showReturnLine?: boolean;
  animationCycle?: number; // increments on each loop
  onSignalClick?: (signal: ChainSignalNode, index: number) => void;
  onReturnComplete?: () => void;
  className?: string;
}

const DEFAULT_SIGNALS: ChainSignalNode[] = CANONICAL_CASE.signals.map((s) => ({
  id: s.id,
  name: s.name,
  weight: s.possible,
  earned: s.earned,
  note: s.note,
  status: s.status,
  description: s.description,
}));

/**
 * ConvergenceChain (Living Instrument Centerpiece)
 * 
 * True SVG Evidence Intelligence convergence instrument.
 * Six weighted evidence signals physically travel through cubic Bézier pipes
 * into the Event Core, then flow through Cause -> Action -> Verification stations
 * to the measured outcome with a luminous return pulse traveling back to the citizen.
 * 
 * Spec: docs/ONER_Antigravity_Prompt_Pack.md §0.8
 * Reference: design-reference/oner-directions.html
 */
export default function ConvergenceChain({
  signals = DEFAULT_SIGNALS,
  activeSignalIds,
  coreScore,
  likelyCause = 'Likely cause',
  causeDetail = 'Burner refractory fouling · F-101',
  actionName = 'Action',
  actionDetail = 'Damper trim 1.042',
  verifiedNotice = 'Verification',
  verifiedDetail = 'MRV evidence assembled',
  measuredOutcome = '14.2',
  measuredUnit = 'tCO₂e per day',
  isAutoplay = true,
  showReturnLine = true,
  animationCycle = 0,
  onSignalClick,
  onReturnComplete,
  className = '',
}: ConvergenceChainProps) {
  // If activeSignalIds is provided, calculate active total score
  const computedScore =
    coreScore !== undefined
      ? coreScore
      : activeSignalIds
      ? signals.reduce((sum, s) => (activeSignalIds.includes((s as any).id || s.name) ? sum + s.earned : sum), 0)
      : CANONICAL_CASE.scores.corroboration;

  const [replayKey, setReplayKey] = useState(0);

  // Sync replay key with parent cycle
  useEffect(() => {
    setReplayKey((k) => k + 1);
  }, [animationCycle]);

  // Setpoint dial trim state
  const isHighCorroboration = computedScore >= 70;

  return (
    <div className={`relative w-full overflow-x-auto select-none custom-scrollbar ${className}`}>
      {/* Replay Trigger in top right */}
      <div className="absolute top-2 right-2 z-10 hidden sm:flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setReplayKey((k) => k + 1);
          }}
          className="text-[10px] font-mono px-2.5 py-1 rounded-[2px] bg-[var(--surface)] hover:bg-[var(--raised)] border border-[var(--line)] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors cursor-pointer flex items-center gap-1.5"
          title="Restart environmental intelligence sequence"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span>Replay sequence</span>
        </button>
      </div>

      <svg
        key={replayKey}
        viewBox="0 0 1180 340"
        className="w-full min-w-[850px] h-auto font-sans"
        role="img"
        aria-label={`Evidence chain: six signals converge to ${computedScore.toFixed(1)} corroboration, then cause, action, verification and ${measuredOutcome} ${measuredUnit}`}
      >
        <defs>
          {/* Subtle glow for Event Core */}
          <linearGradient id="coreGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A8C83A" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#A8C83A" stopOpacity="0.03" />
          </linearGradient>

          {/* Core pulse keyframe */}
          <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Traveling Pulse Particle Gradient */}
          <radialGradient id="pulseDot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#A8C83A" />
            <stop offset="100%" stopColor="#A8C83A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── 1. Six Evidence Input Nodes & Bézier Convergence Pipes ── */}
        {signals.map((node, i) => {
          const y = i * 54 + 6;
          const yc = y + 20;
          // Pipe stroke width is strictly proportional to evidence weight
          const strokeWidth = Math.max(1.5, node.weight * 0.19);
          const delaySec = i * 0.26;
          const fillWidth = Math.min(160, (160 * node.earned) / (node.weight || 1));

          const isNodeActive = activeSignalIds
            ? activeSignalIds.includes((node as any).id || node.name)
            : true;

          const pathD = `M160 ${yc} C300 ${yc} 300 168 440 168`;

          return (
            <g
              key={node.name}
              className={`cursor-pointer group transition-opacity duration-300 ${
                isNodeActive ? 'opacity-100' : 'opacity-25'
              }`}
              onClick={() => onSignalClick?.(node, i)}
              tabIndex={0}
              role="button"
              aria-label={`${node.name}: ${node.earned} of ${node.weight} points`}
            >
              {/* Convergence pipe background track */}
              <path
                d={pathD}
                fill="none"
                stroke="var(--line-subtle)"
                strokeWidth={isNodeActive ? strokeWidth : 1}
                strokeDasharray={isNodeActive ? undefined : '3 3'}
              />

              {/* Luminous Animated SVG Pipe physically drawing toward (440, 168) */}
              {isNodeActive && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={strokeWidth}
                  strokeOpacity={0.88}
                  className={isAutoplay ? 'p' : ''}
                  style={isAutoplay ? { animationDelay: `${delaySec}s` } : undefined}
                />
              )}

              {/* Traveling Evidence Packet / Signal Head moving along the pipe */}
              {isAutoplay && isNodeActive && (
                <circle
                  r={Math.max(2.5, strokeWidth * 0.7)}
                  fill="url(#pulseDot)"
                  className="pointer-events-none"
                >
                  <animateMotion
                    path={pathD}
                    begin={`${delaySec}s`}
                    dur="1.4s"
                    repeatCount="1"
                    fill="freeze"
                    keyPoints="0;1"
                    keyTimes="0;1"
                    calcMode="spline"
                    keySplines="0.16 1 0.3 1"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.1;0.9;1"
                    begin={`${delaySec}s`}
                    dur="1.4s"
                    fill="freeze"
                  />
                </circle>
              )}

              {/* Node container border */}
              <rect
                x="0"
                y={y}
                width="160"
                height="40"
                fill="var(--surface)"
                stroke={isNodeActive ? 'var(--line)' : 'var(--line-subtle)'}
                rx="2"
                className="group-hover:stroke-[var(--accent)] transition-colors"
              />

              {/* Node earned weight fill bar */}
              {isNodeActive && (
                <rect
                  x="0"
                  y={y}
                  width={fillWidth}
                  height="40"
                  fill="var(--accent-dim)"
                  rx="2"
                  className={isAutoplay ? 'f' : ''}
                  style={isAutoplay ? { animationDelay: `${delaySec}s` } : undefined}
                />
              )}

              {/* Signal Title */}
              <text
                x="12"
                y={y + 17}
                fontSize="12"
                fontWeight="500"
                fill="var(--ink)"
              >
                {node.name}
              </text>

              {/* Signal Subtitle & Earned Ratio */}
              <text
                x="12"
                y={y + 32}
                fontSize="11"
                fontFamily="var(--font-mono)"
                fill="var(--ink-2)"
              >
                {node.note} · {node.earned}/{node.weight}
              </text>
            </g>
          );
        })}

        {/* ── 2. Event Core Rect & Glow (440, 6) to (570, 330) ───────── */}
        <g className={isAutoplay ? 'late' : ''} style={isAutoplay ? { animationDelay: '1.8s' } : undefined}>
          <rect
            x="440"
            y="6"
            width="130"
            height="324"
            fill="url(#coreGlow)"
            stroke={isHighCorroboration ? 'var(--accent)' : 'var(--line)'}
            strokeWidth="1.5"
            rx="2"
          />

          {/* Precision Corner Hairline Brackets */}
          <path d="M444 14 h8 M444 14 v8 M566 14 h-8 M566 14 v8" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M444 322 h8 M444 322 v-8 M566 322 h-8 M566 322 v-8" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.6" />

          {/* Event Core Number */}
          <text
            x="505"
            y="178"
            textAnchor="middle"
            fontSize="44"
            fontWeight="300"
            fill="var(--ink)"
            fontFamily="var(--font-mono)"
          >
            {computedScore.toFixed(1)}
          </text>

          {/* Core Status Label */}
          <text
            x="505"
            y="202"
            textAnchor="middle"
            fontSize="10"
            fontFamily="var(--font-mono)"
            letterSpacing="0.08em"
            fill={isHighCorroboration ? 'var(--accent)' : 'var(--ink-3)'}
          >
            {isHighCorroboration ? 'CORROBORATED' : 'PARTIAL EVIDENCE'}
          </text>

          {/* Mini weight ratio indicator */}
          <text
            x="505"
            y="218"
            textAnchor="middle"
            fontSize="10"
            fontFamily="var(--font-mono)"
            fill="var(--ink-3)"
          >
            {computedScore.toFixed(1)} / 100.0
          </text>
        </g>

        {/* ── 3. Trunk Line (570, 168) to (1010, 168) ────────────────── */}
        <path
          d="M570 168 H1010"
          stroke={isHighCorroboration ? 'var(--accent)' : 'var(--line)'}
          strokeWidth="3"
          strokeDasharray={isHighCorroboration ? undefined : '4 4'}
          fill="none"
          className={isAutoplay ? 'p' : ''}
          style={isAutoplay ? { animationDelay: '2.4s' } : undefined}
        />

        {/* Traveling trunk pulse */}
        {isAutoplay && isHighCorroboration && (
          <circle r="4" fill="url(#pulseDot)">
            <animateMotion
              path="M570 168 H1010"
              begin="2.4s"
              dur="1.6s"
              repeatCount="1"
              fill="freeze"
              keyPoints="0;1"
              keyTimes="0;1"
              calcMode="spline"
              keySplines="0.16 1 0.3 1"
            />
          </circle>
        )}

        {/* ── 4. Stations along the Trunk: Cause, Action, Verified ───── */}
        {/* Station 1: Likely Cause (reveals at ~3.2s) */}
        <g
          className={isAutoplay ? 'late' : ''}
          style={isAutoplay ? { animationDelay: '3.0s' } : undefined}
        >
          <rect
            x={690 - 7}
            y={161}
            width="14"
            height="14"
            fill="var(--accent)"
            rx="1"
          />
          <text
            x={690}
            y={144}
            textAnchor="middle"
            fontSize="12"
            fontWeight="500"
            fill="var(--ink)"
          >
            {likelyCause}
          </text>
          <text
            x={690}
            y={198}
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-mono)"
            fill="var(--ink-2)"
          >
            {causeDetail}
          </text>
          <text
            x={690}
            y={212}
            textAnchor="middle"
            fontSize="9"
            fontFamily="var(--font-mono)"
            fill="var(--ink-3)"
          >
            99.4 domain support
          </text>
        </g>

        {/* Station 2: Industrial Action with Damper Trim adjustment indicator (reveals at ~4.0s) */}
        <g
          className={isAutoplay ? 'late' : ''}
          style={isAutoplay ? { animationDelay: '4.0s' } : undefined}
        >
          <rect
            x={820 - 7}
            y={161}
            width="14"
            height="14"
            fill="var(--accent)"
            rx="1"
          />
          <text
            x={820}
            y={144}
            textAnchor="middle"
            fontSize="12"
            fontWeight="500"
            fill="var(--ink)"
          >
            {actionName}
          </text>
          <text
            x={820}
            y={198}
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-mono)"
            fill="var(--ink-2)"
          >
            {actionDetail}
          </text>
          {/* Animated Setpoint Adjustment Marker: 1.000 -> 1.042 */}
          <g transform="translate(790, 206)">
            <line x1="0" y1="6" x2="60" y2="6" stroke="var(--line)" strokeWidth="1" />
            <circle cx="25" cy="6" r="2.5" fill="var(--accent)">
              {isAutoplay && (
                <animate
                  attributeName="cx"
                  values="5; 42"
                  dur="1.2s"
                  begin="4.2s"
                  fill="freeze"
                />
              )}
            </circle>
            <text x="30" y="18" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--ink-3)">
              1.000 → 1.042
            </text>
          </g>
        </g>

        {/* Station 3: Verification (reveals at ~4.8s) */}
        <g
          className={isAutoplay ? 'late' : ''}
          style={isAutoplay ? { animationDelay: '4.8s' } : undefined}
        >
          <rect
            x={950 - 7}
            y={161}
            width="14"
            height="14"
            fill="var(--accent)"
            rx="1"
          />
          <text
            x={950}
            y={144}
            textAnchor="middle"
            fontSize="12"
            fontWeight="500"
            fill="var(--ink)"
          >
            {verifiedNotice}
          </text>
          <text
            x={950}
            y={198}
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-mono)"
            fill="var(--ink-2)"
          >
            {verifiedDetail}
          </text>
          <text
            x={950}
            y={212}
            textAnchor="middle"
            fontSize="9"
            fontFamily="var(--font-mono)"
            fill="var(--ink-3)"
          >
            4 sensors in agreement
          </text>
        </g>

        {/* ── 5. Terminal Open Brackets & Measured Outcome (reveals at ~5.6s) ── */}
        <g
          className={isAutoplay ? 'late' : ''}
          style={isAutoplay ? { animationDelay: '5.6s' } : undefined}
        >
          {/* Terminal Brackets */}
          <g fill="none" stroke="var(--accent)" strokeWidth="2">
            <path d="M1030 122 h-10 v92 h10" />
            <path d="M1170 122 h10 v92 h-10" />
          </g>

          {/* Hero Measured Value */}
          <text
            x="1050"
            y="182"
            fontSize="44"
            fontWeight="300"
            fill="var(--ink)"
            fontFamily="var(--font-mono)"
          >
            {measuredOutcome}
          </text>

          {/* Unit */}
          <text
            x="1052"
            y="204"
            fontSize="11"
            fontFamily="var(--font-sans)"
            fill="var(--ink-2)"
          >
            {measuredUnit}
          </text>

          {/* Subtext */}
          <text
            x="1052"
            y="222"
            fontSize="10"
            fontFamily="var(--font-mono)"
            fill="var(--accent)"
          >
            Measured reduction
          </text>
          <text
            x="1052"
            y="235"
            fontSize="9"
            fontFamily="var(--font-mono)"
            fill="var(--ink-3)"
          >
            5,183 t/yr annualized
          </text>
        </g>

        {/* ── 6. Luminous Return Loop Line (Traveling Back to Citizen) ── */}
        {showReturnLine && (
          <g
            className={isAutoplay ? 'late' : ''}
            style={isAutoplay ? { animationDelay: '6.6s' } : undefined}
          >
            {/* Backward path from 1170, 168 up and across to (40, 15) */}
            <path
              id="returnLoopPath"
              d="M 1170 168 C 1195 168, 1205 18, 1000 18 L 80 18"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity={0.6}
            />

            {/* Traveling Return Pulse Particle */}
            {isAutoplay && (
              <circle r="4" fill="url(#pulseDot)">
                <animateMotion
                  path="M 1170 168 C 1195 168, 1205 18, 1000 18 L 80 18"
                  begin="6.6s"
                  dur="2.4s"
                  repeatCount="1"
                  fill="freeze"
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="spline"
                  keySplines="0.16 1 0.3 1"
                />
              </circle>
            )}

            {/* Loop return label along path */}
            <text
              x="620"
              y="12"
              textAnchor="middle"
              fontSize="9"
              fontFamily="var(--font-mono)"
              fill="var(--accent)"
              letterSpacing="0.06em"
              opacity="0.8"
            >
              ← RETURN LOOP: MEASURED RESULT TRAVELS BACK TO CITIZEN (+50 PTS)
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
