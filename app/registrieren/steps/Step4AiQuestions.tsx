"use client";

// ─── Schritt 4 — KI-gestützte Profilfragen ────────────────────────────────────
// Fragen werden dynamisch von der (simulierten) KI-Engine geladen. Basierend
// auf den Antworten können adaptive Folgefragen nachgeladen werden.

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, RotateCcw, Sparkles, AlertCircle } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { getProfileQuestions, getFollowUpQuestions } from "@/lib/aiService";
import { api } from "@/lib/api";
import QuestionComponent from "@/app/components/QuestionComponent";
import { SectionLabel, PrimaryButton } from "@/app/components/ui";
import type { Question, AnswerValue } from "@/lib/types";

export default function Step4AiQuestions() {
  const { data, setAiAnswer, next } = useRegistration();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [followUpAdded, setFollowUpAdded] = useState(false);
  const [newlyAdded, setNewlyAdded] = useState<string[]>([]);
  const loadedRef = useRef(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await getProfileQuestions(data.surveyAnswers);
    setLoading(false);
    if (res.ok) setQuestions(res.data);
    else setError(res.error);
  };

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fehlende Pflichtfragen ermitteln
  const missingRequired = questions.filter((q) => {
    if (!q.required) return false;
    const v = data.aiAnswers[q.id];
    if (v == null) return true;
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === "string") return v.trim() === "";
    return false;
  });
  const canProceed = missingRequired.length === 0 && questions.length > 0;

  const handleContinue = async () => {
    if (!canProceed) return;
    setBusy(true);

    // Adaptive Folgefragen einmalig nachladen
    if (!followUpAdded) {
      const follow = await getFollowUpQuestions(data.aiAnswers);
      if (follow.ok && follow.data.length > 0) {
        setQuestions((qs) => [...qs, ...follow.data]);
        setNewlyAdded(follow.data.map((q) => q.id));
        setFollowUpAdded(true);
        setBusy(false);
        return; // Nutzer beantwortet erst die Folgefragen
      }
      setFollowUpAdded(true);
    }

    // KI-Antworten opak als Wizard-Step 4 speichern (blockiert bei Fehler nicht).
    if (data.draftToken) {
      await api.saveStep(data.draftToken, 4, { aiAnswers: data.aiAnswers });
    }
    setBusy(false);
    next();
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="max-w-2xl">
        <SectionLabel>KI-Profilfragen</SectionLabel>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: "#E8A838" }} />
          <p className="text-sm" style={{ color: "#6B7280" }}>
            Die KI stellt passende Fragen für dein Profil zusammen…
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="max-w-2xl">
        <SectionLabel>KI-Profilfragen</SectionLabel>
        <div
          className="flex flex-col items-center justify-center py-16 text-center px-6"
          style={{ border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.04)" }}
        >
          <AlertCircle className="w-8 h-8 mb-4" style={{ color: "#EF4444" }} />
          <p className="text-sm font-medium mb-1 text-primary">Fragen konnten nicht geladen werden</p>
          <p className="text-sm mb-6" style={{ color: "#6B7280" }}>{error}</p>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
            style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
          >
            <RotateCcw className="w-4 h-4" />
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  // ── Fragen ──
  return (
    <div className="max-w-2xl">
      <SectionLabel>KI-Profilfragen</SectionLabel>
      <div
        className="flex items-start gap-3 px-4 py-3.5 mb-9"
        style={{ background: "rgba(232,168,56,0.06)", border: "1px solid rgba(232,168,56,0.2)" }}
      >
        <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#E8A838" }} />
        <p className="text-[13px] leading-relaxed" style={{ color: "rgba(26,26,46,0.7)" }}>
          Hilf uns, dein Profil zu optimieren! Beantworte ein paar Fragen zu deinen
          handwerklichen Fähigkeiten — je genauer, desto besser die Vermittlung.
        </p>
      </div>

      <div className="space-y-10">
        {questions.map((q, i) => {
          const isNew = newlyAdded.includes(q.id);
          const inner = (
            <QuestionComponent
              question={q}
              index={i}
              value={data.aiAnswers[q.id]}
              onChange={(v: AnswerValue) => setAiAnswer(q.id, v)}
            />
          );
          return isNew ? (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] mb-3 px-2 py-1"
                style={{ background: "rgba(232,168,56,0.12)", color: "#B47B18" }}
              >
                <Sparkles className="w-3 h-3" />
                KI-Folgefrage
              </div>
              {inner}
            </motion.div>
          ) : (
            <div key={q.id}>{inner}</div>
          );
        })}
      </div>

      <div
        className="mt-10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{ borderTop: "1px solid #E5E7EB" }}
      >
        <p className="text-[11px]" style={{ color: "rgba(107,114,128,0.7)" }}>
          {missingRequired.length > 0
            ? `Noch ${missingRequired.length} Pflichtfrage${missingRequired.length > 1 ? "n" : ""} offen`
            : "Alle Pflichtfragen beantwortet ✓"}
        </p>
        <PrimaryButton onClick={handleContinue} disabled={!canProceed} loading={busy}>
          {busy ? "Wird verarbeitet…" : "Weiter zum Abschluss"}
          {!busy && (
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          )}
        </PrimaryButton>
      </div>
    </div>
  );
}
