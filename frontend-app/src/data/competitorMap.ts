/**
 * Competitor intelligence map.
 * Maps normalized user query terms → related public stock tickers + display label.
 * Tickers are the "subject" company plus its top market competitors.
 */

export interface CompetitorEntry {
  sector: string;
  label: string;       // Human-readable sector label shown in the UI
  tickers: string[];   // First ticker is typically the queried company itself
}

export const COMPETITOR_MAP: Record<string, CompetitorEntry> = {
  // ── Mobile / Consumer Tech ─────────────────────────────────────────────────
  apple: {
    sector: "Mobile Tech",
    label: "Mobile & Consumer Tech",
    tickers: ["AAPL", "GOOGL", "MSFT", "QCOM", "META", "SSNLF"],
  },
  samsung: {
    sector: "Mobile Tech",
    label: "Mobile & Consumer Tech",
    tickers: ["SSNLF", "AAPL", "GOOGL", "QCOM", "SONY"],
  },
  google: {
    sector: "Big Tech",
    label: "Search & Cloud Platforms",
    tickers: ["GOOGL", "MSFT", "AAPL", "META", "AMZN"],
  },
  alphabet: {
    sector: "Big Tech",
    label: "Search & Cloud Platforms",
    tickers: ["GOOGL", "MSFT", "AAPL", "META", "AMZN"],
  },
  microsoft: {
    sector: "Big Tech",
    label: "Enterprise & Cloud",
    tickers: ["MSFT", "GOOGL", "AAPL", "ORCL", "CRM", "SAP"],
  },
  meta: {
    sector: "Social Media",
    label: "Social & Ad Tech",
    tickers: ["META", "SNAP", "PINS", "GOOGL", "TWTR"],
  },
  nvidia: {
    sector: "Semiconductors",
    label: "AI & GPU Chips",
    tickers: ["NVDA", "AMD", "INTC", "QCOM", "AVGO", "TSM"],
  },
  intel: {
    sector: "Semiconductors",
    label: "Semiconductor Rivals",
    tickers: ["INTC", "AMD", "NVDA", "QCOM", "TSM", "AVGO"],
  },
  amd: {
    sector: "Semiconductors",
    label: "CPU / GPU Chips",
    tickers: ["AMD", "NVDA", "INTC", "QCOM", "AVGO"],
  },

  // ── Automotive ─────────────────────────────────────────────────────────────
  honda: {
    sector: "Automotive",
    label: "Traditional Auto Rivals",
    tickers: ["HMC", "TM", "F", "GM", "STLA", "NSANY"],
  },
  toyota: {
    sector: "Automotive",
    label: "Traditional Auto Rivals",
    tickers: ["TM", "HMC", "F", "GM", "STLA"],
  },
  ford: {
    sector: "Automotive",
    label: "Traditional Auto Rivals",
    tickers: ["F", "GM", "TM", "HMC", "STLA"],
  },
  gm: {
    sector: "Automotive",
    label: "Traditional Auto Rivals",
    tickers: ["GM", "F", "TM", "HMC", "STLA"],
  },
  tesla: {
    sector: "EV",
    label: "Electric Vehicle Market",
    tickers: ["TSLA", "NIO", "LI", "XPEV", "RIVN", "LCID"],
  },
  rivian: {
    sector: "EV",
    label: "Electric Trucks & SUVs",
    tickers: ["RIVN", "TSLA", "LCID", "F", "GM"],
  },
  bmw: {
    sector: "Automotive",
    label: "Luxury Auto Segment",
    tickers: ["BMWYY", "MBGAF", "VWAGY", "TM", "HMC"],
  },

  // ── E-Commerce & Retail ────────────────────────────────────────────────────
  amazon: {
    sector: "E-Commerce",
    label: "E-Commerce & Cloud",
    tickers: ["AMZN", "WMT", "TGT", "SHOP", "BABA", "JD"],
  },
  walmart: {
    sector: "Retail",
    label: "Retail Giants",
    tickers: ["WMT", "TGT", "AMZN", "COST", "KR"],
  },
  shopify: {
    sector: "E-Commerce",
    label: "E-Commerce Platforms",
    tickers: ["SHOP", "AMZN", "WMT", "BABA", "ETSY"],
  },

  // ── Streaming / Entertainment ──────────────────────────────────────────────
  netflix: {
    sector: "Streaming",
    label: "Streaming Wars",
    tickers: ["NFLX", "DIS", "PARA", "WBD", "AMZN", "AAPL"],
  },
  disney: {
    sector: "Entertainment",
    label: "Entertainment & Streaming",
    tickers: ["DIS", "NFLX", "PARA", "WBD", "CMCSA"],
  },

  // ── Logistics & Shipping ───────────────────────────────────────────────────
  fedex: {
    sector: "Logistics",
    label: "Global Logistics",
    tickers: ["FDX", "UPS", "DPSGY", "MAERSK.CO", "ZIM"],
  },
  ups: {
    sector: "Logistics",
    label: "Global Logistics",
    tickers: ["UPS", "FDX", "DPSGY", "XPO", "ZIM"],
  },
  maersk: {
    sector: "Shipping",
    label: "Container Shipping",
    tickers: ["ZIM", "DAC", "MATX", "SBLK", "GOGL"],
  },

  // ── Finance & Banking ──────────────────────────────────────────────────────
  jpmorgan: {
    sector: "Banking",
    label: "Investment Banking",
    tickers: ["JPM", "BAC", "GS", "MS", "C", "WFC"],
  },
  goldman: {
    sector: "Banking",
    label: "Investment Banking",
    tickers: ["GS", "MS", "JPM", "BAC", "C"],
  },
  visa: {
    sector: "Payments",
    label: "Digital Payments",
    tickers: ["V", "MA", "PYPL", "SQ", "AXP"],
  },
  paypal: {
    sector: "Payments",
    label: "Digital Payments",
    tickers: ["PYPL", "SQ", "V", "MA", "AXP"],
  },

  // ── Energy ────────────────────────────────────────────────────────────────
  exxon: {
    sector: "Energy",
    label: "Oil & Gas Majors",
    tickers: ["XOM", "CVX", "BP", "SHEL", "TTE"],
  },
  chevron: {
    sector: "Energy",
    label: "Oil & Gas Majors",
    tickers: ["CVX", "XOM", "BP", "SHEL", "COP"],
  },

  // ── Pharma / Healthcare ────────────────────────────────────────────────────
  pfizer: {
    sector: "Pharma",
    label: "Big Pharma",
    tickers: ["PFE", "MRK", "JNJ", "ABBV", "LLY"],
  },
  moderna: {
    sector: "Biotech",
    label: "Biotech & Vaccines",
    tickers: ["MRNA", "BNTX", "PFE", "NVAX", "GILD"],
  },
};

/**
 * Fuzzy-match a query string against our map keys.
 * Returns the best matching CompetitorEntry, or null if no match.
 */
export function resolveCompetitors(query: string): CompetitorEntry | null {
  const normalized = query.toLowerCase().trim();

  // Direct key match
  if (COMPETITOR_MAP[normalized]) return COMPETITOR_MAP[normalized];

  // Partial match — find first key that starts with or contains the query
  for (const key of Object.keys(COMPETITOR_MAP)) {
    if (key.startsWith(normalized) || normalized.startsWith(key)) {
      return COMPETITOR_MAP[key];
    }
  }

  return null;
}
