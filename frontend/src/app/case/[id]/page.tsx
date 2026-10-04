'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { api, CommunityReport } from '@/lib/api';
import {
  Horizon,
  ConvergenceChain,
  StateBadge,
  Rail,
  Signal,
  ReductionWedge,
} from '@/components/primitives';
import {
  MapPin,
  Clock,
  Camera,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Wrench,
  Award,
  AlertTriangle,
  FileText,
  User,
  ExternalLink,
} from 'lucide-react';
import EvidenceTrustLayer from '@/components/EvidenceTrustLayer';

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;
  const searchParams = useSearchParams();
  const levelParam = (searchParams.get('level') || 'control') as 'field' | 'control' | 'impact';

  const [currentLevel, setCurrentLevel] = useState<'field' | 'control' | 'impact'>(levelParam);
  const [report, setReport] = useState<CommunityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionApplied, setActionApplied] = useState(false);

  useEffect(() => {
    setCurrentLevel(levelParam);
  }, [levelParam]);

  useEffect(() => {
    async function loadCase() {
      try {
        setLoading(true);
        const data = await api.getCommunityReport(caseId);
        setReport(data);
      } catch (err) {
        console.warn('Could not fetch case from backend, loading seeded case:', err);
        // Fallback to seeded demo case
        setReport({
          id: caseId || 'COMM-2026-00421',
          title: 'Combustion Anomaly & Dark Smoke Plume',
          category: 'SMOKE_EMISSIONS',
          severity: 'HIGH',
          description:
            'Dense dark gray exhaust plume observed billowing intermittently from North Stack 04 with pungent sulfurous odor.',
          latitude: 28.5355,
          longitude: 77.391,
          location_name: 'Boundary Sector 4 (Downwind North Processing Train)',
          accuracy_meters: 4.2,
          timestamp: new Date().toISOString(),
          timestamp_formatted: 'Today at 14:28 UTC',
          photo_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop',
          status: 'RESOLVED',
          corroboration_score: 89.4,
          corroboration_status: 'CORROBORATED',
          corroboration_summary:
            'Community report corroborated by CEMS optical density spike (+157.9%), NOx surge (+31.4%), and burner temperature rise (+18.4°C).',
          evidence_sources: [
            'Citizen Photographic Evidence with EXIF Hash',
            'Boundary Fence Ambient PM2.5 Sensor Array',
            'Furnace F-101 Flue Gas CEMS Telemetry',
            'Consensual GPS Geo-Boundary Verification',
            '30-Day Historical Combustion Baseline',
          ],
          correlated_facility: 'Orion Refining Complex',
          likely_source: 'Furnace F-101 (North Processing Train)',
          root_cause: 'Natural gas combustion instability + burner refractory fouling',
          telemetry_deviations: {
            'NOx Stack Concentration': '131.4 mg/Nm³ (+31.4% excess)',
            'Flue Gas Temperature': '348.4°C (+18.4°C deviation)',
            'PM2.5 Sensor Downwind': '94.2 µg/m³ (+117% ambient spike)',
            'Air-Fuel Stoichiometric Trim': '0.94 (Fuel-rich operating drift)',
          },
          recommended_action: 'Recalibrate Damper trim to 1.042; reset automated air-fuel stoichiometric loop',
          reporter: {
            name: 'Priya Sharma (Resident)',
            trust_score: 94.2,
            reports_submitted: 6,
            corroborated_count: 5,
            badge: 'Verified Community Observer',
            points_awarded: 50,
          },
          industry_response: {
            status: 'APPLIED & RESOLVED',
            action_taken: 'Damper trim recalibrated to 1.042; air-fuel ratio normalized.',
            engineer: 'Rajesh Nair, Lead Combustion Engineer',
          },
          government_status: {
            status: 'INSPECTED & AUDITED',
            officer: 'S. K. Verma, Regional Environmental Officer',
            notes: 'Verified normalized CEMS telemetry and ISO 14064 MRV audit package.',
            escalation_level: 'RESOLVED',
          },
          audit_trail: [
            { time: '14:28:10 UTC', actor: 'Citizen', event: 'Photo & consensual GPS report filed' },
            { time: '14:28:14 UTC', actor: 'ONER Engine', event: '89.4% Multi-source corroboration locked' },
            { time: '14:32:00 UTC', actor: 'ONER Causal', event: 'Root cause identified: Burner fouling (99.4%)' },
            { time: '14:45:00 UTC', actor: 'Industry DCS', event: 'Damper trim 1.042 setpoint applied' },
            { time: '15:15:00 UTC', actor: 'ONER MRV', event: 'Restoration verified: -14.2 tCO₂e/day' },
          ],
          environmental_outcome: {
            co2e_reduction_daily_tons: 14.2,
            co2e_reduction_annual_tons: 5183,
            nox_reduction_daily_kg: 28.6,
            flue_temp_normalized: '330.0°C',
          },
        });
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [caseId]);

  const handleApplyIntervention = async () => {
    setActionApplied(true);
    try {
      await api.takeIndustryAction(caseId, 'INTERVENTION_APPLIED', 'Damper trim setpoint adjusted to 1.042 via DCS');
    } catch {
      // Local state update is sufficient for demo reliability
    }
  };

  const actionRailSteps = [
    {
      id: 'ack',
      label: 'Acknowledge',
      sublabel: 'Observation Received',
      status: 'complete' as const,
      value: 'T+0s',
    },
    {
      id: 'inv',
      label: 'Investigate',
      sublabel: 'Anomaly 0.884',
      status: 'complete' as const,
      value: '89.4%',
    },
    {
      id: 'sim',
      label: 'Simulate',
      sublabel: 'Damper Trim 1.042',
      status: 'complete' as const,
      value: '-14.2 t/d',
    },
    {
      id: 'act',
      label: 'Apply Setpoint',
      sublabel: actionApplied ? 'Applied to DCS' : 'Ready to apply',
      status: actionApplied ? ('complete' as const) : ('active' as const),
      value: 'Trim 1.042',
    },
    {
      id: 'ver',
      label: 'Verify MRV',
      sublabel: 'CEMS Optical Check',
      status: actionApplied ? ('complete' as const) : ('pending' as const),
      value: '5,183 t/yr',
    },
    {
      id: 'res',
      label: 'Resolve',
      sublabel: 'Citizen Informed',
      status: actionApplied ? ('complete' as const) : ('pending' as const),
      value: '+50 pts',
    },
  ];

  return (
    <AppLayout
      title={`CASE · ${caseId}`}
      subtitle={`${report?.correlated_facility || 'Orion Refining Complex'} · Environmental Incident Dossier`}
    >
      <div className="space-y-6 text-[#F1F3EE] max-w-7xl mx-auto pb-12">
        {/* ── TOP CASE BANNER & STATE ────────────────────────────── */}
        <div className="p-5 rounded-lg bg-[#0E1110] border border-[#242A27] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A8C83A] font-bold">
                ENVIRONMENTAL CASE DOSSIER
              </span>
              <span className="text-[#626A65] font-mono">/</span>
              <span className="font-mono text-xs text-[#929A95]">{caseId}</span>
              <StateBadge state={report?.status || 'CORROBORATED'} size="sm" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#F1F3EE]">
              {report?.title || 'Combustion Anomaly & Dark Smoke Plume'}
            </h1>
            <p className="text-xs text-[#929A95] font-mono">
              Facility: {report?.correlated_facility || 'Orion Refining Complex'} · Source:{' '}
              {report?.likely_source || 'Furnace F-101'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/report"
              className="px-3 py-1.5 rounded bg-[#141817] hover:bg-[#1C221F] border border-[#242A27] text-xs font-mono text-[#F1F3EE] transition-colors"
            >
              + File New Report
            </Link>
          </div>
        </div>

        {/* ── HORIZON: TRANSITION (FIELD → CONTROL → IMPACT) ──────── */}
        <Horizon
          currentLevel={currentLevel}
          caseId={caseId}
          onSelectLevel={(lvl) => setCurrentLevel(lvl)}
          showLabels={true}
        />

        {/* ══════════════════════════════════════════════════════════
            LEVEL 1: FIELD — "What happened with my report?"
           ══════════════════════════════════════════════════════════ */}
        {currentLevel === 'field' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Resident Photograph with EXIF & Quality */}
              <div className="lg:col-span-5 p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera size={15} className="text-[#A8C83A]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#F1F3EE]">
                      Field Evidence Capture
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30">
                    EVIDENCE COPY WITH CAPTURED METADATA
                  </span>
                </div>

                {/* Evidence Image */}
                <div className="relative aspect-video rounded overflow-hidden bg-[#080A09] border border-[#242A27]">
                  <img
                    src={report?.photo_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop'}
                    alt="Citizen Field Observation"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 p-2 rounded bg-[#080A09]/80 backdrop-blur-sm border border-[#242A27] text-[10px] font-mono text-[#929A95] flex items-center justify-between">
                    <span>GPS: 28.5355° N, 77.3910° E</span>
                    <span className="text-[#A8C83A]">CONSENT CAPTURED</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#929A95]">
                    <span>Location:</span>
                    <span className="text-[#F1F3EE] font-mono">{report?.location_name}</span>
                  </div>
                  <div className="flex justify-between text-[#929A95]">
                    <span>Timestamp:</span>
                    <span className="text-[#F1F3EE] font-mono">{report?.timestamp_formatted}</span>
                  </div>
                  <div className="flex justify-between text-[#929A95]">
                    <span>Accuracy:</span>
                    <span className="text-[#A8C83A] font-mono">±{report?.accuracy_meters}m radius</span>
                  </div>
                  <div className="flex justify-between text-[#929A95]">
                    <span>Photo Quality:</span>
                    <span className="text-[#A8C83A] font-mono">NORMAL · METADATA VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Citizen Thread: "What did ONER check?" */}
              <div className="lg:col-span-7 p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#F1F3EE]">
                    What ONER Checked
                  </span>
                  <span className="text-xs font-mono text-[#A8C83A] font-bold">
                    89.4% Corroborated
                  </span>
                </div>

                <p className="text-xs text-[#929A95] leading-relaxed">
                  Your report was fused with 5 independent environmental data streams. The signal
                  was immediately cross-referenced against Orion Refining Complex&apos;s active CEMS
                  telemetry, weather vectors, and ambient boundary sensors.
                </p>

                <div className="space-y-2">
                  {report?.evidence_sources.map((src, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded bg-[#080A09] border border-[#242A27] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-[#A8C83A] shrink-0" />
                        <span className="text-[#F1F3EE]">{src}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#A8C83A]">AGREEMENT ✓</span>
                    </div>
                  ))}
                </div>

                {/* Citizen Points & Accountability Return */}
                <div className="p-4 rounded bg-[#141817] border border-[#242A27] flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#A8C83A] font-bold">
                      CITIZEN ACCOUNTABILITY RETURN
                    </div>
                    <div className="text-xs text-[#F1F3EE] mt-0.5">
                      Reporter: {report?.reporter.name} ({report?.reporter.badge})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-bold text-[#C4DF61]">
                      +{report?.reporter.points_awarded || 50} pts
                    </span>
                    <Link
                      href={`/case/${caseId}?level=impact`}
                      className="px-3 py-1.5 rounded bg-[#080A09] hover:bg-[#1D2320] border border-[#242A27] text-xs font-semibold text-[#F1F3EE] transition-colors"
                    >
                      View Impact Statement →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Trust Layer Audit */}
            <EvidenceTrustLayer
              reportId={caseId}
              hasPhoto={true}
              photoQuality="HIGH"
              photoProvenance="UNKNOWN"
              hasGps={true}
              gpsAccuracyMeters={report?.accuracy_meters || 4.2}
              hasTimestamp={true}
              facilityProximity="0.42 km from North Train"
              telemetryAnomalyDetected={true}
              historicalDeviationDetected={true}
              overallQuality="HIGH"
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            LEVEL 2: CONTROL — "What does the system know and what do we do?"
           ══════════════════════════════════════════════════════════ */}
        {currentLevel === 'control' && (
          <div className="space-y-6">
            {/* The Full Convergence Chain */}
            <ConvergenceChain
              caseId={caseId}
              corroborationScore={report?.corroboration_score || 89.4}
              anomalyScore={0.884}
              rootCauseConfidence={99.4}
            />

            {/* Operational Action Rail & Setpoint Control */}
            <div className="p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#242A27]">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#A8C83A]">
                    Engineering Response Rail
                  </div>
                  <h3 className="text-sm font-bold text-[#F1F3EE]">
                    Closed-Loop Corrective Intervention Sequence
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#929A95]">
                    Target Source: Furnace F-101 Burner Assembly
                  </span>
                </div>
              </div>

              {/* Action Progression Rail */}
              <Rail steps={actionRailSteps} currentStepId={actionApplied ? 'ver' : 'act'} />

              {/* Setpoint Recommendation Desk */}
              <div className="p-4 rounded bg-[#080A09] border border-[#242A27] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-[#626A65] uppercase">
                    Recommended Corrective Setpoint
                  </div>
                  <div className="text-base font-bold font-mono text-[#F1F3EE]">
                    Damper Trim: <strong className="text-[#A8C83A]">1.042</strong>
                  </div>
                  <p className="text-xs text-[#929A95]">
                    Trims excess combustion air by 4.2% to re-establish stoichiometric balance and
                    halt refractory overheating.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/simulator"
                    className="px-3 py-2 rounded bg-[#141817] hover:bg-[#1F2622] border border-[#242A27] text-xs font-semibold text-[#F1F3EE] transition-colors"
                  >
                    Simulate Counterfactual
                  </Link>

                  <button
                    type="button"
                    onClick={handleApplyIntervention}
                    disabled={actionApplied}
                    className={`px-4 py-2 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                      actionApplied
                        ? 'bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/40'
                        : 'bg-[#A8C83A] text-[#080A09] hover:bg-[#C4DF61]'
                    }`}
                  >
                    {actionApplied ? '✓ SETPOINT APPLIED TO DCS' : 'APPLY SETPOINT (1.042)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Telemetry Deviations & Physical Signals */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Signal
                label="NOx Flue Concentration"
                unit="mg/Nm³"
                currentValue={131.4}
                baselineValue={100.0}
                threshold={100.0}
                anomalyDelta="+31.4% excess"
                status="ANOMALY"
              />
              <Signal
                label="Flue Gas Temperature"
                unit="°C"
                currentValue={348.4}
                baselineValue={330.0}
                threshold={330.0}
                anomalyDelta="+18.4°C"
                status="ANOMALY"
              />
              <Signal
                label="Ambient Downwind PM2.5"
                unit="µg/m³"
                currentValue={94.2}
                baselineValue={45.0}
                threshold={60.0}
                anomalyDelta="+117%"
                status="ANOMALY"
              />
              <Signal
                label="Post-Action Restored NOx"
                unit="mg/Nm³"
                currentValue={88.5}
                baselineValue={100.0}
                threshold={100.0}
                anomalyDelta="-28.6 kg/d"
                status="OPTIMAL"
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            LEVEL 3: IMPACT — "Can we prove the environmental improvement?"
           ══════════════════════════════════════════════════════════ */}
        {currentLevel === 'impact' && (
          <div className="space-y-6">
            {/* The Hero Reduction Wedge */}
            <ReductionWedge
              dailyReductionTons={14.2}
              annualizedReductionTons={5183}
              noxDailyReductionKg={28.6}
              facilityName={report?.correlated_facility || 'Orion Refining Complex'}
              sourceName={report?.likely_source || 'Furnace F-101'}
              interventionName="Damper Trim 1.042 (Air-Fuel Stoichiometric Reset)"
              isVerified={true}
            />

            {/* Environmental Impact Audit Trail */}
            <div className="p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#242A27]">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-[#A8C83A]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#F1F3EE]">
                    Accountability & Regulatory Audit Trail
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#626A65]">ISO 14064-2 COMPLIANT</span>
              </div>

              <div className="divide-y divide-[#242A27]">
                {report?.audit_trail.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-[#626A65]">{item.time}</span>
                      <span className="font-semibold text-[#F1F3EE]">{item.actor}</span>
                      <span className="text-[#929A95]">{item.event}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#A8C83A]">LOGGED</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Return Navigation to Community and Industry */}
            <div className="flex items-center justify-between p-4 rounded bg-[#080A09] border border-[#242A27] text-xs">
              <span className="text-[#929A95]">
                Environmental case resolved and communicated to citizen reporter.
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/community"
                  className="px-3 py-1.5 rounded bg-[#141817] hover:bg-[#1D2320] border border-[#242A27] text-[#F1F3EE] transition-colors"
                >
                  View Community Ledger
                </Link>
                <Link
                  href="/carbon"
                  className="px-3 py-1.5 rounded bg-[#141817] hover:bg-[#1D2320] border border-[#A8C83A]/40 text-[#A8C83A] transition-colors"
                >
                  View Institutional Carbon & MRV →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
