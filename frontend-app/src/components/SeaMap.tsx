"use client";
import { useEffect, useRef } from "react";
import type { VerdictData, AgentState } from "@/lib/types";

const HQ_COORD: [number, number] = [37.3346, -122.009];

// Accurate geographic locations
const LOCATION_INDEX: Record<string, [number, number]> = {
  "Taiwan Strait":     [24.5,  119.5],
  "Red Sea":           [15.5,   42.5],
  "Strait of Malacca": [2.5,  102.0],
  "Suez Canal":        [30.5,   32.3],
  "South China Sea":   [15.0,  114.0],
  "Cape of Good Hope": [-34.3,  18.5],
  "Strait of Hormuz":  [26.5,   56.3],
  "Taiwan":            [23.5,  121.0],
  "Vietnam":           [14.0,  108.0],
  "Rotterdam":         [51.9,    4.5],
  "Singapore":         [1.35,  103.8],
  "Kaohsiung":         [22.6,  120.3],
  "Germany":           [51.1,   10.4],
  "South Korea":       [37.56, 126.97],
  "Japan":             [35.68, 139.69],
  "China":             [35.86, 104.19],
  "India":             [20.59,  78.96],
  "USA":               [37.09, -95.71],
  "Denmark":           [55.68,  12.57],
  "Brazil":            [-14.23,-51.93],
  "Ireland":           [53.33,  -6.25],
};

const RISK_STYLE = {
  critical: { color: "#E24B4A", radius: 120000, opacity: 0.22 },
  elevated: { color: "#EF9F27", radius: 90000,  opacity: 0.18 },
  monitor:  { color: "#1D9E75", radius: 60000,  opacity: 0.14 },
};

// Real Pacific maritime route waypoints: US West Coast → Taiwan via Pacific
// Following the North Pacific great circle then down through Luzon Strait
const PACIFIC_ROUTE: [number, number][] = [
  [37.33, -122.01],  // San Francisco / Apple HQ
  [40.0,  -135.0],   // Pacific Ocean
  [44.0,  -155.0],   // North Pacific
  [48.0,  -170.0],   // Near Aleutians curve
  [45.0,  165.0],    // Western Pacific
  [38.0,  142.0],    // Near Japan coast
  [32.0,  130.0],    // East China Sea approach
  [26.0,  123.0],    // Luzon Strait
  [23.5,  121.0],    // Taiwan
  [22.6,  120.3],    // Kaohsiung
];

// Europe route: Taiwan → Strait of Malacca → Indian Ocean → Suez → Rotterdam
const EUROPE_ROUTE: [number, number][] = [
  [22.6,  120.3],   // Kaohsiung
  [15.0,  114.0],   // South China Sea
  [2.5,   102.0],   // Strait of Malacca
  [-5.0,   80.0],   // Indian Ocean
  [12.0,   50.0],   // Gulf of Aden
  [15.5,   42.5],   // Red Sea
  [27.0,   34.0],   // Northern Red Sea
  [30.5,   32.3],   // Suez Canal
  [32.0,   26.0],   // Mediterranean
  [37.0,   10.0],   // Western Mediterranean
  [40.0,   0.0],    // Gibraltar approach
  [46.0,   -3.0],   // Bay of Biscay
  [51.9,    4.5],   // Rotterdam
];

// Cape of Good Hope route (when Suez is blocked)
const CAPE_ROUTE: [number, number][] = [
  [22.6,  120.3],   // Kaohsiung
  [10.0,  110.0],   // South China Sea
  [2.5,   102.0],   // Strait of Malacca
  [-10.0,  80.0],   // Indian Ocean south
  [-25.0,  40.0],   // Southern Indian Ocean
  [-34.3,  18.5],   // Cape of Good Hope
  [-30.0,   5.0],   // South Atlantic
  [0.0,    -5.0],   // Equatorial Atlantic
  [20.0,  -15.0],   // North Atlantic approach
  [40.0,   -8.0],   // Iberian coast
  [51.9,    4.5],   // Rotterdam
];

// Generate a smooth Bezier-style curve from an array of waypoints
function generateCurvedPath(waypoints: [number, number][], tension = 0.3): [number, number][] {
  if (waypoints.length < 2) return waypoints;
  const smoothed: [number, number][] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p0 = waypoints[Math.max(0, i - 1)];
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const p3 = waypoints[Math.min(waypoints.length - 1, i + 2)];
    // Catmull-Rom interpolation with 10 sub-segments per pair
    for (let t = 0; t <= 1; t += 0.1) {
      const t2 = t * t, t3 = t2 * t;
      const lat =
        0.5 * ((2 * p1[0]) +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const lon =
        0.5 * ((2 * p1[1]) +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      smoothed.push([lat, lon]);
    }
  }
  smoothed.push(waypoints[waypoints.length - 1]);
  return smoothed;
}

interface SeaMapProps {
  verdict:  VerdictData | null;
  agents:   Record<string, AgentState>;
  scenario: string;
  scanning?: boolean;
}

export default function SeaMap({ verdict, agents, scanning }: SeaMapProps) {
  const mapRef          = useRef<HTMLDivElement>(null);
  const leafletRef      = useRef<any>(null);
  const shipLayersRef   = useRef<Record<string, any>>({});
  const wsRef           = useRef<WebSocket | null>(null);
  const weatherLayersRef    = useRef<any[]>([]);
  const logisticsLayersRef  = useRef<any[]>([]);
  const verdictLayersRef    = useRef<any[]>([]);
  const routeLayersRef      = useRef<any[]>([]);

  // 1. Initialize Map
  useEffect(() => {
    if (typeof window === "undefined" || leafletRef.current) return;
    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css"; link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      const map = L.map(mapRef.current, {
        center: [25, 110], zoom: 3,
        zoomControl: true, attributionControl: false,
        zoomAnimation: true, fadeAnimation: true, markerZoomAnimation: true,
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd", maxZoom: 18 }
      ).addTo(map);
      L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png",
        { opacity: 0.35 }
      ).addTo(map);
      leafletRef.current = map;
    });
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; }
    };
  }, []);

  // 2. AISStream WebSocket → live ship dots
  useEffect(() => {
    if (!scanning || !leafletRef.current) return;
    const apiKey = process.env.NEXT_PUBLIC_AISSTREAM_KEY;
    if (!apiKey) return;
    import("leaflet").then((L) => {
      const map = leafletRef.current;
      const socket = new WebSocket("wss://stream.aisstream.io/v0/stream");
      wsRef.current = socket;
      socket.onopen = () => {
        socket.send(JSON.stringify({
          APIKey: apiKey,
          BoundingBoxes: [[[-90, -180], [90, 180]]],
          FiltersShipMMSI: [],
          FilterMessageTypes: ["PositionReport"],
        }));
      };
      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.MessageType !== "PositionReport") return;
          const mmsi = msg.MetaData.MMSI;
          const lat  = msg.Message.PositionReport.Latitude;
          const lon  = msg.Message.PositionReport.Longitude;
          const hdg  = msg.Message.PositionReport.TrueHeading ?? 0;
          if (lat === 91 || lon === 181) return;
          const svgIcon = L.divIcon({
            className: "ship-marker",
            html: `<svg width="10" height="14" viewBox="0 0 10 14" style="transform:rotate(${hdg}deg);filter:drop-shadow(0 0 3px rgba(100,200,255,0.8))">
                     <polygon points="5,0 10,14 5,11 0,14" fill="rgba(100,210,255,0.75)" stroke="rgba(255,255,255,0.4)" stroke-width="0.5"/>
                   </svg>`,
            iconSize: [10, 14], iconAnchor: [5, 7],
          });
          if (shipLayersRef.current[mmsi]) {
            shipLayersRef.current[mmsi].setLatLng([lat, lon]);
            shipLayersRef.current[mmsi].setIcon(svgIcon);
          } else {
            if (Object.keys(shipLayersRef.current).length > 250) return;
            shipLayersRef.current[mmsi] = L.marker([lat, lon], { icon: svgIcon }).addTo(map);
          }
        } catch { /* ignore */ }
      };
    });
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, [scanning]);

  // 3. Draw shipping lane routes when scanning starts
  useEffect(() => {
    if (!scanning || !leafletRef.current) return;
    import("leaflet").then((L) => {
      const map = leafletRef.current;
      routeLayersRef.current.forEach(l => map.removeLayer(l));
      routeLayersRef.current = [];

      const pacificSmooth = generateCurvedPath(PACIFIC_ROUTE);
      const europeSmooth  = generateCurvedPath(EUROPE_ROUTE);

      // Draw main trade routes as subtle background paths
      const r1 = L.polyline(pacificSmooth, {
        color: "rgba(100,200,255,0.25)", weight: 1.5, dashArray: "4, 8", className: "animated-dash"
      }).addTo(map);
      const r2 = L.polyline(europeSmooth, {
        color: "rgba(100,200,255,0.25)", weight: 1.5, dashArray: "4, 8", className: "animated-dash"
      }).addTo(map);
      routeLayersRef.current.push(r1, r2);
    });
  }, [scanning]);

  // 4. Weather Lanes (Phase 2)
  useEffect(() => {
    if (!leafletRef.current) return;
    const weather = agents.weather;
    if (weather?.status !== "done" || !weather.data?.lane_details) return;
    import("leaflet").then((L) => {
      const map = leafletRef.current;
      weatherLayersRef.current.forEach(l => map.removeLayer(l));
      weatherLayersRef.current = [];
      const lanes = weather.data.lane_details as Record<string, any>;
      Object.values(lanes).forEach((lane) => {
        if (!lane.lat || !lane.lon) return;
        const color = lane.severity === "critical" ? "#E24B4A" : lane.severity === "elevated" ? "#EF9F27" : "#1D9E75";
        // Outer glow ring
        const outer = L.circle([lane.lat, lane.lon], {
          radius: 280000, color, fillColor: color, fillOpacity: 0.05,
          weight: 1, dashArray: "3, 6", className: "pulse-marker"
        }).addTo(map);
        // Inner solid ring
        const inner = L.circle([lane.lat, lane.lon], {
          radius: 150000, color, fillColor: color, fillOpacity: 0.15,
          weight: 2, className: "pulse-marker"
        }).addTo(map);
        const popup = `<div style="font-family:monospace;font-size:11px;line-height:1.6">
          <strong style="color:${color}">${lane.severity?.toUpperCase() ?? "HAZARD"}</strong><br/>
          Wind: ${lane.wind ?? "?"}km/h &nbsp;|&nbsp; Wave: ${lane.wave ?? "?"}m
        </div>`;
        inner.bindPopup(popup);
        weatherLayersRef.current.push(outer, inner);
      });
    });
  }, [agents.weather?.status]);

  // 5. Logistics Ports (Phase 3)
  useEffect(() => {
    if (!leafletRef.current) return;
    const logistics = agents.logistics;
    if (logistics?.status !== "done" || !logistics.data?.delayed_ports) return;
    import("leaflet").then((L) => {
      const map = leafletRef.current;
      logisticsLayersRef.current.forEach(l => map.removeLayer(l));
      logisticsLayersRef.current = [];
      const ports = logistics.data.delayed_ports as any[];
      ports.forEach((port) => {
        if (!port.lat || !port.lon) return;
        const icon = L.divIcon({
          className: "port-marker",
          html: `<div style="position:relative">
            <div style="width:14px;height:14px;background:#EF9F27;border-radius:50%;border:2px solid #fff;box-shadow:0 0 10px rgba(239,159,39,0.8);animation:pulse-ring 1.8s ease infinite"></div>
            <div style="position:absolute;top:16px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:9px;font-family:monospace;color:#EF9F27;font-weight:700;text-shadow:0 0 4px rgba(0,0,0,1)">+${port.delay_days}d</div>
          </div>`,
          iconSize: [14, 28], iconAnchor: [7, 7],
        });
        const marker = L.marker([port.lat, port.lon], { icon }).addTo(map);
        marker.bindPopup(`<div style="font-family:monospace;font-size:11px"><strong>${port.name}</strong><br/>Delay: ${port.delay_days} days</div>`);
        logisticsLayersRef.current.push(marker);
      });
    });
  }, [agents.logistics?.status]);

  // 6. Verdict: Risk Circles + Curved HQ Routes (Phase 4)
  useEffect(() => {
    if (!leafletRef.current || !verdict) return;
    import("leaflet").then((L) => {
      const map = leafletRef.current;
      verdictLayersRef.current.forEach(l => map.removeLayer(l));
      verdictLayersRef.current = [];

      // HQ marker with glow
      const hqIcon = L.divIcon({
        className: "hq-marker",
        html: `<div style="width:14px;height:14px;background:#fff;border-radius:50%;border:3px solid #64c8ff;box-shadow:0 0 16px rgba(100,200,255,0.9);position:relative">
          <div style="position:absolute;top:16px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:8px;font-family:monospace;color:#64c8ff;font-weight:700;text-shadow:0 0 4px rgba(0,0,0,1)">HQ</div>
        </div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      });
      const hqMarker = L.marker(HQ_COORD, { icon: hqIcon }).addTo(map);
      hqMarker.bindPopup(`<div style="font-family:monospace;font-size:11px"><strong>Company HQ</strong><br/>Cupertino, CA</div>`);
      verdictLayersRef.current.push(hqMarker);

      const bounds = L.latLngBounds([HQ_COORD]);

      verdict.affected_suppliers.forEach((s) => {
        const coords: [number, number] =
          LOCATION_INDEX[s.location] ?? LOCATION_INDEX[s.name] ??
          (s.lat && s.lon ? [s.lat, s.lon] : null as any);
        if (!coords) return;
        bounds.extend(coords);
        const style = RISK_STYLE[s.status as keyof typeof RISK_STYLE] ?? RISK_STYLE.monitor;

        // Risk circle with outer glow
        const outer = L.circle(coords, {
          radius: style.radius * 1.4,
          color: style.color, fillColor: style.color, fillOpacity: 0.06, weight: 1,
        }).addTo(map);
        const circle = L.circle(coords, {
          radius: style.radius, color: style.color,
          fillColor: style.color, fillOpacity: style.opacity, weight: 2,
        }).addTo(map);
        circle.bindPopup(`<div style="font-family:monospace;font-size:12px">
          <strong>${s.name}</strong><br/>
          ${s.category} · ${s.location}<br/>
          <span style="color:${style.color}">${s.status.toUpperCase()}</span>
        </div>`);
        verdictLayersRef.current.push(outer, circle);

        // Choose smartest route based on geography
        const isAsia = coords[1] > 60;
        const waypoints = isAsia ? PACIFIC_ROUTE : EUROPE_ROUTE;
        // Snap start/end to supplier coords
        const customRoute: [number, number][] = [HQ_COORD, ...waypoints.slice(1, -1), coords];
        const curved = generateCurvedPath(customRoute, 0.25);
        const line = L.polyline(curved, {
          color: style.color, weight: 2.5,
          dashArray: "8, 14", opacity: 0.9, className: "animated-dash",
        }).addTo(map);
        verdictLayersRef.current.push(line);
      });

      verdict.alternative_suppliers.forEach((s) => {
        const coords: [number, number] =
          LOCATION_INDEX[s.location] ??
          (s.lat && s.lon ? [s.lat, s.lon] : null as any);
        if (!coords) return;
        bounds.extend(coords);
        const icon = L.divIcon({
          className: "alt-supplier-marker",
          html: `<div style="width:12px;height:12px;background:#1D9E75;border-radius:50%;border:2px solid #fff;box-shadow:0 0 10px rgba(29,158,117,0.7)"></div>`,
          iconSize: [12, 12], iconAnchor: [6, 6],
        });
        const m = L.marker(coords, { icon }).addTo(map);
        m.bindPopup(`<div style="font-family:monospace;font-size:12px">
          <strong>${s.name}</strong><br/>
          ${s.category} · ${s.location}<br/>
          <span style="color:#1D9E75">ALTERNATIVE ✓</span>
        </div>`);
        verdictLayersRef.current.push(m);
      });

      map.flyToBounds(bounds, { padding: [60, 60], duration: 2.5, maxZoom: 6 });
    });
  }, [verdict]);

  return (
    <div className="seamap-wrap" style={{ position: "relative" }}>
      <h3 className="section-label">
        🗺 Supply Chain Risk Map
        {scanning && !verdict && (
          <span style={{ fontSize: "10px", color: "#64c8ff", marginLeft: 8, fontWeight: 400 }}>
            ● Live Feed Active
          </span>
        )}
      </h3>
      <div ref={mapRef} className="seamap-container" />

      {/* Dynamic Legend */}
      <div className="map-legend">
        {scanning && (
          <div className="map-legend-item">
            <span style={{ width: 10, height: 10, display: "inline-block", background: "rgba(100,200,255,0.6)", borderRadius: "50%", border: "1px solid rgba(100,200,255,0.8)" }} />
            Live Vessels
          </div>
        )}
        {scanning && (
          <div className="map-legend-item">
            <span style={{ width: 20, height: 2, display: "inline-block", borderBottom: "1.5px dashed rgba(100,200,255,0.4)" }} />
            Trade Routes
          </div>
        )}
        {(agents.weather?.status === "done" || verdict) && (<>
          <div className="map-legend-item">
            <span style={{ width: 10, height: 10, display: "inline-block", background: "rgba(226,75,74,0.4)", border: "2px solid #E24B4A", borderRadius: "50%" }} />
            Critical Hazard
          </div>
          <div className="map-legend-item">
            <span style={{ width: 10, height: 10, display: "inline-block", background: "rgba(239,159,39,0.4)", border: "2px solid #EF9F27", borderRadius: "50%" }} />
            Elevated Hazard
          </div>
        </>)}
        {agents.logistics?.status === "done" && (
          <div className="map-legend-item">
            <span style={{ width: 10, height: 10, display: "inline-block", background: "#EF9F27", borderRadius: "50%", boxShadow: "0 0 6px rgba(239,159,39,0.8)" }} />
            Delayed Port
          </div>
        )}
        {verdict && (<>
          <div className="map-legend-item">
            <span style={{ width: 10, height: 10, display: "inline-block", background: "#1D9E75", borderRadius: "50%", boxShadow: "0 0 6px rgba(29,158,117,0.7)" }} />
            Alt. Supplier
          </div>
          <div className="map-legend-item">
            <span style={{ width: 10, height: 10, display: "inline-block", background: "#64c8ff", borderRadius: "50%", border: "2px solid #fff" }} />
            Company HQ
          </div>
          <div className="map-legend-item">
            <span style={{ width: 20, height: 2, display: "inline-block", borderBottom: "1.5px dashed #E24B4A" }} />
            Affected Route
          </div>
        </>)}
      </div>
    </div>
  );
}
