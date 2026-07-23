// ─── Rechtstexte (Platzhalter) ───────────────────────────────────────────────
// ACHTUNG: Alle Texte sind PLATZHALTER und müssen vor Live-Gang von einer
// Rechtsanwältin / einem Rechtsanwalt geprüft und angepasst werden.
//
//   GET /api/legal/terms → getLegalTerms()

import type { ApiResult } from "./types";

export interface LegalSection {
  id: string;
  title: string;
  /** Absätze — jeweils optional mit Zwischenüberschrift. */
  blocks: { heading?: string; text: string }[];
}

const LEGAL_SECTIONS: LegalSection[] = [
  {
    id: "datenschutz",
    title: "Datenschutzerklärung",
    blocks: [
      {
        heading: "Erfassung und Verarbeitung",
        text: "Wir erheben bei der Registrierung Name, E-Mail-Adresse, Telefonnummer sowie freiwillige Angaben zu deinen handwerklichen Fähigkeiten und Erfahrungen. Diese Daten nutzen wir ausschließlich zur Jobvermittlung.",
      },
      {
        heading: "Deine Rechte (DSGVO)",
        text: "Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung sowie Datenübertragbarkeit. Wende dich dafür an datenschutz@portawerk.de.",
      },
      {
        heading: "Speicherdauer",
        text: "Deine Daten werden gelöscht, sobald der Zweck der Verarbeitung entfällt oder du deine Einwilligung widerrufst — spätestens jedoch nach den gesetzlichen Aufbewahrungsfristen.",
      },
      {
        heading: "Datenweitergabe an Dritte",
        text: "Eine Weitergabe an potenzielle Arbeitgeber erfolgt ausschließlich mit deiner ausdrücklichen, betriebsbezogenen Zustimmung. Ohne dein OK bleiben deine Daten bei uns.",
      },
    ],
  },
  {
    id: "nutzungsbedingungen",
    title: "Nutzungsbedingungen",
    blocks: [
      {
        heading: "Haftungsausschluss",
        text: "PortaWerk vermittelt Kontakte zwischen Fachkräften und Betrieben. Für das Zustandekommen oder den Inhalt eines Arbeitsverhältnisses übernehmen wir keine Haftung.",
      },
      {
        heading: "Urheberrechte",
        text: "Alle Inhalte dieser Plattform sind urheberrechtlich geschützt. Eine Nutzung außerhalb der vorgesehenen Zwecke bedarf unserer Zustimmung.",
      },
      {
        heading: "Missbrauchsverbot",
        text: "Die Angabe falscher Daten, das Erstellen mehrfacher Profile sowie jede missbräuchliche Nutzung sind untersagt.",
      },
      {
        heading: "Konsequenzen bei Regelverstoß",
        text: "Bei Verstößen behalten wir uns vor, Profile zu sperren oder zu löschen und ggf. rechtliche Schritte einzuleiten.",
      },
    ],
  },
  {
    id: "impressum",
    title: "Impressum",
    blocks: [
      {
        heading: "Anbieter (Angaben gemäß § 5 TMG)",
        text: "PortaWerk — betrieben durch portajobs.de. Vollständige Anbieterangaben folgen; Platzhalter, rechtlich zu ergänzen.",
      },
      {
        heading: "Kontakt",
        text: "E-Mail: kontakt@portawerk.de",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookie-Richtlinie",
    blocks: [
      {
        heading: "Cookie-Verwendung",
        text: "Wir verwenden technisch notwendige Cookies für den Betrieb der Plattform sowie — nach deiner Einwilligung — optionale Cookies zur Reichweitenmessung.",
      },
      {
        heading: "Opt-Out",
        text: "Du kannst nicht notwendige Cookies jederzeit über die Cookie-Einstellungen deaktivieren.",
      },
    ],
  },
];

/** GET /api/legal/terms */
export async function getLegalTerms(): Promise<ApiResult<LegalSection[]>> {
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true, data: LEGAL_SECTIONS };
}

/** Synchroner Zugriff für statische Seiten. */
export function legalSections(): LegalSection[] {
  return LEGAL_SECTIONS;
}
