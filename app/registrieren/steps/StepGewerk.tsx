"use client";

// ─── Schritt 1 — Dein Gewerk ──────────────────────────────────────────────────
// Bewusst der Einstieg: eine Frage, ein Tipp, sofort relevant. Das Gewerk ist
// zugleich das wichtigste Matching-Feld — wer hier abspringt, war ohnehin nicht
// vermittelbar; wer antwortet, hat schon investiert.

import {
  Zap, Droplets, Flame, Paintbrush, Hammer, Blocks, Home, Grid3x3,
  TreePine, Wrench, Car, SquareStack, Construction, Sprout, HardHat, ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { GEWERKE } from "@/lib/constants";
import { StepHeading, OptionCard, NextButton, StepActions, ValueNote } from "@/app/components/wizard";

const ICONS: Record<string, LucideIcon> = {
  "Elektriker / Elektroniker": Zap,
  "Installateur / Klempner (SHK)": Droplets,
  "Heizungs- & Lüftungsbauer": Flame,
  "Maler & Lackierer": Paintbrush,
  "Tischler / Schreiner": Hammer,
  "Maurer / Betonbauer": Blocks,
  "Dachdecker": Home,
  "Fliesenleger": Grid3x3,
  "Zimmerer": TreePine,
  "Metallbauer / Schlosser": Wrench,
  "KFZ-Mechatroniker": Car,
  "Trockenbauer": SquareStack,
  "Gerüstbauer": Construction,
  "Garten- & Landschaftsbau": Sprout,
  "Anderes Gewerk": HardHat,
};

export default function StepGewerk() {
  const { data, setAiAnswer, next } = useRegistration();

  const selected = Array.isArray(data.aiAnswers.ai_gewerke)
    ? (data.aiAnswers.ai_gewerke as string[])
    : [];

  const toggle = (g: string) => {
    const has = selected.includes(g);
    setAiAnswer("ai_gewerke", has ? selected.filter((x) => x !== g) : [...selected, g]);
  };

  return (
    <div>
      <StepHeading eyebrow="Dein Gewerk">
        Wähl aus, worin du arbeitest. Mehrfachauswahl ist möglich — viele Handwerker
        decken zwei Gewerke ab.
      </StepHeading>

      <div className="grid sm:grid-cols-2 gap-2.5">
        {GEWERKE.map((g) => (
          <OptionCard
            key={g}
            multi
            icon={ICONS[g] ?? HardHat}
            label={g}
            selected={selected.includes(g)}
            onClick={() => toggle(g)}
          />
        ))}
      </div>

      <div className="mt-7">
        <ValueNote icon={ShieldCheck}>
          Wir fragen bewusst zuerst nach deinem Handwerk und nicht nach deinen Daten.
          Kontaktdaten kommen erst, wenn du weißt, was dich erwartet.
        </ValueNote>
      </div>

      <StepActions
        note={
          selected.length === 0
            ? "Wähl mindestens ein Gewerk aus."
            : `${selected.length} ${selected.length === 1 ? "Gewerk" : "Gewerke"} ausgewählt.`
        }
      >
        <NextButton onClick={next} disabled={selected.length === 0}>
          Weiter
        </NextButton>
      </StepActions>
    </div>
  );
}
