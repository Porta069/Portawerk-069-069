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
