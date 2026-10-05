/**
 * ONER Canonical Demo Seed Data — Single Source of Truth
 * 
 * Spec: docs/ONER_Antigravity_Prompt_Pack.md §0.15
 * Direction: A + C (Evidence Intelligence OS)
 *
 * NOTE ON VERIFICATION WORDING:
 * 14.2 tCO₂e/day is measured via CEMS telemetry, with MRV evidence assembled
 * and the result returned to the resident. Third-party carbon credit certification
 * remains pending (not issued credits).
 */

export interface EvidenceSignal {
  id: string;
  name: string;
  possible: number;
  earned: number;
  note: string;
  status: 'verified' | 'corroborated' | 'active';
  description: string;
}

export interface DemoCase {
  id: string;
  title: string;
  timestamp: string;
  isoTimestamp: string;
  facility: string;
  equipment: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
    accuracyMeters: number;
  };
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reporter: {
    name: string;
    role: string;
    points: number;
    reportsSubmitted: number;
  };
  scores: {
    isolation: number;       // 0.884 Isolation Forest decision function output (not %)
    corroboration: number;   // 89.4 weighted evidence fusion score (not probability)
    support: number;         // 99.4 deterministic domain support score
    health: number;          // 87.3 facility health index (not %)
  };
  deviations: {
    noxPct: string;          // +31.4% (131.4 mg/Nm³ vs 100 limit)
    pm25Pct: string;         // +22.7% (73.6 µg/m³)
    thermalDelta: string;    // +18.4°C stack temperature deviation
    airFuelRatio: string;    // 0.94 (sub-stoichiometric)
  };
  rootCause: {
    title: string;
    description: string;
    status: string;
  };
  intervention: {
    name: string;
    setpoint: number;        // 1.042 recommended damper trim
    sliderMin: number;
    sliderMax: number;
    recommended: number;
    workOrder: string;
    engineer: string;
  };
  impact: {
    noxReductionKgDay: number;       // 28.6 kg/day
    co2eDailyReductionTonnes: number;// 14.2 tCO₂e/day measured
    co2eAnnualizedTonnes: number;    // 5,183 tCO₂e/year (14.2 × 365)
    baselineDailyRate: number;       // 104.2 tCO₂e/day (Furnace F-101 Train)
    postActionDailyRate: number;     // 90.0 tCO₂e/day
    verificationNotice: string;
    disclaimer: string;
  };
  signals: EvidenceSignal[];
  beats: Array<{
    stage: string;
    title: string;
    description: string;
    actor: string;
  }>;
}

export const CANONICAL_CASE: DemoCase = {
  id: 'COMM-2026-00421',
  title: 'Dense dark smoke plume with acrid chemical odor near North Stack',
  timestamp: '03 Oct 2026, 09:42 IST',
  isoTimestamp: '2026-10-03T09:42:15Z',
  facility: 'Orion Refining Complex',
  equipment: 'Furnace F-101',
  locationName: 'North Gate Perimeter, Sector 4 Industrial Zone',
  coordinates: {
    lat: 17.4399,
    lng: 78.3845,
    accuracyMeters: 12,
  },
  category: 'Smoke / Emissions',
  severity: 'HIGH',
  reporter: {
    name: 'N. Sharma (Verified Resident)',
    role: 'Trusted Civic Sentinel',
    points: 50,
    reportsSubmitted: 24,
  },
  scores: {
    isolation: 0.884,
    corroboration: 89.4,
    support: 99.4,
    health: 87.3,
  },
  deviations: {
    noxPct: '+31.4% (131.4 mg/Nm³)',
    pm25Pct: '+22.7% (73.6 µg/m³)',
    thermalDelta: '+18.4°C stack temperature deviation',
    airFuelRatio: '0.94 (sub-stoichiometric)',
  },
  rootCause: {
    title: 'Burner refractory fouling + air-fuel stoichiometric imbalance',
    description: 'Burner refractory fouling is reducing thermal efficiency and creating incomplete combustion.',
    status: 'Deterministic domain logic verified',
  },
  intervention: {
    name: 'Damper trim compensation',
    setpoint: 1.042,
    sliderMin: 1.000,
    sliderMax: 1.100,
    recommended: 1.042,
    workOrder: '#WO-8821',
    engineer: 'M. Rao (Chief Combustion Engineer)',
  },
  impact: {
    noxReductionKgDay: 28.6,
    co2eDailyReductionTonnes: 14.2,
    co2eAnnualizedTonnes: 5183.0,
    baselineDailyRate: 104.2,
    postActionDailyRate: 90.0,
    verificationNotice: '14.2 tCO₂e/day measured, with MRV evidence assembled and the result returned to the resident. Third-party certification remains pending.',
    disclaimer: 'Potential creditable reduction is an estimate based on sustained post-action CEMS levels, not an issued carbon credit. Demo data · Simulated telemetry · Prototype workflow.',
  },
  signals: [
    {
      id: 'sig-1',
      name: 'Citizen report',
      possible: 10,
      earned: 4.2,
      note: 'photo + location',
      status: 'verified',
      description: 'Timestamped geotagged optical evidence from resident camera.',
    },
    {
      id: 'sig-2',
      name: 'Facility proximity',
      possible: 20,
      earned: 19.2,
      note: 'F-101 nearby',
      status: 'verified',
      description: 'Downwind geographic proximity model places plume at Furnace F-101 stack.',
    },
    {
      id: 'sig-3',
      name: 'Time match',
      possible: 15,
      earned: 14.1,
      note: 'aligned',
      status: 'verified',
      description: 'Report filed within ±45s of initial combustion oscillation.',
    },
    {
      id: 'sig-4',
      name: 'Telemetry',
      possible: 30,
      earned: 28.5,
      note: 'NOx +31.4%',
      status: 'verified',
      description: 'CEMS stack probe records 131.4 mg/Nm³ NOx and +18.4°C thermal deviation.',
    },
    {
      id: 'sig-5',
      name: 'Ambient sensor',
      possible: 15,
      earned: 13.8,
      note: 'agrees',
      status: 'verified',
      description: 'Regional AQI station 4 records PM2.5 rise to 73.6 µg/m³ downwind.',
    },
    {
      id: 'sig-6',
      name: 'Baseline',
      possible: 10,
      earned: 9.6,
      note: 'outside normal',
      status: 'verified',
      description: 'Isolation Forest flags operating parameters outside 90-day envelope.',
    },
  ],
  beats: [
    { stage: 'Seen', title: 'Seen', description: 'A resident photographs smoke', actor: 'Community' },
    { stage: 'Fused', title: 'Fused', description: 'Six signals checked', actor: 'ONER' },
    { stage: 'Explained', title: 'Explained', description: 'Cause found', actor: 'ONER' },
    { stage: 'Acted', title: 'Acted', description: 'Facility applies the fix', actor: 'Industry' },
    { stage: 'Verified', title: 'Verified', description: 'Result measured', actor: 'Government' },
    { stage: 'Returned', title: 'Returned', description: 'Impact reaches the resident', actor: 'Community' },
  ],
};

export const DEMO_TAGS = {
  disclaimer: 'Demo data · Simulated telemetry · Prototype workflow',
  illustrative: 'Illustrative economic model · Not financial advice',
  mrvPending: 'MRV ready · Third-party verification pending',
};

/**
 * Ensures presentation layer always displays the canonical facility name
 * even if legacy backend endpoints return "Orion Manufacturing Plant".
 */
export function normalizeFacilityName(name?: string | null): string {
  if (!name || name === 'Orion Manufacturing Plant') return 'Orion Refining Complex';
  return name;
}
