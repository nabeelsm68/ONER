'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  FileCheck2,
  TrendingDown,
  Info,
} from 'lucide-react';
import { api, GovernmentOverview, CommunityReport } from '@/lib/api';
import EnvironmentalImpactReportModal from '@/components/EnvironmentalImpactReportModal';

export default function GovernmentPage() {
  const [overview, setOverview] = useState<GovernmentOverview | null>(null);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [selectedCase, setSelectedCase] = useState<CommunityReport | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [showImpactModal, setShowImpactModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [govRes, repRes] = await Promise.all([
          api.getGovernmentOverview(),
          api.getCommunityReports(),
        ]);
        setOverview(govRes);
        setReports(repRes.reports || []);
        if (repRes.reports && repRes.reports.length > 0) {
          setSelectedCase(repRes.reports[0]);
        }
      } catch (err) {
        console.error('Failed to load government data:', err);
      }
    }
    loadData();
  }, []);

  const handleGovAction = async (actionType: string) => {
    if (!selectedCase) return;
    setLoadingAction(true);

    try {
      const updated = await api.takeGovernmentAction(
        selectedCase.id,
        actionType,
        actionNotes || undefined,
        'Dr. V. Prasad (Regional Environmental Officer)'
      );

      setSelectedCase(updated);
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setActionNotes('');
    } catch (err) {
      console.error('Government action error:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-[#F2F3EF]">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#202525]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#121515] border border-[#202525] text-xs font-medium text-zinc-300 mb-2">
            <ShieldCheck size={14} className="text-[#B7D83D]" />
            <span>State Environmental Regulatory Authority</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F2F3EF]">
              Environmental Command Center
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#121515] text-[#8D9490] border border-[#202525]">
              {overview?.region_name || 'Sector 4 Industrial Corridor'}
            </span>
          </div>
          <p className="text-xs text-[#8D9490] mt-1 max-w-2xl">
            Real-time multi-facility compliance surveillance, corroborated community intelligence, and auditable enforcement workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            PROTOTYPE REGULATORY WORKSPACE
          </span>
        </div>
      </div>

      {/* ── KPI Row: Regional Environmental Surveillance ─────────── */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-lg bg-[#0D0F0F] border border-[#202525]">
            <div className="text-[10px] uppercase font-sans text-zinc-500">Active Reports</div>
            <div className="text-xl font-mono font-bold text-zinc-100 mt-0.5">
              {overview.active_community_reports}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Total: {overview.total_reports}</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0D0F0F] border border-[#202525]">
            <div className="text-[10px] uppercase font-sans text-zinc-500">Corroborated</div>
            <div className="text-xl font-mono font-bold text-[#B7D83D] mt-0.5">
              {overview.corroborated_incidents}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Sensor-verified</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0D0F0F] border border-[#202525]">
            <div className="text-[10px] uppercase font-sans text-zinc-500">Facilities At Risk</div>
            <div className="text-xl font-mono font-bold text-amber-400 mt-0.5">
              {overview.facilities_at_risk}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Pact Clause 4.2</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0D0F0F] border border-[#202525]">
            <div className="text-[10px] uppercase font-sans text-zinc-500">Open Actions</div>
            <div className="text-xl font-mono font-bold text-teal-400 mt-0.5">
              {overview.open_corrective_actions}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">In engineering loop</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0D0F0F] border border-[#202525]">
            <div className="text-[10px] uppercase font-sans text-zinc-500">Pollution Hotspots</div>
            <div className="text-xl font-mono font-bold text-red-400 mt-0.5">
              {overview.pollution_hotspots}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Spatial clustering</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0D0F0F] border border-[#202525]">
            <div className="text-[10px] uppercase font-sans text-zinc-500">Emission Abatement</div>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
              +{overview.environmental_improvement_pct}%
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">30-day net recovery</div>
          </div>
        </div>
      )}

      {/* ── Regional Environmental Impact & MRV Abatement Strip ───── */}
      {overview && (
        <div className="p-4 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Measurable Regional Environmental Impact (Verified by ONER Sensors)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ISO 14064-2 MRV PIPELINE ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-2.5 rounded bg-[#080A09] border border-[#242A27]">
              <div className="text-[9px] uppercase font-sans text-zinc-500">NOx Abated (Corridor)</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">-28.6 kg/day</div>
              <div className="text-[9px] text-zinc-500 font-sans">Stack CEMS verified</div>
            </div>

            <div className="p-2.5 rounded bg-[#080A09] border border-[#242A27]">
              <div className="text-[9px] uppercase font-sans text-zinc-500">CO₂e Abatement Rate</div>
              <div className="text-base font-bold text-[#A8C83A] mt-0.5">-14.2 tCO₂e/day</div>
              <div className="text-[9px] text-zinc-500 font-sans">5,183 t/year annualized</div>
            </div>

            <div className="p-2.5 rounded bg-[#080A09] border border-[#242A27]">
              <div className="text-[9px] uppercase font-sans text-zinc-500">Water Circuit Recovery</div>
              <div className="text-base font-bold text-teal-400 mt-0.5">81.2% Closed-Loop</div>
              <div className="text-[9px] text-zinc-500 font-sans">Outfall DO normalized</div>
            </div>

            <div className="p-2.5 rounded bg-[#080A09] border border-[#242A27]">
              <div className="text-[9px] uppercase font-sans text-zinc-500">Resolved & Audited Cases</div>
              <div className="text-base font-bold text-zinc-100 mt-0.5">{overview.resolved_cases} Completed</div>
              <div className="text-[9px] text-zinc-500 font-sans">100% telemetry corroborated</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Regional Facilities Risk Register Table ─────────────── */}
      <div className="rounded-lg bg-[#0D0F0F] border border-[#202525] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-[#B7D83D]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Regional Facility Risk & Compliance Register
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">Continuous CEMS & Sensor Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#202525] text-[10px] uppercase tracking-wider text-zinc-500">
                <th className="pb-2">Facility Identifier</th>
                <th className="pb-2">Sector</th>
                <th className="pb-2">Health Score</th>
                <th className="pb-2">Pact Status</th>
                <th className="pb-2">Active Deviations</th>
                <th className="pb-2">Compliance Status</th>
                <th className="pb-2 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181d1a]">
              {overview?.facilities.map((fac) => {
                const isRisk = fac.risk_level === 'HIGH';
                const isWatch = fac.risk_level === 'MODERATE';

                return (
                  <tr key={fac.id} className="hover:bg-[#121515] transition-colors">
                    <td className="py-2.5 font-medium text-zinc-200">
                      <div>{fac.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{fac.id}</div>
                    </td>
                    <td className="py-2.5 text-zinc-400">{fac.sector}</td>
                    <td className="py-2.5 font-mono text-zinc-200">{fac.environmental_score} / 100</td>
                    <td className="py-2.5">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        {fac.pact_status}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-amber-400">{fac.primary_excess}</td>
                    <td className="py-2.5">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-semibold border ${
                          isRisk
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : isWatch
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {fac.compliance_status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <Link
                        href="/industry"
                        className="inline-flex items-center gap-1 text-[11px] text-[#B7D83D] hover:underline"
                      >
                        <span>Dossier</span>
                        <ArrowRight size={11} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Enforcement & Regulatory Case Workflow Surface ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Incidents Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200 block">
            Corroborated Regional Incidents
          </span>

          <div className="space-y-2">
            {reports.map((rep) => {
              const isSelected = selectedCase?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedCase(rep)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#151c17] border-[#B7D83D]/60 shadow-sm'
                      : 'bg-[#0D0F0F] hover:bg-[#121515] border-[#202525]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[11px] font-semibold text-zinc-300">{rep.id}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                      {rep.corroboration_score}% Match
                    </span>
                  </div>
                  <div className="text-xs font-medium text-zinc-200 line-clamp-1">{rep.title}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-1 flex items-center justify-between">
                    <span>{rep.correlated_facility}</span>
                    <span className="text-amber-400">{rep.severity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Regulatory Case Action Desk (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedCase ? (
            <div className="rounded-lg bg-[#0D0F0F] border border-[#202525] p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#202525]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-[#F2F3EF]">{selectedCase.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#121515] text-[#B7D83D] border border-[#B7D83D]/30">
                      REGULATORY CASE
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-200 mt-1">{selectedCase.title}</h3>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    Target Facility: {selectedCase.correlated_facility} ({selectedCase.likely_source})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-zinc-400 font-mono">Enforcement Officer</div>
                  <div className="text-xs font-semibold text-zinc-200 mt-0.5">
                    {selectedCase.government_status.officer}
                  </div>
                </div>
              </div>

              {/* Regulatory Findings & Evidence Checklist */}
              {/* Regulatory Findings & Evidence Checklist */}
              <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-sans text-zinc-400 font-semibold block">
                    Auditable Sensor Evidence Base
                  </span>
                  {selectedCase.environmental_impact_report && (
                    <button
                      type="button"
                      onClick={() => setShowImpactModal(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141817] hover:bg-[#1a201e] border border-[#242A27] text-xs font-semibold text-[#A8C83A] transition-colors"
                    >
                      <FileCheck2 size={13} />
                      <span>View Environmental Impact Report (MRV)</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1 text-[11px] text-zinc-300">
                    <div>• Citizen Optical Evidence: GPS captured with user consent ({selectedCase.latitude}°N, {selectedCase.longitude}°E)</div>
                    <div>• Telemetry Drift: {Object.entries(selectedCase.telemetry_deviations).map(([k, v]) => `${k.toUpperCase()} (${v})`).join(', ')}</div>
                    <div>• Automated ML Causal Mapping: {selectedCase.root_cause}</div>
                  </div>
                  <div className="p-2 rounded bg-[#0E1110] border border-[#242A27] font-mono text-[11px]">
                    <div className="text-[10px] text-zinc-500 uppercase font-sans">Current Industry Response:</div>
                    <div className="text-emerald-400 mt-1">{selectedCase.industry_response.action_taken}</div>
                    <div className="text-zinc-500 text-[10px] mt-1">Engineer: {selectedCase.industry_response.engineer}</div>
                  </div>
                </div>
              </div>

              {/* Government Action Bar */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200 block">
                  Execute Regulatory Action
                </span>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleGovAction('REQUEST_INFO')}
                    disabled={loadingAction}
                    className="px-3 py-1.5 rounded bg-[#141817] hover:bg-[#1a201e] border border-[#242A27] text-xs text-zinc-200 transition-colors disabled:opacity-40"
                  >
                    Request Information
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGovAction('REQUEST_INSPECTION')}
                    disabled={loadingAction}
                    className="px-3 py-1.5 rounded bg-[#141817] hover:bg-[#1a201e] border border-[#242A27] text-xs text-amber-300 transition-colors disabled:opacity-40"
                  >
                    Request Physical Inspection
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGovAction('MANDATE_ACTION')}
                    disabled={loadingAction}
                    className="px-3.5 py-1.5 rounded bg-[#181e18] hover:bg-[#202a20] border border-[#A8C83A]/60 text-xs font-semibold text-white transition-all disabled:opacity-40"
                  >
                    Mandate 24-hr Corrective Action
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGovAction('ESCALATE')}
                    disabled={loadingAction}
                    className="px-3 py-1.5 rounded bg-red-950/20 hover:bg-red-950/40 border border-red-500/40 text-xs text-red-300 transition-colors disabled:opacity-40"
                  >
                    Escalate Case
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGovAction('CLOSE')}
                    disabled={loadingAction}
                    className="ml-auto px-4 py-1.5 rounded bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/40 text-xs font-bold text-emerald-300 transition-colors disabled:opacity-40"
                  >
                    Audit & Close Case
                  </button>
                </div>
              </div>

              {/* Auditable Event Trail */}
              <div className="space-y-2 pt-2 border-t border-[#242A27]">
                <span className="text-[10px] uppercase font-sans text-zinc-500 font-semibold block">
                  Regulatory Audit Event Log
                </span>
                <div className="space-y-1 font-mono text-[11px] max-h-36 overflow-y-auto custom-scrollbar">
                  {selectedCase.audit_trail.map((ev, i) => (
                    <div key={i} className="flex items-start gap-2 p-1.5 rounded bg-[#080A09] text-zinc-400">
                      <span className="text-zinc-600">{ev.time}</span>
                      <span className="text-teal-400 font-medium min-w-[130px]">{ev.actor}:</span>
                      <span className="text-zinc-300">{ev.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-[#0E1110] border border-[#242A27] p-12 text-center text-zinc-500">
              Select an incident from the registry to inspect regulatory actions.
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
