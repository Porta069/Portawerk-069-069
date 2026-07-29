"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Kurze Vertrauens-Punkte direkt unter dem CTA.
const TRUST = ["100 % kostenlos", "Lebenslauf gratis dazu", "Ohne Bewerbungsstress"];

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen grid lg:grid-cols-2"
      style={{ background: "var(--color-surface)" }}
    >
      {/* ── Linke Spalte: Text + EIN klarer CTA ── */}
      <div className="relative flex items-center order-2 lg:order-1">
        {/* warmer Schimmer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(120% 90% at 0% 0%, rgba(232,168,56,0.10) 0%, transparent 55%)",
          }}
        />
        <div className="relative z-10 w-full max-w-xl mx-auto lg:mx-0 lg:ml-auto px-6 lg:px-14 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 mb-7"
          >
            <span className="w-9 h-[2px] bg-accent" />
            <span className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
              Kostenlose Jobvermittlung fürs Handwerk
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="text-primary font-bold leading-[1.06] mb-6"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 5.2vw, 4rem)",
            }}
          >
            Dein Job im Handwerk
            <br />
            <span className="text-accent">findet dich.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="text-muted text-lg leading-relaxed mb-9 max-w-md"
          >
            Du suchst nicht — <span className="text-primary font-semibold">wir suchen für dich</span>.
            Die Betriebe bewerben sich bei dir, und deinen{" "}
            <span className="text-primary font-semibold">Lebenslauf erstellen wir kostenlos</span>.
            Kein Aufwand, kein Risiko.
          </motion.p>

          {/* Markantes 200-€-Belohnungs-Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-stretch mb-9 shadow-[0_12px_30px_-12px_rgba(232,168,56,0.75)]"
          >
            <div className="flex items-center bg-accent px-5 py-3">
              <span
                className="text-primary font-black leading-none whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 5.5vw, 2.9rem)",
                }}
              >
                200&nbsp;€
              </span>
            </div>
            <div className="flex items-center bg-white border border-l-0 border-accent/40 px-4 py-2.5">
              <span className="text-primary text-sm font-semibold leading-snug">
                Belohnung, wenn du wieder
                <br className="hidden sm:block" /> im Handwerk durchstartest
              </span>
            </div>
          </motion.div>

          {/* DER klare Registrieren-Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href="/registrieren"
              className="group relative overflow-hidden inline-flex items-center justify-center gap-3 bg-accent text-primary font-bold px-9 py-5 text-lg shadow-[0_10px_30px_-8px_rgba(232,168,56,0.6)] hover:bg-amber-400 hover:shadow-[0_14px_36px_-8px_rgba(232,168,56,0.7)] transition-all duration-200"
            >
              <span className="relative z-10 inline-flex items-center gap-3">
                Jetzt kostenlos registrieren
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
              {/* Glanz-Sweep */}
              <span
                aria-hidden="true"
                className="shimmer-glint pointer-events-none absolute top-0 left-0 z-0 h-full w-1/4 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              />
            </Link>
            <p className="text-muted text-sm mt-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" style={{ animation: "pulse 2s infinite" }} />
              Dauert nur 3 Minuten · schon <span className="text-primary font-semibold">127 Handwerker</span> diese Woche
            </p>
          </motion.div>

          {/* Vertrauens-Punkte */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-x-6 gap-y-2 mt-9 pt-7 border-t border-border"
          >
            {TRUST.map((t) => (
              <span key={t} className="inline-flex items-center gap-2 text-primary/80 text-sm font-medium">
                <Check className="w-4 h-4 text-accent" strokeWidth={2.5} />
                {t}
              </span>
            ))}
          </motion.div>

          {/* Diskretion — die größte Angst nehmen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center gap-2.5 mt-5 text-muted text-sm"
          >
            <Lock className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={2} />
            <span>
              Dein Name bleibt geheim, bis <span className="text-primary font-medium">du grünes Licht gibst</span>.
            </span>
          </motion.div>
        </div>
      </div>

      {/* ── Rechte Spalte: freundliches, echtes Foto ── */}
      <div className="relative order-1 lg:order-2 h-64 sm:h-80 lg:h-auto lg:min-h-screen overflow-hidden">
        <Image
          src="/images/hero-team-werkstatt.jpg"
          alt="Zwei Handwerker besprechen sich in einer hellen Werkstatt"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          style={{ objectPosition: "center 32%" }}
        />
        {/* sanfter Übergang zur Textspalte (nur Desktop) */}
        <div
          className="hidden lg:block absolute inset-y-0 left-0 w-24 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, var(--color-surface) 0%, transparent 100%)",
          }}
        />
      </div>
    </section>
  );
}
