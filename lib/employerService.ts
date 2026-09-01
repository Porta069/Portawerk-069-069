"use client";

// ─── Arbeitgeber-Service (echte API) ─────────────────────────────────────────
// Spricht die Employer-Endpunkte des NestJS-Backends an:
//
//   GET/PATCH /employer/profile              → getEmployerProfile()/saveEmployerProfile()
//   GET/POST  /employer/jobs                 → listMyJobs()/saveJob()
//   PATCH  /employer/jobs/:id                → saveJob(id)
//   DELETE /employer/jobs/:id                → deleteJob(id)  (endgültig)
//   GET  /employer/candidates                → searchCandidates()
//   POST /employer/candidates/:id/request    → requestContact()
//   POST /employer/candidates/:id/offer      → sendOffer()
//   GET  /employer/requests                  → listRequests()
//
// Kandidaten sind grundsätzlich anonymisiert — Name und Kontaktdaten liefert
// das Backend erst NACH Freigabe durch den Kandidaten (Feld `freigegeben`).

import { apiRequest, userSession } from "./api";
import { formatRelative } from "./jobsService";
import type {
  ApiResult,
  Candidate,
  ContactRequest,
  EmployerApplication,
  EmployerJob,
  EmployerJobStatus,
  EmployerJobInput,
  EmployerProfile,
} from "./types";

/** Seit der Backend-Anbindung false — steuert die Demodaten-Hinweise im UI. */
export const EMPLOYER_DATA_IS_MOCKED = false;

const token = () => userSession.get() ?? undefined;

/**
 * PLZ aus der Anfrage auf /arbeitgeber. Wird dort beim Absenden gesetzt und
 * belegt die Kandidatensuche vor — der Betrieb tippt sie nicht zweimal.
 */
export const EMPLOYER_PLZ_KEY = "werkpair_employer_plz_v1";

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

// ── Auswahlwerte für die Filter-Sektion (entsprechen den Backend-Labels) ─────

export const ZERTIFIKAT_OPTIONEN = [
  "Meisterbrief",
  "Gesellenbrief",
  "Führerschein Kl. B / BE",
  "Staplerschein",
];

export const BEREITSCHAFT_OPTIONEN = [
  "Montage / Reisetätigkeit",
  "Schichtarbeit",
  "Notdienst / Rufbereitschaft",
  "Umzug für den richtigen Job",
];

export type CandidateSort = "match" | "naehe" | "erfahrung";

export interface CandidateFilters {
  /** Fünfstellige Postleitzahl — Ausgangspunkt der Suche. */
  plz: string;
  /** Suchradius in km. */
  radiusKm: number;
  /** Gegen dieses Inserat scoren (Standard: neuestes aktives). */
  jobPostingId?: string;
  /** Mindest-Berufserfahrung in Jahren. */
  minErfahrung?: number;
  /** Geforderte Qualifikationen (alle müssen vorliegen). */
  zertifikate?: string[];
  /** Geforderte Bereitschaft (alle müssen vorliegen). */
  bereitschaft?: string[];
  gewerke?: string[];
  sort?: CandidateSort;
}

export interface CandidateSearchResult {
  candidates: Candidate[];
  /** Gegen welches Inserat die Scores gerechnet wurden (null = Heuristik). */
  scoredAgainst: { id: string; title: string } | null;
}

function mapCandidate(c: Candidate): Candidate {
  return { ...c, zuletztAktiv: formatRelative(c.zuletztAktiv) };
}

/** Sucht anonymisierte Kandidaten rund um eine PLZ, gescort per Inserat. */
export async function searchCandidates(
  f: CandidateFilters
): Promise<ApiResult<CandidateSearchResult>> {
  const params = new URLSearchParams();
  params.set("plz", f.plz.trim());
  params.set("radiusKm", String(f.radiusKm));
  if (f.jobPostingId) params.set("jobPostingId", f.jobPostingId);
  if (f.minErfahrung) params.set("minErfahrung", String(f.minErfahrung));
  if (f.zertifikate?.length) params.set("zertifikate", f.zertifikate.join(","));
  if (f.bereitschaft?.length) params.set("bereitschaft", f.bereitschaft.join(","));
  if (f.gewerke?.length) params.set("gewerke", f.gewerke.join(","));
  if (f.sort) params.set("sort", f.sort);

  const res = await apiRequest<CandidateSearchResult>(
    `/employer/candidates?${params.toString()}`,
    { token: token() }
  );
  if (!res.ok) return res;
  return {
    ok: true,
    data: {
      candidates: res.data.candidates.map(mapCandidate),
      scoredAgainst: res.data.scoredAgainst,
    },
  };
}

/**
 * Fragt den Kontakt an. Der Betrieb bekommt KEINE Daten — der Kandidat
 * entscheidet. Bis dahin steht die Anfrage auf "angefragt".
 */
export async function requestContact(
  candidateId: string,
  position: string
): Promise<ApiResult<{ status: string }>> {
  return apiRequest(`/employer/candidates/${candidateId}/request`, {
    method: "POST",
    token: token(),
    body: { position },
  });
}

/** Bietet einem Kandidaten aktiv ein Inserat an (landet in dessen "Angebote"). */
export async function sendOffer(
  candidateId: string,
  jobPostingId: string,
  message?: string
): Promise<ApiResult<{ id: string; status: string }>> {
  return apiRequest(`/employer/candidates/${candidateId}/offer`, {
    method: "POST",
    token: token(),
    body: { jobPostingId, message },
  });
}

/** Bereits gestellte Anfragen inkl. Status. */
export async function listRequests(): Promise<ApiResult<ContactRequest[]>> {
  const res = await apiRequest<ContactRequest[]>("/employer/requests", {
    token: token(),
  });
  if (!res.ok) return res;
  return {
    ok: true,
    data: res.data.map((r) => ({
      ...r,
      sentAt: formatRelative(r.sentAt),
      candidate: mapCandidate(r.candidate),
    })),
  };
}

// ── Unternehmensprofil ───────────────────────────────────────────────────────

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

export async function getEmployerProfile(): Promise<ApiResult<EmployerProfile>> {
  return apiRequest<EmployerProfile>("/employer/profile", { token: token() });
}

export async function saveEmployerProfile(
  p: EmployerProfile
): Promise<ApiResult<EmployerProfile>> {
  const res = await apiRequest<EmployerProfile>("/employer/profile", {
    method: "PATCH",
    token: token(),
    body: {
      firmenname: p.firmenname,
      slogan: p.slogan,
      beschreibung: p.beschreibung,
      gruendungsjahr: p.gruendungsjahr,
      mitarbeiter: p.mitarbeiter,
      strasse: p.strasse,
      plz: p.plz,
      ort: p.ort,
      website: p.website,
      kontaktName: p.kontaktName,
      kontaktPosition: p.kontaktPosition,
      kontaktTelefon: p.kontaktTelefon,
      kontaktEmail: p.kontaktEmail,
      benefits: p.benefits,
      montage: p.montage,
      urlaubstage: p.urlaubstage,
      logo: p.logo,
    },
  });
  if (res.ok && /^\d{5}$/.test(p.plz)) storePlz(p.plz);
  return res;
}

/**
 * Wie vollständig ist das Profil — und was bringt der nächste Schritt?
 * Bewusst mit beziffertem Nutzen statt nackter Prozentzahl.
 */
export function profileGaps(p: EmployerProfile): { label: string; hint: string }[] {
  const gaps: { label: string; hint: string }[] = [];
  if (!p.logo) gaps.push({ label: "Logo hinterlegen", hint: "Angebote mit Logo werden häufiger geöffnet" });
  if (!p.beschreibung.trim()) gaps.push({ label: "Unternehmensbeschreibung ausfüllen", hint: "Handwerker wollen wissen, wo sie landen" });
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
    !!p.beschreibung.trim(),
    !!p.kontaktName.trim(),
    !!p.kontaktTelefon.trim(),
    p.benefits.length >= 2,
    !!p.montage,
    !!p.urlaubstage,
    !!p.logo,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ── Job-Inserate ─────────────────────────────────────────────────────────────

export async function listMyJobs(): Promise<ApiResult<EmployerJob[]>> {
  return apiRequest<EmployerJob[]>("/employer/jobs", { token: token() });
}

/** Legt ein Inserat an (ohne id) oder aktualisiert es (mit id). */
export async function saveJob(
  input: EmployerJobInput,
  id?: string
): Promise<ApiResult<EmployerJob>> {
  return apiRequest<EmployerJob>(id ? `/employer/jobs/${id}` : "/employer/jobs", {
    method: id ? "PATCH" : "POST",
    token: token(),
    body: input,
  });
}

/**
 * Ändert nur den Status — veröffentlichen, pausieren, zurück in die Entwürfe,
 * einlagern, wiederherstellen.
 *
 * Bewusst NICHT über `saveJob`: Das verlangt das vollständige Inserat samt
 * Anforderungsprofil. Die Übersicht kennt das gar nicht vollständig, und ein
 * fehlendes Feld würde beim Speichern stillschweigend überschrieben.
 */
export async function setJobStatus(
  id: string,
  status: EmployerJobStatus,
): Promise<ApiResult<EmployerJob>> {
  return apiRequest<EmployerJob>(`/employer/jobs/${id}/status`, {
    method: "PATCH",
    token: token(),
    body: { status },
  });
}

/**
 * Löscht ein Inserat endgültig.
 *
 * Diese Funktion hieß bis zuletzt `archiveJob` und wurde nirgends aufgerufen —
 * die Route dahinter hat auch nur archiviert. Archiviert wird über
 * `setJobStatus`; hier wird wirklich gelöscht, samt Bewerbungen und Angeboten
 * zu dieser Stelle. Was verschwunden ist, steht in der Antwort.
 */
export async function deleteJob(
  id: string,
): Promise<ApiResult<{ geloescht: GeloeschtesInserat }>> {
  return apiRequest<{ geloescht: GeloeschtesInserat }>(`/employer/jobs/${id}`, {
    method: "DELETE",
    token: token(),
  });
}

export interface GeloeschtesInserat {
  id: string;
  titel: string;
  bewerbungen: number;
  angebote: number;
  merkungen: number;
}

/** Fragenkatalog fürs Matching — Grundlage des Kriterien-Editors. */


// ── Bewerbungen auf eigene Inserate ──────────────────────────────────────────

export async function listEmployerApplications(): Promise<
  ApiResult<EmployerApplication[]>
> {
  const res = await apiRequest<EmployerApplication[]>("/employer/applications", {
    token: token(),
  });
  if (!res.ok) return res;
  return {
    ok: true,
    data: res.data.map((a) => ({
      ...a,
      createdAt: formatRelative(a.createdAt),
      updatedAt: formatRelative(a.updatedAt),
      candidate: mapCandidate(a.candidate),
    })),
  };
}

/** Setzt den Bewerbungsstatus — der Handwerker sieht ihn sofort. */
export async function setApplicationStatus(
  id: string,
  status: "gesehen" | "im_gespraech" | "zusage" | "abgelehnt"
): Promise<ApiResult<{ id: string; status: string }>> {
  return apiRequest(`/employer/applications/${id}/status`, {
    method: "POST",
    token: token(),
    body: { status },
  });
}

// ── Kandidatenvorschläge ─────────────────────────────────────────────────────
//   GET   /employer/suggestions        → listSuggestions()
//   PATCH /employer/suggestions/:id    → setSuggestionStatus()
//
// Angelegt werden Vorschläge nicht hier, sondern serverseitig vom
// Admin-Dashboard über `POST /employer/admin/suggestions` mit dem Admin-
// Schlüssel. Der Betrieb kann also lesen und antworten, aber sich selbst
// nichts vorschlagen.

/** Der Vorschlag trägt denselben anonymen Steckbrief wie die Suche. */
export interface Vorschlag {
  id: string;
  status: VorschlagStatus;
  /** Von Hand angelegt oder aus einer Automatisierung. */
  quelle: "ADMIN" | "AUTOMATION";
  begruendung: string;
  erstelltAm: string;
  /** Stelle, zu der vorgeschlagen wurde — `null` = allgemeiner Vorschlag. */
  stelle: { id: string; titel: string } | null;
  kandidat: Candidate;
}

export type VorschlagStatus = "NEW" | "SEEN" | "INTERESTED" | "DECLINED";

export async function listSuggestions(): Promise<ApiResult<Vorschlag[]>> {
  const res = await apiRequest<Vorschlag[]>("/employer/suggestions", {
    token: token(),
  });
  if (!res.ok) return res;
  // Denselben Normalisierer wie die Suche benutzen, damit die Karten in
  // beiden Ansichten identisch aussehen und nicht zwei Formen entstehen.
  return {
    ok: true,
    data: res.data.map((v) => ({ ...v, kandidat: mapCandidate(v.kandidat) })),
  };
}

export async function setSuggestionStatus(
  id: string,
  status: VorschlagStatus,
): Promise<ApiResult<void>> {
  return apiRequest<void>(`/employer/suggestions/${id}`, {
    method: "PATCH",
    token: token(),
    body: { status },
  });
}
