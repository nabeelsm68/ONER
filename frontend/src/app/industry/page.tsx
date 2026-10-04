'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
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
  TrendingDown,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { api, CommunityReport, EnvironmentalPact } from '@/lib/api';
import EnvironmentalImpactReport from '@/components/EnvironmentalImpactReport';
import EnvironmentalImpactReportModal from '@/components/EnvironmentalImpactReportModal';
import EvidenceTrustLayer from '@/components/EvidenceTrustLayer';

function IndustryPortalContent() {
  const searchParams = useSearchParams();
  const initialCaseId = searchParams.get('case');

  const [pact, setPact] = useState<EnvironmentalPact | null>(null);
  const [cases, setCases] = useState<CommunityReport[]>([]);
  const [selectedCase, setSelectedCase] = useState<CommunityReport | null>(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
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
        setSelectedCase((prev) => prev || casesRes.cases[0]);
      }
    } catch (err) {
      console.error('Failed to load industry data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
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

      setSelectedCase(updated);
      setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      console.error('Action error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const isResolved = selectedCase?.status === 'RESOLVED';

  return (
    <AppLayout
      title="Facility Operations"
      subtitle="Orion Refining Complex · Industrial Environmental Workspace"
      onRefresh={loadData}
      isRefreshing={isRefreshing}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12 text-[#F1F3EE]">
        {/* ── 1. FACILITY ENVIRONMENTAL PERFORMANCE (Section 21) ── */}
        <div className="p-5 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242A27]">
            <div>
              <div className="text-[10px] font-mono text-[#A8C83A] uppercase font-bold tracking-wider">
                FACILITY ENVIRONMENTAL PERFORMANCE &bull; ORION REFINING COMPLEX
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EE] mt-0.5">
                Operational Environmental Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                COMPLIANCE: AT RISK
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                PACT: ACTIVE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Environmental Health */}
            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27]">
              <div className="text-[10px] uppercase font-sans text-[#929A95]">Environmental Health</div>
              <div className="text-2xl font-mono font-bold text-[#A8C83A] mt-1">87.3</div>
              <div className="text-[10px] text-[#626A65] font-mono mt-0.5">Out of 100 max</div>
            </div>

            {/* Compliance */}
            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27]">
              <div className="text-[10px] uppercase font-sans text-[#929A95]">Compliance State</div>
              <div className="text-xl font-mono font-bold text-amber-400 mt-1">AT RISK</div>
              <div className="text-[10px] text-[#626A65] font-mono mt-0.5">NOx +31.4% (Stack 4B)</div>
            </div>

            {/* CO₂e Reduction */}
            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27]">
              <div className="text-[10px] uppercase font-sans text-[#929A95]">CO₂e Reduction</div>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-1">↓ 14.2 t/day</div>
              <div className="text-[10px] text-[#626A65] font-mono mt-0.5">5,183 t/year annualized</div>
            </div>

            {/* Energy Savings */}
            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27]">
              <div className="text-[10px] uppercase font-sans text-[#929A95]">Thermal / Energy Recovery</div>
              <div className="text-xl font-mono font-bold text-teal-400 mt-1">+2.45%</div>
              <div className="text-[10px] text-[#626A65] font-mono mt-0.5">Stoichiometric balance</div>
            </div>
          </div>
        </div>

        {/* ── Tripartite Pact Parameters Strip ─────────────────── */}
        {pact && (
          <div id="pact" className="p-4 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#181E1C]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#A8C83A]" />
                <span className="font-bold text-zinc-200 uppercase font-sans text-xs">
                  Tripartite Environmental Pact (Clause 4.2 Framework)
                </span>
              </div>
              <div className="text-[10px] font-mono text-[#929A95]">
                Monthly Penalty Accrual: <strong className="text-amber-400">₹{pact.illustrative_financial_model.excess_penalty_monthly_inr.toLocaleString()}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {pact.monitored_parameters.map((p) => {
                const isBreach = p.status === 'BREACH';
                const isWarning = p.status === 'WARNING';
                return (
                  <div
                    key={p.code}
                    className={`p-2 rounded border text-xs ${
                      isBreach
                        ? 'bg-red-500/10 border-red-500/30 text-red-300'
                        : isWarning
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-[#080A09] border-[#242A27] text-zinc-300'
                    }`}
                  >
                    <div className="flex justify-between text-[10px]">
                      <span className="font-bold">{p.code}</span>
                      <span className="font-mono text-[9px]">{p.status}</span>
                    </div>
                    <div className="font-mono font-bold text-sm mt-1">{p.current}</div>
                    <div className="text-[9px] text-zinc-400 font-mono mt-0.5">Limit: {p.threshold}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 2. COMMUNITY CASE (Evidence · Corroboration · Root Cause) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Case Selector (4 cols) */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Community Incident Queue
              </span>
              <span className="text-[10px] font-mono text-[#A8C83A]">
                {cases.length} INCIDENTS
              </span>
            </div>

            <div className="space-y-2">
              {cases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCase(c);
                      setSimulationActive(false);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#141817] border-[#A8C83A]/60 shadow-sm'
                        : 'bg-[#080A09] hover:bg-[#121515] border-[#242A27]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-zinc-200">{c.id}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30">
                        {c.corroboration_score}% MATCH
                      </span>
                    </div>
                    <div className="text-xs font-medium text-zinc-300 truncate">{c.title}</div>
                    <div className="text-[10px] text-[#929A95] font-mono mt-1 flex justify-between">
                      <span>{c.category}</span>
                      <span>{c.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Case Intelligence Dossier (8 cols) */}
          <div className="lg:col-span-8 p-5 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-4">
            {selectedCase ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#242A27]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-[#A8C83A]">{selectedCase.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        CORROBORATION SCORE: {selectedCase.corroboration_score}%
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#F1F3EE] mt-1">{selectedCase.title}</h3>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-[10px] text-[#929A95] uppercase font-sans">Assigned Engineer</span>
                    <div className="font-mono text-zinc-200">{selectedCase.industry_response.engineer || 'M. Rao'}</div>
                  </div>
                </div>

                {/* Evidence & Root Cause Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Evidence Summary */}
                  <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-2">
                    <div className="text-[10px] uppercase font-sans font-bold text-zinc-400">
                      Community Evidence
                    </div>
                    <p className="text-[11px] text-zinc-300 italic">
                      &quot;{selectedCase.description}&quot;
                    </p>
                    <div className="space-y-1 font-mono text-[10px] text-[#929A95] pt-1 border-t border-[#181E1C]">
                      <div>Location: {selectedCase.location_name}</div>
                      <div>Timestamp: {selectedCase.timestamp_formatted}</div>
                      <div>GPS Precision: ±{selectedCase.accuracy_meters}m</div>
                    </div>
                  </div>

                  {/* Root Cause Diagnosis */}
                  <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-2">
                    <div className="text-[10px] uppercase font-sans font-bold text-amber-400">
                      ONER Diagnostic Root Cause
                    </div>
                    <div className="text-[11px] text-zinc-200 font-medium">
                      {selectedCase.root_cause}
                    </div>
                    <div className="space-y-1 font-mono text-[10px] pt-1 border-t border-[#181E1C]">
                      <div className="text-[#929A95] font-sans">Correlated Deviations:</div>
                      {Object.entries(selectedCase.telemetry_deviations).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-zinc-500 uppercase">{k}:</span>
                          <span className="text-amber-400 font-bold">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Evidence Trust Layer for the Case */}
                <EvidenceTrustLayer
                  reportId={selectedCase.id}
                  hasPhoto={true}
                  photoQuality="HIGH"
                  hasGps={true}
                  facilityProximity="380m from Furnace Stack"
                  overallQuality="HIGH"
                />

                {/* ── 3. ENGINEERING RESPONSE (Section 21) ───────── */}
                <div className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                        Engineering Response
                      </div>
                      <div className="text-[10px] text-[#929A95]">
                        Recommended Action: <strong className="text-zinc-200">{selectedCase.recommended_action}</strong>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-zinc-300 border border-[#242A27]">
                      STATUS: {selectedCase.industry_response.status}
                    </span>
                  </div>

                  {/* Simulation Toggle */}
                  {simulationActive && (
                    <div className="p-3 rounded bg-[#0E1110] border border-[#A8C83A]/30 space-y-2 text-xs font-mono">
                      <div className="text-[10px] uppercase font-sans font-bold text-[#A8C83A]">
                        Intervention Simulation Model (Damper Trim 1.042)
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded bg-[#080A09] border border-red-500/20">
                          <div className="text-zinc-400 font-sans text-[10px]">Do Nothing Baseline</div>
                          <div className="text-red-400 font-bold mt-1">NOx: 131.4 mg/Nm³ (+31.4%)</div>
                          <div className="text-zinc-500 text-[10px]">Penalty risk: ₹4,85,000/mo</div>
                        </div>
                        <div className="p-2 rounded bg-[#080A09] border border-emerald-500/20">
                          <div className="text-zinc-400 font-sans text-[10px]">With Damper Trim 1.042</div>
                          <div className="text-emerald-400 font-bold mt-1">NOx: 88.5 mg/Nm³ (-28.6 kg/d)</div>
                          <div className="text-emerald-400 text-[10px]">CO₂e drop: 14.2 t/day</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#181E1C]">
                    <button
                      type="button"
                      onClick={() => handleAction('ACKNOWLEDGE')}
                      disabled={actionLoading || selectedCase.status !== 'TRIAGING'}
                      className="px-3 py-1.5 rounded bg-[#141817] hover:bg-[#1a221f] border border-[#242A27] text-xs font-medium text-zinc-300 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      {selectedCase.status === 'TRIAGING' ? 'Acknowledge Case' : '✓ Acknowledged'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimulationActive(!simulationActive)}
                      className="px-3 py-1.5 rounded bg-[#141817] hover:bg-[#1a221f] border border-[#242A27] text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
                    >
                      {simulationActive ? 'Hide Simulation' : 'Run Intervention Sim'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleAction(
                          'CORRECTIVE_ACTION',
                          'Executing damper trim recalibration to 1.042. Air-fuel stoichiometric loop normalized.'
                        )
                      }
                      disabled={actionLoading || isResolved}
                      className="px-3.5 py-1.5 rounded bg-[#141817] hover:bg-[#1a221f] border border-[#A8C83A]/50 text-xs font-mono font-bold text-[#A8C83A] transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Apply Damper Trim (1.042)
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleAction(
                          'RESOLVE',
                          'Combustion setpoint normalized. CEMS confirms NOx returned to 88.5 mg/Nm³.'
                        )
                      }
                      disabled={actionLoading || isResolved}
                      className="ml-auto px-4 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-300 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      {isResolved ? '✓ Case Resolved' : 'Mark Resolved & Verify'}
                    </button>
                  </div>
                </div>

                {/* ── 4. MEASURED RESULT (Before · After · Reduction) ── */}
                <div className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                      Measured Result & Telemetry Comparison
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      CEMS VERIFIED
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    <div className="p-2.5 rounded bg-[#0E1110] border border-red-500/20">
                      <div className="text-[9px] uppercase font-sans text-zinc-500">Before</div>
                      <div className="text-sm font-bold text-red-400 mt-0.5">131.4 mg/Nm³</div>
                      <div className="text-[9px] text-zinc-500 font-sans">NOx breach (+31.4%)</div>
                    </div>

                    <div className="p-2.5 rounded bg-[#0E1110] border border-[#A8C83A]/30">
                      <div className="text-[9px] uppercase font-sans text-zinc-500">Action</div>
                      <div className="text-sm font-bold text-[#A8C83A] mt-0.5">Trim 1.042</div>
                      <div className="text-[9px] text-zinc-500 font-sans">Stoichiometric reset</div>
                    </div>

                    <div className="p-2.5 rounded bg-[#0E1110] border border-emerald-500/20">
                      <div className="text-[9px] uppercase font-sans text-zinc-500">After</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">88.5 mg/Nm³</div>
                      <div className="text-[9px] text-zinc-500 font-sans">↓ 28.6 kg/day drop</div>
                    </div>
                  </div>
                </div>

                {/* ── 5. MRV & POTENTIAL CREDITABLE REDUCTION (Section 21) ── */}
                {selectedCase.environmental_impact_report && (
                  <div className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                          MRV & Potential Creditable Reduction
                        </span>
                        <div className="text-[10px] text-[#929A95]">
                          Narrative: PROBLEM → CAUSE → ACTION → RESULT → VALUE
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowImpactModal(true)}
                        className="px-3 py-1.5 rounded bg-[#141817] hover:bg-[#1a221f] border border-[#A8C83A]/40 text-xs font-mono text-[#A8C83A] font-bold transition-colors cursor-pointer"
                      >
                        Inspect Full MRV Report
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                      <div className="p-2 rounded bg-[#0E1110] border border-[#181E1C]">
                        <div className="text-[9px] uppercase font-sans text-zinc-500">Daily Abatement</div>
                        <div className="text-sm font-bold text-emerald-400 mt-0.5">-14.2 tCO₂e</div>
                      </div>
                      <div className="p-2 rounded bg-[#0E1110] border border-[#181E1C]">
                        <div className="text-[9px] uppercase font-sans text-zinc-500">Annualized Volume</div>
                        <div className="text-sm font-bold text-[#A8C83A] mt-0.5">5,183 t/year</div>
                      </div>
                      <div className="p-2 rounded bg-[#0E1110] border border-[#181E1C]">
                        <div className="text-[9px] uppercase font-sans text-zinc-500">Potential Creditable</div>
                        <div className="text-sm font-bold text-zinc-200 mt-0.5">5,183 tCO₂e</div>
                      </div>
                      <div className="p-2 rounded bg-[#0E1110] border border-[#181E1C]">
                        <div className="text-[9px] uppercase font-sans text-zinc-500">MRV Status</div>
                        <div className="text-sm font-bold text-amber-300 mt-0.5">AUDIT PENDING</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded bg-[#0E1110] border border-[#181E1C] text-[11px] text-[#929A95]">
                      <Info size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-zinc-300">Methodology Disclaimer: </strong>
                        ONER estimates emissions reductions and MRV readiness. Actual carbon-credit issuance requires an applicable methodology, eligibility assessment and independent verification.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500 font-mono text-xs">
                Select a case from the incident queue to inspect the engineering dossier.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedCase?.environmental_impact_report && (
        <EnvironmentalImpactReportModal
          report={selectedCase.environmental_impact_report}
          isOpen={showImpactModal}
          onClose={() => setShowImpactModal(false)}
        />
      )}
    </AppLayout>
  );
}

export default function IndustryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-500 font-mono">Loading Industry Operations...</div>}>
      <IndustryPortalContent />
    </Suspense>
  );
}
