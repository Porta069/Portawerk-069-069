"use client";

// ─── Affiliate-Kachel & Empfehlungs-Anstoß ────────────────────────────────────
// Unser struktureller Unterschied zu reinen Jobbörsen: der Handwerker ist nicht
// nur Ware, sondern kann selbst vermitteln. Der Anstoß steht deshalb nicht auf
// einer eigenen Unterseite, sondern an den emotionalen Hochpunkten — nach einem
// angenommenen Angebot, nach einer Absage, in der Übersicht.

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Share2 } from "lucide-react";

/**
 * Große Kachel für die Übersicht.
 *
 * Die eigenen Zahlen erscheinen erst, wenn es welche GIBT. Vorher standen dort
 * dauerhaft drei Kästen mit "0", "0 €", "0 €" — ausgerechnet an der Stelle, die
 * Lust auf Geld machen soll, dreimal die Null. Solange nichts geworben wurde,
 * steht dort stattdessen die Prämie selbst.
 *
 * Scharfe Kanten wie im Rest der Plattform; die Rundungen der alten Fassung
 * gab es nur auf dieser einen Seite.
 */
export function AffiliateTile({
  geworben = 0,
  offenEuro = 0,
  ausgezahltEuro = 0,
}: {
  geworben?: number;
  offenEuro?: number;
  ausgezahltEuro?: number;
}) {
  const laeuftBereits = geworben > 0 || offenEuro > 0 || ausgezahltEuro > 0;

  return (
    <div className="relative overflow-hidden p-7" style={{ background: "#1A1A2E" }}>
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 30px)," +
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 30px)",
        }}
      />
      <div
        aria-hidden
        className="absolute -top-24 -right-20 w-64 h-64 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,168,56,0.2) 0%, transparent 70%)" }}
      />

      <div className="relative">
        <span
          className="inline-flex items-center gap-2.5 text-[9.5px] font-semibold uppercase mb-5"
          style={{ color: "#E8A838", letterSpacing: "0.22em" }}
        >
          <span className="w-5 h-px" style={{ background: "#E8A838" }} />
          Verdienen
        </span>

        {laeuftBereits ? (
          <>
            <p
              className="text-white font-bold leading-none tabular-nums"
              style={{ fontFamily: "var(--font-display)", fontSize: "2.6rem" }}
            >
              {offenEuro + ausgezahltEuro}&nbsp;€
            </p>
            <p className="text-[12.5px] mt-2 mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>
              aus {geworben} {geworben === 1 ? "Vermittlung" : "Vermittlungen"} — davon{" "}
              {offenEuro} € offen
            </p>
          </>
        ) : (
          <>
            <p
              className="text-white font-bold leading-none"
              style={{ fontFamily: "var(--font-display)", fontSize: "2.9rem" }}
            >
              100&nbsp;€
            </p>
            <p
              className="text-[15px] font-semibold mt-2 mb-3"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              für jeden Kollegen, den du vermittelst
            </p>
            <p className="text-[13px] leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
              Du kennst jemanden, der wechseln will? Teil deinen Link. Findet er darüber
              einen Job, bekommst du die Prämie — ohne Obergrenze.
            </p>
          </>
        )}

        <Link
          href="/dashboard/verdienen"
          className="group inline-flex items-center gap-2 px-5 py-3 text-[13.5px] font-bold transition-colors duration-200"
          style={{
            background: "#E8A838",
            color: "#1A1A2E",
            fontFamily: "var(--font-display)",
          }}
        >
          {laeuftBereits ? "Zu deinen Vermittlungen" : "Link holen"}
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
        href="/dashboard/verdienen"
        className="group inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold flex-shrink-0 transition-transform duration-200 hover:-translate-y-0.5"
        style={{ background: "#1A1A2E", color: "#FFFFFF", fontFamily: "var(--font-display)" }}
      >
        Link holen
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  );
}
