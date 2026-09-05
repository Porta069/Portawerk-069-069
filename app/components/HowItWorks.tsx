"use client";

import { motion } from "framer-motion";
import { UserRound, Search, BadgeCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: "1",
    icon: UserRound,
    title: "Profil erstellen",
    description: "In 3 Minuten fertig. Kein Lebenslauf, kein Anschreiben.",
  },
  {
    number: "2",
    icon: Search,
    title: "Wir suchen für dich",
    description: "Passende Betriebe melden sich bei dir — meist in 48 Stunden.",
  },
  {
    number: "3",
    icon: BadgeCheck,
    title: "200 € Belohnung",
    description: "Nach 8 Wochen im neuen Job: 200 € direkt aufs Konto.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-28 max-lg:py-16 bg-white" id="wie-es-funktioniert">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center justify-center gap-3 text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-5">
            <span className="w-8 h-[2px] bg-accent" />
            Der Prozess
            <span className="w-8 h-[2px] bg-accent" />
          </span>
          <h2
            className="text-primary font-bold leading-tight text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            So einfach funktioniert&apos;s
          </h2>
        </motion.div>

        {/* Schritte — große, lesbare Karten */}
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ y: 24, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-6 p-8 md:p-10"
                style={{ background: "var(--color-surface)" }}
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-primary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-8 h-8 text-accent" strokeWidth={1.6} />
                  </div>
                  <span
                    className="text-accent font-black leading-none"
                    style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem" }}
                  >
                    {step.number}
                  </span>
                </div>

                <h3
                  className="text-primary font-bold text-2xl md:text-3xl leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {step.title}
                </h3>
                <p className="text-muted text-lg md:text-xl leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Großer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 flex justify-center"
        >
          <Link
            href="/registrieren"
            className="group relative overflow-hidden inline-flex items-center gap-3 rounded-full bg-accent text-primary font-bold px-9 py-5 text-lg transition-shadow duration-300 shadow-[0_10px_28px_-10px_rgba(232,168,56,0.55)] hover:shadow-[0_16px_36px_-10px_rgba(26,26,46,0.45)]"
          >
            <span className="relative z-10 inline-flex items-center gap-3 transition-colors duration-300 group-hover:text-white">
              Jetzt kostenlos starten
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            {/* Navy-Füllung steigt von unten auf */}
            <span
              aria-hidden="true"
              className="absolute inset-0 z-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
