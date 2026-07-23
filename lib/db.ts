// ─── Mock Backend / Verification Stubs ───────────────────────────────────────
// Simulierte Backend-Schicht für die Handwerker-Plattform (PortaWerk).
// Alle Funktionen sind Platzhalter mit künstlicher Latenz — das Backend-Team
// ersetzt sie durch echte Endpunkte (NestJS + Prisma, siehe /backend Repo).
//
// TODO (Backend):
//   email → Resend:  resend.emails.send({ to, subject, html })
//   sms   → Twilio:  client.messages.create({ to, from, body })
//   auth  → JWT / Session, Passwort-Hashing (argon2 / bcrypt)
//   db    → Prisma:  db.applicant.create(...), db.otp.findFirst(...)

import type { AnswerMap, ContactData, User } from "./types";

/** DEV: fester Test-Code für SMS-Verifizierung. */
export const DEV_PHONE_CODE = "123456";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Auth: Registrierung starten ──────────────────────────────────────────────
/**
 * POST /api/auth/register
 * Legt einen vorläufigen Registrierungs-Datensatz an (Schritt 1–2).
 */
export async function registerApplicant(
  contact: ContactData,
  surveyAnswers: AnswerMap
): Promise<{ registrationId: string }> {
  await delay(800);
  console.log("[MOCK] registerApplicant", { contact, surveyAnswers });
  return { registrationId: `reg_${Math.round(performance.now())}` };
}

// ─── Auth: Login ──────────────────────────────────────────────────────────────
/**
 * POST /api/auth/login
 * DEV: akzeptiert jede E-Mail mit Passwortlänge >= 4.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  await delay(900);
  console.log("[MOCK] loginUser", { email });
  if (!email.includes("@") || password.length < 4) {
    throw new Error("E-Mail oder Passwort ist ungültig.");
  }
  const name = email.split("@")[0].replace(/[._-]/g, " ");
  return {
    id: `usr_${Math.round(performance.now())}`,
    fullName: name.replace(/\b\w/g, (c) => c.toUpperCase()),
    email,
    profile: {
      gewerke: ["Elektriker / Elektroniker"],
      erfahrungJahre: 6,
      region: "Nordrhein-Westfalen",
      zertifikate: ["Meisterbrief"],
      auftragsart: "Beides",
    },
  };
}

// ─── Verifizierung: E-Mail ────────────────────────────────────────────────────
/** POST /api/auth/send-email-verification */
export async function sendEmailVerification(email: string): Promise<void> {
  await delay(700);
  console.log("[MOCK] sendEmailVerification →", email);
}

/**
 * GET /api/auth/verify-email?token=...
 * DEV: jeder nicht-leere Token gilt als gültig.
 */
export async function verifyEmailToken(token: string): Promise<boolean> {
  await delay(600);
  console.log("[MOCK] verifyEmailToken →", token);
  return token.trim().length > 0;
}

// ─── Verifizierung: Telefon ───────────────────────────────────────────────────
/** POST /api/auth/send-phone-code */
export async function sendPhoneCode(phone: string): Promise<void> {
  await delay(700);
  console.log("[MOCK] sendPhoneCode →", phone);
}

/**
 * POST /api/auth/verify-phone
 * DEV: fester Test-Code (siehe DEV_PHONE_CODE).
 */
export async function verifyPhoneCode(
  _phone: string,
  code: string
): Promise<boolean> {
  await delay(500);
  console.log("[MOCK] verifyPhoneCode →", code);
  return code.trim() === DEV_PHONE_CODE;
}

// ─── Registrierung abschließen ────────────────────────────────────────────────
/** POST /api/auth/complete-registration */
export async function completeRegistration(payload: {
  contact: ContactData;
  surveyAnswers: AnswerMap;
  aiAnswers: AnswerMap;
}): Promise<User> {
  await delay(1400);
  console.log("[MOCK] completeRegistration", payload);
  return {
    id: `usr_${Math.round(performance.now())}`,
    fullName: payload.contact.fullName || "Handwerker:in",
    email: payload.contact.email,
    phone: payload.contact.phone,
    profile: deriveProfile(payload.aiAnswers),
  };
}

/** Leitet ein grobes Profil aus den KI-Antworten ab (nur fürs Dashboard-Demo). */
function deriveProfile(aiAnswers: AnswerMap): User["profile"] {
  const asArray = (v: unknown): string[] =>
    Array.isArray(v) ? (v as string[]) : v != null ? [String(v)] : [];
  return {
    gewerke: asArray(aiAnswers["ai_gewerke"]),
    erfahrungJahre:
      typeof aiAnswers["ai_erfahrung"] === "number"
        ? (aiAnswers["ai_erfahrung"] as number)
        : undefined,
    region:
      typeof aiAnswers["ai_region"] === "string"
        ? (aiAnswers["ai_region"] as string)
        : undefined,
    zertifikate: asArray(aiAnswers["ai_zertifikate"]),
    auftragsart:
      typeof aiAnswers["ai_auftragsart"] === "string"
        ? (aiAnswers["ai_auftragsart"] as string)
        : undefined,
  };
}
