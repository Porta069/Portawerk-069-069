// ─── Passwort-Richtlinie (geteilt) ────────────────────────────────────────────
// EINE Quelle der Wahrheit für das ganze Frontend. Muss zur Backend-Regel
// passen (`PASSWORT_MIN` in den DTOs): mindestens acht Zeichen, sonst nichts.
//
// Vorher wurden zehn Zeichen plus Groß- und Kleinbuchstabe, Ziffer und
// Sonderzeichen VERLANGT. Diese Zusammensetzungsregeln erzeugen nicht die
// Passwörter, die sie versprechen — sie erzeugen „Sommer2024!“, weil Menschen
// die Regel auf dem kürzesten Weg erfüllen. Das NIST hat sie 2017 aus
// SP 800-63B gestrichen und empfiehlt seither Länge statt Zusammensetzung.
//
// Die Kriterien sind deshalb nicht verschwunden, sondern vom Tor zum Ratschlag
// geworden: Der Balken zeigt weiter an, wie stark ein Passwort ist, aber er
// hält niemanden mehr auf. Wer sein gewohntes Passwort benutzen will, kann das.

/** Muss mit `PASSWORT_MIN` im Backend übereinstimmen. */
export const PASSWORT_MIN = 8;

export interface PasswordChecks {
  /** Das EINZIGE Pflichtkriterium. */
  length: boolean;
  // Ab hier nur noch Empfehlungen — sie beeinflussen den Balken, nicht `valid`.
  long: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  special: boolean;
}

export interface PasswordResult {
  checks: PasswordChecks;
  /** Darf das Formular abgeschickt werden? Hängt allein an der Länge. */
  valid: boolean;
  /** Stärke 0–4 — rein visuell, blockiert nichts. */
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  percent: number;
}

/**
 * Was den Balken hebt. Bewusst als „Tipps" formuliert und nicht als Liste von
 * Pflichten: Eine Checkliste mit roten Kreuzen liest sich wie eine Sperre,
 * auch wenn nichts gesperrt ist.
 */
export const PASSWORD_TIPPS: { key: keyof PasswordChecks; label: string }[] = [
  { key: "long", label: "12 Zeichen oder mehr" },
  { key: "upper", label: "Großbuchstabe" },
  { key: "lower", label: "Kleinbuchstabe" },
  { key: "number", label: "Ziffer" },
  { key: "special", label: "Sonderzeichen" },
];

export function evaluatePassword(pw: string): PasswordResult {
  const checks: PasswordChecks = {
    length: pw.length >= PASSWORT_MIN,
    long: pw.length >= 12,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /\d/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  const valid = checks.length;

  if (!pw) {
    return { checks, valid, score: 0, label: "", color: "#E5E7EB", percent: 0 };
  }

  // Zu kurz schlägt alles andere — das ist die einzige echte Hürde.
  if (!checks.length) {
    return { checks, valid, score: 1, label: "Zu kurz", color: "#EF4444", percent: 25 };
  }

  // Länge zählt am meisten. Ein langes Passwort aus lauter Kleinbuchstaben ist
  // schwerer zu raten als ein kurzes mit allen vier Zeichenarten — genau das
  // hat die alte Bewertung falsch herum gewichtet.
  const arten =
    (checks.upper ? 1 : 0) +
    (checks.lower ? 1 : 0) +
    (checks.number ? 1 : 0) +
    (checks.special ? 1 : 0);

  let score: PasswordResult["score"];
  if (pw.length >= 16) score = 4;
  else if (pw.length >= 12) score = arten >= 2 ? 4 : 3;
  else if (pw.length >= 10) score = arten >= 3 ? 3 : 2;
  else score = arten >= 3 ? 2 : 1;

  const meta: Record<number, { label: string; color: string; percent: number }> = {
    1: { label: "Schwach", color: "#EF4444", percent: 30 },
    2: { label: "Mittel", color: "#E8A838", percent: 55 },
    3: { label: "Gut", color: "#22C55E", percent: 80 },
    4: { label: "Stark", color: "#16A34A", percent: 100 },
  };
  return { checks, valid, score, ...meta[score] };
}
