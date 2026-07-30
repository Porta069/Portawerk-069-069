"use client";

import { useState } from "react";

const PRAEMIE = 100; // fix, keine Variable
const fmt = (n: number) => Math.round(n).toLocaleString("de-DE");

function Regler({
  label,
  einheit,
  deals,
  setDeals,
  max,
  euro,
  periode,
  extra,
}: {
  label: string;
  einheit: string;
  deals: number;
  setDeals: (n: number) => void;
  max: number;
  euro: number;
  periode: string;
  extra?: string;
}) {
  return (
    <div className="rounded-2xl border border-border p-6 flex flex-col" style={{ background: "var(--color-surface)" }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>

      <div className="flex items-baseline justify-between mt-2 mb-4">
        <span className="text-accent font-black leading-none" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 6vw, 2.6rem)" }}>
          {deals}
        </span>
        <span className="text-muted text-xs text-right">Deals<br />{einheit}</span>
      </div>

      <input
        type="range"
        min={0}
        max={max}
        value={deals}
        onChange={(e) => setDeals(parseInt(e.target.value, 10))}
        className="w-full accent-[#E8A838] cursor-pointer"
        aria-label={`${label} — Anzahl Deals`}
      />

      <div className="mt-5 pt-5 border-t border-border">
        <p className="text-primary font-black leading-none" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 5vw, 2.4rem)" }}>
          {fmt(euro)}&nbsp;€
        </p>
        <p className="text-muted text-sm mt-1">{periode}</p>
        {extra && <p className="text-muted text-xs mt-2">{extra}</p>}
      </div>
    </div>
  );
}

export default function AffiliateRechner() {
  const [dealsTag, setDealsTag] = useState(2);
  const [dealsMonat, setDealsMonat] = useState(20);
  const [dealsJahr, setDealsJahr] = useState(200);

  const euroMonat = dealsMonat * PRAEMIE;
  const euroWoche = euroMonat / 4.345; // Wochen pro Monat

  return (
    <div className="bg-white rounded-3xl border border-border shadow-[0_28px_64px_-32px_rgba(26,26,46,0.4)] overflow-hidden">
      <div className="h-1.5 w-full bg-accent" />
      <div className="p-6 sm:p-8 lg:p-10">
        <p className="text-center text-muted text-sm mb-8">
          Feste Prämie: <span className="text-primary font-semibold">100 € pro erfolgreicher Vermittlung</span>.
          Zieh am Regler und sieh deinen Verdienst.
        </p>
        <div className="grid md:grid-cols-3 gap-5">
          <Regler
            label="Pro Tag"
            einheit="am Tag"
            deals={dealsTag}
            setDeals={setDealsTag}
            max={10}
            euro={dealsTag * PRAEMIE}
            periode="Verdienst pro Tag"
          />
          <Regler
            label="Pro Monat"
            einheit="im Monat"
            deals={dealsMonat}
            setDeals={setDealsMonat}
            max={60}
            euro={euroMonat}
            periode="Verdienst pro Monat"
            extra={`≈ ${fmt(euroWoche)} € pro Woche`}
          />
          <Regler
            label="Pro Jahr"
            einheit="im Jahr"
            deals={dealsJahr}
            setDeals={setDealsJahr}
            max={500}
            euro={dealsJahr * PRAEMIE}
            periode="Verdienst pro Jahr"
          />
        </div>
      </div>
    </div>
  );
}
