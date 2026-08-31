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
  Loader2, Inbox, Clock3, ShieldCheck, Check,
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

/**
 * Die drei Angaben, an denen ein Chef entscheidet — als Datenzeile.
 *
 * Vorher stand jede in einer eigenen Kachel: Zeichen im goldgetoenten
 * Quadrat, Wert daneben, Bezeichnung darunter. Dreimal dasselbe Muster je
 * Karte, fuenfzehnmal auf der Seite — die Standardform, an der man jede
 * generierte Oberflaeche erkennt, und dazu fuenfzehn goldene Flaechen.
 *
 * Jetzt rein typografisch: Werte in einer Zeile, durch Haarlinien getrennt,
 * die Bezeichnung klein darunter. Das liest sich wie ein Datenblatt statt
 * wie eine Kachelwand und kommt ohne einen einzigen Farbfleck aus.
 */
function Datenzeile({
  eintraege,
}: {
  eintraege: { wert: string; label: string }[];
}) {
  // Gleich breite Spalten ueber die volle Zeile statt links zusammengedraengt:
  // sonst stand rechts daneben eine halbe Karte leer.
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3">
      {eintraege.map((e, i) => (
        <div
          key={e.label}
          className={`min-w-0 ${i > 0 ? "sm:pl-6" : ""}`}
          style={i > 0 ? { borderLeft: "1px solid #EBE7DE" } : undefined}
        >
          <p
            className="text-[16px] font-bold text-primary leading-tight truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {e.wert}
          </p>
          <p className="text-[11.5px] mt-1" style={{ color: "rgba(26,26,46,0.42)" }}>
            {e.label}
          </p>
        </div>
      ))}
    </div>
  );
}

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
  const neu = app.status === "gesendet";
  const erledigt = app.status === "abgelehnt";

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
      className="group relative overflow-hidden rounded-3xl transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5"
      style={{
        // Fast weiss statt goldstichigem Verlauf. Gold traegt jetzt nur noch
        // die Kante links und die eine Aktion, die zaehlt — vorher lag es auf
        // Flaeche, Oberkante, Zeichen, Score und Knopf gleichzeitig.
        background: erledigt ? "#FBFAF8" : "#FFFFFF",
        border: `1px solid ${neu ? "#E7DCC4" : "#EDEAE3"}`,
        boxShadow: "0 12px 30px -26px rgba(26,26,46,0.5)",
        opacity: erledigt ? 0.85 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#DDD6C6";
        e.currentTarget.style.boxShadow = "0 18px 38px -24px rgba(26,26,46,0.45)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = neu ? "#E7DCC4" : "#EDEAE3";
        e.currentTarget.style.boxShadow = "0 12px 30px -26px rgba(26,26,46,0.5)";
      }}
    >
      {/* Senkrechte Kante links wie eine Aktenmarkierung — nur bei neuen
          Bewerbungen. Eine leuchtende Oberkante an jeder Karte hatte den
          gegenteiligen Effekt: wenn alles hervorgehoben ist, sticht nichts
          mehr heraus. */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: neu ? "#E8A838" : "transparent" }}
      />

      <div className="flex flex-col lg:flex-row">
        {/* ── Hauptbereich ── */}
        <div className="flex-1 min-w-0 p-5 sm:p-6 sm:pl-7">
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <h2
              className="text-primary font-bold text-[19px] leading-snug"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {c.handle}
            </h2>
            <span
              className="rounded-full px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.13em]"
              style={{ background: meta.bg, color: meta.color }}
            >
              {meta.label}
            </span>
          </div>

          {/* Ohne Zeichen: Aktenkoffer und Uhr sagten nichts, was der Text
              nicht schon sagt, und trugen zur Zeichenflut bei. */}
          <p className="text-[13px] mb-5" style={{ color: "rgba(26,26,46,0.45)" }}>
            auf „{app.jobPosting.title}“
            <span className="mx-2" style={{ color: "rgba(26,26,46,0.2)" }}>·</span>
            {app.createdAt}
          </p>

          <Datenzeile
            eintraege={[
              { wert: c.erfahrung ?? "—", label: "Erfahrung" },
              { wert: c.ausbildung ?? "—", label: "Ausbildungsstand" },
              { wert: c.distanceKm != null ? `${c.distanceKm} km` : "—", label: "Anfahrt" },
            ]}
          />

          {/* Aufgabenfelder als Fliesstext statt als Reihe grauer Pillen —
              sie sind Beiwerk und sollen nicht wie Knoepfe aussehen. */}
          {c.aufgaben.length > 0 && !erledigt && (
            <p className="text-[12.5px] mt-4" style={{ color: "rgba(26,26,46,0.5)" }}>
              {c.aufgaben.slice(0, 4).join(" · ")}
            </p>
          )}

          {/* Freigegebene Kontaktdaten: der Moment, auf den alles hinauslaeuft. */}
          {c.freigegeben && (
            <div
              className="flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-2xl px-4 py-3.5 mt-5"
              style={{ background: "rgba(22,163,74,0.07)", border: "1px solid rgba(22,163,74,0.22)" }}
            >
              <span
                className="inline-flex items-center gap-2 text-[15px] font-bold"
                style={{ color: "#15803D", fontFamily: "var(--font-display)" }}
              >
                <Check className="w-4 h-4" strokeWidth={3} />
                {c.freigegeben.name}
              </span>
              <a
                href={`tel:${c.freigegeben.telefon.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 text-[13.5px]"
                style={{ color: "rgba(26,26,46,0.7)" }}
              >
                <Phone className="w-3.5 h-3.5" style={{ color: "#15803D" }} />
                {c.freigegeben.telefon || "—"}
              </a>
              <a
                href={`mailto:${c.freigegeben.email}`}
                className="inline-flex items-center gap-1.5 text-[13.5px]"
                style={{ color: "rgba(26,26,46,0.7)" }}
              >
                <Mail className="w-3.5 h-3.5" style={{ color: "#15803D" }} />
                {c.freigegeben.email}
              </a>
            </div>
          )}
        </div>

        {/* ── Rechte Spalte: Passung und naechster Schritt ── */}
        <div
          className="flex flex-row lg:flex-col items-center lg:items-stretch justify-between lg:justify-start gap-5 lg:gap-6 px-5 pb-5 lg:p-6 lg:w-[220px] flex-shrink-0"
          style={{ borderLeft: "1px solid #F2EFE9" }}
        >
          {c.matchScore > 0 && (
            <div>
              <p
                className="flex items-baseline gap-1 leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span
                  className="text-[38px] font-bold tabular-nums"
                  style={{ color: erledigt ? "rgba(26,26,46,0.35)" : "#1A1A2E" }}
                >
                  {c.matchScore}
                </span>
                <span className="text-[17px] font-bold" style={{ color: "rgba(26,26,46,0.3)" }}>
                  %
                </span>
              </p>
              {/* Ein Strich statt eines Sterns: er zeigt den Wert im
                  Verhaeltnis zu 100 und ist die einzige Farbe im Block. */}
              <span
                aria-hidden
                className="block rounded-full mt-2.5 mb-2"
                style={{ height: 3, background: "rgba(26,26,46,0.08)" }}
              >
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${c.matchScore}%`,
                    background: erledigt ? "rgba(26,26,46,0.2)" : "#E8A838",
                  }}
                />
              </span>
              <p
                className="inline-flex items-center gap-1 text-[11.5px]"
                style={{ color: "rgba(26,26,46,0.42)" }}
              >
                Übereinstimmung
                <ScoreExplainer breakdown={c.matchBreakdown} subject={c.handle} />
              </p>
            </div>
          )}

          <div className="flex-shrink-0">
            {c.freigegeben ? (
              <p
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
                style={{ color: "#15803D" }}
              >
                <ShieldCheck className="w-4 h-4" />
                Kontakt freigegeben
              </p>
            ) : c.status === "angefragt" ? (
              <p
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
                style={{ color: "#8A5B0F" }}
              >
                <Clock3 className="w-3.5 h-3.5" />
                Anfrage läuft
              </p>
            ) : c.status === "verfuegbar" ? (
              <>
                {/* Dunkel statt golden — wie "Bearbeiten" bei den Inseraten.
                    Fuenf goldene Knoepfe untereinander waren der Hauptgrund
                    fuer den Eindruck, dass alles leuchtet. */}
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void act(onRequestContact, "contact")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: "#1A1A2E", color: "white" }}
                >
                  {busy === "contact" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  Kontakt anfragen
                </button>
                <p
                  className="text-[11px] mt-2 leading-snug"
                  style={{ color: "rgba(26,26,46,0.38)" }}
                >
                  Name und Nummer erst, wenn er zustimmt.
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Fussleiste: Status setzen ── */}
      <div
        className="flex flex-wrap items-center gap-2 px-5 py-3 sm:px-7"
        style={{ borderTop: "1px solid #F2EFE9" }}
      >
        <span
          className="text-[10.5px] font-bold uppercase tracking-[0.14em] mr-1"
          style={{ color: "rgba(26,26,46,0.3)" }}
        >
          Status
        </span>
        {ACTIONS.map((a) => {
          const active = app.status === a.status;
          return (
            <button
              key={a.status}
              type="button"
              disabled={busy !== null || active}
              onClick={() => void act(() => onStatus(a.status), a.status)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors disabled:cursor-default"
              style={{
                background: active ? STATUS_META[a.status].bg : "transparent",
                color: active ? STATUS_META[a.status].color : "rgba(26,26,46,0.5)",
                border: "1px solid transparent",
                opacity: busy !== null && !active ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (active || busy !== null) return;
                e.currentTarget.style.background = "rgba(26,26,46,0.04)";
              }}
              onMouseLeave={(e) => {
                if (active) return;
                e.currentTarget.style.background = "transparent";
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
              "linear-gradient(96deg, rgba(20,20,36,0.96) 0%, rgba(20,20,36,0.9) 44%, rgba(20,20,36,0.72) 100%)",
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
                      style={{
                        background: "rgba(20,20,36,0.55)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        backdropFilter: "blur(3px)",
                      }}
                    >
                      <Icon className="w-3.5 h-3.5 mb-1.5" style={{ color: "#E8A838" }} />
                      <p
                        className="text-[19px] font-bold tabular-nums text-white leading-none"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {s2.v}
                      </p>
                      <p className="text-[10.5px] mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
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
