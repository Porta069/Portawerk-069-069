"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  MapPin,
  Clock,
  Zap,
  Wrench,
  PaintBucket,
  ArrowRight,
  EyeOff,
  Search,
} from "lucide-react";
import Link from "next/link";

const jobs = [
  {
    title: "Elektriker / Elektroniker",
    icon: Zap,
    category: "Elektro & Energietechnik",
    city: "München",
    schedule: "Vollzeit",
    payDisplay: "3.000 – 3.800 €",
  },
  {
    title: "Anlagenmechaniker SHK",
    icon: Wrench,
    category: "Sanitär · Heizung · Klima",
    city: "Hamburg",
    schedule: "Vollzeit",
    payDisplay: "2.900 – 3.600 €",
  },
  {
    title: "Maler & Lackierer (m/w/d)",
    icon: PaintBucket,
    category: "Ausbau & Oberfläche",
    city: "Berlin",
    schedule: "Voll- oder Teilzeit",
    payDisplay: "2.600 – 3.200 €",
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

function RedactedBar({ width = "60%" }: { width?: string }) {
  return (
    <span
      className="inline-block h-3 rounded-sm bg-gradient-to-r from-muted/25 to-muted/15"
      style={{ width }}
    />
  );
}

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
          className="mb-16"
        >
          <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-5">
            <span className="w-8 h-[2px] bg-accent" />
            Aktuelle Stellen
          </span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2
                className="text-primary font-bold leading-tight text-4xl md:text-5xl mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Für alle Gewerke
                <br />
                im Handwerk
              </h2>
              <p className="text-muted text-base">
                Elektrik, SHK, Ausbau, Bau, Metall — und alles dazwischen.
              </p>
            </div>
            <div className="flex items-center gap-2.5 border border-border bg-white px-4 py-3 self-start md:self-auto">
              <EyeOff className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={2} />
              <p className="text-primary/70 text-sm">
                Kein Betrieb sieht deine
                <br className="hidden sm:block" />
                Daten ohne dein OK
              </p>
            </div>
          </div>
        </motion.div>

        {/* Job Cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {jobs.map((job, i) => {
            const Icon = job.icon;
            return (
              <motion.div
                key={job.title}
                initial={{ y: 48 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group bg-white border border-border hover:border-accent/40 transition-colors duration-300 overflow-hidden flex flex-col"
              >
                <div
                  className="px-5 py-4 flex items-center justify-between border-b border-border"
                  style={{ background: "var(--color-accent-soft)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-accent flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted uppercase tracking-wider">
                        {job.category}
                      </p>
                      <h3
                        className="text-primary font-semibold text-base leading-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {job.title}
                      </h3>
                    </div>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-muted/50 flex-shrink-0" />
                </div>

                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-primary text-sm font-medium">{job.city}</span>
                      <RedactedBar width="55%" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span className="text-muted text-sm">{job.schedule}</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-border">
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-2">
                      Monatsgehalt (Brutto)
                    </p>
                    <div className="flex items-center gap-3">
                      <span
                        className="font-bold text-xl text-primary select-none"
                        style={{ fontFamily: "var(--font-display)", filter: "blur(7px)" }}
                      >
                        {job.payDisplay}
                      </span>
                      <Lock className="w-3 h-3 text-muted/40" />
                    </div>
                  </div>
                </div>

                <Link
                  href="/registrieren"
                  className="flex items-center justify-between px-5 py-3.5 bg-primary text-white text-sm font-medium group-hover:bg-accent group-hover:text-primary transition-colors duration-300"
                >
                  <span>Jetzt registrieren</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>

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
