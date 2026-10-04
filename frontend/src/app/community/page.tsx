'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { api, CommunityReport } from '@/lib/api';
import EnvironmentalImpactReportModal from '@/components/EnvironmentalImpactReportModal';

export default function CommunityPage() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [showImpactModal, setShowImpactModal] = useState(false);

  // Fetch reports on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await api.getCommunityReports();
        setReports(res.reports || []);
        if (res.reports && res.reports.length > 0) {
          setSelectedReport(res.reports[0]);
        }
      } catch (err) {
        console.error('Failed to load community reports:', err);
      }
    }
    load();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (filterCategory === 'ALL') return true;
    return r.category === filterCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-[#F2F3EF]">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#202525]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#121515] border border-[#202525] text-xs font-medium text-emerald-400 mb-2">
            <Users size={14} />
            <span>Community Action & Public Accountability</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F2F3EF]">
            Community Environmental Portal
          </h1>
          <p className="text-xs text-[#8D9490] mt-1 max-w-2xl">
            Real-time neighborhood environmental status, transparent case tracking, and verified citizen impact points.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/report"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#152218] hover:bg-[#1a2c1f] border border-[#B7D83D]/60 text-xs font-semibold text-white transition-all shadow-sm"
          >
            <Camera size={14} className="text-[#B7D83D]" />
            <span>REPORT POLLUTION</span>
          </Link>
        </div>
      </div>

      {/* ── Top Environmental Status & Community Impact Strip ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-[#0D0F0F] border border-[#202525] space-y-1">
          <div className="text-[10px] uppercase font-sans text-[#8D9490]">Local Air Quality (Sector 4)</div>
          <div className="text-xl font-mono font-bold text-zinc-100 flex items-center gap-2">
            <span>68 AQI</span>
            <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              MODERATE
            </span>
          </div>
          <div className="text-[10px] font-mono text-zinc-500">PM2.5: 38.4 µg/m³ · Station 04</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0D0F0F] border border-[#202525] space-y-1">
          <div className="text-[10px] uppercase font-sans text-[#8D9490]">Active Community Cases</div>
          <div className="text-xl font-mono font-bold text-amber-400 flex items-center gap-2">
            <span>{reports.filter((r) => r.status !== 'RESOLVED').length} Active</span>
            <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {reports.filter((r) => r.corroboration_status === 'CORROBORATED').length} CORROBORATED
            </span>
          </div>
          <div className="text-[10px] font-mono text-zinc-500">Corridor response time: 28 min</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0D0F0F] border border-[#202525] space-y-1">
          <div className="text-[10px] uppercase font-sans text-[#8D9490]">Your Impact Points</div>
          <div className="text-xl font-mono font-bold text-[#B7D83D] flex items-center gap-2">
            <span>150 PTS</span>
            <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-[#121515] text-[#B7D83D] border border-[#B7D83D]/30">
              TRUSTED
            </span>
          </div>
          <div className="text-[10px] font-mono text-zinc-500">87% Historical Corroboration</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0D0F0F] border border-[#202525] space-y-1">
          <div className="text-[10px] uppercase font-sans text-[#8D9490]">Pact Accountability</div>
          <div className="text-xl font-mono font-bold text-emerald-400 flex items-center gap-2">
            <span>ACTIVE</span>
            <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
              3 Facilities
            </span>
          </div>
          <div className="text-[10px] font-mono text-zinc-500">14.8% Monthly Emission Cut</div>
        </div>
      </div>

      {/* ── Main Layout: Reports Feed & Active Case Dossier ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Community Incident Reports Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#B7D83D]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                Community Reports
              </span>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 text-[10px]">
              {['ALL', 'SMOKE_EMISSIONS', 'WATER_POLLUTION', 'ODOR'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    filterCategory === cat
                      ? 'bg-[#1b251e] text-[#B7D83D] font-semibold border border-[#B7D83D]/30'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {cat === 'ALL' ? 'All' : cat.split('_')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-2.5">
            {filteredReports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              const isResolved = rep.status === 'RESOLVED';
              const isCorroborated = rep.corroboration_status === 'CORROBORATED';

              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#131915] border-[#B7D83D]/60 shadow-sm'
                      : 'bg-[#0D0F0F] hover:bg-[#121515] border-[#202525]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-[11px] font-semibold text-zinc-300">
                      {rep.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                          isResolved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : rep.status === 'INDUSTRY_ACTION'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700/40'
                        }`}
                      >
                        {rep.status.replace('_', ' ')}
                      </span>
                      {isCorroborated && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 font-bold">
                          {rep.corroboration_score}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-zinc-200 line-clamp-1">
                    {rep.title}
                  </div>
                  <div className="text-[11px] text-[#8D9490] line-clamp-2 mt-1">
                    {rep.description}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-2.5 pt-2 border-t border-[#181d1a]">
                    <span className="truncate max-w-[200px]">{rep.location_name}</span>
                    <span className="text-[#B7D83D]">+{rep.reporter.points_awarded} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Case Detail & Citizen Final Response (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedReport ? (
            <div className="rounded-lg bg-[#0D0F0F] border border-[#202525] p-5 space-y-5">
              {/* Header and Case Identifier */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#202525]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-[#F2F3EF]">
                      {selectedReport.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        selectedReport.status === 'RESOLVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {selectedReport.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-200 mt-1">
                    {selectedReport.title}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-zinc-400 font-mono">{selectedReport.timestamp_formatted}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    GPS: {selectedReport.latitude}°N, {selectedReport.longitude}°E
                  </div>
                </div>
              </div>

              {/* Citizen Optical Evidence Stamped Copy */}
              <div className="rounded border border-[#202525] bg-[#080909] p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase font-sans text-zinc-400 font-medium">
                    Citizen Optical Evidence (Timestamped GPS Stamp)
                  </span>
                  <span className="text-[9px] font-mono text-[#B7D83D]">TAMPER-VERIFIED</span>
                </div>
                <div className="relative aspect-[16/9] rounded overflow-hidden bg-black/60 flex items-center justify-center border border-[#1b251e]">
                  {/* Mock Visual Plate representing the stamped photo */}
                  <svg className="w-full h-full" viewBox="0 0 600 340">
                    <defs>
                      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1a221f" />
                        <stop offset="100%" stopColor="#0a0f0d" />
                      </linearGradient>
                    </defs>
                    <rect width="600" height="340" fill="url(#skyGrad)" />
                    {/* Industrial silhouette */}
                    <rect x="120" y="100" width="30" height="240" fill="#1b2420" />
                    <rect x="160" y="140" width="50" height="200" fill="#141c18" />
                    <rect x="220" y="170" width="80" height="170" fill="#19221e" />
                    {/* Plume */}
                    <circle cx="135" cy="80" r="35" fill="#303a35" fillOpacity="0.75" />
                    <circle cx="170" cy="55" r="45" fill="#38433e" fillOpacity="0.65" />
                    <circle cx="230" cy="35" r="60" fill="#2d3732" fillOpacity="0.5" />
                    {/* Overlay stamp bar */}
                    <rect x="0" y="270" width="600" height="70" fill="rgba(8,10,9,0.94)" />
                    <rect x="0" y="270" width="600" height="2" fill="#A8C83A" />
                    <text x="15" y="290" fill="#F1F3EE" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                      ONER COMMUNITY EVIDENCE • {selectedReport.id}
                    </text>
                    <text x="15" y="308" fill="#929A95" fontSize="10" fontFamily="monospace">
                      GPS: {selectedReport.latitude}°N, {selectedReport.longitude}°E (±{selectedReport.accuracy_meters}m) • {selectedReport.timestamp_formatted}
                    </text>
                    <text x="15" y="325" fill="#A8C83A" fontSize="10" fontFamily="monospace">
                      STATUS: {selectedReport.corroboration_status} ({selectedReport.corroboration_score}%)
                    </text>
                  </svg>
                </div>
              </div>

              {/* ── THE CITIZEN FINAL RESPONSE (Simplified & Meaningful) ─── */}
              <div className="rounded-lg bg-[#0E1110] border border-[#242A27] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#A8C83A]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      YOUR REPORT HELPED DRIVE A MEASURABLE RESULT
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    SIGNAL NORMALIZED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                    <span className="text-[10px] uppercase font-sans text-zinc-500">You Reported</span>
                    <div className="font-semibold text-zinc-200">{selectedReport.category.replace('_', ' ')}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{selectedReport.location_name}</div>
                  </div>

                  <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                    <span className="text-[10px] uppercase font-sans text-zinc-500">What ONER Found</span>
                    <div className="font-semibold text-zinc-200">Abnormal emissions from {selectedReport.likely_source}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">{selectedReport.corroboration_score}% Sensor Corroborated</div>
                  </div>

                  <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                    <span className="text-[10px] uppercase font-sans text-zinc-500">What The Facility Did</span>
                    <div className="font-semibold text-zinc-200">{selectedReport.industry_response.action_taken}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">By: {selectedReport.industry_response.engineer}</div>
                  </div>

                  <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                    <span className="text-[10px] uppercase font-sans text-zinc-500">What Changed (Outcome)</span>
                    <div className="font-mono text-emerald-400 font-bold">
                      NOx &darr; 28.6 kg/day &bull; CO₂e &darr; 14.2 t/day
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">Annualized: &darr; 5,183 tCO₂e/year</div>
                  </div>
                </div>

                {/* Community Points Reward + View Full Impact Report Button */}
                <div className="pt-2 border-t border-[#181E1C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Award size={15} className="text-[#A8C83A]" />
                    <span className="text-zinc-300">Community Impact Awarded:</span>
                    <span className="font-mono font-bold text-[#A8C83A]">
                      +{selectedReport.reporter.points_awarded} Points
                    </span>
                  </div>

                  {selectedReport.environmental_impact_report && (
                    <button
                      type="button"
                      onClick={() => setShowImpactModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141817] hover:bg-[#1a201e] border border-[#242A27] text-xs font-semibold text-[#A8C83A] transition-colors"
                    >
                      <FileCheck2 size={13} />
                      <span>View Environmental Impact Report</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Auditable Event Trail */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-sans text-zinc-400 font-semibold block">
                  Auditable Event Trail
                </span>
                <div className="space-y-1 font-mono text-[11px]">
                  {selectedReport.audit_trail.map((ev, i) => (
                    <div key={i} className="flex items-start gap-2 p-1.5 rounded bg-[#080A09] text-zinc-400">
                      <span className="text-zinc-600">{ev.time}</span>
                      <span className="text-[#A8C83A] font-medium min-w-[120px]">{ev.actor}:</span>
                      <span className="text-zinc-300">{ev.event}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation into Industry Case View */}
              <div className="pt-2 flex justify-end">
                <Link
                  href={`/industry?case=${selectedReport.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141817] hover:bg-[#1a201e] border border-[#242A27] text-xs text-zinc-300 hover:text-white transition-colors"
                >
                  <span>Inspect in Industry Console</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-[#0E1110] border border-[#242A27] p-12 text-center text-zinc-500">
              Select an incident report from the feed to view the evidence dossier.
            </div>
          )}
        </div>
      </div>

      {/* ── Environmental Impact Report Modal ────────────────────── */}
      {selectedReport?.environmental_impact_report && (
        <EnvironmentalImpactReportModal
          report={selectedReport.environmental_impact_report}
          isOpen={showImpactModal}
          onClose={() => setShowImpactModal(false)}
        />
      )}
    </div>
  );
}
