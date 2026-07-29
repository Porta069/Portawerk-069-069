"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Gewerk-Chips: kurzer, vertrauter Anzeigename → exakter GEWERKE-Wert aus lib/constants.
// Der Klick startet die Registrierung mit vorausgewähltem Gewerk (?gewerk=…).
const TRADE_CHIPS: { label: string; value: string }[] = [
  { label: "Elektrik", value: "Elektriker / Elektroniker" },
  { label: "Heizung / SHK", value: "Installateur / Klempner (SHK)" },
  { label: "Maler", value: "Maler & Lackierer" },
  { label: "Tischler", value: "Tischler / Schreiner" },
  { label: "Maurer / Bau", value: "Maurer / Betonbauer" },
  { label: "Metallbau", value: "Metallbauer / Schlosser" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-primary overflow-hidden flex flex-col">
      {/* ── Echtes Handwerker-Foto (Vollbild) ── */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-werkstatt.jpg"
          alt="Tischler arbeitet konzentriert in seiner Werkstatt"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ transform: "scaleX(-1)", objectPosition: "center" }}
        />
      </div>

      {/* Navy-Scrim für Text-Lesbarkeit — links dicht, rechts lässt es das Foto durch */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(100deg, rgba(20,20,32,0.94) 0%, rgba(20,20,32,0.85) 32%, rgba(20,20,32,0.55) 62%, rgba(20,20,32,0.28) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(20,20,32,0.85) 0%, transparent 100%)",
        }}
      />
      {/* Dezenter Gold-Schimmer als Marken-Akzent */}
      <div
        className="absolute top-0 right-0 w-[45%] h-[60%] pointer-events-none opacity-70"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgba(232,168,56,0.14) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 lg:px-12 pt-28 pb-16">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 mb-8"
          >
            <span className="w-10 h-[2px] bg-accent" />
            <span className="text-accent text-xs font-semibold tracking-[0.22em] uppercase">
              Jobvermittlung fürs Handwerk · Deutschland
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-white font-bold leading-[1.04] mb-7"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.6rem, 7vw, 5.5rem)",
              textShadow: "0 2px 30px rgba(0,0,0,0.35)",
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
            className="text-white/75 text-lg md:text-xl leading-relaxed mb-6"
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
            style={{
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(20,20,32,0.35)",
              backdropFilter: "blur(2px)",
            }}
          >
            <Lock className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={2} />
            <span className="text-white/75 text-sm">
              Dein Name bleibt geheim, bis <span className="text-white">du grünes Licht gibst</span>
              {" "}— dein Chef erfährt nichts
            </span>
          </motion.div>

          {/* ── Micro-Conversion: Gewerk wählen (Foot-in-the-door) ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-white/60 text-sm font-medium mb-3">
              Was machst du? Tipp dein Gewerk an — los geht&apos;s:
            </p>
            <div className="flex flex-wrap gap-2.5 mb-6">
              {TRADE_CHIPS.map((chip) => (
                <Link
                  key={chip.value}
                  href={`/registrieren?gewerk=${encodeURIComponent(chip.value)}`}
                  className="group inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-white/[0.08] hover:bg-accent hover:text-primary transition-colors duration-200"
                  style={{ border: "1px solid rgba(255,255,255,0.18)" }}
                >
                  {chip.label}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                </Link>
              ))}
              <Link
                href="/registrieren?gewerk=Anderes+Gewerk"
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
                style={{ border: "1px dashed rgba(255,255,255,0.25)" }}
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
                <span className="text-white/50 text-xs">
                  Diese Woche haben sich schon <span className="text-white/80 font-medium">127 Handwerker</span> beworben
                </span>
              </div>
            </div>
          </motion.div>
        </div>
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
          <ChevronDown className="w-5 h-5 text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
