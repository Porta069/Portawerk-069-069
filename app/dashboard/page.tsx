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
import { ArrowRight, FlaskConical, Handshake, FileText, MessagesSquare, Bookmark } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import {
  getProfileScore,
  listApplications,
  listOffers,
  listFavorites,
  listContactRequests,
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
import Kennzahlen, { type Kennzahl } from "@/app/components/dashboard/Kennzahlen";
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
        "Lass dir Zeit — die Stelle läuft dir nicht weg.",
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
        "Erst wenn du freigibst, erfährt er, wer du bist.",
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
        "Lohn, Fahrzeit und Bedingungen stehen im Angebot.",
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
      unterzeile: "Melden sich die Betriebe, siehst du es hier.",
      aktion: { label: "Bewerbungen ansehen", href: "/dashboard/bewerbungen" },
      dringend: false,
    };
  }

  if (laufend > 0) {
    return {
      ueberschrift:
        laufend === 1 ? "Deine Bewerbung läuft." : `${laufend} Bewerbungen laufen.`,
      unterzeile:
        "Mehrere Eisen im Feuer schaden nie.",
      aktion: { label: "Weitere Stellen ansehen", href: "/dashboard/jobboerse" },
      dringend: false,
    };
  }

  // Der Normalfall am Anfang: der Slogan der Marke, ein Satz Erklärung, ein
  // Knopf. Vorher standen hier drei Zeilen Fließtext plus eine Pille plus ein
  // "oder" — zu viel für den Moment, in dem jemand die Seite aufschlägt.
  return {
    ueberschrift: "Ab jetzt bewirbt sich das Handwerk bei DIR!",
    unterzeile: "Dein Profil ist bereit. Betriebe suchen gerade aktiv nach dir.",
    aktion: { label: "Stellen in der Nähe suchen", href: "/dashboard/jobboerse" },
    dringend: false,
    zweiWege: true,
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

  const zahlen: Kennzahl[] = [
    {
      label: "Angebote",
      wert: daten.offers.filter((o) => o.status === "neu").length,
      href: "/dashboard/angebote",
      aktion: "Angebote ansehen",
      icon: Handshake,
      betont: true,
    },
    {
      label: "Bewerbungen",
      wert: daten.apps.filter((a) => a.status !== "abgelehnt").length,
      href: "/dashboard/bewerbungen",
      aktion: "Stand ansehen",
      icon: FileText,
    },
    {
      label: "Im Gespräch",
      wert: daten.apps.filter((a) => a.status === "im_gespraech").length,
      href: "/dashboard/bewerbungen",
      aktion: "Gespräche ansehen",
      icon: MessagesSquare,
      betont: true,
    },
    {
      label: "Gemerkt",
      wert: daten.favorites.length,
      href: "/dashboard/merkliste",
      aktion: "Merkliste öffnen",
      icon: Bookmark,
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

      <StatusPanel lage={lage} prozent={score?.percent ?? null} />

      {/* 1440 statt 1680: über die volle Kopfleistenbreite wirkte die Seite
          auseinandergezogen — vier flache Karten und ein Streifen quer über
          1,6 Meter Fläche. 1440 mit 48 px Rand lässt Luft an den Seiten, ohne
          dass es eng wird. Immer noch breiter als die 1280 des Layouts.

          Getrennte Ebenen: aussen der Ausbruch auf Fensterbreite, innen der
          eigene Container. `.vollbreite` setzt selbst margin-left/right — mit
          `mx-auto` am selben Element würde eines von beiden gewinnen, je nach
          Reihenfolge im Stylesheet. */}
      <div className="vollbreite">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,350px)] gap-9 lg:gap-12 items-start">
        {/* Etwas Luft zur Bannerkante — der Block sass sonst bündig darunter. */}
        <div className="lg:pt-7">
          {/* Kurze Einordnung über den Karten — ohne sie sind es vier Zahlen
              ohne Zusammenhang, mit ihr ist klar, was der Bereich kann. */}
          <h2
            className="text-primary font-bold text-[19px] mb-1.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Deine Angebote und Bewerbungen
          </h2>
          <p className="text-[13.5px] mb-6" style={{ color: "rgba(26,26,46,0.5)" }}>
            Ein Klick öffnet die jeweilige Liste.
          </p>

          <Kennzahlen zahlen={zahlen} laedt={laedt} />

          {/* Der Platz unter den Karten: hier stehen die Angebote und
              Bewerbungen selbst, sobald welche da sind. Solange nicht, erklärt
              derselbe Bereich, warum noch nichts da ist und was als Nächstes
              passiert. */}
          <div className="mt-10 lg:mt-14">
            <Verlauf ereignisse={ereignisse} laedt={laedt} />
          </div>
        </div>

        {/* Das Verdienen-Panel wird in den Banner hineingezogen: beide sind
            navy, der Übergang verläuft weich, und aus zwei getrennten Kästen
            wird eine Fläche, die aus dem Kopf der Seite nach unten läuft.
            Nur ab lg — darunter steht die Spalte ohnehin unter dem Banner. */}
        <aside className="space-y-6 lg:-mt-[8.5rem] verdienen-aussenkante">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
          >
            <AffiliateTile angebunden />
          </motion.div>

          {/* Offene Schritte — nur wenn es welche gibt. Eine Überschrift über
              einer leeren Liste ist schlimmer als gar keine Überschrift. */}
          {luecken.length > 0 && (
            <section className="rounded-2xl bg-white p-6" style={{ border: "1.5px solid #E9E7E1" }}>
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
        </aside>
        </div>
      </div>
    </div>
  );
}
