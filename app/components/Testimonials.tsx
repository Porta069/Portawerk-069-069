"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Quote } from "lucide-react";

// img?: echtes Kundenfoto (mit Einverständnis) — sobald vorhanden, ersetzt es
// automatisch den Initialen-Avatar. Bewusst KEINE Stock-Gesichter (UWG).
type Stimme = {
  quote: string;
  name: string;
  initials: string;
  role: string;
  city: string;
  img?: string;
};

const testimonials: Stimme[] = [
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
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ y: 28, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white rounded-2xl border border-border shadow-[0_16px_40px_-24px_rgba(26,26,46,0.28)] p-8 flex flex-col hover:shadow-[0_24px_50px_-24px_rgba(26,26,46,0.35)] transition-shadow duration-300"
            >
              {/* Dekoratives Anführungszeichen */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center mb-5"
                style={{ background: "var(--color-accent-soft)" }}
              >
                <Quote className="w-5 h-5 text-accent" fill="currentColor" strokeWidth={0} />
              </div>

              <blockquote className="text-primary text-lg leading-relaxed flex-1 mb-8">
                {t.quote}
              </blockquote>

              {/* Person */}
              <figcaption className="flex items-center gap-3.5 pt-6 border-t border-border">
                {t.img ? (
                  <Image
                    src={t.img}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-accent/40 flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-accent/40"
                    style={{ background: "var(--color-accent-soft)" }}
                  >
                    <span className="text-sm font-bold" style={{ color: "#B47B18" }}>
                      {t.initials}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-primary text-sm font-bold">
                    {t.name} <span className="text-muted font-normal">· {t.city}</span>
                  </p>
                  <p className="text-muted text-xs">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <p className="text-muted text-xs mt-6 flex items-center gap-2">
          <span className="text-accent">•</span>
          Nachname und Betrieb bleiben privat — Diskretion ist bei uns Prinzip, nicht Ausnahme.
        </p>
      </div>
    </section>
  );
}
