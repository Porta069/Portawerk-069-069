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
import { Check, Info, Wrench, Hammer, Ruler, Drill, PaintRoller, Cog, HardHat } from "lucide-react";

// Streuung der Hintergrundwerkzeuge. Position, Grösse, Drehung und Deckkraft
// stehen fest verdrahtet statt zufällig — Zufall würde bei jedem Rendern
// springen und wäre serverseitig ohnehin nicht reproduzierbar.
const WERKZEUGE = [
  { Icon: Wrench, x: 3, y: 8, groesse: 120, dreh: -18, deckung: 0.07 },
  { Icon: Hammer, x: 22, y: 52, groesse: 92, dreh: 24, deckung: 0.055 },
  { Icon: Ruler, x: 41, y: -6, groesse: 104, dreh: -8, deckung: 0.06 },
  { Icon: Drill, x: 58, y: 46, groesse: 96, dreh: 14, deckung: 0.05 },
  { Icon: PaintRoller, x: 74, y: 2, groesse: 88, dreh: -22, deckung: 0.06 },
  { Icon: Cog, x: 88, y: 44, groesse: 128, dreh: 10, deckung: 0.055 },
  { Icon: HardHat, x: 12, y: -18, groesse: 84, dreh: 12, deckung: 0.045 },
];

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

// Vier Schritte, je zwei bis vier Wörter. Vorher standen hier ganze Sätze mit
// Nebensätzen — auf einem Bildschirm, den ein Handwerker zwischen zwei
// Baustellen aufmacht. Wer den Ablauf genauer wissen will, findet ihn auf der
// Startseite; hier reicht der Merksatz.
const ABLAUF: Schritt[] = [
  { titel: "Profil fertig", text: "Alles eingetragen", stand: "erledigt" },
  { titel: "Betriebe sehen dich", text: "Anonym, ohne Namen", stand: "erledigt" },
  { titel: "Betrieb meldet sich", text: "Du bekommst Bescheid", stand: "laeuft" },
  { titel: "Du entscheidest", text: "Dann bekommt er deine Nummer", stand: "offen" },
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
  const gemeinsam = "relative z-10 flex-shrink-0 rounded-full flex items-center justify-center";
  const masse = { width: 22, height: 22 };

  if (stand === "erledigt") {
    return (
      <span className={gemeinsam} style={{ ...masse, background: "#E8A838" }}>
        <Check className="w-3.5 h-3.5" strokeWidth={3.4} style={{ color: "#1A1A2E" }} />
      </span>
    );
  }
  if (stand === "laeuft") {
    return (
      <span
        className={gemeinsam}
        style={{
          ...masse,
          background: "#1A1A2E",
          border: "2px solid #E8A838",
          boxShadow: "0 0 0 5px rgba(232,168,56,0.18)",
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
      className={gemeinsam}
      style={{ ...masse, background: "transparent", border: "2px dashed rgba(255,255,255,0.22)" }}
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

  // ── Nichts passiert: der Ablauf als Informationsstreifen ───────────────────
  //
  // Vorher war das eine senkrechte Schiene mit ganzen Sätzen — sie sah aus wie
  // Inhalt, war aber Erklärung, und nahm einen halben Bildschirm ein. Jetzt ein
  // waagerechter Streifen in einem abgesetzten Kasten: vier Schritte, je zwei
  // bis vier Wörter, mit Beschriftung "So läuft's". Man erkennt in einer
  // Sekunde, dass hier erklärt und nicht aufgelistet wird.
  if (ereignisse.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="relative overflow-hidden rounded-2xl px-7 py-7"
        style={{ background: "#1A1A2E" }}
      >
        {/* Werkzeuge im Hintergrund — gross, angeschnitten, leicht gedreht.
            Sie machen aus einer erklärenden Fläche eine Werkstattwand statt
            eines Hinweiskastens. Bewusst nur Kontur bei niedriger Deckkraft:
            als Muster erkennbar, als Einzelwerkzeug nicht aufdringlich. */}
        <span aria-hidden className="absolute inset-0 pointer-events-none">
          {WERKZEUGE.map(({ Icon, x, y, groesse, dreh, deckung }, i) => (
            <Icon
              key={i}
              className="absolute"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: groesse,
                height: groesse,
                transform: `rotate(${dreh}deg)`,
                color: `rgba(232,168,56,${deckung})`,
              }}
              strokeWidth={1}
            />
          ))}
        </span>

        {/* Feines Raster wie in Banner und Verdienen-Kachel — hält die drei
            dunklen Flächen der Seite als eine Familie zusammen. */}
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 34px)," +
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 34px)",
          }}
        />
        <span
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            left: "-8%",
            top: "-60%",
            width: 380,
            height: 380,
            background: "radial-gradient(circle, rgba(232,168,56,0.16) 0%, transparent 68%)",
          }}
        />

        <div className="relative flex items-center gap-2.5 mb-7">
          <Info className="w-4 h-4 flex-shrink-0" style={{ color: "#E8A838" }} />
          <span
            className="text-[9.5px] font-semibold uppercase"
            style={{ color: "#E8A838", letterSpacing: "0.2em" }}
          >
            So läuft&rsquo;s
          </span>
          <span className="h-px flex-1" style={{ background: "rgba(232,168,56,0.28)" }} />
        </div>

        <ol className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ABLAUF.map((s, i) => (
            <li key={s.titel} className="relative flex gap-3 lg:block">
              {/* Verbindungslinie zum nächsten Schritt — macht aus vier Kästen
                  einen Ablauf. Nur ab lg, darunter stehen sie untereinander. */}
              {i < ABLAUF.length - 1 && (
                <span
                  aria-hidden
                  className="hidden lg:block absolute h-px"
                  style={{
                    left: 30,
                    right: -20,
                    top: 11,
                    background:
                      s.stand === "erledigt"
                        ? "rgba(232,168,56,0.55)"
                        : "rgba(255,255,255,0.14)",
                  }}
                />
              )}
              <Zeichen stand={s.stand} />
              <div className="min-w-0 lg:mt-3">
                <p
                  className="text-[13.5px] font-bold leading-snug"
                  style={{ color: s.stand === "offen" ? "rgba(255,255,255,0.42)" : "#FFFFFF" }}
                >
                  {s.titel}
                </p>
                <p
                  className="text-[12.5px] leading-snug mt-0.5"
                  style={{
                    color:
                      s.stand === "offen" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {s.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </motion.section>
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
