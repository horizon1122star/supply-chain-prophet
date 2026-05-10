"""
agents/weather.py — WeatherAgent
Checks 7 global shipping lanes using Open-Meteo + Marine API + NOAA.
All three APIs are completely FREE — no key required.
"""

import httpx
import asyncio
from agents.base import BaseAgent

SHIPPING_LANES = {
    "Taiwan Strait":     (24.5,  119.5),
    "Red Sea":           (12.5,   43.3),
    "Strait of Malacca": (2.5,  102.0),
    "Suez Canal":        (30.5,   32.3),
    "South China Sea":   (15.0,  114.0),
    "Cape of Good Hope": (-34.3,  18.5),
    "Strait of Hormuz":  (26.5,   56.3),
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

        risky_lanes      = []
        lane_details     = {}
        weather_risk_score = 0.0
        named_storms     = await self._check_noaa_storms()

        async with httpx.AsyncClient(timeout=10) as client:
            for lane, (lat, lon) in SHIPPING_LANES.items():
                try:
                    wx, mx = await asyncio.gather(
                        client.get(
                            "https://api.open-meteo.com/v1/forecast",
                            params={
                                "latitude":     lat,
                                "longitude":    lon,
                                "daily":        "windspeed_10m_max,precipitation_sum",
                                "forecast_days": 7,
                                "timezone":     "UTC",
                            },
                        ),
                        client.get(
                            "https://marine-api.open-meteo.com/v1/marine",
                            params={
                                "latitude":     lat,
                                "longitude":    lon,
                                "daily":        "wave_height_max",
                                "forecast_days": 7,
                                "timezone":     "UTC",
                            },
                        ),
                        return_exceptions=True,
                    )

                    wx_data = wx.json().get("daily", {}) if not isinstance(wx, Exception) else {}
                    mx_data = mx.json().get("daily", {}) if not isinstance(mx, Exception) else {}

                    wind_arr = [v for v in wx_data.get("windspeed_10m_max", []) if v is not None]
                    rain_arr = [v for v in wx_data.get("precipitation_sum", []) if v is not None]
                    wave_arr = [v for v in mx_data.get("wave_height_max", []) if v is not None]

                    wind = max(wind_arr) if wind_arr else 0.0
                    rain = max(rain_arr) if rain_arr else 0.0
                    wave = max(wave_arr) if wave_arr else 0.0
                    sev  = severity(wind, wave, rain)

                    lane_details[lane] = {
                        "wind":     round(wind, 1),
                        "wave":     round(wave, 1),
                        "rain":     round(rain, 1),
                        "severity": sev,
                        "lat":      lat,
                        "lon":      lon,
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
                "risky_lanes":        risky_lanes,
                "lane_details":       lane_details,
                "weather_risk_score": round(weather_risk_score, 2),
                "named_storms":       named_storms,
            },
        )

    async def _check_noaa_storms(self) -> list:
        """Fetch active tropical storms from NOAA NHC (free, no key)."""
        try:
            async with httpx.AsyncClient(timeout=6) as client:
                resp   = await client.get("https://www.nhc.noaa.gov/CurrentStorms.json")
                storms = resp.json().get("activeStorms", [])
                return [
                    {
                        "name":     s.get("name", "Unknown"),
                        "category": s.get("intensity", "Unknown"),
                        "lat":      s.get("lat", 0),
                        "lon":      s.get("lon", 0),
                    }
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
        yield self._event(
            "result", "done",
            log="▸ Weather checked (cached)",
            data=data["result"],
        )
