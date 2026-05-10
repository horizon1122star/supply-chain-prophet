"""
agents/geopolitical.py — GeopoliticalAgent
Scans GDELT Project API for geopolitical signals affecting supply chains.
GDELT is completely free — no API key required.
"""

import httpx
import asyncio
from agents.base import BaseAgent


def classify_event(title: str) -> str:
    t = title.lower()
    if any(k in t for k in ["sanction", "ban", "restrict", "embargo"]):
        return "sanction"
    if any(k in t for k in ["conflict", "war", "attack", "strike", "military"]):
        return "conflict"
    if any(k in t for k in ["protest", "riot", "unrest", "demonstration"]):
        return "protest"
    if any(k in t for k in ["close", "closure", "block", "halt", "suspend"]):
        return "closure"
    return "geopolitical"


def extract_geo_region(title: str) -> str:
    regions = [
        "Taiwan", "China", "Russia", "Ukraine", "Iran", "Israel",
        "North Korea", "Middle East", "Europe", "Asia", "Vietnam",
        "Red Sea", "Suez", "Singapore", "India",
    ]
    for r in regions:
        if r.lower() in title.lower():
            return r
    return "Global"


class GeopoliticalAgent(BaseAgent):
    name = "geopolitical"

    async def _execute(self, company: str, scenario: str):
        yield self._event("status", "scanning",
                          log="▸ Scanning GDELT geopolitical feed...")

        events        = []
        geo_risk_score = 0.0

        queries = [
            f"{company} {scenario} supply chain trade disruption",
            f"{scenario} sanctions conflict supply chain",
            "supply chain disruption geopolitical risk",
        ]

        for attempt, query in enumerate(queries):
            try:
                async with httpx.AsyncClient(timeout=12) as client:
                    resp = await client.get(
                        "https://api.gdeltproject.org/api/v2/doc/doc",
                        params={
                            "query":      query,
                            "mode":       "artlist",
                            "maxrecords": 10,
                            "sourcelang": "english",
                            "format":     "json",
                        },
                    )
                    resp.raise_for_status()
                    raw = resp.text.strip()
                    if not raw:
                        raise ValueError("Empty GDELT response")
                    articles = resp.json().get("articles", [])
                    if articles:
                        break   # Got results — stop retrying
                    await asyncio.sleep(1)
            except Exception as exc:
                if attempt < len(queries) - 1:
                    yield self._event("log", "live",
                                      log=f"▸ GDELT retry {attempt + 1}...")
                    await asyncio.sleep(1.5)
                    continue
                yield self._event("log", "live",
                                  log="▸ GDELT unavailable — using cached signals")
                async for ev in self._fallback(company, scenario):
                    yield ev
                return

        for art in articles[:6]:
            title = art.get("title", "")
            tone  = 0.0
            try:
                tone = float(art.get("tone", 0))
            except (ValueError, TypeError):
                tone = 0.0

            geo_risk_score += max(0, -tone / 20)

            region = extract_geo_region(title)
            events.append({
                "type":        classify_event(title),
                "region":      region,
                "description": title[:80],
                "gdelt_tone":  round(tone, 2),
                "lat":         None,
                "lon":         None,
            })

            icon = "⚠" if tone < -3 else "▸"
            yield self._event("log", "live",
                log=f"{icon} {title[:55]}... (tone {tone:.1f})")
            await asyncio.sleep(0.3)



        signal = "high" if geo_risk_score > 0.5 else "medium" if geo_risk_score > 0.2 else "low"
        geo_risk_score = min(geo_risk_score, 1.0)

        yield self._event(
            "result", "done",
            log=f"▸ {len(events)} geopolitical signals · strength: {signal}",
            data={
                "events":          events,
                "signal_strength": signal,
                "geo_risk_score":  round(geo_risk_score, 2),
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
