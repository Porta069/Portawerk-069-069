"use client";

// ─── Schritt 2 — Erfahrung & Qualifikation ────────────────────────────────────
// Früher der letzte Schritt ("KI-Profil"). Jetzt an Position 2: fachlich, leicht
// zu beantworten und ohne persönliche Daten — genau richtig, um Commitment
// aufzubauen, bevor die erste echte Hürde kommt.
//
// Das Gewerk wurde bereits in Schritt 1 erfasst und wird hier ausgeblendet.
// Die Fragen liegen im Context, damit ein Rücksprung dieselbe Liste zeigt.

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, RotateCcw, Sparkles, AlertCircle, TrendingUp } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { getProfileQuestions, getFollowUpQuestions } from "@/lib/aiService";
import { api } from "@/lib/api";
import QuestionComponent from "@/app/components/QuestionComponent";
import { StepHeading, NextButton, StepActions, ValueNote } from "@/app/components/wizard";
import type { AnswerValue } from "@/lib/types";

/** In Schritt 1 bereits beantwortet — hier nicht noch einmal zeigen. */
const HANDLED_ELSEWHERE = ["ai_gewerke"];

export default function StepErfahrung() {
  const { data, setAiAnswer, setAiQuestions, addAiQuestions, next } = useRegistration();

  const allQuestions = data.aiQuestions;
  const questions = allQuestions.filter((q) => !HANDLED_ELSEWHERE.includes(q.id));
  const followUpAdded = data.aiFollowUpAdded;

  const [loading, setLoading] = useState(allQuestions.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newlyAdded, setNewlyAdded] = useState<string[]>([]);
  const loadedRef = useRef(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await getProfileQuestions(data.surveyAnswers);
    setLoading(false);
    if (res.ok) setAiQuestions(res.data);
    else setError(res.error);
  };

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    if (allQuestions.length > 0) return; // bereits geladene Fragen wiederverwenden
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        addAiQuestions(follow.data);
        setNewlyAdded(follow.data.map((q) => q.id));
        setBusy(false);
        return; // Nutzer beantwortet erst die Folgefragen
      }
      addAiQuestions([]); // markiert den Nachlade-Schritt als erledigt
    }

    // Wizard-Schritt 4 bleibt die Adresse der KI-Antworten (Backend-Vertrag).
    if (data.draftToken) {
      await api.saveStep(data.draftToken, 4, { aiAnswers: data.aiAnswers });
    }
    setBusy(false);
    next();
  };

  // ── Laden ──
  if (loading) {
    return (
      <div>
        <StepHeading eyebrow="Erfahrung & Qualifikation" />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="w-6 h-6 animate-spin mb-4" style={{ color: "#E8A838" }} />
          <p className="text-sm" style={{ color: "#6B7280" }}>
            Wir stellen dir passende Fragen zusammen …
          </p>
        </div>
      </div>
    );
  }

  // ── Fehler ──
  if (error) {
    return (
      <div>
        <StepHeading eyebrow="Erfahrung & Qualifikation" />
        <div
          className="flex items-start gap-3 rounded-2xl px-5 py-4 mb-6"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.22)" }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#B91C1C" }} />
          <p className="text-[13px] leading-relaxed" style={{ color: "#B91C1C" }}>
            {error}
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: "#E8A838" }}
        >
          <RotateCcw className="w-4 h-4" />
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div>
      <StepHeading eyebrow="Erfahrung & Qualifikation">
        Diese Angaben entscheiden, welche Stellen du siehst — und zu welchem Gehalt
        du vorgeschlagen wirst.
      </StepHeading>

      <div className="space-y-9">
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
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <span
                className="inline-flex items-center gap-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] mb-3 px-2.5 py-1"
                style={{ background: "rgba(232,168,56,0.14)", color: "#B47B18" }}
              >
                <Sparkles className="w-3 h-3" />
                Nachfrage
              </span>
              {inner}
            </motion.div>
          ) : (
            <div key={q.id}>{inner}</div>
          );
        })}
      </div>

      <div className="mt-8">
        <ValueNote icon={TrendingUp}>
          Profile mit Berufserfahrung und Qualifikationen werden von Betrieben
          deutlich häufiger angeschrieben als unvollständige.
        </ValueNote>
      </div>

      <StepActions
        note={
          missingRequired.length > 0
            ? `Noch ${missingRequired.length} ${
                missingRequired.length === 1 ? "Pflichtfrage" : "Pflichtfragen"
              } offen.`
            : "Alles beantwortet."
        }
      >
        <NextButton onClick={handleContinue} disabled={!canProceed} loading={busy}>
          Weiter
        </NextButton>
      </StepActions>
    </div>
  );
}
