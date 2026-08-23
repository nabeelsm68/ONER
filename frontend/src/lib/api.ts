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
