'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { api, CommunityReport, EnvironmentalImpactReport } from '@/lib/api';
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  TrendingDown,
  Info,
  Clock,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import EnvironmentalImpactReportModal from '@/components/EnvironmentalImpactReportModal';

export default function CarbonPage() {
  const [data, setData] = useState<any>(null);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [selectedImpactReport, setSelectedImpactReport] = useState<EnvironmentalImpactReport | null>(null);
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

  const timeline = data?.evidence_timeline || [];
  const mrvComponents = data?.mrv_readiness?.components || [];
  const resolvedWithReports = reports.filter((r) => r.environmental_impact_report);

  return (
    <AppLayout
      title="Carbon Intelligence & MRV"
      subtitle="Institutional Audit & GHG Accounting System"
      onRefresh={loadData}
      isRefreshing={loading}
    >
      <div className="space-y-6 text-[#F1F3EE]">
        {/* ── Headline Impact Banner ────────────────────────────── */}
        <div className="p-6 rounded-xl bg-[#0E1110] border border-[#242A27] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#A8C83A] font-semibold tracking-wider">
              MEASURED & CORROBORATED INTERVENTION RUN-RATE
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-zinc-100 flex items-baseline gap-2">
              <span>5,183</span>
              <span className="text-base font-normal text-zinc-400">tCO₂e / year</span>
            </div>
            <p className="text-xs text-[#929A95]">
              Annualized emissions reduction verified from Furnace F-101 damper recalibration and continuous telemetry optimization.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] text-xs font-mono space-y-2 min-w-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 font-sans text-[10px] uppercase">MRV Audit Status</span>
              <span className="text-emerald-400 font-semibold text-[10px]">MRV-READY</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-emerald-400 font-bold">M &bull; MEASURE &check;</span>
              <span className="text-emerald-400 font-bold">R &bull; REPORT &check;</span>
              <span className="text-amber-400 font-bold">V &bull; VERIFY &bull;</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-sans pt-1 border-t border-[#181E1C]">
              ISO 14064-2 & GHG Protocol Aligned
            </div>
          </div>
        </div>

        {/* ── 1. PRIMARY HIERARCHY: BASELINE · CURRENT · REDUCTION · POTENTIAL CREDITABLE ── */}
        <div className="rounded-xl bg-[#0E1110] border border-[#242A27] overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-[#242A27]">
            {/* Metric 1: Baseline */}
            <div className="p-5 flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                  1. BASELINE EMISSIONS
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 mt-2">
                  6,754 <span className="text-xs font-normal text-zinc-400">tCO₂e/yr</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#181E1C] text-[10px] font-mono text-zinc-500">
                Days 1–30 baseline average
              </div>
            </div>

            {/* Metric 2: Current */}
            <div className="p-5 flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                  2. CURRENT EMISSIONS
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 mt-2">
                  6,626 <span className="text-xs font-normal text-zinc-400">tCO₂e/yr</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#181E1C] text-[10px] font-mono text-emerald-400">
                -1.9% facility gross variance
              </div>
            </div>

            {/* Metric 3: Measured Abatement Rate */}
            <div className="p-5 flex flex-col justify-between bg-[#141817]">
              <div>
                <div className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
                  3. MEASURED ABATEMENT
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-2">
                  -14.2 <span className="text-xs font-normal text-zinc-400">tCO₂e/day</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#242A27] text-[10px] font-mono text-zinc-300">
                5,183 t/year annualized run-rate
              </div>
            </div>

            {/* Metric 4: Potential Creditable Volume */}
            <div className="p-5 flex flex-col justify-between bg-[#080A09]">
              <div>
                <div className="text-[10px] uppercase font-semibold text-teal-400 tracking-wider">
                  4. POTENTIAL CREDITABLE
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-teal-300 mt-2">
                  5,183 <span className="text-xs font-normal text-zinc-400">tCO₂e</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#242A27] text-[10px] font-mono text-amber-400">
                Subject to 3rd-party methodology
              </div>
            </div>
          </div>
        </div>

        {/* Credibility Callout */}
        <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] text-xs flex items-start gap-2.5">
          <Info size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#929A95] leading-relaxed">
            <strong className="text-zinc-200">Emissions Reduction &ne; Automatic Carbon Credit: </strong>
            ONER estimates emissions reductions and MRV readiness based on real-time CEMS and operational telemetry. Actual carbon-credit issuance requires an applicable methodology (CDM, Verra VCS, or Article 6), additionality demonstration, and independent authorized verification.
          </p>
        </div>

        {/* ── 2. CASE IMPACT REPORTS (Connecting Cases to MRV) ──── */}
        <div className="p-5 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Audited Case Provenance
              </div>
              <h2 className="text-base font-semibold text-zinc-100 mt-0.5">
                Resolved Incident Environmental Impact Reports
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {resolvedWithReports.length} Reports with Verified MRV Dossiers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resolvedWithReports.map((rep) => {
              const impact = rep.environmental_impact_report!;
              return (
                <div
                  key={rep.id}
                  className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#A8C83A]">{rep.id}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {impact.mrv_pipeline.verification_status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-zinc-200">{rep.title}</h3>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      Source: {impact.likely_source} &bull; {impact.facility_name}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-xs p-2.5 rounded bg-[#0E1110] border border-[#181E1C]">
                    <div>
                      <div className="text-[9px] uppercase font-sans text-zinc-500">NOx Drop</div>
                      <div className="text-emerald-400 font-bold mt-0.5">-28.6 kg/d</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-sans text-zinc-500">CO₂e Abated</div>
                      <div className="text-[#A8C83A] font-bold mt-0.5">-14.2 t/d</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-sans text-zinc-500">Annualized</div>
                      <div className="text-zinc-200 font-bold mt-0.5">5,183 t/yr</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Confidence: {impact.mrv_pipeline.confidence_score}%
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImpactReport(impact);
                        setShowModal(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-[#A8C83A] hover:underline font-medium"
                    >
                      <span>Open MRV Audit Report</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. REDUCTION SOURCES & MRV READINESS AUDIT CHECKLIST ─ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Abatement Sources */}
          <div className="lg:col-span-5 p-5 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Portfolio Abatement Sources
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-[#080A09] border border-[#242A27]">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                  <span>Furnace F-101 Optimization</span>
                  <span className="font-mono text-[#A8C83A]">-5,183 tCO₂e/yr</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                  Combustion air-fuel stoichiometric trim and O2 loop recalibration.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#080A09] border border-[#242A27]">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                  <span>Renewable Electricity Procurement</span>
                  <span className="font-mono text-emerald-400">-1,325.6 tCO₂e/yr</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                  PPA / on-site solar coverage for 30% of total plant electrical load.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#080A09] border border-[#242A27]">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                  <span>Compressor Station Refurbishment</span>
                  <span className="font-mono text-emerald-400">-99.4 tCO₂e/yr</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                  Seal replacement and heat exchanger fouling remediation.
                </p>
              </div>
            </div>
          </div>

          {/* Right: MRV Readiness Checklist */}
          <div className="lg:col-span-7 p-5 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                MRV Readiness Audit Checklist
              </span>
              <span className="text-xs font-mono font-medium text-amber-400">
                Index: {data?.mrv_readiness?.overall_score || '50.5'} / 100
              </span>
            </div>

            <div className="space-y-1.5">
              {mrvComponents.map((c: any) => {
                const isReady = c.status === 'READY';
                const isPartial = c.status === 'PARTIAL';

                return (
                  <div key={c.component} className="p-2.5 rounded bg-[#080A09] border border-[#242A27] flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-200">{c.component}</span>
                        <span
                          className={`text-[8px] font-mono px-1.5 py-0.2 rounded border ${
                            isReady
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                              : isPartial
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                              : 'bg-red-500/10 text-red-400 border-red-500/25'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 truncate font-sans">{c.notes}</p>
                    </div>

                    <div className="text-xs font-mono font-medium text-zinc-300 flex-shrink-0">
                      {c.score}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Environmental Impact Report Modal ────────────────────── */}
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
