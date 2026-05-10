export interface CommodityEntry {
  symbol: string;
  name: string;
}

export const COMMODITY_MAP: Record<string, CommodityEntry[]> = {
  // Mobile / Big Tech
  apple: [
    { symbol: "ALUMINUM", name: "Aluminum" },
    { symbol: "XAU/USD", name: "Gold" },
    { symbol: "XCU/USD", name: "Copper" },
  ],
  samsung: [
    { symbol: "ALUMINUM", name: "Aluminum" },
    { symbol: "XAU/USD", name: "Gold" },
    { symbol: "XCU/USD", name: "Copper" },
  ],

  // Automotive / EV
  tesla: [
    { symbol: "LITHIUM", name: "Lithium" },
    { symbol: "XCU/USD", name: "Copper" },
    { symbol: "ALUMINUM", name: "Aluminum" },
  ],
  ford: [
    { symbol: "ALUMINUM", name: "Aluminum" },
    { symbol: "XPD/USD", name: "Palladium" }, // Converters
    { symbol: "XPT/USD", name: "Platinum" },
  ],
  toyota: [
    { symbol: "ALUMINUM", name: "Aluminum" },
    { symbol: "XPD/USD", name: "Palladium" },
    { symbol: "XPT/USD", name: "Platinum" },
  ],
  honda: [
    { symbol: "ALUMINUM", name: "Aluminum" },
    { symbol: "XPD/USD", name: "Palladium" },
    { symbol: "XPT/USD", name: "Platinum" },
  ],

  // Logistics & Shipping
  fedex: [
    { symbol: "WTIOIL", name: "Crude Oil (WTI)" },
    { symbol: "BRENTOIL", name: "Brent Oil" },
  ],
  ups: [
    { symbol: "WTIOIL", name: "Crude Oil (WTI)" },
    { symbol: "BRENTOIL", name: "Brent Oil" },
  ],
  maersk: [
    { symbol: "BRENTOIL", name: "Brent Oil" },
  ],

  // Default fallback for logistics / general
  default: [
    { symbol: "WTIOIL", name: "Crude Oil (WTI)" },
    { symbol: "BRENTOIL", name: "Brent Oil" },
    { symbol: "NATGAS", name: "Natural Gas" },
  ]
};

export function resolveCommodities(query: string): CommodityEntry[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return COMMODITY_MAP.default;

  for (const key of Object.keys(COMMODITY_MAP)) {
    if (key !== "default" && (key.startsWith(normalized) || normalized.startsWith(key))) {
      return COMMODITY_MAP[key];
    }
  }

  // Fallback to default if no specific raw materials map to this sector
  return COMMODITY_MAP.default;
}
