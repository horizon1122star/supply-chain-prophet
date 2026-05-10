"use client";

import { useEffect, useState } from "react";
import { useDashboardContext } from "@/context/DashboardContext";

interface LaneDetail {
  wind: number;
  wave: number;
  rain: number;
  severity: "critical" | "elevated" | "clear";
  lat: number;
  lon: number;
  has_storm: boolean;
}

interface WeatherData {
  risky_lanes?: string[];
  lane_details?: Record<string, LaneDetail>;
}

export default function WeatherFeed() {
  const { globalQuery } = useDashboardContext();
  const [status, setStatus] = useState<"idle" | "scanning" | "live" | "done" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [data, setData] = useState<WeatherData>({});

  useEffect(() => {
    let source: EventSource | null = null;

    const startScan = () => {
      setStatus("scanning");
      setLogs([]);
      source = new EventSource("/api/weather?query=" + encodeURIComponent(globalQuery));

      source.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === "log" || payload.type === "status") {
            setStatus(payload.status);
            if (payload.log) {
              setLogs((prev) => {
                const updated = [...prev, payload.log];
                // keep only last 4 lines
                return updated.slice(-4);
              });
            }
          } else if (payload.type === "result") {
            setStatus("done");
            setData(payload.data);
            if (payload.log) {
              setLogs((prev) => [...prev, payload.log].slice(-4));
            }
            source?.close();
          } else if (payload.type === "error") {
            setStatus("error");
            if (payload.log) {
              setLogs((prev) => [...prev, payload.log].slice(-4));
            }
            source?.close();
          }
        } catch (err) {
          console.error("SSE Parse error", err);
        }
      };

      source.onerror = (err) => {
        console.error("SSE Error", err);
        source?.close();
        setStatus("error");
      };
    };

    startScan();

    return () => {
      source?.close();
    };
  }, [globalQuery]);

  const severityColor = {
    critical: "#ffb4ab", // red
    elevated: "#ffb4ab", // or warning color like "#c9c6c5"
    clear: "#adc6ff",    // green/blue
  };

  const severityLabel = {
    critical: "CRIT",
    elevated: "ELEV",
    clear: "OK",
  };

  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden">
      <div
        className="flex items-center justify-between pb-2 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <span className="flex items-center gap-2 font-mono text-[10px] text-white tracking-widest uppercase">
          <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
            thunderstorm
          </span>
          WEATHER AGENT
        </span>
        <span className="font-mono text-[9px] text-white/30 tracking-widest">
          {status === "done" ? "SCANNED" : "SCAN_AUTO"}
        </span>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
        {status !== "done" && status !== "error" ? (
          <div className="flex flex-col justify-center h-full gap-2 px-1">
            <div className="flex items-center gap-2 text-white/60 mb-2">
               <span className="material-symbols-outlined animate-spin" style={{ fontSize: "16px" }}>
                 cyclone
               </span>
               <span className="font-mono text-[10px] uppercase">Agent scanning...</span>
            </div>
            {logs.map((l, i) => (
              <div key={i} className="font-mono text-[9px] text-white/50 truncate">
                {l}
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <th className="text-left font-mono text-[8px] text-white/30 py-1.5 uppercase">Lane</th>
                <th className="text-right font-mono text-[8px] text-white/30 py-1.5 uppercase pr-2">Wind</th>
                <th className="text-right font-mono text-[8px] text-white/30 py-1.5 uppercase pr-2">Wave</th>
                <th className="text-center font-mono text-[8px] text-white/30 py-1.5 uppercase">Sev</th>
              </tr>
            </thead>
            <tbody>
              {data.lane_details && Object.entries(data.lane_details).map(([lane, details]) => (
                <tr key={lane} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td className="py-1.5 font-mono text-[9px] text-white/80 truncate max-w-[80px]">
                    {lane} {details.has_storm ? "🌪" : ""}
                  </td>
                  <td className="py-1.5 font-mono text-[9px] text-white/60 text-right pr-2">
                    {Math.round(details.wind)}km
                  </td>
                  <td className="py-1.5 font-mono text-[9px] text-white/60 text-right pr-2">
                    {details.wave.toFixed(1)}m
                  </td>
                  <td className="py-1.5 text-center">
                    <span 
                      className="font-mono text-[8px] px-1.5 py-0.5 rounded-sm"
                      style={{ 
                        backgroundColor: details.severity === "clear" ? "rgba(173,198,255,0.1)" : "rgba(255,180,171,0.1)",
                        color: details.severity === "clear" ? "#adc6ff" : "#ffb4ab",
                      }}
                    >
                      {severityLabel[details.severity]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
