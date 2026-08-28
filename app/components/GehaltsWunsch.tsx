"use client";

// ─── Gehaltswunsch ────────────────────────────────────────────────────────────
// Ein Schieberegler mit drei Perioden. Der Nutzer denkt entweder in Stunden,
// in Monaten oder im Jahr — welche davon, hängt am Beruf und am Betrieb.
//
// Beim Wechsel der Periode wird der Betrag UMGERECHNET statt zurückgesetzt:
// Wer 3.500 € monatlich eingestellt hat und auf „jährlich" wechselt, will
// 42.000 € sehen, nicht wieder bei null anfangen. Gerechnet wird mit denselben
// Größen wie im Backend (173 Std/Monat, 12 Monate/Jahr), damit der Wert auf dem
// Regler und der Wert in der Datenbank derselbe ist.
//
// Übersprungen ist ein eigener Zustand, kein Betrag von 0: „keine Angabe" und
// „ich will nichts verdienen" sind verschiedene Aussagen, und das Matching
// behandelt sie verschieden.

import { Coins, X } from "lucide-react";
import { gehaltUmrechnen, type Katalog } from "@/lib/catalogService";

/** Spanne und Schrittweite je Periode, in Cent. */
const SPANNE: Record<string, { min: number; max: number; schritt: number }> = {
  stuendlich: { min: 1200, max: 8000, schritt: 50 },
  monatlich: { min: 180_000, max: 1_200_000, schritt: 5_000 },
  jaehrlich: { min: 2_160_000, max: 14_400_000, schritt: 60_000 },
};

const VORGABE = "monatlich";

const formatiere = (cents: number, periode: string) => {
  const euro = cents / 100;
  const text = euro.toLocaleString("de-DE", {
    maximumFractionDigits: periode === "stuendlich" ? 2 : 0,
    minimumFractionDigits: periode === "stuendlich" ? 2 : 0,
  });
  const einheit =
    periode === "stuendlich" ? "€/Std" : periode === "jaehrlich" ? "€/Jahr" : "€/Monat";
  return `${text} ${einheit}`;
};

export default function GehaltsWunsch({
  katalog,
  periode,
  betragCents,
  onChange,
}: {
  katalog: Katalog | null;
  periode: string | null;
  betragCents: number | null;
  onChange: (periode: string | null, betragCents: number | null) => void;
}) {
  const perioden = katalog?.gehaltPerioden ?? [
    { value: "stuendlich", label: "Stündlich" },
    { value: "monatlich", label: "Monatlich" },
    { value: "jaehrlich", label: "Jährlich" },
  ];

  const aktivePeriode = periode ?? VORGABE;
  const spanne = SPANNE[aktivePeriode] ?? SPANNE[VORGABE];
  const uebersprungen = betragCents == null;
  const wert = betragCents ?? Math.round((spanne.min + spanne.max) / 2 / spanne.schritt) * spanne.schritt;

  const periodeWechseln = (neu: string) => {
    if (neu === aktivePeriode) return;
    if (uebersprungen) {
      onChange(neu, null);
      return;
    }
    const umgerechnet = gehaltUmrechnen(katalog, aktivePeriode, neu, wert);
    const z = SPANNE[neu];
    // In die Spanne der neuen Periode einpassen und auf die Schrittweite runden,
    // sonst steht der Regler zwischen zwei Rasterpunkten.
    const gerundet = Math.round(umgerechnet / z.schritt) * z.schritt;
    onChange(neu, Math.min(z.max, Math.max(z.min, gerundet)));
  };

  return (
    <div>
      {/* Periodenwahl */}
      <div className="flex flex-wrap gap-2 mb-5">
        {perioden.map((per) => {
          const aktiv = per.value === aktivePeriode;
          return (
            <button
              key={per.value}
              type="button"
              onClick={() => periodeWechseln(per.value)}
              aria-pressed={aktiv}
              className="px-4 py-2 text-[13px] font-medium rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              style={{
                background: aktiv ? "#1A1A2E" : "white",
                color: aktiv ? "white" : "rgba(26,26,46,0.65)",
                border: `1.5px solid ${aktiv ? "#1A1A2E" : "#E9E7E1"}`,
              }}
            >
              {per.label}
            </button>
          );
        })}
      </div>

      {uebersprungen ? (
        <button
          type="button"
          onClick={() => onChange(aktivePeriode, wert)}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-5 text-[14px] font-medium transition-colors duration-200"
          style={{
            border: "1.5px dashed #E9E7E1",
            color: "rgba(26,26,46,0.55)",
            background: "rgba(26,26,46,0.015)",
          }}
        >
          <Coins className="w-4 h-4" style={{ color: "#E8A838" }} />
          Gehaltswunsch angeben
        </button>
      ) : (
        <div
          className="rounded-2xl p-5"
          style={{ border: "1.5px solid #E9E7E1", background: "white" }}
        >
          <div className="flex items-baseline justify-between mb-4">
            <span
              className="text-[26px] font-bold tabular-nums leading-none"
              style={{ fontFamily: "var(--font-display)", color: "#1A1A2E" }}
            >
              {formatiere(wert, aktivePeriode)}
            </span>
            <button
              type="button"
              onClick={() => onChange(null, null)}
              className="inline-flex items-center gap-1 text-[12px] transition-colors duration-200 hover:text-primary"
              style={{ color: "rgba(26,26,46,0.45)" }}
            >
              <X className="w-3 h-3" />
              Überspringen
            </button>
          </div>

          <input
            type="range"
            min={spanne.min}
            max={spanne.max}
            step={spanne.schritt}
            value={wert}
            onChange={(e) => onChange(aktivePeriode, Number(e.target.value))}
            aria-label="Mindest-Gehaltswunsch"
            className="w-full accent-accent"
          />

          <div
            className="flex justify-between mt-1.5 text-[11.5px] tabular-nums"
            style={{ color: "rgba(26,26,46,0.4)" }}
          >
            <span>{formatiere(spanne.min, aktivePeriode)}</span>
            <span>{formatiere(spanne.max, aktivePeriode)}</span>
          </div>

          {/* Die beiden anderen Perioden mitlaufen lassen — dieselbe Zahl in
              der Einheit, in der sie im Arbeitsvertrag stehen wird. */}
          <p className="mt-4 text-[12.5px]" style={{ color: "rgba(26,26,46,0.5)" }}>
            entspricht{" "}
            {perioden
              .filter((per) => per.value !== aktivePeriode)
              .map((per) =>
                formatiere(gehaltUmrechnen(katalog, aktivePeriode, per.value, wert), per.value),
              )
              .join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}
