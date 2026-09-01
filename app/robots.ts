// ─── robots.txt ───────────────────────────────────────────────────────────────
// Fehlte bisher komplett. Ohne die Datei durchsucht jeder Crawler auch die
// Bereiche hinter der Anmeldung: Google indexiert dann `/unternehmen/inserate`
// oder `/einstellungen`, und wer aus der Suche darauf klickt, landet auf einer
// leeren Seite oder wird zur Anmeldung geworfen. Das kostet Vertrauen und
// verwässert die Suchergebnisse der Seiten, die wirklich gefunden werden sollen.
//
// Es ist ausdrücklich KEINE Zugriffskontrolle — robots.txt ist eine Bitte, kein
// Riegel. Der Riegel sitzt im Backend. Wer die Datei liest, sieht die Namen der
// internen Pfade; das ist unbedenklich, weil sie ohne Sitzung nichts liefern.

import type { MetadataRoute } from "next";
import { SITE_URL, GESCHUETZTE_PFADE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: GESCHUETZTE_PFADE.map((p) => `${p}/`),
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    // Sagt Suchmaschinen, welche Adresse die richtige ist. Die Seite ist über
    // mehrere Domains erreichbar (u. a. eine alte Vercel-Adresse); ohne diesen
    // Hinweis konkurrieren sie in der Suche gegeneinander.
    host: SITE_URL,
  };
}
