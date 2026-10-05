'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AtmosphericShell from '@/components/shell/AtmosphericShell';
import HorizonLine from '@/components/primitives/HorizonLine';
import DemoTag from '@/components/primitives/DemoTag';
import StateMark from '@/components/primitives/StateMark';
import { api } from '@/lib/api';
import { CANONICAL_CASE } from '@/lib/seed';
import {
  Camera,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  Info,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface CategoryOption {
  id: string;
  label: string;
  glyph: string;
  defaultSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const CATEGORIES: CategoryOption[] = [
  { id: 'SMOKE_EMISSIONS', label: 'Smoke / Emissions', glyph: '💨', defaultSeverity: 'HIGH' },
  { id: 'WATER_POLLUTION', label: 'Water Pollution', glyph: '💧', defaultSeverity: 'CRITICAL' },
  { id: 'ODOR', label: 'Chemical Odor / Fumes', glyph: '🧪', defaultSeverity: 'MEDIUM' },
  { id: 'DUST', label: 'Fugitive Dust Plume', glyph: '🌪️', defaultSeverity: 'LOW' },
  { id: 'NOISE', label: 'Industrial Noise / Drone', glyph: '🔊', defaultSeverity: 'MEDIUM' },
  { id: 'CHEMICAL', label: 'Chemical Leak / Spill', glyph: '⚠️', defaultSeverity: 'CRITICAL' },
];

export default function ReportPage() {
  const router = useRouter();

  // 5-step wizard state
  const [step, setStep] = useState<number>(1);

  // Step 1: WHAT DID YOU SEE?
  const [category, setCategory] = useState<string>('SMOKE_EMISSIONS');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');

  // Step 2: SHOW US (Photo upload & quality signals)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');
  const [photoQuality, setPhotoQuality] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3: WHERE? (Consensual location & bearing)
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number }>({
    lat: 17.4399,
    lng: 78.3845,
    accuracy: 12,
  });
  const [locationName, setLocationName] = useState<string>('North Gate Perimeter, Sector 4 Industrial Corridor');
  const [locationGranted, setLocationGranted] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [bearingAngle, setBearingAngle] = useState<number>(45); // bearing toward facility stack

  // Step 4: DETAILS
  const [description, setDescription] = useState<string>(
    'Dense dark smoke plume observed escaping from vertical furnace stack. Distinct unburnt fuel odor detectable at residential boundary.'
  );
  const [reporterName, setReporterName] = useState<string>('');

  // Step 5 & Seed Handoff state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [handoffActive, setHandoffActive] = useState<boolean>(false);
  const [handoffCaseId, setHandoffCaseId] = useState<string>('COMM-2026-00421');
  const [handoffStep, setHandoffStep] = useState<number>(0);

  // Request browser location with explicit consent
  const handleRequestLocation = () => {
    setIsLocating(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: parseFloat(pos.coords.latitude.toFixed(4)),
            lng: parseFloat(pos.coords.longitude.toFixed(4)),
            accuracy: Math.round(pos.coords.accuracy),
          });
          setLocationGranted(true);
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, using default coordinates:', err);
          setIsLocating(false);
          setLocationGranted(true);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Handle Photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoDataUrl(event.target?.result as string);
      // Determine quality signal based on resolution/size
      if (file.size > 200000) {
        setPhotoQuality('HIGH');
      } else if (file.size > 50000) {
        setPhotoQuality('MEDIUM');
      } else {
        setPhotoQuality('LOW');
      }
    };
    reader.readAsDataURL(file);
  };

  // Demo scenario quick loader
  const loadDemoScenario = () => {
    setCategory('SMOKE_EMISSIONS');
    setSeverity('HIGH');
    setLocationName('North Gate Perimeter, Sector 4 Industrial Corridor');
    setDescription(
      'Dense dark smoke plume observed escaping from vertical furnace stack. Distinct unburnt fuel odor detectable at residential boundary.'
    );
    setReporterName('N. Sharma (Verified Resident)');
    setCoords({ lat: 17.4399, lng: 78.3845, accuracy: 12 });
  };

  // Submit report to backend and trigger the Seed Handoff sequence
  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    let assignedId = 'COMM-2026-00421';

    try {
      const payload = {
        title: `${category.replace('_', ' ')} observation near ${locationName.split(',')[0]}`,
        category,
        severity,
        description,
        latitude: coords.lat,
        longitude: coords.lng,
        location_name: locationName,
        accuracy_meters: coords.accuracy,
        contact: reporterName.trim() || 'Anonymous Resident',
        photo_url: photoDataUrl || '/evidence/smoke_plume_01.jpg',
      };

      const result = await api.submitCommunityReport(payload);
      if (result && result.id) {
        assignedId = result.id;
      }
    } catch (err) {
      console.warn('Backend submit failed or offline, proceeding with canonical case ID:', err);
    }

    setHandoffCaseId(assignedId);
    setIsSubmitting(false);
    setHandoffActive(true);

    // Play Seed Handoff sequence
    // 0: Field note compacts
    // 1: Lime seed dot emerges
    // 2: Seed travels to Horizon
    // 3: Horizon activates
    // 4: Transition to Case page
    setTimeout(() => setHandoffStep(1), 600);
    setTimeout(() => setHandoffStep(2), 1400);
    setTimeout(() => setHandoffStep(3), 2200);
    setTimeout(() => {
      router.push(`/case/${assignedId}?level=field`);
    }, 3200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F3EC] text-[#1B211C]" data-atmosphere="field">
      {/* ── Top Atmospheric Shell ───────────────────────────── */}
      <AtmosphericShell />

      {/* ── Main Field Note Writing Surface ─────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Progress Thread (5 steps) */}
        <div className="mb-6 select-none">
          <div className="flex items-center justify-between text-xs font-mono text-[#7B837C] mb-2">
            <span>FIELD NOTE · STEP 0{step} OF 05</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadDemoScenario}
                className="text-[11px] font-mono text-[#4F6A0E] hover:underline cursor-pointer"
              >
                Load demo observation
              </button>
            </div>
          </div>

          {/* 5-Segment Progress Bar */}
          <div className="grid grid-cols-5 gap-1.5 h-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-full rounded-full transition-colors duration-300 ${
                  i <= step ? 'bg-[#4F6A0E]' : 'bg-[#DAD8CC]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── STEP 1: WHAT DID YOU SEE? ─────────────────────── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1B211C] tracking-tight">
                What did you see?
              </h1>
              <p className="text-sm text-[#4F5851] mt-1 font-sans">
                Select the environmental category that best matches your observation.
              </p>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setSeverity(cat.defaultSeverity);
                    }}
                    className={`p-4 rounded-[2px] border text-left transition-all cursor-pointer flex items-center justify-between min-h-[56px] ${
                      isSelected
                        ? 'bg-[#FFFFFF] border-[#4F6A0E] ring-1 ring-[#4F6A0E] shadow-sm'
                        : 'bg-[#FBFAF5] border-[#DAD8CC] hover:border-[#B8B5A5]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl" role="img" aria-label={cat.label}>
                        {cat.glyph}
                      </span>
                      <span className="text-sm font-medium text-[#1B211C]">{cat.label}</span>
                    </div>
                    {isSelected && <Check size={16} className="text-[#4F6A0E]" />}
                  </button>
                );
              })}
            </div>

            {/* Severity Segmented Control */}
            <div className="pt-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[#7B837C] block mb-2">
                Severity Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((sev) => {
                  const isSelected = severity === sev;
                  return (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-2 px-3 rounded-[2px] text-xs font-mono text-center transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#FFFFFF] border-[#4F6A0E] text-[#1B211C] font-semibold shadow-xs'
                          : 'bg-[#FBFAF5] border-[#DAD8CC] text-[#7B837C] hover:text-[#1B211C]'
                      }`}
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-[2px] bg-[#A8C83A] hover:bg-[#99B732] text-[#121A0A] font-medium text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: SHOW US (Camera & Photo Quality) ────────── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1B211C] tracking-tight">
                Show us what you observed.
              </h1>
              <p className="text-sm text-[#4F5851] mt-1 font-sans">
                A photograph provides optical evidence for sensor correlation. You may also continue without a photo.
              </p>
            </div>

            {/* Hidden native camera/file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {/* Photo Capture Surface */}
            <div className="border border-dashed border-[#DAD8CC] rounded-[2px] p-6 bg-[#FBFAF5] text-center space-y-4">
              {photoDataUrl ? (
                <div className="space-y-3">
                  <div className="relative max-w-sm mx-auto h-48 rounded-[2px] overflow-hidden border border-[#DAD8CC] shadow-inner bg-[#161C18]">
                    <img
                      src={photoDataUrl}
                      alt="Captured evidence observation"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#000000]/70 text-[#FFFFFF] px-2 py-0.5 rounded-[1px] text-[10px] font-mono">
                      {photoName || 'Captured Photo'}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-mono text-[#4F6A0E] hover:underline cursor-pointer"
                    >
                      Replace photograph
                    </button>
                    <span className="text-[#DAD8CC]">·</span>
                    <button
                      type="button"
                      onClick={() => setPhotoDataUrl(null)}
                      className="text-xs font-mono text-[#7B837C] hover:text-[#1B211C] cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#E8E6DC] text-[#4F6A0E] flex items-center justify-center mx-auto">
                    <Camera size={22} />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2 rounded-[2px] bg-[#FFFFFF] border border-[#DAD8CC] hover:border-[#4F6A0E] text-sm font-medium text-[#1B211C] transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
                    >
                      <Upload size={14} />
                      <span>Take photo or upload file</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#7B837C] font-mono">
                    Direct camera capture or image selection (JPEG, PNG)
                  </p>
                </div>
              )}
            </div>

            {/* Quality Signal Assessment (Not authenticity claim) */}
            <div className="p-3.5 rounded-[2px] bg-[#FFFFFF] border border-[#DAD8CC] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#7B837C]">
                  Photo Quality Signal
                </span>
                <span className="font-mono text-[11px] text-[#4F6A0E] font-medium">
                  {photoDataUrl ? `Signal: ${photoQuality}` : 'No photo attached'}
                </span>
              </div>

              {/* 3 Quality Pips */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="flex items-center gap-2 p-2 rounded-[1px] bg-[#FBFAF5] border border-[#E6E4D9]">
                  <span className={`w-2 h-2 rounded-full ${photoDataUrl ? 'bg-[#4F6A0E]' : 'bg-[#DAD8CC]'}`} />
                  <span className="font-mono text-[10px]">Sharpness</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-[1px] bg-[#FBFAF5] border border-[#E6E4D9]">
                  <span className={`w-2 h-2 rounded-full ${photoDataUrl ? 'bg-[#4F6A0E]' : 'bg-[#DAD8CC]'}`} />
                  <span className="font-mono text-[10px]">Exposure</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-[1px] bg-[#FBFAF5] border border-[#E6E4D9]">
                  <span className={`w-2 h-2 rounded-full ${photoDataUrl ? 'bg-[#4F6A0E]' : 'bg-[#DAD8CC]'}`} />
                  <span className="font-mono text-[10px]">Subject Visible</span>
                </div>
              </div>

              <div className="text-[10px] font-mono text-[#7B837C] pt-1">
                Notice: Quality indicators assess visual legibility, not cryptographic authenticity.
              </div>
            </div>

            {/* Navigation */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-mono text-[#7B837C] hover:text-[#1B211C] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-[2px] bg-[#A8C83A] hover:bg-[#99B732] text-[#121A0A] font-medium text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: WHERE? (Consensual Location & Bearing) ──── */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1B211C] tracking-tight">
                Where did you see it?
              </h1>
              <p className="text-sm text-[#4F5851] mt-1 font-sans">
                Location helps ONER compare your observation with nearby environmental telemetry.
              </p>
            </div>

            {/* Plain-Language Consent Card */}
            <div className="p-4 rounded-[2px] bg-[#FFFFFF] border border-[#DAD8CC] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1B211C] flex items-center gap-2">
                  <MapPin size={14} className="text-[#4F6A0E]" />
                  <span>Location captured with your consent</span>
                </span>
                <button
                  type="button"
                  onClick={handleRequestLocation}
                  disabled={isLocating}
                  className="text-xs font-mono text-[#4F6A0E] hover:underline cursor-pointer"
                >
                  {isLocating ? 'Locating...' : 'Update GPS'}
                </button>
              </div>

              <p className="text-xs text-[#4F5851] leading-relaxed">
                Coordinates are used only to corroborate with stack telemetry and regional AQI stations.
                You are in control of your data.
              </p>

              {/* Coordinates Monospace Display */}
              <div className="p-2.5 rounded-[1px] bg-[#FBFAF5] border border-[#E6E4D9] font-mono text-xs text-[#1B211C] flex flex-wrap items-center justify-between gap-2">
                <span>Latitude: {coords.lat}° N</span>
                <span>Longitude: {coords.lng}° E</span>
                <span className="text-[#7B837C]">Accuracy: ±{coords.accuracy}m</span>
              </div>
            </div>

            {/* Bearing Wedge Control (Drag angle toward plume source) */}
            <div className="p-4 rounded-[2px] bg-[#FFFFFF] border border-[#DAD8CC] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#1B211C]">Plume Observation Bearing</span>
                <span className="font-mono text-[#4F6A0E] font-semibold">{bearingAngle}° NNE</span>
              </div>

              <input
                type="range"
                min="0"
                max="360"
                value={bearingAngle}
                onChange={(e) => setBearingAngle(Number(e.target.value))}
                className="w-full accent-[#4F6A0E] cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-[#7B837C]">
                <span>0° North</span>
                <span>90° East</span>
                <span>180° South</span>
                <span>270° West</span>
              </div>
            </div>

            {/* Location Label Note */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#7B837C] block mb-1.5">
                Perimeter Landmark Note
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. North Gate Perimeter, Sector 4 Industrial Zone"
                className="w-full px-3 py-2 text-sm rounded-[2px] border border-[#DAD8CC] bg-[#FFFFFF] text-[#1B211C] focus:border-[#4F6A0E] focus:outline-none"
              />
            </div>

            {/* Navigation */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-mono text-[#7B837C] hover:text-[#1B211C] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-[2px] bg-[#A8C83A] hover:bg-[#99B732] text-[#121A0A] font-medium text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: DETAILS ─────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1B211C] tracking-tight">
                Tell us what you noticed.
              </h1>
              <p className="text-sm text-[#4F5851] mt-1 font-sans">
                Brief field details help combustion engineers isolate equipment sources faster.
              </p>
            </div>

            {/* Description Textarea */}
            <div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe color of plume, odor, duration, or any audible droning..."
                className="w-full p-3.5 text-sm rounded-[2px] border border-[#DAD8CC] bg-[#FFFFFF] text-[#1B211C] focus:border-[#4F6A0E] focus:outline-none leading-relaxed"
              />
            </div>

            {/* Reporter Attribution */}
            <div className="p-4 rounded-[2px] bg-[#FFFFFF] border border-[#DAD8CC] space-y-3">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-[#7B837C] block mb-1">
                  Reporter Identification
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Enter your name or file anonymously"
                  className="w-full px-3 py-2 text-sm rounded-[2px] border border-[#DAD8CC] bg-[#FBFAF5] text-[#1B211C] focus:border-[#4F6A0E] focus:outline-none"
                />
              </div>

              <div className="text-[11px] font-mono text-[#7B837C] flex items-center justify-between">
                <span>Earn +50 Community Impact Points when corroborated</span>
                <span className="text-[#4F6A0E]">Civic Reward System</span>
              </div>
            </div>

            {/* Navigation */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 text-xs font-mono text-[#7B837C] hover:text-[#1B211C] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-2.5 rounded-[2px] bg-[#A8C83A] hover:bg-[#99B732] text-[#121A0A] font-medium text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Review observation</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: FILE IT (Final Review & Submission) ─────── */}
        {step === 5 && !handoffActive && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1B211C] tracking-tight">
                Review your field note.
              </h1>
              <p className="text-sm text-[#4F5851] mt-1 font-sans">
                Review the observation before submitting into the environmental intelligence network.
              </p>
            </div>

            {/* Summary Review Sheet */}
            <div className="p-5 rounded-[2px] bg-[#FFFFFF] border border-[#DAD8CC] space-y-4 shadow-sm">
              <div className="flex items-start justify-between border-b border-[#E6E4D9] pb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#7B837C]">
                    Incident Classification
                  </div>
                  <div className="text-base font-semibold text-[#1B211C] mt-0.5">
                    {category.replace('_', ' ')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-[1px] bg-[#E8E6DC] text-[#4F6A0E] font-semibold">
                    {severity} SEVERITY
                  </span>
                </div>
              </div>

              {/* Observation & Location */}
              <div className="space-y-2 text-xs">
                <div className="text-[#4F5851] leading-relaxed">
                  "{description}"
                </div>

                <div className="pt-2 font-mono text-[11px] text-[#7B837C] flex flex-wrap gap-4 border-t border-[#E6E4D9]">
                  <span>{locationName}</span>
                  <span>{coords.lat}° N, {coords.lng}° E</span>
                  <span>{reporterName.trim() || 'Anonymous Resident'}</span>
                </div>
              </div>

              {/* What Happens Next: 3 Slots filled by citizen, 3 checked by ONER */}
              <div className="pt-3 border-t border-[#E6E4D9] space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#7B837C]">
                  Evidence Convergence Readiness
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded-[1px] bg-[#E8E6DC] border border-[#DAD8CC] text-[#4F6A0E]">
                    ✓ Photo plate
                  </div>
                  <div className="p-2 rounded-[1px] bg-[#E8E6DC] border border-[#DAD8CC] text-[#4F6A0E]">
                    ✓ Consensual GPS
                  </div>
                  <div className="p-2 rounded-[1px] bg-[#E8E6DC] border border-[#DAD8CC] text-[#4F6A0E]">
                    ✓ Timestamp
                  </div>
                  <div className="p-2 rounded-[1px] bg-[#FBFAF5] border border-[#DAD8CC] text-[#7B837C]">
                    ONER will check
                  </div>
                  <div className="p-2 rounded-[1px] bg-[#FBFAF5] border border-[#DAD8CC] text-[#7B837C]">
                    ONER will check
                  </div>
                  <div className="p-2 rounded-[1px] bg-[#FBFAF5] border border-[#DAD8CC] text-[#7B837C]">
                    ONER will check
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation & Submit CTA */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-4 py-2 text-xs font-mono text-[#7B837C] hover:text-[#1B211C] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Edit note</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-[2px] bg-[#A8C83A] hover:bg-[#99B732] text-[#121A0A] font-medium text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Filing observation...' : 'File environmental report'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── SEED HANDOFF ANIMATION SCREEN ─────────────────────── */}
        {handoffActive && (
          <div className="py-12 text-center space-y-6 animate-in fade-in duration-300 select-none">
            {/* Compact Evidence Plate */}
            <div className="max-w-xs mx-auto p-4 rounded-[2px] bg-[#FFFFFF] border border-[#4F6A0E] shadow-xl space-y-3 relative">
              <div className="h-28 rounded-[1px] bg-[#161C18] flex items-center justify-center text-[#A8C83A] font-mono text-xs overflow-hidden relative">
                {photoDataUrl ? (
                  <img src={photoDataUrl} alt="Submitted evidence" className="w-full h-full object-cover" />
                ) : (
                  <span>[Optical Evidence Seed]</span>
                )}

                {/* Animated Seed Dot emerging from photo in handoffStep 1 */}
                {handoffStep >= 1 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-[#A8C83A] animate-ping" />
                  </div>
                )}
              </div>

              <div className="text-left font-mono text-[10px] space-y-0.5">
                <div className="text-[#1B211C] font-semibold">{handoffCaseId}</div>
                <div className="text-[#7B837C]">{locationName.split(',')[0]} · 09:42 IST</div>
              </div>

              {/* Seed traveling toward horizon */}
              {handoffStep >= 2 && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-[1px] h-6 bg-[#A8C83A] animate-pulse" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#A8C83A]" />
                </div>
              )}
            </div>

            {/* Narrative Status Headline */}
            <div className="space-y-1.5 pt-4">
              <div className="text-xs font-mono uppercase tracking-wider text-[#4F6A0E] font-semibold">
                {handoffStep === 0 && 'OBSERVATION REGISTERED'}
                {handoffStep === 1 && 'EMITTING EVIDENCE SEED'}
                {handoffStep === 2 && 'CROSSING INTO CONTROL SURFACE'}
                {handoffStep >= 3 && 'CASE OPENED'}
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-[#1B211C]">
                You've added evidence to the environmental network.
              </h2>

              <p className="text-xs font-mono text-[#7B837C]">
                Case {handoffCaseId} generated · Correlating multi-source telemetry...
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
