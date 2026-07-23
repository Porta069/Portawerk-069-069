"use client";

// ─── Schritt 2 — Kontaktdaten ─────────────────────────────────────────────────

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { api } from "@/lib/api";
import { Field, PrimaryButton, SectionLabel } from "@/app/components/ui";

// ── Client-seitige Validierung ──
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s()/-]{6,}$/;

export default function Step2Contact() {
  const { data, setContact, next } = useRegistration();
  const c = data.contact;

  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const errors = {
    fullName: c.fullName.trim().length < 2 ? "Bitte gib deinen vollen Namen an." : "",
    email: !EMAIL_RE.test(c.email) ? "Bitte gib eine gültige E-Mail-Adresse an." : "",
    phone: !PHONE_RE.test(c.phone) ? "Bitte gib eine gültige Telefonnummer an." : "",
  };
  const valid = !errors.fullName && !errors.email && !errors.phone;

  const handleNext = async () => {
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    setApiError(null);
    const res = await api.register(data.contact, data.surveyAnswers);
    setLoading(false);
    if (res.ok) next();
    else setApiError(res.error);
  };

  return (
    <div className="max-w-xl">
      <SectionLabel>Deine Kontaktdaten</SectionLabel>
      <p className="text-sm leading-relaxed mb-8" style={{ color: "#6B7280" }}>
        Diese Angaben nutzen wir für deinen Verifizierungscode und die persönliche
        Kontaktaufnahme — sie werden nie ohne deine Zustimmung an Betriebe weitergegeben.
      </p>

      <div className="space-y-5">
        <Field
          label="Voller Name"
          value={c.fullName}
          onChange={(v) => setContact({ fullName: v })}
          placeholder="Max Mustermann"
          autoComplete="name"
          required
          error={touched ? errors.fullName : undefined}
        />
        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            label="E-Mail-Adresse"
            type="email"
            value={c.email}
            onChange={(v) => setContact({ email: v })}
            placeholder="max@beispiel.de"
            autoComplete="email"
            required
            hint="Für deinen Verifizierungs-Link — wird nie an Betriebe weitergegeben."
            error={touched ? errors.email : undefined}
          />
          <Field
            label="Telefonnummer"
            type="tel"
            value={c.phone}
            onChange={(v) => setContact({ phone: v })}
            placeholder="+49 170 1234567"
            autoComplete="tel"
            required
            hint="Für den SMS-Sicherheitscode und unsere persönliche Kontaktaufnahme."
            error={touched ? errors.phone : undefined}
          />
        </div>
      </div>

      {apiError && (
        <div
          className="mt-6 px-4 py-3 text-sm"
          style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#B91C1C",
          }}
        >
          {apiError}
        </div>
      )}

      <div
        className="mt-10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{ borderTop: "1px solid #E5E7EB" }}
      >
        <p className="text-[11px]" style={{ color: "rgba(107,114,128,0.7)" }}>
          * Pflichtfelder
        </p>
        <PrimaryButton onClick={handleNext} disabled={!valid} loading={loading}>
          {loading ? "Wird gespeichert…" : "Weiter zur Verifizierung"}
          {!loading && (
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          )}
        </PrimaryButton>
      </div>
    </div>
  );
}
