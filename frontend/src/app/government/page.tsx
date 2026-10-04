'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  FileCheck2,
  TrendingDown,
  Info,
  Scale,
  Activity,
  Droplets,
  Wind,
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [govRes, repRes] = await Promise.all([
        api.getGovernmentOverview(),
        api.getCommunityReports(),
      ]);
      setOverview(govRes);
      setReports(repRes.reports || []);
      if (repRes.reports && repRes.reports.length > 0) {
        setSelectedCase((prev) => prev || repRes.reports[0]);
      }
    } catch (err) {
      console.error('Failed to load government data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
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
    <AppLayout
      title="Command Center"
      subtitle="State Environmental Regulatory Authority · Sector 4 Industrial Corridor"
      onRefresh={loadData}
      isRefreshing={isRefreshing}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12 text-[#F1F3EE]">
        {/* ── TOP: ENVIRONMENTAL COMMAND CENTER (Section 22) ───── */}
        <div className="p-5 rounded-xl bg-[#0E1110] border border-[#242A27] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono text-[#A8C83A] uppercase font-bold tracking-wider">
              REGIONAL OVERSIGHT & ENFORCEMENT &bull; INDUSTRIAL SECTOR 4
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EE] mt-0.5">
              Environmental Command Center
            </h1>
            <p className="text-xs text-[#929A95] mt-0.5">
              Autonomous multi-facility compliance surveillance, corroborated community intelligence, and auditable enforcement workflows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30 font-bold">
              ILLUSTRATIVE POLICY MODEL
            </span>
          </div>
        </div>

        {/* ── 6 EXACT KPIS (Section 22) ────────────────────────── */}
        {overview && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Active Incidents */}
            <div className="p-3.5 rounded-lg bg-[#0E1110] border border-[#242A27]">
              <div className="text-[10px] uppercase font-sans text-[#929A95]">Active Incidents</div>
              <div className="text-2xl font-mono font-bold text-zinc-100 mt-1">
                {overview.active_community_reports}
              </div>
              <div className="text-[10px] text-[#626A65] font-mono mt-0.5">Of {overview.total_reports} filed</div>
            </div>

            {/* 2. Corroborated */}
            <div className="p-3.5 rounded-lg bg-[#0E1110] border border-[#242A27]">
              <div className="text-[10px] uppercase font-sans text-[#929A95]">Corroborated</div>
              <div className="text-2xl font-mono font-bold text-[#A8C83A] mt-1">
                {overview.corroborated_incidents}
              </div>
              <div className="text-[10px] text-[#626A65] font-mono mt-0.5">Physical sensor match</div>
            </div>

            {/* 3. Facilities At Risk */}
            <div className="p-3.5 rounded-lg bg-[#0E1110] border border-[#242A27]">
              <div className="text-[10px] uppercase font-sans text-[#929A95]">Facilities At Risk</div>
              <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
                {overview.facilities_at_risk}
              </div>
              <div className="text-[10px] text-[#626A65] font-mono mt-0.5">Pact clause 4.2 review</div>
            </div>

            {/* 4. Open Actions */}
            <div className="p-3.5 rounded-lg bg-[#0E1110] border border-[#242A27]">
              <div className="text-[10px] uppercase font-sans text-[#929A95]">Open Actions</div>
              <div className="text-2xl font-mono font-bold text-teal-400 mt-1">
                {overview.open_corrective_actions}
              </div>
              <div className="text-[10px] text-[#626A65] font-mono mt-0.5">Engineering dispatch</div>
            </div>

            {/* 5. Resolved */}
            <div className="p-3.5 rounded-lg bg-[#0E1110] border border-[#242A27]">
              <div className="text-[10px] uppercase font-sans text-[#929A95]">Resolved</div>
              <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                {overview.resolved_cases}
              </div>
              <div className="text-[10px] text-[#626A65] font-mono mt-0.5">Verified & closed</div>
            </div>

            {/* 6. CO₂e Reduced */}
            <div className="p-3.5 rounded-lg bg-[#0E1110] border border-[#242A27]">
              <div className="text-[10px] uppercase font-sans text-[#929A95]">CO₂e Reduced</div>
              <div className="text-2xl font-mono font-bold text-[#A8C83A] mt-1">
                14.2t
              </div>
              <div className="text-[10px] text-[#626A65] font-mono mt-0.5">Per day (-13.6%)</div>
            </div>
          </div>
        )}

        {/* ── REGIONAL RISK REGISTER (Section 22) ──────────────── */}
        <div className="p-5 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-[#A8C83A]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
                Regional Risk Register
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#929A95]">
              Real-time CEMS & Regulatory Telemetry Stream
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#242A27] text-[10px] uppercase tracking-wider text-[#929A95]">
                  <th className="pb-2.5">Facility Identifier</th>
                  <th className="pb-2.5">Sector</th>
                  <th className="pb-2.5">Health Score</th>
                  <th className="pb-2.5">Pact Status</th>
                  <th className="pb-2.5">Active Deviations</th>
                  <th className="pb-2.5">Compliance Status</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181E1C]">
                {overview?.facilities.map((fac) => {
                  const isRisk = fac.risk_level === 'HIGH';
                  const isWatch = fac.risk_level === 'MODERATE';

                  return (
                    <tr key={fac.id} className="hover:bg-[#141817] transition-colors">
                      <td className="py-3 font-medium text-zinc-200">
                        <div>{fac.name}</div>
                        <div className="text-[10px] font-mono text-[#929A95]">{fac.id}</div>
                      </td>
                      <td className="py-3 text-[#929A95]">{fac.sector}</td>
                      <td className="py-3 font-mono text-zinc-100 font-bold">{fac.environmental_score} / 100</td>
                      <td className="py-3">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          {fac.pact_status}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-amber-400">{fac.primary_excess}</td>
                      <td className="py-3">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${
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
                      <td className="py-3 text-right">
                        <Link
                          href="/industry"
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-[#A8C83A] hover:underline"
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

        {/* ── ENVIRONMENTAL IMPACT: "HOW MUCH IMPROVEMENT HAS HAPPENED?" (Section 22) ── */}
        <div className="p-5 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#A8C83A] tracking-wider font-bold">
                MEASURED ENVIRONMENTAL RESTORATION
              </div>
              <h2 className="text-base font-bold text-[#F1F3EE] mt-0.5">
                Regional Environmental Impact
              </h2>
              <p className="text-xs text-[#929A95] mt-0.5">
                Answers: &ldquo;How much environmental improvement has happened?&rdquo; across air, water, and climate.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              MRV-VERIFIED IMPROVEMENT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            {/* Total CO₂e reduced */}
            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1">
              <div className="text-[10px] uppercase font-sans text-[#929A95]">Total CO₂e Reduced</div>
              <div className="text-2xl font-bold text-[#A8C83A]">
                5,183 <span className="text-xs font-normal text-zinc-400">t/year</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-sans">
                ↓ 14.2 tCO₂e / day sustained
              </div>
            </div>

            {/* NOx reduction */}
            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1">
              <div className="text-[10px] uppercase font-sans text-[#929A95]">NOx Reduction</div>
              <div className="text-2xl font-bold text-emerald-400">
                ↓ 28.6 <span className="text-xs font-normal text-zinc-400">kg/day</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-sans">
                Normalized to 88.5 mg/Nm³
              </div>
            </div>

            {/* Water improvement */}
            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1">
              <div className="text-[10px] uppercase font-sans text-[#929A95]">Water Improvement</div>
              <div className="text-2xl font-bold text-teal-400">
                81.2% <span className="text-xs font-normal text-zinc-400">recovery</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-sans">
                Outfall DO: 6.8 mg/L (Normal)
              </div>
            </div>

            {/* Resolved incidents */}
            <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1">
              <div className="text-[10px] uppercase font-sans text-[#929A95]">Resolved Incidents</div>
              <div className="text-2xl font-bold text-zinc-100">
                {overview?.resolved_cases || 1} <span className="text-xs font-normal text-zinc-400">Audited</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-sans">
                Full 10-step chain verified
              </div>
            </div>
          </div>
        </div>

        {/* ── ENFORCEMENT & REGULATORY CASE WORKFLOW ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Incident Selector */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 block">
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
                        ? 'bg-[#141817] border-[#A8C83A]/60 shadow-sm'
                        : 'bg-[#080A09] hover:bg-[#121515] border-[#242A27]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-zinc-200">{rep.id}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30 font-semibold">
                        {rep.corroboration_score}% Match
                      </span>
                    </div>
                    <div className="text-xs font-medium text-zinc-300 truncate">{rep.title}</div>
                    <div className="text-[10px] text-[#929A95] font-mono mt-1 flex justify-between">
                      <span>{rep.correlated_facility}</span>
                      <span className="text-amber-400 font-semibold">{rep.severity}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Desk */}
          <div className="lg:col-span-8 p-5 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-4">
            {selectedCase ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#242A27]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-[#A8C83A]">{selectedCase.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-zinc-300 border border-[#242A27]">
                        REGULATORY CASE
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#F1F3EE] mt-1">{selectedCase.title}</h3>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-[10px] text-[#929A95] uppercase font-sans">Enforcement Officer</span>
                    <div className="font-mono text-zinc-200">{selectedCase.government_status.officer}</div>
                  </div>
                </div>

                {/* Evidence Base */}
                <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-sans font-bold text-zinc-400">
                      Auditable Evidence Base
                    </span>
                    {selectedCase.environmental_impact_report && (
                      <button
                        type="button"
                        onClick={() => setShowImpactModal(true)}
                        className="px-2.5 py-1 rounded bg-[#141817] hover:bg-[#1a221f] border border-[#A8C83A]/40 text-xs font-mono font-bold text-[#A8C83A] transition-colors cursor-pointer"
                      >
                        Inspect MRV Impact Report
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 text-[11px] text-zinc-300">
                    <div>• Citizen Optical Evidence: GPS timestamped ({selectedCase.latitude}°N, {selectedCase.longitude}°E)</div>
                    <div>• CEMS & Sensor Deviations: {Object.entries(selectedCase.telemetry_deviations).map(([k, v]) => `${k.toUpperCase()} (${v})`).join(', ')}</div>
                    <div>• Machine Learning Root Cause: {selectedCase.root_cause}</div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 block">
                    Execute Regulatory Mandate
                  </span>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleGovAction('REQUEST_INFO')}
                      disabled={loadingAction}
                      className="px-3 py-1.5 rounded bg-[#141817] hover:bg-[#1a221f] border border-[#242A27] text-xs text-zinc-200 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Request Info
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGovAction('REQUEST_INSPECTION')}
                      disabled={loadingAction}
                      className="px-3 py-1.5 rounded bg-[#141817] hover:bg-[#1a221f] border border-[#242A27] text-xs text-amber-300 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Request Inspection
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGovAction('MANDATE_ACTION')}
                      disabled={loadingAction}
                      className="px-3.5 py-1.5 rounded bg-[#141817] hover:bg-[#1a221f] border border-[#A8C83A]/60 text-xs font-mono font-bold text-[#A8C83A] transition-all disabled:opacity-40 cursor-pointer"
                    >
                      Mandate 24-hr Action
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGovAction('CLOSE')}
                      disabled={loadingAction}
                      className="ml-auto px-4 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-300 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Audit & Close Case
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500 font-mono text-xs">
                Select an incident from the registry to inspect regulatory actions.
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
