'use client';

import React from 'react';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Activity,
  Layers,
  Clock,
  Database,
  ArrowRight,
} from 'lucide-react';
import { EnvironmentalImpactReport as EnvironmentalImpactReportType } from '@/lib/api';

interface EnvironmentalImpactReportProps {
  report: EnvironmentalImpactReportType;
  isCompact?: boolean;
}

interface DataSourceRow {
  name: string;
  type: string;
  status: 'AVAILABLE' | 'SIMULATED' | 'PENDING' | 'MISSING';
  details: string;
}

const DEFAULT_DATA_SOURCES: DataSourceRow[] = [
  {
    name: 'Citizen Optical Report & Description',
    type: 'Community Evidence',
    status: 'AVAILABLE',
    details: 'Timestamped observation (14:02 IST) from verified resident',
  },
  {
    name: 'GPS Geolocation & Time Vector',
    type: 'Mobile Evidence Stamp',
    status: 'AVAILABLE',
    details: '17.4399° N, 78.3845° E (±12m radius, user consented)',
  },
  {
    name: 'Stack CEMS Optical Density Analyzer',
    type: 'Simulated CEMS Sensor',
    status: 'SIMULATED',
    details: 'Stack 4B optical attenuation and opacity trace (1.0 Hz)',
  },
  {
    name: 'Stack Continuous NOx Analyzer',
    type: 'Simulated CEMS Sensor',
    status: 'SIMULATED',
    details: 'Chemi-luminescence reading: 131.4 mg/Nm³ → 88.5 mg/Nm³',
  },
  {
    name: 'SCADA Air-Fuel Stoichiometric Telemetry',
    type: 'Plant Fieldbus / SCADA',
    status: 'SIMULATED',
    details: 'Furnace F-101 damper position & fuel gas mass flow rate',
  },
  {
    name: 'Regional Ambient AQI Station (AQ-04)',
    type: 'Ambient Monitoring',
    status: 'SIMULATED',
    details: 'Sector 4 EPA-standard station 400m downwind (PM2.5 / PM10)',
  },
  {
    name: '30-Day Operational Baseline Model',
    type: 'Historical Baseline',
    status: 'SIMULATED',
    details: 'Rolling median baseline under nominal production output',
  },
  {
    name: 'Accredited Third-Party Verification Body',
    type: 'Independent Audit',
    status: 'PENDING',
    details: 'ISO 14064-3 third-party verification audit scheduled',
  },
];

export default function EnvironmentalImpactReport({
  report,
  isCompact = false,
}: EnvironmentalImpactReportProps) {
  const mrv = report.mrv_pipeline;
  const before = report.before_intervention;
  const after = report.after_intervention;
  const carbon = report.potential_carbon_credit;

  const getStatusBadge = (status: DataSourceRow['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'SIMULATED':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'PENDING':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'MISSING':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
  };

  return (
    <div className="space-y-6 text-[#F1F3EE]">
      {/* ── Case Context & Chain Header ───────────────────────── */}
      <div className="p-5 rounded-lg bg-[#080A09] border border-[#242A27] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#181E1C]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30 font-semibold">
                CASE: {report.report_id}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#141817] text-zinc-400 border border-[#242A27]">
                ISO 14064-2 MRV DOSSIER
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                {mrv.verification_status}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#F1F3EE]">
              Environmental Impact & MRV Audit Report
            </h3>
          </div>

          <div className="text-right sm:text-right">
            <div className="text-[10px] uppercase font-sans text-[#929A95]">Facility & Target</div>
            <div className="text-xs font-semibold text-zinc-200">
              {report.facility_name}
            </div>
            <div className="text-[11px] font-mono text-[#929A95]">
              {report.likely_source}
            </div>
          </div>
        </div>

        {/* Root Cause & Corrective Action Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded bg-[#0E1110] border border-[#242A27]">
            <div className="text-[10px] uppercase font-sans text-amber-400 font-semibold mb-1">
              Identified Root Cause
            </div>
            <div className="text-zinc-200 font-medium">{report.root_cause}</div>
          </div>
          <div className="p-3 rounded bg-[#0E1110] border border-[#242A27]">
            <div className="text-[10px] uppercase font-sans text-[#A8C83A] font-semibold mb-1">
              Executed Corrective Action
            </div>
            <div className="text-zinc-200 font-medium">{report.corrective_action}</div>
          </div>
        </div>

        {/* 5-Stage Accountability Vector */}
        <div className="pt-2">
          <div className="text-[10px] uppercase font-sans text-[#929A95] font-semibold mb-2">
            The Complete Operational Chain
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            {['COMMUNITY EVIDENCE', 'ONER INTELLIGENCE', 'INDUSTRY ACTION', 'MRV VERIFICATION', 'MEASURED IMPACT'].map(
              (step, idx, arr) => (
                <React.Fragment key={step}>
                  <span className="px-2 py-1 rounded bg-[#141817] border border-[#242A27] text-zinc-300">
                    <span className="text-[#A8C83A] font-bold mr-1">0{idx + 1}</span>
                    {step}
                  </span>
                  {idx < arr.length - 1 && (
                    <span className="text-zinc-600 font-sans">→</span>
                  )}
                </React.Fragment>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── BEFORE → INTERVENTION → AFTER ENVIRONMENTAL IMPACT ──── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#F1F3EE]">
            Comparative Environmental Impact Audit
          </div>
          <span className="text-[10px] font-mono text-[#929A95]">
            BEFORE → INTERVENTION → AFTER
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* 1. BEFORE */}
          <div className="p-4 rounded-lg bg-[#080A09] border border-red-500/25 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-sans font-bold text-red-400">
                1. Before Intervention
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
                BREACH RISK
              </span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between py-1 border-b border-[#181E1C]">
                <span className="text-[#929A95] font-sans">Stack NOx:</span>
                <span className="text-red-400 font-bold">{before.nox_concentration}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#181E1C]">
                <span className="text-[#929A95] font-sans">Daily CO₂e Rate:</span>
                <span className="text-zinc-300">{before.co2e_daily_rate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#181E1C]">
                <span className="text-[#929A95] font-sans">Energy Intensity:</span>
                <span className="text-zinc-300">{before.energy_intensity}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#929A95] font-sans">State:</span>
                <span className="text-amber-400">{before.environmental_status}</span>
              </div>
            </div>
          </div>

          {/* 2. INTERVENTION */}
          <div className="p-4 rounded-lg bg-[#080A09] border border-[#A8C83A]/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-sans font-bold text-[#A8C83A]">
                2. Engineering Intervention
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#A8C83A]/10 text-[#A8C83A] border border-[#A8C83A]/30 font-semibold">
                EXECUTED
              </span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-[#929A95] font-sans text-[10px] uppercase block">Setpoint Action:</span>
                <span className="font-mono text-zinc-100 font-bold">Damper Trim recalibrated to 1.042</span>
              </div>
              <div>
                <span className="text-[#929A95] font-sans text-[10px] uppercase block">Control Loop:</span>
                <span className="text-zinc-300 font-sans">Air-fuel stoichiometric ratio normalized to 1.02</span>
              </div>
              <div className="pt-1 border-t border-[#181E1C]">
                <span className="text-[#929A95] font-sans text-[10px] uppercase block">Trigger Origin:</span>
                <span className="text-zinc-400 font-mono text-[10px]">Corroborated Case {report.report_id}</span>
              </div>
            </div>
          </div>

          {/* 3. AFTER */}
          <div className="p-4 rounded-lg bg-[#080A09] border border-emerald-500/25 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-sans font-bold text-emerald-400">
                3. After Intervention
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                NORMALIZED
              </span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between py-1 border-b border-[#181E1C]">
                <span className="text-[#929A95] font-sans">Stack NOx:</span>
                <span className="text-emerald-400 font-bold">{after.nox_concentration}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#181E1C]">
                <span className="text-[#929A95] font-sans">Daily CO₂e Rate:</span>
                <span className="text-emerald-400">{after.co2e_daily_rate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#181E1C]">
                <span className="text-[#929A95] font-sans">Energy Intensity:</span>
                <span className="text-emerald-400">{after.energy_intensity}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#929A95] font-sans">State:</span>
                <span className="text-emerald-400">{after.environmental_status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── THE M - R - V DECONSTRUCTION ──────────────────────── */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#F1F3EE]">
          MRV Protocol Execution (Measure · Report · Verify)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* M - Measure */}
          <div className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
                <span className="w-5 h-5 rounded bg-[#141817] text-[#A8C83A] flex items-center justify-center font-mono text-[10px]">
                  M
                </span>
                <span>MEASURE</span>
              </div>
              <span className="text-[10px] font-mono text-[#A8C83A]">01</span>
            </div>
            <p className="text-[11px] text-[#929A95] leading-relaxed">
              {mrv.measure}
            </p>
            <div className="pt-2 border-t border-[#181E1C] space-y-1 font-mono text-[10px]">
              <div className="flex justify-between text-zinc-400">
                <span>Baseline CO₂e:</span>
                <span className="text-zinc-200">{mrv.baseline_emissions_t_co2e_day} t/day</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Post-Action CO₂e:</span>
                <span className="text-emerald-400">{mrv.post_action_emissions_t_co2e_day} t/day</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Window:</span>
                <span className="text-zinc-300 font-sans">{mrv.time_period}</span>
              </div>
            </div>
          </div>

          {/* R - Report */}
          <div className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
                <span className="w-5 h-5 rounded bg-[#141817] text-[#A8C83A] flex items-center justify-center font-mono text-[10px]">
                  R
                </span>
                <span>REPORT</span>
              </div>
              <span className="text-[10px] font-mono text-[#A8C83A]">02</span>
            </div>
            <p className="text-[11px] text-[#929A95] leading-relaxed">
              {mrv.report}
            </p>
            <div className="pt-2 border-t border-[#181E1C] space-y-1 font-mono text-[10px]">
              <div className="flex justify-between text-zinc-400">
                <span>Daily Abatement:</span>
                <span className="text-emerald-400 font-bold">↓ {mrv.daily_reduction_t_co2e} tCO₂e/day</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Percentage Reduction:</span>
                <span className="text-emerald-400 font-bold">{mrv.percentage_reduction}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Monthly Abatement:</span>
                <span className="text-zinc-200">{mrv.monthly_reduction_t_co2e} tCO₂e</span>
              </div>
            </div>
          </div>

          {/* V - Verify */}
          <div className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
                <span className="w-5 h-5 rounded bg-[#141817] text-[#A8C83A] flex items-center justify-center font-mono text-[10px]">
                  V
                </span>
                <span>VERIFY</span>
              </div>
              <span className="text-[10px] font-mono text-[#A8C83A]">03</span>
            </div>
            <p className="text-[11px] text-[#929A95] leading-relaxed">
              {mrv.verify}
            </p>
            <div className="pt-2 border-t border-[#181E1C] space-y-1 font-mono text-[10px]">
              <div className="flex justify-between text-zinc-400">
                <span>Evidence Streams:</span>
                <span className="text-zinc-200">5 Corroborating Pipes</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Correlation Index:</span>
                <span className="text-emerald-400 font-bold">{mrv.confidence_score}% Verified</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Audit Status:</span>
                <span className="text-amber-300 font-sans">Pending Third-Party</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MRV DATA SOURCES AUDIT LEDGER ─────────────────────── */}
      <div className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              MRV Data Sources & Sensor Traceability
            </div>
            <div className="text-[10px] text-[#929A95] mt-0.5">
              Transparently labeled sensor pipelines. Hackathon mode relies on simulated telemetry and prototype community data.
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-zinc-400 border border-[#242A27]">
            8 DATA FEEDS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#242A27] text-[10px] text-[#929A95] uppercase font-sans">
                <th className="pb-2">Evidence Stream</th>
                <th className="pb-2">Classification</th>
                <th className="pb-2">Integration State</th>
                <th className="pb-2">Telemetry Audit Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181E1C]">
              {DEFAULT_DATA_SOURCES.map((src) => (
                <tr key={src.name} className="hover:bg-[#0E1110] transition-colors">
                  <td className="py-2.5 text-zinc-200 font-sans font-medium text-[11px] pr-2">
                    {src.name}
                  </td>
                  <td className="py-2.5 text-[#929A95] text-[10px] pr-2">{src.type}</td>
                  <td className="py-2.5 pr-2">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold ${getStatusBadge(
                        src.status
                      )}`}
                    >
                      {src.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-[#929A95] text-[10px] font-sans">{src.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ANNUALIZED IMPACT & POTENTIAL CREDITABLE REDUCTION ── */}
      <div className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Potential Creditable Reduction & Annualized Volume
            </span>
            <div className="text-[10px] text-[#929A95] mt-0.5">
              Annualized emissions reduction calculated as: Daily Reduction (14.2 t) × 365 days
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
            {carbon.crediting_status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27]">
            <div className="text-[9px] uppercase font-sans text-zinc-500">Daily Abatement</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              -{mrv.daily_reduction_t_co2e} tCO₂e/day
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27]">
            <div className="text-[9px] uppercase font-sans text-zinc-500">
              Annualized CO₂e Reduction
            </div>
            <div className="text-base font-bold text-[#A8C83A] mt-0.5">
              {carbon.annualized_reduction_volume}
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27]">
            <div className="text-[9px] uppercase font-sans text-zinc-500">
              Potential Creditable Volume
            </div>
            <div className="text-base font-bold text-zinc-100 mt-0.5">
              {carbon.potential_creditable_volume}
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#0E1110] border border-[#242A27]">
            <div className="text-[9px] uppercase font-sans text-zinc-500">Illustrative Valuation</div>
            <div className="text-base font-bold text-teal-400 mt-0.5">
              {carbon.illustrative_credit_value_inr}
            </div>
          </div>
        </div>

        {/* Mandatory Carbon Credit Language & Disclaimer Note (Section 11) */}
        <div className="flex items-start gap-2.5 p-3 rounded bg-[#141817] border border-[#242A27] text-[11px] text-[#929A95]">
          <Info size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-zinc-200">Carbon Crediting Notice: </strong>
            ONER estimates emissions reductions and MRV readiness. Actual environmental or carbon-credit issuance requires an applicable methodology, eligibility assessment and independent verification. Values shown are potential impact estimates and do not constitute authorized credit generation.
          </p>
        </div>
      </div>
    </div>
  );
}
