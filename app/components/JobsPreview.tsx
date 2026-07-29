"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Zap,
  Wrench,
  PaintBucket,
  ArrowRight,
  EyeOff,
  Search,
  Check,
} from "lucide-react";
import Link from "next/link";

const jobs = [
  {
    title: "Elektriker / Elektroniker",
    icon: Zap,
    category: "Elektro & Energietechnik",
    city: "München",
    schedule: "Vollzeit",
    pay: "3.000 – 3.800 €",
    perks: ["Unbefristet", "Firmenwagen"],
    tag: "Stark gefragt",
  },
  {
    title: "Anlagenmechaniker SHK",
    icon: Wrench,
    category: "Sanitär · Heizung · Klima",
    city: "Hamburg",
    schedule: "Vollzeit",
    pay: "2.900 – 3.600 €",
    perks: ["Weiterbildung", "30 Tage Urlaub"],
    tag: "Neu",
  },
  {
    title: "Maler & Lackierer",
    icon: PaintBucket,
    category: "Ausbau & Oberfläche",
    city: "Berlin",
    schedule: "Voll- oder Teilzeit",
    pay: "2.600 – 3.200 €",
    perks: ["Gutes Team", "Flexible Zeiten"],
    tag: "Neu",
  },
];

// Alle abgedeckten Gewerke — als Tag-Wolke
const allRoles = [
  "Elektriker / Elektroniker",
  "Elektroniker Energietechnik",
  "Anlagenmechaniker SHK",
  "Installateur / Klempner",
  "Heizungsbauer",
  "Maler & Lackierer",
  "Tischler / Schreiner",
  "Zimmerer",
  "Maurer",
  "Betonbauer",
  "Dachdecker",
  "Fliesenleger",
  "Metallbauer / Schlosser",
  "KFZ-Mechatroniker",
  "Trockenbauer",
  "Stuckateur",
  "Gerüstbauer",
  "Estrichleger",
  "Garten- & Landschaftsbau",
  "Bodenleger",
  "Feinwerkmechaniker",
  "Bauhelfer",
];

export default function JobsPreview() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filteredRoles = q
    ? allRoles.filter((role) => role.toLowerCase().includes(q))
    : allRoles;

  return (
    <section className="py-28 bg-surface" id="stellen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ y: 30 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 max-w-2xl"
        >
          <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-5">
            <span className="w-8 h-[2px] bg-accent" />
            Offene Stellen
          </span>
          <h2
            className="text-primary font-bold leading-tight text-4xl md:text-5xl mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Jobs, die auf dich warten
          </h2>
          <p className="text-muted text-lg leading-relaxed">
            Ein Vorgeschmack auf das, was im Handwerk gerade gesucht wird. Registrier
            dich kostenlos — dann melden sich die passenden Betriebe{" "}
            <span className="text-primary font-medium">direkt bei dir</span>.
          </p>
        </motion.div>

        {/* Job Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {jobs.map((job, i) => {
            const Icon = job.icon;
            return (
              <motion.article
                key={job.title}
                initial={{ y: 48, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group bg-white border border-border hover:border-accent hover:shadow-[0_22px_44px_-18px_rgba(26,26,46,0.22)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Gold-Akzent oben */}
                <div className="h-1 w-full bg-accent" />

                <div className="p-6 flex flex-col gap-5 flex-1">
                  {/* Icon-Kachel + Tag */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--color-accent-soft)" }}
                    >
                      <Icon className="w-6 h-6 text-accent" strokeWidth={1.75} />
                    </div>
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider text-accent px-2.5 py-1"
                      style={{ background: "var(--color-accent-soft)" }}
                    >
                      {job.tag}
                    </span>
                  </div>

                  {/* Titel + Kategorie */}
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-1.5">
                      {job.category}
                    </p>
                    <h3
                      className="text-primary font-bold text-xl leading-snug"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {job.title}
                    </h3>
                  </div>

                  {/* Ort + Zeit */}
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    <span className="inline-flex items-center gap-2 text-primary/80 text-sm">
                      <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                      {job.city}
                    </span>
                    <span className="inline-flex items-center gap-2 text-primary/80 text-sm">
                      <Clock className="w-4 h-4 text-accent flex-shrink-0" />
                      {job.schedule}
                    </span>
                  </div>

                  {/* Gehalt — sichtbar als Hook */}
                  <div className="p-4" style={{ background: "var(--color-surface)" }}>
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-1">
                      Monatsgehalt (Brutto)
                    </p>
                    <p
                      className="text-2xl font-bold text-primary"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {job.pay}
                    </p>
                  </div>

                  {/* Perks */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {job.perks.map((perk) => (
                      <span
                        key={perk}
                        className="inline-flex items-center gap-1.5 text-xs text-primary/70 border border-border px-2.5 py-1"
                      >
                        <Check className="w-3 h-3 text-accent flex-shrink-0" strokeWidth={3} />
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer-CTA */}
                <Link
                  href="/registrieren"
                  className="flex items-center justify-between px-6 py-4 bg-primary text-white text-sm font-semibold group-hover:bg-accent group-hover:text-primary transition-colors duration-300"
                >
                  <span>Registrieren &amp; matchen lassen</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </motion.article>
            );
          })}
        </div>

        {/* Diskret-Hinweis (ruhig, klar) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-2.5 mb-14 text-muted text-sm text-center"
        >
          <EyeOff className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={2} />
          <span>
            Diskret: Der Betrieb sieht deinen Namen erst, wenn{" "}
            <span className="text-primary font-medium">du zustimmst</span>.
          </span>
        </motion.div>

        {/* Such deinen Traumberuf — mit Live-Suche */}
        <motion.div
          initial={{ y: 24 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="border border-border bg-white p-6 sm:p-8 mb-10"
        >
          <div className="mb-6 max-w-xl">
            <h3
              className="text-primary font-bold text-2xl sm:text-3xl mb-2 leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Such deinen Traumberuf
            </h3>
            <p className="text-muted text-sm sm:text-base">
              Über 40 Gewerke im Handwerk — tipp deinen Beruf ein und schau, ob wir
              die passende Stelle für dich haben.
            </p>
          </div>

          {/* Suchfeld */}
          <div className="relative mb-6 max-w-xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted pointer-events-none"
              strokeWidth={2}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Gewerk oder Beruf eingeben, z. B. Elektriker …"
              aria-label="Gewerk oder Beruf suchen"
              className="w-full pl-11 pr-10 py-3.5 text-sm sm:text-base text-primary border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 transition-colors"
              style={{ background: "var(--color-surface)" }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Suche zurücksetzen"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary text-lg leading-none px-1"
              >
                ×
              </button>
            )}
          </div>

          {/* Ergebnisse */}
          {filteredRoles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filteredRoles.map((role) => (
                <Link
                  key={role}
                  href={`/registrieren?gewerk=${encodeURIComponent(role)}`}
                  className="group inline-flex items-center gap-1.5 text-xs sm:text-sm text-primary/70 border border-border px-3 py-1.5 hover:border-accent hover:text-primary transition-colors duration-200"
                >
                  {role}
                  <ArrowRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 text-accent transition-all duration-200" />
                </Link>
              ))}
              {!q && (
                <Link
                  href="/registrieren"
                  className="group inline-flex items-center gap-1.5 text-xs sm:text-sm text-accent border border-accent/40 px-3 py-1.5 font-medium hover:bg-accent hover:text-primary hover:border-accent transition-colors duration-200"
                >
                  + viele weitere
                  <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-1">
              <p className="text-muted text-sm">
                Kein Treffer für{" "}
                <span className="text-primary font-medium">{query}</span> — aber wir
                vermitteln in{" "}
                <span className="text-primary font-medium">allen Handwerksberufen</span>.
              </p>
              <Link
                href="/registrieren"
                className="group inline-flex items-center gap-2 text-accent text-sm font-semibold hover:gap-3 transition-all duration-200 whitespace-nowrap"
              >
                Trotzdem registrieren
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ y: 20 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <p className="text-muted text-sm">
            Weitere Stellen sind nach Registrierung einsehbar.
          </p>
          <Link
            href="/registrieren"
            className="group inline-flex items-center gap-2 text-accent text-sm font-semibold hover:gap-3 transition-all duration-200"
          >
            Alle Stellen ansehen
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
