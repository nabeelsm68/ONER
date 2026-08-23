'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard, BarChart3, AlertTriangle, Beaker,
  Leaf, MessageSquare, Clock, Building2, CheckCircle2,
  ChevronDown, Lock
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/analytics', label: 'Environmental Analytics', icon: BarChart3 },
  { href: '/investigation', label: 'AI Investigation', icon: AlertTriangle },
  { href: '/simulator', label: 'Intervention Simulator', icon: Beaker },
  { href: '/carbon', label: 'Carbon & MRV', icon: Leaf },
  { href: '/copilot', label: 'Ask ONER', icon: MessageSquare },
];

function FacilityPopover({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick, true);
    return () => document.removeEventListener('mousedown', handleClick, true);
  }, [onClose]);

  return (
    <div ref={ref}
      className="absolute left-0 top-full mt-2 w-64 rounded-xl shadow-2xl z-50 animate-slide-up"
      style={{
        background: '#0a0a0a',
        border: '1px solid #1c1c1c',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(230,255,63,0.06)',
      }}>

      <div className="px-4 py-3" style={{ borderBottom: '1px solid #151515' }}>
        <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#555' }}>
          Connected Facility
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-3 p-2.5 rounded-xl"
          style={{ background: 'rgba(0,212,164,0.06)', border: '1px solid rgba(0,212,164,0.18)' }}>
          <CheckCircle2 size={15} className="flex-shrink-0" style={{ color: '#00d4a4' }} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Orion Manufacturing Plant</div>
            <div className="text-xs mt-0.5" style={{ color: '#00d4a4' }}>Active · Connected</div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 space-y-2">
        {[
          ['Data source', 'Simulated industrial data'],
          ['Data coverage', '90 days'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-xs">
            <span style={{ color: '#555' }}>{k}</span>
            <span style={{ color: '#8a8a8a' }}>{v}</span>
          </div>
        ))}
        <div className="flex justify-between text-xs">
          <span style={{ color: '#555' }}>Status</span>
          <span className="flex items-center gap-1.5" style={{ color: '#00d4a4' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block status-pulse" />
            Connected / Healthy
          </span>
        </div>
      </div>

      <div className="mx-4" style={{ borderTop: '1px solid #151515' }} />

      <div className="px-4 py-3">
        <div className="flex items-center gap-2.5 opacity-35 cursor-not-allowed select-none">
          <Lock size={12} style={{ color: '#555', flexShrink: 0 }} />
          <div>
            <div className="text-xs" style={{ color: '#8a8a8a' }}>Additional facilities</div>
            <div style={{ fontSize: 10, color: '#555' }}>Available in enterprise version</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50"
      style={{
        background: 'linear-gradient(180deg, rgba(8,8,8,0.98) 0%, rgba(3,3,3,0.98) 100%)',
        borderRight: '1px solid #151515',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* ── Logo ───────────────────────────────────────── */}
      <div className="px-6 py-6" style={{ borderBottom: '1px solid #151515' }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{
                background: '#111',
                border: '1px solid #1c1c1c',
                color: '#e6ff3f',
                fontFamily: 'Space Grotesk, Inter, sans-serif',
                boxShadow: '0 0 16px rgba(230,255,63,0.12)',
              }}
            >
              O
            </div>
            {/* live pulse dot */}
            <div
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full status-pulse"
              style={{ background: '#e6ff3f', boxShadow: '0 0 6px rgba(230,255,63,0.8)' }}
            />
          </div>
          <div>
            <div
              className="font-bold text-lg leading-none tracking-wide"
              style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', color: '#f5f5f5', letterSpacing: '0.02em' }}
            >
              ONER
            </div>
            <div className="text-xs font-medium mt-0.5 uppercase tracking-widest" style={{ color: '#555', fontSize: 10 }}>
              Environmental AI Autopilot
            </div>
          </div>
        </div>

        {/* ── Facility Selector ────────────────────────── */}
        <div className="mt-4 relative">
          <button
            id="facility-selector"
            onClick={() => setFacilityOpen(o => !o)}
            className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] cursor-pointer"
            style={{
              background: 'rgba(230,255,63,0.04)',
              border: `1px solid ${facilityOpen ? 'rgba(230,255,63,0.20)' : '#1c1c1c'}`,
            }}
            aria-haspopup="true"
            aria-expanded={facilityOpen}
          >
            <Building2 size={12} className="flex-shrink-0" style={{ color: '#555' }} />
            <div className="flex-1 min-w-0">
              <div className="uppercase tracking-widest" style={{ fontSize: 9, color: '#555' }}>Active Facility</div>
              <div className="text-xs font-semibold truncate" style={{ color: '#f5f5f5' }}>Orion Manufacturing Plant</div>
            </div>
            <ChevronDown
              size={12}
              className={`flex-shrink-0 transition-transform duration-200 ${facilityOpen ? 'rotate-180' : ''}`}
              style={{ color: '#555' }}
            />
          </button>
          {facilityOpen && <FacilityPopover onClose={() => setFacilityOpen(false)} />}
        </div>
      </div>

      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setFacilityOpen(false)}
              data-active={active ? 'true' : undefined}
              className={`nav-prox-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative`}
              style={active ? {
                color: '#f5f5f5',
                background: '#111',
                border: '1px solid #1c1c1c',
              } : {
                color: '#555',
                border: '1px solid transparent',
              }}
            >
              {/* Active left-bar indicator */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r"
                  style={{
                    width: 2,
                    height: 16,
                    background: '#e6ff3f',
                    boxShadow: '0 0 8px rgba(230,255,63,0.7)',
                  }}
                />
              )}
              <Icon
                size={15}
                style={{ color: active ? '#e6ff3f' : '#555', flexShrink: 0, opacity: active ? 1 : 0.8 }}
              />
              <span>{label}</span>
              {active && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: '#e6ff3f', boxShadow: '0 0 6px rgba(230,255,63,0.6)' }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Status Bar ──────────────────────────────────── */}
      <div className="px-4 py-4 space-y-2" style={{ borderTop: '1px solid #151515' }}>
        <div className="flex items-center gap-2 text-xs">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0 status-pulse"
            style={{ background: '#e6ff3f', boxShadow: '0 0 5px rgba(230,255,63,0.7)' }}
          />
          <span style={{ color: '#555' }}>AI Engine</span>
          <span className="ml-auto font-medium" style={{ color: '#8a8a8a' }}>Online</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0 status-pulse"
            style={{ background: '#22c55e', boxShadow: '0 0 5px rgba(34,197,94,0.6)' }}
          />
          <span style={{ color: '#555' }}>Data Stream</span>
          <span className="ml-auto font-medium" style={{ color: '#22c55e' }}>Healthy</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Clock size={11} style={{ color: '#555' }} />
          <span style={{ color: '#555' }}>Last Analysis</span>
          <span className="ml-auto font-mono" style={{ fontSize: 10, color: '#555' }}>{now}</span>
        </div>
        <div className="mt-3 pt-2 text-center" style={{ borderTop: '1px solid #111' }}>
          <div style={{ fontSize: 10, color: '#333', lineHeight: 1.6 }}>
            Prototype · Simulated industrial data<br />Not connected to live IoT sensors
          </div>
        </div>
      </div>
    </aside>
  );
}
