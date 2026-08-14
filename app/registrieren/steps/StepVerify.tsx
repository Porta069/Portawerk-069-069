"use client";

// ─── Schritt 6 — Bestätigen & Profil anlegen ──────────────────────────────────
// Letzter Schritt: OTP für E-Mail und Telefon, danach wird das Konto angelegt.
// Der /complete-Aufruf ist von der früheren Legal-Seite hierher gewandert — die
// rechtliche Zustimmung wurde bereits in Schritt 5 eingeholt.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Smartphone, Loader2, ShieldCheck, Check, Info,
} from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { useAuth } from "@/app/context/AuthContext";
import { api, type OtpChannel as Channel } from "@/lib/api";
import { getReferralPartnerId } from "@/lib/referral";
import OtpInput from "@/app/components/OtpInput";
import VerificationStatus from "@/app/components/VerificationStatus";
import { StepHeading, NextButton, SkipButton, StepActions } from "@/app/components/wizard";

function OtpPanel({
  channel,
  contact,
  verified,
  onVerified,
}: {
  channel: Channel;
  contact: string;
  verified: boolean;
  onVerified: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const Icon = channel === "email" ? Mail : Smartphone;
  const label = channel === "email" ? "E-Mail" : "Telefon";

  const sendCode = async () => {
    setSending(true);
    setError(null);
    const res = await api.requestOtp(channel, contact);
    setSending(false);
    if (res.ok) {
      setSent(true);
      setCode("");
    } else {
      setError(res.error);
    }
  };

  const verify = async () => {
    if (code.trim().length < 6) return;
    setVerifying(true);
    setError(null);
    const res = await api.verifyOtp(channel, contact, code.trim());
    setVerifying(false);
    if (res.ok) onVerified();
    else {
      setError(res.error);
      setCode("");
    }
  };

  return (
    <div
      className="rounded-2xl bg-white p-5 transition-[border-color,box-shadow] duration-300"
      style={{
        border: `1.5px solid ${verified ? "rgba(34,197,94,0.45)" : "#E9E7E1"}`,
        boxShadow: "0 2px 12px -8px rgba(26,26,46,0.16)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: verified ? "rgba(34,197,94,0.12)" : "rgba(232,168,56,0.12)" }}
          >
            <Icon className="w-[18px] h-[18px]" style={{ color: verified ? "#16A34A" : "#E8A838" }} />
          </div>
          <span className="text-[15px] font-semibold text-primary">{label}</span>
        </div>
        <VerificationStatus verified={verified} />
      </div>

      {verified ? (
        <p className="flex items-center gap-2 text-sm font-medium" style={{ color: "#16A34A" }}>
          <Check className="w-4 h-4" strokeWidth={3} />
          {label} bestätigt
        </p>
      ) : !sent ? (
        <>
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: "#6B7280" }}>
            Wir senden einen 6-stelligen Code an{" "}
            <strong className="text-primary break-all">{contact || "—"}</strong>.
          </p>
          <button
            onClick={sendCode}
            disabled={sending || !contact}
            className="w-full flex items-center justify-center gap-2 rounded-full font-bold py-3.5 text-[14px] transition-all duration-200 disabled:opacity-50"
            style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
          >
            {sending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Wird gesendet…</>
            ) : (
              <><ShieldCheck className="w-4 h-4" />Code senden</>
            )}
          </button>
          {error && <p className="text-[13px] mt-3" style={{ color: "#EF4444" }}>{error}</p>}
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-[13px]" style={{ color: "#6B7280" }}>6-stelligen Code eingeben:</p>
          <OtpInput
            value={code}
            onChange={(v) => { setCode(v); setError(null); }}
            error={!!error}
            disabled={verifying}
          />
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[13px]"
                style={{ color: "#EF4444" }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          <div className="flex items-center justify-between gap-3">
            <button onClick={sendCode} disabled={sending} className="text-[13px] font-medium" style={{ color: "#E8A838" }}>
              Code erneut senden
            </button>
            <button
              onClick={verify}
              disabled={code.trim().length < 6 || verifying}
              className="flex items-center gap-2 rounded-full font-bold px-5 py-2.5 text-[13px] transition-all disabled:opacity-40"
              style={{ background: "#1A1A2E", color: "white", fontFamily: "var(--font-display)" }}
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Verifizieren
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StepVerify() {
  const { data, setVerification, next, setDraftToken } = useRegistration();
  const { login } = useAuth();
  const { email, phone } = data.contact;
  const { emailVerified, phoneVerified } = data.verification;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bothVerified = emailVerified && phoneVerified;

  const handleComplete = async () => {
    // Passwort geht bei Reload verloren (nicht persistiert) — dann zurück zum Konto.
    if (data.password.length < 10) {
      setError(
        "Dein Passwort fehlt (nach einem Neuladen wird es aus Sicherheitsgründen nicht gespeichert). Geh bitte einen Schritt zurück zu „Konto“ und gib es erneut ein."
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

    // Die Zuordnung aus dem Empfehlungs-Link hat Vorrang vor dem von Hand
    // eingetippten Code: Sie stammt aus einem geprüften Klick, das Textfeld
    // aus der Erinnerung des Nutzers.
    const werber =
      (await getReferralPartnerId()) ?? data.referredBy.trim() ?? "";

    const res = await api.completeRegistration({
      draftToken,
      firstName: data.contact.firstName.trim(),
      lastName: data.contact.lastName.trim(),
      email: data.contact.email.trim(),
      phone: data.contact.phone.trim(),
      password: data.password,
      ...(werber ? { referredBy: werber } : {}),
    });
    setLoading(false);
    if (res.ok) {
      login(res.data); // JWT-Session setzen → Dashboard verfügbar
      // Optionales Profilbild nach Kontoerstellung speichern (best-effort).
      if (data.avatar) {
        void api.updateProfile(res.data.accessToken, { avatar: data.avatar });
      }
      next(); // → success
    } else {
      setError(res.error);
    }
  };

  return (
    <div>
      <StepHeading eyebrow="Identität bestätigen">
        Ein bestätigtes Profil wird von Betrieben deutlich häufiger angeschrieben.
        Danach ist dein Profil sofort live.
      </StepHeading>

      <div
        className="flex items-start gap-3 rounded-2xl px-4 py-3.5 mb-6"
        style={{ background: "rgba(232,168,56,0.07)", border: "1px solid rgba(232,168,56,0.22)" }}
      >
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#B47B18" }} />
        <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(26,26,46,0.7)" }}>
          <strong>Test-Modus:</strong> E-Mail-/SMS-Versand ist noch nicht aktiv (Provider
          folgen). Codes werden serverseitig erzeugt, aber nicht zugestellt — du kannst
          diesen Schritt vorerst überspringen.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <OtpPanel
          channel="email"
          contact={email}
          verified={emailVerified}
          onVerified={() => setVerification({ emailVerified: true })}
        />
        <OtpPanel
          channel="sms"
          contact={phone}
          verified={phoneVerified}
          onVerified={() => setVerification({ phoneVerified: true })}
        />
      </div>

      {error && (
        <div
          className="mt-6 rounded-2xl px-4 py-3.5 text-[13px] leading-relaxed"
          style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#B91C1C",
          }}
        >
          {error}
        </div>
      )}

      <StepActions
        note={
          bothVerified
            ? "Beide Kontaktwege bestätigt."
            : "Du kannst die Bestätigung überspringen und später im Profil nachholen."
        }
      >
        {!bothVerified && (
          <SkipButton onClick={handleComplete}>Überspringen & anlegen</SkipButton>
        )}
        <NextButton onClick={handleComplete} loading={loading}>
          {loading ? "Profil wird erstellt…" : "Profil erstellen"}
        </NextButton>
      </StepActions>
    </div>
  );
}
