"use client";

// ─── Anforderungsprofil eines Inserats ────────────────────────────────────────
// Hier stellt der Betrieb ein, wen er sucht. Zwei Arten von Angaben, optisch
// getrennt, weil sie sehr unterschiedlich wirken:
//
//  • Muss-Kriterium — wer das nicht erfüllt, bekommt die Stelle NICHT zu
//    sehen. Diese Felder sind rot markiert und tragen den Hinweis
//    ausgeschrieben, damit niemand aus Versehen den halben Markt aussperrt.
//  • Gewichtung — zählt Punkte und entscheidet über die Reihenfolge.
//
// Die Felder hiessen zuvor "Ausschluss". Das Wort beschreibt die Technik, nicht
// die Wirkung: der Gründer selbst konnte nicht sagen, was es bedeutet. Ein
// Betrieb denkt in "das muss er können" — deshalb jetzt "Muss".
//
// Leer lassen heißt überall: ist uns egal. Genau so behandelt es das Matching.

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Loader2, Scale } from "lucide-react";
import Auswahl from "@/app/components/dashboard/Auswahl";
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
  // Das Haekchen ist der Unterschied zwischen "Knopf" und "Auswahl": ohne es
  // muss man aus der Farbe erraten, ob dunkel nun gewaehlt oder anklickbar
  // heisst. Der Platz dafuer wird immer freigehalten, damit die Reihe beim
  // Anklicken nicht umspringt.
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-3.5 py-2 text-[12.5px] font-medium transition-[background,border-color,color,transform] duration-150 hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
      style={{
        background: selected ? "#1A1A2E" : "#FFFFFF",
        border: `1.5px solid ${selected ? "#1A1A2E" : "#E9E7E1"}`,
        color: selected ? "#FFFFFF" : "rgba(26,26,46,0.65)",
      }}
    >
      <span
        className="w-[15px] h-[15px] rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
        style={{
          background: selected ? "#E8A838" : "transparent",
          border: `1.5px solid ${selected ? "#E8A838" : "#DDD9D1"}`,
        }}
      >
        {selected && <Check className="w-[9px] h-[9px]" strokeWidth={4} style={{ color: "#1A1A2E" }} />}
      </span>
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
  // Ausschlussfelder tragen eine rote Kante links statt nur einer Marke in der
  // Zeile: beim Ueberfliegen sieht man dadurch sofort, welche Angaben Bewerber
  // aussperren — ohne dass rote Flaechen die Seite beherrschen.
  return (
    <div
      className="mb-6 pl-4"
      style={{ borderLeft: `2px solid ${ausschluss ? "rgba(192,57,43,0.45)" : "#EDE8DC"}` }}
    >
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <label className="text-[14px] font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
          {titel}
        </label>
        {ausschluss && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
            style={{ background: "rgba(185,28,28,0.07)", color: "#9B2C2C" }}
          >
            <AlertTriangle className="w-3 h-3" />
            Muss
          </span>
        )}
      </div>
      {hinweis && (
        <p className="text-[12.5px] mb-2.5 max-w-2xl leading-relaxed" style={{ color: "rgba(26,26,46,0.5)" }}>
          {hinweis}
        </p>
      )}
      {children}
    </div>
  );
}

/**
 * Duennes Zwischenstueck auf das gemeinsame Auswahlfeld.
 *
 * Vorher standen hier native <select>. Deren Klappliste zeichnet das
 * Betriebssystem — graue Systemschrift, eckige Raender, kein Bezug zum Rest
 * der Seite. Mit CSS nicht zu gestalten, nur zu ersetzen.
 */
function KatalogAuswahl({
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
    <Auswahl
      wert={wert}
      optionen={optionen.map((o) => ({ value: o.value, label: o.label }))}
      leerLabel={leerLabel}
      onChange={onChange}
    />
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
      {/* Die zwei Arten von Angaben, bevor die erste kommt. Ohne diese Zeilen
          musste man sich aus den Hinweisen unter den Feldern zusammenreimen,
          was ein rot markiertes Feld eigentlich bewirkt. */}
      <div
        className="rounded-2xl px-4 py-4 mb-6 grid sm:grid-cols-2 gap-x-6 gap-y-3"
        style={{ background: "rgba(26,26,46,0.025)", border: "1px solid #EDE8DC" }}
      >
        <p className="flex items-start gap-2.5 text-[13px] leading-relaxed" style={{ color: "rgba(26,26,46,0.65)" }}>
          <span
            className="w-2 h-2 rounded-full flex-shrink-0 mt-[6px]"
            style={{ background: "#C0392B" }}
          />
          <span>
            <strong className="text-primary">Rot = Muss.</strong> Wer das nicht
            erfüllt, bekommt Ihr Inserat gar nicht erst zu sehen und kann sich
            nicht bewerben.
          </span>
        </p>
        <p className="flex items-start gap-2.5 text-[13px] leading-relaxed" style={{ color: "rgba(26,26,46,0.65)" }}>
          <span
            className="w-2 h-2 rounded-full flex-shrink-0 mt-[6px]"
            style={{ background: "#E8A838" }}
          />
          <span>
            <strong className="text-primary">Alles andere zählt Punkte.</strong>{" "}
            Es sperrt niemanden aus, sondern schiebt passende Bewerber in Ihrer
            Liste nach oben.
          </span>
        </p>
      </div>

      <Feld
        titel="Gewerke"
        hinweis="Nur wer einen dieser Bereiche gelernt hat, bekommt das Inserat zu sehen. Nichts wählen = alle Bereiche."
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
        hinweis="Wer weniger vorweisen kann, bekommt das Inserat nicht zu sehen."
        ausschluss
      >
        <KatalogAuswahl
          wert={wert.abschlussMin}
          optionen={katalog.abschluss}
          leerLabel="Egal"
          onChange={(v) => set({ abschlussMin: v })}
        />
      </Feld>

      {berufe.length > 0 && (
        <Feld
          titel="Bevorzugte Ausbildungsberufe"
          hinweis="Kein Muss — ein verwandter Beruf aus demselben Bereich zählt zu 60 %."
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
              className="flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3.5"
              style={{ background: "rgba(185,28,28,0.035)", border: "1px solid rgba(185,28,28,0.14)" }}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#9B2C2C" }} />
              <span className="text-[13px] font-semibold" style={{ color: "rgba(26,26,46,0.7)" }}>
                Davon muss der Bewerber können:
              </span>
              <Auswahl
                wert={wert.aufgabenMin > 0 ? String(wert.aufgabenMin) : null}
                optionen={wert.aufgaben.map((_, i) => ({
                  value: String(i + 1),
                  label: `mindestens ${i + 1}`,
                }))}
                leerLabel="keine (nur Punkte)"
                onChange={(v) => set({ aufgabenMin: v ? Number(v) : 0 })}
              />
            </div>
          )}
        </Feld>
      )}

      <Feld titel="Berufserfahrung" hinweis="Weniger als gesucht kostet je Stufe die Hälfte; mehr kostet fast nichts.">
        <div className="flex flex-wrap items-center gap-2">
          <KatalogAuswahl
            wert={wert.erfahrungMin}
            optionen={katalog.erfahrung}
            leerLabel="ab — egal"
            onChange={(v) => set({ erfahrungMin: v })}
          />
          <span className="text-[13px]" style={{ color: "rgba(26,26,46,0.4)" }}>
            bis
          </span>
          <KatalogAuswahl
            wert={wert.erfahrungMax}
            optionen={katalog.erfahrung}
            leerLabel="offen"
            onChange={(v) => set({ erfahrungMax: v })}
          />
        </div>
      </Feld>

      <Feld
        titel="Verlangte Montagebereitschaft"
        hinweis="Wer weniger Montage angegeben hat, bekommt das Inserat nicht zu sehen."
        ausschluss
      >
        <KatalogAuswahl
          wert={wert.montageMin}
          optionen={katalog.montage}
          leerLabel="Egal"
          onChange={(v) => set({ montageMin: v })}
        />
      </Feld>

      <Feld
        titel="Führerschein"
        hinweis="Nur wer gar keinen Führerschein hat, fällt raus. Eine niedrigere Klasse kostet nur Punkte."
      >
        <KatalogAuswahl
          wert={wert.fuehrerscheinMin}
          optionen={katalog.fuehrerschein.filter((f) => f.rang >= 2)}
          leerLabel="Nicht nötig"
          onChange={(v) => set({ fuehrerscheinMin: v })}
        />
      </Feld>

      <Feld
        titel="Mindest-Deutschkenntnisse"
        hinweis="Wer schlechter Deutsch spricht, bekommt das Inserat nicht zu sehen."
        ausschluss
      >
        <KatalogAuswahl
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
        <KatalogAuswahl
          wert={wert.startBis}
          optionen={katalog.start}
          leerLabel="Egal"
          onChange={(v) => set({ startBis: v })}
        />
      </Feld>

      {/* ── Gewichtung ──
          Vorher neun Schieberegler des Browsers: winzige Griffe, die man mit
          der Maus treffen muss, und ein Aussehen, das je nach System anders
          ist. Jetzt sechs Balken je Zeile zum Anklicken — der Wert ist mit
          einem Klick gesetzt und auf einen Blick ablesbar. Gespeichert wird
          weiterhin dieselbe Zahl 0–5. */}
      <div
        className="rounded-3xl px-5 py-5 mt-7"
        style={{
          background: "linear-gradient(158deg, #FBF9F4 0%, #F6F1E6 100%)",
          border: "1.5px solid #EDE8DC",
        }}
      >
        <p
          className="flex items-center gap-2 text-[15px] font-bold text-primary mb-1.5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <Scale className="w-4 h-4" style={{ color: "#E8A838" }} />
          Was Ihnen am wichtigsten ist
        </p>
        {/* Der alte Text ("wie stark jedes Kriterium den Wert beeinflusst")
            beschrieb die Rechnung statt den Nutzen — niemand wusste, welchen
            "Wert" er meint. Jetzt steht da, was der Betrieb davon hat. */}
        <p className="text-[13px] mb-4 max-w-2xl leading-relaxed" style={{ color: "rgba(26,26,46,0.6)" }}>
          Jeder Handwerker bekommt eine Prozentzahl, wie gut er zu dieser Stelle
          passt. Hier stellen Sie ein, was dabei schwerer wiegt.{" "}
          <strong className="text-primary">5 zählt fünfmal so stark wie 1</strong>{" "}
          — bei 0 zählt es überhaupt nicht mit.
        </p>
        <p
          className="text-[12.5px] mb-5 max-w-2xl leading-relaxed rounded-xl px-3.5 py-2.5"
          style={{ background: "rgba(232,168,56,0.1)", color: "rgba(26,26,46,0.62)" }}
        >
          <strong className="text-primary">Beispiel:</strong> Erfahrung auf 5 und
          Führerschein auf 1 — dann steht ein alter Hase mit kleiner Klasse trotzdem
          weit oben in Ihrer Liste.
        </p>
        {/* Wie die Balken zu lesen sind. Zuvor stand hier "links / rechts" an
            den Aussenkanten des Kastens — links steht dort aber der Name des
            Kriteriums, nicht der erste Balken. */}
        <p
          className="text-[12.5px] pb-3 mb-3.5 leading-relaxed"
          style={{ color: "rgba(26,26,46,0.45)", borderBottom: "1px solid #EDE8DC" }}
        >
          Je mehr Balken, desto stärker zählt es. Der kleine graue Balken ganz
          vorn bedeutet: zählt gar nicht mit.
        </p>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3.5">
          {GEWICHT_LABELS.map(({ key, label }) => {
            const g = gewicht(key);
            return (
              <div key={key} className="flex items-center gap-3">
                <span
                  className="text-[13px] flex-1 min-w-0 truncate"
                  style={{ color: g === 0 ? "rgba(26,26,46,0.4)" : "#1A1A2E" }}
                >
                  {label}
                </span>
                {/* Unten buendig, sonst wirkt die Reihe wie eine Raute statt
                    wie eine ansteigende Treppe. */}
                <div
                  className="flex items-end gap-1 flex-shrink-0"
                  style={{ height: 23 }}
                  role="group"
                  aria-label={`Gewichtung ${label}`}
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-label={`${label}: ${n}`}
                      aria-pressed={g === n}
                      onClick={() =>
                        set({ gewichte: { ...(wert.gewichte ?? {}), [key]: n } })
                      }
                      className="rounded-full transition-[background,height] duration-150"
                      style={{
                        width: 9,
                        // Die Balken wachsen mit dem Wert — die Zeile ist als
                        // Treppe lesbar, auch ohne die Zahl daneben.
                        height: 8 + n * 3,
                        background:
                          n === 0
                            ? g === 0
                              ? "rgba(26,26,46,0.35)"
                              : "rgba(26,26,46,0.13)"
                            : n <= g
                              ? "#E8A838"
                              : "rgba(26,26,46,0.1)",
                      }}
                    />
                  ))}
                </div>
                <span
                  className="text-[13px] font-bold tabular-nums w-3 text-right flex-shrink-0"
                  style={{ color: g === 0 ? "rgba(26,26,46,0.3)" : "#8A5B0F" }}
                >
                  {g}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
