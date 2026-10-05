'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AtmosphericShell from '@/components/shell/AtmosphericShell';
import StateMark, { StateType } from '@/components/primitives/StateMark';
import DemoTag from '@/components/primitives/DemoTag';
import { CompactChain } from '@/components/chain';
import { api, CommunityReport } from '@/lib/api';
import { CANONICAL_CASE } from '@/lib/seed';
import {
  Camera,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Sparkles,
  Info,
} from 'lucide-react';

interface JournalEntry {
  id: string;
  category: 'SMOKE' | 'WATER' | 'ODOR' | 'DUST' | 'NOISE' | 'OTHER';
  rawCategory: string;
  title: string;
  description: string;
  locationName: string;
  timestampFormatted: string;
  timestampIso: string;
  status: string;
  stateType: StateType;
  signals: number[];
  impactLabel?: string;
  pointsAwarded?: number;
  facility?: string;
  photoUrl?: string;
}

// Canonical cases specified in §0.15 & Phase 3 spec
const CANONICAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'COMM-2026-00421',
    category: 'SMOKE',
    rawCategory: 'SMOKE_EMISSIONS',
    title: 'Dense dark smoke plume with acrid chemical odor near North Stack',
    description: 'Thick black particulate emissions observed escaping from the vertical furnace stack. Distinct unburnt fuel odor detectable at the residential perimeter boundary 400m downwind.',
    locationName: 'North Gate Perimeter, Sector 4 Industrial Zone',
    timestampFormatted: '03 Oct 2026, 09:42 IST',
    timestampIso: '2026-10-03T09:42:15Z',
    status: 'FACILITY ACTION TAKEN',
    stateType: 'verified',
    signals: [42, 96, 94, 95, 92, 96],
    impactLabel: '14.2 tCO₂e/day measured · 28.6 kg/day NOx',
    pointsAwarded: 50,
    facility: 'Orion Refining Complex · Furnace F-101',
    photoUrl: '/evidence/smoke_plume_01.jpg',
  },
  {
    id: 'COMM-2026-00398',
    category: 'WATER',
    rawCategory: 'WATER_POLLUTION',
    title: 'Chemical foam & discolored effluent in Sector 4 North Drainage Canal',
    description: 'White buoyant surfactant foam spreading 150 meters along the stormwater discharge channel leading into the seasonal creek.',
    locationName: 'Canal Outfall 3, Downstream of Industrial Estate',
    timestampFormatted: '02 Oct 2026, 16:15 IST',
    timestampIso: '2026-10-02T16:15:00Z',
    status: 'GOVERNMENT REVIEW',
    stateType: 'corroborated',
    signals: [70, 80, 60, 75, 20, 40],
    impactLabel: 'Downstream DO 3.8 mg/L flagged · Sampling ordered',
    pointsAwarded: 30,
    facility: 'Canal Outfall 3 · Apex Logistics & Orion',
    photoUrl: '/evidence/water_foam_01.jpg',
  },
  {
    id: 'COMM-2026-00405',
    category: 'ODOR',
    rawCategory: 'ODOR',
    title: 'Pungent mercaptan / sulfur odor affecting West Gate residential colony',
    description: 'Sharp rotten egg / sulfur smell drifting into residential sector between 22:00 and 01:00 during calm atmospheric inversion.',
    locationName: 'West Gate Residential Buffer Colony',
    timestampFormatted: '02 Oct 2026, 22:30 IST',
    timestampIso: '2026-10-02T22:30:00Z',
    status: 'RESOLVED',
    stateType: 'verified',
    signals: [85, 90, 82, 78, 80, 88],
    impactLabel: 'Seal pot vapor lock corrected · Zero fugitives',
    pointsAwarded: 50,
    facility: 'Sulfur Recovery Unit SRU-2',
    photoUrl: '/evidence/odor_night_01.jpg',
  },
  {
    id: 'COMM-2026-00376',
    category: 'DUST',
    rawCategory: 'DUST',
    title: 'Fugitive dust plume along transit haulage road during heavy truck movement',
    description: 'Dry surface dust raised by clinker trucks without tarpaulin covers on the unpaved auxiliary transit corridor.',
    locationName: 'East Perimeter Haulage Road',
    timestampFormatted: '01 Oct 2026, 14:10 IST',
    timestampIso: '2026-10-01T14:10:00Z',
    status: 'CORROBORATING',
    stateType: 'awaiting',
    signals: [35, 30, 25, 40, 20, 30],
    impactLabel: 'Awaiting secondary PM10 downwind confirmation',
    pointsAwarded: 0,
    facility: 'Deccan Clinker Terminal Transit Corridor',
    photoUrl: '/evidence/dust_road_01.jpg',
  },
  {
    id: 'COMM-2026-00412',
    category: 'NOISE',
    rawCategory: 'NOISE',
    title: 'Low frequency acoustic humming and fan vibration during night shift',
    description: 'Continuous drone at 120 Hz oscillating through bedroom walls between 02:00 and 05:00 AM.',
    locationName: 'South Ridge Residential Sector',
    timestampFormatted: '02 Oct 2026, 03:15 IST',
    timestampIso: '2026-10-02T03:15:00Z',
    status: 'FACILITY ACTION TAKEN',
    stateType: 'corroborated',
    signals: [60, 82, 75, 80, 70, 78],
    impactLabel: 'Fan #4 speed reduced 18% · Acoustic dampers deployed',
    pointsAwarded: 50,
    facility: 'Cooling Tower CT-3 Induced Draft Fan #4',
    photoUrl: '/evidence/noise_spectrum_01.jpg',
  },
];

type FilterType = 'ALL' | 'SMOKE' | 'WATER' | 'ODOR' | 'DUST' | 'NOISE' | 'OTHER';

export default function CommunityJournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>(CANONICAL_JOURNAL_ENTRIES);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load backend reports and merge with canonical entries
  const loadReports = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getCommunityReports();
      if (res && res.reports && Array.isArray(res.reports)) {
        // Map backend reports to JournalEntry format
        const backendEntries: JournalEntry[] = res.reports.map((r: CommunityReport) => {
          let cat: JournalEntry['category'] = 'OTHER';
          const up = (r.category || '').toUpperCase();
          if (up.includes('SMOKE')) cat = 'SMOKE';
          else if (up.includes('WATER')) cat = 'WATER';
          else if (up.includes('ODOR')) cat = 'ODOR';
          else if (up.includes('DUST')) cat = 'DUST';
          else if (up.includes('NOISE')) cat = 'NOISE';

          let stateType: StateType = 'received';
          if (r.status === 'RESOLVED') stateType = 'verified';
          else if (r.status === 'INDUSTRY_ACTION') stateType = 'verified';
          else if (r.status === 'GOVERNMENT_REVIEW') stateType = 'corroborated';
          else if (r.corroboration_status === 'CORROBORATED') stateType = 'corroborated';

          // Extract or approximate signal weights
          const score = r.corroboration_score || 70;
          const signals = [
            Math.min(100, Math.round(score * 0.9)),
            Math.min(100, Math.round(score * 1.05)),
            Math.min(100, Math.round(score * 0.95)),
            Math.min(100, Math.round(score * 1.02)),
            Math.min(100, Math.round(score * 0.88)),
            Math.min(100, Math.round(score * 0.98)),
          ];

          return {
            id: r.id,
            category: cat,
            rawCategory: r.category,
            title: r.title || 'Community environmental observation',
            description: r.description || '',
            locationName: r.location_name || 'Sector 4 Industrial Zone',
            timestampFormatted: r.timestamp_formatted || 'Recent observation',
            timestampIso: r.timestamp || new Date().toISOString(),
            status: r.status ? r.status.replace(/_/g, ' ') : 'OBSERVATION FILED',
            stateType,
            signals,
            impactLabel: r.environmental_outcome?.nox_expected_drop
              ? `NOx ${r.environmental_outcome.nox_expected_drop} · CO₂e ${r.environmental_outcome.co2_expected_drop}`
              : undefined,
            pointsAwarded: r.reporter?.points_awarded || 0,
            facility: r.correlated_facility || r.likely_source || 'Industrial Corridor',
            photoUrl: r.photo_url || '/evidence/smoke_plume_01.jpg',
          };
        });

        // Merge: keep canonical entries, update with backend if matching id, prepend any newly filed reports
        const mergedMap = new Map<string, JournalEntry>();
        
        // Add backend entries first
        backendEntries.forEach((entry) => mergedMap.set(entry.id, entry));
        
        // Ensure canonical entries are present with enriched canonical descriptions
        CANONICAL_JOURNAL_ENTRIES.forEach((canonical) => {
          if (!mergedMap.has(canonical.id)) {
            mergedMap.set(canonical.id, canonical);
          } else {
            // Merge canonical richer copy if backend has simpler placeholder
            const existing = mergedMap.get(canonical.id)!;
            mergedMap.set(canonical.id, {
              ...canonical,
              ...existing,
              title: canonical.title,
              description: canonical.description,
              facility: canonical.facility,
              impactLabel: canonical.impactLabel,
            });
          }
        });

        const sorted = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.timestampIso).getTime() - new Date(a.timestampIso).getTime()
        );
        setEntries(sorted);
      }
    } catch (err) {
      console.warn('Could not refresh backend community reports, keeping canonical seeds:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredEntries = entries.filter((e) => {
    if (filter === 'ALL') return true;
    return e.category === filter;
  });

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F4F3EC] text-[#1B211C] transition-colors duration-300"
      data-atmosphere="field"
    >
      {/* ── 56px Global Atmospheric Shell ───────────────────────── */}
      <AtmosphericShell onRefresh={loadReports} isRefreshing={isRefreshing} />

      {/* ── Journal Header & Primary Question ──────────────────── */}
      <header className="border-b border-[#DAD8CC] bg-[#FBFAF5]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#5A625B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5E7A29]" />
                <span>Environmental Field Journal</span>
                <span className="text-[#8C8F85]">·</span>
                <span>Sector 4 Civic Network</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#1B211C] leading-[1.15]">
                What has the community helped ONER see?
              </h1>
              <p className="text-sm text-[#5A625B] leading-relaxed pt-1">
                A chronological record of resident observations, corroborated against industrial stack CEMS telemetry and ambient sensors, leading to verified mitigation.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Link
                href="/report"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-sm bg-[#1B211C] hover:bg-[#2C332E] text-white text-xs font-mono font-medium tracking-wide transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E7A29]"
              >
                <Camera size={15} />
                <span>+ FILE AN OBSERVATION</span>
              </Link>
            </div>
          </div>

          {/* ── Quiet Environmental Context & Reporter Trust Line ── */}
          <div className="mt-8 pt-5 border-t border-[#E5E3D8] grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-xs">
            {/* Reporter Trust */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#5E7A29] font-bold">
                <ShieldCheck size={13} />
                <span>REPORTER TRUST · 87%</span>
              </div>
              <p className="text-[12px] text-[#5A625B] leading-snug">
                Your reports are becoming more useful as ONER can corroborate them against continuous stack telemetry.
              </p>
            </div>

            {/* Local Air Quality */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#1B211C] font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                <span>SECTOR 4 AMBIENT · 68 AQI</span>
              </div>
              <p className="text-[12px] text-[#5A625B] leading-snug">
                Moderate · Station 04 downwind · PM2.5 38.4 µg/m³ · Wind 4.2 m/s NW.
              </p>
            </div>

            {/* Measured Community Impact */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#1B211C] font-semibold">
                <CheckCircle2 size={13} className="text-[#5E7A29]" />
                <span>MEASURED IMPACT · 14.2 tCO₂e/DAY</span>
              </div>
              <p className="text-[12px] text-[#5A625B] leading-snug">
                Damper trim executed on Furnace F-101. +50 Community Impact Points granted on corroborated cases.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Filter Bar (Understated Hairline Controls) ──────────── */}
      <div className="border-b border-[#DAD8CC] bg-[#F4F3EC] sticky top-14 z-30">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-6 overflow-x-auto py-3 no-scrollbar text-xs font-mono">
            <span className="text-[10px] uppercase tracking-wider text-[#8C8F85] shrink-0">
              Filter by:
            </span>
            {(['ALL', 'SMOKE', 'WATER', 'ODOR', 'DUST', 'NOISE'] as FilterType[]).map((cat) => {
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`relative py-1 cursor-pointer transition-colors whitespace-nowrap focus-visible:outline-none ${
                    active
                      ? 'text-[#1B211C] font-bold'
                      : 'text-[#5A625B] hover:text-[#1B211C]'
                  }`}
                >
                  <span>{cat}</span>
                  {active && (
                    <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-[#5E7A29]" />
                  )}
                </button>
              );
            })}
            <span className="ml-auto text-[11px] text-[#8C8F85] font-mono shrink-0 hidden sm:inline">
              Showing {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Chronological Field Journal Entries ─────────────────── */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-8 py-8 space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="py-16 text-center space-y-2 border border-dashed border-[#DAD8CC] rounded-sm bg-[#EDECE3]/50">
            <p className="font-serif text-lg text-[#5A625B]">No journal entries in this category.</p>
            <p className="text-xs font-mono text-[#8C8F85]">
              Observations filed by residents will appear here as they are received.
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            return (
              <article
                key={entry.id}
                onClick={() => router.push(`/case/${entry.id}?level=field`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/case/${entry.id}?level=field`);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Open case ${entry.id}: ${entry.title}`}
                className="group block p-5 sm:p-6 rounded-sm border border-[#DAD8CC] bg-[#FBFAF5] hover:bg-white hover:border-[#5E7A29]/50 transition-all cursor-pointer shadow-none hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E7A29]"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left: Metadata & Observation Narrative */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    {/* Top Metadata Row */}
                    <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
                      <span className="font-bold text-[#1B211C] tracking-wide">
                        {entry.id}
                      </span>
                      <span className="text-[#8C8F85]">·</span>
                      <span className="text-[#5A625B] flex items-center gap-1">
                        <Clock size={12} className="text-[#8C8F85]" />
                        {entry.timestampFormatted}
                      </span>
                      <span className="text-[#8C8F85]">·</span>
                      <span className="text-[#5A625B] flex items-center gap-1 truncate max-w-[280px]">
                        <MapPin size={12} className="text-[#8C8F85]" />
                        {entry.locationName}
                      </span>
                    </div>

                    {/* Headline in Serif Newsreader */}
                    <h2 className="font-serif text-xl sm:text-2xl text-[#1B211C] group-hover:text-[#5E7A29] transition-colors leading-snug">
                      {entry.title}
                    </h2>

                    {/* Observation Excerpt */}
                    <p className="text-xs sm:text-sm text-[#5A625B] line-clamp-2 leading-relaxed">
                      &quot;{entry.description}&quot;
                    </p>

                    {/* Proximity / Equipment Context */}
                    {entry.facility && (
                      <div className="text-[11px] font-mono text-[#8C8F85] pt-0.5">
                        Correlated: <span className="text-[#1B211C] font-medium">{entry.facility}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Evidence Chain & Status Ledger */}
                  <div className="lg:w-80 shrink-0 flex flex-col justify-between items-start lg:items-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E5E3D8]">
                    {/* Status Indicator */}
                    <div className="flex items-center gap-2">
                      <StateMark state={entry.stateType} size="sm" showLabel={false} />
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#1B211C]">
                        {entry.status}
                      </span>
                    </div>

                    {/* Compact Convergence Chain (6 Signal Slots) */}
                    <div className="space-y-1 w-full lg:w-auto">
                      <div className="text-[10px] font-mono text-[#8C8F85] uppercase tracking-wider lg:text-right">
                        Corroboration Signals
                      </div>
                      <CompactChain signals={entry.signals} size="md" />
                    </div>

                    {/* Impact / Reward Badge */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      {entry.impactLabel && (
                        <span className="px-2 py-0.5 rounded-[2px] bg-[#EDECE3] text-[#5E7A29] font-medium text-[11px] border border-[#DAD8CC]">
                          {entry.impactLabel}
                        </span>
                      )}
                      {entry.pointsAwarded !== undefined && entry.pointsAwarded > 0 && (
                        <span className="px-2 py-0.5 rounded-[2px] bg-[#5E7A29]/10 text-[#5E7A29] font-bold text-[11px] border border-[#5E7A29]/30">
                          +{entry.pointsAwarded} pts
                        </span>
                      )}
                    </div>

                    {/* View Field Note Link Indicator */}
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5A625B] group-hover:text-[#5E7A29] pt-1">
                      <span>OPEN FIELD NOTE</span>
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </main>

      {/* ── Community Rewards & Civic Principles Banner ────────── */}
      <footer className="border-t border-[#DAD8CC] bg-[#EDECE3] mt-auto">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-[#5A625B]">
          <div className="flex items-center gap-2">
            <span className="text-[#5E7A29] font-bold">REPORTER TRUST & REWARDS:</span>
            <span>Useful, corroborated field observations earn Community Impact Points and trigger verified operational corrections.</span>
          </div>
          <div className="shrink-0">
            <DemoTag label="Demo data · Simulated telemetry · Prototype workflow" />
          </div>
        </div>
      </footer>
    </div>
  );
}
