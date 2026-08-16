"use client";

// ─── StepRail — schlanke Fortschrittsanzeige der Registrierung ────────────────
// Ersetzt die klobige Chip-Leiste: pro Schritt ein Segment mit Label darunter.
// Abgeschlossene Schritte sind anklickbar (Eingaben korrigieren), der aktuelle
// und alle noch nicht bearbeiteten bleiben passiv.

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export interface RailStep {
  label: string;
}

export function StepRail({
  steps,
  currentIndex,
  onStepSelect,
}: {
  steps: RailStep[];
  currentIndex: number;
  onStepSelect?: (index: number) => void;
}) {
  return (
    <nav aria-label="Fortschritt" className="w-full">
      <div className="flex items-end gap-1.5 sm:gap-2">
        {steps.map((s, i) => {
          const isPast = i < currentIndex;
          const isActive = i === currentIndex;
          const clickable = isPast && !!onStepSelect;

          const bar = (
            <span className="block relative h-[3px] w-full overflow-hidden rounded-full bg-white/12">
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: isActive ? "#F9AD07" : "rgba(249, 173, 7,0.75)" }}
                initial={false}
                animate={{ width: isPast || isActive ? "100%" : "0%" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
          );

          const label = (
            <span className="mt-2.5 flex items-center gap-1.5">
              {isPast ? (
                <Check className="w-3 h-3 flex-shrink-0" strokeWidth={3} style={{ color: "#F9AD07" }} />
              ) : (
                <span
                  className="text-[10px] font-bold tabular-nums flex-shrink-0"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: isActive ? "#F9AD07" : "rgba(255,255,255,0.25)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
              <span
                className="hidden sm:block text-[11px] font-medium tracking-wide truncate"
                style={{
                  color: isActive
                    ? "#FFFFFF"
                    : isPast
                    ? "rgba(249, 173, 7,0.85)"
                    : "rgba(255,255,255,0.3)",
                }}
              >
                {s.label}
              </span>
            </span>
          );

          return clickable ? (
            <button
              key={s.label}
              type="button"
              onClick={() => onStepSelect(i)}
              title={`Zurueck zu "${s.label}"`}
              aria-label={`Zurueck zu Schritt ${i + 1}: ${s.label}`}
              className="group flex-1 min-w-0 text-left cursor-pointer rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-primary"
            >
              {bar}
              <span className="block transition-opacity duration-200 opacity-75 group-hover:opacity-100">
                {label}
              </span>
            </button>
          ) : (
            <div
              key={s.label}
              className="flex-1 min-w-0"
              aria-current={isActive ? "step" : undefined}
            >
              {bar}
              {label}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
