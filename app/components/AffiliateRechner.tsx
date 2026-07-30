"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

const fmt = (n: number) => Math.round(n).toLocaleString("de-DE");

export default function AffiliateRechner() {
  const [praemie, setPraemie] = useState(100);
  const [proMonat, setProMonat] = useState(5); // Vermittlungen pro Monat

  const monat = proMonat * praemie;
  const tag = monat / 30;
  const jahr = monat * 12;

  const setZiel = (ziel: number) => {
    setProMonat(praemie > 0 ? Math.max(0, Math.round(ziel / praemie)) : 0);
  };

  const num = (v: string) => {
    const n = parseInt(v.replace(/\D/g, ""), 10);
    return Number.isNaN(n) ? 0 : n;
  };

  const outputs = [
    { label: "Pro Tag", value: tag },
    { label: "Pro Monat", value: monat, accent: true },
    { label: "Pro Jahr", value: jahr },
  ];

  return (
    <div className="bg-white rounded-3xl border border-border shadow-[0_28px_64px_-32px_rgba(26,26,46,0.4)] overflow-hidden">
      <div className="h-1.5 w-full bg-accent" />
      <div className="p-8 sm:p-10 lg:p-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "var(--color-accent-soft)" }}>
            <Calculator className="w-6 h-6 text-accent" strokeWidth={1.75} />
          </div>
          <h3 className="text-primary font-bold text-2xl sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            Dein Verdienst-Rechner
          </h3>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Eingaben */}
          <div className="flex flex-col gap-7">
            <div>
              <label className="block text-primary text-sm font-medium mb-2">
                Prämie pro Vermittlung
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={praemie}
                  onChange={(e) => setPraemie(num(e.target.value))}
                  className="w-full rounded-xl border border-border bg-white pl-4 pr-10 py-3 text-primary text-lg font-semibold focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 transition-colors"
                  aria-label="Prämie pro Vermittlung in Euro"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-semibold">€</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-primary text-sm font-medium">Vermittlungen pro Monat</label>
                <span className="text-accent font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>{proMonat}</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={proMonat}
                onChange={(e) => setProMonat(num(e.target.value))}
                className="w-full accent-[#E8A838] cursor-pointer"
                aria-label="Vermittlungen pro Monat"
              />
              <div className="flex justify-between text-muted text-xs mt-1">
                <span>0</span><span>25</span><span>50</span>
              </div>
            </div>

            <div className="pt-5 border-t border-border">
              <label className="block text-primary text-sm font-medium mb-2">
                Oder: Wie viel willst du im Monat verdienen?
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={monat}
                  onChange={(e) => setZiel(num(e.target.value))}
                  className="w-full rounded-xl border border-border bg-white pl-4 pr-10 py-3 text-primary text-lg font-semibold focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 transition-colors"
                  aria-label="Ziel-Verdienst pro Monat in Euro"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-semibold">€</span>
              </div>
              <p className="text-muted text-xs mt-2">
                Ergibt <span className="text-primary font-semibold">{proMonat} Vermittlungen</span> pro Monat
                {proMonat > 0 && <> — rund <span className="text-primary font-semibold">{fmt(proMonat / 30 * 7)}</span> pro Woche</>}.
              </p>
            </div>
          </div>

          {/* Ausgaben */}
          <div className="flex flex-col gap-4">
            {outputs.map((o) => (
              <div
                key={o.label}
                className={`rounded-2xl px-6 py-5 flex items-center justify-between ${o.accent ? "text-primary" : "text-primary"}`}
                style={{ background: o.accent ? "var(--color-accent-soft)" : "var(--color-surface)" }}
              >
                <span className="text-muted text-sm font-medium uppercase tracking-wider">{o.label}</span>
                <span
                  className={`font-black leading-none ${o.accent ? "text-accent" : "text-primary"}`}
                  style={{ fontFamily: "var(--font-display)", fontSize: o.accent ? "clamp(2.2rem, 6vw, 3.2rem)" : "clamp(1.6rem, 4.5vw, 2.2rem)" }}
                >
                  {fmt(o.value)} €
                </span>
              </div>
            ))}
            <p className="text-muted text-xs mt-1">
              *Beispielrechnung. Die Prämie wird pro erfolgreicher Vermittlung nach
              bestandener Einführungsphase ausgezahlt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
