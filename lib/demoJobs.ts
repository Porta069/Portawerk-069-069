// ─── Beispielstellen für die Gestaltung ──────────────────────────────────────
// NUR fürs Ansehen und Verbessern der Stellenkarten. Sie werden ausschliesslich
// über `?demo=1` im Entwicklungsmodus gezeigt (siehe `demoAktiv`) und rühren
// weder Backend noch gespeicherte Daten an: nichts wird geschrieben, nichts
// gesendet, die Stellen existieren nur im Browser.
//
// Warum es sie gibt: ohne Anmeldung antwortet das Backend mit 401, die Liste
// bleibt leer — man kann also nicht beurteilen, wie eine Stelle aussieht.
//
// Die Betriebsnamen sind erfunden. Bewusst keine echten Firmen: eine Anzeige,
// die aussieht wie ein echtes Inserat, hat in einer Vorschau nichts verloren.

import type { Job } from "./types";

/**
 * Ist die Vorschau eingeschaltet?
 *
 * `process.env.NODE_ENV` ist im Produktionsbau fest "production", die Prüfung
 * dort also dauerhaft false — der Schalter existiert live schlicht nicht, auch
 * wenn jemand den Parameter anhängt.
 */
export function demoAktiv(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV === "production") return false;
  return new URLSearchParams(window.location.search).get("demo") === "1";
}

const bauen = (
  id: string,
  daten: Partial<Job> & Pick<Job, "title" | "employer" | "city" | "gewerk" | "image">
): Job => ({
  id,
  distanceKm: 0,
  travelMinutes: 0,
  lat: 51.3,
  lng: 10.4,
  startLabel: "Dein Arbeitsort",
  startLat: 51.3,
  startLng: 10.4,
  salaryMin: 0,
  salaryMax: 0,
  tags: [],
  conditions: {
    montage: "Jeden Abend zuhause",
    fahrzeitIstArbeitszeit: true,
    startpunkt: "Betrieb",
    urlaubstage: 30,
    start: "Ab sofort",
  },
  ...daten,
});

export const DEMO_JOBS: Job[] = [
  bauen("demo-1", {
    title: "Elektroniker Betriebstechnik",
    employer: "Sander Elektrotechnik GmbH",
    gewerk: "Elektroniker / Elektriker",
    city: "Göttingen",
    image: "/images/elektrik-sicherungskasten.jpg",
    distanceKm: 18,
    travelMinutes: 22,
    salaryMin: 3600,
    salaryMax: 4100,
    marketAvg: 3750,
    tags: ["Unbefristet", "Firmenwagen", "Weiterbildung"],
    recommended: true,
    respondsInDays: 2,
    matchScore: 94,
    matchReasons: [
      "Dein Gewerk passt genau",
      "22 Minuten — unter deiner Grenze",
      "Jeden Abend zuhause, wie gewünscht",
    ],
    description:
      "Wartung und Instandhaltung von Schaltanlagen im Bestand. Feste Teams, keine Wochenendarbeit.",
    companySlogan: "Seit 1974 im Familienbetrieb",
    companyMitarbeiter: "38 Mitarbeiter",
    companyGruendungsjahr: "1974",
    benefits: ["Firmenwagen auch privat", "30 Tage Urlaub", "Weihnachtsgeld"],
    conditions: {
      montage: "Jeden Abend zuhause",
      fahrzeitIstArbeitszeit: true,
      startpunkt: "Betrieb",
      urlaubstage: 30,
      start: "Ab sofort",
      extras: ["Kein Notdienst"],
    },
  }),
  bauen("demo-2", {
    title: "Anlagenmechaniker SHK",
    employer: "Bertram Haustechnik",
    gewerk: "Anlagenmechaniker SHK",
    city: "Kassel",
    image: "/images/shk-heizung.jpg",
    distanceKm: 31,
    travelMinutes: 38,
    salaryMin: 3300,
    salaryMax: 3800,
    marketAvg: 3500,
    tags: ["Unbefristet", "Vier-Tage-Woche"],
    respondsInDays: 4,
    matchScore: 81,
    matchReasons: ["Dein Gewerk passt genau", "Vier-Tage-Woche"],
    description:
      "Heizungsmodernisierung im Altbau, überwiegend Wärmepumpe. Einarbeitung durch den Meister.",
    companySlogan: "Wärme, die bleibt",
    companyMitarbeiter: "12 Mitarbeiter",
    benefits: ["Vier-Tage-Woche", "Werkzeug gestellt"],
  }),
  bauen("demo-3", {
    title: "Tischler Möbelbau",
    employer: "Holzwerk Neuhaus",
    gewerk: "Tischler / Schreiner",
    city: "Eisenach",
    image: "/images/tischler-hobel.jpg",
    distanceKm: 44,
    travelMinutes: 52,
    salaryMin: 3100,
    salaryMax: 3500,
    marketAvg: 3300,
    tags: ["Unbefristet", "Eigene Werkstatt"],
    respondsInDays: 6,
    matchScore: 67,
    matchReasons: ["Dein Gewerk passt genau"],
    description:
      "Einzelanfertigungen für Privatkunden, vom Aufmass bis zur Montage. Eigene Werkstatt, moderne Maschinen.",
    companySlogan: "Massarbeit aus Thüringen",
    companyMitarbeiter: "9 Mitarbeiter",
  }),
];
