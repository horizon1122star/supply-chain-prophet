"use client";

import { financialData } from "@/data/mockData";

export default function FinanceFeed() {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div
        className="flex items-center justify-between pb-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <span className="flex items-center gap-2 font-mono text-[10px] text-white tracking-widest uppercase">
          <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
            show_chart
          </span>
          FINANCE
        </span>
        <span className="font-mono text-[9px] text-white/30 tracking-widest">
          SYNC_READY
        </span>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {financialData.map((item) => (
          <div
            key={item.ticker}
            className="flex items-center justify-between py-1"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          >
            <span className="font-mono text-[10px] text-white/60 tracking-wider uppercase">
              {item.ticker}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-white">{item.value}</span>
              <span
                className="font-mono text-[10px]"
                style={{
                  color:
                    item.trend === "up"
                      ? "#c4c6d1"
                      : item.trend === "down"
                      ? "#ffb4ab"
                      : "rgba(255,255,255,0.3)",
                }}
              >
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
