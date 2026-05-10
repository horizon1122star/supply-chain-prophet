"use client";

import { systemStatus } from "@/data/mockData";

export default function StatusBar() {
  return (
    <footer
      className="shrink-0 h-7 flex items-center justify-between px-4"
      style={{
        backgroundColor: "#020810",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Left: System signals */}
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-white/40 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          API_STATUS: {systemStatus.apiStatus}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-white/40 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          NETWORK_LOAD: {systemStatus.networkLoad}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-white/40 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          AGENTS: 6/6 ACTIVE
        </span>
      </div>

      {/* Center: Version */}
      <span className="font-mono text-[10px] text-white/20 tracking-widest uppercase">
        SYS_BUILD: v2.4.1 // KERNEL: AGENTIC-CORE
      </span>

      {/* Right: User + timestamp */}
      <div className="flex items-center gap-5">
        <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
          USER: {systemStatus.user}
        </span>
        <span className="font-mono text-[10px] text-white/30">
          {systemStatus.timestamp}
        </span>
      </div>
    </footer>
  );
}
