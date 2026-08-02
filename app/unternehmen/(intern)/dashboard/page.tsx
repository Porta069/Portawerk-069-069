"use client";

// ─── Kandidatensuche (Arbeitgeber) ───────────────────────────────────────────
// Zielgruppe sind Betriebsinhaber, keine Bewerber: Überblick zuerst, Zahlen
// statt Fließtext, alles in einem Bild. Deshalb ein dunkles Kommandopult mit
// Karte und Radius oben, darunter Kennzahlen, dann die Profile.
//
// Der Standort kommt aus drei Quellen, in dieser Reihenfolge: der PLZ aus der
// Anfrage auf /arbeitgeber, einem Klick auf die Karte, oder der Suche nach
// PLZ / Ortsname.

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2, Users, FlaskConical, ShieldCheck, X, Zap, Euro, Route, Award,
  SlidersHorizontal, MapPin,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import {
  searchCandidates, requestContact, getStoredPlz, storePlz,
  EMPLOYER_DATA_IS_MOCKED, type CandidateFilters,
} from "@/lib/employerService";
import { GEWERKE } from "@/lib/constants";
import type { Candidate } from "@/lib/types";
import CandidateCard from "@/app/components/employer/CandidateCard";
import SearchAreaMap, { type SearchArea } from "@/app/components/employer/SearchAreaMapDynamic";

/** Schnellfilter als Schlagwörter — ein Klick statt Formular. */
const QUICK: { key: string; label: string }[] = [
  { key: "sofort", label: "Sofort verfügbar" },
  { key: "meister", label: "Meisterbrief" },
  { key: "montage", label: "Montagebereit" },
  { key: "erfahren", label: "10+ Jahre" },
];

export default function EmployerSearchPage() {
  const { user } = useAuth();

  const [area, setArea] = useState<SearchArea | null>(null);
  const [radius, setRadius] = useState(50);
  const [quick, setQuick] = useState<string[]>([]);
  const [gewerke, setGewerke] = useState<string[]>([]);
  const [showGewerke, setShowGewerke] = useState(false);

  const [results, setResults] = useState<Candidate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PLZ aus der Anfrage auf /arbeitgeber übernehmen — nicht zweimal tippen.
  const [prefilled, setPrefilled] = useState<string | null>(null);
  useEffect(() => {
    const plz = getStoredPlz();
    if (/^\d{5}$/.test(plz)) setPrefilled(plz);
  }, []);

  const plz = area?.plz || prefilled || "";
  const ready = /^\d{5}$/.test(plz);

  const run = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    setError(null);
    const f: CandidateFilters = {
      plz,
      radiusKm: radius,
      gewerke: gewerke.length ? gewerke : undefined,
      minErfahrung: quick.includes("erfahren") ? 10 : undefined,
      montagebereit: quick.includes("montage") || undefined,
    };
    const res = await searchCandidates(f);
    setLoading(false);
    if (res.ok) {
      let out = res.data;
      if (quick.includes("sofort")) out = out.filter((c) => c.verfuegbarAb === "Ab sofort");
      if (quick.includes("meister")) out = out.filter((c) => c.zertifikate.includes("Meisterbrief"));
      setResults(out);
    } else {
      setError(res.error);
      setResults(null);
    }
  }, [plz, ready, radius, gewerke, quick]);

  // Sobald ein Standort feststeht, automatisch suchen und nachladen.
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => void run(), 220);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plz, radius, gewerke, quick]);

  const handleArea = (a: SearchArea) => {
    setArea(a);
    setPrefilled(null);
    if (/^\d{5}$/.test(a.plz)) storePlz(a.plz);
  };

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  // ── Kennzahlen für den schnellen Überblick ──
  const stats = useMemo(() => {
    if (!results?.length) return null;
    const avgWeg = Math.round(results.reduce((s, c) => s + c.distanceKm, 0) / results.length);
    const avgLohn = Math.round(
      results.reduce((s, c) => s + (c.gehaltVon + c.gehaltBis) / 2, 0) / results.length
    );
    return {
      total: results.length,
      sofort: results.filter((c) => c.verfuegbarAb === "Ab sofort").length,
      meister: results.filter((c) => c.zertifikate.includes("Meisterbrief")).length,
      avgWeg,
      avgLohn,
    };
  }, [results]);

  const points = results?.map((c) => ({ lat: c.lat, lng: c.lng })) ?? [];

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

      {/* ══ Kommandopult ══ */}
      <div className="relative overflow-hidden rounded-3xl mb-6" style={{ background: "#1A1A2E" }}>
        <div
          className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232,168,56,0.18) 0%, transparent 68%)" }}
        />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <span
                className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] mb-3"
                style={{ color: "#E8A838" }}
              >
                <span className="w-6 h-[2px] bg-accent" />
                {user?.companyName || "Ihr Betrieb"}
              </span>
              <h1
                className="text-white font-bold leading-tight"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.7rem, 3.2vw, 2.5rem)" }}
              >
                Fachkräfte in Ihrem Umkreis
              </h1>
            </div>

            {area && (
              <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.07)" }}>
                <p className="text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Ihr Standort
                </p>
                <p className="text-white text-[15px] font-semibold">
                  {area.label}
                  {area.plz && <span className="tabular-nums font-normal text-white/50"> · {area.plz}</span>}
                </p>
              </div>
            )}
          </div>

          {prefilled && !area && (
            <div
              className="flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-4 text-[13.5px]"
              style={{ background: "rgba(232,168,56,0.14)", color: "#F6D08A" }}
            >
              <MapPin className="w-4 h-4 flex-shrink-0" />
              PLZ <strong className="tabular-nums">{prefilled}</strong> aus Ihrer Anfrage übernommen —
              Sie können den Standort unten jederzeit ändern.
            </div>
          )}

          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-5">
            <SearchAreaMap
              area={area}
              radiusKm={radius}
              candidatePoints={points}
              onChange={handleArea}
              onRadiusChange={setRadius}
              onClear={() => {
                setArea(null);
                setPrefilled(null);
                setResults(null);
              }}
            />

            <div className="flex flex-col gap-5">
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Schnellfilter
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK.map((q) => {
                    const on = quick.includes(q.key);
                    return (
                      <button
                        key={q.key}
                        type="button"
                        onClick={() => toggle(quick, setQuick, q.key)}
                        className="rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all duration-200"
                        style={{
                          background: on ? "rgba(232,168,56,0.9)" : "rgba(255,255,255,0.07)",
                          color: on ? "#1A1A2E" : "rgba(255,255,255,0.7)",
                          border: `1.5px solid ${on ? "#E8A838" : "rgba(255,255,255,0.14)"}`,
                        }}
                      >
                        {q.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGewerke((v) => !v)}
                className="inline-flex items-center gap-2 text-[13px] font-semibold self-start"
                style={{ color: "#E8A838" }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Gewerk eingrenzen{gewerke.length > 0 && ` (${gewerke.length})`}
              </button>
            </div>
          </div>

          {showGewerke && (
            <div className="mt-5 pt-5 flex flex-wrap gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {GEWERKE.map((g) => {
                const on = gewerke.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggle(gewerke, setGewerke, g)}
                    className="rounded-full px-3.5 py-2 text-[13px] font-medium transition-all duration-200"
                    style={{
                      background: on ? "rgba(232,168,56,0.9)" : "rgba(255,255,255,0.06)",
                      color: on ? "#1A1A2E" : "rgba(255,255,255,0.65)",
                      border: `1.5px solid ${on ? "#E8A838" : "rgba(255,255,255,0.12)"}`,
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══ Kennzahlen ══ */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
        >
          {[
            { icon: Users, value: String(stats.total), label: "Kandidaten im Umkreis" },
            { icon: Zap, value: String(stats.sofort), label: "sofort verfügbar" },
            { icon: Route, value: `${stats.avgWeg} km`, label: "Ø Anfahrt" },
            { icon: Euro, value: `${stats.avgLohn.toLocaleString("de-DE")} €`, label: "Ø Gehaltswunsch" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-2xl bg-white p-4"
                style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 6px 20px -18px rgba(26,26,46,0.5)" }}
              >
                <Icon className="w-4 h-4 mb-2.5" style={{ color: "#E8A838" }} />
                <p
                  className="text-[24px] font-bold tabular-nums text-primary leading-none"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.value}
                </p>
                <p className="text-[11.5px] mt-1.5" style={{ color: "rgba(26,26,46,0.45)" }}>
                  {s.label}
                </p>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* ══ Vertrauenszeile ══ */}
      <div className="flex items-start gap-3 rounded-2xl px-4 py-3.5 mb-6" style={{ background: "rgba(26,26,46,0.035)" }}>
        <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#E8A838" }} />
        <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(26,26,46,0.6)" }}>
          Profile sind anonymisiert. Name und Kontaktdaten sehen Sie, sobald der
          Kandidat Ihre Anfrage annimmt — deshalb zeigen sich hier auch Fachkräfte,
          die nicht offen suchen.
        </p>
      </div>

      {/* ══ Ergebnisse ══ */}
      {error && (
        <div
          className="rounded-2xl px-4 py-3.5 mb-6 text-[13.5px]"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#B91C1C" }}
        >
          {error}
        </div>
      )}

      {!ready ? (
        <div className="rounded-3xl bg-white px-6 py-16 text-center" style={{ border: "1.5px solid #E9E7E1" }}>
          <MapPin className="w-7 h-7 mx-auto mb-4" style={{ color: "#E8A838" }} />
          <p className="text-[16px] font-bold text-primary mb-1.5">Standort festlegen</p>
          <p className="text-[13.5px] max-w-sm mx-auto leading-relaxed" style={{ color: "rgba(26,26,46,0.5)" }}>
            Tippen Sie auf die Karte oder geben Sie oben Ihre Postleitzahl bzw. den Ort ein.
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
        </div>
      ) : !results?.length ? (
        <div className="rounded-3xl bg-white px-6 py-16 text-center" style={{ border: "1.5px solid #E9E7E1" }}>
          <Users className="w-7 h-7 mx-auto mb-4" style={{ color: "#E8A838" }} />
          <p className="text-[16px] font-bold text-primary mb-1.5">
            Keine Treffer im Umkreis von {radius} km
          </p>
          <p className="text-[13.5px] mb-5" style={{ color: "rgba(26,26,46,0.5)" }}>
            Erweitern Sie den Radius oder lösen Sie die Schnellfilter.
          </p>
          <button
            type="button"
            onClick={() => {
              setRadius(150);
              setQuick([]);
              setGewerke([]);
            }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold"
            style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
          >
            <X className="w-4 h-4" />
            Filter lösen, 150 km
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-[13px]" style={{ color: "rgba(26,26,46,0.45)" }}>
              Sortiert nach Übereinstimmung
            </p>
            {stats && stats.meister > 0 && (
              <p
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold rounded-full px-3 py-1.5"
                style={{ background: "rgba(232,168,56,0.14)", color: "#B47B18" }}
              >
                <Award className="w-3.5 h-3.5" />
                {stats.meister} mit Meisterbrief
              </p>
            )}
          </div>
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
