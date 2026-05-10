// frontend-app/src/lib/types.ts
// All TypeScript interfaces — single source of truth for the frontend.

export interface AgentState {
  status: "idle" | "scanning" | "live" | "done" | "error";
  logs: string[];
  data: Record<string, unknown>;
}

export interface Signal {
  title: string;
  url: string;
  severity: "high" | "medium" | "low";
  published: string;
  region: string;
  lat: number | null;
  lon: number | null;
}

export interface Supplier {
  name: string;
  location: string;
  category: string;
  criticality?: string;
  lat: number;
  lon: number;
}

export interface AffectedSupplier extends Supplier {
  status: "critical" | "elevated" | "monitor";
}

export interface HistoricalMatch {
  event: string;
  similarity: number;
  outcome: string;
  signal_lead_days: number;
  id: string;
}

export interface LaneDetail {
  wind: number;
  wave: number;
  rain: number;
  severity: "critical" | "elevated" | "clear";
  lat: number;
  lon: number;
}

export interface DelayedPort {
  name: string;
  delay_days: number;
  lat: number;
  lon: number;
}

export interface GeoEvent {
  type: "conflict" | "sanction" | "protest" | "closure" | "geopolitical";
  region: string;
  description: string;
  gdelt_tone: number;
  lat: number | null;
  lon: number | null;
}

export interface VerdictData {
  probability: number;
  timeline: string;
  risk_level: "high" | "medium" | "low";
  primary_risk: string;
  affected_suppliers: AffectedSupplier[];
  alternative_suppliers: Supplier[];
  actions: string[];
  cost_estimates: {
    disruption_cost: number;
    mitigation_cost: number;
  };
  signal_breakdown: Record<string, number>;
}

export interface EmailAction {
  type: "email_draft";
  to: string;
  subject: string;
  body: string;
}

export interface AgentEvent {
  agent: string;
  type: "status" | "log" | "result" | "verdict" | "action" | "error";
  status: "idle" | "scanning" | "live" | "done" | "error" | "thinking" | "acting";
  log: string;
  data: Record<string, unknown>;
}
