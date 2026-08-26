"use client";

// ─── Kennzahlenzeile ──────────────────────────────────────────────────────────
// Vier Zahlen, durch Haarlinien getrennt — bewusst OHNE Kästen.
//
// Vorher waren das drei weiße Karten mit je einem Symbol in einem getönten
// Quadrat und Texten wie "Nichts Neues" oder "Stellen durchsuchen". Das sind
// Beschreibungen der Navigation, keine Angaben zur eigenen Lage. Hier steht
// jetzt nur, was tatsächlich der Fall ist: wie viele Angebote, Bewerbungen,
// Gespräche, Merkzettel.
//
// Ein Rahmen um eine Zahl macht sie nicht wichtiger, nur enger. Die Trennung
// über 1-px-Linien reicht vollkommen und wirkt wie ein Instrument statt wie
// eine Kachelsammlung.

import Link from "next/link";
import { motion } from "framer-motion";

export interface Kennzahl {
  label: string;
  wert: number;
  href: string;
  /** Hebt den Wert in Gold hervor — für alles, was auf eine Reaktion wartet. */
  betont?: boolean;
}

export default function Kennzahlen({
  zahlen,
  laedt = false,
}: {
  zahlen: Kennzahl[];
  laedt?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.12 }}
      className="grid grid-cols-2 md:grid-cols-4"
      style={{ borderBottom: "1px solid #E4E1DA" }}
    >
      {zahlen.map((z) => (
        <Link
          key={z.label}
          href={z.href}
          // Linien nur ZWISCHEN den Feldern, nie außen herum — sonst entsteht
          // wieder ein Kasten. Die Regeln sorgen dafür, dass das erste Feld
          // jeder Zeile keine linke Kante bekommt, zweispaltig wie vierspaltig.
          className="group px-5 sm:px-7 py-6 transition-colors duration-200 hover:bg-white
                     border-l border-[#E4E1DA] odd:border-l-0 md:odd:border-l md:first:border-l-0
                     [&:nth-child(n+3)]:border-t [&:nth-child(n+3)]:border-[#E4E1DA]
                     md:[&:nth-child(n+3)]:border-t-0"
        >
          <p
            className="text-[9.5px] font-semibold uppercase mb-2.5"
            style={{ color: "rgba(26,26,46,0.42)", letterSpacing: "0.19em" }}
          >
            {z.label}
          </p>
          {laedt ? (
            <span
              className="block animate-pulse"
              style={{ width: 38, height: 30, background: "#E9E7E1" }}
            />
          ) : (
            <p
              className="text-[32px] font-bold tabular-nums leading-none transition-colors duration-200"
              style={{
                fontFamily: "var(--font-display)",
                color: z.betont && z.wert > 0 ? "#B47B18" : z.wert > 0 ? "#1A1A2E" : "rgba(26,26,46,0.22)",
              }}
            >
              {z.wert}
            </p>
          )}
        </Link>
      ))}
    </motion.div>
  );
}
