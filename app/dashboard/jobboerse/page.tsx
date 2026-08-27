"use client";

// ─── Jobbörse ─────────────────────────────────────────────────────────────────
// Aktive Suche. Die Filter sind bewusst handwerksspezifisch: Fahrzeit statt
// Entfernung, "jeden Abend zuhause" und "Fahrzeit = Arbeitszeit" — genau die
// Punkte, die im Handwerk über eine Zusage entscheiden. Die Bereitschafts-
// Angaben aus der Registrierung landen hier als Filter wieder an der Oberfläche.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search, SlidersHorizontal, X, Loader2, ArrowUpDown, Send, Check,
  GitCompareArrows, EyeOff, MapPin,
} from "lucide-react";
import {
  listJobs, getWorkLocations, saveWorkLocations, applyToJob, setFavorite,
  type JobFilters, type JobSort, type AusgeblendeteStellen,
} from "@/lib/jobsService";
import { getKatalog, type Katalog } from "@/lib/catalogService";
import type { Job, WorkLocation } from "@/lib/types";
import JobCard from "@/app/components/dashboard/JobCard";
import JobDetailDialog from "@/app/components/dashboard/JobDetailDialog";
import CompareDialog from "@/app/components/dashboard/CompareDialog";
import WorkLocationsMap from "@/app/components/WorkLocationsMapDynamic";
import { ChipToggle } from "@/app/components/wizard";

const TRAVEL_STEPS = [15, 30, 45, 60];

/** Bewerben-Button mit Zustand: sendet die Bewerbung ans Backend. */
function ApplyButton({ jobId }: { jobId: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "already">("idle");

  const apply = async () => {
    if (state === "busy" || state === "done") return;
    setState("busy");
    const res = await applyToJob(jobId);
    if (res.ok) setState("done");
    else if (res.error.includes("bereits")) setState("already");
    else setState("idle");
  };

  if (state === "done" || state === "already") {
    return (
      <span
        className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold"
        style={{ background: "rgba(22,163,74,0.12)", color: "#15803D", fontFamily: "var(--font-display)" }}
      >
        <Check className="w-4 h-4" />
        {state === "done" ? "Bewerbung gesendet" : "Bereits beworben"}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={apply}
      disabled={state === "busy"}
      className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
      style={{ background: "#1A1A2E", color: "white", fontFamily: "var(--font-display)" }}
    >
      {state === "busy" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      Diskret bewerben
    </button>
  );
}
const SORTS: { value: JobSort; label: string }[] = [
  { value: "relevanz", label: "Bester Match zuerst" },
  { value: "fahrzeit", label: "Nächster an meinen Orten" },
  { value: "gehalt", label: "Höchstes Gehalt" },
  { value: "neueste", label: "Neueste Inserate" },
];

export default function JobboersePage() {
  const [query, setQuery] = useState("");
  const [bereiche, setBereiche] = useState<string[]>([]);
  const [katalog, setKatalog] = useState<Katalog | null>(null);
  const [ausgeblendet, setAusgeblendet] = useState<AusgeblendeteStellen | null>(null);
  const [maxTravel, setMaxTravel] = useState<number | undefined>();
  const [abendsZuhause, setAbendsZuhause] = useState(false);
  const [fahrzeitArbeitszeit, setFahrzeitArbeitszeit] = useState(false);
  const [sort, setSort] = useState<JobSort>("relevanz");
  const [showFilters, setShowFilters] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  /** Detailansicht + Vergleichsauswahl. */
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  // Arbeitsorte: beim ersten Aufruf aus der Registrierung übernommen.
  // Änderungen hier werden sofort gespeichert und gelten fürs Matching.
  const [locations, setLocations] = useState<WorkLocation[]>([]);
  const [locLoaded, setLocLoaded] = useState(false);

  useEffect(() => {
    getWorkLocations().then((res) => {
      if (res.ok) setLocations(res.data);
      setLocLoaded(true);
    });
    // Der Filter zeigt dieselben Ausbildungsbereiche, nach denen das Matching
    // arbeitet — geholt aus dem Katalog, nicht aus einer eigenen Liste.
    void getKatalog().then((res) => {
      if (res.ok) setKatalog(res.data);
    });
  }, []);

  const updateLocations = (locs: WorkLocation[]) => {
    setLocations(locs);
    void saveWorkLocations(locs);
  };

  const filters = useMemo<JobFilters>(
    () => ({
      query,
      bereiche: bereiche.length ? bereiche : undefined,
      maxTravelMinutes: maxTravel,
      abendsZuhause: abendsZuhause || undefined,
      fahrzeitIstArbeitszeit: fahrzeitArbeitszeit || undefined,
    }),
    [query, bereiche, maxTravel, abendsZuhause, fahrzeitArbeitszeit]
  );

  // Erste Liste sofort laden; erst Tipp-/Filteränderungen werden entprellt.
  const firstLoad = useRef(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    const run = () =>
      listJobs(filters, sort).then((res) => {
        if (!active) return;
        if (res.ok) {
          setJobs(res.data.jobs);
          setAusgeblendet(res.data.ausgeblendet);
        }
        setLoading(false);
      });

    if (firstLoad.current) {
      firstLoad.current = false;
      void run();
      return () => {
        active = false;
      };
    }
    const t = setTimeout(run, 220);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [filters, sort]);

  const toggleBereich = (b: string) =>
    setBereiche((cur) => (cur.includes(b) ? cur.filter((x) => x !== b) : [...cur, b]));

  /** Merken/Entmerken — Zustand sofort in Liste + offener Detailansicht spiegeln. */
  const toggleFavorite = (job: Job) => {
    const next = !job.favorite;
    setJobs((cur) => cur.map((j) => (j.id === job.id ? { ...j, favorite: next } : j)));
    setDetailJob((cur) => (cur?.id === job.id ? { ...cur, favorite: next } : cur));
    void setFavorite(job.id, next);
  };

  const toggleCompare = (job: Job) =>
    setCompareIds((cur) =>
      cur.includes(job.id) ? cur.filter((id) => id !== job.id) : [...cur, job.id]
    );

  const compareJobs = jobs.filter((j) => compareIds.includes(j.id));

  // Aktive Filter als entfernbare Chips — Transparenz statt versteckter Zustand.
  const activeChips: { label: string; clear: () => void }[] = [
    ...bereiche.map((b) => ({
      label: katalog?.bereiche.find((x) => x.value === b)?.label ?? b,
      clear: () => toggleBereich(b),
    })),
    ...(maxTravel ? [{ label: `max. ${maxTravel} Min.`, clear: () => setMaxTravel(undefined) }] : []),
    ...(abendsZuhause ? [{ label: "Jeden Abend zuhause", clear: () => setAbendsZuhause(false) }] : []),
    ...(fahrzeitArbeitszeit
      ? [{ label: "Fahrzeit = Arbeitszeit", clear: () => setFahrzeitArbeitszeit(false) }]
      : []),
  ];

  const resetAll = () => {
    setBereiche([]);
    setMaxTravel(undefined);
    setAbendsZuhause(false);
    setFahrzeitArbeitszeit(false);
  };

  const gefiltert = activeChips.length > 0;

  return (
    <div>
      {/* ── Suchband ────────────────────────────────────────────────────────
          Titel, Suche und Sortierung stehen zusammen auf dunklem Grund und
          laufen randlos über das Fenster — wie der Kopf der Übersicht. Vorher
          standen sie als einzelne helle Elemente auf der Fläche; das wirkte
          zusammengesetzt statt gebaut. */}
      <section
        className="vollbreite relative overflow-hidden -mt-10 mb-9"
        style={{ background: "#1A1A2E" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 34px)," +
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 34px)",
          }}
        />
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            right: "-6%",
            top: "-70%",
            width: 520,
            height: 520,
            background: "radial-gradient(circle, rgba(232,168,56,0.16) 0%, transparent 66%)",
          }}
        />

        <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 py-9 sm:py-11">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <h1
                className="text-white font-black leading-tight"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3.4vw, 2.5rem)" }}
              >
                Jobbörse
              </h1>
              <p className="text-[14.5px] mt-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Alle offenen Stellen — sortiert nach dem, was für dich zählt.
              </p>
            </div>

            {/* Trefferzahl im Band statt als graue Zeile über der Liste. */}
            {!loading && (
              <p
                className="text-[13px] tabular-nums pb-1"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                <strong className="text-white font-semibold">{jobs.length}</strong>{" "}
                {jobs.length === 1 ? "Stelle" : "Stellen"}
                {gefiltert && " nach deinen Filtern"}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none"
                style={{ color: "rgba(26,26,46,0.3)" }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Beruf, Betrieb oder Ort suchen …"
                className="w-full rounded-full bg-white text-primary text-[15px] pl-13 pr-11 py-4 outline-none placeholder:text-primary/30"
                style={{ paddingLeft: 52, boxShadow: "0 18px 40px -22px rgba(0,0,0,0.9)" }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Suche leeren"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(26,26,46,0.35)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative">
              <ArrowUpDown
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "rgba(255,255,255,0.45)" }}
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as JobSort)}
                aria-label="Sortierung"
                className="appearance-none w-full sm:w-auto rounded-full text-[14px] font-semibold text-white pl-11 pr-6 py-4 outline-none cursor-pointer"
                style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.16)" }}
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value} style={{ color: "#1A1A2E" }}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nur auf schmalen Geräten: dort klappt die Filterspalte weg. */}
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center gap-2 rounded-full px-5 py-4 text-[14px] font-semibold"
              style={{
                background: showFilters ? "#E8A838" : "rgba(255,255,255,0.09)",
                color: showFilters ? "#1A1A2E" : "white",
                border: `1px solid ${showFilters ? "#E8A838" : "rgba(255,255,255,0.16)"}`,
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter{activeChips.length > 0 && ` (${activeChips.length})`}
            </button>
          </div>
        </div>
      </section>

      {/* ── Zwei Spalten: Filter stehen offen, Ergebnisse daneben ───────────
          Die Karte lag vorher hinter einem Filterknopf. Wer nicht weiß, dass
          es sie gibt, findet sie nie — und ohne Arbeitsorte rechnet die Seite
          keine Fahrzeiten. Jetzt steht sie dauerhaft links und läuft beim
          Scrollen mit. */}
      <div className="vollbreite">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid lg:grid-cols-[330px_minmax(0,1fr)] gap-8 items-start">
          <aside
            className={`${showFilters ? "block" : "hidden"} lg:block lg:sticky lg:top-[104px]`}
          >
            <div
              className="rounded-3xl bg-white overflow-hidden"
              style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 14px 36px -28px rgba(26,26,46,0.6)" }}
            >
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <p
                    className="text-[9.5px] font-semibold uppercase"
                    style={{ color: "rgba(26,26,46,0.42)", letterSpacing: "0.19em" }}
                  >
                    Deine Arbeitsorte
                  </p>
                  {activeChips.length > 0 && (
                    <button
                      type="button"
                      onClick={resetAll}
                      className="text-[11.5px] font-semibold"
                      style={{ color: "#B47B18" }}
                    >
                      zurücksetzen
                    </button>
                  )}
                </div>
                <p className="text-[12.5px] leading-snug" style={{ color: "rgba(26,26,46,0.5)" }}>
                  Tipp auf die Karte oder such einen Ort. Änderungen gelten sofort.
                </p>
              </div>

              {locLoaded ? (
                <div className="[&>div:last-child]:px-5 [&>div:last-child]:pb-5">
                  <WorkLocationsMap value={locations} onChange={updateLocations} height={310} kompakt />
                </div>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#E8A838" }} />
                </div>
              )}

              <div className="px-5 py-5" style={{ borderTop: "1px solid #F0EDE6" }}>
                <p
                  className="text-[9.5px] font-semibold uppercase mb-3"
                  style={{ color: "rgba(26,26,46,0.42)", letterSpacing: "0.19em" }}
                >
                  Maximale Fahrzeit
                </p>
                <div className="flex flex-wrap gap-2">
                  {TRAVEL_STEPS.map((m) => (
                    <ChipToggle
                      key={m}
                      label={`bis ${m} Min.`}
                      selected={maxTravel === m}
                      onClick={() => setMaxTravel(maxTravel === m ? undefined : m)}
                    />
                  ))}
                </div>
              </div>

              <div className="px-5 py-5" style={{ borderTop: "1px solid #F0EDE6" }}>
                <p
                  className="text-[9.5px] font-semibold uppercase mb-3"
                  style={{ color: "rgba(26,26,46,0.42)", letterSpacing: "0.19em" }}
                >
                  Rahmenbedingungen
                </p>
                <div className="flex flex-wrap gap-2">
                  <ChipToggle
                    label="Jeden Abend zuhause"
                    selected={abendsZuhause}
                    onClick={() => setAbendsZuhause((v) => !v)}
                  />
                  <ChipToggle
                    label="Fahrzeit = Arbeitszeit"
                    selected={fahrzeitArbeitszeit}
                    onClick={() => setFahrzeitArbeitszeit((v) => !v)}
                  />
                </div>
              </div>

              {(katalog?.bereiche?.length ?? 0) > 0 && (
                <div className="px-5 py-5" style={{ borderTop: "1px solid #F0EDE6" }}>
                  <p
                    className="text-[9.5px] font-semibold uppercase mb-3"
                    style={{ color: "rgba(26,26,46,0.42)", letterSpacing: "0.19em" }}
                  >
                    Ausbildungsbereich
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(katalog?.bereiche ?? []).map((b) => (
                      <ChipToggle
                        key={b.value}
                        label={b.label}
                        selected={bereiche.includes(b.value)}
                        onClick={() => toggleBereich(b.value)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <div className="min-w-0">
            {/* Ohne Arbeitsorte kein Fahrzeit-Matching — ehrlich sagen, was fehlt. */}
            {locLoaded && locations.length === 0 && (
              <div
                className="flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3.5 mb-4"
                style={{ background: "rgba(232,168,56,0.09)", border: "1px solid rgba(232,168,56,0.28)" }}
              >
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#B47B18" }} />
                <p className="text-[13px] leading-relaxed flex-1 min-w-[14rem]" style={{ color: "rgba(26,26,46,0.7)" }}>
                  <strong>Noch kein Arbeitsort gesetzt.</strong> Ohne ihn keine
                  Fahrzeiten und keine Sortierung nach Nähe — setz ihn auf der Karte.
                </p>
              </div>
            )}

            {/* Aktive Filter */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activeChips.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={c.clear}
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-medium transition-colors"
                    style={{
                      background: "rgba(232,168,56,0.14)",
                      color: "#1A1A2E",
                      border: "1px solid rgba(232,168,56,0.4)",
                    }}
                  >
                    {c.label}
                    <X className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            )}

            {/* Warum die Liste kürzer ist: ausgeblendete Stellen benennen, statt
                sie wortlos verschwinden zu lassen. */}
            {!loading && ausgeblendet && ausgeblendet.gesamt > 0 && (
              <div
                className="rounded-2xl px-4 py-3.5 mb-4"
                style={{ background: "white", border: "1px solid #E9E7E1" }}
              >
                <p className="text-[13px] text-primary">
                  <EyeOff className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" style={{ color: "rgba(26,26,46,0.4)" }} />
                  <strong className="font-semibold">
                    {ausgeblendet.gesamt} {ausgeblendet.gesamt === 1 ? "Stelle" : "Stellen"}
                  </strong>{" "}
                  {ausgeblendet.gesamt === 1 ? "wird" : "werden"} nicht angezeigt, weil dein
                  Profil eine Voraussetzung nicht erfüllt:
                </p>
                <p className="text-[12.5px] mt-1.5" style={{ color: "rgba(26,26,46,0.55)" }}>
                  {ausgeblendet.gruende.map((g) => `${g.anzahl}× ${g.label}`).join(" · ")}
                </p>
                <Link
                  href="/einstellungen"
                  className="inline-block text-[12.5px] font-semibold mt-2 underline-offset-2 hover:underline"
                  style={{ color: "#B47B18" }}
                >
                  Angaben im Profil anpassen
                </Link>
              </div>
            )}

            {/* Ergebnisse */}
            {loading ? (
              // Platzhalter in der Form der späteren Karten statt eines
              // Kringels im Nichts — die Seite springt dadurch nicht.
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-3xl bg-white"
                    style={{ height: 190, border: "1.5px solid #EDEAE4" }}
                  />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div
                className="rounded-3xl px-6 py-14 text-center"
                style={{
                  background: "linear-gradient(158deg, #FFFFFF 0%, #FCFAF4 56%, #F6F0E2 100%)",
                  border: "1.5px solid #EDE8DC",
                }}
              >
                <span
                  className="inline-flex items-center justify-center rounded-full mb-4"
                  style={{ width: 52, height: 52, background: "rgba(232,168,56,0.14)" }}
                >
                  <Search className="w-6 h-6" style={{ color: "#B47B18" }} />
                </span>
                <p className="text-[16px] font-bold text-primary mb-1.5">
                  {gefiltert ? "Keine Stelle passt zu diesen Filtern" : "Noch keine Stellen in deiner Nähe"}
                </p>
                <p className="text-[13.5px] mb-5 max-w-[26rem] mx-auto" style={{ color: "rgba(26,26,46,0.5)" }}>
                  {gefiltert
                    ? "Erweiter die Fahrzeit oder nimm einen Ausbildungsbereich aus dem Filter."
                    : "Setz deinen Arbeitsort auf der Karte — dann zeigen wir dir, was im Umkreis frei ist."}
                </p>
                {gefiltert && (
                  <button
                    type="button"
                    onClick={resetAll}
                    className="rounded-full px-5 py-3 text-[14px] font-bold"
                    style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
                  >
                    Filter zurücksetzen
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    highlight={job.recommended}
                    footer={<ApplyButton jobId={job.id} />}
                    onOpen={setDetailJob}
                    onToggleFavorite={toggleFavorite}
                    compareSelected={compareIds.includes(job.id)}
                    onToggleCompare={toggleCompare}
                    workLocations={locations}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Detailansicht ── */}
      <JobDetailDialog
        job={detailJob}
        onClose={() => setDetailJob(null)}
        onToggleFavorite={toggleFavorite}
        footer={detailJob ? <ApplyButton jobId={detailJob.id} /> : null}
      />

      {/* ── Vergleich ── */}
      <CompareDialog
        jobs={compareJobs}
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        onRemove={(id) => {
          setCompareIds((cur) => {
            const next = cur.filter((x) => x !== id);
            if (next.length === 0) setCompareOpen(false);
            return next;
          });
        }}
      />

      {/* Schwebende Vergleichsleiste */}
      <AnimatePresence>
        {compareIds.length > 0 && !compareOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[90] flex flex-wrap items-center justify-center gap-3 rounded-full pl-5 pr-2 py-2 max-w-[calc(100vw-24px)]"
            style={{ background: "#1A1A2E", boxShadow: "0 20px 50px -20px rgba(26,26,46,0.8)" }}
          >
            <span className="text-white text-[13.5px] whitespace-nowrap">
              <strong className="tabular-nums">{compareIds.length}</strong>{" "}
              {compareIds.length === 1 ? "Betrieb" : "Betriebe"} ausgewählt
            </span>
            <button
              type="button"
              onClick={() => setCompareOpen(true)}
              disabled={compareIds.length < 2}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-bold disabled:opacity-50"
              style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
            >
              <GitCompareArrows className="w-4 h-4" />
              {compareIds.length < 2 ? "Noch 1 wählen" : "Vergleichen"}
            </button>
            <button
              type="button"
              onClick={() => setCompareIds([])}
              aria-label="Auswahl leeren"
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.12)", color: "white" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
