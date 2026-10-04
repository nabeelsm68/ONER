'use client';

import React, { useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  CornerDownLeft,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

const PROBES = [
  { label: 'Primary Risk', query: 'What is our biggest environmental risk right now?' },
  { label: 'Priority Fix', query: 'What should we fix first to reduce emissions?' },
  { label: 'Intervention Impact', query: 'How much CO₂ could we save with intervention?' },
  { label: 'Furnace F-101 Anomaly', query: 'Explain the Furnace F-101 combustion anomaly.' },
  { label: 'MRV Readiness', query: 'What is our ISO 14064 MRV readiness score?' },
  { label: 'Water Cooling Trend', query: 'What does our water consumption trend look like?' },
];

interface QueryResult {
  query: string;
  response: string;
  mode?: string;
  timestamp: string;
}

export default function CopilotPage() {
  const [results, setResults] = useState<QueryResult[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const executeQuery = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || loading) return;

    setInput('');
    setLoading(true);

    try {
      const history = results.map((r) => ({ role: 'user', content: r.query }));
      const res = await api.copilot(q, history);
      const newResult: QueryResult = {
        query: q,
        response: res.response || 'No telemetry interpretation returned.',
        mode: res.mode || 'deterministic_engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setResults((prev) => [newResult, ...prev]);
    } catch (err) {
      setResults((prev) => [
        {
          query: q,
          response: 'Unable to communicate with the ONER intelligence engine. Ensure backend FastAPI is active on port 8000.',
          mode: 'error_fallback',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeQuery(input);
    }
  };

  return (
    <AppLayout
      title="Ask ONER"
      subtitle="Autonomous Intelligence Query Interface"
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* ── CENTRAL ENVIRONMENTAL COGNITION CONSOLE ──────────── */}
        <div className="p-6 rounded-lg bg-[#0E1110] border border-[#242A27] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cpu size={15} className="text-[#A8C83A]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#F1F3EE]">
                Environmental Intelligence Cognition
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#929A95]">
              Deterministic Rules + LLM Reasoning
            </span>
          </div>

          <div className="relative mt-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Query ONER intelligence (e.g. 'Explain Furnace F-101 anomaly and recommended trim')..."
              disabled={loading}
              className="w-full px-4 py-3 pl-10 pr-24 rounded-md bg-[#080A09] border border-[#242A27] focus:border-[#A8C83A] focus:outline-none text-sm text-[#F1F3EE] placeholder-[#626A65] font-sans transition-colors"
            />
            <Search size={15} className="absolute left-3.5 top-3.5 text-[#626A65]" />
            <button
              onClick={() => executeQuery(input)}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 px-3 py-1.5 rounded bg-[#141817] hover:bg-[#202724] disabled:opacity-40 border border-[#242A27] text-xs font-semibold text-[#F1F3EE] hover:text-[#C4DF61] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{loading ? 'Evaluating...' : 'Query'}</span>
              <CornerDownLeft size={12} className="text-[#A8C83A]" />
            </button>
          </div>

          {/* Quick Telemetry Probes */}
          <div className="mt-4 pt-3 border-t border-[#242A27]">
            <div className="text-[10px] uppercase font-semibold text-[#929A95] tracking-wider mb-2">
              Suggested Inquiries:
            </div>
            <div className="flex flex-wrap gap-2">
              {PROBES.map((p) => (
                <button
                  key={p.label}
                  onClick={() => executeQuery(p.query)}
                  className="px-2.5 py-1 rounded bg-[#080A09] hover:bg-[#141817] border border-[#242A27] hover:border-[#A8C83A]/40 text-xs font-medium text-[#929A95] hover:text-[#F1F3EE] transition-colors text-left cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── STRUCTURED INTELLIGENCE RESULTS ──────────────────── */}
        {results.length === 0 ? (
          <div className="p-10 rounded-lg bg-[#0E1110] border border-[#242A27] text-center">
            <Layers size={24} className="text-[#626A65] mx-auto mb-2" />
            <div className="text-sm font-semibold text-[#F1F3EE]">
              Query ONER Environmental Intelligence
            </div>
            <p className="text-xs text-[#929A95] mt-1 max-w-md mx-auto font-sans leading-relaxed">
              Ask about active anomaly causality, Scope 1 and 2 carbon drift, intervention payback simulations, or ISO 14064 MRV audit readiness.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((res, i) => (
              <div
                key={i}
                className="p-6 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-4 shadow-sm"
              >
                {/* Query Header */}
                <div className="flex items-center justify-between border-b border-[#242A27] pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#F1F3EE]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A8C83A]" />
                    <span>Inquiry: &ldquo;{res.query}&rdquo;</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#929A95]">{res.timestamp}</span>
                </div>

                {/* 1. ANSWER */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#929A95] mb-1">
                    1. ANSWER
                  </div>
                  <p className="text-sm text-[#F1F3EE] leading-relaxed font-sans">
                    {res.response}
                  </p>
                </div>

                {/* 2. EVIDENCE */}
                <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27]">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#929A95] mb-1">
                    2. EVIDENCE
                  </div>
                  <div className="text-xs text-[#929A95] font-sans leading-relaxed">
                    Combustion temperature deviation (+18.4°C), NOx stack surge (+157.9%), PM2.5 elevation (+117.5%) with gas fuel regulation drift.
                  </div>
                </div>

                {/* 3. SIGNALS */}
                <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27]">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#929A95] mb-1">
                    3. SIGNALS & PHYSICAL SOURCE
                  </div>
                  <div className="text-xs text-[#929A95] font-mono">
                    Combustion Train 04 · Furnace F-101 Burner Assembly · Gas Manifold Plenum 4B
                  </div>
                </div>

                {/* 4. CONFIDENCE & 5. ACTION */}
                <div className="p-3.5 rounded bg-[#141817] border border-[#242A27] flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#A8C83A]" />
                    <span className="text-xs text-[#929A95]">
                      4. ROOT-CAUSE CONFIDENCE: <strong className="text-[#A8C83A] font-semibold font-mono">99.4%</strong> (Deterministic Causal Engine)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/investigation"
                      className="px-3 py-1.5 rounded bg-[#080A09] hover:bg-[#141817] border border-[#242A27] text-xs font-medium text-[#F1F3EE] hover:text-[#C4DF61] transition-colors"
                    >
                      5. View Investigation
                    </Link>
                    <Link
                      href="/simulator"
                      className="px-3 py-1.5 rounded bg-[#141817] hover:bg-[#202724] border border-[#242A27] text-xs font-semibold text-[#F1F3EE] hover:text-[#C4DF61] transition-colors flex items-center gap-1"
                    >
                      <span>Simulate Action</span>
                      <ArrowRight size={12} className="text-[#A8C83A]" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
