// ─── Shared Domain Types ─────────────────────────────────────────────────────
// Zentrale Typdefinitionen für die Handwerker-Plattform (PortaWerk).
// Frontend-only — das Backend-Team spiegelt diese Shapes serverseitig.

/** Antworttyp einer dynamischen (KI-)Frage. */
export type QuestionType = "radio" | "checkbox" | "text" | "slider";

/** Eine einzelne Auswahloption für radio/checkbox Fragen. */
import type { Handwerkerprofil } from "./catalogService";

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
  /** Antworten des Fachfragebogens (zehn Fragen). */
  profil: Handwerkerprofil;
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

// ─── Matching-Transparenz ────────────────────────────────────────────────────
// Das Backend liefert zu jedem Score den vollständigen Rechenweg mit:
// pro Frage Antwort, Range, Gewicht, Differenz und Strafpunkte. Wird nur in
// der Testphase angezeigt (kleines „e" am Score) und später entfernt.

/** Rechenweg eines einzelnen Kriteriums im Match-Score. */
export interface MatchCriterionBreakdown {
  key: string;
  label: string;
  /** Was der Betrieb verlangt, im Klartext. */
  required: string;
  /** Was im Profil steht, im Klartext. */
  answer: string;
  weight: number;
  /** Erfüllungsgrad 0–1. */
  fulfilment: number;
  /** Gewicht × (1 − Erfüllung). */
  penalty: number;
  maxPenalty: number;
  skipped: boolean;
  /** Erläuterung, wenn der Wert nicht selbsterklärend ist. */
  note?: string;
}

/** Eine nicht erfüllte Anforderung, an der die Stelle ganz scheitert. */
export interface MatchKnockout {
  key: string;
  label: string;
  reason: string;
}

/** Punktabzug aus dem Nutzerverhalten (z. B. abgelehnte Angebote). */
export interface ScoreAdjustment {
  id: string;
  label: string;
  points: number;
}

/** Vollständiger Rechenweg eines Match-Scores. */
export interface MatchBreakdown {
  /** Falsch, wenn eine harte Anforderung nicht erfüllt ist. */
  passed: boolean;
  /** Woran es scheitert — leer, solange `passed` wahr ist. */
  knockouts: MatchKnockout[];
  criteria: MatchCriterionBreakdown[];
  totalPenalty: number;
  totalMaxPenalty: number;
  /** Score aus den Kriterien allein (vor Abzügen). */
  baseScore: number;
  /** Abzüge aus Absage-Feedback — im Rechenweg sichtbar. */
  adjustments: ScoreAdjustment[];
  score: number;
  formula: string;
  /** Reserviert: Score der späteren KI-Fragerunde. */
  aiScore: number | null;
}

// ─── Jobbörse, Angebote, Bewerbungen ─────────────────────────────────────────
// Bedient von lib/jobsService.ts (echte Endpunkte auf dem NestJS-Backend).

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
  /** Beschreibung der Stelle (aus dem Inserat). */
  description?: string;
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
  /** Match-Score 0–100 (Σ Gewicht × Differenz, normalisiert). */
  matchScore?: number;
  /** Vollständiger Rechenweg — für die Transparenz-Ansicht in der Testphase. */
  matchBreakdown?: MatchBreakdown | null;
  /** Wann das Inserat angelegt wurde (ISO). */
  createdAt?: string;
  /** Steht die Stelle auf der Merkliste des Nutzers? */
  favorite?: boolean;
  // Unternehmensdetails für Detailansicht + Vergleich.
  companyDescription?: string;
  companySlogan?: string;
  benefits?: string[];
  companyLogo?: string | null;
  companyGruendungsjahr?: string;
  companyMitarbeiter?: string;
  companyWebsite?: string;
  companyOrt?: string;
  companyStrasse?: string;
  companyPlz?: string;
  companyKontaktName?: string;
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
  /** Ausbildungsbereich, ausgeschrieben. */
  bereich: string;
  /** Ausbildungsberuf (null = nicht angegeben). */
  beruf: string | null;
  /** Ausbildungsstand. */
  ausbildung: string | null;
  /** Berufserfahrung als Stufe, z. B. „3 bis 5 Jahre". */
  erfahrung: string | null;
  /** Aufgabenbereiche mit Erfahrung. */
  aufgaben: string[];
  /** Was ihm im neuen Job wichtig ist. */
  prioritaeten: string[];
  montage: string | null;
  fuehrerschein: string | null;
  deutsch: string | null;
  /** Gewünschter Startzeitpunkt. */
  start: string | null;
  /** Ort nur grob: Kreis/Stadt, keine Adresse. */
  region: string;
  /** Entfernung zur eingegebenen PLZ in km. */
  distanceKm: number;
  /** Gewünschter Arbeitsradius des Kandidaten. */
  radiusKm: number;
  /** Wie gut das Profil zur Suche passt (0–100). */
  matchScore: number;
  /** Rechenweg des Scores — nur gefüllt, wenn gegen ein Inserat gescort wurde. */
  matchBreakdown?: MatchBreakdown | null;
  status: CandidateStatus;
  /** Wann zuletzt aktiv — Signal für Erreichbarkeit. */
  zuletztAktiv: string;
  /** Ungefährer Ort für die Kartendarstellung — bewusst nur regionsgenau. */
  lat: number;
  lng: number;
  /**
   * Klartextdaten — existieren NUR, wenn der Kandidat die Anfrage angenommen
   * hat. Solange der Status nicht "freigegeben" ist, liefert das Backend
   * dieses Feld gar nicht erst mit.
   */
  freigegeben?: {
    name: string;
    telefon: string;
    email: string;
  };
}

export interface ContactRequest {
  id: string;
  candidate: Candidate;
  /** Stelle, für die angefragt wurde. */
  position: string;
  sentAt: string;
  status: Exclude<CandidateStatus, "verfuegbar">;
}

// ─── Unternehmensprofil (Arbeitgeber) ────────────────────────────────────────
// Was der Betrieb über sich hinterlegt — und woraus die Vorschau entsteht,
// die Handwerker später im Jobangebot sehen.

export interface EmployerProfile {
  firmenname: string;
  /** Kurzer Satz, der im Angebot direkt unter dem Namen steht. */
  slogan: string;
  /** Ausführliche Unternehmensbeschreibung (Fließtext, mehrere Absätze). */
  beschreibung: string;
  gruendungsjahr: string;
  mitarbeiter: string;
  strasse: string;
  plz: string;
  ort: string;
  website: string;
  /** Fließtext "Über uns". */
  ueberUns: string;
  /** Ansprechpartner — im Angebot sichtbar, schafft Vertrauen. */
  kontaktName: string;
  kontaktPosition: string;
  kontaktTelefon: string;
  kontaktEmail: string;
  /** Leistungen, die im Angebot als Chips erscheinen. */
  benefits: string[];
  /** z.B. "Jeden Abend zuhause" */
  montage: string;
  urlaubstage: string;
  /** Logo als Data-URL (optional). */
  logo: string;
}

// ─── Job-Inserate (Arbeitgeber-Verwaltung) ───────────────────────────────────
// Ein Inserat trägt neben den Stellen-Eckdaten sein Anforderungsprofil. Leere
// Felder heißen durchgehend „ist dem Betrieb egal" — das Kriterium wird dann
// weder geprüft noch gewertet.

/** Gewichte je Matching-Kriterium, 0–5. Fehlt eins, gilt die Vorgabe. */
export interface JobGewichte {
  aufgaben?: number;
  erfahrung?: number;
  beruf?: number;
  prioritaeten?: number;
  fuehrerschein?: number;
  start?: number;
}

/** Das Anforderungsprofil eines Inserats. */
export interface Anforderungsprofil {
  /** Akzeptierte Ausbildungsbereiche — Ausschlusskriterium. */
  bereiche: string[];
  /** Bevorzugte Ausbildungsberufe — fließt gewichtet ein. */
  berufe: string[];
  /** Mindest-Ausbildungsstand — Ausschlusskriterium. */
  ausbildungMin: string | null;
  /** Gesuchte Aufgabenbereiche. */
  aufgaben: string[];
  /** Wie viele davon abgedeckt sein MÜSSEN (0 = keine Pflicht). */
  aufgabenMin: number;
  erfahrungMin: string | null;
  erfahrungMax: string | null;
  /** Verlangte Montagebereitschaft — Ausschlusskriterium. */
  montageMin: string | null;
  fuehrerscheinMin: string | null;
  /** Verlangtes Sprachniveau — Ausschlusskriterium. */
  deutschMin: string | null;
  /** Was der Betrieb bietet — trifft auf die Prioritäten des Handwerkers. */
  gebotenes: string[];
  startBis: string | null;
  gewichte?: JobGewichte | null;
}

export type EmployerJobStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";

export interface EmployerJob extends Anforderungsprofil {
  id: string;
  title: string;
  gewerk: string;
  description: string;
  tags: string[];
  city: string;
  lat: number | null;
  lng: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  montage: string;
  fahrzeitIstArbeitszeit: boolean;
  startpunkt: string;
  urlaubstage: number | null;
  startText: string;
  extras: string[];
  status: EmployerJobStatus;
  /** SELF = vom Betrieb selbst, ADMIN/AI = von uns bzw. der KI angelegt. */
  source: "SELF" | "ADMIN" | "AI";
  createdAt: string;
  updatedAt: string;
  /** Anzahl eingegangener Bewerbungen. */
  applications?: number;
}

/** Eingabedaten beim Anlegen/Bearbeiten eines Inserats. */
export interface EmployerJobInput {
  title: string;
  gewerk: string;
  description?: string;
  tags?: string[];
  city?: string;
  salaryMin?: number;
  salaryMax?: number;
  montage?: string;
  fahrzeitIstArbeitszeit?: boolean;
  startpunkt?: "Haustür" | "Betrieb";
  urlaubstage?: number;
  startText?: string;
  extras?: string[];
  status?: EmployerJobStatus;
  // Anforderungsprofil — alle Felder optional, weglassen heißt „egal".
  bereiche?: string[];
  berufe?: string[];
  ausbildungMin?: string;
  aufgaben?: string[];
  aufgabenMin?: number;
  erfahrungMin?: string;
  erfahrungMax?: string;
  montageMin?: string;
  fuehrerscheinMin?: string;
  deutschMin?: string;
  gebotenes?: string[];
  startBis?: string;
  gewichte?: JobGewichte;
}

/** Eine Bewerbung aus Arbeitgeber-Sicht (anonymer Kandidat + Status). */
export interface EmployerApplication {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  jobPosting: { id: string; title: string; gewerk: string };
  candidate: Candidate;
}

/** Kontaktanfrage aus Sicht des Handwerkers (Freigabe-Entscheidung). */
export interface WorkerContactRequest {
  id: string;
  company: string;
  companySlogan: string;
  position: string;
  status: "angefragt" | "freigegeben" | "abgelehnt";
  sentAt: string;
}
