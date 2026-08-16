"use client";

// ─── Job-Detailansicht ────────────────────────────────────────────────────────
// Öffnet sich beim Klick auf eine Stellenkarte: großes Gewerk-Bild, Logo,
// vollständige Stellen- und Unternehmensbeschreibung, Eckdaten des Betriebs
// (Gründungsjahr, Größe, Website, Adresse), alle Rahmenbedingungen, der
// Match-Score inkl. Rechenweg — und die Aktionen Merken + Bewerben.

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MapPin, Euro, Building2, Users, CalendarDays, Globe, Heart, Car,
  Home, Timer, Palmtree, Sparkles, Quote,
} from "lucide-react";
import type { Job } from "@/lib/types";
import ScoreExplainer from "@/app/components/ScoreExplainer";

function euro(n: number) {
  return n.toLocaleString("de-DE");
}

/**
 * Nur echte http(s)-Adressen werden verlinkt. Ohne diese Schranke könnte ein
 * Betrieb "javascript:..." als Website hinterlegen und den Code im Browser
 * jedes Handwerkers ausführen, der darauf tippt.
 */
function safeUrl(url?: string | null): string | null {
  return url && /^https?:\/\//i.test(url) ? url : null;
}

function Chip({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium"
      style={{ background: "rgba(12, 51, 48,0.05)", color: "rgba(12, 51, 48,0.72)" }}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#F9AD07" }} />
      {children}
    </span>
  );
}

function Fact({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof MapPin;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--color-surface)" }}>
      <Icon className="w-4 h-4 mb-2" style={{ color: "#F9AD07" }} />
      <p className="text-[16px] font-bold text-primary leading-tight" style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </p>
      <p className="text-[11px] mt-0.5" style={{ color: "rgba(12, 51, 48,0.45)" }}>
        {label}
      </p>
    </div>
  );
}

export default function JobDetailDialog({
  job,
  onClose,
  onToggleFavorite,
  footer,
}: {
  job: Job | null;
  onClose: () => void;
  /** Merken/Entmerken — der Aufrufer hält den Zustand der Liste aktuell. */
  onToggleFavorite?: (job: Job) => void;
  /** Aktionsbereich (z. B. Bewerben-Button) — kommt von der Seite. */
  footer?: React.ReactNode;
}) {
  const c = job?.conditions;

  return (
    <AnimatePresence>
      {job && c && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[115] flex items-center justify-center p-4 sm:p-6"
          style={{ background: "rgba(12, 51, 48,0.55)", backdropFilter: "blur(3px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={`Details zu ${job.title}`}
            className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-3xl bg-white"
            style={{ boxShadow: "0 40px 80px -30px rgba(12, 51, 48,0.6)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Kopf mit Bild ── */}
            <div className="relative h-52 sm:h-64">
              <Image
                src={job.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(12, 51, 48,0.25) 0%, rgba(12, 51, 48,0.85) 100%)" }}
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Schliessen"
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.92)", color: "#0C3330" }}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Merken */}
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite(job)}
                  aria-label={job.favorite ? "Von Merkliste entfernen" : "Auf Merkliste setzen"}
                  className="absolute top-4 right-16 w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.92)" }}
                >
                  <Heart
                    className="w-4 h-4"
                    style={{ color: job.favorite ? "#DC2626" : "#0C3330" }}
                    fill={job.favorite ? "#DC2626" : "none"}
                  />
                </button>
              )}

              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 flex items-end gap-4">
                {job.companyLogo && (
                  <span
                    className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-white flex items-center justify-center"
                    style={{ boxShadow: "0 8px 20px -8px rgba(0,0,0,0.5)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={job.companyLogo} alt="" className="w-full h-full object-contain" />
                  </span>
                )}
                <div className="min-w-0">
                  <h2
                    className="text-white font-bold text-[22px] sm:text-[26px] leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {job.title}
                  </h2>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13.5px] mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" style={{ color: "#F9AD07" }} />
                      {job.employer}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" style={{ color: "#F9AD07" }} />
                      {job.companyStrasse ? `${job.companyStrasse}, ` : ""}
                      {job.companyPlz} {job.companyOrt || job.city}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* ── Kernzahlen ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Fact
                  icon={Euro}
                  value={job.salaryMax > 0 ? `${euro(job.salaryMin)}–${euro(job.salaryMax)} €` : "n. V."}
                  label="brutto / Monat"
                />
                <Fact
                  icon={Car}
                  value={job.travelMinutes ? `${job.travelMinutes} Min.` : "—"}
                  label={job.startLabel ? `ab „${job.startLabel}“` : "Fahrzeit"}
                />
                <Fact icon={Palmtree} value={c.urlaubstage ? `${c.urlaubstage} Tage` : "—"} label="Urlaub" />
                <div className="rounded-2xl p-4" style={{ background: "rgba(249, 173, 7,0.1)" }}>
                  <Sparkles className="w-4 h-4 mb-2" style={{ color: "#8A5F04" }} />
                  <p className="text-[16px] font-bold leading-tight tabular-nums" style={{ fontFamily: "var(--font-display)", color: "#6E4A03" }}>
                    {typeof job.matchScore === "number" ? (
                      <>
                        {job.matchScore} %
                        <ScoreExplainer breakdown={job.matchBreakdown} subject={job.title} />
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "rgba(12, 51, 48,0.45)" }}>
                    Match-Score
                  </p>
                </div>
              </div>

              {/* ── Rahmenbedingungen ── */}
              <div className="flex flex-wrap gap-2">
                <Chip icon={Home}>{c.montage}</Chip>
                {c.fahrzeitIstArbeitszeit && <Chip icon={Timer}>Fahrzeit = Arbeitszeit</Chip>}
                <Chip icon={MapPin}>Start ab {c.startpunkt}</Chip>
                <Chip icon={CalendarDays}>{c.start}</Chip>
                {c.extras?.map((e) => (
                  <Chip key={e} icon={Sparkles}>
                    {e}
                  </Chip>
                ))}
                {job.benefits?.map((b) => (
                  <Chip key={b} icon={Sparkles}>
                    {b}
                  </Chip>
                ))}
              </div>

              {/* ── Warum es passt ── */}
              {job.matchReasons?.length ? (
                <p className="text-[13px] rounded-2xl px-4 py-3" style={{ background: "rgba(249, 173, 7,0.08)", color: "rgba(12, 51, 48,0.7)" }}>
                  <span className="font-semibold" style={{ color: "#8A5F04" }}>Passt, weil:</span>{" "}
                  {job.matchReasons.join(" · ")}
                </p>
              ) : null}

              {/* ── Stellenbeschreibung ── */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-2.5" style={{ color: "rgba(12, 51, 48,0.4)" }}>
                  Über die Stelle
                </p>
                <p className="text-[14px] leading-relaxed whitespace-pre-line" style={{ color: "rgba(12, 51, 48,0.72)" }}>
                  {jobDescription(job)}
                </p>
              </div>

              {/* ── Über das Unternehmen ── */}
              <div
                className="rounded-2xl p-5"
                style={{ background: "var(--color-surface)" }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-1" style={{ color: "rgba(12, 51, 48,0.4)" }}>
                      Über das Unternehmen
                    </p>
                    <p className="text-[17px] font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                      {job.employer}
                    </p>
                    {job.companySlogan && (
                      <p className="inline-flex items-center gap-1.5 text-[13px] mt-0.5" style={{ color: "rgba(12, 51, 48,0.55)" }}>
                        <Quote className="w-3 h-3" style={{ color: "#F9AD07" }} />
                        {job.companySlogan}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3 text-[13px]" style={{ color: "rgba(12, 51, 48,0.65)" }}>
                  {job.companyGruendungsjahr && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" style={{ color: "#F9AD07" }} />
                      gegründet {job.companyGruendungsjahr}
                    </span>
                  )}
                  {job.companyMitarbeiter && (
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" style={{ color: "#F9AD07" }} />
                      {job.companyMitarbeiter} Mitarbeiter
                    </span>
                  )}
                  {safeUrl(job.companyWebsite) && (
                    <a
                      href={safeUrl(job.companyWebsite) as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold underline-offset-2 hover:underline"
                      style={{ color: "#8A5F04" }}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </a>
                  )}
                </div>

                {job.companyDescription && (
                  <p className="text-[13.5px] leading-relaxed whitespace-pre-line" style={{ color: "rgba(12, 51, 48,0.65)" }}>
                    {job.companyDescription}
                  </p>
                )}
              </div>

              {/* ── Aktionen ── */}
              {footer && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {footer}
                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(job)}
                      className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-colors"
                      style={{
                        border: `1.5px solid ${job.favorite ? "#DC2626" : "#D9D3C6"}`,
                        color: job.favorite ? "#DC2626" : "rgba(12, 51, 48,0.6)",
                        background: "white",
                      }}
                    >
                      <Heart className="w-4 h-4" fill={job.favorite ? "#DC2626" : "none"} />
                      {job.favorite ? "Gemerkt" : "Merken"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Stellenbeschreibung — Tags als Fallback, damit der Abschnitt nie leer wirkt. */
function jobDescription(job: Job): string {
  if (job.description?.trim()) return job.description;
  return `${job.gewerk} in ${job.city}. Schwerpunkte: ${job.tags.join(", ") || "—"}.`;
}
