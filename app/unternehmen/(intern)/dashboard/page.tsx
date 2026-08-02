"use client";

// ─── Kandidatensuche (Arbeitgeber) ───────────────────────────────────────────
// Einstieg ist die PLZ: Betriebe denken in Anfahrt, nicht in Bundesländern.
// Ergebnis sind anonymisierte Profile — fachlich vollständig, aber ohne Person.
// Ein Klick auf "Interesse" schickt eine Anfrage; freigegeben wird erst, wenn
// der Kandidat zustimmt.

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Search, Loader2, SlidersHorizontal, Users, FlaskConical, ShieldCheck, X,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import {
  searchCandidates, requestContact, regionForPlz, EMPLOYER_DATA_IS_MOCKED,
  type CandidateFilters,
} from "@/lib/employerService";
import { GEWERKE } from "@/lib/constants";
import type { Candidate } from "@/lib/types";
import CandidateCard from "@/app/components/employer/CandidateCard";
import { ChipToggle } from "@/app/components/wizard";

const RADIUS_STEPS = [25, 50, 100, 200];

export default function EmployerSearchPage() {
  const { user } = useAuth();

  const [plz, setPlz] = useState("");
  const [radius, setRadius] = useState(50);
  const [gewerke, setGewerke] = useState<string[]>([]);
  const [minErfahrung, setMinErfahrung] = useState<number | undefined>();
  const [montagebereit, setMontagebereit] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [results, setResults] = useState<Candidate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const region = regionForPlz(plz);
  const plzOk = /^\d{5}$/.test(plz.trim());

  const run = useCallback(async () => {
    if (!plzOk) return;
    setLoading(true);
    setError(null);
    const f: CandidateFilters = {
      plz: plz.trim(),
      radiusKm: radius,
      gewerke: gewerke.length ? gewerke : undefined,
      minErfahrung,
      montagebereit: montagebereit || undefined,
    };
    const res = await searchCandidates(f);
    setLoading(false);
    if (res.ok) setResults(res.data);
    else {
      setError(res.error);
      setResults(null);
    }
  }, [plz, plzOk, radius, gewerke, minErfahrung, montagebereit]);

  // Nach der ersten Suche bei Filteränderung automatisch nachladen.
  useEffect(() => {
    if (results === null) return;
    const t = setTimeout(() => void run(), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius, gewerke, minErfahrung, montagebereit]);

  const toggleGewerk = (g: string) =>
    setGewerke((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]));

  const handleRequest = async (id: string, position: string) => {
    const res = await requestContact(id, position);
    if (res.ok) void run();
  };

  return (
    <div>
      {EMPLOYER_DATA_IS_MOCKED && (
        <div
          className="flex items-start gap-3 rounded-2xl px-4 py-3 mb-6"
          style={{ background: "rgba(232,168,56,0.09)", border: "1px solid rgba(232,168,56,0.28)" }}
        >
          <FlaskConical className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#B47B18" }} />
          <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(26,26,46,0.7)" }}>
            <strong>Demodaten:</strong> Für die Kandidatensuche gibt es noch keine
            Backend-Endpunkte. Die Oberfläche arbeitet gegen einen Mock.
          </p>
        </div>
      )}

      <h1
        className="text-primary font-bold mb-1"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)" }}
      >
        Kandidaten in deiner Nähe
      </h1>
      <p className="text-[15px] mb-7" style={{ color: "rgba(26,26,46,0.55)" }}>
        {user?.companyName ? `${user.companyName} — ` : ""}
        gib deine Postleitzahl ein. Du siehst passende Handwerker anonymisiert und
        entscheidest, bei wem du anfragst.
      </p>

      {/* ── PLZ-Suche ── */}
      <div
        className="rounded-3xl bg-white p-5 sm:p-6 mb-6"
        style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 10px 30px -24px rgba(26,26,46,0.5)" }}
      >
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative lg:w-64 flex-shrink-0">
            <MapPin
              className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none"
              style={{ color: "rgba(26,26,46,0.3)" }}
            />
            <input
              value={plz}
              onChange={(e) => setPlz(e.target.value.replace(/\D/g, "").slice(0, 5))}
              onKeyDown={(e) => e.key === "Enter" && void run()}
              inputMode="numeric"
              placeholder="Postleitzahl"
              aria-label="Postleitzahl"
              className="w-full rounded-full bg-white text-primary text-[16px] font-semibold tabular-nums pl-12 pr-4 py-3.5 outline-none placeholder:font-normal placeholder:text-primary/25"
              style={{ border: `1.5px solid ${plzOk ? "#E8A838" : "#E9E7E1"}` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-1">
            <span
              className="text-[12px] font-semibold uppercase tracking-[0.14em] mr-1"
              style={{ color: "rgba(26,26,46,0.4)" }}
            >
              Umkreis
            </span>
            {RADIUS_STEPS.map((r) => (
              <ChipToggle
                key={r}
                label={`${r} km`}
                selected={radius === r}
                onClick={() => setRadius(r)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => void run()}
            disabled={!plzOk || loading}
            className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-bold flex-shrink-0 transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-45 disabled:hover:translate-y-0"
            style={{
              background: "#E8A838",
              color: "#1A1A2E",
              fontFamily: "var(--font-display)",
              boxShadow: "0 14px 28px -16px rgba(232,168,56,0.9)",
            }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Suchen
          </button>
        </div>

        {region && (
          <p className="text-[13px] mt-3" style={{ color: "rgba(26,26,46,0.5)" }}>
            Leitregion: <strong className="text-primary">{region}</strong>
          </p>
        )}

        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          className="inline-flex items-center gap-2 text-[13px] font-semibold mt-4"
          style={{ color: "#B47B18" }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showFilters ? "Filter ausblenden" : "Weitere Filter"}
        </button>

        {showFilters && (
          <div className="mt-5 pt-5" style={{ borderTop: "1px solid #F1EEE8" }}>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
              style={{ color: "rgba(26,26,46,0.4)" }}
            >
              Mindest-Berufserfahrung
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {[3, 5, 10].map((j) => (
                <ChipToggle
                  key={j}
                  label={`ab ${j} Jahren`}
                  selected={minErfahrung === j}
                  onClick={() => setMinErfahrung(minErfahrung === j ? undefined : j)}
                />
              ))}
              <ChipToggle
                label="Montagebereit"
                selected={montagebereit}
                onClick={() => setMontagebereit((v) => !v)}
              />
            </div>

            <p
              className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
              style={{ color: "rgba(26,26,46,0.4)" }}
            >
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
      </div>

      {/* ── Datenschutz-Hinweis ── */}
      <div
        className="flex items-start gap-3 rounded-2xl px-4 py-3.5 mb-6"
        style={{ background: "rgba(26,26,46,0.035)" }}
      >
        <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#E8A838" }} />
        <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(26,26,46,0.6)" }}>
          Alle Profile sind anonymisiert. Name, Foto und Kontaktdaten siehst du erst,
          wenn der Kandidat deine Anfrage annimmt — das ist unser Versprechen an die
          Handwerker und der Grund, warum sie sich hier überhaupt zeigen.
        </p>
      </div>

      {/* ── Ergebnisse ── */}
      {error && (
        <div
          className="rounded-2xl px-4 py-3.5 mb-6 text-[13.5px]"
          style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#B91C1C",
          }}
        >
          {error}
        </div>
      )}

      {results === null ? (
        <div
          className="rounded-3xl bg-white px-6 py-16 text-center"
          style={{ border: "1.5px solid #E9E7E1" }}
        >
          <MapPin className="w-7 h-7 mx-auto mb-4" style={{ color: "#E8A838" }} />
          <p className="text-[16px] font-bold text-primary mb-1.5">Gib deine Postleitzahl ein</p>
          <p
            className="text-[13.5px] max-w-sm mx-auto leading-relaxed"
            style={{ color: "rgba(26,26,46,0.5)" }}
          >
            Wir zeigen dir dann alle Handwerker im gewählten Umkreis — sortiert danach,
            wie gut sie zu deiner Region und Anfahrt passen.
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
        </div>
      ) : results.length === 0 ? (
        <div
          className="rounded-3xl bg-white px-6 py-16 text-center"
          style={{ border: "1.5px solid #E9E7E1" }}
        >
          <Users className="w-7 h-7 mx-auto mb-4" style={{ color: "#E8A838" }} />
          <p className="text-[16px] font-bold text-primary mb-1.5">
            Niemand im Umkreis von {radius} km
          </p>
          <p className="text-[13.5px] mb-5" style={{ color: "rgba(26,26,46,0.5)" }}>
            Erweiter den Radius oder nimm ein Gewerk aus dem Filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setRadius(200);
              setGewerke([]);
              setMinErfahrung(undefined);
              setMontagebereit(false);
            }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold"
            style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
          >
            <X className="w-4 h-4" />
            Filter zurücksetzen, 200 km
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <p className="text-[13px] mb-4" style={{ color: "rgba(26,26,46,0.45)" }}>
            {results.length} {results.length === 1 ? "Kandidat" : "Kandidaten"} im Umkreis von{" "}
            {radius} km um {plz}
          </p>
          <div className="grid lg:grid-cols-2 gap-4">
            {results.map((c) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                onRequest={(position) => handleRequest(c.id, position)}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
