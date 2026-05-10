// frontend-app/src/components/WeatherWidget.tsx
"use client";
import type { AgentState } from "@/lib/types";
import { Fan, Waves, CloudRain, ShieldCheck, AlertTriangle } from "lucide-react";
import Cyber3DCard from "./Cyber3DCard";

interface WeatherWidgetProps {
  weatherAgent: AgentState | undefined;
}

export default function WeatherWidget({ weatherAgent }: WeatherWidgetProps) {
  const laneDetails = weatherAgent?.data?.lane_details as Record<string, any> | undefined;

  if (!laneDetails || Object.keys(laneDetails).length === 0) {
    return (
      <Cyber3DCard>
        <div className="weather-widget">
          <h3 className="section-label">
            <Waves size={14} /> Marine Weather
          </h3>
          <div className="widget-empty">Awaiting weather data...</div>
        </div>
      </Cyber3DCard>
    );
  }

  // Sort lanes to show critical/elevated first
  const lanes = Object.entries(laneDetails).sort((a, b) => {
    const sevA = a[1].severity;
    const sevB = b[1].severity;
    if (sevA === "critical") return -1;
    if (sevB === "critical") return 1;
    if (sevA === "elevated") return -1;
    if (sevB === "elevated") return 1;
    return 0;
  }).slice(0, 4); // Show top 4

  return (
    <Cyber3DCard>
      <div className="weather-widget">
        <h3 className="section-label">
          <Waves size={14} /> Marine Weather
        </h3>
        <div className="weather-list">
          {lanes.map(([lane, data]) => {
            const isClear = data.severity === "clear";
            const color = data.severity === "critical" ? "#E24B4A" : data.severity === "elevated" ? "#EF9F27" : "#1D9E75";
            
            // Determine spin speed based on wind (60km/h is fast, 20 is slow)
            const spinClass = data.wind > 50 ? "spin-fast" : data.wind > 30 ? "spin-normal" : "spin-slow";

            return (
              <div key={lane} className="weather-card" style={{ borderColor: isClear ? "var(--border-dim)" : color }}>
                <div className="weather-card-header">
                  <span className="weather-lane-name">{lane}</span>
                  {isClear ? (
                    <ShieldCheck size={14} color="#1D9E75" />
                  ) : (
                    <AlertTriangle size={14} color={color} className="pulse-icon" />
                  )}
                </div>
                <div className="weather-metrics">
                  <div className="weather-metric">
                    <Fan size={14} className={spinClass} color={color} />
                    <span>{data.wind} km/h</span>
                  </div>
                  <div className="weather-metric">
                    <Waves size={14} color={color} />
                    <span>{data.wave} m</span>
                  </div>
                  {data.rain > 0 && (
                    <div className="weather-metric">
                      <CloudRain size={14} color={color} />
                      <span>{data.rain} mm</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Cyber3DCard>
  );
}
