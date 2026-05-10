"""
main.py — Supply Chain Prophet FastAPI application.
Exposes /scan SSE endpoint that streams agent events to the browser.
"""

from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from dotenv import load_dotenv

load_dotenv()  # Load .env file from current directory

from orchestrator import run_scan

app = FastAPI(
    title="Supply Chain Prophet API",
    description="Multi-agent supply chain disruption prediction system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check endpoint for Railway deployment."""
    return {"status": "ok", "service": "supply-chain-prophet"}


@app.get("/scenarios")
async def scenarios():
    """Return available scenario presets."""
    return {
        "scenarios": [
            {"id": "Taiwan earthquake",    "label": "🌏 Taiwan Earthquake",     "icon": "🌏"},
            {"id": "Red Sea tensions",     "label": "⚓ Red Sea Tensions",       "icon": "⚓"},
            {"id": "Vietnam drought",      "label": "☀️ Vietnam Drought",        "icon": "☀️"},
            {"id": "Rotterdam port strike","label": "🏭 Rotterdam Port Strike",  "icon": "🏭"},
            {"id": "",                     "label": "🔍 Custom Query",           "icon": "🔍"},
        ]
    }


@app.get("/scan")
async def scan(
    company:  str = Query(..., description="Company name to analyse"),
    scenario: str = Query("", description="Scenario preset (optional)"),
):
    """
    SSE endpoint — streams AgentEvent JSON objects as text/event-stream.
    The frontend connects via EventSource and updates the UI in real time.
    """
    async def event_stream():
        try:
            async for event in run_scan(company, scenario):
                yield f"data: {json.dumps(event)}\n\n"
                await asyncio.sleep(0)  # yield control to event loop
        except Exception as e:
            yield f"data: {json.dumps({'agent':'orchestrator','type':'error','status':'error','log':str(e),'data':{}})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":    "no-cache",
            "Connection":       "keep-alive",
            "X-Accel-Buffering": "no",  # Disable Nginx buffering
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
