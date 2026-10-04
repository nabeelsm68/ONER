'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ShieldAlert,
  Flame,
  Binary,
} from 'lucide-react';

interface ScoreDefinitionsProps {
  variant?: 'inline' | 'button-modal' | 'strip';
}

export default function ScoreDefinitions({ variant = 'strip' }: ScoreDefinitionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const definitions = [
    {
      title: 'ANOMALY SCORE',
      value: '0.884',
      status: 'HIGH DEVIATION',
      statusColor: 'text-amber-400 border-amber-500/25 bg-amber-500/10',
      model: 'Isolation Forest (200 trees, 9-variable telemetry matrix)',
      question: 'How unusual is the operating state relative to learned patterns?',
      explanation:
        'This score indicates how unusual the operating condition is relative to learned normal operating patterns. It is computed by an unsupervised Scikit-learn Isolation Forest on high-dimensional plant telemetry, not a subjective guess.',
      drivers: [
        'Furnace Stack Temperature +18.4°C drift',
        'Burner Air-Fuel sub-stoichiometric ratio (0.94)',
        'Stack NOx concentration 131.4 mg/Nm³',
      ],
    },
    {
      title: 'CORROBORATION SCORE',
      value: '89.4%',
      status: 'CORROBORATED',
      statusColor: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10',
      model: 'Deterministic Multi-Channel Evidence Fusion Model',
      question: 'How strongly do independent evidence sources agree?',
      explanation:
        'Indicates the degree of cross-validation between community observations and independent physical telemetry. Not a probability that a citizen is telling the truth, but an algorithmic synthesis of 6 independent data pipes.',
      weights: [
        { name: 'Telemetry alignment', weight: '30%', score: '28.2%' },
        { name: 'Location proximity (<400m)', weight: '20%', score: '18.4%' },
        { name: 'Temporal alignment (<15 min)', weight: '15%', score: '14.1%' },
        { name: 'Ambient sensor agreement (AQ-04)', weight: '15%', score: '13.8%' },
        { name: 'Historical baseline deviation', weight: '10%', score: '9.2%' },
        { name: 'Evidence quality & GPS precision', weight: '10%', score: '5.7%' },
      ],
      total: '89.4%',
    },
    {
      title: 'ROOT-CAUSE CONFIDENCE',
      value: '99.4%',
      status: 'HIGH CONFIDENCE',
      statusColor: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10',
      model: 'Deterministic Causal Graph Traversal Engine',
      question: 'Strength of evidence supporting the identified contributing cause.',
      explanation:
        'Measures the mathematical congruence between detected deviations and physical fault physics. Indicates the likelihood that the identified failure mode explains the observed cluster of symptoms.',
      drivers: [
        'Primary Cause: Thermal efficiency degradation & combustion instability',
        'Contributing Signal: Fuel gas pressure fluctuations on Burner Plenum 4B',
        'Contributing Signal: Stack temperature elevation (+18.4°C)',
        'Contributing Signal: Excess optical density spike (CEMS #2)',
      ],
    },
    {
      title: 'ENVIRONMENTAL HEALTH INDEX',
      value: '87.3',
      status: 'AT RISK / ATTENTION',
      statusColor: 'text-amber-400 border-amber-500/25 bg-amber-500/10',
      model: 'Rolling 30-Day Normalized Intensity Deviation Model',
      question: 'Overall environmental condition & operational sustainability.',
      explanation:
        'Aggregate operational and environmental KPI computed as: 100 - Σ(weighted normalized deviation from 30-day baseline). Penalizes chronic and acute deviations from nominal facility operations.',
      drivers: [
        'Carbon Intensity Weight: 30%',
        'Energy Intensity Weight: 25%',
        'Water Intensity Weight: 15%',
        'Emissions (NOx & PM2.5) Weight: 20%',
        'Solid Waste Intensity Weight: 10%',
      ],
    },
    {
      title: 'DECISION-SUPPORT RISK SCORE',
      value: 'HIGH',
      status: 'LEVEL 1 ATTENTION',
      statusColor: 'text-red-400 border-red-500/25 bg-red-500/10',
      model: 'Multi-Factor Regulatory & Community Risk Matrix',
      question: 'Current operational, regulatory, and public health concern level.',
      explanation:
        'Actionable decision indicator factoring parameter threshold excess, anomaly persistence, community complaint clusters, and Environmental Pact breach liability.',
      drivers: [
        'NOx concentration +31.4% above Pact threshold',
        'Open citizen report COMM-2026-00421 in active triage',
        'Illustrative monthly pact penalty accrual: ₹4,85,000',
      ],
    },
    {
      title: 'MRV READINESS SCORE',
      value: 'MRV-READY (88%)',
      status: 'AUDIT PENDING',
      statusColor: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10',
      model: 'ISO 14064-2 & GHG Protocol Audit Completeness Index',
      question: 'How complete is the measurement, reporting, and verification dossier?',
      explanation:
        'Evaluates completeness of pre- and post-intervention telemetry, sensor calibration certificates, tamper-evident audit trails, and third-party verifier alignment.',
      drivers: [
        'Baseline Data Quality: 88% (90 days operational records)',
        'Monitoring Plan: Complete (Continuous CEMS & SCADA meters)',
        'Reporting Protocol: ISO 14064-2 aligned digital dossier',
        'Independent Verification: Pending accredited third-party audit',
      ],
    },
  ];

  if (variant === 'button-modal') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141817] hover:bg-[#1a221e] border border-[#242A27] text-xs font-mono text-[#A8C83A] hover:text-[#C4DF61] transition-colors cursor-pointer"
        >
          <HelpCircle size={13} />
          <span>Score Definitions & Methodology</span>
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0E1110] border border-[#242A27] rounded-xl shadow-2xl p-6 space-y-6 custom-scrollbar text-[#F1F3EE]">
              <div className="flex items-center justify-between pb-3 border-b border-[#242A27]">
                <div className="flex items-center gap-2">
                  <Binary size={18} className="text-[#A8C83A]" />
                  <h3 className="text-base font-bold text-zinc-100">
                    ONER Score Definitions & Explainable Intelligence Model
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg bg-[#141817] hover:bg-[#1e2521] border border-[#242A27] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {definitions.map((def) => (
                  <div
                    key={def.title}
                    className="p-4 rounded-lg bg-[#080A09] border border-[#242A27] space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-200 tracking-wide font-sans text-xs">
                        {def.title}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold ${def.statusColor}`}
                      >
                        {def.status}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-mono font-bold text-zinc-100">
                        {def.value}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {def.model}
                      </span>
                    </div>

                    <div className="text-[11px] font-medium text-[#A8C83A]">
                      {def.question}
                    </div>

                    <p className="text-[11px] text-[#929A95] leading-relaxed">
                      {def.explanation}
                    </p>

                    {def.weights && (
                      <div className="pt-2 border-t border-[#181E1C] space-y-1 font-mono text-[10px]">
                        <div className="text-[10px] font-sans font-semibold text-zinc-400 uppercase">
                          Deterministic Weight Breakdown:
                        </div>
                        {def.weights.map((w) => (
                          <div key={w.name} className="flex justify-between text-zinc-400">
                            <span>{w.name} ({w.weight}):</span>
                            <span className="text-emerald-400 font-bold">{w.score}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {def.drivers && (
                      <div className="pt-2 border-t border-[#181E1C] space-y-0.5 text-[10px] text-zinc-400">
                        <div className="text-[10px] font-sans font-semibold text-zinc-400 uppercase mb-1">
                          Contributing Signals:
                        </div>
                        {def.drivers.map((d, i) => (
                          <div key={i} className="flex items-center gap-1.5 truncate">
                            <span className="w-1 h-1 rounded-full bg-[#A8C83A]" />
                            <span className="truncate">{d}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#242A27] flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded bg-[#141817] hover:bg-[#1a221e] border border-[#242A27] text-xs font-medium text-zinc-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default: strip variant
  return (
    <div className="p-4 rounded-xl bg-[#080A09] border border-[#242A27] space-y-3 text-[#F1F3EE]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Binary size={15} className="text-[#A8C83A]" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            Score Definitions & Explainable Models
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#929A95]">
          Deterministic Causal Inference
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        {definitions.map((def) => (
          <div
            key={def.title}
            className="p-2.5 rounded bg-[#0E1110] border border-[#181E1C] flex flex-col justify-between group hover:border-[#242A27] transition-colors"
          >
            <div>
              <div className="text-[9px] font-mono uppercase text-[#929A95] truncate">
                {def.title}
              </div>
              <div className="text-lg font-mono font-bold text-zinc-100 mt-1">
                {def.value}
              </div>
            </div>
            <div className="text-[10px] text-zinc-400 font-sans mt-2 line-clamp-2 leading-tight">
              {def.question}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
