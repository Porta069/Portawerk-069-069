"use client";

// ─── Unternehmensvergleich (tabellarisch) ────────────────────────────────────
// Zwei oder mehr ausgewählte Stellen/Betriebe nebeneinander — Zeile für Zeile
// alles, was im Handwerk die Entscheidung trägt: Gehalt, Firmenwagen,
// Montage, Fahrzeit=Arbeitszeit, Urlaub, Betriebsgröße usw. Der jeweils beste
// Wert einer Zeile ist gold hinterlegt.

import { motion, AnimatePresence } from "framer-motion";
import { X, GitCompareArrows, Check, Minus } from "lucide-react";
import type { Job } from "@/lib/types";
import ScoreExplainer from "@/app/components/ScoreExplainer";

const euro = (n: number) => n.toLocaleString("de-DE");

/** Hat der Betrieb die Leistung (Benefits des Unternehmens + Extras der Stelle)? */
function hasPerk(job: Job, perk: string): boolean {
  const all = [...(job.benefits ?? []), ...(job.conditions.extras ?? [])];
  return all.some((b) => b.toLowerCase().includes(perk.toLowerCase()));
}

function YesNo({ yes }: { yes: boolean }) {
  return yes ? (
    <span className="inline-flex items-center gap-1 font-semibold" style={{ color: "#15803D" }}>
      <Check className="w-3.5 h-3.5" strokeWidth={3} /> Ja
    </span>
  ) : (
    <span className="inline-flex items-center gap-1" style={{ color: "rgba(26,26,46,0.4)" }}>
      <Minus className="w-3.5 h-3.5" /> Nein
    </span>
  );
}

interface Row {
  label: string;
  /** Zellinhalt pro Job. */
  cell: (job: Job) => React.ReactNode;
  /**
   * Vergleichswert — der höchste gewinnt und wird gold markiert.
   * Ohne Funktion wird nicht markiert (reine Info-Zeile).
   */
  best?: (job: Job) => number | null;
}

const ROWS: Row[] = [
  {
    label: "Match-Score",
    cell: (j) =>
      typeof j.matchScore === "number" ? (
        <span className="font-bold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
          {j.matchScore} %
          <ScoreExplainer breakdown={j.matchBreakdown} subject={j.title} />
        </span>
      ) : (
        "—"
      ),
    best: (j) => j.matchScore ?? null,
  },
  {
    label: "Gehalt (brutto/Monat)",
    cell: (j) =>
      j.salaryMax > 0 ? (
        <span className="font-semibold tabular-nums">
          {euro(j.salaryMin)}–{euro(j.salaryMax)} €
        </span>
      ) : (
        "n. V."
      ),
    best: (j) => (j.salaryMax > 0 ? j.salaryMax : null),
  },
  {
    label: "Fahrzeit von deinem Ort",
    cell: (j) => (j.travelMinutes ? `${j.travelMinutes} Min. (${j.distanceKm.toLocaleString("de-DE")} km)` : "—"),
    best: (j) => (j.travelMinutes ? -j.travelMinutes : null),
  },
  { label: "Montageaufkommen", cell: (j) => j.conditions.montage || "—" },
  {
    label: "Fahrzeit = Arbeitszeit",
    cell: (j) => <YesNo yes={j.conditions.fahrzeitIstArbeitszeit} />,
    best: (j) => (j.conditions.fahrzeitIstArbeitszeit ? 1 : 0),
  },
  { label: "Arbeitsbeginn", cell: (j) => `ab ${j.conditions.startpunkt}` },
  {
    label: "Urlaubstage",
    cell: (j) => (j.conditions.urlaubstage ? `${j.conditions.urlaubstage} Tage` : "—"),
    best: (j) => j.conditions.urlaubstage || null,
  },
  {
    label: "Firmenwagen",
    cell: (j) => <YesNo yes={hasPerk(j, "Firmenwagen")} />,
    best: (j) => (hasPerk(j, "Firmenwagen") ? 1 : 0),
  },
  {
    label: "Unbefristeter Vertrag",
    cell: (j) => <YesNo yes={hasPerk(j, "Unbefristet")} />,
    best: (j) => (hasPerk(j, "Unbefristet") ? 1 : 0),
  },
  {
    label: "Übertarifliche Bezahlung",
    cell: (j) => <YesNo yes={hasPerk(j, "Übertarif")} />,
    best: (j) => (hasPerk(j, "Übertarif") ? 1 : 0),
  },
  {
    label: "4-Tage-Woche",
    cell: (j) => <YesNo yes={hasPerk(j, "4-Tage")} />,
    best: (j) => (hasPerk(j, "4-Tage") ? 1 : 0),
  },
  {
    label: "Weiterbildung",
    cell: (j) => <YesNo yes={hasPerk(j, "Weiterbildung")} />,
    best: (j) => (hasPerk(j, "Weiterbildung") ? 1 : 0),
  },
  {
    label: "Betriebl. Altersvorsorge",
    cell: (j) => <YesNo yes={hasPerk(j, "Altersvorsorge")} />,
    best: (j) => (hasPerk(j, "Altersvorsorge") ? 1 : 0),
  },
  {
    label: "Unternehmensgröße",
    cell: (j) => (j.companyMitarbeiter ? `${j.companyMitarbeiter} Mitarbeiter` : "—"),
  },
  {
    label: "Gegründet",
    cell: (j) => j.companyGruendungsjahr || "—",
  },
  {
    label: "Standort",
    cell: (j) => (
      <span>
        {j.companyStrasse ? `${j.companyStrasse}, ` : ""}
        {j.companyPlz} {j.companyOrt || j.city}
      </span>
    ),
  },
  {
    label: "Website",
    cell: (j) =>
      j.companyWebsite ? (
        <a
          href={j.companyWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline-offset-2 hover:underline"
          style={{ color: "#B47B18" }}
        >
          öffnen
        </a>
      ) : (
        "—"
      ),
  },
  { label: "Start", cell: (j) => j.conditions.start || "—" },
];

export default function CompareDialog({
  jobs,
  open,
  onClose,
  onRemove,
}: {
  jobs: Job[];
  open: boolean;
  onClose: () => void;
  /** Entfernt eine Spalte aus dem Vergleich. */
  onRemove: (jobId: string) => void;
}) {
  return (
    <AnimatePresence>
      {open && jobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[118] flex items-center justify-center p-4 sm:p-6"
          style={{ background: "rgba(26,26,46,0.55)", backdropFilter: "blur(3px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Unternehmensvergleich"
            className="w-full max-w-5xl max-h-[88vh] overflow-hidden rounded-3xl bg-white flex flex-col"
            style={{ boxShadow: "0 40px 80px -30px rgba(26,26,46,0.6)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kopf */}
            <div
              className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 flex-shrink-0"
              style={{ borderBottom: "1px solid #F1EEE8" }}
            >
              <div>
                <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] mb-1.5" style={{ color: "#B47B18" }}>
                  <GitCompareArrows className="w-3.5 h-3.5" />
                  Vergleich · {jobs.length} {jobs.length === 1 ? "Betrieb" : "Betriebe"}
                </p>
                <h2 className="text-primary font-bold text-[20px] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                  Punkt für Punkt nebeneinander
                </h2>
                <p className="text-[12.5px] mt-0.5" style={{ color: "rgba(26,26,46,0.5)" }}>
                  Der beste Wert jeder Zeile ist gold hinterlegt.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Schliessen"
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(26,26,46,0.05)", color: "rgba(26,26,46,0.5)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabelle */}
            <div className="overflow-auto px-6 py-5">
              <table className="w-full text-[13px]" style={{ borderCollapse: "collapse", minWidth: jobs.length * 220 + 190 }}>
                <thead>
                  <tr>
                    <th
                      className="sticky left-0 z-10 bg-white text-left py-3 pr-4 align-bottom text-[10.5px] font-bold uppercase tracking-[0.14em]"
                      style={{ color: "rgba(26,26,46,0.4)", minWidth: 180 }}
                    >
                      Kriterium
                    </th>
                    {jobs.map((j) => (
                      <th key={j.id} className="text-left py-3 px-3 align-bottom" style={{ minWidth: 210 }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[14.5px] font-bold text-primary leading-snug" style={{ fontFamily: "var(--font-display)" }}>
                              {j.employer}
                            </p>
                            <p className="text-[11.5px] font-normal mt-0.5" style={{ color: "rgba(26,26,46,0.5)" }}>
                              {j.title}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemove(j.id)}
                            aria-label={`${j.employer} aus dem Vergleich entfernen`}
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(26,26,46,0.05)", color: "rgba(26,26,46,0.45)" }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => {
                    // Beste Spalte(n) der Zeile ermitteln.
                    let winners = new Set<string>();
                    if (row.best && jobs.length > 1) {
                      const values = jobs.map((j) => ({ id: j.id, v: row.best!(j) }));
                      const valid = values.filter((x) => x.v !== null) as { id: string; v: number }[];
                      if (valid.length > 1) {
                        const max = Math.max(...valid.map((x) => x.v));
                        const allEqual = valid.every((x) => x.v === max);
                        if (!allEqual) {
                          winners = new Set(valid.filter((x) => x.v === max).map((x) => x.id));
                        }
                      }
                    }
                    return (
                      <tr key={row.label} style={{ borderTop: "1px solid #F1EEE8" }}>
                        <td
                          className="sticky left-0 z-10 bg-white py-3 pr-4 font-semibold"
                          style={{ color: "rgba(26,26,46,0.6)" }}
                        >
                          {row.label}
                        </td>
                        {jobs.map((j) => (
                          <td
                            key={j.id}
                            className="py-3 px-3 text-primary"
                            style={
                              winners.has(j.id)
                                ? { background: "rgba(232,168,56,0.13)" }
                                : undefined
                            }
                          >
                            {row.cell(j)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
