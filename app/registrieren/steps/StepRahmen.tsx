"use client";

// ─── Schritt 4 — Rahmenbedingungen ───────────────────────────────────────────
// Vier kurze Fragen, die im Matching hart wirken: Montagebereitschaft und
// Sprachniveau schließen Stellen ganz aus, der Führerschein zählt Punkte, der
// Startzeitpunkt entscheidet über die Reihenfolge. Deshalb hier gebündelt und
// mit ausgeschriebenen Erklärungen — geraten werden soll hier nichts.

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Truck, CarFront, Languages, CalendarDays, Compass } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { getKatalog, profilFuerBackend, type Katalog } from "@/lib/catalogService";
import {
  StepHeading,
  QuestionBlock,
  OptionCard,
  NextButton,
  StepActions,
  ValueNote,
} from "@/app/components/wizard";
import GehaltsWunsch from "@/app/components/GehaltsWunsch";
import { api } from "@/lib/api";

export default function StepRahmen() {
  const { data, setProfil, next } = useRegistration();
  const [katalog, setKatalog] = useState<Katalog | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [speichert, setSpeichert] = useState(false);

  useEffect(() => {
    void getKatalog().then((res) => {
      if (res.ok) setKatalog(res.data);
      else setFehler(res.error);
    });
  }, []);

  const p = data.profil;
  const weiter = !!p.montage && !!p.fuehrerschein && !!p.deutsch && !!p.start;

  const weiterMitSpeichern = async () => {
    if (!weiter) return;
    setSpeichert(true);
    // Der Fachfragebogen ist hier vollständig — einmal sichern, damit ein
    // Abbruch in den folgenden Schritten die Antworten nicht verliert.
    if (data.draftToken) {
      await api.saveStep(data.draftToken, 2, { profil: profilFuerBackend(p) });
    }
    setSpeichert(false);
    next();
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
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#E8A838" }} />
        <span className="text-[13px]" style={{ color: "rgba(26,26,46,0.55)" }}>
          Einen Moment …
        </span>
      </div>
    );
  }

  return (
    <div>
      <StepHeading eyebrow="Rahmenbedingungen">
        Die letzten vier Fachfragen — sie entscheiden mit, welche Stellen dir
        überhaupt angezeigt werden.
      </StepHeading>

      <QuestionBlock index={1} title="Wie hoch ist deine Montagebereitschaft?" required>
        <div className="grid gap-2.5">
          {katalog.montage.map((m) => (
            <OptionCard
              key={m.value}
              icon={Truck}
              label={m.label}
              sublabel={m.hint}
              selected={p.montage === m.value}
              onClick={() => setProfil({ montage: m.value })}
            />
          ))}
        </div>
      </QuestionBlock>

      <QuestionBlock index={2} title="Hast du einen gültigen Führerschein?" required>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {katalog.fuehrerschein.map((f) => (
            <OptionCard
              key={f.value}
              icon={CarFront}
              label={f.label}
              selected={p.fuehrerschein === f.value}
              onClick={() => setProfil({ fuehrerschein: f.value })}
            />
          ))}
        </div>
      </QuestionBlock>

      <QuestionBlock index={3} title="Wie gut sind deine Deutschkenntnisse?" required>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {katalog.deutsch.map((d) => (
            <OptionCard
              key={d.value}
              icon={Languages}
              label={d.label}
              selected={p.deutsch === d.value}
              onClick={() => setProfil({ deutsch: d.value })}
            />
          ))}
        </div>
      </QuestionBlock>

      <QuestionBlock index={4} title="Zu welchem Zeitpunkt möchtest du deine neue Position antreten?" required>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {katalog.start.map((s) => (
            <OptionCard
              key={s.value}
              icon={CalendarDays}
              label={s.label}
              selected={p.start === s.value}
              onClick={() => setProfil({ start: s.value })}
            />
          ))}
        </div>
      </QuestionBlock>

      <ValueNote icon={Compass}>
        Wer nie auf Montage kann, bekommt keine Dauermontage-Stellen zu sehen —
        das ist kein schlechter Wert, sondern schlicht keine Übereinstimmung.
      </ValueNote>

      <QuestionBlock
        index={5}
        title="Wie viel möchtest du mindestens verdienen?"
        hint="Betriebe, deren Budget deutlich darunter liegt, tauchen bei dir gar nicht erst auf. Du kannst die Frage überspringen."
      >
        <GehaltsWunsch
          katalog={katalog}
          periode={p.gehaltPeriode}
          betragCents={p.gehaltBetragCents}
          onChange={(periode, betragCents) => setProfil({ gehaltPeriode: periode, gehaltBetragCents: betragCents })}
        />
      </QuestionBlock>

      <StepActions>
        <NextButton onClick={() => void weiterMitSpeichern()} disabled={!weiter} loading={speichert}>
          Weiter
        </NextButton>
      </StepActions>
    </div>
  );
}
