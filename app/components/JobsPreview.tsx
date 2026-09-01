"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  ArrowRight,
  EyeOff,
  Search,
  Check,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const jobs = [
  {
    title: "Elektriker / Elektroniker",
    gewerk: "elektrotechnik",
    img: "/images/elektriker-werkstatt.jpg",
    category: "Elektro & Energietechnik",
    city: "München",
    schedule: "Vollzeit",
    pay: "3.000 – 3.800 €",
    perks: ["Unbefristet", "Firmenwagen"],
    tag: "Stark gefragt",
  },
  {
    title: "Anlagenmechaniker SHK",
    gewerk: "shk",
    img: "/images/shk-heizung.jpg",
    category: "Sanitär · Heizung · Klima",
    city: "Hamburg",
    schedule: "Vollzeit",
    pay: "2.900 – 3.600 €",
    perks: ["Weiterbildung", "30 Tage Urlaub"],
    tag: "Neu",
  },
  {
    title: "Maler & Lackierer",
    gewerk: "maler_lackierer",
    img: "/images/maler-leiter.jpg",
    category: "Ausbau & Oberfläche",
    city: "Berlin",
    schedule: "Voll- oder Teilzeit",
    pay: "2.600 – 3.200 €",
    perks: ["Gutes Team", "Flexible Zeiten"],
    tag: "Neu",
  },
];

// Beliebteste Gewerke — mit echtem Foto (kompakte Kachel), gewerk = exakter
// Katalogwert des Anmelde-Funnels für die Vorbelegung.
const popularTrades = [
  {
    label: "Elektriker",
    gewerk: "elektrotechnik",
    img: "/images/elektriker-werkstatt.jpg",
    alt: "Elektriker bei der Arbeit in der Werkstatt",
  },
  {
    label: "Heizung & Sanitär",
    gewerk: "shk",
    img: "/images/shk-heizung.jpg",
    alt: "Monteur montiert einen Heizkörper",
  },
  {
    label: "Tischler",
    gewerk: "innenausbau",
    img: "/images/tischler-hobel.jpg",
    alt: "Tischler bearbeitet Holz mit dem Handhobel",
  },
  {
    label: "Maler",
    gewerk: "maler_lackierer",
    img: "/images/maler-leiter.jpg",
    alt: "Maler streicht eine Wand von der Leiter",
  },
  {
    label: "Metallbauer",
    gewerk: "metallbau",
    img: "/images/metallbau-schweisser.jpg",
    alt: "Metallbauer beim Schweißen",
  },
  {
    label: "Maurer",
    gewerk: "bauwerkserhaltung",
    img: "/images/maurer-ziegel.jpg",
    alt: "Maurer setzt einen Ziegel mit der Kelle",
  },
];

// Alle Gewerke — nach Fachbereich gruppiert (übersichtliche Spalten-Ansicht).
//
// WICHTIG: `gewerk` muss exakt einem Katalogwert des Anmelde-Funnels entsprechen
// (`elektrotechnik`, `shk`, …) — der Schritt „Ausbildung" gleicht den Wert gegen
// den Katalog ab und ignoriert alles Unbekannte still.
//
// Hier standen bis zuletzt die Anzeigenamen der alten Liste ("Elektriker /
// Elektroniker"). Die kennt der neue Funnel nicht, also ist jede Vorbelegung
// von der Startseite ins Leere gelaufen — der Besucher landete auf Schritt 1
// und musste sein Gewerk noch einmal suchen.
//
// `null` heisst bewusst „keine Vorbelegung": Fuer diese Berufe gibt es im
// Katalog kein passendes Gewerk. Sie bleiben auffindbar, der Nutzer waehlt im
// Funnel dann selbst.
interface Role {
  /** Was der Nutzer liest. */
  label: string;
  /** Katalogwert für die Vorbelegung im Funnel — `null` = keine. */
  gewerk: string | null;
  /** Weitere Suchbegriffe, unter denen dieser Beruf gefunden werden soll. */
  synonyms?: string[];
}

const gewerkeGruppen: { category: string; roles: Role[] }[] = [
  {
    category: "Elektro & Energietechnik",
    roles: [
      { label: "Elektriker / Elektroniker", gewerk: "elektrotechnik", synonyms: ["elektro", "elektrik"] },
      { label: "Elektroniker Energietechnik", gewerk: "elektrotechnik", synonyms: ["energie"] },
    ],
  },
  {
    category: "Sanitär · Heizung · Klima",
    roles: [
      { label: "Anlagenmechaniker SHK", gewerk: "shk", synonyms: ["shk", "sanitär"] },
      { label: "Installateur / Klempner", gewerk: "shk", synonyms: ["sanitär"] },
      { label: "Heizungsbauer", gewerk: "shk", synonyms: ["heizung", "lüftung", "klima"] },
    ],
  },
  {
    category: "Holz & Ausbau",
    roles: [
      { label: "Tischler / Schreiner", gewerk: "innenausbau", synonyms: ["holz", "möbel"] },
      { label: "Zimmerer", gewerk: "zimmerei_holzbau", synonyms: ["holzbau", "dachstuhl"] },
      { label: "Trockenbauer", gewerk: "trockenbau", synonyms: ["rigips", "innenausbau"] },
      { label: "Bodenleger", gewerk: "boden_fliesen", synonyms: ["parkett", "laminat", "boden"] },
    ],
  },
  {
    category: "Maler & Oberfläche",
    roles: [
      { label: "Maler & Lackierer", gewerk: "maler_lackierer", synonyms: ["maler", "lack", "streichen"] },
      { label: "Stuckateur", gewerk: "stuck_putz", synonyms: ["putz", "stuck"] },
      { label: "Fassade & Dämmung", gewerk: "fassade_daemmung", synonyms: ["fassade", "dämmung", "wdvs"] },
      { label: "Fliesenleger", gewerk: "boden_fliesen", synonyms: ["fliesen", "platten"] },
      { label: "Estrichleger", gewerk: "boden_fliesen", synonyms: ["estrich"] },
    ],
  },
  {
    category: "Rohbau & Außen",
    roles: [
      { label: "Maurer", gewerk: "bauwerkserhaltung", synonyms: ["mauern", "rohbau"] },
      { label: "Betonbauer", gewerk: "bauwerkserhaltung", synonyms: ["beton", "stahlbeton"] },
      { label: "Dachdecker", gewerk: "dach_klempnerei", synonyms: ["dach"] },
      { label: "Gerüstbauer", gewerk: "geruestbau", synonyms: ["gerüst"] },
      { label: "Schadensanierung", gewerk: "schadensanierung", synonyms: ["wasserschaden", "brandschaden", "trocknung"] },
      { label: "Garten- & Landschaftsbau", gewerk: null, synonyms: ["galabau", "garten", "landschaft"] },
      { label: "Bauhelfer", gewerk: null, synonyms: ["helfer", "bau"] },
    ],
  },
  {
    category: "Metall & Mechanik",
    roles: [
      { label: "Metallbauer / Schlosser", gewerk: "metallbau", synonyms: ["metall", "schweißen", "schlosser"] },
      { label: "Feinwerkmechaniker", gewerk: "metallbau", synonyms: ["mechanik", "zerspanung"] },
      { label: "KFZ-Mechatroniker", gewerk: null, synonyms: ["kfz", "auto", "mechatroniker"] },
    ],
  },
];

// Flache Gesamtliste (für die Suche) — abgeleitet, damit nichts auseinanderläuft.
const allRoles: Role[] = gewerkeGruppen.flatMap((g) => g.roles);

/**
 * Registrier-Link mit vorbelegtem Gewerk.
 *
 * Der Parameter heisst `bereich` — genau so liest ihn der Funnel. Vorher stand
 * hier `gewerk`, und der Funnel hat den Link kommentarlos ignoriert.
 */
const regHref = (gewerk?: string | null) =>
  gewerk ? `/registrieren?bereich=${encodeURIComponent(gewerk)}` : "/registrieren";

/** Sucht in Anzeigename und Synonymen. */
const roleMatches = (r: Role, q: string) =>
  r.label.toLowerCase().includes(q) ||
  (r.gewerk ?? "").includes(q) ||
  (r.synonyms ?? []).some((s) => s.includes(q));

export default function JobsPreview() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const q = query.trim().toLowerCase();

  const matches = q ? allRoles.filter((role) => roleMatches(role, q)) : [];

  // Die Stellenkarten werden von derselben Suche gefiltert.
  const visibleJobs = q
    ? jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.category.toLowerCase().includes(q) ||
          j.city.toLowerCase().includes(q) ||
          j.gewerk.toLowerCase().includes(q)
      )
    : jobs;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim().toLowerCase();
    if (!term) {
      router.push("/registrieren");
      return;
    }
    const match = allRoles.find((r) => roleMatches(r, term));
    router.push(regHref(match?.gewerk));
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

        {/* Job Cards — von der Suche unten mitgefiltert */}
        {q && visibleJobs.length === 0 && (
          <div
            className="mb-8 rounded-2xl bg-white px-6 py-8 text-center"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <p className="text-muted text-base">
              Keine Beispielstelle passt zu{" "}
              <span className="text-primary font-medium">{query}</span> — die passenden
              Gewerke findest du direkt darunter.
            </p>
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {visibleJobs.map((job) => (
            <article
              key={job.title}
              className="group bg-white border border-border rounded-2xl overflow-hidden hover:border-accent hover:shadow-[0_22px_44px_-18px_rgba(26,26,46,0.22)] hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-300 flex flex-col"
            >
              {/* Banner-Bild mit Tag */}
              <div className="relative h-36 w-full overflow-hidden">
                <Image
                  src={job.img}
                  alt={job.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(to top, rgba(20,20,32,0.35) 0%, transparent 55%)" }}
                />
                <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider text-primary bg-accent px-3 py-1 rounded-full">
                  {job.tag}
                </span>
              </div>

              <div className="p-6 flex flex-col gap-4 flex-1">
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
                <div className="rounded-xl p-4" style={{ background: "var(--color-surface)" }}>
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-1">
                    Monatsgehalt (Brutto)
                  </p>
                  <p className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                    {job.pay}
                  </p>
                </div>

                {/* Perks */}
                <div className="flex flex-wrap gap-2">
                  {job.perks.map((perk) => (
                    <span
                      key={perk}
                      className="inline-flex items-center gap-1.5 text-xs text-primary/70 border border-border rounded-full px-3 py-1"
                    >
                      <Check className="w-3 h-3 text-accent flex-shrink-0" strokeWidth={3} />
                      {perk}
                    </span>
                  ))}
                </div>

                {/* Pill-CTA */}
                <Link
                  href={regHref(job.gewerk)}
                  className="mt-auto group/btn relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white text-sm font-semibold py-3.5 transition-colors duration-300"
                >
                  <span className="relative z-10 inline-flex items-center gap-2 transition-colors duration-300 group-hover/btn:text-primary">
                    Jetzt registrieren
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 z-0 bg-accent translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"
                  />
                </Link>
              </div>
            </article>
          ))}
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
                Über 40 Gewerke im Handwerk — wähl unten dein Gewerk oder tipp es ein.
                Für jedes finden wir deine Stelle.
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
                          key={role.label}
                          href={regHref(role.gewerk)}
                          className="group inline-flex items-center gap-2 text-sm text-primary/80 border border-border px-4 py-2.5 hover:border-accent hover:bg-accent hover:text-primary transition-colors duration-200"
                        >
                          {role.label}
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
                            <li key={role.label}>
                              <Link
                                href={regHref(role.gewerk)}
                                className="group inline-flex items-center gap-1.5 text-sm text-primary/75 hover:text-accent transition-colors duration-200"
                              >
                                {role.label}
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
                // ── Standard: beliebte Gewerke als kompakte Foto-Kacheln ──
                <div className="max-w-4xl mx-auto">
                  <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted mb-5">
                    Beliebte Gewerke
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {popularTrades.map((trade) => (
                      <Link
                        key={trade.gewerk}
                        href={regHref(trade.gewerk)}
                        aria-label={`Als ${trade.label} bewerben`}
                        className="group relative aspect-square overflow-hidden rounded-[1.75rem] bg-primary/5 shadow-sm hover:shadow-lg transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                      >
                        <Image
                          src={trade.img}
                          alt={trade.alt}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(20,20,32,0.88) 0%, rgba(20,20,32,0.15) 55%, transparent 100%)",
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-0 p-2.5 flex items-center justify-between gap-1">
                          <span className="text-white text-xs sm:text-sm font-semibold leading-tight">
                            {trade.label}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-accent opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
                        </div>
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
