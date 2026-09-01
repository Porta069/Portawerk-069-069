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
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Clock3, Check, X, ArrowRight, Inbox, Phone, Mail, ChevronRight,
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
  /** Sehr blasser Ton derselben Farbe — traegt den Verlauf der Karte. */
  hauch: string;
  icon: typeof Check;
}[] = [
  {
    status: "freigegeben",
    label: "Profil freigegeben",
    note: "Sie dürfen Kontakt aufnehmen",
    color: "#15803D",
    bg: "rgba(22,163,74,0.12)",
    hauch: "rgba(22,163,74,0.09)",
    icon: Check,
  },
  {
    status: "angefragt",
    label: "Anfrage läuft",
    note: "Kandidat entscheidet noch",
    color: "#B47B18",
    bg: "rgba(232,168,56,0.16)",
    hauch: "rgba(232,168,56,0.13)",
    icon: Clock3,
  },
  {
    status: "abgelehnt",
    label: "Abgelehnt",
    note: "Kandidat hat kein Interesse",
    color: "rgba(26,26,46,0.5)",
    bg: "rgba(26,26,46,0.06)",
    hauch: "rgba(26,26,46,0.05)",
    icon: X,
  },
];

/**
 * Zahl, die von 0 hochlaeuft.
 *
 * Die Antwortquote ist der Kennwert dieser Seite. Als fertige Zahl war sie
 * eine Angabe unter vielen; waehrend sie hochlaeuft, schaut man hin.
 */
function Hochzaehler({ wert }: { wert: number }) {
  const [zahl, setZahl] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setZahl(wert);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const dauer = 900;
    const schritt = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / dauer, 1);
      // Weich auslaufend, damit die Zahl nicht abrupt stehenbleibt.
      setZahl(Math.round(wert * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(schritt);
    };
    raf = requestAnimationFrame(schritt);
    return () => cancelAnimationFrame(raf);
  }, [wert]);

  return <>{zahl}</>;
}

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
  hauch,
  verzug,
}: {
  anfrage: ContactRequest;
  farbe: string;
  hauch: string;
  /** Gestaffeltes Erscheinen — die Liste baut sich von oben auf. */
  verzug: number;
}) {
  const [profil, setProfil] = useState(false);
  const c = anfrage.candidate;
  const abgelehnt = anfrage.status === "abgelehnt";
  // Gleiche Aufnahme fuer ein Gewerk — der Ausschnitt wandert mit dem Kuerzel,
  // damit zwei Anfragen im selben Gewerk unterscheidbar bleiben.
  const versatz = 26 + (Array.from(c.handle).reduce((n, z) => n + z.charCodeAt(0), 0) % 4) * 16;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, x: -14 }}
        animate={{ opacity: abgelehnt ? 0.85 : 1, x: 0 }}
        transition={{ duration: 0.5, delay: verzug, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setProfil(true)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1"
        style={{
          // Der Zustand faerbt die Flaeche: voller Ton am Bild, nach rechts
          // ins Weisse. Vorher war die Karte reinweiss und der Zustand nur
          // ein 2-px-Strich unten — richtig, aber leblos.
          background: `linear-gradient(100deg, ${hauch} 0%, rgba(255,255,255,0.65) 38%, #FFFFFF 72%)`,
          border: "1px solid #EDEAE3",
          boxShadow: "0 12px 28px -24px rgba(26,26,46,0.5)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#DFD9CC";
          e.currentTarget.style.boxShadow = `0 22px 42px -22px ${farbe}55`;
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
              className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-80"
              style={{
                background:
                  `linear-gradient(160deg, rgba(20,20,36,0.34) 0%, rgba(20,20,36,0.86) 100%), ` +
                  `linear-gradient(200deg, ${farbe}44 0%, transparent 62%)`,
              }}
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
                  className="text-primary font-bold text-[20px] leading-snug"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {c.handle}
                </h3>
                {/* Eine Zeile statt dreier: Stelle, Entfernung, Zeitpunkt.
                    Der Bereich stand vorher nochmal daneben, obwohl er schon
                    im Bild und im Kuerzel steht. */}
                <p className="text-[14px] mt-1" style={{ color: "rgba(26,26,46,0.5)" }}>
                  für „{anfrage.position}“
                  {c.region && ` · ${c.region}`}
                  <span className="mx-1.5" style={{ color: "rgba(26,26,46,0.22)" }}>·</span>
                  {anfrage.sentAt}
                </p>
              </div>
              {c.matchScore > 0 && (
                <p
                  className="flex items-baseline gap-0.5 flex-shrink-0"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <span
                    className="text-[26px] font-bold tabular-nums leading-none"
                    style={{ color: abgelehnt ? "rgba(26,26,46,0.35)" : "#1A1A2E" }}
                  >
                    {c.matchScore}
                  </span>
                  <span className="text-[14px] font-bold" style={{ color: "rgba(26,26,46,0.3)" }}>
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
                  className="inline-flex items-center gap-1.5 text-[16px] font-bold"
                  style={{ color: "#15803D", fontFamily: "var(--font-display)" }}
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  {c.freigegeben.name}
                </span>
                <a
                  href={`tel:${c.freigegeben.telefon.replace(/\s/g, "")}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-[14.5px]"
                  style={{ color: "rgba(26,26,46,0.7)" }}
                >
                  <Phone className="w-4 h-4" style={{ color: "#15803D" }} />
                  {c.freigegeben.telefon || "—"}
                </a>
                <a
                  href={`mailto:${c.freigegeben.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-[14.5px]"
                  style={{ color: "rgba(26,26,46,0.7)" }}
                >
                  <Mail className="w-4 h-4" style={{ color: "#15803D" }} />
                  {c.freigegeben.email}
                </a>
              </div>
            ) : (
              <p
                className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold mt-3"
                style={{ color: "rgba(26,26,46,0.45)" }}
              >
                Profil ansehen
                <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </p>
            )}
          </div>
        </div>

        {/* Feiner Farbstreifen am unteren Rand statt einer weiteren Marke. */}
        <span
          aria-hidden
          className="absolute left-0 bottom-0 h-[2px] transition-[width,opacity] duration-500 ease-out group-hover:w-full"
          style={{
            width: "42%",
            background: `linear-gradient(90deg, ${farbe} 0%, ${farbe}00 100%)`,
            opacity: abgelehnt ? 0.4 : 0.9,
          }}
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
        <Image
          src="/images/maurer-ziegel.jpg"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
          style={{ objectPosition: "center 52%" }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(96deg, rgba(20,20,36,0.96) 0%, rgba(20,20,36,0.9) 44%, rgba(20,20,36,0.7) 100%)",
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
                Meine Anfragen
              </h1>
              <p className="text-[15px] mt-2 max-w-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
                Handwerker, bei denen Sie Interesse angemeldet haben. Die
                Entscheidung liegt bei ihnen — hier sehen Sie, wie weit sie ist.
              </p>
            </div>

            {requests.length > 0 && (
              <div
                className="min-w-[236px] rounded-2xl px-5 py-4"
                style={{
                  background: "rgba(20,20,36,0.55)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(3px)",
                }}
              >
                <p className="text-[10.5px] uppercase tracking-[0.16em] mb-2.5" style={{ color: "rgba(255,255,255,0.42)" }}>
                  Antwortquote
                </p>
                <p className="flex items-baseline gap-1.5" style={{ fontFamily: "var(--font-display)" }}>
                  <span className="text-[30px] font-bold tabular-nums text-white leading-none">
                    <Hochzaehler wert={quote} />
                  </span>
                  <span className="text-[15px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>%</span>
                </p>
                <span
                  aria-hidden
                  className="block overflow-hidden rounded-full mt-3 mb-2"
                  style={{ height: 4, background: "rgba(255,255,255,0.12)" }}
                >
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${quote}%` }}
                    transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="block h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #B47B18 0%, #E8A838 60%, #F6D08A 100%)" }}
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
        <div>
          {grouped.map((g, gi) => {
            const Icon = g.icon;
            return (
              <section
                key={g.status}
                // Deutlich mehr Luft zwischen den Bereichen als innerhalb, und
                // eine Haarlinie als Schnitt. Vorher lagen sie im selben
                // Abstand wie die Karten untereinander und liefen ineinander.
                className={gi > 0 ? "mt-12 pt-11" : ""}
                style={gi > 0 ? { borderTop: "1px solid #EAE5DA" } : undefined}
              >
                {/* ── Ein Strang je Bereich ──
                    Die Leiste beginnt am Kopf des Bereichs und laeuft durch
                    seine Karten. Ueberschrift und Anfragen haengen damit
                    sichtbar zusammen, und zwischen zwei Straengen ist eine
                    echte Luecke statt nur etwas Abstand. */}
                <div className="relative pl-7 sm:pl-9">
                  <motion.span
                    aria-hidden
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.55 + g.items.length * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute w-[2px] origin-top"
                    style={{
                      left: 7,
                      top: 22,
                      bottom: 14,
                      background: `linear-gradient(180deg, ${g.color} 0%, ${g.color}55 12%, #E6E1D6 40%, rgba(230,225,214,0) 100%)`,
                    }}
                  />

                  {/* Kopf des Strangs */}
                  <span
                    aria-hidden
                    className="absolute rounded-full"
                    style={{
                      left: 1,
                      top: 8,
                      width: 14,
                      height: 14,
                      background: g.color,
                      border: "3px solid #F8F7F4",
                    }}
                  />

                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-5">
                    <h2
                      className="inline-flex items-center gap-2 text-[19px] font-bold"
                      style={{ color: g.color, fontFamily: "var(--font-display)" }}
                    >
                      <Icon className="w-[18px] h-[18px]" strokeWidth={2.8} />
                      {g.label}
                      <span
                        className="inline-flex items-center justify-center rounded-full text-[12.5px] font-bold tabular-nums"
                        style={{
                          minWidth: 24,
                          height: 24,
                          padding: "0 7px",
                          background: g.bg,
                          color: g.color,
                        }}
                      >
                        {g.items.length}
                      </span>
                    </h2>
                    <span className="text-[14px]" style={{ color: "rgba(26,26,46,0.42)" }}>
                      {g.note}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {g.items.map((r, i) => {
                      const laeuft = r.status === "angefragt";
                      return (
                        <div key={r.id} className="relative">
                          <motion.span
                            aria-hidden
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 0.18 + i * 0.09,
                              type: "spring",
                              stiffness: 420,
                              damping: 24,
                            }}
                            // Nur laufende Anfragen pulsen: dort passiert
                            // gerade etwas, bei entschiedenen nicht mehr.
                            className={`absolute rounded-full ${laeuft ? "vorgang-puls" : ""}`}
                            style={
                              {
                                left: -29,
                                top: 34,
                                width: 12,
                                height: 12,
                                background: g.color,
                                border: "3px solid #F8F7F4",
                                "--puls-nah": `${g.color}88`,
                                "--puls-weit": `${g.color}55`,
                              } as CSSProperties
                            }
                          />
                          <AnfrageKarte
                            anfrage={r}
                            farbe={g.color}
                            hauch={g.hauch}
                            verzug={i * 0.09}
                          />
                        </div>
                      );
                    })}
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
