"use client";
import type { AgentState } from "@/lib/types";
import { Radio, TrendingUp, Waves, Ship, BrainCircuit, Globe, Loader2, CheckCircle2 } from "lucide-react";
import Cyber3DCard from "./Cyber3DCard";

// Updated to use Lucide React components directly
const AGENT_META: Record<string, { label: string; icon: any; color: string }> = {
  news:         { label: "News Intelligence",  icon: Radio,        color: "#6C8EBF" },
  financial:    { label: "Financial Markets",  icon: TrendingUp,   color: "#1D9E75" },
  weather:      { label: "Weather & Marine",   icon: Waves,        color: "#4B9CD3" },
  logistics:    { label: "Logistics & Ports",  icon: Ship,         color: "#9B59B6" },
  memory:       { label: "Memory & Suppliers", icon: BrainCircuit, color: "#E67E22" },
  geopolitical: { label: "Geopolitical",       icon: Globe,        color: "#E24B4A" },
};

const STATUS_COLORS: Record<string, string> = {
  idle:     "#555",
  scanning: "#EF9F27",
  live:     "#1D9E75",
  done:     "#6C8EBF",
  error:    "#E24B4A",
};

interface AgentPanelProps {
  agentKey: string;
  state: AgentState;
}

export default function AgentPanel({ agentKey, state }: AgentPanelProps) {
  const meta   = AGENT_META[agentKey] ?? { label: agentKey, icon: Globe, color: "#888" };
  const dotClr = STATUS_COLORS[state.status] ?? "#555";
  const isLive = state.status === "scanning" || state.status === "live";
  
  const IconComponent = meta.icon;

  return (
    <Cyber3DCard className="agent-panel-wrapper">
      <div className="agent-panel" style={{ borderLeftColor: meta.color }}>
        <div className="agent-panel-header">
          <IconComponent size={16} color={meta.color} />
          <span className="agent-label">{meta.label}</span>
          {state.status === "scanning" ? (
            <Loader2 size={14} color={dotClr} className="animate-spin" />
          ) : state.status === "done" ? (
            <CheckCircle2 size={14} color={meta.color} />
          ) : (
            <span
              className={`status-dot ${isLive ? "pulse" : ""}`}
              style={{ background: dotClr }}
              title={state.status}
            />
          )}
        </div>

        <div className="agent-logs">
          {state.logs.length === 0 ? (
            <span className="log-empty">Waiting to start...</span>
          ) : (
            state.logs.map((line, i) => (
              <div
                key={i}
                className={`log-line ${line.startsWith("⚠") ? "log-warn" : ""}`}
              >
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </Cyber3DCard>
  );
}
