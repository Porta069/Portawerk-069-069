"use client";

// ─── Verifizierungs-Status-Badge ──────────────────────────────────────────────
// Zeigt ✓ Bestätigt oder ⏳ Ausstehend.

import { Check, Clock } from "lucide-react";

export default function VerificationStatus({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold"
        style={{
          background: "rgba(34,197,94,0.10)",
          color: "#16A34A",
          border: "1px solid rgba(34,197,94,0.30)",
        }}
      >
        <Check className="w-3 h-3" strokeWidth={3} />
        Bestätigt
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold"
      style={{
        background: "rgba(232,168,56,0.10)",
        color: "#B47B18",
        border: "1px solid rgba(232,168,56,0.30)",
      }}
    >
      <Clock className="w-3 h-3" />
      Ausstehend
    </span>
  );
}
