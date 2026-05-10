"""
Supply Chain Prophet — Complete fallback data for all 6 agents.
Used when any live API is unavailable (rate limit, no key, network error).
"""

# ── NEWS ────────────────────────────────────────────────────────────────────
NEWS_FALLBACK = {
    "Taiwan earthquake": {
        "logs": [
            "⚠ M7.4 earthquake near Hualien, Taiwan",
            "⚠ TSMC confirms suspension at 2 fabs",
            "▸ Foxconn structural inspection underway",
            "▸ Apple supplier network on high alert",
            "▸ 14 articles indexed · 3 high-severity signals",
        ],
        "result": {
            "signals": [
                {"title": "TSMC fab suspension after M7.4 earthquake", "url": "",
                 "severity": "high", "published": "2025-04-03T09:12:00Z",
                 "region": "Taiwan", "lat": 24.76, "lon": 120.99},
                {"title": "Foxconn Kaohsiung plant inspection ordered", "url": "",
                 "severity": "high", "published": "2025-04-03T11:00:00Z",
                 "region": "Taiwan", "lat": 22.6, "lon": 120.3},
                {"title": "Semiconductor supply chain on alert after Taiwan quake", "url": "",
                 "severity": "medium", "published": "2025-04-03T14:00:00Z",
                 "region": "Taiwan", "lat": 23.5, "lon": 121.0},
            ],
            "count": 14, "high_count": 3
        }
    },
    "Red Sea tensions": {
        "logs": [
            "⚠ Houthi drone strike near Bab-el-Mandeb",
            "⚠ Lloyd's war risk premium elevated",
            "▸ 43 vessels rerouting via Cape of Good Hope",
            "▸ Suez Canal throughput down 31%",
            "▸ 11 articles indexed · 4 high-severity signals",
        ],
        "result": {
            "signals": [
                {"title": "Houthi attacks force Red Sea shipping reroute", "url": "",
                 "severity": "high", "published": "2025-01-15T08:00:00Z",
                 "region": "Red Sea", "lat": 12.5, "lon": 43.3},
                {"title": "Suez Canal traffic down 60% amid security concerns", "url": "",
                 "severity": "high", "published": "2025-01-16T10:00:00Z",
                 "region": "Suez", "lat": 30.5, "lon": 32.3},
            ],
            "count": 11, "high_count": 4
        }
    },
    "Vietnam drought": {
        "logs": [
            "⚠ Central Highlands rainfall 60% below average",
            "⚠ Robusta coffee harvest forecast cut 20%",
            "▸ Vietnam agriculture ministry declares emergency",
            "▸ 8 articles indexed · 2 high-severity signals",
        ],
        "result": {
            "signals": [
                {"title": "Vietnam drought slashes coffee harvest forecast", "url": "",
                 "severity": "high", "published": "2023-08-10T07:00:00Z",
                 "region": "Vietnam", "lat": 14.0, "lon": 108.0},
            ],
            "count": 8, "high_count": 2
        }
    },
    "Rotterdam port strike": {
        "logs": [
            "⚠ Rotterdam dockers strike enters day 5",
            "⚠ 200+ vessels queued outside port",
            "▸ EU freight diverting to Antwerp, Hamburg",
            "▸ 9 articles indexed · 3 high-severity signals",
        ],
        "result": {
            "signals": [
                {"title": "Rotterdam port strike disrupts European supply chains", "url": "",
                 "severity": "high", "published": "2025-02-20T06:00:00Z",
                 "region": "Rotterdam", "lat": 51.9, "lon": 4.5},
            ],
            "count": 9, "high_count": 3
        }
    },
    "default": {
        "logs": [
            "▸ Scanning global news feeds...",
            "▸ 12 articles indexed · 2 moderate signals found",
        ],
        "result": {"signals": [], "count": 12, "high_count": 2}
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
            "▸ BZ=F crude: +2.1% (5d)",
        ],
        "result": {
            "prices": {"TSM": -6.4, "SMH": -4.2, "ZIM": 18.2, "NVDA": -3.8, "BZ=F": 2.1},
            "risk_score": 0.72
        }
    },
    "Red Sea tensions": {
        "logs": [
            "⚠ Brent crude: +6.1% (5d)",
            "⚠ ZIM shipping: +22.4% (5d)",
            "▸ SBLK bulk carriers: +14.1% (5d)",
            "▸ MATX: +9.3% (5d)",
        ],
        "result": {
            "prices": {"BZ=F": 6.1, "ZIM": 22.4, "SBLK": 14.1, "MATX": 9.3},
            "risk_score": 0.54
        }
    },
    "Vietnam drought": {
        "logs": [
            "▸ JO coffee futures: +12.3% (5d)",
            "▸ SBUX: –2.1% (5d)",
            "▸ Arabica futures elevated",
        ],
        "result": {
            "prices": {"JO": 12.3, "SBUX": -2.1, "BZ=F": 1.2},
            "risk_score": 0.38
        }
    },
    "Rotterdam port strike": {
        "logs": [
            "▸ DAC container ships: +8.4% (5d)",
            "⚠ XPO logistics: –3.1% (5d)",
            "▸ ZIM: +11.2% (5d)",
        ],
        "result": {
            "prices": {"DAC": 8.4, "ZIM": 11.2, "XPO": -3.1},
            "risk_score": 0.44
        }
    },
    "default": {
        "logs": ["▸ Markets scanned · moderate signals"],
        "result": {"prices": {"ZIM": 5.0, "BZ=F": 2.1}, "risk_score": 0.3}
    }
}

# ── WEATHER ─────────────────────────────────────────────────────────────────
WEATHER_FALLBACK = {
    "Taiwan earthquake": {
        "logs": [
            "⚠ Taiwan Strait: wind 72km/h · 3.8m swell · critical",
            "▸ Strait of Malacca: wind 18km/h · clear",
            "▸ Red Sea: wind 32km/h · clear",
            "▸ 1 lane at risk of 7 checked",
        ],
        "result": {
            "risky_lanes": ["Taiwan Strait"],
            "lane_details": {
                "Taiwan Strait": {
                    "wind": 72.4, "wave": 3.8, "rain": 18.0,
                    "severity": "critical", "lat": 24.5, "lon": 119.5
                }
            },
            "weather_risk_score": 0.4, "named_storms": []
        }
    },
    "Red Sea tensions": {
        "logs": [
            "▸ Red Sea: wind 45km/h · 2.1m swell · elevated",
            "▸ Suez Canal: wind 22km/h · clear",
            "▸ 1 lane at risk of 7 checked",
        ],
        "result": {
            "risky_lanes": ["Red Sea"],
            "lane_details": {
                "Red Sea": {
                    "wind": 45, "wave": 2.1, "rain": 5,
                    "severity": "elevated", "lat": 12.5, "lon": 43.3
                }
            },
            "weather_risk_score": 0.2, "named_storms": []
        }
    },
    "Vietnam drought": {
        "logs": [
            "⚠ Vietnam: rainfall 60% below seasonal average",
            "▸ South China Sea: clear conditions",
            "▸ Strait of Malacca: clear",
        ],
        "result": {
            "risky_lanes": ["South China Sea"],
            "lane_details": {
                "South China Sea": {
                    "wind": 25, "wave": 1.2, "rain": 2,
                    "severity": "clear", "lat": 15.0, "lon": 114.0
                }
            },
            "weather_risk_score": 0.1, "named_storms": []
        }
    },
    "Rotterdam port strike": {
        "logs": [
            "▸ Cape of Good Hope: wind 55km/h · elevated",
            "▸ North Sea: wind 38km/h · elevated",
            "▸ 2 lanes at risk of 7 checked",
        ],
        "result": {
            "risky_lanes": ["Cape of Good Hope"],
            "lane_details": {
                "Cape of Good Hope": {
                    "wind": 55, "wave": 3.2, "rain": 22,
                    "severity": "elevated", "lat": -34.3, "lon": 18.5
                }
            },
            "weather_risk_score": 0.2, "named_storms": []
        }
    },
    "default": {
        "logs": ["▸ All shipping lanes checked · conditions nominal"],
        "result": {
            "risky_lanes": [], "lane_details": {},
            "weather_risk_score": 0.1, "named_storms": []
        }
    }
}

# ── LOGISTICS ───────────────────────────────────────────────────────────────
LOGISTICS_FALLBACK = {
    "Taiwan earthquake": {
        "logs": [
            "⚠ 43 vessels rerouting from Kaohsiung",
            "⚠ Kaohsiung port: +6 day delay estimate",
            "▸ Shanghai port: normal operations",
            "▸ Singapore: normal operations",
        ],
        "result": {
            "rerouting_count": 43,
            "delayed_ports": [
                {"name": "Kaohsiung", "delay_days": 6, "lat": 22.6, "lon": 120.3}
            ],
            "affected_lanes": ["Taiwan Strait"],
            "logistics_risk_score": 0.65
        }
    },
    "Red Sea tensions": {
        "logs": [
            "⚠ Cape reroute adds +18 day transit time",
            "⚠ Suez throughput –31% week-on-week",
            "▸ Jeddah port: partial operations",
            "▸ 67 vessels rerouting detected",
        ],
        "result": {
            "rerouting_count": 67,
            "delayed_ports": [
                {"name": "Jeddah", "delay_days": 4, "lat": 21.5, "lon": 39.2}
            ],
            "affected_lanes": ["Red Sea", "Suez Canal"],
            "logistics_risk_score": 0.7
        }
    },
    "Vietnam drought": {
        "logs": [
            "▸ Ho Chi Minh City port: normal operations",
            "▸ South China Sea routes: clear",
            "▸ 8 vessels monitoring situation",
        ],
        "result": {
            "rerouting_count": 8,
            "delayed_ports": [],
            "affected_lanes": ["South China Sea"],
            "logistics_risk_score": 0.15
        }
    },
    "Rotterdam port strike": {
        "logs": [
            "⚠ Rotterdam: 200+ vessels queued — 8 day delay",
            "⚠ Antwerp receiving overflow traffic",
            "▸ Hamburg diversion routes active",
        ],
        "result": {
            "rerouting_count": 89,
            "delayed_ports": [
                {"name": "Rotterdam", "delay_days": 8, "lat": 51.9, "lon": 4.5}
            ],
            "affected_lanes": ["Cape of Good Hope"],
            "logistics_risk_score": 0.75
        }
    },
    "default": {
        "logs": ["▸ Port monitoring complete · normal operations"],
        "result": {
            "rerouting_count": 8, "delayed_ports": [],
            "affected_lanes": [], "logistics_risk_score": 0.1
        }
    }
}

# ── MEMORY / SUPPLIER GRAPH ──────────────────────────────────────────────────
SUPPLIER_MAP = {
    "Apple Inc.": [
        {"name": "TSMC", "location": "Taiwan", "category": "Semiconductors",
         "criticality": "critical", "lat": 24.76, "lon": 120.99},
        {"name": "Foxconn", "location": "Taiwan", "category": "Assembly",
         "criticality": "critical", "lat": 22.6, "lon": 120.3},
        {"name": "Murata Manufacturing", "location": "Japan", "category": "Components",
         "criticality": "important", "lat": 35.68, "lon": 139.69},
        {"name": "Corning", "location": "USA", "category": "Glass",
         "criticality": "important", "lat": 42.15, "lon": -77.05},
        {"name": "Samsung Display", "location": "South Korea", "category": "Displays",
         "criticality": "important", "lat": 37.56, "lon": 126.97},
    ],
    "Ford Motor Company": [
        {"name": "Bosch", "location": "Germany", "category": "Electronics",
         "criticality": "critical", "lat": 48.78, "lon": 9.18},
        {"name": "BASF", "location": "Germany", "category": "Materials",
         "criticality": "important", "lat": 49.48, "lon": 8.47},
        {"name": "Aptiv", "location": "Ireland", "category": "Wiring",
         "criticality": "important", "lat": 53.33, "lon": -6.25},
        {"name": "Novelis", "location": "USA", "category": "Aluminium",
         "criticality": "important", "lat": 33.77, "lon": -84.39},
    ],
    "Starbucks Corporation": [
        {"name": "Vietnam robusta farms", "location": "Vietnam", "category": "Coffee",
         "criticality": "critical", "lat": 14.0, "lon": 108.0},
        {"name": "Brazil arabica farms", "location": "Brazil", "category": "Coffee",
         "criticality": "critical", "lat": -14.23, "lon": -51.93},
        {"name": "Maersk", "location": "Denmark", "category": "Logistics",
         "criticality": "important", "lat": 55.68, "lon": 12.57},
    ],
    "Amazon": [
        {"name": "Foxconn", "location": "Taiwan", "category": "Electronics",
         "criticality": "critical", "lat": 22.6, "lon": 120.3},
        {"name": "UPS", "location": "USA", "category": "Logistics",
         "criticality": "critical", "lat": 33.75, "lon": -84.39},
        {"name": "Samsung", "location": "South Korea", "category": "Semiconductors",
         "criticality": "important", "lat": 37.56, "lon": 126.97},
    ],
}

MEMORY_FALLBACK = {
    "Taiwan earthquake": {
        "logs": [
            "▸ Matched: Taiwan earthquake 2021 (87% similar)",
            "▸ Prior outcome: 6-week semiconductor shortage",
            "▸ Signals appeared 14 days before major impact",
            "▸ Matched: Hualien earthquake 2024 (79% similar)",
        ],
        "result": {
            "matches": [
                {
                    "event": "Taiwan earthquake Jul 2021",
                    "similarity": 0.87,
                    "outcome": "6-week semiconductor shortage, avg cost $1.8M per affected company",
                    "signal_lead_days": 14,
                    "id": "mock-001"
                },
                {
                    "event": "Hualien earthquake Apr 2024",
                    "similarity": 0.79,
                    "outcome": "TSMC brief suspension, 3-week supply tightening",
                    "signal_lead_days": 0,
                    "id": "mock-002"
                }
            ],
            "suppliers": SUPPLIER_MAP["Apple Inc."]
        }
    },
    "Red Sea tensions": {
        "logs": [
            "▸ Matched: Red Sea crisis Jan 2024 (94% similar)",
            "▸ Prior outcome: +18 day transit, +200% shipping cost",
            "▸ Signals appeared 11 days before major rerouting",
        ],
        "result": {
            "matches": [
                {
                    "event": "Red Sea Houthi attacks Jan 2024",
                    "similarity": 0.94,
                    "outcome": "60% traffic rerouted, shipping costs up 200%, +18 days transit",
                    "signal_lead_days": 11,
                    "id": "mock-003"
                }
            ],
            "suppliers": SUPPLIER_MAP.get("Starbucks Corporation", [])
        }
    },
    "default": {
        "logs": ["▸ 2 historical matches found"],
        "result": {"matches": [], "suppliers": []}
    }
}

# ── GEOPOLITICAL ────────────────────────────────────────────────────────────
GEO_FALLBACK = {
    "Taiwan earthquake": {
        "logs": [
            "▸ Cross-strait tension: monitoring",
            "▸ GDELT tone score: –2.1",
            "▸ No new sanctions detected",
            "▸ PLA exercise proximity elevated",
        ],
        "result": {
            "events": [
                {
                    "type": "conflict",
                    "region": "Taiwan",
                    "description": "Cross-strait tensions elevated following military exercises",
                    "gdelt_tone": -2.1,
                    "lat": 23.5, "lon": 121.0
                }
            ],
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
            "events": [
                {
                    "type": "conflict",
                    "region": "Red Sea",
                    "description": "Houthi attacks on commercial shipping intensify",
                    "gdelt_tone": -5.4,
                    "lat": 15.5, "lon": 42.5
                }
            ],
            "signal_strength": "high", "geo_risk_score": 0.6
        }
    },
    "Vietnam drought": {
        "logs": [
            "▸ Vietnam: stable political environment",
            "▸ GDELT tone: –0.8 (low risk)",
            "▸ No sanctions or conflicts detected",
        ],
        "result": {
            "events": [],
            "signal_strength": "low", "geo_risk_score": 0.1
        }
    },
    "Rotterdam port strike": {
        "logs": [
            "⚠ Dutch labor unions escalating demands",
            "▸ EU mediation ongoing",
            "▸ GDELT tone: –3.2",
        ],
        "result": {
            "events": [
                {
                    "type": "protest",
                    "region": "Europe",
                    "description": "Rotterdam dockers strike amid wage dispute",
                    "gdelt_tone": -3.2,
                    "lat": 51.9, "lon": 4.5
                }
            ],
            "signal_strength": "medium", "geo_risk_score": 0.35
        }
    },
    "default": {
        "logs": ["▸ GDELT scan complete · low geopolitical signal"],
        "result": {"events": [], "signal_strength": "low", "geo_risk_score": 0.1}
    }
}

# ── ORCHESTRATOR FALLBACKS ───────────────────────────────────────────────────
# NOTE: Only used if BOTH Groq AND _build_smart_fallback fail entirely.
# In practice _build_smart_fallback always runs first using real agent data.
FALLBACK_VERDICT = {
    "probability": 62,
    "timeline": "14-21 days",
    "risk_level": "medium",
    "primary_risk": "Supply chain disruption risk detected — primary suppliers may face operational delays",
    "affected_suppliers": [
        {"name": "Primary Supplier A", "location": "Taiwan", "category": "Semiconductors",
         "status": "elevated", "lat": 24.76, "lon": 120.99},
        {"name": "Primary Supplier B", "location": "Singapore", "category": "Assembly",
         "status": "monitor", "lat": 1.35, "lon": 103.82},
    ],
    "alternative_suppliers": [
        {"name": "Alternative Supplier X", "location": "South Korea", "category": "Semiconductors",
         "lat": 37.56, "lon": 126.97},
        {"name": "Alternative Supplier Y", "location": "USA", "category": "Manufacturing",
         "lat": 37.09, "lon": -95.71},
    ],
    "actions": [
        "Identify and contact alternative suppliers within 72 hours",
        "Review safety stock levels and increase buffer inventory",
        "Monitor affected shipping lanes and prepare rerouting contingencies",
    ],
    "cost_estimates": {"disruption_cost": 1500000, "mitigation_cost": 225000},
    "signal_breakdown": {
        "news": 0.5, "financial": 0.45, "weather": 0.3,
        "logistics": 0.5, "memory": 0.4, "geopolitical": 0.25
    }
}

FALLBACK_EMAIL = {
    "type": "email_draft",
    "to": "Alternative Supplier — procurement",
    "subject": "Urgent: Supply capacity inquiry — contingency planning",
    "body": (
        "Dear Procurement Team,\n\n"
        "We are reaching out regarding a potential disruption to our current supply chain. "
        "Our intelligence systems have detected elevated risk signals that may affect "
        "our primary suppliers in the near term.\n\n"
        "We would like to explore emergency capacity availability for the following:\n"
        "- Components/manufacturing capacity\n"
        "- Estimated volume: To be confirmed\n"
        "- Timeline: Immediate to 30 days\n\n"
        "Could we schedule a call within the next 24 hours to discuss options?\n\n"
        "Best regards,\nSupply Chain Intelligence Team"
    )
}
