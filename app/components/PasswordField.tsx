"use client";

// ─── Passwortfeld mit Sichtbarkeitsschalter ───────────────────────────────────
// Das Auge stand bisher an vier Stellen einzeln im Code und fehlte an drei
// weiteren — Partner-Einstellungen, Partner-Registrierung und einem der drei
// Felder in den Kontoeinstellungen. Wer sein Passwort nicht sehen kann, tippt
// es bei einem Fehlversuch blind noch einmal ein und weiß hinterher nicht, ob
// er sich vertippt hat oder das Passwort falsch ist.
//
// Der Schalter ist bewusst kein Umschalten des `name`-Attributs: Der
// Passwortmanager des Browsers erkennt das Feld weiterhin, weil `autoComplete`
// gesetzt bleibt, auch wenn der Typ kurzzeitig `text` ist.

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({
  label,
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  required = false,
  hint,
  error,
  /** Blendet die Mindestlänge unter dem Feld ein — nur beim Setzen sinnvoll. */
  zeigeRegel = false,
  onEnter,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  zeigeRegel?: boolean;
  onEnter?: () => void;
}) {
  const [sichtbar, setSichtbar] = useState(false);
  const id = useId();
  const zuKurz = zeigeRegel && value.length > 0 && value.length < MINDESTLAENGE;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[10px] uppercase tracking-[0.16em] font-semibold mb-2"
        style={{ color: "rgba(26,26,46,0.45)" }}
      >
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>

      <div className="relative">
        <input
          id={id}
          type={sichtbar ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnter) onEnter();
          }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-white text-primary text-sm px-4 py-3.5 pr-11 outline-none transition-all duration-200 placeholder:text-primary/20"
          style={{
            border: `1.5px solid ${
              error || zuKurz ? "#EF4444" : value ? "#1A1A2E" : "#E5E7EB"
            }`,
            fontFamily: "var(--font-sans)",
          }}
        />
        <button
          type="button"
          onClick={() => setSichtbar((s) => !s)}
          // `tabIndex={-1}`: Beim Durchtabben soll der Sprung vom Passwortfeld
          // zum Absenden-Knopf gehen, nicht auf das Auge.
          tabIndex={-1}
          aria-label={sichtbar ? "Passwort verbergen" : "Passwort anzeigen"}
          aria-pressed={sichtbar}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
        >
          {sichtbar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error ? (
        <p className="text-[11.5px] mt-1.5" style={{ color: "#B91C1C" }}>
          {error}
        </p>
      ) : zuKurz ? (
        <p className="text-[11.5px] mt-1.5" style={{ color: "#B91C1C" }}>
          Noch {MINDESTLAENGE - value.length} Zeichen bis zur Mindestlänge.
        </p>
      ) : hint ? (
        <p className="text-[11.5px] mt-1.5" style={{ color: "rgba(26,26,46,0.45)" }}>
          {hint}
        </p>
      ) : zeigeRegel ? (
        <p className="text-[11.5px] mt-1.5" style={{ color: "rgba(26,26,46,0.45)" }}>
          Mindestens {MINDESTLAENGE} Zeichen. Groß- und Kleinschreibung, Ziffern
          oder Sonderzeichen sind nicht vorgeschrieben.
        </p>
      ) : null}
    </div>
  );
}

/**
 * Muss mit `PASSWORT_MIN` im Backend übereinstimmen. Läuft es auseinander,
 * lässt das Formular etwas zu, das der Server dann ablehnt — der Nutzer sieht
 * eine Fehlermeldung, die sein Feld gar nicht erklärt.
 */
export const MINDESTLAENGE = 8;
