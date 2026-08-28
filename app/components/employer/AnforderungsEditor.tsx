"use client";

// ─── Anforderungsprofil eines Inserats ────────────────────────────────────────
// Hier stellt der Betrieb ein, wen er sucht. Zwei Arten von Angaben, optisch
// getrennt, weil sie sehr unterschiedlich wirken:
//
//  • Ausschluss — wer das nicht erfüllt, bekommt die Stelle NICHT zu sehen.
//    Diese Felder sind rot markiert und tragen den Hinweis ausgeschrieben,
//    damit niemand aus Versehen den halben Bewerbermarkt aussperrt.
//  • Gewichtung — zählt Punkte und entscheidet über die Reihenfolge.
//
// Leer lassen heißt überall: ist uns egal. Genau so behandelt es das Matching.

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Scale } from "lucide-react";
import {
  getKatalog,
  type Katalog,
  type KatalogOption,
} from "@/lib/catalogService";
import type { Anforderungsprofil, JobGewichte } from "@/lib/types";

/** Vorgabegewichte — identisch zu `scoring.ts` im Backend. */
const STANDARD: Required<JobGewichte> = {
  aufgaben: 5,
  erfahrung: 4,
  beruf: 3,
  bezeichnung: 3,
  gehalt: 3,
  wuensche: 2,
  fuehrerschein: 2,
  meister: 2,
  start: 1,
};

const GEWICHT_LABELS: { key: keyof JobGewichte; label: string }[] = [
  { key: "aufgaben", label: "Aufgabenbereiche" },
  { key: "erfahrung", label: "Berufserfahrung" },
  { key: "beruf", label: "Ausbildungsberuf" },
  { key: "bezeichnung", label: "Berufsbezeichnung" },
  { key: "gehalt", label: "Gehalt" },
  { key: "meister", label: "Meister / Techniker" },
  { key: "wuensche", label: "Erfüllte Wünsche" },
  { key: "fuehrerschein", label: "Führerschein" },
  { key: "start", label: "Startzeitpunkt" },
];

export const LEERE_ANFORDERUNG: Anforderungsprofil = {
  gewerke: []
  ,
  meisterErwuenscht: false,
  bezeichnungTags: [],
  fuehrungGefordert: false,
  budgetMonatCents: null,
  berufe: [],
  abschlussMin: null,
  aufgaben: [],
  aufgabenMin: 0,
  erfahrungMin: null,
  erfahrungMax: null,
  montageMin: null,
  fuehrerscheinMin: null,
  deutschMin: null,
  gebotenes: [],
  startBis: null,
  gewichte: null,
};

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
      style={{
        background: selected ? "#1A1A2E" : "#FFFFFF",
        border: `1.5px solid ${selected ? "#1A1A2E" : "#E9E7E1"}`,
        color: selected ? "#FFFFFF" : "rgba(26,26,46,0.65)",
      }}
    >
      {label}
    </button>
  );
}

function Feld({
  titel,
  hinweis,
  ausschluss,
  children,
}: {
  titel: string;
  hinweis?: string;
  ausschluss?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <label className="text-[13px] font-semibold text-primary">{titel}</label>
        {ausschluss && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
            style={{ background: "rgba(185,28,28,0.08)", color: "#B91C1C" }}
          >
            <AlertTriangle className="w-3 h-3" />
            Ausschluss
          </span>
        )}
      </div>
      {hinweis && (
        <p className="text-[12px] mb-2" style={{ color: "rgba(26,26,46,0.5)" }}>
          {hinweis}
        </p>
      )}
      {children}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  border: "1.5px solid #E9E7E1",
  borderRadius: 12,
  padding: "8px 12px",
  fontSize: 13.5,
  background: "#fff",
  color: "#1A1A2E",
  minWidth: 200,
};

function Auswahl({
  wert,
  optionen,
  leerLabel,
  onChange,
}: {
  wert: string | null;
  optionen: KatalogOption[];
  leerLabel: string;
  onChange: (v: string | null) => void;
}) {
  return (
    <select
      value={wert ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      style={selectStyle}
    >
      <option value="">{leerLabel}</option>
      {optionen.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function AnforderungsEditor({
  wert,
  onChange,
}: {
  wert: Anforderungsprofil;
  onChange: (a: Anforderungsprofil) => void;
}) {
  const [katalog, setKatalog] = useState<Katalog | null>(null);

  useEffect(() => {
    void getKatalog().then((res) => {
      if (res.ok) setKatalog(res.data);
    });
  }, []);

  if (!katalog) {
    return (
      <div className="flex items-center gap-2 py-8 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#E8A838" }} />
        <span className="text-[13px]" style={{ color: "rgba(26,26,46,0.5)" }}>
          Katalog wird geladen …
        </span>
      </div>
    );
  }

  const set = (p: Partial<Anforderungsprofil>) => onChange({ ...wert, ...p });

  const toggle = (feld: "gewerke" | "berufe" | "aufgaben" | "gebotenes", v: string) => {
    const liste = wert[feld];
    set({
      [feld]: liste.includes(v) ? liste.filter((x) => x !== v) : [...liste, v],
    } as Partial<Anforderungsprofil>);
  };

  // Berufe und Aufgabenfelder ergeben sich aus den gewählten Bereichen. Ohne
  // Bereich gäbe es sonst eine Liste über alle Gewerke hinweg — unbrauchbar.
  const gewaehlteGewerke = katalog.gewerke.filter((b) =>
    wert.gewerke.includes(b.value),
  );
  const berufe = gewaehlteGewerke.flatMap((b) => b.berufe);
  const aufgaben = Array.from(
    new Map(gewaehlteGewerke.flatMap((b) => b.aufgaben).map((a) => [a.value, a])).values(),
  );

  const gewicht = (k: keyof JobGewichte) => wert.gewichte?.[k] ?? STANDARD[k];

  return (
    <div>
      <Feld
        titel="Gewerke"
        hinweis="Wer einen anderen Bereich gelernt hat, sieht dieses Inserat nicht. Nichts wählen = alle Bereiche."
        ausschluss
      >
        <div className="flex flex-wrap gap-1.5">
          {katalog.gewerke.map((b) => (
            <Chip
              key={b.value}
              label={b.label}
              selected={wert.gewerke.includes(b.value)}
              onClick={() => toggle("gewerke", b.value)}
            />
          ))}
        </div>
      </Feld>

      <Feld
        titel="Mindest-Ausbildungsstand"
        hinweis="Wer darunter liegt, sieht das Inserat nicht."
        ausschluss
      >
        <Auswahl
          wert={wert.abschlussMin}
          optionen={katalog.abschluss}
          leerLabel="Egal"
          onChange={(v) => set({ abschlussMin: v })}
        />
      </Feld>

      {berufe.length > 0 && (
        <Feld
          titel="Bevorzugte Ausbildungsberufe"
          hinweis="Kein Ausschluss: ein verwandter Beruf aus demselben Bereich zählt zu 60 %."
        >
          <div className="flex flex-wrap gap-1.5">
            {berufe.map((b) => (
              <Chip
                key={b.value}
                label={b.label}
                selected={wert.berufe.includes(b.value)}
                onClick={() => toggle("berufe", b.value)}
              />
            ))}
          </div>
        </Feld>
      )}

      {aufgaben.length > 0 && (
        <Feld
          titel="Gesuchte Aufgabenbereiche"
          hinweis="Je mehr davon der Bewerber abdeckt, desto höher der Wert."
        >
          <div className="flex flex-wrap gap-1.5 mb-3">
            {aufgaben.map((a) => (
              <Chip
                key={a.value}
                label={a.label}
                selected={wert.aufgaben.includes(a.value)}
                onClick={() => toggle("aufgaben", a.value)}
              />
            ))}
          </div>
          {wert.aufgaben.length > 0 && (
            <div
              className="flex flex-wrap items-center gap-2 rounded-xl px-3 py-2.5"
              style={{ background: "rgba(185,28,28,0.04)", border: "1px solid rgba(185,28,28,0.15)" }}
            >
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#B91C1C" }} />
              <span className="text-[12.5px]" style={{ color: "rgba(26,26,46,0.7)" }}>
                Davon zwingend erforderlich:
              </span>
              <select
                value={wert.aufgabenMin}
                onChange={(e) => set({ aufgabenMin: Number(e.target.value) })}
                style={{ ...selectStyle, minWidth: 150, padding: "5px 10px" }}
              >
                <option value={0}>keiner (nur Punkte)</option>
                {wert.aufgaben.map((_, i) => (
                  <option key={i} value={i + 1}>
                    mindestens {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}
        </Feld>
      )}

      <Feld titel="Berufserfahrung" hinweis="Weniger als gesucht kostet je Stufe die Hälfte; mehr kostet fast nichts.">
        <div className="flex flex-wrap items-center gap-2">
          <Auswahl
            wert={wert.erfahrungMin}
            optionen={katalog.erfahrung}
            leerLabel="ab — egal"
            onChange={(v) => set({ erfahrungMin: v })}
          />
          <span className="text-[13px]" style={{ color: "rgba(26,26,46,0.4)" }}>
            bis
          </span>
          <Auswahl
            wert={wert.erfahrungMax}
            optionen={katalog.erfahrung}
            leerLabel="offen"
            onChange={(v) => set({ erfahrungMax: v })}
          />
        </div>
      </Feld>

      <Feld
        titel="Verlangte Montagebereitschaft"
        hinweis="Wer weniger angegeben hat, sieht das Inserat nicht."
        ausschluss
      >
        <Auswahl
          wert={wert.montageMin}
          optionen={katalog.montage}
          leerLabel="Egal"
          onChange={(v) => set({ montageMin: v })}
        />
      </Feld>

      <Feld
        titel="Führerschein"
        hinweis="Kein voller Ausschluss: Nur wer gar keinen hat, fällt raus — eine niedrigere Klasse kostet Punkte."
      >
        <Auswahl
          wert={wert.fuehrerscheinMin}
          optionen={katalog.fuehrerschein.filter((f) => f.rang >= 2)}
          leerLabel="Nicht nötig"
          onChange={(v) => set({ fuehrerscheinMin: v })}
        />
      </Feld>

      <Feld
        titel="Mindest-Deutschkenntnisse"
        hinweis="Wer darunter liegt, sieht das Inserat nicht."
        ausschluss
      >
        <Auswahl
          wert={wert.deutschMin}
          optionen={katalog.deutsch}
          leerLabel="Egal"
          onChange={(v) => set({ deutschMin: v })}
        />
      </Feld>

      <Feld
        titel="Was Sie bieten"
        hinweis="Trifft auf die Prioritäten des Bewerbers — je mehr Übereinstimmung, desto weiter oben stehen Sie bei ihm."
      >
        <div className="flex flex-wrap gap-1.5">
          {katalog.wuensche.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              selected={wert.gebotenes.includes(o.value)}
              onClick={() => toggle("gebotenes", o.value)}
            />
          ))}
        </div>
      </Feld>

      <Feld titel="Stelle soll besetzt sein" hinweis="Wer später kann, verliert Punkte — ausgeschlossen wird niemand.">
        <Auswahl
          wert={wert.startBis}
          optionen={katalog.start}
          leerLabel="Egal"
          onChange={(v) => set({ startBis: v })}
        />
      </Feld>

      <div
        className="rounded-2xl px-4 py-4 mt-6"
        style={{ background: "var(--color-surface)" }}
      >
        <p className="flex items-center gap-2 text-[13px] font-semibold text-primary mb-1">
          <Scale className="w-4 h-4" style={{ color: "#E8A838" }} />
          Gewichtung
        </p>
        <p className="text-[12px] mb-4" style={{ color: "rgba(26,26,46,0.5)" }}>
          Wie stark jedes Kriterium den Wert beeinflusst. 0 nimmt es ganz aus der
          Wertung — ausgeschlossen wird dadurch niemand.
        </p>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {GEWICHT_LABELS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3">
              <span className="text-[13px] flex-1 text-primary">{label}</span>
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={gewicht(key)}
                onChange={(e) =>
                  set({
                    gewichte: { ...(wert.gewichte ?? {}), [key]: Number(e.target.value) },
                  })
                }
                className="flex-1 accent-[#E8A838]"
              />
              <span
                className="text-[13px] font-bold tabular-nums w-4 text-right"
                style={{ color: gewicht(key) === 0 ? "rgba(26,26,46,0.35)" : "#8A5B0F" }}
              >
                {gewicht(key)}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
