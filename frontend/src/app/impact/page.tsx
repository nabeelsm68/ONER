'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const co2AbatedTonnes = facilitiesCount * 5180;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-[#F2F3EF]">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#202525]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#121515] border border-[#202525] text-xs font-medium text-[#B7D83D] mb-2">
            <TrendingUp size={14} />
            <span>Economic Sustainability & Regional Deployment</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F2F3EF]">
            The ONER Environmental Network
          </h1>
          <p className="text-xs text-[#8D9490] mt-1 max-w-2xl">
            Commercialization framework, scale unit economics, and auditable data source architecture.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            ILLUSTRATIVE HACKATHON ESTIMATE
          </span>
        </div>
      </div>

      {/* ── Four Business Model Pillars ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {model?.pillars.map((pillar) => (
          <div key={pillar.id} className="p-4 rounded-lg bg-[#0D0F0F] border border-[#202525] space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-[#B7D83D] font-semibold">
                {pillar.subtitle}
              </span>
              <h3 className="text-sm font-semibold text-zinc-100">{pillar.title}</h3>
              <p className="text-xs text-[#8D9490] leading-relaxed">{pillar.description}</p>
            </div>

            <div className="pt-3 border-t border-[#181d1a] space-y-1">
              <div className="font-mono text-xs font-bold text-zinc-200">{pillar.unit_pricing_inr}</div>
              <div className="text-[10px] text-zinc-500">{pillar.roi_mechanism}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Interactive Economic Scale Calculator ────────────────── */}
      <div className="rounded-lg bg-[#0D0F0F] border border-[#202525] p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#202525]">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-[#B7D83D]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Interactive Scale & Impact Calculator
            </span>
          </div>

          {/* Tier buttons */}
          <div className="flex flex-wrap gap-1.5">
            {TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => handleTierChange(tier.id)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedTier === tier.id
                    ? 'bg-[#1b271d] text-[#B7D83D] border border-[#B7D83D]/40 font-semibold'
                    : 'bg-[#121515] text-zinc-400 border border-[#202525] hover:text-zinc-200'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders & Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded bg-[#080909] border border-[#202525] text-xs">
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-medium block">
              Facilities Onboarded: <span className="text-white font-mono font-bold">{facilitiesCount}</span>
            </label>
            <input
              type="range"
              min={1}
              max={250}
              value={facilitiesCount}
              onChange={(e) => setFacilitiesCount(Number(e.target.value))}
              className="w-full accent-[#B7D83D]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 font-medium block">
              Annual Subscription: <span className="text-white font-mono font-bold">₹{subFeeLakhs}L</span> / facility
            </label>
            <input
              type="range"
              min={5}
              max={30}
              step={0.5}
              value={subFeeLakhs}
              onChange={(e) => setSubFeeLakhs(Number(e.target.value))}
              className="w-full accent-[#B7D83D]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 font-medium block">
              Onboarding Integration: <span className="text-white font-mono font-bold">₹{onboardFeeLakhs}L</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={onboardFeeLakhs}
              onChange={(e) => setOnboardFeeLakhs(Number(e.target.value))}
              className="w-full accent-[#B7D83D]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 font-medium block">
              Government Deployment: <span className="text-white font-mono font-bold">₹{govGrantLakhs}L</span>
            </label>
            <input
              type="range"
              min={0}
              max={500}
              step={5}
              value={govGrantLakhs}
              onChange={(e) => setGovGrantLakhs(Number(e.target.value))}
              className="w-full accent-[#B7D83D]"
            />
          </div>
        </div>

        {/* Calculated Results Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-mono">
          <div className="p-3 rounded bg-[#080909] border border-[#202525]">
            <div className="text-[10px] uppercase font-sans text-zinc-500">Gross Annual Revenue</div>
            <div className="text-xl font-bold text-zinc-100 font-mono mt-0.5">
              ₹{totalRevenueLakhs.toFixed(1)}L
            </div>
            <div className="text-[10px] text-zinc-500 font-sans">₹{(totalRevenueLakhs / 100).toFixed(2)} Cr</div>
          </div>

          <div className="p-3 rounded bg-[#080909] border border-[#202525]">
            <div className="text-[10px] uppercase font-sans text-zinc-500">Estimated Operating Cost</div>
            <div className="text-xl font-bold text-zinc-300 font-mono mt-0.5">
              ₹{estOperatingCostLakhs.toFixed(1)}L
            </div>
            <div className="text-[10px] text-zinc-500 font-sans">Cloud + Support</div>
          </div>

          <div className="p-3 rounded bg-[#080909] border border-[#202525]">
            <div className="text-[10px] uppercase font-sans text-zinc-500">Net Operating Margin</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
              {netMarginPct}%
            </div>
            <div className="text-[10px] text-zinc-500 font-sans">₹{netMarginLakhs.toFixed(1)}L net</div>
          </div>

          <div className="p-3 rounded bg-[#080909] border border-[#202525]">
            <div className="text-[10px] uppercase font-sans text-zinc-500">Break-Even Point</div>
            <div className="text-xl font-bold text-teal-400 font-mono mt-0.5">
              {breakEvenFacilities} Facilities
            </div>
            <div className="text-[10px] text-zinc-500 font-sans">At current cost basis</div>
          </div>

          <div className="p-3 rounded bg-[#080909] border border-[#202525]">
            <div className="text-[10px] uppercase font-sans text-zinc-500">Annual CO₂ Abated</div>
            <div className="text-xl font-bold text-[#B7D83D] font-mono mt-0.5">
              {co2AbatedTonnes.toLocaleString()} t
            </div>
            <div className="text-[10px] text-zinc-500 font-sans">Across {facilitiesCount} units</div>
          </div>
        </div>
      </div>

      {/* ── Data Source Transparency Layer ───────────────────────── */}
      <div className="rounded-lg bg-[#0D0F0F] border border-[#202525] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-[#B7D83D]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Data Pipeline & Credibility Transparency Layer
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">Audit Status Standard</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {model?.data_sources.map((src, i) => (
            <div key={i} className="p-3 rounded bg-[#080909] border border-[#202525] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200 truncate">{src.name}</span>
                <span
                  className={`text-[8px] font-mono px-1.5 py-0.2 rounded ${
                    src.status === 'SIMULATED TELEMETRY'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                  }`}
                >
                  {src.status}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400">{src.type}</div>
              <div className="text-[10px] font-mono text-zinc-500 pt-1 flex items-center justify-between">
                <span>Update Frequency:</span>
                <span className="text-zinc-300">{src.rate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
