// ─── Mock Data for Logistics Mission Control ─────────────────────────────────

export const systemStatus = {
  uptime: "99.4%",
  activeDisruptions: 14,
  apiStatus: "ACTIVE",
  networkLoad: "2.1 Gb/s",
  user: "Cmdr_Operator_7",
  timestamp: "2024-10-24 14:22:01 UTC",
};

export const newsItems = [
  {
    id: 1,
    text: "PANAMA CANAL DRAFT RESTRICTIONS TIGHTENED UNTIL Q4.",
    severity: "warning",
  },
  {
    id: 2,
    text: "ROTTERDAM PORT STRIKE THREAT ESCALATES TO LOCKOUT.",
    severity: "neutral",
  },
  {
    id: 3,
    text: "SHANGHAI TERMINAL 4 EXPERIENCING UNPLANNED OUTAGE.",
    severity: "critical",
  },
];

export const financialData = [
  { ticker: "BRENT_CRUDE", value: "$84.22", change: "+1.2%", trend: "up" },
  { ticker: "BALTIC_DRY", value: "1,842", change: "-2.4%", trend: "down" },
  { ticker: "USD_CNY", value: "7.241", change: "STABLE", trend: "flat" },
];

export const weatherData = {
  pressure: "942 hPa",
  label: "Typhoon 'Bolaven' Tracking",
  icon: "cyclone",
};

export const logisticsItems = [
  { id: "VESSEL: EVER_GIVEN_II", status: "TRANSIT", statusColor: "primary" },
  { id: "FLIGHT: CX882", status: "DELAY_2H", statusColor: "tertiary" },
  { id: "TRUCK: RTK-4412", status: "ON_ROUTE", statusColor: "secondary" },
];

export const memoryData = {
  model: "LLaMA_3",
  analysis:
    "Historical analysis suggests high correlation with 2021-Q3 congestion events. 24% probability of EU-Central warehouse overflow within 48 hours.",
};

export const geopoliticsData = {
  riskLevel: "HIGH_RISK",
  stability: { label: "POLITICAL_STABILITY", value: 42 },
  note: "Civil unrest in Region 7 causing trade hub disruptions.",
};

export const commodityPrices = [
  {
    ticker: "LITHIUM_OH",
    value: "$42,100 / T",
    change: "+4.2%",
    trend: "up",
  },
  {
    ticker: "COPPER_CATHODE",
    value: "$8,842 / T",
    change: "-1.8%",
    trend: "down",
  },
  {
    ticker: "POLYMER_ABS",
    value: "$1,350 / T",
    change: "0.0%",
    trend: "flat",
  },
];

export const stockMarket = [
  { ticker: "MAERSK.B", change: "▼ 2.1%", trend: "down" },
  { ticker: "FDX.NYSE", change: "▲ 0.4%", trend: "up" },
  { ticker: "UPS.NYSE", change: "▲ 1.2%", trend: "up" },
  { ticker: "DSV.CO", change: "▼ 0.8%", trend: "down" },
];

export const riskPredictions = [
  { supplier: "SUPPLIER: ACME_TECH", probability: 92, level: "critical" },
  { supplier: "SUPPLIER: VOLT_CORE", probability: 65, level: "warning" },
  { supplier: "SUPPLIER: NEXUS_MFG", probability: 31, level: "low" },
];

export const recommendations = [
  {
    id: "#ERR-9021",
    source: "SUEZ_CANAL_SANDSTORM",
    impact: "$14.2M / DAY",
    ttl: "72.0H",
    action: "REROUTE_AFRICA",
    severity: "critical",
  },
  {
    id: "#ERR-8842",
    source: "CHIP_FABS_HWS_OS",
    impact: "$8.5M / DAY",
    ttl: "168.0H",
    action: "ACTIVATE_STOCKPILE",
    severity: "recommended",
  },
  {
    id: "#ERR-7731",
    source: "PORT_ROTTERDAM_STRIKE",
    impact: "$5.1M / DAY",
    ttl: "96.0H",
    action: "DIVERT_HAMBURG",
    severity: "recommended",
  },
  {
    id: "#ERR-6609",
    source: "BOLAVEN_TYPHOON_PATH",
    impact: "$3.2M / DAY",
    ttl: "48.0H",
    action: "HOLD_VESSEL_MANIFEST",
    severity: "critical",
  },
];

export const coordinates = { lat: "34.0522 N", lng: "118.2437 W" };
