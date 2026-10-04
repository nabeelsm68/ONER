"""
ONER Community-to-Industry Environmental Intelligence & Accountability Network
Backend Module: In-memory store, correlation engine, pact model, and government workflow.
"""
from datetime import datetime, timezone
import uuid
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

# ─── PACT & FACILITY DATA ───────────────────────────────────────────────────

ENVIRONMENTAL_PACT = {
    "facility_id": "FAC-ORION-01",
    "facility_name": "Orion Refining Complex",
    "region": "Industrial Corridor Sector 4",
    "pact_status": "ACTIVE",
    "agreement_date": "2025-01-15",
    "next_audit_date": "2026-12-01",
    "signatories": [
        {"role": "Industry", "entity": "Orion Energy & Chemicals Ltd.", "signatory": "VP Operations"},
        {"role": "Government", "entity": "Regional Pollution Control Board", "signatory": "Chief Environmental Officer"},
        {"role": "Community", "entity": "Sector 4 Civic Action Committee", "signatory": "Citizen Representative"},
    ],
    "monitored_parameters": [
        {"code": "NOx", "name": "Nitrogen Oxides", "unit": "mg/Nm³", "threshold": 100.0, "current": 131.4, "status": "BREACH", "excess_pct": 31.4},
        {"code": "SOx", "name": "Sulfur Oxides", "unit": "mg/Nm³", "threshold": 80.0, "current": 64.2, "status": "COMPLIANT", "excess_pct": -19.8},
        {"code": "PM2.5", "name": "Fine Particulate Matter", "unit": "µg/m³", "threshold": 60.0, "current": 73.6, "status": "WARNING", "excess_pct": 22.7},
        {"code": "PM10", "name": "Coarse Particulate Matter", "unit": "µg/m³", "threshold": 100.0, "current": 92.1, "status": "COMPLIANT", "excess_pct": -7.9},
        {"code": "CO2_INT", "name": "Carbon Intensity", "unit": "kg/ton output", "threshold": 450.0, "current": 468.5, "status": "WARNING", "excess_pct": 4.1},
        {"code": "WATER_REC", "name": "Closed-Loop Water Recovery", "unit": "%", "threshold": 75.0, "current": 81.2, "status": "HEALTHY", "excess_pct": 8.3},
        {"code": "THERMAL", "name": "Thermal Discharge Excess", "unit": "°C delta", "threshold": 5.0, "current": 8.2, "status": "BREACH", "excess_pct": 64.0},
    ],
    "illustrative_financial_model": {
        "excess_penalty_monthly_inr": 485000,
        "compliance_incentive_monthly_inr": 250000,
        "avoided_operational_cost_inr": 820000,
        "net_monthly_opportunity_inr": 1070000,
        "note": "ILLUSTRATIVE HACKATHON POLICY MODEL — Configurable by regulating authority."
    }
}

# ─── SEED COMMUNITY REPORTS ─────────────────────────────────────────────────

SEED_REPORTS: List[Dict[str, Any]] = [
    {
        "id": "COMM-2026-00421",
        "title": "Dense dark smoke plume with acrid chemical odor near North Stack",
        "category": "SMOKE_EMISSIONS",
        "severity": "HIGH",
        "description": "Thick black particulate emissions observed escaping from the vertical furnace stack. Distinct unburnt fuel odor detectable at the residential perimeter boundary 400m downwind.",
        "latitude": 17.4399,
        "longitude": 78.3845,
        "location_name": "North Gate Perimeter, Sector 4 Industrial Zone",
        "accuracy_meters": 12,
        "timestamp": "2026-10-03T09:42:15Z",
        "timestamp_formatted": "03 Oct 2026, 09:42 IST",
        "photo_url": "/evidence/smoke_plume_01.jpg",
        "status": "INDUSTRY_ACTION",
        "corroboration_score": 89.4,
        "corroboration_status": "CORROBORATED",
        "corroboration_summary": "Corroborated by available prototype evidence: stack sensor telemetry, regional air quality station AQ-04, and optical density deviation.",
        "evidence_sources": [
            "Citizen Optical Evidence (Timestamped GPS Camera)",
            "Orion Telemetry: Furnace F-101 O2 Trim sensor drift",
            "CEMS Station #2: NOx elevated to 131.4 mg/Nm³ (+31.4%)",
            "Regional AQI Station 4: PM2.5 spike to 73.6 µg/m³",
            "ONER ML Anomaly Detector: Isolation Forest score -0.218"
        ],
        "correlated_facility": "Orion Refining Complex",
        "likely_source": "Furnace F-101 (North Processing Train)",
        "root_cause": "Natural gas combustion instability + burner refractory fouling causing incomplete combustion and NOx elevation.",
        "telemetry_deviations": {
            "nox": "+31.4% (131.4 mg/Nm³)",
            "pm25": "+22.7% (73.6 µg/m³)",
            "thermal_delta": "+18.4°C stack temperature deviation",
            "air_fuel_ratio": "0.94 (sub-stoichiometric)"
        },
        "recommended_action": "Execute damper trim compensation to 1.042; recalibrate air-fuel ratio on Burner F-101B.",
        "reporter": {
            "name": "N. Sharma (Verified Resident)",
            "trust_score": 87,
            "reports_submitted": 24,
            "corroborated_count": 21,
            "badge": "Trusted Civic Sentinel",
            "points_awarded": 50
        },
        "industry_response": {
            "status": "CORRECTIVE_ACTION_IN_PROGRESS",
            "action_taken": "Combustion loop switched to manual trim mode. Damper trim recalibrated to 1.042. Maintenance work order #WO-8821 dispatched.",
            "engineer": "M. Rao (Chief Combustion Engineer)",
            "target_completion": "03 Oct 2026, 11:30 IST",
            "expected_outcome": "NOx return to <95 mg/Nm³, CO2 reduction by 14.2 tonnes/day."
        },
        "government_status": {
            "status": "ACTION_MANDATED",
            "officer": "Dr. V. Prasad (Regional Environmental Officer)",
            "notes": "Formal advisory logged under Pact Clause 4.2. Telemetry tracking window set for 4 hours.",
            "escalation_level": "LEVEL_1_ATTENTION"
        },
        "audit_trail": [
            {"time": "09:42:15", "actor": "Citizen Reporter", "event": "Citizen report submitted with GPS captured with user consent & photo metadata"},
            {"time": "09:42:48", "actor": "ONER Core", "event": "Auto-correlated with Orion Refining telemetry (89.4% confidence)"},
            {"time": "09:43:10", "actor": "ONER ML", "event": "Root cause mapped to Furnace F-101 air-fuel imbalance"},
            {"time": "09:45:00", "actor": "Industry Portal", "event": "Case COMM-2026-00421 acknowledged by Orion Control Room"},
            {"time": "09:51:30", "actor": "Industry Portal", "event": "Corrective action initiated: Damper trim calibrated to 1.042"},
            {"time": "10:05:00", "actor": "Government Command", "event": "Regulator reviewed telemetry; mandated 4-hr compliance audit"}
        ],
        "environmental_outcome": {
            "nox_expected_drop": "28.6 kg/day",
            "co2_expected_drop": "14.2 tonnes/day",
            "efficiency_gain": "2.4% thermal recovery"
        },
        "environmental_impact_report": {
            "report_id": "COMM-2026-00421",
            "facility_name": "Orion Refining Complex",
            "likely_source": "Furnace F-101 (North Processing Train)",
            "incident_category": "SMOKE_EMISSIONS",
            "root_cause": "Natural gas combustion instability + burner refractory fouling causing incomplete combustion",
            "corrective_action": "Damper trim recalibrated to 1.042; automated air-fuel stoichiometric loop reset",
            "before_intervention": {
                "nox_concentration": "131.4 mg/Nm³",
                "co2e_daily_rate": "104.2 tCO₂e/day",
                "energy_intensity": "420.5 kWh/ton output",
                "environmental_status": "BREACH / AT RISK (+31.4% excess)"
            },
            "after_intervention": {
                "nox_concentration": "88.5 mg/Nm³ (-28.6 kg/day drop)",
                "co2e_daily_rate": "90.0 tCO₂e/day (-14.2 t/day drop)",
                "energy_intensity": "410.2 kWh/ton output (2.45% efficiency recovery)",
                "environmental_status": "NORMALIZED & COMPLIANT"
            },
            "mrv_pipeline": {
                "measure": "Continuous baseline vs post-intervention CEMS optical density and O2 trim logging at 1.0 Hz",
                "report": "ISO 14064-2 aligned digital abatement dossier with parameter variance tracking",
                "verify": "Sensor drift cross-referenced against regional ambient monitor AQ-04 and fuel flow telemetry",
                "baseline_emissions_t_co2e_day": 104.2,
                "post_action_emissions_t_co2e_day": 90.0,
                "daily_reduction_t_co2e": 14.2,
                "monthly_reduction_t_co2e": 426.0,
                "annualized_reduction_t_co2e": 5183.0,
                "percentage_reduction": "13.6%",
                "time_period": "30-day post-intervention verification window",
                "evidence_sources": [
                    "Citizen Optical Evidence (GPS with user consent)",
                    "Orion Telemetry: Furnace F-101 O2 Trim sensor drift",
                    "CEMS Station #2: NOx normalized to 88.5 mg/Nm³",
                    "Regional AQI Station 4: Ambient PM2.5 normalized to 41.2 µg/m³"
                ],
                "verification_status": "MRV-READY / PENDING INDEPENDENT AUDIT",
                "confidence_score": 89.4
            },
            "potential_carbon_credit": {
                "annualized_reduction_volume": "5,183 tCO₂e / year",
                "potential_creditable_volume": "5,183 tCO₂e",
                "illustrative_credit_value_inr": "₹41,46,400 / year (@ ₹800/t illustrative)",
                "crediting_status": "POTENTIAL / SUBJECT TO METHODOLOGY + THIRD-PARTY VERIFICATION",
                "disclaimer": "ONER estimates emissions reductions and MRV readiness. Actual carbon-credit issuance requires an applicable methodology, eligibility assessment and independent verification."
            },
            "chain": [
                "Community Observation",
                "Environmental Evidence",
                "Industrial Correlation",
                "Root Cause",
                "Corrective Action",
                "Measured Reduction",
                "MRV Pipeline",
                "CO₂e Impact",
                "Potential Creditable Reduction",
                "Community Outcome"
            ]
        }
    },
    {
        "id": "COMM-2026-00398",
        "title": "Chemical foam & discolored effluent in Sector 4 North Drainage Canal",
        "category": "WATER_POLLUTION",
        "severity": "CRITICAL",
        "description": "White buoyant surfactant foam spreading 150 meters along the stormwater discharge channel leading into the seasonal creek.",
        "latitude": 17.4431,
        "longitude": 78.3792,
        "location_name": "Canal Outfall 3, Downstream of Industrial Estate",
        "accuracy_meters": 18,
        "timestamp": "2026-10-02T16:15:00Z",
        "timestamp_formatted": "02 Oct 2026, 16:15 IST",
        "photo_url": "/evidence/water_foam_01.jpg",
        "status": "GOVERNMENT_REVIEW",
        "corroboration_score": 64.2,
        "corroboration_status": "PARTIALLY_CORROBORATED",
        "corroboration_summary": "Partially corroborated: Downstream IoT probe detected dissolved oxygen dip (3.8 mg/L), but facility outfall telemetry reported normal discharge rate.",
        "evidence_sources": [
            "Citizen Photo Evidence",
            "Downstream Water Quality Sensor WQ-02: DO dip to 3.8 mg/L",
            "TDS sensor elevation from 420 to 890 ppm"
        ],
        "correlated_facility": "Apex Chemical Logistics & Orion Refining",
        "likely_source": "Stormwater runoff diversion valve malfunction",
        "root_cause": "Potential accidental surface spill washdown into stormwater drain rather than ETP holding basin.",
        "telemetry_deviations": {
            "dissolved_oxygen": "-42% below regulatory minimum",
            "tds": "+112% baseline spike"
        },
        "recommended_action": "Deploy mobile water sampling unit; inspect boundary isolation valves on Canal 3.",
        "reporter": {
            "name": "K. Raman (Civic Action Team)",
            "trust_score": 92,
            "reports_submitted": 41,
            "corroborated_count": 38,
            "badge": "Senior Environmental Sentinel",
            "points_awarded": 30
        },
        "industry_response": {
            "status": "INVESTIGATING",
            "action_taken": "ETP bypass valves locked and inspected. Sump samples sent to central laboratory.",
            "engineer": "S. Kulkarni (Water Treatment Lead)",
            "target_completion": "03 Oct 2026, 14:00 IST",
            "expected_outcome": "Isolation of non-compliant runoff stream."
        },
        "government_status": {
            "status": "INSPECTION_REQUESTED",
            "officer": "A. Sen (Pollution Control Inspector)",
            "notes": "Physical grab sample collection scheduled for Canal 3 outfall.",
            "escalation_level": "LEVEL_2_URGENT"
        },
        "audit_trail": [
            {"time": "16:15:00", "actor": "Citizen Reporter", "event": "Report filed with water discolouration imagery"},
            {"time": "16:18:20", "actor": "ONER Core", "event": "Correlated with WQ-02 probe reading (64.2% partial match)"},
            {"time": "16:45:00", "actor": "Government Command", "event": "Regulator ordered physical grab sample verification"}
        ],
        "environmental_outcome": {
            "water_body_affected": "Sector 4 Drainage Canal",
            "mitigation": "Secondary containment boom deployed"
        }
    },
    {
        "id": "COMM-2026-00405",
        "title": "Pungent mercaptan / sulfur odor affecting West Gate residential colony",
        "category": "ODOR",
        "severity": "MEDIUM",
        "description": "Sharp rotten egg / sulfur smell drifting into residential sector between 22:00 and 01:00 during calm atmospheric inversion.",
        "latitude": 17.4350,
        "longitude": 78.3780,
        "location_name": "West Gate Residential Buffer Colony",
        "accuracy_meters": 25,
        "timestamp": "2026-10-02T22:30:00Z",
        "timestamp_formatted": "02 Oct 2026, 22:30 IST",
        "photo_url": "/evidence/odor_night_01.jpg",
        "status": "RESOLVED",
        "corroboration_score": 82.1,
        "corroboration_status": "CORROBORATED",
        "corroboration_summary": "Corroborated by flare gas telemetry showing momentary pressure drop during sour gas compressor switchover.",
        "evidence_sources": [
            "12 Resident odor reports in 45-minute window",
            "Sulfur recovery unit flare flow meter spike at 22:18",
            "Boundary H2S sensor trace reading (0.04 ppm)"
        ],
        "correlated_facility": "Orion Refining Complex",
        "likely_source": "Sulfur Recovery Unit (SRU-2) seal pot",
        "root_cause": "Vapor lock in seal pot during condensate draining led to brief vapor displacement to flare.",
        "telemetry_deviations": {
            "h2s_boundary": "0.04 ppm (within safety limit, but threshold for odor perception)"
        },
        "recommended_action": "Install nitrogen purge blanket on SRU condensate seal pot.",
        "reporter": {
            "name": "P. Mehta (Colony Secretary)",
            "trust_score": 79,
            "reports_submitted": 8,
            "corroborated_count": 7,
            "badge": "Community Watchdog",
            "points_awarded": 50
        },
        "industry_response": {
            "status": "RESOLVED",
            "action_taken": "Seal pot drained under closed vapor recovery. Standard operating procedure revised.",
            "engineer": "R. Menon (Safety Operations)",
            "target_completion": "Completed",
            "expected_outcome": "Zero fugitives from condensate transfer."
        },
        "government_status": {
            "status": "CASE_CLOSED_VERIFIED",
            "officer": "Dr. V. Prasad",
            "notes": "Verified against boundary H2S trace log and operator shift logs.",
            "escalation_level": "RESOLVED"
        },
        "audit_trail": [
            {"time": "22:30:00", "actor": "Citizen Reporter", "event": "Odor complaint registered by neighborhood watch"},
            {"time": "22:38:00", "actor": "ONER Core", "event": "Cluster detection grouped 12 community reports"},
            {"time": "23:05:00", "actor": "Industry Portal", "event": "Operator diagnosed seal pot vapor lock"},
            {"time": "01:20:00", "actor": "ONER Core", "event": "Boundary sensors confirmed odor normalization"}
        ],
        "environmental_outcome": {
            "odor_intensity": "Reduced to zero detection",
            "citizen_points_granted": 50
        }
    },
    {
        "id": "COMM-2026-00376",
        "title": "Fugitive dust plume along transit haulage road during heavy truck movement",
        "category": "DUST",
        "severity": "LOW",
        "description": "Dry surface dust raised by clinker trucks without tarpaulin covers on the unpaved auxiliary transit corridor.",
        "latitude": 17.4475,
        "longitude": 78.3910,
        "location_name": "East Perimeter Haulage Road",
        "accuracy_meters": 15,
        "timestamp": "2026-10-01T14:10:00Z",
        "timestamp_formatted": "01 Oct 2026, 14:10 IST",
        "photo_url": "/evidence/dust_road_01.jpg",
        "status": "CORROBORATING",
        "corroboration_score": 31.0,
        "corroboration_status": "UNCONFIRMED",
        "corroboration_summary": "Unconfirmed: PM10 station did not register significant spike (wind direction 240° away from sensor). Awaiting secondary validation.",
        "evidence_sources": [
            "Citizen Photo Evidence"
        ],
        "correlated_facility": "Deccan Clinker Terminal",
        "likely_source": "Unpaved transit corridor",
        "root_cause": "Water sprinkler tanker route delayed by 3 hours.",
        "telemetry_deviations": {
            "pm10": "+8.2% (marginal, within natural variance)"
        },
        "recommended_action": "Deploy automatic misting cannon and enforce tarpaulin mandate.",
        "reporter": {
            "name": "A. Joshi (Commuter)",
            "trust_score": 65,
            "reports_submitted": 3,
            "corroborated_count": 1,
            "badge": "Citizen Observer",
            "points_awarded": 0
        },
        "industry_response": {
            "status": "SCHEDULED",
            "action_taken": "Water misting truck dispatched to east route.",
            "engineer": "Logistics Dispatch Desk",
            "target_completion": "03 Oct 2026",
            "expected_outcome": "Fugitive dust suppression"
        },
        "government_status": {
            "status": "WATCHLIST",
            "officer": "Municipal Transport Wing",
            "notes": "Logged for monthly infrastructure review.",
            "escalation_level": "LOW"
        },
        "audit_trail": [
            {"time": "14:10:00", "actor": "Citizen Reporter", "event": "Dust report submitted"}
        ],
        "environmental_outcome": {
            "suppression_coverage": "2.4 km haul road"
        }
    },
    {
        "id": "COMM-2026-00412",
        "title": "Low frequency acoustic humming and fan vibration during night shift",
        "category": "NOISE",
        "severity": "MEDIUM",
        "description": "Continuous drone at 120 Hz oscillating through bedroom walls between 02:00 and 05:00 AM.",
        "latitude": 17.4325,
        "longitude": 78.3812,
        "location_name": "South Ridge Residential Sector",
        "accuracy_meters": 20,
        "timestamp": "2026-10-02T03:15:00Z",
        "timestamp_formatted": "02 Oct 2026, 03:15 IST",
        "photo_url": "/evidence/noise_spectrum_01.jpg",
        "status": "INDUSTRY_ACTION",
        "corroboration_score": 78.5,
        "corroboration_status": "CORROBORATED",
        "corroboration_summary": "Corroborated by Cooling Tower CT-3 induced draft fan blade pitch imbalance telemetry and night acoustic log (62 dBA vs 45 dBA threshold).",
        "evidence_sources": [
            "Citizen acoustic recording app data",
            "Cooling Tower CT-3 vibration telemetry (vibration velocity 8.4 mm/s RMS)",
            "Perimeter noise station 3 recorded 62.1 dBA (night limit 45 dBA)"
        ],
        "correlated_facility": "Orion Refining Complex",
        "likely_source": "Cooling Tower CT-3 Induced Draft Fan #4",
        "root_cause": "Blade pitch imbalance and aerodynamic vortex shedding on fan rotor.",
        "telemetry_deviations": {
            "noise_level": "+38% over night-time residential limit (62.1 dBA)",
            "fan_vibration": "8.4 mm/s (Alert threshold 5.0 mm/s)"
        },
        "recommended_action": "Balance fan blades and install acoustic intake dampeners.",
        "reporter": {
            "name": "M. Sengupta (Resident)",
            "trust_score": 85,
            "reports_submitted": 14,
            "corroborated_count": 12,
            "badge": "Trusted Civic Sentinel",
            "points_awarded": 50
        },
        "industry_response": {
            "status": "WORK_ORDER_ISSUED",
            "action_taken": "Fan #4 speed reduced by 18% on VFD; acoustic baffle replacement scheduled during maintenance window.",
            "engineer": "T. Balan (Mechanical Maintenance)",
            "target_completion": "04 Oct 2026",
            "expected_outcome": "Sound level reduced below 45 dBA at boundary."
        },
        "government_status": {
            "status": "COMPLIANCE_NOTICE",
            "officer": "Dr. V. Prasad",
            "notes": "Advisory issued for night noise abatement compliance.",
            "escalation_level": "LEVEL_1_ATTENTION"
        },
        "audit_trail": [
            {"time": "03:15:00", "actor": "Citizen Reporter", "event": "Acoustic disturbance logged"},
            {"time": "03:22:00", "actor": "ONER Core", "event": "Correlated with Cooling Tower CT-3 telemetry (78.5%)"},
            {"time": "06:30:00", "actor": "Industry Portal", "event": "Speed trim executed on Fan #4"}
        ],
        "environmental_outcome": {
            "noise_reduction": "Vibration dampened from 8.4 to 4.2 mm/s"
        }
    }
]

# In-memory mutable store
REPORTS_DB: List[Dict[str, Any]] = [dict(r) for r in SEED_REPORTS]

# ─── MODELS & SCHEMAS ───────────────────────────────────────────────────────

class CreateReportRequest(BaseModel):
    title: Optional[str] = None
    category: str
    severity: str
    description: str
    latitude: Optional[float] = 17.4399
    longitude: Optional[float] = 78.3845
    location_name: Optional[str] = "Orion Industrial Perimeter"
    accuracy_meters: Optional[int] = 15
    photo_data_url: Optional[str] = None
    contact: Optional[str] = None

class IndustryActionRequest(BaseModel):
    action_type: str  # "ACKNOWLEDGE" | "ASSIGN" | "SIMULATE" | "CORRECTIVE_ACTION" | "RESOLVE"
    action_notes: Optional[str] = None
    engineer_name: Optional[str] = "M. Rao (Chief Combustion Engineer)"

class GovernmentActionRequest(BaseModel):
    action_type: str  # "REQUEST_INFO" | "REQUEST_INSPECTION" | "MANDATE_ACTION" | "ESCALATE" | "CLOSE"
    officer_name: Optional[str] = "Dr. V. Prasad (Regional Environmental Officer)"
    notes: Optional[str] = None

# ─── ENGINE LOGIC ───────────────────────────────────────────────────────────

def get_all_reports() -> List[Dict[str, Any]]:
    return list(REPORTS_DB)

def get_report_by_id(report_id: str) -> Optional[Dict[str, Any]]:
    for r in REPORTS_DB:
        if r["id"].upper() == report_id.upper():
            return r
    return None

def create_report(req: CreateReportRequest) -> Dict[str, Any]:
    # Generate human-readable case ID
    seq = len(REPORTS_DB) + 425
    report_id = f"COMM-2026-00{seq}"
    now_utc = datetime.now(timezone.utc).isoformat()
    now_formatted = datetime.now(timezone.utc).strftime("%d %b %Y, %H:%M UTC")

    # Run ONER correlation logic against active facility state
    category_upper = req.category.upper()
    if "SMOKE" in category_upper or "AIR" in category_upper or "EMISSION" in category_upper:
        corroboration_score = 89.4
        corroboration_status = "CORROBORATED"
        facility = "Orion Refining Complex"
        source = "Furnace F-101 (North Processing Train)"
        root_cause = "Natural gas combustion instability + burner refractory fouling causing incomplete combustion and NOx elevation."
        telemetry = {
            "nox": "+31.4% (131.4 mg/Nm³)",
            "pm25": "+22.7% (73.6 µg/m³)",
            "thermal_delta": "+18.4°C stack temperature deviation",
        }
        rec_action = "Execute damper trim compensation to 1.042; recalibrate air-fuel ratio on Burner F-101B."
        points = 50
    elif "WATER" in category_upper:
        corroboration_score = 64.2
        corroboration_status = "PARTIALLY_CORROBORATED"
        facility = "Orion Refining Complex"
        source = "Cooling Circuit Outfall"
        root_cause = "Transient chemical effluent detected in stormwater drain."
        telemetry = {"dissolved_oxygen": "-38% drop", "tds": "+85% spike"}
        rec_action = "Isolate stormwater diversion valve and sample holding sump."
        points = 30
    elif "ODOR" in category_upper or "CHEMICAL" in category_upper:
        corroboration_score = 82.1
        corroboration_status = "CORROBORATED"
        facility = "Orion Refining Complex"
        source = "Sulfur Recovery Unit (SRU-2)"
        root_cause = "Seal pot displacement during sour gas transfer."
        telemetry = {"h2s_boundary": "0.04 ppm perception threshold"}
        rec_action = "Implement closed-loop nitrogen purge."
        points = 50
    else:
        corroboration_score = 55.0
        corroboration_status = "PARTIALLY_CORROBORATED"
        facility = "Orion Refining Complex"
        source = "Auxiliary Operations"
        root_cause = "Awaiting secondary sensor corroboration."
        telemetry = {"environmental_anomaly": "Under investigation"}
        rec_action = "Deploy mobile sensor unit to reported GPS quadrant."
        points = 20

    title = req.title or f"{req.category.replace('_', ' ').title()} Incident reported by Community"

    new_report = {
        "id": report_id,
        "title": title,
        "category": req.category,
        "severity": req.severity.upper(),
        "description": req.description,
        "latitude": req.latitude or 17.4399,
        "longitude": req.longitude or 78.3845,
        "location_name": req.location_name or "Industrial Sector 4 Perimeter",
        "accuracy_meters": req.accuracy_meters or 15,
        "timestamp": now_utc,
        "timestamp_formatted": now_formatted,
        "photo_url": req.photo_data_url or "/evidence/citizen_upload.jpg",
        "status": "TRIAGING",
        "corroboration_score": corroboration_score,
        "corroboration_status": corroboration_status,
        "corroboration_summary": f"Corroborated by ONER Intelligence with {corroboration_score}% confidence using live facility telemetry & environmental baseline.",
        "evidence_sources": [
            "Citizen Optical Evidence (Timestamped GPS Camera)",
            f"{facility} Live Telemetry Feed",
            "ONER Isolation Forest Anomaly Engine",
            "Regional Environmental Station Sector 4"
        ],
        "correlated_facility": facility,
        "likely_source": source,
        "root_cause": root_cause,
        "telemetry_deviations": telemetry,
        "recommended_action": rec_action,
        "reporter": {
            "name": req.contact or "Active Citizen Reporter",
            "trust_score": 87,
            "reports_submitted": 5,
            "corroborated_count": 4,
            "badge": "Trusted Civic Sentinel",
            "points_awarded": points
        },
        "industry_response": {
            "status": "CASE_RECEIVED",
            "action_taken": "Alert routed to Plant Control Room. Engineering review pending.",
            "engineer": "Duty Control Engineer",
            "target_completion": "Pending",
            "expected_outcome": "Investigation underway"
        },
        "government_status": {
            "status": "LOGGED_IN_REGISTRY",
            "officer": "Automated Environmental Audit Bot",
            "notes": "Case entered in regional pollution incident register.",
            "escalation_level": "LEVEL_1_ATTENTION"
        },
        "audit_trail": [
            {"time": datetime.now(timezone.utc).strftime("%H:%M:%S"), "actor": "Citizen Reporter", "event": f"Report submitted for {req.category} at GPS ({req.latitude}, {req.longitude})"},
            {"time": datetime.now(timezone.utc).strftime("%H:%M:%S"), "actor": "ONER Core", "event": f"Correlated with {facility} telemetry ({corroboration_score}% confidence)"},
            {"time": datetime.now(timezone.utc).strftime("%H:%M:%S"), "actor": "ONER ML", "event": f"Identified probable source: {source}"},
        ],
        "environmental_outcome": {
            "status": "PENDING_ACTION",
            "citizen_points_granted": points
        }
    }

    # Prepend to list so newest appears first
    REPORTS_DB.insert(0, new_report)
    return new_report

def record_industry_action(report_id: str, req: IndustryActionRequest) -> Optional[Dict[str, Any]]:
    report = get_report_by_id(report_id)
    if not report:
        return None

    time_str = datetime.now(timezone.utc).strftime("%H:%M:%S")

    if req.action_type == "ACKNOWLEDGE":
        report["status"] = "INVESTIGATING"
        report["industry_response"]["status"] = "ACKNOWLEDGED"
        report["industry_response"]["action_taken"] = req.action_notes or "Incident acknowledged by plant control room. Technicians dispatched."
        report["industry_response"]["engineer"] = req.engineer_name
        report["audit_trail"].append({"time": time_str, "actor": "Industry Control Room", "event": f"Case {report_id} acknowledged by {req.engineer_name}"})

    elif req.action_type == "SIMULATE":
        report["status"] = "INDUSTRY_ACTION"
        report["industry_response"]["status"] = "INTERVENTION_SIMULATED"
        report["industry_response"]["action_taken"] = "Simulated Damper Trim 1.042; projected NOx drop 28.6 kg/day, CO2 drop 14.2 t/day."
        report["audit_trail"].append({"time": time_str, "actor": "Industry Autopilot", "event": "Ran predictive intervention simulation: Damper Trim 1.042"})

    elif req.action_type == "CORRECTIVE_ACTION":
        report["status"] = "INDUSTRY_ACTION"
        report["industry_response"]["status"] = "CORRECTIVE_ACTION_IN_PROGRESS"
        report["industry_response"]["action_taken"] = req.action_notes or "Executing damper trim recalibration to 1.042. O2 trim reset."
        report["audit_trail"].append({"time": time_str, "actor": "Industry Operations", "event": f"Corrective action dispatched: {report['industry_response']['action_taken']}"})

    elif req.action_type == "RESOLVE":
        report["status"] = "RESOLVED"
        report["industry_response"]["status"] = "CORRECTIVE_ACTION_COMPLETED"
        report["industry_response"]["action_taken"] = req.action_notes or "Combustion setpoint normalized. CEMS sensor confirms NOx returned to 88.5 mg/Nm³ (well below 100 limit)."
        report["environmental_outcome"]["status"] = "RESOLVED"
        report["environmental_outcome"]["nox_expected_drop"] = "28.6 kg/day verified"
        report["environmental_outcome"]["co2_expected_drop"] = "14.2 tonnes/day verified"
        report["audit_trail"].append({"time": time_str, "actor": "Industry Operations", "event": "Corrective action verified. Signal normalized. Case marked resolved."})

        # Ensure full Environmental Impact Report & MRV metadata is attached
        if "environmental_impact_report" not in report or not report["environmental_impact_report"]:
            report["environmental_impact_report"] = {
                "report_id": report["id"],
                "facility_name": report.get("correlated_facility", "Orion Refining Complex"),
                "likely_source": report.get("likely_source", "Furnace F-101 (North Processing Train)"),
                "incident_category": report.get("category", "SMOKE_EMISSIONS"),
                "root_cause": report.get("root_cause", "Combustion air-fuel ratio drift causing thermal degradation"),
                "corrective_action": report["industry_response"]["action_taken"],
                "before_intervention": {
                    "nox_concentration": "131.4 mg/Nm³",
                    "co2e_daily_rate": "104.2 tCO₂e/day",
                    "energy_intensity": "420.5 kWh/ton output",
                    "environmental_status": "BREACH / AT RISK (+31.4% excess)"
                },
                "after_intervention": {
                    "nox_concentration": "88.5 mg/Nm³ (-28.6 kg/day drop)",
                    "co2e_daily_rate": "90.0 tCO₂e/day (-14.2 t/day drop)",
                    "energy_intensity": "410.2 kWh/ton output (2.45% efficiency recovery)",
                    "environmental_status": "NORMALIZED & COMPLIANT"
                },
                "mrv_pipeline": {
                    "measure": "Continuous baseline vs post-intervention CEMS optical density and O2 trim logging at 1.0 Hz",
                    "report": "ISO 14064-2 aligned digital abatement dossier with parameter variance tracking",
                    "verify": "Sensor drift cross-referenced against regional ambient monitor AQ-04 and fuel flow telemetry",
                    "baseline_emissions_t_co2e_day": 104.2,
                    "post_action_emissions_t_co2e_day": 90.0,
                    "daily_reduction_t_co2e": 14.2,
                    "monthly_reduction_t_co2e": 426.0,
                    "annualized_reduction_t_co2e": 5183.0,
                    "percentage_reduction": "13.6%",
                    "time_period": "30-day post-intervention verification window",
                    "evidence_sources": report.get("evidence_sources", []),
                    "verification_status": "MRV-READY / PENDING INDEPENDENT AUDIT",
                    "confidence_score": report.get("corroboration_score", 89.4)
                },
                "potential_carbon_credit": {
                    "annualized_reduction_volume": "5,183 tCO₂e / year",
                    "potential_creditable_volume": "5,183 tCO₂e",
                    "illustrative_credit_value_inr": "₹41,46,400 / year (@ ₹800/t illustrative)",
                    "crediting_status": "POTENTIAL / SUBJECT TO METHODOLOGY + THIRD-PARTY VERIFICATION",
                    "disclaimer": "ONER estimates emissions reductions and MRV readiness. Actual carbon-credit issuance requires an applicable methodology, eligibility assessment and independent verification."
                },
                "chain": [
                    "Community Observation",
                    "Environmental Evidence",
                    "Industrial Correlation",
                    "Root Cause",
                    "Corrective Action",
                    "Measured Reduction",
                    "MRV Pipeline",
                    "CO₂e Impact",
                    "Potential Creditable Reduction",
                    "Community Outcome"
                ]
            }

    return report

def record_government_action(report_id: str, req: GovernmentActionRequest) -> Optional[Dict[str, Any]]:
    report = get_report_by_id(report_id)
    if not report:
        return None

    time_str = datetime.now(timezone.utc).strftime("%H:%M:%S")

    if req.action_type == "REQUEST_INFO":
        report["government_status"]["status"] = "INFORMATION_REQUESTED"
        report["government_status"]["notes"] = req.notes or "Official inquiry issued for stack CEMS logs during incident window."
        report["audit_trail"].append({"time": time_str, "actor": "Government Command", "event": f"Inquiry issued to {report['correlated_facility']} by {req.officer_name}"})

    elif req.action_type == "REQUEST_INSPECTION":
        report["government_status"]["status"] = "INSPECTION_MANDATED"
        report["government_status"]["notes"] = req.notes or "On-site environmental compliance officer dispatched for physical verification."
        report["audit_trail"].append({"time": time_str, "actor": "Government Command", "event": "On-site physical inspection mandated"})

    elif req.action_type == "MANDATE_ACTION":
        report["government_status"]["status"] = "CORRECTIVE_ACTION_MANDATED"
        report["government_status"]["notes"] = req.notes or "Mandatory 24-hr corrective action order issued under Environmental Pact Clause 4.2."
        report["government_status"]["escalation_level"] = "LEVEL_2_URGENT"
        report["audit_trail"].append({"time": time_str, "actor": "Government Command", "event": "Mandatory corrective order issued"})

    elif req.action_type == "ESCALATE":
        report["government_status"]["status"] = "ESCALATED_TO_REGIONAL_BOARD"
        report["government_status"]["escalation_level"] = "CRITICAL_ESCALATION"
        report["audit_trail"].append({"time": time_str, "actor": "Government Command", "event": "Case escalated to State Environmental Appeals Board"})

    elif req.action_type == "CLOSE":
        report["status"] = "RESOLVED"
        report["government_status"]["status"] = "CASE_CLOSED_AUDITED"
        report["government_status"]["notes"] = req.notes or "Audit completed. Sensor telemetry verified in compliance."
        report["audit_trail"].append({"time": time_str, "actor": "Government Command", "event": "Case verified and formally closed by regulator"})

    return report

def get_government_overview() -> Dict[str, Any]:
    all_reps = REPORTS_DB
    active = [r for r in all_reps if r["status"] != "RESOLVED"]
    corroborated = [r for r in all_reps if r["corroboration_status"] == "CORROBORATED"]
    resolved = [r for r in all_reps if r["status"] == "RESOLVED"]
    actions_open = [r for r in all_reps if r["status"] in ["INVESTIGATING", "INDUSTRY_ACTION", "GOVERNMENT_REVIEW"]]

    return {
        "region_name": "Sector 4 Industrial Corridor",
        "total_reports": len(all_reps),
        "active_community_reports": len(active),
        "corroborated_incidents": len(corroborated),
        "facilities_at_risk": 2,
        "open_corrective_actions": len(actions_open),
        "pollution_hotspots": 3,
        "resolved_cases": len(resolved),
        "environmental_improvement_pct": 14.8,
        "total_co2e_daily_reduction_tonnes": 14.2,
        "total_co2e_annualized_abated": 5183.0,
        "total_nox_reduction_kg_day": 28.6,
        "mrv_ready_cases": len(resolved) if len(resolved) > 0 else 1,
        "facilities": [
            {
                "id": "FAC-ORION-01",
                "name": "Orion Refining Complex",
                "sector": "Petrochemicals & Refining",
                "environmental_score": 87.3,
                "open_cases": 3,
                "compliance_status": "AT RISK",
                "risk_level": "HIGH",
                "pact_status": "ACTIVE",
                "primary_excess": "NOx +31.4%, Thermal +64%",
                "last_incident": "18 min ago"
            },
            {
                "id": "FAC-APEX-02",
                "name": "Apex Chemical Logistics",
                "sector": "Specialty Solvents & Storage",
                "environmental_score": 91.2,
                "open_cases": 1,
                "compliance_status": "WATCH",
                "risk_level": "MODERATE",
                "pact_status": "ACTIVE",
                "primary_excess": "Runoff TDS +112%",
                "last_incident": "Yesterday"
            },
            {
                "id": "FAC-TATA-03",
                "name": "Tata Power Unit 3 Cogen",
                "sector": "Thermal Cogeneration",
                "environmental_score": 96.4,
                "open_cases": 0,
                "compliance_status": "COMPLIANT",
                "risk_level": "LOW",
                "pact_status": "ACTIVE",
                "primary_excess": "None (All <80% threshold)",
                "last_incident": "14 days ago"
            },
            {
                "id": "FAC-DECCAN-04",
                "name": "Deccan Clinker Grinding Terminal",
                "sector": "Heavy Building Materials",
                "environmental_score": 84.1,
                "open_cases": 1,
                "compliance_status": "WATCH",
                "risk_level": "MODERATE",
                "pact_status": "PENDING_AUDIT",
                "primary_excess": "PM10 haul road dust",
                "last_incident": "2 days ago"
            }
        ],
        "hotspots": [
            {"id": "HS-01", "name": "North Gate Processing Stack Quad", "lat": 17.4399, "lng": 78.3845, "pollutant": "NOx / Particulates", "severity": "HIGH", "trend": "DECREASING_AFTER_TRIM"},
            {"id": "HS-02", "name": "Canal Outfall Stormwater Sump", "lat": 17.4431, "lng": 78.3792, "pollutant": "Effluent Surfactant", "severity": "CRITICAL", "trend": "CONTAINED"},
            {"id": "HS-03", "name": "East Clinker Haulage Transit Corridor", "lat": 17.4475, "lng": 78.3910, "pollutant": "Fugitive PM10", "severity": "MODERATE", "trend": "STABLE"}
        ]
    }

def get_impact_model() -> Dict[str, Any]:
    return {
        "platform_title": "The ONER Environmental Network",
        "pillars": [
            {
                "id": "industry",
                "title": "Industry Subscription",
                "subtitle": "Comply, Optimize, Save",
                "description": "Facilities pay for real-time telemetry integration, AI anomaly detection, root-cause diagnostics, intervention simulation, carbon/MRV, and community case dispatch.",
                "unit_pricing_inr": "₹12,00,000 / facility / year",
                "roi_mechanism": "Avoided regulatory penalties + 2.4% heat/energy efficiency savings"
            },
            {
                "id": "government",
                "title": "Government / Regional Platform",
                "subtitle": "See, Verify, Act",
                "description": "State and regional environmental boards deploy ONER as a unified command center for regional air/water shed tracking, complaint triage, and auditable compliance.",
                "unit_pricing_inr": "₹45,00,000 / industrial cluster / year",
                "roi_mechanism": "85% reduction in manual inspection overhead + legally auditable evidence trails"
            },
            {
                "id": "integration",
                "title": "Hardware & IoT Integration",
                "subtitle": "Zero Blindspots",
                "description": "Turnkey integration connectors for CEMS, SCADA, OPC-UA, smart energy meters, water quality sensors, and optical particulate cameras.",
                "unit_pricing_inr": "₹3,50,000 / facility one-time onboarding",
                "roi_mechanism": "Standardized ISO 14064 and EPA-ready digital data pipes"
            },
            {
                "id": "advanced_ai",
                "title": "Advanced Autopilot Intelligence",
                "subtitle": "Closed-Loop Intervention",
                "description": "Predictive environmental risk twins, dynamic damper/combustion setpoint auto-trim, and verifiable carbon credit generation.",
                "unit_pricing_inr": "15% performance share on verified energy savings",
                "roi_mechanism": "Automated setpoint optimization without operator latency"
            }
        ],
        "scale_calculator_defaults": {
            "tier_presets": {
                "1_community": {"facilities": 1, "annual_revenue_lakhs": 15.5, "operating_cost_lakhs": 6.0, "net_margin_pct": 61, "co2_abated_tonnes": 5180},
                "1_facility": {"facilities": 1, "annual_revenue_lakhs": 15.5, "operating_cost_lakhs": 6.0, "net_margin_pct": 61, "co2_abated_tonnes": 5180},
                "10_facilities": {"facilities": 10, "annual_revenue_lakhs": 142.0, "operating_cost_lakhs": 38.0, "net_margin_pct": 73, "co2_abated_tonnes": 51800},
                "industrial_cluster": {"facilities": 35, "annual_revenue_lakhs": 465.0, "operating_cost_lakhs": 95.0, "net_margin_pct": 79, "co2_abated_tonnes": 181300},
                "city": {"facilities": 80, "annual_revenue_lakhs": 980.0, "operating_cost_lakhs": 190.0, "net_margin_pct": 80, "co2_abated_tonnes": 414400},
                "region": {"facilities": 220, "annual_revenue_lakhs": 2680.0, "operating_cost_lakhs": 480.0, "net_margin_pct": 82, "co2_abated_tonnes": 1139600}
            }
        },
        "data_sources": [
            {"name": "Stack CEMS (Continuous Emissions)", "type": "Optical & Chemi-luminescence", "status": "SIMULATED TELEMETRY", "rate": "1 Hz (1 sec updates)"},
            {"name": "Plant SCADA / PLC", "type": "OPC-UA / Modbus TCP", "status": "SIMULATED TELEMETRY", "rate": "Industrial fieldbus"},
            {"name": "Regional Air Quality Ambient Stations", "type": "BAM / Optical Particle Counter", "status": "SIMULATED TELEMETRY", "rate": "15-min EPA standard"},
            {"name": "Effluent Treatment (ETP) Probes", "type": "DO / pH / TDS / Turbidity", "status": "SIMULATED TELEMETRY", "rate": "5-min continuous"},
            {"name": "Citizen Optical & GPS Reports", "type": "Mobile Evidence Stamp & Geolocation", "status": "DEMO COMMUNITY DATA", "rate": "Event-driven real time"},
            {"name": "Government Regulatory Registry", "type": "Pact Audit Ledger", "status": "DEMO COMMUNITY DATA", "rate": "Synchronous blockchain mock"}
        ]
    }
