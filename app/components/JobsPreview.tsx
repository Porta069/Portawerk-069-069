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
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

// Beliebteste Gewerke — standardmäßig als schnelle Auswahl (aufgeräumt).
const popularRoles = [
  "Elektriker / Elektroniker",
  "Anlagenmechaniker SHK",
  "Maler & Lackierer",
  "Tischler / Schreiner",
  "Maurer",
  "Dachdecker",
];

// Alle Gewerke — nach Fachbereich gruppiert (übersichtliche Spalten-Ansicht).
const gewerkeGruppen = [
  {
    category: "Elektro & Energietechnik",
    roles: ["Elektriker / Elektroniker", "Elektroniker Energietechnik"],
  },
  {
    category: "Sanitär · Heizung · Klima",
    roles: ["Anlagenmechaniker SHK", "Installateur / Klempner", "Heizungsbauer"],
  },
  {
    category: "Holz & Ausbau",
    roles: ["Tischler / Schreiner", "Zimmerer", "Trockenbauer", "Bodenleger"],
  },
  {
    category: "Maler & Oberfläche",
    roles: ["Maler & Lackierer", "Stuckateur", "Fliesenleger", "Estrichleger"],
  },
  {
    category: "Rohbau & Außen",
    roles: [
      "Maurer",
      "Betonbauer",
      "Dachdecker",
      "Gerüstbauer",
      "Garten- & Landschaftsbau",
      "Bauhelfer",
    ],
  },
  {
    category: "Metall & Mechanik",
    roles: ["Metallbauer / Schlosser", "Feinwerkmechaniker", "KFZ-Mechatroniker"],
  },
];

// Flache Gesamtliste (für die Suche) — abgeleitet, damit nichts auseinanderläuft.
const allRoles = gewerkeGruppen.flatMap((g) => g.roles);

export default function JobsPreview() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const q = query.trim().toLowerCase();

  const matches = q ? allRoles.filter((role) => role.toLowerCase().includes(q)) : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) {
      router.push("/registrieren");
      return;
    }
    const match = allRoles.find((r) => r.toLowerCase().includes(term.toLowerCase()));
    router.push(
      match ? `/registrieren?gewerk=${encodeURIComponent(match)}` : "/registrieren",
    );
  };

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

        {/* Such deinen Traumberuf — aufgeräumte, professionelle Suche */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white border border-border shadow-[0_24px_60px_-30px_rgba(26,26,46,0.3)] mb-10"
        >
          {/* Gold-Akzent oben (Konsistenz zu den Job-Karten) */}
          <div className="h-1 w-full bg-accent" />

          <div className="px-6 sm:px-10 lg:px-14 py-12">
            {/* Überschrift, zentriert */}
            <div className="text-center max-w-xl mx-auto mb-8">
              <h3
                className="text-primary font-bold text-3xl sm:text-4xl mb-3 leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Such deinen Traumberuf
              </h3>
              <p className="text-muted text-base">
                Über 40 Gewerke im Handwerk — tipp deinen Beruf ein und finde deine Stelle.
              </p>
            </div>

            {/* Hochwertige Suchleiste mit Button */}
            <form
              onSubmit={handleSearch}
              className="flex items-stretch max-w-2xl mx-auto border border-border bg-white transition-shadow focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25 shadow-[0_12px_28px_-18px_rgba(26,26,46,0.4)]"
            >
              <div className="relative flex-1 flex items-center">
                <Search
                  className="absolute left-5 w-5 h-5 text-muted pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Gewerk oder Beruf, z. B. Elektriker …"
                  aria-label="Gewerk oder Beruf suchen"
                  className="w-full h-14 sm:h-16 pl-14 pr-9 text-base text-primary bg-transparent focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Suche zurücksetzen"
                    className="absolute right-3 text-muted hover:text-primary text-xl leading-none px-1"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="shrink-0 h-14 sm:h-16 px-6 sm:px-9 bg-accent text-primary font-semibold text-base hover:bg-amber-400 transition-colors inline-flex items-center gap-2"
              >
                <Search className="w-[18px] h-[18px] sm:hidden" strokeWidth={2.5} />
                <span className="hidden sm:inline">Suchen</span>
              </button>
            </form>

            {/* Ergebnisse / Gewerke */}
            <div className="mt-9">
              {q ? (
                // ── Suche aktiv: Treffer als Chips ──
                matches.length > 0 ? (
                  <div className="max-w-3xl mx-auto">
                    <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted mb-5">
                      {matches.length} Treffer
                    </p>
                    <div className="flex flex-wrap justify-center gap-2.5">
                      {matches.map((role) => (
                        <Link
                          key={role}
                          href={`/registrieren?gewerk=${encodeURIComponent(role)}`}
                          className="group inline-flex items-center gap-2 text-sm text-primary/80 border border-border px-4 py-2.5 hover:border-accent hover:bg-accent hover:text-primary transition-colors duration-200"
                        >
                          {role}
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-1.5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-muted text-base mb-4">
                      Kein Treffer für{" "}
                      <span className="text-primary font-medium">{query}</span> — aber
                      keine Sorge, wir vermitteln in{" "}
                      <span className="text-primary font-medium">
                        allen Handwerksberufen
                      </span>
                      .
                    </p>
                    <Link
                      href="/registrieren"
                      className="group inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 hover:bg-accent hover:text-primary transition-colors duration-200"
                    >
                      Trotzdem kostenlos registrieren
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )
              ) : showAll ? (
                // ── Alle Gewerke: nach Fachbereich in Spalten gelistet ──
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-9 max-w-4xl mx-auto text-left">
                    {gewerkeGruppen.map((group) => (
                      <div key={group.category}>
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                          <span className="w-1.5 h-1.5 bg-accent flex-shrink-0" />
                          <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                            {group.category}
                          </h4>
                        </div>
                        <ul className="flex flex-col gap-2">
                          {group.roles.map((role) => (
                            <li key={role}>
                              <Link
                                href={`/registrieren?gewerk=${encodeURIComponent(role)}`}
                                className="group inline-flex items-center gap-1.5 text-sm text-primary/75 hover:text-accent transition-colors duration-200"
                              >
                                {role}
                                <ArrowRight className="w-3 h-3 opacity-0 -ml-1.5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-10">
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
                // ── Standard: beliebte Gewerke als Chips ──
                <div className="max-w-3xl mx-auto">
                  <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted mb-5">
                    Beliebte Gewerke
                  </p>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {popularRoles.map((role) => (
                      <Link
                        key={role}
                        href={`/registrieren?gewerk=${encodeURIComponent(role)}`}
                        className="group inline-flex items-center gap-2 text-sm text-primary/80 border border-border px-4 py-2.5 hover:border-accent hover:bg-accent hover:text-primary transition-colors duration-200"
                      >
                        {role}
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-1.5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                      </Link>
                    ))}
                  </div>
                  <div className="text-center mt-7">
                    <button
                      type="button"
                      onClick={() => setShowAll(true)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-amber-600 transition-colors"
                    >
                      Alle 40+ Gewerke anzeigen
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
