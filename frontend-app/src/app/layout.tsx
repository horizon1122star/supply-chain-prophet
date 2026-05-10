import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Supply Chain Prophet | AI Disruption Intelligence",
  description:
    "Multi-agent AI system that predicts supply chain disruptions before they happen. 6 specialized agents scanning news, markets, weather, logistics, memory, and geopolitics.",
  keywords: ["supply chain", "AI", "disruption prediction", "logistics", "risk intelligence"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
