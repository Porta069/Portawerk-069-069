"use client";

// ─── Login ────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";
import { Field } from "@/app/components/ui";
import Logo from "@/app/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleForgot = async () => {
    setError(null);
    setInfo(null);
    if (!email) {
      setError("Bitte gib zuerst deine E-Mail-Adresse ein.");
      return;
    }
    await api.forgotPassword(email);
    // Antwort ist bewusst generisch (keine Konto-Enumeration).
    setInfo(
      "Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen Link zum Zurücksetzen geschickt."
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await api.login(email, password);
    setLoading(false);
    if (res.ok) {
      login(res.data);
      router.push("/dashboard");
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ fontFamily: "var(--font-sans)" }}>
      {/* ── Brand-Panel ── */}
      <div className="relative hidden lg:flex flex-col justify-between bg-primary overflow-hidden p-12">
        <div
          className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232,168,56,0.14) 0%, transparent 65%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <Link href="/" className="relative flex items-center gap-3 w-fit">
          <Logo height={24} variant="hell" priority />
        </Link>

        <div className="relative">
          <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.22em] uppercase mb-6">
            <span className="w-8 h-[2px] bg-accent" />
            Willkommen zurück
          </span>
          <h1
            className="text-white font-bold leading-[1.08] mb-5"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3.25rem)" }}
          >
            Dein Handwerk.
            <br />
            Deine nächste Chance.
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-sm">
            Melde dich an, um deine Vermittlungsanfragen und dein Profil zu verwalten.
          </p>
        </div>

        <p className="relative text-white/25 text-xs">
          © {new Date().getFullYear()} PortaWerk — ein Angebot von porta-jobs.de
        </p>
      </div>

      {/* ── Formular ── */}
      <div className="flex items-center justify-center px-6 py-12" style={{ background: "#F8F7F4" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-10">
            <Logo height={22} />
          </Link>

          <h2
            className="text-primary font-bold text-2xl mb-1.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Anmelden
          </h2>
          <p className="text-sm mb-8" style={{ color: "#6B7280" }}>
            Schön, dass du wieder da bist.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field
              label="E-Mail-Adresse"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="max@beispiel.de"
              autoComplete="email"
              required
            />

            {/* Passwort mit Toggle */}
            <div>
              <label
                className="block text-[10px] uppercase tracking-[0.16em] font-semibold mb-2"
                style={{ color: "rgba(26,26,46,0.45)" }}
              >
                Passwort<span className="text-accent ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white text-primary text-sm px-4 py-3.5 pr-11 outline-none transition-all duration-200 placeholder:text-primary/20"
                  style={{
                    border: `1.5px solid ${password ? "#1A1A2E" : "#E5E7EB"}`,
                    fontFamily: "var(--font-sans)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                  aria-label={showPw ? "Passwort verbergen" : "Passwort anzeigen"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRemember((r) => !r)}
                className="flex items-center gap-2 text-sm"
                style={{ color: "rgba(26,26,46,0.7)" }}
              >
                <span
                  className="w-4 h-4 flex items-center justify-center transition-all"
                  style={{
                    border: `1.5px solid ${remember ? "#E8A838" : "#D1D5DB"}`,
                    background: remember ? "#E8A838" : "white",
                  }}
                >
                  {remember && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" strokeWidth="4">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </span>
                Angemeldet bleiben
              </button>
              <button
                type="button"
                className="text-sm transition-colors"
                style={{ color: "#E8A838" }}
                onClick={handleForgot}
              >
                Passwort vergessen?
              </button>
            </div>

            {error && (
              <div
                className="px-4 py-3 text-sm"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#B91C1C" }}
              >
                {error}
              </div>
            )}

            {info && (
              <div
                className="px-4 py-3 text-sm"
                style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.3)", color: "#15803D" }}
              >
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-3 font-semibold py-4 text-sm transition-all duration-200 disabled:opacity-60"
              style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Anmelden…
                </>
              ) : (
                <>
                  Anmelden
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-2 mt-6 text-[11px]" style={{ color: "rgba(107,114,128,0.7)" }}>
            <Lock className="w-3 h-3 flex-shrink-0" style={{ color: "#E8A838" }} />
            Melde dich mit den bei der Registrierung gewählten Daten an.
          </div>

          <p className="mt-8 text-sm text-center" style={{ color: "#6B7280" }}>
            Noch kein Konto?{" "}
            <Link href="/registrieren" className="font-semibold" style={{ color: "#E8A838" }}>
              Jetzt registrieren
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
