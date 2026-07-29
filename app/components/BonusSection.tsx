"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Banknote } from "lucide-react";
import Link from "next/link";

export default function BonusSection() {
  return (
    <section className="py-28 overflow-hidden" style={{ background: "var(--color-accent-soft)" }} id="praemie">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — giant number */}
          <motion.div
            initial={{ y: 40 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-8">
              <span className="w-8 h-[2px] bg-accent" />
              Deine Belohnung
            </span>

            <div className="relative select-none mb-6 -ml-1 lg:-ml-3">
              {/* Shadow layer */}
              <span
                className="absolute font-black text-primary/[0.06] leading-none"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(6.5rem, 17vw, 12rem)",
                  top: "6px",
                  left: "6px",
                }}
              >
                200€
              </span>
              {/* Main text */}
              <span
                className="relative font-black text-accent leading-none"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(6.5rem, 17vw, 12rem)",
                }}
              >
                200€
              </span>
            </div>

            <p className="text-primary/55 text-lg leading-relaxed max-w-sm mb-6">
              Bestehst du die <span className="text-primary font-semibold">Einführungsphase (8 Wochen)</span>{" "}
              im neuen Betrieb, zahlen wir dir 200 € direkt aufs Konto — als Belohnung.
              Kein Gutschein, kein Kleingedrucktes.
            </p>
            {/* Social proof */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["#1A1A2E","#2D2D44","#3D3D58"].map((bg, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-amber-50 flex items-center justify-center" style={{ background: bg }}>
                    <span className="text-accent text-[8px] font-bold">{["KM","SR","AP"][i]}</span>
                  </div>
                ))}
              </div>
              <p className="text-primary/50 text-sm">
                <span className="font-semibold text-primary/80">340+</span> Fachkräfte haben ihre Prämie bereits erhalten
              </p>
            </div>
          </motion.div>

          {/* Right — details */}
          <motion.div
            initial={{ y: 40 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-8"
          >
            <div>
              <h2
                className="text-primary font-bold text-3xl md:text-4xl leading-tight mb-5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Einführungsphase bestehen —
                <br />
                200 € Belohnung
              </h2>
              <p className="text-muted text-base leading-relaxed">
                Ein neuer Job erfordert Mut — gerade im Handwerk, wo man dem
                eigenen Betrieb oft lange die Treue hält. Wer über PortaWerk startet
                und die ersten 8 Wochen durchzieht, bekommt von uns 200 € als Belohnung.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: CalendarDays,
                  title: "Einführungsphase bestehen (8 Wochen)",
                  desc: "Sobald dein Arbeitgeber die ersten 8 Wochen bestätigt, wird deine 200 €-Belohnung automatisch ausgelöst.",
                },
                {
                  icon: Banknote,
                  title: "Direkte Banküberweisung",
                  desc: "200€ auf das Konto, das du bei der Registrierung angibst. Keine Abzüge, keine Tricks.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex gap-4 p-5 bg-white border border-border/60"
                  >
                    <div className="w-10 h-10 bg-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-accent" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-primary text-sm font-semibold mb-1">
                        {item.title}
                      </p>
                      <p className="text-muted text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/registrieren"
              className="group self-start inline-flex items-center gap-3 bg-primary text-white font-semibold px-8 py-4 hover:bg-primary/90 transition-colors duration-200"
            >
              Jetzt bewerben
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
