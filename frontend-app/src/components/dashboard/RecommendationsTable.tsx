"use client";

import { useState } from "react";
import { recommendations } from "@/data/mockData";

const severityColor = {
  critical:    "#ffb4ab",
  recommended: "#c4c6d1",
};

const actionBorder = {
  critical:    "rgba(255,180,171,0.4)",
  recommended: "rgba(173,198,255,0.4)",
};

const actionHoverBg = {
  critical:    "rgba(255,180,171,0.15)",
  recommended: "rgba(173,198,255,0.15)",
};

export default function RecommendationsTable() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [executed, setExecuted] = useState<Set<string>>(new Set());

  const handleAction = (id: string) => {
    setExecuted((prev) => new Set([...prev, id]));
  };

  return (
    <section
      className="flashlight-glow flex flex-col"
      style={{
        backgroundColor: "#1a2233",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "4px",
      }}
    >
      {/* Table header */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(0,0,0,0.15)" }}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-white tracking-widest uppercase">
            RECOMMENDATIONS
          </span>
          <span
            className="font-mono text-[9px] px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: "rgba(173,198,255,0.1)", color: "#adc6ff" }}
          >
            {recommendations.length} ACTIVE
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-secondary tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#c4c6d1" }} />
            RECOMMENDED
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-error tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-error" />
            CRITICAL
          </span>
          <button
            className="font-mono text-[9px] text-white/30 tracking-widest uppercase transition-colors hover:text-white/60"
            style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px", padding: "2px 10px" }}
          >
            EXPORT ALL
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: "rgba(0,0,0,0.1)" }}>
              {["EVENT_ID", "DISRUPTION_SOURCE", "IMPACT_EST", "RECOVERY_TTL", "ACTION_REQUIRED"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left font-mono text-[9px] tracking-widest"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recommendations.map((row) => {
              const isHovered = hovered === row.id;
              const isDone = executed.has(row.id);
              return (
                <tr
                  key={row.id}
                  onMouseEnter={() => setHovered(row.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    backgroundColor: isHovered ? "rgba(255,255,255,0.03)" : "transparent",
                    borderLeft: isHovered ? "2px solid #adc6ff" : "2px solid transparent",
                    transition: "all 0.15s ease",
                    opacity: isDone ? 0.45 : 1,
                  }}
                >
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#adc6ff" }}>
                    {row.id}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-white tracking-wider">
                    {row.source}
                  </td>
                  <td
                    className="px-4 py-3 font-mono text-xs font-bold"
                    style={{ color: severityColor[row.severity as keyof typeof severityColor] }}
                  >
                    {row.impact}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {row.ttl}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleAction(row.id)}
                      disabled={isDone}
                      className="font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 transition-all active:scale-95"
                      style={{
                        border: `1px solid ${actionBorder[row.severity as keyof typeof actionBorder]}`,
                        color:  severityColor[row.severity as keyof typeof severityColor],
                        borderRadius: "2px",
                        backgroundColor: isDone
                          ? "rgba(255,255,255,0.05)"
                          : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isDone)
                          e.currentTarget.style.backgroundColor =
                            actionHoverBg[row.severity as keyof typeof actionHoverBg];
                      }}
                      onMouseLeave={(e) => {
                        if (!isDone) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {isDone ? "✓ EXECUTED" : row.action}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
