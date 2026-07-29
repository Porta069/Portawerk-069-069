"use client";

import { useState } from "react";
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
  Plus,
} from "lucide-react";
import ArbeitgeberForm from "./ArbeitgeberForm";

const vorteile = [
  { icon: BadgeEuro, title: "Nur bei Erfolg zahlen", desc: "Keine Vorabkosten, keine monatlichen Gebühren. Zahlung erst nach erfolgreicher Probezeit." },
  { icon: UserCheck, title: "Vorgeprüfte Fachkräfte", desc: "Wir prüfen jedes Profil vorab — passende Handwerker statt Massenbewerbungen und No-Shows." },
  { icon: ShieldCheck, title: "Diskreter Prozess", desc: "Kein öffentliches Inserat. Ihre Suche bleibt intern, bis Sie einer Vorstellung zustimmen." },
  { icon: Clock, title: "Schnelle Besetzung", desc: "Durch unseren aktiven Kandidatenpool oft erste passende Profile in wenigen Tagen." },
];

const steps = [
  { icon: ClipboardList, title: "Bedarf melden", desc: "Sagen Sie uns, welche Fachkraft Sie suchen — in wenigen Minuten, ohne Inserat." },
  { icon: Users, title: "Kandidaten erhalten", desc: "Wir stellen Ihnen vorgeprüfte, passende Profile diskret vor." },
  { icon: BadgeEuro, title: "Nur bei Erfolg zahlen", desc: "Sie zahlen erst, wenn ein Kandidat anfängt und die Probezeit besteht." },
];

const fachkraefte = [
  "Elektriker / Elektroniker", "Anlagenmechaniker SHK", "Heizungsbauer",
  "Installateur / Klempner", "Maler & Lackierer", "Tischler / Schreiner",
  "Maurer / Betonbauer", "Dachdecker", "Metallbauer / Schlosser",
  "Fliesenleger", "Zimmerer", "Trockenbauer", "Stuckateur",
  "KFZ-Mechatroniker", "Gerüstbauer", "und viele mehr",
];

const faqs = [
  {
    q: "Was kostet mich die Vermittlung?",
    a: "Nichts im Voraus. Es fällt nur eine Gebühr an, wenn ein Kandidat erfolgreich bei Ihnen eingestellt wurde und die Probezeit besteht. Kein Erfolg, keine Kosten.",
  },
  {
    q: "Was passiert, wenn der Kandidat nicht bleibt?",
    a: "Tritt der Kandidat nach Vertragsunterzeichnung nicht an oder verlässt Ihren Betrieb während der Probezeit, erhalten Sie eine Rückerstattung. Sie tragen kein Risiko.",
  },
  {
    q: "Wie schnell erhalte ich Kandidaten?",
    a: "Dank unseres aktiven Kandidatenpools stellen wir Ihnen oft schon innerhalb weniger Tage erste passende Profile vor.",
  },
  {
    q: "Muss ich eine Stelle öffentlich ausschreiben?",
    a: "Nein. Ihre Suche bleibt komplett intern und diskret. Erst wenn Sie einer konkreten Vorstellung zustimmen, wird der Kontakt hergestellt.",
  },
];

export default function ArbeitgeberContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* ── Hero mit Lead-Formular ── */}
      <section className="relative bg-primary pt-28 pb-20 lg:pt-36 lg:pb-24 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(700px 500px at 85% 0%, rgba(232,168,56,0.16) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 mb-6"
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
              className="text-white font-bold leading-[1.05] mb-6"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.3rem, 4.6vw, 3.8rem)" }}
            >
              Finden Sie die besten
              <br />
              <span className="text-accent">Handwerker</span> für Ihren Betrieb
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="text-white/65 text-lg leading-relaxed mb-8 max-w-lg"
            >
              Elektriker, SHK-Spezialisten, Maler &amp; mehr — vorgeprüft und passgenau.
              Sie zahlen nur, wenn es klappt.
            </motion.p>
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col gap-3"
            >
              {["Nur bei Erfolg zahlen — keine Vorabkosten", "Vorgeprüfte Fachkräfte statt Bewerbungsflut", "Antwort innerhalb von 24 Stunden"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-white/85 text-[15px]">
                  <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-accent" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Formular */}
          <motion.div
            id="anfrage"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="scroll-mt-28"
          >
            <ArbeitgeberForm />
          </motion.div>
        </div>
      </section>

      {/* ── Kein Risiko ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden"
          >
            <Image
              src="/images/hero-team-werkstatt.jpg"
              alt="Zwei Handwerker in einer Werkstatt"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              style={{ objectPosition: "center 32%" }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-1.5 text-accent text-xs font-semibold uppercase tracking-wider mb-5">
              <ShieldCheck className="w-4 h-4" /> Kein Risiko
            </span>
            <h2 className="text-primary font-bold text-3xl md:text-4xl leading-tight mb-5" style={{ fontFamily: "var(--font-display)" }}>
              Sie zahlen nur, wenn es klappt
            </h2>
            <p className="text-muted text-lg leading-relaxed mb-6">
              Eine Gebühr fällt nur an, wenn ein Kandidat erfolgreich eingestellt wurde.
              Tritt er nicht an oder verlässt Ihren Betrieb während der Probezeit,
              erhalten Sie eine <span className="text-primary font-semibold">Rückerstattung</span>.
            </p>
            <a href="#anfrage" className="group inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all">
              Jetzt Fachkräfte anfragen
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Ihre Vorteile ── */}
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
            {vorteile.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title}
                  initial={{ y: 24, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white rounded-2xl border border-border p-6 hover:border-accent hover:shadow-[0_18px_40px_-24px_rgba(26,26,46,0.28)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--color-accent-soft)" }}>
                    <Icon className="w-6 h-6 text-accent" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-primary font-bold text-lg mb-2" style={{ fontFamily: "var(--font-display)" }}>{b.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{b.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── So läuft's ── */}
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
              So läuft&apos;s
            </span>
            <h2 className="text-primary font-bold text-4xl md:text-5xl leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              In drei Schritten zur Fachkraft
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
                  className="flex flex-col gap-5 p-8 rounded-2xl" style={{ background: "var(--color-surface)" }}
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

      {/* ── Welche Fachkräfte ── */}
      <section className="py-24" style={{ background: "var(--color-accent-soft)" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <motion.h2
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-primary font-bold text-4xl md:text-5xl leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welche Fachkräfte Sie bei uns finden
          </motion.h2>
          <p className="text-muted text-lg mb-10 max-w-2xl mx-auto">
            Qualifizierte Handwerker aus ganz Deutschland — über alle Gewerke hinweg.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {fachkraefte.map((g, i) => (
              <motion.a
                key={g}
                href="#anfrage"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 8) * 0.04 }}
                className="rounded-full bg-white border border-border px-5 py-2.5 text-primary text-sm font-medium hover:border-accent hover:bg-accent hover:text-primary transition-colors duration-200"
              >
                {g}
              </motion.a>
            ))}
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
            Häufige Fragen von Betrieben
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

      {/* ── Abschluss-CTA ── */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(232,168,56,0.10) 0%, transparent 65%)" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-white font-bold text-3xl md:text-4xl leading-tight mb-5" style={{ fontFamily: "var(--font-display)" }}>
            Bereit, Ihre Stelle zu besetzen?
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-xl mx-auto mb-9">
            Stellen Sie jetzt Ihre kostenlose, unverbindliche Anfrage — wir melden uns
            innerhalb von 24 Stunden mit passenden Fachkräften.
          </p>
          <a
            href="#anfrage"
            className="group inline-flex items-center gap-3 rounded-full bg-accent text-primary font-semibold px-8 py-4 hover:bg-amber-400 transition-colors duration-200"
          >
            Zum Anfrage-Formular
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </div>
      </section>
    </>
  );
}
