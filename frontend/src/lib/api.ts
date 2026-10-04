// API client — all calls go through backend, never exposing keys to browser
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export const api = {
  overview: () => apiFetch('/api/overview'),
  analytics: (days: number) => apiFetch(`/api/analytics?days=${days}`),
  anomalies: () => apiFetch('/api/anomalies'),
  forecast: () => apiFetch('/api/forecast'),
  rootCause: (id: string) => apiFetch(`/api/root-cause/${id}`),
  simulate: (interventionId: string, customParams?: Record<string, unknown>) =>
    apiFetch('/api/simulate', {
      method: 'POST',
      body: JSON.stringify({ intervention_id: interventionId, custom_params: customParams || {} }),
    }),
  simulateAll: () => apiFetch('/api/simulate/all'),
  recommendations: () => apiFetch('/api/recommendations'),
  carbon: () => apiFetch('/api/carbon'),
  climate: () => apiFetch('/api/climate'),
  copilot: (message: string, history?: { role: string; content: string }[]) =>
    apiFetch('/api/copilot', {
      method: 'POST',
      body: JSON.stringify({ message, history: history || [] }),
    }),
  // Community Network
  getCommunityReports: () => apiFetch('/api/community/reports'),
  getCommunityReport: (id: string) => apiFetch(`/api/community/reports/${id}`),
  submitCommunityReport: (data: Partial<CommunityReport>) =>
    apiFetch('/api/community/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  takeIndustryAction: (id: string, actionType: string, notes?: string, engineer?: string) =>
    apiFetch(`/api/community/reports/${id}/industry-action`, {
      method: 'POST',
      body: JSON.stringify({ action_type: actionType, action_notes: notes, engineer_name: engineer }),
    }),
  takeGovernmentAction: (id: string, actionType: string, notes?: string, officer?: string) =>
    apiFetch(`/api/community/reports/${id}/government-action`, {
      method: 'POST',
      body: JSON.stringify({ action_type: actionType, notes, officer_name: officer }),
    }),
  getIndustryCases: () => apiFetch('/api/industry/cases'),
  getPact: () => apiFetch('/api/pact'),
  getGovernmentOverview: () => apiFetch('/api/government/overview'),
  getImpactModel: () => apiFetch('/api/impact/model'),
};

// Type definitions
export interface KPI {
  value: number | string;
  unit?: string;
  change_pct?: number;
}

export interface HealthScore {
  score: number;
  components: Record<string, number>;
  formula: string;
}

export interface Alert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'WATCH' | 'NORMAL';
  component?: string;
  date: string;
  evidence: string;
  co2_tonnes: number;
  electricity_kwh: number;
  incident_type?: string;
}

export interface ForecastRecord {
  date: string;
  co2_tonnes: number;
  electricity_kwh: number;
  is_forecast?: boolean;
}

export interface Scenario {
  intervention_id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  implementation_cost_usd: number;
  annual_co2_reduction_tonnes: number;
  annual_energy_savings_kwh: number;
  annual_monetary_savings_usd: number;
  payback_years: number | null;
  environmental_impact_score: number;
  rank_score: number;
}

export interface CommunityReport {
  id: string;
  title: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  latitude: number;
  longitude: number;
  location_name: string;
  accuracy_meters: number;
  timestamp: string;
  timestamp_formatted: string;
  photo_url?: string;
  photo_data_url?: string;
  contact?: string;
  status: 'RECEIVED' | 'TRIAGING' | 'CORROBORATING' | 'INVESTIGATING' | 'INDUSTRY_ACTION' | 'GOVERNMENT_REVIEW' | 'RESOLVED';
  corroboration_score: number;
  corroboration_status: 'CORROBORATED' | 'PARTIALLY_CORROBORATED' | 'UNCONFIRMED';
  corroboration_summary: string;
  evidence_sources: string[];
  correlated_facility: string;
  likely_source: string;
  root_cause: string;
  telemetry_deviations: Record<string, string>;
  recommended_action: string;
  reporter: {
    name: string;
    trust_score: number;
    reports_submitted: number;
    corroborated_count: number;
    badge: string;
    points_awarded: number;
  };
  industry_response: {
    status: string;
    action_taken: string;
    engineer: string;
    target_completion?: string;
    expected_outcome?: string;
  };
  government_status: {
    status: string;
    officer: string;
    notes: string;
    escalation_level: string;
  };
  audit_trail: Array<{ time: string; actor: string; event: string }>;
  environmental_outcome: Record<string, string | number>;
  environmental_impact_report?: EnvironmentalImpactReport;
}

export interface EnvironmentalImpactReport {
  report_id: string;
  facility_name: string;
  likely_source: string;
  incident_category: string;
  root_cause: string;
  corrective_action: string;
  before_intervention: {
    nox_concentration: string;
    co2e_daily_rate: string;
    energy_intensity: string;
    environmental_status: string;
  };
  after_intervention: {
    nox_concentration: string;
    co2e_daily_rate: string;
    energy_intensity: string;
    environmental_status: string;
  };
  mrv_pipeline: {
    measure: string;
    report: string;
    verify: string;
    baseline_emissions_t_co2e_day: number;
    post_action_emissions_t_co2e_day: number;
    daily_reduction_t_co2e: number;
    monthly_reduction_t_co2e: number;
    annualized_reduction_t_co2e: number;
    percentage_reduction: string;
    time_period: string;
    evidence_sources: string[];
    verification_status: string;
    confidence_score: number;
  };
  potential_carbon_credit: {
    annualized_reduction_volume: string;
    potential_creditable_volume: string;
    illustrative_credit_value_inr: string;
    crediting_status: string;
    disclaimer: string;
  };
  chain: string[];
}

export interface EnvironmentalPact {
  facility_id: string;
  facility_name: string;
  region: string;
  pact_status: string;
  agreement_date: string;
  next_audit_date: string;
  signatories: Array<{ role: string; entity: string; signatory: string }>;
  monitored_parameters: Array<{
    code: string;
    name: string;
    unit: string;
    threshold: number;
    current: number;
    status: string;
    excess_pct: number;
  }>;
  illustrative_financial_model: {
    excess_penalty_monthly_inr: number;
    compliance_incentive_monthly_inr: number;
    avoided_operational_cost_inr: number;
    net_monthly_opportunity_inr: number;
    note: string;
  };
}

export interface GovernmentOverview {
  region_name: string;
  total_reports: number;
  active_community_reports: number;
  corroborated_incidents: number;
  facilities_at_risk: number;
  open_corrective_actions: number;
  pollution_hotspots: number;
  resolved_cases: number;
  environmental_improvement_pct: number;
  facilities: Array<{
    id: string;
    name: string;
    sector: string;
    environmental_score: number;
    open_cases: number;
    compliance_status: string;
    risk_level: string;
    pact_status: string;
    primary_excess: string;
    last_incident: string;
  }>;
  hotspots: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    pollutant: string;
    severity: string;
    trend: string;
  }>;
}

export interface ImpactModel {
  platform_title: string;
  pillars: Array<{
    id: string;
    title: string;
    subtitle: string;
    description: string;
    unit_pricing_inr: string;
    roi_mechanism: string;
  }>;
  scale_calculator_defaults: {
    tier_presets: Record<string, {
      facilities: number;
      annual_revenue_lakhs: number;
      operating_cost_lakhs: number;
      net_margin_pct: number;
      co2_abated_tonnes: number;
    }>;
  };
  data_sources: Array<{
    name: string;
    type: string;
    status: string;
    rate: string;
  }>;
}

