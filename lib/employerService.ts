"use client";

// ─── Arbeitgeber-Service (MOCK) ──────────────────────────────────────────────
// Es gibt noch keine Backend-Endpunkte für die Kandidatensuche. Gleiche
// ApiResult-Form wie lib/api.ts, damit der spätere Tausch nur den Import kostet:
//
//   GET  /employer/candidates?plz=&radius=  → searchCandidates()
//   POST /employer/candidates/:id/request   → requestContact()
//   GET  /employer/requests                 → listRequests()
//
// Wichtig: Kandidaten werden hier grundsätzlich ohne Namen und ohne
// Kontaktdaten geführt. Diese Felder existieren in der Arbeitgeber-Sicht
// bewusst gar nicht — Freigabe passiert ausschließlich beim Kandidaten.

import type { ApiResult, Candidate, CandidateStatus, ContactRequest } from "./types";

export const EMPLOYER_DATA_IS_MOCKED = true;

const STORAGE_KEY = "portawerk_employer_requests_v1";

/**
 * PLZ aus der Anfrage auf /arbeitgeber. Wird dort beim Absenden gesetzt und
 * belegt die Kandidatensuche vor — der Betrieb tippt sie nicht zweimal.
 */
export const EMPLOYER_PLZ_KEY = "portawerk_employer_plz_v1";

export function getStoredPlz(): string {
  try {
    return localStorage.getItem(EMPLOYER_PLZ_KEY) ?? "";
  } catch {
    return "";
  }
}

export function storePlz(plz: string) {
  try {
    localStorage.setItem(EMPLOYER_PLZ_KEY, plz);
  } catch {
    /* Storage nicht verfuegbar */
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Grobe PLZ-Zuordnung für die Distanzberechnung im Mock. */
const PLZ_REGIONS: { prefix: string; region: string; lat: number; lng: number }[] = [
  { prefix: "0", region: "Sachsen / Leipzig", lat: 51.34, lng: 12.37 },
  { prefix: "1", region: "Berlin / Brandenburg", lat: 52.52, lng: 13.4 },
  { prefix: "2", region: "Hamburg / Niedersachsen", lat: 53.55, lng: 9.99 },
  { prefix: "3", region: "Hannover / Kassel", lat: 52.37, lng: 9.73 },
  { prefix: "4", region: "Ruhrgebiet / Münster", lat: 51.51, lng: 7.47 },
  { prefix: "5", region: "Köln / Bonn", lat: 50.94, lng: 6.96 },
  { prefix: "6", region: "Rhein-Main", lat: 50.11, lng: 8.68 },
  { prefix: "7", region: "Stuttgart / Baden", lat: 48.78, lng: 9.18 },
  { prefix: "8", region: "München / Oberbayern", lat: 48.14, lng: 11.58 },
  { prefix: "9", region: "Nürnberg / Franken", lat: 49.45, lng: 11.08 },
];

export function regionForPlz(plz: string): string | null {
  const p = plz.trim();
  if (!/^\d{5}$/.test(p)) return null;
  return PLZ_REGIONS.find((r) => r.prefix === p[0])?.region ?? null;
}

// ── Kandidaten-Grunddaten ────────────────────────────────────────────────────
// `plzPrefix` steuert, in welcher Region ein Kandidat auftaucht.
const CANDIDATES: (Omit<Candidate, "distanceKm" | "status" | "matchScore" | "lat" | "lng"> & {
  plzPrefix: string;
  baseDistance: number;
})[] = [
  {
    id: "c-1", handle: "Elektriker #A47", plzPrefix: "8",
    gewerk: "Elektriker / Elektroniker", erfahrungJahre: 9,
    zertifikate: ["Gesellenbrief", "Führerschein Kl. BE"],
    region: "Landkreis München", baseDistance: 11, radiusKm: 40,
    bereitschaft: ["Notdienst / Rufbereitschaft"], praeferenz: "Besseres Gehalt",
    gehaltVon: 3200, gehaltBis: 3900, verfuegbarAb: "Ab sofort", zuletztAktiv: "vor 2 Tagen",
  },
  {
    id: "c-2", handle: "Elektroniker #B12", plzPrefix: "8",
    gewerk: "Elektriker / Elektroniker", erfahrungJahre: 4,
    zertifikate: ["Gesellenbrief"],
    region: "München Stadt", baseDistance: 6, radiusKm: 25,
    bereitschaft: ["Schichtarbeit"], praeferenz: "Kurzer Arbeitsweg",
    gehaltVon: 2900, gehaltBis: 3400, verfuegbarAb: "Ab 01.10.", zuletztAktiv: "gestern",
  },
  {
    id: "c-3", handle: "Meister SHK #C09", plzPrefix: "8",
    gewerk: "Installateur / Klempner (SHK)", erfahrungJahre: 16,
    zertifikate: ["Meisterbrief", "Gesellenbrief", "Führerschein Kl. BE"],
    region: "Landkreis Freising", baseDistance: 28, radiusKm: 60,
    bereitschaft: ["Montage / Reisetätigkeit", "Notdienst / Rufbereitschaft"],
    praeferenz: "Aufstiegsmöglichkeiten",
    gehaltVon: 4200, gehaltBis: 5100, verfuegbarAb: "Ab 01.11.", zuletztAktiv: "vor 5 Tagen",
  },
  {
    id: "c-4", handle: "Anlagenmechaniker #D33", plzPrefix: "2",
    gewerk: "Installateur / Klempner (SHK)", erfahrungJahre: 7,
    zertifikate: ["Gesellenbrief", "Staplerschein"],
    region: "Hamburg Nord", baseDistance: 9, radiusKm: 35,
    bereitschaft: [], praeferenz: "Gutes Team & Betriebsklima",
    gehaltVon: 3000, gehaltBis: 3600, verfuegbarAb: "Ab sofort", zuletztAktiv: "vor 3 Tagen",
  },
  {
    id: "c-5", handle: "Metallbauer #E58", plzPrefix: "4",
    gewerk: "Metallbauer / Schlosser", erfahrungJahre: 12,
    zertifikate: ["Gesellenbrief", "Schweißerpass", "Führerschein Kl. BE"],
    region: "Kreis Unna", baseDistance: 22, radiusKm: 80,
    bereitschaft: ["Montage / Reisetätigkeit", "Umzug für den richtigen Job"],
    praeferenz: "Besseres Gehalt",
    gehaltVon: 3400, gehaltBis: 4200, verfuegbarAb: "Ab sofort", zuletztAktiv: "heute",
  },
  {
    id: "c-6", handle: "Tischler #F21", plzPrefix: "7",
    gewerk: "Tischler / Schreiner", erfahrungJahre: 5,
    zertifikate: ["Gesellenbrief"],
    region: "Kreis Ludwigsburg", baseDistance: 17, radiusKm: 30,
    bereitschaft: [], praeferenz: "Kurzer Arbeitsweg",
    gehaltVon: 2800, gehaltBis: 3300, verfuegbarAb: "Ab 01.09.", zuletztAktiv: "vor 1 Woche",
  },
  {
    id: "c-7", handle: "Maler #G74", plzPrefix: "1",
    gewerk: "Maler & Lackierer", erfahrungJahre: 3,
    zertifikate: ["Gesellenbrief"],
    region: "Berlin Süd", baseDistance: 14, radiusKm: 25,
    bereitschaft: ["Schichtarbeit"], praeferenz: "Gutes Team & Betriebsklima",
    gehaltVon: 2600, gehaltBis: 3100, verfuegbarAb: "Ab sofort", zuletztAktiv: "vor 4 Tagen",
  },
  {
    id: "c-8", handle: "Dachdecker #H15", plzPrefix: "5",
    gewerk: "Dachdecker", erfahrungJahre: 11,
    zertifikate: ["Gesellenbrief", "Führerschein Kl. BE"],
    region: "Rhein-Sieg-Kreis", baseDistance: 25, radiusKm: 50,
    bereitschaft: ["Montage / Reisetätigkeit"], praeferenz: "Besseres Gehalt",
    gehaltVon: 3100, gehaltBis: 3800, verfuegbarAb: "Ab sofort", zuletztAktiv: "vor 2 Tagen",
  },
];

// ── Anfrage-Status (localStorage bis zum Backend) ────────────────────────────

type StateMap = Record<string, { status: CandidateStatus; position: string; sentAt: string }>;

function readStates(): StateMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StateMap) : {};
  } catch {
    return {};
  }
}

function writeStates(s: StateMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* Quota ignorieren */
  }
}

export interface CandidateFilters {
  /** Fünfstellige Postleitzahl — Ausgangspunkt der Suche. */
  plz: string;
  /** Suchradius in km. */
  radiusKm: number;
  gewerke?: string[];
  minErfahrung?: number;
  maxGehalt?: number;
  /** Nur Kandidaten, die zu Montage bereit sind. */
  montagebereit?: boolean;
}

/**
 * Sucht Kandidaten rund um eine PLZ. Distanz wird im Mock aus der
 * PLZ-Leitregion abgeleitet: gleiche Leitzahl = Grunddistanz, sonst weit weg.
 */
export async function searchCandidates(
  f: CandidateFilters
): Promise<ApiResult<Candidate[]>> {
  await delay(320);

  if (!/^\d{5}$/.test(f.plz.trim())) {
    return { ok: false, error: "Bitte gib eine fünfstellige Postleitzahl ein." };
  }

  const prefix = f.plz.trim()[0];
  const states = readStates();

  const out = CANDIDATES.map((c) => {
    // Gleiche Leitregion → echte Nähe; andere Region → deutlich weiter.
    const distanceKm =
      c.plzPrefix === prefix ? c.baseDistance : c.baseDistance + 180 + Number(c.plzPrefix) * 7;

    // Match-Score: Nähe, Erfahrung und ob der Kandidat selbst so weit fahren will.
    const nahe = Math.max(0, 1 - distanceKm / Math.max(f.radiusKm, 1));
    const willFahren = distanceKm <= c.radiusKm ? 1 : 0.45;
    const erfahrung = Math.min(1, c.erfahrungJahre / 12);
    const matchScore = Math.round((nahe * 0.5 + willFahren * 0.3 + erfahrung * 0.2) * 100);

    // Kartenposition: Regionsmittelpunkt plus fester Versatz. Bewusst grob —
    // die Karte zeigt Dichte, niemals eine Adresse.
    const home = PLZ_REGIONS.find((r) => r.prefix === c.plzPrefix) ?? PLZ_REGIONS[0];
    const spread = (Number(c.id.replace(/\D/g, "")) || 1) * 0.037;

    const st = states[c.id];
    return {
      ...c,
      lat: home.lat + (spread % 0.31) - 0.15,
      lng: home.lng + ((spread * 1.7) % 0.42) - 0.21,
      distanceKm: Math.round(distanceKm),
      matchScore,
      status: (st?.status ?? "verfuegbar") as CandidateStatus,
    };
  })
    .filter((c) => c.distanceKm <= f.radiusKm)
    .filter((c) => (f.gewerke?.length ? f.gewerke.includes(c.gewerk) : true))
    .filter((c) => (f.minErfahrung ? c.erfahrungJahre >= f.minErfahrung : true))
    .filter((c) => (f.maxGehalt ? c.gehaltVon <= f.maxGehalt : true))
    .filter((c) =>
      f.montagebereit ? c.bereitschaft.includes("Montage / Reisetätigkeit") : true
    )
    .sort((a, b) => b.matchScore - a.matchScore);

  return { ok: true, data: out };
}

/**
 * Fragt den Kontakt an. Der Betrieb bekommt KEINE Daten — der Kandidat
 * entscheidet. Bis dahin steht die Anfrage auf "angefragt".
 */
export async function requestContact(
  candidateId: string,
  position: string
): Promise<ApiResult<{ status: CandidateStatus }>> {
  await delay(340);
  const states = readStates();
  states[candidateId] = { status: "angefragt", position, sentAt: "gerade eben" };
  writeStates(states);
  return { ok: true, data: { status: "angefragt" } };
}

/** Bereits gestellte Anfragen inkl. Status. */
export async function listRequests(): Promise<ApiResult<ContactRequest[]>> {
  await delay(180);
  const states = readStates();
  const out: ContactRequest[] = Object.entries(states).map(([id, st]) => {
    const base = CANDIDATES.find((c) => c.id === id)!;
    return {
      id: `req-${id}`,
      candidate: {
        ...base,
        lat: 0,
        lng: 0,
        distanceKm: base.baseDistance,
        matchScore: 0,
        status: st.status,
      },
      position: st.position,
      sentAt: st.sentAt,
      status: st.status as Exclude<CandidateStatus, "verfuegbar">,
    };
  });
  return { ok: true, data: out };
}
