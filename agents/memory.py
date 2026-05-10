"""
agents/memory.py — MemoryAgent
Queries Supabase for historical disruption events and supplier graph.
Falls back to hardcoded inference map when Supabase is not configured.
"""

import asyncio
from agents.base import BaseAgent
from db import get_suppliers_for_company, get_similar_events


def infer_suppliers(company: str) -> list:
    """Return known suppliers when company is not in DB.
    Covers 15+ major global companies for broad hackathon demo coverage.
    """
    inference_map = {
        "apple": [
            {"name": "TSMC", "location": "Taiwan", "category": "Semiconductors",
             "criticality": "critical", "lat": 24.76, "lon": 120.99},
            {"name": "Foxconn", "location": "Taiwan", "category": "Assembly",
             "criticality": "critical", "lat": 22.6, "lon": 120.3},
            {"name": "Murata Manufacturing", "location": "Japan", "category": "Components",
             "criticality": "important", "lat": 35.68, "lon": 139.69},
            {"name": "Samsung Display", "location": "South Korea", "category": "Displays",
             "criticality": "important", "lat": 37.56, "lon": 126.97},
            {"name": "Corning", "location": "USA", "category": "Glass",
             "criticality": "important", "lat": 42.15, "lon": -77.05},
        ],
        "samsung": [
            {"name": "TSMC", "location": "Taiwan", "category": "Foundry",
             "criticality": "critical", "lat": 24.76, "lon": 120.99},
            {"name": "SK Hynix", "location": "South Korea", "category": "Memory",
             "criticality": "critical", "lat": 37.39, "lon": 127.10},
            {"name": "Qualcomm", "location": "USA", "category": "Chipsets",
             "criticality": "important", "lat": 32.88, "lon": -117.22},
            {"name": "Sony Semiconductor", "location": "Japan", "category": "Image Sensors",
             "criticality": "important", "lat": 33.59, "lon": 130.42},
        ],
        "nokia": [
            {"name": "Flex Ltd", "location": "Singapore", "category": "EMS Assembly",
             "criticality": "critical", "lat": 1.35, "lon": 103.82},
            {"name": "Murata Manufacturing", "location": "Japan", "category": "RF Components",
             "criticality": "critical", "lat": 35.68, "lon": 139.69},
            {"name": "Qualcomm", "location": "USA", "category": "Chipsets",
             "criticality": "important", "lat": 32.88, "lon": -117.22},
            {"name": "Celestica", "location": "Canada", "category": "Network Hardware",
             "criticality": "important", "lat": 43.65, "lon": -79.38},
        ],
        "microsoft": [
            {"name": "TSMC", "location": "Taiwan", "category": "Cloud Chips",
             "criticality": "critical", "lat": 24.76, "lon": 120.99},
            {"name": "Foxconn", "location": "Taiwan", "category": "Xbox Assembly",
             "criticality": "critical", "lat": 22.6, "lon": 120.3},
            {"name": "Jabil", "location": "USA", "category": "Hardware Manufacturing",
             "criticality": "important", "lat": 27.97, "lon": -82.79},
            {"name": "Wistron", "location": "Taiwan", "category": "Server Assembly",
             "criticality": "important", "lat": 25.03, "lon": 121.56},
        ],
        "tesla": [
            {"name": "Panasonic", "location": "Japan", "category": "Battery Cells",
             "criticality": "critical", "lat": 34.73, "lon": 135.49},
            {"name": "CATL", "location": "China", "category": "Battery Packs",
             "criticality": "critical", "lat": 26.57, "lon": 119.00},
            {"name": "Bosch", "location": "Germany", "category": "Electronics",
             "criticality": "important", "lat": 48.78, "lon": 9.18},
            {"name": "Albemarle", "location": "USA", "category": "Lithium",
             "criticality": "important", "lat": 35.22, "lon": -80.84},
        ],
        "ford": [
            {"name": "Bosch", "location": "Germany", "category": "Electronics",
             "criticality": "critical", "lat": 48.78, "lon": 9.18},
            {"name": "BASF", "location": "Germany", "category": "Materials",
             "criticality": "important", "lat": 49.48, "lon": 8.47},
            {"name": "Aptiv", "location": "Ireland", "category": "Wiring",
             "criticality": "important", "lat": 53.33, "lon": -6.25},
            {"name": "Novelis", "location": "USA", "category": "Aluminium",
             "criticality": "important", "lat": 33.77, "lon": -84.39},
        ],
        "toyota": [
            {"name": "Denso", "location": "Japan", "category": "Auto Parts",
             "criticality": "critical", "lat": 34.75, "lon": 137.01},
            {"name": "Aisin", "location": "Japan", "category": "Drivetrain",
             "criticality": "critical", "lat": 34.83, "lon": 137.03},
            {"name": "Sumitomo Electric", "location": "Japan", "category": "Wiring",
             "criticality": "important", "lat": 34.69, "lon": 135.50},
            {"name": "Panasonic", "location": "Japan", "category": "Electronics",
             "criticality": "important", "lat": 34.73, "lon": 135.49},
        ],
        "amazon": [
            {"name": "Foxconn", "location": "Taiwan", "category": "Electronics",
             "criticality": "critical", "lat": 22.6, "lon": 120.3},
            {"name": "Samsung", "location": "South Korea", "category": "Semiconductors",
             "criticality": "important", "lat": 37.56, "lon": 126.97},
            {"name": "UPS", "location": "USA", "category": "Logistics",
             "criticality": "critical", "lat": 33.75, "lon": -84.39},
        ],
        "walmart": [
            {"name": "Yihua Timber", "location": "China", "category": "Furniture",
             "criticality": "critical", "lat": 23.13, "lon": 113.26},
            {"name": "Li & Fung", "location": "Hong Kong", "category": "Sourcing",
             "criticality": "critical", "lat": 22.32, "lon": 114.17},
            {"name": "Maersk", "location": "Denmark", "category": "Shipping",
             "criticality": "important", "lat": 55.68, "lon": 12.57},
            {"name": "FedEx", "location": "USA", "category": "Logistics",
             "criticality": "important", "lat": 35.14, "lon": -90.06},
        ],
        "nike": [
            {"name": "Pou Chen Group", "location": "Vietnam", "category": "Footwear Mfg",
             "criticality": "critical", "lat": 10.82, "lon": 106.63},
            {"name": "Feng Tay", "location": "Vietnam", "category": "Footwear Mfg",
             "criticality": "critical", "lat": 14.0, "lon": 108.0},
            {"name": "Eclat Textile", "location": "Taiwan", "category": "Apparel",
             "criticality": "important", "lat": 24.76, "lon": 120.99},
            {"name": "YKK", "location": "Japan", "category": "Fasteners",
             "criticality": "important", "lat": 36.69, "lon": 137.21},
        ],
        "starbucks": [
            {"name": "Vietnam robusta farms", "location": "Vietnam", "category": "Coffee",
             "criticality": "critical", "lat": 14.0, "lon": 108.0},
            {"name": "Brazil arabica farms", "location": "Brazil", "category": "Coffee",
             "criticality": "critical", "lat": -14.23, "lon": -51.93},
            {"name": "Maersk", "location": "Denmark", "category": "Logistics",
             "criticality": "important", "lat": 55.68, "lon": 12.57},
        ],
        "nestle": [
            {"name": "Olam International", "location": "Singapore", "category": "Cocoa/Coffee",
             "criticality": "critical", "lat": 1.35, "lon": 103.82},
            {"name": "Ivory Coast Farms", "location": "Ivory Coast", "category": "Cocoa",
             "criticality": "critical", "lat": 7.54, "lon": -5.55},
            {"name": "Tetra Pak", "location": "Sweden", "category": "Packaging",
             "criticality": "important", "lat": 55.60, "lon": 13.00},
        ],
        "pfizer": [
            {"name": "Lonza Group", "location": "Switzerland", "category": "API Manufacturing",
             "criticality": "critical", "lat": 47.55, "lon": 7.59},
            {"name": "Jubilant Pharmova", "location": "India", "category": "API Ingredients",
             "criticality": "critical", "lat": 28.70, "lon": 77.10},
            {"name": "Siegfried AG", "location": "Switzerland", "category": "Drug Manufacturing",
             "criticality": "important", "lat": 47.49, "lon": 8.74},
        ],
        "boeing": [
            {"name": "Spirit AeroSystems", "location": "USA", "category": "Fuselage",
             "criticality": "critical", "lat": 37.65, "lon": -97.43},
            {"name": "GE Aviation", "location": "USA", "category": "Engines",
             "criticality": "critical", "lat": 39.10, "lon": -84.51},
            {"name": "Safran", "location": "France", "category": "Landing Gear",
             "criticality": "important", "lat": 48.86, "lon": 2.35},
            {"name": "Allegheny Technologies", "location": "USA", "category": "Titanium",
             "criticality": "important", "lat": 40.44, "lon": -79.99},
        ],
    }

    key = company.lower().split()[0].rstrip(".,")
    return inference_map.get(key, [
        {"name": f"{company} Primary Supplier", "location": "Asia",
         "category": "Manufacturing", "criticality": "critical",
         "lat": 31.22, "lon": 121.46},
        {"name": f"{company} Components Vendor", "location": "Europe",
         "category": "Components", "criticality": "important",
         "lat": 50.11, "lon": 8.68},
        {"name": "Maersk Logistics", "location": "Denmark",
         "category": "Shipping", "criticality": "monitor",
         "lat": 55.68, "lon": 12.57},
    ])


class MemoryAgent(BaseAgent):
    name = "memory"

    async def _execute(self, company: str, scenario: str):
        yield self._event("status", "scanning",
                          log="▸ Searching supplier knowledge graph...")

        loop = asyncio.get_event_loop()

        # 1. Pull supplier graph
        suppliers = await loop.run_in_executor(
            None, get_suppliers_for_company, company
        )

        if not suppliers:
            yield self._event("log", "live",
                              log=f"▸ No DB entry for {company} — using inference")
            suppliers = infer_suppliers(company)

        for s in suppliers[:4]:
            yield self._event("log", "live",
                log=f"▸ Supplier: {s['name']} "
                    f"({s['location']} · {s['category']} · {s['criticality']})")
            await asyncio.sleep(0.2)

        # 2. Search for similar historical disruption events
        matches = await loop.run_in_executor(
            None, get_similar_events, scenario, 3
        )

        if not matches:
            # Use fallback historical data
            from fallbacks import MEMORY_FALLBACK
            fb = MEMORY_FALLBACK.get(scenario, MEMORY_FALLBACK["default"])
            matches = fb["result"]["matches"]

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
        suppliers = SUPPLIER_MAP.get(company, SUPPLIER_MAP.get("Apple Inc.", []))
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
