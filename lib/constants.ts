// ─── Domänen-Konstanten (Handwerk) ───────────────────────────────────────────

import type { Question } from "./types";

/** Gewerke / handwerkliche Fachrichtungen. */
export const GEWERKE = [
  "Elektriker / Elektroniker",
  "Installateur / Klempner (SHK)",
  "Heizungs- & Lüftungsbauer",
  "Maler & Lackierer",
  "Tischler / Schreiner",
  "Maurer / Betonbauer",
  "Dachdecker",
  "Fliesenleger",
  "Zimmerer",
  "Metallbauer / Schlosser",
  "KFZ-Mechatroniker",
  "Trockenbauer",
  "Gerüstbauer",
  "Garten- & Landschaftsbau",
  "Anderes Gewerk",
];

/** Bundesländer für die Regionsauswahl. */
export const BUNDESLAENDER = [
  "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg",
  "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern",
  "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz",
  "Saarland", "Sachsen", "Sachsen-Anhalt",
  "Schleswig-Holstein", "Thüringen",
];

/** Verfügbarkeits-Optionen (Pills). */
export const VERFUEGBARKEIT_OPTIONS = [
  { value: "sofort", label: "Sofort" },
  { value: "1-3monate", label: "In 1–3 Monaten" },
  { value: "schauen", label: "Erstmal nur schauen" },
];

/**
 * Schritt 1 — Umfrage-Fragen (optional, überspringbar).
 * Platzhalter-Fragen; können jederzeit angepasst werden.
 */
export const SURVEY_QUESTIONS: Question[] = [
  {
    id: "survey_ziel",
    type: "radio",
    prompt: "Was ist dir bei deinem nächsten Job am wichtigsten?",
    options: [
      { value: "gehalt", label: "Besseres Gehalt" },
      { value: "naehe", label: "Kurzer Arbeitsweg" },
      { value: "team", label: "Gutes Team & Betriebsklima" },
      { value: "aufstieg", label: "Aufstiegs­möglichkeiten" },
    ],
  },
  {
    id: "survey_umfeld",
    type: "radio",
    prompt: "In welchem Umfeld arbeitest du am liebsten?",
    options: [
      { value: "klein", label: "Kleiner Handwerksbetrieb" },
      { value: "mittel", label: "Mittelständisches Unternehmen" },
      { value: "gross", label: "Großes Bauunternehmen" },
      { value: "egal", label: "Ist mir egal" },
    ],
  },
  {
    id: "survey_bereitschaft",
    type: "checkbox",
    prompt: "Wozu bist du grundsätzlich bereit? (Mehrfachauswahl)",
    options: [
      { value: "montage", label: "Montage / Reisetätigkeit" },
      { value: "schicht", label: "Schichtarbeit" },
      { value: "notdienst", label: "Notdienst / Rufbereitschaft" },
      { value: "umzug", label: "Umzug für den richtigen Job" },
    ],
  },
  {
    id: "survey_wechsel",
    type: "radio",
    prompt: "Wie aktiv suchst du gerade?",
    options: [
      { value: "aktiv", label: "Aktiv – ich will wechseln" },
      { value: "offen", label: "Offen für Angebote" },
      { value: "passiv", label: "Nur unverbindlich schauen" },
    ],
  },
  {
    id: "survey_start",
    type: "radio",
    prompt: "Ab wann könntest du starten?",
    options: [
      { value: "sofort", label: "Sofort" },
      { value: "1monat", label: "In ~1 Monat" },
      { value: "3monate", label: "In 2–3 Monaten" },
      { value: "spaeter", label: "Später / unklar" },
    ],
  },
];
