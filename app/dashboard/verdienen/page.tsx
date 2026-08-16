"use client";

// ─── Verdienen (im Dashboard) ─────────────────────────────────────────────────
// Bleibt bewusst innerhalb der Dashboard-Hülle: die Navigation oben bleibt
// stehen, man kann jederzeit zu Angeboten oder Bewerbungen wechseln.
//
// Das Partnerprogramm hat eine eigene Anmeldung (getrennte Session, siehe
// partnerSession in lib/api.ts). Ist man nicht angemeldet, erscheint das
// Anmeldeformular hier direkt — kein Sprung auf eine andere Seite.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet, Users, CheckCircle2, TrendingUp, Copy, Check, Loader2,
  Eye, EyeOff, LogOut, ArrowRight, Share2,
} from "lucide-react";
import { api, partnerSession, type PartnerDashboardData } from "@/lib/api";

function euro(cents: number) {
  return (cents / 100).toLocaleString("de-DE", { maximumFractionDigits: 0 });
}

// ─── Anmeldung ────────────────────────────────────────────────────────────────
function PartnerLogin({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await api.partnerLogin(identifier.trim(), password);
    setLoading(false);
    if (res.ok) {
      partnerSession.set(res.data.accessToken);
      onSuccess(res.data.accessToken);
    } else {
      setError(res.error);
    }
  };

  const field =
    "w-full rounded-2xl bg-white text-primary text-[15px] px-4 py-3.5 outline-none transition-all placeholder:text-primary/25";

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] gap-6 items-start">
      {/* Nutzenversprechen */}
      <div className="relative overflow-hidden rounded-3xl p-7" style={{ background: "#0C3330" }}>
        <div
          className="absolute -top-24 -right-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(249, 173, 7,0.22) 0%, transparent 70%)" }}
        />
        <div className="relative">
          <span
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] mb-3"
            style={{ color: "#F9AD07" }}
          >
            <span className="w-6 h-[2px] bg-accent" />
            Empfehlungsprogramm
          </span>
          <h2
            className="text-white font-bold text-[26px] leading-snug mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            100 € für jeden Kollegen, den du vermittelst
          </h2>
          <p className="text-[14px] leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
            Du bekommst einen persönlichen Link. Findet jemand darüber einen Job,
            bekommst du die Prämie ausgezahlt — unabhängig davon, ob du selbst gerade
            suchst.
          </p>
          <ul className="space-y-2.5">
            {[
              "Kostenlos, keine Mindestanzahl",
              "Auszahlung aufs eigene Konto",
              "Läuft parallel zu deinen Bewerbungen",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[13.5px]" style={{ color: "rgba(255,255,255,0.72)" }}>
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#F9AD07" }} strokeWidth={3} />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Formular */}
      <div
        className="rounded-3xl bg-white p-6"
        style={{ border: "1.5px solid #E4DFD3", boxShadow: "0 10px 30px -24px rgba(12, 51, 48,0.5)" }}
      >
        <h3 className="text-primary font-bold text-[18px] mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Partner-Anmeldung
        </h3>
        <p className="text-[13px] mb-5" style={{ color: "rgba(12, 51, 48,0.55)" }}>
          Eigene Zugangsdaten — getrennt von deinem Handwerker-Konto.
        </p>

        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.16em] font-semibold mb-2" style={{ color: "rgba(12, 51, 48,0.45)" }}>
              Telefonnummer oder Link-Name
            </label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="+49 170 … oder max"
              autoComplete="username"
              className={field}
              style={{ border: "1.5px solid #E4DFD3" }}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.16em] font-semibold mb-2" style={{ color: "rgba(12, 51, 48,0.45)" }}>
              Passwort
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={`${field} pr-12`}
                style={{ border: "1.5px solid #E4DFD3" }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Passwort verbergen" : "Passwort anzeigen"}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(12, 51, 48,0.35)" }}
              >
                {showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[13px] rounded-xl px-3.5 py-2.5" style={{ background: "rgba(239,68,68,0.07)", color: "#B91C1C" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !identifier.trim() || !password}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[15px] font-bold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-45 disabled:hover:translate-y-0"
            style={{ background: "#F9AD07", color: "#0C3330", fontFamily: "var(--font-display)" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
            Anmelden
          </button>
        </form>

        <p className="text-[13px] mt-5 pt-5 text-center" style={{ borderTop: "1px solid #EDE8DE", color: "rgba(12, 51, 48,0.55)" }}>
          Noch kein Partner?{" "}
          <Link href="/verdienen/partner" className="font-bold" style={{ color: "#8A5F04" }}>
            Kostenlos registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Übersicht für angemeldete Partner ───────────────────────────────────────
function PartnerOverview({
  data,
  onLogout,
}: {
  data: PartnerDashboardData;
  onLogout: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Zwischenablage nicht verfügbar */
    }
  };

  const stats = [
    { label: "Verdient", value: `${euro(data.earnedCents)} €`, icon: Wallet },
    { label: "Geworben", value: String(data.referredCount), icon: Users },
    { label: "Vermittelt", value: String(data.placedCount), icon: CheckCircle2 },
    { label: "Quote", value: `${Math.round(data.conversion)} %`, icon: TrendingUp },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-[15px]" style={{ color: "rgba(12, 51, 48,0.55)" }}>
          Angemeldet als <strong className="text-primary">{data.name}</strong>
        </p>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 text-[13px] font-semibold rounded-full px-4 py-2 transition-colors"
          style={{ background: "rgba(12, 51, 48,0.05)", color: "rgba(12, 51, 48,0.6)" }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Partner abmelden
        </button>
      </div>

      {/* Kennzahlen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-2xl bg-white p-4"
              style={{ border: "1.5px solid #E4DFD3", boxShadow: "0 6px 20px -18px rgba(12, 51, 48,0.5)" }}
            >
              <Icon className="w-4 h-4 mb-2.5" style={{ color: "#F9AD07" }} />
              <p
                className="text-[22px] font-bold tabular-nums text-primary leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.value}
              </p>
              <p className="text-[11.5px] mt-1.5" style={{ color: "rgba(12, 51, 48,0.45)" }}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Persönlicher Link */}
      <div className="relative overflow-hidden rounded-3xl p-6 mb-6" style={{ background: "#0C3330" }}>
        <div
          className="absolute -top-20 -right-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(249, 173, 7,0.2) 0%, transparent 70%)" }}
        />
        <div className="relative">
          <p
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] mb-3"
            style={{ color: "#F9AD07" }}
          >
            <Share2 className="w-3.5 h-3.5" />
            Dein Empfehlungslink
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              readOnly
              value={data.link}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 min-w-0 rounded-full px-5 py-3.5 text-[14px] outline-none"
              style={{ background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.14)" }}
            />
            <button
              onClick={copy}
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-bold flex-shrink-0 transition-transform duration-200 hover:-translate-y-0.5"
              style={{ background: "#F9AD07", color: "#0C3330", fontFamily: "var(--font-display)" }}
            >
              {copied ? <Check className="w-4 h-4" strokeWidth={3} /> : <Copy className="w-4 h-4" />}
              {copied ? "Kopiert" : "Kopieren"}
            </button>
          </div>
        </div>
      </div>

      {/* Letzte Empfehlungen */}
      <div
        className="rounded-3xl bg-white overflow-hidden"
        style={{ border: "1.5px solid #E4DFD3", boxShadow: "0 10px 30px -24px rgba(12, 51, 48,0.5)" }}
      >
        <div className="flex items-center justify-between gap-3 px-6 py-4" style={{ borderBottom: "1px solid #EDE8DE" }}>
          <h2 className="text-primary font-bold text-[17px]" style={{ fontFamily: "var(--font-display)" }}>
            Deine Empfehlungen
          </h2>
          <Link
            href="/verdienen/dashboard"
            className="group inline-flex items-center gap-1.5 text-[13px] font-bold"
            style={{ color: "#8A5F04" }}
          >
            Alle Details
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {data.referrals.length === 0 ? (
          <p className="px-6 py-12 text-center text-[13.5px]" style={{ color: "rgba(12, 51, 48,0.5)" }}>
            Noch niemand geworben — teil deinen Link, um loszulegen.
          </p>
        ) : (
          <ul>
            {data.referrals.slice(0, 5).map((r, i) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 px-6 py-3.5"
                style={{ borderTop: i > 0 ? "1px solid #F2EFE7" : "none" }}
              >
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-primary truncate">{r.name}</span>
                  <span className="block text-[12px]" style={{ color: "rgba(12, 51, 48,0.45)" }}>
                    {r.trade} · {r.date}
                  </span>
                </span>
                <span
                  className="text-[14px] font-bold tabular-nums flex-shrink-0"
                  style={{ color: r.rewardCents > 0 ? "#15803D" : "rgba(12, 51, 48,0.4)" }}
                >
                  {r.rewardCents > 0 ? `+${euro(r.rewardCents)} €` : "offen"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Seite ────────────────────────────────────────────────────────────────────
export default function DashboardVerdienenPage() {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<PartnerDashboardData | null>(null);
  const [checking, setChecking] = useState(true);

  const load = useCallback(async (t: string) => {
    const res = await api.partnerDashboard(t);
    if (res.ok) {
      setData(res.data);
      setToken(t);
    } else {
      // Abgelaufene Partner-Session verwerfen — hier wird nicht umgeleitet.
      partnerSession.clear();
      setToken(null);
      setData(null);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    const t = partnerSession.get();
    if (!t) {
      setChecking(false);
      return;
    }
    void load(t);
  }, [load]);

  const handleLogout = async () => {
    if (token) await api.partnerLogout(token);
    partnerSession.clear();
    setToken(null);
    setData(null);
  };

  return (
    <div>
      <h1
        className="text-primary font-bold mb-1"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)" }}
      >
        Verdienen
      </h1>
      <p className="text-[15px] mb-7" style={{ color: "rgba(12, 51, 48,0.55)" }}>
        Empfiehl Kollegen und verdien nebenbei — deine Bewerbungen laufen unabhängig
        davon weiter.
      </p>

      {checking ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#F9AD07" }} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {data ? (
            <PartnerOverview data={data} onLogout={handleLogout} />
          ) : (
            <PartnerLogin onSuccess={(t) => void load(t)} />
          )}
        </motion.div>
      )}
    </div>
  );
}
