"use client";

// ─── Affiliate-/Partner-Dashboard (Frontend, Demo-Daten) ──────────────────────
// Zahlen sind Platzhalter. Sobald das Backend steht, werden sie aus den
// Partner-Endpunkten (Referrals, Auszahlungen) geladen.

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Hammer, Copy, Check, Share2, Wallet, Users, BadgeCheck, TrendingUp,
  UserPlus, Clock, LogOut,
} from "lucide-react";

const LINK = "portawerk.de/r/max";
const fmt = (n: number) => n.toLocaleString("de-DE");

// Monats-Einnahmen (Demo).
const EINNAHMEN = [
  { m: "Feb", v: 200 },
  { m: "Mär", v: 400 },
  { m: "Apr", v: 300 },
  { m: "Mai", v: 600 },
  { m: "Jun", v: 900 },
  { m: "Jul", v: 700 },
];

type Status = "geworben" | "vermittlung" | "vermittelt" | "ausgezahlt";
const STATUS: Record<Status, { label: string; icon: typeof Check; bg: string; fg: string }> = {
  geworben:    { label: "Geworben",         icon: UserPlus,   bg: "#F1F1EF", fg: "#6B7280" },
  vermittlung: { label: "In Vermittlung",   icon: Clock,      bg: "#EAF2FE", fg: "#2563EB" },
  vermittelt:  { label: "Vermittelt",       icon: Check,      bg: "#E7F7EE", fg: "#15803D" },
  ausgezahlt:  { label: "Prämie ausgezahlt", icon: BadgeCheck, bg: "#E7F7EE", fg: "#15803D" },
};

const REFERRALS: { name: string; gewerk: string; datum: string; status: Status; euro: number }[] = [
  { name: "Thomas M.", gewerk: "Elektriker", datum: "03.07.", status: "ausgezahlt", euro: 100 },
  { name: "Kevin B.", gewerk: "Anlagenmechaniker SHK", datum: "28.06.", status: "ausgezahlt", euro: 100 },
  { name: "Andreas R.", gewerk: "Maler & Lackierer", datum: "21.06.", status: "vermittelt", euro: 100 },
  { name: "Sven K.", gewerk: "Tischler", datum: "18.06.", status: "vermittelt", euro: 100 },
  { name: "Murat Y.", gewerk: "Metallbauer", datum: "11.06.", status: "vermittlung", euro: 0 },
  { name: "Lukas P.", gewerk: "Maurer", datum: "05.06.", status: "vermittlung", euro: 0 },
  { name: "Daniel W.", gewerk: "Dachdecker", datum: "29.05.", status: "geworben", euro: 0 },
  { name: "Erkan D.", gewerk: "Fliesenleger", datum: "24.05.", status: "geworben", euro: 0 },
];

export default function PartnerDashboard() {
  const [copied, setCopied] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  const geworben = 42;
  const vermittelt = 31;
  const verdient = EINNAHMEN.reduce((s, d) => s + d.v, 0);
  const conversion = Math.round((vermittelt / geworben) * 100);
  const maxV = Math.max(...EINNAHMEN.map((d) => d.v));
  const yTop = Math.ceil(maxV / 300) * 300; // schöne Obergrenze

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
    { label: "Verdient gesamt", value: `${fmt(verdient)} €`, icon: Wallet, accent: true, sub: "in den letzten 6 Monaten" },
    { label: "Geworben", value: fmt(geworben), icon: Users, sub: "Kandidaten insgesamt" },
    { label: "Vermittelt", value: fmt(vermittelt), icon: BadgeCheck, sub: "erfolgreich in den Job" },
    { label: "Conversion-Rate", value: `${conversion} %`, icon: TrendingUp, sub: "der Geworbenen", bar: conversion },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      {/* Kopf */}
      <div className="bg-primary">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 h-[68px] flex items-center justify-between">
          <Link href="/verdienen" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-accent flex items-center justify-center transition-transform group-hover:scale-95">
              <Hammer className="w-4 h-4 text-primary" strokeWidth={2} />
            </div>
            <span className="text-white text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>PortaWerk</span>
            <span className="text-white/40 text-sm hidden sm:inline ml-1">· Partner</span>
          </Link>
          <Link href="/verdienen" className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Abmelden
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-10">
        {/* Begrüßung + Link */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-primary font-bold text-3xl md:text-4xl leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              Hi, Max 👋
            </h1>
            <p className="text-muted mt-2">Dein Überblick — alle Zahlen auf einen Blick.</p>
          </div>
          <div className="flex items-stretch rounded-full border border-border bg-white overflow-hidden max-w-full">
            <span className="flex items-center px-4 text-primary font-semibold text-sm truncate">{LINK}</span>
            <button onClick={copy} className="shrink-0 px-4 bg-accent text-primary text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-amber-400 transition-colors">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "Kopiert" : "Kopieren"}
            </button>
            <button onClick={share} aria-label="Teilen" className="shrink-0 px-4 border-l border-border text-primary hover:bg-surface transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPI-Kacheln */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <motion.div
                key={k.label}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-border p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted text-xs font-semibold uppercase tracking-wider">{k.label}</span>
                  <Icon className="w-4 h-4 text-accent" strokeWidth={2} />
                </div>
                <p className={`font-black leading-none ${k.accent ? "text-accent" : "text-primary"}`} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 5vw, 2.1rem)" }}>
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
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-primary font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>Deine Einnahmen</h2>
              <span className="text-muted text-xs">pro Monat · €</span>
            </div>

            <div className="relative" style={{ height: 200 }}>
              {/* Gridlines + Y-Beschriftung */}
              {[0, 0.5, 1].map((g) => (
                <div key={g} className="absolute left-0 right-0 flex items-center gap-2" style={{ bottom: `${g * 100}%` }}>
                  <span className="text-[10px] text-muted w-8 text-right tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(g * yTop)}</span>
                  <div className="flex-1 border-t border-border/70" />
                </div>
              ))}
              {/* Balken */}
              <div className="absolute inset-0 pl-10 flex items-end justify-between gap-2 sm:gap-3">
                {EINNAHMEN.map((d, i) => (
                  <div
                    key={d.m}
                    className="flex-1 h-full flex flex-col justify-end items-center relative"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                  >
                    {hover === i && (
                      <div className="absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-lg bg-primary text-white text-xs font-semibold px-2.5 py-1.5 shadow-lg">
                        {d.m}: {fmt(d.v)} €
                      </div>
                    )}
                    <div
                      className="w-full rounded-t-md transition-all duration-200"
                      style={{
                        height: `${(d.v / yTop) * 100}%`,
                        background: hover === null || hover === i ? "#E8A838" : "rgba(232,168,56,0.4)",
                        maxWidth: 46,
                        marginInline: "auto",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* X-Beschriftung */}
            <div className="pl-10 flex justify-between gap-2 sm:gap-3 mt-2">
              {EINNAHMEN.map((d) => (
                <span key={d.m} className="flex-1 text-center text-[11px] text-muted">{d.m}</span>
              ))}
            </div>
          </div>

          {/* Empfehlungen-Tabelle */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
            <h2 className="text-primary font-bold text-lg mb-5" style={{ fontFamily: "var(--font-display)" }}>Deine Empfehlungen</h2>
            <div className="flex flex-col divide-y divide-border">
              {REFERRALS.map((r) => {
                const s = STATUS[r.status];
                const Icon = s.icon;
                return (
                  <div key={r.name} className="flex items-center gap-3 py-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--color-accent-soft)" }}>
                      <span className="text-[11px] font-bold" style={{ color: "#B47B18" }}>{r.name.split(" ").map((p) => p[0]).join("")}</span>
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

        <p className="text-muted text-xs mt-6 text-center">
          Demo-Daten. Sobald das Backend steht, siehst du hier deine echten Zahlen in Echtzeit.
        </p>
      </div>
    </div>
  );
}
