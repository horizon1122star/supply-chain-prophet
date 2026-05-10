"""
agents/news.py — NewsAgent
Fetches recent news about supply chain risks using Brave Search API.
Falls back to cached data if API unavailable.
"""

import os
import asyncio
import httpx
import xml.etree.ElementTree as ET
from agents.base import BaseAgent
from geo_resolver import resolve_location

RISK_KEYWORDS_HIGH = [
    "earthquake", "flood", "typhoon", "hurricane", "explosion", "fire",
    "shutdown", "halt", "collapse", "blockage", "attack", "strike"
]
RISK_KEYWORDS_MEDIUM = [
    "shortage", "disruption", "closure", "conflict", "sanction",
    "accident", "delay", "drought", "shortage", "tension"
]


def _classify_severity(title: str) -> str:
    t = title.lower()
    if any(k in t for k in RISK_KEYWORDS_HIGH):
        return "high"
    if any(k in t for k in RISK_KEYWORDS_MEDIUM):
        return "medium"
    return "low"


def extract_region(text: str) -> str:
    regions = [
        "Taiwan", "China", "Japan", "South Korea", "Vietnam", "India",
        "Red Sea", "Suez", "Rotterdam", "Singapore", "Ukraine", "Russia",
        "Middle East", "Europe", "Southeast Asia", "United States", "Germany",
        "Brazil", "Ireland", "Denmark", "Kaohsiung", "Shanghai", "Dubai",
    ]
    for r in regions:
        if r.lower() in text.lower():
            return r
    return "Global"

class NewsAgent(BaseAgent):
    name = "news"

    async def _execute(self, company: str, scenario: str):
        yield self._event("status", "scanning",
                          log="▸ Searching global news feeds via Google News RSS...")

        query = f"{company} supply chain {scenario} disruption risk"
        url = f"https://news.google.com/rss/search?q={query}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        signals = []
        articles = []

        try:
            async with httpx.AsyncClient(timeout=12) as client:
                resp = await client.get(url, headers=headers, follow_redirects=True)
                resp.raise_for_status()
                
            root = ET.fromstring(resp.content)
            channel = root.find("channel")
            if channel is not None:
                for item in channel.findall("item")[:15]:
                    articles.append({
                        "title": item.find("title").text if item.find("title") is not None else "",
                        "url": item.find("link").text if item.find("link") is not None else "",
                        "date": item.find("pubDate").text if item.find("pubDate") is not None else ""
                    })
        except Exception as e:
            yield self._event("status", "error",
                              log="▸ Google News RSS error — using cached news")
            async for ev in self._fallback(company, scenario):
                yield ev
            return

        for article in articles[:8]:
            title    = article.get("title", "")
            severity = _classify_severity(title)
            region   = extract_region(title)
            coords   = resolve_location(region)

            signals.append({
                "title":     title,
                "url":       article.get("url", ""),
                "severity":  severity,
                "published": article.get("date", ""),
                "region":    region,
                "lat":       coords[0] if coords else None,
                "lon":       coords[1] if coords else None,
            })

            icon = "⚠" if severity == "high" else "▸"
            yield self._event("log", "live",
                              log=f"{icon} {title}")
            await asyncio.sleep(0.3)

        high_count = len([s for s in signals if s["severity"] == "high"])
        yield self._event(
            "result", "done",
            log=f"▸ {len(articles)} articles · {high_count} high-severity signals",
            data={
                "signals":    signals,
                "count":      len(articles),
                "high_count": high_count,
            }
        )

    async def _fallback(self, company: str, scenario: str):
        from fallbacks import NEWS_FALLBACK
        data = NEWS_FALLBACK.get(scenario, NEWS_FALLBACK["default"])
        for line in data["logs"]:
            yield self._event("log", "live", log=line)
            await asyncio.sleep(0.35)
        yield self._event(
            "result", "done",
            log=f"▸ {data['result']['count']} articles · "
                f"{data['result']['high_count']} high-severity (cached)",
            data=data["result"]
        )
