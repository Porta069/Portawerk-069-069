"use client";

// ─── Schritt 1 — Ausbildung ───────────────────────────────────────────────────
// Bewusst der Einstieg: der Ausbildungsbereich ist das schärfste Kriterium im
// Matching (er schließt Stellen ganz aus) und zugleich die Frage, die jeder
// ohne Nachdenken beantwortet.
//
// Die zweite und dritte Frage hängen an der ersten: Berufe gehören zu einem
// Bereich, und wer keine Ausbildung hat, bekommt die Berufsfrage gar nicht
// gestellt — statt sie mit „trifft nicht zu" zu beantworten.

import { useEffect, useState } from "react";
import {
  Zap, Droplets, Flame, Paintbrush, Hammer, Blocks, Home, Grid3x3,
  TreePine, Wrench, Car, SquareStack, Construction, Sprout, HardHat,
  GraduationCap, Loader2, AlertCircle, ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import {
  getKatalog,
  bereichVon,
  bereichWechseln,
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

const ICONS: Record<string, LucideIcon> = {
  elektronik: Zap,
  shk: Droplets,
  heizung_lueftung: Flame,
  maler: Paintbrush,
  tischler: Hammer,
  maurer: Blocks,
  dachdecker: Home,
  fliesenleger: Grid3x3,
  zimmerer: TreePine,
  metallbau: Wrench,
  kfz: Car,
  trockenbau: SquareStack,
  geruestbau: Construction,
  galabau: Sprout,
  sonstiges: HardHat,
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
  const bereich = bereichVon(katalog, p.bereich);
  // Ohne Ausbildung gibt es keinen Ausbildungsberuf — die Frage entfällt dann.
  const berufNoetig = p.ausbildungsstatus != null && p.ausbildungsstatus !== "keine";
  const weiter =
    !!p.bereich && !!p.ausbildungsstatus && (!berufNoetig || !!p.beruf);

  // Die Frageformulierung folgt der Antwort: „absolvierst du gerade" passt nur,
  // solange die Ausbildung läuft.
  const berufFrage =
    p.ausbildungsstatus === "in_ausbildung"
      ? "Welche Ausbildung absolvierst du gerade?"
      : "Welche Ausbildung hast du abgeschlossen?";

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
      <StepHeading eyebrow="Deine Ausbildung">
        Damit finden wir nur Stellen, die fachlich wirklich zu dir passen —
        alles andere blenden wir aus.
      </StepHeading>

      <QuestionBlock
        index={1}
        title="In welchem Bereich hast du deine Ausbildung gemacht?"
        required
      >
        <div className="grid sm:grid-cols-2 gap-2.5">
          {katalog.bereiche.map((b) => (
            <OptionCard
              key={b.value}
              icon={ICONS[b.value] ?? HardHat}
              label={b.label}
              selected={p.bereich === b.value}
              onClick={() => setProfil(bereichWechseln(p, b.value, katalog))}
            />
          ))}
        </div>
      </QuestionBlock>

      <QuestionBlock index={2} title="Hast du eine Ausbildung absolviert?" required>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {katalog.ausbildungsstatus.map((s) => (
            <OptionCard
              key={s.value}
              icon={GraduationCap}
              label={s.label}
              selected={p.ausbildungsstatus === s.value}
              onClick={() =>
                setProfil({
                  ausbildungsstatus: s.value,
                  // „Keine Ausbildung" und ein Ausbildungsberuf schließen
                  // einander aus — der alte Wert darf nicht stehen bleiben.
                  ...(s.value === "keine" ? { beruf: null } : {}),
                })
              }
            />
          ))}
        </div>
      </QuestionBlock>

      {berufNoetig && bereich && (
        <QuestionBlock
          index={3}
          title={berufFrage}
          hint={`Berufe im Bereich ${bereich.label}.`}
          required
        >
          <div className="flex flex-wrap gap-2">
            {bereich.berufe.map((b) => (
              <ChipToggle
                key={b.value}
                label={b.label}
                selected={p.beruf === b.value}
                onClick={() => setProfil({ beruf: b.value })}
              />
            ))}
          </div>
        </QuestionBlock>
      )}

      <ValueNote icon={ShieldCheck}>
        Der Ausbildungsbereich entscheidet mit: Betriebe, die einen anderen
        Bereich suchen, tauchen bei dir gar nicht erst auf.
      </ValueNote>

      <StepActions>
        <NextButton onClick={next} disabled={!weiter}>
          Weiter
        </NextButton>
      </StepActions>
    </div>
  );
}
