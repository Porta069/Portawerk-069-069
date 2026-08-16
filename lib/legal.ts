// ─── Rechtstexte ─────────────────────────────────────────────────────────────
// Inhaltlich am TATSÄCHLICHEN System ausgerichtet (Stand 2026-08): welche Daten
// wir wirklich erheben, wo sie liegen, welche Dritten beteiligt sind. Wenn sich
// die Anwendung ändert, gehört diese Datei mit geändert — eine
// Datenschutzerklärung, die etwas anderes beschreibt als der Code tut, ist
// schlimmer als keine.
//
// Stellen in [ECKIGEN KLAMMERN] sind gesetzlich verlangte Angaben, die uns
// noch fehlen. Sie sind bewusst NICHT erfunden: eine ausgedachte
// Registernummer oder USt-IdNr wäre eine Falschangabe.
//
// Vor dem Livegang anwaltlich prüfen lassen.
//
//   GET /api/legal/terms → getLegalTerms()

import type { ApiResult } from "./types";

export interface LegalSection {
  id: string;
  title: string;
  /** Absätze — jeweils optional mit Zwischenüberschrift. */
  blocks: { heading?: string; text: string }[];
}

/** Anbieter — an einer Stelle gepflegt, in mehreren Abschnitten verwendet. */
export const ANBIETER = {
  name: "E&H Group",
  strasse: "Rieslingstraße 11",
  plz: "74360",
  ort: "Ilsfeld-Auenstein",
  land: "Deutschland",
  emailAllgemein: "kontakt@porta-werk.de",
  emailDatenschutz: "datenschutz@porta-werk.de",
  domain: "porta-werk.de",
  dachDomain: "porta-jobs.de",
} as const;

/**
 * Fassungsstand der Rechtstexte.
 *
 * Wird bei der Registrierung mit der Zustimmung gespeichert. Nur so lässt sich
 * später belegen, WELCHEM Text jemand zugestimmt hat — ohne das ist eine
 * Zustimmung im Streitfall wertlos. Bei jeder inhaltlichen Änderung erhöhen.
 */
export const RECHTSTEXTE_VERSION = "2026-08-16";

const ANSCHRIFT = `${ANBIETER.name}, ${ANBIETER.strasse}, ${ANBIETER.plz} ${ANBIETER.ort}, ${ANBIETER.land}`;

const LEGAL_SECTIONS: LegalSection[] = [
  {
    id: "impressum",
    title: "Impressum",
    blocks: [
      {
        heading: "Anbieter (Angaben gemäß § 5 DDG)",
        text: `${ANSCHRIFT}. Rechtsform: [RECHTSFORM EINSETZEN, z. B. GmbH / UG (haftungsbeschränkt) / GbR / Einzelunternehmen]. Vertreten durch: [VOR- UND NACHNAME DER VERTRETUNGSBERECHTIGTEN EINSETZEN]. [Falls im Handelsregister eingetragen: Registergericht und Registernummer einsetzen — sonst diesen Satz streichen.]`,
      },
      {
        heading: "Kontakt",
        text: `E-Mail: ${ANBIETER.emailAllgemein}. Anfragen beantworten wir werktags kurzfristig. [TELEFONNUMMER EINSETZEN, sobald vorhanden.] Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [USt-IdNr. EINSETZEN — falls keine erteilt wurde, diesen Satz streichen.]`,
      },
      {
        heading: "Verantwortlich für den Inhalt",
        text: `Inhaltlich verantwortlich gemäß § 18 Abs. 2 MStV: [VOR- UND NACHNAME EINSETZEN], ${ANBIETER.strasse}, ${ANBIETER.plz} ${ANBIETER.ort}.`,
      },
      {
        heading: "Einordnung des Angebots",
        text: `PortaWerk (${ANBIETER.domain}) ist ein Angebot der ${ANBIETER.name} und richtet sich ausschließlich an das Handwerk. Es gehört zum Portfolio von Porta Jobs (${ANBIETER.dachDomain}), tritt aber eigenständig auf; Vertragspartner ist in jedem Fall die ${ANBIETER.name}.`,
      },
      {
        heading: "Streitbeilegung",
        text: "Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. Die frühere Online-Streitbeilegungsplattform der Europäischen Kommission wurde zum 20. Juli 2025 eingestellt; ein Hinweis darauf ist daher nicht mehr erforderlich.",
      },
      {
        heading: "Haftung für Inhalte und Links",
        text: "Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich (§ 7 Abs. 1 DDG). Für Inhalte, die Nutzer:innen oder Betriebe einstellen — insbesondere Stellenanzeigen und Profilangaben — sind wir nicht verantwortlich; wir entfernen sie unverzüglich, sobald uns eine konkrete Rechtsverletzung bekannt wird. Für die Inhalte verlinkter externer Seiten ist deren jeweiliger Anbieter verantwortlich.",
      },
    ],
  },
  {
    id: "datenschutz",
    title: "Datenschutzerklärung",
    blocks: [
      {
        heading: "Verantwortlicher",
        text: `Verantwortlicher im Sinne der DSGVO ist ${ANSCHRIFT}. Datenschutz-Anfragen: ${ANBIETER.emailDatenschutz}. [Eine Datenschutzbeauftragte oder ein Datenschutzbeauftragter ist bislang nicht benannt; die Benennungspflicht nach Art. 37 DSGVO / § 38 BDSG ist zu prüfen, sobald mehr als 20 Personen ständig mit der automatisierten Verarbeitung befasst sind.]`,
      },
      {
        heading: "Welche Daten wir erheben",
        text: "Bei der Registrierung als Handwerker:in: Vor- und Nachname, E-Mail-Adresse, Telefonnummer und ein Passwort (gespeichert wird ausschließlich ein kryptografischer Hash, nie das Passwort selbst). Dazu deine fachlichen Angaben aus dem Fragebogen: Ausbildungsbereich, Ausbildungsstand, Ausbildungsberuf, Aufgabenbereiche mit Berufserfahrung, Jahre an Berufserfahrung, deine Prioritäten für den nächsten Job, Montagebereitschaft, Führerscheinklasse, Deutschkenntnisse und gewünschter Startzeitpunkt. Außerdem deine gewählten Arbeitsorte mit Umkreis und optional ein Profilbild. Bei einer Bewerbung über das Bewerbungsformular zusätzlich das Geburtsjahr (das vollständige Geburtsdatum dient nur der Altersprüfung und wird nicht gespeichert) sowie hochgeladene Unterlagen. Bei Betrieben: Firmen- und Kontaktdaten sowie die Angaben zu Stellen, Anforderungen und Arbeitsbedingungen.",
      },
      {
        heading: "Wofür wir sie verwenden (Zwecke und Rechtsgrundlagen)",
        text: "Die Verarbeitung dient der Jobvermittlung zwischen Handwerker:innen und Betrieben und damit der Durchführung des Nutzungsvertrags (Art. 6 Abs. 1 lit. b DSGVO): Berechnung der Übereinstimmung zwischen deinem Profil und Stellenanzeigen, Anzeige passender Stellen, Übermittlung von Bewerbungen und Jobangeboten. Die Bestätigung von E-Mail und Telefonnummer per Einmalcode sowie Sicherheitsprotokolle stützen sich auf unser berechtigtes Interesse an einem sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO).",
      },
      {
        heading: "Wie das Matching funktioniert — und was es nicht entscheidet",
        text: "Das Matching läuft in zwei Stufen. Zuerst prüfen wir Anforderungen, bei denen es kein Dazwischen gibt: Ausbildungsbereich, Mindest-Ausbildungsstand, geforderte Aufgabenbereiche, Montagebereitschaft, Sprachniveau und — falls für die Stelle nötig — das Vorhandensein eines Führerscheins. Außerdem berücksichtigen wir den Arbeitsradius, den du selbst angegeben hast. Erfüllst du eine dieser Anforderungen nicht, wird dir die Stelle nicht vorgeschlagen; die Jobbörse weist die Zahl der ausgeblendeten Stellen und den jeweiligen Grund aus. In der zweiten Stufe berechnen wir aus den übrigen Angaben einen Übereinstimmungswert, der nur die Reihenfolge bestimmt. Den vollständigen Rechenweg jedes Werts kannst du in der Anwendung einsehen. Es findet keine automatisierte Entscheidung im Sinne des Art. 22 DSGVO statt: Ob es zu Kontakt, Gespräch oder Vertrag kommt, entscheiden ausschließlich Menschen — du und der Betrieb.",
      },
      {
        heading: "Diskretionsprinzip: Weitergabe an Betriebe",
        text: "Betriebe sehen von dir zunächst nur ein anonymisiertes Profil: ein Kürzel statt deines Namens, eine Region statt einer Adresse, dazu die fachlichen Angaben. Deinen Namen und deine Kontaktdaten erhält ein Betrieb erst, wenn du dessen Kontaktanfrage ausdrücklich freigibst oder ein Jobangebot annimmst. Die Freigabe kannst du in jedem Einzelfall verweigern.",
      },
      {
        heading: "Auftragsverarbeiter und Hosting",
        text: "Wir setzen folgende Dienstleister als Auftragsverarbeiter nach Art. 28 DSGVO ein: Vercel Inc. (Auslieferung der Website; Sitz USA — Übermittlung auf Grundlage des EU-US Data Privacy Framework bzw. Standardvertragsklauseln), Render Services Inc. (Anwendungsserver, Region Frankfurt) und Supabase Inc. (Datenbank und Dateispeicher, AWS-Region Irland). Hochgeladene Unterlagen liegen in einem privaten, nicht öffentlich abrufbaren Speicher; Zugriff erfolgt nur über kurzlebige, signierte Links.",
      },
      {
        heading: "Karten, Ortssuche und Fahrzeiten",
        text: "Für die Kartendarstellung laden wir Kartenkacheln von OpenStreetMap (tile.openstreetmap.de); für die Ortssuche und die Umrechnung von Postleitzahlen in Koordinaten nutzen wir Nominatim (openstreetmap.org). Beim Laden dieser Inhalte wird deine IP-Adresse an den jeweiligen Dienst übermittelt. An Nominatim übermitteln wir ausschließlich die Postleitzahl, ohne Namens- oder Kontobezug. Die Fahrzeit auf den Stellenkarten berechnen wir derzeit ausschließlich auf unseren eigenen Servern aus der Luftlinie — es werden dafür keine Standortdaten an Dritte übertragen. Deinen aktuellen Standort verwenden wir nur, wenn du ihn im Browser ausdrücklich freigibst.",
      },
      {
        heading: "Reichweitenmessung",
        text: "Wir verwenden Vercel Web Analytics in der cookielosen Variante: gezählt werden Seitenaufrufe ohne Cookies und ohne geräteübergreifendes Tracking, IP-Adressen werden nicht dauerhaft gespeichert. Rechtsgrundlage ist unser berechtigtes Interesse an der Verbesserung des Angebots (Art. 6 Abs. 1 lit. f DSGVO).",
      },
      {
        heading: "Empfehlungsprogramm",
        text: "Rufst du einen Empfehlungslink auf, prüfen wir, ob der Code zu einem aktiven Partner gehört. Ist das der Fall, zählen wir den Klick mit einer pseudonymisierten (gehashten) IP-Adresse und speichern die Kennung des Partners für 60 Tage in einem Cookie, damit die Empfehlung einer späteren Registrierung zugeordnet werden kann. Registrierst du dich, sieht die werbende Person deinen Vornamen mit abgekürztem Nachnamen sowie deinen Ausbildungsbereich als Fortschrittsanzeige — keine Kontaktdaten. Details zum Cookie stehen im Abschnitt „Cookies & lokale Speicherung“.",
      },
      {
        heading: "Speicherdauer und Löschung",
        text: "Konto- und Profildaten speichern wir, solange dein Konto besteht. Du kannst es jederzeit in den Einstellungen selbst löschen; damit entfallen auch Merkliste, Bewerbungen, Angebote und Kontaktfreigaben. Bewerbungsdatensätze samt Unterlagen unterliegen einer automatisierten Löschfrist von 180 Tagen; sie trägt der zweimonatigen Klagefrist des AGG mit Sicherheitsabstand Rechnung. Einmalcodes und Registrierungsentwürfe werden nach Stunden bzw. Tagen automatisch entfernt, Sicherheitsprotokolle nach längstens einem Jahr. Gesetzliche Aufbewahrungspflichten bleiben unberührt.",
      },
      {
        heading: "Deine Rechte (Art. 15–21 DSGVO)",
        text: `Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. In den Einstellungen kannst du deine Daten jederzeit selbst als Datei exportieren — enthalten sind Kontodaten, alle Fragebogen-Antworten, Merkliste, Bewerbungen, Angebote, Kontaktfreigaben und die Beschreibung eingereichter Unterlagen — und dein Konto löschen. Zusätzlich erreichst du uns unter ${ANBIETER.emailDatenschutz}. Unabhängig davon steht dir ein Beschwerderecht bei einer Aufsichtsbehörde zu; für uns zuständig ist der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg, Lautenschlagerstraße 20, 70173 Stuttgart.`,
      },
    ],
  },
  {
    id: "nutzungsbedingungen",
    title: "Nutzungsbedingungen (AGB)",
    blocks: [
      {
        heading: "Anbieter und Geltungsbereich",
        text: `Diese Bedingungen gelten für die Nutzung von PortaWerk (${ANBIETER.domain}), einem Angebot der ${ANBIETER.name}, ${ANBIETER.strasse}, ${ANBIETER.plz} ${ANBIETER.ort}. PortaWerk ist das Handwerks-Angebot innerhalb des Portfolios Porta Jobs (${ANBIETER.dachDomain}) und tritt eigenständig auf; Vertragspartner ist die ${ANBIETER.name}.`,
      },
      {
        heading: "Zustandekommen des Nutzungsvertrags",
        text: "Der Nutzungsvertrag kommt zustande, wenn du die Registrierung abschließt und dabei diesen Bedingungen sowie der Datenschutzerklärung zustimmst. Zeitpunkt und Fassungsstand der Zustimmung werden bei deinem Konto gespeichert; den Fassungsstand findest du am Ende dieser Bedingungen. Ändern wir die Bedingungen, teilen wir das mit angemessener Frist mit.",
      },
      {
        heading: "Leistung von PortaWerk",
        text: "PortaWerk ist eine Vermittlungsplattform: Wir bringen Handwerker:innen und Betriebe zusammen, berechnen die Übereinstimmung zwischen Profil und Stellenanforderungen und ermöglichen eine diskrete Kontaktaufnahme. Für Handwerker:innen ist die Nutzung kostenlos. Wir sind weder Arbeitsvermittler im Sinne einer Arbeitsverwaltung noch Vertragspartei eines etwaigen Arbeitsverhältnisses.",
      },
      {
        heading: "Kein Anspruch auf Vermittlung",
        text: "Ein Anspruch auf Vermittlung, auf eine bestimmte Anzahl von Angeboten oder auf einen bestimmten Übereinstimmungswert besteht nicht. Stellen, deren zwingende Anforderungen dein Profil nicht erfüllt, werden dir nicht angezeigt. Für Zustandekommen, Inhalt oder Durchführung eines Arbeitsverhältnisses übernehmen wir keine Haftung.",
      },
      {
        heading: "Pflichten der Nutzer:innen",
        text: "Angaben im Profil und in Inseraten müssen wahr, aktuell und eigene sein. Untersagt sind insbesondere: falsche Identitäts- oder Qualifikationsangaben, mehrfache Profile, das Einstellen fremder Daten ohne Berechtigung, automatisiertes Auslesen der Plattform sowie jede Nutzung der über die Plattform erhaltenen Kontaktdaten zu anderen Zwecken als der Anbahnung eines Beschäftigungsverhältnisses.",
      },
      {
        heading: "Pflichten der Betriebe",
        text: "Betriebe sichern zu, Angaben in Inseraten — insbesondere zu Vergütung, Montageanteil, Urlaubstagen und Leistungen — wahrheitsgemäß zu machen. Anforderungen dürfen nicht gegen das Allgemeine Gleichbehandlungsgesetz verstoßen; unzulässig sind namentlich Ausschlüsse, die an Alter, Geschlecht, Herkunft, Religion, Behinderung oder sexuelle Identität anknüpfen. Freigegebene Kontaktdaten sind vertraulich zu behandeln und nach Abschluss oder Abbruch des Verfahrens zu löschen, soweit keine gesetzliche Aufbewahrungspflicht besteht.",
      },
      {
        heading: "Nachweis der Vermittlung",
        text: "Als Nachweis gilt jede über die Plattform vermittelte Kenntnisnahme einer Kandidatin oder eines Kandidaten durch den Betrieb — insbesondere die Freigabe von Kontaktdaten, der Eingang einer Bewerbung oder ein über die Plattform übermitteltes Jobangebot. Der Zeitpunkt des Nachweises wird protokolliert und ist dem Betrieb im Betriebsbereich einsehbar.",
      },
      {
        heading: "Umgehungsverbot (gilt für Betriebe)",
        text: "Kommt es innerhalb von zwölf Monaten nach dem Nachweis zu einer Beschäftigung der nachgewiesenen Person durch den Betrieb, entsteht die vereinbarte Vermittlungsvergütung — und zwar unabhängig davon, ob der weitere Kontakt oder der Vertragsschluss über die Plattform oder außerhalb davon erfolgt ist. Das gilt ebenso, wenn die Beschäftigung bei einem mit dem Betrieb verbundenen Unternehmen im Sinne der §§ 15 ff. AktG zustande kommt, wenn sie in anderer Form als einem Arbeitsverhältnis erfolgt (etwa freie Mitarbeit, Werkvertrag, Arbeitnehmerüberlassung oder Übernahme in ein Ausbildungsverhältnis) oder wenn der Betrieb die über die Plattform erhaltenen Kandidatendaten an Dritte weitergibt und dort eine Beschäftigung zustande kommt. Der Betrieb ist verpflichtet, uns eine solche Beschäftigung innerhalb von 14 Tagen nach Vertragsschluss in Textform anzuzeigen. Diese Regelung dient allein dem Schutz unserer Vergütung; sie beschränkt weder die Auswahlfreiheit des Betriebs noch die Bewerbungs- und Arbeitsplatzwahlfreiheit der Kandidat:innen.",
      },
      {
        heading: "Was Handwerker:innen betrifft — und was nicht",
        text: "Für Handwerker:innen ist die Nutzung kostenlos; von ihnen wird in keinem Fall eine Vermittlungsvergütung verlangt (vgl. § 296 SGB III). Ein Umgehungsverbot im obigen Sinne trifft sie ausdrücklich nicht: Du darfst jede Stelle annehmen, die du willst, auch außerhalb der Plattform und auch bei einem Betrieb, den du hier kennengelernt hast. Wir bitten dich lediglich, uns eine zustande gekommene Vermittlung mitzuteilen — das kostet dich nichts, hilft uns aber bei der Abrechnung und beim Empfehlungsprogramm. Kontaktdaten von Betrieben, die du über die Plattform erhältst, verwendest du bitte nur zur Anbahnung deiner eigenen Beschäftigung und gibst sie nicht an Dritte weiter.",
      },
      {
        heading: "Vermittlungsvergütung",
        text: "Die Vergütung schuldet ausschließlich der Betrieb. Höhe und Fälligkeit ergeben sich aus der mit dem Betrieb getroffenen Vereinbarung bzw. der bei Vertragsschluss geltenden Preisliste. Wird ein Beschäftigungsverhältnis innerhalb der Probezeit aus Gründen beendet, die nicht der Betrieb zu vertreten hat, gilt die jeweils vereinbarte Regelung zur anteiligen Rückerstattung. [KONKRETE PREISE, FÄLLIGKEIT UND RÜCKERSTATTUNGSREGELUNG HIER ODER IN DER PREISLISTE VERBINDLICH FESTLEGEN.]",
      },
      {
        heading: "Empfehlungsprämie",
        text: "Für das Empfehlungsprogramm gilt: Die Prämie entsteht erst mit erfolgreicher Vermittlung der geworbenen Person und wird nach den im Partnerbereich genannten Bedingungen ausgezahlt. Maßgeblich ist die zuletzt veröffentlichte Prämienhöhe. Missbrauch — etwa Selbstwerbung über Zweitkonten oder erfundene Personen — führt zum Verfall der Prämie und zur Sperrung. Prämien sind von der empfangenden Person selbst zu versteuern; wir übernehmen keine steuerliche Beratung. [AUSZAHLUNGSBEDINGUNGEN UND STEUERHINWEIS ANWALTLICH PRÜFEN LASSEN.]",
      },
      {
        heading: "Verfügbarkeit",
        text: "Wir bemühen uns um einen unterbrechungsfreien Betrieb, schulden aber keine bestimmte Verfügbarkeit. Wartungsfenster und Störungen — auch bei eingebundenen Drittdiensten wie Kartenkacheln oder Ortssuche — können die Nutzung vorübergehend einschränken.",
      },
      {
        heading: "Widerrufsrecht für Verbraucher:innen",
        text: "Du hast das Recht, diesen Vertrag binnen 14 Tagen ohne Angabe von Gründen zu widerrufen. Die Frist beginnt mit dem Tag des Vertragsschlusses. Um dein Widerrufsrecht auszuüben, genügt eine eindeutige Erklärung in Textform an " + ANBIETER.emailAllgemein + " oder an " + ANSCHRIFT + ". Zur Wahrung der Frist reicht die rechtzeitige Absendung. Da die Nutzung für dich kostenlos ist, entstehen dir durch den Widerruf keine Kosten; dein Konto und deine Daten werden gelöscht. Unabhängig vom Widerrufsrecht kannst du dein Konto jederzeit in den Einstellungen selbst löschen — das ist der schnellere Weg. [HINWEIS ZUR PRÜFUNG: Seit § 312 Abs. 1a BGB gelten Verbraucherschutzvorschriften auch für Verträge, bei denen statt eines Entgelts personenbezogene Daten bereitgestellt werden. Ob daraus eine Pflicht zur förmlichen Widerrufsbelehrung samt Muster-Widerrufsformular folgt, ist anwaltlich zu klären.]",
      },
      {
        heading: "Haftung",
        text: "Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei der Verletzung von Leben, Körper und Gesundheit. Bei einfacher Fahrlässigkeit haften wir nur für die Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) und begrenzt auf den vertragstypisch vorhersehbaren Schaden. Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt.",
      },
      {
        heading: "Sperrung, Kündigung, Änderungen",
        text: "Bei Verstößen gegen diese Bedingungen können wir Profile und Inserate sperren oder löschen; bei schweren oder wiederholten Verstößen auch dauerhaft. Du kannst dein Konto jederzeit ohne Frist selbst löschen. Änderungen dieser Bedingungen teilen wir mindestens 30 Tage vor Wirksamwerden in Textform mit; widersprichst du nicht bis zum Wirksamwerden, gelten sie als angenommen. Auf dieses Recht und die Folgen des Schweigens weisen wir in der Mitteilung gesondert hin. Widersprichst du, können wir den Vertrag zum Wirksamwerden der Änderung beenden.",
      },
      {
        heading: "Anwendbares Recht und Gerichtsstand",
        text: "Es gilt deutsches Recht. Bist du Verbraucher:in, bleiben zwingende Verbraucherschutzvorschriften deines Aufenthaltsstaates unberührt und es gilt der gesetzliche Gerichtsstand. Ist der Vertragspartner Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist ausschließlicher Gerichtsstand für alle Streitigkeiten aus diesem Vertrag unser Sitz.",
      },
      {
        heading: "Salvatorische Klausel und Fassungsstand",
        text: `Sollte eine Bestimmung dieser Bedingungen unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Fassungsstand dieser Nutzungsbedingungen: ${RECHTSTEXTE_VERSION}.`,
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies & lokale Speicherung",
    blocks: [
      {
        heading: "Keine Werbe- oder Tracking-Cookies",
        text: "PortaWerk setzt keine Werbe-Cookies, kein geräteübergreifendes Tracking und keine Profilbildung zu Werbezwecken. Die Reichweitenmessung (Vercel Web Analytics) arbeitet ohne Cookies.",
      },
      {
        heading: "Cookie für Empfehlungslinks",
        text: "Kommst du über einen gültigen Empfehlungslink, speichern wir ein Cookie mit dem Namen „pw_ref“. Es enthält ausschließlich die Kennung des werbenden Partners, läuft nach 60 Tagen ab und ist für Skripte im Browser nicht auslesbar. Es dient allein dazu, eine Empfehlung einer späteren Registrierung zuzuordnen — also der Abrechnung der Prämie. Wenn du das nicht möchtest, kannst du das Cookie jederzeit in deinem Browser löschen; auf die Nutzung der Plattform hat das keine Auswirkung. [HINWEIS ZUR PRÜFUNG: Ob dieses Cookie nach § 25 Abs. 2 TDDG als „unbedingt erforderlich“ gilt oder eine Einwilligung braucht, ist rechtlich zu bewerten.]",
      },
      {
        heading: "Technisch notwendige lokale Speicherung",
        text: "Für den Betrieb speichert dein Browser lokal (localStorage): deine Anmelde-Sitzung, den Zwischenstand der Registrierung, damit ein Abbruch dich nicht von vorn anfangen lässt, sowie kleine Komfort-Einstellungen wie die zuletzt gesuchte Postleitzahl im Betriebe-Bereich. Diese Einträge verbleiben auf deinem Gerät, werden nicht an Dritte übertragen und beim Abmelden bzw. beim Löschen der Browserdaten entfernt.",
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
