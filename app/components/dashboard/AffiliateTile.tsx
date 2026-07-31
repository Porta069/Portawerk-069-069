"use client";

// ─── Affiliate-Kachel & Empfehlungs-Anstoß ────────────────────────────────────
// Unser struktureller Unterschied zu reinen Jobbörsen: der Handwerker ist nicht
// nur Ware, sondern kann selbst vermitteln. Der Anstoß steht deshalb nicht auf
// einer eigenen Unterseite, sondern an den emotionalen Hochpunkten — nach einem
// angenommenen Angebot, nach einer Absage, in der Übersicht.

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Euro, Share2, Users } from "lucide-react";

/** Große Kachel für die Übersicht — mit den eigenen Zahlen. */
export function AffiliateTile({
  geworben = 0,
  offenEuro = 0,
  ausgezahltEuro = 0,
}: {
  geworben?: number;
  offenEuro?: number;
  ausgezahltEuro?: number;
}) {
  const stats = [
    { label: "Geworben", value: String(geworben), icon: Users },
    { label: "Offen", value: `${offenEuro} €`, icon: Euro },
    { label: "Ausgezahlt", value: `${ausgezahltEuro} €`, icon: Euro },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl p-6" style={{ background: "#1A1A2E" }}>
      <div
        className="absolute -top-20 -right-16 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,168,56,0.22) 0%, transparent 70%)" }}
      />
      <div className="relative">
        <span
          className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] mb-3"
          style={{ color: "#E8A838" }}
        >
          <span className="w-6 h-[2px] bg-accent" />
          Verdienen
        </span>
        <h2
          className="text-white font-bold text-[22px] leading-snug mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          100 € pro vermitteltem Kollegen
        </h2>
        <p className="text-[13.5px] leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
          Du kennst jemanden, der wechseln will? Teil deinen persönlichen Link — sobald
          er über dich einen Job findet, bekommst du die Prämie.{" "}
          <span style={{ color: "rgba(255,255,255,0.38)" }}>
            Das Partnerprogramm hat einen eigenen Login.
          </span>
        </p>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <p
                className="text-[16px] font-bold tabular-nums text-white leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.value}
              </p>
              <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.42)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <Link
          href="/verdienen"
          className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
          style={{
            background: "#E8A838",
            color: "#1A1A2E",
            fontFamily: "var(--font-display)",
            boxShadow: "0 14px 28px -14px rgba(232,168,56,0.9)",
          }}
        >
          Zum Empfehlungsprogramm
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Schmaler Anstoß für Momente hoher Zufriedenheit oder nach einer Absage.
 * `tone="win"` nach einer Zusage, `tone="consolation"` nach einer Absage.
 */
export function AffiliateNudge({
  tone = "win",
  className = "",
}: {
  tone?: "win" | "consolation";
  className?: string;
}) {
  const copy =
    tone === "win"
      ? {
          title: "Läuft. Kennst du jemanden, der auch wechseln will?",
          body: "Empfiehl einen Kollegen — für jede erfolgreiche Vermittlung bekommst du 100 €.",
        }
      : {
          title: "Nichts für dich — aber vielleicht für einen Kollegen?",
          body: "Leite die Stelle über deinen Link weiter. Findet er darüber einen Job, bekommst du 100 €.",
        };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl px-5 py-4 ${className}`}
      style={{ background: "rgba(232,168,56,0.1)", border: "1px solid rgba(232,168,56,0.3)" }}
    >
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(232,168,56,0.25)" }}
      >
        <Share2 className="w-[18px] h-[18px]" style={{ color: "#B47B18" }} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-primary leading-snug">{copy.title}</p>
        <p className="text-[12.5px] mt-0.5" style={{ color: "rgba(26,26,46,0.6)" }}>
          {copy.body}
        </p>
      </div>
      <Link
        href="/verdienen"
        className="group inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold flex-shrink-0 transition-transform duration-200 hover:-translate-y-0.5"
        style={{ background: "#1A1A2E", color: "#FFFFFF", fontFamily: "var(--font-display)" }}
      >
        Link holen
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  );
}
