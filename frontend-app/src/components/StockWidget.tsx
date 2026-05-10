// frontend-app/src/components/StockWidget.tsx
// Displays supply-chain stock tickers with sparklines and % change badges.

"use client";
import type { AgentState } from "@/lib/types";
import Cyber3DCard from "./Cyber3DCard";

interface Prices {
  [ticker: string]: number;
}

function MiniSparkline({ value }: { value: number }) {
  // Generate a plausible sparkline path based on the final % change
  const steps = 10;
  const start = 50;
  const noise = () => (Math.random() - 0.5) * 8;
  const pts = Array.from({ length: steps }, (_, i) => {
    const progress = i / (steps - 1);
    return start + progress * value * 2 + noise();
  });

  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;

  const w = 80, h = 28;
  const path = pts
    .map((p, i) => {
      const x = (i / (steps - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const color = value >= 0 ? "#1D9E75" : "#E24B4A";
  return (
    <svg width={w} height={h} className="sparkline">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface StockWidgetProps {
  financialAgent: AgentState | undefined;
}

export default function StockWidget({ financialAgent }: StockWidgetProps) {
  const prices = (financialAgent?.data?.prices ?? {}) as Prices;
  const riskScore = financialAgent?.data?.risk_score as number | undefined;

  return (
    <Cyber3DCard>
      <div className="stock-widget">
        <h3 className="section-label">
          📈 Market Signals
          {riskScore !== undefined && (
            <span className="risk-score-badge" style={{
              color: riskScore > 0.6 ? "#E24B4A" : riskScore > 0.3 ? "#EF9F27" : "#1D9E75"
            }}>
              Risk: {(riskScore * 100).toFixed(0)}%
            </span>
          )}
        </h3>

        {Object.keys(prices).length === 0 ? (
          <div className="widget-empty">Awaiting market data...</div>
        ) : (
          <div className="stock-grid">
            {Object.entries(prices).map(([ticker, pct]) => (
              <div key={ticker} className="stock-card">
                <div className="stock-ticker">{ticker}</div>
                <MiniSparkline value={pct} />
                <div
                  className="stock-pct"
                  style={{ color: pct >= 0 ? "#1D9E75" : "#E24B4A" }}
                >
                  {pct >= 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
                </div>
                <div className="stock-period">5d</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Cyber3DCard>
  );
}
