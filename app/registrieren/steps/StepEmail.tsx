"use client";

// ─── Schritt 3 — E-Mail ───────────────────────────────────────────────────────
// Bewusst ein eigener, minimaler Schritt: ein Feld, keine Passwortregeln, keine
// Telefonnummer. Ab hier ist der Interessent erreichbar — wer später abbricht,
// ist damit kein verlorener Lead mehr.

import { useState } from "react";
import { Mail, Loader2, Check, Lock, BellRing } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { useEmailCheck, emailStatusMessage } from "@/lib/useEmailCheck";
import { StepHeading, NextButton, StepActions, ValueNote } from "@/app/components/wizard";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StepEmail() {
  const { data, setContact, next } = useRegistration();
  const email = data.contact.email;

  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  const { status, reason } = useEmailCheck(email);
  const statusMsg = emailStatusMessage(status, reason);

  const syntaxOk = EMAIL_RE.test(email);
  const error = !syntaxOk
    ? "Bitte gib eine gültige E-Mail-Adresse an."
    : status === "invalid"
    ? statusMsg ?? "Diese E-Mail scheint nicht zu existieren."
    : "";
  const showError = touched && !!error;
  const canProceed = syntaxOk && status !== "invalid";

  const submit = () => {
    setTouched(true);
    if (canProceed) next();
  };

  const borderColor = showError
    ? "#EF4444"
    : focused
    ? "#E8A838"
    : status === "valid"
    ? "#22C55E"
    : email
    ? "#1A1A2E"
    : "#E9E7E1";

  return (
    <div>
      <StepHeading eyebrow="Deine E-Mail">
        Wir melden uns nur, wenn eine Stelle wirklich zu deinem Profil passt.
      </StepHeading>

      <label
        className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-semibold mb-2.5"
        style={{ color: focused ? "#E8A838" : "rgba(26,26,46,0.45)" }}
      >
        E-Mail-Adresse <span style={{ color: "#E8A838" }}>*</span>
      </label>

      <div className="relative">
        <Mail
          className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none"
          style={{ color: focused ? "#E8A838" : "rgba(26,26,46,0.28)" }}
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
              ? "0 0 0 4px rgba(232,168,56,0.12)"
              : "0 2px 10px -6px rgba(26,26,46,0.12)",
            fontFamily: "var(--font-sans)",
          }}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2">
          {status === "checking" ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#E8A838" }} />
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

      <div className="mt-8 space-y-3">
        <ValueNote icon={BellRing}>
          Du bekommst nur Nachrichten zu passenden Stellen — keine Newsletter, keine
          Werbung von Dritten.
        </ValueNote>
        <ValueNote icon={Lock}>
          Kein Betrieb sieht deine Adresse. Erst wenn du einer Anfrage zustimmst,
          stellen wir den Kontakt her.
        </ValueNote>
      </div>

      <StepActions note="Passwort und Telefonnummer folgen erst später.">
        <NextButton onClick={submit} disabled={!syntaxOk || status === "invalid"}>
          Weiter
        </NextButton>
      </StepActions>
    </div>
  );
}
