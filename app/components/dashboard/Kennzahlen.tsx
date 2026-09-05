"use client";

// ─── Kennzahlen ───────────────────────────────────────────────────────────────
// Vier Karten, die aussehen wie das, was sie sind: Knöpfe zu vier Seiten.
//
// Zuvor waren sie reinweiß mit grauer Kontur — kühl und austauschbar, obwohl es
// der wichtigste Bereich der Seite ist. Jetzt trägt jede Karte:
//
//   · einen warmen Verlauf ins Sandfarbene statt Weiß
//   · eine goldene Oberkante, die beim Überfahren durchläuft
//   · ein grosses, blasses Werkzeug als Wasserzeichen
//
// Bewusst KEIN Symbol in einem getönten Quadrat neben der Zahl: das ist die
// Standardform jedes generierten Dashboards. Das Wasserzeichen liegt hinter dem
// Inhalt, angeschnitten am Rand, und gibt der Fläche Charakter, ohne sich
// vorzudrängen.

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Kennzahl {
  label: string;
  wert: number;
  href: string;
  /** Text der Handlungszeile — sagt, was der Klick zeigt. */
  aktion: string;
  /** Wasserzeichen im Hintergrund der Karte. */
  icon: LucideIcon;
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
        const Werkzeug = z.icon;
        return (
          <motion.div
            key={z.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 + i * 0.05 }}
          >
            <Link
              href={z.href}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-6 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1"
              style={{
                background: wartet
                  ? "linear-gradient(158deg, #FFFDF8 0%, #FCF1DB 100%)"
                  : "linear-gradient(158deg, #FFFFFF 0%, #FCFAF4 56%, #F6F0E2 100%)",
                border: `1.5px solid ${wartet ? "rgba(232,168,56,0.55)" : "#EDE8DC"}`,
                boxShadow: wartet
                  ? "0 14px 30px -20px rgba(232,168,56,0.8)"
                  : "0 10px 26px -20px rgba(26,26,46,0.6)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#E8A838";
                e.currentTarget.style.boxShadow = "0 20px 36px -18px rgba(232,168,56,0.65)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = wartet ? "rgba(232,168,56,0.55)" : "#EDE8DC";
                e.currentTarget.style.boxShadow = wartet
                  ? "0 14px 30px -20px rgba(232,168,56,0.8)"
                  : "0 10px 26px -20px rgba(26,26,46,0.6)";
              }}
            >
              {/* Goldkante oben: im Ruhezustand ein Stück, beim Überfahren läuft
                  sie durch. Kleines Detail, das die Karte lebendig macht, ohne
                  sie im Ruhezustand zu überladen. */}
              <span
                aria-hidden
                className="absolute top-0 left-0 h-[3px] transition-[width] duration-300 ease-out group-hover:!w-full"
                style={{
                  width: wartet ? "100%" : "36%",
                  background: "linear-gradient(90deg, #E8A838 0%, rgba(232,168,56,0.15) 100%)",
                }}
              />

              {/* Werkzeug-Wasserzeichen, am Rand angeschnitten. */}
              <Werkzeug
                aria-hidden
                className="absolute pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                style={{
                  right: -16,
                  bottom: -12,
                  width: 92,
                  height: 92,
                  color: wartet ? "rgba(180,123,24,0.2)" : "rgba(26,26,46,0.07)",
                }}
                strokeWidth={1.1}
              />

              <div className="relative">
                <p
                  className="text-[9.5px] max-lg:text-[11px] font-semibold uppercase mb-2"
                  style={{ color: "rgba(26,26,46,0.45)", letterSpacing: "0.19em" }}
                >
                  {z.label}
                </p>
                {laedt ? (
                  <span
                    className="block animate-pulse rounded"
                    style={{ width: 40, height: 36, background: "#EDEAE4" }}
                  />
                ) : (
                  <p
                    className="text-[40px] font-bold tabular-nums leading-none"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: wartet ? "#B47B18" : z.wert > 0 ? "#1A1A2E" : "rgba(26,26,46,0.3)",
                    }}
                  >
                    {z.wert}
                  </p>
                )}
              </div>

              {/* Die Handlungszeile ist der eigentliche Klick-Hinweis. */}
              <span
                className="relative mt-7 inline-flex items-center gap-1.5 text-[12px] font-semibold transition-colors duration-200"
                style={{ color: wartet ? "#B47B18" : "rgba(26,26,46,0.5)" }}
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
