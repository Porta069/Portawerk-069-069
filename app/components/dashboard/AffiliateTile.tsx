"use client";

// ─── Affiliate-Kachel & Empfehlungs-Anstoß ────────────────────────────────────
// Unser struktureller Unterschied zu reinen Jobbörsen: der Handwerker ist nicht
// nur Ware, sondern kann selbst vermitteln. Der Anstoß steht deshalb nicht auf
// einer eigenen Unterseite, sondern an den emotionalen Hochpunkten — nach einem
// angenommenen Angebot, nach einer Absage, in der Übersicht.

import Link from "next/link";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { ArrowRight, Share2 } from "lucide-react";

/**
 * Funken um die Prämie.
 *
 * Sechs Punkte, die in unterschiedliche Richtungen wegspringen. Richtung und
 * Verzögerung stehen als CSS-Variablen am Element, damit eine einzige Regel in
 * globals.css für alle reicht und sie trotzdem nicht im Gleichschritt fliegen.
 * Rein schmückend, deshalb aria-hidden — und bei reduzierter Bewegung aus.
 */
const FUNKEN = [
  { x: 8, y: 30, fx: "-30px", fy: "-26px", verzug: "0s", groesse: 5 },
  { x: 30, y: 12, fx: "14px", fy: "-34px", verzug: "0.3s", groesse: 4 },
  { x: 52, y: 70, fx: "-10px", fy: "32px", verzug: "0.6s", groesse: 5 },
  { x: 76, y: 22, fx: "30px", fy: "-24px", verzug: "0.9s", groesse: 4 },
  { x: 94, y: 52, fx: "36px", fy: "10px", verzug: "1.2s", groesse: 5 },
  { x: 18, y: 78, fx: "-24px", fy: "28px", verzug: "1.5s", groesse: 4 },
  { x: 64, y: 8, fx: "8px", fy: "-30px", verzug: "1.8s", groesse: 4 },
  { x: 44, y: 88, fx: "18px", fy: "26px", verzug: "2.1s", groesse: 5 },
];

function Funken() {
  return (
    <span aria-hidden className="absolute -inset-6 pointer-events-none">
      {FUNKEN.map((f, i) => (
        <span
          key={i}
          className="funke absolute rounded-full"
          style={
            {
              left: `${f.x}%`,
              top: `${f.y}%`,
              width: f.groesse,
              height: f.groesse,
              background: "#FFF6E0",
              boxShadow: "0 0 8px 2px rgba(232,168,56,0.95)",
              "--fx": f.fx,
              "--fy": f.fy,
              "--verzug": f.verzug,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

/**
 * Verdienen-Band für die Übersicht.
 *
 * Lag vorher als schmale Kachel in der rechten Spalte und ging dort unter.
 * Jetzt über die volle Breite, mit der Prämie als größtem Element der Seite —
 * das Empfehlungsprogramm ist der strukturelle Unterschied zu einer reinen
 * Jobbörse und darf nicht wie eine Randnotiz aussehen.
 *
 * Die eigenen Zahlen erscheinen erst, wenn es welche GIBT. Vorher standen dort
 * dauerhaft drei Kästen mit "0", "0 €", "0 €" — ausgerechnet an der Stelle, die
 * Lust auf Geld machen soll, dreimal die Null.
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
    <div className="relative overflow-hidden rounded-3xl" style={{ background: "#1A1A2E" }}>
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 34px)," +
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 34px)",
        }}
      />
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          left: "6%",
          top: "-40%",
          width: 420,
          height: 420,
          background: "radial-gradient(circle, rgba(232,168,56,0.26) 0%, transparent 68%)",
        }}
      />

      <div className="relative flex flex-col md:flex-row md:items-center gap-7 md:gap-10 px-7 sm:px-10 py-9">
        {/* Die Prämie — größtes Element der Seite, mit Goldlauf und Funken. */}
        <div className="relative flex-shrink-0">
          <Funken />
          <p
            className="gold-schimmer font-bold leading-none relative"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3.4rem, 8vw, 5rem)",
            }}
          >
            100&nbsp;€
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <span
            className="inline-flex items-center gap-2.5 text-[9.5px] font-semibold uppercase mb-3"
            style={{ color: "#E8A838", letterSpacing: "0.22em" }}
          >
            <span className="w-5 h-px" style={{ background: "#E8A838" }} />
            Verdienen
          </span>
          <h2
            className="text-white font-bold leading-snug mb-2"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.25rem, 2.4vw, 1.7rem)" }}
          >
            für jeden Kollegen, der über dich einen Job findet
          </h2>
          <p className="text-[13.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            {laeuftBereits ? (
              <>
                Du hast bereits {geworben} {geworben === 1 ? "Kollegen" : "Kollegen"} vermittelt —{" "}
                <strong style={{ color: "#E8A838" }}>{offenEuro + ausgezahltEuro} €</strong>{" "}
                zusammen, davon {offenEuro} € noch offen.
              </>
            ) : (
              <>Einmal deinen Link teilen. Keine Obergrenze, keine Frist, kein Aufwand.</>
            )}
          </p>
        </div>

        <Link
          href="/dashboard/verdienen"
          className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-[14.5px] font-bold flex-shrink-0 transition-transform duration-200 hover:-translate-y-0.5"
          style={{
            background: "#E8A838",
            color: "#1A1A2E",
            fontFamily: "var(--font-display)",
            boxShadow: "0 18px 36px -16px rgba(232,168,56,0.85)",
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
