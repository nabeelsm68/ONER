'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import {
  TrendingUp,
  DollarSign,
  Building,
  ShieldCheck,
  Layers,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowRight,
  Database,
} from 'lucide-react';
import { api, ImpactModel } from '@/lib/api';

const TIERS = [
  { id: '1_community', label: '1 Community Pilot', facilities: 1, grant: 10 },
  { id: '1_facility', label: '1 Facility Anchor', facilities: 1, grant: 10 },
  { id: '10_facilities', label: '10 Facilities', facilities: 10, grant: 35 },
  { id: 'industrial_cluster', label: 'Industrial Cluster (35)', facilities: 35, grant: 80 },
  { id: 'city', label: 'Metropolitan Area (80)', facilities: 80, grant: 150 },
  { id: 'region', label: 'State / Region (220)', facilities: 220, grant: 350 },
];

export default function ImpactPage() {
  const [model, setModel] = useState<ImpactModel | null>(null);
  const [selectedTier, setSelectedTier] = useState('industrial_cluster');

  // Interactive calculator parameters
  const [facilitiesCount, setFacilitiesCount] = useState(35);
  const [subFeeLakhs, setSubFeeLakhs] = useState(12.0); // ₹12 Lakhs/yr
  const [onboardFeeLakhs, setOnboardFeeLakhs] = useState(3.5); // ₹3.5 Lakhs
  const [govGrantLakhs, setGovGrantLakhs] = useState(45.0); // ₹45 Lakhs cluster grant

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getImpactModel();
        setModel(res);
      } catch (err) {
        console.error('Impact model load error:', err);
      }
    }
    load();
  }, []);

  const handleTierChange = (tierId: string) => {
    setSelectedTier(tierId);
    const match = TIERS.find((t) => t.id === tierId);
    if (match) {
      setFacilitiesCount(match.facilities);
      setGovGrantLakhs(match.grant);
    }
  };

  // Calculations
  const annualSubscriptionRev = facilitiesCount * subFeeLakhs;
  const onboardingRev = facilitiesCount * onboardFeeLakhs;
  const totalRevenueLakhs = annualSubscriptionRev + onboardingRev + govGrantLakhs;
  const estOperatingCostLakhs = Math.round(25 + facilitiesCount * 2.2);
  const netMarginLakhs = totalRevenueLakhs - estOperatingCostLakhs;
  const netMarginPct = Math.round((netMarginLakhs / totalRevenueLakhs) * 100);
  const breakEvenFacilities = Math.ceil(estOperatingCostLakhs / subFeeLakhs);
  const co2AbatedTonnes = facilitiesCount * 5183;

  return (
    <AppLayout
      title="IMPACT & SCALE"
      subtitle="Economic Sustainability & Regional Deployment Model"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12 text-[#F1F3EE]">
        {/* ── Subheader Notice ────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#242A27]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#141817] border border-[#242A27] text-xs font-medium text-[#A8C83A] mb-2">
              <TrendingUp size={14} />
              <span>Economic Model & Regional Abatement Scale</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#F1F3EE]">
              Commercialization Framework & Scale Unit Economics
            </h2>
            <p className="text-xs text-[#929A95] mt-1 max-w-2xl">
              Unit economics, municipal co-funding, and transparent data source audit architecture for network deployment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              ILLUSTRATIVE POLICY & ECONOMIC MODEL
            </span>
          </div>
        </div>

        {/* ── Four Business Model Pillars ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {model?.pillars.map((pillar) => (
            <div key={pillar.id} className="p-4 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-[#A8C83A] font-semibold">
                  {pillar.subtitle}
                </span>
                <h3 className="text-sm font-semibold text-[#F1F3EE]">{pillar.title}</h3>
                <p className="text-xs text-[#929A95] leading-relaxed">{pillar.description}</p>
              </div>

              <div className="pt-3 border-t border-[#242A27] space-y-1">
                <div className="font-mono text-xs font-bold text-[#F1F3EE]">{pillar.unit_pricing_inr}</div>
                <div className="text-[10px] text-[#626A65]">{pillar.roi_mechanism}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Interactive Economic Scale Calculator ────────────────── */}
        <div className="rounded-lg bg-[#0E1110] border border-[#242A27] p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242A27]">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-[#A8C83A]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#F1F3EE]">
                Interactive Scale & Impact Calculator
              </span>
            </div>

            {/* Tier buttons */}
            <div className="flex flex-wrap gap-1.5">
              {TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => handleTierChange(tier.id)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    selectedTier === tier.id
                      ? 'bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/40 font-semibold'
                      : 'bg-[#080A09] text-[#929A95] border border-[#242A27] hover:text-[#F1F3EE]'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders & Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded bg-[#080A09] border border-[#242A27] text-xs">
            <div className="space-y-1.5">
              <label className="text-[#929A95] font-medium block">
                Facilities Onboarded: <span className="text-[#F1F3EE] font-mono font-bold">{facilitiesCount}</span>
              </label>
              <input
                type="range"
                min={1}
                max={250}
                value={facilitiesCount}
                onChange={(e) => setFacilitiesCount(Number(e.target.value))}
                className="w-full accent-[#A8C83A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#929A95] font-medium block">
                Annual Subscription: <span className="text-[#F1F3EE] font-mono font-bold">₹{subFeeLakhs}L</span> / facility
              </label>
              <input
                type="range"
                min={5}
                max={30}
                step={0.5}
                value={subFeeLakhs}
                onChange={(e) => setSubFeeLakhs(Number(e.target.value))}
                className="w-full accent-[#A8C83A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#929A95] font-medium block">
                Onboarding Integration: <span className="text-[#F1F3EE] font-mono font-bold">₹{onboardFeeLakhs}L</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={onboardFeeLakhs}
                onChange={(e) => setOnboardFeeLakhs(Number(e.target.value))}
                className="w-full accent-[#A8C83A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#929A95] font-medium block">
                Government Deployment: <span className="text-[#F1F3EE] font-mono font-bold">₹{govGrantLakhs}L</span>
              </label>
              <input
                type="range"
                min={0}
                max={500}
                step={5}
                value={govGrantLakhs}
                onChange={(e) => setGovGrantLakhs(Number(e.target.value))}
                className="w-full accent-[#A8C83A]"
              />
            </div>
          </div>

          {/* Calculated Results Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-mono">
            <div className="p-3 rounded bg-[#080A09] border border-[#242A27]">
              <div className="text-[10px] uppercase font-sans text-[#626A65]">Gross Annual Revenue</div>
              <div className="text-xl font-bold text-[#F1F3EE] font-mono mt-0.5">
                ₹{totalRevenueLakhs.toFixed(1)}L
              </div>
              <div className="text-[10px] text-[#626A65] font-sans">₹{(totalRevenueLakhs / 100).toFixed(2)} Cr</div>
            </div>

            <div className="p-3 rounded bg-[#080A09] border border-[#242A27]">
              <div className="text-[10px] uppercase font-sans text-[#626A65]">Estimated Operating Cost</div>
              <div className="text-xl font-bold text-[#929A95] font-mono mt-0.5">
                ₹{estOperatingCostLakhs.toFixed(1)}L
              </div>
              <div className="text-[10px] text-[#626A65] font-sans">Cloud + Audit Support</div>
            </div>

            <div className="p-3 rounded bg-[#080A09] border border-[#242A27]">
              <div className="text-[10px] uppercase font-sans text-[#626A65]">Net Operating Margin</div>
              <div className="text-xl font-bold text-[#A8C83A] font-mono mt-0.5">
                {netMarginPct}%
              </div>
              <div className="text-[10px] text-[#626A65] font-sans">₹{netMarginLakhs.toFixed(1)}L net</div>
            </div>

            <div className="p-3 rounded bg-[#080A09] border border-[#242A27]">
              <div className="text-[10px] uppercase font-sans text-[#626A65]">Break-Even Point</div>
              <div className="text-xl font-bold text-[#F1F3EE] font-mono mt-0.5">
                {breakEvenFacilities} Facilities
              </div>
              <div className="text-[10px] text-[#626A65] font-sans">At current cost basis</div>
            </div>

            <div className="p-3 rounded bg-[#080A09] border border-[#242A27]">
              <div className="text-[10px] uppercase font-sans text-[#626A65]">Annual CO₂ Abated</div>
              <div className="text-xl font-bold text-[#A8C83A] font-mono mt-0.5">
                {co2AbatedTonnes.toLocaleString()} t
              </div>
              <div className="text-[10px] text-[#626A65] font-sans">Across {facilitiesCount} units</div>
            </div>
          </div>
        </div>

        {/* ── Data Source Transparency Layer ───────────────────────── */}
        <div className="rounded-lg bg-[#0E1110] border border-[#242A27] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-[#A8C83A]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#F1F3EE]">
                Data Pipeline & Credibility Transparency Layer
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#626A65]">Audit Status Standard</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {model?.data_sources.map((src, i) => (
              <div key={i} className="p-3 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#F1F3EE] truncate">{src.name}</span>
                  <span
                    className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                      src.status === 'SIMULATED TELEMETRY'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {src.status}
                  </span>
                </div>
                <div className="text-[11px] text-[#929A95]">{src.type}</div>
                <div className="text-[10px] font-mono text-[#626A65] pt-1 flex items-center justify-between">
                  <span>Update Frequency:</span>
                  <span className="text-[#F1F3EE]">{src.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
