"use client";

// ─── Schritt 1 — Gewerk und Abschluss ─────────────────────────────────────────
// Bewusst der Einstieg: Das Gewerk ist das schärfste Kriterium im Matching (es
// schließt Stellen ganz aus) und zugleich die Frage, die jeder ohne Nachdenken
// beantwortet.
//
// Alles Weitere hängt daran. Berufe, Aufgabenfelder und Meisterabschlüsse
// gehören zu einem Gewerk; die Anschlussfragen zu Studium beziehungsweise
// Meister erscheinen nur bei dem Abschluss, zu dem sie passen. Wer keine
// Ausbildung hat, bekommt die Berufsfrage gar nicht gestellt, statt sie mit
// „trifft nicht zu" beantworten zu müssen.

import { useEffect, useState } from "react";
import {
  Zap, Droplets, Paintbrush, Layers, SquareStack, Sofa, Grid3x3,
  Home, Construction, Wrench, TreePine, Building2, Droplet,
  GraduationCap, Loader2, AlertCircle, ShieldCheck, HardHat,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import {
  getKatalog,
  gewerkVon,
  gewerkWechseln,
  type Katalog,
} from "@/lib/catalogService";
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

const ICONS: Record<string, LucideIcon> = {
  elektrotechnik: Zap,
  shk: Droplets,
  maler_lackierer: Paintbrush,
  fassade_daemmung: Layers,
  trockenbau: SquareStack,
  innenausbau: Sofa,
  boden_fliesen: Grid3x3,
  stuck_putz: Layers,
  dach_klempnerei: Home,
  geruestbau: Construction,
  metallbau: Wrench,
  zimmerei_holzbau: TreePine,
  bauwerkserhaltung: Building2,
  schadensanierung: Droplet,
};

export default function StepAusbildung() {
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

  // Ohne anerkannte Ausbildung gibt es keinen Ausbildungsberuf.
  const berufNoetig = p.abschluss != null && p.abschluss !== "keine";
  const studiumNoetig = p.abschluss === "studium";
  const meisterNoetig = p.abschluss === "meister_techniker";

  const meisterOk =
    !meisterNoetig ||
    !!p.meisterQualifikation ||
    p.meisterQualifikationFrei.trim().length > 0;

  // `gewerk` statt `p.gewerk`: Der Wert kann aus der Adresszeile stammen
  // (?bereich=…). Steht er nicht im Katalog, ist keine Kachel ausgewählt — dann
  // darf es auch nicht weitergehen, sonst scheitert erst das Absenden am Ende.
  const weiter =
    !!gewerk &&
    !!p.abschluss &&
    (!studiumNoetig || p.studium.trim().length > 0) &&
    meisterOk;

  // Die Frageformulierung folgt der Antwort: „absolvierst du gerade" passt nur,
  // solange die Ausbildung läuft.
  const berufFrage =
    p.abschluss === "in_ausbildung"
      ? "Welche Ausbildung absolvierst du gerade?"
      : "Welche Berufsausbildung hast du abgeschlossen?";

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
      <StepHeading eyebrow="Dein Handwerk">
        Damit finden wir nur Stellen, die fachlich wirklich zu dir passen —
        alles andere blenden wir aus.
      </StepHeading>

      <QuestionBlock index={1} title="In welchem Gewerk arbeitest du?" required>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {katalog.gewerke.map((g) => (
            <OptionCard
              key={g.value}
              icon={ICONS[g.value] ?? HardHat}
              label={g.label}
              selected={p.gewerk === g.value}
              onClick={() => setProfil(gewerkWechseln(p, g.value, katalog))}
            />
          ))}
        </div>
      </QuestionBlock>

      <QuestionBlock
        index={2}
        title="Verfügst du über einen in Deutschland anerkannten Ausbildungsabschluss?"
        required
      >
        <div className="grid sm:grid-cols-2 gap-2.5">
          {/* Absteigend: Der höchste Abschluss steht oben, weil die meisten
              zuerst dort suchen, wo sie sich selbst einordnen. */}
          {[...katalog.abschluss].reverse().map((a) => (
            <OptionCard
              key={a.value}
              icon={GraduationCap}
              label={a.label}
              selected={p.abschluss === a.value}
              onClick={() =>
                setProfil({
                  abschluss: a.value,
                  // Angaben, die zum neuen Abschluss nicht mehr passen, werden
                  // verworfen — sonst stünde ein Studiengang bei jemandem, der
                  // laut eigener Angabe nicht studiert hat.
                  ...(a.value !== "studium" ? { studium: "" } : {}),
                  ...(a.value !== "meister_techniker"
                    ? { meisterQualifikation: null, meisterQualifikationFrei: "" }
                    : {}),
                  ...(a.value === "keine" ? { ausbildungsberuf: null } : {}),
                })
              }
            />
          ))}
        </div>
      </QuestionBlock>

      {studiumNoetig && (
        <QuestionBlock index={3} title="Welches Studium hast du abgeschlossen?" required>
          <Field
            label="Studiengang"
            value={p.studium}
            onChange={(v) => setProfil({ studium: v })}
            placeholder="z. B. Elektrotechnik B.Eng."
          />
        </QuestionBlock>
      )}

      {meisterNoetig && gewerk && (
        <QuestionBlock
          index={3}
          title="Welche Meister- oder Technikerqualifikation hast du erworben?"
          hint={`Die gängigen Abschlüsse im Bereich ${gewerk.label}. Steht deiner nicht dabei, trag ihn darunter ein.`}
          required
        >
          <div className="flex flex-wrap gap-2">
            {gewerk.meister.map((m) => (
              <ChipToggle
                key={m.value}
                label={m.label}
                selected={p.meisterQualifikation === m.value}
                onClick={() =>
                  setProfil({
                    meisterQualifikation:
                      p.meisterQualifikation === m.value ? null : m.value,
                    // Auswahl und Freitext schließen einander aus — sonst weiß
                    // später niemand, welche Angabe gilt.
                    meisterQualifikationFrei: "",
                  })
                }
              />
            ))}
          </div>
          {!p.meisterQualifikation && (
            <div className="mt-3.5">
              <Field
                label="Nicht dabei? Hier eintragen"
                value={p.meisterQualifikationFrei}
                onChange={(v) => setProfil({ meisterQualifikationFrei: v })}
                placeholder="z. B. Industriemeister Metall"
                  />
            </div>
          )}
        </QuestionBlock>
      )}

      {berufNoetig && gewerk && (
        <QuestionBlock
          index={studiumNoetig || meisterNoetig ? 4 : 3}
          title={berufFrage}
          hint={
            studiumNoetig || meisterNoetig
              ? `Ausbildungsberufe im Bereich ${gewerk.label}. Fast jeder Meister hat vorher eine Ausbildung gemacht — die Angabe schärft dein Matching. Überspringbar.`
              : `Ausbildungsberufe im Bereich ${gewerk.label}.`
          }
        >
          <div className="flex flex-wrap gap-2">
            {gewerk.berufe.map((b) => (
              <ChipToggle
                key={b.value}
                label={b.label}
                selected={p.ausbildungsberuf === b.value}
                onClick={() =>
                  setProfil({
                    ausbildungsberuf:
                      p.ausbildungsberuf === b.value ? null : b.value,
                  })
                }
              />
            ))}
          </div>
        </QuestionBlock>
      )}

      <ValueNote icon={ShieldCheck}>
        Das Gewerk entscheidet mit: Betriebe, die ein anderes suchen, tauchen bei
        dir gar nicht erst auf.
      </ValueNote>

      <StepActions>
        <NextButton disabled={!weiter} onClick={next}>
          Weiter
        </NextButton>
      </StepActions>
    </div>
  );
}
