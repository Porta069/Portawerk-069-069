"use client";

// ─── Jobbörse-Service (echte API) ────────────────────────────────────────────
// Spricht die Worker-Endpunkte des NestJS-Backends an:
//
//   GET   /jobs                            → listJobs()
//   POST  /jobs/:id/apply                  → applyToJob()
//   GET   /me/offers                       → listOffers()
//   POST  /me/offers/:id/respond           → respondToOffer()
//   GET   /me/applications                 → listApplications()
//   GET   /me/profile-score                → getProfileScore()
//   GET/PUT /me/work-locations             → getWorkLocations()/saveWorkLocations()
//   GET   /me/contact-requests             → listContactRequests()
//   POST  /me/contact-requests/:id/respond → respondContactRequest()
//   GET   /match-questions                 → listMatchQuestions()
//
// Die Signaturen entsprechen weiterhin dem früheren Mock, damit die Seiten
// unverändert funktionieren. Scores kommen inkl. vollständigem Rechenweg
// (matchBreakdown) — Grundlage der Transparenz-Ansicht in der Testphase.

import { apiRequest, userSession } from "./api";
import type {
  ApiResult,
  Application,
  Job,
  JobOffer,
  MatchBreakdown,
  MatchQuestionInfo,
  OfferStatus,
  ProfileScore,
  WorkLocation,
  WorkerContactRequest,
} from "./types";

/** Seit der Backend-Anbindung false — steuert die Demodaten-Hinweise im UI. */
export const JOBS_ARE_MOCKED = false;

const token = () => userSession.get() ?? undefined;

// ── Anzeige-Helfer ───────────────────────────────────────────────────────────

/** ISO-Zeitstempel → "vor 2 Tagen" (deutsche Kurzform für Listen). */
export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return iso;
  const mins = Math.max(0, Math.round((Date.now() - then) / 60_000));
  if (mins < 2) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.round(hours / 24);
  if (days === 1) return "gestern";
  if (days < 14) return `vor ${days} Tagen`;
  const weeks = Math.round(days / 7);
  return `vor ${weeks} Wochen`;
}

/** Passendes Symbolbild je Gewerk (Inserate haben keine eigenen Fotos). */
function imageForGewerk(gewerk: string): string {
  const g = gewerk.toLowerCase();
  if (g.includes("elektr")) return "/images/elektriker-werkstatt.jpg";
  if (g.includes("shk") || g.includes("klempner") || g.includes("heizung"))
    return "/images/shk-heizung.jpg";
  if (g.includes("maler")) return "/images/maler-leiter.jpg";
  if (g.includes("metall") || g.includes("schlosser"))
    return "/images/metallbau-schweisser.jpg";
  if (g.includes("tischler") || g.includes("schreiner") || g.includes("zimmer"))
    return "/images/tischler-hobel.jpg";
  if (g.includes("maurer") || g.includes("beton") || g.includes("dach"))
    return "/images/maurer-ziegel.jpg";
  return "/images/hero-werkstatt.jpg";
}

// ── Wire-Format des Backends → Frontend-Job ──────────────────────────────────

interface ApiJob {
  id: string;
  title: string;
  employer: string;
  gewerk: string;
  city: string;
  distanceKm: number | null;
  travelMinutes: number | null;
  lat: number | null;
  lng: number | null;
  startLabel: string | null;
  startLat: number | null;
  startLng: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  tags: string[];
  conditions: {
    montage: string;
    fahrzeitIstArbeitszeit: boolean;
    startpunkt: string;
    urlaubstage: number | null;
    start: string;
    extras: string[];
  };
  recommended: boolean;
  matchReasons: string[];
  matchScore: number;
  matchBreakdown: MatchBreakdown;
}

function toJob(j: ApiJob): Job {
  return {
    id: j.id,
    title: j.title,
    employer: j.employer,
    gewerk: j.gewerk,
    city: j.city,
    distanceKm: j.distanceKm ?? 0,
    travelMinutes: j.travelMinutes ?? 0,
    lat: j.lat ?? 51.16,
    lng: j.lng ?? 10.45,
    startLabel: j.startLabel ?? "",
    startLat: j.startLat ?? j.lat ?? 51.16,
    startLng: j.startLng ?? j.lng ?? 10.45,
    salaryMin: j.salaryMin ?? 0,
    salaryMax: j.salaryMax ?? 0,
    tags: j.tags,
    conditions: {
      montage: j.conditions.montage,
      fahrzeitIstArbeitszeit: j.conditions.fahrzeitIstArbeitszeit,
      startpunkt: (j.conditions.startpunkt as "Haustür" | "Betrieb") ?? "Betrieb",
      urlaubstage: j.conditions.urlaubstage ?? 0,
      start: j.conditions.start,
      extras: j.conditions.extras,
    },
    image: imageForGewerk(j.gewerk),
    recommended: j.recommended,
    matchReasons: j.matchReasons,
    matchScore: j.matchScore,
    matchBreakdown: j.matchBreakdown,
  };
}

// ── Stellen ──────────────────────────────────────────────────────────────────

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
  const params = new URLSearchParams();
  if (filters.query?.trim()) params.set("query", filters.query.trim());
  if (filters.gewerke?.length) params.set("gewerke", filters.gewerke.join(","));
  if (filters.maxTravelMinutes)
    params.set("maxTravelMinutes", String(filters.maxTravelMinutes));
  if (filters.minSalary) params.set("minSalary", String(filters.minSalary));
  if (filters.abendsZuhause) params.set("abendsZuhause", "1");
  if (filters.fahrzeitIstArbeitszeit) params.set("fahrzeitIstArbeitszeit", "1");
  params.set("sort", sort);

  const res = await apiRequest<ApiJob[]>(`/jobs?${params.toString()}`, {
    token: token(),
  });
  if (!res.ok) return res;
  return { ok: true, data: res.data.map(toJob) };
}

/** Bewerbung auf eine Stelle (diskret — der Betrieb sieht das Profil). */
export async function applyToJob(
  jobId: string
): Promise<ApiResult<{ id: string; status: string }>> {
  return apiRequest(`/jobs/${jobId}/apply`, { method: "POST", token: token() });
}

// ── Angebote ─────────────────────────────────────────────────────────────────

/** Grund einer Ablehnung — fließt später ins Matching zurück. */
export type DeclineReason = "zu_weit" | "gehalt" | "montage" | "gewerk" | "sonstiges";

export const DECLINE_REASONS: { value: DeclineReason; label: string }[] = [
  { value: "zu_weit", label: "Zu weit weg" },
  { value: "gehalt", label: "Gehalt passt nicht" },
  { value: "montage", label: "Montage / Reisetätigkeit" },
  { value: "gewerk", label: "Falsches Gewerk" },
  { value: "sonstiges", label: "Anderer Grund" },
];

interface ApiOffer {
  id: string;
  message: string;
  contactPerson: string;
  receivedAt: string;
  status: OfferStatus;
  job: ApiJob;
}

export async function listOffers(): Promise<ApiResult<JobOffer[]>> {
  const res = await apiRequest<ApiOffer[]>("/me/offers", { token: token() });
  if (!res.ok) return res;
  return {
    ok: true,
    data: res.data.map((o) => ({
      id: o.id,
      message: o.message,
      contactPerson: o.contactPerson,
      receivedAt: formatRelative(o.receivedAt),
      status: o.status,
      job: toJob(o.job),
    })),
  };
}

export async function respondToOffer(
  offerId: string,
  decision: "angenommen" | "abgelehnt",
  reason?: DeclineReason
): Promise<ApiResult<{ status: OfferStatus }>> {
  return apiRequest(`/me/offers/${offerId}/respond`, {
    method: "POST",
    token: token(),
    body: { decision, reason },
  });
}

// ── Bewerbungen ──────────────────────────────────────────────────────────────

interface ApiApplication {
  id: string;
  status: Application["status"];
  updatedAt: string;
  job: ApiJob;
}

export async function listApplications(): Promise<ApiResult<Application[]>> {
  const res = await apiRequest<ApiApplication[]>("/me/applications", {
    token: token(),
  });
  if (!res.ok) return res;
  return {
    ok: true,
    data: res.data.map((a) => ({
      id: a.id,
      status: a.status,
      updatedAt: formatRelative(a.updatedAt),
      job: toJob(a.job),
    })),
  };
}

/** Ähnliche Stellen — für den Moment nach einer Absage. */
export async function similarJobs(job: Job, limit = 3): Promise<ApiResult<Job[]>> {
  const res = await listJobs();
  if (!res.ok) return res;
  const out = res.data
    .filter((j) => j.id !== job.id)
    .sort((a, b) => {
      const sameA = a.gewerk === job.gewerk ? 0 : 1;
      const sameB = b.gewerk === job.gewerk ? 0 : 1;
      if (sameA !== sameB) return sameA - sameB;
      return a.travelMinutes - b.travelMinutes;
    })
    .slice(0, limit);
  return { ok: true, data: out };
}

// ── Kontaktanfragen (Freigabe-Entscheidung des Handwerkers) ──────────────────

export async function listContactRequests(): Promise<
  ApiResult<WorkerContactRequest[]>
> {
  const res = await apiRequest<WorkerContactRequest[]>("/me/contact-requests", {
    token: token(),
  });
  if (!res.ok) return res;
  return {
    ok: true,
    data: res.data.map((r) => ({ ...r, sentAt: formatRelative(r.sentAt) })),
  };
}

export async function respondContactRequest(
  id: string,
  decision: "freigeben" | "ablehnen"
): Promise<ApiResult<{ status: string }>> {
  return apiRequest(`/me/contact-requests/${id}/respond`, {
    method: "POST",
    token: token(),
    body: { decision },
  });
}

// ── Profil-Score ─────────────────────────────────────────────────────────────

/**
 * Bewertet die Profilvollständigkeit — mit beziffertem Nutzen statt nackter
 * Prozentzahl. Wird serverseitig aus den Registrierungsangaben berechnet;
 * das frühere Profil-Argument bleibt aus Kompatibilität erhalten (ignoriert).
 */
export async function getProfileScore(
  _profile?: unknown
): Promise<ApiResult<ProfileScore>> {
  void _profile;
  return apiRequest<ProfileScore>("/me/profile-score", { token: token() });
}

// ── Arbeitsorte des Nutzers ──────────────────────────────────────────────────

export async function getWorkLocations(): Promise<ApiResult<WorkLocation[]>> {
  return apiRequest<WorkLocation[]>("/me/work-locations", { token: token() });
}

export async function saveWorkLocations(
  locs: WorkLocation[]
): Promise<ApiResult<WorkLocation[]>> {
  return apiRequest<WorkLocation[]>("/me/work-locations", {
    method: "PUT",
    token: token(),
    body: { locations: locs },
  });
}

// ── Matching-Katalog (Transparenz) ───────────────────────────────────────────

export async function listMatchQuestions(): Promise<ApiResult<MatchQuestionInfo[]>> {
  return apiRequest<MatchQuestionInfo[]>("/match-questions");
}
