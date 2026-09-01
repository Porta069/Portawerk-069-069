// ─── sitemap.xml ──────────────────────────────────────────────────────────────
// Fehlte bisher. Eine Sitemap ersetzt keine gute Verlinkung, aber sie sagt
// Suchmaschinen zuverlässig, welche Seiten es gibt und welche wichtig sind —
// gerade bei einer neuen Domain ohne eingehende Links macht das den
// Unterschied zwischen „in zwei Tagen indexiert" und „in sechs Wochen".
//
// Aufgeführt wird ausschließlich, was ohne Anmeldung sinnvoll ist. Die Liste
// steht in `lib/site.ts` neben den geschützten Pfaden, damit beim Anlegen einer
// neuen Seite an einer Stelle entschieden wird, ob sie öffentlich ist.

import type { MetadataRoute } from "next";
import { SITE_URL, OEFFENTLICHE_SEITEN } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Ein fester Zeitpunkt pro Auslieferung: `new Date()` bei jedem Abruf würde
  // jeder Seite ein tagesaktuelles Änderungsdatum andichten, obwohl sich nichts
  // geändert hat. Crawler lernen daraus schnell, dem Datum nicht zu glauben.
  const stand = new Date();

  return OEFFENTLICHE_SEITEN.map(({ pfad, prioritaet, takt }) => ({
    url: `${SITE_URL}${pfad}`,
    lastModified: stand,
    changeFrequency: takt,
    priority: prioritaet,
  }));
}
