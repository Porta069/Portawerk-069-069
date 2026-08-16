"use client";

// ─── Schritt 5 — Dein Zugang ──────────────────────────────────────────────────
// Die teuren Felder (Telefon, Passwort) kommen bewusst erst hier: der Nutzer hat
// vier Schritte investiert, die E-Mail liegt bereits vor. Die rechtliche
// Zustimmung ist mit hineingezogen — das spart einen eigenen Schritt.

import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { Field } from "@/app/components/ui";
import PasswordStrength from "@/app/components/PasswordStrength";
import AvatarUpload from "@/app/components/AvatarUpload";
import LegalConsentBox from "@/app/components/LegalConsent";
import { evaluatePassword } from "@/lib/password";
import {
  StepHeading, QuestionBlock, NextButton, StepActions, ValueNote,
} from "@/app/components/wizard";

const PHONE_RE = /^[+]?[\d\s()/-]{6,}$/;

export default function StepKonto() {
  const { data, setContact, setReferredBy, setPassword, setAvatar, setLegal, next } =
    useRegistration();
  const c = data.contact;

  const [touched, setTouched] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const pw = evaluatePassword(data.password);

  const errors = {
    firstName: c.firstName.trim().length < 1 ? "Bitte gib deinen Vornamen an." : "",
    lastName: c.lastName.trim().length < 1 ? "Bitte gib deinen Nachnamen an." : "",
    phone: !PHONE_RE.test(c.phone) ? "Bitte gib eine gültige Telefonnummer an." : "",
    password: !pw.valid ? "Bitte erfülle alle Passwort-Kriterien." : "",
  };
  const formOk = Object.values(errors).every((e) => !e);
  const legalOk = data.legal.privacyAccepted && data.legal.termsAccepted;
  const canProceed = formOk && legalOk;

  const submit = () => {
    setTouched(true);
    if (canProceed) next();
  };

  return (
    <div>
      <StepHeading eyebrow="Dein Zugang">
        Fast fertig. Diese Angaben brauchen wir, damit Betriebe dich erreichen können
        — und damit du dich später wieder einloggen kannst.
      </StepHeading>

      <QuestionBlock title="Profilbild" hint="Optional — Profile mit Bild werden häufiger angeschrieben.">
        <AvatarUpload value={data.avatar || null} onChange={(v) => setAvatar(v ?? "")} />
      </QuestionBlock>

      <QuestionBlock index={1} title="Wie heißt du?">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Vorname"
            required
            value={c.firstName}
            onChange={(v) => setContact({ firstName: v })}
            error={touched ? errors.firstName : ""}
            autoComplete="given-name"
          />
          <Field
            label="Nachname"
            required
            value={c.lastName}
            onChange={(v) => setContact({ lastName: v })}
            error={touched ? errors.lastName : ""}
            autoComplete="family-name"
          />
        </div>
      </QuestionBlock>

      <QuestionBlock index={2} title="Wie erreichen wir dich telefonisch?">
        <Field
          label="Telefonnummer"
          type="tel"
          required
          value={c.phone}
          onChange={(v) => setContact({ phone: v })}
          error={touched ? errors.phone : ""}
          placeholder="+49 …"
          hint="Betriebe sehen deine Nummer erst, wenn du einer Anfrage zustimmst."
          autoComplete="tel"
        />
      </QuestionBlock>

      <QuestionBlock index={3} title="Wähl ein Passwort">
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={data.password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sicheres Passwort wählen"
            autoComplete="new-password"
            className="w-full rounded-2xl bg-white text-primary text-[15px] px-4 pr-12 py-4 outline-none transition-all duration-200 placeholder:text-primary/20"
            style={{
              border: `1.5px solid ${
                touched && errors.password ? "#EF4444" : data.password ? "#1A1A2E" : "#E9E7E1"
              }`,
              boxShadow: "0 2px 10px -6px rgba(26,26,46,0.12)",
              fontFamily: "var(--font-sans)",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            aria-label={showPw ? "Passwort verbergen" : "Passwort anzeigen"}
            className="absolute right-4 top-1/2 -translate-y-1/2"
            style={{ color: "rgba(26,26,46,0.35)" }}
          >
            {showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        </div>
        <div className="mt-3">
          <PasswordStrength password={data.password} />
        </div>
      </QuestionBlock>

      <QuestionBlock
        index={4}
        title="Hat dich jemand empfohlen?"
        hint="Optional — trag den Namen ein, dann schreiben wir die Prämie dieser Person gut."
      >
        <Field
          label="Empfohlen von (Name)"
          value={data.referredBy}
          onChange={setReferredBy}
          placeholder="z. B. Max"
        />
      </QuestionBlock>

      <QuestionBlock index={5} title="Rechtliches" required>
        <LegalConsentBox value={data.legal} onChange={setLegal} />
      </QuestionBlock>

      <ValueNote icon={ShieldCheck}>
        Deine Daten werden verschlüsselt gespeichert und ausschließlich intern genutzt.
        Kein Betrieb erhält Zugriff ohne deine ausdrückliche Zustimmung.
      </ValueNote>

      <StepActions
        note={
          !legalOk
            ? "Bitte beide Bedingungen akzeptieren."
            : !formOk
            ? "Bitte fülle die Pflichtfelder aus."
            : "Alles bereit."
        }
      >
        <NextButton onClick={submit} disabled={!canProceed}>
          Weiter
        </NextButton>
      </StepActions>
    </div>
  );
}
