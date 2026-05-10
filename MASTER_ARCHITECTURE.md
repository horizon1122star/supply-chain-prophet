# Supply Chain Prophet — Master Architecture & Agent Orchestration Guide

> **READ THIS FIRST.** This file is the single source of truth for the entire system.
> Every agent, every API call, every data shape, every UI component derives from this document.
> When in doubt: check here before writing a single line of code.

---

## 0. Project Identity

| Field | Value |
|---|---|
| Project name | Supply Chain Disruption Prophet |
| Purpose | Predict supply chain disruptions before they happen using a multi-agent AI swarm |
| Demo target | 48-hour hackathon — stability beats completeness |
| Core promise | "We know about it before your supplier calls you" |
| Tech philosophy | Free APIs only · Every agent has a fallback · No demo crashes |

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Next.js)                        │
│                                                                 │
│  [Company Input] [Scenario Select] [Run Scan Button]            │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ VerdictCard  │  │  SeaMap      │  │ StockWidget  │          │
│  │ AgentPanels  │  │  (Leaflet)   │  │ SignalFeed   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         ↑ SSE stream (text/event-stream)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                    GET /scan?company=X&scenario=Y
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND (Python)                      │
│                                                                 │
│  main.py → /scan endpoint → StreamingResponse (SSE)            │
│                                                                 │
│  orchestrator.py                                                │
│  └── asyncio.gather() ← fans out to ALL agents simultaneously  │
│       ├── NewsAgent          (Brave Search API)                 │
│       ├── FinancialAgent     (yfinance + Alpha Vantage)         │
│       ├── WeatherAgent       (Open-Meteo + Marine API)         │
│       ├── LogisticsAgent     (VesselFinder scrape)             │
│       ├── MemoryAgent        (Supabase PostgreSQL + pgvector)   │
│       └── GeopoliticalAgent  (GDELT Project API)               │
│                                                                 │
│  Each agent → shared asyncio.Queue → SSE stream → browser      │
│  After all done → Claude Haiku synthesis → VerdictShape JSON    │
│  If probability > 65% → Claude Haiku email draft → ActionShape  │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴────────────────┐
              │                                │
┌─────────────────────┐          ┌─────────────────────┐
│   SUPABASE           │          │   EXTERNAL APIs      │
│   (PostgreSQL)       │          │                      │
│                      │          │  Brave Search        │
│   disruption_events  │          │  Open-Meteo          │
│   supplier_graph     │          │  Marine-API          │
│   scan_results       │          │  yfinance (Yahoo)    │
│   (pgvector for      │          │  Alpha Vantage       │
│    similarity search)│          │  GDELT Project       │
│                      │          │  VesselFinder        │
│                      │          │  NOAA NHC            │
│                      │          │  Anthropic Claude    │
└─────────────────────┘          └─────────────────────┘
```

---

## 2. Repository Structure

```
supply-chain-prophet/
│
├── .agent/                          ← Agent context files (read before coding)
│   ├── MASTER_ARCHITECTURE.md       ← THIS FILE
│   ├── PROGRESS.md                  ← Live task tracker
│   ├── DATA_CONTRACTS.md            ← All JSON shapes
│   └── FALLBACKS.md                 ← All mock data
│
├── backend/
│   ├── main.py                      ← FastAPI app, /scan SSE endpoint
│   ├── orchestrator.py              ← asyncio fan-out + Claude synthesis
│   ├── fallbacks.py                 ← Mock data for every agent
│   ├── geo_resolver.py              ← Location string → lat/lon
│   ├── models.py                    ← Pydantic schemas
│   ├── db.py                        ← Supabase client + queries
│   ├── requirements.txt
│   └── agents/
│       ├── base.py                  ← BaseAgent class all agents inherit
│       ├── news.py                  ← NewsAgent
│       ├── financial.py             ← FinancialAgent
│       ├── weather.py               ← WeatherAgent
│       ├── logistics.py             ← LogisticsAgent
│       ├── memory.py                ← MemoryAgent
│       └── geopolitical.py          ← GeopoliticalAgent
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 ← Main dashboard
│   │   └── layout.tsx
│   ├── components/
│   │   ├── AgentPanel.tsx           ← Individual agent log panel
│   │   ├── VerdictCard.tsx          ← Risk probability + timeline
│   │   ├── SupplierTable.tsx        ← Flagged + alternative suppliers
│   │   ├── SeaMap.tsx               ← Leaflet map with risk zones
│   │   ├── StockWidget.tsx          ← Sparklines + % changes
│   │   ├── CommodityBars.tsx        ← Commodity price bars
│   │   ├── SignalFeed.tsx           ← Live alert list
│   │   ├── ActionCard.tsx           ← Auto-drafted email
│   │   └── PredictedVsActual.tsx    ← Historical accuracy widget
│   ├── hooks/
│   │   └── useScan.ts               ← SSE connection + state management
│   ├── lib/
│   │   ├── types.ts                 ← All TypeScript interfaces
│   │   └── locationIndex.ts         ← Lat/lon coordinate database
│   └── package.json
│
├── supabase/
│   └── seed.sql                     ← All seed data for demo
│
└── railway.toml                     ← Deployment config
```

---

## 3. Environment Variables

```bash
# backend/.env — copy these exactly, no extra spaces

ANTHROPIC_API_KEY=sk-ant-...         # From console.anthropic.com
BRAVE_API_KEY=BSA...                 # From api.search.brave.com (free tier)
SUPABASE_URL=https://xxx.supabase.co # From supabase.com dashboard
SUPABASE_ANON_KEY=eyJ...             # From supabase.com dashboard
ALPHA_VANTAGE_KEY=...                # From alphavantage.co (free tier, optional)
OWM_KEY=...                          # OpenWeatherMap backup (optional)
```

```typescript
// frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000   # dev
# NEXT_PUBLIC_API_URL=https://your-app.railway.app  # prod
```

---

## 4. Python Requirements

```
# backend/requirements.txt — install with:
# pip install -r requirements.txt --break-system-packages

fastapi==0.111.0
uvicorn[standard]==0.29.0
httpx==0.27.0
anthropic==0.28.0
yfinance==0.2.40
supabase==2.4.6
python-dotenv==1.0.1
pydantic==2.7.1
beautifulsoup4==4.12.3
playwright==1.44.0
```

---

## 5. Data Contracts — Every JSON Shape

> NEVER invent a field not listed here. When you need a new field, add it here first.

### 5.1 AgentEvent (every SSE message is exactly this)

```json
{
  "agent": "news",
  "type": "status | log | result | verdict | action",
  "status": "idle | scanning | live | done | error",
  "log": "▸ Some human-readable log line",
  "data": {}
}
```

### 5.2 Agent result.data payloads

**NewsAgent**
```json
{
  "signals": [
    {
      "title": "TSMC halts fab operations after M7.4 quake",
      "url": "https://...",
      "severity": "high | medium | low",
      "published": "2024-04-03T09:12:00Z",
      "region": "Taiwan",
      "lat": 23.5,
      "lon": 121.0
    }
  ],
  "count": 14,
  "high_count": 3
}
```

**FinancialAgent**
```json
{
  "prices": {
    "TSM":  -6.4,
    "SOX":  -4.2,
    "ZIM":  18.2,
    "BZ=F": 6.1,
    "PALL": 3.4
  },
  "risk_score": 0.72
}
```

**WeatherAgent**
```json
{
  "risky_lanes": ["Taiwan Strait", "Red Sea"],
  "lane_details": {
    "Taiwan Strait": {
      "wind": 72.4,
      "wave": 3.8,
      "rain": 18.0,
      "severity": "critical | elevated | clear",
      "lat": 24.5,
      "lon": 119.5
    }
  },
  "weather_risk_score": 0.6,
  "named_storms": []
}
```

**LogisticsAgent**
```json
{
  "rerouting_count": 43,
  "delayed_ports": [
    {
      "name": "Kaohsiung",
      "delay_days": 6,
      "lat": 22.6,
      "lon": 120.3
    }
  ],
  "affected_lanes": ["Taiwan Strait"],
  "logistics_risk_score": 0.65
}
```

**MemoryAgent**
```json
{
  "matches": [
    {
      "event": "Taiwan earthquake 2021",
      "similarity": 0.87,
      "outcome": "6-week semiconductor shortage, avg cost $1.8M",
      "signal_lead_days": 14,
      "id": "uuid"
    }
  ],
  "suppliers": [
    {
      "name": "TSMC",
      "location": "Taiwan",
      "category": "Semiconductors",
      "criticality": "critical",
      "lat": 24.76,
      "lon": 120.99
    }
  ]
}
```

**GeopoliticalAgent**
```json
{
  "events": [
    {
      "type": "conflict | sanction | protest | closure",
      "region": "Taiwan",
      "description": "Cross-strait tensions elevated following military exercises",
      "gdelt_tone": -3.2,
      "lat": 23.5,
      "lon": 121.0
    }
  ],
  "signal_strength": "high | medium | low",
  "geo_risk_score": 0.4
}
```

### 5.3 VerdictShape (orchestrator final output)

```json
{
  "probability": 72,
  "timeline": "18-24 days",
  "risk_level": "high | medium | low",
  "primary_risk": "TSMC fab suspension threatens Apple semiconductor supply",
  "affected_suppliers": [
    {
      "name": "TSMC",
      "location": "Taiwan",
      "category": "Semiconductors",
      "status": "critical | elevated | monitor",
      "lat": 24.76,
      "lon": 120.99
    }
  ],
  "alternative_suppliers": [
    {
      "name": "Samsung Foundry",
      "location": "South Korea",
      "category": "Semiconductors",
      "lat": 37.56,
      "lon": 126.97
    }
  ],
  "actions": [
    "Contact Samsung Foundry within 72 hours — lock capacity before competitors react",
    "Increase NAND flash safety stock by 8-10 weeks given Kaohsiung delay signal",
    "Monitor SOX index — escalate to critical protocol if drops further 3%"
  ],
  "cost_estimates": {
    "disruption_cost": 2100000,
    "mitigation_cost": 340000
  },
  "signal_breakdown": {
    "news": 0.8,
    "financial": 0.72,
    "weather": 0.6,
    "logistics": 0.65,
    "memory": 0.87,
    "geopolitical": 0.4
  }
}
```

### 5.4 ActionShape (auto email draft)

```json
{
  "type": "email_draft",
  "to": "Samsung Foundry — procurement@samsung.com",
  "subject": "Urgent capacity inquiry — semiconductor supply contingency",
  "body": "Dear Samsung Foundry team,\n\nGiven current disruption signals in Taiwan, we are proactively seeking to secure alternative semiconductor capacity...\n\n[Full draft here]"
}
```

---

## 6. Backend Implementation

### 6.1 main.py

```python
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio, json
from orchestrator import run_scan

app = FastAPI(title="Supply Chain Prophet API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/scan")
async def scan(
    company: str = Query(..., description="Company name to scan"),
    scenario: str = Query("", description="Scenario preset")
):
    async def event_stream():
        try:
            async for event in run_scan(company, scenario):
                yield f"data: {json.dumps(event)}\n\n"
                await asyncio.sleep(0)
        except Exception as e:
            yield f"data: {json.dumps({'type':'error','log':str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 6.2 agents/base.py

```python
from abc import ABC, abstractmethod
from typing import AsyncGenerator, Optional
import asyncio

class BaseAgent(ABC):
    name: str = "base"

    async def run(
        self, company: str, scenario: str
    ) -> AsyncGenerator[dict, None]:
        yield self._event("status", "scanning",
                          log=f"▸ {self.name.title()} agent starting...")
        try:
            async for event in self._execute(company, scenario):
                yield event
        except Exception as e:
            yield self._event("status", "error",
                              log=f"▸ API limit hit — using cached data")
            async for event in self._fallback(company, scenario):
                yield event

    @abstractmethod
    async def _execute(
        self, company: str, scenario: str
    ) -> AsyncGenerator[dict, None]:
        pass

    @abstractmethod
    async def _fallback(
        self, company: str, scenario: str
    ) -> AsyncGenerator[dict, None]:
        pass

    def _event(
        self,
        type: str,
        status: str,
        log: str = "",
        data: Optional[dict] = None
    ) -> dict:
        return {
            "agent": self.name,
            "type": type,
            "status": status,
            "log": log,
            "data": data or {},
        }
```

### 6.3 agents/news.py

```python
import httpx, os, asyncio
from agents.base import BaseAgent
from geo_resolver import resolve_location
from fallbacks import NEWS_FALLBACK

RISK_KEYWORDS = [
    "earthquake","flood","typhoon","hurricane","strike","halt","shutdown",
    "shortage","disruption","closure","conflict","sanction","explosion",
    "accident","delay","blockage","fire","drought","shortage"
]

class NewsAgent(BaseAgent):
    name = "news"

    async def _execute(self, company: str, scenario: str):
        yield self._event("status", "scanning",
                          log="▸ Searching global news feeds...")

        query = f"{company} supply chain {scenario} disruption risk 2024 2025"
        signals = []

        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.search.brave.com/res/v1/news/search",
                headers={
                    "Accept": "application/json",
                    "X-Subscription-Token": os.getenv("BRAVE_API_KEY", "")
                },
                params={"q": query, "count": 15, "freshness": "pw"},
                timeout=12
            )
            articles = resp.json().get("results", [])

        for article in articles[:8]:
            title = article.get("title", "")
            title_lower = title.lower()
            severity = "low"
            if any(k in title_lower for k in RISK_KEYWORDS[:8]):
                severity = "high"
            elif any(k in title_lower for k in RISK_KEYWORDS[8:]):
                severity = "medium"

            region = extract_region(title)
            coords = resolve_location(region)

            signals.append({
                "title": title,
                "url": article.get("url", ""),
                "severity": severity,
                "published": article.get("age", ""),
                "region": region,
                "lat": coords[0] if coords else None,
                "lon": coords[1] if coords else None,
            })

            icon = "⚠" if severity == "high" else "▸"
            yield self._event("log", "live",
                              log=f"{icon} {title[:55]}...")
            await asyncio.sleep(0.3)

        high_count = len([s for s in signals if s["severity"] == "high"])
        yield self._event(
            "result", "done",
            log=f"▸ {len(articles)} articles · {high_count} high-severity signals",
            data={
                "signals": signals,
                "count": len(articles),
                "high_count": high_count
            }
        )

    async def _fallback(self, company: str, scenario: str):
        from fallbacks import NEWS_FALLBACK
        data = NEWS_FALLBACK.get(scenario, NEWS_FALLBACK["default"])
        for line in data["logs"]:
            yield self._event("log", "live", log=line)
            await asyncio.sleep(0.35)
        yield self._event("result", "done",
                          log="▸ 14 articles · 3 high-severity (cached)",
                          data=data["result"])

def extract_region(text: str) -> str:
    regions = [
        "Taiwan","China","Japan","South Korea","Vietnam","India",
        "Red Sea","Suez","Rotterdam","Singapore","Ukraine","Russia",
        "Middle East","Europe","Southeast Asia","United States"
    ]
    for r in regions:
        if r.lower() in text.lower():
            return r
    return "Global"
```

### 6.4 agents/financial.py

```python
import yfinance as yf
import asyncio, os
from agents.base import BaseAgent

SUPPLY_CHAIN_TICKERS = {
    "semiconductors": ["TSM", "SMH", "NVDA", "INTC", "AMD"],
    "shipping":       ["ZIM", "MATX", "SBLK", "DAC"],
    "oil":            ["BZ=F", "USO", "XOM"],
    "metals":         ["PALL", "CPER", "GC=F"],
    "retail":         ["WMT", "AMZN", "TGT"],
}

class FinancialAgent(BaseAgent):
    name = "financial"

    async def _execute(self, company: str, scenario: str):
        yield self._event("status", "scanning",
                          log="▸ Fetching market signals...")

        loop = asyncio.get_event_loop()
        prices = {}
        risk_score = 0.0

        for category, tickers in SUPPLY_CHAIN_TICKERS.items():
            for ticker in tickers[:2]:
                try:
                    data = await loop.run_in_executor(
                        None,
                        lambda t=ticker: yf.Ticker(t).history(period="5d")
                    )
                    if data.empty:
                        continue
                    pct = ((data["Close"].iloc[-1] - data["Close"].iloc[0])
                           / data["Close"].iloc[0] * 100)
                    prices[ticker] = round(float(pct), 2)

                    sign = "+" if pct > 0 else ""
                    icon = "⚠" if abs(pct) > 4 else "▸"
                    yield self._event("log", "live",
                                      log=f"{icon} {ticker}: {sign}{pct:.1f}% (5d)")
                    await asyncio.sleep(0.2)

                    if category == "semiconductors" and pct < -3:
                        risk_score += 0.25
                    elif category == "shipping" and pct > 5:
                        risk_score += 0.2
                    elif category == "oil" and pct > 4:
                        risk_score += 0.15

                except Exception:
                    continue

        risk_score = min(risk_score, 1.0)
        yield self._event(
            "result", "done",
            log=f"▸ {len(prices)} tickers scanned · risk score {risk_score:.2f}",
            data={"prices": prices, "risk_score": round(risk_score, 2)}
        )

    async def _fallback(self, company: str, scenario: str):
        from fallbacks import FINANCIAL_FALLBACK
        data = FINANCIAL_FALLBACK.get(scenario, FINANCIAL_FALLBACK["default"])
        for line in data["logs"]:
            yield self._event("log", "live", log=line)
            await asyncio.sleep(0.3)
        yield self._event("result", "done",
                          log="▸ Markets scanned (cached)",
                          data=data["result"])
```

### 6.5 agents/weather.py

```python
import httpx, asyncio
from agents.base import BaseAgent

SHIPPING_LANES = {
    "Taiwan Strait":       (24.5,  119.5),
    "Red Sea":             (12.5,   43.3),
    "Strait of Malacca":   (2.5,  102.0),
    "Suez Canal":          (30.5,   32.3),
    "South China Sea":     (15.0,  114.0),
    "Cape of Good Hope":   (-34.3,  18.5),
    "Strait of Hormuz":    (26.5,   56.3),
}

def severity(wind: float, wave: float, rain: float) -> str:
    if wind > 60 or wave > 4.0:
        return "critical"
    if wind > 40 or wave > 2.5 or rain > 50:
        return "elevated"
    return "clear"

class WeatherAgent(BaseAgent):
    name = "weather"

    async def _execute(self, company: str, scenario: str):
        yield self._event("status", "scanning",
                          log="▸ Checking 7 shipping lane conditions...")

        risky_lanes = []
        lane_details = {}
        weather_risk_score = 0.0
        named_storms = await self._check_noaa_storms()

        async with httpx.AsyncClient(timeout=10) as client:
            for lane, (lat, lon) in SHIPPING_LANES.items():
                try:
                    wx, mx = await asyncio.gather(
                        client.get(
                            "https://api.open-meteo.com/v1/forecast",
                            params={
                                "latitude": lat, "longitude": lon,
                                "daily": "windspeed_10m_max,precipitation_sum",
                                "forecast_days": 7, "timezone": "UTC"
                            }
                        ),
                        client.get(
                            "https://marine-api.open-meteo.com/v1/marine",
                            params={
                                "latitude": lat, "longitude": lon,
                                "daily": "wave_height_max",
                                "forecast_days": 7, "timezone": "UTC"
                            }
                        ),
                        return_exceptions=True
                    )

                    wx_data = wx.json()["daily"] if not isinstance(wx, Exception) else {}
                    mx_data = mx.json().get("daily", {}) if not isinstance(mx, Exception) else {}

                    wind = max(wx_data.get("windspeed_10m_max", [0]))
                    rain = max(wx_data.get("precipitation_sum", [0]))
                    wave = max(mx_data.get("wave_height_max", [0]))
                    sev  = severity(wind, wave, rain)

                    lane_details[lane] = {
                        "wind": round(wind, 1), "wave": round(wave, 1),
                        "rain": round(rain, 1), "severity": sev,
                        "lat": lat, "lon": lon
                    }

                    if sev == "critical":
                        risky_lanes.append(lane)
                        weather_risk_score += 0.4
                    elif sev == "elevated":
                        risky_lanes.append(lane)
                        weather_risk_score += 0.2

                    icon = "⚠" if sev != "clear" else "▸"
                    yield self._event("log", "live",
                        log=f"{icon} {lane}: {wind:.0f}km/h · {wave:.1f}m swell · {sev}")
                    await asyncio.sleep(0.25)

                except Exception:
                    yield self._event("log", "live",
                                      log=f"▸ {lane}: data unavailable")

        if named_storms:
            weather_risk_score = min(weather_risk_score + 0.4, 1.0)
            for storm in named_storms:
                yield self._event("log", "live",
                    log=f"⚠ Named storm: {storm['name']} ({storm['category']})")

        weather_risk_score = min(weather_risk_score, 1.0)
        yield self._event(
            "result", "done",
            log=f"▸ {len(risky_lanes)} lanes at risk · score {weather_risk_score:.2f}",
            data={
                "risky_lanes": risky_lanes,
                "lane_details": lane_details,
                "weather_risk_score": round(weather_risk_score, 2),
                "named_storms": named_storms
            }
        )

    async def _check_noaa_storms(self) -> list:
        try:
            async with httpx.AsyncClient(timeout=6) as client:
                resp = await client.get(
                    "https://www.nhc.noaa.gov/CurrentStorms.json"
                )
                storms = resp.json().get("activeStorms", [])
                return [
                    {"name": s.get("name","Unknown"),
                     "category": s.get("intensity","Unknown"),
                     "lat": s.get("lat", 0),
                     "lon": s.get("lon", 0)}
                    for s in storms
                ]
        except Exception:
            return []

    async def _fallback(self, company: str, scenario: str):
        from fallbacks import WEATHER_FALLBACK
        data = WEATHER_FALLBACK.get(scenario, WEATHER_FALLBACK["default"])
        for line in data["logs"]:
            yield self._event("log", "live", log=line)
            await asyncio.sleep(0.3)
        yield self._event("result", "done",
                          log="▸ Weather checked (cached)",
                          data=data["result"])
```

### 6.6 agents/logistics.py

```python
import httpx, asyncio
from bs4 import BeautifulSoup
from agents.base import BaseAgent

VESSEL_WATCH_URLS = {
    "Taiwan Strait": "https://www.marinetraffic.com/en/ais/index/ships/all",
}

PORT_COORDS = {
    "Kaohsiung":  (22.6,  120.3),
    "Shanghai":   (31.2,  121.5),
    "Singapore":  (1.35,  103.8),
    "Rotterdam":  (51.9,    4.5),
    "Dubai":      (25.2,   55.3),
    "Colombo":    (6.93,   79.84),
    "Jeddah":     (21.5,   39.2),
}

class LogisticsAgent(BaseAgent):
    name = "logistics"

    async def _execute(self, company: str, scenario: str):
        yield self._event("status", "scanning",
                          log="▸ Monitoring vessel positions + port status...")

        rerouting_count = 0
        delayed_ports   = []
        affected_lanes  = []

        # Derive which ports/lanes matter from scenario
        scenario_lower = scenario.lower()
        if "taiwan" in scenario_lower:
            target_ports  = ["Kaohsiung", "Shanghai"]
            target_lanes  = ["Taiwan Strait"]
        elif "red sea" in scenario_lower:
            target_ports  = ["Jeddah", "Dubai"]
            target_lanes  = ["Red Sea", "Suez Canal"]
        elif "rotterdam" in scenario_lower or "strike" in scenario_lower:
            target_ports  = ["Rotterdam"]
            target_lanes  = ["Cape of Good Hope"]
        else:
            target_ports  = list(PORT_COORDS.keys())[:3]
            target_lanes  = ["Strait of Malacca", "Taiwan Strait"]

        yield self._event("log", "live",
                          log=f"▸ Monitoring {len(target_ports)} ports, "
                              f"{len(target_lanes)} lanes")
        await asyncio.sleep(0.3)

        # GDELT logistics query as a proxy for shipping disruption news
        async with httpx.AsyncClient(timeout=10) as client:
            try:
                resp = await client.get(
                    "https://api.gdeltproject.org/api/v2/doc/doc",
                    params={
                        "query": f"shipping port delay {scenario}",
                        "mode":   "artlist",
                        "maxrecords": 10,
                        "format": "json"
                    }
                )
                articles = resp.json().get("articles", [])
                rerouting_count = min(len(articles) * 4, 60)
            except Exception:
                rerouting_count = 43

        yield self._event("log", "live",
                          log=f"▸ ~{rerouting_count} vessels rerouting detected")
        await asyncio.sleep(0.3)

        for port in target_ports:
            coords = PORT_COORDS.get(port)
            if not coords:
                continue
            # Simulate delay based on scenario severity
            delay = 0
            if "taiwan" in scenario_lower and port == "Kaohsiung":
                delay = 6
            elif "red sea" in scenario_lower and port in ["Jeddah","Dubai"]:
                delay = 4
            elif "rotterdam" in scenario_lower and port == "Rotterdam":
                delay = 8

            if delay > 0:
                delayed_ports.append({
                    "name": port,
                    "delay_days": delay,
                    "lat": coords[0],
                    "lon": coords[1]
                })
                yield self._event("log", "live",
                    log=f"⚠ {port} port: +{delay} day delay estimate")
            else:
                yield self._event("log", "live",
                    log=f"▸ {port} port: normal operations")
            await asyncio.sleep(0.25)

        affected_lanes = target_lanes
        logistics_risk = (rerouting_count / 100) * 0.5 + (len(delayed_ports) * 0.15)
        logistics_risk = min(logistics_risk, 1.0)

        yield self._event(
            "result", "done",
            log=f"▸ {len(delayed_ports)} ports delayed · "
                f"{rerouting_count} vessels rerouting",
            data={
                "rerouting_count": rerouting_count,
                "delayed_ports":   delayed_ports,
                "affected_lanes":  affected_lanes,
                "logistics_risk_score": round(logistics_risk, 2)
            }
        )

    async def _fallback(self, company: str, scenario: str):
        from fallbacks import LOGISTICS_FALLBACK
        data = LOGISTICS_FALLBACK.get(scenario, LOGISTICS_FALLBACK["default"])
        for line in data["logs"]:
            yield self._event("log", "live", log=line)
            await asyncio.sleep(0.3)
        yield self._event("result", "done",
                          log="▸ Logistics checked (cached)",
                          data=data["result"])
```

### 6.7 agents/memory.py

```python
import asyncio, os
from agents.base import BaseAgent
from db import get_suppliers_for_company, get_similar_events

class MemoryAgent(BaseAgent):
    name = "memory"

    async def _execute(self, company: str, scenario: str):
        yield self._event("status", "scanning",
                          log="▸ Searching supplier knowledge graph...")

        loop = asyncio.get_event_loop()

        # 1. Pull supplier graph for this company
        suppliers = await loop.run_in_executor(
            None, get_suppliers_for_company, company
        )

        if not suppliers:
            yield self._event("log", "live",
                              log=f"▸ No graph entry for {company} — using inference")
            suppliers = infer_suppliers(company)

        for s in suppliers[:4]:
            yield self._event("log", "live",
                log=f"▸ Supplier: {s['name']} ({s['location']} · {s['category']})")
            await asyncio.sleep(0.2)

        # 2. Search for similar historical disruption events
        matches = await loop.run_in_executor(
            None, get_similar_events, scenario, 3
        )

        for m in matches:
            yield self._event("log", "live",
                log=f"▸ Historical match: {m['event']} "
                    f"(similarity {m['similarity']:.0%})")
            await asyncio.sleep(0.2)

        yield self._event(
            "result", "done",
            log=f"▸ {len(suppliers)} suppliers · {len(matches)} historical matches",
            data={"suppliers": suppliers, "matches": matches}
        )

    async def _fallback(self, company: str, scenario: str):
        from fallbacks import MEMORY_FALLBACK, SUPPLIER_MAP
        suppliers = SUPPLIER_MAP.get(
            company, SUPPLIER_MAP.get("Apple Inc.", [])
        )
        for s in suppliers[:3]:
            yield self._event("log", "live",
                log=f"▸ Supplier: {s['name']} ({s['location']})")
            await asyncio.sleep(0.2)

        data = MEMORY_FALLBACK.get(scenario, MEMORY_FALLBACK["default"])
        for line in data["logs"]:
            yield self._event("log", "live", log=line)
            await asyncio.sleep(0.3)
        yield self._event("result", "done",
                          log="▸ Memory checked (cached)",
                          data={**data["result"], "suppliers": suppliers})

def infer_suppliers(company: str) -> list:
    """Inference when company not in DB — use well-known public data."""
    inference_map = {
        "apple":     [{"name":"TSMC","location":"Taiwan","category":"Semiconductors","criticality":"critical","lat":24.76,"lon":120.99},
                      {"name":"Foxconn","location":"Taiwan","category":"Assembly","criticality":"critical","lat":22.6,"lon":120.3},
                      {"name":"Murata","location":"Japan","category":"Components","criticality":"important","lat":35.68,"lon":139.69}],
        "ford":      [{"name":"Bosch","location":"Germany","category":"Electronics","criticality":"critical","lat":48.78,"lon":9.18},
                      {"name":"BASF","location":"Germany","category":"Materials","criticality":"important","lat":49.48,"lon":8.47}],
        "starbucks": [{"name":"Vietnam farms","location":"Vietnam","category":"Coffee","criticality":"critical","lat":14.0,"lon":108.0},
                      {"name":"Brazil farms","location":"Brazil","category":"Coffee","criticality":"critical","lat":-14.23,"lon":-51.93}],
    }
    key = company.lower().split()[0]
    return inference_map.get(key, [
        {"name":"Unknown Supplier 1","location":"Asia","category":"Manufacturing","criticality":"monitor","lat":0,"lon":0}
    ])
```

### 6.8 agents/geopolitical.py

```python
import httpx, asyncio
from agents.base import BaseAgent

class GeopoliticalAgent(BaseAgent):
    name = "geopolitical"

    async def _execute(self, company: str, scenario: str):
        yield self._event("status", "scanning",
                          log="▸ Scanning GDELT geopolitical feed...")

        events       = []
        geo_risk_score = 0.0

        async with httpx.AsyncClient(timeout=10) as client:
            try:
                resp = await client.get(
                    "https://api.gdeltproject.org/api/v2/doc/doc",
                    params={
                        "query": f"{scenario} sanctions conflict supply chain trade",
                        "mode":  "artlist",
                        "maxrecords": 10,
                        "sourcelang": "english",
                        "format": "json"
                    }
                )
                articles = resp.json().get("articles", [])

                for art in articles[:5]:
                    tone = float(art.get("tone", 0))
                    geo_risk_score += max(0, -tone / 20)

                    events.append({
                        "type":        classify_event(art.get("title","")),
                        "region":      extract_geo_region(art.get("title","")),
                        "description": art.get("title","")[:80],
                        "gdelt_tone":  round(tone, 2),
                        "lat":         None,
                        "lon":         None,
                    })

                    icon = "⚠" if tone < -3 else "▸"
                    yield self._event("log", "live",
                        log=f"{icon} {art.get('title','')[:50]}... (tone {tone:.1f})")
                    await asyncio.sleep(0.3)

            except Exception as e:
                yield self._event("log", "live",
                                  log="▸ GDELT query complete (cached fallback)")
                async for ev in self._fallback(company, scenario):
                    yield ev
                return

        signal = "high" if geo_risk_score > 0.5 else "medium" if geo_risk_score > 0.2 else "low"
        geo_risk_score = min(geo_risk_score, 1.0)

        yield self._event(
            "result", "done",
            log=f"▸ {len(events)} geopolitical signals · strength: {signal}",
            data={
                "events": events,
                "signal_strength": signal,
                "geo_risk_score":  round(geo_risk_score, 2)
            }
        )

    async def _fallback(self, company: str, scenario: str):
        from fallbacks import GEO_FALLBACK
        data = GEO_FALLBACK.get(scenario, GEO_FALLBACK["default"])
        for line in data["logs"]:
            yield self._event("log", "live", log=line)
            await asyncio.sleep(0.3)
        yield self._event("result", "done",
                          log="▸ Geopolitical scan complete (cached)",
                          data=data["result"])

def classify_event(title: str) -> str:
    t = title.lower()
    if any(k in t for k in ["sanction","ban","restrict"]): return "sanction"
    if any(k in t for k in ["conflict","war","attack","strike"]): return "conflict"
    if any(k in t for k in ["protest","riot","unrest"]): return "protest"
    if any(k in t for k in ["close","closure","block","halt"]): return "closure"
    return "geopolitical"

def extract_geo_region(title: str) -> str:
    regions = ["Taiwan","China","Russia","Ukraine","Iran","Israel",
               "North Korea","Middle East","Europe","Asia"]
    for r in regions:
        if r.lower() in title.lower():
            return r
    return "Global"
```

### 6.9 orchestrator.py

```python
import asyncio, json
from typing import AsyncGenerator
from anthropic import AsyncAnthropic
from agents.news import NewsAgent
from agents.financial import FinancialAgent
from agents.weather import WeatherAgent
from agents.logistics import LogisticsAgent
from agents.memory import MemoryAgent
from agents.geopolitical import GeopoliticalAgent
from fallbacks import FALLBACK_VERDICT, FALLBACK_EMAIL

client  = AsyncAnthropic()
AGENTS  = [
    NewsAgent(), FinancialAgent(), WeatherAgent(),
    LogisticsAgent(), MemoryAgent(), GeopoliticalAgent()
]

async def run_scan(company: str, scenario: str) -> AsyncGenerator[dict, None]:
    queue         = asyncio.Queue()
    agent_results = {}
    done_count    = 0

    async def run_agent(agent):
        async for event in agent.run(company, scenario):
            await queue.put(event)
            if event["type"] == "result":
                agent_results[agent.name] = event["data"]
        await queue.put({"agent": agent.name, "type": "_done_"})

    # Fan-out: all agents start simultaneously
    tasks = [asyncio.create_task(run_agent(a)) for a in AGENTS]

    # Fan-in: drain queue and yield to SSE immediately
    while done_count < len(AGENTS):
        event = await queue.get()
        if event["type"] == "_done_":
            done_count += 1
        else:
            yield event

    await asyncio.gather(*tasks)

    # Synthesis phase
    yield {
        "agent": "orchestrator",
        "type": "status",
        "status": "thinking",
        "log": "▸ Synthesizing all signals with Claude...",
        "data": {}
    }

    verdict = await synthesize(company, scenario, agent_results)
    yield {
        "agent": "orchestrator",
        "type": "verdict",
        "status": "done",
        "log": f"▸ Verdict: {verdict['probability']}% disruption probability",
        "data": verdict
    }

    # Auto-action: draft email if high risk
    if verdict.get("probability", 0) > 65:
        yield {
            "agent": "orchestrator",
            "type": "status",
            "status": "acting",
            "log": "▸ Drafting supplier outreach email...",
            "data": {}
        }
        email = await draft_email(company, verdict)
        yield {
            "agent": "orchestrator",
            "type": "action",
            "status": "done",
            "log": "▸ Action taken: supplier email drafted",
            "data": email
        }


async def synthesize(company: str, scenario: str, agent_data: dict) -> dict:
    prompt = f"""You are a supply chain risk intelligence system.

Company under analysis: {company}
Scenario: {scenario}

Agent findings:
- NEWS: {json.dumps(agent_data.get('news', {}))}
- FINANCIAL: {json.dumps(agent_data.get('financial', {}))}
- WEATHER: {json.dumps(agent_data.get('weather', {}))}
- LOGISTICS: {json.dumps(agent_data.get('logistics', {}))}
- MEMORY (suppliers + history): {json.dumps(agent_data.get('memory', {}))}
- GEOPOLITICAL: {json.dumps(agent_data.get('geopolitical', {}))}

Based on ALL signals above, produce a supply chain risk verdict.

Return ONLY valid JSON — no markdown fences, no preamble, no explanation.
Use EXACTLY this structure:
{{
  "probability": <integer 0-100>,
  "timeline": "<e.g. 18-24 days>",
  "risk_level": "<high|medium|low>",
  "primary_risk": "<one sentence describing the main threat>",
  "affected_suppliers": [
    {{"name":"...","location":"...","category":"...","status":"critical|elevated|monitor","lat":0.0,"lon":0.0}}
  ],
  "alternative_suppliers": [
    {{"name":"...","location":"...","category":"...","lat":0.0,"lon":0.0}}
  ],
  "actions": ["...","...","..."],
  "cost_estimates": {{
    "disruption_cost": <integer USD>,
    "mitigation_cost": <integer USD>
  }},
  "signal_breakdown": {{
    "news": <0.0-1.0>,
    "financial": <0.0-1.0>,
    "weather": <0.0-1.0>,
    "logistics": <0.0-1.0>,
    "memory": <0.0-1.0>,
    "geopolitical": <0.0-1.0>
  }}
}}"""

    try:
        msg = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        text = msg.content[0].text.strip()
        text = text.replace("```json","").replace("```","").strip()
        return json.loads(text)
    except Exception:
        return FALLBACK_VERDICT


async def draft_email(company: str, verdict: dict) -> dict:
    alt = verdict.get("alternative_suppliers", [{}])
    alt_name = alt[0].get("name", "alternative supplier") if alt else "alternative supplier"

    prompt = f"""Draft a professional procurement email from {company}'s supply chain team
to {alt_name} requesting urgent capacity availability.

Context: {verdict.get('primary_risk','')}
Timeline: {verdict.get('timeline','')}
Risk level: {verdict.get('risk_level','')}

Write a concise, professional email. Subject line + body. No markdown."""

    try:
        msg = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}]
        )
        lines = msg.content[0].text.strip().split("\n")
        subject = lines[0].replace("Subject:","").strip() if lines else "Urgent capacity inquiry"
        body    = "\n".join(lines[2:]) if len(lines) > 2 else msg.content[0].text

        return {
            "type":    "email_draft",
            "to":      f"{alt_name} — procurement",
            "subject": subject,
            "body":    body
        }
    except Exception:
        return FALLBACK_EMAIL
```

### 6.10 geo_resolver.py

```python
LOCATION_INDEX = {
    "taiwan strait":        (24.5,   119.5),
    "taiwan":               (23.5,   121.0),
    "hualien":              (23.97,  121.6),
    "kaohsiung":            (22.6,   120.3),
    "taipei":               (25.04,  121.56),
    "red sea":              (20.0,    38.5),
    "suez":                 (30.0,    32.5),
    "suez canal":           (30.5,    32.3),
    "bab-el-mandeb":        (12.5,    43.3),
    "strait of malacca":    (2.5,    102.0),
    "malacca":              (2.5,    102.0),
    "singapore":            (1.35,   103.8),
    "vietnam":              (14.0,   108.0),
    "ho chi minh":          (10.82,  106.63),
    "rotterdam":            (51.9,     4.5),
    "shanghai":             (31.2,   121.5),
    "yokohama":             (35.4,   139.6),
    "south korea":          (37.56,  126.97),
    "korea":                (37.56,  126.97),
    "japan":                (35.68,  139.69),
    "china":                (35.86,  104.19),
    "india":                (20.59,   78.96),
    "ukraine":              (48.38,   31.16),
    "russia":               (61.52,   105.31),
    "middle east":          (29.31,   42.46),
    "strait of hormuz":     (26.5,    56.3),
    "hormuz":               (26.5,    56.3),
    "cape of good hope":    (-34.3,   18.5),
    "south china sea":      (15.0,   114.0),
    "global":               (0.0,      0.0),
}

def resolve_location(text: str) -> tuple | None:
    if not text:
        return None
    t = text.lower().strip()
    if t in LOCATION_INDEX:
        return LOCATION_INDEX[t]
    for key, coords in LOCATION_INDEX.items():
        if key in t or t in key:
            return coords
    return None
```

### 6.11 db.py

```python
import os
from supabase import create_client, Client

_client: Client | None = None

def get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(
            os.getenv("SUPABASE_URL", ""),
            os.getenv("SUPABASE_ANON_KEY", "")
        )
    return _client

def get_suppliers_for_company(company: str) -> list:
    try:
        resp = (
            get_client()
            .table("supplier_graph")
            .select("*")
            .ilike("company", f"%{company.split()[0]}%")
            .execute()
        )
        return resp.data or []
    except Exception:
        return []

def get_similar_events(scenario: str, limit: int = 3) -> list:
    try:
        resp = (
            get_client()
            .table("disruption_events")
            .select("*")
            .ilike("type", f"%{scenario.split()[0].lower()}%")
            .limit(limit)
            .execute()
        )
        rows = resp.data or []
        return [
            {
                "event":            r.get("description", ""),
                "similarity":       0.85,
                "outcome":          r.get("outcome", ""),
                "signal_lead_days": r.get("signal_lead_days", 0),
                "id":               r.get("id", "")
            }
            for r in rows
        ]
    except Exception:
        return []
```

### 6.12 fallbacks.py

```python
# ── NEWS ────────────────────────────────────────────────────────────────────
NEWS_FALLBACK = {
    "Taiwan earthquake": {
        "logs": [
            "⚠ M7.4 earthquake near Hualien, Taiwan",
            "⚠ TSMC confirms suspension at 2 fabs",
            "▸ Foxconn structural inspection underway",
            "▸ 14 articles indexed · 3 high-severity signals",
        ],
        "result": {
            "signals": [
                {"title":"TSMC fab suspension","url":"","severity":"high",
                 "region":"Taiwan","lat":24.76,"lon":120.99}
            ],
            "count": 14, "high_count": 3
        }
    },
    "Red Sea tensions": {
        "logs": [
            "⚠ Houthi drone strike near Bab-el-Mandeb",
            "⚠ Lloyd's war risk premium elevated",
            "▸ 43 vessels rerouting via Cape of Good Hope",
            "▸ 11 articles indexed · 4 high-severity signals",
        ],
        "result": {
            "signals": [
                {"title":"Red Sea vessel rerouting","url":"","severity":"high",
                 "region":"Red Sea","lat":12.5,"lon":43.3}
            ],
            "count": 11, "high_count": 4
        }
    },
    "Vietnam drought": {
        "logs": [
            "⚠ Central Highlands rainfall 60% below average",
            "⚠ Robusta coffee harvest forecast cut 20%",
            "▸ Vietnam agriculture ministry declares emergency",
        ],
        "result": {
            "signals": [
                {"title":"Vietnam drought harvest cut","url":"","severity":"high",
                 "region":"Vietnam","lat":14.0,"lon":108.0}
            ],
            "count": 8, "high_count": 2
        }
    },
    "default": {
        "logs": [
            "▸ Scanning global news feeds...",
            "▸ 12 articles indexed · 2 signals found",
        ],
        "result": {"signals":[],"count":12,"high_count":2}
    }
}

# ── FINANCIAL ───────────────────────────────────────────────────────────────
FINANCIAL_FALLBACK = {
    "Taiwan earthquake": {
        "logs": [
            "⚠ TSM: –6.4% (5d)",
            "⚠ SOX index: –4.2% (5d)",
            "▸ ZIM shipping: +18.2% (5d)",
            "▸ NVDA: –3.8% (5d)",
        ],
        "result": {
            "prices": {"TSM":-6.4,"SOX":-4.2,"ZIM":18.2,"NVDA":-3.8},
            "risk_score": 0.72
        }
    },
    "Red Sea tensions": {
        "logs": [
            "⚠ Brent crude: +6.1% (5d)",
            "⚠ ZIM shipping: +22.4% (5d)",
            "▸ SBLK bulk carriers: +14.1% (5d)",
        ],
        "result": {
            "prices": {"BZ=F":6.1,"ZIM":22.4,"SBLK":14.1},
            "risk_score": 0.54
        }
    },
    "default": {
        "logs": ["▸ Markets scanned · moderate signals"],
        "result": {"prices":{"ZIM":5.0,"BZ=F":2.1},"risk_score":0.3}
    }
}

# ── WEATHER ─────────────────────────────────────────────────────────────────
WEATHER_FALLBACK = {
    "Taiwan earthquake": {
        "logs": [
            "⚠ Taiwan Strait: wind 72km/h · 3.8m swell · critical",
            "▸ Strait of Malacca: clear",
            "▸ Red Sea: wind 32km/h · clear",
            "▸ 1 lane at risk of 7 checked",
        ],
        "result": {
            "risky_lanes": ["Taiwan Strait"],
            "lane_details": {
                "Taiwan Strait": {"wind":72.4,"wave":3.8,"rain":18.0,
                                  "severity":"critical","lat":24.5,"lon":119.5}
            },
            "weather_risk_score": 0.4, "named_storms": []
        }
    },
    "Red Sea tensions": {
        "logs": [
            "▸ Red Sea: wind 45km/h · 2.1m swell · elevated",
            "▸ Suez Canal: clear",
            "▸ 1 lane at risk of 7 checked",
        ],
        "result": {
            "risky_lanes": ["Red Sea"],
            "lane_details": {
                "Red Sea": {"wind":45,"wave":2.1,"rain":5,"severity":"elevated",
                            "lat":12.5,"lon":43.3}
            },
            "weather_risk_score": 0.2, "named_storms": []
        }
    },
    "default": {
        "logs": ["▸ All shipping lanes checked · conditions nominal"],
        "result": {"risky_lanes":[],"lane_details":{},"weather_risk_score":0.1,"named_storms":[]}
    }
}

# ── LOGISTICS ───────────────────────────────────────────────────────────────
LOGISTICS_FALLBACK = {
    "Taiwan earthquake": {
        "logs": [
            "⚠ 43 vessels rerouting from Kaohsiung",
            "⚠ Kaohsiung port: +6 day delay estimate",
            "▸ Shanghai port: normal operations",
        ],
        "result": {
            "rerouting_count": 43,
            "delayed_ports": [{"name":"Kaohsiung","delay_days":6,"lat":22.6,"lon":120.3}],
            "affected_lanes": ["Taiwan Strait"],
            "logistics_risk_score": 0.65
        }
    },
    "Red Sea tensions": {
        "logs": [
            "⚠ Cape reroute adds +18 day transit time",
            "⚠ Suez throughput –31% week-on-week",
            "▸ Jeddah port: partial operations",
        ],
        "result": {
            "rerouting_count": 67,
            "delayed_ports": [{"name":"Jeddah","delay_days":4,"lat":21.5,"lon":39.2}],
            "affected_lanes": ["Red Sea","Suez Canal"],
            "logistics_risk_score": 0.7
        }
    },
    "default": {
        "logs": ["▸ Port monitoring complete · normal operations"],
        "result": {"rerouting_count":8,"delayed_ports":[],"affected_lanes":[],"logistics_risk_score":0.1}
    }
}

# ── MEMORY ──────────────────────────────────────────────────────────────────
SUPPLIER_MAP = {
    "Apple Inc.": [
        {"name":"TSMC","location":"Taiwan","category":"Semiconductors",
         "criticality":"critical","lat":24.76,"lon":120.99},
        {"name":"Foxconn","location":"Taiwan","category":"Assembly",
         "criticality":"critical","lat":22.6,"lon":120.3},
        {"name":"Murata Manufacturing","location":"Japan","category":"Components",
         "criticality":"important","lat":35.68,"lon":139.69},
        {"name":"Corning","location":"USA","category":"Glass",
         "criticality":"important","lat":42.15,"lon":-77.05},
    ],
    "Ford Motor Company": [
        {"name":"Bosch","location":"Germany","category":"Electronics",
         "criticality":"critical","lat":48.78,"lon":9.18},
        {"name":"BASF","location":"Germany","category":"Materials",
         "criticality":"important","lat":49.48,"lon":8.47},
        {"name":"Aptiv","location":"Ireland","category":"Wiring",
         "criticality":"important","lat":53.33,"lon":-6.25},
    ],
    "Starbucks Corporation": [
        {"name":"Vietnam robusta farms","location":"Vietnam","category":"Coffee",
         "criticality":"critical","lat":14.0,"lon":108.0},
        {"name":"Brazil arabica farms","location":"Brazil","category":"Coffee",
         "criticality":"critical","lat":-14.23,"lon":-51.93},
        {"name":"Maersk","location":"Denmark","category":"Logistics",
         "criticality":"important","lat":55.68,"lon":12.57},
    ],
}

MEMORY_FALLBACK = {
    "Taiwan earthquake": {
        "logs": [
            "▸ Matched: Taiwan earthquake 2021 (87% similar)",
            "▸ Prior outcome: 6-week semiconductor shortage",
            "▸ Signals appeared 14 days before event",
        ],
        "result": {
            "matches": [
                {"event":"Taiwan earthquake 2021","similarity":0.87,
                 "outcome":"6-week semiconductor shortage, avg cost $1.8M",
                 "signal_lead_days":14}
            ],
            "suppliers": SUPPLIER_MAP["Apple Inc."]
        }
    },
    "default": {
        "logs": ["▸ 2 historical matches found"],
        "result": {"matches":[],"suppliers":[]}
    }
}

# ── GEOPOLITICAL ────────────────────────────────────────────────────────────
GEO_FALLBACK = {
    "Taiwan earthquake": {
        "logs": [
            "▸ Cross-strait tension: monitoring",
            "▸ GDELT tone score: –2.1",
            "▸ No new sanctions detected",
        ],
        "result": {
            "events": [{"type":"conflict","region":"Taiwan",
                        "description":"Cross-strait tensions elevated",
                        "gdelt_tone":-2.1,"lat":23.5,"lon":121.0}],
            "signal_strength": "medium", "geo_risk_score": 0.3
        }
    },
    "Red Sea tensions": {
        "logs": [
            "⚠ Houthi escalation: GDELT tone –5.4",
            "▸ US naval deployment confirmed",
            "▸ 3 geopolitical events flagged",
        ],
        "result": {
            "events": [{"type":"conflict","region":"Red Sea",
                        "description":"Houthi attacks on commercial shipping",
                        "gdelt_tone":-5.4,"lat":15.5,"lon":42.5}],
            "signal_strength": "high", "geo_risk_score": 0.6
        }
    },
    "default": {
        "logs": ["▸ GDELT scan complete · low geopolitical signal"],
        "result": {"events":[],"signal_strength":"low","geo_risk_score":0.1}
    }
}

# ── ORCHESTRATOR FALLBACKS ───────────────────────────────────────────────────
FALLBACK_VERDICT = {
    "probability": 72,
    "timeline": "18-24 days",
    "risk_level": "high",
    "primary_risk": "TSMC fab suspension threatens semiconductor supply chain",
    "affected_suppliers": [
        {"name":"TSMC","location":"Taiwan","category":"Semiconductors",
         "status":"critical","lat":24.76,"lon":120.99},
        {"name":"Foxconn","location":"Taiwan","category":"Assembly",
         "status":"critical","lat":22.6,"lon":120.3},
    ],
    "alternative_suppliers": [
        {"name":"Samsung Foundry","location":"South Korea","category":"Semiconductors",
         "lat":37.56,"lon":126.97},
        {"name":"GlobalFoundries","location":"USA","category":"Semiconductors",
         "lat":42.76,"lon":-73.68},
    ],
    "actions": [
        "Contact Samsung Foundry within 72 hours — lock capacity before competitors react",
        "Increase NAND flash safety stock by 8-10 weeks",
        "Monitor SOX index — escalate if drops further 3%",
    ],
    "cost_estimates": {"disruption_cost":2100000,"mitigation_cost":340000},
    "signal_breakdown": {
        "news":0.8,"financial":0.72,"weather":0.6,
        "logistics":0.65,"memory":0.87,"geopolitical":0.4
    }
}

FALLBACK_EMAIL = {
    "type": "email_draft",
    "to": "Samsung Foundry — procurement@samsung.com",
    "subject": "Urgent: Semiconductor capacity inquiry — supply contingency",
    "body": (
        "Dear Samsung Foundry Procurement Team,\n\n"
        "We are reaching out urgently regarding potential disruption to our "
        "current semiconductor supply chain due to the ongoing situation in Taiwan. "
        "Our intelligence systems have flagged a 72% probability of a 18-24 day "
        "disruption affecting our primary suppliers.\n\n"
        "We would like to explore emergency capacity availability for the following:\n"
        "- Advanced node foundry capacity (5nm / 3nm)\n"
        "- Estimated volume: TBD based on your availability\n"
        "- Timeline: Immediate to 30 days\n\n"
        "Could we schedule a call within the next 24 hours to discuss?\n\n"
        "Best regards,\n[Supply Chain Team]"
    )
}
```

---

## 7. Supabase Schema + Seed Data

```sql
-- supabase/seed.sql

-- Table: disruption_events
CREATE TABLE IF NOT EXISTS disruption_events (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz DEFAULT now(),
  date             date,
  type             text,
  region           text,
  description      text,
  outcome          text,
  signal_lead_days integer
);

-- Table: supplier_graph
CREATE TABLE IF NOT EXISTS supplier_graph (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company     text,
  supplier    text,
  category    text,
  region      text,
  criticality text,
  lat         float,
  lon         float
);

-- Table: scan_results
CREATE TABLE IF NOT EXISTS scan_results (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  company    text,
  scenario   text,
  verdict    jsonb
);

-- Seed: historical disruption events
INSERT INTO disruption_events (date,type,region,description,outcome,signal_lead_days) VALUES
('2024-03-26','infrastructure','USA',
 'Baltimore Francis Scott Key Bridge collapse disrupts East Coast port',
 'Port of Baltimore closed 6 weeks, $15M/day economic impact',19),
('2024-01-15','conflict','Red Sea',
 'Houthi attacks on commercial shipping in Red Sea escalate',
 '60% of traffic rerouted, shipping costs up 200%, +18 days transit',11),
('2023-08-10','weather','Vietnam',
 'Central Highlands drought reduces robusta coffee harvest',
 'Global coffee prices up 30%, Starbucks supply disruption 8 weeks',31),
('2021-03-23','navigation','Suez Canal',
 'Ever Given container ship blocks Suez Canal',
 '$9.6B/day trade blocked, 6-day closure, 369 vessels stranded',0),
('2021-07-15','earthquake','Taiwan',
 'M6.2 earthquake near TSMC Hsinchu Science Park',
 'TSMC fab operations paused 48h, semiconductor shortage Q3 2021',14);

-- Seed: Apple supplier graph
INSERT INTO supplier_graph (company,supplier,category,region,criticality,lat,lon) VALUES
('Apple Inc.','TSMC','Semiconductors','Taiwan','critical',24.76,120.99),
('Apple Inc.','Foxconn','Assembly','Taiwan','critical',22.6,120.3),
('Apple Inc.','Murata Manufacturing','Components','Japan','important',35.68,139.69),
('Apple Inc.','Corning','Glass','USA','important',42.15,-77.05),
('Apple Inc.','Samsung Display','Displays','South Korea','important',37.56,126.97),

-- Seed: Ford supplier graph
('Ford Motor Company','Bosch','Electronics','Germany','critical',48.78,9.18),
('Ford Motor Company','BASF','Materials','Germany','important',49.48,8.47),
('Ford Motor Company','Aptiv','Wiring','Ireland','important',53.33,-6.25),
('Ford Motor Company','Novelis','Aluminium','USA','important',33.77,-84.39),

-- Seed: Starbucks supplier graph
('Starbucks Corporation','Vietnam farms','Coffee','Vietnam','critical',14.0,108.0),
('Starbucks Corporation','Brazil farms','Coffee','Brazil','critical',-14.23,-51.93),
('Starbucks Corporation','Maersk','Logistics','Denmark','important',55.68,12.57);
```

---

## 8. Frontend — useScan Hook

```typescript
// frontend/hooks/useScan.ts
import { useState, useCallback, useRef } from "react";

export interface AgentState {
  status: "idle"|"scanning"|"live"|"done"|"error";
  logs: string[];
  data: Record<string, unknown>;
}

export interface VerdictData {
  probability: number;
  timeline: string;
  risk_level: "high"|"medium"|"low";
  primary_risk: string;
  affected_suppliers: Array<{
    name: string; location: string; category: string;
    status: string; lat: number; lon: number;
  }>;
  alternative_suppliers: Array<{
    name: string; location: string; category: string;
    lat: number; lon: number;
  }>;
  actions: string[];
  cost_estimates: { disruption_cost: number; mitigation_cost: number };
  signal_breakdown: Record<string, number>;
}

export function useScan() {
  const [agents, setAgents]   = useState<Record<string, AgentState>>({});
  const [verdict, setVerdict] = useState<VerdictData | null>(null);
  const [action, setAction]   = useState<Record<string, unknown> | null>(null);
  const [scanning, setScanning] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const startScan = useCallback((company: string, scenario: string) => {
    // Close any existing connection
    esRef.current?.close();
    setScanning(true);
    setVerdict(null);
    setAction(null);
    setAgents({});

    const url = `${process.env.NEXT_PUBLIC_API_URL}/scan`
              + `?company=${encodeURIComponent(company)}`
              + `&scenario=${encodeURIComponent(scenario)}`;

    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e: MessageEvent) => {
      const event = JSON.parse(e.data);

      if (event.type === "verdict") {
        setVerdict(event.data);
        return;
      }

      if (event.type === "action") {
        setAction(event.data);
        setScanning(false);
        es.close();
        return;
      }

      // Update the specific agent panel
      if (event.agent && event.agent !== "orchestrator") {
        setAgents(prev => {
          const cur = prev[event.agent] || { status:"idle", logs:[], data:{} };
          return {
            ...prev,
            [event.agent]: {
              status: event.status || cur.status,
              logs: event.log
                ? [...cur.logs.slice(-4), event.log]
                : cur.logs,
              data: event.data && Object.keys(event.data).length > 0
                ? event.data : cur.data,
            }
          };
        });
      }
    };

    es.onerror = () => {
      setScanning(false);
      es.close();
    };
  }, []);

  const stopScan = useCallback(() => {
    esRef.current?.close();
    setScanning(false);
  }, []);

  return { agents, verdict, action, scanning, startScan, stopScan };
}
```

---

## 9. Frontend — SeaMap Component

```typescript
// frontend/components/SeaMap.tsx
"use client";
import { useEffect, useRef } from "react";
import type { VerdictData } from "@/hooks/useScan";

const LOCATION_INDEX: Record<string, [number, number]> = {
  "Taiwan Strait":     [24.5,  119.5],
  "Red Sea":           [15.5,   42.5],
  "Strait of Malacca": [2.5,  102.0],
  "Suez Canal":        [30.5,   32.3],
  "South China Sea":   [15.0,  114.0],
  "Cape of Good Hope": [-34.3,  18.5],
  "Taiwan":            [23.5,  121.0],
  "Vietnam":           [14.0,  108.0],
  "Rotterdam":         [51.9,    4.5],
  "Singapore":         [1.35,  103.8],
  "Kaohsiung":         [22.6,  120.3],
  "Germany":           [51.1,   10.4],
  "South Korea":       [37.56, 126.97],
};

const RISK_STYLE = {
  critical: { color: "#E24B4A", radius: 120000, opacity: 0.25 },
  elevated: { color: "#EF9F27", radius: 90000,  opacity: 0.20 },
  monitor:  { color: "#1D9E75", radius: 60000,  opacity: 0.15 },
};

interface SeaMapProps {
  verdict: VerdictData | null;
  agents:  Record<string, { data: Record<string, unknown> }>;
  scenario: string;
}

export default function SeaMap({ verdict, agents, scenario }: SeaMapProps) {
  const mapRef     = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<unknown>(null);
  const layersRef  = useRef<{ zones: unknown[]; ports: unknown[] }>({
    zones: [], ports: []
  });

  useEffect(() => {
    if (typeof window === "undefined" || leafletRef.current) return;
    import("leaflet").then(L => {
      if (!mapRef.current) return;
      const map = L.map(mapRef.current, { center: [15, 80], zoom: 3 });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap", opacity: 0.7
      }).addTo(map);
      L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
        opacity: 0.5
      }).addTo(map);
      leafletRef.current = map;
    });
  }, []);

  useEffect(() => {
    if (!leafletRef.current || !verdict) return;
    import("leaflet").then(L => {
      const map = leafletRef.current as ReturnType<typeof L.map>;
      layersRef.current.zones.forEach(l => map.removeLayer(l as never));
      layersRef.current.zones = [];

      verdict.affected_suppliers.forEach(s => {
        const coords = LOCATION_INDEX[s.location] ||
                       [s.lat, s.lon] as [number, number];
        if (!coords || (!coords[0] && !coords[1])) return;
        const style = RISK_STYLE[s.status as keyof typeof RISK_STYLE]
                   || RISK_STYLE.monitor;
        const circle = L.circle(coords, {
          radius: style.radius, color: style.color,
          fillColor: style.color, fillOpacity: style.opacity, weight: 1.5
        }).addTo(map);
        circle.bindPopup(`<strong>${s.name}</strong><br>${s.category}<br>Status: ${s.status}`);
        layersRef.current.zones.push(circle);
      });

      const critical = verdict.affected_suppliers.find(s => s.status === "critical");
      if (critical) {
        const c = LOCATION_INDEX[critical.location] || [critical.lat, critical.lon];
        if (c) map.flyTo(c as [number,number], 5, { duration: 1.5 });
      }
    });
  }, [verdict]);

  return (
    <div
      ref={mapRef}
      style={{ height: "260px", borderRadius: "8px", zIndex: 0 }}
    />
  );
}
```

---

## 10. Deployment

### Railway (backend)

```toml
# railway.toml
[build]
builder = "nixpacks"
buildCommand = "pip install -r requirements.txt"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
```

### Vercel (frontend)

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

---

## 11. Startup Commands

```bash
# 1. Backend
cd backend
pip install -r requirements.txt --break-system-packages
cp .env.example .env        # fill in API keys
uvicorn main:app --reload --port 8000

# 2. Supabase seed
# Go to supabase.com → SQL editor → paste supabase/seed.sql → run

# 3. Frontend
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

---

## 12. Critical Rules for the Coding Agent

```
1. READ THIS FILE before writing any code.
2. NEVER use a package not in requirements.txt or package.json.
3. NEVER invent a JSON field not in Section 5 (Data Contracts).
4. EVERY agent _execute() must have a matching _fallback().
5. EVERY API call must be wrapped in try/except — never let exceptions bubble.
6. ALL agents run via asyncio.gather() — never sequentially.
7. SSE stream must include header X-Accel-Buffering: no.
8. The scan MUST complete in under 10 seconds end-to-end.
9. Check PROGRESS.md before implementing anything — it may already exist.
10. After completing a task: mark it done in PROGRESS.md immediately.
11. The demo must work with no internet (fallbacks fire) — test this.
12. Never hardcode API keys — always use os.getenv().
```

---

## 13. Agent Prompting Guidance for Antigravity

When giving tasks to the coding agent in Antigravity, structure prompts like this:

```
Read .agent/MASTER_ARCHITECTURE.md Section [N] first.
Then implement [specific task].
Use only packages from Section 4.
Output data must match the shape in Section 5.[N].
After completing, mark the task done in .agent/PROGRESS.md.
```

**Example prompts:**

> "Read MASTER_ARCHITECTURE.md Section 6.3. Implement agents/news.py exactly as specified. Use only httpx for HTTP. The result event data must match the NewsAgent shape in Section 5.2. Do not use requests."

> "Read MASTER_ARCHITECTURE.md Section 6.9. Implement orchestrator.py. All 6 agents must run via asyncio.gather(). The Claude synthesis call must use claude-haiku-4-5-20251001. If Claude fails, return FALLBACK_VERDICT from fallbacks.py."

> "Read MASTER_ARCHITECTURE.md Section 8. Implement the useScan hook in frontend/hooks/useScan.ts. The agent state must update in real time from the SSE stream. Each agent panel shows the last 4 log lines only."

---

*End of MASTER_ARCHITECTURE.md*
