"use client";

// ─── Score-Transparenz (Testphase) ───────────────────────────────────────────
// Ein kleines, tiefgestelltes „e" neben jedem Match-Score. Öffnet den
// vollständigen Rechenweg: pro Frage Antwort, erwartete Range, Differenz,
// Gewichtung und Strafpunkte (Gewicht × Differenz) — dazu die Summenformel.
//
// NUR zum Verifizieren des Matchings gedacht und bewusst als eine einzige,
// überall wiederverwendete Komponente gebaut: zum Entfernen später einfach
// die <ScoreExplainer>-Einbindungen löschen.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FlaskConical, Sigma } from "lucide-react";
import type { MatchBreakdown } from "@/lib/types";

const fmt = (n: number | null): string =>
  n === null ? "—" : Number.isInteger(n) ? String(n) : n.toLocaleString("de-DE", { maximumFractionDigits: 1 });

function Range({ min, max }: { min: number; max: number }) {
  return <span className="tabular-nums">{min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`}</span>;
}

export default function ScoreExplainer({
  breakdown,
  /** Worum es geht — steht im Dialogkopf (z. B. Stellentitel oder Kandidat). */
  subject,
}: {
  breakdown: MatchBreakdown | null | undefined;
  subject?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!breakdown) return null;

  const scored = breakdown.criteria.filter((c) => !c.skipped);
  const skipped = breakdown.criteria.filter((c) => c.skipped);

  return (
    <>
      {/* Das kleine „e" — tiefgestellt, dezent, aber klickbar. */}
      <button
        type="button"
        onClick={(ev) => {
          ev.stopPropagation();
          setOpen(true);
        }}
        title="Rechenweg des Scores anzeigen (Testphase)"
        aria-label="Rechenweg des Scores anzeigen"
        className="align-super inline-flex items-center justify-center rounded-full font-bold transition-colors"
        style={{
          width: 15,
          height: 15,
          fontSize: 10,
          lineHeight: 1,
          marginLeft: 2,
          background: "rgba(232,168,56,0.2)",
          color: "#B47B18",
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
        }}
      >
        e
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
            style={{ background: "rgba(26,26,46,0.55)", backdropFilter: "blur(3px)" }}
            onClick={(ev) => {
              ev.stopPropagation();
              setOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Rechenweg des Match-Scores"
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white"
              style={{ boxShadow: "0 40px 80px -30px rgba(26,26,46,0.6)" }}
              onClick={(ev) => ev.stopPropagation()}
            >
              {/* Kopf */}
              <div
                className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 pt-6 pb-4 bg-white"
                style={{ borderBottom: "1px solid #F1EEE8" }}
              >
                <div className="min-w-0">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] mb-2 px-2.5 py-1"
                    style={{ background: "rgba(232,168,56,0.14)", color: "#B47B18" }}
                  >
                    <FlaskConical className="w-3 h-3" />
                    Transparenz · Testphase
                  </span>
                  <h3
                    className="text-primary font-bold text-[18px] leading-snug"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    So entsteht der Score von {breakdown.score} %
                  </h3>
                  {subject && (
                    <p className="text-[13px] mt-0.5 truncate" style={{ color: "rgba(26,26,46,0.5)" }}>
                      {subject}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Schliessen"
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: "rgba(26,26,46,0.05)", color: "rgba(26,26,46,0.5)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5">
                {/* Kriterien-Tabelle */}
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]" style={{ borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        className="text-left text-[10.5px] font-bold uppercase tracking-[0.12em]"
                        style={{ color: "rgba(26,26,46,0.45)" }}
                      >
                        <th className="py-2 pr-3 font-bold">Frage</th>
                        <th className="py-2 px-2 font-bold text-right">Antwort</th>
                        <th className="py-2 px-2 font-bold text-right">Erwartet</th>
                        <th className="py-2 px-2 font-bold text-right">Differenz</th>
                        <th className="py-2 px-2 font-bold text-right">Gewicht</th>
                        <th className="py-2 pl-2 font-bold text-right">Strafe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scored.map((c) => (
                        <tr key={c.questionKey} style={{ borderTop: "1px solid #F1EEE8" }}>
                          <td className="py-2.5 pr-3 text-primary">
                            {c.label}
                            {c.unit && (
                              <span style={{ color: "rgba(26,26,46,0.4)" }}> ({c.unit})</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-right tabular-nums font-semibold text-primary">
                            {fmt(c.workerValue)}
                          </td>
                          <td className="py-2.5 px-2 text-right" style={{ color: "rgba(26,26,46,0.65)" }}>
                            <Range min={c.rangeMin} max={c.rangeMax} />
                          </td>
                          <td
                            className="py-2.5 px-2 text-right tabular-nums"
                            style={{ color: c.diff ? "#B45309" : "#15803D", fontWeight: 600 }}
                          >
                            {fmt(c.diff)}
                          </td>
                          <td className="py-2.5 px-2 text-right tabular-nums" style={{ color: "rgba(26,26,46,0.65)" }}>
                            ×{c.weight}
                          </td>
                          <td
                            className="py-2.5 pl-2 text-right tabular-nums font-bold"
                            style={{ color: c.penalty ? "#B45309" : "#15803D" }}
                          >
                            {fmt(c.penalty)}
                            <span style={{ color: "rgba(26,26,46,0.35)", fontWeight: 400 }}>
                              {" "}/ {fmt(c.maxPenalty)}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {skipped.map((c) => (
                        <tr key={c.questionKey} style={{ borderTop: "1px solid #F1EEE8", opacity: 0.5 }}>
                          <td className="py-2.5 pr-3 text-primary">{c.label}</td>
                          <td className="py-2.5 px-2 text-right">—</td>
                          <td className="py-2.5 px-2 text-right" style={{ color: "rgba(26,26,46,0.65)" }}>
                            <Range min={c.rangeMin} max={c.rangeMax} />
                          </td>
                          <td colSpan={3} className="py-2.5 pl-2 text-right text-[12px] italic">
                            keine Angabe — übersprungen
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summen + Formel */}
                <div
                  className="rounded-2xl px-4 py-3.5 mt-4 space-y-1.5"
                  style={{ background: "var(--color-surface)" }}
                >
                  <p className="flex items-center gap-2 text-[13px] text-primary">
                    <Sigma className="w-4 h-4 flex-shrink-0" style={{ color: "#E8A838" }} />
                    <span>
                      Strafpunkte gesamt:{" "}
                      <strong className="tabular-nums">{fmt(breakdown.totalPenalty)}</strong> von
                      maximal <strong className="tabular-nums">{fmt(breakdown.totalMaxPenalty)}</strong>
                    </span>
                  </p>
                  <p className="text-[13px] tabular-nums text-primary pl-6">
                    Basis-Score = 100 × (1 − {fmt(breakdown.totalPenalty)} /{" "}
                    {fmt(breakdown.totalMaxPenalty) || "0"}) ={" "}
                    <strong className="text-[14px]" style={{ fontFamily: "var(--font-display)" }}>
                      {breakdown.baseScore ?? breakdown.score} %
                    </strong>
                  </p>
                  <p className="text-[11.5px] leading-relaxed pl-6" style={{ color: "rgba(26,26,46,0.5)" }}>
                    {breakdown.formula} Ohne bewertbare Kriterien gilt Score = 100.
                  </p>
                </div>

                {/* Abzüge aus Absage-Feedback */}
                {breakdown.adjustments?.length ? (
                  <div
                    className="rounded-2xl px-4 py-3.5 mt-3 space-y-1"
                    style={{ background: "rgba(180,83,9,0.06)", border: "1px solid rgba(180,83,9,0.2)" }}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: "#B45309" }}>
                      Abzüge aus deinen Absagen
                    </p>
                    {breakdown.adjustments.map((a) => (
                      <p key={a.id} className="flex items-baseline justify-between gap-3 text-[13px]" style={{ color: "rgba(26,26,46,0.7)" }}>
                        <span>{a.label}</span>
                        <span className="tabular-nums font-bold flex-shrink-0" style={{ color: "#B45309" }}>
                          −{a.points}
                        </span>
                      </p>
                    ))}
                    <p className="text-[13px] tabular-nums text-primary pt-1" style={{ borderTop: "1px dashed rgba(180,83,9,0.25)" }}>
                      Endscore = {breakdown.baseScore} − {breakdown.adjustments.reduce((s, a) => s + a.points, 0)} ={" "}
                      <strong className="text-[15px]" style={{ fontFamily: "var(--font-display)", color: "#B47B18" }}>
                        {breakdown.score} %
                      </strong>
                    </p>
                  </div>
                ) : null}

                {/* Platzhalter KI-Score */}
                <p className="text-[12px] mt-3" style={{ color: "rgba(26,26,46,0.45)" }}>
                  KI-Bewertung:{" "}
                  {breakdown.aiScore === null
                    ? "folgt — die KI-Fragerunde ist noch nicht integriert."
                    : `${breakdown.aiScore} %`}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
