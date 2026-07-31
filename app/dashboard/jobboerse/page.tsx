"use client";

// ─── Jobbörse ─────────────────────────────────────────────────────────────────
// Aktive Suche. Die Filter sind bewusst handwerksspezifisch: Fahrzeit statt
// Entfernung, "jeden Abend zuhause" und "Fahrzeit = Arbeitszeit" — genau die
// Punkte, die im Handwerk über eine Zusage entscheiden. Die Bereitschafts-
// Angaben aus der Registrierung landen hier als Filter wieder an der Oberfläche.

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, Loader2, ArrowUpDown, Send } from "lucide-react";
import {
  listJobs, getWorkLocations, saveWorkLocations,
  type JobFilters, type JobSort,
} from "@/lib/jobsService";
import { GEWERKE } from "@/lib/constants";
import type { Job, WorkLocation } from "@/lib/types";
import JobCard from "@/app/components/dashboard/JobCard";
import WorkLocationsMap from "@/app/components/WorkLocationsMapDynamic";
import { ChipToggle } from "@/app/components/wizard";

const TRAVEL_STEPS = [15, 30, 45, 60];
const SORTS: { value: JobSort; label: string }[] = [
  { value: "relevanz", label: "Relevanz" },
  { value: "fahrzeit", label: "Kürzeste Fahrzeit" },
  { value: "gehalt", label: "Höchstes Gehalt" },
];

export default function JobboersePage() {
  const [query, setQuery] = useState("");
  const [gewerke, setGewerke] = useState<string[]>([]);
  const [maxTravel, setMaxTravel] = useState<number | undefined>();
  const [abendsZuhause, setAbendsZuhause] = useState(false);
  const [fahrzeitArbeitszeit, setFahrzeitArbeitszeit] = useState(false);
  const [sort, setSort] = useState<JobSort>("relevanz");
  const [showFilters, setShowFilters] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Arbeitsorte: beim ersten Aufruf aus der Registrierung übernommen.
  // Änderungen hier werden sofort gespeichert und gelten fürs Matching.
  const [locations, setLocations] = useState<WorkLocation[]>([]);
  const [locLoaded, setLocLoaded] = useState(false);

  useEffect(() => {
    getWorkLocations().then((res) => {
      if (res.ok) setLocations(res.data);
      setLocLoaded(true);
    });
  }, []);

  const updateLocations = (locs: WorkLocation[]) => {
    setLocations(locs);
    void saveWorkLocations(locs);
  };

  const filters = useMemo<JobFilters>(
    () => ({
      query,
      gewerke: gewerke.length ? gewerke : undefined,
      maxTravelMinutes: maxTravel,
      abendsZuhause: abendsZuhause || undefined,
      fahrzeitIstArbeitszeit: fahrzeitArbeitszeit || undefined,
    }),
    [query, gewerke, maxTravel, abendsZuhause, fahrzeitArbeitszeit]
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    const t = setTimeout(() => {
      listJobs(filters, sort).then((res) => {
        if (!active) return;
        if (res.ok) setJobs(res.data);
        setLoading(false);
      });
    }, 220);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [filters, sort]);

  const toggleGewerk = (g: string) =>
    setGewerke((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]));

  // Aktive Filter als entfernbare Chips — Transparenz statt versteckter Zustand.
  const activeChips: { label: string; clear: () => void }[] = [
    ...gewerke.map((g) => ({ label: g, clear: () => toggleGewerk(g) })),
    ...(maxTravel ? [{ label: `max. ${maxTravel} Min.`, clear: () => setMaxTravel(undefined) }] : []),
    ...(abendsZuhause ? [{ label: "Jeden Abend zuhause", clear: () => setAbendsZuhause(false) }] : []),
    ...(fahrzeitArbeitszeit
      ? [{ label: "Fahrzeit = Arbeitszeit", clear: () => setFahrzeitArbeitszeit(false) }]
      : []),
  ];

  const resetAll = () => {
    setGewerke([]);
    setMaxTravel(undefined);
    setAbendsZuhause(false);
    setFahrzeitArbeitszeit(false);
  };

  return (
    <div>
      <h1
        className="text-primary font-bold mb-1"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)" }}
      >
        Jobbörse
      </h1>
      <p className="text-[15px] mb-6" style={{ color: "rgba(26,26,46,0.55)" }}>
        Alle offenen Stellen — sortiert nach dem, was für dich zählt.
      </p>

      {/* Suche */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none"
            style={{ color: "rgba(26,26,46,0.3)" }}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Beruf, Betrieb oder Ort suchen …"
            className="w-full rounded-full bg-white text-primary text-[15px] pl-12 pr-11 py-3.5 outline-none transition-all placeholder:text-primary/25"
            style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 2px 10px -6px rgba(26,26,46,0.14)" }}
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

        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-semibold transition-colors"
          style={{
            background: showFilters ? "#1A1A2E" : "white",
            color: showFilters ? "white" : "rgba(26,26,46,0.65)",
            border: `1.5px solid ${showFilters ? "#1A1A2E" : "#E9E7E1"}`,
          }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter{activeChips.length > 0 && ` (${activeChips.length})`}
        </button>

        <div className="relative">
          <ArrowUpDown
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "rgba(26,26,46,0.35)" }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as JobSort)}
            aria-label="Sortierung"
            className="appearance-none rounded-full bg-white text-[14px] font-semibold pl-11 pr-6 py-3.5 outline-none cursor-pointer"
            style={{ border: "1.5px solid #E9E7E1", color: "rgba(26,26,46,0.65)" }}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Aktive Filter */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {activeChips.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={c.clear}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-medium transition-colors"
              style={{ background: "rgba(232,168,56,0.14)", color: "#1A1A2E", border: "1px solid rgba(232,168,56,0.4)" }}
            >
              {c.label}
              <X className="w-3.5 h-3.5" />
            </button>
          ))}
          <button
            type="button"
            onClick={resetAll}
            className="text-[12.5px] font-semibold px-2"
            style={{ color: "rgba(26,26,46,0.45)" }}
          >
            Alle zurücksetzen
          </button>
        </div>
      )}

      {/* Filterpanel */}
      {showFilters && (
        <div
          className="rounded-3xl bg-white p-5 sm:p-6 mb-6"
          style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 10px 30px -24px rgba(26,26,46,0.5)" }}
        >
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "rgba(26,26,46,0.4)" }}>
              Deine Arbeitsorte
            </p>
            <span className="text-[11px]" style={{ color: "rgba(26,26,46,0.4)" }}>
              wird automatisch gespeichert
            </span>
          </div>
          <p className="text-[13px] mb-3" style={{ color: "rgba(26,26,46,0.55)" }}>
            Aus deiner Registrierung übernommen. Änderungen hier gelten sofort für
            deine Stellenvorschläge — tipp auf die Karte oder such einen Ort.
          </p>
          <div className="mb-7">
            {locLoaded ? (
              <WorkLocationsMap value={locations} onChange={updateLocations} />
            ) : (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#E8A838" }} />
              </div>
            )}
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(26,26,46,0.4)" }}>
            Maximale Fahrzeit
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {TRAVEL_STEPS.map((m) => (
              <ChipToggle
                key={m}
                label={`bis ${m} Min.`}
                selected={maxTravel === m}
                onClick={() => setMaxTravel(maxTravel === m ? undefined : m)}
              />
            ))}
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(26,26,46,0.4)" }}>
            Rahmenbedingungen
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
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

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(26,26,46,0.4)" }}>
            Gewerk
          </p>
          <div className="flex flex-wrap gap-2">
            {GEWERKE.map((g) => (
              <ChipToggle
                key={g}
                label={g}
                selected={gewerke.includes(g)}
                onClick={() => toggleGewerk(g)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ergebnisse */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
        </div>
      ) : jobs.length === 0 ? (
        <div
          className="rounded-3xl bg-white px-6 py-16 text-center"
          style={{ border: "1.5px solid #E9E7E1" }}
        >
          <p className="text-[15px] font-semibold text-primary mb-1.5">Keine Stelle passt zu diesen Filtern</p>
          <p className="text-[13.5px] mb-5" style={{ color: "rgba(26,26,46,0.5)" }}>
            Erweiter die Fahrzeit oder nimm ein Gewerk aus dem Filter.
          </p>
          <button
            type="button"
            onClick={resetAll}
            className="rounded-full px-5 py-3 text-[14px] font-bold"
            style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
          >
            Filter zurücksetzen
          </button>
        </div>
      ) : (
        <>
          <p className="text-[13px] mb-4" style={{ color: "rgba(26,26,46,0.45)" }}>
            {jobs.length} {jobs.length === 1 ? "Stelle" : "Stellen"}
          </p>
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                highlight={job.recommended}
                footer={
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
                    style={{
                      background: "#1A1A2E",
                      color: "white",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    <Send className="w-4 h-4" />
                    Diskret bewerben
                  </button>
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
