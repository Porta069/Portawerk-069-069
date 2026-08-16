"use client";

// ─── Schritt 3 — E-Mail ───────────────────────────────────────────────────────
// Bewusst ein eigener, minimaler Schritt: ein Feld, keine Passwortregeln, keine
// Telefonnummer. Ab hier ist der Interessent erreichbar — wer später abbricht,
// ist damit kein verlorener Lead mehr.

import { useState } from "react";
import { Mail, Loader2, Check, Lock, BellRing, MessageCircle, Phone } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { useEmailCheck, emailStatusMessage, suggestEmail } from "@/lib/useEmailCheck";
import { StepHeading, NextButton, StepActions, ValueNote } from "@/app/components/wizard";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s()/-]{6,}$/;

export default function StepEmail() {
  const { data, setContact, next } = useRegistration();
  const email = data.contact.email;
  const phone = data.contact.phone;

  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  // Telefon ist hier bewusst optional: der Schritt soll leicht bleiben. Wer sie
  // angibt, ist per WhatsApp erreichbar — auch wenn er den Funnel später abbricht.
  const phoneOk = phone.trim() === "" || PHONE_RE.test(phone);

  const { status, reason } = useEmailCheck(email);
  const statusMsg = emailStatusMessage(status, reason);
  const suggestion = suggestEmail(email.trim());

  const syntaxOk = EMAIL_RE.test(email);
  const error = !syntaxOk
    ? "Bitte gib eine gültige E-Mail-Adresse an."
    : status === "invalid"
    ? statusMsg ?? "Diese E-Mail scheint nicht zu existieren."
    : "";
  const showError = touched && !!error;
  const canProceed = syntaxOk && status !== "invalid" && phoneOk;

  const submit = () => {
    setTouched(true);
    if (canProceed) next();
  };

  const borderColor = showError
    ? "#EF4444"
    : focused
    ? "#F9AD07"
    : status === "valid"
    ? "#22C55E"
    : email
    ? "#0C3330"
    : "#E4DFD3";

  return (
    <div>
      <StepHeading eyebrow="Deine E-Mail">
        Wir melden uns nur, wenn eine Stelle wirklich zu deinem Profil passt.
      </StepHeading>

      <label
        className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-semibold mb-2.5"
        style={{ color: focused ? "#F9AD07" : "rgba(12, 51, 48,0.45)" }}
      >
        E-Mail-Adresse <span style={{ color: "#F9AD07" }}>*</span>
      </label>

      <div className="relative">
        <Mail
          className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none"
          style={{ color: focused ? "#F9AD07" : "rgba(12, 51, 48,0.28)" }}
        />
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setContact({ email: e.target.value })}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setTouched(true);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="name@beispiel.de"
          className="w-full rounded-2xl bg-white text-primary text-[15px] pl-12 pr-12 py-4 outline-none transition-all duration-200 placeholder:text-primary/20"
          style={{
            border: `1.5px solid ${borderColor}`,
            boxShadow: focused
              ? "0 0 0 4px rgba(249, 173, 7,0.12)"
              : "0 2px 10px -6px rgba(12, 51, 48,0.12)",
            fontFamily: "var(--font-sans)",
          }}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2">
          {status === "checking" ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#F9AD07" }} />
          ) : status === "valid" ? (
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "#22C55E" }}
            >
              <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
            </span>
          ) : null}
        </span>
      </div>

      {showError ? (
        <p className="text-[13px] mt-2.5" style={{ color: "#EF4444" }}>
          {error}
        </p>
      ) : status === "valid" ? (
        <p className="text-[13px] mt-2.5" style={{ color: "#16A34A" }}>
          Adresse sieht gut aus.
        </p>
      ) : null}

      {/* Tippfehler-Vorschlag: gmial.com → gmail.com, gxm.de → gmx.de … */}
      {suggestion && (
        <p className="text-[13px] mt-2.5" style={{ color: "rgba(12, 51, 48,0.6)" }}>
          Meintest du{" "}
          <button
            type="button"
            onClick={() => setContact({ email: suggestion })}
            className="font-bold underline underline-offset-2"
            style={{ color: "#8A5F04" }}
          >
            {suggestion}
          </button>
          ?
        </p>
      )}

      {/* ── Handynummer (optional) — für die WhatsApp-Ansprache ── */}
      <div className="mt-8">
        <label
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-semibold mb-2.5"
          style={{ color: phoneFocused ? "#F9AD07" : "rgba(12, 51, 48,0.45)" }}
        >
          Handynummer
          <span className="normal-case tracking-normal font-medium" style={{ color: "rgba(12, 51, 48,0.35)" }}>
            (optional)
          </span>
        </label>
        <div className="relative">
          <Phone
            className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none"
            style={{ color: phoneFocused ? "#F9AD07" : "rgba(12, 51, 48,0.28)" }}
          />
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setContact({ phone: e.target.value })}
            onFocus={() => setPhoneFocused(true)}
            onBlur={() => setPhoneFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="+49 170 1234567"
            className="w-full rounded-2xl bg-white text-primary text-[15px] pl-12 pr-4 py-4 outline-none transition-all duration-200 placeholder:text-primary/20"
            style={{
              border: `1.5px solid ${
                !phoneOk ? "#EF4444" : phoneFocused ? "#F9AD07" : phone ? "#0C3330" : "#E4DFD3"
              }`,
              boxShadow: phoneFocused
                ? "0 0 0 4px rgba(249, 173, 7,0.12)"
                : "0 2px 10px -6px rgba(12, 51, 48,0.12)",
              fontFamily: "var(--font-sans)",
            }}
          />
        </div>
        {!phoneOk && (
          <p className="text-[13px] mt-2.5" style={{ color: "#EF4444" }}>
            Diese Nummer sieht nicht gültig aus.
          </p>
        )}
      </div>

      <div className="mt-8 space-y-3">
        <ValueNote icon={MessageCircle}>
          Mit Handynummer melden wir uns auf Wunsch per <strong>WhatsApp</strong> — die
          meisten Betriebe antworten so am schnellsten. Rein optional, du kannst sie
          jederzeit wieder entfernen.
        </ValueNote>
        <ValueNote icon={BellRing}>
          Du bekommst nur Nachrichten zu passenden Stellen — keine Newsletter, keine
          Werbung von Dritten.
        </ValueNote>
        <ValueNote icon={Lock}>
          Kein Betrieb sieht deine Daten. Erst wenn du einer Anfrage zustimmst,
          stellen wir den Kontakt her.
        </ValueNote>
      </div>

      <StepActions note="Das Passwort folgt erst später.">
        <NextButton onClick={submit} disabled={!syntaxOk || status === "invalid" || !phoneOk}>
          Weiter
        </NextButton>
      </StepActions>
    </div>
  );
}
