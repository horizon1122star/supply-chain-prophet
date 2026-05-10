"use client";
import type { VerdictData, AgentState } from "@/lib/types";
import { Clock, AlertTriangle, BarChart2, CheckCircle2 } from "lucide-react";
import Cyber3DCard from "./Cyber3DCard";

const RISK_COLORS = {
  high:   { bg: "rgba(255, 182, 175, 1)", border: "rgba(255, 182, 175, 1)", text: "#E24B4A", darkBg: "rgba(226,75,74,0.15)", icon: AlertTriangle },
  medium: { bg: "rgba(255, 219, 163, 1)", border: "rgba(255, 219, 163, 1)", text: "#EF9F27", darkBg: "rgba(239,159,39,0.15)", icon: AlertTriangle },
  low:    { bg: "rgba(182, 235, 217, 1)", border: "rgba(182, 235, 217, 1)", text: "#1D9E75", darkBg: "rgba(29,158,117,0.15)", icon: CheckCircle2 },
};

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function generateTrendData(points: number, min: number, max: number) {
  const data = [];
  let current = (max + min) / 2;
  for (let i = 0; i < points; i++) {
    current += (Math.random() - 0.5) * ((max - min) / 3);
    current = Math.max(min, Math.min(max, current));
    data.push(current);
  }
  // Make the end look like the image (a spike and drop)
  data[points - 3] = max * 0.9;
  data[points - 2] = max;
  data[points - 1] = min + (max - min) * 0.2;
  return data;
}

const STOCK_SPARKLINE = generateTrendData(20, 10, 50);

export default function VerdictCard({ 
  verdict, 
  financialAgent 
}: { 
  verdict: VerdictData;
  financialAgent?: AgentState;
}) {
  const riskProps = RISK_COLORS[verdict.risk_level] ?? RISK_COLORS.medium;
  const RiskIcon = riskProps.icon;

  // Mock trend since we don't have it in backend
  const trend = "+4%"; 

  // Get stock info if available, or mock AAPL
  let stockTicker = "AAPL";
  let stockPrice = "172.50";
  let stockChange = "-1.2%";

  if (financialAgent?.data?.stock_data) {
    const stocks = financialAgent.data.stock_data as any[];
    if (stocks && stocks.length > 0) {
      stockTicker = stocks[0].ticker;
      stockPrice = stocks[0].price.toFixed(2);
      stockChange = stocks[0].change_pct > 0 ? `+${stocks[0].change_pct.toFixed(1)}%` : `${stocks[0].change_pct.toFixed(1)}%`;
    }
  }

  // Find max signal for scaling
  const maxSignal = Math.max(...Object.values(verdict.signal_breakdown));

  return (
    <div className="verdict-dashboard">
      
      {/* The 3 Top Boxes */}
      <div className="v-boxes-row">
        
        {/* Box 1: Disruption Probability */}
        <Cyber3DCard className="v-box v-box-probability" intensity="low">
          <div className="v-box-header">
            <span className="v-box-title">DISRUPTION<br/>PROBABILITY</span>
            <div className="v-risk-pill" style={{ backgroundColor: riskProps.bg, color: riskProps.text }}>
              <RiskIcon size={10} style={{ marginRight: 4, display: "inline" }} strokeWidth={3} />
              {verdict.risk_level.toUpperCase()} RISK
            </div>
          </div>
          <div className="v-box-metric-row">
            <span className="v-huge-metric">{verdict.probability}%</span>
            <span className="v-trend-up">↑ {trend}</span>
          </div>
          <div className="v-box-footer">
            <Clock size={12} style={{ display: "inline", verticalAlign: "sub", marginRight: 4 }} />
            Est. impact in {verdict.timeline}
          </div>
        </Cyber3DCard>

        {/* Box 2: Signal Strength */}
        <Cyber3DCard className="v-box v-box-signals" intensity="low">
          <div className="v-box-header">
            <span className="v-box-title">SIGNAL STRENGTH</span>
            <BarChart2 size={14} color="#888" />
          </div>
          <div className="v-signals-container">
            {Object.entries(verdict.signal_breakdown).slice(0,4).map(([k, v]) => {
              const heightPct = maxSignal > 0 ? (v / maxSignal) * 100 : 0;
              const color = v > 0.65 ? "#E24B4A" : v > 0.35 ? "#EF9F27" : "#1D9E75";
              const labelMap: Record<string, string> = { news: "News", financial: "Finance", weather: "Weather", logistics: "Logistics" };
              const displayLabel = labelMap[k] || k;
              return (
                <div key={k} className="v-signal-col">
                  <div className="v-signal-bar-bg">
                    <div className="v-signal-bar-fill" style={{ height: `${heightPct}%`, backgroundColor: color }}></div>
                  </div>
                  <span className="v-signal-label">{displayLabel}</span>
                </div>
              );
            })}
          </div>
        </Cyber3DCard>

        {/* Box 3: Stock Trend */}
        <Cyber3DCard className="v-box v-box-trend" intensity="low">
          <div className="v-box-header">
            <span className="v-box-title">
              <span className="v-ios-badge">iOS</span> {stockTicker} TREND
            </span>
            <span className="v-trend-down">{stockChange}</span>
          </div>
          <div className="v-stock-price">${stockPrice}</div>
          <div className="v-stock-time">Last updated 12 mins ago</div>
          <div className="v-sparkline-container">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="v-sparkline-svg">
              <defs>
                <linearGradient id="vSparkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E24B4A" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#E24B4A" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d={`M 0 30 L 0 ${30 - STOCK_SPARKLINE[0]} ` + 
                   STOCK_SPARKLINE.map((y, i) => `L ${i * (100 / (STOCK_SPARKLINE.length - 1))} ${30 - y}`).join(' ') + 
                   ` L 100 30 Z`}
                fill="url(#vSparkGradient)"
              />
              <path 
                d={`M 0 ${30 - STOCK_SPARKLINE[0]} ` + 
                   STOCK_SPARKLINE.map((y, i) => `L ${i * (100 / (STOCK_SPARKLINE.length - 1))} ${30 - y}`).join(' ')}
                fill="none"
                stroke="#E24B4A"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </Cyber3DCard>

      </div>

      {/* Condensed Extra Info */}
      <Cyber3DCard className="v-condensed-info" intensity="low">
        <div className="v-info-header">
          <h3 className="v-info-title">Primary Risk & Actions</h3>
          <div className="v-costs-row">
            <span className="v-cost-item">
              <span className="v-cost-label">Disruption:</span>
              <span className="v-cost-val" style={{color: "#E24B4A"}}>{fmt(verdict.cost_estimates.disruption_cost)}</span>
            </span>
            <span className="v-cost-item">
              <span className="v-cost-label">Mitigation:</span>
              <span className="v-cost-val" style={{color: "#1D9E75"}}>{fmt(verdict.cost_estimates.mitigation_cost)}</span>
            </span>
          </div>
        </div>
        <p className="v-primary-risk-text">{verdict.primary_risk}</p>
        <div className="v-actions-condensed">
          {verdict.actions.map((a, i) => (
            <span key={i} className="v-action-text-item">
              <span className="v-action-num">{i + 1}</span> {a}
            </span>
          ))}
        </div>
      </Cyber3DCard>
    </div>
  );
}
