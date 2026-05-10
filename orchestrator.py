"""
orchestrator.py — Multi-agent fan-out + Groq (Llama 3.3) synthesis.
All 6 agents run simultaneously via asyncio.gather().
Groq synthesizes findings into a structured VerdictShape JSON.
Falls back to FALLBACK_VERDICT if Groq is unavailable/unconfigured.
"""

import asyncio
import json
import os
from typing import AsyncGenerator

from agents.news        import NewsAgent
from agents.financial   import FinancialAgent
from agents.weather     import WeatherAgent
from agents.logistics   import LogisticsAgent
from agents.memory      import MemoryAgent
from agents.geopolitical import GeopoliticalAgent
from fallbacks          import FALLBACK_VERDICT, FALLBACK_EMAIL
from db                 import save_scan_result

AGENTS = [
    NewsAgent(),
    FinancialAgent(),
    WeatherAgent(),
    LogisticsAgent(),
    MemoryAgent(),
    GeopoliticalAgent(),
]


async def run_scan(company: str, scenario: str) -> AsyncGenerator[dict, None]:
    """
    Fan-out to all agents simultaneously, stream events via SSE queue,
    then synthesize with Claude Haiku.
    """
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

    await asyncio.gather(*tasks, return_exceptions=True)

    # ── Synthesis phase ───────────────────────────────────────────────────
    yield {
        "agent":  "orchestrator",
        "type":   "status",
        "status": "thinking",
        "log":    "▸ Synthesizing all signals with Groq (Llama 3.3)...",
        "data":   {},
    }

    verdict = await synthesize(company, scenario, agent_results)

    yield {
        "agent":  "orchestrator",
        "type":   "verdict",
        "status": "done",
        "log":    f"▸ Verdict: {verdict['probability']}% disruption probability "
                  f"· {verdict['risk_level'].upper()} risk",
        "data":   verdict,
    }

    # ── Persist to Supabase (non-blocking) ───────────────────────────────
    asyncio.create_task(_persist(company, scenario, verdict))

    # ── Auto-action: draft email if high risk ────────────────────────────
    if verdict.get("probability", 0) > 65:
        yield {
            "agent":  "orchestrator",
            "type":   "status",
            "status": "acting",
            "log":    "▸ Risk > 65% — drafting supplier outreach email...",
            "data":   {},
        }
        email = await draft_email(company, verdict)
        yield {
            "agent":  "orchestrator",
            "type":   "action",
            "status": "done",
            "log":    "▸ Action taken: supplier email drafted",
            "data":   email,
        }


async def _persist(company: str, scenario: str, verdict: dict):
    """Async wrapper around synchronous Supabase save."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, save_scan_result, company, scenario, verdict)


async def synthesize(company: str, scenario: str, agent_data: dict) -> dict:
    """Call Groq to synthesize all agent findings into a verdict."""
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key or api_key == "gsk_your_key_here":
        return _build_smart_fallback(agent_data, company, scenario)

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
        from groq import AsyncGroq
        client = AsyncGroq(api_key=api_key)
        msg = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=1200,
            messages=[{"role": "user", "content": prompt}],
        )
        text = msg.choices[0].message.content.strip()
        # Strip any accidental markdown fences
        text = text.replace("```json", "").replace("```", "").strip()
        result = json.loads(text)
        # Validate required keys
        assert "probability" in result and "risk_level" in result
        return result
    except Exception:
        return _build_smart_fallback(agent_data, company, scenario)


def _build_smart_fallback(agent_data: dict, company: str = "", scenario: str = "") -> dict:
    """
    Build a fully dynamic, company-aware verdict from real agent results.
    No Apple-specific hardcoding — every field is derived from live data.
    """
    scores = {
        "news":         min(agent_data.get("news", {}).get("high_count", 0) / 5, 1.0),
        "financial":    agent_data.get("financial", {}).get("risk_score", 0.3),
        "weather":      agent_data.get("weather", {}).get("weather_risk_score", 0.1),
        "logistics":    agent_data.get("logistics", {}).get("logistics_risk_score", 0.1),
        "memory":       0.75 if agent_data.get("memory", {}).get("matches") else 0.25,
        "geopolitical": agent_data.get("geopolitical", {}).get("geo_risk_score", 0.1),
    }
    weights = {"news": 0.25, "financial": 0.20, "weather": 0.15,
               "logistics": 0.20, "memory": 0.10, "geopolitical": 0.10}

    probability = int(min(sum(scores[k] * weights[k] for k in scores) * 100, 95))
    risk_level  = "high" if probability > 65 else "medium" if probability > 35 else "low"

    # ── Company-aware primary risk text ──────────────────────────────────
    risky_lanes    = agent_data.get("weather", {}).get("risky_lanes", [])
    delayed_ports  = agent_data.get("logistics", {}).get("delayed_ports", [])
    geo_events     = agent_data.get("geopolitical", {}).get("events", [])
    news_signals   = agent_data.get("news", {}).get("signals", [])

    company_name = company or "the company"
    if risky_lanes:
        primary_risk = (f"{company_name} supply chain faces {risk_level} disruption risk — "
                        f"{risky_lanes[0]} conditions critical ({scenario})")
    elif delayed_ports:
        primary_risk = (f"{company_name} logistics at risk — {delayed_ports[0]['name']} port "
                        f"delayed {delayed_ports[0]['delay_days']} days ({scenario})")
    elif geo_events:
        primary_risk = (f"{company_name} exposed to geopolitical risk — "
                        f"{geo_events[0].get('description', scenario)}")
    elif news_signals:
        primary_risk = f"{company_name}: {news_signals[0]['title'][:80]}"
    else:
        primary_risk = (f"{company_name} supply chain under {risk_level} risk "
                        f"due to {scenario}")

    # ── Suppliers from memory agent (real data or inference) ──────────────
    suppliers = agent_data.get("memory", {}).get("suppliers", [])
    affected = [
        {**s, "status": "critical" if s.get("criticality") == "critical" else "elevated"}
        for s in suppliers[:3]
    ]
    # Build dynamic alternative suppliers from known non-affected suppliers
    alternatives = [
        {**s, "status": "available"}
        for s in suppliers[3:5]
    ] if len(suppliers) > 3 else FALLBACK_VERDICT["alternative_suppliers"]

    # ── Dynamic timeline from logistics ───────────────────────────────────
    rerouting = agent_data.get("logistics", {}).get("rerouting_count", 0)
    if rerouting > 60:
        timeline = "7-14 days"
    elif rerouting > 30:
        timeline = "14-21 days"
    else:
        timeline = "21-30 days"

    # ── Dynamic cost estimates from financial risk ─────────────────────────
    fin_risk   = scores["financial"]
    base_cost  = int(fin_risk * 3_000_000)
    mitig_cost = int(base_cost * 0.15)

    # ── Dynamic action items ───────────────────────────────────────────────
    actions = []
    if affected:
        actions.append(
            f"Contact alternative suppliers within 72h — lock capacity before competitors react")
    if risky_lanes:
        actions.append(
            f"Reroute shipments away from {risky_lanes[0]} for the next {timeline}")
    if delayed_ports:
        actions.append(
            f"Increase safety stock by 4-8 weeks — {delayed_ports[0]['name']} port delayed")
    if scores["financial"] > 0.3:
        actions.append(
            f"Monitor market indicators — financial signals show {risk_level} risk")
    if not actions:
        actions = [f"Monitor {company_name} supply chain exposure to {scenario} closely"]

    return {
        "probability":          probability,
        "timeline":             timeline,
        "risk_level":           risk_level,
        "primary_risk":         primary_risk,
        "affected_suppliers":   affected   if affected   else FALLBACK_VERDICT["affected_suppliers"],
        "alternative_suppliers": alternatives,
        "actions":              actions,
        "cost_estimates":       {"disruption_cost": base_cost, "mitigation_cost": mitig_cost},
        "signal_breakdown":     {k: round(v, 2) for k, v in scores.items()},
    }


async def draft_email(company: str, verdict: dict) -> dict:
    """Use Groq to draft a supplier outreach email."""
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key or api_key == "gsk_your_key_here":
        return FALLBACK_EMAIL

    alt      = verdict.get("alternative_suppliers", [{}])
    alt_name = alt[0].get("name", "alternative supplier") if alt else "alternative supplier"

    prompt = f"""Draft a professional procurement email from {company}'s supply chain team
to {alt_name} requesting urgent capacity availability.

Context: {verdict.get('primary_risk', '')}
Timeline: {verdict.get('timeline', '')}
Risk level: {verdict.get('risk_level', '')}

Write a concise, professional email (subject line + body). No markdown. No JSON."""

    try:
        from groq import AsyncGroq
        client = AsyncGroq(api_key=api_key)
        msg = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}],
        )
        lines   = msg.choices[0].message.content.strip().split("\n")
        subject = lines[0].replace("Subject:", "").strip() if lines else "Urgent capacity inquiry"
        body    = "\n".join(lines[2:]) if len(lines) > 2 else msg.choices[0].message.content

        return {
            "type":    "email_draft",
            "to":      f"{alt_name} — procurement",
            "subject": subject,
            "body":    body,
        }
    except Exception:
        return FALLBACK_EMAIL
