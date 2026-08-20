"use client";

// ─── Verdienst-Rechner ────────────────────────────────────────────────────────
// Ein Eingabewert, drei abgeleitete Ergebnisse.
//
// Vorher standen hier drei unabhängige Regler für Tag, Monat und Jahr. Die
// wussten nichts voneinander und zeigten deshalb gleichzeitig Werte, die sich
// widersprachen — 4 am Tag wären rund 1.460 im Jahr, daneben stand aber 184.
// Bei einem Verdienstversprechen kostet so ein Widerspruch sofort die
// Glaubwürdigkeit.
//
// Jetzt wählt der Nutzer selbst, in welcher Einheit er denkt. Wer monatlich
// rechnen will, stellt "pro Monat" ein — dann ist die Monatszahl exakt seine
// Eingabe mal Prämie. Wer in Tagen denkt, sieht sofort Monat und Jahr.

import { useState } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

const PRAEMIE = 100;

/**
 * Alles wird ueber die WOCHE umgerechnet, nicht ueber das Jahr.
 *
 * Vorher lief die Rechnung ueber 250 Arbeitstage im Jahr, geteilt durch 52
 * Kalenderwochen — das ergab bei "1 pro Tag" 4,81 pro Woche und damit 481 EUR
 * statt der erwarteten 500. Rechnerisch korrekt, aber niemand rechnet so.
 * Mit der Woche als Anker gilt die intuitive Kette: 1 am Tag = 5 in der Woche.
 */
const ARBEITSTAGE_PRO_WOCHE = 5;
const WOCHEN_PRO_MONAT = 52 / 12; // 4,33 — so bleibt Monat x 12 = Jahr exakt
const WOCHEN_PRO_JAHR = 52;

const EINHEITEN = [
  { key: "tag", label: "pro Tag", kurz: "am Tag", max: 5, proWoche: ARBEITSTAGE_PRO_WOCHE, standard: 1 },
  { key: "woche", label: "pro Woche", kurz: "pro Woche", max: 15, proWoche: 1, standard: 1 },
  { key: "monat", label: "pro Monat", kurz: "im Monat", max: 40, proWoche: 1 / WOCHEN_PRO_MONAT, standard: 2 },
] as const;

type EinheitKey = (typeof EINHEITEN)[number]["key"];

const fmt = (n: number) => Math.round(n).toLocaleString("de-DE");

/** Ergebniskachel. `gross` hebt den Monatswert hervor — er ist der greifbarste. */
function Ergebnis({
  periode,
  euro,
  deals,
  gross = false,
}: {
  periode: string;
  euro: number;
  deals: string;
  gross?: boolean;
}) {
  return (
    <div
      className="rounded-2xl px-5 py-5 flex flex-col justify-between"
      style={{
        background: gross ? "rgba(232,168,56,0.12)" : "var(--color-surface)",
        border: `1.5px solid ${gross ? "rgba(232,168,56,0.5)" : "var(--color-border)"}`,
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: gross ? "#8A5B0F" : "rgba(26,26,46,0.45)" }}
      >
        {periode}
      </p>
      <p
        className="text-primary font-black leading-none tabular-nums mt-3"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: gross ? "clamp(2.1rem, 5.5vw, 2.9rem)" : "clamp(1.5rem, 3.6vw, 1.9rem)",
        }}
      >
        {fmt(euro)}&nbsp;€
      </p>
      <p className="text-muted text-[12.5px] mt-2">{deals}</p>
    </div>
  );
}

export default function AffiliateRechner() {
  const [einheit, setEinheit] = useState<EinheitKey>("monat");
  const [anzahl, setAnzahl] = useState(2);

  const e = EINHEITEN.find((x) => x.key === einheit)!;

  // Alles aus einer Zahl ableiten — so kann sich nichts mehr widersprechen.
  const proWoche = anzahl * e.proWoche;
  const proMonat = proWoche * WOCHEN_PRO_MONAT;
  const proJahr = proWoche * WOCHEN_PRO_JAHR;

  const wechsle = (key: EinheitKey) => {
    const neu = EINHEITEN.find((x) => x.key === key)!;
    setEinheit(key);
    // Auf den Standardwert der neuen Einheit setzen: 20 "pro Monat" ergäbe
    // als "pro Tag" sonst absurde Hochrechnungen.
    setAnzahl(neu.standard);
  };

  const pct = e.max > 0 ? (anzahl / e.max) * 100 : 0;

  return (
    <div className="bg-white rounded-3xl border border-border shadow-[0_28px_64px_-32px_rgba(26,26,46,0.4)] overflow-hidden">
      <div className="h-1.5 w-full bg-accent" />

      <div className="p-6 sm:p-8 lg:p-10">
        <p className="text-center text-muted text-sm mb-7">
          Feste Prämie:{" "}
          <span className="text-primary font-semibold">100 € pro erfolgreicher Vermittlung</span>.
          Stell ein, wie oft du vermittelst.
        </p>

        {/* ── Einheit wählen ── */}
        <div className="flex justify-center mb-7">
          <div
            className="inline-flex rounded-full p-1"
            style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
            role="group"
            aria-label="Bezugszeitraum"
          >
            {EINHEITEN.map((opt) => {
              const aktiv = opt.key === einheit;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => wechsle(opt.key)}
                  aria-pressed={aktiv}
                  className="relative rounded-full px-4 sm:px-6 py-2.5 text-[14px] font-semibold transition-colors duration-200"
                  style={{ color: aktiv ? "#1A1A2E" : "rgba(26,26,46,0.5)" }}
                >
                  {aktiv && (
                    <motion.span
                      layoutId="rechner-einheit"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  <span className="relative">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Eingabe ── */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="flex items-end justify-center gap-3 mb-5">
            <span
              className="text-accent font-black leading-none tabular-nums"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 9vw, 4.5rem)" }}
            >
              {anzahl}
            </span>
            <span className="text-muted text-[15px] pb-2">
              {anzahl === 1 ? "Vermittlung" : "Vermittlungen"} {e.kurz}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={e.max}
            step={1}
            value={anzahl}
            onChange={(ev) => setAnzahl(parseInt(ev.target.value, 10))}
            aria-label={`Vermittlungen ${e.label}`}
            className="w-full h-[6px] appearance-none cursor-pointer rounded-full"
            style={{
              accentColor: "#E8A838",
              background: `linear-gradient(to right, #E8A838 ${pct}%, var(--color-border) ${pct}%)`,
            }}
          />
          <div className="flex justify-between mt-2 text-[11px] tabular-nums text-muted">
            <span>0</span>
            <span>
              {e.max} {e.kurz}
            </span>
          </div>

          {/* Umrechnung, damit klar ist, was gerade eingestellt ist */}
          {anzahl > 0 && einheit !== "monat" && (
            <p className="text-center text-[13px] text-muted mt-4">
              {anzahl} {e.kurz} sind{" "}
              <span className="text-primary font-semibold">
                {fmt(proWoche)} {proWoche < 1.5 ? "Vermittlung" : "Vermittlungen"} pro Woche
              </span>{" "}
              und rund{" "}
              <span className="text-primary font-semibold">
                {fmt(proMonat)} im Monat
              </span>
              .
            </p>
          )}
        </div>

        {/* ── Ergebnis ── */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Ergebnis
            periode="Pro Woche"
            euro={proWoche * PRAEMIE}
            deals={`${proWoche < 1 ? proWoche.toFixed(1).replace(".", ",") : fmt(proWoche)} Vermittlungen`}
          />
          <Ergebnis
            gross
            periode="Pro Monat"
            euro={proMonat * PRAEMIE}
            deals={`${fmt(proMonat)} Vermittlungen`}
          />
          <Ergebnis
            periode="Pro Jahr"
            euro={proJahr * PRAEMIE}
            deals={`${fmt(proJahr)} Vermittlungen`}
          />
        </div>

        {/* ── Einordnung ── */}
        <div
          className="flex items-start gap-3 rounded-2xl px-4 py-3.5 mt-6"
          style={{ background: "rgba(26,26,46,0.035)" }}
        >
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
          <p className="text-[12.5px] leading-relaxed text-muted">
            Die meisten Partner vermitteln <span className="text-primary font-semibold">ein bis drei
            Kollegen im Monat</span> — ganz nebenbei, ohne Aufwand. Beispielrechnung, keine Zusage:
            ausgezahlt wird pro Vermittlung, die tatsächlich zustande kommt.
            <br />
            <span className="text-[12px]">
              Gerechnet mit 5 Arbeitstagen pro Woche und 52 Wochen im Jahr.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
