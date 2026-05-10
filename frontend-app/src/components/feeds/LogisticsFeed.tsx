"use client";

import { logisticsItems } from "@/data/mockData";

const statusColorMap: Record<string, string> = {
  primary: "#adc6ff",
  tertiary: "#c9c6c5",
  secondary: "#c4c6d1",
};

export default function LogisticsFeed() {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div
        className="flex items-center justify-between pb-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <span className="font-mono text-[10px] text-white tracking-widest uppercase">
          LOGISTICS
        </span>
        <div className="flex gap-1 items-end">
          {[1, 0.5, 0.25].map((o, i) => (
            <div
              key={i}
              style={{
                width: "3px",
                height: "10px",
                backgroundColor: `rgba(173,198,255,${o})`,
                borderRadius: "1px",
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        {logisticsItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-2 py-1.5 transition-colors cursor-default"
            style={{
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: "2px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(173,198,255,0.06)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.2)")
            }
          >
            <span className="font-mono text-[10px] text-white/75 tracking-wider uppercase">
              {item.id}
            </span>
            <span
              className="font-mono text-[10px] tracking-wider"
              style={{ color: statusColorMap[item.statusColor] }}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
