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
import { gewerkBild } from "@/lib/gewerkBilder";
import { useAuth } from "@/app/context/AuthContext";

/**
 * Jeder Zustand hat eine Farbe — und die traegt die Karte selbst.
 *
 * Zuvor stand neben dem Namen eine farbige Marke ("NEU", "IM GESPRÄCH"), und
 * derselbe Zustand war unten nochmal am aktiven Knopf abzulesen. Doppelt
 * gesagt, und die Marke drueckte sich neben den Namen, wo sie die
 * Aufmerksamkeit weggenommen hat.
 *
 * `kante` ist die volle Farbe fuer den Streifen links, `schimmer` derselbe Ton
 * in wenigen Prozent fuer die Fussleiste — mehr braucht es nicht, damit ein
 * Stapel Karten auf einen Blick sortiert ist.
 */
const STATUS_META: Record<
  ApplicationStatus,
  { label: string; bg: string; color: string; kante: string; schimmer: string }
> = {
  gesendet: {
    label: "Neu", bg: "rgba(232,168,56,0.16)", color: "#8A5B0F",
    kante: "#E8A838", schimmer: "rgba(232,168,56,0.07)",
  },
  gesehen: {
    label: "Gesehen", bg: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.6)",
    kante: "rgba(26,26,46,0.22)", schimmer: "rgba(26,26,46,0.028)",
  },
  im_gespraech: {
    label: "Im Gespräch", bg: "rgba(59,130,246,0.12)", color: "#1D4ED8",
    kante: "#3B82F6", schimmer: "rgba(59,130,246,0.055)",
  },
  zusage: {
    label: "Zusage", bg: "rgba(22,163,74,0.14)", color: "#15803D",
    kante: "#16A34A", schimmer: "rgba(22,163,74,0.06)",
  },
  abgelehnt: {
    label: "Abgesagt", bg: "rgba(239,68,68,0.1)", color: "#B91C1C",
    kante: "rgba(192,57,43,0.55)", schimmer: "rgba(192,57,43,0.04)",
  },
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
  const bild = gewerkBild(c.bereich);
  // Zwei Elektriker teilen sich dasselbe Gewerkfoto — nebeneinander sahen die
  // Karten dann wieder gleich aus. Der Ausschnitt wandert deshalb je nach
  // Kuerzel: gleiche Aufnahme, anderer Bildausschnitt, unterscheidbare Karte.
  const versatz = 26 + (Array.from(c.handle).reduce((n, z) => n + z.charCodeAt(0), 0) % 4) * 16;

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
      className="group relative overflow-hidden rounded-3xl bg-white transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5"
      style={{
        border: "1px solid #EDEAE3",
        boxShadow: "0 14px 34px -26px rgba(26,26,46,0.5)",
        opacity: erledigt ? 0.88 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#DFD9CC";
        e.currentTarget.style.boxShadow = "0 20px 42px -24px rgba(26,26,46,0.45)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#EDEAE3";
        e.currentTarget.style.boxShadow = "0 14px 34px -26px rgba(26,26,46,0.5)";
      }}
    >
      {/* Der Zustand als Farbe der Karte, nicht als Marke neben dem Namen. */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px] z-10"
        style={{ background: meta.kante }}
      />

      <div className="flex flex-col sm:flex-row">
        {/* ── Merkanker ──
            Kandidaten sind anonym, es gibt kein Foto und keinen Namen. Statt
            dessen ein echtes Bild aus dem Gewerk mit dem Kuerzel darauf: eine
            Elektrowerkstatt sieht anders aus als eine Heizungsmontage, und
            genau daran erkennt man die Karte am naechsten Tag wieder.
            Vorher unterschieden sich fuenf Karten nur durch die Zahlen. */}
        <div className="relative w-full sm:w-[186px] h-36 sm:h-auto flex-shrink-0 overflow-hidden">
          <Image
            src={bild}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 186px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            style={{
              objectPosition: `center ${versatz}%`,
              filter: erledigt ? "grayscale(0.75)" : "none",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(158deg, rgba(20,20,36,0.5) 0%, rgba(20,20,36,0.88) 100%)",
            }}
          />
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <span
              className="inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[9.5px] max-lg:text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ background: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.88)" }}
            >
              <ShieldCheck className="w-3 h-3" />
              Anonym
            </span>
            <div>
              <p
                className="text-white font-bold text-[20px] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {c.handle.replace(/^.*?(#\S+)$/, "$1")}
              </p>
              <p className="text-[11.5px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                {c.bereich}
              </p>
            </div>
          </div>
        </div>

        {/* ── Hauptbereich ── */}
        <div className="flex-1 min-w-0 p-5 sm:p-6">
          <h2
            className="text-primary font-bold text-[19px] leading-snug"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {c.handle}
          </h2>
          <p className="text-[13px] mt-1 mb-5" style={{ color: "rgba(26,26,46,0.45)" }}>
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

          {c.aufgaben.length > 0 && !erledigt && (
            <p className="text-[12.5px] mt-4" style={{ color: "rgba(26,26,46,0.5)" }}>
              {c.aufgaben.slice(0, 4).join(" · ")}
            </p>
          )}

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

        {/* ── Passung und naechster Schritt ── */}
        <div
          className="flex flex-row lg:flex-col items-center lg:items-stretch justify-between lg:justify-start gap-5 lg:gap-6 px-5 pb-5 lg:p-6 lg:w-[212px] flex-shrink-0"
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
              <span
                aria-hidden
                className="block rounded-full mt-2.5 mb-2"
                style={{ height: 3, background: "rgba(26,26,46,0.08)" }}
              >
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${c.matchScore}%`,
                    background: erledigt ? "rgba(26,26,46,0.2)" : meta.kante,
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
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void act(onRequestContact, "contact")}
                  className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-2.5 text-[12.5px] font-bold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
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

      {/* ── Fussleiste ──
          Traegt den Farbton des Zustands in wenigen Prozent. Damit ist der
          Status zweimal sichtbar — Kante und Flaeche — und braucht keine
          Marke mehr neben dem Namen. */}
      <div
        className="flex flex-wrap items-center gap-2 px-5 py-3 sm:px-6"
        style={{ background: meta.schimmer, borderTop: "1px solid #F2EFE9" }}
      >
        {ACTIONS.map((a) => {
          const active = app.status === a.status;
          return (
            <button
              key={a.status}
              type="button"
              disabled={busy !== null || active}
              onClick={() => void act(() => onStatus(a.status), a.status)}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors disabled:cursor-default"
              style={{
                background: active ? "white" : "transparent",
                color: active ? STATUS_META[a.status].color : "rgba(26,26,46,0.5)",
                border: `1px solid ${active ? STATUS_META[a.status].kante : "transparent"}`,
                opacity: busy !== null && !active ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (active || busy !== null) return;
                e.currentTarget.style.background = "rgba(255,255,255,0.75)";
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
        {neu && (
          <span
            className="ml-auto text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "#B47B18" }}
          >
            Noch nicht bearbeitet
          </span>
        )}
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
                className="inline-flex items-center gap-2 text-[10px] max-lg:text-[11px] font-semibold uppercase tracking-[0.22em] mb-3"
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
                      <p className="text-[10.5px] max-lg:text-[11.5px] mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
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
          mitBild
          marke="Noch keine Bewerbung"
          titel="Hier landen Ihre Bewerber"
          text="Sobald sich jemand auf eines Ihrer Inserate bewirbt, steht er hier — anonym, mit Match-Score."
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
