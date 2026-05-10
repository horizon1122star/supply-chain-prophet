"use client";

import { useState, useEffect } from "react";
import { useDashboardContext } from "@/context/DashboardContext";
import type { CommoditiesApiResponse, CommodityDataPoint } from "@/app/api/commodities/route";

const trendColor = {
  up: "#4ade80",
  down: "#f87171",
  neutral: "rgba(255,255,255,0.4)",
};

function CommodityRow({ item }: { item: CommodityDataPoint }) {
  const numChange = parseFloat(item.percent_change);
  const trend = numChange > 0 ? "up" : numChange < 0 ? "down" : "neutral";
  const color = trendColor[trend];
  const icon = trend === "up" ? "trending_up" : trend === "down" ? "trending_down" : "trending_flat";
  const sign = trend === "up" ? "+" : "";

  return (
    <div
      className="flex items-center justify-between px-3 py-2.5 rounded-sm transition-all cursor-default"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      <div className="flex flex-col">
        <span className="font-mono text-xs font-bold text-white tracking-wider">
          {item.name}
        </span>
        <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          {item.symbol}
        </span>
      </div>

      <div className="flex flex-col items-end">
        <span className="font-mono text-xs text-white">${item.price}</span>
        <div className="flex items-center gap-1" style={{ color }}>
          <span className="font-mono text-[10px] font-semibold">
            {sign}{item.percent_change}%
          </span>
          <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 animate-pulse">
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-16 bg-white/10 rounded" />
        <div className="h-2 w-10 bg-white/5 rounded" />
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="h-3 w-14 bg-white/10 rounded" />
        <div className="h-2 w-12 bg-white/5 rounded" />
      </div>
    </div>
  );
}

export default function CommodityPrices() {
  const { globalQuery } = useDashboardContext();
  const [data, setData] = useState<CommoditiesApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/commodities?query=${encodeURIComponent(globalQuery)}`);
        const json = await res.json();
        if (active) setData(json);
      } catch (err) {
        console.error("Failed to fetch commodities", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [globalQuery]);

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 pb-2 pt-1">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: "14px" }}
          >
            precision_manufacturing
          </span>
          <span className="font-mono text-[10px] text-white tracking-widest uppercase">
            Raw Materials
          </span>
        </div>
      </div>

      {/* ── Context Label ── */}
      <div className="mx-3 mb-2 px-2 py-1 flex items-center justify-between"
        style={{
          backgroundColor: "rgba(173,198,255,0.06)",
          borderRadius: "2px",
          border: "1px solid rgba(173,198,255,0.1)",
        }}
      >
        <span className="font-mono text-[9px] text-primary tracking-widest uppercase truncate max-w-[140px]">
          CTX: {globalQuery || "GLOBAL AVG"}
        </span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[8px] tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
             {data?.source === "live" ? "LIVE" : "CACHED"}
          </span>
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex flex-col">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
        ) : data?.commodities.length ? (
          data.commodities.map((item) => (
            <CommodityRow key={item.symbol} item={item} />
          ))
        ) : (
          <div className="px-3 py-4 text-center">
            <span className="font-mono text-[10px] text-white/30">NO DATA FOUND</span>
          </div>
        )}
      </div>
    </div>
  );
}
