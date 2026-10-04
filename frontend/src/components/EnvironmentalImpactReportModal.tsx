'use client';

import React from 'react';
import {
  X,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { EnvironmentalImpactReport } from '@/lib/api';

interface EnvironmentalImpactReportModalProps {
  report?: EnvironmentalImpactReport | null;
  isOpen?: boolean;
  onClose: () => void;
}

export default function EnvironmentalImpactReportModal({
  report,
  isOpen,
  onClose,
}: EnvironmentalImpactReportModalProps) {
  if (isOpen === false || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0E1110] border border-[#242A27] rounded-xl shadow-2xl text-[#F1F3EE] custom-scrollbar p-6 space-y-6">
        {/* ── Modal Header ─────────────────────────────────────── */}
        <div className="flex items-start justify-between pb-4 border-b border-[#242A27]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30 font-semibold">
                {report.report_id}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-zinc-400 border border-[#242A27]">
                ISO 14064-2 MRV AUDIT TRAIL
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {report.mrv_pipeline.verification_status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#F1F3EE]">
              Final Environmental Impact & MRV Audit Report
            </h2>
            <p className="text-xs text-[#929A95] mt-0.5">
              Facility: {report.facility_name} &bull; Target: {report.likely_source}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#141817] hover:bg-[#1f2623] border border-[#242A27] text-zinc-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── 1. The 10-Step Full Accountability Chain ─────────── */}
        <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase font-sans text-zinc-400 font-semibold">
            <span>Closed-Loop Provenance Chain</span>
            <span className="font-mono text-[#A8C83A]">10 OF 10 STAGES RECORDED</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            {report.chain.map((step, idx) => (
              <React.Fragment key={step}>
                <span className="px-2 py-1 rounded bg-[#141817] border border-[#242A27] text-zinc-300">
                  <span className="text-[#A8C83A] font-bold mr-1">0{idx + 1}</span>
                  {step}
                </span>
                {idx < report.chain.length - 1 && (
                  <span className="text-zinc-600 font-sans">&rarr;</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── 2. Before vs After Intervention Audit Matrix ─────── */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Comparative Telemetry Verification
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Before Intervention */}
            <div className="p-4 rounded-lg bg-[#080A09] border border-red-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-sans font-bold text-red-400">
                  Before Intervention (Pre-Trim Baseline)
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  BREACH RISK
                </span>
              </div>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-[#181E1C]">
                  <span className="text-zinc-500 font-sans">NOx Concentration:</span>
                  <span className="text-red-400 font-bold">{report.before_intervention.nox_concentration}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#181E1C]">
                  <span className="text-zinc-500 font-sans">Daily CO₂e Rate:</span>
                  <span className="text-zinc-300">{report.before_intervention.co2e_daily_rate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#181E1C]">
                  <span className="text-zinc-500 font-sans">Energy Intensity:</span>
                  <span className="text-zinc-300">{report.before_intervention.energy_intensity}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500 font-sans">Operational State:</span>
                  <span className="text-amber-400">{report.before_intervention.environmental_status}</span>
                </div>
              </div>
            </div>

            {/* After Intervention */}
            <div className="p-4 rounded-lg bg-[#080A09] border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-sans font-bold text-emerald-400">
                  After Intervention (Post-Trim Normalized)
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  MRV VERIFIED
                </span>
              </div>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-[#181E1C]">
                  <span className="text-zinc-500 font-sans">NOx Concentration:</span>
                  <span className="text-emerald-400 font-bold">{report.after_intervention.nox_concentration}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#181E1C]">
                  <span className="text-zinc-500 font-sans">Daily CO₂e Rate:</span>
                  <span className="text-emerald-400">{report.after_intervention.co2e_daily_rate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#181E1C]">
                  <span className="text-zinc-500 font-sans">Energy Efficiency:</span>
                  <span className="text-emerald-400">{report.after_intervention.energy_intensity}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500 font-sans">Operational State:</span>
                  <span className="text-emerald-400">{report.after_intervention.environmental_status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. MRV Protocol Breakdown (Measure, Report, Verify) ─ */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            MRV Protocol Execution
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1.5">
              <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
                <span className="w-5 h-5 rounded bg-[#141817] text-[#A8C83A] flex items-center justify-center font-mono text-[10px]">
                  M
                </span>
                <span>MEASURE</span>
              </div>
              <p className="text-[11px] text-[#929A95] leading-relaxed">
                {report.mrv_pipeline.measure}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1.5">
              <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
                <span className="w-5 h-5 rounded bg-[#141817] text-[#A8C83A] flex items-center justify-center font-mono text-[10px]">
                  R
                </span>
                <span>REPORT</span>
              </div>
              <p className="text-[11px] text-[#929A95] leading-relaxed">
                {report.mrv_pipeline.report}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1.5">
              <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
                <span className="w-5 h-5 rounded bg-[#141817] text-[#A8C83A] flex items-center justify-center font-mono text-[10px]">
                  V
                </span>
                <span>VERIFY</span>
              </div>
              <p className="text-[11px] text-[#929A95] leading-relaxed">
                {report.mrv_pipeline.verify}
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. Carbon / CO₂e Impact & Crediting Distinction ──── */}
        <div className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Annualized Carbon Impact & Potential Crediting
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {report.potential_carbon_credit.crediting_status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27]">
              <div className="text-[9px] uppercase font-sans text-zinc-500">Daily Abatement</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                -{report.mrv_pipeline.daily_reduction_t_co2e} tCO₂e
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27]">
              <div className="text-[9px] uppercase font-sans text-zinc-500">Annualized Abatement</div>
              <div className="text-base font-bold text-[#A8C83A] mt-0.5">
                {report.potential_carbon_credit.annualized_reduction_volume}
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27]">
              <div className="text-[9px] uppercase font-sans text-zinc-500">Creditable Volume</div>
              <div className="text-base font-bold text-zinc-100 mt-0.5">
                {report.potential_carbon_credit.potential_creditable_volume}
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27]">
              <div className="text-[9px] uppercase font-sans text-zinc-500">Illustrative Valuation</div>
              <div className="text-base font-bold text-teal-400 mt-0.5">
                {report.potential_carbon_credit.illustrative_credit_value_inr}
              </div>
            </div>
          </div>

          {/* Credibility Disclaimer Note */}
          <div className="flex items-start gap-2 p-2.5 rounded bg-[#141817] border border-[#242A27] text-[11px] text-[#929A95]">
            <Info size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-zinc-300">Methodology & Verification Note: </strong>
              {report.potential_carbon_credit.disclaimer}
            </p>
          </div>
        </div>

        {/* ── Modal Footer Actions ─────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 border-t border-[#242A27] text-xs">
          <span className="text-[10px] font-mono text-zinc-500">
            Evidence Sources: {report.mrv_pipeline.evidence_sources.length} Verified Data Pipes
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#141817] hover:bg-[#1f2623] border border-[#242A27] text-zinc-200 font-medium transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
