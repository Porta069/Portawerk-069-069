"use client";

// ─── Schritt 6 — Wo du arbeiten willst ────────────────────────────────────────
// Nur noch die Arbeitsorte. Die früher hier gestellten Fragen nach Zielen,
// Umfeld und Bereitschaft sind im Fachfragebogen aufgegangen — sie zweimal zu
// stellen, in leicht anderer Formulierung, war für niemanden nachvollziehbar.
//
// Backend-Vertrag bleibt: Arbeitsorte → Wizard-Schritt 3.

import { Compass, MapPin } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { api } from "@/lib/api";
import WorkLocationsMap from "@/app/components/WorkLocationsMapDynamic";
import {
  StepHeading, QuestionBlock,
  NextButton, SkipButton, StepActions, ValueNote,
} from "@/app/components/wizard";

export default function StepOrte() {
  const { data, setWorkLocations, next } = useRegistration();

  const handleNext = () => {
    if (data.draftToken) {
      void api.saveStep(data.draftToken, 3, { workLocations: data.workLocations });
    }
    next();
  };

  const locCount = data.workLocations.length;

  return (
    <div>
      <StepHeading eyebrow="Wo du arbeiten willst">
        Deine Arbeitsorte entscheiden, welche Betriebe überhaupt in Frage kommen —
        und wie die Fahrzeit auf jeder Stelle berechnet wird.
      </StepHeading>

      <QuestionBlock
        title="Wo möchtest du arbeiten?"
        hint="Tipp auf die Karte oder such einen Ort. Für jeden Ort stellst du deinen Radius selbst ein."
      >
        <WorkLocationsMap value={data.workLocations} onChange={setWorkLocations} />
      </QuestionBlock>

      <ValueNote icon={Compass}>
        Du kannst mehrere Orte eintragen — etwa Wohnort und Heimatregion. Jeder
        bekommt seinen eigenen Radius, und wir rechnen immer vom nächsten.
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
