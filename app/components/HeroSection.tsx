"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Lock } from "lucide-react";
import Link from "next/link";
import HeroShapes3D from "./HeroShapes3D";

// Gewerk-Chips: kurzer, vertrauter Anzeigename → exakter GEWERKE-Wert aus lib/constants.
// Der Klick startet die Registrierung mit vorausgewähltem Gewerk (?gewerk=…).
const TRADE_CHIPS: { label: string; value: string }[] = [
  { label: "Elektrik", value: "Elektriker / Elektroniker" },
  { label: "Heizung / SHK", value: "Installateur / Klempner (SHK)" },
  { label: "Maler", value: "Maler & Lackierer" },
  { label: "Tischler", value: "Tischler / Schreiner" },
  { label: "Maurer / Bau", value: "Maurer / Betonbauer" },
  { label: "Dachdecker", value: "Dachdecker" },
  { label: "Metallbau", value: "Metallbauer / Schlosser" },
  { label: "Fliesenleger", value: "Fliesenleger" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-primary overflow-hidden flex flex-col">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(232,168,56,0.12) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[500px] h-[350px]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(232,168,56,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
        <div
          className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent"
          style={{ right: "28%" }}
        />
      </div>

      {/* Scroll-driven 3D objects */}
      <HeroShapes3D />

      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 mb-8"
        >
          <span className="w-10 h-[2px] bg-accent" />
          <span className="text-accent text-xs font-medium tracking-[0.22em] uppercase">
            Für Handwerker · in ganz Deutschland
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-white font-bold leading-[1.04] mb-7"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.6rem, 7.5vw, 5.75rem)",
          }}
        >
          Dein nächster Job
          <br />
          im Handwerk.
          <br />
          <span className="text-white/90">Ohne Risiko.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="text-white/65 text-lg md:text-xl max-w-2xl leading-relaxed mb-6"
        >
          Kein Bewerbungsstress, kein Lebenslauf. Du sagst uns nur, was du kannst —
          wir finden den Betrieb, der zu dir passt. Als Dankeschön fürs Durchstarten:{" "}
          <span className="text-accent font-semibold">200&nbsp;€ auf dein Konto</span>.
        </motion.p>

        {/* Diskretion — die größte Angst zuerst nehmen */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2.5 mb-9 w-fit px-4 py-2.5"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Lock className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={2} />
          <span className="text-white/65 text-sm">
            Dein Name bleibt geheim, bis <span className="text-white/90">du grünes Licht gibst</span>
            {" "}— dein Chef erfährt nichts
          </span>
        </motion.div>

        {/* ── Micro-Conversion: Gewerk wählen (Foot-in-the-door) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl"
        >
          <p className="text-white/50 text-sm font-medium mb-3">
            Was machst du? Tipp dein Gewerk an — los geht&apos;s:
          </p>
          <div className="flex flex-wrap gap-2.5 mb-5">
            {TRADE_CHIPS.map((chip) => (
              <Link
                key={chip.value}
                href={`/registrieren?gewerk=${encodeURIComponent(chip.value)}`}
                className="group inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white/85 bg-white/[0.04] hover:bg-accent hover:text-primary transition-colors duration-200"
                style={{ border: "1px solid rgba(255,255,255,0.14)" }}
              >
                {chip.label}
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
              </Link>
            ))}
            <Link
              href="/registrieren?gewerk=Anderes+Gewerk"
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
              style={{ border: "1px dashed rgba(255,255,255,0.2)" }}
            >
              Anderes Gewerk
            </Link>
          </div>

          {/* Haupt-CTA + Social Proof */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <Link
              href="/registrieren"
              className="group inline-flex items-center justify-center gap-3 bg-accent text-primary font-semibold px-8 py-4 text-base hover:bg-amber-400 transition-colors duration-200"
            >
              Kostenlos bewerben — in 3 Minuten
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                style={{ animation: "pulse 2s infinite" }}
              />
              <span className="text-white/40 text-xs">
                Diese Woche haben sich schon <span className="text-white/70 font-medium">127 Handwerker</span> beworben
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stat row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0"
        >
          {[
            { label: "Für dich", value: "Komplett kostenlos" },
            { label: "Dankeschön", value: "200 € nach 8 Wochen", accent: true },
            { label: "Aufwand", value: "Kein Lebenslauf nötig" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`${i > 0 ? "sm:border-l sm:border-white/10 sm:pl-8" : ""}`}
            >
              <p className="text-white/35 text-[10px] uppercase tracking-wider mb-1.5">
                {stat.label}
              </p>
              <p
                className={`text-sm font-medium ${stat.accent ? "text-accent" : "text-white/80"}`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex justify-center pb-10"
      >
        <motion.div
          animate={{ y: [0, 9, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: [0.4, 0, 0.6, 1] }}
        >
          <ChevronDown className="w-5 h-5 text-white/25" />
        </motion.div>
      </motion.div>
    </section>
  );
}
