"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Lock } from "lucide-react";
import Link from "next/link";
import HeroShapes3D from "./HeroShapes3D";

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
          className="flex items-center gap-3 mb-10"
        >
          <span className="w-10 h-[2px] bg-accent" />
          <span className="text-accent text-xs font-medium tracking-[0.22em] uppercase">
            Handwerk & Bau · Deutschland
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-white font-bold leading-[1.04] mb-8"
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
          className="text-white/60 text-lg md:text-xl max-w-2xl leading-relaxed mb-6"
        >
          Für alle Gewerke — Elektrik, SHK, Maler, Tischler, Bau und mehr —
          kein Bewerbungsaufwand, kein öffentliches Profil.
          Als Dankeschön für deinen Neustart:{" "}
          <span className="text-accent font-medium">200€ direkt auf dein Konto</span>.
        </motion.p>

        {/* Konkreter Diskretion-Mechanismus */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2.5 mb-8 w-fit px-4 py-2.5"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Lock className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={2} />
          <span className="text-white/60 text-sm">
            Dein Name erscheint bei Arbeitgebern erst wenn{" "}
            <span className="text-white/90">du per Klick zustimmst</span> — für jeden Betrieb separat
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-4 items-start"
        >
          <div className="flex flex-col gap-2.5">
            <Link
              href="/registrieren"
              className="group inline-flex items-center gap-3 bg-accent text-primary font-semibold px-8 py-4 text-base hover:bg-amber-400 transition-colors duration-200"
            >
              Jetzt bewerben
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            {/* Social Proof */}
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                style={{ animation: "pulse 2s infinite" }}
              />
              <span className="text-white/35 text-xs">
                127 Fachkräfte haben sich diese Woche beworben
              </span>
            </div>
          </div>
          <a
            href="#betriebe"
            className="inline-flex items-center gap-2 border border-white/20 text-white/75 px-8 py-4 text-base hover:border-white/50 hover:text-white transition-all duration-200"
          >
            Für Betriebe
          </a>
        </motion.div>

        {/* Stat row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0"
        >
          {[
            {
              label: "Alle Gewerke",
              value: "Elektrik · SHK · Maler · Tischler & mehr",
            },
            { label: "Prämie", value: "200€ nach 8 Wochen", accent: true },
            { label: "Kosten für Bewerber", value: "Komplett kostenlos" },
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
