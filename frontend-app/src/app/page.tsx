"use client";
import { useState, lazy, Suspense } from "react";
import { useScan } from "@/hooks/useScan";
import AgentPanel from "@/components/AgentPanel";
import VerdictCard from "@/components/VerdictCard";
import SupplierTable from "@/components/SupplierTable";
import StockWidget from "@/components/StockWidget";
import SignalFeed from "@/components/SignalFeed";
import ActionCard from "@/components/ActionCard";
import CommodityBars from "@/components/CommodityBars";
import WeatherWidget from "@/components/WeatherWidget";
import HistoricalMatchesWidget from "@/components/HistoricalMatchesWidget";
import { Zap, Search, Globe, StopCircle } from "lucide-react";

const SeaMap = lazy(() => import("@/components/SeaMap"));

const SCENARIOS = [
  { id: "Taiwan earthquake",     label: "🌏 Taiwan Earthquake"    },
  { id: "Red Sea tensions",      label: "⚓ Red Sea Tensions"     },
  { id: "Vietnam drought",       label: "☀️ Vietnam Drought"      },
  { id: "Rotterdam port strike", label: "🏭 Rotterdam Strike"     },
];

const AGENT_ORDER = ["news", "financial", "weather", "logistics", "memory", "geopolitical"];

export default function Dashboard() {
  const [company,  setCompany]  = useState("Apple Inc.");
  const [scenario, setScenario] = useState("Taiwan earthquake");

  const { agents, verdict, action, scanning, error, startScan, stopScan } = useScan();

  const hasResults = verdict !== null || Object.keys(agents).length > 0;

  return (
    <div className="page">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="site-header">
        <div className="header-inner">
          <div className="header-brand">
            <Zap className="brand-icon" size={28} color="#EF9F27" />
            <div>
              <h1 className="brand-name">Supply Chain Prophet</h1>
              <span className="brand-tagline">
                We know about it before your supplier calls you
              </span>
            </div>
          </div>

          <div className="scan-controls">
            <input
              className="company-input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name..."
              disabled={scanning}
            />
            <select
              className="scenario-select"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              disabled={scanning}
            >
              {SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
              <option value="">🔍 Custom Query</option>
            </select>
            {scanning ? (
              <button className="btn-stop" onClick={stopScan}>
                <StopCircle size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Stop
              </button>
            ) : (
              <button
                className="btn-scan"
                onClick={() => startScan(company, scenario)}
                disabled={!company.trim()}
              >
                <Search size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Run Scan
              </button>
            )}
          </div>
        </div>

        {/* Scanning progress bar */}
        {scanning && <div className="scan-progress-bar" />}
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────────────── */}
      <main className="main-content">

        {/* Empty state */}
        {!hasResults && !scanning && (
          <div className="empty-state">
            <Globe className="empty-icon-lucide" size={56} color="#505070" />
            <h2>Supply Chain Intelligence Ready</h2>
            <p>
              Enter a company name, select a risk scenario, and click{" "}
              <strong>Run Scan</strong> to deploy 6 AI agents simultaneously.
            </p>
            <div className="quick-presets">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  className="preset-btn"
                  onClick={() => {
                    setScenario(s.id);
                    startScan(company, s.id);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="error-banner">
            ⚠ Backend error: {error} — check that the FastAPI server is running.
          </div>
        )}

        {/* Agent grid */}
        {(hasResults || scanning) && (
          <section className="agent-grid">
            {AGENT_ORDER.map((key) => (
              <AgentPanel
                key={key}
                agentKey={key}
                state={
                  agents[key] ?? { status: "idle", logs: [], data: {} }
                }
              />
            ))}
          </section>
        )}

        {/* 2-Column Layout for Results */}
        {hasResults && (
          <div className="results-layout">
            
            {/* Left Column: Core Analysis */}
            <div className="core-column">
              {verdict && <VerdictCard verdict={verdict} financialAgent={agents.financial} />}
              
              {(scanning || hasResults) && (
                <div className="map-wrapper">
                  <Suspense fallback={<div className="map-loading">Loading map...</div>}>
                    <SeaMap verdict={verdict} agents={agents} scenario={scenario} scanning={scanning} />
                  </Suspense>
                </div>
              )}

              {verdict && (
                <SupplierTable
                  affected={verdict.affected_suppliers}
                  alternatives={verdict.alternative_suppliers}
                />
              )}

              {action && <ActionCard action={action} />}
            </div>

            {/* Right Column: Market & Live Data Sidebar */}
            <div className="sidebar-column">
              <StockWidget financialAgent={agents.financial} />
              <CommodityBars financialAgent={agents.financial} />
              <WeatherWidget weatherAgent={agents.weather} />
              <HistoricalMatchesWidget memoryAgent={agents.memory} />
              <SignalFeed agents={agents} />
            </div>
            
          </div>
        )}

      </main>

      <footer className="site-footer">
        <span>Supply Chain Prophet · 6-agent AI swarm · </span>
        <span>Open-Meteo · GDELT · Yahoo Finance · NOAA · Google News · Groq (Llama 3.3)</span>
      </footer>
    </div>
  );
}
