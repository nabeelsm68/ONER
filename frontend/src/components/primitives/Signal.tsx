'use client';

import React from 'react';

interface SignalProps {
  label: string;
  unit: string;
  currentValue: number | string;
  baselineValue?: number | string;
  threshold?: number;
  anomalyDelta?: string; // e.g. "+31.4%"
  points?: number[];
  height?: number;
  status?: 'NORMAL' | 'ANOMALY' | 'RECOVERING' | 'OPTIMAL';
  isSimulated?: boolean;
  className?: string;
}

export default function Signal({
  label,
  unit,
  currentValue,
  baselineValue,
  threshold = 100,
  anomalyDelta,
  points = [85, 88, 87, 89, 92, 98, 115, 131, 128, 120, 95, 88],
  height = 54,
  status = 'ANOMALY',
  isSimulated = false,
  className = '',
}: SignalProps) {
  // Normalize points to SVG coordinates
  const min = Math.min(...points, 60);
  const max = Math.max(...points, 150);
  const range = max - min || 1;
  const width = 240;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 12) - 6;
    return { x, y };
  });

  const pathD = coords.reduce((acc, c, i) => {
    return i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
  }, '');

  // Normal band line (e.g. threshold = 100)
  const thresholdY = height - ((threshold - min) / range) * (height - 12) - 6;

  return (
    <div
      className={`p-3 rounded bg-[#0E1110] border border-[#242A27] ${
        isSimulated ? 'pattern-simulated-hatch' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-[10px] font-mono text-[#626A65] uppercase tracking-wider">
            {label}
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-bold font-mono text-[#F1F3EE]">
              {currentValue}
            </span>
            <span className="text-[10px] font-mono text-[#929A95]">{unit}</span>
          </div>
        </div>

        <div className="text-right">
          {anomalyDelta && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                status === 'ANOMALY'
                  ? 'bg-red-950/20 text-red-400 border-red-900/30'
                  : 'bg-[#141817] text-[#A8C83A] border-[#A8C83A]/30'
              }`}
            >
              {anomalyDelta}
            </span>
          )}
          {baselineValue && (
            <div className="text-[9px] font-mono text-[#626A65] mt-1">
              Base: {baselineValue} {unit}
            </div>
          )}
        </div>
      </div>

      {/* SVG Waveform / Normal Band */}
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full preserve-3d"
          preserveAspectRatio="none"
        >
          {/* Normal Band shaded rect (below threshold) */}
          <rect
            x="0"
            y={thresholdY}
            width={width}
            height={height - thresholdY}
            fill="#101412"
            opacity="0.6"
          />

          {/* Threshold reference line */}
          <line
            x1="0"
            y1={thresholdY}
            x2={width}
            y2={thresholdY}
            stroke="#242A27"
            strokeDasharray="3 3"
            strokeWidth="1"
          />

          {/* Signal path */}
          <path
            d={pathD}
            fill="none"
            stroke={status === 'ANOMALY' ? '#E17055' : '#A8C83A'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Peak Anomaly Point Marker */}
          {coords[7] && (
            <circle
              cx={coords[7].x}
              cy={coords[7].y}
              r="3"
              fill={status === 'ANOMALY' ? '#DC2626' : '#A8C83A'}
              stroke="#080A09"
              strokeWidth="1.5"
            />
          )}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono text-[#626A65] mt-1.5 pt-1 border-t border-[#1C221F]">
        <span>T - 6h</span>
        <span className="text-[#929A95]">Threshold {threshold} {unit}</span>
        <span>NOW</span>
      </div>
    </div>
  );
}
