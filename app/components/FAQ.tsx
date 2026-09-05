"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

// Die häufigsten Zweifel, die Handwerker vom Anmelden abhalten — direkt beantwortet.
// Jede Antwort verstärkt bewusst eine Value Prop (kostenlos, diskret, Prämie, kein Aufwand).
const FAQS: { q: string; a: string }[] = [
  {
    q: "Ist das wirklich komplett kostenlos für mich?",
    a: "Ja — für dich kostet es keinen Cent, und das bleibt auch so. Bezahlt werden wir von den Betrieben, und auch die nur dann, wenn eine Vermittlung tatsächlich klappt.",
  },
  {
    q: "Erfährt mein jetziger Chef, dass ich mich umschaue?",
    a: "Nein. Dein Name und dein aktueller Betrieb bleiben komplett unsichtbar. Erst wenn du bei einem konkreten Angebot selbst grünes Licht gibst, wird dein Kontakt frei — und das entscheidest du für jeden Betrieb einzeln.",
  },
  {
    q: "Muss ich einen Lebenslauf oder ein Anschreiben schreiben?",
    a: "Nein. Du beantwortest ein paar einfache Fragen zu deinem Gewerk, deiner Erfahrung und deiner Region. Das dauert rund 3 Minuten — mehr brauchen wir nicht.",
  },
  {
    q: "Wann bekomme ich die 200 € Belohnung?",
    a: "Sobald du die Einführungsphase bestehst — also die ersten 8 Wochen im neuen Betrieb — überweisen wir dir 200 € direkt auf dein Konto. Kein Gutschein, kein Kleingedrucktes, einfach als Belohnung fürs Durchstarten.",
  },
  {
    q: "Bin ich zu irgendetwas verpflichtet?",
    a: "Überhaupt nicht. Du bekommst passende Angebote und sagst bei jedem einzeln Ja oder Nein. Kein Vertrag, keine Kosten, keine versteckten Haken.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-28 max-lg:py-16 bg-white" id="faq">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-5">
            <span className="w-8 h-[2px] bg-accent" />
            Ehrliche Antworten
          </span>
          <h2
            className="text-primary font-bold text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Was du dich vielleicht fragst
          </h2>
        </motion.div>

        <div className="flex flex-col">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={faq.q}
                className="border-t border-border last:border-b"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 py-6 text-left group"
                >
                  <span
                    className={`text-lg font-semibold transition-colors duration-200 ${
                      isOpen ? "text-primary" : "text-primary/80 group-hover:text-primary"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <span
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center transition-colors duration-200"
                    style={{
                      background: isOpen ? "var(--color-accent)" : "var(--color-accent-soft)",
                    }}
                  >
                    <Plus
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isOpen ? "rotate-45 text-primary" : "text-accent"
                      }`}
                      strokeWidth={2.5}
                    />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-muted text-base leading-relaxed pb-6 max-w-2xl">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Sanfter Abschluss-CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <Link
            href="/registrieren"
            className="group inline-flex items-center gap-3 bg-primary text-white font-semibold px-7 py-3.5 text-base hover:bg-accent hover:text-primary transition-colors duration-200"
          >
            Jetzt kostenlos anmelden
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <span className="text-muted text-sm">
            Noch eine Frage offen? Schreib uns einfach — wir antworten persönlich.
          </span>
        </motion.div>
      </div>
    </section>
  );
}
