'use client';

import React from 'react';
import { ConvergenceChainProps, ChainSignalNode } from './types';
import { CANONICAL_CASE } from '@/lib/seed';

const DEFAULT_SIGNALS: ChainSignalNode[] = CANONICAL_CASE.signals.map((s) => ({
  name: s.name,
  weight: s.possible,
  earned: s.earned,
  note: s.note,
}));

/**
 * ConvergenceChain
 * 
 * SVG-based Evidence Intelligence OS core object.
 * Visualizes 6 evidence nodes converging via cubic Bézier pipes
 * into the Event Core (89.4), extending through Cause -> Action -> Verification stations
 * to the measured outcome (14.2 tCO₂e/day).
 * 
 * Spec: docs/ONER_Antigravity_Prompt_Pack.md §0.8
 * Reference: design-reference/oner-directions.html
 */
export default function ConvergenceChain({
  signals = DEFAULT_SIGNALS,
  coreScore = CANONICAL_CASE.scores.corroboration,
  likelyCause = 'Burner fouling',
  actionName = 'Damper trim 1.042',
  verifiedNotice = '4 signals agree',
  measuredOutcome = '14.2',
  measuredUnit = 'tCO₂e per day',
  isAutoplay = true,
  onSignalClick,
  className = '',
}: ConvergenceChainProps) {
  const stations = [
    { x: 690, label: 'Likely cause', value: likelyCause },
    { x: 820, label: 'Action', value: actionName },
    { x: 950, label: 'Verified', value: verifiedNotice },
  ];

  return (
    <div className={`w-full overflow-x-auto select-none custom-scrollbar ${className}`}>
      <svg
        viewBox="0 0 1180 330"
        className="w-full min-w-[800px] h-auto font-sans"
        role="img"
        aria-label={`Evidence chain: six signals converge to ${coreScore} corroboration, then cause, action, verification and ${measuredOutcome} ${measuredUnit}`}
      >
        {/* ── 1. Six Evidence Input Nodes & Bézier Convergence Pipes ── */}
        {signals.map((node, i) => {
          const y = i * 54 + 4;
          const yc = y + 20;
          // Pipe stroke width is proportional to weight: weight * 0.2px
          const strokeWidth = Math.max(1.5, node.weight * 0.2);
          const delaySec = i * 0.3;
          const fillWidth = Math.min(160, (160 * node.earned) / (node.weight || 1));

          return (
            <g
              key={node.name}
              className="cursor-pointer group"
              onClick={() => onSignalClick?.(node, i)}
              tabIndex={0}
              role="button"
              aria-label={`${node.name}: ${node.earned} of ${node.weight} points`}
            >
              {/* Cubic Bézier convergence pipe from (160, yc) to (440, 166) */}
              <path
                d={`M160 ${yc} C300 ${yc} 300 166 440 166`}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={strokeWidth}
                strokeOpacity={0.85}
                className={isAutoplay ? 'p' : ''}
                style={isAutoplay ? { animationDelay: `${delaySec}s` } : undefined}
              />

              {/* Node container border */}
              <rect
                x="0"
                y={y}
                width="160"
                height="40"
                fill="var(--surface)"
                stroke="var(--line)"
                rx="2"
                className="group-hover:stroke-[var(--accent)] transition-colors"
              />

              {/* Node earned weight fill bar */}
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

        {/* ── 2. Event Core (440, 4) to (570, 324) ────────────────────── */}
        <rect
          x="440"
          y="4"
          width="130"
          height="320"
          fill="var(--surface)"
          stroke="var(--accent)"
          strokeWidth="1.5"
          rx="2"
        />

        {/* Core Corroboration Number */}
        <text
          x="505"
          y="176"
          textAnchor="middle"
          fontSize="44"
          fontWeight="300"
          fill="var(--ink)"
          fontFamily="var(--font-mono)"
        >
          {coreScore.toFixed(1)}
        </text>

        <text
          x="505"
          y="200"
          textAnchor="middle"
          fontSize="11"
          fontFamily="var(--font-sans)"
          fill="var(--ink-2)"
        >
          corroborated
        </text>

        {/* ── 3. Trunk Line (570, 166) to (1010, 166) ────────────────── */}
        <path
          d="M570 166 H1010"
          stroke="var(--accent)"
          strokeWidth="3"
          fill="none"
          className={isAutoplay ? 'p' : ''}
          style={isAutoplay ? { animationDelay: '1.8s' } : undefined}
        />

        {/* ── 4. Stations along the Trunk: Cause, Action, Verified ───── */}
        {stations.map((st) => (
          <g
            key={st.label}
            className={isAutoplay ? 'late' : ''}
          >
            <rect
              x={st.x - 7}
              y={159}
              width="14"
              height="14"
              fill="var(--accent)"
              rx="1"
            />
            <text
              x={st.x}
              y={144}
              textAnchor="middle"
              fontSize="12"
              fontWeight="500"
              fill="var(--ink)"
            >
              {st.label}
            </text>
            <text
              x={st.x}
              y={196}
              textAnchor="middle"
              fontSize="11"
              fontFamily="var(--font-mono)"
              fill="var(--ink-2)"
            >
              {st.value}
            </text>
          </g>
        ))}

        {/* ── 5. Terminal Open Brackets & Measured Outcome ──────────── */}
        <g
          className={isAutoplay ? 'late' : ''}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
        >
          <path d="M1030 120 h-10 v92 h10" />
          <path d="M1170 120 h10 v92 h-10" />
        </g>

        <text
          x="1050"
          y="180"
          fontSize="44"
          fontWeight="300"
          fill="var(--ink)"
          fontFamily="var(--font-mono)"
          className={isAutoplay ? 'late' : ''}
        >
          {measuredOutcome}
        </text>

        <text
          x="1052"
          y="202"
          fontSize="11"
          fill="var(--ink-2)"
          className={isAutoplay ? 'late' : ''}
        >
          {measuredUnit}
        </text>
      </svg>
    </div>
  );
}
