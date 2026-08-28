"use client";

// ─── Schritt 2 — Was du mitbringst ────────────────────────────────────────────
// Drei Pflichtfragen und eine freiwillige.
//
// Die Berufsbezeichnung ist bewusst Freitext: „Obermonteur", „Serviceleiter
// SHK", „Kolonnenführer" — jede Liste wäre entweder unvollständig oder so lang,
// dass niemand seinen Titel darin findet. Betriebe suchen darin per Stichwort.
//
// Die Aufgabenfelder sind der einzige Punkt, der nicht aus der Fragenliste
// stammt. Ohne sie kann ein Betrieb nur nach Gewerk und Jahren suchen, und
// „Elektrotechnik, 3–5 Jahre" beschreibt tausende Menschen gleich. Deshalb
// freiwillig, aber mit sichtbarem Nutzen erklärt.

import { useEffect, useState } from "react";
import {
  Briefcase, CalendarClock, Users, Loader2, AlertCircle, Target,
} from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { getKatalog, gewerkVon, type Katalog } from "@/lib/catalogService";
import {
  StepHeading,
  QuestionBlock,
  OptionCard,
  ChipToggle,
  NextButton,
  StepActions,
  ValueNote,
} from "@/app/components/wizard";
import { Field } from "@/app/components/ui";

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
  const gewerk = gewerkVon(katalog, p.gewerk);
  const weiter =
    p.berufsbezeichnung.trim().length > 1 && !!p.erfahrung && p.fuehrung !== null;

  if (fehler) {
    return (
      <div className="flex items-start gap-2.5 rounded-2xl px-4 py-3.5"
        style={{ background: "rgba(185,28,28,0.06)", border: "1px solid rgba(185,28,28,0.2)" }}>
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#B91C1C" }} />
        <p className="text-[13px]" style={{ color: "#B91C1C" }}>{fehler}</p>
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
      <StepHeading eyebrow="Deine Erfahrung">
        Was du heute machst und wie lange schon — das wiegt im Matching am
        schwersten.
      </StepHeading>

      <QuestionBlock
        index={1}
        title="Wie lautet deine aktuelle Berufsbezeichnung?"
        hint="So, wie sie in deinem Betrieb heißt. Betriebe suchen genau danach."
        required
      >
        <Field
          label="Berufsbezeichnung"
          value={p.berufsbezeichnung}
          onChange={(v) => setProfil({ berufsbezeichnung: v })}
          placeholder="z. B. Obermonteur, Servicetechniker, Kolonnenführer"
        />
      </QuestionBlock>

      <QuestionBlock
        index={2}
        title="Wie viele Jahre Berufserfahrung hast du in der aktuellen Position?"
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

      <QuestionBlock index={3} title="Hast du Führungsverantwortung?" required>
        <div className="grid sm:grid-cols-2 gap-2.5">
          <OptionCard
            icon={Users}
            label="Ja"
            sublabel="Ich führe ein Team, eine Kolonne oder eine Baustelle."
            selected={p.fuehrung === true}
            onClick={() => setProfil({ fuehrung: true })}
          />
          <OptionCard
            icon={Briefcase}
            label="Nein"
            sublabel="Ich arbeite ohne Personalverantwortung."
            selected={p.fuehrung === false}
            onClick={() => setProfil({ fuehrung: false })}
          />
        </div>
      </QuestionBlock>

      {gewerk && gewerk.aufgaben.length > 0 && (
        <QuestionBlock
          index={4}
          title="In welchen Aufgabenbereichen hast du Erfahrung?"
          hint="Freiwillig — aber der wirksamste Hebel für passende Treffer. Mehrfachauswahl."
        >
          <div className="flex flex-wrap gap-2">
            {gewerk.aufgaben.map((a) => (
              <ChipToggle
                key={a.value}
                label={a.label}
                selected={p.aufgaben.includes(a.value)}
                onClick={() =>
                  setProfil({
                    aufgaben: p.aufgaben.includes(a.value)
                      ? p.aufgaben.filter((x) => x !== a.value)
                      : [...p.aufgaben, a.value],
                  })
                }
              />
            ))}
          </div>
        </QuestionBlock>
      )}

      <ValueNote icon={Target}>
        Ohne Aufgabenbereiche sehen Betriebe nur dein Gewerk und deine Jahre —
        damit sieht dein Profil aus wie tausend andere.
      </ValueNote>

      <StepActions>
        <NextButton disabled={!weiter} onClick={next}>
          Weiter
        </NextButton>
      </StepActions>
    </div>
  );
}
