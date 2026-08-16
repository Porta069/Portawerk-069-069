"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  LogIn,
  BadgeEuro,
  UserCheck,
  ShieldCheck,
  Clock,
  ClipboardList,
  Users,
  Check,
  Plus,
  Search,
  ChevronDown,
} from "lucide-react";
import ArbeitgeberForm from "./ArbeitgeberForm";

const vorteile = [
  { icon: BadgeEuro, title: "Nur bei Erfolg zahlen", desc: "Keine Vorabkosten — Zahlung erst nach der Probezeit." },
  { icon: UserCheck, title: "Vorgeprüfte Fachkräfte", desc: "Geprüfte Profile statt Bewerbungsflut." },
  { icon: ShieldCheck, title: "Diskreter Prozess", desc: "Ihre Suche bleibt intern — kein Inserat." },
  { icon: Clock, title: "Schnelle Besetzung", desc: "Erste passende Profile oft in wenigen Tagen." },
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

// Beliebte Fachkräfte als Foto-Kacheln (value = exakte Select-Option im Formular).
const popularTiles = [
  { label: "Elektriker", value: "Elektriker / Elektroniker", img: "/images/elektriker-werkstatt.jpg", alt: "Elektriker bei der Arbeit" },
  { label: "Heizung & Sanitär", value: "Anlagenmechaniker SHK", img: "/images/shk-heizung.jpg", alt: "Monteur montiert einen Heizkörper" },
  { label: "Tischler", value: "Tischler / Schreiner", img: "/images/tischler-hobel.jpg", alt: "Tischler am Werkstück" },
  { label: "Maler", value: "Maler & Lackierer", img: "/images/maler-leiter.jpg", alt: "Maler auf der Leiter" },
  { label: "Metallbauer", value: "Metallbauer / Schlosser", img: "/images/metallbau-schweisser.jpg", alt: "Metallbauer beim Schweißen" },
  { label: "Maurer", value: "Maurer / Betonbauer", img: "/images/maurer-ziegel.jpg", alt: "Maurer setzt einen Ziegel" },
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
  const [fachQuery, setFachQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedFach, setSelectedFach] = useState("");
  const [shimmerSignal, setShimmerSignal] = useState(0);

  const gewerkeOptions = fachkraefte.filter((g) => g !== "und viele mehr");
  const fq = fachQuery.trim().toLowerCase();
  const matches = fq ? gewerkeOptions.filter((g) => g.toLowerCase().includes(fq)) : [];

  const scrollToForm = () =>
    document.getElementById("anfrage")?.scrollIntoView({ behavior: "smooth", block: "center" });

  const selectFach = (value: string) => {
    setSelectedFach(value);
    setShimmerSignal((n) => n + 1);
    scrollToForm();
  };

  const handleFachSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = fachQuery.trim().toLowerCase();
    const match = term ? gewerkeOptions.find((g) => g.toLowerCase().includes(term)) : null;
    if (match) selectFach(match);
    else scrollToForm();
  };

  return (
    <>
      {/* ── Hero mit Lead-Formular ── */}
      <section className="relative bg-primary pt-28 pb-20 lg:pt-36 lg:pb-24 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(700px 500px at 85% 0%, rgba(249, 173, 7,0.16) 0%, transparent 60%)",
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

            {/* Einstieg für bestehende Kunden — sonst finden Betriebe ihren
                Zugang nur über den Textlink in der Kopfleiste. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2"
            >
              <span className="text-white/50 text-[15px]">Sie haben bereits einen Zugang?</span>
              <Link
                href="/unternehmen/login"
                className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold transition-all duration-200"
                style={{ border: "1.5px solid rgba(255,255,255,0.28)", color: "white" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F9AD07";
                  e.currentTarget.style.borderColor = "#F9AD07";
                  e.currentTarget.style.color = "#0C3330";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
                  e.currentTarget.style.color = "white";
                }}
              >
                <LogIn className="w-4 h-4" />
                Zum Betriebs-Login
              </Link>
            </motion.div>

            {/* Freigestellte Person, die aufs Formular zeigt — verschmilzt mit dem Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block relative mt-6 w-[68%]"
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 55% 45%, rgba(249, 173, 7,0.20) 0%, transparent 62%)" }}
              />
              <Image
                src="/images/arbeitgeber-chef.png"
                alt="Handwerker zeigt auf das Anfrage-Formular"
                width={499}
                height={488}
                className="relative w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
              />
            </motion.div>
          </div>

          {/* Formular */}
          <motion.div
            id="anfrage"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="scroll-mt-28"
          >
            <ArbeitgeberForm
              options={gewerkeOptions}
              presetFachkraft={selectedFach}
              shimmerSignal={shimmerSignal}
            />
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

      {/* ── Welche Fachkräfte — im Stil der Handwerker-Suche ── */}
      <section className="py-24" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white border border-border rounded-2xl shadow-[0_24px_60px_-30px_rgba(12, 51, 48,0.3)] overflow-hidden"
          >
            <div className="h-1 w-full bg-accent" />
            <div className="px-6 sm:px-10 lg:px-14 py-12">
              <div className="text-center max-w-xl mx-auto mb-8">
                <h2 className="text-primary font-bold text-3xl sm:text-4xl mb-3 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                  Welche Fachkräfte Sie finden
                </h2>
                <p className="text-muted text-base">
                  Wählen Sie unten aus oder suchen Sie direkt — Ihre Auswahl landet
                  gleich im Anfrage-Formular.
                </p>
              </div>

              {/* Suchleiste + Button */}
              <form
                onSubmit={handleFachSearch}
                className="flex items-stretch max-w-2xl mx-auto border border-border bg-white transition-shadow focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25 shadow-[0_12px_28px_-18px_rgba(12, 51, 48,0.4)]"
              >
                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-5 w-5 h-5 text-muted pointer-events-none" strokeWidth={2} />
                  <input
                    type="text"
                    value={fachQuery}
                    onChange={(e) => setFachQuery(e.target.value)}
                    placeholder="Gewerk oder Beruf, z. B. Elektriker …"
                    aria-label="Fachkraft suchen"
                    className="w-full h-14 sm:h-16 pl-14 pr-4 text-base text-primary bg-transparent focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="shrink-0 h-14 sm:h-16 px-6 sm:px-9 bg-accent text-primary font-semibold text-base hover:bg-amber-400 transition-colors inline-flex items-center gap-2"
                >
                  <Search className="w-[18px] h-[18px] sm:hidden" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Suchen</span>
                </button>
              </form>

              {/* Ergebnisse / Kacheln */}
              <div className="mt-9">
                {fq ? (
                  matches.length > 0 ? (
                    <div className="max-w-3xl mx-auto">
                      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted mb-5">
                        {matches.length} Treffer
                      </p>
                      <div className="flex flex-wrap justify-center gap-2.5">
                        {matches.map((g) => (
                          <button
                            type="button"
                            key={g}
                            onClick={() => selectFach(g)}
                            className="group inline-flex items-center gap-2 text-sm text-primary/80 border border-border rounded-full px-4 py-2.5 hover:border-accent hover:bg-accent hover:text-primary transition-colors duration-200"
                          >
                            {g}
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-1.5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-muted text-base mb-4">
                        Kein Treffer für{" "}
                        <span className="text-primary font-medium">{fachQuery}</span> —
                        wir vermitteln in allen Gewerken.
                      </p>
                      <button
                        type="button"
                        onClick={scrollToForm}
                        className="group inline-flex items-center gap-2 rounded-full bg-primary text-white text-sm font-semibold px-6 py-3 hover:bg-accent hover:text-primary transition-colors duration-200"
                      >
                        Trotzdem anfragen
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )
                ) : showAll ? (
                  <div>
                    <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
                      {gewerkeOptions.map((g) => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => selectFach(g)}
                          className="group inline-flex items-center gap-2 text-sm text-primary/80 border border-border rounded-full px-4 py-2.5 hover:border-accent hover:bg-accent hover:text-primary transition-colors duration-200"
                        >
                          {g}
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-1.5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                        </button>
                      ))}
                    </div>
                    <div className="text-center mt-7">
                      <button
                        type="button"
                        onClick={() => setShowAll(false)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-amber-600 transition-colors"
                      >
                        Weniger anzeigen
                        <ChevronDown className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted mb-5">
                      Beliebte Fachkräfte
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {popularTiles.map((t) => (
                        <button
                          type="button"
                          key={t.value}
                          onClick={() => selectFach(t.value)}
                          aria-label={`${t.label} auswählen`}
                          className="group relative aspect-square overflow-hidden rounded-2xl bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                        >
                          <Image
                            src={t.img}
                            alt={t.alt}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                          />
                          <div
                            className="absolute inset-0"
                            style={{ background: "linear-gradient(to top, rgba(20,20,32,0.88) 0%, rgba(20,20,32,0.15) 55%, transparent 100%)" }}
                          />
                          <span className="absolute inset-x-0 bottom-0 p-2.5 text-left text-white text-xs sm:text-sm font-semibold leading-tight">
                            {t.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="text-center mt-7">
                      <button
                        type="button"
                        onClick={() => setShowAll(true)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-amber-600 transition-colors"
                      >
                        Alle Fachkräfte anzeigen
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
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
          <div className="grid sm:grid-cols-2 gap-6">
            {vorteile.map((b, i) => {
              const Icon = b.icon;
              return (
                // Framer aussen (Einblendung), Hover-CSS innen — sonst schreiben
                // beide gleichzeitig transform und die Karte ruckelt beim Laden.
                <motion.div
                  key={b.title}
                  initial={{ y: 24, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="group h-full bg-white rounded-3xl border border-border p-8 md:p-10 flex items-start gap-6 hover:border-accent hover:shadow-[0_26px_54px_-28px_rgba(12, 51, 48,0.38)] hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-300 ease-out">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: "var(--color-accent-soft)" }}
                    >
                      <Icon className="w-8 h-8 text-accent" strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3 className="text-primary font-bold text-2xl mb-2 leading-tight" style={{ fontFamily: "var(--font-display)" }}>{b.title}</h3>
                      <p className="text-muted text-base md:text-lg leading-relaxed">{b.desc}</p>
                    </div>
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
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(249, 173, 7,0.10) 0%, transparent 65%)" }} />
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
