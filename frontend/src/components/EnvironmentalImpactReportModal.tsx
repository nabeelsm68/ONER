'use client';

import React from 'react';
import { X } from 'lucide-react';
import { EnvironmentalImpactReport as EnvironmentalImpactReportType } from '@/lib/api';
import EnvironmentalImpactReport from './EnvironmentalImpactReport';

interface EnvironmentalImpactReportModalProps {
  report?: EnvironmentalImpactReportType | null;
  isOpen?: boolean;
  onClose: () => void;
}

export default function EnvironmentalImpactReportModal({
  report,
  isOpen = true,
  onClose,
}: EnvironmentalImpactReportModalProps) {
  if (isOpen === false || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0E1110] border border-[#242A27] rounded-xl shadow-2xl text-[#F1F3EE] custom-scrollbar p-6 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#242A27]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30 font-semibold">
              {report.report_id}
            </span>
            <h2 className="text-base font-bold text-[#F1F3EE]">
              Audited Environmental Impact Dossier
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#141817] hover:bg-[#1f2623] border border-[#242A27] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Embedded Reusable Report */}
        <EnvironmentalImpactReport report={report} />

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#242A27] text-xs">
          <span className="text-[10px] font-mono text-[#929A95]">
            ISO 14064-2 Environmental Provenance Chain Verified
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#141817] hover:bg-[#1f2623] border border-[#242A27] text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
