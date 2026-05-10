// frontend-app/src/components/SignalFeed.tsx
// Scrolling live feed for all miscellaneous agent alerts.

"use client";
import type { AgentState } from "@/lib/types";
import { useEffect, useRef } from "react";
import { AlertCircle, Info } from "lucide-react";
import Cyber3DCard from "./Cyber3DCard";

interface SignalFeedProps {
  agents: Record<string, AgentState>;
}

export default function SignalFeed({ agents }: SignalFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Aggregate all agent logs into one feed
  const feed = Object.entries(agents).flatMap(([agent, state]) =>
    state.logs.map((log) => ({ agent, log }))
  );

  useEffect(() => {
    // Auto-scroll to bottom as new logs arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [feed.length]);

  return (
    <Cyber3DCard>
      <div className="signal-feed">
        <h3 className="section-label">⚡ Live Intelligence Feed</h3>
        {feed.length === 0 ? (
          <div className="feed-empty">Connecting to intelligence networks...</div>
        ) : (
          <div className="signal-feed-scroll" ref={scrollRef}>
            {feed.map((f, i) => {
              const isWarn = f.log.includes("⚠");
              return (
                <div key={i} className={`feed-item ${isWarn ? "feed-warn" : ""}`}>
                  {isWarn ? (
                    <AlertCircle size={12} color="#EF9F27" className="feed-icon" />
                  ) : (
                    <Info size={12} color="#505070" className="feed-icon" />
                  )}
                  <span className="feed-log">{f.log}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Cyber3DCard>
  );
}
