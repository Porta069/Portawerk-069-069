"use client";

// ─── Stellenkarte ─────────────────────────────────────────────────────────────
// Die drei Dinge, die im Handwerk die Entscheidung tragen, stehen ganz oben:
// Fahrzeit (nicht Luftlinie), Gehalt inkl. Markteinordnung und die
// Rahmenbedingungen (Montage, Fahrzeit=Arbeitszeit, Startpunkt).

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Car, Euro, CalendarDays, Home, Building2, Timer, Palmtree,
  Sparkles, TrendingUp, TrendingDown, Clock3, Route, X, Loader2,
} from "lucide-react";
import type { Job } from "@/lib/types";
import ScoreExplainer from "@/app/components/ScoreExplainer";

// Leaflet nur im Browser laden — und erst, wenn die Route geoeffnet wird.
const RouteMap = dynamic(() => import("./RouteMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center gap-2 py-24">
      <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#E8A838" }} />
      <span className="text-[13px]" style={{ color: "rgba(26,26,46,0.55)" }}>
        Karte wird geladen …
      </span>
    </div>
  ),
});

function euro(n: number) {
  return n.toLocaleString("de-DE");
}

/** Chip mit Icon — die handwerksspezifischen Rahmenbedingungen. */
function Cond({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
      style={{ background: "rgba(26,26,46,0.05)", color: "rgba(26,26,46,0.72)" }}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#E8A838" }} />
      {children}
    </span>
  );
}

/** Ordnet das Gehalt gegen den regionalen Schnitt ein — bewusst prominent. */
function SalaryContext({ job }: { job: Job }) {
  if (!job.marketAvg) return null;
  const mid = (job.salaryMin + job.salaryMax) / 2;
  const diff = Math.round(((mid - job.marketAvg) / job.marketAvg) * 100);

  if (Math.abs(diff) < 3) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-bold"
        style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.6)" }}
      >
        Im Marktschnitt
      </span>
    );
  }

  const up = diff > 0;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[15px] font-bold"
      style={{
        background: up ? "rgba(22,163,74,0.12)" : "rgba(180,83,9,0.12)",
        color: up ? "#15803D" : "#B45309",
        fontFamily: "var(--font-display)",
      }}
    >
      {up ? <TrendingUp className="w-4 h-4" strokeWidth={2.6} /> : <TrendingDown className="w-4 h-4" strokeWidth={2.6} />}
      {up ? "+" : ""}
      {diff} % zum Markt
    </span>
  );
}

export default function JobCard({
  job,
  footer,
  highlight = false,
}: {
  job: Job;
  /** Aktionsbereich (Bewerben, Annehmen/Ablehnen, Statuszeile …). */
  footer?: React.ReactNode;
  highlight?: boolean;
}) {
  const c = job.conditions;
  const [showRoute, setShowRoute] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-3xl bg-white"
      style={{
        border: `1.5px solid ${highlight ? "#E8A838" : "#E9E7E1"}`,
        boxShadow: highlight
          ? "0 24px 50px -30px rgba(232,168,56,0.8)"
          : "0 10px 30px -24px rgba(26,26,46,0.5)",
      }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Bild */}
        <div className="relative w-full sm:w-52 h-40 sm:h-auto flex-shrink-0">
          <Image
            src={job.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 208px"
            className="object-cover"
          />
          {job.recommended && (
            <span
              className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold"
              style={{ background: "rgba(26,26,46,0.92)", color: "#E8A838" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Für dich empfohlen
            </span>
          )}
        </div>

        {/* Inhalt */}
        <div className="flex-1 min-w-0 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3
              className="text-primary font-bold text-[19px] leading-snug"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {job.title}
            </h3>
            <div className="flex items-start gap-2 flex-shrink-0">
            {/* Match-Score inkl. Transparenz-„e" (Testphase) */}
            {typeof job.matchScore === "number" && (
              <span
                className="flex flex-col items-end rounded-xl px-3 py-1.5"
                style={{ background: "rgba(26,26,46,0.05)" }}
              >
                <span
                  className="text-[15px] font-bold tabular-nums"
                  style={{ fontFamily: "var(--font-display)", color: job.matchScore >= 70 ? "#15803D" : "#1A1A2E" }}
                >
                  {job.matchScore} %
                  <ScoreExplainer breakdown={job.matchBreakdown} subject={job.title} />
                </span>
                <span className="text-[10px]" style={{ color: "rgba(26,26,46,0.45)" }}>
                  Match
                </span>
              </span>
            )}
            {/* Fahrzeit — anklickbar, öffnet die Route auf der Karte */}
            <button
              type="button"
              onClick={() => setShowRoute(true)}
              title="Fahrtweg auf der Karte ansehen"
              aria-label={`Fahrtweg ansehen — ${job.travelMinutes} Minuten`}
              className="group/route flex flex-col items-end flex-shrink-0 rounded-xl px-3 py-1.5 transition-[background-color,transform] duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              style={{ background: "rgba(232,168,56,0.12)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(232,168,56,0.24)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(232,168,56,0.12)")}
            >
              <span
                className="inline-flex items-center gap-1.5 text-[15px] font-bold tabular-nums"
                style={{ fontFamily: "var(--font-display)", color: "#1A1A2E" }}
              >
                <Car className="w-4 h-4" style={{ color: "#E8A838" }} />
                {job.travelMinutes} Min.
              </span>
              <span
                className="inline-flex items-center gap-1 text-[10px] tabular-nums"
                style={{ color: "rgba(26,26,46,0.45)" }}
              >
                {job.distanceKm.toLocaleString("de-DE")} km
                <Route className="w-3 h-3 opacity-0 transition-opacity duration-200 group-hover/route:opacity-100" />
              </span>
            </button>
            </div>
          </div>

          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] mb-4" style={{ color: "rgba(26,26,46,0.6)" }}>
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
              {job.employer}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
              {job.city}
            </span>
          </p>

          {/* Gehalt + Einordnung */}
          <div className="rounded-2xl px-4 py-3 mb-4" style={{ background: "var(--color-surface)" }}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span
                className="inline-flex items-center gap-1.5 text-[20px] font-bold tabular-nums text-primary"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <Euro className="w-4 h-4" style={{ color: "#E8A838" }} />
                {job.salaryMax > 0 ? `${euro(job.salaryMin)} – ${euro(job.salaryMax)}` : "Nach Vereinbarung"}
              </span>
              <SalaryContext job={job} />
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(26,26,46,0.4)" }}>
              Monatlich brutto
            </p>
          </div>

          {/* Rahmenbedingungen */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Cond icon={Home}>{c.montage}</Cond>
            {c.fahrzeitIstArbeitszeit && <Cond icon={Timer}>Fahrzeit = Arbeitszeit</Cond>}
            <Cond icon={MapPin}>Start ab {c.startpunkt}</Cond>
            {c.urlaubstage > 0 && <Cond icon={Palmtree}>{c.urlaubstage} Urlaubstage</Cond>}
            <Cond icon={CalendarDays}>{c.start}</Cond>
            {c.extras?.map((e) => (
              <Cond key={e} icon={Sparkles}>
                {e}
              </Cond>
            ))}
          </div>

          {/* Warum es passt */}
          {job.matchReasons?.length ? (
            <p className="text-[12px] mb-2" style={{ color: "rgba(26,26,46,0.55)" }}>
              <span className="font-semibold" style={{ color: "#B47B18" }}>Passt, weil:</span>{" "}
              {job.matchReasons.join(" · ")}
            </p>
          ) : null}

          {/* Erwartungssteuerung */}
          {job.respondsInDays && (
            <p className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: "rgba(26,26,46,0.45)" }}>
              <Clock3 className="w-3.5 h-3.5" />
              Betrieb antwortet meist in {job.respondsInDays} Tagen
            </p>
          )}

          {footer && <div className="mt-5">{footer}</div>}
        </div>
      </div>

      {/* ── Routen-Dialog ── */}
      <AnimatePresence>
        {showRoute && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
            style={{ background: "rgba(26,26,46,0.55)", backdropFilter: "blur(3px)" }}
            onClick={() => setShowRoute(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Fahrtweg zur Arbeitsstelle"
              className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white"
              style={{ boxShadow: "0 40px 80px -30px rgba(26,26,46,0.6)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
                <div className="min-w-0">
                  <h3
                    className="text-primary font-bold text-[18px] leading-snug"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Dein Arbeitsweg
                  </h3>
                  <p className="text-[13px] mt-0.5 truncate" style={{ color: "rgba(26,26,46,0.5)" }}>
                    {job.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRoute(false)}
                  aria-label="Schliessen"
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: "rgba(26,26,46,0.05)", color: "rgba(26,26,46,0.5)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 pb-6">
                <RouteMap job={job} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
