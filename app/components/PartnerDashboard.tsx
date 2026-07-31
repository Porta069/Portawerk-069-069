"use client";

// ─── Affiliate-/Partner-Dashboard ─────────────────────────────────────────────
// Lädt die echten Kennzahlen aus dem Backend (/partner/dashboard): verdientes
// Geld, geworbene/vermittelte Kandidaten, Einnahmen-Verlauf, Rangliste.

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hammer, Copy, Check, Share2, Users, BadgeCheck, TrendingUp,
  UserPlus, Clock, LogOut, ArrowUpRight, Trophy, Medal, Crown, Loader2,
} from "lucide-react";
import EarningsChart from "./EarningsChart";
import Visitenkarte from "./Visitenkarte";
import { api, partnerSession, type PartnerDashboardData, type ReferralStatus } from "@/lib/api";

const fmt = (n: number) => n.toLocaleString("de-DE");

type Status = "geworben" | "vermittlung" | "vermittelt" | "ausgezahlt";
const STATUS: Record<Status, { label: string; icon: typeof Check; bg: string; fg: string }> = {
  geworben:    { label: "Geworben",         icon: UserPlus,   bg: "#F1F1EF", fg: "#6B7280" },
  vermittlung: { label: "In Vermittlung",   icon: Clock,      bg: "#EAF2FE", fg: "#2563EB" },
  vermittelt:  { label: "Vermittelt",       icon: Check,      bg: "#E7F7EE", fg: "#15803D" },
  ausgezahlt:  { label: "Prämie ausgezahlt", icon: BadgeCheck, bg: "#E7F7EE", fg: "#15803D" },
};
// Backend-Enum → Status-Schlüssel des UI.
const STATUS_FROM_BACKEND: Record<ReferralStatus, Status> = {
  REGISTERED: "geworben",
  IN_PLACEMENT: "vermittlung",
  PLACED: "vermittelt",
  PAID: "ausgezahlt",
};

const initials = (n: string) => n.split(" ").map((p) => p[0]).join("");

function RankBadge({ rang }: { rang: number }) {
  if (rang === 1) return <Crown className="w-4 h-4" style={{ color: "#E8A838" }} strokeWidth={2.2} fill="#E8A838" />;
  if (rang === 2) return <Medal className="w-4 h-4" style={{ color: "#9CA3AF" }} strokeWidth={2.2} />;
  if (rang === 3) return <Medal className="w-4 h-4" style={{ color: "#B47B18" }} strokeWidth={2.2} />;
  return <span className="text-muted text-sm font-bold tabular-nums w-4 text-center">{rang}</span>;
}

export default function PartnerDashboard() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [data, setData] = useState<PartnerDashboardData | null>(null);
  const [loadError, setLoadError] = useState(false);

  // Echte Kennzahlen laden; ohne gültige Partner-Session zurück zur Anmeldung.
  const load = useCallback(() => {
    const token = partnerSession.get();
    if (!token) {
      router.replace("/verdienen/login");
      return;
    }
    setLoadError(false);
    api.partnerDashboard(token).then((r) => {
      if (r.ok) {
        setData(r.data);
      } else if (r.status === 401) {
        partnerSession.clear();
        router.replace("/verdienen/login");
      } else {
        setLoadError(true);
      }
    });
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const doLogout = async () => {
    const token = partnerSession.get();
    if (token) await api.partnerLogout(token);
    partnerSession.clear();
    router.push("/verdienen");
  };

  // Lade- / Fehlerzustand — markenkonform (Navy + Gold).
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-primary text-white px-6 text-center">
        {loadError ? (
          <>
            <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              Dein Dashboard konnte nicht geladen werden.
            </p>
            <p className="text-white/60 text-sm">Der Server war kurz nicht erreichbar. Bitte lade die Seite neu.</p>
            <button
              onClick={load}
              className="mt-2 rounded-full bg-accent text-primary font-bold px-6 py-3 text-sm hover:bg-amber-400 transition-colors"
            >
              Erneut versuchen
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-7 h-7 text-accent animate-spin" />
            <p className="text-white/60 text-sm">Dein Dashboard wird geladen …</p>
          </>
        )}
      </div>
    );
  }

  const NAME = data.firstName;
  const LINK = data.link;
  const SLUG = data.slug;
  const EINNAHMEN = data.monthly.map((m) => ({ m: m.month, v: Math.round(m.cents / 100) }));
  const REFERRALS = data.referrals.map((r) => ({
    name: r.name,
    gewerk: r.trade,
    datum: r.date,
    status: STATUS_FROM_BACKEND[r.status],
    euro: Math.round(r.rewardCents / 100),
  }));
  const RANGLISTE = data.ranking.top.map((t) => ({ rang: t.rank, name: t.name }));
  const MEIN_RANG = data.ranking.myRank;

  const geworben = data.referredCount;
  const vermittelt = data.placedCount;
  const verdient = Math.round(data.earnedCents / 100);
  const conversion = data.conversion;
  const lastMonth = EINNAHMEN[EINNAHMEN.length - 1];
  const letzterMonat = lastMonth ? lastMonth.v : 0;
  const letzterMonatLabel = lastMonth ? lastMonth.m : "";

  const copy = () => {
    navigator.clipboard?.writeText("https://" + LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const share = () => {
    const text = encodeURIComponent(`Such einen Job im Handwerk? Über meinen Link findest du kostenlos einen: https://${LINK}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
  };

  const kpis = [
    { label: "Geworben", value: fmt(geworben), icon: Users, sub: "Kandidaten insgesamt" },
    { label: "Vermittelt", value: fmt(vermittelt), icon: BadgeCheck, sub: "erfolgreich in den Job" },
    { label: "Conversion-Rate", value: `${conversion} %`, icon: TrendingUp, sub: "deiner Geworbenen", bar: conversion },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      {/* ══ Hero (Navy, full-bleed) ══ */}
      <header className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
        <div className="absolute -top-24 -right-16 w-[420px] h-[420px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(232,168,56,0.20) 0%, transparent 65%)" }} />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-12">
          {/* Topbar */}
          <div className="h-[68px] flex items-center justify-between">
            <Link href="/verdienen" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-md transition-transform group-hover:scale-95">
                <Hammer className="w-4 h-4 text-primary" strokeWidth={2} />
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>PortaWerk</span>
              <span className="text-white/40 text-sm hidden sm:inline ml-1">· Partner</span>
            </Link>
            <button
              onClick={() => setShowLogout(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/5 text-sm font-medium px-4 py-2 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Abmelden
            </button>
          </div>

          {/* Begrüßung + Held-Zahl + Link */}
          <div className="pt-8 pb-24 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 items-center">
            {/* Links */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <h1 className="font-bold leading-[1.05] mb-7" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 4vw, 2.7rem)" }}>
                Hi, {NAME} <span className="inline-block">👋</span>
              </h1>

              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-2">Bereits verdient</p>
              <div className="flex items-end gap-4 flex-wrap">
                <span
                  className="relative inline-flex overflow-hidden leading-none"
                  style={{ filter: "drop-shadow(0 0 42px rgba(232,168,56,0.35))" }}
                >
                  <span className="relative z-0 font-black text-accent" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3.2rem, 8.5vw, 5rem)" }}>
                    {fmt(verdient)} €
                  </span>
                  <span aria-hidden className="shimmer-glint pointer-events-none absolute inset-y-0 left-0 z-10 w-1/3 bg-gradient-to-r from-transparent via-white/55 to-transparent" />
                </span>
                {letzterMonat > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#22C55E]/15 text-[#4ADE80] text-sm font-bold px-3 py-1.5 mb-2">
                    <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} /> +{fmt(letzterMonat)} € im {letzterMonatLabel}
                  </span>
                )}
              </div>
              <p className="text-white/50 text-sm mt-4">in den letzten 6 Monaten · Auszahlung nach erfolgreicher Vermittlung</p>
            </motion.div>

            {/* Rechts: Empfehlungs-Link */}
            <motion.div
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-accent font-semibold mb-3">Dein Empfehlungs-Link</p>
              <div className="rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3.5 mb-4">
                <p className="text-lg sm:text-xl font-semibold tracking-tight break-all">
                  <span className="text-white/45">portawerk.de/r/</span><span className="text-white">{SLUG}</span>
                </p>
              </div>
              <div className="flex gap-2.5">
                <button onClick={copy} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent text-primary font-bold py-3 text-sm hover:bg-amber-400 transition-colors">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "Kopiert" : "Kopieren"}
                </button>
                <button onClick={share} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 text-white font-semibold px-5 py-3 text-sm hover:bg-white/10 transition-colors">
                  <Share2 className="w-4 h-4" /> Teilen
                </button>
              </div>
              <p className="text-white/40 text-xs mt-4 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-accent" /> 100 € pro erfolgreicher Vermittlung
              </p>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ══ Body ══ */}
      <div className="max-w-6xl mx-auto px-6 lg:px-12 pb-14">
        {/* KPI-Kacheln — überlappen den Hero */}
        <div className="relative z-10 -mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <motion.div
                key={k.label}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                className="bg-white rounded-2xl border border-border p-5 shadow-[0_18px_40px_-24px_rgba(26,26,46,0.35)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted text-xs font-semibold uppercase tracking-wider">{k.label}</span>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--color-accent-soft)" }}>
                    <Icon className="w-4 h-4 text-accent" strokeWidth={2} />
                  </span>
                </div>
                <p className="font-black leading-none text-primary" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.7rem, 5vw, 2.2rem)" }}>
                  {k.value}
                </p>
                {typeof k.bar === "number" && (
                  <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${k.bar}%` }} />
                  </div>
                )}
                <p className="text-muted text-xs mt-2">{k.sub}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Einnahmen-Chart */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-border p-6">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h2 className="text-primary font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>Deine Einnahmen</h2>
                <p className="text-muted text-xs mt-0.5">Verlauf der letzten 6 Monate</p>
              </div>
              <div className="text-right">
                <p className="text-primary font-black text-xl leading-none" style={{ fontFamily: "var(--font-display)" }}>{fmt(verdient)} €</p>
                {EINNAHMEN.length >= 2 &&
                  EINNAHMEN[EINNAHMEN.length - 1].v > EINNAHMEN[EINNAHMEN.length - 2].v && (
                    <p className="text-[#15803D] text-xs font-semibold mt-1">▲ Aufwärtstrend</p>
                  )}
              </div>
            </div>
            <EarningsChart data={EINNAHMEN} />
          </div>

          {/* Empfehlungen-Liste */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
            <h2 className="text-primary font-bold text-lg mb-5" style={{ fontFamily: "var(--font-display)" }}>Deine Empfehlungen</h2>
            {REFERRALS.length === 0 && (
              <div className="text-center py-8">
                <div className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "var(--color-accent-soft)" }}>
                  <UserPlus className="w-5 h-5 text-accent" strokeWidth={2} />
                </div>
                <p className="text-primary text-sm font-semibold mb-1">Noch keine Empfehlungen</p>
                <p className="text-muted text-xs max-w-[15rem] mx-auto">Teil deinen Link — sobald jemand darüber startet, erscheint er hier.</p>
              </div>
            )}
            <div className="flex flex-col divide-y divide-border">
              {REFERRALS.map((r) => {
                const s = STATUS[r.status];
                const Icon = s.icon;
                return (
                  <div key={r.name} className="flex items-center gap-3 py-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--color-accent-soft)" }}>
                      <span className="text-[11px] font-bold" style={{ color: "#B47B18" }}>{initials(r.name)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-primary text-sm font-semibold truncate">{r.name}</p>
                      <p className="text-muted text-xs truncate">{r.gewerk} · {r.datum}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: s.bg, color: s.fg }}>
                        <Icon className="w-3 h-3" strokeWidth={2.5} /> {s.label}
                      </span>
                      {r.euro > 0 && <span className="text-primary text-xs font-bold">+{r.euro} €</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Online-Visitenkarte — freigeschaltet, weil man hier bereits Partner ist */}
        <div className="mt-6 bg-white rounded-2xl border border-border p-6 sm:p-8" id="visitenkarte">
          <div className="mb-8 max-w-xl">
            <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-4">
              <span className="w-8 h-[2px] bg-accent" />
              Deine Online-Visitenkarte
            </span>
            <h2 className="text-primary font-bold text-2xl md:text-3xl leading-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Ein Bild — einfach weiterschicken
            </h2>
            <p className="text-muted text-base">
              Lade deine persönliche Karte herunter und schick sie an Handwerker, die
              einen Job suchen. Dein Link ist schon drauf.
            </p>
          </div>
          <Visitenkarte fixedSlug={SLUG} />
        </div>

        {/* ══ Rangliste ══ */}
        <div className="mt-6 bg-white rounded-2xl border border-border p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--color-accent-soft)" }}>
              <Trophy className="w-5 h-5 text-accent" strokeWidth={2} />
            </span>
            <h2 className="text-primary font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>Rangliste</h2>
          </div>
          <p className="text-muted text-xs mb-6 ml-12">Die stärksten Vermittler dieses Monats — sei ganz oben dabei.</p>

          <div className="flex flex-col">
            {RANGLISTE.map((p) => (
              <div key={p.rang} className="flex items-center gap-3 py-2.5 border-t border-border first:border-t-0">
                <span className="w-6 flex justify-center"><RankBadge rang={p.rang} /></span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#F1F1EF" }}>
                  <span className="text-[11px] font-bold text-muted">{initials(p.name)}</span>
                </div>
                <span className="text-primary text-sm font-semibold flex-1 truncate">{p.name}</span>
              </div>
            ))}

            {/* Trenner + eigene Position */}
            <div className="flex items-center gap-2 py-2 pl-6 text-muted/60 text-xs tracking-widest select-none">· · ·</div>
            <div className="flex items-center gap-3 py-2.5 rounded-xl px-3 -mx-1" style={{ background: "var(--color-accent-soft)", border: "1px solid rgba(232,168,56,0.35)" }}>
              <span className="w-6 flex justify-center"><span className="text-sm font-bold tabular-nums" style={{ color: "#B47B18" }}>{MEIN_RANG}</span></span>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-accent">
                <span className="text-[11px] font-bold text-primary">{initials(NAME)}</span>
              </div>
              <span className="text-primary text-sm font-bold flex-1 truncate">{NAME} <span className="text-accent font-semibold">· Du</span></span>
              <span className="text-xs font-semibold" style={{ color: "#B47B18" }}>{vermittelt} Vermittlung{vermittelt === 1 ? "" : "en"}</span>
            </div>
          </div>
        </div>

        <p className="text-muted text-xs mt-6 text-center">
          Deine echten Zahlen — in Echtzeit aus deinem Partner-Konto.
        </p>
      </div>

      {/* ══ Abmelde-Bestätigung ══ */}
      <AnimatePresence>
        {showLogout && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={() => setShowLogout(false)} />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white rounded-2xl border border-border shadow-2xl p-7 max-w-sm w-full text-center"
            >
              <span className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--color-accent-soft)" }}>
                <LogOut className="w-5 h-5 text-accent" strokeWidth={2} />
              </span>
              <h3 className="text-primary font-bold text-xl mb-2" style={{ fontFamily: "var(--font-display)" }}>Wirklich abmelden?</h3>
              <p className="text-muted text-sm mb-6">Du verlässt dein Partner-Dashboard und kommst zurück zur Startseite.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogout(false)}
                  className="flex-1 rounded-full border border-border text-primary font-semibold py-3 text-sm hover:border-accent transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={doLogout}
                  className="flex-1 rounded-full bg-primary text-white font-semibold py-3 text-sm hover:bg-accent hover:text-primary transition-colors"
                >
                  Abmelden
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
