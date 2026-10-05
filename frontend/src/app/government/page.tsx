'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AtmosphericShell from '@/components/shell/AtmosphericShell';
import StateMark from '@/components/primitives/StateMark';
import DemoTag from '@/components/primitives/DemoTag';
import { CompactChain } from '@/components/chain';
import { ReductionWedge } from '@/components/primitives';
import { api, GovernmentOverview, CommunityReport } from '@/lib/api';
import { normalizeFacilityName } from '@/lib/seed';
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
  AlertTriangle,
  Clock,
  MapPin,
  X,
  FileText,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
} from 'lucide-react';

interface GovCaseRecord {
  id: string;
  facility: string;
  sector: string;
  risk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  status: string;
  statusType: 'awaiting' | 'received' | 'corroborated' | 'verified';
  lastAction: string;
  nextAction: string;
  isStalled?: boolean;
  stalledReason?: string;
  signals: number[];
  coordinates: { lat: number; lng: number };
}

const CANONICAL_GOV_CASES: GovCaseRecord[] = [
  {
    id: 'COMM-2026-00421',
    facility: 'Orion Refining Complex',
    sector: 'Petrochemicals (North Train)',
    risk: 'HIGH',
    status: 'ACTION IN PROGRESS',
    statusType: 'verified',
    lastAction: 'Damper trim recalibrated to 1.042',
    nextAction: '4-hr CEMS compliance audit window',
    signals: [42, 96, 94, 95, 92, 96],
    coordinates: { lat: 17.4399, lng: 78.3845 },
  },
  {
    id: 'COMM-2026-00398',
    facility: 'Apex Chemical Logistics & Orion',
    sector: 'Stormwater Outfall 3',
    risk: 'CRITICAL',
    status: 'INSPECTION REQUESTED',
    statusType: 'corroborated',
    lastAction: 'ETP bypass valves locked and sealed',
    nextAction: 'Physical grab sample collection',
    isStalled: true,
    stalledReason: 'Awaiting Physical Grab Sampling (Lab Dispatch Pending)',
    signals: [70, 80, 60, 75, 20, 40],
    coordinates: { lat: 17.4431, lng: 78.3792 },
  },
  {
    id: 'COMM-2026-00405',
    facility: 'Orion Refining Complex',
    sector: 'SRU-2 Sulfur Condensate',
    risk: 'LOW',
    status: 'VERIFIED CLOSED',
    statusType: 'verified',
    lastAction: 'Seal pot vapor recovery loop installed',
    nextAction: 'Routine monthly emissions log review',
    signals: [85, 90, 82, 78, 80, 88],
    coordinates: { lat: 17.4350, lng: 78.3780 },
  },
  {
    id: 'COMM-2026-00376',
    facility: 'Deccan Clinker Terminal',
    sector: 'East Transit Haul Corridor',
    risk: 'MODERATE',
    status: 'CORROBORATING',
    statusType: 'awaiting',
    lastAction: 'Water misting truck dispatched',
    nextAction: 'Secondary PM10 sensor verification',
    isStalled: true,
    stalledReason: 'Awaiting Secondary Inspection (Wind Sensor Drift)',
    signals: [35, 30, 25, 40, 20, 30],
    coordinates: { lat: 17.4475, lng: 78.3910 },
  },
  {
    id: 'COMM-2026-00412',
    facility: 'Orion Refining Complex',
    sector: 'Cooling Tower CT-3',
    risk: 'MODERATE',
    status: 'WORK ORDER ISSUED',
    statusType: 'corroborated',
    lastAction: 'Fan #4 speed reduced by 18% on VFD',
    nextAction: 'Acoustic baffle replacement audit',
    signals: [60, 82, 75, 80, 70, 78],
    coordinates: { lat: 17.4325, lng: 78.3812 },
  },
];

function GovernmentInner() {
  const router = useRouter();
  const [overview, setOverview] = useState<GovernmentOverview | null>(null);
  const [cases, setCases] = useState<GovCaseRecord[]>(CANONICAL_GOV_CASES);
  const [selectedCase, setSelectedCase] = useState<GovCaseRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadGovData() {
      try {
        const res = await api.getGovernmentOverview();
        if (res) setOverview(res);
      } catch (err) {
        console.warn('Government overview fallback:', err);
      }
    }
    loadGovData();
  }, []);

  const openCaseDrawer = (c: GovCaseRecord) => {
    setSelectedCase(c);
    setDrawerOpen(true);
  };

  const closeCaseDrawer = () => {
    setDrawerOpen(false);
  };

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        closeCaseDrawer();
      }
    };
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  const handleMandateAction = async (actionType: string) => {
    if (!selectedCase) return;
    setActionLoading(true);
    try {
      await api.takeGovernmentAction(
        selectedCase.id,
        actionType,
        actionNotes || 'Formal regulatory mandate issued under Pact Clause 4.2.',
        'Dr. V. Prasad (Regional Environmental Officer)'
      );
      setActionNotes('');
      // Update local state
      setCases((prev) =>
        prev.map((c) =>
          c.id === selectedCase.id ? { ...c, status: 'MANDATE ISSUED', isStalled: false } : c
        )
      );
    } catch {
      // Local fallback
      setCases((prev) =>
        prev.map((c) =>
          c.id === selectedCase.id ? { ...c, status: 'MANDATE ISSUED', isStalled: false } : c
        )
      );
    } finally {
      setActionLoading(false);
    }
  };

  const stalledCases = cases.filter((c) => c.isStalled);

  return (
    <div
      className="min-h-screen flex flex-col bg-[#080A09] text-[#F1F3EE] transition-colors duration-300"
      data-atmosphere="control"
    >
      {/* ── Top 56px Global Command Bar ─────────────────────────── */}
      <AtmosphericShell />

      {/* ── Government Command Header Strip ─────────────────────── */}
      <header className="border-b border-[#242A27] bg-[#0E1110]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#A8C83A]">
              <Scale size={13} />
              <span>ENVIRONMENTAL COMMAND CENTER</span>
              <span className="text-[#626A65]">·</span>
              <span>STATE POLLUTION CONTROL AUTHORITY (SECTOR 4)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F3EE]">
              Regulatory Surveillance & Case Oversight
            </h1>
            <p className="text-xs text-[#929A95]">
              Autonomous cross-facility compliance monitoring, empirical corroboration tracking, and auditable enforcement workflows.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/government/pact"
              className="px-4 py-2.5 rounded bg-[#141817] hover:bg-[#1C221F] border border-[#A8C83A]/50 text-xs font-mono font-bold text-[#A8C83A] flex items-center gap-2 transition-colors shadow-sm"
            >
              <FileCheck2 size={14} />
              <span>TRIPARTITE PACT →</span>
            </Link>
          </div>
        </div>

        {/* ── Inline Summary Strip (Replacing 6 KPI Boxes) ──────── */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 border-t border-[#181E1C] py-3">
          <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-xs font-mono">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] text-[#626A65] uppercase">Open Cases:</span>
              <span className="text-base font-bold text-amber-400">4 Active</span>
            </div>
            <div className="w-[1px] h-4 bg-[#242A27] hidden sm:block" />

            <div className="flex items-baseline gap-2">
              <span className="text-[10px] text-[#626A65] uppercase">Stalled / Awaiting:</span>
              <span className="text-base font-bold text-red-400">2 Items</span>
            </div>
            <div className="w-[1px] h-4 bg-[#242A27] hidden sm:block" />

            <div className="flex items-baseline gap-2">
              <span className="text-[10px] text-[#626A65] uppercase">Corroborated:</span>
              <span className="text-base font-bold text-[#A8C83A]">4 / 5 Aligned</span>
            </div>
            <div className="w-[1px] h-4 bg-[#242A27] hidden sm:block" />

            <div className="flex items-baseline gap-2">
              <span className="text-[10px] text-[#626A65] uppercase">Verified This Period:</span>
              <span className="text-base font-bold text-[#A8C83A]">14.2 tCO₂e / day</span>
            </div>
            <div className="w-[1px] h-4 bg-[#242A27] hidden sm:block" />

            <div className="ml-auto text-[10px] text-[#626A65] font-mono hidden md:block">
              Continuous CEMS + Ambient Telemetry Active
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Government Dashboard Canvas ─────────────────────── */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-8 space-y-10">
        {/* ── 1. CASE REGISTER (MAIN VISUAL INSTRUMENT) ─────────── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#A8C83A] font-bold">
                PRIMARY SURVEILLANCE REGISTER
              </div>
              <h2 className="text-xl font-bold text-[#F1F3EE]">
                Sector 4 Active Environmental Cases
              </h2>
            </div>
            <span className="text-xs font-mono text-[#929A95]">
              Click any row to open the Auditable Case Drawer
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#242A27] bg-[#0E1110]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#242A27] bg-[#080A09] text-[10px] text-[#626A65] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Case</th>
                  <th className="py-3 px-4">Facility</th>
                  <th className="py-3 px-4">Sector Location</th>
                  <th className="py-3 px-4">Risk</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Action</th>
                  <th className="py-3 px-4 text-right">Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181E1C]">
                {cases.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => openCaseDrawer(c)}
                    className="hover:bg-[#141817] cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-bold text-[#F1F3EE] group-hover:text-[#A8C83A]">
                      {c.id}
                    </td>
                    <td className="py-3 px-4 text-[#F1F3EE]">{normalizeFacilityName(c.facility)}</td>
                    <td className="py-3 px-4 text-[#929A95]">{c.sector}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border ${
                          c.risk === 'CRITICAL'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30 font-bold'
                            : c.risk === 'HIGH'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : c.risk === 'MODERATE'
                            ? 'bg-[#141817] text-[#C4DF61] border-[#A8C83A]/30'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {c.risk}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-[#F1F3EE]">
                        <StateMark state={c.statusType} size="sm" showLabel={false} />
                        <span>{c.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#929A95] max-w-[200px] truncate">
                      {c.lastAction}
                    </td>
                    <td className="py-3 px-4 text-right text-[#A8C83A] font-medium max-w-[220px] truncate">
                      {c.nextAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 2. STALLED CASES DISCOVERY ─────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-red-400 font-bold">
              Stalled Cases Requiring Regulatory Escalation
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stalledCases.map((stalled) => (
              <div
                key={stalled.id}
                onClick={() => openCaseDrawer(stalled)}
                className="p-4 rounded-lg bg-[#0E1110] border border-red-900/40 hover:border-red-500/60 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#F1F3EE]">{stalled.id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-bold">
                    STALLED
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#F1F3EE]">{normalizeFacilityName(stalled.facility)}</div>
                  <div className="text-xs text-[#929A95]">{stalled.sector}</div>
                </div>

                <div className="p-2.5 rounded bg-[#080A09] border border-[#181E1C] text-xs font-mono space-y-1">
                  <div className="text-[10px] text-[#626A65] uppercase">Stalled Bottleneck:</div>
                  <div className="text-amber-400 font-medium">{stalled.stalledReason}</div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1 text-[#626A65]">
                  <span>Next: {stalled.nextAction}</span>
                  <span className="text-[#A8C83A] flex items-center gap-1 group-hover:underline">
                    <span>Inspect</span>
                    <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. FACILITY RISK REGISTER & MAP LENS ───────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Facility Risk Register (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#929A95]">
                Facility Risk Register
              </span>
              <span className="text-[10px] font-mono text-[#626A65]">3 Industrial Complexes</span>
            </div>

            <div className="space-y-3">
              {/* Facility 1: Orion Refining Complex */}
              <div className="p-4 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#F1F3EE]">Orion Refining Complex</h4>
                    <div className="text-[11px] font-mono text-[#929A95]">FAC-ORION-01 · Refining & Petrochemicals</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-[10px] text-[#626A65]">HEALTH INDEX</div>
                    <div className="text-base font-bold text-[#A8C83A]">87.3</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2 rounded bg-[#080A09] border border-[#181E1C]">
                    <div className="text-[10px] text-[#626A65]">ACTIVE DEVIATION</div>
                    <div className="text-amber-400 font-bold">NOx +31.4%</div>
                  </div>
                  <div className="p-2 rounded bg-[#080A09] border border-[#181E1C]">
                    <div className="text-[10px] text-[#626A65]">PACT STATUS</div>
                    <div className="text-[#A8C83A] font-bold">CLAUSE 4.2 ACTIVE</div>
                  </div>
                </div>

                <div className="text-[11px] text-[#929A95] font-mono flex items-center justify-between pt-1 border-t border-[#181E1C]">
                  <span>Next: 4-hr compliance audit verification</span>
                  <Link href="/industry?case=COMM-2026-00421" className="text-[#A8C83A] hover:underline flex items-center gap-1">
                    <span>Inspect Facility</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>

              {/* Facility 2: Apex Chemical Logistics */}
              <div className="p-4 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#F1F3EE]">Apex Chemical Logistics</h4>
                    <div className="text-[11px] font-mono text-[#929A95]">FAC-APEX-02 · Chemical Bulk Handling</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-[10px] text-[#626A65]">HEALTH INDEX</div>
                    <div className="text-base font-bold text-[#F1F3EE]">91.2</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2 rounded bg-[#080A09] border border-[#181E1C]">
                    <div className="text-[10px] text-[#626A65]">ACTIVE DEVIATION</div>
                    <div className="text-red-400 font-bold">Runoff TDS +112%</div>
                  </div>
                  <div className="p-2 rounded bg-[#080A09] border border-[#181E1C]">
                    <div className="text-[10px] text-[#626A65]">COMPLIANCE</div>
                    <div className="text-amber-400 font-bold">INSPECTION ORDERED</div>
                  </div>
                </div>

                <div className="text-[11px] text-[#929A95] font-mono flex items-center justify-between pt-1 border-t border-[#181E1C]">
                  <span>Next: Physical grab sample at Canal 3 outfall</span>
                  <span className="text-[#626A65]">Simulated telemetry</span>
                </div>
              </div>

              {/* Facility 3: Tata Power Unit 3 Cogen */}
              <div className="p-4 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#F1F3EE]">Tata Power Unit 3 Cogen</h4>
                    <div className="text-[11px] font-mono text-[#929A95]">FAC-TATA-03 · Thermal Cogeneration</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-[10px] text-[#626A65]">HEALTH INDEX</div>
                    <div className="text-base font-bold text-[#A8C83A]">96.4</div>
                  </div>
                </div>

                <div className="text-[11px] text-[#929A95] font-mono flex items-center justify-between pt-1 border-t border-[#181E1C]">
                  <span>Status: Fully compliant with Clause 4.2 emissions limits</span>
                  <span className="text-[#A8C83A]">Zero Breaches</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Lens (6 cols) */}
          <div className="lg:col-span-6 p-5 rounded-lg bg-[#0E1110] border border-[#242A27] flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A8C83A] font-bold">
                  GEOSPATIAL CLUSTER LENS
                </span>
                <h3 className="text-base font-bold text-[#F1F3EE]">
                  Sector 4 Industrial Incident Clusters
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#626A65] border border-[#242A27] px-2 py-0.5 rounded">
                REPRESENTATIVE SECTOR 4 GEOSPATIAL CLUSTERING · DEMO DATA
              </span>
            </div>

            {/* Stylized Geospatial Coordinate Grid */}
            <div className="relative h-64 w-full rounded bg-[#080A09] border border-[#242A27] overflow-hidden p-4 flex flex-col justify-between">
              {/* Map grid lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#1E2622_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              <div className="flex justify-between text-[10px] font-mono text-[#626A65] relative z-10">
                <span>17.450°N / 78.370°E</span>
                <span>Sector 4 Regulatory Boundary</span>
              </div>

              {/* Pin 1: North Stack F-101 */}
              <div
                onClick={() => openCaseDrawer(CANONICAL_GOV_CASES[0])}
                className="absolute top-16 left-32 cursor-pointer group flex items-center gap-1.5"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500/30 border border-amber-400 flex items-center justify-center animate-ping" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute left-0.5 top-0.5" />
                <span className="ml-3 text-[10px] font-mono bg-[#0E1110] px-1.5 py-0.5 rounded border border-[#242A27] text-[#F1F3EE] whitespace-nowrap">
                  COMM-00421 (NOx Plume)
                </span>
              </div>

              {/* Pin 2: Canal Outfall 3 */}
              <div
                onClick={() => openCaseDrawer(CANONICAL_GOV_CASES[1])}
                className="absolute top-28 left-56 cursor-pointer group flex items-center gap-1.5"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="text-[10px] font-mono bg-[#0E1110] px-1.5 py-0.5 rounded border border-[#242A27] text-red-400 whitespace-nowrap">
                  COMM-00398 (Canal 3)
                </span>
              </div>

              {/* Pin 3: West Colony Buffer */}
              <div
                onClick={() => openCaseDrawer(CANONICAL_GOV_CASES[2])}
                className="absolute bottom-16 left-20 cursor-pointer group flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-[#A8C83A]" />
                <span className="text-[10px] font-mono bg-[#0E1110] px-1.5 py-0.5 rounded border border-[#242A27] text-[#A8C83A] whitespace-nowrap">
                  COMM-00405 (Resolved)
                </span>
              </div>

              {/* Pin 4: East Haul Road */}
              <div
                onClick={() => openCaseDrawer(CANONICAL_GOV_CASES[3])}
                className="absolute bottom-20 right-16 cursor-pointer group flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400/80" />
                <span className="text-[10px] font-mono bg-[#0E1110] px-1.5 py-0.5 rounded border border-[#242A27] text-[#929A95] whitespace-nowrap">
                  COMM-00376 (Dust)
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-[#626A65] relative z-10 pt-2 border-t border-[#181E1C]">
                <span>Clusters: 2 Industrial · 1 Drainage · 1 Haulage</span>
                <span>Zoom: Regional Corridor</span>
              </div>
            </div>

            <p className="text-[11px] text-[#929A95]">
              Sensor spatial fusion compares citizen report coordinates with continuous downwind monitoring buffers to detect industrial clusters.
            </p>
          </div>
        </section>

        {/* ── 4. RESTORATION (HERO LOWER-PAGE IMPACT) ────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#A8C83A] font-bold">
                REGULATORY RESTORATION LEDGER
              </div>
              <h2 className="text-xl font-bold text-[#F1F3EE]">
                Measured Environmental Improvement Under Pact Clause 4.2
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30">
                MEASURED RESULT · DEMO DATA
              </span>
            </div>
          </div>

          {/* Full Reduction Wedge Hero Component */}
          <ReductionWedge
            dailyReductionTons={14.2}
            annualizedReductionTons={5183}
            noxDailyReductionKg={28.6}
            facilityName="Orion Refining Complex (Furnace F-101 Train)"
            sourceName="Regional Pact Compliance Sector 4"
            interventionName="Damper Trim 1.042 Mandate Executed"
            isVerified={true}
          />
        </section>
      </main>

      {/* ── CASE DRAWER (SLIDE-OVER WITHOUT LOSING REGISTER) ─────── */}
      {drawerOpen && selectedCase && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={closeCaseDrawer}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer Canvas */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Government Case Dossier Drawer"
            className="relative w-full max-w-xl bg-[#0E1110] border-l border-[#242A27] h-full overflow-y-auto p-6 sm:p-8 space-y-6 z-10 shadow-2xl animate-in slide-in-from-right duration-300 text-[#F1F3EE]"
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#242A27]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#A8C83A]">
                    {selectedCase.id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-[#F1F3EE] border border-[#242A27]">
                    {selectedCase.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#F1F3EE] mt-1">
                  {normalizeFacilityName(selectedCase.facility)}
                </h3>
                <div className="text-xs text-[#929A95] font-mono">
                  {selectedCase.sector} · {selectedCase.coordinates.lat}°N, {selectedCase.coordinates.lng}°E
                </div>
              </div>

              <button
                type="button"
                onClick={closeCaseDrawer}
                className="p-1.5 rounded bg-[#141817] hover:bg-[#1C221F] border border-[#242A27] text-[#929A95] hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Evidence Corroboration Chain */}
            <div className="p-4 rounded bg-[#080A09] border border-[#242A27] space-y-2">
              <div className="text-[10px] font-mono text-[#626A65] uppercase">
                Sensor Evidence Corroboration
              </div>
              <CompactChain signals={selectedCase.signals} size="md" />
              <div className="text-[11px] text-[#929A95] pt-1">
                Convergence of citizen imagery, continuous stack CEMS, and downwind AQI monitor.
              </div>
            </div>

            {/* Regulatory Actions (Prototype Workflow) */}
            <div className="p-4 rounded bg-[#141817] border border-[#242A27] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-[#A8C83A]">
                  REGULATORY DIRECTIVES & MANDATES
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#080A09] text-[#C4DF61] border border-[#A8C83A]/30">
                  PROTOTYPE WORKFLOW
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Optional regulatory instruction notes..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#080A09] border border-[#242A27] text-xs font-mono text-[#F1F3EE] focus:outline-none focus:border-[#A8C83A]"
                />

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleMandateAction('MANDATE_INSPECTION')}
                    className="p-2.5 rounded bg-[#080A09] hover:bg-[#121614] border border-[#242A27] text-[#F1F3EE] hover:text-[#A8C83A] transition-colors text-left"
                  >
                    1. Mandate Inspection
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleMandateAction('ISSUE_CLAUSE_42_ADVISORY')}
                    className="p-2.5 rounded bg-[#080A09] hover:bg-[#121614] border border-[#242A27] text-[#F1F3EE] hover:text-[#A8C83A] transition-colors text-left"
                  >
                    2. Issue Clause 4.2 Notice
                  </button>
                </div>
              </div>
            </div>

            {/* Auditable Event Trail */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#929A95] uppercase">Auditable Event Trail</span>
                <span className="text-[10px] text-[#A8C83A]">AUDITABLE EVENT TRAIL · PROTOTYPE WORKFLOW</span>
              </div>

              <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27] space-y-2.5 text-xs font-mono">
                <div className="flex items-start gap-2">
                  <span className="text-[#626A65]">09:42:15</span>
                  <div className="text-[#929A95]">
                    Citizen optical report registered with location consent.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#626A65]">09:42:48</span>
                  <div className="text-[#A8C83A]">
                    ONER Core auto-correlated with CEMS Station #2 (89.4% agreement).
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#626A65]">09:45:00</span>
                  <div className="text-[#F1F3EE]">
                    Orion Control Room acknowledged incident; dispatched WO #WO-8821.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#626A65]">09:51:30</span>
                  <div className="text-[#A8C83A]">
                    Damper trim setpoint calibrated to 1.042; NOx returning below 100 mg.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#626A65]">10:05:00</span>
                  <div className="text-amber-400">
                    Regulator logged Clause 4.2 advisory; 4-hr compliance audit window active.
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Link to Full Case Dossier */}
            <div className="pt-2 flex justify-between items-center border-t border-[#242A27]">
              <span className="text-xs font-mono text-[#626A65]">
                Complete evidence package
              </span>
              <Link
                href={`/case/${selectedCase.id}?level=control`}
                className="px-4 py-2 rounded bg-[#A8C83A] hover:bg-[#b8d844] text-[#080A09] font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>OPEN FULL CASE DOSSIER</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-[#181E1C] bg-[#0E1110] mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-[#626A65]">
          <div className="flex items-center gap-2">
            <span>REGIONAL ENVIRONMENTAL COMMAND</span>
            <span>·</span>
            <span>PACT CLAUSE 4.2 OVERSIGHT</span>
          </div>
          <div>
            <DemoTag label="Demo data · Simulated telemetry · Prototype workflow" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function GovernmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080A09] text-white p-8">Loading environmental command center...</div>}>
      <GovernmentInner />
    </Suspense>
  );
}
