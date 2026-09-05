"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const punkte = [
  "Über uns einen Job finden",
  "8 Wochen dranbleiben (Einführungsphase)",
  "200 € direkt aufs Konto — kein Gutschein",
];

export default function BonusSection() {
  return (
    <section className="py-28 max-lg:py-16 overflow-hidden" style={{ background: "var(--color-accent-soft)" }} id="praemie">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Links — große Zahl */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-8">
              <span className="w-8 h-[2px] bg-accent" />
              Deine Belohnung
            </span>

            <div className="relative select-none mb-6 -ml-1 lg:-ml-3">
              <span
                className="absolute font-black text-primary/[0.06] leading-none"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(6.5rem, 17vw, 12rem)", top: "6px", left: "6px" }}
              >
                200€
              </span>
              <span
                className="relative font-black text-accent leading-none"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(6.5rem, 17vw, 12rem)" }}
              >
                200€
              </span>
            </div>

            <p className="text-primary/60 text-xl leading-relaxed max-w-sm">
              Nach <span className="text-primary font-semibold">8 Wochen</span> im neuen Job —
              direkt aufs Konto.
            </p>
          </motion.div>

          {/* Rechts — nur die Kernfakten */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-8"
          >
            <h2
              className="text-primary font-bold text-4xl md:text-5xl leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              So kommst du an
              <br />
              deine 200 €
            </h2>

            <ul className="flex flex-col gap-4">
              {punkte.map((p) => (
                <li key={p} className="flex items-center gap-3.5 text-primary text-lg md:text-xl">
                  <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>

            <Link
              href="/registrieren"
              className="group relative overflow-hidden self-start inline-flex items-center gap-3 rounded-full bg-primary text-white font-semibold px-8 py-4 transition-shadow duration-300 hover:shadow-[0_14px_34px_-12px_rgba(232,168,56,0.7)]"
            >
              <span className="relative z-10 inline-flex items-center gap-3 transition-colors duration-300 group-hover:text-primary">
                Jetzt kostenlos starten
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 z-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
