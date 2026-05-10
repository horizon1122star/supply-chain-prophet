// frontend-app/src/hooks/useScan.ts
// SSE connection + real-time agent state management.

"use client";
import { useState, useCallback, useRef } from "react";
import type { AgentState, VerdictData, EmailAction } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function useScan() {
  const [agents,   setAgents]   = useState<Record<string, AgentState>>({});
  const [verdict,  setVerdict]  = useState<VerdictData | null>(null);
  const [action,   setAction]   = useState<EmailAction | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const esRef     = useRef<EventSource | null>(null);
  // Track whether we received a verdict so onerror can distinguish EOF from failure
  const gotVerdict = useRef(false);

  const startScan = useCallback((company: string, scenario: string) => {
    // Close any existing SSE connection
    esRef.current?.close();
    gotVerdict.current = false;

    // Reset state
    setScanning(true);
    setVerdict(null);
    setAction(null);
    setError(null);
    setAgents({});

    const url =
      `${API_URL}/scan` +
      `?company=${encodeURIComponent(company)}` +
      `&scenario=${encodeURIComponent(scenario)}`;

    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e: MessageEvent) => {
      try {
        const event = JSON.parse(e.data);

        if (event.type === "verdict") {
          setVerdict(event.data as VerdictData);
          gotVerdict.current = true;
          // Do NOT close yet — an "action" event follows when risk > 65%.
          // The stream closes naturally via onerror (EOF) for low/medium risk.
          return;
        }

        if (event.type === "action") {
          setAction(event.data as EmailAction);
          // "action" is always the last event emitted; close cleanly.
          setScanning(false);
          es.close();
          return;
        }

        if (event.type === "error") {
          setError(event.log ?? "Unknown error from backend");
          setScanning(false);
          es.close();
          return;
        }

        // Orchestrator status events (thinking, acting) — keep scanning indicator alive
        if (event.agent === "orchestrator") return;

        // Update the specific agent panel
        if (event.agent) {
          setAgents((prev) => {
            const cur: AgentState = prev[event.agent] ?? {
              status: "idle",
              logs: [],
              data: {},
            };
            return {
              ...prev,
              [event.agent]: {
                status: event.status ?? cur.status,
                // Keep the last 6 log lines per agent
                logs: event.log ? [...cur.logs.slice(-5), event.log] : cur.logs,
                data:
                  event.data && Object.keys(event.data).length > 0
                    ? event.data
                    : cur.data,
              },
            };
          });
        }
      } catch {
        // Ignore malformed events
      }
    };

    es.onerror = () => {
      // onerror fires both on real connection errors AND when the server closes
      // the stream after sending all events (normal EOF for low/medium risk scans).
      es.close();
      setScanning(false);
      if (!gotVerdict.current) {
        setError(
          "Connection to backend lost. Make sure the FastAPI server is running on port 8000."
        );
      }
    };
  }, []);

  const stopScan = useCallback(() => {
    esRef.current?.close();
    setScanning(false);
  }, []);

  return { agents, verdict, action, scanning, error, startScan, stopScan };
}
