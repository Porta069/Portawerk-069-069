"use client";

// ─── Schritt 4 — Wo & wie du arbeiten willst ──────────────────────────────────
// Region und Rahmenbedingungen gehören inhaltlich zusammen und werden deshalb
// in einem Schritt gefragt. Das spart einen kompletten Schritt gegenüber der
// früheren Trennung in "Arbeitsorte" und "Umfrage".
//
// Backend-Vertrag bleibt: Arbeitsorte → Wizard-Schritt 3, Umfrage → Schritt 1.

import { useMemo } from "react";
import { Compass, MapPin } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { api } from "@/lib/api";
import WorkLocationsMap from "@/app/components/WorkLocationsMapDynamic";
import { SURVEY_QUESTIONS } from "@/lib/constants";
import {
  StepHeading, QuestionBlock, ChipToggle, OptionCard,
  NextButton, SkipButton, StepActions, ValueNote,
} from "@/app/components/wizard";

export default function StepOrte() {
  const { data, setWorkLocations, setSurveyAnswer, next } = useRegistration();

  const [zielQ, umfeldQ, bereitschaftQ] = SURVEY_QUESTIONS;

  const ziel = (data.surveyAnswers[zielQ.id] as string) ?? "";
  const umfeld = (data.surveyAnswers[umfeldQ.id] as string) ?? "";
  const bereitschaft = useMemo(
    () =>
      Array.isArray(data.surveyAnswers[bereitschaftQ.id])
        ? (data.surveyAnswers[bereitschaftQ.id] as string[])
        : [],
    [data.surveyAnswers, bereitschaftQ.id]
  );

  const toggleBereitschaft = (v: string) =>
    setSurveyAnswer(
      bereitschaftQ.id,
      bereitschaft.includes(v) ? bereitschaft.filter((x) => x !== v) : [...bereitschaft, v]
    );

  const handleNext = () => {
    if (data.draftToken) {
      // Beide Payloads behalten ihre bisherigen Schritt-Nummern.
      void api.saveStep(data.draftToken, 3, { workLocations: data.workLocations });
      void api.saveStep(data.draftToken, 1, {
        surveyAnswers: data.surveyAnswers,
        surveySkipped: data.surveySkipped,
      });
    }
    next();
  };

  const locCount = data.workLocations.length;

  return (
    <div>
      <StepHeading eyebrow="Wo & wie du arbeiten willst">
        Beides zusammen entscheidet, welche Betriebe wir dir überhaupt vorschlagen.
      </StepHeading>

      <QuestionBlock
        title="Wo möchtest du arbeiten?"
        hint="Tipp auf die Karte oder such einen Ort. Für jeden Ort stellst du deinen Radius selbst ein."
      >
        <WorkLocationsMap value={data.workLocations} onChange={setWorkLocations} />
      </QuestionBlock>

      <QuestionBlock
        index={1}
        title={bereitschaftQ.prompt}
        hint="Mehrfachauswahl — jede Angabe öffnet dir zusätzliche Stellen."
      >
        <div className="flex flex-wrap gap-2">
          {bereitschaftQ.options?.map((o) => (
            <ChipToggle
              key={o.value}
              label={o.label}
              selected={bereitschaft.includes(o.value)}
              onClick={() => toggleBereitschaft(o.value)}
            />
          ))}
        </div>
      </QuestionBlock>

      <QuestionBlock index={2} title={zielQ.prompt}>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {zielQ.options?.map((o) => (
            <OptionCard
              key={o.value}
              label={o.label}
              selected={ziel === o.value}
              onClick={() => setSurveyAnswer(zielQ.id, o.value)}
            />
          ))}
        </div>
      </QuestionBlock>

      <QuestionBlock index={3} title={umfeldQ.prompt}>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {umfeldQ.options?.map((o) => (
            <OptionCard
              key={o.value}
              label={o.label}
              selected={umfeld === o.value}
              onClick={() => setSurveyAnswer(umfeldQ.id, o.value)}
            />
          ))}
        </div>
      </QuestionBlock>

      <ValueNote icon={Compass}>
        Alles hier ist freiwillig und jederzeit im Profil änderbar — je mehr du
        angibst, desto treffsicherer werden die Vorschläge.
      </ValueNote>

      <StepActions
        note={
          locCount > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
              {locCount} {locCount === 1 ? "Arbeitsort" : "Arbeitsorte"} gewählt.
            </span>
          ) : (
            "Ohne Ort schlagen wir dir bundesweite Stellen vor."
          )
        }
      >
        <SkipButton onClick={handleNext}>Später ausfüllen</SkipButton>
        <NextButton onClick={handleNext}>Weiter</NextButton>
      </StepActions>
    </div>
  );
}
