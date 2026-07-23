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
        style={{ height: "3px", background: "#E8A838" }}
        animate={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

/** Horizontale Schritt-Anzeige (auf dunklem Header). */
export function StepIndicators({
  steps,
  currentIndex,
}: {
  steps: StepDef[];
  currentIndex: number;
}) {
  return (
    <div className="flex items-center flex-wrap gap-y-2 mt-10">
      {steps.map((s, i) => {
        const isActive = i === currentIndex;
        const isPast = i < currentIndex;
        return (
          <div key={s.label} className="flex items-center">
            <div
              className="flex items-center gap-2 px-3.5 py-2.5 transition-all duration-300"
              style={{
                background: isActive
                  ? "#E8A838"
                  : isPast
                  ? "rgba(232,168,56,0.18)"
                  : "rgba(255,255,255,0.06)",
                color: isActive
                  ? "#1A1A2E"
                  : isPast
                  ? "#E8A838"
                  : "rgba(255,255,255,0.28)",
              }}
            >
              <span
                className="text-[11px] font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.code}
              </span>
              <span className="text-[11px] font-medium tracking-wide hidden sm:inline">
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  width: "24px",
                  height: "2px",
                  flexShrink: 0,
                  background: isPast ? "#E8A838" : "rgba(255,255,255,0.1)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
