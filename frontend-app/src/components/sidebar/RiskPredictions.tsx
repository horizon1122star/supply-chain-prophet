"use client";

import { riskPredictions } from "@/data/mockData";

const riskColor = {
  critical: "#ffb4ab",
  warning:  "#c9c6c5",
  low:      "#c4c6d1",
};

export default function RiskPredictions() {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] text-white tracking-widest uppercase">
          RISK PREDICTIONS
        </span>
        <span className="material-symbols-outlined text-white/30" style={{ fontSize: "14px" }}>
          query_stats
        </span>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {riskPredictions.map((item) => (
          <div key={item.supplier} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-white/55 tracking-wider uppercase">
                {item.supplier}
              </span>
              <span
                className="font-mono text-[9px] font-bold"
                style={{ color: riskColor[item.level as keyof typeof riskColor] }}
              >
                {item.probability}% PROB
              </span>
            </div>
            <div
              className="w-full h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${item.probability}%`,
                  backgroundColor: riskColor[item.level as keyof typeof riskColor],
                  boxShadow: `0 0 6px ${riskColor[item.level as keyof typeof riskColor]}66`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <button
        className="mt-3 w-full font-mono text-[9px] tracking-widest uppercase text-white/40 py-2 transition-all hover:text-white hover:border-white/30"
        style={{
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "2px",
        }}
      >
        EXPORT FULL ANALYTICS
      </button>
    </div>
  );
}
