'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Camera,
  MapPin,
  Clock,
  Radio,
  FileQuestion,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface EvidenceTrustProps {
  reportId?: string;
  hasPhoto?: boolean;
  photoQuality?: 'HIGH' | 'MEDIUM' | 'LOW';
  photoProvenance?: 'VERIFIED' | 'SUSPICIOUS' | 'UNKNOWN';
  hasGps?: boolean;
  gpsAccuracyMeters?: number;
  hasTimestamp?: boolean;
  facilityProximity?: string;
  telemetryAnomalyDetected?: boolean;
  historicalDeviationDetected?: boolean;
  overallQuality?: 'HIGH' | 'MEDIUM' | 'LOW';
  status?: string;
}

export default function EvidenceTrustLayer({
  reportId = 'COMM-2026-00421',
  hasPhoto = true,
  photoQuality = 'HIGH',
  photoProvenance = 'UNKNOWN',
  hasGps = true,
  gpsAccuracyMeters = 12,
  hasTimestamp = true,
  facilityProximity = '380m from Furnace F-101 Stack',
  telemetryAnomalyDetected = true,
  historicalDeviationDetected = true,
  overallQuality = 'HIGH',
  status = 'CORROBORATED',
}: EvidenceTrustProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Derive quality badge styles
  const qualityStyles = {
    HIGH: {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      label: 'HIGH EVIDENCE QUALITY',
      bar: 'bg-emerald-400',
    },
    MEDIUM: {
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      label: 'MEDIUM EVIDENCE QUALITY',
      bar: 'bg-amber-400',
    },
    LOW: {
      badge: 'bg-red-500/10 text-red-400 border-red-500/25',
      label: 'LOW EVIDENCE QUALITY',
      bar: 'bg-red-400',
    },
  }[overallQuality];

  const checks = [
    {
      label: 'Optical Evidence Captured',
      status: hasPhoto ? 'PASS' : 'FAIL',
      detail: hasPhoto
        ? `Photo attached · Quality: ${photoQuality}`
        : 'No photo provided',
      subtext:
        photoQuality === 'LOW'
          ? 'Notice: Low resolution / blurry optics. Corroboration relies on physical sensor cross-check.'
          : undefined,
    },
    {
      label: 'GPS Geolocation Consented',
      status: hasGps ? 'PASS' : 'FAIL',
      detail: hasGps ? `Radius accuracy: ±${gpsAccuracyMeters}m` : 'Location absent',
    },
    {
      label: 'Cryptographic Timestamp Stamp',
      status: hasTimestamp ? 'PASS' : 'FAIL',
      detail: hasTimestamp ? 'Synced with network time server' : 'Timestamp missing',
    },
    {
      label: 'Facility Proximity & Quadrant Match',
      status: 'PASS',
      detail: facilityProximity,
    },
    {
      label: 'CEMS & SCADA Telemetry Anomaly',
      status: telemetryAnomalyDetected ? 'PASS' : 'FAIL',
      detail: telemetryAnomalyDetected
        ? 'CEMS Stack sensor spike coincides with report time'
        : 'No telemetry deviation detected',
    },
    {
      label: 'Historical 30-Day Operational Baseline',
      status: historicalDeviationDetected ? 'PASS' : 'FAIL',
      detail: historicalDeviationDetected
        ? 'Thermal efficiency deviation > 2.5σ from baseline'
        : 'Within normal baseline variance',
    },
    {
      label: 'Image Provenance Assessment',
      status: photoProvenance === 'SUSPICIOUS' ? 'WARN' : 'PASS',
      detail:
        photoProvenance === 'UNKNOWN'
          ? 'PROVENANCE: UNKNOWN / UNVERIFIED (No AI detector claimed)'
          : photoProvenance === 'SUSPICIOUS'
          ? 'SUSPICIOUS / UNVERIFIED — Contradicted by optical density'
          : 'Verified direct camera stream',
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-[#080A09] border border-[#242A27] space-y-3.5 text-[#F1F3EE]">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#181E1C]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#A8C83A]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Evidence Trust & Provenance Layer
              </span>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold ${qualityStyles.badge}`}
              >
                {qualityStyles.label}
              </span>
            </div>
            <div className="text-[10px] text-[#929A95] font-sans">
              Multi-channel corroboration protocol · Evidence Fusion Framework
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-[11px] font-mono text-[#A8C83A] hover:text-[#C4DF61] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Trust Audit' : 'Inspect 7 Verification Checks'}</span>
          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* ── Evidence Fusion Core Principle ────────────────────── */}
      <div className="flex items-start gap-2.5 p-2.5 rounded bg-[#0E1110] border border-[#181E1C] text-[11px] text-[#929A95] leading-relaxed">
        <Info size={14} className="text-[#A8C83A] flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-zinc-200 font-sans">Evidence Fusion Principle: </strong>
          Citizen photos are never treated as sole ground truth. ONER fuses community observations with continuous facility telemetry, meteorological dispersion, and historical baselines to produce an accountable intelligence signal.
        </div>
      </div>

      {/* ── Low Photo Quality / Blurry Warning (If Applicable) ── */}
      {photoQuality === 'LOW' && (
        <div className="flex items-start gap-2 p-2.5 rounded bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300">
          <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase font-mono text-[10px]">Photo Quality: LOW · Report Continues: </span>
            Optical resolution is degraded or blurry. The report remains active and is corroborated through physical stack telemetry, ambient air-quality sensor AQ-04, and GPS spatial consistency.
          </div>
        </div>
      )}

      {/* ── Checklist (Always or Collapsible) ─────────────────── */}
      {isExpanded && (
        <div className="pt-2 space-y-2 text-xs">
          <div className="text-[10px] uppercase font-sans text-zinc-400 font-semibold">
            Automated Evidence Integrity Checks
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {checks.map((chk, idx) => (
              <div
                key={chk.label}
                className="p-2.5 rounded bg-[#0E1110] border border-[#181E1C] flex items-start gap-2"
              >
                <div className="mt-0.5">
                  {chk.status === 'PASS' ? (
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  ) : chk.status === 'WARN' ? (
                    <AlertTriangle size={13} className="text-amber-400" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-red-500/40 text-red-400 flex items-center justify-center text-[9px]">
                      &times;
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-200">{chk.label}</span>
                    <span className="text-[9px] font-mono text-zinc-500">0{idx + 1}</span>
                  </div>
                  <div className="text-[10px] text-[#929A95] font-mono mt-0.5 truncate">
                    {chk.detail}
                  </div>
                  {chk.subtext && (
                    <div className="text-[10px] text-amber-400 font-sans mt-0.5">
                      {chk.subtext}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
