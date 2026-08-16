"use client";

// ─── Bewerbungen (Arbeitgeber) ───────────────────────────────────────────────
// Alle Bewerbungen auf die eigenen Inserate. Der Betrieb sieht das anonyme
// Kandidatenprofil samt Match-Score gegen das jeweilige Inserat und setzt den
// Status — der Handwerker sieht die Änderung sofort in seinem Dashboard.
// Kontaktdaten erscheinen NUR, wenn der Kandidat eine Kontaktanfrage
// freigegeben hat (Diskretionsversprechen).

import { useEffect, useState } from "react";
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

const STATUS_META: Record<
  ApplicationStatus,
  { label: string; bg: string; color: string }
> = {
  gesendet: { label: "Neu", bg: "rgba(249, 173, 7,0.16)", color: "#6E4A03" },
  gesehen: { label: "Gesehen", bg: "rgba(12, 51, 48,0.06)", color: "rgba(12, 51, 48,0.6)" },
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
      style={{ border: "1.5px solid #E4DFD3", boxShadow: "0 10px 30px -24px rgba(12, 51, 48,0.5)" }}
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
          <p className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]" style={{ color: "rgba(12, 51, 48,0.55)" }}>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" style={{ color: "#F9AD07" }} />
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
              background: c.matchScore >= 80 ? "rgba(249, 173, 7,0.2)" : "rgba(12, 51, 48,0.05)",
              color: c.matchScore >= 80 ? "#6E4A03" : "rgba(12, 51, 48,0.6)",
              fontFamily: "var(--font-display)",
            }}
          >
            {c.matchScore} %
            <ScoreExplainer breakdown={c.matchBreakdown} subject={c.handle} />
          </span>
        )}
      </div>

      {/* Kandidaten-Fakten */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[13px]" style={{ color: "rgba(12, 51, 48,0.65)" }}>
        <span className="inline-flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" style={{ color: "#F9AD07" }} />
          {c.erfahrung ? `${c.erfahrung} Erfahrung` : "Erfahrung —"}
        </span>
        {c.distanceKm != null && (
          <span className="inline-flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5" style={{ color: "#F9AD07" }} />
            {c.distanceKm} km entfernt
          </span>
        )}
        {c.ausbildung && (
          <span className="inline-flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" style={{ color: "#F9AD07" }} />
            {c.ausbildung}
          </span>
        )}
        {c.aufgaben.slice(0, 2).map((a) => (
          <span key={a} className="inline-flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" style={{ color: "#F9AD07" }} />
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
          <span className="inline-flex items-center gap-1.5" style={{ color: "rgba(12, 51, 48,0.7)" }}>
            <Phone className="w-3.5 h-3.5" />
            {c.freigegeben.telefon || "—"}
          </span>
          <span className="inline-flex items-center gap-1.5" style={{ color: "rgba(12, 51, 48,0.7)" }}>
            <Mail className="w-3.5 h-3.5" />
            {c.freigegeben.email}
          </span>
        </div>
      ) : (
        <p
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 mt-4 text-[12.5px]"
          style={{ background: "rgba(12, 51, 48,0.035)", color: "rgba(12, 51, 48,0.55)" }}
        >
          <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: "#F9AD07" }} />
          Kontaktdaten erscheinen, sobald der Kandidat Ihre Kontaktanfrage annimmt.
          {c.status === "verfuegbar" && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void act(onRequestContact, "contact")}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold disabled:opacity-50"
              style={{ background: "#F9AD07", color: "#0C3330" }}
            >
              {busy === "contact" && <Loader2 className="w-3 h-3 animate-spin" />}
              Kontakt anfragen
            </button>
          )}
          {c.status === "angefragt" && (
            <span className="font-semibold" style={{ color: "#6E4A03" }}>
              Anfrage läuft — Kandidat entscheidet.
            </span>
          )}
        </p>
      )}

      {/* Status setzen */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4" style={{ borderTop: "1px solid #EDE8DE" }}>
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] mr-1" style={{ color: "rgba(12, 51, 48,0.4)" }}>
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
                color: active ? STATUS_META[a.status].color : "rgba(12, 51, 48,0.6)",
                border: `1.5px solid ${active ? "transparent" : "#D9D3C6"}`,
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

  return (
    <div>
      <h1
        className="text-primary font-bold mb-1"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)" }}
      >
        Bewerbungen
      </h1>
      <p className="text-[15px] mb-7" style={{ color: "rgba(12, 51, 48,0.55)" }}>
        Wer sich auf Ihre Inserate beworben hat — der Status, den Sie setzen,
        erscheint sofort beim Kandidaten.
      </p>

      {error && (
        <div
          className="rounded-2xl px-4 py-3.5 mb-5 text-[13.5px]"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#B91C1C" }}
        >
          {error}
        </div>
      )}

      {apps === null ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#F9AD07" }} />
        </div>
      ) : apps.length === 0 ? (
        <div className="rounded-3xl bg-white px-6 py-20 text-center" style={{ border: "1.5px solid #E4DFD3" }}>
          <Inbox className="w-8 h-8 mx-auto mb-4" style={{ color: "#F9AD07" }} />
          <p className="text-[18px] font-bold text-primary mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
            Noch keine Bewerbungen
          </p>
          <p className="text-[14px] max-w-md mx-auto leading-relaxed" style={{ color: "rgba(12, 51, 48,0.5)" }}>
            Sobald sich Handwerker auf Ihre Inserate bewerben, erscheinen sie
            hier — anonymisiert, mit Match-Score und Statusverwaltung.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {neue.length > 0 && (
            <section>
              <h2 className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: "#8A5F04" }}>
                <span className="w-6 h-[2px]" style={{ background: "#F9AD07" }} />
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
              <h2 className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: "rgba(12, 51, 48,0.4)" }}>
                <span className="w-6 h-[2px]" style={{ background: "rgba(12, 51, 48,0.2)" }} />
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
