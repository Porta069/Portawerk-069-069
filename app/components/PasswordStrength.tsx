"use client";

// ─── Passwort-Stärke ──────────────────────────────────────────────────────────
// Ein Balken und, solange das Passwort noch nicht stark ist, ein Hinweis, was
// es stärker machen würde.
//
// Vorher stand hier eine Checkliste mit fünf Pflichtkriterien und roten
// Kreuzen. Die Kriterien sind keine Pflicht mehr — nur die Länge ist es. Eine
// Liste voller Kreuze würde trotzdem wie eine Sperre aussehen und Leute dazu
// bringen, ein „Passwort1!" zu bauen, statt ein langes zu wählen. Deshalb ein
// Satz statt einer Liste, und er verschwindet, sobald es nichts mehr zu raten
// gibt.

import { Check } from "lucide-react";
import { evaluatePassword, PASSWORD_TIPPS, PASSWORT_MIN } from "@/lib/password";

export default function PasswordStrength({
  password,
  /** Blendet den Tipp aus, wenn darunter ohnehin schon ein Hinweis steht. */
  showCriteria = true,
}: {
  password: string;
  showCriteria?: boolean;
}) {
  const res = evaluatePassword(password);
  if (!password) return null;

  const offen = PASSWORD_TIPPS.filter((t) => !res.checks[t.key]);
  const stark = res.score >= 4;

  return (
    <div className="mt-2.5">
      <div className="flex items-center gap-3">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-300"
              style={{ height: 4, background: i <= res.score ? res.color : "#E5E7EB" }}
            />
          ))}
        </div>
        <span
          className="text-[11px] font-semibold min-w-[52px] text-right"
          style={{ color: res.color }}
        >
          {res.label}
        </span>
      </div>

      {showCriteria && (
        <p
          className="flex items-start gap-1.5 text-[11.5px] mt-2"
          style={{ color: stark ? "#16A34A" : "rgba(26,26,46,0.5)" }}
        >
          {stark && <Check className="w-3 h-3 mt-0.5 flex-shrink-0" strokeWidth={3} />}
          {!res.checks.length
            ? `Mindestens ${PASSWORT_MIN} Zeichen — das ist die einzige Vorgabe.`
            : stark
              ? "Starkes Passwort."
              : `Stärker wird es durch ${offen
                  .slice(0, 2)
                  .map((t) => t.label.toLowerCase())
                  .join(" oder ")} — nötig ist es nicht.`}
        </p>
      )}
    </div>
  );
}
