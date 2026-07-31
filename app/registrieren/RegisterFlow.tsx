"use client";

// ─── Registrierungs-Shell ─────────────────────────────────────────────────────
// Zweispaltig: links ein Schritt-Visual (echtes Foto + PortaWerk-Tipp), rechts
// der Formularinhalt. Die Tipp-Karte spricht bewusst als PortaWerk — es wird
// keine Aussage einer abgebildeten Person zugeschrieben (UWG).

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, ArrowLeft, Loader2, Lightbulb } from "lucide-react";
import { useRegistration, type RegStep } from "@/app/context/RegistrationContext";
import { api } from "@/lib/api";
import { StepRail } from "@/app/components/StepRail";

import StepGewerk from "./steps/StepGewerk";
import StepErfahrung from "./steps/StepErfahrung";
import StepEmail from "./steps/StepEmail";
import StepOrte from "./steps/StepOrte";
import StepKonto from "./steps/StepKonto";
import StepVerify from "./steps/StepVerify";
import StepSuccess from "./steps/StepSuccess";

interface StepMeta {
  key: RegStep;
  /** Kurzlabel für die Fortschrittsleiste. */
  label: string;
  h: string;
  s: string;
  /** Echtes Foto aus public/images — keine KI-Bilder. */
  photo: string;
  /** Tipp mit Absender PortaWerk, kein Zitat der abgebildeten Person. */
  tip: string;
}

const STEPS: StepMeta[] = [
  {
    key: "gewerk",
    label: "Gewerk",
    h: "Was ist dein Handwerk?",
    s: "Eine Auswahl genügt — den Rest bauen wir Schritt für Schritt mit dir auf.",
    photo: "/images/elektriker-werkstatt.jpg",
    tip: "Dein Gewerk ist das wichtigste Signal für Betriebe. Du kannst mehrere auswählen, wenn du in mehr als einem zu Hause bist.",
  },
  {
    key: "erfahrung",
    label: "Erfahrung",
    h: "Was bringst du mit?",
    s: "Erfahrung und Qualifikationen — damit wir dich nicht unter Wert vermitteln.",
    photo: "/images/metallbau-schweisser.jpg",
    tip: "Betriebe filtern zuerst nach Berufserfahrung. Auch ein Stapler- oder Führerschein bringt dir zusätzliche Angebote.",
  },
  {
    key: "email",
    label: "E-Mail",
    h: "Wohin dürfen wir dir passende Stellen schicken?",
    s: "Nur deine E-Mail. Passwort und Telefon kommen später.",
    photo: "/images/tischler-hobel.jpg",
    tip: "Kein Spam und keine Weitergabe an Dritte. Du bekommst ausschließlich Stellen, die zu deinem Profil passen.",
  },
  {
    key: "orte",
    label: "Region",
    h: "Wo und wie willst du arbeiten?",
    s: "Deine Region und ein paar Rahmenbedingungen — das schärft die Vorschläge deutlich.",
    photo: "/images/maurer-ziegel.jpg",
    tip: "Je größer dein Radius, desto mehr Angebote. Du kannst mehrere Orte gleichzeitig eintragen — etwa Wohnort und Heimatregion.",
  },
  {
    key: "konto",
    label: "Konto",
    h: "Dein Zugang",
    s: "Name, Telefon und ein Passwort — damit ist dein Profil gesichert.",
    photo: "/images/hero-team-werkstatt.jpg",
    tip: "Kein Betrieb sieht deine Kontaktdaten, bevor du zustimmst. Du entscheidest, wer dich anschreiben darf.",
  },
  {
    key: "verify",
    label: "Bestätigen",
    h: "Letzter Schritt",
    s: "Kurz bestätigen, dass wir dich erreichen — dann ist dein Profil live.",
    photo: "/images/shk-heizung.jpg",
    tip: "Bestätigte Profile werden von Betrieben deutlich häufiger angeschrieben als unbestätigte.",
  },
];

const CONTENT_STEPS = STEPS.length;
const RAIL_STEPS = STEPS.map(({ label }) => ({ label }));

export default function RegisterFlow() {
  const { step, stepIndex, hydrated, back, goTo, data, setDraftToken } = useRegistration();
  const startingRef = useRef(false);

  // Registrierungs-Sitzung (draftToken) einmalig starten, sobald hydratisiert.
  useEffect(() => {
    if (!hydrated || data.draftToken || startingRef.current) return;
    startingRef.current = true;
    api.startRegistration().then((res) => {
      if (res.ok) setDraftToken(res.data.draftToken);
      else startingRef.current = false; // erlaubt späteren Retry
    });
  }, [hydrated, data.draftToken, setDraftToken]);

  // Bei jedem Schrittwechsel nach oben — sonst startet man mitten im Formular.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
      </div>
    );
  }

  const isSuccess = step === "success";
  const meta = STEPS[stepIndex];
  const canGoBack = stepIndex > 0 && !isSuccess;

  // ── Erfolgsansicht: ohne Split, volle Breite ──
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-surface" style={{ fontFamily: "var(--font-sans)" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-12 py-16">
          <StepSuccess />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-surface lg:grid lg:grid-cols-[minmax(0,44%)_minmax(0,56%)]"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* ══ Links: Schritt-Visual ══ */}
      <aside className="relative overflow-hidden bg-primary lg:sticky lg:top-0 lg:h-screen">
        {/* Echtes Foto, bewusst zurückgenommen, damit Text führt */}
        <AnimatePresence mode="wait">
          <motion.div
            key={meta.photo}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={meta.photo}
              alt=""
              fill
              priority={stepIndex === 0}
              sizes="(max-width: 1024px) 100vw, 44vw"
              className="object-cover"
              style={{ opacity: 0.3 }}
            />
          </motion.div>
        </AnimatePresence>
        {/* Foto bleibt bewusst im Hintergrund — es trägt die Stimmung, die
            Schrift führt. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(155deg, rgba(26,26,46,0.82) 0%, rgba(26,26,46,0.94) 55%, #1A1A2E 100%)",
          }}
        />
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232,168,56,0.18) 0%, transparent 70%)" }}
        />

        <div className="relative flex flex-col h-full px-6 lg:px-12 py-8 lg:py-12">
          <Link href="/" className="group inline-flex items-center gap-2.5 w-fit">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center transition-transform duration-200 group-hover:-rotate-6">
              <Hammer className="w-4 h-4 text-primary" strokeWidth={2.2} />
            </div>
            <span
              className="text-white text-lg font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              PortaWerk
            </span>
          </Link>

          <div className="flex-1 flex flex-col justify-center py-10 lg:py-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Schritt-Zähler: groß, plakativ, mit durchlaufendem Glanz. */}
                <span
                  className="relative inline-flex items-center gap-3 overflow-hidden rounded-full pl-2.5 pr-5 py-2 mb-6"
                  style={{
                    background: "rgba(232,168,56,0.14)",
                    border: "1px solid rgba(232,168,56,0.4)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <span
                    className="flex items-center justify-center rounded-full font-bold tabular-nums"
                    style={{
                      fontFamily: "var(--font-display)",
                      background: "#E8A838",
                      color: "#1A1A2E",
                      width: 34,
                      height: 34,
                      fontSize: "1rem",
                    }}
                  >
                    {stepIndex + 1}
                  </span>
                  <span
                    className="font-bold tracking-wide"
                    style={{ fontFamily: "var(--font-display)", color: "#F6D08A", fontSize: "0.95rem" }}
                  >
                    von {CONTENT_STEPS}
                  </span>
                  {/* Glanz-Sweep */}
                  <span
                    aria-hidden="true"
                    className="shimmer-glint absolute inset-y-0 -left-1/2 w-1/2 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.42), transparent)",
                    }}
                  />
                </span>
                <h1
                  className="font-bold leading-[1.08] text-white mb-4"
                  style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 3.4vw, 2.9rem)" }}
                >
                  {meta.h}
                </h1>
                <p
                  className="text-[15px] leading-relaxed max-w-md"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {meta.s}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="space-y-7">
            <StepRail
              steps={RAIL_STEPS}
              currentIndex={stepIndex}
              onStepSelect={(i) => goTo(STEPS[i].key)}
            />

            {/* Tipp-Karte — Absender ist PortaWerk, kein Zitat der Person im Bild */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`tip-${step}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="hidden lg:flex items-start gap-3.5 rounded-2xl px-5 py-4"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(232,168,56,0.16)" }}
                >
                  <Lightbulb className="w-4 h-4" style={{ color: "#E8A838" }} />
                </span>
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1"
                    style={{ color: "rgba(232,168,56,0.9)" }}
                  >
                    Tipp von PortaWerk
                  </p>
                  <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>
                    {meta.tip}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* ══ Rechts: Formular ══ */}
      <main className="relative flex flex-col">
        <div className="flex items-center justify-end px-6 lg:px-14 pt-7">
          {canGoBack && (
            <button
              onClick={back}
              className="group inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full transition-all duration-200"
              style={{ color: "rgba(26,26,46,0.6)", background: "rgba(26,26,46,0.05)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(26,26,46,0.09)";
                e.currentTarget.style.color = "#1A1A2E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(26,26,46,0.05)";
                e.currentTarget.style.color = "rgba(26,26,46,0.6)";
              }}
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Zurück
            </button>
          )}
        </div>

        <div className="flex-1 px-6 lg:px-14 pb-20 pt-6 lg:pt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl"
            >
              {step === "gewerk" && <StepGewerk />}
              {step === "erfahrung" && <StepErfahrung />}
              {step === "email" && <StepEmail />}
              {step === "orte" && <StepOrte />}
              {step === "konto" && <StepKonto />}
              {step === "verify" && <StepVerify />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
