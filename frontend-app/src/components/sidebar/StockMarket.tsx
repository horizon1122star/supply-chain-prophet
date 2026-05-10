"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { StocksApiResponse, StockDataPoint } from "@/app/api/stocks/route";

// ── Inline SVG Sparkline ──────────────────────────────────────────────────────
function Sparkline({
  data,
  positive,
  width = 72,
  height = 28,
}: {
  data: number[];
  positive: boolean;
  width?: number;
  height?: number;
}) {
  if (!data || data.length < 2) {
    // Flat line fallback
    const y = height / 2;
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line x1={0} y1={y} x2={width} y2={y}
          stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;
  const xStep = (width - pad * 2) / (data.length - 1);

  const points = data.map((v, i) => {
    const x = pad + i * xStep;
    const y = pad + ((max - v) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  const color = positive ? "#4ade80" : "#f87171";
  const pathD = `M ${points.join(" L ")}`;

  // Build fill path (close at bottom)
  const firstPt = points[0].split(",");
  const lastPt  = points[points.length - 1].split(",");
  const fillD   = `M ${firstPt[0]},${height} L ${points.join(" L ")} L ${lastPt[0]},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} overflow="visible">
      <defs>
        <linearGradient id={`sg-${positive ? "up" : "dn"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0}    />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={fillD} fill={`url(#sg-${positive ? "up" : "dn"})`} />
      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.5}
        strokeLinejoin="round" strokeLinecap="round" />
      {/* End dot */}
      <circle
        cx={parseFloat(lastPt[0])}
        cy={parseFloat(lastPt[1])}
        r={2} fill={color}
      />
    </svg>
  );
}

// ── Stock Row ─────────────────────────────────────────────────────────────────
function StockRow({ stock }: { stock: StockDataPoint }) {
  const positive    = stock.changePercent >= 0;
  const pctStr      = `${positive ? "+" : ""}${stock.changePercent.toFixed(2)}%`;
  const priceStr    = stock.price.toLocaleString("en-US", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all group cursor-default"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      {/* Ticker + Name */}
      <div className="w-20 shrink-0">
        <div className="font-mono text-xs font-bold text-white tracking-wider">
          {stock.ticker}
        </div>
        <div
          className="font-sans text-[10px] truncate"
          style={{ color: "rgba(255,255,255,0.4)", maxWidth: "76px" }}
        >
          {stock.name}
        </div>
      </div>

      {/* Sparkline */}
      <div className="flex-1 flex items-center justify-center">
        <Sparkline data={stock.history} positive={positive} />
      </div>

      {/* Price + Change */}
      <div className="w-20 shrink-0 text-right">
        <div className="font-mono text-xs text-white">${priceStr}</div>
        <div
          className="font-mono text-[11px] font-semibold"
          style={{ color: positive ? "#4ade80" : "#f87171" }}
        >
          {pctStr}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Loader ───────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
      <div className="w-20 space-y-1">
        <div className="h-3 w-12 rounded" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
        <div className="h-2 w-16 rounded" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
      </div>
      <div className="flex-1 h-7 rounded" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
      <div className="w-20 space-y-1 text-right">
        <div className="h-3 w-14 rounded ml-auto" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
        <div className="h-3 w-10 rounded ml-auto" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StockMarket() {
  const [query,   setQuery]   = useState("");
  const [input,   setInput]   = useState("");
  const [data,    setData]    = useState<StocksApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchStocks = useCallback(async (q: string) => {
    if (!q.trim()) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current  = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/stocks?query=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      const json: StocksApiResponse = await res.json();

      if (!res.ok || json.error) {
        setError(json.error ?? "Failed to fetch");
        setData(null);
      } else {
        setData(json);
        setError(null);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setError("Network error. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(input);
    fetchStocks(input);
  };

  // Default load on mount
  useEffect(() => {
    fetchStocks("logistics");
  }, [fetchStocks]);

  return (
    <div className="flex flex-col gap-0">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}
          >
            show_chart
          </span>
          <span className="font-mono text-[10px] text-white tracking-widest uppercase">
            Related Stocks
          </span>
        </div>
        <span className="font-mono text-[9px] tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
          5-day change
        </span>
      </div>

      {/* ── Search bar ── */}
      <form onSubmit={handleSubmit} className="px-3 pb-2">
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <span
              className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}
            >
              search
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Apple, Honda, Tesla…"
              className="w-full font-mono text-[11px] text-white placeholder:text-white/20 outline-none"
              style={{
                backgroundColor: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "2px",
                padding: "5px 8px 5px 24px",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#adc6ff";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(173,198,255,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="font-mono text-[10px] tracking-widest uppercase px-3 transition-all active:scale-95 disabled:opacity-40"
            style={{
              backgroundColor: "#adc6ff",
              color: "#002e6a",
              borderRadius: "2px",
              fontWeight: 700,
            }}
          >
            {loading ? (
              <span
                className="material-symbols-outlined animate-spin"
                style={{ fontSize: "12px" }}
              >
                autorenew
              </span>
            ) : (
              "GO"
            )}
          </button>
        </div>
      </form>

      {/* ── Sector label ── */}
      {(data || loading) && (
        <div
          className="mx-3 mb-1 px-2 py-1 flex items-center justify-between"
          style={{
            backgroundColor: "rgba(173,198,255,0.06)",
            borderRadius: "2px",
            border: "1px solid rgba(173,198,255,0.1)",
          }}
        >
          <span className="font-mono text-[9px] text-primary tracking-widest uppercase">
            {loading ? "SCANNING MARKETS…" : data?.label}
          </span>
          {data && !loading && (
            <span
              className="font-mono text-[8px] tracking-widest"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {data.stocks.length} TICKERS
            </span>
          )}
        </div>
      )}

      {/* ── Error state ── */}
      {error && (
        <div
          className="mx-3 mb-2 px-3 py-2 flex items-start gap-2"
          style={{
            backgroundColor: "rgba(255,180,171,0.08)",
            border: "1px solid rgba(255,180,171,0.2)",
            borderRadius: "2px",
          }}
        >
          <span className="material-symbols-outlined text-error shrink-0" style={{ fontSize: "13px" }}>
            warning
          </span>
          <p className="font-mono text-[10px] text-error leading-relaxed">{error}</p>
        </div>
      )}

      {/* ── Column headers ── */}
      {!loading && !error && data && data.stocks.length > 0 && (
        <div
          className="flex items-center gap-3 px-3 py-1"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="w-20 font-mono text-[8px] tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
            TICKER
          </span>
          <span className="flex-1 text-center font-mono text-[8px] tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
            5D TREND
          </span>
          <span className="w-20 text-right font-mono text-[8px] tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
            PRICE / Δ%
          </span>
        </div>
      )}

      {/* ── Stock rows ── */}
      <div className="flex flex-col">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          : data?.stocks.map((stock) => (
              <StockRow key={stock.ticker} stock={stock} />
            ))}
      </div>

      {/* ── Empty state ── */}
      {!loading && !error && !data && (
        <div className="px-3 py-6 flex flex-col items-center gap-2">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "24px", color: "rgba(255,255,255,0.15)" }}
          >
            bar_chart
          </span>
          <p className="font-mono text-[10px] text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
            Search a company to see<br />live competitor stocks
          </p>
        </div>
      )}

      {/* ── Footer: market data attribution ── */}
      <div className="px-3 py-1.5 mt-1">
        <p className="font-mono text-[8px] tracking-widest text-center" style={{ color: "rgba(255,255,255,0.18)" }}>
          DATA: YAHOO FINANCE // {query ? `QUERY: ${query.toUpperCase()}` : "LIVE MARKET"}
        </p>
      </div>
    </div>
  );
}
