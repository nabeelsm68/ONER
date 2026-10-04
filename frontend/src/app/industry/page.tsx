'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Factory,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  SlidersHorizontal,
  ArrowRight,
  Zap,
  Play,
  Check,
  Info,
} from 'lucide-react';
import { api, CommunityReport, EnvironmentalPact } from '@/lib/api';
import EnvironmentalImpactReportModal from '@/components/EnvironmentalImpactReportModal';

function IndustryPortalContent() {
  const searchParams = useSearchParams();
  const initialCaseId = searchParams.get('case');

  const [pact, setPact] = useState<EnvironmentalPact | null>(null);
  const [cases, setCases] = useState<CommunityReport[]>([]);
  const [selectedCase, setSelectedCase] = useState<CommunityReport | null>(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showImpactModal, setShowImpactModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [pactRes, casesRes] = await Promise.all([
          api.getPact(),
          api.getIndustryCases(),
        ]);
        setPact(pactRes);
        setCases(casesRes.cases || []);

        if (initialCaseId) {
          const match = casesRes.cases?.find((c: CommunityReport) => c.id === initialCaseId);
          if (match) setSelectedCase(match);
        } else if (casesRes.cases?.length > 0) {
          setSelectedCase(casesRes.cases[0]);
        }
      } catch (err) {
        console.error('Failed to load industry data:', err);
      }
    }
    loadData();
  }, [initialCaseId]);

  const handleAction = async (actionType: string, notes?: string) => {
    if (!selectedCase) return;
    setActionLoading(true);

    try {
      const updated = await api.takeIndustryAction(
        selectedCase.id,
        actionType,
        notes,
        'M. Rao (Chief Combustion Engineer)'
      );

      // Update state
      setSelectedCase(updated);
      setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      console.error('Action error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-[#F2F3EF]">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#202525]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#121515] border border-[#202525] text-xs font-medium text-teal-400 mb-2">
            <Factory size={14} />
            <span>Industrial Operations & Accountability Workspace</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F2F3EF]">
              Orion Refining Complex
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
              COMPLIANCE: AT RISK
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
              PACT: ACTIVE
            </span>
          </div>
          <p className="text-xs text-[#8D9490] mt-1 max-w-2xl">
            Correlated community incident dispatch, continuous emissions pact tracking, and model-predictive setpoint intervention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/simulator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#121515] hover:bg-[#181d1b] border border-[#202525] text-xs text-zinc-300 transition-colors"
          >
            <SlidersHorizontal size={13} />
            <span>Full Simulator</span>
          </Link>
          <Link
            href="/carbon"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#121515] hover:bg-[#181d1b] border border-[#202525] text-xs text-zinc-300 transition-colors"
          >
            <FileCheck2 size={13} />
            <span>MRV Audit</span>
          </Link>
        </div>
      </div>

      {/* ── Section 1: The Environmental Pact Dashboard ─────────── */}
      {pact && (
        <div className="rounded-lg bg-[#0D0F0F] border border-[#202525] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#202525]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#B7D83D]" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Tripartite Environmental Pact (Clause 4.2 Accountability Framework)
                </span>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Signatories: Orion Energy • Pollution Control Board • Sector 4 Civic Committee
                </div>
              </div>
            </div>

            {/* Financial Model Callout */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-[9px] uppercase font-sans text-amber-500/90 block">Potential Excess Penalty</span>
                <span className="text-amber-400 font-bold">
                  ₹{pact.illustrative_financial_model.excess_penalty_monthly_inr.toLocaleString()} / mo
                </span>
              </div>
              <div className="border-l border-[#202525] pl-4">
                <span className="text-[9px] uppercase font-sans text-emerald-400 block">Compliance + Efficiency Upside</span>
                <span className="text-emerald-400 font-bold">
                  ₹{pact.illustrative_financial_model.net_monthly_opportunity_inr.toLocaleString()} / mo
                </span>
              </div>
            </div>
          </div>

          {/* Monitored Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {pact.monitored_parameters.map((param) => {
              const isBreach = param.status === 'BREACH';
              const isWarning = param.status === 'WARNING';

              return (
                <div
                  key={param.code}
                  className={`p-2.5 rounded border ${
                    isBreach
                      ? 'bg-red-950/20 border-red-500/40 text-red-300'
                      : isWarning
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                      : 'bg-[#080909] border-[#202525] text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-sans">
                    <span className="font-semibold">{param.code}</span>
                    <span
                      className={`text-[8px] font-mono px-1 rounded ${
                        isBreach ? 'bg-red-500/20 text-red-300' : isWarning ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-500'
                      }`}
                    >
                      {param.status}
                    </span>
                  </div>
                  <div className="font-mono text-base font-bold mt-1 text-zinc-100">
                    {param.current}
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 mt-0.5">
                    <span>Limit: {param.threshold}</span>
                    <span className={param.excess_pct > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {param.excess_pct > 0 ? `+${param.excess_pct}%` : `${param.excess_pct}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-zinc-500 font-mono italic">
            * {pact.illustrative_financial_model.note}
          </div>
        </div>
      )}

      {/* ── Section 2: Open Community Cases & Investigation ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Community Case Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Community Incident Queue ({cases.filter((c) => c.status !== 'RESOLVED').length} Active)
            </span>
          </div>

          <div className="space-y-2">
            {cases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              const isResolved = c.status === 'RESOLVED';

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCase(c);
                    setSimulationActive(false);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#151c17] border-[#B7D83D]/60 shadow-sm'
                      : 'bg-[#0D0F0F] hover:bg-[#121515] border-[#202525]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[11px] font-semibold text-zinc-300">{c.id}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                        isResolved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                      }`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-zinc-200 line-clamp-1">{c.title}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-1 flex items-center justify-between">
                    <span>{c.timestamp_formatted}</span>
                    <span className="text-emerald-400">{c.corroboration_score}% match</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Case Dossier & Intervention Actions (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedCase ? (
            <div className="rounded-lg bg-[#0D0F0F] border border-[#202525] p-5 space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#202525]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-[#F2F3EF]">{selectedCase.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      CORROBORATED: {selectedCase.corroboration_score}%
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-200 mt-1">{selectedCase.title}</h3>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    Location: {selectedCase.location_name} ({selectedCase.latitude}°N, {selectedCase.longitude}°E)
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-zinc-400 font-mono">Assigned Engineer</div>
                  <div className="text-xs font-semibold text-zinc-200 mt-0.5">
                    {selectedCase.industry_response.engineer || 'Unassigned'}
                  </div>
                </div>
              </div>

              {/* Citizen Evidence & Telemetry Correlation Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Left: Citizen Evidence Card */}
                <div className="p-3.5 rounded bg-[#080909] border border-[#202525] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-sans text-zinc-400 font-semibold">
                      Citizen Evidence Stamp
                    </span>
                    <span className="text-[9px] font-mono text-[#B7D83D]">GPS AUTHENTICATED</span>
                  </div>
                  <div className="aspect-[16/9] rounded overflow-hidden bg-black/60 border border-[#1b251e] flex items-center justify-center p-2 text-center text-zinc-400 text-[10px]">
                    <div className="space-y-1">
                      <div className="font-mono text-zinc-300 font-bold">CASE: {selectedCase.id}</div>
                      <div>GPS: {selectedCase.latitude}°N, {selectedCase.longitude}°E</div>
                      <div>TIMESTAMP: {selectedCase.timestamp_formatted}</div>
                      <div className="text-emerald-400 font-mono">OPTICAL DENSITY DEVIATION DETECTED</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-300 italic">&quot;{selectedCase.description}&quot;</p>
                </div>

                {/* Right: Plant Telemetry & Diagnostic Root Cause */}
                <div className="p-3.5 rounded bg-[#080909] border border-[#202525] space-y-2">
                  <span className="text-[10px] uppercase font-sans text-zinc-400 font-semibold block">
                    Plant Telemetry & Anomaly Analysis
                  </span>
                  <div className="p-2 rounded bg-[#0D0F0F] border border-[#1c241f] space-y-1 font-mono text-[11px]">
                    <div className="text-zinc-400 font-sans text-[10px]">Correlated Deviations:</div>
                    {Object.entries(selectedCase.telemetry_deviations).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-zinc-500 uppercase">{k}:</span>
                        <span className="text-amber-400 font-bold">{v}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-sans text-zinc-500 block">Likely Source</span>
                    <div className="text-xs font-semibold text-zinc-200">{selectedCase.likely_source}</div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-sans text-zinc-500 block">Root Cause Diagnosis</span>
                    <div className="text-[11px] text-zinc-300">{selectedCase.root_cause}</div>
                  </div>
                </div>
              </div>

              {/* ── Intervention Simulation Comparison (Do Nothing vs Intervention) ── */}
              {simulationActive && (
                <div className="p-4 rounded-lg bg-[#0e1611] border border-[#1e3022] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Zap size={14} />
                      Model-Predictive Intervention Simulation
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">Damper Trim 1.042 Model</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded bg-[#080909] border border-[#202525] space-y-1">
                      <div className="text-[10px] uppercase font-sans text-zinc-500 font-semibold">Scenario: Do Nothing</div>
                      <div className="text-red-400 font-bold">NOx: 131.4 mg/Nm³ (+31.4% excess)</div>
                      <div className="text-zinc-400">Potential penalty: ₹4,85,000 / mo</div>
                      <div className="text-zinc-500">Unburnt fuel loss: ₹8,20,000 / mo</div>
                    </div>

                    <div className="p-3 rounded bg-[#101a13] border border-[#1f3323] space-y-1">
                      <div className="text-[10px] uppercase font-sans text-emerald-400 font-semibold">
                        Scenario: ONER Damper Trim (1.042)
                      </div>
                      <div className="text-emerald-400 font-bold">NOx: 88.5 mg/Nm³ (-28.6 kg/day drop)</div>
                      <div className="text-zinc-300">CO2 Abated: 14.2 tonnes/day</div>
                      <div className="text-emerald-300">Pact Compliance Incentive Unlocked</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Industrial Action Buttons ───────────────────────── */}
              <div className="pt-2 border-t border-[#202525] flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAction('ACKNOWLEDGE')}
                  disabled={actionLoading || selectedCase.status !== 'TRIAGING'}
                  className="px-3 py-1.5 rounded bg-[#121515] hover:bg-[#181d1b] border border-[#202525] text-xs font-medium text-zinc-200 transition-colors disabled:opacity-40"
                >
                  {selectedCase.status === 'TRIAGING' ? 'Acknowledge Case' : '✓ Acknowledged'}
                </button>

                <button
                  type="button"
                  onClick={() => setSimulationActive(!simulationActive)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                    simulationActive
                      ? 'bg-[#1b271d] text-[#B7D83D] border-[#B7D83D]/40'
                      : 'bg-[#121515] text-zinc-300 border-[#202525] hover:bg-[#181d1b]'
                  }`}
                >
                  <Play size={12} />
                  <span>{simulationActive ? 'Hide Simulation' : 'Run Intervention Sim'}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleAction(
                      'CORRECTIVE_ACTION',
                      'Damper trim recalibrated to 1.042; O2 trim loop reset. Work order dispatched.'
                    )
                  }
                  disabled={actionLoading || selectedCase.status === 'RESOLVED'}
                  className="px-3.5 py-1.5 rounded bg-[#152218] hover:bg-[#1a2c1f] border border-[#B7D83D]/50 text-xs font-semibold text-white transition-all disabled:opacity-40"
                >
                  Apply Damper Trim (1.042)
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleAction(
                      'RESOLVE',
                      'CEMS confirmation: NOx normalized to 88.5 mg/Nm³. Thermal balance restored.'
                    )
                  }
                  disabled={actionLoading || selectedCase.status === 'RESOLVED'}
                  className="ml-auto px-4 py-1.5 rounded bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/50 text-xs font-bold text-emerald-300 transition-all disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Check size={13} />
                  <span>{selectedCase.status === 'RESOLVED' ? 'Case Resolved' : 'Mark Resolved'}</span>
                </button>
              </div>

              {/* ── Environmental Performance Result (Comply, Optimize, Save) ── */}
              <div className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                      Environmental Performance Result
                    </span>
                  </div>
                  {selectedCase.environmental_impact_report && (
                    <button
                      type="button"
                      onClick={() => setShowImpactModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141817] hover:bg-[#1a201e] border border-[#242A27] text-xs font-semibold text-[#A8C83A] transition-colors"
                    >
                      <FileCheck2 size={13} />
                      <span>View Environmental Impact Report (MRV)</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27]">
                    <div className="text-[9px] uppercase font-sans text-zinc-500">NOx Reduction</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">-28.6 kg/day</div>
                    <div className="text-[9px] text-zinc-500 font-sans">Stack CEMS verified</div>
                  </div>

                  <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27]">
                    <div className="text-[9px] uppercase font-sans text-zinc-500">CO₂e Abatement</div>
                    <div className="text-sm font-bold text-[#A8C83A] mt-0.5">-14.2 t/day</div>
                    <div className="text-[9px] text-zinc-500 font-sans">5,183 t/year annualized</div>
                  </div>

                  <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27]">
                    <div className="text-[9px] uppercase font-sans text-zinc-500">Thermal Efficiency</div>
                    <div className="text-sm font-bold text-teal-400 mt-0.5">+2.45% recovery</div>
                    <div className="text-[9px] text-zinc-500 font-sans">Fuel loss mitigated</div>
                  </div>

                  <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27]">
                    <div className="text-[9px] uppercase font-sans text-zinc-500">Pact Compliance</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">RESTORED</div>
                    <div className="text-[9px] text-zinc-500 font-sans">Penalty avoided</div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27] text-[11px] text-zinc-400 flex items-start gap-2">
                  <Info size={13} className="text-[#A8C83A] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-zinc-300">MRV Readiness: </strong>
                    Digital abatement evidence logged for ISO 14064-2 compliance. Potential creditable reduction volume: 5,183 tCO₂e / year (subject to methodology + verification).
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-[#0E1110] border border-[#242A27] p-12 text-center text-zinc-500">
              Select a community case to view the industrial evidence dossier.
            </div>
          )}
        </div>
      </div>

      {/* ── Environmental Impact Report Modal ────────────────────── */}
      {selectedCase?.environmental_impact_report && (
        <EnvironmentalImpactReportModal
          report={selectedCase.environmental_impact_report}
          isOpen={showImpactModal}
          onClose={() => setShowImpactModal(false)}
        />
      )}
    </div>
  );
}

export default function IndustryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-500 font-mono">Loading Industry Workspace...</div>}>
      <IndustryPortalContent />
    </Suspense>
  );
}
