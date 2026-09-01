// ─── Web-App-Manifest ─────────────────────────────────────────────────────────
// Fehlte bisher. Ohne Manifest zeigt ein zum Homescreen hinzugefügtes Lesezeichen
// auf Android einen grauen Platzhalter statt des Logos, und die Adressleiste
// bleibt weiß statt in der Markenfarbe.
//
// Für die Zielgruppe ist das kein Nebenschauplatz: Handwerker sind unterwegs,
// die Seite wird überwiegend am Telefon geöffnet.
//
// Bewusst KEIN `display: "standalone"`. Als vollflächige App ohne Adressleiste
// verliert der Nutzer die Zurück-Taste des Browsers — die Anmeldung und der
// Funnel setzen sie aber voraus. `browser` behält das gewohnte Verhalten und
// nimmt trotzdem Symbol und Farbe mit.

import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Handwerker-Jobs ohne Bewerbung`,
    short_name: SITE_NAME,
    description:
      "Kostenlose Jobvermittlung fürs Handwerk: Betriebe bewerben sich bei dir — diskret und anonym.",
    start_url: "/",
    display: "browser",
    background_color: "#F8F7F4",
    theme_color: "#1A1A2E",
    lang: "de",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon.png", sizes: "256x256", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
