'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import {
  Camera,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Info,
  AlertTriangle,
  Upload,
  Check,
} from 'lucide-react';
import { api, CommunityReport } from '@/lib/api';

const CATEGORIES = [
  { id: 'SMOKE_EMISSIONS', label: 'Smoke / Emissions', icon: '💨', defaultSeverity: 'HIGH' },
  { id: 'WATER_POLLUTION', label: 'Water Pollution', icon: '💧', defaultSeverity: 'CRITICAL' },
  { id: 'ODOR', label: 'Chemical Odor / Fumes', icon: '🧪', defaultSeverity: 'MEDIUM' },
  { id: 'DUST', label: 'Fugitive Dust Plume', icon: '🌪️', defaultSeverity: 'LOW' },
  { id: 'NOISE', label: 'Industrial Noise / Drone', icon: '🔊', defaultSeverity: 'MEDIUM' },
  { id: 'CHEMICAL', label: 'Chemical Leak / Spill', icon: '⚠️', defaultSeverity: 'CRITICAL' },
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
    photoQuality: 'HIGH' as const,
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
    photoQuality: 'MEDIUM' as const,
    photoSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#152422"/><stop offset="100%" stop-color="#0b1614"/></linearGradient></defs><rect width="600" height="400" fill="url(#water)"/><rect x="0" y="0" width="600" height="120" fill="#1f2723"/><path d="M0,180 Q150,150 300,200 T600,170 L600,400 L0,400 Z" fill="#0c1815"/><ellipse cx="280" cy="240" rx="90" ry="35" fill="#a3b899" fill-opacity="0.35" filter="blur(5px)"/><ellipse cx="360" cy="270" rx="70" ry="25" fill="#c2d49d" fill-opacity="0.4" filter="blur(4px)"/><text x="20" y="380" fill="#8D9490" font-family="sans-serif" font-size="12">WATER PROXIMITY EVIDENCE GRAB</text></svg>`,
  },
];

export default function ReportPage() {
  // Step 1: WHAT DID YOU SEE?
  const [category, setCategory] = useState('SMOKE_EMISSIONS');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');

  // Step 2: ADD PHOTO
  const [rawPhotoDataUrl, setRawPhotoDataUrl] = useState<string | null>(null);
  const [stampedPhotoDataUrl, setStampedPhotoDataUrl] = useState<string | null>(null);
  const [photoQuality, setPhotoQuality] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [photoProvenance, setPhotoProvenance] = useState<'VERIFIED' | 'UNKNOWN'>('UNKNOWN');

  // Step 3: USE MY LOCATION
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number; time: string }>({
    lat: 17.4399,
    lng: 78.3845,
    accuracy: 12,
    time: '03 Oct 2026, 09:42 IST',
  });
  const [locationStatus, setLocationStatus] = useState<string>('GPS captured with consent');
  const [isLocating, setIsLocating] = useState(false);

  // Step 4: ADD DETAILS
  const [locationName, setLocationName] = useState('North Gate Perimeter, Sector 4 Industrial Corridor');
  const [description, setDescription] = useState(
    'Dense dark smoke plume observed escaping from vertical furnace stack. Distinct unburnt fuel odor detectable at residential boundary.'
  );
  const [contact, setContact] = useState('N. Sharma (Verified Resident)');

  // Step 5: SUBMISSION STATE
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<CommunityReport | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate Evidence Stamp onto HTML5 Canvas
  const generateEvidenceStamp = useCallback(
    (imgSrc: string, cat: string, lat: number, lng: number, acc: number) => {
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

        ctx.drawImage(img, 0, 0, w, h);

        const bannerHeight = 75;
        ctx.fillStyle = 'rgba(8, 10, 9, 0.92)';
        ctx.fillRect(0, h - bannerHeight, w, bannerHeight);

        ctx.fillStyle = '#A8C83A';
        ctx.fillRect(0, h - bannerHeight, w, 2);

        ctx.fillStyle = '#F1F3EE';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText(`ONER EVIDENCE COPY • ${cat.replace('_', ' ')}`, 16, h - bannerHeight + 22);

        ctx.fillStyle = '#929A95';
        ctx.font = '11px monospace';
        ctx.fillText(`GPS: ${lat}° N, ${lng}° E (±${acc}m radius, consented) • ${coords.time}`, 16, h - bannerHeight + 42);

        ctx.fillStyle = '#A8C83A';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('STATUS: PENDING CORRELATION • EVIDENCE QUALITY: HIGH', 16, h - bannerHeight + 60);

        setStampedPhotoDataUrl(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = imgSrc;
    },
    [coords.time]
  );

  const loadSamplePhoto = useCallback(
    (sample: typeof SAMPLE_PRESETS[0]) => {
      setCategory(sample.category);
      setSeverity(sample.severity);
      setDescription(sample.description);
      setLocationName(sample.locationName);
      setPhotoQuality(sample.photoQuality);
      setCoords({
        lat: sample.lat,
        lng: sample.lng,
        accuracy: 12,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      });

      const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(sample.photoSvg)}`;
      setRawPhotoDataUrl(dataUri);
      generateEvidenceStamp(dataUri, sample.category, sample.lat, sample.lng, 12);
    },
    [generateEvidenceStamp]
  );

  useEffect(() => {
    loadSamplePhoto(SAMPLE_PRESETS[0]);
  }, [loadSamplePhoto]);

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
        setLocationStatus('GPS captured with consent (High accuracy lock)');
        setIsLocating(false);

        if (rawPhotoDataUrl) {
          generateEvidenceStamp(rawPhotoDataUrl, category, lat, lng, acc);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocationStatus('GPS permission denied — using industrial corridor baseline');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      setRawPhotoDataUrl(dataUri);
      setPhotoProvenance('UNKNOWN');
      generateEvidenceStamp(dataUri, category, coords.lat, coords.lng, coords.accuracy);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.submitCommunityReport({
        title: `${category.replace('_', ' ')} observation near ${locationName}`,
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
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout
      title="Report Pollution"
      subtitle="Public Environmental Evidence Submission & Corroboration"
    >
      <div className="space-y-6 max-w-4xl mx-auto pb-12 text-[#F1F3EE]">
        {/* ── Page Header ────────────────────────────────────────── */}
        <div className="p-5 rounded-xl bg-[#0E1110] border border-[#242A27] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono text-[#A8C83A] uppercase font-bold tracking-wider">
              CITIZEN EVIDENCE SUBMISSION &bull; SECTOR 4
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EE] mt-0.5">
              Report an Environmental Issue
            </h1>
            <p className="text-xs text-[#929A95] mt-0.5">
              Submit timestamped and geolocated evidence. ONER correlates observations with industrial stack sensors to trigger accountability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#929A95]">Demo Scenarios:</span>
            {SAMPLE_PRESETS.map((sample, idx) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => loadSamplePhoto(sample)}
                className="text-xs px-2.5 py-1 rounded bg-[#141817] hover:bg-[#1a221f] border border-[#242A27] text-zinc-300 hover:text-white transition-all cursor-pointer font-mono"
              >
                #{idx + 1} {sample.category.split('_')[0]}
              </button>
            ))}
          </div>
        </div>

        {!submittedReport ? (
          /* ── 5-STEP CLEAN REPORTING WORKFLOW (Section 24) ────────── */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── STEP 1: TELL US WHAT YOU SAW ────────────────────── */}
            <div className="p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#141817] text-[#A8C83A] flex items-center justify-center font-mono text-xs font-bold">
                    1
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#F1F3EE]">
                    TELL US WHAT YOU SAW
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-[#929A95]">Category</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.id);
                        if (rawPhotoDataUrl) {
                          generateEvidenceStamp(rawPhotoDataUrl, cat.id, coords.lat, coords.lng, coords.accuracy);
                        }
                      }}
                      className={`p-3 rounded-lg text-left text-xs transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#141817] text-[#F1F3EE] border-[#A8C83A]/60 shadow-sm'
                          : 'bg-[#080A09] text-[#929A95] hover:text-[#F1F3EE] border-[#242A27]'
                      }`}
                    >
                      <div className="text-lg mb-1">{cat.icon}</div>
                      <div className="font-semibold text-[#F1F3EE]">{cat.label}</div>
                    </button>
                  );
                })}
              </div>

              {/* Observed Severity */}
              <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-[10px] uppercase font-sans text-[#929A95] font-semibold">
                  Observed Severity:
                </span>
                <div className="flex items-center gap-1.5 font-mono">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        severity === sev
                          ? 'bg-[#141817] text-[#A8C83A] border-[#A8C83A]/50'
                          : 'bg-[#080A09] text-[#626A65] border-[#242A27]'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── STEP 2: SHOW US (PHOTO) ───────────────────────────── */}
            <div className="p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#141817] text-[#A8C83A] flex items-center justify-center font-mono text-xs font-bold">
                    2
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#F1F3EE]">
                    SHOW US (EVIDENCE COPY WITH CAPTURED METADATA)
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-[#A8C83A]">
                  PHOTO QUALITY: {photoQuality}
                </span>
              </div>

              {/* Preview Window */}
              <div className="relative aspect-[16/9] max-h-72 rounded bg-[#080A09] border border-[#242A27] overflow-hidden flex items-center justify-center">
                {rawPhotoDataUrl ? (
                  <img
                    src={stampedPhotoDataUrl || rawPhotoDataUrl}
                    alt="Evidence Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 text-[#626A65]">
                    <Camera size={28} className="mx-auto mb-1 text-[#626A65]" />
                    <span className="text-xs">Take or upload a photo of the observed condition</span>
                  </div>
                )}

                {/* Evidence Quality Watermark Banner */}
                {rawPhotoDataUrl && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 border border-[#A8C83A]/40 text-[9px] font-mono text-[#A8C83A]">
                    EVIDENCE COPY WITH CAPTURED METADATA
                  </div>
                )}
              </div>

              {/* Low Quality Photo Notice */}
              {photoQuality === 'LOW' && (
                <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-200 uppercase font-mono text-[10px]">Photo Quality: LOW · Report Accepted: </strong>
                    Image is blurry or degraded. Report is accepted without rejection. Corroboration will be derived via GPS, time synchronization, and facility CEMS sensor deviations.
                  </div>
                </div>
              )}

              {/* Upload Controls */}
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
                  className="flex items-center gap-2 px-3 py-2 rounded bg-[#141817] hover:bg-[#1C221F] border border-[#242A27] text-xs font-semibold text-[#F1F3EE] transition-colors cursor-pointer"
                >
                  <Upload size={14} className="text-[#A8C83A]" />
                  <span>Capture Photo / Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoQuality(photoQuality === 'HIGH' ? 'LOW' : 'HIGH');
                  }}
                  className="px-3 py-2 rounded bg-[#080A09] hover:bg-[#141817] border border-[#242A27] text-xs font-mono text-[#929A95] cursor-pointer"
                >
                  Toggle Quality Flag ({photoQuality})
                </button>
              </div>
            </div>

            {/* ── STEP 3: WHERE? ────────────────────────────────────── */}
            <div className="p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#141817] text-[#A8C83A] flex items-center justify-center font-mono text-xs font-bold">
                    3
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#F1F3EE]">
                    WHERE? (CAPTURED WITH YOUR CONSENT)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={isLocating}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#141817] hover:bg-[#1a221f] border border-[#242A27] text-xs font-mono text-[#A8C83A] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <MapPin size={12} />
                  <span>{isLocating ? 'Locking GPS...' : 'Use My Live GPS'}</span>
                </button>
              </div>

              {/* Verified Metadata Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-[#080A09] border border-[#242A27]">
                  <div className="text-[9px] uppercase font-sans text-zinc-500">Latitude</div>
                  <div className="font-bold text-zinc-200 mt-0.5">{coords.lat.toFixed(6)}° N</div>
                </div>

                <div className="p-2.5 rounded bg-[#080A09] border border-[#242A27]">
                  <div className="text-[9px] uppercase font-sans text-zinc-500">Longitude</div>
                  <div className="font-bold text-zinc-200 mt-0.5">{coords.lng.toFixed(6)}° E</div>
                </div>

                <div className="p-2.5 rounded bg-[#080A09] border border-[#242A27]">
                  <div className="text-[9px] uppercase font-sans text-zinc-500">Accuracy</div>
                  <div className="font-bold text-emerald-400 mt-0.5">±{coords.accuracy} m radius</div>
                </div>

                <div className="p-2.5 rounded bg-[#080A09] border border-[#242A27]">
                  <div className="text-[9px] uppercase font-sans text-zinc-500">Timestamp</div>
                  <div className="font-bold text-zinc-200 mt-0.5 truncate">{coords.time}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#929A95]">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>{locationStatus}</span>
              </div>
            </div>

            {/* ── STEP 4: DETAILS ─────────────────────────────────── */}
            <div className="p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#141817] text-[#A8C83A] flex items-center justify-center font-mono text-xs font-bold">
                  4
                </span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#F1F3EE]">
                  DETAILS
                </h2>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-[#929A95] block mb-1">
                    Landmark / Perimeter Note
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#080A09] border border-[#242A27] text-[#F1F3EE] focus:outline-none focus:border-[#A8C83A]/50 font-sans"
                    placeholder="e.g. North Gate Perimeter, Orion Refining"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#929A95] block mb-1">
                    What Did You Observe? (Smell, density, direction)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#080A09] border border-[#242A27] text-[#F1F3EE] focus:outline-none focus:border-[#A8C83A]/50 font-sans resize-none"
                    placeholder="Describe the visible smoke, odor intensity, or discharge..."
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#929A95] block mb-1">
                    Reporter Name / Identifier
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#080A09] border border-[#242A27] text-[#F1F3EE] focus:outline-none focus:border-[#A8C83A]/50 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* ── STEP 5: FILE IT ───────────────────────────────────── */}
            <div className="p-5 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#141817] text-[#A8C83A] flex items-center justify-center font-mono text-xs font-bold">
                    5
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#F1F3EE]">
                    FILE IT
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-[#A8C83A]">
                  REWARD: +50 IMPACT POINTS UPON CORROBORATION
                </span>
              </div>

              <p className="text-[11px] text-[#929A95] leading-relaxed">
                Submitting this report transmits your evidence copy with captured metadata into the ONER correlation engine. The engine cross-references live stack CEMS and ambient stations without exposing private data.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded bg-[#141817] hover:bg-[#1D2320] border border-[#A8C83A]/60 text-[#F1F3EE] font-mono font-bold text-xs tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-[#A8C83A]" />
                    <span>FUSING WITH REGIONAL TELEMETRY...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} className="text-[#A8C83A]" />
                    <span>FILE CITIZEN REPORT</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ── Post-Submission Confirmation Dossier ──────────────── */
          <div className="p-6 rounded-lg bg-[#0E1110] border border-[#242A27] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242A27]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#141817] border border-[#A8C83A]/40 flex items-center justify-center text-[#A8C83A]">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#F1F3EE]">CASE CREATED & CORROBORATED</h2>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#141817] text-[#A8C83A] border border-[#A8C83A]/30 font-bold">
                      {submittedReport.id}
                    </span>
                  </div>
                  <div className="text-xs text-[#929A95] mt-0.5">
                    Your evidence has been linked to {submittedReport.correlated_facility}.
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-mono text-[#626A65]">Points Awarded</div>
                <div className="text-lg font-mono font-bold text-[#A8C83A]">+50 Impact Points</div>
              </div>
            </div>

            {/* Simple Citizen Outcome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                <span className="text-[10px] uppercase font-mono text-[#626A65] font-semibold">What You Reported</span>
                <div className="font-semibold text-[#F1F3EE]">{submittedReport.category.replace('_', ' ')}</div>
                <p className="text-[11px] text-[#929A95] italic">&quot;{submittedReport.description}&quot;</p>
              </div>

              <div className="p-3.5 rounded bg-[#080A09] border border-[#242A27] space-y-1">
                <span className="text-[10px] uppercase font-mono text-[#626A65] font-semibold">What ONER Verified</span>
                <div className="font-semibold text-[#A8C83A]">{submittedReport.corroboration_score}% Sensor Corroborated</div>
                <p className="text-[11px] text-[#929A95]">Probable source: {submittedReport.likely_source}</p>
              </div>
            </div>

            {/* Actions: Open Case */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSubmittedReport(null)}
                className="text-xs font-mono text-[#929A95] hover:text-[#F1F3EE] cursor-pointer"
              >
                ← Submit Another Observation
              </button>

              <div className="flex items-center gap-3">
                <Link
                  href="/community"
                  className="px-3.5 py-2 rounded bg-[#141817] hover:bg-[#1D2320] border border-[#242A27] text-xs font-medium text-[#929A95] hover:text-[#F1F3EE] transition-colors"
                >
                  View Community Ledger
                </Link>

                <Link
                  href={`/case/${submittedReport.id}?level=field`}
                  className="px-4 py-2 rounded bg-[#141817] hover:bg-[#1D2320] border border-[#A8C83A]/60 text-xs font-mono font-bold text-[#A8C83A] transition-all flex items-center gap-1.5"
                >
                  <span>OPEN CASE DOSSIER</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
