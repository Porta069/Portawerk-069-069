"use client";

// ─── Verifizierungs-Erinnerung (Popup) ────────────────────────────────────────
// Erscheint nach Login/Registrierung, wenn E-Mail oder Telefon noch nicht
// bestätigt sind. Pro Kanal: Code senden → eingeben → bestätigen. Setzt danach
// das Flag in der DB (POST /auth/me/verify-contact).

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Smartphone, ShieldCheck, X, Loader2, Check, Info } from "lucide-react";
import { api, type PublicUser, type OtpChannel } from "@/lib/api";
import OtpInput from "./OtpInput";

function ChannelRow({
  channel, contact, verified, token, onVerified,
}: {
  channel: OtpChannel; contact: string; verified: boolean; token: string;
  onVerified: (u: PublicUser) => void;
}) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const Icon = channel === "email" ? Mail : Smartphone;
  const label = channel === "email" ? "E-Mail" : "Telefon";

  const send = async () => {
    setSending(true); setErr(null);
    const res = await api.requestOtp(channel, contact);
    setSending(false);
    if (res.ok) setSent(true); else setErr(res.error);
  };
  const verify = async () => {
    if (code.trim().length < 6) return;
    setBusy(true); setErr(null);
    const res = await api.verifyContact(token, channel, code.trim());
    setBusy(false);
    if (res.ok) onVerified(res.data);
    else { setErr(res.error); setCode(""); }
  };

  return (
    <div className="p-4" style={{ border: "1px solid #E5E7EB", background: verified ? "rgba(34,197,94,0.04)" : "white" }}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 flex items-center justify-center" style={{ background: "rgba(232,168,56,0.1)" }}>
          <Icon className="w-4 h-4" style={{ color: "#E8A838" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary">{label}</p>
          <p className="text-[12px] truncate" style={{ color: "#6B7280" }}>{contact}</p>
        </div>
        {verified && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: "#16A34A" }}>
            <Check className="w-3.5 h-3.5" strokeWidth={3} />bestätigt
          </span>
        )}
      </div>

      {!verified && (
        !sent ? (
          <button onClick={send} disabled={sending} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold" style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {channel === "email" ? "Bestätigungs-E-Mail senden" : "SMS-Code senden"}
          </button>
        ) : (
          <div className="space-y-3">
            <OtpInput value={code} onChange={(v) => { setCode(v); setErr(null); }} error={!!err} disabled={busy} />
            <div className="flex items-center justify-between gap-2">
              <button onClick={send} disabled={sending} className="text-[12px]" style={{ color: "#E8A838" }}>Erneut senden</button>
              <button onClick={verify} disabled={code.trim().length < 6 || busy} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold disabled:opacity-40" style={{ background: "#1A1A2E", color: "white", fontFamily: "var(--font-display)" }}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Bestätigen
              </button>
            </div>
          </div>
        )
      )}
      {err && <p className="text-[12px] mt-2" style={{ color: "#EF4444" }}>{err}</p>}
    </div>
  );
}

export default function VerificationReminder({
  user, token, onUpdate,
}: {
  user: PublicUser; token: string; onUpdate: (u: PublicUser) => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const needs = !user.emailVerified || !user.phoneVerified;
  const show = needs && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDismissed(true)} />
          <motion.div
            className="relative bg-white w-full max-w-md max-h-[88vh] overflow-y-auto"
            initial={{ y: 20, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-primary px-6 py-5 flex items-start justify-between">
              <div>
                <p className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>Bestätige dein Konto</p>
                <p className="text-white/50 text-[13px] mt-1">Verifiziere E-Mail und Telefon, um voll durchzustarten.</p>
              </div>
              <button onClick={() => setDismissed(true)} className="text-white/50 hover:text-white transition-colors p-1" aria-label="Später">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <ChannelRow channel="email" contact={user.email} verified={user.emailVerified} token={token} onVerified={onUpdate} />
              <ChannelRow channel="sms" contact={user.phone} verified={user.phoneVerified} token={token} onVerified={onUpdate} />

              <div className="flex items-start gap-2 pt-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#B47B18" }} />
                <p className="text-[11px] leading-relaxed" style={{ color: "rgba(26,26,46,0.55)" }}>
                  Hinweis: Der E-Mail-/SMS-Versand wird gerade eingerichtet — im Testbetrieb kommen Codes noch nicht an. Du kannst dieses Fenster vorerst schließen.
                </p>
              </div>

              <button onClick={() => setDismissed(true)} className="w-full text-sm py-2 mt-1" style={{ color: "#6B7280" }}>
                Später erinnern
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
