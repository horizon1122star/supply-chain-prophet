"use client";

import { newsItems } from "@/data/mockData";

const borderColors: Record<string, string> = {
  warning: "#c4c6d1",
  critical: "#ffb4ab",
  neutral: "rgba(255,255,255,0.15)",
};

export default function NewsFeed() {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div
        className="flex items-center justify-between pb-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <span className="flex items-center gap-2 font-mono text-[10px] text-white tracking-widest uppercase">
          <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
            rss_feed
          </span>
          NEWS
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full animate-blink"
            style={{ backgroundColor: "#c4c6d1" }}
          />
          <span className="font-mono text-[9px] text-white/30 tracking-widest">
            LIVE_SEC_4
          </span>
        </span>
      </div>
      <div className="flex flex-col gap-2 flex-1 overflow-hidden">
        {newsItems.map((item) => (
          <p
            key={item.id}
            className="font-mono text-[11px] py-1 pl-2 leading-snug"
            style={{
              borderLeft: `2px solid ${borderColors[item.severity]}`,
              color:
                item.severity === "neutral"
                  ? "rgba(255,255,255,0.45)"
                  : "rgba(255,255,255,0.85)",
            }}
          >
            {item.text}
          </p>
        ))}
      </div>
    </div>
  );
}
