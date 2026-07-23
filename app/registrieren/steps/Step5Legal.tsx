"use client";

// ─── Schritt 5 — Abschluss & rechtliche Zustimmung ────────────────────────────

import { useState } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";
import LegalConsentBox from "@/app/components/LegalConsent";
import { SectionLabel, PrimaryButton } from "@/app/components/ui";

export default function Step5Legal() {
  const { data, setLegal, next, setDraftToken } = useRegistration();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canComplete = data.legal.privacyAccepted && data.legal.termsAccepted;

  const handleComplete = async () => {
    if (!canComplete) return;

    // Passwort geht bei Reload verloren (nicht persistiert) — dann zurück zu Schritt 2.
    if (data.password.length < 10) {
      setError(
        "Dein Passwort fehlt (nach einem Neuladen wird es aus Sicherheitsgründen nicht gespeichert). Bitte gehe zu Schritt 2 (Kontaktdaten) zurück und gib es erneut ein."
      );
      return;
    }

    setLoading(true);
    setError(null);

    // Sicherstellen, dass eine gültige Registrierungs-Sitzung existiert.
    let draftToken = data.draftToken;
    if (!draftToken) {
      const started = await api.startRegistration();
      if (!started.ok) {
        setLoading(false);
        setError(started.error);
        return;
      }
      draftToken = started.data.draftToken;
      setDraftToken(draftToken);
    }

    const res = await api.completeRegistration({
      draftToken,
      firstName: data.contact.firstName.trim(),
      lastName: data.contact.lastName.trim(),
      email: data.contact.email.trim(),
      phone: data.contact.phone.trim(),
      password: data.password,
    });
    setLoading(false);
    if (res.ok) {
      login(res.data); // JWT-Session setzen → Dashboard verfügbar
      next(); // → success
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="max-w-xl">
      <SectionLabel>Fast geschafft — rechtliche Zustimmung</SectionLabel>
      <p className="text-sm leading-relaxed mb-8" style={{ color: "#6B7280" }}>
        Bevor wir dein Profil erstellen, bestätige bitte, dass du unsere Bedingungen
        gelesen hast. Beide Häkchen sind erforderlich.
      </p>

      <LegalConsentBox value={data.legal} onChange={setLegal} />

      <div
        className="mt-6 flex items-start gap-3 px-5 py-4"
        style={{ background: "rgba(26,26,46,0.04)", border: "1px solid #E5E7EB" }}
      >
        <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#E8A838" }} />
        <p className="text-[12px] leading-relaxed" style={{ color: "rgba(26,26,46,0.55)" }}>
          Deine Daten werden verschlüsselt gespeichert und ausschließlich intern
          genutzt. Kein Betrieb erhält Zugriff ohne deine ausdrückliche Zustimmung.
        </p>
      </div>

      {error && (
        <div
          className="mt-6 px-4 py-3 text-sm"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#B91C1C" }}
        >
          {error}
        </div>
      )}

      <div
        className="mt-10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{ borderTop: "1px solid #E5E7EB" }}
      >
        <p className="text-[11px]" style={{ color: "rgba(107,114,128,0.7)" }}>
          {canComplete ? "Bereit zum Abschluss ✓" : "Bitte beide Bedingungen akzeptieren."}
        </p>
        <PrimaryButton onClick={handleComplete} disabled={!canComplete} loading={loading}>
          {loading ? "Profil wird erstellt…" : "Profil abschließen"}
          {!loading && <BadgeCheck className="w-4 h-4" />}
        </PrimaryButton>
      </div>
    </div>
  );
}
