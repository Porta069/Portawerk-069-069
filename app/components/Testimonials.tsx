"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Ich hab mich nie getraut, was Neues zu suchen, solange ich noch angestellt war. Hier hat mein Chef nichts davon mitbekommen.",
    name: "Thomas",
    initials: "TM",
    role: "Elektriker · 6 Jahre dabei",
    city: "München",
  },
  {
    quote:
      "Zum ersten Mal musste ich mich nicht verkaufen. Die haben mich vorgestellt, ich hab nur Ja oder Nein gesagt. So einfach.",
    name: "Kevin",
    initials: "KB",
    role: "Anlagenmechaniker SHK",
    city: "Hamburg",
  },
  {
    quote:
      "Nach der Einführungsphase kamen die 200 € pünktlich aufs Konto. Kein Kleingedrucktes, kein Nachhaken. Passt.",
    name: "Andreas",
    initials: "AR",
    role: "Maler & Lackierer",
    city: "Berlin",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white" id="stimmen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-5">
            <span className="w-8 h-[2px] bg-accent" />
            Was andere Handwerker sagen
          </span>
          <h2
            className="text-primary font-bold text-4xl md:text-5xl leading-tight max-w-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Echte Stimmen aus dem Handwerk
          </h2>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="grid md:grid-cols-3 gap-5"
        >
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-6 border border-border flex flex-col"
              style={{ background: "var(--color-surface)" }}
            >
              <p className="text-primary/80 text-[15px] leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--color-accent-soft)" }}
                >
                  <span className="text-[13px] font-bold" style={{ color: "#B47B18" }}>
                    {t.initials}
                  </span>
                </div>
                <div>
                  <p className="text-primary text-sm font-semibold">
                    {t.name} <span className="text-muted font-normal">· {t.city}</span>
                  </p>
                  <p className="text-muted text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <p className="text-muted text-xs mt-5 flex items-center gap-2">
          <span className="text-accent">•</span>
          Nachname und Betrieb bleiben privat — Diskretion ist bei uns Prinzip, nicht Ausnahme.
        </p>
      </div>
    </section>
  );
}
