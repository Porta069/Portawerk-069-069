"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Link2,
  Share2,
  Wallet,
  Users,
  HardHat,
  Check,
} from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "Link holen",
    desc: "Melde dich kostenlos an und bekomme deinen persönlichen Empfehlungs-Link.",
  },
  {
    icon: Share2,
    title: "Teilen",
    desc: "Schick den Link an Freunde, Familie oder Kollegen aus dem Handwerk — per WhatsApp, überall.",
  },
  {
    icon: Wallet,
    title: "Verdienen",
    desc: "Findet jemand über deinen Link einen Job und besteht die Einführungsphase, bekommst du deine Belohnung.",
  },
];

const faqs = [
  {
    q: "Was kostet mich das?",
    a: "Nichts. Die Teilnahme ist komplett kostenlos — du gehst kein Risiko ein.",
  },
  {
    q: "Muss ich selbst Handwerker sein?",
    a: "Nein. Jeder kann empfehlen und verdienen. Du musst nur Leute kennen, die einen Job im Handwerk suchen.",
  },
  {
    q: "Wann bekomme ich die Belohnung?",
    a: "Sobald dein geworbener Handwerker über uns einen Job gefunden und die Einführungsphase (8 Wochen) bestanden hat.",
  },
  {
    q: "Wie werde ich ausgezahlt?",
    a: "Per Banküberweisung auf das Konto, das du in deinem Partner-Bereich hinterlegst.",
  },
];

export default function EmpfehlenContent() {
  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative pt-36 pb-20 lg:pt-44 lg:pb-24 overflow-hidden"
        style={{ background: "var(--color-surface)" }}
      >
        <div
          className="absolute top-0 right-0 w-[50%] h-[70%] pointer-events-none"
          style={{ background: "radial-gradient(circle at 80% 10%, rgba(232,168,56,0.14) 0%, transparent 60%)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <span className="w-9 h-[2px] bg-accent" />
            <span className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
              Empfehlen &amp; verdienen
            </span>
            <span className="w-9 h-[2px] bg-accent" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="text-primary font-bold leading-[1.05] mb-6"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 6vw, 4.2rem)" }}
          >
            Empfehle Handwerker.
            <br />
            <span className="text-accent">Verdiene mit.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="text-muted text-lg leading-relaxed max-w-xl mx-auto mb-9"
          >
            Du kennst jemanden, der einen neuen Job im Handwerk sucht? Teil deinen Link —
            findet er über uns eine Stelle, bekommst du eine{" "}
            <span className="text-primary font-semibold">feste Belohnung</span>. Ganz einfach.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="#partner"
              className="group inline-flex items-center justify-center gap-3 bg-accent text-primary font-bold px-9 py-4 text-lg hover:bg-amber-400 transition-colors duration-200"
            >
              Partner werden
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
            <a href="#ablauf" className="text-primary/70 hover:text-primary text-sm font-medium transition-colors">
              So funktioniert&apos;s →
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── So funktioniert's ── */}
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
              So funktioniert&apos;s
            </span>
            <h2 className="text-primary font-bold text-4xl md:text-5xl leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              In drei Schritten verdienen
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="flex flex-col">
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

      {/* ── Was du verdienst ── */}
      <section className="py-24" style={{ background: "var(--color-accent-soft)" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-6">
              <span className="w-8 h-[2px] bg-accent" />
              Was du verdienst
            </span>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-black text-accent leading-none" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(4rem, 12vw, 7rem)" }}>
                100&nbsp;€
              </span>
              <span className="text-primary/60 text-sm font-medium">*</span>
            </div>
            <p className="text-primary/70 text-lg leading-relaxed mb-3">
              pro erfolgreich vermitteltem Handwerker — ausgezahlt, sobald er die
              Einführungsphase besteht. Fair und erfolgsbasiert.
            </p>
            <p className="text-muted text-xs">*Beispielbetrag — der finale Betrag folgt.</p>
          </motion.div>

          <motion.div
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white border border-border p-8"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted mb-4">
              Rechenbeispiel
            </p>
            {[
              { n: "1 Vermittlung", v: "100 €" },
              { n: "3 Vermittlungen", v: "300 €" },
              { n: "10 Vermittlungen", v: "1.000 €" },
            ].map((row) => (
              <div key={row.n} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                <span className="text-primary/75 text-sm">{row.n}</span>
                <span className="text-primary font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>
                  {row.v}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Für wen ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.h2
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-primary font-bold text-4xl md:text-5xl leading-tight mb-12"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Für wen ist das?
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: HardHat,
                title: "Für Handwerker",
                desc: "Empfiehl Kollegen aus deinem Gewerk und verdien nebenbei mit — du weißt am besten, wer wechseln will.",
              },
              {
                icon: Users,
                title: "Für alle anderen",
                desc: "Du musst kein Handwerker sein. Wer Leute kennt, die einen Job suchen, kann empfehlen und verdienen.",
              },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="border border-border p-7" style={{ background: "var(--color-surface)" }}>
                  <div className="w-11 h-11 flex items-center justify-center mb-4" style={{ background: "var(--color-accent-soft)" }}>
                    <Icon className="w-5 h-5 text-accent" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-primary font-bold text-xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    {c.title}
                  </h3>
                  <p className="text-muted text-base leading-relaxed">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <motion.h2
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-primary font-bold text-3xl md:text-4xl leading-tight mb-10"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Häufige Fragen
          </motion.h2>
          <div className="flex flex-col">
            {faqs.map((f) => (
              <div key={f.q} className="border-t border-border last:border-b py-6">
                <h3 className="text-primary font-semibold text-lg mb-2">{f.q}</h3>
                <p className="text-muted text-base leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partner-CTA ── */}
      <section className="py-20 bg-primary relative overflow-hidden" id="partner">
        <div
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232,168,56,0.10) 0%, transparent 65%)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-white font-bold text-3xl md:text-4xl leading-tight mb-5" style={{ fontFamily: "var(--font-display)" }}>
            Bereit? Werde Partner.
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-xl mx-auto mb-9">
            Kostenlos, unverbindlich, erfolgsbasiert. Melde dein Interesse an — dein
            persönlicher Empfehlungs-Link und dein Dashboard starten in Kürze.
          </p>
          <a
            href="mailto:partner@portawerk.de?subject=Ich%20m%C3%B6chte%20Partner%20werden"
            className="group inline-flex items-center gap-3 bg-accent text-primary font-semibold px-8 py-4 hover:bg-amber-400 transition-colors duration-200"
          >
            Jetzt Partner werden
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
          <p className="text-white/40 text-xs mt-6 flex items-center justify-center gap-2">
            <Check className="w-3.5 h-3.5 text-accent" strokeWidth={2.5} />
            Auszahlung nur bei erfolgreicher Vermittlung — keine versteckten Kosten.
          </p>
        </div>
      </section>
    </>
  );
}
