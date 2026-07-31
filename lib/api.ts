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

async function request<T>(
  path: string,
  opts: {
    method?: "GET" | "POST" | "DELETE" | "PATCH";
    body?: unknown;
    token?: string;
  } = {}
): Promise<ApiResult<T>> {
  const { method = "GET", body, token } = opts;
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) return { ok: true, data: undefined as T };

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const raw = extractMessage(json) ?? `Fehler (${res.status})`;
      return { ok: false, error: translate(raw), status: res.status };
    }
    return { ok: true, data: json as T };
  } catch {
    return {
      ok: false,
      error:
        "Verbindung zum Server fehlgeschlagen. Bitte prüfe deine Internetverbindung und versuche es erneut.",
    };
  }
}

export const api = {
  // ── Registrierungs-Wizard ──
  /** POST /auth/registration/start */
  startRegistration() {
    return request<{ draftToken: string; progress: WizardProgress }>(
      "/auth/registration/start",
      { method: "POST", body: {} }
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
  }) {
    return request<AuthSession>("/auth/registration/complete", {
      method: "POST",
      body: payload,
    });
  },

  // ── Login / Session ──
  /** POST /auth/login */
  login(email: string, password: string) {
    return request<AuthSession>("/auth/login", {
      method: "POST",
      body: { email, password },
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
    }
  ) {
    return request<PublicUser>("/auth/me", { method: "PATCH", token, body: patch });
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
};
