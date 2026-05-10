"use client";

import { memoryData } from "@/data/mockData";

export default function MemoryFeed() {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div
        className="flex items-center justify-between pb-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <span className="font-mono text-[10px] text-white/60 tracking-widest uppercase">
          MEMORY
        </span>
        <span className="font-mono text-[9px] text-white/30 tracking-widest">
          MOD: {memoryData.model}
        </span>
      </div>
      <div className="flex-1 relative">
        {/* Faint "brain" grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(173,198,255,0.15) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <p className="font-mono text-[11px] text-white/75 italic leading-relaxed relative z-10">
          {memoryData.analysis}
        </p>
        {/* Token usage bar */}
        <div className="mt-3">
          <div className="flex justify-between mb-1">
            <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider">
              CONTEXT WINDOW
            </span>
            <span className="font-mono text-[9px] text-white/40">64%</span>
          </div>
          <div
            className="w-full h-0.5 rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: "64%",
                backgroundColor: "#adc6ff",
                boxShadow: "0 0 6px rgba(173,198,255,0.5)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
