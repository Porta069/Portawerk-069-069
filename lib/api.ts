// ─── API Client ──────────────────────────────────────────────────────────────
// Dünne, UI-freundliche Schicht über der (aktuell simulierten) Backend-Anbindung.
// Jede Methode entspricht einem geplanten REST-Endpunkt und liefert ein
// `ApiResult<T>` zurück, damit das UI einheitlich Fehler behandeln kann.
//
// Wenn das echte Backend steht, wird hier nur der Body jeder Funktion durch
// einen `fetch(BASE_URL + "/...")`-Aufruf ersetzt — die Signaturen bleiben gleich.

import {
  registerApplicant,
  loginUser,
  sendEmailVerification,
  verifyEmailToken,
  sendPhoneCode,
  verifyPhoneCode,
  completeRegistration,
} from "./db";
import type { AnswerMap, ApiResult, ContactData, User } from "./types";

/** Basis-URL des Backends (inkl. Versionsprefix /api/v1). Via .env: NEXT_PUBLIC_API_URL. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/** Wrappt einen Aufruf in ein ApiResult und fängt Netzwerk-/Serverfehler ab. */
async function guard<T>(fn: () => Promise<T>): Promise<ApiResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err) {
    const error =
      err instanceof Error
        ? err.message
        : "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.";
    return { ok: false, error };
  }
}

export const api = {
  /** POST /api/auth/register */
  register(contact: ContactData, surveyAnswers: AnswerMap) {
    return guard(() => registerApplicant(contact, surveyAnswers));
  },

  /** POST /api/auth/login */
  login(email: string, password: string): Promise<ApiResult<User>> {
    return guard(() => loginUser(email, password));
  },

  /** POST /api/auth/send-email-verification */
  sendEmailVerification(email: string) {
    return guard(() => sendEmailVerification(email));
  },

  /** GET /api/auth/verify-email */
  verifyEmail(token: string) {
    return guard(() => verifyEmailToken(token));
  },

  /** POST /api/auth/send-phone-code */
  sendPhoneCode(phone: string) {
    return guard(() => sendPhoneCode(phone));
  },

  /** POST /api/auth/verify-phone */
  verifyPhone(phone: string, code: string) {
    return guard(() => verifyPhoneCode(phone, code));
  },

  /** POST /api/auth/complete-registration */
  completeRegistration(payload: {
    contact: ContactData;
    surveyAnswers: AnswerMap;
    aiAnswers: AnswerMap;
  }): Promise<ApiResult<User>> {
    return guard(() => completeRegistration(payload));
  },
};
