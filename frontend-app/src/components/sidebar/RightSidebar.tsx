"use client";

import CommodityPrices from "./CommodityPrices";
import StockMarket from "./StockMarket";
import RiskPredictions from "./RiskPredictions";

export default function RightSidebar() {
  return (
    <aside
      className="flashlight-glow w-80 shrink-0 flex flex-col overflow-y-auto custom-scrollbar"
      style={{
        backgroundColor: "#111927",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Commodity Prices */}
      <div
        className="p-4 flex flex-col shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <CommodityPrices />
      </div>

      {/* Live Stock Market — expandable, gets most space */}
      <div
        className="flex flex-col shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <StockMarket />
      </div>

      {/* Risk Predictions */}
      <div className="p-4 flex flex-col flex-1">
        <RiskPredictions />
      </div>
    </aside>
  );
}
