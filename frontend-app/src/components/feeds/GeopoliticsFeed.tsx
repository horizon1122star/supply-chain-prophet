"use client";

import { geopoliticsData } from "@/data/mockData";

export default function GeopoliticsFeed() {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div
        className="flex items-center justify-between pb-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <span className="font-mono text-[10px] text-error tracking-widest uppercase">
          GEOPOLITICS
        </span>
        <span
          className="font-mono text-[9px] px-2 py-0.5 rounded-sm tracking-widest"
          style={{
            backgroundColor: "rgba(255,180,171,0.1)",
            color: "#ffb4ab",
            border: "1px solid rgba(255,180,171,0.2)",
          }}
        >
          {geopoliticsData.riskLevel}
        </span>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {/* Stability bar */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="font-mono text-[10px] text-white/60 uppercase tracking-wider">
              {geopoliticsData.stability.label}
            </span>
            <span className="font-mono text-[10px] text-error">
              {geopoliticsData.stability.value}%
            </span>
          </div>
          <div
            className="w-full h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${geopoliticsData.stability.value}%`,
                backgroundColor: "#ffb4ab",
                boxShadow: "0 0 6px rgba(255,180,171,0.4)",
              }}
            />
          </div>
        </div>
        {/* Threat note */}
        <p className="font-mono text-[10px] text-white/55 leading-relaxed">
          {geopoliticsData.note}
        </p>
        {/* Threat level indicators */}
        <div className="flex gap-1.5 mt-auto">
          {["TRADE", "MILITARY", "CYBER", "SANCTIONS"].map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className="w-5"
                style={{
                  height: `${[18, 12, 8, 14][i]}px`,
                  backgroundColor:
                    i === 0
                      ? "rgba(255,180,171,0.7)"
                      : "rgba(255,180,171,0.25)",
                  borderRadius: "1px 1px 0 0",
                }}
              />
              <span
                className="font-mono text-[7px] text-white/30 tracking-widest"
                style={{ fontSize: "7px" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
