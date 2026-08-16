"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Link2, Share2, Wallet, Users, HardHat, Check, Plus } from "lucide-react";
import AffiliateGenerator from "./AffiliateGenerator";
import AffiliateRechner from "./AffiliateRechner";

const steps = [
  { icon: Link2, title: "Link holen", desc: "Namen eingeben — dein persönlicher Link ist sofort da." },
  { icon: Share2, title: "Teilen", desc: "Schick ihn an Freunde, Familie oder Kollegen. Per WhatsApp, überall." },
  { icon: Wallet, title: "100 € kassieren", desc: "Findet jemand über dich einen Job, bekommst du 100 €." },
];

const faqs = [
  { q: "Was kostet mich das?", a: "Nichts. Die Teilnahme ist komplett kostenlos — du gehst kein Risiko ein." },
  { q: "Muss ich selbst Handwerker sein?", a: "Nein. Jeder kann empfehlen und verdienen. Du musst nur Leute kennen, die einen Job suchen." },
  { q: "Wann bekomme ich mein Geld?", a: "Sobald dein geworbener Handwerker über uns einen Job gefunden und die Einführungsphase (8 Wochen) bestanden hat." },
  { q: "Wie werde ich ausgezahlt?", a: "Per Banküberweisung auf das Konto, das du in deinem Partner-Bereich hinterlegst." },
];

export default function VerdienenContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return (
    <>
      {/* ── Hero: Affiliate-Funktion ganz oben + Geld ── */}
      <section className="relative bg-primary overflow-hidden">
        {/* Geld-Bild, blendet in den Hero */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 pointer-events-none">
          <Image
            src="/images/geld.jpg"
            alt="Euro-Geldscheine"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          {/* Verlauf: verschmilzt mit dem Navy-Hero */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, #1A1A2E 0%, rgba(26,26,46,0.55) 32%, rgba(26,26,46,0.15) 70%, rgba(26,26,46,0.35) 100%)",
            }}
          />
          {/* auf Mobile stärker abdunkeln für Lesbarkeit */}
          <div className="lg:hidden absolute inset-0 bg-primary/75" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pt-40 lg:pb-28 grid lg:grid-cols-2 gap-12 items-center">
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
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="text-white font-bold leading-[1.03] mb-5"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.6rem, 6.5vw, 4.6rem)" }}
            >
              Empfehle.
              <br />
              <span className="text-accent">Verdiene.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="text-white/70 text-lg leading-relaxed max-w-md mb-8"
            >
              Erstell deinen Link, teil ihn — und kassier{" "}
              <span className="text-white font-semibold">100 € für jede Vermittlung</span>.
              Kostenlos, ohne Risiko.
            </motion.p>

            {/* DER Generator — ganz oben */}
            <motion.div
              id="link"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-md scroll-mt-28"
            >
              <AffiliateGenerator />
            </motion.div>
          </div>

          {/* rechte Spalte bleibt für das Geld-Bild frei (absolut positioniert) */}
          <div className="hidden lg:block" aria-hidden />
        </div>
      </section>

      {/* ── So funktioniert's ── */}
      <section className="py-24 bg-white">
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
                // Aussen: Framer (Einblendung, steuert transform).
                // Innen: CSS (Hover-Lift) — sonst kaempfen beide um dieselbe
                // transform-Eigenschaft und die Karte ruckelt beim Laden.
                <motion.div
                  key={s.title}
                  initial={{ y: 24, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="group relative h-full overflow-hidden rounded-3xl bg-primary p-8 hover:-translate-y-2 transition-[transform,box-shadow] duration-300 ease-out shadow-[0_20px_44px_-24px_rgba(26,26,46,0.5)] hover:shadow-[0_30px_60px_-22px_rgba(232,168,56,0.5)]">
                    <span
                      className="absolute -top-6 right-1 font-black text-white/[0.06] leading-none select-none pointer-events-none"
                      style={{ fontFamily: "var(--font-display)", fontSize: "9rem" }}
                    >
                      {i + 1}
                    </span>
                    <div
                      className="absolute -inset-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{ background: "radial-gradient(circle at 70% 0%, rgba(232,168,56,0.2) 0%, transparent 60%)" }}
                    />
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                        <Icon className="w-7 h-7 text-primary" strokeWidth={2} />
                      </div>
                      <h3 className="text-white font-bold text-2xl mb-2.5" style={{ fontFamily: "var(--font-display)" }}>{s.title}</h3>
                      <p className="text-white/55 text-base leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Rechner ── */}
      <section className="py-24" style={{ background: "var(--color-surface)" }} id="rechner">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-10 max-w-xl mx-auto"
          >
            <h2 className="text-primary font-bold text-4xl md:text-5xl leading-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Was kannst DU <span className="text-accent">verdienen</span>?
            </h2>
            <p className="text-muted text-lg">
              Stell ein, wie viele Deals du machst — und sieh sofort, was dabei rauskommt.
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
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: HardHat, title: "Für Handwerker", desc: "Empfiehl Kollegen aus deinem Gewerk und verdien nebenbei." },
              { icon: Users, title: "Für alle anderen", desc: "Kein Handwerker? Egal. Wer Leute kennt, kann verdienen." },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                // Gleiche Trennung wie oben: Framer aussen, Hover-CSS innen.
                <motion.div
                  key={c.title}
                  initial={{ y: 24, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="group h-full rounded-3xl border border-border bg-white p-8 sm:p-10 hover:border-accent hover:-translate-y-1.5 hover:shadow-[0_26px_54px_-28px_rgba(232,168,56,0.5)] transition-[transform,box-shadow,border-color] duration-300 ease-out">
                    <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                      <Icon className="w-7 h-7 text-primary" strokeWidth={2} />
                    </div>
                    <h3 className="text-primary font-bold text-2xl mb-2.5" style={{ fontFamily: "var(--font-display)" }}>{c.title}</h3>
                    <p className="text-muted text-base md:text-lg leading-relaxed">{c.desc}</p>
                  </div>
                </motion.div>
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
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={f.q} className="border-t border-border last:border-b">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 py-6 text-left group"
                  >
                    <span className={`text-lg font-semibold transition-colors ${isOpen ? "text-primary" : "text-primary/80 group-hover:text-primary"}`}>
                      {f.q}
                    </span>
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: isOpen ? "var(--color-accent)" : "var(--color-accent-soft)" }}>
                      <Plus className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-45 text-primary" : "text-accent"}`} strokeWidth={2.5} />
                    </span>
                  </button>
                  <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                    <div className="overflow-hidden">
                      <p className="text-muted text-base leading-relaxed pb-6 max-w-2xl">{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(232,168,56,0.10) 0%, transparent 65%)" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-white font-bold text-3xl md:text-4xl leading-tight mb-5" style={{ fontFamily: "var(--font-display)" }}>
            Bereit zu verdienen?
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-xl mx-auto mb-9">
            Erstell jetzt deinen Link — kostenlos, unverbindlich, 100 € pro Vermittlung.
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
