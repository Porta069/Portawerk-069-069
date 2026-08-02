// ─── Shared Domain Types ─────────────────────────────────────────────────────
// Zentrale Typdefinitionen für die Handwerker-Plattform (PortaWerk).
// Frontend-only — das Backend-Team spiegelt diese Shapes serverseitig.

/** Antworttyp einer dynamischen (KI-)Frage. */
export type QuestionType = "radio" | "checkbox" | "text" | "slider";

/** Eine einzelne Auswahloption für radio/checkbox Fragen. */
export interface QuestionOption {
  value: string;
  label: string;
}

/** Eine dynamische Frage — sowohl für die Umfrage (Schritt 1) als auch für die KI-Profilfragen (Schritt 4). */
export interface Question {
  id: string;
  type: QuestionType;
  /** Fragetext. */
  prompt: string;
  /** Optionaler erklärender Untertitel. */
  hint?: string;
  /** Nur bei radio/checkbox. */
  options?: QuestionOption[];
  /** Nur bei text — Platzhalter im Eingabefeld. */
  placeholder?: string;
  /** Nur bei slider. */
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** Muss beantwortet werden, um fortzufahren. Umfrage-Fragen sind i.d.R. optional. */
  required?: boolean;
}

/**
 * Antwortwert einer Frage.
 *  - radio / text          → string
 *  - checkbox              → string[]
 *  - slider                → number
 */
export type AnswerValue = string | string[] | number;

/** Map von Frage-ID → Antwortwert. */
export type AnswerMap = Record<string, AnswerValue>;

/** Ein möglicher Arbeitsort mit Umkreis (für die Karten-Auswahl). */
export interface WorkLocation {
  id: string;
  label: string;
  lat: number;
  lng: number;
  /** Arbeitsradius in Kilometern. */
  radiusKm: number;
}

/** Kontaktdaten aus Schritt 2 (Backend erwartet Vor- und Nachname getrennt). */
export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/** Verifizierungsstatus aus Schritt 3. */
export interface VerificationState {
  emailVerified: boolean;
  phoneVerified: boolean;
}

/** Zustimmung zu den rechtlichen Bedingungen. */
export interface LegalConsent {
  privacyAccepted: boolean;
  termsAccepted: boolean;
}

/** Vollständiger Registrierungs-Datensatz, der über alle Schritte hinweg gesammelt wird. */
export interface RegistrationData {
  /** JWT der Registrierungs-Sitzung (von POST /auth/registration/start). */
  draftToken: string | null;
  surveyAnswers: AnswerMap;
  surveySkipped: boolean;
  contact: ContactData;
  /** Passwort — wird NICHT in localStorage persistiert (Sicherheit). */
  password: string;
  verification: VerificationState;
  aiAnswers: AnswerMap;
  /**
   * Bereits geladene KI-Fragen inkl. nachgeladener Folgefragen. Wird
   * mitgespeichert, damit ein Rücksprung auf den KI-Schritt exakt dieselben
   * Fragen zeigt — sonst würden neu generierte Fragen die vorhandenen
   * Antworten aus `aiAnswers` unsichtbar machen.
   */
  aiQuestions: Question[];
  /** Ob die adaptiven Folgefragen schon nachgeladen wurden. */
  aiFollowUpAdded: boolean;
  legal: LegalConsent;
  /** Name/Code des Werbers (Affiliate) — nur der Name, nicht der ganze Link. */
  referredBy: string;
  /** Mögliche Arbeitsorte mit Umkreis (Karten-Auswahl). */
  workLocations: WorkLocation[];
  /** Optionales Profilbild als (verkleinertes) Data-URL — nicht persistiert. */
  avatar: string;
}

/** Angemeldeter Nutzer (nach Login / abgeschlossener Registrierung). */
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  /** Zusammengefasste Profildaten aus den KI-Antworten. */
  profile?: {
    gewerke?: string[];
    erfahrungJahre?: number;
    region?: string;
    zertifikate?: string[];
    auftragsart?: string;
  };
}

/** Generisches Ergebnis eines API-Aufrufs (für einfaches Error-Handling im UI). */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ─── Jobbörse, Angebote, Bewerbungen ─────────────────────────────────────────
// Noch ohne Backend-Endpunkte — bedient von lib/jobsService.ts (Mock).

/** Handwerksspezifische Rahmenbedingungen, die im Handwerk die Zusage entscheiden. */
export interface JobConditions {
  /** z.B. "Jeden Abend zuhause" | "Gelegentlich Montage" | "Dauermontage" */
  montage: string;
  /** Zählt die Anfahrt als Arbeitszeit? */
  fahrzeitIstArbeitszeit: boolean;
  /** Startet der Arbeitstag an der Haustür oder am Betrieb? */
  startpunkt: "Haustür" | "Betrieb";
  urlaubstage: number;
  /** z.B. "Ab sofort" */
  start: string;
  /** Optional: Schicht, Notdienst, Rufbereitschaft … */
  extras?: string[];
}

export interface Job {
  id: string;
  title: string;
  employer: string;
  /** Exakter GEWERKE-Wert — Brücke zum Profil des Kandidaten. */
  gewerk: string;
  city: string;
  /** Luftlinie in km (Backend liefert später Routing). */
  distanceKm: number;
  /** Fahrzeit in Minuten mit dem Auto — die für Handwerker relevante Größe. */
  travelMinutes: number;
  /** Standort des Betriebs — Ziel der Route. */
  lat: number;
  lng: number;
  /** Nächstgelegener Arbeitsort des Nutzers — Start der Route. */
  startLabel: string;
  startLat: number;
  startLng: number;
  salaryMin: number;
  salaryMax: number;
  /** Regionaler Marktschnitt fürs Gewerk — für die Einordnung. */
  marketAvg?: number;
  tags: string[];
  conditions: JobConditions;
  image: string;
  /** Wurde die Stelle vom Matching empfohlen? */
  recommended?: boolean;
  /** Wie schnell der Betrieb üblicherweise antwortet (Tage). */
  respondsInDays?: number;
  /** Warum diese Stelle passt — konkrete Gründe aus dem Profil. */
  matchReasons?: string[];
}

export type OfferStatus = "neu" | "angenommen" | "abgelehnt";

/** Ein Betrieb bietet dem Handwerker aktiv eine Stelle an. */
export interface JobOffer {
  id: string;
  job: Job;
  /** Persönliche Nachricht des Betriebs. */
  message: string;
  contactPerson: string;
  receivedAt: string;
  status: OfferStatus;
}

export type ApplicationStatus =
  | "gesendet"
  | "gesehen"
  | "im_gespraech"
  | "abgelehnt"
  | "zusage";

export interface Application {
  id: string;
  job: Job;
  status: ApplicationStatus;
  updatedAt: string;
}

/** Ein konkreter, mit Nutzen beziffertet Schritt zur Profilvervollständigung. */
export interface ProfileGap {
  id: string;
  label: string;
  /** Wie viele zusätzliche Stellen die Angabe freischaltet. */
  extraJobs: number;
  /** Wohin der Klick führt. */
  href: string;
}

export interface ProfileScore {
  percent: number;
  gaps: ProfileGap[];
}

// ─── Arbeitgeber-Sicht: anonymisierte Kandidaten ─────────────────────────────
// Kernversprechen der Plattform: der Betrieb sieht ein fachlich vollständiges,
// aber personenlose Profil. Name und Kontaktdaten gibt erst der Kandidat frei.

export type CandidateStatus =
  | "verfuegbar"
  | "angefragt"
  | "freigegeben"
  | "abgelehnt";

export interface Candidate {
  /** Pseudonyme ID — kein Rückschluss auf die Person. */
  id: string;
  /** Anzeigekürzel statt Name, z.B. "Elektriker #A47". */
  handle: string;
  gewerk: string;
  erfahrungJahre: number;
  zertifikate: string[];
  /** Ort nur grob: Kreis/Stadt, keine Adresse. */
  region: string;
  /** Entfernung zur eingegebenen PLZ in km. */
  distanceKm: number;
  /** Gewünschter Arbeitsradius des Kandidaten. */
  radiusKm: number;
  /** Wozu er bereit ist (Montage, Schicht, Notdienst, Umzug). */
  bereitschaft: string[];
  /** Was ihm wichtig ist — aus der Umfrage. */
  praeferenz: string;
  /** Gehaltsvorstellung, brutto monatlich. */
  gehaltVon: number;
  gehaltBis: number;
  verfuegbarAb: string;
  /** Wie gut das Profil zur Suche passt (0–100). */
  matchScore: number;
  status: CandidateStatus;
  /** Wann zuletzt aktiv — Signal für Erreichbarkeit. */
  zuletztAktiv: string;
}

export interface ContactRequest {
  id: string;
  candidate: Candidate;
  /** Stelle, für die angefragt wurde. */
  position: string;
  sentAt: string;
  status: Exclude<CandidateStatus, "verfuegbar">;
}
