"use client";

// ─── Firmen-Login ─────────────────────────────────────────────────────────────
// Separater Login für Unternehmen. Zugänge werden manuell nach E-Mail-Kontakt +
// Vertrag vergeben (keine Selbstregistrierung). Prüft die Rolle EMPLOYER.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Loader2, FileSignature } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";
import { Field } from "@/app/components/ui";
import Logo from "@/app/components/Logo";

export default function UnternehmenLoginPage() {
  const router = useRouter();
  const { login, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await api.login(email, password);
    if (!res.ok) {
      setLoading(false);
      setError(res.error);
      return;
    }
    if (res.data.user.role !== "EMPLOYER") {
      // Kein Firmenkonto → nicht anmelden.
      logout();
      setLoading(false);
      setError(
        "Dieser Zugang ist nur für Unternehmen. Als Handwerker:in melde dich bitte über den normalen Login an."
      );
      return;
    }
    login(res.data);
    router.push("/unternehmen/dashboard");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Brand-Panel */}
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
        <Link href="/" className="relative flex items-center gap-3 w-fit">
          <Logo height={24} variant="hell" priority />
          <span className="text-accent text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Business
          </span>
        </Link>

        <div className="relative">
          <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.22em] uppercase mb-6">
            <span className="w-8 h-[2px] bg-accent" />
            Für Betriebe
          </span>
          <h1
            className="text-white font-bold leading-[1.08] mb-5"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3.25rem)" }}
          >
            Vorselektierte
            <br />
            Fachkräfte, direkt.
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-sm">
            Dein Firmenzugang zu passenden Handwerker:innen. Melde dich mit den
            Zugangsdaten an, die du nach Vertragsabschluss von uns erhalten hast.
          </p>
        </div>

        <div className="relative flex items-center gap-2.5 text-white/40 text-xs">
          <FileSignature className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#F9AD07" }} />
          Zugänge werden ausschließlich nach Vertragsabschluss vergeben.
        </div>
      </div>

      {/* Formular */}
      <div className="flex items-center justify-center px-6 py-12" style={{ background: "#F5F2EC" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-10">
            <Logo height={22} />
            <span className="text-primary text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Business
            </span>
          </Link>

          <h2 className="text-primary font-bold text-2xl mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
            Firmen-Login
          </h2>
          <p className="text-sm mb-8" style={{ color: "#5F6F6A" }}>
            Zugang für Partnerbetriebe.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field
              label="Firmen-E-Mail"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="kontakt@deinbetrieb.de"
              autoComplete="email"
              required
            />
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
                  className="w-full bg-white text-primary text-sm px-4 py-3.5 pr-11 outline-none transition-all duration-200 placeholder:text-primary/20"
                  style={{ border: `1.5px solid ${password ? "#0C3330" : "#DFE3E0"}`, fontFamily: "var(--font-sans)" }}
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
                <><Loader2 className="w-4 h-4 animate-spin" />Anmelden…</>
              ) : (
                <>Anmelden<ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" /></>
              )}
            </button>
          </form>

          {/* Der Text gehört in EIN Flex-Kind: sonst wird jeder Knoten zur
              eigenen Spalte und die Zeile zerfällt — bei der längeren Adresse
              sogar mitten im Wort. */}
          <div className="flex items-start gap-2 mt-6 text-[11px]" style={{ color: "rgba(95, 111, 106,0.75)" }}>
            <Lock className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "#F9AD07" }} />
            <span className="leading-relaxed">
              Noch kein Firmenzugang? Kontaktiere uns unter{" "}
              <a
                href="mailto:kontakt@porta-werk.de"
                className="font-semibold whitespace-nowrap"
                style={{ color: "#F9AD07" }}
              >
                kontakt@porta-werk.de
              </a>{" "}
              — Zugänge vergeben wir nach Vertragsabschluss.
            </span>
          </div>

          <p className="mt-6 text-sm text-center" style={{ color: "#5F6F6A" }}>
            Du bist Handwerker:in?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#F9AD07" }}>
              Zum normalen Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
