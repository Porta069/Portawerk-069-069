"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const benefits = [
  {
    title: "Nur bei Erfolg zahlen",
    desc: "Keine Vorabkosten, keine Agenturgebühren. Sie zahlen erst, wenn ein Kandidat anfängt und die Probezeit erfolgreich absolviert.",
  },
  {
    title: "Vorselektierte Kandidaten",
    desc: "Wir prüfen jedes Profil vorab. Sie erhalten nur Kandidaten, die wirklich passen — keine Massenbewerbungen, keine No-Shows.",
  },
  {
    title: "Diskreter Prozess",
    desc: "Kein öffentliches Inserat. Ihre Suche bleibt intern, bis Sie einer konkreten Vorstellung zustimmen.",
  },
  {
    title: "Schnelle Besetzung",
    desc: "Durch unseren aktiven Kandidatenpool können wir oft innerhalb weniger Tage erste passende Profile vorstellen.",
  },
];

export default function ForBusinesses() {
  return (
    <section className="py-28 bg-primary relative overflow-hidden" id="betriebe">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(232,168,56,0.10) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left */}
          <motion.div
            initial={{ y: 40 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-8">
              <span className="w-8 h-[2px] bg-accent" />
              Für Handwerksbetriebe
            </span>

            <h2
              className="text-white font-bold text-4xl md:text-5xl leading-tight mb-7"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Personal finden,
              <br />
              das wirklich bleibt.
            </h2>

            <p className="text-white/55 text-base leading-relaxed mb-10 max-w-md">
              Fachkräftemangel, unbesetzte Stellen, zu wenig Zeit für eigene
              Bewerbungsprozesse — das kennt jeder Handwerksbetrieb. PortaWerk
              übernimmt die Vorauswahl, Sie konzentrieren sich auf die Baustelle.
            </p>

            {/* Success-only callout */}
            <div className="border border-accent/30 p-6 mb-10">
              <p className="text-accent text-xs uppercase tracking-wider font-medium mb-2">
                Unser Versprechen
              </p>
              <p
                className="text-white text-2xl font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Sie zahlen nur,
                <br />
                wenn es klappt.
              </p>
            </div>

            <a
              href="mailto:kontakt@portawerk.de"
              className="group inline-flex items-center gap-3 bg-accent text-primary font-semibold px-8 py-4 hover:bg-amber-400 transition-colors duration-200"
            >
              Kontakt aufnehmen
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </motion.div>

          {/* Right — benefits */}
          <motion.div
            initial={{ y: 40 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4 lg:pt-24"
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.09,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex gap-4 p-5 border border-white/10 hover:border-accent/35 transition-colors duration-300"
              >
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1.5">
                    {benefit.title}
                  </h3>
                  <p className="text-white/45 text-sm leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
