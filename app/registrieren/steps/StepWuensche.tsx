"use client";

// ─── Schritt 3 — Was dir wichtig ist ─────────────────────────────────────────
// Die einzige Frage, bei der der Handwerker Ansprüche stellt statt Auskunft zu
// geben. Sie steht bewusst allein auf einem Schritt: fünf aus elf zu wählen
// braucht einen Moment, und die Antwort entscheidet später, welche Betriebe
// als „passt zu dir" oben stehen.

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Heart } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { getKatalog, type Katalog } from "@/lib/catalogService";
import {
  StepHeading,
  QuestionBlock,
  ChipToggle,
  NextButton,
  StepActions,
  ValueNote,
} from "@/app/components/wizard";

export default function StepWuensche() {
  const { data, setProfil, next } = useRegistration();
  const [katalog, setKatalog] = useState<Katalog | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  useEffect(() => {
    void getKatalog().then((res) => {
      if (res.ok) setKatalog(res.data);
      else setFehler(res.error);
    });
  }, []);

  const p = data.profil;
  const max = katalog?.prioritaetenMax ?? 5;
  const voll = p.prioritaeten.length >= max;

  const umschalten = (wert: string) => {
    const drin = p.prioritaeten.includes(wert);
    if (!drin && voll) return; // Obergrenze still einhalten statt zu meckern
    setProfil({
      prioritaeten: drin
        ? p.prioritaeten.filter((x) => x !== wert)
        : [...p.prioritaeten, wert],
    });
  };

  if (fehler) {
    return (
      <div
        className="flex items-start gap-2.5 rounded-2xl px-4 py-3.5"
        style={{
          background: "rgba(185,28,28,0.06)",
          border: "1px solid rgba(185,28,28,0.2)",
        }}
      >
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#B91C1C" }} />
        <p className="text-[13px]" style={{ color: "#B91C1C" }}>
          {fehler}
        </p>
      </div>
    );
  }

  if (!katalog) {
    return (
      <div className="flex items-center gap-2.5 py-16 justify-center">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#F9AD07" }} />
        <span className="text-[13px]" style={{ color: "rgba(12, 51, 48,0.55)" }}>
          Einen Moment …
        </span>
      </div>
    );
  }

  return (
    <div>
      <StepHeading eyebrow="Deine Prioritäten">
        Jetzt bist du dran mit Ansprüchen: Wonach soll dein nächster Betrieb
        ausgesucht werden?
      </StepHeading>

      <QuestionBlock
        index={6}
        title="Was ist dir in deinem neuen Job besonders wichtig?"
        hint={`Wähle bis zu ${max} — ${p.prioritaeten.length} von ${max} gewählt.`}
        required
      >
        <div className="flex flex-wrap gap-2">
          {katalog.prioritaeten.map((o) => {
            const gewaehlt = p.prioritaeten.includes(o.value);
            return (
              <span
                key={o.value}
                // Nicht wählbare Optionen werden gedämpft statt entfernt —
                // so bleibt sichtbar, was es sonst noch gäbe.
                style={{ opacity: !gewaehlt && voll ? 0.4 : 1 }}
              >
                <ChipToggle
                  label={o.label}
                  selected={gewaehlt}
                  onClick={() => umschalten(o.value)}
                />
              </span>
            );
          })}
        </div>
      </QuestionBlock>

      <ValueNote icon={Heart}>
        Betriebe hinterlegen, was sie bieten. Je mehr deiner Punkte ein Betrieb
        abdeckt, desto weiter oben steht er bei dir.
      </ValueNote>

      <StepActions>
        <NextButton onClick={next} disabled={p.prioritaeten.length === 0}>
          Weiter
        </NextButton>
      </StepActions>
    </div>
  );
}
