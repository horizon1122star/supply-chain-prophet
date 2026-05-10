"use client";

import { coordinates, systemStatus } from "@/data/mockData";

export default function MapVisualization() {
  return (
    <section
      className="flashlight-glow relative overflow-hidden shrink-0"
      style={{
        height: "340px",
        backgroundColor: "#0a1628",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "4px",
      }}
    >
      {/* Grid lines overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(173,198,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(173,198,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(77,142,255,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Continent SVG silhouette — simplified tactical map */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 1200 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* North America */}
        <path
          d="M120,80 L220,60 L280,80 L300,140 L280,200 L240,230 L200,220 L160,240 L140,280 L100,260 L80,200 L100,140 Z"
          fill="rgba(173,198,255,0.3)"
          stroke="rgba(173,198,255,0.6)"
          strokeWidth="1"
        />
        {/* South America */}
        <path
          d="M200,280 L240,270 L270,300 L280,360 L260,420 L230,440 L200,420 L180,370 L185,320 Z"
          fill="rgba(173,198,255,0.25)"
          stroke="rgba(173,198,255,0.5)"
          strokeWidth="1"
        />
        {/* Europe */}
        <path
          d="M480,60 L540,50 L580,70 L590,110 L560,130 L520,120 L490,100 Z"
          fill="rgba(173,198,255,0.3)"
          stroke="rgba(173,198,255,0.6)"
          strokeWidth="1"
        />
        {/* Africa */}
        <path
          d="M490,140 L560,130 L590,150 L600,230 L580,300 L540,340 L500,330 L470,280 L460,210 L480,160 Z"
          fill="rgba(173,198,255,0.25)"
          stroke="rgba(173,198,255,0.5)"
          strokeWidth="1"
        />
        {/* Asia */}
        <path
          d="M580,50 L760,40 L880,60 L920,100 L900,150 L840,170 L760,160 L700,140 L640,130 L590,110 Z"
          fill="rgba(173,198,255,0.28)"
          stroke="rgba(173,198,255,0.55)"
          strokeWidth="1"
        />
        {/* Australia */}
        <path
          d="M820,260 L900,250 L940,280 L950,330 L920,360 L860,360 L820,330 L810,290 Z"
          fill="rgba(173,198,255,0.22)"
          stroke="rgba(173,198,255,0.45)"
          strokeWidth="1"
        />
      </svg>

      {/* Animated route lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1200 500"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Asia → Europe route */}
        <path
          d="M760,100 Q680,80 590,90"
          stroke="rgba(173,198,255,0.4)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          fill="none"
        />
        {/* Europe → North America route */}
        <path
          d="M530,90 Q380,70 270,120"
          stroke="rgba(173,198,255,0.35)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          fill="none"
        />
        {/* Active route (bright) */}
        <path
          d="M760,100 Q650,200 530,270"
          stroke="rgba(255,180,171,0.6)"
          strokeWidth="2"
          strokeDasharray="8 4"
          fill="none"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-36"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      {/* Ping dots on key ports */}
      {[
        { x: "44%", y: "22%", color: "#ffb4ab", label: "SUEZ" },
        { x: "62%", y: "18%", color: "#adc6ff", label: "SHANGHAI" },
        { x: "42%", y: "14%", color: "#c4c6d1", label: "ROTTERDAM" },
        { x: "22%", y: "34%", color: "#adc6ff", label: "LA PORT" },
      ].map((ping) => (
        <div
          key={ping.label}
          className="absolute flex flex-col items-center"
          style={{ left: ping.x, top: ping.y, transform: "translate(-50%,-50%)" }}
        >
          <div className="relative">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: ping.color }}
            />
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{ backgroundColor: ping.color, opacity: 0.3 }}
            />
          </div>
          <span
            className="font-mono text-[8px] tracking-widest mt-1 whitespace-nowrap"
            style={{ color: ping.color, opacity: 0.8 }}
          >
            {ping.label}
          </span>
        </div>
      ))}

      {/* Top-left: System status overlays */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded"
          style={{
            backgroundColor: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span className="font-mono text-[10px] text-white tracking-wider uppercase">
            SYSTEMS NOMINAL: {systemStatus.uptime} UPTIME
          </span>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded"
          style={{
            backgroundColor: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
          <span className="font-mono text-[10px] text-error tracking-wider uppercase">
            ACTIVE DISRUPTIONS: {systemStatus.activeDisruptions}
          </span>
        </div>
      </div>

      {/* Top-right: Map controls */}
      <div className="absolute top-3 right-3 flex gap-1.5">
        {["layers", "zoom_in", "zoom_out", "my_location"].map((icon) => (
          <button
            key={icon}
            className="w-7 h-7 flex items-center justify-center transition-colors"
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "2px",
              color: "rgba(255,255,255,0.4)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.9)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
              {icon}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom-right: Coordinates */}
      <div className="absolute bottom-3 right-3 flex gap-2">
        {[
          { label: "LAT", value: coordinates.lat },
          { label: "LNG", value: coordinates.lng },
        ].map((c) => (
          <div
            key={c.label}
            className="flex flex-col items-center px-3 py-1.5"
            style={{
              backgroundColor: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "2px",
            }}
          >
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
              {c.label}
            </span>
            <span className="font-mono text-xs text-primary">{c.value}</span>
          </div>
        ))}
      </div>

      {/* Bottom-left: Scale */}
      <div
        className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "2px",
        }}
      >
        <div className="flex items-end gap-0.5">
          {[3, 5, 4, 7, 6, 8, 5, 9, 7, 6, 8, 5].map((h, i) => (
            <div
              key={i}
              style={{
                width: "3px",
                height: `${h * 2}px`,
                backgroundColor:
                  i < 7 ? "rgba(173,198,255,0.7)" : "rgba(255,255,255,0.15)",
                borderRadius: "1px",
              }}
            />
          ))}
        </div>
        <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
          SIGNAL: 87%
        </span>
      </div>
    </section>
  );
}
