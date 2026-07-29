"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeEuro, UserCheck, Zap } from "lucide-react";

const benefits = [
  {
    icon: BadgeEuro,
    title: "Nur bei Erfolg zahlen",
    desc: "Keine Vorabkosten — Zahlung erst nach erfolgreicher Probezeit.",
  },
  {
    icon: UserCheck,
    title: "Vorgeprüfte Kandidaten",
    desc: "Passende Profile statt Massenbewerbungen und No-Shows.",
  },
  {
    icon: Zap,
    title: "Diskret & schnell",
    desc: "Interne Suche, erste passende Profile oft in wenigen Tagen.",
  },
];

export default function ForBusinesses() {
  return (
    <section className="py-20 bg-primary relative overflow-hidden" id="betriebe">
      {/* dezenter Gold-Schimmer */}
      <div
        className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(232,168,56,0.08) 0%, transparent 65%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 text-center"
      >
        <span className="inline-flex items-center gap-3 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-6">
          <span className="w-8 h-[2px] bg-accent" />
          Für Handwerksbetriebe
          <span className="w-8 h-[2px] bg-accent" />
        </span>

        <h2
          className="text-white font-bold text-3xl md:text-4xl leading-tight mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Personal finden, das bleibt.
        </h2>
        <p className="text-white/60 text-base leading-relaxed max-w-xl mx-auto mb-12">
          Wir übernehmen die Vorauswahl — Sie{" "}
          <span className="text-white font-medium">zahlen nur, wenn es klappt</span>.
        </p>

        {/* 3 kompakte Vorteile */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12 text-left">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="flex flex-col gap-2.5">
                <Icon className="w-6 h-6 text-accent" strokeWidth={1.75} />
                <h3 className="text-white font-semibold text-sm">{b.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>

        <a
          href="mailto:kontakt@portawerk.de"
          className="group inline-flex items-center gap-3 bg-accent text-primary font-semibold px-8 py-4 hover:bg-amber-400 transition-colors duration-200"
        >
          Kontakt aufnehmen
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </motion.div>
    </section>
  );
}
