"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Link2, Share2, Wallet, Users, HardHat, Check } from "lucide-react";
import AffiliateGenerator from "./AffiliateGenerator";
import AffiliateRechner from "./AffiliateRechner";

const steps = [
  { icon: Link2, title: "Link holen", desc: "Nummer eingeben, Wunsch-Link wählen — in 30 Sekunden fertig." },
  { icon: Share2, title: "Teilen", desc: "Schick ihn an Freunde, Familie oder Kollegen — per WhatsApp, überall." },
  { icon: Wallet, title: "Verdienen", desc: "Findet jemand über deinen Link einen Job, kassierst du deine Prämie." },
];

const faqs = [
  { q: "Was kostet mich das?", a: "Nichts. Die Teilnahme ist komplett kostenlos — du gehst kein Risiko ein." },
  { q: "Muss ich selbst Handwerker sein?", a: "Nein. Jeder kann empfehlen und verdienen. Du musst nur Leute kennen, die einen Job suchen." },
  { q: "Wann bekomme ich mein Geld?", a: "Sobald dein geworbener Handwerker über uns einen Job gefunden und die Einführungsphase (8 Wochen) bestanden hat." },
  { q: "Wie werde ich ausgezahlt?", a: "Per Banküberweisung auf das Konto, das du in deinem Partner-Bereich hinterlegst." },
];

export default function VerdienenContent() {
  return (
    <>
      {/* ── Hero: Geld im Vordergrund ── */}
      <section className="relative bg-primary pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="w-9 h-[2px] bg-accent" />
              <span className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
                Verdienen mit PortaWerk
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="text-white font-bold leading-[1.04] mb-6"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.6rem, 6.5vw, 4.6rem)" }}
            >
              Empfehle Handwerker.
              <br />
              <span className="text-accent">Verdiene mit.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="text-white/65 text-lg leading-relaxed max-w-md mb-8"
            >
              Kennst du jemanden, der einen Job im Handwerk sucht? Teil deinen Link —
              findet er über uns eine Stelle, kassierst du eine{" "}
              <span className="text-white font-semibold">feste Prämie</span>.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-4 sm:items-center"
            >
              <a
                href="#link"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-accent text-primary font-bold px-9 py-4 text-lg hover:bg-amber-400 transition-colors duration-200"
              >
                Link erstellen
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a href="#rechner" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
                Verdienst berechnen →
              </a>
            </motion.div>
          </div>

          {/* Freigestelltes Geld, verschmilzt mit dem Hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative justify-self-center lg:justify-self-end w-[70%] sm:w-[55%] lg:w-[85%]"
          >
            <div
              className="absolute inset-0 -m-10 pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 50%, rgba(232,168,56,0.30) 0%, transparent 62%)" }}
            />
            <Image
              src="/images/geld.png"
              alt="Bündel Euro-Geldscheine"
              width={485}
              height={452}
              priority
              className="relative w-full h-auto drop-shadow-[0_28px_50px_rgba(0,0,0,0.5)]"
            />
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
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ y: 24, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-5 p-8 rounded-2xl"
                  style={{ background: "var(--color-surface)" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-accent" strokeWidth={1.6} />
                    </div>
                    <span className="text-accent font-black text-4xl leading-none" style={{ fontFamily: "var(--font-display)" }}>
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-primary font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>{s.title}</h3>
                  <p className="text-muted text-base leading-relaxed">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Link-Generator ── */}
      <section className="py-24" style={{ background: "var(--color-surface)" }} id="link">
        <div className="max-w-2xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-10"
          >
            <h2 className="text-primary font-bold text-4xl md:text-5xl leading-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Dein eigener Link
            </h2>
            <p className="text-muted text-lg">
              Registrier dich mit deiner Nummer und erstelle deinen persönlichen,
              einzigartigen Empfehlungs-Link.
            </p>
          </motion.div>
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <AffiliateGenerator />
          </motion.div>
        </div>
      </section>

      {/* ── Was du verdienst (Beispiel) ── */}
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
              Einführungsphase besteht.
            </p>
            <p className="text-muted text-xs">*Beispielbetrag — der finale Betrag folgt.</p>
          </motion.div>

          <motion.div
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white border border-border rounded-2xl p-8"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted mb-4">Rechenbeispiel</p>
            {[
              { n: "1 Vermittlung", v: "100 €" },
              { n: "3 Vermittlungen", v: "300 €" },
              { n: "10 Vermittlungen", v: "1.000 €" },
            ].map((row) => (
              <div key={row.n} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                <span className="text-primary/75 text-sm">{row.n}</span>
                <span className="text-primary font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>{row.v}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Interaktiver Rechner ── */}
      <section className="py-24 bg-white" id="rechner">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-10 max-w-xl mx-auto"
          >
            <h2 className="text-primary font-bold text-4xl md:text-5xl leading-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Rechne selbst nach
            </h2>
            <p className="text-muted text-lg">
              Wie viele Vermittlungen brauchst du für dein Ziel? Zieh am Regler oder gib
              deinen Wunsch-Verdienst ein.
            </p>
          </motion.div>
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <AffiliateRechner />
          </motion.div>
        </div>
      </section>

      {/* ── Für wen ── */}
      <section className="py-24" style={{ background: "var(--color-surface)" }}>
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
              { icon: HardHat, title: "Für Handwerker", desc: "Empfiehl Kollegen aus deinem Gewerk und verdien nebenbei mit." },
              { icon: Users, title: "Für alle anderen", desc: "Du musst kein Handwerker sein. Wer Leute kennt, kann verdienen." },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="bg-white border border-border rounded-2xl p-7">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--color-accent-soft)" }}>
                    <Icon className="w-5 h-5 text-accent" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-primary font-bold text-xl mb-2" style={{ fontFamily: "var(--font-display)" }}>{c.title}</h3>
                  <p className="text-muted text-base leading-relaxed">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-white">
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
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(232,168,56,0.10) 0%, transparent 65%)" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-white font-bold text-3xl md:text-4xl leading-tight mb-5" style={{ fontFamily: "var(--font-display)" }}>
            Bereit zu verdienen?
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-xl mx-auto mb-9">
            Erstelle jetzt deinen Link — kostenlos, unverbindlich, erfolgsbasiert.
          </p>
          <a
            href="#link"
            className="group inline-flex items-center gap-3 rounded-full bg-accent text-primary font-semibold px-8 py-4 hover:bg-amber-400 transition-colors duration-200"
          >
            Link erstellen
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
