// frontend-app/src/components/CommodityBars.tsx
// Horizontal bar chart for commodity price movements.

"use client";
import type { AgentState } from "@/lib/types";
import Cyber3DCard from "./Cyber3DCard";

const COMMODITY_LABELS: Record<string, string> = {
  "BZ=F": "Brent Crude",
  "USO":  "US Oil ETF",
  "GC=F": "Gold",
  "PALL": "Palladium",
  "CPER": "Copper ETF",
  "JO":   "Coffee Futures",
};

interface CommodityBarsProps {
  financialAgent: AgentState | undefined;
}

export default function CommodityBars({ financialAgent }: CommodityBarsProps) {
  const prices = (financialAgent?.data?.prices ?? {}) as Record<string, number>;

  // Only show commodity tickers (not stocks)
  const commodities = Object.entries(prices).filter(
    ([t]) => COMMODITY_LABELS[t]
  );

  if (commodities.length === 0) {
    // Show all tickers if no commodity match found
    const allTickers = Object.entries(prices).slice(0, 5);
    if (allTickers.length === 0) {
      return (
        <Cyber3DCard>
          <div className="commodity-bars">
            <h3 className="section-label">📊 Commodity Signals</h3>
            <div className="widget-empty">Awaiting market data...</div>
          </div>
        </Cyber3DCard>
      );
    }
  }

  const items = commodities.length > 0 ? commodities : Object.entries(prices).slice(0, 5);
  const maxAbs = Math.max(...items.map(([, v]) => Math.abs(v)), 5);

  return (
    <Cyber3DCard>
      <div className="commodity-bars">
        <h3 className="section-label">📊 Commodity Signals</h3>
        <div className="commodity-list">
          {items.map(([ticker, pct]) => {
            const label = COMMODITY_LABELS[ticker] ?? ticker;
            const isPos = pct >= 0;
            const barW  = Math.abs(pct) / maxAbs * 100;
            const color = isPos ? "#1D9E75" : "#E24B4A";

            return (
              <div key={ticker} className="commodity-row">
                <span className="commodity-label">{label}</span>
                <div className="commodity-bar-wrap">
                  <div
                    className="commodity-bar-fill"
                    style={{ width: `${barW}%`, background: color }}
                  />
                </div>
                <span className="commodity-pct" style={{ color }}>
                  {isPos ? "+" : ""}{pct.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Cyber3DCard>
  );
}
