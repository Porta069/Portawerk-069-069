"use client";

// ─── Schritt 2 — Erfahrung ────────────────────────────────────────────────────
// Die beiden Fragen mit dem größten Gewicht im Matching: worin jemand
// tatsächlich gearbeitet hat, und wie lange. Beides ist leicht zu beantworten
// und verlangt noch keine persönlichen Daten.

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, CalendarClock, TrendingUp } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { getKatalog, bereichVon, type Katalog } from "@/lib/catalogService";
import {
  StepHeading,
  QuestionBlock,
  OptionCard,
  ChipToggle,
  NextButton,
  StepActions,
  ValueNote,
} from "@/app/components/wizard";

export default function StepErfahrung() {
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
  const bereich = bereichVon(katalog, p.bereich);
  const weiter = p.aufgaben.length > 0 && !!p.erfahrung;

  const umschalten = (wert: string) =>
    setProfil({
      aufgaben: p.aufgaben.includes(wert)
        ? p.aufgaben.filter((a) => a !== wert)
        : [...p.aufgaben, wert],
    });

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

  if (!katalog || !bereich) {
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
      <StepHeading eyebrow="Deine Erfahrung">
        Worin du gearbeitet hast, zählt im Matching am schwersten — schwerer
        als der Titel der Ausbildung.
      </StepHeading>

      <QuestionBlock
        index={4}
        title="In welchen dieser Aufgabenbereiche hast du Berufserfahrung?"
        hint={`Mehrfachauswahl — Bereiche aus ${bereich.label}.`}
        required
      >
        <div className="flex flex-wrap gap-2">
          {bereich.aufgaben.map((a) => (
            <ChipToggle
              key={a.value}
              label={a.label}
              selected={p.aufgaben.includes(a.value)}
              onClick={() => umschalten(a.value)}
            />
          ))}
        </div>
      </QuestionBlock>

      <QuestionBlock
        index={5}
        title="Wie viele Jahre Berufserfahrung hast du in diesen Bereichen insgesamt?"
        required
      >
        <div className="grid sm:grid-cols-2 gap-2.5">
          {katalog.erfahrung.map((e) => (
            <OptionCard
              key={e.value}
              icon={CalendarClock}
              label={e.label}
              selected={p.erfahrung === e.value}
              onClick={() => setProfil({ erfahrung: e.value })}
            />
          ))}
        </div>
      </QuestionBlock>

      <ValueNote icon={TrendingUp}>
        Weniger Erfahrung als gesucht kostet Punkte, mehr Erfahrung fast keine —
        überqualifiziert zu sein schließt dich nirgends aus.
      </ValueNote>

      <StepActions>
        <NextButton onClick={next} disabled={!weiter}>
          Weiter
        </NextButton>
      </StepActions>
    </div>
  );
}
