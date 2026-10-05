'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { api, EnvironmentalPact } from '@/lib/api';
import {
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Scale,
  Building2,
  UserCheck,
  Award,
} from 'lucide-react';
import { StateBadge } from '@/components/primitives';

export default function GovernmentPactPage() {
  const [pact, setPact] = useState<EnvironmentalPact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.getPact();
        setPact(res);
      } catch (err) {
        console.error('Pact load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppLayout
      title="Environmental Pact"
      subtitle="Tripartite Agreement · Community · Industry · State Regulatory Authority"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12 text-[#F1F3EE]">
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="p-5 rounded-lg bg-[#0E1110] border border-[#242A27] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-[#A8C83A] uppercase font-bold tracking-wider">
                TRIPARTITE OVERSIGHT FRAMEWORK · CLAUSE 4.2
              </span>
              <StateBadge state="Verified" size="sm" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EE]">
              Tripartite Environmental Accountability Pact
            </h1>
            <p className="text-xs text-[#929A95] mt-0.5">
              Binding agreement between Orion Refining Complex, Sector 4 Citizen Council, and the State Pollution Control Authority.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/government"
              className="px-3 py-1.5 rounded bg-[#141817] hover:bg-[#1C221F] border border-[#242A27] text-xs font-mono text-[#929A95] hover:text-[#F1F3EE] transition-colors"
            >
              ← Command Center
            </Link>
          </div>
        </div>

        {/* ── 3 SIGNATORIES ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pact?.signatories.map((sig, i) => (
            <div key={i} className="p-4 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#626A65]">
                <span>Signatory 0{i + 1}</span>
                <span className="text-[#A8C83A]">EXECUTED ✓</span>
              </div>
              <div className="text-xs font-semibold text-[#A8C83A] uppercase font-mono">
                {sig.role}
              </div>
              <div className="text-sm font-bold text-[#F1F3EE]">{sig.entity}</div>
              <div className="text-xs font-mono text-[#929A95] pt-2 border-t border-[#242A27]">
                Signatory: {sig.signatory}
              </div>
            </div>
          ))}
        </div>

        {/* ── MONITORED PARAMETERS & THRESHOLD TABLE ─────────────────────── */}
        <div className="p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#626A65] tracking-wider">
                CLAUSE 4.2 OPERATIONAL THRESHOLDS
              </div>
              <h2 className="text-sm font-bold text-[#F1F3EE]">
                Continuous Emission Limits & Telemetry Triggers
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-[#929A95] border border-[#242A27]">
              Next Audit: {pact?.next_audit_date || '15 Nov 2026'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#242A27] text-[10px] uppercase font-mono text-[#626A65]">
                  <th className="pb-2.5">Parameter</th>
                  <th className="pb-2.5">Code</th>
                  <th className="pb-2.5">Prescribed Limit</th>
                  <th className="pb-2.5">Active Telemetry</th>
                  <th className="pb-2.5">Excess / Margin</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C221F]">
                {pact?.monitored_parameters.map((p) => {
                  const isBreach = p.status === 'BREACH';
                  const isWarning = p.status === 'WARNING';

                  return (
                    <tr key={p.code} className="hover:bg-[#141817] transition-colors">
                      <td className="py-3 font-semibold text-[#F1F3EE]">{p.name}</td>
                      <td className="py-3 font-mono text-[#929A95]">{p.code}</td>
                      <td className="py-3 font-mono text-[#929A95]">
                        {p.threshold} {p.unit}
                      </td>
                      <td className="py-3 font-mono font-bold text-[#F1F3EE]">
                        {p.current} {p.unit}
                      </td>
                      <td className="py-3 font-mono">
                        {p.excess_pct > 0 ? (
                          <span className="text-red-400 font-bold">+{p.excess_pct}%</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">Compliant</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <StateBadge
                          state={isBreach ? 'CONFLICT' : isWarning ? 'STALLED' : 'VERIFIED'}
                          size="sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FINANCIAL ACCRUAL MODEL ────────────────────────────────────── */}
        <div className="p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#242A27]">
            <span className="font-mono text-[10px] uppercase font-bold text-[#F1F3EE]">
              Illustrative Financial Mechanism & Community Benefit Fund
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30 font-bold">
              ILLUSTRATIVE POLICY MODEL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27] space-y-1">
              <div className="text-[10px] uppercase font-sans text-[#626A65]">
                Monthly Penalty Accrual (Under Active Breach)
              </div>
              <div className="text-2xl font-bold text-red-400">
                ₹{pact?.illustrative_financial_model.excess_penalty_monthly_inr.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#929A95] font-sans">
                Escrows to municipal downwind clean air fund if unresolved within 48 hours.
              </div>
            </div>

            <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27] space-y-1">
              <div className="text-[10px] uppercase font-sans text-[#626A65]">
                Compliance Rebate / Incentive Pool
              </div>
              <div className="text-2xl font-bold text-[#A8C83A]">
                ₹{pact?.illustrative_financial_model.compliance_incentive_monthly_inr.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#929A95] font-sans">
                Awarded upon continuous 90-day CEMS adherence and verified community MRV resolution.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
