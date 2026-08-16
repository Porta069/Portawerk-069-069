"use client";

// ─── Partner-Login ────────────────────────────────────────────────────────────
// Eigener Login für die Affiliate-/Empfehlungs-Aktion — bewusst getrennt vom
// Haupt-Login der Handwerker (/login) und der Unternehmen (/unternehmen/login),
// damit nichts verwechselt wird. Anmeldung per Telefonnummer ODER Link-Name.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Loader2, Wallet } from "lucide-react";
import { api, partnerSession } from "@/lib/api";
import Logo from "@/app/components/Logo";

export default function PartnerLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await api.partnerLogin(identifier.trim(), password);
    setLoading(false);
    if (res.ok) {
      partnerSession.set(res.data.accessToken);
      router.push("/verdienen/dashboard");
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
          style={{ background: "radial-gradient(circle, rgba(249, 173, 7,0.14) 0%, transparent 65%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <Link href="/verdienen" className="relative flex items-center gap-3 w-fit">
          <Logo height={24} variant="hell" priority />
          <span className="text-white/40 text-sm ml-1">· Partner</span>
        </Link>

        <div className="relative">
          <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.22em] uppercase mb-6">
            <span className="w-8 h-[2px] bg-accent" />
            Partner-Bereich
          </span>
          <h1
            className="text-white font-bold leading-[1.08] mb-5"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3.25rem)" }}
          >
            Willkommen zurück,
            <br />
            Partner.
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-sm">
            Melde dich an, um dein Empfehlungs-Dashboard, deine Vermittlungen und
            deine Prämien zu sehen.
          </p>
        </div>

        <p className="relative text-white/25 text-xs">
          © {new Date().getFullYear()} PortaWerk — 100 € pro erfolgreicher Vermittlung
        </p>
      </div>

      {/* ── Formular ── */}
      <div className="flex items-center justify-center px-6 py-12" style={{ background: "#F5F2EC" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <Link href="/verdienen" className="lg:hidden flex items-center gap-2.5 mb-10">
            <Logo height={22} />
            <span className="text-muted text-sm">· Partner</span>
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4" style={{ background: "var(--color-accent-soft)" }}>
            <Wallet className="w-3.5 h-3.5 text-accent" strokeWidth={2.2} />
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#8A5F04" }}>
              Partner-Login
            </span>
          </div>

          <h2
            className="text-primary font-bold text-2xl mb-1.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Partner anmelden
          </h2>
          <p className="text-sm mb-8" style={{ color: "#5F6F6A" }}>
            Für dein Empfehlungs-Dashboard. Nicht dein Handwerker-Konto?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#F9AD07" }}>
              Zum Haupt-Login
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-[10px] uppercase tracking-[0.16em] font-semibold mb-2"
                style={{ color: "rgba(12, 51, 48,0.45)" }}
              >
                Telefonnummer oder Link-Name<span className="text-accent ml-0.5">*</span>
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="+49 170 … oder dein-name"
                autoComplete="username"
                required
                className="w-full bg-white text-primary text-sm px-4 py-3.5 outline-none transition-all duration-200 placeholder:text-primary/20"
                style={{
                  border: `1.5px solid ${identifier ? "#0C3330" : "#DFE3E0"}`,
                  fontFamily: "var(--font-sans)",
                }}
              />
            </div>

            {/* Passwort mit Toggle */}
            <div>
              <label
                className="block text-[10px] uppercase tracking-[0.16em] font-semibold mb-2"
                style={{ color: "rgba(12, 51, 48,0.45)" }}
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
                  required
                  className="w-full bg-white text-primary text-sm px-4 py-3.5 pr-11 outline-none transition-all duration-200 placeholder:text-primary/20"
                  style={{
                    border: `1.5px solid ${password ? "#0C3330" : "#DFE3E0"}`,
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

            {error && (
              <div
                className="px-4 py-3 text-sm"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#B91C1C" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-3 font-semibold py-4 text-sm transition-all duration-200 disabled:opacity-60"
              style={{ background: "#F9AD07", color: "#0C3330", fontFamily: "var(--font-display)" }}
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

          <div className="flex items-center gap-2 mt-6 text-[11px]" style={{ color: "rgba(95, 111, 106,0.7)" }}>
            <Lock className="w-3 h-3 flex-shrink-0" style={{ color: "#F9AD07" }} />
            Melde dich mit deiner Telefonnummer (oder deinem Link-Namen) und Passwort an.
          </div>

          <p className="mt-8 text-sm text-center" style={{ color: "#5F6F6A" }}>
            Noch kein Partner?{" "}
            <Link href="/verdienen/partner" className="font-semibold" style={{ color: "#F9AD07" }}>
              Jetzt Link erstellen
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
