"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Kompakte Vertrauens-Zeile unter dem CTA (200 € hervorgehoben).
const TRUST: { label: string; accent?: boolean }[] = [
  { label: "100 % kostenlos" },
  { label: "Lebenslauf gratis" },
  { label: "200 € Belohnung", accent: true },
];

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
            Die <span className="text-primary font-semibold">Betriebe bewerben sich bei dir</span>{" "}
            — kostenlos, ohne Bewerbung.
          </motion.p>

          {/* DER klare Registrieren-Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href="/registrieren"
              className="group relative overflow-hidden inline-flex items-center justify-center gap-3 rounded-full bg-accent text-primary font-bold px-9 py-5 text-lg shadow-[0_10px_30px_-8px_rgba(232,168,56,0.6)] hover:bg-amber-400 hover:shadow-[0_14px_36px_-8px_rgba(232,168,56,0.7)] transition-all duration-200"
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

          {/* Kompakte Vertrauens-Zeile inkl. 200 € */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-8"
          >
            {TRUST.map((t) => (
              <span
                key={t.label}
                className={`inline-flex items-center gap-2 text-sm ${
                  t.accent ? "text-accent font-bold" : "text-primary/80 font-medium"
                }`}
              >
                <Check className="w-4 h-4 text-accent" strokeWidth={2.5} />
                {t.label}
              </span>
            ))}
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
