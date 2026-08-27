"use client";

// ─── Sortiermenü ──────────────────────────────────────────────────────────────
// Ersetzt ein natives <select>. Dessen Klappliste zeichnet das Betriebssystem —
// graue Systemschrift, eckige Ränder, kein Bezug zum Rest der Anwendung. Man
// kann sie mit CSS nicht gestalten, nur ersetzen.
//
// Diese Fassung übernimmt die Rollen und Tasten des Originals: Escape schliesst,
// Klick nach draussen schliesst, Pfeiltasten wandern durch die Einträge, Enter
// wählt. Ohne das wäre es nur ein hübscher Knopf.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";

export interface SortOption<T extends string> {
  value: T;
  label: string;
}

export default function Sortierung<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: SortOption<T>[];
  onChange: (v: T) => void;
}) {
  const [offen, setOffen] = useState(false);
  const [fokus, setFokus] = useState(0);
  const [platz, setPlatz] = useState<{ top: number; right: number } | null>(null);
  const wurzel = useRef<HTMLDivElement>(null);
  const knopf = useRef<HTMLButtonElement>(null);

  const aktiv = options.find((o) => o.value === value) ?? options[0];

  /**
   * Die Liste hängt am Seitenkörper, nicht im Knopf.
   *
   * Der Knopf steht im Suchband, und das Band braucht `overflow-hidden` für
   * sein Hintergrundfoto. Innerhalb davon wurde die aufgeklappte Liste nach
   * dem ersten Eintrag abgeschnitten. Über ein Portal liegt sie ausserhalb
   * dieses Rahmens; ihre Lage wird aus dem Knopf berechnet und beim Scrollen
   * nachgeführt.
   */
  useEffect(() => {
    if (!offen) return;
    setFokus(Math.max(0, options.findIndex((o) => o.value === value)));

    const messen = () => {
      const b = knopf.current?.getBoundingClientRect();
      if (b) setPlatz({ top: b.bottom + 8, right: window.innerWidth - b.right });
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
        setFokus((f) => (f + 1) % options.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFokus((f) => (f - 1 + options.length) % options.length);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        onChange(options[fokus].value);
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
  }, [offen, options, value, fokus, onChange]);

  return (
    <div ref={wurzel} className="relative">
      <button
        ref={knopf}
        type="button"
        onClick={() => setOffen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={offen}
        className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2.5 rounded-full text-[14px] font-semibold text-white pl-5 pr-4 py-4 transition-colors"
        style={{
          background: offen ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.09)",
          border: "1px solid rgba(255,255,255,0.18)",
        }}
      >
        <ArrowUpDown className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.55)" }} />
        <span className="whitespace-nowrap">{aktiv.label}</span>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
          style={{
            color: "rgba(255,255,255,0.5)",
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
                className="fixed z-[120] min-w-[15rem] overflow-hidden rounded-2xl bg-white p-1.5"
                style={{
                  top: platz.top,
                  right: platz.right,
                  border: "1.5px solid #E9E7E1",
                  boxShadow: "0 26px 54px -22px rgba(26,26,46,0.55)",
                }}
              >
            {options.map((o, i) => {
              const gewaehlt = o.value === value;
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={gewaehlt}
                    onMouseEnter={() => setFokus(i)}
                    onClick={() => {
                      onChange(o.value);
                      setOffen(false);
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[14px] transition-colors"
                    style={{
                      background: i === fokus ? "rgba(232,168,56,0.12)" : "transparent",
                      color: gewaehlt ? "#1A1A2E" : "rgba(26,26,46,0.72)",
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
