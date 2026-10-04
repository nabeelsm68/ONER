'use client';

import React from 'react';
import { Check, ChevronRight, AlertCircle, Clock } from 'lucide-react';

export interface RailStep {
  id: string;
  label: string;
  sublabel?: string;
  status: 'complete' | 'active' | 'pending' | 'conflict';
  value?: string | number;
  badge?: string;
  timestamp?: string;
  onClick?: () => void;
}

interface RailProps {
  steps: RailStep[];
  currentStepId?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  label?: string;
}

export default function Rail({
  steps,
  currentStepId,
  orientation = 'horizontal',
  className = '',
  label,
}: RailProps) {
  if (orientation === 'vertical') {
    return (
      <div className={`space-y-1 ${className}`}>
        {label && (
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#626A65] mb-2 px-1">
            {label}
          </div>
        )}
        <div className="relative pl-4 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#242A27]">
          {steps.map((step, index) => {
            const isSelected = currentStepId === step.id;
            const isComplete = step.status === 'complete';
            const isActive = step.status === 'active' || isSelected;

            return (
              <div
                key={step.id}
                onClick={step.onClick}
                className={`relative flex items-start gap-3 p-2 rounded transition-colors ${
                  step.onClick ? 'cursor-pointer hover:bg-[#141817]' : ''
                } ${isSelected ? 'bg-[#141817] border border-[#242A27]' : ''}`}
              >
                {/* Node icon */}
                <span
                  className={`absolute -left-4 top-2.5 w-3 h-3 rounded-full flex items-center justify-center text-[8px] transition-colors ${
                    isComplete
                      ? 'bg-[#A8C83A] text-[#080A09]'
                      : isActive
                      ? 'bg-[#141817] border-2 border-[#A8C83A] text-[#A8C83A]'
                      : 'bg-[#0E1110] border border-[#242A27] text-[#626A65]'
                  }`}
                >
                  {isComplete ? <Check size={8} strokeWidth={3} /> : null}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        isActive
                          ? 'text-[#F1F3EE]'
                          : isComplete
                          ? 'text-[#929A95]'
                          : 'text-[#626A65]'
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.value && (
                      <span className="font-mono text-xs text-[#F1F3EE]">{step.value}</span>
                    )}
                  </div>
                  {step.sublabel && (
                    <div className="text-[10px] text-[#626A65] mt-0.5 truncate">
                      {step.sublabel}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Horizontal Rail
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#626A65] mb-2 px-1">
          {label}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {steps.map((step, index) => {
          const isSelected = currentStepId === step.id;
          const isComplete = step.status === 'complete';
          const isActive = step.status === 'active' || isSelected;

          return (
            <div
              key={step.id}
              onClick={step.onClick}
              className={`p-2.5 rounded border transition-all ${
                step.onClick ? 'cursor-pointer' : ''
              } ${
                isSelected
                  ? 'bg-[#141817] border-[#A8C83A]/40'
                  : isActive
                  ? 'bg-[#0E1110] border-[#A8C83A]/30'
                  : isComplete
                  ? 'bg-[#0E1110] border-[#242A27] hover:border-[#323A36]'
                  : 'bg-[#080A09] border-[#1C221F] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[9px] text-[#626A65]">0{index + 1}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isComplete
                      ? 'bg-[#A8C83A]'
                      : isActive
                      ? 'bg-[#C4DF61] animate-pulse'
                      : 'bg-[#242A27]'
                  }`}
                />
              </div>

              <div
                className={`text-xs font-semibold tracking-tight truncate ${
                  isActive || isSelected ? 'text-[#F1F3EE]' : 'text-[#929A95]'
                }`}
              >
                {step.label}
              </div>

              {step.sublabel && (
                <div className="text-[10px] font-mono text-[#626A65] truncate mt-0.5">
                  {step.sublabel}
                </div>
              )}

              {step.value && (
                <div className="text-[11px] font-mono font-bold text-[#F1F3EE] mt-1.5 pt-1 border-t border-[#242A27]">
                  {step.value}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
