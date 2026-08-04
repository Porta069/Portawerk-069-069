"use client";

// ─── Vertrauens-Zähler ────────────────────────────────────────────────────────
// Zeigt, wie viele Handwerker tatsächlich registriert sind.
//
// Zwei Regeln, an denen nicht gerüttelt wird:
//  1. Die Zahl kommt aus der Datenbank, nie aus dem Quelltext. Vorher stand
//     hier fest verdrahtet „127 Handwerker diese Woche" — das war schlicht
//     erfunden.
//  2. Unterhalb einer Schwelle wird gar keine Zahl behauptet. Eine echte,
//     aber kleine Zahl kostet mehr Vertrauen, als sie einbringt; die
//     Alternative sagt dafür etwas, das ebenso wahr ist.

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

interface Stats {
  handwerker: number;
  betriebe: number;
  /** Sagt das Backend: taugt die Zahl schon zum Zeigen? */
  zeigen: boolean;
  schwelle: number;
}

export default function TrustCounter() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void apiRequest<Stats>("/stats").then((res) => {
      if (res.ok) setStats(res.data);
    });
  }, []);

  // Solange nichts geladen ist, steht dort die Aussage, die immer stimmt —
  // kein Platzhalter, der später durch eine Zahl ersetzt wird und dabei
  // springt.
  const text =
    stats && stats.zeigen ? (
      <>
        Dauert nur 3 Minuten · schon{" "}
        <span className="text-primary font-semibold">
          {stats.handwerker.toLocaleString("de-DE")} Handwerker
        </span>{" "}
        dabei
      </>
    ) : stats && stats.betriebe > 0 ? (
      <>
        Dauert nur 3 Minuten ·{" "}
        <span className="text-primary font-semibold">
          {stats.betriebe} {stats.betriebe === 1 ? "Betrieb" : "Betriebe"}
        </span>{" "}
        suchen gerade
      </>
    ) : (
      <>Dauert nur 3 Minuten · dein Profil bleibt kostenlos</>
    );

  return (
    <p className="text-muted text-sm mt-3 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />
      {text}
    </p>
  );
}
