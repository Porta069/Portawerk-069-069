"use client";

// ─── Übersicht ────────────────────────────────────────────────────────────────
// Aufgebaut nach der Reihenfolge, in der ein Handwerker die Seite liest:
//
//   1. "Hat sich jemand gemeldet?"   → Statuspanel, ein Satz, ganz oben
//   2. "Wie stehe ich da?"           → vier Zahlen, sonst nichts
//   3. "Was passiert gerade?"        → Verlauf; leer = Ablauf statt Leere
//   4. "Was springt für mich raus?"  → Verdienen, ganz unten
//
// Die Rangfolge in `bestimmeLage` ist der Kern der Seite: sie entscheidet, was
// oben steht. Sortiert nach Verbindlichkeit — eine Kontaktanfrage wartet auf
// eine Entscheidung, ein Angebot auf eine Antwort, eine Bewerbung nur auf Zeit.
// Vorher stand dort unabhängig von der Lage immer derselbe Satz.

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FlaskConical } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import {
  getProfileScore,
  listApplications,
  listOffers,
  listFavorites,
  listContactRequests,
  formatRelative,
  JOBS_ARE_MOCKED,
} from "@/lib/jobsService";
import type {
  ApiResult,
  Application,
  Job,
  JobOffer,
  ProfileScore as Score,
  WorkerContactRequest,
} from "@/lib/types";
import StatusPanel, { type Lage } from "@/app/components/dashboard/StatusPanel";
import Kennzahlen from "@/app/components/dashboard/Kennzahlen";
import Verlauf, { type Ereignis } from "@/app/components/dashboard/Verlauf";
import { AffiliateTile } from "@/app/components/dashboard/AffiliateTile";

const APP_STATUS_TEXT: Record<Application["status"], string> = {
  gesendet: "Bewerbung gesendet",
  gesehen: "Bewerbung angesehen",
  im_gespraech: "Im Gespräch",
  abgelehnt: "Abgesagt",
  zusage: "Zusage erhalten",
};

interface Daten {
  offers: JobOffer[];
  apps: Application[];
  favorites: Job[];
  requests: WorkerContactRequest[];
}

/**
 * Welche Lage beschreibt die Seite oben?
 *
 * Absteigend nach Verbindlichkeit. Der erste zutreffende Fall gewinnt — es gibt
 * immer genau eine Überschrift und genau eine Handlung, auch wenn mehrere
 * Dinge gleichzeitig offen sind. Die restlichen stehen in den Zahlen darunter.
 */
function bestimmeLage(d: Daten): Lage {
  const anfragen = d.requests.filter((r) => r.status === "angefragt").length;
  const neueAngebote = d.offers.filter((o) => o.status === "neu").length;
  const zusagen = d.apps.filter((a) => a.status === "zusage").length;
  const gespraeche = d.apps.filter((a) => a.status === "im_gespraech").length;
  const laufend = d.apps.filter((a) => a.status !== "abgelehnt").length;

  if (zusagen > 0) {
    return {
      ueberschrift: zusagen === 1 ? "Du hast eine Zusage." : `Du hast ${zusagen} Zusagen.`,
      unterzeile:
        "Schau sie dir in Ruhe an. Du musst dich zu nichts sofort entscheiden — die Stelle läuft dir nicht weg.",
      aktion: { label: "Zusage ansehen", href: "/dashboard/bewerbungen" },
      dringend: true,
    };
  }

  if (anfragen > 0) {
    return {
      ueberschrift:
        anfragen === 1
          ? "Ein Betrieb möchte deine Kontaktdaten."
          : `${anfragen} Betriebe möchten deine Kontaktdaten.`,
      unterzeile:
        "Bisher kennt er nur dein Können und deine Region. Erst wenn du freigibst, erfährt er, wer du bist — und ruft an.",
      aktion: { label: "Anfrage entscheiden", href: "/dashboard/angebote" },
      dringend: true,
    };
  }

  if (neueAngebote > 0) {
    return {
      ueberschrift:
        neueAngebote === 1
          ? "Ein Betrieb bietet dir eine Stelle an."
          : `${neueAngebote} Betriebe bieten dir eine Stelle an.`,
      unterzeile:
        "Du hast dich nirgends beworben — die kamen auf dich zu. Lohn, Fahrzeit und Bedingungen stehen im Angebot.",
      aktion: { label: "Angebote ansehen", href: "/dashboard/angebote" },
      dringend: true,
    };
  }

  if (gespraeche > 0) {
    return {
      ueberschrift:
        gespraeche === 1
          ? "Du bist bei einem Betrieb im Gespräch."
          : `Du bist bei ${gespraeche} Betrieben im Gespräch.`,
      unterzeile: "Der Stand steht bei deinen Bewerbungen. Melden sich die Betriebe, siehst du es hier.",
      aktion: { label: "Bewerbungen ansehen", href: "/dashboard/bewerbungen" },
      dringend: false,
    };
  }

  if (laufend > 0) {
    return {
      ueberschrift:
        laufend === 1 ? "Deine Bewerbung läuft." : `${laufend} Bewerbungen laufen.`,
      unterzeile:
        "Solange du wartest, kannst du weitersuchen. Mehrere Eisen im Feuer schaden nie.",
      aktion: { label: "Weitere Stellen ansehen", href: "/dashboard/jobboerse" },
      dringend: false,
    };
  }

  // Der Normalfall am Anfang. Bewusst kein Alarm und kein Jubel: die Seite sagt,
  // dass es läuft, und gibt eine Sache zu tun.
  return {
    ueberschrift: "Dein Profil liegt bei den Betrieben.",
    unterzeile:
      "Du musst dich nicht bewerben — Betriebe kommen auf dich zu. Bis dahin kannst du selbst schauen, was in deiner Nähe frei ist.",
    aktion: { label: "Stellen in deiner Nähe", href: "/dashboard/jobboerse" },
    dringend: false,
  };
}

/**
 * Wandelt eine geworfene Ausnahme in ein abgelehntes Ergebnis.
 *
 * `Promise.all` bricht beim ersten `reject` komplett ab — dann liefe der
 * `.then`-Zweig nie und `laedt` bliebe für immer true. Genau das war auf der
 * alten Seite zu sehen: ein Ladekringel, der sich endlos in einer leeren
 * weißen Fläche dreht, während unten "Server nicht erreichbar" stand. Die
 * Dienste geben zwar normalerweise ein ApiResult zurück statt zu werfen, aber
 * darauf darf die Anzeige sich nicht verlassen.
 */
function sicher<T>(p: Promise<ApiResult<T>>): Promise<ApiResult<T>> {
  return p.catch(() => ({ ok: false as const, error: "Netzwerkfehler" }));
}

/**
 * "seit 3 Tagen" — nur bei plausiblem Datum.
 *
 * Der Vorschau-Nutzer trägt den 1.1.1970; ohne Prüfung stünde dort
 * "seit 2900 Wochen".
 */
function aktivSeit(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t) || t < Date.parse("2020-01-01")) return undefined;
  return formatRelative(iso).replace(/^vor /, "seit ").replace(/^gerade eben$/, "seit heute");
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [score, setScore] = useState<Score | null>(null);
  const [daten, setDaten] = useState<Daten>({
    offers: [],
    apps: [],
    favorites: [],
    requests: [],
  });
  const [laedt, setLaedt] = useState(true);

  useEffect(() => {
    let aktiv = true;
    // Alle fünf parallel. Einzelne dürfen scheitern, ohne die Seite zu leeren —
    // ein Aussetzer bei der Merkliste darf die Angebote nicht mitreißen.
    Promise.all([
      sicher(getProfileScore()),
      sicher(listOffers()),
      sicher(listApplications()),
      sicher(listFavorites()),
      sicher(listContactRequests()),
    ]).then(([s, o, a, f, r]) => {
      if (!aktiv) return;
      if (s.ok) setScore(s.data);
      setDaten({
        offers: o.ok ? o.data : [],
        apps: a.ok ? a.data : [],
        favorites: f.ok ? f.data : [],
        requests: r.ok ? r.data : [],
      });
      setLaedt(false);
    });
    return () => {
      aktiv = false;
    };
  }, [user]);

  const lage = bestimmeLage(daten);

  const zahlen = [
    {
      label: "Angebote",
      wert: daten.offers.filter((o) => o.status === "neu").length,
      href: "/dashboard/angebote",
      betont: true,
    },
    {
      label: "Bewerbungen",
      wert: daten.apps.filter((a) => a.status !== "abgelehnt").length,
      href: "/dashboard/bewerbungen",
    },
    {
      label: "Im Gespräch",
      wert: daten.apps.filter((a) => a.status === "im_gespraech").length,
      href: "/dashboard/bewerbungen",
      betont: true,
    },
    {
      label: "Gemerkt",
      wert: daten.favorites.length,
      href: "/dashboard/merkliste",
    },
  ];

  // Verlauf aus Angeboten, Anfragen und Bewerbungen — eine Schiene, drei Quellen.
  const ereignisse: Ereignis[] = [
    ...daten.requests.map((r) => ({
      id: `r-${r.id}`,
      titel: `${r.company} fragt deine Kontaktdaten an — ${r.position}`,
      zeit: r.sentAt,
      ungelesen: r.status === "angefragt",
      href: "/dashboard/angebote",
    })),
    ...daten.offers.map((o) => ({
      id: `o-${o.id}`,
      titel: `${o.job.employer} bietet dir „${o.job.title}" an`,
      zeit: o.receivedAt,
      ungelesen: o.status === "neu",
      href: "/dashboard/angebote",
    })),
    ...daten.apps.map((a) => ({
      id: `a-${a.id}`,
      titel: `${APP_STATUS_TEXT[a.status]} — ${a.job.title}`,
      zeit: a.updatedAt,
      ungelesen: false,
      href: "/dashboard/bewerbungen",
    })),
  ];

  const luecken = score?.gaps ?? [];

  return (
    <div>
      {JOBS_ARE_MOCKED && (
        <div
          className="flex items-start gap-3 px-4 py-3 mb-6"
          style={{ background: "rgba(232,168,56,0.09)", border: "1px solid rgba(232,168,56,0.28)" }}
        >
          <FlaskConical className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#B47B18" }} />
          <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(26,26,46,0.7)" }}>
            <strong>Demodaten:</strong> Für Stellen, Angebote und Bewerbungen gibt es noch
            keine Backend-Endpunkte. Die Oberfläche arbeitet gegen einen Mock und
            verhält sich bereits wie später im Betrieb.
          </p>
        </div>
      )}

      <StatusPanel
        lage={lage}
        prozent={score?.percent ?? null}
        seit={aktivSeit(user?.createdAt)}
      />

      <Kennzahlen zahlen={zahlen} laedt={laedt} />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] gap-10 lg:gap-14 items-start mt-12">
        <Verlauf ereignisse={ereignisse} laedt={laedt} />

        <aside className="space-y-10">
          {/* Offene Schritte — nur wenn es welche gibt. Eine Überschrift über
              einer leeren Liste ist schlimmer als gar keine Überschrift. */}
          {luecken.length > 0 && (
            <section>
              <h2
                className="text-primary font-bold text-[18px] mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Das fehlt noch
              </h2>
              <p className="text-[13px] leading-relaxed mb-4" style={{ color: "rgba(26,26,46,0.5)" }}>
                Jede Angabe schaltet weitere Stellen frei.
              </p>
              <ul style={{ borderTop: "1px solid #E4E1DA" }}>
                {luecken.slice(0, 4).map((g) => (
                  <li key={g.id} style={{ borderBottom: "1px solid #E4E1DA" }}>
                    <Link
                      href={g.href}
                      className="group flex items-center justify-between gap-3 py-3.5 transition-colors duration-200"
                    >
                      <span
                        className="text-[13.5px] min-w-0 truncate transition-colors duration-200 group-hover:text-[#B47B18]"
                        style={{ color: "rgba(26,26,46,0.75)" }}
                      >
                        {g.label}
                      </span>
                      <span className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-[12.5px] font-bold tabular-nums"
                          style={{ color: "#B47B18" }}
                        >
                          +{g.extraJobs}
                        </span>
                        <ArrowRight
                          className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                          style={{ color: "rgba(26,26,46,0.3)" }}
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <AffiliateTile />
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
