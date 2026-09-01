"use client";

// ─── Affiliate-/Partner-Registrierung ────────────────────────────────────────
// Echtes 2FA-Modell: Passwort + (optionaler) SMS-Code. Spricht das Live-Backend
// (/partner/*). Der SMS-Code ist erst zwingend, sobald SMS-Versand konfiguriert
// ist; bis dahin kann ohne Code fortgefahren werden (Konto wird angelegt, die
// Telefonnummer bleibt dann unbestätigt).

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Check, Copy, Share2,
  Sparkles, Lock, Phone, User, Mail, RefreshCw, LayoutDashboard, Eye, EyeOff } from "lucide-react";
import { ProgressBar, StepIndicators, type StepDef } from "./ProgressBar";
import OtpInput from "./OtpInput";
import PasswordStrength from "./PasswordStrength";
import { MINDESTLAENGE } from "./PasswordField";
import { evaluatePassword } from "@/lib/password";
import { api, partnerSession } from "@/lib/api";
import Logo from "@/app/components/Logo";

const STEP_DEFS: StepDef[] = [
  { code: "01", label: "Deine Daten" },
  { code: "02", label: "Wunsch-Link" },
  { code: "03", label: "Bestätigen" },
  { code: "✓", label: "Fertig" },
];
const CONTENT_STEPS = 3;
const BASE = "werkpair.de/r/";

const HEAD = [
  { h: "Werde Partner", s: "Deine Daten — damit wir dich erreichen und deine Prämie auszahlen können." },
  { h: "Dein Wunsch-Link", s: "Wähl deinen persönlichen, einzigartigen Empfehlungs-Link." },
  { h: "Nummer bestätigen", s: "Wir haben dir einen 6-stelligen Code per SMS geschickt." },
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[àáâä]/g, "a").replace(/[öó]/g, "o").replace(/[üú]/g, "u")
    .replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 20);

const input =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-primary text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 transition-colors placeholder:text-muted/70";
const label = "block text-primary text-sm font-medium mb-1.5";

export default function PartnerFunnel() {
  const [step, setStep] = useState(0); // 0..2 Inhalt, 3 = Erfolg
  const [name, setName] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [pwSichtbar, setPwSichtbar] = useState(false);
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "free" | "taken">("idle");

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const [finalLink, setFinalLink] = useState("");
  const [copied, setCopied] = useState(false);
  const otpRequested = useRef(false);

  // Wunsch-Slug aus dem Generator (?slug=) übernehmen.
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get("slug");
      if (p) setSlug(p);
    } catch { /* ignore */ }
  }, []);

  // Live-Verfügbarkeitsprüfung des Slugs über das Backend (debounced).
  useEffect(() => {
    const s = slugify(slug);
    if (s.length < 3) { setSlugStatus("idle"); return; }
    setSlugStatus("checking");
    let active = true;
    const t = setTimeout(async () => {
      const r = await api.partnerSlugCheck(s);
      if (!active) return;
      // Bei einem transienten Fehler nicht blockieren — der finale Register-Call
      // erzwingt die Eindeutigkeit ohnehin (409 bei vergeben).
      setSlugStatus(r.ok ? (r.data.available ? "free" : "taken") : "free");
    }, 450);
    return () => { active = false; clearTimeout(t); };
  }, [slug]);

  // Resend-Countdown.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // SMS-Code senden, sobald Schritt 3 erreicht wird (best-effort).
  const sendOtp = () => {
    setSending(true); setOtpError(null); setOtp("");
    api.requestOtp("sms", telefon).finally(() => {
      setSending(false);
      setResendIn(30);
    });
  };
  useEffect(() => {
    if (step === 2 && !otpRequested.current) { otpRequested.current = true; sendOtp(); }
  }, [step]);

  const nextFromData = () => {
    setErr(null);
    if (!name.trim()) return setErr("Bitte gib deinen Namen ein.");
    if (telefon.replace(/\D/g, "").length < 6) return setErr("Bitte gib eine gültige Telefonnummer ein.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Die E-Mail-Adresse sieht nicht gültig aus.");
    if (!evaluatePassword(passwort).valid)
      return setErr("Dein Passwort erfüllt noch nicht alle Kriterien (siehe Liste).");
    if (!consent) return setErr("Bitte stimme der Verarbeitung deiner Daten zu.");
    setStep(1);
  };

  const nextFromLink = () => {
    setErr(null);
    if (slugStatus !== "free") return setErr("Wähle einen verfügbaren Wunsch-Link.");
    setStep(2);
  };

  // Abschluss: falls ein 6-stelliger Code eingegeben wurde, erst verifizieren
  // (→ verificationToken, Nummer bestätigt); anschließend Partner-Konto anlegen.
  // Ohne Code wird das Konto trotzdem angelegt (Nummer bleibt unbestätigt).
  const complete = async () => {
    setVerifying(true); setOtpError(null); setErr(null);
    let verificationToken: string | undefined;
    if (otp.length === 6) {
      const v = await api.verifyOtp("sms", telefon, otp);
      if (!v.ok) {
        setVerifying(false);
        setOtpError(v.error || "Der Code stimmt nicht. Versuch es nochmal.");
        return;
      }
      verificationToken = v.data.verificationToken;
    }
    const r = await api.partnerRegister({
      name: name.trim(),
      phone: telefon.trim(),
      email: email.trim() || undefined,
      password: passwort,
      slug: slugify(slug),
      verificationToken,
    });
    setVerifying(false);
    if (!r.ok) {
      setOtpError(r.error);
      return;
    }
    partnerSession.set(r.data.accessToken);
    setFinalLink(r.data.partner.link);
    setStep(3);
  };

  const copy = () => {
    navigator.clipboard?.writeText("https://" + finalLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const share = () => {
    const text = encodeURIComponent(`Such einen Job im Handwerk? Über meinen Link findest du kostenlos einen: https://${finalLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
  };

  const isSuccess = step === 3;
  const percent = ((step + 1) / STEP_DEFS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-surface)" }}>
      {/* Kopf */}
      <div className="sticky top-0 z-50 bg-primary">
        <div className="max-w-2xl mx-auto px-6 h-[68px] flex items-center justify-between">
          <Link href="/verdienen" className="flex items-center gap-2.5 group">
            <Logo height={24} variant="hell" className="transition-transform group-hover:scale-95" />
          </Link>
          {step === 0 && !isSuccess && (
            <Link href="/verdienen/login" className="text-sm text-white/50 hover:text-white transition-colors">
              Schon Partner? <span className="text-accent font-semibold">Anmelden</span>
            </Link>
          )}
        </div>
        <ProgressBar percent={percent} />
      </div>

      {/* Header */}
      {!isSuccess && (
        <div className="bg-primary">
          <div className="max-w-2xl mx-auto px-6 pt-8 pb-12">
            {/* Zurueck steht jetzt hier statt klein rechts in der Kopfleiste.
                Dort war er 14 px grau auf Navy und ging neben dem Logo unter —
                ausgerechnet der Weg, den man sucht, wenn man sich vertippt
                hat. Links oben ist die Stelle, an der man ihn erwartet. */}
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-2 mb-7 text-[15px] font-semibold text-white transition-colors"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.16)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(232,168,56,0.16)";
                  e.currentTarget.style.borderColor = "rgba(232,168,56,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
                }}
              >
                <ArrowLeft className="w-[18px] h-[18px]" style={{ color: "#E8A838" }} />
                Zurück
              </button>
            )}

            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 flex-shrink-0" style={{ display: "block", height: "2px", background: "#E8A838" }} />
              <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-accent">
                Schritt {step + 1} von {CONTENT_STEPS}
              </span>
            </div>
            <h1 className="font-bold leading-tight text-white" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.85rem, 4vw, 2.6rem)" }}>
              {HEAD[step].h}
            </h1>
            <p className="text-base mt-3 max-w-lg leading-relaxed text-white/45">{HEAD[step].s}</p>
            <StepIndicators steps={STEP_DEFS} currentIndex={step} />
          </div>
        </div>
      )}

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ── Schritt 1: Daten ── */}
            {step === 0 && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className={label} htmlFor="p-name">Dein Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input id="p-name" className={input + " pl-10"} value={name} onChange={(e) => setName(e.target.value)} placeholder="Max Mustermann" />
                  </div>
                </div>
                <div>
                  <label className={label} htmlFor="p-tel">Telefonnummer</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input id="p-tel" type="tel" className={input + " pl-10"} value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="+49 …" />
                  </div>
                  <p className="text-muted text-xs mt-1.5">Für den SMS-Sicherheitscode und die persönliche Kontaktaufnahme.</p>
                </div>
                <div>
                  <label className={label} htmlFor="p-mail">E-Mail <span className="text-muted font-normal">(optional)</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input id="p-mail" type="email" className={input + " pl-10"} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@mail.de" />
                  </div>
                </div>
                <div>
                  <label className={label} htmlFor="p-pw">Passwort</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input id="p-pw" type={pwSichtbar ? "text" : "password"} className={input + " pl-10 pr-10"} value={passwort} onChange={(e) => setPasswort(e.target.value)} placeholder={`Mindestens ${MINDESTLAENGE} Zeichen`} />
                    <button type="button" tabIndex={-1} onClick={() => setPwSichtbar((s) => !s)} aria-label={pwSichtbar ? "Passwort verbergen" : "Passwort anzeigen"} aria-pressed={pwSichtbar} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
                      {pwSichtbar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={passwort} />
                </div>
                <label className="flex items-start gap-3 mt-1 cursor-pointer">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#E8A838] flex-shrink-0" />
                  <span className="text-muted text-xs leading-relaxed">
                    Ich stimme zu, dass meine Daten zur Registrierung und Auszahlung genutzt werden. Details in der{" "}
                    <a href="/rechtliches#datenschutz" className="text-accent underline underline-offset-2">Datenschutzerklärung</a>.
                  </span>
                </label>

                {err && <p className="text-red-600 text-sm">{err}</p>}

                <button onClick={nextFromData} className="group mt-2 w-full rounded-full bg-accent text-primary font-bold py-4 text-base hover:bg-amber-400 transition-colors inline-flex items-center justify-center gap-2.5">
                  Weiter zum Wunsch-Link
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}

            {/* ── Schritt 2: Wunsch-Link ── */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className={label} htmlFor="p-slug">Dein Wunsch-Link</label>
                  <div className="flex items-stretch rounded-xl border overflow-hidden transition-colors"
                    style={{ borderColor: slugStatus === "taken" ? "#EF4444" : slugStatus === "free" ? "#22C55E" : "#E5E7EB" }}>
                    <span className="flex items-center pl-4 pr-1 text-muted text-sm select-none">{BASE}</span>
                    <input id="p-slug" className="flex-1 py-3.5 pr-4 text-primary text-sm bg-transparent focus:outline-none" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="dein-name" autoComplete="off" />
                    <span className="flex items-center px-4">
                      {slugStatus === "checking" && <Loader2 className="w-4 h-4 text-muted animate-spin" />}
                      {slugStatus === "free" && <Check className="w-4 h-4 text-green-500" strokeWidth={3} />}
                    </span>
                  </div>
                  <div className="mt-2 text-xs">
                    {slugStatus === "free" && <span className="text-green-600 font-medium">✓ {BASE}{slugify(slug)} ist frei</span>}
                    {slugStatus === "taken" && <span className="text-red-600 font-medium">Schon vergeben — probier einen anderen.</span>}
                    {slugStatus === "checking" && <span className="text-muted">Prüfe Verfügbarkeit …</span>}
                    {slugStatus === "idle" && <span className="text-muted">Mindestens 3 Zeichen, nur Buchstaben, Zahlen und Bindestriche.</span>}
                  </div>
                </div>

                {err && <p className="text-red-600 text-sm">{err}</p>}

                <button onClick={nextFromLink} disabled={slugStatus !== "free"} className="group mt-2 w-full rounded-full bg-accent text-primary font-bold py-4 text-base hover:bg-amber-400 transition-colors inline-flex items-center justify-center gap-2.5 disabled:opacity-50">
                  Nummer bestätigen
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}

            {/* ── Schritt 3: 2FA ── */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
                  <p className="text-primary text-sm mb-1">
                    Code gesendet an <span className="font-semibold">{telefon || "deine Nummer"}</span>
                  </p>
                  <p className="text-muted text-xs mb-6">
                    Gib den 6-stelligen Code ein, um deine Nummer zu bestätigen.
                    Noch kein Code erhalten? Du kannst auch{" "}
                    <span className="text-primary font-semibold">ohne Bestätigung</span>{" "}
                    fortfahren und sie später bestätigen.
                  </p>
                  <OtpInput value={otp} onChange={setOtp} error={!!otpError} disabled={verifying || sending} />
                  {otpError && <p className="text-red-600 text-sm mt-4">{otpError}</p>}

                  <div className="flex items-center gap-4 mt-6">
                    <button
                      onClick={sendOtp}
                      disabled={resendIn > 0 || sending}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-amber-600 transition-colors disabled:text-muted disabled:cursor-not-allowed"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {resendIn > 0 ? `Neuer Code in ${resendIn}s` : "Code erneut senden"}
                    </button>
                  </div>
                </div>

                <button onClick={complete} disabled={verifying} className="group w-full rounded-full bg-accent text-primary font-bold py-4 text-base hover:bg-amber-400 transition-colors inline-flex items-center justify-center gap-2.5 disabled:opacity-50">
                  {verifying ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird geprüft …</> : <>{otp.length === 6 ? "Bestätigen & abschließen" : "Ohne Bestätigung abschließen"} <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" /></>}
                </button>
              </div>
            )}

            {/* ── Erfolg ── */}
            {isSuccess && (
              <div className="text-center pt-8">
                <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-primary" strokeWidth={2} />
                </motion.div>
                <h1 className="text-primary font-bold text-3xl sm:text-4xl mb-3" style={{ fontFamily: "var(--font-display)" }}>
                  Willkommen, {name.split(" ")[0] || "Partner"}!
                </h1>
                <p className="text-muted text-base mb-8 max-w-md mx-auto">Dein Konto ist aktiv und dein Link steht. Teil ihn — und verdien 100 € pro Vermittlung.</p>

                <div className="flex items-stretch max-w-md mx-auto rounded-xl border border-accent/40 overflow-hidden mb-5" style={{ background: "#fff" }}>
                  <span className="flex-1 flex items-center px-4 py-3.5 text-primary font-semibold text-sm sm:text-base truncate">{finalLink}</span>
                  <button onClick={copy} className="shrink-0 px-5 bg-accent text-primary font-semibold text-sm inline-flex items-center gap-2 hover:bg-amber-400 transition-colors">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "Kopiert" : "Kopieren"}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/verdienen/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full bg-accent text-primary font-bold px-6 py-3 text-sm hover:bg-amber-400 transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> Zum Dashboard
                  </Link>
                  <button onClick={share} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white font-semibold px-6 py-3 text-sm hover:bg-accent hover:text-primary transition-colors">
                    <Share2 className="w-4 h-4" /> Per WhatsApp teilen
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
