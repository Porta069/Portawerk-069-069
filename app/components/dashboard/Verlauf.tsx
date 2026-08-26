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
import { Check } from "lucide-react";

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

// Der Ablauf ist die Umkehrung des üblichen Bewerbens — das muss in jedem
// Schritt stehen, nicht nur in der Überschrift. Vorher hieß es neutral
// "Betriebe sehen dich"; das klang nach einer Jobbörse wie jede andere.
const ABLAUF: Schritt[] = [
  {
    titel: "Dein Profil steht",
    text: "Können, Region und Lohnwunsch sind hinterlegt. Ab hier musst du nichts mehr tun.",
    stand: "erledigt",
  },
  {
    titel: "Du bist im Rennen",
    text: "Dein Profil läuft in der Suche der Betriebe mit — ohne Namen, ohne Foto, ohne Nummer.",
    stand: "erledigt",
  },
  {
    titel: "Der Betrieb macht den ersten Schritt",
    text: "Nicht du bewirbst dich. Passt du zu einer Stelle, meldet er sich bei dir — mit Lohn, Fahrzeit und Bedingungen.",
    stand: "laeuft",
  },
  {
    titel: "Du entscheidest",
    text: "Erst wenn du zusagst, erfährt er deinen Namen und deine Nummer. Vorher nicht.",
    stand: "offen",
  },
];

// Die Liste hat 34 px Innenabstand links, die Schiene liegt auf deren
// Außenkante. Ein Zeichen sitzt also mittig auf der Linie, wenn es um den
// Innenabstand plus seinen halben Durchmesser nach links versetzt wird.
const SCHIENE = 34;
const versatz = (groesse: number) => -(SCHIENE + groesse / 2);

/**
 * Zeichen auf der Schiene.
 *
 * Erledigte Schritte tragen einen Haken in einer gefüllten Scheibe — ein
 * einfacher Punkt sagt nicht, dass etwas abgeschlossen ist, er sagt nur, dass
 * dort ein Eintrag steht. Der laufende Schritt bekommt einen pulsierenden
 * Ring, offene eine hohle Scheibe.
 */
function Zeichen({ stand }: { stand: Schritt["stand"] }) {
  if (stand === "erledigt") {
    return (
      <span
        className="absolute rounded-full flex items-center justify-center"
        style={{ left: versatz(22), top: 1, width: 22, height: 22, background: "#E8A838" }}
      >
        <Check className="w-3.5 h-3.5" strokeWidth={3.4} style={{ color: "#1A1A2E" }} />
      </span>
    );
  }
  if (stand === "laeuft") {
    return (
      <span
        className="absolute rounded-full flex items-center justify-center"
        style={{
          left: versatz(22),
          top: 1,
          width: 22,
          height: 22,
          background: "#FFFFFF",
          border: "2px solid #E8A838",
          boxShadow: "0 0 0 5px rgba(232,168,56,0.16)",
        }}
      >
        <span
          className="pulse-dot rounded-full"
          style={{ width: 8, height: 8, background: "#E8A838" }}
        />
      </span>
    );
  }
  return (
    <span
      className="absolute rounded-full"
      style={{
        left: versatz(22),
        top: 1,
        width: 22,
        height: 22,
        background: "#F8F7F4",
        border: "2px dashed #DBD7CE",
      }}
    />
  );
}

/**
 * Punkt für den Verlauf echter Ereignisse.
 *
 * Bewusst kein Haken wie im Ablauf: ein Haken bedeutet "geschafft", und der
 * Verlauf enthält auch Absagen. Er markiert nur, dass dort etwas steht —
 * ungelesenes in Gold, Gelesenes gedeckt.
 */
function Punkt({ ungelesen }: { ungelesen: boolean }) {
  return (
    <span
      className={ungelesen ? "pulse-dot absolute rounded-full" : "absolute rounded-full"}
      style={{
        left: versatz(ungelesen ? 11 : 9),
        top: ungelesen ? 5 : 6,
        width: ungelesen ? 11 : 9,
        height: ungelesen ? 11 : 9,
        background: ungelesen ? "#E8A838" : "#D9D5CC",
        boxShadow: ungelesen ? "0 0 0 4px rgba(232,168,56,0.18)" : "none",
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
        <div className="pl-[34px]" style={{ borderLeft: "1.5px solid #E4E1DA" }}>
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
        <Kopf titel="Die Betriebe kommen zu dir" />
        <p className="text-[13.5px] leading-relaxed mb-7 -mt-3 max-w-[34rem]" style={{ color: "rgba(26,26,46,0.55)" }}>
          Umgekehrt als sonst: du schreibst keine Bewerbungen und wartest auf keine
          Absagen. Zwei Schritte sind erledigt, den dritten machen die Betriebe.
        </p>
        <ol className="pl-[34px]" style={{ borderLeft: "1.5px solid #E4E1DA" }}>
          {ABLAUF.map((s, i) => (
            <motion.li
              key={s.titel}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.32, delay: 0.05 + i * 0.055 }}
              className="relative"
              style={{ paddingBottom: i === ABLAUF.length - 1 ? 0 : 26 }}
            >
              <Zeichen stand={s.stand} />
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  // Erledigtes bekommt eine goldene Tönung — man sieht auf einen
                  // Blick, was schon steht, statt es aus der Farbe des Punktes
                  // ableiten zu müssen.
                  background:
                    s.stand === "erledigt"
                      ? "rgba(232,168,56,0.09)"
                      : s.stand === "laeuft"
                        ? "#FFFFFF"
                        : "transparent",
                  border:
                    s.stand === "laeuft"
                      ? "1.5px solid rgba(232,168,56,0.4)"
                      : "1.5px solid transparent",
                  boxShadow:
                    s.stand === "laeuft" ? "0 12px 26px -20px rgba(26,26,46,0.6)" : "none",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <p
                    className="text-[14.5px] font-bold leading-snug"
                    style={{ color: s.stand === "offen" ? "rgba(26,26,46,0.45)" : "#1A1A2E" }}
                  >
                    {s.titel}
                  </p>
                  {s.stand === "laeuft" && (
                    <span
                      className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: "#E8A838",
                        color: "#1A1A2E",
                        letterSpacing: "0.14em",
                      }}
                    >
                      läuft
                    </span>
                  )}
                </div>
                <p
                  className="text-[13px] leading-relaxed mt-1 max-w-[30rem]"
                  style={{
                    color: s.stand === "offen" ? "rgba(26,26,46,0.35)" : "rgba(26,26,46,0.6)",
                  }}
                >
                  {s.text}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section>
      <Kopf titel="Verlauf" />
      <ol className="pl-[34px]" style={{ borderLeft: "1.5px solid #E4E1DA" }}>
        {ereignisse.map((e, i) => (
          <motion.li
            key={e.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, delay: 0.05 + i * 0.04 }}
            className="relative"
            style={{ paddingBottom: i === ereignisse.length - 1 ? 0 : 26 }}
          >
            <Punkt ungelesen={e.ungelesen} />
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
