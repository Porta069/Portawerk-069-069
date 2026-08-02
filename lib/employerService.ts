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

import type {
  ApiResult, Candidate, CandidateStatus, ContactRequest, EmployerProfile,
} from "./types";

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

/**
 * Grobe PLZ-Zuordnung. `city` liefert die sprechende Ortsangabe der Kandidaten
 * ("Landkreis München"), damit die Demodaten zur gesuchten Region passen.
 */
const PLZ_REGIONS: {
  prefix: string;
  region: string;
  city: string;
  lat: number;
  lng: number;
}[] = [
  { prefix: "0", region: "Sachsen / Leipzig", city: "Leipzig", lat: 51.34, lng: 12.37 },
  { prefix: "1", region: "Berlin / Brandenburg", city: "Berlin", lat: 52.52, lng: 13.4 },
  { prefix: "2", region: "Hamburg / Niedersachsen", city: "Hamburg", lat: 53.55, lng: 9.99 },
  { prefix: "3", region: "Hannover / Kassel", city: "Hannover", lat: 52.37, lng: 9.73 },
  { prefix: "4", region: "Ruhrgebiet / Münster", city: "Dortmund", lat: 51.51, lng: 7.47 },
  { prefix: "5", region: "Köln / Bonn", city: "Köln", lat: 50.94, lng: 6.96 },
  { prefix: "6", region: "Rhein-Main", city: "Frankfurt", lat: 50.11, lng: 8.68 },
  { prefix: "7", region: "Stuttgart / Baden", city: "Stuttgart", lat: 48.78, lng: 9.18 },
  { prefix: "8", region: "München / Oberbayern", city: "München", lat: 48.14, lng: 11.58 },
  { prefix: "9", region: "Nürnberg / Franken", city: "Nürnberg", lat: 49.45, lng: 11.08 },
];

export function regionForPlz(plz: string): string | null {
  const p = plz.trim();
  if (!/^\d{5}$/.test(p)) return null;
  return PLZ_REGIONS.find((r) => r.prefix === p[0])?.region ?? null;
}

// ── Kandidaten-Grunddaten ────────────────────────────────────────────────────
// Die Demodaten haengen bewusst NICHT an einer festen Leitregion: sonst liefert
// jede andere PLZ null Treffer und der Ablauf laesst sich nicht pruefen. Ort und
// Koordinaten werden zur gesuchten Region berechnet, `ortTyp` gibt nur die Art
// der Lage an ("Landkreis", "Stadtgebiet", ...).
const CANDIDATES: (Omit<
  Candidate,
  "distanceKm" | "status" | "matchScore" | "lat" | "lng" | "region"
> & {
  ortTyp: string;
  baseDistance: number;
})[] = [
  {
    id: "c-1", handle: "Elektriker #A47",
    gewerk: "Elektriker / Elektroniker", erfahrungJahre: 9,
    zertifikate: ["Gesellenbrief", "Führerschein Kl. BE"],
    ortTyp: "Landkreis", baseDistance: 11, radiusKm: 40,
    bereitschaft: ["Notdienst / Rufbereitschaft"], praeferenz: "Besseres Gehalt",
    gehaltVon: 3200, gehaltBis: 3900, verfuegbarAb: "Ab sofort", zuletztAktiv: "vor 2 Tagen",
  },
  {
    id: "c-2", handle: "Elektroniker #B12",
    gewerk: "Elektriker / Elektroniker", erfahrungJahre: 4,
    zertifikate: ["Gesellenbrief"],
    ortTyp: "Stadtgebiet", baseDistance: 6, radiusKm: 25,
    bereitschaft: ["Schichtarbeit"], praeferenz: "Kurzer Arbeitsweg",
    gehaltVon: 2900, gehaltBis: 3400, verfuegbarAb: "Ab 01.10.", zuletztAktiv: "gestern",
  },
  {
    id: "c-3", handle: "Meister SHK #C09",
    gewerk: "Installateur / Klempner (SHK)", erfahrungJahre: 16,
    zertifikate: ["Meisterbrief", "Gesellenbrief", "Führerschein Kl. BE"],
    ortTyp: "Umland", baseDistance: 28, radiusKm: 60,
    bereitschaft: ["Montage / Reisetätigkeit", "Notdienst / Rufbereitschaft"],
    praeferenz: "Aufstiegsmöglichkeiten",
    gehaltVon: 4200, gehaltBis: 5100, verfuegbarAb: "Ab 01.11.", zuletztAktiv: "vor 5 Tagen",
  },
  {
    id: "c-4", handle: "Anlagenmechaniker #D33",
    gewerk: "Installateur / Klempner (SHK)", erfahrungJahre: 7,
    zertifikate: ["Gesellenbrief", "Staplerschein"],
    ortTyp: "Stadtgebiet Nord", baseDistance: 9, radiusKm: 35,
    bereitschaft: [], praeferenz: "Gutes Team & Betriebsklima",
    gehaltVon: 3000, gehaltBis: 3600, verfuegbarAb: "Ab sofort", zuletztAktiv: "vor 3 Tagen",
  },
  {
    id: "c-5", handle: "Metallbauer #E58",
    gewerk: "Metallbauer / Schlosser", erfahrungJahre: 12,
    zertifikate: ["Gesellenbrief", "Schweißerpass", "Führerschein Kl. BE"],
    ortTyp: "Kreis", baseDistance: 22, radiusKm: 80,
    bereitschaft: ["Montage / Reisetätigkeit", "Umzug für den richtigen Job"],
    praeferenz: "Besseres Gehalt",
    gehaltVon: 3400, gehaltBis: 4200, verfuegbarAb: "Ab sofort", zuletztAktiv: "heute",
  },
  {
    id: "c-6", handle: "Tischler #F21",
    gewerk: "Tischler / Schreiner", erfahrungJahre: 5,
    zertifikate: ["Gesellenbrief"],
    ortTyp: "Landkreis", baseDistance: 17, radiusKm: 30,
    bereitschaft: [], praeferenz: "Kurzer Arbeitsweg",
    gehaltVon: 2800, gehaltBis: 3300, verfuegbarAb: "Ab 01.09.", zuletztAktiv: "vor 1 Woche",
  },
  {
    id: "c-7", handle: "Maler #G74",
    gewerk: "Maler & Lackierer", erfahrungJahre: 3,
    zertifikate: ["Gesellenbrief"],
    ortTyp: "Stadtgebiet Süd", baseDistance: 14, radiusKm: 25,
    bereitschaft: ["Schichtarbeit"], praeferenz: "Gutes Team & Betriebsklima",
    gehaltVon: 2600, gehaltBis: 3100, verfuegbarAb: "Ab sofort", zuletztAktiv: "vor 4 Tagen",
  },
  {
    id: "c-8", handle: "Dachdecker #H15",
    gewerk: "Dachdecker", erfahrungJahre: 11,
    zertifikate: ["Gesellenbrief", "Führerschein Kl. BE"],
    ortTyp: "Umland", baseDistance: 25, radiusKm: 50,
    bereitschaft: ["Montage / Reisetätigkeit"], praeferenz: "Besseres Gehalt",
    gehaltVon: 3100, gehaltBis: 3800, verfuegbarAb: "Ab sofort", zuletztAktiv: "vor 2 Tagen",
  },
];

// ── Anfrage-Status (localStorage bis zum Backend) ────────────────────────────

type StateMap = Record<string, { status: CandidateStatus; position: string; sentAt: string }>;

/**
 * Beispielanfragen, damit der Bereich nicht leer startet und der ganze Ablauf
 * nachvollziehbar ist: eine bereits freigegebene (Kontaktdaten sichtbar), eine
 * laufende (Kandidat entscheidet noch) und eine abgelehnte. Sobald der Nutzer
 * selbst eine Anfrage stellt, werden sie mitgespeichert.
 */
const DEMO_STATES: StateMap = {
  "c-1": { status: "freigegeben", position: "Elektriker Gebäudetechnik", sentAt: "vor 6 Tagen" },
  "c-3": { status: "angefragt", position: "Obermonteur SHK", sentAt: "vor 2 Tagen" },
  "c-6": { status: "abgelehnt", position: "Tischler Möbelbau", sentAt: "vor 3 Wochen" },
};

/** Kontaktdaten, die nach Freigabe sichtbar werden. */
const FREIGEGEBEN: Record<string, { name: string; telefon: string; email: string }> = {
  "c-1": { name: "Michael Brandt", telefon: "+49 170 2249104", email: "m.brandt@example.de" },
};

function readStates(): StateMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StateMap;
  } catch {
    /* defektes Storage ignorieren */
  }
  return { ...DEMO_STATES };
}

function writeStates(s: StateMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* Quota ignorieren */
  }
}

export type CandidateSort = "match" | "naehe" | "erfahrung" | "gehalt";

export interface CandidateFilters {
  /** Fünfstellige Postleitzahl — Ausgangspunkt der Suche. */
  plz: string;
  /** Suchradius in km. */
  radiusKm: number;
  /** Mindest-Berufserfahrung in Jahren. */
  minErfahrung?: number;
  /** Obergrenze der Gehaltsvorstellung (Einstiegswert). */
  maxGehalt?: number;
  /** Nur sofort verfügbare Kandidaten. */
  nurSofort?: boolean;
  /** Geforderte Qualifikationen (alle müssen vorliegen). */
  zertifikate?: string[];
  /** Geforderte Bereitschaft (alle müssen vorliegen). */
  bereitschaft?: string[];
  sort?: CandidateSort;
}

/** Auswahlwerte für die Filter-Sektion. */
export const ZERTIFIKAT_OPTIONEN = [
  "Meisterbrief",
  "Gesellenbrief",
  "Führerschein Kl. BE",
  "Staplerschein",
  "Schweißerpass",
];

export const BEREITSCHAFT_OPTIONEN = [
  "Montage / Reisetätigkeit",
  "Schichtarbeit",
  "Notdienst / Rufbereitschaft",
  "Umzug für den richtigen Job",
];

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

  const home = PLZ_REGIONS.find((r) => r.prefix === prefix) ?? PLZ_REGIONS[0];

  const out = CANDIDATES.map((c) => {
    const distanceKm = c.baseDistance;

    // Match-Score: Nähe, Erfahrung und ob der Kandidat selbst so weit fahren will.
    const nahe = Math.max(0, 1 - distanceKm / Math.max(f.radiusKm, 1));
    const willFahren = distanceKm <= c.radiusKm ? 1 : 0.45;
    const erfahrung = Math.min(1, c.erfahrungJahre / 12);
    const matchScore = Math.round((nahe * 0.5 + willFahren * 0.3 + erfahrung * 0.2) * 100);

    // Kartenposition: Regionsmittelpunkt plus fester Versatz. Bewusst grob —
    // die Karte zeigt Dichte, niemals eine Adresse.
    const spread = (Number(c.id.replace(/\D/g, "")) || 1) * 0.037;

    const st = states[c.id];
    const status = (st?.status ?? "verfuegbar") as CandidateStatus;
    return {
      ...c,
      region: `${c.ortTyp} ${home.city}`,
      // Klartextdaten nur bei Freigabe — sonst gar nicht erst im Objekt.
      ...(status === "freigegeben" && FREIGEGEBEN[c.id]
        ? { freigegeben: FREIGEGEBEN[c.id] }
        : {}),
      lat: home.lat + (spread % 0.31) - 0.15,
      lng: home.lng + ((spread * 1.7) % 0.42) - 0.21,
      distanceKm: Math.round(distanceKm),
      matchScore,
      status: (st?.status ?? "verfuegbar") as CandidateStatus,
    };
  })
    .filter((c) => c.distanceKm <= f.radiusKm)
    .filter((c) => (f.minErfahrung ? c.erfahrungJahre >= f.minErfahrung : true))
    .filter((c) => (f.maxGehalt ? c.gehaltVon <= f.maxGehalt : true))
    .filter((c) => (f.nurSofort ? c.verfuegbarAb === "Ab sofort" : true))
    .filter((c) => (f.zertifikate ?? []).every((z) => c.zertifikate.includes(z)))
    .filter((c) => (f.bereitschaft ?? []).every((b) => c.bereitschaft.includes(b)))
    .sort((a, b) => {
      switch (f.sort) {
        case "naehe":
          return a.distanceKm - b.distanceKm;
        case "erfahrung":
          return b.erfahrungJahre - a.erfahrungJahre;
        case "gehalt":
          return a.gehaltVon - b.gehaltVon;
        default:
          return b.matchScore - a.matchScore;
      }
    });

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
        region: `${base.ortTyp} ${PLZ_REGIONS[8].city}`,
        ...(st.status === "freigegeben" && FREIGEGEBEN[id]
          ? { freigegeben: FREIGEGEBEN[id] }
          : {}),
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


// ── Unternehmensprofil ───────────────────────────────────────────────────────
// Später: GET/PATCH /employer/profile. Bis dahin localStorage.

const PROFILE_KEY = "portawerk_employer_profile_v1";

/**
 * Bewusst kurz gehalten: Werkzeug, Arbeitskleidung oder ein "junges Team"
 * setzt im Handwerk jeder voraus — solche Chips fuellen das Profil, ohne zu
 * unterscheiden. Hier stehen nur Punkte, bei denen sich Betriebe wirklich
 * unterscheiden.
 */
export const BENEFIT_OPTIONEN = [
  "Firmenwagen",
  "Unbefristeter Vertrag",
  "Übertarifliche Bezahlung",
  "4-Tage-Woche",
  "Weiterbildung & Schulungen",
  "Betriebliche Altersvorsorge",
];

export const MONTAGE_OPTIONEN = [
  "Jeden Abend zuhause",
  "Gelegentlich Montage",
  "Dauermontage",
];

const EMPTY_PROFILE: EmployerProfile = {
  firmenname: "",
  slogan: "",
  gruendungsjahr: "",
  mitarbeiter: "",
  strasse: "",
  plz: "",
  ort: "",
  website: "",
  ueberUns: "",
  kontaktName: "",
  kontaktPosition: "",
  kontaktTelefon: "",
  kontaktEmail: "",
  benefits: [],
  montage: "",
  urlaubstage: "",
  logo: "",
};

export async function getEmployerProfile(): Promise<ApiResult<EmployerProfile>> {
  await delay(120);
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      return { ok: true, data: { ...EMPTY_PROFILE, ...(JSON.parse(raw) as EmployerProfile) } };
    }
    // PLZ aus der Anfrage übernehmen, damit das Profil nicht bei null startet.
    const plz = getStoredPlz();
    return { ok: true, data: { ...EMPTY_PROFILE, plz } };
  } catch {
    return { ok: true, data: EMPTY_PROFILE };
  }
}

export async function saveEmployerProfile(
  p: EmployerProfile
): Promise<ApiResult<EmployerProfile>> {
  await delay(320);
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    return { ok: false, error: "Profil konnte nicht gespeichert werden." };
  }
  if (/^\d{5}$/.test(p.plz)) storePlz(p.plz);
  return { ok: true, data: p };
}

/**
 * Wie vollständig ist das Profil — und was bringt der nächste Schritt?
 * Bewusst mit beziffertem Nutzen statt nackter Prozentzahl.
 */
export function profileGaps(p: EmployerProfile): { label: string; hint: string }[] {
  const gaps: { label: string; hint: string }[] = [];
  if (!p.logo) gaps.push({ label: "Logo hinterlegen", hint: "Angebote mit Logo werden häufiger geöffnet" });
  if (!p.ueberUns.trim()) gaps.push({ label: "Über uns ausfüllen", hint: "Handwerker wollen wissen, wo sie landen" });
  if (!p.kontaktName.trim()) gaps.push({ label: "Ansprechpartner nennen", hint: "Ein Name schafft mehr Vertrauen als eine GmbH" });
  if (p.benefits.length < 2) gaps.push({ label: "Mindestens 2 Leistungen angeben", hint: "Sie erscheinen als Chips im Angebot" });
  if (!p.montage) gaps.push({ label: "Montageaufkommen angeben", hint: "Für Handwerker das wichtigste Kriterium" });
  if (!p.urlaubstage) gaps.push({ label: "Urlaubstage eintragen", hint: "Wird direkt mit anderen Betrieben verglichen" });
  if (!p.slogan.trim()) gaps.push({ label: "Kurzbeschreibung ergänzen", hint: "Steht im Angebot direkt unter dem Namen" });
  return gaps;
}

/** Anteil ausgefüllter Kernangaben in Prozent. */
export function profileScore(p: EmployerProfile): number {
  const checks = [
    !!p.firmenname.trim(),
    !!p.slogan.trim(),
    !!p.plz && !!p.ort,
    !!p.ueberUns.trim(),
    !!p.kontaktName.trim(),
    !!p.kontaktTelefon.trim(),
    p.benefits.length >= 2,
    !!p.montage,
    !!p.urlaubstage,
    !!p.logo,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
