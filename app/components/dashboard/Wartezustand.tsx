"use client";

// ─── Wartezustand ─────────────────────────────────────────────────────────────
// Leere Karten in der Form der echten Einträge, nach unten hin verblassend.
// Sie heben und senken sich kaum merklich, ein heller Streifen läuft versetzt
// durch — die Seite wartet dadurch sichtbar, statt kaputt zu wirken. Und man
// sieht, WO der erste Eintrag erscheinen wird.
//
// Bewusst kein Symbol in einem getönten Kreis über zwei Zeilen Text: das ist
// die Standardform, an der man jeden generierten Leerzustand erkennt, und sie
// sagt nichts darüber, was hier passieren wird.
//
// Liegt in einer eigenen Datei, weil Angebote und Bewerbungen denselben Block
// brauchen. Zweimal kopiert wären sie beim nächsten Eingriff auseinandergelaufen.

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * Fünf Stufen mit gleichmässigem Abfall (rund 18 Prozentpunkte je Karte).
 *
 * Vorher fiel die Deckkraft von 1 auf 0,55 und dann auf 0,07 — die erste
 * Karte stand da, die übrigen waren praktisch weg, einen Verlauf nahm man
 * nicht wahr. Jetzt bleibt auch die letzte noch sichtbar.
 *
 * Sie werden zugleich flacher, sonst trägt der Stapel zu viel Höhe und
 * schiebt die Anleitung darunter aus dem Bild.
 */
const KARTEN = [
  { hoehe: 100, verzug: "0s", deckung: 1 },
  { hoehe: 90, verzug: "0.7s", deckung: 0.82 },
  { hoehe: 80, verzug: "1.4s", deckung: 0.64 },
  { hoehe: 70, verzug: "2.1s", deckung: 0.46 },
  { hoehe: 60, verzug: "2.8s", deckung: 0.28 },
];

export default function Wartezustand({
  marke,
  titel,
  text,
  icon,
}: {
  /** Kleinschriftzeile über der Überschrift, z. B. "Noch nichts unterwegs". */
  marke: string;
  titel: string;
  text: string;
  /** Zeichen vor der Marke — ein Punkt, ein Symbol, was passt. */
  icon: ReactNode;
}) {
  return (
    <div className="relative mb-8 lg:mb-2">
      <div aria-hidden className="space-y-3">
        {KARTEN.map((k, i) => (
          <div
            key={i}
            className="wartekarte relative overflow-hidden rounded-3xl"
            style={
              {
                height: k.hoehe,
                opacity: k.deckung,
                background: "#FFFFFF",
                // Kontur und Innenzeichnung sind für alle Karten gleich —
                // den Verlauf trägt allein die Deckkraft. Vorher waren die
                // hinteren zusätzlich blasser gezeichnet, dadurch verschwanden
                // sie doppelt und der Übergang war nicht zu sehen.
                border: "1.5px solid #EDE8DB",
                boxShadow: i === 0 ? "0 10px 26px -22px rgba(26,26,46,0.55)" : "none",
                "--verzug": k.verzug,
              } as CSSProperties
            }
          >
            <div className="flex gap-4 p-4">
              <span
                className="rounded-2xl flex-shrink-0"
                style={{ width: 56, height: 56, background: "#F0EBE0" }}
              />
              <span className="flex-1 min-w-0 space-y-2.5 pt-1">
                <span
                  className="block rounded-full"
                  style={{ width: "42%", height: 13, background: "#EBE4D6" }}
                />
                <span
                  className="block rounded-full"
                  style={{ width: "26%", height: 10, background: "#F0EBE0" }}
                />
                <span
                  className="block rounded-full"
                  style={{ width: "58%", height: 10, background: "#F0EBE0" }}
                />
              </span>
            </div>
            <span
              className="warte-glanz absolute inset-y-0 w-1/3 pointer-events-none"
              style={
                {
                  background:
                    "linear-gradient(90deg, transparent, rgba(232,168,56,0.13), transparent)",
                  "--verzug": k.verzug,
                } as CSSProperties
              }
            />
          </div>
        ))}
      </div>

      {/* Die Botschaft liegt über dem Stapel. Der Verlauf setzt oben sehr
          schwach an, damit die erste Karte klar bleibt, und deckt nach unten
          hin vollständig — so verlaufen die hinteren Karten, statt an einer
          Kante abzubrechen. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        style={{
          background:
            "linear-gradient(180deg, rgba(248,247,244,0.05) 0%, rgba(248,247,244,0.42) 24%, rgba(248,247,244,0.8) 46%, rgba(248,247,244,0.95) 70%, #F8F7F4 88%)",
        }}
      >
        <span className="inline-flex items-center gap-2.5 mb-3">
          {icon}
          <span
            className="text-[9.5px] font-semibold uppercase"
            style={{ color: "#B47B18", letterSpacing: "0.2em" }}
          >
            {marke}
          </span>
        </span>
        <p
          className="text-primary font-bold leading-tight"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.25rem, 2.6vw, 1.7rem)" }}
        >
          {titel}
        </p>
        <p className="text-[14px] mt-1.5" style={{ color: "rgba(26,26,46,0.55)" }}>
          {text}
        </p>
      </motion.div>
    </div>
  );
}
