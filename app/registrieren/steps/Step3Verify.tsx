"use client";

// ─── Schritt 3 — Verifizierung (E-Mail + Telefon) ─────────────────────────────

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Smartphone,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Clock,
  Check,
} from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { api } from "@/lib/api";
import { DEV_PHONE_CODE } from "@/lib/db";
import OtpInput from "@/app/components/OtpInput";
import VerificationStatus from "@/app/components/VerificationStatus";
import { SectionLabel, PrimaryButton } from "@/app/components/ui";

/** Key, über den die externe Verify-Seite die E-Mail-Bestätigung meldet. */
const EMAIL_VERIFIED_KEY = "portawerk_email_verified";

export default function Step3Verify() {
  const { data, setVerification, next } = useRegistration();
  const { email, phone } = data.contact;
  const { emailVerified, phoneVerified } = data.verification;

  // ── E-Mail ──
  const [emailSending, setEmailSending] = useState(false);
  const [emailCountdown, setEmailCountdown] = useState(0);
  const emailAutoSent = useRef(false);

  // ── Telefon ──
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [phoneCountdown, setPhoneCountdown] = useState(0);

  const timers = useRef<ReturnType<typeof setInterval>[]>([]);

  const startEmailCountdown = () => {
    setEmailCountdown(45);
    const id = setInterval(
      () =>
        setEmailCountdown((c) => {
          if (c <= 1) {
            clearInterval(id);
            return 0;
          }
          return c - 1;
        }),
      1000
    );
    timers.current.push(id);
  };
  const startPhoneCountdown = () => {
    setPhoneCountdown(45);
    const id = setInterval(
      () =>
        setPhoneCountdown((c) => {
          if (c <= 1) {
            clearInterval(id);
            return 0;
          }
          return c - 1;
        }),
      1000
    );
    timers.current.push(id);
  };

  // ── E-Mail-Link automatisch senden beim Betreten ──
  useEffect(() => {
    if (!emailAutoSent.current && email) {
      emailAutoSent.current = true;
      setEmailSending(true);
      api.sendEmailVerification(email).then(() => {
        setEmailSending(false);
        startEmailCountdown();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // ── Auf E-Mail-Bestätigung aus anderem Tab / localStorage lauschen ──
  useEffect(() => {
    const check = () => {
      try {
        const v = localStorage.getItem(EMAIL_VERIFIED_KEY);
        if (v && (v === email || v === "true")) setVerification({ emailVerified: true });
      } catch {
        /* ignore */
      }
    };
    check();
    window.addEventListener("storage", check);
    window.addEventListener("focus", check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("focus", check);
    };
  }, [email, setVerification]);

  // ── Cleanup Timer ──
  useEffect(
    () => () => {
      timers.current.forEach(clearInterval);
    },
    []
  );

  const resendEmail = async () => {
    setEmailSending(true);
    await api.sendEmailVerification(email);
    setEmailSending(false);
    startEmailCountdown();
  };

  const simulateEmail = () => {
    try {
      localStorage.setItem(EMAIL_VERIFIED_KEY, email || "true");
    } catch {
      /* ignore */
    }
    setVerification({ emailVerified: true });
  };

  const sendPhone = async () => {
    setSendingCode(true);
    await api.sendPhoneCode(phone);
    setSendingCode(false);
    setCodeSent(true);
    setOtp("");
    setOtpError(false);
    startPhoneCountdown();
  };

  const verifyPhone = async () => {
    if (otp.trim().length < 6) return;
    setVerifying(true);
    const res = await api.verifyPhone(phone, otp.trim());
    setVerifying(false);
    if (res.ok && res.data) {
      setVerification({ phoneVerified: true });
    } else {
      setOtpError(true);
      setOtp("");
    }
  };

  const bothVerified = emailVerified && phoneVerified;

  return (
    <div className="max-w-2xl">
      <SectionLabel>Identität bestätigen</SectionLabel>
      <p className="text-sm leading-relaxed mb-8" style={{ color: "#6B7280" }}>
        Bestätige beide Kontaktwege, um fortzufahren. Das schützt dein Profil und
        stellt sicher, dass wir dich erreichen können.
      </p>

      <div className="grid md:grid-cols-2 gap-5">
        {/* ── E-Mail-Verifikation ── */}
        <div className="bg-white p-6" style={{ border: "1px solid #E5E7EB" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 flex items-center justify-center"
                style={{ background: "rgba(232,168,56,0.1)" }}
              >
                <Mail className="w-4 h-4" style={{ color: "#E8A838" }} />
              </div>
              <span className="text-sm font-semibold text-primary">E-Mail</span>
            </div>
            <VerificationStatus verified={emailVerified} />
          </div>

          <p className="text-[13px] leading-relaxed mb-4" style={{ color: "#6B7280" }}>
            Wir haben einen Verifikations-Link an{" "}
            <strong className="text-primary break-all">{email || "deine E-Mail"}</strong>{" "}
            gesendet. Öffne die Mail und klicke auf den Link.
          </p>

          {!emailVerified ? (
            <div className="space-y-3">
              <button
                onClick={resendEmail}
                disabled={emailSending || emailCountdown > 0}
                className="flex items-center gap-2 text-sm transition-colors duration-200"
                style={{
                  color: emailCountdown > 0 ? "rgba(107,114,128,0.45)" : "#E8A838",
                  cursor: emailCountdown > 0 ? "default" : "pointer",
                }}
              >
                {emailSending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : emailCountdown > 0 ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : null}
                {emailCountdown > 0
                  ? `Link erneut senden (${emailCountdown}s)`
                  : "Verifikations-Link erneut senden"}
              </button>

              {/* DEV-Helfer */}
              <button
                onClick={simulateEmail}
                className="flex items-center gap-2 text-[11px] px-2.5 py-1.5"
                style={{
                  background: "rgba(232,168,56,0.07)",
                  border: "1px solid rgba(232,168,56,0.22)",
                  color: "rgba(26,26,46,0.6)",
                }}
              >
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5"
                  style={{ background: "#E8A838", color: "#1A1A2E" }}
                >
                  DEV
                </span>
                Bestätigung simulieren
              </button>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm" style={{ color: "#16A34A" }}>
              <Check className="w-4 h-4" strokeWidth={3} />
              E-Mail erfolgreich bestätigt
            </p>
          )}
        </div>

        {/* ── Telefon-Verifikation ── */}
        <div className="bg-white p-6" style={{ border: "1px solid #E5E7EB" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 flex items-center justify-center"
                style={{ background: "rgba(232,168,56,0.1)" }}
              >
                <Smartphone className="w-4 h-4" style={{ color: "#E8A838" }} />
              </div>
              <span className="text-sm font-semibold text-primary">Telefon</span>
            </div>
            <VerificationStatus verified={phoneVerified} />
          </div>

          {phoneVerified ? (
            <p className="flex items-center gap-2 text-sm" style={{ color: "#16A34A" }}>
              <Check className="w-4 h-4" strokeWidth={3} />
              Telefon erfolgreich bestätigt
            </p>
          ) : !codeSent ? (
            <>
              <p className="text-[13px] leading-relaxed mb-4" style={{ color: "#6B7280" }}>
                Wir senden dir einen 6-stelligen Sicherheitscode an{" "}
                <strong className="text-primary">{phone || "deine Nummer"}</strong>.
              </p>
              <button
                onClick={sendPhone}
                disabled={sendingCode}
                className="w-full flex items-center justify-center gap-2 font-semibold py-3 text-sm transition-all"
                style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
              >
                {sendingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Code wird gesendet…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Code senden
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div
                className="flex items-center gap-2 px-3 py-2"
                style={{ background: "rgba(232,168,56,0.07)", border: "1px solid rgba(232,168,56,0.22)" }}
              >
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5"
                  style={{ background: "#E8A838", color: "#1A1A2E" }}
                >
                  DEV
                </span>
                <span className="text-[11px]" style={{ color: "rgba(26,26,46,0.6)" }}>
                  Test-Code: <strong className="text-primary">{DEV_PHONE_CODE}</strong>
                </span>
              </div>

              <OtpInput
                value={otp}
                onChange={(v) => {
                  setOtp(v);
                  setOtpError(false);
                }}
                error={otpError}
                disabled={verifying}
              />

              <AnimatePresence>
                {otpError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm"
                    style={{ color: "#EF4444" }}
                  >
                    Falscher Code — bitte erneut versuchen.
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={sendPhone}
                  disabled={phoneCountdown > 0 || sendingCode}
                  className="flex items-center gap-1.5 text-[13px] transition-colors"
                  style={{
                    color: phoneCountdown > 0 ? "rgba(107,114,128,0.45)" : "#E8A838",
                    cursor: phoneCountdown > 0 ? "default" : "pointer",
                  }}
                >
                  {phoneCountdown > 0 && <Clock className="w-3.5 h-3.5" />}
                  {phoneCountdown > 0 ? `Erneut (${phoneCountdown}s)` : "Code erneut senden"}
                </button>
                <button
                  onClick={verifyPhone}
                  disabled={otp.trim().length < 6 || verifying}
                  className="flex items-center gap-2 font-semibold px-5 py-2.5 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#1A1A2E", color: "white", fontFamily: "var(--font-display)" }}
                >
                  {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Verifizieren
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div
        className="mt-10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{ borderTop: "1px solid #E5E7EB" }}
      >
        <p className="text-sm" style={{ color: bothVerified ? "#16A34A" : "#6B7280" }}>
          {bothVerified
            ? "✓ Beide Kontaktwege bestätigt."
            : "Beide Verifizierungen müssen bestätigt sein, um fortzufahren."}
        </p>
        <PrimaryButton onClick={next} disabled={!bothVerified}>
          Weiter zu den Profilfragen
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </PrimaryButton>
      </div>
    </div>
  );
}
