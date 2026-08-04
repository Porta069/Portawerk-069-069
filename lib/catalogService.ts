// ─── Fachkatalog ──────────────────────────────────────────────────────────────
// Ausbildungsbereiche mit ihren Berufen und Aufgabenfeldern sowie alle festen
// Antwortskalen. Der Katalog liegt im Backend (`src/matching/catalog.ts`) und
// wird hier nur geholt — sonst könnten Registrierung und Matching mit der Zeit
// unterschiedliche Listen kennen, und eine Antwort, die es im Katalog nicht
// gibt, wird beim Bewerten stillschweigend übersprungen.

import { apiRequest, type ApiResult } from "./api";

export interface KatalogOption {
  value: string;
  label: string;
  hint?: string;
}

export interface RangOption extends KatalogOption {
  rang: number;
}

export interface Bereich {
  value: string;
  label: string;
  berufe: KatalogOption[];
  aufgaben: KatalogOption[];
}

export interface Katalog {
  bereiche: Bereich[];
  ausbildungsstatus: RangOption[];
  erfahrung: RangOption[];
  prioritaeten: KatalogOption[];
  prioritaetenMax: number;
  montage: RangOption[];
  fuehrerschein: RangOption[];
  deutsch: RangOption[];
  start: RangOption[];
}

/** Die Antworten des Handwerkers — genau die zehn Fragen der Registrierung. */
export interface Handwerkerprofil {
  bereich: string | null;
  ausbildungsstatus: string | null;
  beruf: string | null;
  aufgaben: string[];
  erfahrung: string | null;
  prioritaeten: string[];
  montage: string | null;
  fuehrerschein: string | null;
  deutsch: string | null;
  start: string | null;
}

export const LEERES_PROFIL: Handwerkerprofil = {
  bereich: null,
  ausbildungsstatus: null,
  beruf: null,
  aufgaben: [],
  erfahrung: null,
  prioritaeten: [],
  montage: null,
  fuehrerschein: null,
  deutsch: null,
  start: null,
};

// Der Katalog ändert sich nur mit einem Deployment — einmal laden genügt,
// auch wenn mehrere Schritte des Wizards ihn gleichzeitig anfordern.
let cache: Katalog | null = null;
let laufend: Promise<ApiResult<Katalog>> | null = null;

export async function getKatalog(): Promise<ApiResult<Katalog>> {
  if (cache) return { ok: true, data: cache };
  if (!laufend) {
    laufend = apiRequest<Katalog>("/catalog").then((res) => {
      if (res.ok) cache = res.data;
      laufend = null;
      return res;
    });
  }
  return laufend;
}

/** Der gewählte Bereich mit seinen Berufen und Aufgabenfeldern. */
export function bereichVon(
  katalog: Katalog | null,
  value: string | null,
): Bereich | null {
  if (!katalog || !value) return null;
  return katalog.bereiche.find((b) => b.value === value) ?? null;
}

/**
 * Wechselt der Ausbildungsbereich, passen Beruf und Aufgabenfelder des alten
 * Bereichs nicht mehr — sie werden verworfen statt ungültig stehen zu bleiben.
 */
export function bereichWechseln(
  profil: Handwerkerprofil,
  neuerBereich: string,
  katalog: Katalog | null,
): Handwerkerprofil {
  if (profil.bereich === neuerBereich) return profil;
  const b = bereichVon(katalog, neuerBereich);
  const gueltigeAufgaben = new Set(b?.aufgaben.map((a) => a.value) ?? []);
  return {
    ...profil,
    bereich: neuerBereich,
    beruf: null,
    // Aufgabenfelder, die es im neuen Bereich auch gibt, bleiben erhalten —
    // „Kundendienst" heißt überall dasselbe.
    aufgaben: profil.aufgaben.filter((a) => gueltigeAufgaben.has(a)),
  };
}
