import { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  accentColor?: "primary" | "error" | "secondary" | "tertiary" | "none";
  style?: React.CSSProperties;
}

export default function Panel({
  children,
  className = "",
  glow = true,
  accentColor = "none",
  style,
}: PanelProps) {
  const accentBorderMap: Record<string, string> = {
    primary: "2px solid rgba(173,198,255,0.5)",
    error: "2px solid rgba(255,180,171,0.5)",
    secondary: "2px solid rgba(196,198,209,0.5)",
    tertiary: "2px solid rgba(201,198,197,0.4)",
    none: "none",
  };

  return (
    <div
      className={`${glow ? "flashlight-glow" : ""} ${className}`}
      style={{
        backgroundColor: "#1a2233",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "4px",
        borderLeft: accentBorderMap[accentColor],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
