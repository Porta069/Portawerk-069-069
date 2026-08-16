"use client";

// ─── Kandidatensuche (Arbeitgeber) ───────────────────────────────────────────
// Dreiteilig: Standort oben (Karte), Filter links, Kandidaten rechts über die
// volle Breite. Chefs scannen von links nach rechts und wollen Zahlen, keine
// Kacheln — deshalb breite Zeilen statt schmaler Karten.
//
// Kein Gewerk-Filter: was gesucht wird, steht bereits in der Anfrage. Hier geht
// es nur noch um Feinauswahl innerhalb dieses Gewerks.

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2, Users, ShieldCheck, X, Route, MapPin, Target,
  SlidersHorizontal, RotateCcw, ArrowUpDown, Award, Briefcase,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import {
  searchCandidates, requestContact, getStoredPlz, storePlz,
  ZERTIFIKAT_OPTIONEN, BEREITSCHAFT_OPTIONEN,
  type CandidateFilters, type CandidateSort,
} from "@/lib/employerService";
import type { Candidate } from "@/lib/types";
import CandidateCard from "@/app/components/employer/CandidateCard";
import SearchAreaMap, { type SearchArea } from "@/app/components/employer/SearchAreaMapDynamic";

const SORTS: { value: CandidateSort; label: string }[] = [
  { value: "match", label: "Beste Übereinstimmung" },
  { value: "naehe", label: "Kürzeste Anfahrt" },
  { value: "erfahrung", label: "Meiste Erfahrung" },
];

const ERFAHRUNG_STUFEN = [0, 3, 5, 10];

/** Filter-Gruppe mit Überschrift. */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-5" style={{ borderTop: "1px solid #F1EEE8" }}>
      <p
        className="text-[10.5px] font-bold uppercase tracking-[0.16em] mb-3"
        style={{ color: "rgba(26,26,46,0.45)" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

/** Auswahlfeld im Filterpanel. */
function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] text-left transition-colors duration-150"
      style={{
        background: active ? "rgba(232,168,56,0.13)" : "transparent",
        color: active ? "#1A1A2E" : "rgba(26,26,46,0.62)",
        fontWeight: active ? 600 : 400,
      }}
    >
      <span
        className="w-[18px] h-[18px] rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
        style={{
          border: `1.5px solid ${active ? "#E8A838" : "#DDD9D1"}`,
          background: active ? "#E8A838" : "transparent",
        }}
      >
        {active && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" strokeWidth="4" strokeLinecap="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      {children}
    </button>
  );
}

export default function EmployerSearchPage() {
  const { user } = useAuth();

  const [area, setArea] = useState<SearchArea | null>(null);
  const [radius, setRadius] = useState(50);

  const [minErfahrung, setMinErfahrung] = useState(0);
  const [zertifikate, setZertifikate] = useState<string[]>([]);
  const [bereitschaft, setBereitschaft] = useState<string[]>([]);
  const [sort, setSort] = useState<CandidateSort>("match");
  const [mobileFilters, setMobileFilters] = useState(false);

  const [results, setResults] = useState<Candidate[] | null>(null);
  /** Gegen welches Inserat die Scores gerechnet wurden (Transparenz). */
  const [scoredAgainst, setScoredAgainst] = useState<{ id: string; title: string } | null>(null);
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

  const activeCount =
    (minErfahrung ? 1 : 0) + zertifikate.length + bereitschaft.length;

  const run = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    setError(null);
    const f: CandidateFilters = {
      plz,
      radiusKm: radius,
      minErfahrung: minErfahrung || undefined,
      zertifikate: zertifikate.length ? zertifikate : undefined,
      bereitschaft: bereitschaft.length ? bereitschaft : undefined,
      sort,
    };
    const res = await searchCandidates(f);
    setLoading(false);
    if (res.ok) {
      setResults(res.data.candidates);
      setScoredAgainst(res.data.scoredAgainst);
    } else {
      setError(res.error);
      setResults(null);
    }
  }, [plz, ready, radius, minErfahrung, zertifikate, bereitschaft, sort]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => void run(), 220);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plz, radius, minErfahrung, zertifikate, bereitschaft, sort]);

  const handleArea = (a: SearchArea) => {
    setArea(a);
    setPrefilled(null);
    if (/^\d{5}$/.test(a.plz)) storePlz(a.plz);
  };

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const resetFilters = () => {
    setMinErfahrung(0);
    setZertifikate([]);
    setBereitschaft([]);
  };

  const stats = useMemo(() => {
    if (!results?.length) return null;
    return {
      total: results.length,
      avgWeg: Math.round(
        results.reduce((s, c) => s + (c.distanceKm ?? 0), 0) / results.length
      ),
      avgMatch: Math.round(
        results.reduce((s, c) => s + c.matchScore, 0) / results.length
      ),
    };
  }, [results]);

  const points =
    results
      ?.filter((c) => c.lat != null && c.lng != null)
      .map((c) => ({ lat: c.lat as number, lng: c.lng as number })) ?? [];

  const handleRequest = async (id: string, position: string) => {
    const res = await requestContact(id, position);
    if (res.ok) void run();
  };

  // ── Filterpanel (geteilt zwischen Sidebar und Mobil-Auszug) ──
  const filterPanel = (
    <>
      <div className="flex items-center justify-between gap-3 pb-1">
        <p className="inline-flex items-center gap-2 text-[15px] font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
          <SlidersHorizontal className="w-4 h-4" style={{ color: "#E8A838" }} />
          Filter
          {activeCount > 0 && (
            <span
              className="flex items-center justify-center rounded-full text-[11px] tabular-nums"
              style={{ minWidth: 20, height: 20, padding: "0 6px", background: "#E8A838", color: "#1A1A2E" }}
            >
              {activeCount}
            </span>
          )}
        </p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
            style={{ color: "rgba(26,26,46,0.45)" }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Zurücksetzen
          </button>
        )}
      </div>

      <Group title="Berufserfahrung">
        <div className="space-y-0.5">
          {ERFAHRUNG_STUFEN.map((j) => (
            <Choice key={j} active={minErfahrung === j} onClick={() => setMinErfahrung(j)}>
              {j === 0 ? "Egal" : `mindestens ${j} Jahre`}
            </Choice>
          ))}
        </div>
      </Group>

      <Group title="Qualifikation">
        <div className="space-y-0.5">
          {ZERTIFIKAT_OPTIONEN.map((z) => (
            <Choice
              key={z}
              active={zertifikate.includes(z)}
              onClick={() => toggle(zertifikate, setZertifikate, z)}
            >
              {z}
            </Choice>
          ))}
        </div>
      </Group>

      <Group title="Bereitschaft">
        <div className="space-y-0.5">
          {BEREITSCHAFT_OPTIONEN.map((b) => (
            <Choice
              key={b}
              active={bereitschaft.includes(b)}
              onClick={() => toggle(bereitschaft, setBereitschaft, b)}
            >
              {b}
            </Choice>
          ))}
        </div>
      </Group>
    </>
  );

  return (
    <div>
      {/* Transparenz (Testphase): gegen welches Inserat wird gescort? */}
      {results && (
        <div
          className="flex items-start gap-3 rounded-2xl px-4 py-3 mb-6"
          style={{ background: "rgba(232,168,56,0.09)", border: "1px solid rgba(232,168,56,0.28)" }}
        >
          <Target className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#B47B18" }} />
          <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(26,26,46,0.7)" }}>
            {scoredAgainst ? (
              <>
                <strong>Match-Scores</strong> werden gegen Ihr Inserat{" "}
                <strong>„{scoredAgainst.title}“</strong> berechnet (Gewichtungen und
                Wunsch-Ranges aus dem Inserat). Das kleine <em>e</em> am Score zeigt den
                vollständigen Rechenweg.
              </>
            ) : (
              <>
                <strong>Kein aktives Inserat mit Kriterien</strong> — die Scores sind eine
                einfache Nähe-/Erfahrungs-Heuristik. Legen Sie unter{" "}
                <Link href="/unternehmen/inserate" className="font-semibold underline">
                  Inserate
                </Link>{" "}
                ein Inserat mit Gewichtungen an, um echtes Matching zu sehen.
              </>
            )}
          </p>
        </div>
      )}

      {/* ══ Standort ══ */}
      <div className="relative overflow-hidden rounded-3xl mb-6" style={{ background: "#1A1A2E" }}>
        <div
          className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232,168,56,0.2) 0%, transparent 68%)" }}
        />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-5 mb-6">
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
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3.4vw, 2.7rem)" }}
              >
                Fachkräfte in Ihrem Umkreis
              </h1>
              <p className="text-[15px] mt-2 max-w-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
                Standort auf der Karte antippen oder Ort eingeben — die Kandidaten
                erscheinen sofort darunter.
              </p>
            </div>

            {stats && (
              <div className="flex flex-wrap gap-2.5">
                {[
                  { icon: Users, v: String(stats.total), l: "Treffer" },
                  { icon: Route, v: `${stats.avgWeg} km`, l: "Ø Anfahrt" },
                  { icon: Target, v: `${stats.avgMatch} %`, l: "Ø Match" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.l}
                      className="rounded-2xl px-4 py-3 min-w-[104px]"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                    >
                      <Icon className="w-3.5 h-3.5 mb-1.5" style={{ color: "#E8A838" }} />
                      <p
                        className="text-[19px] font-bold tabular-nums text-white leading-none"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {s.v}
                      </p>
                      <p className="text-[10.5px] mt-1" style={{ color: "rgba(255,255,255,0.42)" }}>
                        {s.l}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {prefilled && !area && (
            <div
              className="flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-4 text-[13.5px]"
              style={{ background: "rgba(232,168,56,0.14)", color: "#F6D08A" }}
            >
              <MapPin className="w-4 h-4 flex-shrink-0" />
              PLZ <strong className="tabular-nums">{prefilled}</strong> aus Ihrer Anfrage
              übernommen — Standort unten jederzeit änderbar.
            </div>
          )}

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
        </div>
      </div>

      {/* ══ Filter + Ergebnisse ══ */}
      <div className="grid lg:grid-cols-[264px_minmax(0,1fr)] gap-6 items-start">
        {/* Filter — links, klebend */}
        <aside
          className="hidden lg:block rounded-3xl bg-white px-5 py-5 lg:sticky lg:top-[92px]"
          style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 10px 30px -24px rgba(26,26,46,0.5)" }}
        >
          {filterPanel}
        </aside>

        <div>
          {/* Kopfzeile: Anzahl + Sortierung */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-[14px]" style={{ color: "rgba(26,26,46,0.55)" }}>
              {results?.length
                ? `${results.length} ${results.length === 1 ? "Kandidat" : "Kandidaten"} im Umkreis von ${radius} km`
                : "Noch keine Auswahl"}
            </p>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMobileFilters((v) => !v)}
                className="lg:hidden inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-semibold"
                style={{ background: "white", border: "1.5px solid #E9E7E1", color: "rgba(26,26,46,0.65)" }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter{activeCount > 0 && ` (${activeCount})`}
              </button>
              <div className="relative">
                <ArrowUpDown
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "rgba(26,26,46,0.35)" }}
                />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as CandidateSort)}
                  aria-label="Sortierung"
                  className="appearance-none rounded-full bg-white text-[13.5px] font-semibold pl-11 pr-6 py-2.5 outline-none cursor-pointer"
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
          </div>

          {mobileFilters && (
            <div
              className="lg:hidden rounded-3xl bg-white px-5 py-5 mb-5"
              style={{ border: "1.5px solid #E9E7E1" }}
            >
              {filterPanel}
            </div>
          )}

          {/* Vertrauenszeile */}
          <div
            className="flex items-start gap-3 rounded-2xl px-4 py-3.5 mb-5"
            style={{ background: "rgba(26,26,46,0.035)" }}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#E8A838" }} />
            <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(26,26,46,0.6)" }}>
              Profile sind anonymisiert. Name und Kontaktdaten sehen Sie, sobald der
              Kandidat Ihre Anfrage annimmt — deshalb zeigen sich hier auch Fachkräfte,
              die nicht offen suchen.
            </p>
          </div>

          {error && (
            <div
              className="rounded-2xl px-4 py-3.5 mb-5 text-[13.5px]"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#B91C1C" }}
            >
              {error}
            </div>
          )}

          {!ready ? (
            <div className="rounded-3xl bg-white px-6 py-20 text-center" style={{ border: "1.5px solid #E9E7E1" }}>
              <MapPin className="w-8 h-8 mx-auto mb-4" style={{ color: "#E8A838" }} />
              <p className="text-[18px] font-bold text-primary mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
                Standort festlegen
              </p>
              <p className="text-[14px] max-w-sm mx-auto leading-relaxed" style={{ color: "rgba(26,26,46,0.5)" }}>
                Tippen Sie oben auf die Karte oder geben Sie Postleitzahl bzw. Ort ein.
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
            </div>
          ) : !results?.length ? (
            <div className="rounded-3xl bg-white px-6 py-20 text-center" style={{ border: "1.5px solid #E9E7E1" }}>
              <Users className="w-8 h-8 mx-auto mb-4" style={{ color: "#E8A838" }} />
              <p className="text-[18px] font-bold text-primary mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
                Keine Treffer im Umkreis von {radius} km
              </p>
              <p className="text-[14px] mb-6" style={{ color: "rgba(26,26,46,0.5)" }}>
                Erweitern Sie den Radius am Regler oder lösen Sie die Filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRadius(150);
                  resetFilters();
                }}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[14.5px] font-bold"
                style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
              >
                <X className="w-4 h-4" />
                Filter lösen, 150 km
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {results.map((c) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  onRequest={(position) => handleRequest(c.id, position)}
                />
              ))}

              <p
                className="flex items-center justify-center gap-2 pt-4 text-[13px]"
                style={{ color: "rgba(26,26,46,0.4)" }}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Weitere Fachkräfte erscheinen hier, sobald sie sich registrieren.
                <Award className="w-3.5 h-3.5" />
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
