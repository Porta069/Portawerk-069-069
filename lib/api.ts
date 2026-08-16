// ─── API Client (echt) ───────────────────────────────────────────────────────
// Spricht das Live-Backend (NestJS auf Render) unter /api/v1 an.
// Alle Methoden liefern ein `ApiResult<T>` für einheitliches Error-Handling.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

// ── Backend-Typen (spiegeln PublicUser / AuthSession / WizardProgress) ──
export type UserRole = "APPLICANT" | "EMPLOYER";

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  companyName: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar: string | null;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AuthSession {
  accessToken: string;
  expiresAt: string;
  user: PublicUser;
}

export interface WizardStep {
  step: number;
  key: string;
  title: string;
  implemented: boolean;
}

export interface WizardProgress {
  currentStep: number;
  totalSteps: number;
  steps: WizardStep[];
}

export type OtpChannel = "email" | "sms";

// ── Partner / Affiliate ──
export interface PublicPartner {
  id: string;
  name: string;
  slug: string;
  link: string;
  phone: string;
  email: string | null;
  phoneVerified: boolean;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  payout: { iban: string | null; holder: string | null } | null;
}

export interface PartnerSession {
  accessToken: string;
  expiresAt: string;
  partner: PublicPartner;
}

export type ReferralStatus = "REGISTERED" | "IN_PLACEMENT" | "PLACED" | "PAID";

export interface PartnerDashboardData {
  name: string;
  firstName: string;
  slug: string;
  link: string;
  earnedCents: number;
  referredCount: number;
  placedCount: number;
  inPlacementCount: number;
  conversion: number;
  monthly: { month: string; cents: number }[];
  referrals: {
    id: string;
    name: string;
    trade: string;
    date: string;
    status: ReferralStatus;
    rewardCents: number;
  }[];
  payout: { iban: string | null; holder: string | null } | null;
  ranking: { top: { rank: number; name: string }[]; myRank: number };
}

// ── Fehlermeldungen ins Deutsche übersetzen (Fallback: Originaltext) ──
const MESSAGE_MAP: Record<string, string> = {
  "An account with this email already exists":
    "Ein Konto mit dieser E-Mail existiert bereits.",
  "Invalid email or password": "E-Mail oder Passwort ist falsch.",
  "Invalid or expired registration session":
    "Deine Registrierungs-Sitzung ist abgelaufen. Bitte starte die Registrierung neu.",
  "Registration session is no longer valid":
    "Deine Registrierungs-Sitzung ist abgelaufen. Bitte starte neu.",
  "Invalid phone number": "Bitte gib eine gültige Telefonnummer an.",
  "Invalid or expired token": "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
  "Missing bearer token": "Du bist nicht angemeldet.",
  "Invalid or expired reset token":
    "Der Reset-Link ist ungültig oder abgelaufen.",
};

function translate(msg: string): string {
  return MESSAGE_MAP[msg] ?? msg;
}

function extractMessage(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const m = (json as { message?: unknown }).message;
  if (typeof m === "string") return m;
  if (Array.isArray(m) && m.length) return String(m[0]);
  return null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const backoff = (attempt: number) => Math.min(1500 * 2 ** attempt, 8000);

/** Wärmt das (evtl. schlafende) Backend auf — fire-and-forget, ignoriert Fehler. */
export async function warmup(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
  } catch {
    /* egal */
  }
}

async function request<T>(
  path: string,
  opts: {
    method?: "GET" | "POST" | "DELETE" | "PATCH" | "PUT";
    body?: unknown;
    token?: string;
    /** Anzahl Wiederholungen bei Netzwerkfehler/502-503-504 (Kaltstart). */
    retries?: number;
  } = {}
): Promise<ApiResult<T>> {
  const { method = "GET", body, token, retries = 3 } = opts;
  let sawNetworkError = false;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      // Render-Kaltstart liefert kurz 502/503/504 (ohne App-Antwort) → erneut versuchen.
      if ([502, 503, 504].includes(res.status) && attempt < retries) {
        await sleep(backoff(attempt));
        continue;
      }

      if (res.status === 204) return { ok: true, data: undefined as T };

      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) {
        const raw = extractMessage(json) ?? `Fehler (${res.status})`;
        return { ok: false, error: translate(raw), status: res.status };
      }
      return { ok: true, data: json as T };
    } catch {
      // fetch hat geworfen (Netzwerk/CORS). Nur idempotente GETs wiederholen:
      // bei einem POST könnte der Server den Request bereits verarbeitet haben
      // (Konto anlegen, OTP-SMS, Referral) — ein Retry würde Duplikate bzw.
      // Doppelkosten erzeugen. Der Kaltstart-Fall liefert eine echte 502/503/504
      // (oben behandelt) und bleibt daher für alle Methoden mit Retry versorgt.
      sawNetworkError = true;
      if (method === "GET" && attempt < retries) {
        await sleep(backoff(attempt));
        continue;
      }
      break;
    }
  }

  return {
    ok: false,
    error: sawNetworkError
      ? "Der Server war kurz nicht erreichbar (er startet vielleicht gerade). Bitte einen Moment warten und erneut versuchen."
      : "Verbindung zum Server fehlgeschlagen. Bitte erneut versuchen.",
  };
}

export const api = {
  // ── Registrierungs-Wizard ──
  /** POST /auth/registration/start */
  startRegistration() {
    return request<{ draftToken: string; progress: WizardProgress }>(
      "/auth/registration/start",
      { method: "POST", body: {}, retries: 7 }
    );
  },

  /** POST /auth/registration/step — speichert opake Schritt-Daten (Step 1–5). */
  saveStep(draftToken: string, step: number, data: Record<string, unknown>) {
    return request<WizardProgress>("/auth/registration/step", {
      method: "POST",
      body: { draftToken, step, data },
    });
  },

  /** POST /auth/registration/complete — legt Konto an, gibt Session zurück. */
  completeRegistration(payload: {
    draftToken: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    /** Optionaler Werber-Name/-Code (Affiliate). */
    referredBy?: string;
    /** Zustimmung — vom Backend zwingend verlangt und dort gespeichert. */
    agbAccepted: boolean;
    datenschutzAccepted: boolean;
    rechtstexteVersion: string;
  }) {
    return request<AuthSession>("/auth/registration/complete", {
      method: "POST",
      body: payload,
      retries: 7,
    });
  },

  // ── Login / Session ──
  /** POST /auth/login */
  login(email: string, password: string) {
    return request<AuthSession>("/auth/login", {
      method: "POST",
      body: { email, password },
      retries: 7,
    });
  },

  /** GET /auth/me */
  me(token: string) {
    return request<PublicUser>("/auth/me", { token });
  },

  /** POST /auth/logout */
  logout(token: string) {
    return request<void>("/auth/logout", { method: "POST", token });
  },

  // ── Account-Selbstverwaltung ──
  /** PATCH /auth/me — Name, Telefon und Onboarding-Antworten ändern. */
  updateProfile(
    token: string,
    patch: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      profileData?: Record<string, unknown>;
      avatar?: string;
    }
  ) {
    return request<PublicUser>("/auth/me", { method: "PATCH", token, body: patch });
  },

  /** POST /auth/me/verify-contact — E-Mail/Telefon per OTP-Code bestätigen. */
  verifyContact(token: string, channel: OtpChannel, code: string) {
    return request<PublicUser>("/auth/me/verify-contact", {
      method: "POST",
      token,
      body: { channel, code },
    });
  },

  /** POST /auth/password/change — gibt eine frische Session zurück. */
  changePassword(token: string, currentPassword: string, newPassword: string) {
    return request<AuthSession>("/auth/password/change", {
      method: "POST",
      token,
      body: { currentPassword, newPassword },
    });
  },

  /** POST /auth/email/change */
  changeEmail(token: string, password: string, newEmail: string) {
    return request<PublicUser>("/auth/email/change", {
      method: "POST",
      token,
      body: { password, newEmail },
    });
  },

  /** POST /auth/account/delete */
  deleteAccount(token: string, password: string) {
    return request<void>("/auth/account/delete", {
      method: "POST",
      token,
      body: { password },
    });
  },

  /** GET /auth/me/export — GDPR-Datenexport. */
  exportData(token: string) {
    return request<Record<string, unknown>>("/auth/me/export", { token });
  },

  /** GET /auth/me/activity — Login-Aktivität. */
  activity(token: string) {
    return request<Array<{ at: string; action: string; device: string | null }>>(
      "/auth/me/activity",
      { token }
    );
  },

  /** POST /auth/email/check — Live-Prüfung (Syntax + MX-Record). */
  checkEmail(email: string) {
    return request<{ deliverable: boolean; reason: string }>("/auth/email/check", {
      method: "POST",
      body: { email },
      retries: 0,
    });
  },

  /** POST /auth/password/forgot */
  forgotPassword(email: string) {
    return request<{ status: string }>("/auth/password/forgot", {
      method: "POST",
      body: { email },
    });
  },

  // ── OTP-Verifizierung ──
  /** POST /otp/request */
  requestOtp(channel: OtpChannel, contact: string) {
    return request<unknown>("/otp/request", {
      method: "POST",
      body: { channel, contact },
    });
  },

  /** POST /otp/verify — liefert bei Erfolg einen verificationToken. */
  verifyOtp(channel: OtpChannel, contact: string, code: string) {
    return request<{ verified: boolean; verificationToken: string; tokenExpiresAt: string }>(
      "/otp/verify",
      { method: "POST", body: { channel, contact, code } }
    );
  },

  /**
   * POST /applications — Bewerbung mit Datei-Uploads (multipart/form-data).
   * FormData muss enthalten: Textfelder + Dateien (cv/photo/qualifications) +
   * verificationToken (aus /otp/verify) + consent.
   */
  async submitApplication(form: FormData): Promise<ApiResult<{ id: string }>> {
    try {
      const res = await fetch(`${API_BASE_URL}/applications`, {
        method: "POST",
        body: form, // Content-Type setzt der Browser inkl. boundary selbst
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (!res.ok) {
        const raw = extractMessage(json) ?? `Fehler (${res.status})`;
        return { ok: false, error: translate(raw), status: res.status };
      }
      return { ok: true, data: json as { id: string } };
    } catch {
      return {
        ok: false,
        error: "Verbindung zum Server fehlgeschlagen. Bitte erneut versuchen.",
      };
    }
  },

  // ── Partner / Affiliate ──
  /** GET /partner/slug/check — Live-Verfügbarkeit eines Wunsch-Links. */
  partnerSlugCheck(slug: string) {
    return request<{ slug: string; available: boolean }>(
      `/partner/slug/check?slug=${encodeURIComponent(slug)}`,
      { retries: 1 }
    );
  },

  /** POST /partner/register — Partner-Konto anlegen (mit SMS-Nachweis). */
  partnerRegister(payload: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    slug: string;
    verificationToken?: string;
  }) {
    return request<PartnerSession>("/partner/register", {
      method: "POST",
      body: payload,
      retries: 3,
    });
  },

  /** POST /partner/login */
  partnerLogin(identifier: string, password: string) {
    return request<PartnerSession>("/partner/login", {
      method: "POST",
      body: { identifier, password },
      retries: 3,
    });
  },

  /** GET /partner/me */
  partnerMe(token: string) {
    return request<PublicPartner>("/partner/me", { token });
  },

  /** GET /partner/dashboard — aggregierte Kennzahlen + Empfehlungen. */
  partnerDashboard(token: string) {
    return request<PartnerDashboardData>("/partner/dashboard", { token });
  },

  /** POST /partner/logout */
  partnerLogout(token: string) {
    return request<void>("/partner/logout", { method: "POST", token });
  },

  /** POST /partner/click — Klick auf einen Empfehlungs-Link zählen. */
  partnerClick(slug: string) {
    return request<{ ok: boolean }>("/partner/click", {
      method: "POST",
      body: { slug },
      retries: 0,
    });
  },

  /** PATCH /partner/payout — Bankdaten für die Auszahlung hinterlegen. */
  partnerUpdatePayout(token: string, payout: { iban?: string; holder?: string }) {
    return request<PublicPartner>("/partner/payout", {
      method: "PATCH",
      token,
      body: payout,
    });
  },

  /** PATCH /partner/me — Name, E-Mail, Telefon ändern (Slug ist fix). */
  partnerUpdateProfile(
    token: string,
    patch: { name?: string; email?: string; phone?: string }
  ) {
    return request<PublicPartner>("/partner/me", {
      method: "PATCH",
      token,
      body: patch,
    });
  },

  /** POST /partner/password/change — gibt eine frische Session zurück. */
  partnerChangePassword(token: string, currentPassword: string, newPassword: string) {
    return request<PartnerSession>("/partner/password/change", {
      method: "POST",
      token,
      body: { currentPassword, newPassword },
    });
  },

  /** POST /partner/account/delete — Konto endgültig löschen. */
  partnerDeleteAccount(token: string, password: string) {
    return request<void>("/partner/account/delete", {
      method: "POST",
      token,
      body: { password },
    });
  },

  /** GET /partner/me/export — DSGVO-Datenexport. */
  partnerExport(token: string) {
    return request<Record<string, unknown>>("/partner/me/export", { token });
  },
};

/**
 * Generischer, authentifizierbarer Request — für die Fach-Services
 * (jobsService, employerService), die eigene Endpunkt-Familien kapseln.
 */
export function apiRequest<T>(
  path: string,
  opts: {
    method?: "GET" | "POST" | "DELETE" | "PATCH" | "PUT";
    body?: unknown;
    token?: string;
    retries?: number;
  } = {}
): Promise<ApiResult<T>> {
  return request<T>(path, opts as Parameters<typeof request>[1]);
}

// ── Bewerber-/Arbeitgeber-Session (gleicher Speicher wie AuthContext) ──
const USER_SESSION_KEY = "portawerk_session_v1";

export const userSession = {
  /** JWT der angemeldeten Nutzer-Session, oder null. */
  get(): string | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(USER_SESSION_KEY);
      if (!raw) return null;
      return (JSON.parse(raw) as { token?: string }).token ?? null;
    } catch {
      return null;
    }
  },
};

// ── Partner-Session im Browser (getrennt von der Bewerber-Session) ──
const PARTNER_TOKEN_KEY = "portawerk_partner_v1";

export const partnerSession = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(PARTNER_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      window.localStorage.setItem(PARTNER_TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(PARTNER_TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};
