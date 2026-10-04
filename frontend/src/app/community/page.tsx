'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Camera,
  ArrowRight,
  Sparkles,
  Award,
  FileCheck2,
  Info,
  Activity,
  HeartHandshake,
} from 'lucide-react';
import { api, CommunityReport } from '@/lib/api';
import EnvironmentalImpactReportModal from '@/components/EnvironmentalImpactReportModal';
import EvidenceTrustLayer from '@/components/EvidenceTrustLayer';

export default function CommunityPage() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getCommunityReports();
      setReports(res.reports || []);
      if (res.reports && res.reports.length > 0) {
        setSelectedReport((prev) => prev || res.reports[0]);
      }
    } catch (err) {
      console.error('Failed to load community reports:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (filterCategory === 'ALL') return true;
    return r.category === filterCategory;
  });

  return (
    <AppLayout
      title="Community Portal"
      subtitle="Public Accountability & Verified Environmental Outcomes"
      onRefresh={loadData}
      isRefreshing={isRefreshing}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12 text-[#F1F3EE]">
        {/* ── Page Header ────────────────────────────────────────── */}
        <div className="p-5 rounded-xl bg-[#0E1110] border border-[#242A27] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono text-[#A8C83A] uppercase font-bold tracking-wider">
              COMMUNITY-TO-INDUSTRY ACCOUNTABILITY &bull; SECTOR 4
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EE] mt-0.5">
              Community Environmental Portal
            </h1>
            <p className="text-xs text-[#929A95] mt-0.5">
              Transparent case tracking, sensor corroboration, and verified outcome rewards for local residents.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/report"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141817] hover:bg-[#1a221e] border border-[#A8C83A]/50 text-xs font-mono font-bold text-[#A8C83A] transition-all shadow-sm"
            >
              <Camera size={14} className="text-[#A8C83A]" />
              <span>+ REPORT POLLUTION</span>
            </Link>
          </div>
        </div>

        {/* ── Top Environmental Status Strip ──────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-1">
            <div className="text-[10px] uppercase font-sans text-[#929A95]">Local Air Quality (Sector 4)</div>
            <div className="text-xl font-mono font-bold text-zinc-100 flex items-center gap-2">
              <span>68 AQI</span>
              <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                MODERATE
              </span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500">PM2.5: 38.4 µg/m³ · Station 04</div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-1">
            <div className="text-[10px] uppercase font-sans text-[#929A95]">Active Community Cases</div>
            <div className="text-xl font-mono font-bold text-amber-400 flex items-center gap-2">
              <span>{reports.filter((r) => r.status !== 'RESOLVED').length} Active</span>
              <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {reports.filter((r) => r.corroboration_status === 'CORROBORATED').length} CORROBORATED
              </span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500">Average response time: 28 min</div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-1">
            <div className="text-[10px] uppercase font-sans text-[#929A95]">Your Impact Points</div>
            <div className="text-xl font-mono font-bold text-[#A8C83A] flex items-center gap-2">
              <span>150 PTS</span>
              <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30">
                TRUSTED
              </span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500">87% Historical Corroboration</div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-1">
            <div className="text-[10px] uppercase font-sans text-[#929A95]">Pact Accountability</div>
            <div className="text-xl font-mono font-bold text-emerald-400 flex items-center gap-2">
              <span>ACTIVE</span>
              <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                Orion Unit 04
              </span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500">Clause 4.2 enforcement</div>
          </div>
        </div>

        {/* ── Main Layout: Reports Feed & Citizen Narrative Dossier ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Community Incident Reports Feed (4 cols) */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Community Reports
              </span>
              <div className="flex items-center gap-1 text-[10px]">
                {['ALL', 'SMOKE_EMISSIONS', 'WATER_POLLUTION'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      filterCategory === cat
                        ? 'bg-[#141817] text-[#A8C83A] font-bold border border-[#A8C83A]/30'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {cat === 'ALL' ? 'All' : cat.split('_')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filteredReports.map((rep) => {
                const isSelected = selectedReport?.id === rep.id;
                const isResolved = rep.status === 'RESOLVED';
                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#141817] border-[#A8C83A]/60 shadow-sm'
                        : 'bg-[#080A09] hover:bg-[#121515] border-[#242A27]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-zinc-200">{rep.id}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                          isResolved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                        }`}
                      >
                        {rep.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-zinc-200 truncate">{rep.title}</div>
                    <div className="text-[10px] text-[#929A95] font-mono mt-1 flex justify-between">
                      <span className="truncate max-w-[150px]">{rep.location_name}</span>
                      <span className="text-[#A8C83A]">+{rep.reporter.points_awarded} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Citizen Language Outcome Matrix (8 cols) (Section 23) */}
          <div className="lg:col-span-8 p-5 rounded-xl bg-[#0E1110] border border-[#242A27] space-y-5">
            {selectedReport ? (
              <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#242A27]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-[#A8C83A]">{selectedReport.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        STATUS: {selectedReport.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#F1F3EE] mt-1">{selectedReport.title}</h3>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-[10px] text-[#929A95] font-mono">{selectedReport.timestamp_formatted}</span>
                    <div className="text-[10px] text-zinc-500 font-mono">GPS: {selectedReport.latitude}°N, {selectedReport.longitude}°E</div>
                  </div>
                </div>

                {/* ── THE 5 CITIZEN LANGUAGE QUESTIONS (Section 23) ── */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Case Lifecycle & Public Outcome Summary
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* 1. WHAT DID I REPORT? */}
                    <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1.5">
                      <div className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase">
                        1. What Did I Report?
                      </div>
                      <div className="text-zinc-200 font-semibold">{selectedReport.category.replace('_', ' ')}</div>
                      <p className="text-[11px] text-[#929A95] italic">
                        &quot;{selectedReport.description}&quot;
                      </p>
                      <div className="text-[10px] font-mono text-zinc-500 pt-1 border-t border-[#181E1C]">
                        Location: {selectedReport.location_name} (±{selectedReport.accuracy_meters}m)
                      </div>
                    </div>

                    {/* 2. WHAT DID ONER FIND? */}
                    <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1.5">
                      <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                        2. What Did ONER Find?
                      </div>
                      <div className="text-zinc-200 font-semibold">{selectedReport.likely_source}</div>
                      <p className="text-[11px] text-[#929A95]">
                        {selectedReport.root_cause}
                      </p>
                      <div className="text-[10px] font-mono text-emerald-400 pt-1 border-t border-[#181E1C]">
                        Corroboration: {selectedReport.corroboration_score}% via Stack CEMS & AQ-04
                      </div>
                    </div>

                    {/* 3. WHAT DID THE INDUSTRY DO? */}
                    <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1.5">
                      <div className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase">
                        3. What Did The Industry Do?
                      </div>
                      <div className="text-zinc-200 font-semibold">
                        Corrective Action Dispatched
                      </div>
                      <p className="text-[11px] text-[#929A95]">
                        {selectedReport.industry_response.action_taken}
                      </p>
                      <div className="text-[10px] font-mono text-zinc-400 pt-1 border-t border-[#181E1C]">
                        Lead: {selectedReport.industry_response.engineer}
                      </div>
                    </div>

                    {/* 4. WHAT CHANGED? */}
                    <div className="p-3.5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-1.5">
                      <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                        4. What Changed (Measured Outcome)?
                      </div>
                      <div className="text-emerald-400 font-mono font-bold text-sm">
                        NOx ↓ 28.6 kg/day · CO₂e ↓ 14.2 t/day
                      </div>
                      <p className="text-[11px] text-[#929A95]">
                        Stack emissions normalized to 88.5 mg/Nm³ (below 100 mg limit).
                      </p>
                      <div className="text-[10px] font-mono text-zinc-400 pt-1 border-t border-[#181E1C]">
                        Annualized: 5,183 tCO₂e/year permanent cut
                      </div>
                    </div>
                  </div>

                  {/* 5. WHAT WAS MY IMPACT? */}
                  <div className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="text-[10px] font-mono font-bold text-[#A8C83A] uppercase">
                        5. What Was My Impact?
                      </div>
                      <div className="text-sm font-semibold text-zinc-200 mt-0.5">
                        Your report directly triggered engineering setpoint correction at Orion Refining.
                      </div>
                      <div className="text-[11px] text-[#929A95] mt-0.5">
                        Impact Points Granted: <strong className="text-[#A8C83A] font-mono">+{selectedReport.reporter.points_awarded} Points</strong> &bull; Sentinel Tier: <strong className="text-zinc-200 font-mono">Trusted</strong>
                      </div>
                    </div>

                    {/* ACTIONS: OPEN CASE DOSSIER & VIEW ENVIRONMENTAL IMPACT REPORT */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/case/${selectedReport.id}?level=field`}
                        className="px-3.5 py-2 rounded bg-[#080A09] hover:bg-[#141817] border border-[#242A27] text-xs font-mono text-[#F1F3EE] hover:text-[#A8C83A] flex items-center gap-1.5 transition-colors"
                      >
                        <span>OPEN CASE DOSSIER</span>
                        <ArrowRight size={13} />
                      </Link>

                      {selectedReport.environmental_impact_report && (
                        <button
                          type="button"
                          onClick={() => setShowImpactModal(true)}
                          className="px-4 py-2 rounded bg-[#141817] hover:bg-[#1D2320] border border-[#A8C83A]/50 text-xs font-mono font-bold text-[#A8C83A] flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
                        >
                          <FileCheck2 size={14} />
                          <span>VIEW IMPACT REPORT</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Evidence Trust Layer for Citizen Report */}
                <EvidenceTrustLayer
                  reportId={selectedReport.id}
                  hasPhoto={true}
                  photoQuality="HIGH"
                  hasGps={true}
                  facilityProximity="380m downwind from stack"
                  overallQuality="HIGH"
                />
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500 font-mono text-xs">
                Select an incident report from the feed to view the public accountability record.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedReport?.environmental_impact_report && (
        <EnvironmentalImpactReportModal
          report={selectedReport.environmental_impact_report}
          isOpen={showImpactModal}
          onClose={() => setShowImpactModal(false)}
        />
      )}
    </AppLayout>
  );
}
