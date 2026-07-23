"use client";

// ─── Schritt 3 — Verifizierung (echtes OTP: E-Mail + Telefon) ─────────────────
// Wired gegen POST /otp/request + /otp/verify. Im Dev-Modus (console-Provider)
// werden Codes nur serverseitig geloggt, nicht zugestellt — daher ist der
// Schritt überspringbar (das Backend erzwingt OTP bei /complete ohnehin nicht).

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Smartphone,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Check,
  Info,
  SkipForward,
} from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { api, type OtpChannel as Channel } from "@/lib/api";
import OtpInput from "@/app/components/OtpInput";
import VerificationStatus from "@/app/components/VerificationStatus";
import { SectionLabel, PrimaryButton, GhostButton } from "@/app/components/ui";

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
    <div className="bg-white p-6" style={{ border: "1px solid #E5E7EB" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 flex items-center justify-center"
            style={{ background: "rgba(232,168,56,0.1)" }}
          >
            <Icon className="w-4 h-4" style={{ color: "#E8A838" }} />
          </div>
          <span className="text-sm font-semibold text-primary">{label}</span>
        </div>
        <VerificationStatus verified={verified} />
      </div>

      {verified ? (
        <p className="flex items-center gap-2 text-sm" style={{ color: "#16A34A" }}>
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
            className="w-full flex items-center justify-center gap-2 font-semibold py-3 text-sm transition-all disabled:opacity-50"
            style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
          >
            {sending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Wird gesendet…</>
            ) : (
              <><ShieldCheck className="w-4 h-4" />Code senden</>
            )}
          </button>
          {error && <p className="text-sm mt-3" style={{ color: "#EF4444" }}>{error}</p>}
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-[13px]" style={{ color: "#6B7280" }}>6-stelligen Code eingeben:</p>
          <OtpInput value={code} onChange={(v) => { setCode(v); setError(null); }} error={!!error} disabled={verifying} />
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm" style={{ color: "#EF4444" }}>
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          <div className="flex items-center justify-between gap-3">
            <button onClick={sendCode} disabled={sending} className="text-[13px]" style={{ color: "#E8A838" }}>
              Code erneut senden
            </button>
            <button
              onClick={verify}
              disabled={code.trim().length < 6 || verifying}
              className="flex items-center gap-2 font-semibold px-5 py-2.5 text-sm transition-all disabled:opacity-40"
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

export default function Step3Verify() {
  const { data, setVerification, next } = useRegistration();
  const { email, phone } = data.contact;
  const { emailVerified, phoneVerified } = data.verification;
  const [skipped, setSkipped] = useState(false);

  const bothVerified = emailVerified && phoneVerified;
  const canProceed = bothVerified || skipped;

  return (
    <div className="max-w-2xl">
      <SectionLabel>Identität bestätigen</SectionLabel>
      <p className="text-sm leading-relaxed mb-6" style={{ color: "#6B7280" }}>
        Bestätige E-Mail und Telefon mit dem jeweiligen Code. Das schützt dein Profil.
      </p>

      {/* Dev-Hinweis */}
      <div
        className="flex items-start gap-3 px-4 py-3 mb-8"
        style={{ background: "rgba(232,168,56,0.07)", border: "1px solid rgba(232,168,56,0.25)" }}
      >
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#B47B18" }} />
        <p className="text-[12px] leading-relaxed" style={{ color: "rgba(26,26,46,0.7)" }}>
          <strong>Test-Modus:</strong> E-Mail-/SMS-Versand ist noch nicht aktiv (Provider
          folgen). Codes werden serverseitig erzeugt, aber nicht zugestellt — du kannst
          diesen Schritt vorerst überspringen.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <OtpPanel channel="email" contact={email} verified={emailVerified} onVerified={() => setVerification({ emailVerified: true })} />
        <OtpPanel channel="sms" contact={phone} verified={phoneVerified} onVerified={() => setVerification({ phoneVerified: true })} />
      </div>

      <div
        className="mt-10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{ borderTop: "1px solid #E5E7EB" }}
      >
        <p className="text-sm" style={{ color: bothVerified ? "#16A34A" : "#6B7280" }}>
          {bothVerified ? "✓ Beide Kontaktwege bestätigt." : "Bestätige beide — oder überspringe (Test-Modus)."}
        </p>
        <div className="flex items-center gap-3">
          {!bothVerified && (
            <GhostButton onClick={() => { setSkipped(true); next(); }}>
              <SkipForward className="w-4 h-4" />
              Überspringen
            </GhostButton>
          )}
          <PrimaryButton onClick={next} disabled={!canProceed}>
            Weiter zu den Profilfragen
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
