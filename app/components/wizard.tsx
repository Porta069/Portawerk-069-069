"use client";

// ─── Wizard-Bausteine ─────────────────────────────────────────────────────────
// Eigenes, kräftigeres Vokabular für die Registrierung. Bewusst getrennt von
// ui.tsx, das Login und Dashboard bedienen — deren Optik bleibt unverändert.

import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── StepHeading ──────────────────────────────────────────────────────────────
export function StepHeading({
  eyebrow,
  children,
}: {
  eyebrow?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p
          className="text-[10px] max-lg:text-[11px] font-semibold uppercase tracking-[0.2em] mb-2.5"
          style={{ color: "rgba(26,26,46,0.35)" }}
        >
          {eyebrow}
        </p>
      )}
      {children && (
        <p className="text-[15px] leading-relaxed" style={{ color: "#6B7280" }}>
          {children}
        </p>
      )}
    </div>
  );
}

// ─── QuestionBlock ────────────────────────────────────────────────────────────
export function QuestionBlock({
  index,
  title,
  hint,
  required,
  children,
}: {
  index?: number;
  title: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-baseline gap-2.5 mb-1.5">
        {index != null && (
          <span
            className="text-[11px] font-bold tabular-nums flex-shrink-0"
            style={{ fontFamily: "var(--font-display)", color: "#E8A838" }}
          >
            {String(index).padStart(2, "0")}
          </span>
        )}
        <h2 className="text-[17px] font-bold text-primary leading-snug">
          {title}
          {required && <span style={{ color: "#E8A838" }} className="ml-1">*</span>}
        </h2>
      </div>
      {hint && (
        <p className="text-[13px] mb-4 ml-0 sm:ml-7" style={{ color: "rgba(107,114,128,0.9)" }}>
          {hint}
        </p>
      )}
      <div className={hint ? "sm:ml-7" : "mt-4 sm:ml-7"}>{children}</div>
    </section>
  );
}

// ─── OptionCard — große, antippbare Auswahl mit Icon ──────────────────────────
export function OptionCard({
  icon: Icon,
  label,
  sublabel,
  selected,
  onClick,
  multi = false,
}: {
  icon?: LucideIcon;
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
  /** Mehrfachauswahl zeigt ein Häkchen statt eines Radio-Punkts. */
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="group relative w-full text-left rounded-2xl p-4 transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      style={{
        background: selected ? "rgba(232,168,56,0.09)" : "#FFFFFF",
        border: `1.5px solid ${selected ? "#E8A838" : "#E9E7E1"}`,
        boxShadow: selected
          ? "0 12px 26px -16px rgba(232,168,56,0.75)"
          : "0 2px 10px -6px rgba(26,26,46,0.12)",
      }}
    >
      <div className="flex items-center gap-3.5">
        {Icon && (
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200"
            style={{
              background: selected ? "#E8A838" : "rgba(26,26,46,0.05)",
              color: selected ? "#1A1A2E" : "rgba(26,26,46,0.45)",
            }}
          >
            <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold text-primary leading-snug">
            {label}
          </span>
          {sublabel && (
            <span className="block text-[12px] mt-0.5" style={{ color: "rgba(107,114,128,0.9)" }}>
              {sublabel}
            </span>
          )}
        </span>
        <span
          className="flex items-center justify-center flex-shrink-0 transition-all duration-200"
          style={{
            width: 20,
            height: 20,
            borderRadius: multi ? 6 : 999,
            border: `1.5px solid ${selected ? "#E8A838" : "#D8D5CE"}`,
            background: selected ? "#E8A838" : "transparent",
          }}
        >
          {selected && <Check className="w-3 h-3 text-primary" strokeWidth={3.5} />}
        </span>
      </div>
    </button>
  );
}

// ─── ChipToggle — kompakte Mehrfachauswahl ────────────────────────────────────
export function ChipToggle({
  label,
  selected,
  onClick,
  icon: Icon,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-out hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      style={{
        background: selected ? "#1A1A2E" : "#FFFFFF",
        border: `1.5px solid ${selected ? "#1A1A2E" : "#E9E7E1"}`,
        color: selected ? "#FFFFFF" : "rgba(26,26,46,0.6)",
        boxShadow: selected
          ? "0 10px 22px -14px rgba(26,26,46,0.85)"
          : "0 2px 8px -6px rgba(26,26,46,0.14)",
      }}
    >
      {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />}
      {label}
      {selected && <Check className="w-3.5 h-3.5" strokeWidth={3} style={{ color: "#E8A838" }} />}
    </button>
  );
}

// ─── NextButton — primäre Aktion ──────────────────────────────────────────────
export function NextButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  full = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
}) {
  const inactive = disabled || loading;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={inactive}
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-4 text-[15px] font-bold transition-[transform,box-shadow,background-color] duration-200 ease-out disabled:cursor-not-allowed ${
        full ? "w-full" : ""
      } ${inactive ? "" : "hover:-translate-y-0.5"}`}
      style={{
        fontFamily: "var(--font-display)",
        background: inactive ? "#E7E5DF" : "#E8A838",
        color: inactive ? "#A8A49B" : "#1A1A2E",
        boxShadow: inactive ? "none" : "0 16px 30px -14px rgba(232,168,56,0.85)",
      }}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {children}
      {!loading && (
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
      )}
    </button>
  );
}

// ─── SkipButton — sekundäre Aktion ────────────────────────────────────────────
export function SkipButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-4 text-[14px] font-medium transition-colors duration-200"
      style={{ color: "rgba(26,26,46,0.5)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#1A1A2E")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(26,26,46,0.5)")}
    >
      {children}
    </button>
  );
}

// ─── StepActions — Fußzeile eines Schritts ────────────────────────────────────
export function StepActions({
  note,
  children,
}: {
  note?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="mt-10 pt-7 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4"
      style={{ borderTop: "1px solid #E9E7E1" }}
    >
      <p className="text-[12px] leading-relaxed" style={{ color: "rgba(107,114,128,0.85)" }}>
        {note}
      </p>
      <div className="flex items-center gap-2 flex-shrink-0">{children}</div>
    </div>
  );
}

// ─── ValueNote — kleiner Vertrauens-/Nutzenhinweis ────────────────────────────
export function ValueNote({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
      style={{ background: "rgba(26,26,46,0.035)" }}
    >
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#E8A838" }} />
      <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(26,26,46,0.6)" }}>
        {children}
      </p>
    </motion.div>
  );
}
