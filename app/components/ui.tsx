"use client";

// ─── Wiederverwendbare UI-Primitives ─────────────────────────────────────────
// Gemeinsames Formular-Vokabular der Plattform (Navy/Gold-Design-System).
// Genutzt von Registrierung, Login, KI-Fragen und Dashboard.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, HelpCircle, Loader2 } from "lucide-react";

// ─── SectionLabel ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.2em] whitespace-nowrap"
        style={{ color: "rgba(12, 51, 48,0.35)" }}
      >
        {children}
      </span>
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── FieldHint (i-Tooltip) ────────────────────────────────────────────────────
export function FieldHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1.5 align-middle">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label="Hinweis"
        className="flex items-center justify-center w-4 h-4 transition-colors duration-150"
        style={{ color: open ? "#F9AD07" : "rgba(95, 111, 106,0.5)" }}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 w-52 px-3 py-2.5 text-xs leading-relaxed"
            style={{ background: "#0C3330", color: "rgba(255,255,255,0.8)" }}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

// ─── Field (Text/Email/Tel/Date) ──────────────────────────────────────────────
export function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  hint,
  error,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  const borderColor = error
    ? "#EF4444"
    : focused
    ? "#F9AD07"
    : filled
    ? "#0C3330"
    : "#DFE3E0";
  return (
    <div>
      <label
        className="flex items-center text-[10px] uppercase tracking-[0.16em] font-semibold mb-2 transition-colors duration-200"
        style={{ color: focused ? "#F9AD07" : "rgba(12, 51, 48,0.45)" }}
      >
        {label}
        {required && (
          <span style={{ color: "#F9AD07" }} className="ml-0.5">
            *
          </span>
        )}
        {hint && <FieldHint text={hint} />}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full bg-white text-primary text-sm px-4 py-3.5 outline-none transition-all duration-200 placeholder:text-primary/20"
          style={{
            border: `1.5px solid ${borderColor}`,
            boxShadow: focused
              ? "0 0 0 3px rgba(249, 173, 7,0.10)"
              : error
              ? "0 0 0 3px rgba(239,68,68,0.08)"
              : "none",
            fontFamily: "var(--font-sans)",
          }}
        />
        <AnimatePresence>
          {filled && !focused && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
            >
              <div
                className="w-[18px] h-[18px] rounded-full flex items-center justify-center"
                style={{ background: "#22C55E" }}
              >
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && (
        <p className="text-xs mt-1.5" style={{ color: "#EF4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── SelectField ──────────────────────────────────────────────────────────────
export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  return (
    <div>
      <label
        className="block text-[10px] uppercase tracking-[0.16em] font-semibold mb-2 transition-colors duration-200"
        style={{ color: focused ? "#F9AD07" : "rgba(12, 51, 48,0.45)" }}
      >
        {label}
        {required && (
          <span style={{ color: "#F9AD07" }} className="ml-0.5">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-white text-sm px-4 py-3.5 outline-none transition-all duration-200 appearance-none cursor-pointer"
          style={{
            border: `1.5px solid ${
              focused ? "#F9AD07" : filled ? "#0C3330" : "#DFE3E0"
            }`,
            boxShadow: focused ? "0 0 0 3px rgba(249, 173, 7,0.10)" : "none",
            fontFamily: "var(--font-sans)",
            color: filled ? "#0C3330" : "rgba(12, 51, 48,0.35)",
          }}
        >
          <option value="">{placeholder ?? "Bitte wählen"}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5">
          {filled && (
            <div
              className="w-[18px] h-[18px] rounded-full flex items-center justify-center"
              style={{ background: "#22C55E" }}
            >
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </div>
          )}
          <ChevronDown className="w-4 h-4" style={{ color: "rgba(12, 51, 48,0.35)" }} />
        </div>
      </div>
    </div>
  );
}

// ─── PillSelect (Single-Choice als Buttons) ───────────────────────────────────
export function PillSelect({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      {label && (
        <label
          className="block text-[10px] uppercase tracking-[0.16em] font-semibold mb-3"
          style={{ color: "rgba(12, 51, 48,0.45)" }}
        >
          {label}
          {required && (
            <span style={{ color: "#F9AD07" }} className="ml-0.5">
              *
            </span>
          )}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className="px-4 py-2.5 text-sm font-medium transition-all duration-200"
              style={{
                border: `1.5px solid ${active ? "#F9AD07" : "#DFE3E0"}`,
                background: active ? "rgba(249, 173, 7,0.08)" : "white",
                color: active ? "#0C3330" : "rgba(12, 51, 48,0.5)",
                boxShadow: active ? "0 0 0 3px rgba(249, 173, 7,0.08)" : "none",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── CheckCard (Multi-Choice Auswahl) ─────────────────────────────────────────
export function CheckCard({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-3 px-4 py-3 text-sm text-left transition-all duration-200 w-full"
      style={{
        border: `1.5px solid ${checked ? "#F9AD07" : "#DFE3E0"}`,
        background: checked ? "rgba(249, 173, 7,0.06)" : "white",
        color: checked ? "#0C3330" : "rgba(12, 51, 48,0.6)",
      }}
    >
      <span
        className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{
          border: `1.5px solid ${checked ? "#F9AD07" : "#C8CFCB"}`,
          background: checked ? "#F9AD07" : "white",
        }}
      >
        {checked && <Check className="w-3 h-3 text-primary" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <span
          className="text-2xl font-bold text-primary tabular-nums"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value}
          {value >= max ? "+" : ""}
        </span>
        {unit && (
          <span className="text-xs uppercase tracking-wider text-muted">
            {unit}
          </span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-[3px] appearance-none cursor-pointer"
        style={{
          accentColor: "#F9AD07",
          background: `linear-gradient(to right, #F9AD07 ${pct}%, #DFE3E0 ${pct}%)`,
        }}
      />
      <div className="flex justify-between mt-2 text-[10px] text-muted tabular-nums">
        <span>{min}</span>
        <span>
          {max}
          {unit ? ` ${unit}` : ""}+
        </span>
      </div>
    </div>
  );
}

// ─── TextArea ─────────────────────────────────────────────────────────────────
export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      className="w-full bg-white text-primary text-sm px-4 py-3.5 outline-none transition-all duration-200 placeholder:text-primary/20 resize-none"
      style={{
        border: `1.5px solid ${
          focused ? "#F9AD07" : filled ? "#0C3330" : "#DFE3E0"
        }`,
        boxShadow: focused ? "0 0 0 3px rgba(249, 173, 7,0.10)" : "none",
        fontFamily: "var(--font-sans)",
      }}
    />
  );
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────
export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const inactive = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={inactive}
      className={`group inline-flex items-center justify-center gap-3 font-semibold px-8 py-4 text-sm transition-all duration-200 disabled:cursor-not-allowed ${className}`}
      style={{
        background: inactive ? "#DFE3E0" : "#F9AD07",
        color: inactive ? "#94A09B" : "#0C3330",
        fontFamily: "var(--font-display)",
      }}
      onMouseEnter={(e) => {
        if (!inactive) (e.currentTarget as HTMLButtonElement).style.background = "#f0b340";
      }}
      onMouseLeave={(e) => {
        if (!inactive) (e.currentTarget as HTMLButtonElement).style.background = "#F9AD07";
      }}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

// ─── GhostButton (sekundär) ───────────────────────────────────────────────────
export function GhostButton({
  children,
  onClick,
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 disabled:opacity-40 ${className}`}
      style={{ border: "1.5px solid #DFE3E0", background: "white", color: "rgba(12, 51, 48,0.65)" }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(12, 51, 48,0.4)";
          (e.currentTarget as HTMLButtonElement).style.color = "#0C3330";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#DFE3E0";
        (e.currentTarget as HTMLButtonElement).style.color = "rgba(12, 51, 48,0.65)";
      }}
    >
      {children}
    </button>
  );
}
