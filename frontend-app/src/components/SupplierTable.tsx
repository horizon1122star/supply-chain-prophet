// frontend-app/src/components/SupplierTable.tsx
"use client";
import type { AffectedSupplier, Supplier } from "@/lib/types";
import { MapPin, Factory } from "lucide-react";
import Cyber3DCard from "./Cyber3DCard";

const STATUS_CONFIG = {
  critical: { color: "#E24B4A", bg: "rgba(226,75,74,0.12)", label: "CRITICAL" },
  elevated: { color: "#EF9F27", bg: "rgba(239,159,39,0.12)", label: "ELEVATED" },
  monitor:  { color: "#1D9E75", bg: "rgba(29,158,117,0.12)", label: "MONITOR" },
};

function AffectedRow({ s }: { s: AffectedSupplier }) {
  const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.monitor;
  return (
    <tr className="supplier-row">
      <td className="supplier-name">{s.name}</td>
      <td className="supplier-location">
        <MapPin size={12} style={{display:'inline', marginRight:'4px'}} />
        {s.location}
      </td>
      <td className="supplier-category">{s.category}</td>
      <td>
        <span
          className="supplier-badge"
          style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.color }}
        >
          {cfg.label}
        </span>
      </td>
    </tr>
  );
}

function AltRow({ s }: { s: Supplier }) {
  return (
    <tr className="supplier-row alt-row">
      <td className="supplier-name">{s.name}</td>
      <td className="supplier-location">
        <MapPin size={12} style={{display:'inline', marginRight:'4px'}} />
        {s.location}
      </td>
      <td className="supplier-category">{s.category}</td>
      <td>
        <span className="supplier-badge alt-badge">ALTERNATIVE</span>
      </td>
    </tr>
  );
}

interface SupplierTableProps {
  affected:     AffectedSupplier[];
  alternatives: Supplier[];
}

export default function SupplierTable({ affected, alternatives }: SupplierTableProps) {
  return (
    <Cyber3DCard>
      <div className="supplier-table-wrap" style={{background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', height: '100%'}}>
        <h3 className="section-label">
          <Factory size={14} style={{marginRight:'4px'}} /> Supplier Risk Matrix
        </h3>
        <div className="table-scroll">
          <table className="supplier-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Location</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {affected.map((s) => <AffectedRow key={s.name} s={s} />)}
              {alternatives.map((s) => <AltRow key={s.name} s={s} />)}
            </tbody>
          </table>
        </div>
      </div>
    </Cyber3DCard>
  );
}
