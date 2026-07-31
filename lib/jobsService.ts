"use client";

// ─── Jobbörse-Service (MOCK) ─────────────────────────────────────────────────
// Es gibt noch keine Backend-Endpunkte für Stellen, Angebote und Bewerbungen.
// Dieser Service liefert dieselbe ApiResult-Form wie lib/api.ts, damit der
// spätere Tausch auf echte Endpunkte nur den Import kostet:
//
//   GET   /jobs                     → listJobs()
//   GET   /me/offers                → listOffers()
//   POST  /me/offers/:id/respond    → respondToOffer()
//   GET   /me/applications          → listApplications()
//   GET   /me/profile-score         → getProfileScore()
//
// Der Annahme-/Ablehn-Status wird bis dahin in localStorage gehalten, damit sich
// die Oberfläche im Test wie die spätere Anwendung verhält.

import type {
  ApiResult,
  Application,
  Job,
  JobOffer,
  OfferStatus,
  ProfileScore,
  WorkLocation,
} from "./types";

/** Erkennbar für die UI: solange true, ist alles Demodaten. */
export const JOBS_ARE_MOCKED = true;

const STORAGE_KEY = "portawerk_offer_states_v1";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Stellen ──────────────────────────────────────────────────────────────────

const JOBS: Job[] = [
  {
    id: "job-1",
    lat: 48.1374,
    lng: 11.5755,
    startLabel: "Garching",
    startLat: 48.2489,
    startLng: 11.6512,
    title: "Elektriker / Elektroniker (m/w/d)",
    employer: "Stadtwerke Technik GmbH",
    gewerk: "Elektriker / Elektroniker",
    city: "München",
    distanceKm: 12.4,
    travelMinutes: 21,
    salaryMin: 3000,
    salaryMax: 3800,
    marketAvg: 3250,
    tags: ["Gebäudetechnik", "Elektrotechnik"],
    image: "/images/elektriker-werkstatt.jpg",
    recommended: true,
    respondsInDays: 2,
    matchReasons: ["Dein Gewerk", "21 Min. von deinem Arbeitsort", "Keine Montage"],
    conditions: {
      montage: "Jeden Abend zuhause",
      fahrzeitIstArbeitszeit: true,
      startpunkt: "Haustür",
      urlaubstage: 30,
      start: "Ab sofort",
      extras: ["Firmenwagen", "Unbefristet"],
    },
  },
  {
    id: "job-2",
    lat: 53.5511,
    lng: 9.9937,
    startLabel: "Norderstedt",
    startLat: 53.6858,
    startLng: 9.9807,
    title: "Anlagenmechaniker SHK (m/w/d)",
    employer: "Nordwärme Haustechnik",
    gewerk: "Installateur / Klempner (SHK)",
    city: "Hamburg",
    distanceKm: 8.1,
    travelMinutes: 16,
    salaryMin: 2900,
    salaryMax: 3600,
    marketAvg: 3100,
    tags: ["Sanitär", "Heizung", "Wärmepumpe"],
    image: "/images/shk-heizung.jpg",
    respondsInDays: 3,
    matchReasons: ["Dein Gewerk", "16 Min. Fahrzeit"],
    conditions: {
      montage: "Jeden Abend zuhause",
      fahrzeitIstArbeitszeit: true,
      startpunkt: "Haustür",
      urlaubstage: 30,
      start: "Ab sofort",
      extras: ["Weiterbildung"],
    },
  },
  {
    id: "job-3",
    lat: 52.5200,
    lng: 13.4050,
    startLabel: "Potsdam",
    startLat: 52.3906,
    startLng: 13.0645,
    title: "Maler & Lackierer (m/w/d)",
    employer: "Farbwerk Berlin GmbH",
    gewerk: "Maler & Lackierer",
    city: "Berlin",
    distanceKm: 24.7,
    travelMinutes: 38,
    salaryMin: 2600,
    salaryMax: 3200,
    marketAvg: 2850,
    tags: ["Innenausbau", "Lackierung"],
    image: "/images/maler-leiter.jpg",
    respondsInDays: 5,
    matchReasons: ["Flexible Arbeitszeiten"],
    conditions: {
      montage: "Gelegentlich Montage",
      fahrzeitIstArbeitszeit: false,
      startpunkt: "Betrieb",
      urlaubstage: 28,
      start: "Ab 01.09.",
      extras: ["Gutes Team"],
    },
  },
  {
    id: "job-4",
    lat: 51.5136,
    lng: 7.4653,
    startLabel: "Hagen",
    startLat: 51.3671,
    startLng: 7.4633,
    title: "Metallbauer / Schlosser (m/w/d)",
    employer: "Stahlbau Weber KG",
    gewerk: "Metallbauer / Schlosser",
    city: "Dortmund",
    distanceKm: 31.2,
    travelMinutes: 42,
    salaryMin: 3200,
    salaryMax: 4100,
    marketAvg: 3400,
    tags: ["Schweißen", "Konstruktion"],
    image: "/images/metallbau-schweisser.jpg",
    respondsInDays: 2,
    matchReasons: ["Überdurchschnittliches Gehalt"],
    conditions: {
      montage: "Dauermontage",
      fahrzeitIstArbeitszeit: true,
      startpunkt: "Haustür",
      urlaubstage: 30,
      start: "Ab sofort",
      extras: ["Auslöse", "Schichtzulage"],
    },
  },
  {
    id: "job-5",
    lat: 48.7758,
    lng: 9.1829,
    startLabel: "Ludwigsburg",
    startLat: 48.8974,
    startLng: 9.1916,
    title: "Tischler / Schreiner (m/w/d)",
    employer: "Holzmanufaktur Süd",
    gewerk: "Tischler / Schreiner",
    city: "Stuttgart",
    distanceKm: 17.9,
    travelMinutes: 27,
    salaryMin: 2800,
    salaryMax: 3400,
    marketAvg: 3000,
    tags: ["Möbelbau", "Innenausbau"],
    image: "/images/tischler-hobel.jpg",
    respondsInDays: 4,
    matchReasons: ["Kein Montageaufkommen"],
    conditions: {
      montage: "Jeden Abend zuhause",
      fahrzeitIstArbeitszeit: false,
      startpunkt: "Betrieb",
      urlaubstage: 28,
      start: "Ab sofort",
    },
  },
  {
    id: "job-6",
    lat: 51.3397,
    lng: 12.3731,
    startLabel: "Halle (Saale)",
    startLat: 51.4826,
    startLng: 11.9698,
    title: "Maurer / Betonbauer (m/w/d)",
    employer: "Bauunternehmung Reichert",
    gewerk: "Maurer / Betonbauer",
    city: "Leipzig",
    distanceKm: 44.3,
    travelMinutes: 51,
    salaryMin: 2900,
    salaryMax: 3500,
    marketAvg: 3050,
    tags: ["Rohbau", "Hochbau"],
    image: "/images/maurer-ziegel.jpg",
    respondsInDays: 6,
    conditions: {
      montage: "Gelegentlich Montage",
      fahrzeitIstArbeitszeit: true,
      startpunkt: "Betrieb",
      urlaubstage: 30,
      start: "Ab sofort",
      extras: ["Winterausgleich"],
    },
  },
];

export interface JobFilters {
  query?: string;
  gewerke?: string[];
  /** Maximale Fahrzeit in Minuten. */
  maxTravelMinutes?: number;
  minSalary?: number;
  /** Nur Stellen ohne Dauermontage. */
  abendsZuhause?: boolean;
  fahrzeitIstArbeitszeit?: boolean;
}

export type JobSort = "relevanz" | "fahrzeit" | "gehalt";

export async function listJobs(
  filters: JobFilters = {},
  sort: JobSort = "relevanz"
): Promise<ApiResult<Job[]>> {
  await delay(240);
  const q = filters.query?.trim().toLowerCase() ?? "";

  let out = JOBS.filter((j) => {
    if (q && !`${j.title} ${j.employer} ${j.city} ${j.gewerk} ${j.tags.join(" ")}`
        .toLowerCase()
        .includes(q)) return false;
    if (filters.gewerke?.length && !filters.gewerke.includes(j.gewerk)) return false;
    if (filters.maxTravelMinutes && j.travelMinutes > filters.maxTravelMinutes) return false;
    if (filters.minSalary && j.salaryMax < filters.minSalary) return false;
    if (filters.abendsZuhause && j.conditions.montage !== "Jeden Abend zuhause") return false;
    if (filters.fahrzeitIstArbeitszeit && !j.conditions.fahrzeitIstArbeitszeit) return false;
    return true;
  });

  out = [...out].sort((a, b) => {
    if (sort === "fahrzeit") return a.travelMinutes - b.travelMinutes;
    if (sort === "gehalt") return b.salaryMax - a.salaryMax;
    // Relevanz: Empfehlungen zuerst, dann kurze Fahrzeit
    if (!!b.recommended !== !!a.recommended) return b.recommended ? 1 : -1;
    return a.travelMinutes - b.travelMinutes;
  });

  return { ok: true, data: out };
}

// ── Angebote ─────────────────────────────────────────────────────────────────

const BASE_OFFERS: Omit<JobOffer, "status">[] = [
  {
    id: "offer-1",
    job: JOBS[0],
    contactPerson: "Andreas Vogt",
    receivedAt: "vor 7 Stunden",
    message:
      "wir haben dein Profil gesehen und suchen genau deine Erfahrung für unsere Gebäudetechnik. Du wärst jeden Abend zuhause, die Anfahrt zählt bei uns als Arbeitszeit. Melde dich gern für ein kurzes Gespräch.",
  },
  {
    id: "offer-2",
    job: JOBS[3],
    contactPerson: "Kevin Reuter",
    receivedAt: "vor 3 Tagen",
    message:
      "für unsere Stahlbau-Projekte suchen wir Verstärkung. Wir zahlen über Tarif und bieten Auslöse bei Montage. Wenn Reisetätigkeit für dich passt, sollten wir sprechen.",
  },
];

type StateMap = Record<string, OfferStatus>;

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

export async function listOffers(): Promise<ApiResult<JobOffer[]>> {
  await delay(200);
  const states = readStates();
  return {
    ok: true,
    data: BASE_OFFERS.map((o) => ({ ...o, status: states[o.id] ?? "neu" })),
  };
}

/** Grund einer Ablehnung — fließt später ins Matching zurück. */
export type DeclineReason = "zu_weit" | "gehalt" | "montage" | "gewerk" | "sonstiges";

export const DECLINE_REASONS: { value: DeclineReason; label: string }[] = [
  { value: "zu_weit", label: "Zu weit weg" },
  { value: "gehalt", label: "Gehalt passt nicht" },
  { value: "montage", label: "Montage / Reisetätigkeit" },
  { value: "gewerk", label: "Falsches Gewerk" },
  { value: "sonstiges", label: "Anderer Grund" },
];

export async function respondToOffer(
  offerId: string,
  decision: "angenommen" | "abgelehnt",
  reason?: DeclineReason
): Promise<ApiResult<{ status: OfferStatus }>> {
  await delay(320);
  const states = readStates();
  states[offerId] = decision;
  writeStates(states);
  // `reason` geht später an POST /me/offers/:id/respond und verbessert das Matching.
  void reason;
  return { ok: true, data: { status: decision } };
}

// ── Bewerbungen ──────────────────────────────────────────────────────────────

export async function listApplications(): Promise<ApiResult<Application[]>> {
  await delay(200);
  return {
    ok: true,
    data: [
      { id: "app-1", job: JOBS[1], status: "im_gespraech", updatedAt: "vor 2 Tagen" },
      { id: "app-2", job: JOBS[4], status: "gesehen", updatedAt: "vor 5 Tagen" },
      { id: "app-3", job: JOBS[5], status: "abgelehnt", updatedAt: "vor 3 Wochen" },
    ],
  };
}

/** Ähnliche Stellen — für den Moment nach einer Absage. */
export async function similarJobs(job: Job, limit = 3): Promise<ApiResult<Job[]>> {
  await delay(150);
  const out = JOBS.filter((j) => j.id !== job.id)
    .sort((a, b) => {
      const sameA = a.gewerk === job.gewerk ? 0 : 1;
      const sameB = b.gewerk === job.gewerk ? 0 : 1;
      if (sameA !== sameB) return sameA - sameB;
      return a.travelMinutes - b.travelMinutes;
    })
    .slice(0, limit);
  return { ok: true, data: out };
}

// ── Profil-Score ─────────────────────────────────────────────────────────────

/**
 * Bewertet die Profilvollständigkeit — aber mit beziffertem Nutzen statt nackter
 * Prozentzahl: "+12 passende Stellen" wirkt stärker als "10 % fehlen".
 */
export async function getProfileScore(profile?: {
  gewerke?: string[];
  erfahrungJahre?: number;
  zertifikate?: string[];
  phone?: string;
  hasAvatar?: boolean;
  hasDocuments?: boolean;
  workLocations?: number;
}): Promise<ApiResult<ProfileScore>> {
  await delay(120);
  const p = profile ?? {};

  const checks: { done: boolean; gap: ProfileScore["gaps"][number] }[] = [
    {
      done: !!p.gewerke?.length,
      gap: { id: "gewerk", label: "Gewerk angeben", extraJobs: 40, href: "/einstellungen" },
    },
    {
      done: typeof p.erfahrungJahre === "number",
      gap: { id: "erfahrung", label: "Berufserfahrung ergänzen", extraJobs: 18, href: "/einstellungen" },
    },
    {
      done: !!p.zertifikate?.length,
      gap: { id: "zertifikate", label: "Qualifikationen eintragen (z. B. Führerschein BE)", extraJobs: 12, href: "/einstellungen" },
    },
    {
      done: !!p.workLocations,
      gap: { id: "orte", label: "Arbeitsorte & Radius festlegen", extraJobs: 23, href: "/einstellungen" },
    },
    {
      done: !!p.phone,
      gap: { id: "telefon", label: "Telefonnummer bestätigen", extraJobs: 7, href: "/einstellungen" },
    },
    {
      done: !!p.hasDocuments,
      gap: { id: "dokumente", label: "Unterlagen hochladen", extraJobs: 9, href: "/unterlagen" },
    },
    {
      done: !!p.hasAvatar,
      gap: { id: "foto", label: "Profilbild hinzufügen", extraJobs: 4, href: "/einstellungen" },
    },
  ];

  const doneCount = checks.filter((c) => c.done).length;
  const percent = Math.round((doneCount / checks.length) * 100);
  const gaps = checks
    .filter((c) => !c.done)
    .map((c) => c.gap)
    .sort((a, b) => b.extraJobs - a.extraJobs);

  return { ok: true, data: { percent, gaps } };
}

// ── Arbeitsorte des Nutzers ──────────────────────────────────────────────────
// Später: GET/PUT /me/work-locations. Bis dahin localStorage — beim ersten
// Zugriff aus den Angaben der Registrierung übernommen, damit im Dashboard
// genau das steht, was der Nutzer im Funnel auf der Karte gewählt hat.

const WORKLOC_KEY = "portawerk_work_locations_v1";
const REGISTRATION_KEY = "portawerk_registration_v1";

export async function getWorkLocations(): Promise<ApiResult<WorkLocation[]>> {
  await delay(80);
  try {
    const own = localStorage.getItem(WORKLOC_KEY);
    if (own) return { ok: true, data: JSON.parse(own) as WorkLocation[] };

    // Einmalig aus der Registrierung übernehmen.
    const reg = localStorage.getItem(REGISTRATION_KEY);
    if (reg) {
      const parsed = JSON.parse(reg) as { data?: { workLocations?: WorkLocation[] } };
      const locs = parsed.data?.workLocations ?? [];
      if (locs.length) {
        localStorage.setItem(WORKLOC_KEY, JSON.stringify(locs));
        return { ok: true, data: locs };
      }
    }
  } catch {
    /* defektes Storage ignorieren */
  }
  return { ok: true, data: [] };
}

export async function saveWorkLocations(
  locs: WorkLocation[]
): Promise<ApiResult<WorkLocation[]>> {
  await delay(80);
  try {
    localStorage.setItem(WORKLOC_KEY, JSON.stringify(locs));
  } catch {
    return { ok: false, error: "Konnte Arbeitsorte nicht speichern." };
  }
  return { ok: true, data: locs };
}
