"use client";

// ─── Stellenkarte ─────────────────────────────────────────────────────────────
// Die drei Dinge, die im Handwerk die Entscheidung tragen, stehen ganz oben:
// Fahrzeit (nicht Luftlinie), Gehalt inkl. Markteinordnung und die
// Rahmenbedingungen (Montage, Fahrzeit=Arbeitszeit, Startpunkt).

import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin, Car, Euro, CalendarDays, Home, Building2, Timer, Palmtree,
  Sparkles, TrendingUp, TrendingDown, Clock3,
} from "lucide-react";
import type { Job } from "@/lib/types";

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

/** Ordnet das Gehalt gegen den regionalen Schnitt ein. */
function SalaryContext({ job }: { job: Job }) {
  if (!job.marketAvg) return null;
  const mid = (job.salaryMin + job.salaryMax) / 2;
  const diff = Math.round(((mid - job.marketAvg) / job.marketAvg) * 100);
  if (Math.abs(diff) < 3) {
    return (
      <span className="text-[12px]" style={{ color: "rgba(26,26,46,0.5)" }}>
        etwa im Marktschnitt
      </span>
    );
  }
  const up = diff > 0;
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-semibold"
      style={{ color: up ? "#16A34A" : "#B45309" }}
    >
      {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      {up ? "+" : ""}
      {diff} % zum Marktschnitt
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
            {/* Fahrzeit — die eigentlich entscheidende Größe */}
            <span
              className="flex flex-col items-end flex-shrink-0 rounded-xl px-3 py-1.5"
              style={{ background: "rgba(232,168,56,0.12)" }}
            >
              <span
                className="inline-flex items-center gap-1.5 text-[15px] font-bold tabular-nums"
                style={{ fontFamily: "var(--font-display)", color: "#1A1A2E" }}
              >
                <Car className="w-4 h-4" style={{ color: "#E8A838" }} />
                {job.travelMinutes} Min.
              </span>
              <span className="text-[10px] tabular-nums" style={{ color: "rgba(26,26,46,0.45)" }}>
                {job.distanceKm.toLocaleString("de-DE")} km
              </span>
            </span>
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
                {euro(job.salaryMin)} – {euro(job.salaryMax)}
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
            <Cond icon={Palmtree}>{c.urlaubstage} Urlaubstage</Cond>
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
    </motion.article>
  );
}
