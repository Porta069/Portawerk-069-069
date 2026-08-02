// ─── Rechtstexte ─────────────────────────────────────────────────────────────
// Inhaltlich am TATSÄCHLICHEN System ausgerichtet (Stand 2026-08): welche
// Daten wir wirklich erheben, wo sie liegen, welche Dritten beteiligt sind.
// ACHTUNG: Vor Live-Gang von einer Rechtsanwältin / einem Rechtsanwalt prüfen
// lassen. Stellen in [ECKIGEN KLAMMERN] müssen zwingend ausgefüllt werden.
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
    id: "impressum",
    title: "Impressum",
    blocks: [
      {
        heading: "Anbieter (Angaben gemäß § 5 DDG)",
        text: "[FIRMENNAME / VOLLSTÄNDIGER NAME DER BETREIBER EINSETZEN], [STRASSE UND HAUSNUMMER], [PLZ ORT], Deutschland. Rechtsform: [z. B. GbR / UG (haftungsbeschränkt) — EINSETZEN]. Vertreten durch: [NAMEN DER VERTRETUNGSBERECHTIGTEN EINSETZEN].",
      },
      {
        heading: "Kontakt",
        text: "E-Mail: kontakt@portawerk.de · Telefon: [TELEFONNUMMER EINSETZEN]. Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [USt-IdNr. EINSETZEN oder Absatz streichen].",
      },
      {
        heading: "Verantwortlich für den Inhalt",
        text: "Inhaltlich verantwortlich gemäß § 18 Abs. 2 MStV: [NAME, ANSCHRIFT EINSETZEN].",
      },
      {
        heading: "Streitbeilegung",
        text: "Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. Die EU-Plattform zur Online-Streitbeilegung findest du unter https://ec.europa.eu/consumers/odr.",
      },
    ],
  },
  {
    id: "datenschutz",
    title: "Datenschutzerklärung",
    blocks: [
      {
        heading: "Verantwortlicher",
        text: "Verantwortlicher im Sinne der DSGVO ist [FIRMENNAME UND ANSCHRIFT WIE IM IMPRESSUM EINSETZEN]. Datenschutz-Anfragen: datenschutz@portawerk.de.",
      },
      {
        heading: "Welche Daten wir erheben",
        text: "Bei der Registrierung als Handwerker:in: Vor- und Nachname, E-Mail-Adresse, Telefonnummer, Passwort (nur als kryptografischer Hash gespeichert), deine Angaben zu Gewerk, Berufserfahrung, Qualifikationen, Bereitschaft (z. B. Montage, Schicht), bevorzugter Auftragsart und Betriebsgröße, deine gewählten Arbeitsorte mit Umkreis sowie optional ein Profilbild. Bei einer Bewerbung über das Bewerbungsformular zusätzlich Geburtsjahr (das vollständige Geburtsdatum wird nur zur Altersprüfung verwendet und nicht gespeichert) und hochgeladene Unterlagen (z. B. Lebenslauf). Bei Betrieben: Firmen- und Kontaktdaten sowie Angaben zu Stellen und Arbeitsbedingungen.",
      },
      {
        heading: "Wofür wir sie verwenden (Zwecke und Rechtsgrundlagen)",
        text: "Die Verarbeitung erfolgt zur Jobvermittlung zwischen Handwerker:innen und Betrieben — also zur Durchführung des Nutzungsvertrags (Art. 6 Abs. 1 lit. b DSGVO): Berechnung von Übereinstimmungswerten (Match-Scores) zwischen deinem Profil und Stellenanzeigen, Anzeige passender Stellen, Übermittlung von Bewerbungen und Jobangeboten. Die Verifizierung von E-Mail/Telefonnummer per Einmalcode und Sicherheitsprotokolle stützen sich auf unser berechtigtes Interesse an einem sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO).",
      },
      {
        heading: "Match-Scores (keine automatisierte Letztentscheidung)",
        text: "Unsere Plattform berechnet aus deinen Angaben und den Wunsch-Kriterien der Betriebe einen Übereinstimmungswert. Dieser Wert sortiert Vorschläge, trifft aber keine rechtlich bindende Entscheidung über dich — ob es zu Kontakt, Gespräch oder Vertrag kommt, entscheiden ausschließlich Menschen (du und der Betrieb). Den vollständigen Rechenweg jedes Werts kannst du in der Anwendung einsehen.",
      },
      {
        heading: "Diskretionsprinzip: Weitergabe an Betriebe",
        text: "Betriebe sehen von dir zunächst nur ein anonymisiertes Profil (Kürzel statt Name, Region statt Adresse, fachliche Angaben). Deinen Namen und deine Kontaktdaten erhält ein Betrieb erst, wenn du dessen Kontaktanfrage ausdrücklich freigibst oder ein Jobangebot annimmst. Diese Freigabe kannst du im Einzelfall verweigern.",
      },
      {
        heading: "Auftragsverarbeiter und Hosting",
        text: "Wir hosten bei folgenden Dienstleistern (Auftragsverarbeitung nach Art. 28 DSGVO): Vercel Inc. (Auslieferung der Website; USA — Übermittlung auf Grundlage des EU-US Data Privacy Framework bzw. Standardvertragsklauseln), Render Services Inc. (Anwendungsserver, Region Frankfurt), Supabase Inc. (Datenbank und Dateispeicher, AWS-Region Irland/eu-west-1). Hochgeladene Unterlagen liegen in einem privaten, nicht öffentlich zugänglichen Speicher.",
      },
      {
        heading: "Kartendarstellung und Fahrzeiten",
        text: "Für Karten nutzen wir OpenStreetMap-Kacheln (tile.openstreetmap.de), für die Ortssuche Nominatim (openstreetmap.org) und für die optionale Fahrzeitberechnung den Routingdienst OSRM (router.project-osrm.org). Beim Laden dieser Inhalte wird deine IP-Adresse an den jeweiligen Dienst übermittelt; Koordinaten deiner gewählten Orte werden zur Routenberechnung übertragen, jedoch ohne Namens- oder Kontobezug. Die Nutzung deines aktuellen Standorts („Mein Standort“) erfolgt nur nach deiner ausdrücklichen Freigabe im Browser.",
      },
      {
        heading: "Reichweitenmessung",
        text: "Wir verwenden Vercel Web Analytics in der cookielosen Variante: gezählt werden Seitenaufrufe ohne Cookies und ohne geräteübergreifendes Tracking; IP-Adressen werden nicht dauerhaft gespeichert. Rechtsgrundlage ist unser berechtigtes Interesse an der Verbesserung des Angebots (Art. 6 Abs. 1 lit. f DSGVO).",
      },
      {
        heading: "Empfehlungsprogramm",
        text: "Registrierst du dich über einen Empfehlungslink, speichern wir den Empfehlungscode und zeigen der werbenden Person deinen Vornamen und dein Gewerk als Fortschrittsanzeige. Klicks auf Empfehlungslinks werden mit einer pseudonymisierten (gehashten) IP-Adresse gezählt.",
      },
      {
        heading: "Speicherdauer und Löschung",
        text: "Konto- und Profildaten speichern wir, solange dein Konto besteht. Du kannst dein Konto jederzeit in den Einstellungen selbst löschen; damit werden auch Merkliste, Bewerbungen, Angebote und Kontaktfreigaben entfernt. Bewerbungsdatensätze unterliegen einer automatisierten Löschfrist; gesetzliche Aufbewahrungspflichten und die Nachweisfrist des AGG bleiben unberührt. Sicherheitsprotokolle werden nach kurzer Frist automatisch gelöscht.",
      },
      {
        heading: "Deine Rechte (Art. 15–21 DSGVO)",
        text: "Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. In den Einstellungen kannst du deine Daten jederzeit selbst als Datei exportieren (inklusive Profilangaben, Merkliste, Bewerbungen, Angeboten und Kontaktfreigaben) und dein Konto löschen. Zusätzlich erreichst du uns unter datenschutz@portawerk.de. Du hast außerdem das Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde, z. B. [ZUSTÄNDIGE LANDESBEHÖRDE EINSETZEN].",
      },
    ],
  },
  {
    id: "nutzungsbedingungen",
    title: "Nutzungsbedingungen (AGB)",
    blocks: [
      {
        heading: "Leistung von PortaWerk",
        text: "PortaWerk ist eine Vermittlungsplattform: Wir bringen Handwerker:innen und Betriebe zusammen, berechnen Übereinstimmungswerte und ermöglichen diskrete Kontaktaufnahme. Für Handwerker:innen ist die Nutzung kostenlos. Wir sind weder Arbeitsvermittler im Sinne einer Arbeitsverwaltung noch Vertragspartei eines etwaigen Arbeitsverhältnisses.",
      },
      {
        heading: "Kein Anspruch auf Vermittlung",
        text: "Ein Anspruch auf Vermittlung, auf eine bestimmte Anzahl von Angeboten oder auf einen bestimmten Übereinstimmungswert besteht nicht. Für das Zustandekommen, den Inhalt oder die Durchführung eines Arbeitsverhältnisses übernehmen wir keine Haftung.",
      },
      {
        heading: "Pflichten der Nutzer:innen",
        text: "Angaben im Profil und in Inseraten müssen wahr, aktuell und eigene sein. Untersagt sind insbesondere: falsche Identitäts- oder Qualifikationsangaben, mehrfache Profile, das Einstellen fremder Daten ohne Berechtigung, automatisiertes Auslesen der Plattform sowie jede Nutzung der über die Plattform erhaltenen Kontaktdaten zu anderen Zwecken als der Anbahnung eines Beschäftigungsverhältnisses.",
      },
      {
        heading: "Pflichten der Betriebe",
        text: "Betriebe verpflichten sich, Angaben in Inseraten (insbesondere Vergütung, Montageanteil, Urlaubstage und Leistungen) wahrheitsgemäß zu machen, freigegebene Kontaktdaten vertraulich zu behandeln und Kandidatendaten nach Abschluss oder Abbruch des Verfahrens zu löschen, soweit keine gesetzliche Pflicht zur Aufbewahrung besteht.",
      },
      {
        heading: "Empfehlungsprämie",
        text: "Für das Empfehlungsprogramm („Verdienen mit PortaWerk“) gilt: Die Prämie entsteht erst mit erfolgreicher Vermittlung der geworbenen Person und wird nach den im Partnerbereich genannten Bedingungen ausgezahlt. Missbrauch (z. B. Selbstwerbung über Zweitkonten, erfundene Personen) führt zum Verfall der Prämie und zur Sperrung. [AUSZAHLUNGSBEDINGUNGEN UND STEUERHINWEIS ANWALTLICH PRÄZISIEREN]",
      },
      {
        heading: "Verfügbarkeit",
        text: "Wir bemühen uns um einen unterbrechungsfreien Betrieb, schulden aber keine bestimmte Verfügbarkeit. Wartungsfenster und Störungen — auch bei eingebundenen Drittdiensten (Karten, Routing) — können die Nutzung vorübergehend einschränken.",
      },
      {
        heading: "Haftung",
        text: "Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper und Gesundheit. Bei einfacher Fahrlässigkeit haften wir nur für die Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), begrenzt auf den vertragstypisch vorhersehbaren Schaden. Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt.",
      },
      {
        heading: "Sperrung, Kündigung, Änderungen",
        text: "Bei Verstößen gegen diese Bedingungen können wir Profile und Inserate sperren oder löschen. Du kannst dein Konto jederzeit ohne Frist löschen. Änderungen dieser Bedingungen kündigen wir mit angemessener Frist an; widersprichst du nicht, gelten sie als angenommen. [SCHLUSSBESTIMMUNGEN, GERICHTSSTAND UND RECHTSWAHL ANWALTLICH ERGÄNZEN]",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies & lokale Speicherung",
    blocks: [
      {
        heading: "Keine Tracking-Cookies",
        text: "PortaWerk setzt keine Werbe- oder Tracking-Cookies und benötigt deshalb kein Cookie-Banner. Die Reichweitenmessung (Vercel Web Analytics) arbeitet ohne Cookies und ohne geräteübergreifende Profile.",
      },
      {
        heading: "Technisch notwendige lokale Speicherung",
        text: "Für den Betrieb speichert dein Browser lokal (localStorage): deine Anmelde-Sitzung, den Zwischenstand der Registrierung sowie kleine Komfort-Einstellungen (z. B. die zuletzt gesuchte Postleitzahl im Betriebe-Bereich). Diese Einträge verbleiben auf deinem Gerät, werden nicht an Dritte übertragen und beim Abmelden bzw. Löschen der Browserdaten entfernt.",
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
