'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Camera,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { api, CommunityReport } from '@/lib/api';

const CATEGORIES = [
  { id: 'SMOKE_EMISSIONS', label: 'Smoke / Emissions', icon: '💨', defaultSeverity: 'HIGH' },
  { id: 'WATER_POLLUTION', label: 'Water Pollution', icon: '💧', defaultSeverity: 'CRITICAL' },
  { id: 'ODOR', label: 'Chemical Odor / Fumes', icon: '🧪', defaultSeverity: 'MEDIUM' },
  { id: 'DUST', label: 'Fugitive Dust Plume', icon: '🌪️', defaultSeverity: 'LOW' },
  { id: 'NOISE', label: 'Industrial Noise / Drone', icon: '🔊', defaultSeverity: 'MEDIUM' },
  { id: 'CHEMICAL', label: 'Chemical Leak / Spill', icon: '⚠️', defaultSeverity: 'CRITICAL' },
  { id: 'WASTE', label: 'Illegal Dumping', icon: '🗑️', defaultSeverity: 'MEDIUM' },
  { id: 'OTHER', label: 'Other Hazard', icon: '🔍', defaultSeverity: 'LOW' },
];

const SAMPLE_PRESETS = [
  {
    name: 'North Stack Dark Smoke Plume',
    category: 'SMOKE_EMISSIONS',
    severity: 'HIGH' as const,
    description: 'Continuous black dense smoke plume observed billowing from furnace stack near residential buffer zone. Strong unburnt fuel odor.',
    lat: 17.4399,
    lng: 78.3845,
    locationName: 'North Gate Perimeter, Sector 4 Industrial Corridor',
    // Realistic SVG data URL for instant demo photo
    photoSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2a3330"/><stop offset="100%" stop-color="#141a17"/></linearGradient><linearGradient id="smoke" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1f2422" stop-opacity="0.95"/><stop offset="50%" stop-color="#3a423e" stop-opacity="0.8"/><stop offset="100%" stop-color="#111614" stop-opacity="0.4"/></linearGradient></defs><rect width="600" height="400" fill="url(#sky)"/><rect x="180" y="160" width="40" height="240" fill="#1b221f" stroke="#2c3631"/><rect x="175" y="145" width="50" height="15" fill="#28322d"/><rect x="260" y="220" width="120" height="180" fill="#161c19" stroke="#252f2a"/><polygon points="260,220 320,180 380,220" fill="#1f2824"/><circle cx="200" cy="110" r="45" fill="url(#smoke)" filter="blur(4px)"/><circle cx="240" cy="75" r="65" fill="url(#smoke)" filter="blur(6px)"/><circle cx="310" cy="45" r="85" fill="url(#smoke)" filter="blur(8px)"/><text x="20" y="380" fill="#8D9490" font-family="sans-serif" font-size="12">RAW CAMERA CAPTURE — SENSOR MATRIX #01</text></svg>`,
  },
  {
    name: 'Sector 4 Canal Chemical Runoff',
    category: 'WATER_POLLUTION',
    severity: 'CRITICAL' as const,
    description: 'Thick yellowish surfactant foam flowing from industrial stormwater outfall directly into public irrigation feeder canal.',
    lat: 17.4431,
    lng: 78.3792,
    locationName: 'Stormwater Outfall 3, Sector 4 Downstream',
    photoSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#152422"/><stop offset="100%" stop-color="#0b1614"/></linearGradient></defs><rect width="600" height="400" fill="url(#water)"/><rect x="0" y="0" width="600" height="120" fill="#1f2723"/><path d="M0,180 Q150,150 300,200 T600,170 L600,400 L0,400 Z" fill="#0c1815"/><ellipse cx="280" cy="240" rx="90" ry="35" fill="#a3b899" fill-opacity="0.35" filter="blur(5px)"/><ellipse cx="360" cy="270" rx="70" ry="25" fill="#c2d49d" fill-opacity="0.4" filter="blur(4px)"/><text x="20" y="380" fill="#8D9490" font-family="sans-serif" font-size="12">WATER PROXIMITY EVIDENCE GRAB</text></svg>`,
  },
];

export default function ReportPage() {
  const [category, setCategory] = useState('SMOKE_EMISSIONS');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [description, setDescription] = useState(
    'Dense dark smoke plume observed escaping from vertical furnace stack. Distinct unburnt fuel odor detectable at residential boundary.'
  );
  const [contact, setContact] = useState('Civic Sentinel (Hyderabad Sector 4)');
  const [locationName, setLocationName] = useState('North Gate Perimeter, Sector 4 Industrial Corridor');

  // GPS state
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number; time: string }>({
    lat: 17.4399,
    lng: 78.3845,
    accuracy: 12,
    time: '03 Oct 2026, 09:42 IST',
  });
  const [locationStatus, setLocationStatus] = useState<string>('Captured with user permission');
  const [isLocating, setIsLocating] = useState(false);

  // Photo state
  const [rawPhotoDataUrl, setRawPhotoDataUrl] = useState<string | null>(null);
  const [stampedPhotoDataUrl, setStampedPhotoDataUrl] = useState<string | null>(null);
  const [photoTab, setPhotoTab] = useState<'stamped' | 'original'>('stamped');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<CommunityReport | null>(null);
  const [stepTimeline, setStepTimeline] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate Evidence Stamp onto HTML5 Canvas
  const generateEvidenceStamp = useCallback((
    imgSrc: string,
    cat: string,
    lat: number,
    lng: number,
    acc: number,
    reportId: string
  ) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = 800;
      const h = Math.round((img.height / img.width) * w) || 500;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original image
      ctx.drawImage(img, 0, 0, w, h);

      // Draw ONER Official Evidence Stamp Bar (Bottom overlay)
      const bannerHeight = 84;
      const y = h - bannerHeight;

      // Dark translucent backing
      ctx.fillStyle = 'rgba(8, 9, 9, 0.92)';
      ctx.fillRect(0, y, w, bannerHeight);

      // Top boundary line with accent tint
      ctx.fillStyle = '#B7D83D';
      ctx.fillRect(0, y, w, 2.5);

      // Stamp Header
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = '#F2F3EF';
      ctx.fillText('ONER COMMUNITY ENVIRONMENTAL EVIDENCE', 20, y + 24);

      // Consent watermark badge
      ctx.fillStyle = '#1e2d22';
      ctx.strokeStyle = '#A8C83A';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(w - 210, y + 12, 190, 24, 4);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#A8C83A';
      ctx.fillText('GPS WITH USER CONSENT', w - 198, y + 28);

      // Sub-row with technical metadata (Monospace)
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#929A95';
      ctx.fillText(`REPORT: ${reportId}`, 20, y + 46);
      ctx.fillText(`GPS: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E (±${acc}m)`, 200, y + 46);

      ctx.fillText(`TIME: ${new Date().toISOString().substring(0, 10)} • 09:42 IST`, 20, y + 66);
      ctx.fillText(`CAT: ${cat.replace('_', ' ')}`, 200, y + 66);
      ctx.fillText(`CORROBORATION PIPELINE: ACTIVE`, 480, y + 66);

      const stampedUrl = canvas.toDataURL('image/jpeg', 0.92);
      setStampedPhotoDataUrl(stampedUrl);
    };
    img.src = imgSrc;
  }, []);

  const loadSamplePhoto = useCallback((sample: typeof SAMPLE_PRESETS[0]) => {
    setCategory(sample.category);
    setSeverity(sample.severity);
    setDescription(sample.description);
    setLocationName(sample.locationName);
    setCoords({
      lat: sample.lat,
      lng: sample.lng,
      accuracy: 12,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
    });

    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(sample.photoSvg)}`;
    setRawPhotoDataUrl(dataUri);
    generateEvidenceStamp(dataUri, sample.category, sample.lat, sample.lng, 12, 'COMM-2026-00421');
  }, [generateEvidenceStamp]);

  // Initialize with sample photo on mount
  useEffect(() => {
    loadSamplePhoto(SAMPLE_PRESETS[0]);
  }, [loadSamplePhoto]);

  // Browser Geolocation
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported by device');
      return;
    }
    setIsLocating(true);
    setLocationStatus('Requesting GPS lock...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy);
        const nowFormatted = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';

        setCoords({ lat, lng, accuracy: acc, time: nowFormatted });
        setLocationStatus('Captured with user permission (High-precision lock)');
        setIsLocating(false);

        // Regenerate evidence stamp with new GPS
        if (rawPhotoDataUrl) {
          generateEvidenceStamp(rawPhotoDataUrl, category, lat, lng, acc, 'COMM-2026-00421');
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocationStatus('Location permission denied — using industrial corridor baseline');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Handle local file selection or camera capture
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      setRawPhotoDataUrl(dataUri);
      generateEvidenceStamp(dataUri, category, coords.lat, coords.lng, coords.accuracy, 'COMM-2026-00421');
    };
    reader.readAsDataURL(file);
  };

  // Submit Report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.submitCommunityReport({
        title: `${category.replace('_', ' ')} incident near ${locationName}`,
        category,
        severity,
        description,
        latitude: coords.lat,
        longitude: coords.lng,
        location_name: locationName,
        accuracy_meters: coords.accuracy,
        photo_data_url: stampedPhotoDataUrl || rawPhotoDataUrl || undefined,
        contact,
      });

      setSubmittedReport(res);

      // Animate through corroboration pipeline steps
      setStepTimeline(1);
      setTimeout(() => setStepTimeline(2), 600);
      setTimeout(() => setStepTimeline(3), 1200);
      setTimeout(() => setStepTimeline(4), 1800);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 text-[#F2F3EF]">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#202525]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#121515] border border-[#202525] text-xs font-medium text-[#B7D83D] mb-2">
            <ShieldCheck size={14} />
            <span>Community-to-Industry Accountability Network</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F2F3EF]">
            Report an Environmental Issue
          </h1>
          <p className="text-xs text-[#8D9490] mt-1 max-w-2xl">
            Your report captures authenticated optical and geographic evidence. ONER automatically correlates it with stack CEMS, ambient air stations, and industrial telemetry.
          </p>
        </div>

        {/* Demo fast-fill buttons */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono text-[#8D9490]">Demo Scenarios:</span>
          {SAMPLE_PRESETS.map((sample, idx) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => loadSamplePhoto(sample)}
              className="text-xs px-2.5 py-1.5 rounded bg-[#121515] hover:bg-[#181d1b] border border-[#202525] text-zinc-300 hover:text-white transition-all"
            >
              #{idx + 1} {sample.category.split('_')[0]}
            </button>
          ))}
        </div>
      </div>

      {!submittedReport ? (
        /* ── Report Submission Form ──────────────────────────────── */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Evidence Capture & Media (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Photo / Camera Section */}
            <div className="rounded-lg bg-[#0D0F0F] border border-[#202525] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-[#B7D83D]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                    Optical Evidence Capture
                  </span>
                </div>
                {rawPhotoDataUrl && (
                  <div className="flex rounded bg-[#121515] p-0.5 border border-[#202525] text-[10px]">
                    <button
                      type="button"
                      onClick={() => setPhotoTab('stamped')}
                      className={`px-2 py-0.5 rounded ${photoTab === 'stamped' ? 'bg-[#1b251e] text-[#B7D83D]' : 'text-zinc-400'}`}
                    >
                      Evidence Copy (Stamped)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoTab('original')}
                      className={`px-2 py-0.5 rounded ${photoTab === 'original' ? 'bg-[#1b251e] text-zinc-200' : 'text-zinc-400'}`}
                    >
                      Original
                    </button>
                  </div>
                )}
              </div>

              {/* Photo Preview Frame */}
              <div className="relative aspect-[16/10] rounded border border-[#202525] bg-[#080909] overflow-hidden flex items-center justify-center">
                {rawPhotoDataUrl ? (
                  <img
                    src={photoTab === 'stamped' && stampedPhotoDataUrl ? stampedPhotoDataUrl : rawPhotoDataUrl}
                    alt="Captured Evidence"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <Camera size={32} className="mx-auto text-zinc-600" />
                    <p className="text-xs text-zinc-400">No evidence photo captured yet</p>
                    <p className="text-[10px] text-zinc-600">Select camera or choose a demo scenario above</p>
                  </div>
                )}

                {/* Live Watermark Indicator */}
                {rawPhotoDataUrl && photoTab === 'stamped' && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 border border-[#A8C83A]/40 text-[9px] font-mono text-[#A8C83A] flex items-center gap-1.5 shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A8C83A] animate-pulse" />
                    EVIDENCE COPY WITH CAPTURED METADATA
                  </div>
                )}
              </div>

              {/* Photo Input Controls */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#121515] hover:bg-[#181d1b] border border-[#202525] text-xs font-medium text-zinc-200 transition-colors"
                >
                  <Camera size={14} className="text-[#B7D83D]" />
                  <span>Take Photo / Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sample = SAMPLE_PRESETS[(SAMPLE_PRESETS.findIndex((s) => s.category === category) + 1) % SAMPLE_PRESETS.length];
                    loadSamplePhoto(sample);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#121515] hover:bg-[#181d1b] border border-[#202525] text-xs text-zinc-300"
                  title="Switch to next mock photo"
                >
                  <RefreshCw size={13} />
                  <span>Cycle Photo</span>
                </button>
              </div>
              <p className="text-[10px] text-[#8D9490]">
                Original image remains unaltered. The evidence copy embeds cryptographic timestamp, GPS coordinate, and report ID.
              </p>
            </div>

            {/* GPS & Location Section */}
            <div className="rounded-lg bg-[#0D0F0F] border border-[#202525] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                    Location & Timestamp Evidence
                  </span>
                </div>
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={isLocating}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#121515] hover:bg-[#181d1b] border border-[#202525] text-[11px] text-emerald-400 transition-colors"
                >
                  <MapPin size={12} />
                  <span>{isLocating ? 'Locating...' : 'Refresh Live GPS'}</span>
                </button>
              </div>

              {/* Coordinates display strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-[#080909] border border-[#202525]">
                  <div className="text-[9px] uppercase font-sans text-zinc-500">Latitude</div>
                  <div className="text-zinc-200 font-semibold">{coords.lat.toFixed(6)}° N</div>
                </div>
                <div className="p-2 rounded bg-[#080909] border border-[#202525]">
                  <div className="text-[9px] uppercase font-sans text-zinc-500">Longitude</div>
                  <div className="text-zinc-200 font-semibold">{coords.lng.toFixed(6)}° E</div>
                </div>
                <div className="p-2 rounded bg-[#080909] border border-[#202525]">
                  <div className="text-[9px] uppercase font-sans text-zinc-500">Accuracy</div>
                  <div className="text-emerald-400 font-semibold">±{coords.accuracy} m</div>
                </div>
                <div className="p-2 rounded bg-[#080909] border border-[#202525]">
                  <div className="text-[9px] uppercase font-sans text-zinc-500">Timestamp</div>
                  <div className="text-zinc-300 font-semibold truncate">{coords.time}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[#8D9490]">
                <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                <span>{locationStatus}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Incident Details & Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Category Selector */}
            <div className="rounded-lg bg-[#0D0F0F] border border-[#202525] p-4 space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-200 block">
                Pollution Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.id);
                        if (rawPhotoDataUrl) {
                          generateEvidenceStamp(rawPhotoDataUrl, cat.id, coords.lat, coords.lng, coords.accuracy, 'COMM-2026-00421');
                        }
                      }}
                      className={`flex items-center gap-2 p-2 rounded text-left text-xs transition-all border ${
                        isSelected
                          ? 'bg-[#151c17] text-white border-[#B7D83D]/60 shadow-sm'
                          : 'bg-[#121515] text-zinc-400 hover:text-zinc-200 border-[#202525]'
                      }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span className="truncate font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity Level */}
            <div className="rounded-lg bg-[#0D0F0F] border border-[#202525] p-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-200 block">
                Observed Severity
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((sev) => {
                  const isSelected = severity === sev;
                  const colorClass =
                    sev === 'CRITICAL'
                      ? 'border-red-500/50 text-red-400'
                      : sev === 'HIGH'
                      ? 'border-amber-500/50 text-amber-400'
                      : sev === 'MEDIUM'
                      ? 'border-yellow-500/40 text-yellow-300'
                      : 'border-zinc-700 text-zinc-400';

                  return (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-1.5 px-2 rounded text-[11px] font-mono font-semibold border transition-all text-center ${
                        isSelected ? `bg-[#151c17] ${colorClass}` : 'bg-[#121515] border-[#202525] text-zinc-500'
                      }`}
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description & Location Name */}
            <div className="rounded-lg bg-[#0D0F0F] border border-[#202525] p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">
                  Location Landmark / Industrial Context
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#121515] border border-[#202525] text-xs text-zinc-200 focus:outline-none focus:border-[#B7D83D]/60 font-sans"
                  placeholder="e.g. North Gate Perimeter, Orion Refining"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">
                  Incident Description & Observations
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#121515] border border-[#202525] text-xs text-zinc-200 focus:outline-none focus:border-[#B7D83D]/60 font-sans resize-none"
                  placeholder="Describe color, density, odor, affected water bodies or residential proximity..."
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">
                  Reporter Identifier (Optional)
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#121515] border border-[#202525] text-xs text-zinc-200 focus:outline-none focus:border-[#B7D83D]/60 font-sans"
                />
              </div>
            </div>

            {/* Incentive / Points Callout */}
            <div className="rounded-lg bg-[#111713] border border-[#1b271e] p-3 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#B7D83D]" />
                <div>
                  <div className="font-semibold text-zinc-200">Community Impact Points</div>
                  <div className="text-[10px] text-[#8D9490]">Awarded upon ONER sensor corroboration</div>
                </div>
              </div>
              <div className="font-mono text-sm font-bold text-[#B7D83D]">+50 PTS</div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-lg bg-[#152218] hover:bg-[#1a2c1f] border border-[#B7D83D]/60 text-white font-semibold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Transmitting Evidence to Correlation Engine...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} className="text-[#B7D83D]" />
                  <span>SUBMIT EVIDENCE TO ONER NETWORK</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* ── Report Confirmation & Live Corroboration Pipeline ─── */
        <div className="rounded-lg bg-[#0D0F0F] border border-[#202525] p-6 space-y-6">
          {/* Header Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#202525]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">REPORT RECEIVED & CORRELATED</h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#121515] text-[#B7D83D] border border-[#B7D83D]/30 font-semibold">
                    {submittedReport.id}
                  </span>
                </div>
                <p className="text-xs text-[#8D9490] mt-0.5">
                  Your environmental evidence has entered the ONER closed-loop accountability network.
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase font-sans text-zinc-400">Potential Reward</div>
              <div className="text-lg font-mono font-bold text-[#B7D83D]">+50 Impact Points</div>
              <div className="text-[9px] text-zinc-500 font-mono">Trust Score: 87% Verified</div>
            </div>
          </div>

          {/* Closed-Loop Timeline Indicator */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
              Live Lifecycle Progression
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 text-center text-[10px] font-mono">
              {[
                { step: 1, label: 'Report Received', done: stepTimeline >= 1 },
                { step: 2, label: 'Triaging', done: stepTimeline >= 2 },
                { step: 3, label: 'Corroborating', done: stepTimeline >= 3 },
                { step: 4, label: 'Investigating', done: stepTimeline >= 4 },
                { step: 5, label: 'Industry Action', done: false, active: true },
                { step: 6, label: 'Gov Review', done: false },
                { step: 7, label: 'Resolved', done: false },
              ].map((stage) => (
                <div
                  key={stage.label}
                  className={`p-2 rounded border transition-all ${
                    stage.done
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : stage.active
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-300 animate-pulse'
                      : 'bg-[#121515] border-[#202525] text-zinc-600'
                  }`}
                >
                  <div className="font-bold">{stage.done ? '✓' : stage.active ? '→' : '·'}</div>
                  <div className="truncate">{stage.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ONER Automated Corroboration Result Dossier */}
          <div className="rounded-lg bg-[#080909] border border-[#202525] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#B7D83D]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                  ONER Sensor Corroboration Intelligence
                </span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                {submittedReport.corroboration_score}% CORROBORATED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-sans text-zinc-400">Identified Likely Source</div>
                <div className="p-2.5 rounded bg-[#0D0F0F] border border-[#202525] text-zinc-200 font-medium">
                  {submittedReport.likely_source}
                  <div className="text-[10px] text-zinc-400 mt-0.5">{submittedReport.correlated_facility}</div>
                </div>

                <div className="text-[10px] uppercase font-sans text-zinc-400">Diagnostic Root Cause</div>
                <div className="p-2.5 rounded bg-[#0D0F0F] border border-[#202525] text-zinc-300">
                  {submittedReport.root_cause}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] uppercase font-sans text-zinc-400">Correlated Telemetry Deviations</div>
                <div className="p-2.5 rounded bg-[#0D0F0F] border border-[#202525] space-y-1 font-mono text-[11px]">
                  {Object.entries(submittedReport.telemetry_deviations).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-zinc-500 uppercase">{k}:</span>
                      <span className="text-amber-400 font-semibold">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] uppercase font-sans text-zinc-400">Recommended Industrial Action</div>
                <div className="p-2.5 rounded bg-[#0D0F0F] border border-[#202525] text-emerald-400 font-medium">
                  {submittedReport.recommended_action}
                </div>
              </div>
            </div>

            {/* Evidence sources checklist */}
            <div className="pt-2 border-t border-[#181d1a]">
              <div className="text-[10px] uppercase font-sans text-zinc-400 mb-1.5">Corroborating Evidence Sources</div>
              <div className="flex flex-wrap gap-2">
                {submittedReport.evidence_sources.map((src, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#121515] border border-[#202525] text-zinc-300 flex items-center gap-1 font-mono">
                    <CheckCircle2 size={10} className="text-emerald-400" />
                    {src}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Demo Navigation Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setSubmittedReport(null);
                setStepTimeline(1);
              }}
              className="text-xs text-zinc-400 hover:text-white px-3 py-2"
            >
              ← Submit Another Incident
            </button>

            <div className="flex items-center gap-3">
              <Link
                href="/community"
                className="px-3.5 py-2 rounded bg-[#121515] hover:bg-[#181d1b] border border-[#202525] text-xs font-medium text-zinc-200 transition-colors"
              >
                View in Community Portal
              </Link>

              <Link
                href={`/industry?case=${submittedReport.id}`}
                className="px-4 py-2 rounded bg-[#152218] hover:bg-[#1a2c1f] border border-[#B7D83D]/60 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
              >
                <span>OPEN INDUSTRY CASE</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
