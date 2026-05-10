// frontend-app/src/components/HistoricalMatchesWidget.tsx
"use client";
import type { AgentState } from "@/lib/types";
import { History, Target, ArrowRight } from "lucide-react";
import Cyber3DCard from "./Cyber3DCard";

interface HistoricalMatchesWidgetProps {
  memoryAgent: AgentState | undefined;
}

export default function HistoricalMatchesWidget({ memoryAgent }: HistoricalMatchesWidgetProps) {
  const matches = memoryAgent?.data?.matches as Array<any> | undefined;

  if (!matches || matches.length === 0) {
    return (
      <Cyber3DCard>
        <div className="historical-widget">
          <h3 className="section-label">
            <History size={14} /> Predicted vs Actual
          </h3>
          <div className="widget-empty">Awaiting historical data...</div>
        </div>
      </Cyber3DCard>
    );
  }

  return (
    <Cyber3DCard>
      <div className="historical-widget">
        <h3 className="section-label">
          <History size={14} /> Predicted vs Actual
        </h3>
        <div className="historical-list">
          {matches.slice(0, 3).map((match, i) => {
            // Fallback data uses `event` (string); DB data uses `description`
            const title = match.event ?? match.description ?? "Historical event";
            // Similarity is 0–1 float
            const simPct = match.similarity <= 1
              ? Math.round(match.similarity * 100)
              : Math.round(match.similarity);
            // date may not exist in fallback data
            const dateStr = match.date
              ? new Date(match.date).toLocaleDateString()
              : title.match(/\d{4}/) ? title.match(/\d{4}/)![0] : "Historical";
            return (
              <div key={i} className="historical-card">
                <div className="historical-header">
                  <span className="historical-date">{dateStr}</span>
                  <span className="historical-sim">
                    <Target size={12} /> {simPct}% match
                  </span>
                </div>
                <p className="historical-event">{title}</p>
                <div className="historical-outcome">
                  <ArrowRight size={12} className="outcome-icon" />
                  <span>{match.outcome ?? "Supply disruption recorded"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Cyber3DCard>
  );
}
