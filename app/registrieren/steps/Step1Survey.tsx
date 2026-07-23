"use client";

// ─── Schritt 1 — Umfrage (optional) ───────────────────────────────────────────

import { ArrowRight, SkipForward } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { SURVEY_QUESTIONS } from "@/lib/constants";
import QuestionComponent from "@/app/components/QuestionComponent";
import { PrimaryButton, GhostButton, SectionLabel } from "@/app/components/ui";

export default function Step1Survey() {
  const { data, setSurveyAnswer, skipSurvey, next } = useRegistration();

  const answered = Object.keys(data.surveyAnswers).length;

  return (
    <>
      <SectionLabel>Kurze Umfrage · freiwillig</SectionLabel>
      <p className="text-sm leading-relaxed mb-8 max-w-xl" style={{ color: "#6B7280" }}>
        Diese {SURVEY_QUESTIONS.length} Fragen helfen uns, dich besser zu verstehen — du
        kannst sie aber auch überspringen. Nichts davon ist verpflichtend.
      </p>

      <div className="space-y-9 max-w-2xl">
        {SURVEY_QUESTIONS.map((q, i) => (
          <QuestionComponent
            key={q.id}
            question={q}
            index={i}
            value={data.surveyAnswers[q.id]}
            onChange={(v) => setSurveyAnswer(q.id, v)}
          />
        ))}
      </div>

      {/* CTA */}
      <div
        className="mt-10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{ borderTop: "1px solid #E5E7EB" }}
      >
        <p className="text-[11px]" style={{ color: "rgba(107,114,128,0.7)" }}>
          {answered > 0
            ? `${answered} von ${SURVEY_QUESTIONS.length} beantwortet`
            : "Alle Fragen sind optional."}
        </p>
        <div className="flex items-center gap-3">
          <GhostButton
            onClick={() => {
              skipSurvey();
              next();
            }}
          >
            <SkipForward className="w-4 h-4" />
            Überspringen
          </GhostButton>
          <PrimaryButton onClick={next}>
            Weiter
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </PrimaryButton>
        </div>
      </div>
    </>
  );
}
