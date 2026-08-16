"use client";

// ─── ProgressBar + Schritt-Indikatoren ───────────────────────────────────────

import { motion } from "framer-motion";

export interface StepDef {
  label: string;
  /** Kurzcode für den Indikator, z.B. "01" oder "✓". */
  code: string;
}

/** Schlanker Fortschrittsbalken (0–100 %). */
export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div style={{ height: "3px", background: "rgba(255,255,255,0.08)" }}>
      <motion.div
        style={{ height: "3px", background: "#F9AD07" }}
        animate={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

const PAST_BG = "rgba(249, 173, 7,0.18)";
const PAST_BG_HOVER = "rgba(249, 173, 7,0.34)";

/**
 * Horizontale Schritt-Anzeige (auf dunklem Header).
 *
 * Wird `onStepSelect` uebergeben, sind bereits abgeschlossene Schritte
 * anklickbar, um dort Eingaben zu korrigieren. Der aktuelle Schritt und alle
 * noch nicht bearbeiteten bleiben bewusst passiv — nach vorne springt man nur
 * ueber den regulaeren Weiter-Button, damit keine Pflichtangabe uebersprungen wird.
 */
export function StepIndicators({
  steps,
  currentIndex,
  onStepSelect,
}: {
  steps: StepDef[];
  currentIndex: number;
  onStepSelect?: (index: number) => void;
}) {
  return (
    <nav className="flex items-center flex-wrap gap-y-2 mt-10" aria-label="Fortschritt">
      {steps.map((s, i) => {
        const isActive = i === currentIndex;
        const isPast = i < currentIndex;
        const clickable = isPast && !!onStepSelect;

        const inner = (
          <>
            <span
              className="text-[11px] font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {s.code}
            </span>
            <span className="text-[11px] font-medium tracking-wide hidden sm:inline">
              {s.label}
            </span>
          </>
        );

        const baseStyle = {
          background: isActive ? "#F9AD07" : isPast ? PAST_BG : "rgba(255,255,255,0.06)",
          color: isActive ? "#0C3330" : isPast ? "#F9AD07" : "rgba(255,255,255,0.28)",
        };

        return (
          <div key={s.label} className="flex items-center">
            {clickable ? (
              <button
                type="button"
                onClick={() => onStepSelect(i)}
                title={`Zu Schritt ${s.code} – ${s.label} zurueckspringen`}
                aria-label={`Zurueck zu Schritt ${s.code}: ${s.label}`}
                className="flex items-center gap-2 px-3.5 py-2.5 cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                style={baseStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = PAST_BG_HOVER;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = PAST_BG;
                }}
              >
                {inner}
              </button>
            ) : (
              <div
                aria-current={isActive ? "step" : undefined}
                className="flex items-center gap-2 px-3.5 py-2.5 transition-all duration-300"
                style={baseStyle}
              >
                {inner}
              </div>
            )}
            {i < steps.length - 1 && (
              <div
                style={{
                  width: "24px",
                  height: "2px",
                  flexShrink: 0,
                  background: isPast ? "#F9AD07" : "rgba(255,255,255,0.1)",
                }}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
