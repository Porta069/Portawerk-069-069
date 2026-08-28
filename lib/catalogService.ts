// ─── Fachkatalog ──────────────────────────────────────────────────────────────
// Gewerke mit ihren Ausbildungsberufen, Aufgabenfeldern und Meisterabschlüssen
// sowie alle festen Antwortskalen. Der Katalog liegt im Backend
// (`src/matching/catalog.ts`) und wird hier nur geholt — sonst könnten
// Registrierung und Matching mit der Zeit unterschiedliche Listen kennen, und
// eine Antwort, die es im Katalog nicht gibt, wird beim Bewerten still
// übersprungen.

import { apiRequest, type ApiResult } from "./api";

export interface KatalogOption {
  value: string;
  label: string;
  hint?: string;
}

export interface RangOption extends KatalogOption {
  rang: number;
}

export interface Gewerk {
  value: string;
  label: string;
  berufe: KatalogOption[];
  aufgaben: KatalogOption[];
  meister: KatalogOption[];
}

export interface Katalog {
  gewerke: Gewerk[];
  abschluss: RangOption[];
  erfahrung: RangOption[];
  wuensche: KatalogOption[];
  wuenscheMax: number;
  montage: RangOption[];
  fuehrerschein: RangOption[];
  deutsch: RangOption[];
  start: RangOption[];
  gehaltPerioden: KatalogOption[];
  stundenProMonat: number;
  monateProJahr: number;
}

/** Die Antworten des Handwerkers — die Fragen des Anmelde-Funnels. */
export interface Handwerkerprofil {
  gewerk: string | null;
  abschluss: string | null;
  berufsbezeichnung: string;
  erfahrung: string | null;
  fuehrung: boolean | null;
  studium: string;
  meisterQualifikation: string | null;
  meisterQualifikationFrei: string;
  ausbildungsberuf: string | null;
  aufgaben: string[];
  wuensche: string[];
  montage: string | null;
  fuehrerschein: string | null;
  deutsch: string | null;
  start: string | null;
  gehaltPeriode: string | null;
  /** In Cent. null = Frage übersprungen. */
  gehaltBetragCents: number | null;
}

export const LEERES_PROFIL: Handwerkerprofil = {
  gewerk: null,
  abschluss: null,
  berufsbezeichnung: "",
  erfahrung: null,
  fuehrung: null,
  studium: "",
  meisterQualifikation: null,
  meisterQualifikationFrei: "",
  ausbildungsberuf: null,
  aufgaben: [],
  wuensche: [],
  montage: null,
  fuehrerschein: null,
  deutsch: null,
  start: null,
  gehaltPeriode: null,
  gehaltBetragCents: null,
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

/** Das gewählte Gewerk mit seinen Berufen, Aufgaben und Meisterabschlüssen. */
export function gewerkVon(
  katalog: Katalog | null,
  value: string | null,
): Gewerk | null {
  if (!katalog || !value) return null;
  return katalog.gewerke.find((g) => g.value === value) ?? null;
}

/**
 * Wechselt das Gewerk, passen Ausbildungsberuf, Aufgabenfelder und
 * Meisterabschluss des alten nicht mehr — sie werden verworfen statt ungültig
 * stehen zu bleiben. Andernfalls schickte das Formular Werte, die das Backend
 * zurückweist, und der Nutzer sähe eine Fehlermeldung ohne erkennbaren Grund.
 */
export function gewerkWechseln(
  profil: Handwerkerprofil,
  neuesGewerk: string,
  katalog: Katalog | null,
): Handwerkerprofil {
  if (profil.gewerk === neuesGewerk) return profil;
  const g = gewerkVon(katalog, neuesGewerk);
  const gueltigeAufgaben = new Set(g?.aufgaben.map((a) => a.value) ?? []);
  return {
    ...profil,
    gewerk: neuesGewerk,
    ausbildungsberuf: null,
    meisterQualifikation: null,
    // Aufgabenfelder, die es im neuen Gewerk auch gibt, bleiben erhalten —
    // „Kundendienst" heißt überall dasselbe.
    aufgaben: profil.aufgaben.filter((a) => gueltigeAufgaben.has(a)),
  };
}

/**
 * Rechnet einen Betrag zwischen den Perioden um — dieselben Größen wie im
 * Backend (`catalog.ts`), damit der Schieberegler nichts anderes anzeigt als
 * später gespeichert wird.
 */
export function gehaltUmrechnen(
  katalog: Katalog | null,
  vonPeriode: string,
  nachPeriode: string,
  betragCents: number,
): number {
  const std = katalog?.stundenProMonat ?? 173;
  const mon = katalog?.monateProJahr ?? 12;
  const proMonat =
    vonPeriode === "stuendlich"
      ? betragCents * std
      : vonPeriode === "jaehrlich"
        ? betragCents / mon
        : betragCents;
  const raus =
    nachPeriode === "stuendlich"
      ? proMonat / std
      : nachPeriode === "jaehrlich"
        ? proMonat * mon
        : proMonat;
  return Math.round(raus);
}

/** Ist der Fachteil vollständig genug, um ihn abzuschicken? */
export function profilVollstaendig(p: Handwerkerprofil): boolean {
  if (!p.gewerk || !p.abschluss) return false;
  if (p.berufsbezeichnung.trim().length === 0) return false;
  if (!p.erfahrung || p.fuehrung === null) return false;
  if (p.abschluss === "studium" && p.studium.trim().length === 0) return false;
  if (
    p.abschluss === "meister_techniker" &&
    !p.meisterQualifikation &&
    p.meisterQualifikationFrei.trim().length === 0
  ) {
    return false;
  }
  return !!(p.montage && p.fuehrerschein && p.deutsch && p.start);
}

/** Was an das Backend geht — genau die Felder, die `profilFelder` erwartet. */
export function profilFuerBackend(p: Handwerkerprofil) {
  return {
    gewerk: p.gewerk,
    abschluss: p.abschluss,
    berufsbezeichnung: p.berufsbezeichnung.trim(),
    erfahrung: p.erfahrung,
    fuehrung: p.fuehrung === true,
    studium: p.abschluss === "studium" ? p.studium.trim() : null,
    meisterQualifikation:
      p.abschluss === "meister_techniker" ? p.meisterQualifikation : null,
    meisterQualifikationFrei:
      p.abschluss === "meister_techniker" && !p.meisterQualifikation
        ? p.meisterQualifikationFrei.trim()
        : null,
    ausbildungsberuf: p.ausbildungsberuf,
    aufgaben: p.aufgaben,
    wuensche: p.wuensche,
    montage: p.montage,
    fuehrerschein: p.fuehrerschein,
    deutsch: p.deutsch,
    start: p.start,
    gehaltPeriode: p.gehaltBetragCents == null ? null : p.gehaltPeriode,
    gehaltBetragCents: p.gehaltBetragCents,
  };
}
