"use client";

// ─── Registrierungs-Shell ─────────────────────────────────────────────────────
// Navbar + Fortschritt + dunkler Kopfbereich + animierter Schrittinhalt.

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, ArrowLeft, Loader2 } from "lucide-react";
import { useRegistration, type RegStep } from "@/app/context/RegistrationContext";
import { api } from "@/lib/api";
import { ProgressBar, StepIndicators, type StepDef } from "@/app/components/ProgressBar";

import Step1Survey from "./steps/Step1Survey";
import Step2Contact from "./steps/Step2Contact";
import Step3Verify from "./steps/Step3Verify";
import Step4AiQuestions from "./steps/Step4AiQuestions";
import Step5Legal from "./steps/Step5Legal";
import StepSuccess from "./steps/StepSuccess";

const STEP_DEFS: StepDef[] = [
  { code: "01", label: "Umfrage" },
  { code: "02", label: "Kontakt" },
  { code: "03", label: "Verifizierung" },
  { code: "04", label: "KI-Profil" },
  { code: "05", label: "Abschluss" },
  { code: "✓", label: "Fertig" },
];

const HEAD: Record<RegStep, { h: string; s: string }> = {
  survey: {
    h: "Erzähl uns kurz von dir",
    s: "Fünf schnelle Fragen — komplett freiwillig. Sie helfen uns, dich passgenau zu vermitteln.",
  },
  contact: {
    h: "Deine Kontaktdaten",
    s: "Damit wir dich erreichen können. Diskret — kein Betrieb sieht deine Daten ohne dein OK.",
  },
  verify: {
    h: "Identität bestätigen",
    s: "Bestätige E-Mail und Telefon. Das dauert nur wenige Sekunden.",
  },
  ai: {
    h: "Dein Handwerker-Profil",
    s: "Unsere KI stellt dir ein paar Fragen zu deinen Fähigkeiten und deiner Erfahrung.",
  },
  legal: {
    h: "Profil abschließen",
    s: "Letzter Schritt: rechtliche Zustimmung und fertig.",
  },
  success: { h: "", s: "" },
};

const CONTENT_STEPS = 5; // survey…legal

export default function RegisterFlow() {
  const { step, stepIndex, hydrated, back, data, setDraftToken } = useRegistration();
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

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8F7F4" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
      </div>
    );
  }

  const isSuccess = step === "success";
  const percent = ((stepIndex + 1) / STEP_DEFS.length) * 100;
  const canGoBack = step !== "survey" && !isSuccess;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F8F7F4", fontFamily: "var(--font-sans)" }}>
      {/* ── Sticky Navbar ── */}
      <div className="sticky top-0 z-50 bg-primary">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-accent flex items-center justify-center transition-transform duration-200 group-hover:scale-95">
              <Hammer className="w-4 h-4 text-primary" strokeWidth={2} />
            </div>
            <span className="text-white text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              PortaWerk
            </span>
          </Link>

          {canGoBack && (
            <button
              onClick={back}
              className="flex items-center gap-1.5 text-sm transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.5)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Zurück
            </button>
          )}
        </div>
        <ProgressBar percent={percent} />
      </div>

      {/* ── Animierter Inhalt ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex flex-col"
        >
          {!isSuccess && (
            <div className="bg-primary">
              <div className="max-w-6xl mx-auto px-6 lg:px-12 pt-10 pb-12">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-8 flex-shrink-0" style={{ display: "block", height: "2px", background: "#E8A838" }} />
                  <span className="text-[10px] font-semibold tracking-[0.22em] uppercase" style={{ color: "#E8A838" }}>
                    Schritt {stepIndex + 1} von {CONTENT_STEPS}
                  </span>
                </div>
                <h1
                  className="font-bold leading-tight text-white"
                  style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.85rem, 4vw, 3rem)" }}
                >
                  {HEAD[step].h}
                </h1>
                <p className="text-base mt-3 max-w-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {HEAD[step].s}
                </p>
                <StepIndicators steps={STEP_DEFS} currentIndex={stepIndex} />
              </div>
            </div>
          )}

          <div className="flex-1 max-w-6xl mx-auto w-full px-6 lg:px-12 py-12">
            {step === "survey" && <Step1Survey />}
            {step === "contact" && <Step2Contact />}
            {step === "verify" && <Step3Verify />}
            {step === "ai" && <Step4AiQuestions />}
            {step === "legal" && <Step5Legal />}
            {step === "success" && <StepSuccess />}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
