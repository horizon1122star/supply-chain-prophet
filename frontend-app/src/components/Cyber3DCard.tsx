// frontend-app/src/components/Cyber3DCard.tsx
"use client";
import React from "react";

interface Cyber3DCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: string;
}

export default function Cyber3DCard({ children, className = "" }: Cyber3DCardProps) {
  // Generate 25 trackers
  const trackers = Array.from({ length: 25 }, (_, i) => i + 1);

  return (
    <div className={`cyber-3d-wrapper ${className}`}>
      <div className="cyber-3d-container noselect">
        <div className="cyber-3d-canvas">
          {trackers.map((num) => (
            <div key={num} className={`tracker tr-${num}`} />
          ))}
          <div className="cyber-card">
            <div className="card-content">
              {/* Visual effects */}
              <div className="card-glare" />
              <div className="cyber-lines">
                <span /><span /><span /><span />
              </div>
              <div className="glowing-elements">
                <div className="glow-1" />
                <div className="glow-2" />
                <div className="glow-3" />
              </div>
              <div className="card-particles">
                <span /><span /><span /> <span /><span /><span />
              </div>
              <div className="corner-elements">
                <span /><span /><span /><span />
              </div>
              <div className="scan-line" />
              
              {/* Actual Content */}
              <div className="cyber-children-wrap">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
