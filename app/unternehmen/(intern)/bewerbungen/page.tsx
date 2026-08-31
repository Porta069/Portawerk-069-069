"use client";

// ─── Bewerbungen (Arbeitgeber) ───────────────────────────────────────────────
// Alle Bewerbungen auf die eigenen Inserate. Der Betrieb sieht das anonyme
// Kandidatenprofil samt Match-Score gegen das jeweilige Inserat und setzt den
// Status — der Handwerker sieht die Änderung sofort in seinem Dashboard.
// Kontaktdaten erscheinen NUR, wenn der Kandidat eine Kontaktanfrage
// freigegeben hat (Diskretionsversprechen).

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Loader2, Inbox, Briefcase, Award, Route, Clock3, ShieldCheck, Check,
  Eye, MessagesSquare, ThumbsUp, ThumbsDown, Phone, Mail,
} from "lucide-react";
import {
  listEmployerApplications, setApplicationStatus, requestContact,
} from "@/lib/employerService";
import type { EmployerApplication, ApplicationStatus } from "@/lib/types";
import ScoreExplainer from "@/app/components/ScoreExplainer";
import Wartezustand from "@/app/components/dashboard/Wartezustand";
import { useAuth } from "@/app/context/AuthContext";

const STATUS_META: Record<
  ApplicationStatus,
  { label: string; bg: string; color: string }
> = {
  gesendet: { label: "Neu", bg: "rgba(232,168,56,0.16)", color: "#8A5B0F" },
  gesehen: { label: "Gesehen", bg: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.6)" },
  im_gespraech: { label: "Im Gespräch", bg: "rgba(59,130,246,0.12)", color: "#1D4ED8" },
  zusage: { label: "Zusage", bg: "rgba(22,163,74,0.14)", color: "#15803D" },
  abgelehnt: { label: "Abgesagt", bg: "rgba(239,68,68,0.1)", color: "#B91C1C" },
};

/** Statuswechsel-Aktionen — bewusst als klare Schritte statt Dropdown. */
const ACTIONS: {
  status: Exclude<ApplicationStatus, "gesendet">;
  label: string;
  icon: typeof Eye;
}[] = [
  { status: "gesehen", label: "Gesehen", icon: Eye },
  { status: "im_gespraech", label: "Im Gespräch", icon: MessagesSquare },
  { status: "zusage", label: "Zusage", icon: ThumbsUp },
  { status: "abgelehnt", label: "Absagen", icon: ThumbsDown },
];

function ApplicationCard({
  app,
  onStatus,
  onRequestContact,
}: {
  app: EmployerApplication;
  onStatus: (status: Exclude<ApplicationStatus, "gesendet">) => Promise<void>;
  onRequestContact: () => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const c = app.candidate;
  const meta = STATUS_META[app.status];

  const act = async (fn: () => Promise<void>, key: string) => {
    setBusy(key);
    await fn();
    setBusy(null);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl bg-white p-5 sm:p-6"
      style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 10px 30px -24px rgba(26,26,46,0.5)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <h2
              className="text-primary font-bold text-[18px] leading-snug"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {c.handle}
            </h2>
            <span
              className="rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em]"
              style={{ background: meta.bg, color: meta.color }}
            >
              {meta.label}
            </span>
          </div>
          <p className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]" style={{ color: "rgba(26,26,46,0.55)" }}>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
              beworben auf „{app.jobPosting.title}“
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="w-3.5 h-3.5" />
              {app.createdAt}
            </span>
          </p>
        </div>

        {c.matchScore > 0 && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 flex-shrink-0 text-[15px] font-bold tabular-nums"
            style={{
              background: c.matchScore >= 80 ? "rgba(232,168,56,0.2)" : "rgba(26,26,46,0.05)",
              color: c.matchScore >= 80 ? "#8A5B0F" : "rgba(26,26,46,0.6)",
              fontFamily: "var(--font-display)",
            }}
          >
            {c.matchScore} %
            <ScoreExplainer breakdown={c.matchBreakdown} subject={c.handle} />
          </span>
        )}
      </div>

      {/* Kandidaten-Fakten */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[13px]" style={{ color: "rgba(26,26,46,0.65)" }}>
        <span className="inline-flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
          {c.erfahrung ? `${c.erfahrung} Erfahrung` : "Erfahrung —"}
        </span>
        {c.distanceKm != null && (
          <span className="inline-flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
            {c.distanceKm} km entfernt
          </span>
        )}
        {c.ausbildung && (
          <span className="inline-flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
            {c.ausbildung}
          </span>
        )}
        {c.aufgaben.slice(0, 2).map((a) => (
          <span key={a} className="inline-flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
            {a}
          </span>
        ))}
      </div>

      {/* Kontakt: nur nach Freigabe */}
      {c.freigegeben ? (
        <div
          className="flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-2xl px-4 py-3 mt-4 text-[13.5px]"
          style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.25)" }}
        >
          <span className="inline-flex items-center gap-1.5 font-bold" style={{ color: "#15803D" }}>
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
            {c.freigegeben.name}
          </span>
          <span className="inline-flex items-center gap-1.5" style={{ color: "rgba(26,26,46,0.7)" }}>
            <Phone className="w-3.5 h-3.5" />
            {c.freigegeben.telefon || "—"}
          </span>
          <span className="inline-flex items-center gap-1.5" style={{ color: "rgba(26,26,46,0.7)" }}>
            <Mail className="w-3.5 h-3.5" />
            {c.freigegeben.email}
          </span>
        </div>
      ) : (
        <p
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 mt-4 text-[12.5px]"
          style={{ background: "rgba(26,26,46,0.035)", color: "rgba(26,26,46,0.55)" }}
        >
          <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: "#E8A838" }} />
          Kontaktdaten erscheinen, sobald der Kandidat Ihre Kontaktanfrage annimmt.
          {c.status === "verfuegbar" && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void act(onRequestContact, "contact")}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold disabled:opacity-50"
              style={{ background: "#E8A838", color: "#1A1A2E" }}
            >
              {busy === "contact" && <Loader2 className="w-3 h-3 animate-spin" />}
              Kontakt anfragen
            </button>
          )}
          {c.status === "angefragt" && (
            <span className="font-semibold" style={{ color: "#8A5B0F" }}>
              Anfrage läuft — Kandidat entscheidet.
            </span>
          )}
        </p>
      )}

      {/* Status setzen */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4" style={{ borderTop: "1px solid #F1EEE8" }}>
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] mr-1" style={{ color: "rgba(26,26,46,0.4)" }}>
          Status setzen
        </span>
        {ACTIONS.map((a) => {
          const active = app.status === a.status;
          return (
            <button
              key={a.status}
              type="button"
              disabled={busy !== null || active}
              onClick={() => void act(() => onStatus(a.status), a.status)}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors disabled:cursor-default"
              style={{
                background: active ? STATUS_META[a.status].bg : "white",
                color: active ? STATUS_META[a.status].color : "rgba(26,26,46,0.6)",
                border: `1.5px solid ${active ? "transparent" : "#E0DDD6"}`,
                opacity: busy !== null && !active ? 0.5 : 1,
              }}
            >
              {busy === a.status ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <a.icon className="w-3.5 h-3.5" />
              )}
              {a.label}
            </button>
          );
        })}
      </div>
    </motion.article>
  );
}

export default function EmployerBewerbungenPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState<EmployerApplication[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    listEmployerApplications().then((res) => {
      if (res.ok) setApps(res.data);
      else setError(res.error);
    });
  };
  useEffect(load, []);

  const handleStatus = async (
    id: string,
    status: Exclude<ApplicationStatus, "gesendet">
  ) => {
    const res = await setApplicationStatus(id, status);
    if (res.ok) {
      setApps((cur) =>
        (cur ?? []).map((a) => (a.id === id ? { ...a, status } : a))
      );
    }
  };

  const handleContact = async (app: EmployerApplication) => {
    const res = await requestContact(app.candidate.id, app.jobPosting.title);
    if (res.ok) load();
  };

  const neue = apps?.filter((a) => a.status === "gesendet") ?? [];
  const rest = apps?.filter((a) => a.status !== "gesendet") ?? [];

  const zahlen = useMemo(() => {
    if (!apps?.length) return null;
    return {
      neu: apps.filter((a) => a.status === "gesendet").length,
      gespraech: apps.filter((a) => a.status === "im_gespraech").length,
      zusagen: apps.filter((a) => a.status === "zusage").length,
    };
  }, [apps]);

  return (
    <div>
      {/* ══ Kopf ══
          Randlos ueber die volle Fensterbreite mit echtem Werkstattfoto —
          dieselbe Bauform wie in der Jobboerse. Zuvor begann die Seite mit
          einer nackten Ueberschrift auf Papierton, waehrend jede
          Nachbarseite ein Band traegt.

          Das Foto zeigt eine Werkstatt, nie eine Person: die Kandidaten hier
          sind anonym, ein Gesicht im Kopf der Seite waere ein falsches
          Versprechen. */}
      <div className="vollbreite relative overflow-hidden -mt-10 mb-8">
        <Image
          src="/images/hero-team-werkstatt.jpg"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
          style={{ objectPosition: "center 42%" }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(96deg, rgba(20,20,36,0.96) 0%, rgba(20,20,36,0.9) 44%, rgba(20,20,36,0.58) 100%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-8 sm:py-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span
                className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] mb-3"
                style={{ color: "#E8A838" }}
              >
                <span className="w-6 h-[2px] bg-accent" />
                {user?.companyName || "Ihr Betrieb"}
              </span>
              <h1
                className="text-white font-bold leading-tight"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3.4vw, 2.7rem)" }}
              >
                Bewerbungen
              </h1>
              <p className="text-[15px] mt-2 max-w-lg" style={{ color: "rgba(255,255,255,0.55)" }}>
                Wer sich auf Ihre Inserate beworben hat. Der Status, den Sie
                setzen, erscheint sofort beim Handwerker.
              </p>
            </div>

            {zahlen && (
              <div className="flex flex-wrap gap-2.5">
                {[
                  { icon: Inbox, v: String(zahlen.neu), l: "Neu" },
                  { icon: MessagesSquare, v: String(zahlen.gespraech), l: "Im Gespräch" },
                  { icon: ThumbsUp, v: String(zahlen.zusagen), l: "Zusagen" },
                ].map((s2) => {
                  const Icon = s2.icon;
                  return (
                    <div
                      key={s2.l}
                      className="rounded-2xl px-4 py-3 min-w-[104px]"
                      style={{ background: "rgba(255,255,255,0.09)" }}
                    >
                      <Icon className="w-3.5 h-3.5 mb-1.5" style={{ color: "#E8A838" }} />
                      <p
                        className="text-[19px] font-bold tabular-nums text-white leading-none"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {s2.v}
                      </p>
                      <p className="text-[10.5px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {s2.l}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          className="rounded-2xl px-4 py-3.5 mb-5 text-[13.5px]"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#B91C1C" }}
        >
          {error}
        </div>
      )}

      {apps === null ? (
        // Skelettkarten statt Kringel: sie zeigen, wo die Bewerbungen
        // erscheinen werden, statt eine leere Flaeche zu hinterlassen.
        <div className="space-y-4">
          {(error ? [] : [0, 1]).map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl"
              style={{ height: 190, background: "#FBFAF7", border: "1.5px solid #EDEAE4" }}
            />
          ))}
        </div>
      ) : apps.length === 0 ? (
        // Derselbe wartende Stapel wie in Merkliste, Angeboten und
        // Kandidatensuche — nicht wieder ein Symbol im Kreis ueber zwei
        // Zeilen Text.
        <Wartezustand
          marke="Noch keine Bewerbung"
          titel="Hier landen Ihre Bewerber"
          text="Sobald sich jemand auf ein Inserat bewirbt, steht er hier — anonym, mit Match-Score."
          icon={<Inbox className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#B47B18" }} />}
        />
      ) : (
        <div className="space-y-8">
          {neue.length > 0 && (
            <section>
              <h2 className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: "#B47B18" }}>
                <span className="w-6 h-[2px]" style={{ background: "#E8A838" }} />
                Neu · {neue.length}
              </h2>
              <div className="space-y-4">
                {neue.map((a) => (
                  <ApplicationCard
                    key={a.id}
                    app={a}
                    onStatus={(s) => handleStatus(a.id, s)}
                    onRequestContact={() => handleContact(a)}
                  />
                ))}
              </div>
            </section>
          )}
          {rest.length > 0 && (
            <section>
              <h2 className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: "rgba(26,26,46,0.4)" }}>
                <span className="w-6 h-[2px]" style={{ background: "rgba(26,26,46,0.2)" }} />
                In Bearbeitung · {rest.length}
              </h2>
              <div className="space-y-4">
                {rest.map((a) => (
                  <ApplicationCard
                    key={a.id}
                    app={a}
                    onStatus={(s) => handleStatus(a.id, s)}
                    onRequestContact={() => handleContact(a)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
