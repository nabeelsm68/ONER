'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { api, CommunityReport, EnvironmentalImpactReport as EnvironmentalImpactReportType } from '@/lib/api';
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  TrendingDown,
  Info,
  Layers,
  Sparkles,
  Flame,
  Zap,
  Droplets,
  Settings,
} from 'lucide-react';
import EnvironmentalImpactReport from '@/components/EnvironmentalImpactReport';
import EnvironmentalImpactReportModal from '@/components/EnvironmentalImpactReportModal';
import { ReductionWedge } from '@/components/primitives';

export default function CarbonPage() {
  const [data, setData] = useState<any>(null);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [selectedImpactReport, setSelectedImpactReport] = useState<EnvironmentalImpactReportType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [carbonRes, reportsRes] = await Promise.all([
        api.carbon(),
        api.getCommunityReports(),
      ]);
      setData(carbonRes);
      setReports(reportsRes.reports || []);
    } catch (err) {
      console.error('Carbon load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const mrvComponents = data?.mrv_readiness?.components || [];
  const resolvedWithReports = reports.filter((r) => r.environmental_impact_report);
  const primaryReport = resolvedWithReports[0]?.environmental_impact_report || null;

  return (
    <AppLayout
      title="Carbon & MRV"
      subtitle="Institutional GHG Accounting & Verification Intelligence"
      onRefresh={loadData}
      isRefreshing={loading}
    >
      <div className="space-y-6 text-[#F1F3EE]">
        {/* ── TOP: CARBON & MRV & LARGE KPI (Section 12) ────────── */}
        <div className="p-6 rounded-xl bg-[#0E1110] border border-[#242A27] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#A8C83A] font-bold uppercase tracking-wider">
                CARBON & MRV &bull; INSTITUTIONAL AUDIT SYSTEM
              </span>
              <span className="text-zinc-600">&bull;</span>
              <span className="text-[10px] font-mono text-[#929A95]">ISO 14064-2</span>
            </div>
            <div className="text-[11px] uppercase font-sans text-[#929A95] tracking-wider pt-1">
              ANNUALIZED CO₂e REDUCTION
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono text-zinc-100 tracking-tight">
                5,183
              </span>
              <span className="text-base font-mono text-[#A8C83A] font-semibold">
                tCO₂e / year
              </span>
            </div>
            <p className="text-xs text-[#929A95] pt-0.5">
              Verified annualized abatement based on Furnace F-101 damper setpoint trim and continuous CEMS monitoring.
            </p>
          </div>

          {/* MRV READINESS BADGE (Section 12) */}
          <div className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] text-xs font-mono space-y-2 min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-sans text-[10px] uppercase font-semibold">
                MRV READINESS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                AUDIT READY
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono text-xs">
              <div className="p-2 rounded bg-[#0E1110] border border-[#181E1C]">
                <div className="text-[9px] uppercase text-[#929A95] font-sans">MEASURE</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">✓</div>
              </div>
              <div className="p-2 rounded bg-[#0E1110] border border-[#181E1C]">
                <div className="text-[9px] uppercase text-[#929A95] font-sans">REPORT</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">✓</div>
              </div>
              <div className="p-2 rounded bg-[#0E1110] border border-[#181E1C]">
                <div className="text-[9px] uppercase text-[#929A95] font-sans">VERIFY</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">◐</div>
              </div>
            </div>
            <div className="text-[10px] text-zinc-500 font-sans pt-1 border-t border-[#181E1C] flex justify-between">
              <span>Third-Party Verification:</span>
              <span className="text-amber-300 font-mono">Pending Audit</span>
            </div>
          </div>
        </div>

        {/* ── BASELINE · CURRENT · REDUCTION · POTENTIAL CREDITABLE (Section 12) ── */}
        <div className="rounded-xl bg-[#0E1110] border border-[#242A27] overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-[#242A27]">
            {/* 1. BASELINE */}
            <div className="p-5 flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-sans font-bold text-[#929A95] tracking-wider">
                  BASELINE
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 mt-2">
                  104.2 <span className="text-xs font-normal text-zinc-400">tCO₂e/day</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#181E1C] text-[10px] font-mono text-zinc-500">
                Annual baseline: 6,754 tCO₂e/yr
              </div>
            </div>

            {/* 2. CURRENT */}
            <div className="p-5 flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-sans font-bold text-[#929A95] tracking-wider">
                  CURRENT
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 mt-2">
                  90.0 <span className="text-xs font-normal text-zinc-400">tCO₂e/day</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#181E1C] text-[10px] font-mono text-emerald-400">
                Post-intervention stabilized rate
              </div>
            </div>

            {/* 3. REDUCTION */}
            <div className="p-5 flex flex-col justify-between bg-[#141817]">
              <div>
                <div className="text-[10px] uppercase font-sans font-bold text-emerald-400 tracking-wider">
                  REDUCTION
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-2">
                  -14.2 <span className="text-xs font-normal text-zinc-400">tCO₂e/day</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#242A27] text-[10px] font-mono text-zinc-300">
                13.6% emissions drop verified
              </div>
            </div>

            {/* 4. POTENTIAL CREDITABLE */}
            <div className="p-5 flex flex-col justify-between bg-[#080A09]">
              <div>
                <div className="text-[10px] uppercase font-sans font-bold text-[#A8C83A] tracking-wider">
                  POTENTIAL CREDITABLE
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-[#A8C83A] mt-2">
                  5,183 <span className="text-xs font-normal text-zinc-400">tCO₂e/yr</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#242A27] text-[10px] font-mono text-amber-300">
                Subject to 3rd-party methodology
              </div>
            </div>
          </div>
        </div>

        {/* ── HERO REDUCTION WEDGE PRIMITIVE ────────────────────── */}
        <ReductionWedge
          dailyReductionTons={14.2}
          annualizedReductionTons={5183}
          noxDailyReductionKg={28.6}
          facilityName="Orion Refining Complex"
          sourceName="Furnace F-101 (North Processing Train)"
          interventionName="Damper Trim 1.042 (Air-Fuel Ratio Reset)"
          isVerified={true}
        />

        {/* ── MANDATORY CARBON CREDIT LANGUAGE (Section 11) ─────── */}
        <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] text-xs flex items-start gap-2.5">
          <Info size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#929A95] leading-relaxed">
            <strong className="text-zinc-200">Carbon Crediting Notice & Disclaimer: </strong>
            ONER estimates emissions reductions and MRV readiness. Actual environmental or carbon-credit issuance requires an applicable methodology, eligibility assessment and independent verification. Potential creditable volume shown is illustrative based on simulated facility data.
          </p>
        </div>

        {/* ── REDUCTION SOURCES (Section 12) ───────────────────── */}
        <div className="p-5 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#929A95] tracking-wider">
                DECARBONIZATION LEVERS
              </div>
              <h2 className="text-base font-bold text-[#F1F3EE]">
                Reduction Sources
              </h2>
            </div>
            <span className="text-xs font-mono text-[#A8C83A]">
              Total Portfolio: ~7,428 tCO₂e / yr
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. Furnace Optimization */}
            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200">Furnace Optimization</span>
                <Flame size={14} className="text-[#A8C83A]" />
              </div>
              <div className="text-xl font-mono font-bold text-[#A8C83A]">
                -5,183 <span className="text-xs font-normal text-zinc-400">t/yr</span>
              </div>
              <p className="text-[11px] text-[#929A95] leading-relaxed">
                Damper trim calibration to 1.042 and air-fuel stoichiometric control.
              </p>
              <div className="text-[10px] font-mono text-emerald-400">Status: Active & Corroborated</div>
            </div>

            {/* 2. Energy Efficiency */}
            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200">Energy Efficiency</span>
                <Zap size={14} className="text-amber-400" />
              </div>
              <div className="text-xl font-mono font-bold text-amber-300">
                -820 <span className="text-xs font-normal text-zinc-400">t/yr</span>
              </div>
              <p className="text-[11px] text-[#929A95] leading-relaxed">
                Compressor station seal refurbishment and peak-hour load shifting.
              </p>
              <div className="text-[10px] font-mono text-zinc-400">Status: Planned Intervention</div>
            </div>

            {/* 3. Process Improvement */}
            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200">Process Improvement</span>
                <Settings size={14} className="text-teal-400" />
              </div>
              <div className="text-xl font-mono font-bold text-teal-300">
                -1,050 <span className="text-xs font-normal text-zinc-400">t/yr</span>
              </div>
              <p className="text-[11px] text-[#929A95] leading-relaxed">
                Pre-heater tube cleaning and heat exchanger fouling remediation.
              </p>
              <div className="text-[10px] font-mono text-zinc-400">Status: Under Engineering Review</div>
            </div>

            {/* 4. Water Recovery */}
            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200">Water Recovery</span>
                <Droplets size={14} className="text-sky-400" />
              </div>
              <div className="text-xl font-mono font-bold text-sky-300">
                -375 <span className="text-xs font-normal text-zinc-400">t/yr</span>
              </div>
              <p className="text-[11px] text-[#929A95] leading-relaxed">
                Closed-loop cooling circuit blowdown water recycling (81.2% recovery).
              </p>
              <div className="text-[10px] font-mono text-emerald-400">Status: Verified Operating</div>
            </div>
          </div>
        </div>

        {/* ── CASE IMPACT REPORTS (Section 12) ─────────────────── */}
        <div className="p-5 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#929A95] tracking-wider">
                AUDITED CASE LEDGER
              </div>
              <h2 className="text-base font-bold text-[#F1F3EE]">
                Case Impact Reports
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Each resolved case generates an auditable MRV Dossier
            </span>
          </div>

          {/* Table / Row Display of Resolved Cases */}
          <div className="space-y-3">
            {resolvedWithReports.map((rep) => {
              const impact = rep.environmental_impact_report!;
              return (
                <div
                  key={rep.id}
                  className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#A8C83A]">{rep.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        {impact.mrv_pipeline.verification_status}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {rep.correlated_facility}
                      </span>
                    </div>
                    <div className="text-zinc-200 font-semibold text-xs">{rep.title}</div>
                    <div className="text-[11px] text-[#929A95] font-mono">
                      Intervention: <span className="text-zinc-300 font-sans">{impact.corrective_action}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-sans text-zinc-500">CO₂e Reduction</div>
                      <div className="font-mono font-bold text-sm text-emerald-400">
                        -14.2 t/day (5,183 t/yr)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImpactReport(impact);
                        setShowModal(true);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-[#141817] hover:bg-[#1f2622] border border-[#A8C83A]/40 text-xs font-mono font-semibold text-[#A8C83A] hover:text-[#C4DF61] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Inspect Dossier</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Primary Case Embedded Inline for Instant Enterprise Inspection */}
          {primaryReport && (
            <div className="pt-4 border-t border-[#242A27]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#A8C83A] mb-3">
                Full Active Dossier &bull; Case {primaryReport.report_id}
              </div>
              <EnvironmentalImpactReport report={primaryReport} />
            </div>
          )}
        </div>
      </div>

      {/* Environmental Impact Report Modal */}
      {selectedImpactReport && (
        <EnvironmentalImpactReportModal
          report={selectedImpactReport}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </AppLayout>
  );
}
