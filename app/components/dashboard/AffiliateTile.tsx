"use client";

// ─── Affiliate-Kachel & Empfehlungs-Anstoß ────────────────────────────────────
// Unser struktureller Unterschied zu reinen Jobbörsen: der Handwerker ist nicht
// nur Ware, sondern kann selbst vermitteln. Der Anstoß steht deshalb nicht auf
// einer eigenen Unterseite, sondern an den emotionalen Hochpunkten — nach einem
// angenommenen Angebot, nach einer Absage, in der Übersicht.

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Share2 } from "lucide-react";

/** Drei Schritte, je drei Wörter. Mehr braucht es nicht. */
const SCHRITTE = ["Link an Kollegen schicken", "Er findet einen Job", "Du bekommst 100 €"];

/**
 * Verdienen-Kachel für die rechte Spalte der Übersicht.
 *
 * Steht hochkant und läuft neben dem Inhalt nach unten mit. Als schmale Kachel
 * unter anderen Kacheln ging das Programm unter, als Querband über die volle
 * Breite zerschnitt es die Seite. Hochkant bekommt es Fläche, ohne den
 * Lesefluss der linken Spalte zu unterbrechen.
 *
 * Die eigenen Zahlen erscheinen erst, wenn es welche GIBT. Vorher standen dort
 * dauerhaft drei Kästen mit "0", "0 €", "0 €" — ausgerechnet an der Stelle, die
 * Lust auf Geld machen soll, dreimal die Null.
 */
export function AffiliateTile({
  geworben = 0,
  offenEuro = 0,
  ausgezahltEuro = 0,
  angebunden = false,
}: {
  geworben?: number;
  offenEuro?: number;
  ausgezahltEuro?: number;
  /**
   * Die Kachel ragt in das Banner darüber hinein und soll mit ihm
   * verschmelzen. Dafür beginnt der Grund oben durchsichtig und wird nach
   * unten hin voll: das Werkstattfoto des Banners läuft in die Kachel hinein,
   * statt an einer Kante abzubrechen. Oben bleibt sie eckig — eine Rundung
   * mitten in der dunklen Fläche würde die Naht erst sichtbar machen.
   */
  angebunden?: boolean;
}) {
  const laeuftBereits = geworben > 0 || offenEuro > 0 || ausgezahltEuro > 0;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl ${
        angebunden ? "verdienen-anbindung lg:rounded-t-none" : ""
      }`}
      style={{ background: "#1A1A2E" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 34px)," +
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 34px)",
        }}
      />
      {/* Der Schein am Fuss der Kachel. Er füllt die zusätzliche Höhe nicht mit
          Luft, sondern mit dem, worum es geht — und läuft nach oben in das
          Navy aus, sodass keine Kante entsteht. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[38%] pointer-events-none">
        <Image
          src="/images/geld-100.jpg"
          alt=""
          fill
          sizes="360px"
          className="object-cover"
          style={{ objectPosition: "center 30%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1A1A2E 0%, rgba(26,26,46,0.98) 30%, rgba(26,26,46,0.92) 62%, rgba(26,26,46,0.82) 100%)",
          }}
        />
      </div>

      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          left: "-25%",
          top: angebunden ? "18%" : "-18%",
          width: 380,
          height: 380,
          background: "radial-gradient(circle, rgba(232,168,56,0.3) 0%, transparent 68%)",
        }}
      />

      <div
        className={`relative flex flex-col px-7 pb-8 ${
          angebunden ? "pt-8 lg:pt-[9.5rem] lg:min-h-[36rem]" : "pt-8"
        }`}
      >
        {/* `flex` statt `inline-flex`: als Inline-Element stellte sich die
            Prämie daneben, sobald die Spalte ein paar Pixel breiter war — auf
            dem Handy stand "VERDIENEN 100 €" in einer Zeile. */}
        <span
          className="flex w-fit items-center gap-2.5 text-[9.5px] font-semibold uppercase mb-6"
          style={{ color: "#E8A838", letterSpacing: "0.22em" }}
        >
          <span className="w-5 h-px" style={{ background: "#E8A838" }} />
          Verdienen
        </span>

        {/* Die Prämie mit Goldlauf — der Blickfang der Spalte. */}
        <div className="relative inline-block">
          <p
            className="gold-schimmer font-bold leading-none relative"
            style={{ fontFamily: "var(--font-display)", fontSize: "4.2rem" }}
          >
            100&nbsp;€
          </p>
        </div>

        <h2
          className="text-white font-bold leading-snug mt-4 mb-2"
          style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}
        >
          pro vermitteltem Kollegen
        </h2>

        {/* Nur wenn es etwas zu berichten gibt. Vorher stand hier sonst
            "Ohne Obergrenze." — ein Versprechen, das die drei Schritte
            darunter ohnehin nicht einschränken. */}
        {laeuftBereits && (
          <p className="text-[13.5px] leading-snug" style={{ color: "rgba(255,255,255,0.5)" }}>
            {geworben} vermittelt —{" "}
            <strong style={{ color: "#E8A838" }}>{offenEuro + ausgezahltEuro} €</strong>, davon{" "}
            {offenEuro} € offen.
          </p>
        )}

        {!laeuftBereits && (
          <ol className="mt-6 space-y-3">
            {SCHRITTE.map((s, i) => (
              <li key={s} className="flex gap-3">
                <span
                  className="flex-shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold tabular-nums"
                  style={{
                    width: 22,
                    height: 22,
                    background: "rgba(232,168,56,0.16)",
                    color: "#E8A838",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-[13px] leading-snug pt-0.5"
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  {s}
                </span>
              </li>
            ))}
          </ol>
        )}

        <Link
          href="/dashboard/verdienen"
          className="group mt-7 lg:mt-auto flex items-center justify-center gap-2 rounded-full w-full px-6 py-4 text-[14.5px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
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
