"use client";

import { motion } from "framer-motion";
import { UserRound, Search, BadgeCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserRound,
    title: "Profil erstellen",
    description:
      "Füll in 3 Minuten unser Formular aus: Berufsfeld, Erfahrung, Verfügbarkeit. Kein Lebenslauf, kein Anschreiben. Dein Name erscheint bei Arbeitgebern erst wenn du per Klick zustimmst — pro Betrieb, separat.",
  },
  {
    number: "02",
    icon: Search,
    title: "Wir selektieren für dich",
    description:
      "Unser Team gleicht dein Profil mit passenden Betrieben ab und stellt dich diskret vor. Erst wenn du konkret Interesse hast, geben wir deinen Kontakt frei — nie früher.",
  },
  {
    number: "03",
    icon: BadgeCheck,
    title: "Als Dankeschön: 200€",
    description:
      "Nach 8 Wochen aktiver Beschäftigung überweisen wir 200€ direkt auf dein Konto — als Dankeschön für den Mut, einen neuen Schritt zu wagen.",
  },
];


export default function HowItWorks() {
  return (
    <section className="py-28 bg-white" id="wie-es-funktioniert">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ y: 30 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20"
        >
          <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-5">
            <span className="w-8 h-[2px] bg-accent" />
            Der Prozess
          </span>
          <h2
            className="text-primary font-bold text-4xl md:text-5xl leading-tight max-w-md"
            style={{ fontFamily: "var(--font-display)" }}
          >
            So einfach
            <br />
            funktioniert&apos;s
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative mb-20">
          <div className="hidden md:block absolute top-[2.25rem] left-[calc(16.666%+2rem)] right-[calc(16.666%+2rem)] h-px bg-border" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ y: 50 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.14,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative flex flex-col"
              >
                <div className="relative mb-8 self-start">
                  <span
                    className="absolute -top-3 -left-2 font-bold text-[5.5rem] leading-none text-accent/12 select-none"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {step.number}
                  </span>
                  <div className="relative z-10 w-[4.5rem] h-[4.5rem] bg-primary flex items-center justify-center">
                    <Icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
                  </div>
                </div>

                <h3
                  className="text-primary font-bold text-xl mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {step.title}
                </h3>
                <p className="text-muted text-base leading-relaxed">
                  {step.description}
                </p>

                {i < steps.length - 1 && (
                  <div className="md:hidden mt-8 flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-border" />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Anonymous testimonials */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="grid md:grid-cols-3 gap-5"
        >
          {[
            {
              quote: "Ich hab mich nie getraut, während ich noch angestellt war, nach was Neuem zu schauen. Hier wusste mein Chef nichts davon.",
              role: "Elektriker, 6 Jahre Erfahrung",
              city: "München",
            },
            {
              quote: "Das war das erste Mal, dass ich nicht gefühlt hab, ich muss mich verkaufen. Die haben mich vorgestellt, ich hab nur Ja oder Nein gesagt.",
              role: "Anlagenmechaniker SHK",
              city: "Hamburg",
            },
            {
              quote: "Die 200€ kamen tatsächlich pünktlich nach 8 Wochen. Kein Stress, kein Nachhaken.",
              role: "Maler & Lackierer",
              city: "Berlin",
            },
          ].map((t) => (
            <div
              key={t.city}
              className="p-6 border border-border"
              style={{ background: "var(--color-surface)" }}
            >
              <p className="text-primary/70 text-sm leading-relaxed mb-5 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 flex items-center justify-center"
                  style={{ background: "var(--color-primary)" }}
                >
                  <span className="text-accent text-[9px] font-bold">✓</span>
                </div>
                <div>
                  <p className="text-primary text-xs font-semibold">{t.role}</p>
                  <p className="text-muted text-xs">{t.city} · Name bekannt, auf Wunsch anonym</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
