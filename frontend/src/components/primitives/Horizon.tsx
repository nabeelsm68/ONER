'use client';

import React from 'react';
import Link from 'next/link';

export type HorizonLevel = 'field' | 'control' | 'impact';

interface HorizonProps {
  currentLevel?: HorizonLevel;
  caseId?: string;
  onSelectLevel?: (level: HorizonLevel) => void;
  className?: string;
  showLabels?: boolean;
}

export default function Horizon({
  currentLevel = 'control',
  caseId,
  onSelectLevel,
  className = '',
  showLabels = true,
}: HorizonProps) {
  const levels: Array<{ id: HorizonLevel; name: string; tag: string; description: string }> = [
    {
      id: 'field',
      name: 'FIELD',
      tag: '01 / RESIDENT OBSERVATION',
      description: 'Citizen evidence, GPS consensus & metadata',
    },
    {
      id: 'control',
      name: 'CONTROL',
      tag: '02 / OPERATIONAL INTELLIGENCE',
      description: 'Convergence chain, root cause & action rail',
    },
    {
      id: 'impact',
      name: 'IMPACT',
      tag: '03 / MEASURED MRV RESTORATION',
      description: 'Verified reduction wedge & community return',
    },
  ];

  return (
    <div className={`w-full ${className}`}>
      {/* Upper Atmosphere Description */}
      {showLabels && (
        <div className="flex items-center justify-between text-[10px] font-mono text-[#626A65] pb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A8C83A]/60" />
            <span className="uppercase tracking-wider">Atmospheric Horizon</span>
          </div>
          <div className="hidden sm:block">
            <span>TRANSITION: FIELD → CONTROL → IMPACT</span>
          </div>
        </div>
      )}

      {/* The Horizon Bar & Selectors */}
      <div className="relative flex items-center justify-between border-y border-[#242A27] bg-[#0E1110]/80 backdrop-blur-sm px-2 py-2">
        {levels.map((lvl, index) => {
          const isActive = currentLevel === lvl.id;
          const content = (
            <div className="flex items-center gap-2 text-left">
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  isActive
                    ? 'border-[#A8C83A]/40 bg-[#141817] text-[#A8C83A] font-bold'
                    : 'border-[#242A27] bg-[#080A09] text-[#626A65]'
                }`}
              >
                0{index + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold tracking-wider font-sans transition-colors ${
                      isActive ? 'text-[#F1F3EE]' : 'text-[#929A95] hover:text-[#F1F3EE]'
                    }`}
                  >
                    {lvl.name}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A8C83A] animate-pulse" />
                  )}
                </div>
                <div className="text-[10px] font-mono text-[#626A65] hidden md:block">
                  {lvl.description}
                </div>
              </div>
            </div>
          );

          if (caseId) {
            return (
              <Link
                key={lvl.id}
                href={`/case/${caseId}?level=${lvl.id}`}
                className={`flex-1 py-1.5 px-3 rounded transition-all ${
                  isActive ? 'bg-[#141817] border border-[#242A27]' : 'hover:bg-[#121615]'
                }`}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => onSelectLevel?.(lvl.id)}
              className={`flex-1 py-1.5 px-3 rounded text-left transition-all cursor-pointer ${
                isActive ? 'bg-[#141817] border border-[#242A27]' : 'hover:bg-[#121615]'
              }`}
            >
              {content}
            </button>
          );
        })}
      </div>

      {/* Hairline Divider with Tick Accents */}
      <div className="relative w-full h-[1px] bg-[#242A27]">
        <div
          className="absolute top-[-2px] h-[5px] w-24 bg-[#A8C83A] transition-all duration-300"
          style={{
            left:
              currentLevel === 'field'
                ? '12%'
                : currentLevel === 'control'
                ? '48%'
                : '84%',
            transform: 'translateX(-50%)',
          }}
        />
      </div>
    </div>
  );
}
