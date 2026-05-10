"""
geo_resolver.py — Location string → (lat, lon) coordinate resolver.
Used by NewsAgent to geocode regions mentioned in article titles.
"""

LOCATION_INDEX = {
    # Shipping lanes
    "taiwan strait":        (24.5,   119.5),
    "red sea":              (20.0,    38.5),
    "strait of malacca":    (2.5,   102.0),
    "malacca":              (2.5,   102.0),
    "suez canal":           (30.5,    32.3),
    "suez":                 (30.0,    32.5),
    "bab-el-mandeb":        (12.5,    43.3),
    "south china sea":      (15.0,   114.0),
    "cape of good hope":    (-34.3,   18.5),
    "strait of hormuz":     (26.5,    56.3),
    "hormuz":               (26.5,    56.3),

    # Cities / ports
    "taipei":               (25.04,  121.56),
    "hualien":              (23.97,  121.6),
    "kaohsiung":            (22.6,   120.3),
    "singapore":            (1.35,   103.8),
    "rotterdam":            (51.9,     4.5),
    "hamburg":              (53.55,    9.99),
    "antwerp":              (51.22,    4.4),
    "shanghai":             (31.2,   121.5),
    "yokohama":             (35.4,   139.6),
    "ho chi minh":          (10.82,  106.63),
    "dubai":                (25.2,    55.3),
    "jeddah":               (21.5,    39.2),
    "colombo":              (6.93,    79.84),

    # Countries / regions
    "taiwan":               (23.5,   121.0),
    "china":                (35.86,  104.19),
    "japan":                (35.68,  139.69),
    "south korea":          (37.56,  126.97),
    "korea":                (37.56,  126.97),
    "vietnam":              (14.0,   108.0),
    "india":                (20.59,   78.96),
    "ukraine":              (48.38,   31.16),
    "russia":               (61.52,  105.31),
    "middle east":          (29.31,   42.46),
    "europe":               (50.0,    10.0),
    "southeast asia":       (10.0,   110.0),
    "united states":        (37.09,  -95.71),
    "usa":                  (37.09,  -95.71),
    "germany":              (51.1,    10.4),
    "ireland":              (53.33,   -6.25),
    "denmark":              (55.68,   12.57),
    "brazil":               (-14.23, -51.93),
    "global":               (0.0,     0.0),
}


def resolve_location(text: str) -> tuple | None:
    """Resolve a location name to (lat, lon) coordinates."""
    if not text:
        return None
    t = text.lower().strip()
    # Exact match first
    if t in LOCATION_INDEX:
        return LOCATION_INDEX[t]
    # Partial match
    for key, coords in LOCATION_INDEX.items():
        if key in t or t in key:
            return coords
    return None
