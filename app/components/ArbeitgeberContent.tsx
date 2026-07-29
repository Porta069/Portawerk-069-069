"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  BadgeEuro,
  UserCheck,
  ShieldCheck,
  Clock,
  ClipboardList,
  Users,
  Check,
} from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Bedarf melden",
    desc: "Sagen Sie uns kurz, welche Fachkraft Sie suchen — Gewerk, Region, Umfang. In wenigen Minuten, ohne Inserat.",
  },
  {
    icon: Users,
    title: "Vorgeprüfte Kandidaten erhalten",
    desc: "Wir gleichen Ihren Bedarf mit unserem Kandidatenpool ab und stellen Ihnen passende, geprüfte Profile diskret vor.",
  },
  {
    icon: BadgeEuro,
    title: "Nur bei Erfolg zahlen",
    desc: "Sie zahlen erst, wenn ein Kandidat anfängt und die Probezeit besteht. Keine Vorabkosten, keine Agenturgebühren.",
  },
];

const benefits = [
  {
    icon: BadgeEuro,
    title: "Nur bei Erfolg zahlen",
    desc: "Keine Vorabkosten, keine monatlichen Gebühren. Zahlung erst nach erfolgreicher Probezeit.",
  },
  {
    icon: UserCheck,
    title: "Vorgeprüfte Kandidaten",
    desc: "Wir prüfen jedes Profil vorab — passende Fachkräfte statt Massenbewerbungen und No-Shows.",
  },
  {
    icon: ShieldCheck,
    title: "Diskreter Prozess",
    desc: "Kein öffentliches Inserat. Ihre Suche bleibt intern, bis Sie einer konkreten Vorstellung zustimmen.",
  },
  {
    icon: Clock,
    title: "Schnelle Besetzung",
    desc: "Durch unseren aktiven Kandidatenpool oft erste passende Profile innerhalb weniger Tage.",
  },
];

export default function ArbeitgeberContent() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] grid lg:grid-cols-2" style={{ background: "var(--color-surface)" }}>
        <div className="relative flex items-center order-2 lg:order-1">
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
                Für Handwerksbetriebe
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="text-primary font-bold leading-[1.06] mb-6"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 5.2vw, 4rem)" }}
            >
              Personal finden,
              <br />
              das bleibt.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="text-muted text-lg leading-relaxed mb-9 max-w-md"
            >
              Sie sagen uns, wen Sie brauchen — wir liefern vorgeprüfte Handwerker.
              Und Sie <span className="text-primary font-semibold">zahlen nur, wenn es klappt</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-4 sm:items-center"
            >
              <a
                href="mailto:kontakt@portawerk.de"
                className="group inline-flex items-center justify-center gap-3 bg-accent text-primary font-bold px-8 py-4 text-base hover:bg-amber-400 transition-colors duration-200"
              >
                Kontakt aufnehmen
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a href="#ablauf" className="text-primary/70 hover:text-primary text-sm font-medium transition-colors">
                So läuft&apos;s →
              </a>
            </motion.div>
          </div>
        </div>

        <div className="relative order-1 lg:order-2 h-64 sm:h-80 lg:h-auto lg:min-h-full overflow-hidden">
          <Image
            src="/images/hero-team-werkstatt.jpg"
            alt="Zwei Handwerker in einer hellen Werkstatt"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            style={{ objectPosition: "center 32%" }}
          />
          <div
            className="hidden lg:block absolute inset-y-0 left-0 w-24 pointer-events-none"
            style={{ background: "linear-gradient(to right, var(--color-surface) 0%, transparent 100%)" }}
          />
        </div>
      </section>

      {/* ── So läuft's ── */}
      <section className="py-24 bg-white" id="ablauf">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-14 max-w-xl"
          >
            <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-5">
              <span className="w-8 h-[2px] bg-accent" />
              So läuft&apos;s
            </span>
            <h2 className="text-primary font-bold text-4xl md:text-5xl leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              In drei Schritten zur Fachkraft
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="relative flex flex-col">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-accent" strokeWidth={1.6} />
                    </div>
                    <span className="text-accent/30 font-bold text-4xl leading-none" style={{ fontFamily: "var(--font-display)" }}>
                      {`0${i + 1}`}
                    </span>
                  </div>
                  <h3 className="text-primary font-bold text-xl mb-2.5" style={{ fontFamily: "var(--font-display)" }}>
                    {s.title}
                  </h3>
                  <p className="text-muted text-base leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Vorteile ── */}
      <section className="py-24" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-14 max-w-xl"
          >
            <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-5">
              <span className="w-8 h-[2px] bg-accent" />
              Ihre Vorteile
            </span>
            <h2 className="text-primary font-bold text-4xl md:text-5xl leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              Warum Betriebe auf uns setzen
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="bg-white border border-border p-6 hover:border-accent transition-colors duration-300">
                  <div className="w-11 h-11 flex items-center justify-center mb-4" style={{ background: "var(--color-accent-soft)" }}>
                    <Icon className="w-5 h-5 text-accent" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-primary font-semibold text-base mb-2">{b.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA-Band ── */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232,168,56,0.10) 0%, transparent 65%)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 border border-accent/30 px-4 py-2 mb-7">
            <Check className="w-4 h-4 text-accent" strokeWidth={2.5} />
            <span className="text-white text-sm font-medium">Unser Versprechen: Sie zahlen nur, wenn es klappt.</span>
          </div>
          <h2 className="text-white font-bold text-3xl md:text-4xl leading-tight mb-5" style={{ fontFamily: "var(--font-display)" }}>
            Offene Stelle zu besetzen?
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-xl mx-auto mb-9">
            Schreiben Sie uns, wen Sie suchen — wir melden uns mit passenden Kandidaten.
            Unverbindlich und ohne Vorabkosten.
          </p>
          <a
            href="mailto:kontakt@portawerk.de"
            className="group inline-flex items-center gap-3 bg-accent text-primary font-semibold px-8 py-4 hover:bg-amber-400 transition-colors duration-200"
          >
            Kontakt aufnehmen
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </div>
      </section>
    </>
  );
}
