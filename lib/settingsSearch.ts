// ─── Unscharfe Einstellungs-Suche ─────────────────────────────────────────────
// Findet Einstellungen auch ohne exaktes Wort: über mehrsprachige Synonyme,
// Teilstrings und Tippfehler-Toleranz (Levenshtein-Ähnlichkeit).

export type SettingsSectionId =
  | "account"
  | "orte"
  | "answers"
  | "security"
  | "language"
  | "help"
  | "legal"
  | "data";

interface SettingsEntry {
  section: SettingsSectionId;
  /** Mehrsprachige Schlüsselwörter + Synonyme (auch ähnliche Begriffe). */
  keywords: string[];
}

// Reichhaltige, mehrsprachige Stichwörter je Einstellung.
export const SETTINGS_ENTRIES: SettingsEntry[] = [
  { section: "account", keywords: ["vorname", "name", "rufname", "first name", "prénom", "nombre"] },
  { section: "account", keywords: ["nachname", "familienname", "last name", "surname", "apellido", "nom"] },
  { section: "account", keywords: ["email", "e-mail", "mail", "e mail adresse", "correo", "courriel"] },
  { section: "account", keywords: ["telefon", "handy", "nummer", "mobil", "phone", "teléfono", "téléphone"] },
  { section: "account", keywords: ["profilbild", "avatar", "foto", "bild", "referenzbild", "picture", "photo"] },
  { section: "account", keywords: ["verifizierung", "bestätigung", "email verifiziert", "telefon verifiziert", "verified", "verification"] },
  { section: "orte", keywords: ["arbeitsorte", "orte", "standort", "karte", "map", "radius", "umkreis", "region", "wo arbeiten", "locations", "lieu", "ubicación"] },
  { section: "answers", keywords: ["antworten", "fragen", "umfrage", "profil", "gewerk", "erfahrung", "answers", "réponses", "respuestas"] },
  { section: "security", keywords: ["passwort", "kennwort", "password", "sicherheit", "contraseña", "mot de passe", "security"] },
  { section: "security", keywords: ["anmeldeaktivität", "login", "aktivität", "geräte", "sitzungen", "sessions", "verlauf", "history", "activité"] },
  { section: "security", keywords: ["abmelden", "logout", "ausloggen", "alle geräte", "überall", "log out"] },
  { section: "language", keywords: ["sprache", "language", "englisch", "französisch", "spanisch", "deutsch", "langue", "idioma", "übersetzung"] },
  { section: "help", keywords: ["hilfe", "help", "support", "faq", "häufige fragen", "kontakt", "ayuda", "aide"] },
  { section: "legal", keywords: ["datenschutz", "privacy", "agb", "nutzungsbedingungen", "impressum", "rechtliches", "cookies", "legal", "confidentialité"] },
  { section: "data", keywords: ["export", "daten", "download", "dsgvo", "gdpr", "herunterladen", "auskunft", "datenauskunft"] },
  { section: "data", keywords: ["löschen", "delete", "konto löschen", "account entfernen", "kündigen", "supprimer", "eliminar"] },
];

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Klassische Levenshtein-Distanz. */
function lev(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diag + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      diag = tmp;
    }
  }
  return prev[n];
}

function tokenScore(q: string, w: string): number {
  if (!q || !w) return 0;
  if (w.includes(q) || q.includes(w)) return 1;
  const d = lev(q, w);
  return 1 - d / Math.max(q.length, w.length);
}

const THRESHOLD = 0.6;

/** Best-Score einer Einstellung für die Suchanfrage (0..1). */
function entryScore(query: string, keywords: string[]): number {
  const nq = norm(query);
  if (!nq) return 1;
  const qTokens = nq.split(" ").filter(Boolean);
  let best = 0;
  for (const kw of keywords) {
    const nk = norm(kw);
    if (nk.includes(nq)) return 1; // ganze Phrase enthalten
    for (const qt of qTokens) {
      for (const wt of nk.split(" ")) {
        best = Math.max(best, tokenScore(qt, wt));
      }
    }
  }
  return best;
}

/**
 * Liefert die Menge der Sektionen, die zur Suche passen — oder `null`, wenn die
 * Suche leer ist (dann alle anzeigen).
 */
export function matchingSections(query: string): Set<SettingsSectionId> | null {
  if (!query.trim()) return null;
  const set = new Set<SettingsSectionId>();
  for (const e of SETTINGS_ENTRIES) {
    if (entryScore(query, e.keywords) >= THRESHOLD) set.add(e.section);
  }
  return set;
}
