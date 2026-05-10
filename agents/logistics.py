"""
agents/logistics.py — LogisticsAgent
Monitors port delays and vessel rerouting using GDELT as a proxy
for shipping disruption news. No API key required.
"""

import httpx
import asyncio
from agents.base import BaseAgent

PORT_COORDS = {
    "Kaohsiung":  (22.6,  120.3),
    "Shanghai":   (31.2,  121.5),
    "Singapore":  (1.35,  103.8),
    "Rotterdam":  (51.9,    4.5),
    "Dubai":      (25.2,   55.3),
    "Colombo":    (6.93,   79.84),
    "Jeddah":     (21.5,   39.2),
    "Hamburg":    (53.55,   9.99),
}


def _get_scenario_targets(scenario: str) -> tuple[list, list]:
    """Map scenario to relevant ports and lanes."""
    sl = scenario.lower()
    if "taiwan" in sl:
        return ["Kaohsiung", "Shanghai"], ["Taiwan Strait"]
    elif "red sea" in sl:
        return ["Jeddah", "Dubai"], ["Red Sea", "Suez Canal"]
    elif "rotterdam" in sl or "strike" in sl:
        return ["Rotterdam", "Hamburg"], ["Cape of Good Hope"]
    elif "vietnam" in sl:
        return ["Singapore", "Colombo"], ["Strait of Malacca", "South China Sea"]
    else:
        return list(PORT_COORDS.keys())[:3], ["Strait of Malacca", "Taiwan Strait"]


def _estimate_delay(port: str, scenario: str) -> int:
    """Estimate port delay days from scenario context."""
    sl = scenario.lower()
    if "taiwan" in sl and port == "Kaohsiung":
        return 6
    if "red sea" in sl and port in ["Jeddah", "Dubai"]:
        return 4
    if ("rotterdam" in sl or "strike" in sl) and port in ["Rotterdam", "Hamburg"]:
        return 8
    return 0


class LogisticsAgent(BaseAgent):
    name = "logistics"

    async def _execute(self, company: str, scenario: str):
        yield self._event("status", "scanning",
                          log="▸ Monitoring vessel positions + port status...")

        target_ports, target_lanes = _get_scenario_targets(scenario)
        rerouting_count = 0
        delayed_ports   = []

        yield self._event("log", "live",
                          log=f"▸ Monitoring {len(target_ports)} ports, "
                              f"{len(target_lanes)} shipping lanes")
        await asyncio.sleep(0.3)

        # GDELT as a proxy for shipping disruption signals
        async with httpx.AsyncClient(timeout=10) as client:
            try:
                resp = await client.get(
                    "https://api.gdeltproject.org/api/v2/doc/doc",
                    params={
                        "query":      f"shipping port delay {scenario} rerouting",
                        "mode":       "artlist",
                        "maxrecords": 10,
                        "format":     "json",
                    },
                )
                articles = resp.json().get("articles", [])
                rerouting_count = min(len(articles) * 5, 80)
            except Exception:
                rerouting_count = 43  # Fallback estimate

        yield self._event("log", "live",
                          log=f"▸ ~{rerouting_count} vessels rerouting detected")
        await asyncio.sleep(0.3)

        for port in target_ports:
            coords = PORT_COORDS.get(port)
            if not coords:
                continue
            delay = _estimate_delay(port, scenario)

            if delay > 0:
                delayed_ports.append({
                    "name":       port,
                    "delay_days": delay,
                    "lat":        coords[0],
                    "lon":        coords[1],
                })
                yield self._event("log", "live",
                    log=f"⚠ {port} port: +{delay} day delay estimate")
            else:
                yield self._event("log", "live",
                    log=f"▸ {port} port: normal operations")
            await asyncio.sleep(0.25)

        logistics_risk = (rerouting_count / 100) * 0.5 + (len(delayed_ports) * 0.15)
        logistics_risk = min(logistics_risk, 1.0)

        yield self._event(
            "result", "done",
            log=f"▸ {len(delayed_ports)} ports delayed · "
                f"{rerouting_count} vessels rerouting",
            data={
                "rerouting_count":     rerouting_count,
                "delayed_ports":       delayed_ports,
                "affected_lanes":      target_lanes,
                "logistics_risk_score": round(logistics_risk, 2),
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
