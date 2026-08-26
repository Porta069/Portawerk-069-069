"use client";

// ─── Kennzahlen ───────────────────────────────────────────────────────────────
// Vier Karten, die aussehen wie das, was sie sind: Knöpfe zu vier Seiten.
//
// Zuvor standen die Zahlen nur durch Haarlinien getrennt auf dem Hintergrund.
// Sachlich richtig, aber nichts daran sagte "hier kannst du klicken" — es sah
// aus wie eine Kopfzeile. Jetzt trägt jede Karte unten die Handlung im
// Klartext ("Angebote ansehen") mit Pfeil, hebt beim Überfahren ab und
// bekommt eine goldene Kante.
//
// Abgerundet wie die übrigen Karten der Anwendung. Die scharfen Kanten waren
// auf dieser einen Seite und nirgends sonst.

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface Kennzahl {
  label: string;
  wert: number;
  href: string;
  /** Text der Handlungszeile — sagt, was der Klick zeigt. */
  aktion: string;
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
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {zahlen.map((z, i) => {
        const wartet = !!z.betont && z.wert > 0;
        return (
          <motion.div
            key={z.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 + i * 0.05 }}
          >
            <Link
              href={z.href}
              className="group flex h-full flex-col justify-between rounded-2xl bg-white p-5 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1"
              style={{
                // Wartet etwas auf eine Reaktion, ist die Kante schon im
                // Ruhezustand golden — die Karte meldet sich von selbst.
                border: `1.5px solid ${wartet ? "rgba(232,168,56,0.55)" : "#E9E7E1"}`,
                boxShadow: wartet
                  ? "0 14px 30px -20px rgba(232,168,56,0.75)"
                  : "0 8px 22px -18px rgba(26,26,46,0.55)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#E8A838";
                e.currentTarget.style.boxShadow = "0 18px 34px -18px rgba(232,168,56,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = wartet ? "rgba(232,168,56,0.55)" : "#E9E7E1";
                e.currentTarget.style.boxShadow = wartet
                  ? "0 14px 30px -20px rgba(232,168,56,0.75)"
                  : "0 8px 22px -18px rgba(26,26,46,0.55)";
              }}
            >
              <div>
                <p
                  className="text-[9.5px] font-semibold uppercase mb-2"
                  style={{ color: "rgba(26,26,46,0.42)", letterSpacing: "0.19em" }}
                >
                  {z.label}
                </p>
                {laedt ? (
                  <span
                    className="block animate-pulse rounded"
                    style={{ width: 40, height: 32, background: "#EDEAE4" }}
                  />
                ) : (
                  <p
                    className="text-[34px] font-bold tabular-nums leading-none"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: wartet ? "#B47B18" : z.wert > 0 ? "#1A1A2E" : "rgba(26,26,46,0.25)",
                    }}
                  >
                    {z.wert}
                  </p>
                )}
              </div>

              {/* Die Handlungszeile ist der eigentliche Klick-Hinweis. */}
              <span
                className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold transition-colors duration-200"
                style={{ color: wartet ? "#B47B18" : "rgba(26,26,46,0.45)" }}
              >
                <span className="group-hover:text-[#B47B18] transition-colors duration-200">
                  {z.aktion}
                </span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#B47B18]" />
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
