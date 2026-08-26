"use client";

// ─── Verlauf ──────────────────────────────────────────────────────────────────
// Eine Schiene mit Punkten statt einer Liste in einem Kasten.
//
// Der leere Zustand ist hier der wichtigste, nicht der Sonderfall: am ersten Tag
// hat jeder Nutzer genau null Ereignisse. Vorher stand dort eine Überschrift
// über 250 px weißem Nichts, mit einem Sparkles-Symbol in der Mitte — der
// Moment, in dem ein neuer Nutzer denkt, die Seite sei kaputt oder leer.
//
// Statt Leere zu dekorieren zeigt die Schiene dann den Ablauf: was schon
// erledigt ist, was gerade läuft, was als Nächstes kommt. Dieselbe Grafik,
// anderer Inhalt — und ganz nebenbei erklärt sie das Kernversprechen, dass der
// Betrieb die Kontaktdaten erst nach Freigabe bekommt.

import Link from "next/link";
import { motion } from "framer-motion";

export interface Ereignis {
  id: string;
  titel: string;
  zeit: string;
  ungelesen: boolean;
  href: string;
}

/** Ein Schritt im Ablauf — für die Schiene, solange nichts passiert ist. */
interface Schritt {
  titel: string;
  text: string;
  stand: "erledigt" | "laeuft" | "offen";
}

const ABLAUF: Schritt[] = [
  {
    titel: "Profil freigeschaltet",
    text: "Deine Angaben sind geprüft und in der Suche der Betriebe.",
    stand: "erledigt",
  },
  {
    titel: "Betriebe sehen dich",
    text: "Ohne Namen, ohne Foto, ohne Kontaktdaten — nur dein Können, deine Region.",
    stand: "laeuft",
  },
  {
    titel: "Ein Betrieb meldet sich",
    text: "Passt du, kommt ein Angebot oder eine Anfrage nach deinen Kontaktdaten.",
    stand: "offen",
  },
  {
    titel: "Du entscheidest",
    text: "Erst wenn du freigibst, erfährt der Betrieb, wer du bist.",
    stand: "offen",
  },
];

// Die Liste hat 24 px Innenabstand links, die Schiene liegt auf deren
// Außenkante. Ein Punkt sitzt also mittig auf der Linie, wenn er um den
// Innenabstand plus seinen halben Durchmesser nach links versetzt wird.
const SCHIENE = 24;
const versatz = (groesse: number) => -(SCHIENE + groesse / 2);

/** Punkt auf der Schiene. Gefüllt = erledigt, pulsierend = läuft, hohl = offen. */
function Punkt({ stand }: { stand: Schritt["stand"] }) {
  if (stand === "laeuft") {
    return (
      <span
        className="pulse-dot absolute rounded-full"
        style={{
          left: versatz(11),
          top: 5,
          width: 11,
          height: 11,
          background: "#E8A838",
          boxShadow: "0 0 0 4px rgba(232,168,56,0.18)",
        }}
      />
    );
  }
  return (
    <span
      className="absolute rounded-full"
      style={{
        left: versatz(9),
        top: 6,
        width: 9,
        height: 9,
        background: stand === "erledigt" ? "#E8A838" : "#F8F7F4",
        border: stand === "erledigt" ? "none" : "1.5px solid #D9D5CC",
      }}
    />
  );
}

/**
 * Überschrift mit anschließender Haarlinie.
 *
 * Die Linie läuft bis zum Spaltenende und bindet die Schiene darunter optisch
 * an — sonst steht die Überschrift frei über einer Liste ohne erkennbaren
 * Zusammenhang.
 */
function Kopf({ titel }: { titel: string }) {
  return (
    <div className="flex items-center gap-4 mb-7">
      <h2
        className="text-primary font-bold text-[18px] flex-shrink-0"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {titel}
      </h2>
      <span className="h-px flex-1" style={{ background: "#E4E1DA" }} />
    </div>
  );
}

export default function Verlauf({
  ereignisse,
  laedt = false,
}: {
  ereignisse: Ereignis[];
  laedt?: boolean;
}) {
  if (laedt) {
    return (
      <section>
        <Kopf titel="Verlauf" />
        <div className="pl-6" style={{ borderLeft: "1px solid #E4E1DA" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="pb-8 animate-pulse">
              <div style={{ width: 72, height: 10, background: "#EDEAE4", marginBottom: 10 }} />
              <div style={{ width: `${70 - i * 12}%`, height: 14, background: "#E9E7E1" }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Nichts passiert: die Schiene zeigt den Ablauf statt einer leeren Fläche ──
  if (ereignisse.length === 0) {
    return (
      <section>
        <Kopf titel="So läuft es" />
        <ol className="pl-6" style={{ borderLeft: "1px solid #E4E1DA" }}>
          {ABLAUF.map((s, i) => (
            <motion.li
              key={s.titel}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.32, delay: 0.05 + i * 0.055 }}
              className="relative"
              style={{ paddingBottom: i === ABLAUF.length - 1 ? 0 : 30 }}
            >
              <Punkt stand={s.stand} />
              <p
                className="text-[14.5px] font-semibold leading-snug"
                style={{ color: s.stand === "offen" ? "rgba(26,26,46,0.42)" : "#1A1A2E" }}
              >
                {s.titel}
              </p>
              <p
                className="text-[13px] leading-relaxed mt-1 max-w-[30rem]"
                style={{ color: s.stand === "offen" ? "rgba(26,26,46,0.32)" : "rgba(26,26,46,0.55)" }}
              >
                {s.text}
              </p>
            </motion.li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section>
      <Kopf titel="Verlauf" />
      <ol className="pl-6" style={{ borderLeft: "1px solid #E4E1DA" }}>
        {ereignisse.map((e, i) => (
          <motion.li
            key={e.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, delay: 0.05 + i * 0.04 }}
            className="relative"
            style={{ paddingBottom: i === ereignisse.length - 1 ? 0 : 26 }}
          >
            <Punkt stand={e.ungelesen ? "laeuft" : "erledigt"} />
            <Link href={e.href} className="group block">
              <span
                className="block text-[9.5px] font-semibold uppercase tabular-nums mb-1.5"
                style={{ color: "rgba(26,26,46,0.38)", letterSpacing: "0.17em" }}
              >
                {e.zeit}
              </span>
              <span
                className="block text-[14.5px] leading-snug transition-colors duration-200 group-hover:text-[#B47B18]"
                style={{
                  color: "#1A1A2E",
                  fontWeight: e.ungelesen ? 700 : 500,
                }}
              >
                {e.titel}
              </span>
            </Link>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
