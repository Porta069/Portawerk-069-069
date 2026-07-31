// ─── KI-Profilfragen-Service ─────────────────────────────────────────────────
// Simuliert die KI-Engine, die in Schritt 4 dynamisch Profilfragen stellt.
// Das echte Backend generiert diese Fragen später serverseitig (LLM) und kann
// basierend auf vorherigen Antworten Folgefragen nachliefern.
//
//   GET  /api/ai/profile-questions   → getProfileQuestions()
//   POST /api/ai/answer-questions    → submitAiAnswers()

import { GEWERKE } from "./constants";
import type { AnswerMap, ApiResult, Question } from "./types";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Basis-Fragenset, das immer zuerst gestellt wird. */
const BASE_QUESTIONS: Question[] = [
  {
    id: "ai_gewerke",
    type: "checkbox",
    prompt: "Welche handwerklichen Fachrichtungen deckst du ab?",
    hint: "Mehrfachauswahl möglich — wähle alle Gewerke, in denen du arbeitest.",
    options: GEWERKE.map((g) => ({ value: g, label: g })),
    required: true,
  },
  {
    id: "ai_erfahrung",
    type: "slider",
    prompt: "Wie viele Jahre Berufserfahrung hast du?",
    min: 0,
    max: 40,
    step: 1,
    unit: "Jahre",
    required: true,
  },
  {
    id: "ai_zertifikate",
    type: "checkbox",
    prompt: "Welche Qualifikationen bringst du mit?",
    hint: "Optional — mehr Angaben erhöhen deine Vermittlungschancen.",
    options: [
      { value: "geselle", label: "Gesellenbrief" },
      { value: "meister", label: "Meisterbrief" },
      { value: "techniker", label: "Staatl. gepr. Techniker" },
      { value: "fuehrerschein", label: "Führerschein Kl. B / BE" },
      { value: "stapler", label: "Staplerschein" },
      { value: "sonstige", label: "Weitere Zertifikate" },
    ],
  },
  {
    id: "ai_auftragsart",
    type: "radio",
    prompt: "Bevorzugst du Privataufträge oder Großprojekte?",
    options: [
      { value: "privat", label: "Eher Privataufträge" },
      { value: "gross", label: "Eher Großprojekte" },
      { value: "beides", label: "Beides ist gut" },
    ],
    required: true,
  },
  {
    id: "ai_staerken",
    type: "text",
    prompt: "Was zeichnet deine Arbeit besonders aus?",
    hint: "Optional — ein bis zwei Stichworte reichen und heben dein Profil ab.",
    placeholder: "z.B. Sauberkeit, Termintreue, Kundenkommunikation …",
  },
];

/**
 * GET /api/ai/profile-questions
 * Liefert das initiale KI-Fragenset. `previousAnswers` bleibt vorbereitet für
 * spätere adaptive Logik (aktuell ohne Effekt).
 */
export async function getProfileQuestions(
  previousAnswers?: AnswerMap
): Promise<ApiResult<Question[]>> {
  void previousAnswers; // reserviert für spätere adaptive Logik
  await delay(900);
  try {
    return { ok: true, data: BASE_QUESTIONS };
  } catch {
    return { ok: false, error: "KI-Fragen konnten nicht geladen werden." };
  }
}

/**
 * Dynamische Folgefragen — die "KI" stellt basierend auf bisherigen Antworten
 * ggf. eine vertiefende Frage. Gibt `[]` zurück, wenn keine Folgefrage nötig ist.
 * DEMO: fragt nach Meisterbrief-Details, wenn "meister" gewählt wurde und noch
 * keine Folgefrage beantwortet ist.
 */
export async function getFollowUpQuestions(
  answers: AnswerMap
): Promise<ApiResult<Question[]>> {
  await delay(700);
  const certs = answers["ai_zertifikate"];
  const hasMeister = Array.isArray(certs) && certs.includes("meister");
  const alreadyAsked = answers["ai_meister_seit"] != null;

  if (hasMeister && !alreadyAsked) {
    return {
      ok: true,
      data: [
        {
          id: "ai_meister_seit",
          type: "slider",
          prompt: "Seit wie vielen Jahren bist du Meister:in?",
          hint: "Die KI hat diese Folgefrage aus deinen Angaben abgeleitet.",
          min: 0,
          max: 30,
          step: 1,
          unit: "Jahre",
        },
        {
          id: "ai_fuehrung",
          type: "radio",
          prompt: "Führst du ein eigenes Team?",
          options: [
            { value: "ja", label: "Ja, ich leite ein Team" },
            { value: "gelegentlich", label: "Gelegentlich" },
            { value: "nein", label: "Nein" },
          ],
        },
      ],
    };
  }
  return { ok: true, data: [] };
}

/**
 * POST /api/ai/answer-questions
 * Speichert die Antworten auf die KI-Fragen.
 */
export async function submitAiAnswers(
  answers: AnswerMap
): Promise<ApiResult<{ saved: number }>> {
  await delay(600);
  // Antworten werden real über api.saveStep(..., 4, ...) persistiert; hier kein
  // Logging der Nutzerantworten in die Browser-Konsole.
  return { ok: true, data: { saved: Object.keys(answers).length } };
}
