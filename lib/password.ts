// ─── Passwort-Richtlinie (geteilt) ────────────────────────────────────────────
// EINE Quelle der Wahrheit für die Passwort-Kriterien im ganzen Frontend.
// Muss zur Backend-Regel passen (CompleteRegistrationDto):
//   min. 10 Zeichen + Groß- + Kleinbuchstabe + Zahl + Sonderzeichen.

export interface PasswordChecks {
  length: boolean; // ≥ 10 Zeichen
  upper: boolean; // Großbuchstabe
  lower: boolean; // Kleinbuchstabe
  number: boolean; // Zahl
  special: boolean; // Sonderzeichen
}

export interface PasswordResult {
  checks: PasswordChecks;
  /** Alle Pflichtkriterien erfüllt (Formular darf abgesendet werden). */
  valid: boolean;
  /** Stärke 0–4 (nur visuell). */
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  /** Balkenfüllung in %. */
  percent: number;
}

/** Die menschenlesbaren Kriterien (für eine Checkliste). */
export const PASSWORD_CRITERIA: { key: keyof PasswordChecks; label: string }[] = [
  { key: "length", label: "Mindestens 10 Zeichen" },
  { key: "upper", label: "Ein Großbuchstabe (A–Z)" },
  { key: "lower", label: "Ein Kleinbuchstabe (a–z)" },
  { key: "number", label: "Eine Zahl (0–9)" },
  { key: "special", label: "Ein Sonderzeichen (!?@#…)" },
];

export function evaluatePassword(pw: string): PasswordResult {
  const checks: PasswordChecks = {
    length: pw.length >= 10,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /\d/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  const valid = Object.values(checks).every(Boolean);

  if (!pw) {
    return { checks, valid, score: 0, label: "", color: "#E5E7EB", percent: 0 };
  }

  const classes =
    (checks.upper ? 1 : 0) +
    (checks.lower ? 1 : 0) +
    (checks.number ? 1 : 0) +
    (checks.special ? 1 : 0);

  // Zu kurz überschreibt alles.
  if (!checks.length) {
    return { checks, valid, score: 1, label: "Zu kurz", color: "#EF4444", percent: 25 };
  }

  let score: PasswordResult["score"];
  if (classes <= 1) score = 1;
  else if (classes === 2) score = 2;
  else if (classes === 3) score = 3;
  else score = 4;
  // Länge-Bonus: sehr lange, vollständige Passwörter bleiben oben.
  if (score === 4 && pw.length >= 14) score = 4;

  const meta: Record<number, { label: string; color: string; percent: number }> = {
    1: { label: "Schwach", color: "#EF4444", percent: 30 },
    2: { label: "Mittel", color: "#E8A838", percent: 55 },
    3: { label: "Gut", color: "#22C55E", percent: 80 },
    4: { label: "Stark", color: "#16A34A", percent: 100 },
  };
  return { checks, valid, score, ...meta[score] };
}
