"use client";

// ─── Auswahlfeld ──────────────────────────────────────────────────────────────
// Ersatz für ein natives <select> in Formularen. Dasselbe Problem wie beim
// Sortiermenü: die Klappliste zeichnet das Betriebssystem — graue Systemschrift,
// eckige Ränder, kein Bezug zum Rest. Mit CSS nicht zu gestalten, nur zu
// ersetzen.
//
// Unterschied zu `Sortierung`: das hier ist ein Eingabefeld. Es füllt die
// Breite seines Platzes, trägt bei leerer Wahl einen Platzhalter in blasser
// Schrift und erlaubt ausdrücklich "nichts gewählt" (null).
//
// Tastatur wie beim Original: Escape schliesst, Pfeile wandern, Enter wählt.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

export interface AuswahlOption {
  value: string;
  label: string;
}

export default function Auswahl({
  wert,
  optionen,
  leerLabel,
  onChange,
  /** Feld füllt die Breite des Elternteils statt sich am Inhalt zu messen. */
  breit = false,
}: {
  wert: string | null;
  optionen: AuswahlOption[];
  /** Beschriftung für "nichts gewählt" — zugleich der erste Eintrag der Liste. */
  leerLabel: string;
  onChange: (v: string | null) => void;
  breit?: boolean;
}) {
  const [offen, setOffen] = useState(false);
  const [fokus, setFokus] = useState(0);
  const [platz, setPlatz] = useState<{ top: number; left: number; width: number; hoehe: number } | null>(null);
  const wurzel = useRef<HTMLDivElement>(null);
  const knopf = useRef<HTMLButtonElement>(null);

  // Die leere Wahl ist ein vollwertiger Eintrag: "Egal" ist eine Entscheidung
  // und muss anwählbar sein, wenn man sie versehentlich weggeklickt hat.
  const eintraege: AuswahlOption[] = [{ value: "", label: leerLabel }, ...optionen];
  const aktiv = optionen.find((o) => o.value === wert) ?? null;

  useEffect(() => {
    if (!offen) return;
    setFokus(Math.max(0, eintraege.findIndex((o) => o.value === (wert ?? ""))));

    // Die Liste hängt am Seitenkörper, sonst schneidet sie jeder Abschnitt
    // mit `overflow-hidden` ab. Lage aus dem Knopf gemessen und beim Scrollen
    // nachgeführt.
    const messen = () => {
      const b = knopf.current?.getBoundingClientRect();
      if (!b) return;
      // Nach unten aufklappen, solange darunter genug Platz ist — sonst nach
      // oben. Die Liste bekommt zusätzlich die tatsächlich freie Höhe als
      // Grenze mit: mit einer festen Höhe stand sie sonst halb ausserhalb des
      // Fensters und die letzten Einträge waren nicht erreichbar.
      const gewuenscht = Math.min(eintraege.length * 42 + 12, 320);
      const frei = { unten: window.innerHeight - b.bottom - 16, oben: b.top - 16 };
      const nachOben = frei.unten < Math.min(gewuenscht, 200) && frei.oben > frei.unten;
      const hoehe = Math.min(gewuenscht, Math.max(nachOben ? frei.oben : frei.unten, 140));
      setPlatz({
        top: nachOben ? b.top - hoehe - 8 : b.bottom + 8,
        left: b.left,
        width: b.width,
        hoehe,
      });
    };
    messen();
    window.addEventListener("scroll", messen, true);
    window.addEventListener("resize", messen);

    const draussen = (e: MouseEvent) => {
      if (wurzel.current && !wurzel.current.contains(e.target as Node)) setOffen(false);
    };
    const taste = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOffen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFokus((f) => (f + 1) % eintraege.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFokus((f) => (f - 1 + eintraege.length) % eintraege.length);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        onChange(eintraege[fokus].value || null);
        setOffen(false);
      }
    };
    document.addEventListener("mousedown", draussen);
    document.addEventListener("keydown", taste);
    return () => {
      window.removeEventListener("scroll", messen, true);
      window.removeEventListener("resize", messen);
      document.removeEventListener("mousedown", draussen);
      document.removeEventListener("keydown", taste);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offen, optionen, wert, fokus]);

  return (
    <div ref={wurzel} className={`relative ${breit ? "w-full" : "inline-block min-w-[200px]"}`}>
      <button
        ref={knopf}
        type="button"
        onClick={() => setOffen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={offen}
        className="wp-feld w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-[14.5px]"
        style={{
          background: "#FFFFFF",
          border: `1.5px solid ${offen ? "#E8A838" : "#E9E7E1"}`,
          boxShadow: offen ? "0 0 0 4px rgba(232,168,56,0.14)" : "none",
          color: aktiv ? "#1A1A2E" : "rgba(26,26,46,0.4)",
          fontWeight: aktiv ? 600 : 400,
        }}
      >
        <span className="truncate">{aktiv?.label ?? leerLabel}</span>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
          style={{
            color: "rgba(26,26,46,0.35)",
            transform: offen ? "rotate(180deg)" : "none",
          }}
        />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {offen && platz && (
              <motion.ul
                role="listbox"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="fixed z-[120] overflow-y-auto rounded-2xl bg-white p-1.5"
                style={{
                  top: platz.top,
                  left: platz.left,
                  minWidth: platz.width,
                  maxHeight: platz.hoehe,
                  border: "1.5px solid #E9E7E1",
                  boxShadow: "0 26px 54px -22px rgba(26,26,46,0.55)",
                }}
              >
                {eintraege.map((o, i) => {
                  const gewaehlt = o.value === (wert ?? "");
                  return (
                    <li key={o.value || "__leer"}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={gewaehlt}
                        onMouseEnter={() => setFokus(i)}
                        onClick={() => {
                          onChange(o.value || null);
                          setOffen(false);
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[14px] transition-colors"
                        style={{
                          background: i === fokus ? "rgba(232,168,56,0.12)" : "transparent",
                          color: o.value
                            ? gewaehlt
                              ? "#1A1A2E"
                              : "rgba(26,26,46,0.72)"
                            : "rgba(26,26,46,0.45)",
                          fontWeight: gewaehlt ? 700 : 500,
                        }}
                      >
                        <Check
                          className="w-4 h-4 flex-shrink-0"
                          strokeWidth={3}
                          style={{ color: "#E8A838", opacity: gewaehlt ? 1 : 0 }}
                        />
                        {o.label}
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
