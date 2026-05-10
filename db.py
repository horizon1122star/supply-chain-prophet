"""
db.py — Supabase client + query helpers.
Falls back gracefully if Supabase is not configured.
"""

import os
from typing import Optional

_client = None


def get_client():
    """Lazily initialize Supabase client."""
    global _client
    if _client is not None:
        return _client

    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_ANON_KEY", "")

    if not url or not key or url == "https://your-project.supabase.co":
        return None  # Not configured — callers handle None gracefully

    try:
        from supabase import create_client
        _client = create_client(url, key)
        return _client
    except Exception:
        return None


def get_suppliers_for_company(company: str) -> list:
    """Fetch supplier graph from Supabase for a given company."""
    client = get_client()
    if client is None:
        return []
    try:
        resp = (
            client
            .table("supplier_graph")
            .select("*")
            .ilike("company", f"%{company.split()[0]}%")
            .execute()
        )
        rows = resp.data or []
        return [
            {
                "name":        r.get("supplier", "Unknown"),
                "location":    r.get("region", "Unknown"),
                "category":    r.get("category", "Unknown"),
                "criticality": r.get("criticality", "monitor"),
                "lat":         r.get("lat", 0.0),
                "lon":         r.get("lon", 0.0),
            }
            for r in rows
        ]
    except Exception:
        return []


def get_similar_events(scenario: str, limit: int = 3) -> list:
    """Fetch similar historical disruption events from Supabase."""
    client = get_client()
    if client is None:
        return []
    try:
        keyword = scenario.split()[0].lower() if scenario else "default"
        resp = (
            client
            .table("disruption_events")
            .select("*")
            .ilike("type", f"%{keyword}%")
            .limit(limit)
            .execute()
        )
        rows = resp.data or []
        return [
            {
                "event":            r.get("description", "Historical event"),
                "similarity":       0.85,
                "outcome":          r.get("outcome", "Supply disruption"),
                "signal_lead_days": r.get("signal_lead_days", 0),
                "id":               str(r.get("id", "")),
            }
            for r in rows
        ]
    except Exception:
        return []


def save_scan_result(company: str, scenario: str, verdict: dict) -> None:
    """Persist a completed scan verdict to Supabase."""
    client = get_client()
    if client is None:
        return
    try:
        client.table("scan_results").insert({
            "company":  company,
            "scenario": scenario,
            "verdict":  verdict,
        }).execute()
    except Exception:
        pass  # Non-critical — never fail the scan due to DB write
