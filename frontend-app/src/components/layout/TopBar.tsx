"use client";

import { useState } from "react";
import { useDashboardContext } from "@/context/DashboardContext";

export default function TopBar() {
  const { setGlobalQuery } = useDashboardContext();
  const [query, setQuery] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleScan = (e?: React.FormEvent) => {
    e?.preventDefault();
    setScanning(true);
    setGlobalQuery(query);
    setTimeout(() => setScanning(false), 2000);
  };

  return (
    <header
      className="flashlight-glow shrink-0 h-14 flex items-center px-4 gap-4 z-50"
      style={{ backgroundColor: "#0d1117", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "#4d8eff", opacity: 0.6 }}
          />
          <div
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: "#4d8eff", opacity: 0.3 }}
          />
        </div>
        <span
          className="font-mono text-xs font-bold tracking-[0.2em] text-white uppercase whitespace-nowrap"
        >
          LOGISTICS MISSION CONTROL
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10 shrink-0" />

      {/* Command Input */}
      <form onSubmit={handleScan} className="flex-grow relative">
        <span
          className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
          style={{ fontSize: "14px" }}
        >
          terminal
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="QUERY GLOBAL SUPPLY CHAIN STATE..."
          className="w-full font-mono text-xs tracking-widest text-white uppercase placeholder:text-white/20 outline-none transition-all"
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "2px",
            padding: "6px 12px 6px 36px",
            caretColor: "#adc6ff",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#adc6ff";
            e.currentTarget.style.boxShadow = "0 0 0 2px rgba(173,198,255,0.12)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </form>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleScan}
          className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase transition-all active:scale-95"
          style={{
            backgroundColor: scanning ? "#4d8eff" : "#adc6ff",
            color: "#002e6a",
            padding: "0 20px",
            height: "34px",
            borderRadius: "2px",
            boxShadow: scanning
              ? "0 0 16px rgba(77,142,255,0.5)"
              : "inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        >
          {scanning ? (
            <>
              <span
                className="material-symbols-outlined animate-spin"
                style={{ fontSize: "14px" }}
              >
                autorenew
              </span>
              SCANNING...
            </>
          ) : (
            <>
              INITIATE SCAN
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                radar
              </span>
            </>
          )}
        </button>

        {/* Settings icon */}
        <button
          className="w-9 h-9 flex items-center justify-center transition-colors"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "2px",
            color: "rgba(255,255,255,0.4)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.8)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
          }
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            settings
          </span>
        </button>
      </div>
    </header>
  );
}
