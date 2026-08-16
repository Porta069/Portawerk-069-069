"use client";

// ─── Legal-Zustimmung ─────────────────────────────────────────────────────────
// Große, mobil gut klickbare Checkboxen für Datenschutz & Nutzungsbedingungen.

import Link from "next/link";
import { RECHTSTEXTE_VERSION } from "@/lib/legal";
import { Check } from "lucide-react";
import type { LegalConsent } from "@/lib/types";

function ConsentRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-start gap-3.5 w-full text-left px-4 py-4 transition-all duration-200"
      style={{
        border: `1.5px solid ${checked ? "#E8A838" : "#E5E7EB"}`,
        background: checked ? "rgba(232,168,56,0.05)" : "white",
      }}
    >
      <span
        className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
        style={{
          border: `1.5px solid ${checked ? "#E8A838" : "#D1D5DB"}`,
          background: checked ? "#E8A838" : "white",
        }}
      >
        {checked && <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />}
      </span>
      <span className="text-sm leading-relaxed" style={{ color: "rgba(26,26,46,0.75)" }}>
        {children}
      </span>
    </button>
  );
}

export default function LegalConsentBox({
  value,
  onChange,
}: {
  value: LegalConsent;
  onChange: (patch: Partial<LegalConsent>) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[11.5px]" style={{ color: "rgba(26,26,46,0.45)" }}>
        Fassung vom {RECHTSTEXTE_VERSION}. Zeitpunkt und Fassung deiner
        Zustimmung halten wir bei deinem Konto fest; du findest sie in deinem
        Datenexport.
      </p>
      <ConsentRow
        checked={value.privacyAccepted}
        onToggle={() => onChange({ privacyAccepted: !value.privacyAccepted })}
      >
        Ich habe die{" "}
        <Link
          href="/rechtliches#datenschutz"
          target="_blank"
          className="font-semibold underline decoration-accent/50 underline-offset-2 hover:text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          Datenschutzerklärung
        </Link>{" "}
        gelesen und akzeptiere sie.
      </ConsentRow>

      <ConsentRow
        checked={value.termsAccepted}
        onToggle={() => onChange({ termsAccepted: !value.termsAccepted })}
      >
        Ich akzeptiere die{" "}
        <Link
          href="/rechtliches#nutzungsbedingungen"
          target="_blank"
          className="font-semibold underline decoration-accent/50 underline-offset-2 hover:text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          Nutzungsbedingungen
        </Link>
        .
      </ConsentRow>
    </div>
  );
}
