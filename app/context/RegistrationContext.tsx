"use client";

// ─── Registrierungs-State ─────────────────────────────────────────────────────
// Hält alle über die 4 Schritte gesammelten Daten und persistiert sie in
// localStorage, damit ein Seiten-Reload den Fortschritt nicht verwirft.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type {
  AnswerMap,
  AnswerValue,
  ContactData,
  LegalConsent,
  Question,
  RegistrationData,
  VerificationState,
  WorkLocation,
} from "@/lib/types";
import { LEERES_PROFIL, type Handwerkerprofil } from "@/lib/catalogService";

/**
 * Reihenfolge nach Conversion optimiert:
 * Erst identitaetsstiftende Fachfragen (Gewerk, Erfahrung) — die kosten wenig
 * Ueberwindung und bauen Commitment auf. Dann die E-Mail als einzelne, leichte
 * Huerde: ab hier ist der Lead erreichbar, falls jemand abbricht. Die teuren
 * Schritte (Passwort, Telefon, OTP) kommen zuletzt, wenn die Investition am
 * groessten ist.
 */
export type RegStep =
  | "ausbildung"
  | "erfahrung"
  | "wuensche"
  | "rahmen"
  | "email"
  | "orte"
  | "konto"
  | "verify"
  | "success";

const STEP_ORDER: RegStep[] = [
  "ausbildung",
  "erfahrung",
  "wuensche",
  "rahmen",
  "email",
  "orte",
  "konto",
  "verify",
  "success",
];

/** Schritt-Namen früherer Fassungen auf die aktuelle abbilden. */
const LEGACY_STEPS: Record<string, RegStep> = {
  survey: "ausbildung",
  gewerk: "ausbildung",
  contact: "email",
  ai: "erfahrung",
  legal: "konto",
};

const STORAGE_KEY = "portawerk_registration_v1";

const EMPTY: RegistrationData = {
  draftToken: null,
  profil: { ...LEERES_PROFIL },
  surveyAnswers: {},
  surveySkipped: false,
  contact: { firstName: "", lastName: "", email: "", phone: "" },
  password: "",
  verification: { emailVerified: false, phoneVerified: false },
  aiAnswers: {},
  aiQuestions: [],
  aiFollowUpAdded: false,
  legal: { privacyAccepted: false, termsAccepted: false },
  referredBy: "",
  workLocations: [],
  avatar: "",
};

interface RegistrationContextValue {
  step: RegStep;
  stepIndex: number;
  totalSteps: number;
  data: RegistrationData;
  hydrated: boolean;
  goTo: (step: RegStep) => void;
  next: () => void;
  back: () => void;
  setDraftToken: (token: string) => void;
  setSurveyAnswer: (id: string, value: AnswerValue) => void;
  skipSurvey: () => void;
  setContact: (patch: Partial<ContactData>) => void;
  setReferredBy: (name: string) => void;
  setWorkLocations: (locs: WorkLocation[]) => void;
  setAvatar: (dataUrl: string) => void;
  setPassword: (pw: string) => void;
  setVerification: (patch: Partial<VerificationState>) => void;
  /** Eine Antwort des Fachfragebogens setzen. */
  setProfil: (patch: Partial<Handwerkerprofil>) => void;
  setAiAnswer: (id: string, value: AnswerValue) => void;
  setAiAnswers: (patch: AnswerMap) => void;
  setAiQuestions: (questions: Question[]) => void;
  addAiQuestions: (questions: Question[]) => void;
  setLegal: (patch: Partial<LegalConsent>) => void;
  reset: () => void;
}

const RegistrationContext = createContext<RegistrationContextValue | null>(null);

export function RegistrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [step, setStep] = useState<RegStep>("ausbildung");
  const [data, setData] = useState<RegistrationData>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const skipPersist = useRef(false);

  // ── Rehydrate from localStorage on mount ──
  useEffect(() => {
    let base: RegistrationData = EMPTY;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          step?: RegStep;
          data?: RegistrationData;
          savedAt?: number;
        };
        // Entwürfe enthalten Kontaktdaten und Arbeitsorte — nach 24 Stunden
        // werden sie verworfen statt unbegrenzt auf dem Gerät zu liegen.
        if (parsed.savedAt && Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(STORAGE_KEY);
          setData(EMPTY);
          setHydrated(true);
          return;
        }
        if (parsed.data) base = { ...EMPTY, ...parsed.data };
        // Erfolgsschritt nie wiederherstellen — sonst hängt man im "Fertig".
        // Laufende Registrierungen aus der alten Reihenfolge werden übersetzt,
        // damit niemand nach dem Update in einem toten Schritt landet.
        const saved = parsed.step
          ? LEGACY_STEPS[parsed.step] ?? parsed.step
          : undefined;
        if (saved && saved !== "success" && STEP_ORDER.includes(saved)) {
          setStep(saved);
        }
      }
    } catch {
      /* ignore corrupt storage */
    }

    // ── Ausbildungsbereich aus der Startseite vorbelegen (?bereich=…) ──
    // Ermöglicht die Micro-Conversion im Hero: ein Klick setzt schon den
    // Bereich. Ob der Wert im Katalog steht, prüft der Schritt selbst — hier
    // ist der Katalog noch nicht geladen.
    try {
      const param = new URLSearchParams(window.location.search).get("bereich");
      if (param && !base.profil.bereich) {
        base = { ...base, profil: { ...base.profil, bereich: param } };
      }
    } catch {
      /* ignore — Vorbelegung ist rein optional */
    }

    // ── Werber aus dem Affiliate-Link vorbelegen (?ref=NAME) ──
    // Nur der Name/Code, nicht der ganze Link. Nutzer kann ihn im Formular
    // sehen/ändern; leer = keine Empfehlung.
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref && !base.referredBy) {
        base = { ...base, referredBy: ref.trim().slice(0, 30) };
      }
    } catch {
      /* ignore */
    }

    setData(base);
    setHydrated(true);
  }, []);

  // ── Persist on change ──
  useEffect(() => {
    if (!hydrated || skipPersist.current) return;
    try {
      // Passwort nie persistieren (Sicherheit); Avatar nicht (zu groß für localStorage).
      const { password: _pw, avatar: _av, ...safe } = data;
      void _pw;
      void _av;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ step, data: { ...safe, avatar: "" }, savedAt: Date.now() })
      );
    } catch {
      /* ignore quota errors */
    }
  }, [step, data, hydrated]);

  const goTo = useCallback((s: RegStep) => setStep(s), []);

  const next = useCallback(() => {
    setStep((cur) => {
      const i = STEP_ORDER.indexOf(cur);
      return STEP_ORDER[Math.min(i + 1, STEP_ORDER.length - 1)];
    });
  }, []);

  const back = useCallback(() => {
    setStep((cur) => {
      const i = STEP_ORDER.indexOf(cur);
      return STEP_ORDER[Math.max(i - 1, 0)];
    });
  }, []);

  const setDraftToken = useCallback((token: string) => {
    setData((d) => ({ ...d, draftToken: token }));
  }, []);

  const setPassword = useCallback((pw: string) => {
    setData((d) => ({ ...d, password: pw }));
  }, []);

  const setSurveyAnswer = useCallback((id: string, value: AnswerValue) => {
    setData((d) => ({
      ...d,
      surveySkipped: false,
      surveyAnswers: { ...d.surveyAnswers, [id]: value },
    }));
  }, []);

  const skipSurvey = useCallback(() => {
    setData((d) => ({ ...d, surveySkipped: true, surveyAnswers: {} }));
  }, []);

  const setContact = useCallback((patch: Partial<ContactData>) => {
    setData((d) => ({ ...d, contact: { ...d.contact, ...patch } }));
  }, []);

  const setReferredBy = useCallback((name: string) => {
    setData((d) => ({ ...d, referredBy: name }));
  }, []);

  const setWorkLocations = useCallback((locs: WorkLocation[]) => {
    setData((d) => ({ ...d, workLocations: locs }));
  }, []);

  const setAvatar = useCallback((dataUrl: string) => {
    setData((d) => ({ ...d, avatar: dataUrl }));
  }, []);

  const setVerification = useCallback((patch: Partial<VerificationState>) => {
    setData((d) => ({ ...d, verification: { ...d.verification, ...patch } }));
  }, []);

  const setProfil = useCallback((patch: Partial<Handwerkerprofil>) => {
    setData((d) => ({ ...d, profil: { ...d.profil, ...patch } }));
  }, []);

  const setAiAnswer = useCallback((id: string, value: AnswerValue) => {
    setData((d) => ({ ...d, aiAnswers: { ...d.aiAnswers, [id]: value } }));
  }, []);

  const setAiAnswers = useCallback((patch: AnswerMap) => {
    setData((d) => ({ ...d, aiAnswers: { ...d.aiAnswers, ...patch } }));
  }, []);

  const setAiQuestions = useCallback((questions: Question[]) => {
    setData((d) => ({ ...d, aiQuestions: questions }));
  }, []);

  /** Folgefragen anhaengen und den Nachlade-Schritt als erledigt markieren. */
  const addAiQuestions = useCallback((questions: Question[]) => {
    setData((d) => ({
      ...d,
      aiQuestions: [...d.aiQuestions, ...questions],
      aiFollowUpAdded: true,
    }));
  }, []);

  const setLegal = useCallback((patch: Partial<LegalConsent>) => {
    setData((d) => ({ ...d, legal: { ...d.legal, ...patch } }));
  }, []);

  const reset = useCallback(() => {
    skipPersist.current = true;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setData(EMPTY);
    setStep("ausbildung");
    // erlauben, dass künftige Änderungen wieder persistiert werden
    setTimeout(() => (skipPersist.current = false), 0);
  }, []);

  const value: RegistrationContextValue = {
    step,
    stepIndex: STEP_ORDER.indexOf(step),
    totalSteps: STEP_ORDER.length,
    data,
    hydrated,
    goTo,
    next,
    back,
    setDraftToken,
    setSurveyAnswer,
    skipSurvey,
    setContact,
    setReferredBy,
    setWorkLocations,
    setAvatar,
    setPassword,
    setVerification,
    setProfil,
    setAiAnswer,
    setAiAnswers,
    setAiQuestions,
    addAiQuestions,
    setLegal,
    reset,
  };

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const ctx = useContext(RegistrationContext);
  if (!ctx)
    throw new Error(
      "useRegistration muss innerhalb von <RegistrationProvider> genutzt werden."
    );
  return ctx;
}
