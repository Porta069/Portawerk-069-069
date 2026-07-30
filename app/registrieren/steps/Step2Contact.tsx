"use client";

// ─── Schritt 2 — Kontaktdaten + Passwort ──────────────────────────────────────
// Sammelt die Kontodaten in den Context. Das Konto wird erst im letzten Schritt
// (Abschluss) über /auth/registration/complete angelegt.

import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { Field, PrimaryButton, SectionLabel } from "@/app/components/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s()/-]{6,}$/;

export default function Step2Contact() {
  const { data, setContact, setReferredBy, setPassword, next } = useRegistration();
  const c = data.contact;

  const [touched, setTouched] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const errors = {
    firstName: c.firstName.trim().length < 1 ? "Bitte gib deinen Vornamen an." : "",
    lastName: c.lastName.trim().length < 1 ? "Bitte gib deinen Nachnamen an." : "",
    email: !EMAIL_RE.test(c.email) ? "Bitte gib eine gültige E-Mail-Adresse an." : "",
    phone: !PHONE_RE.test(c.phone) ? "Bitte gib eine gültige Telefonnummer an." : "",
    password:
      data.password.length < 10 ? "Mindestens 10 Zeichen (länger = sicherer)." : "",
  };
  const valid = !Object.values(errors).some(Boolean);

  // Passwortstärke (nur visuell)
  const pwLen = data.password.length;
  const strength = pwLen >= 16 ? 3 : pwLen >= 12 ? 2 : pwLen >= 10 ? 1 : 0;
  const strengthLabel = ["", "Ok", "Gut", "Stark"][strength];

  const handleNext = () => {
    setTouched(true);
    if (valid) next();
  };

  return (
    <div className="max-w-xl">
      <SectionLabel>Deine Kontaktdaten</SectionLabel>
      <p className="text-sm leading-relaxed mb-8" style={{ color: "#6B7280" }}>
        Damit erstellst du dein Konto. Deine Daten werden verschlüsselt gespeichert
        und nie ohne deine Zustimmung an Betriebe weitergegeben.
      </p>

      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            label="Vorname"
            value={c.firstName}
            onChange={(v) => setContact({ firstName: v })}
            placeholder="Max"
            autoComplete="given-name"
            required
            error={touched ? errors.firstName : undefined}
          />
          <Field
            label="Nachname"
            value={c.lastName}
            onChange={(v) => setContact({ lastName: v })}
            placeholder="Mustermann"
            autoComplete="family-name"
            required
            error={touched ? errors.lastName : undefined}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            label="E-Mail-Adresse"
            type="email"
            value={c.email}
            onChange={(v) => setContact({ email: v })}
            placeholder="max@beispiel.de"
            autoComplete="email"
            required
            hint="Damit meldest du dich später an — wird nie an Betriebe weitergegeben."
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

        {/* Passwort */}
        <div>
          <label
            className="flex items-center text-[10px] uppercase tracking-[0.16em] font-semibold mb-2"
            style={{ color: "rgba(26,26,46,0.45)" }}
          >
            Passwort<span className="text-accent ml-0.5">*</span>
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={data.password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mindestens 10 Zeichen"
              autoComplete="new-password"
              className="w-full bg-white text-primary text-sm px-4 py-3.5 pr-11 outline-none transition-all duration-200 placeholder:text-primary/20"
              style={{
                border: `1.5px solid ${
                  touched && errors.password
                    ? "#EF4444"
                    : data.password.length >= 10
                    ? "#1A1A2E"
                    : "#E5E7EB"
                }`,
                fontFamily: "var(--font-sans)",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
              aria-label={showPw ? "Passwort verbergen" : "Passwort anzeigen"}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {/* Stärke-Anzeige */}
          {pwLen > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 22,
                      height: 3,
                      background: i <= strength ? "#E8A838" : "#E5E7EB",
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] flex items-center gap-1" style={{ color: "#6B7280" }}>
                {strength >= 1 && <Check className="w-3 h-3" style={{ color: "#22C55E" }} strokeWidth={3} />}
                {strengthLabel || `${pwLen}/10`}
              </span>
            </div>
          )}
          {touched && errors.password && (
            <p className="text-xs mt-1.5" style={{ color: "#EF4444" }}>
              {errors.password}
            </p>
          )}
        </div>

        {/* Empfohlen von — nur der Name, nicht der ganze Link (optional) */}
        <Field
          label="Empfohlen von (Name)"
          value={data.referredBy}
          onChange={(v) => setReferredBy(v)}
          placeholder="z. B. max"
          hint="Hat dich jemand empfohlen? Gib einfach seinen Namen ein — nicht den ganzen Link. (Optional)"
        />
      </div>

      <div
        className="mt-10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{ borderTop: "1px solid #E5E7EB" }}
      >
        <p className="text-[11px]" style={{ color: "rgba(107,114,128,0.7)" }}>
          * Pflichtfelder
        </p>
        <PrimaryButton onClick={handleNext} disabled={!valid}>
          Weiter zur Verifizierung
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </PrimaryButton>
      </div>
    </div>
  );
}
