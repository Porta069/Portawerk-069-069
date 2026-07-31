"use client";

// ─── Dynamische Frage-Komponente ──────────────────────────────────────────────
// Rendert eine einzelne Frage passend zu ihrem Typ. Wird sowohl von der
// Umfrage (Schritt 1) als auch von den KI-Profilfragen (Schritt 4) genutzt.

import { useEffect } from "react";
import { PillSelect, CheckCard, Slider, TextArea } from "./ui";
import type { AnswerValue, Question } from "@/lib/types";

export default function QuestionComponent({
  question,
  value,
  onChange,
  index,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  index?: number;
}) {
  const q = question;

  // Slider: Default sofort als Antwort setzen, damit ein Pflicht-Slider den
  // Schritt nicht blockiert, wenn der Regler (noch) nicht bewegt wurde.
  useEffect(() => {
    if (q.type === "slider" && typeof value !== "number") {
      onChange(q.min ?? 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id]);

  return (
    <div>
      <div className="mb-4">
        <p
          className="text-base font-semibold text-primary leading-snug"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {typeof index === "number" && (
            <span className="text-accent mr-2 tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          {q.prompt}
          {q.required && <span className="text-accent ml-1">*</span>}
        </p>
        {q.hint && (
          <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#6B7280" }}>
            {q.hint}
          </p>
        )}
      </div>

      {/* ── radio ── */}
      {q.type === "radio" && q.options && (
        <PillSelect
          value={typeof value === "string" ? value : ""}
          onChange={(v) => onChange(v)}
          options={q.options}
        />
      )}

      {/* ── checkbox ── */}
      {q.type === "checkbox" && q.options && (
        <div className="grid sm:grid-cols-2 gap-2.5">
          {q.options.map((o) => {
            const arr = Array.isArray(value) ? value : [];
            const checked = arr.includes(o.value);
            return (
              <CheckCard
                key={o.value}
                label={o.label}
                checked={checked}
                onToggle={() =>
                  onChange(
                    checked
                      ? arr.filter((x) => x !== o.value)
                      : [...arr, o.value]
                  )
                }
              />
            );
          })}
        </div>
      )}

      {/* ── text ── */}
      {q.type === "text" && (
        <TextArea
          value={typeof value === "string" ? value : ""}
          onChange={(v) => onChange(v)}
          placeholder={q.placeholder}
        />
      )}

      {/* ── slider ── */}
      {q.type === "slider" && (
        <Slider
          value={typeof value === "number" ? value : q.min ?? 0}
          onChange={(v) => onChange(v)}
          min={q.min}
          max={q.max}
          step={q.step}
          unit={q.unit}
        />
      )}
    </div>
  );
}
