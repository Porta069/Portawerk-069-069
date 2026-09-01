"use client";

// ─── Gestellte Kontaktanfragen (Arbeitgeber) ─────────────────────────────────
// Solange eine Anfrage offen ist, bleibt der Kandidat anonym — die Karte zeigt
// das unveraendert an.
//
// ── Zur Gestaltung ──────────────────────────────────────────────────────────
// Diese Seite hat eine andere Aufgabe als die Bewerbungen nebenan, und sie
// soll auch anders aussehen. Bei den Bewerbungen liegt der Ball beim Betrieb:
// er sichtet, sortiert, entscheidet. Hier liegt er beim Handwerker — der
// Betrieb hat gefragt und wartet.
//
// Deshalb steht die Liste an einer senkrechten Leiste: jede Anfrage ist ein
// Vorgang mit einem Punkt darauf, und die Farbe des Punktes sagt, wie weit er
// ist. Und deshalb sind die Karten kompakter als bei den Bewerbungen — den
// Kandidaten hat man in der Suche schon gesehen, hier zaehlt nur: wen habe
// ich gefragt, wofuer, wie lange ist das her, hat er geantwortet.
//
// Zuvor stand hier dreimal die volle Kandidatenkarte unter einem farbigen
// Gruppenbalken, also dieselbe schwere Zeile wie in der Suche und in den
// Bewerbungen. Drei Seiten, ein Aussehen.

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Clock3, Check, X, ArrowRight, Inbox, ShieldCheck, Phone, Mail,
  ChevronRight,
} from "lucide-react";
import { listRequests } from "@/lib/employerService";
import type { ContactRequest } from "@/lib/types";
import { ProfileDialog } from "@/app/components/employer/CandidateCard";
import Wartezustand from "@/app/components/dashboard/Wartezustand";
import { gewerkBild } from "@/lib/gewerkBilder";
import { useAuth } from "@/app/context/AuthContext";

const GROUPS: {
  status: ContactRequest["status"];
  label: string;
  note: string;
  color: string;
  bg: string;
  icon: typeof Check;
}[] = [
  {
    status: "freigegeben",
    label: "Profil freigegeben",
    note: "Der Kandidat hat zugestimmt — Sie dürfen Kontakt aufnehmen.",
    color: "#15803D",
    bg: "rgba(22,163,74,0.12)",
    icon: Check,
  },
  {
    status: "angefragt",
    label: "Anfrage läuft",
    note: "Der Kandidat entscheidet noch. Bis dahin bleibt das Profil anonym.",
    color: "#B47B18",
    bg: "rgba(232,168,56,0.16)",
    icon: Clock3,
  },
  {
    status: "abgelehnt",
    label: "Abgelehnt",
    note: "Diesmal kein Interesse — der Grund wird uns anonym übermittelt.",
    color: "rgba(26,26,46,0.5)",
    bg: "rgba(26,26,46,0.06)",
    icon: X,
  },
];

/**
 * Eine gestellte Anfrage.
 *
 * Bewusst schlanker als die Kandidatenkarte: Bild als schmaler Streifen, drei
 * Angaben in einer Zeile, der Score als Zahl ohne Auszeichnung. Wer mehr
 * wissen will, oeffnet mit einem Klick dasselbe Profil wie in der Suche.
 */
function AnfrageKarte({
  anfrage,
  farbe,
}: {
  anfrage: ContactRequest;
  farbe: string;
}) {
  const [profil, setProfil] = useState(false);
  const c = anfrage.candidate;
  const offen = anfrage.status === "angefragt";
  const abgelehnt = anfrage.status === "abgelehnt";
  // Gleiche Aufnahme fuer ein Gewerk — der Ausschnitt wandert mit dem Kuerzel,
  // damit zwei Anfragen im selben Gewerk unterscheidbar bleiben.
  const versatz = 26 + (Array.from(c.handle).reduce((n, z) => n + z.charCodeAt(0), 0) % 4) * 16;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setProfil(true)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5"
        style={{
          border: "1px solid #EDEAE3",
          boxShadow: "0 12px 28px -24px rgba(26,26,46,0.5)",
          opacity: abgelehnt ? 0.8 : 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#DFD9CC";
          e.currentTarget.style.boxShadow = "0 18px 36px -22px rgba(26,26,46,0.45)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#EDEAE3";
          e.currentTarget.style.boxShadow = "0 12px 28px -24px rgba(26,26,46,0.5)";
        }}
      >
        <div className="flex">
          {/* Schmaler Bildstreifen — genug, um das Gewerk zu erkennen, zu
              wenig, um die Zeile schwer zu machen. */}
          <div className="relative w-[96px] sm:w-[132px] flex-shrink-0 overflow-hidden">
            <Image
              src={gewerkBild(c.bereich)}
              alt=""
              fill
              sizes="132px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              style={{
                objectPosition: `center ${versatz}%`,
                filter: abgelehnt ? "grayscale(0.8)" : "none",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "linear-gradient(160deg, rgba(20,20,36,0.42) 0%, rgba(20,20,36,0.82) 100%)" }}
            />
            <span
              className="absolute left-3 bottom-3 text-white font-bold text-[15px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {c.handle.replace(/^.*?(#\S+)$/, "$1")}
            </span>
          </div>

          <div className="flex-1 min-w-0 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
              <div className="min-w-0">
                <h3
                  className="text-primary font-bold text-[17px] leading-snug"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {c.handle}
                </h3>
                <p className="text-[12.5px] mt-0.5" style={{ color: "rgba(26,26,46,0.45)" }}>
                  {c.bereich}
                  {c.region && ` · ${c.region}`}
                  {c.distanceKm != null && ` · ${c.distanceKm} km`}
                </p>
              </div>
              {c.matchScore > 0 && (
                <p
                  className="flex items-baseline gap-0.5 flex-shrink-0"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <span
                    className="text-[22px] font-bold tabular-nums leading-none"
                    style={{ color: abgelehnt ? "rgba(26,26,46,0.35)" : "#1A1A2E" }}
                  >
                    {c.matchScore}
                  </span>
                  <span className="text-[12px] font-bold" style={{ color: "rgba(26,26,46,0.3)" }}>
                    %
                  </span>
                </p>
              )}
            </div>

            {/* Bei Freigabe stehen die Kontaktdaten in der Zeile — dafuer hat
                man die Anfrage gestellt. */}
            {c.freigegeben ? (
              <div
                className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3.5 pt-3.5"
                style={{ borderTop: "1px solid #F2EFE9" }}
              >
                <span
                  className="inline-flex items-center gap-1.5 text-[14px] font-bold"
                  style={{ color: "#15803D", fontFamily: "var(--font-display)" }}
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  {c.freigegeben.name}
                </span>
                <a
                  href={`tel:${c.freigegeben.telefon.replace(/\s/g, "")}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-[13px]"
                  style={{ color: "rgba(26,26,46,0.65)" }}
                >
                  <Phone className="w-3.5 h-3.5" style={{ color: "#15803D" }} />
                  {c.freigegeben.telefon || "—"}
                </a>
                <a
                  href={`mailto:${c.freigegeben.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-[13px]"
                  style={{ color: "rgba(26,26,46,0.65)" }}
                >
                  <Mail className="w-3.5 h-3.5" style={{ color: "#15803D" }} />
                  {c.freigegeben.email}
                </a>
              </div>
            ) : (
              <p
                className="inline-flex items-center gap-1.5 text-[12.5px] mt-3"
                style={{ color: offen ? "#8A5B0F" : "rgba(26,26,46,0.45)" }}
              >
                {offen ? <ShieldCheck className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                {offen ? "Profil bleibt anonym, bis er zustimmt" : "Hat abgelehnt"}
                <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </p>
            )}
          </div>
        </div>

        {/* Feiner Farbstreifen am unteren Rand statt einer weiteren Marke. */}
        <span
          aria-hidden
          className="absolute left-0 right-0 bottom-0 h-[2px]"
          style={{ background: farbe, opacity: abgelehnt ? 0.35 : 0.75 }}
        />
      </motion.article>

      <AnimatePresence>
        {profil && <ProfileDialog candidate={c} onClose={() => setProfil(false)} />}
      </AnimatePresence>
    </>
  );
}

export default function EmployerRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listRequests().then((res) => {
      if (res.ok) setRequests(res.data);
      setLoading(false);
    });
  }, []);

  const grouped = GROUPS.map((g) => ({
    ...g,
    items: requests.filter((r) => r.status === g.status),
  })).filter((g) => g.items.length > 0);

  // Antwortquote: die eine Zahl, die diese Seite beantwortet — wie viele der
  // Angefragten haben sich ueberhaupt entschieden? Keine andere Seite im
  // Bereich zeigt so etwas, und hier ist es das Thema.
  const beantwortet = requests.filter((r) => r.status !== "angefragt").length;
  const quote = requests.length ? Math.round((beantwortet / requests.length) * 100) : 0;

  return (
    <div>
      {/* ══ Kopf ══
          Dunkel und randlos wie im ganzen Bereich, aber ohne Foto: die
          Bewerbungen nebenan tragen eins, und zwei Fotobaender hintereinander
          waeren derselbe Auftritt zweimal. */}
      <div className="vollbreite relative overflow-hidden -mt-10 mb-8" style={{ background: "#1A1A2E" }}>
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 34px)," +
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 34px)",
          }}
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-20 w-[460px] h-[460px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232,168,56,0.16) 0%, transparent 68%)" }}
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
                Meine Anfragen
              </h1>
              <p className="text-[15px] mt-2 max-w-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
                Handwerker, bei denen Sie Interesse angemeldet haben. Die
                Entscheidung liegt bei ihnen — hier sehen Sie, wie weit sie ist.
              </p>
            </div>

            {requests.length > 0 && (
              <div className="min-w-[236px] rounded-2xl px-5 py-4" style={{ background: "rgba(255,255,255,0.07)" }}>
                <p className="text-[10.5px] uppercase tracking-[0.16em] mb-2.5" style={{ color: "rgba(255,255,255,0.42)" }}>
                  Antwortquote
                </p>
                <p className="flex items-baseline gap-1.5" style={{ fontFamily: "var(--font-display)" }}>
                  <span className="text-[30px] font-bold tabular-nums text-white leading-none">{quote}</span>
                  <span className="text-[15px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>%</span>
                </p>
                <span
                  aria-hidden
                  className="block rounded-full mt-3 mb-2"
                  style={{ height: 4, background: "rgba(255,255,255,0.12)" }}
                >
                  <span
                    className="block h-full rounded-full transition-[width] duration-700"
                    style={{ width: `${quote}%`, background: "#E8A838" }}
                  />
                </span>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {beantwortet} von {requests.length} haben entschieden
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl ml-8"
              style={{ height: 132, background: "#FBFAF7", border: "1px solid #EDEAE4" }}
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Wartezustand
          mitBild
          marke="Noch keine Anfrage"
          titel="Hier stehen Ihre Anfragen"
          text="Sobald Sie bei einem Handwerker Interesse anmelden, sehen Sie hier, wie er entschieden hat."
          icon={<Inbox className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#B47B18" }} />}
          aktion={
            <Link
              href="/unternehmen/dashboard"
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[14.5px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                background: "#E8A838",
                color: "#1A1A2E",
                fontFamily: "var(--font-display)",
                boxShadow: "0 16px 32px -16px rgba(232,168,56,0.85)",
              }}
            >
              <Send className="w-4 h-4" />
              Kandidaten suchen
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {grouped.map((g) => {
            const Icon = g.icon;
            return (
              <section key={g.status}>
                {/* Leise Zeile statt farbigem Balken: der Zustand steht am
                    Punkt jeder Anfrage, hier genuegt die Ueberschrift. */}
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4">
                  <h2
                    className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: g.color }}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={2.6} />
                    {g.label} · {g.items.length}
                  </h2>
                  <span className="text-[12.5px]" style={{ color: "rgba(26,26,46,0.42)" }}>
                    {g.note}
                  </span>
                </div>

                {/* ── Verlaufsleiste ──
                    Jede Anfrage haengt als Punkt an einer senkrechten Linie.
                    Das ist die Form, die zum Inhalt passt: ein Vorgang, der
                    laeuft und irgendwann eine Antwort bekommt. */}
                <div className="relative pl-7 sm:pl-9">
                  <span
                    aria-hidden
                    className="absolute top-3 bottom-3 w-[2px]"
                    style={{
                      left: 7,
                      background:
                        "linear-gradient(180deg, #E6E1D6 0%, #E6E1D6 82%, rgba(230,225,214,0) 100%)",
                    }}
                  />
                  <div className="space-y-4">
                    {g.items.map((r) => (
                      <div key={r.id} className="relative">
                        <span
                          aria-hidden
                          className="absolute rounded-full"
                          style={{
                            left: -30,
                            top: 26,
                            width: 14,
                            height: 14,
                            background: g.color,
                            border: "3px solid #F8F7F4",
                            boxShadow: `0 0 0 1px ${g.color}33`,
                          }}
                        />
                        <p
                          className="text-[12px] mb-2"
                          style={{ color: "rgba(26,26,46,0.42)" }}
                        >
                          <strong className="font-semibold" style={{ color: "rgba(26,26,46,0.6)" }}>
                            {r.sentAt}
                          </strong>{" "}
                          angefragt für „{r.position}“
                        </p>
                        <AnfrageKarte anfrage={r} farbe={g.color} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
