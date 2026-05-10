// frontend-app/src/components/ActionCard.tsx
"use client";
import { Copy, Mail, Zap } from "lucide-react";
import Cyber3DCard from "./Cyber3DCard";

interface ActionCardProps {
  action: import("@/lib/types").EmailAction | null;
}

export default function ActionCard({ action }: ActionCardProps) {
  if (!action) return null;

  // `action.to` is e.g. "Samsung Foundry — procurement@samsung.com"
  // Extract a mailto address if embedded, otherwise leave it as display text only.
  const toRaw = action.to ?? "";
  const emailMatch = toRaw.match(/[\w.-]+@[\w.-]+\.\w+/);
  const mailtoAddress = emailMatch ? emailMatch[0] : "";

  const emailSubject = encodeURIComponent(action.subject);
  const emailBody    = encodeURIComponent(action.body);

  const handleNotify = () => {
    const href = mailtoAddress
      ? `mailto:${mailtoAddress}?subject=${emailSubject}&body=${emailBody}`
      : `mailto:?subject=${emailSubject}&body=${emailBody}`;
    window.open(href);
  };

  const handleCopy = () => {
    const text = `To: ${toRaw}\nSubject: ${action.subject}\n\n${action.body}`;
    navigator.clipboard.writeText(text);
    alert("Email draft copied to clipboard");
  };

  return (
    <Cyber3DCard>
      <div className="action-card">
        <div className="action-card-header">
          <Zap size={16} color="#1D9E75" />
          <h3>Automated Supplier Outreach</h3>
        </div>

        <div className="action-email-meta">
          <div className="email-field">
            <span className="email-label">To:</span>
            <span className="email-value">{toRaw}</span>
          </div>
          <div className="email-field">
            <span className="email-label">Subject:</span>
            <span className="email-value">{action.subject}</span>
          </div>
        </div>

        <pre className="action-email-body">{action.body}</pre>

        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={handleNotify}
          >
            <Mail size={14} /> Send via Email Client
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleCopy}
          >
            <Copy size={14} /> Copy Draft
          </button>
        </div>
      </div>
    </Cyber3DCard>
  );
}
