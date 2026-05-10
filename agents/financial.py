"""
agents/financial.py — FinancialAgent
Fetches 5-day stock price changes for supply-chain-relevant tickers.
Uses yfinance (Yahoo Finance) — completely free, no API key required.
"""

import asyncio
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
                          log="▸ Fetching market signals from Yahoo Finance...")

        loop   = asyncio.get_event_loop()
        prices = {}
        risk_score = 0.0

        try:
            import yfinance as yf
        except ImportError:
            yield self._event("status", "error",
                              log="▸ yfinance not installed — using cached markets")
            async for ev in self._fallback(company, scenario):
                yield ev
            return

        for category, tickers in SUPPLY_CHAIN_TICKERS.items():
            for ticker in tickers[:2]:  # Limit to 2 per category for speed
                try:
                    data = await loop.run_in_executor(
                        None,
                        lambda t=ticker: yf.Ticker(t).history(period="5d")
                    )
                    if data.empty or len(data) < 2:
                        continue

                    pct = float(
                        (data["Close"].iloc[-1] - data["Close"].iloc[0])
                        / data["Close"].iloc[0] * 100
                    )
                    prices[ticker] = round(pct, 2)

                    sign = "+" if pct > 0 else ""
                    icon = "⚠" if abs(pct) > 4 else "▸"
                    yield self._event("log", "live",
                                      log=f"{icon} {ticker}: {sign}{pct:.1f}% (5d)")
                    await asyncio.sleep(0.15)

                    # Risk scoring logic
                    if category == "semiconductors" and pct < -3:
                        risk_score += 0.25
                    elif category == "shipping" and pct > 5:
                        risk_score += 0.20
                    elif category == "oil" and pct > 4:
                        risk_score += 0.15

                except Exception:
                    continue

        if not prices:
            # yfinance returned nothing — use fallback
            async for ev in self._fallback(company, scenario):
                yield ev
            return

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
        yield self._event(
            "result", "done",
            log="▸ Markets scanned (cached)",
            data=data["result"]
        )
