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
// ZWEI TRANSPARENZPFLICHTEN AUS ART. 50 KI-VO (gilt ab 02.08.2026) hängen an
// Funktionen, die es derzeit NICHT gibt. Sie stehen hier, damit sie beim
// Einbau nicht vergessen werden — beide sind Bedingung, nicht Kür:
//
//   1. KI-Chat für Nutzer: Zu Beginn jeder Konversation sichtbar anzeigen
//      „Sie kommunizieren mit einem automatisierten KI-Assistenten." Nicht im
//      Impressum, nicht in der Datenschutzerklärung — im Chatfenster selbst,
//      vor der ersten Nachricht. Im Code gibt es aktuell keinen Chatbot.
//
//   2. KI-generierte Bilder, Videos oder Audios: sichtbar am Medium selbst als
//      „KI-generiert" kennzeichnen. Ob unsere Fotos unter public/images/ davon
//      betroffen sind, lässt sich aus dem Code nicht feststellen — das weiß
//      nur, wer sie beschafft hat.
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
  domain: "werkpair.de",
} as const;

/**
 * Fassungsstand der Rechtstexte.
 *
 * Wird bei der Registrierung mit der Zustimmung gespeichert. Nur so lässt sich
 * später belegen, WELCHEM Text jemand zugestimmt hat — ohne das ist eine
 * Zustimmung im Streitfall wertlos. Bei jeder inhaltlichen Änderung erhöhen.
 */
export const RECHTSTEXTE_VERSION = "2026-08-28";

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
        text: `WerkPair (${ANBIETER.domain}) ist ein Angebot der ${ANBIETER.name} und richtet sich ausschließlich an das Handwerk. Vertragspartner ist in jedem Fall die ${ANBIETER.name}.`,
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
        text: "Bei der Registrierung als Handwerker:in: Vor- und Nachname, E-Mail-Adresse, Telefonnummer und ein Passwort (gespeichert wird ausschließlich ein kryptografischer Hash, nie das Passwort selbst). Dazu deine fachlichen Angaben aus dem Fragebogen: Gewerk, anerkannter Ausbildungsabschluss, aktuelle Berufsbezeichnung, Jahre an Berufserfahrung in dieser Position, ob du Führungsverantwortung trägst, bei einem Studium der Studiengang, bei Meistern und Technikern die Qualifikation, der Ausbildungsberuf, freiwillig deine Aufgabenbereiche mit Erfahrung, deine Wünsche an den neuen Arbeitgeber, Montagebereitschaft, Führerscheinklasse, Deutschkenntnisse, gewünschter Eintrittszeitpunkt sowie — freiwillig — dein Mindest-Gehaltswunsch. Außerdem deine gewählten Arbeitsorte mit Umkreis und optional ein Profilbild. Bei einer Bewerbung über das Bewerbungsformular zusätzlich das Geburtsjahr (das vollständige Geburtsdatum dient nur der Altersprüfung und wird nicht gespeichert) sowie hochgeladene Unterlagen. Bei Betrieben: Firmen- und Kontaktdaten sowie die Angaben zu Stellen, Anforderungen und Arbeitsbedingungen.",
      },
      {
        heading: "Wofür wir sie verwenden (Zwecke und Rechtsgrundlagen)",
        text: "Die Verarbeitung dient der Jobvermittlung zwischen Handwerker:innen und Betrieben und damit der Durchführung des Nutzungsvertrags (Art. 6 Abs. 1 lit. b DSGVO): Berechnung der Übereinstimmung zwischen deinem Profil und Stellenanzeigen, Anzeige passender Stellen, Übermittlung von Bewerbungen und Jobangeboten. Die Bestätigung von E-Mail und Telefonnummer per Einmalcode sowie Sicherheitsprotokolle stützen sich auf unser berechtigtes Interesse an einem sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO).",
      },
      {
        heading: "Wie das Matching funktioniert — und was es nicht entscheidet",
        text: "Das Matching läuft in zwei Stufen. Zuerst prüfen wir Anforderungen, bei denen es kein Dazwischen gibt: Gewerk, Mindestabschluss, geforderte Aufgabenbereiche, verlangte Führungsverantwortung, Montagebereitschaft, Sprachniveau, — falls für die Stelle nötig — das Vorhandensein eines Führerscheins und, sofern du einen Mindest-Gehaltswunsch angegeben hast, ob das Budget der Stelle deutlich darunter liegt. Außerdem berücksichtigen wir den Arbeitsradius, den du selbst angegeben hast. Erfüllst du eine dieser Anforderungen nicht, wird dir die Stelle nicht vorgeschlagen; die Jobbörse weist die Zahl der ausgeblendeten Stellen und den jeweiligen Grund aus. In der zweiten Stufe berechnen wir aus den übrigen Angaben einen Übereinstimmungswert, der nur die Reihenfolge bestimmt. Den vollständigen Rechenweg jedes Werts kannst du in der Anwendung einsehen. Es findet keine automatisierte Entscheidung im Sinne des Art. 22 DSGVO statt: Ob es zu Kontakt, Gespräch oder Vertrag kommt, entscheiden ausschließlich Menschen — du und der Betrieb.",
      },
      {
        heading: "Einsatz von Künstlicher Intelligenz (KI)",
        text: `Zur effizienteren Erbringung unserer Vermittlungsleistungen setzen wir KI-gestützte Systeme (auf Basis großer Sprachmodelle; Anbieter: Anthropic) ein. Diese unterstützen uns insbesondere dabei, passende Stellen für Bewerber vorzuschlagen und zu priorisieren (Matching), Kommunikationsentwürfe (z. B. E-Mails) für unsere Mitarbeiter zu erstellen sowie Informationen zusammenzufassen.

Verarbeitet werden die von Ihnen bereitgestellten Profil- und Bewerbungsdaten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Anbahnung/Erfüllung des Vertrags) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer effizienten Vermittlung).

Alle KI-Ergebnisse werden vor einer Verwendung durch unsere Mitarbeiter geprüft und freigegeben. Eine ausschließlich automatisierte Entscheidung mit rechtlicher oder ähnlich erheblicher Wirkung Ihnen gegenüber im Sinne von Art. 22 DSGVO findet nicht statt — über Vermittlungen entscheidet stets ein Mensch.

Der KI-Anbieter verarbeitet die Daten als Auftragsverarbeiter auf Grundlage eines Vertrags zur Auftragsverarbeitung; eine Nutzung Ihrer Daten zum Training der KI-Modelle erfolgt nicht. Ihre Rechte (Auskunft, Berichtigung, Löschung, Widerspruch) bleiben unberührt.

Verantwortlich: ${ANBIETER.name}, ${ANBIETER.strasse}, ${ANBIETER.plz} ${ANBIETER.ort}.`,
      },
      {
        heading: "Diskretionsprinzip: Weitergabe an Betriebe",
        text: "Betriebe sehen von dir zunächst nur ein anonymisiertes Profil: ein Kürzel statt deines Namens, eine Region statt einer Adresse, dazu die fachlichen Angaben. Deinen Namen und deine Kontaktdaten erhält ein Betrieb erst, wenn du dessen Kontaktanfrage ausdrücklich freigibst oder ein Jobangebot annimmst. Die Freigabe kannst du in jedem Einzelfall verweigern.",
      },
      {
        heading: "Auftragsverarbeiter und Hosting",
        text: "Wir setzen folgende Dienstleister als Auftragsverarbeiter nach Art. 28 DSGVO ein: Vercel Inc. (Auslieferung der Website; Sitz USA — Übermittlung auf Grundlage des EU-US Data Privacy Framework bzw. Standardvertragsklauseln), Render Services Inc. (Anwendungsserver, Region Frankfurt) und Supabase Inc. (Datenbank und Dateispeicher, AWS-Region Irland) und Anthropic PBC (KI-gestützte Auswertung und Textentwürfe — siehe Abschnitt „Einsatz von Künstlicher Intelligenz (KI)“). Hochgeladene Unterlagen liegen in einem privaten, nicht öffentlich abrufbaren Speicher; Zugriff erfolgt nur über kurzlebige, signierte Links.",
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
        heading: "Server-Protokolle",
        text: "Beim Aufruf der Seiten und beim Zugriff auf unsere Schnittstelle fallen bei den eingesetzten Hosting-Anbietern technische Protokolle an (IP-Adresse, Zeitpunkt, aufgerufene Adresse, Browserkennung). Sie dienen dem sicheren Betrieb und der Fehlersuche und werden vom jeweiligen Anbieter nach kurzer Frist gelöscht. In unserem eigenen Sicherheitsprotokoll speichern wir IP-Adressen ausschließlich als nicht rückrechenbaren, mit einem geheimen Schlüssel gebildeten Hashwert.",
      },
      {
        heading: "E-Mail- und SMS-Versand",
        text: "Für Bestätigungscodes und Systemnachrichten setzen wir Versanddienstleister als Auftragsverarbeiter ein, sobald der produktive Versand aktiviert ist; übermittelt werden dabei die jeweilige E-Mail-Adresse oder Mobilnummer und der Nachrichteninhalt. [VERSANDDIENSTLEISTER NAMENTLICH EINSETZEN, sobald der Versand scharf geschaltet ist — derzeit werden Codes nicht versendet.]",
      },
      {
        heading: "Datensicherheit",
        text: "Die Übertragung erfolgt durchgängig verschlüsselt (TLS). Passwörter speichern wir ausschließlich als scrypt-Hash, niemals im Klartext. Hochgeladene Unterlagen liegen in einem privaten Speicher und sind nur über kurzlebige, signierte Links erreichbar. Zugriffe auf sicherheitsrelevante Vorgänge werden protokolliert. Sitzungen lassen sich durch Passwortwechsel oder Abmelden sofort ungültig machen.",
      },
      {
        heading: "Bereitstellungspflicht (Art. 13 Abs. 2 lit. e DSGVO)",
        text: "Die Angaben zu Name, E-Mail-Adresse, Telefonnummer und Passwort sind für den Vertragsschluss erforderlich — ohne sie können wir kein Konto anlegen. Die fachlichen Angaben des Fragebogens sind rechtlich freiwillig, praktisch aber die Grundlage der Vermittlung: Ohne sie können wir dir keine passenden Stellen zuordnen, und unvollständige Profile werden seltener vorgeschlagen. Ein Profilbild ist vollständig freiwillig.",
      },
      {
        heading: "Minderjährige",
        text: "Unser Angebot richtet sich auch an Auszubildende und damit möglicherweise an Minderjährige. Wer noch nicht 18 Jahre alt ist, benötigt für den Nutzungsvertrag die Zustimmung der Erziehungsberechtigten (§§ 107 ff. BGB). Wir erheben derzeit kein Geburtsdatum bei der Registrierung und können das Alter deshalb nicht prüfen. [HINWEIS ZUR PRÜFUNG: Ob eine Altersabfrage bei der Registrierung eingeführt werden muss — auch mit Blick auf Art. 8 DSGVO und das Jugendarbeitsschutzgesetz — ist zu klären. Bis dahin gilt: Erfahren wir, dass ein Konto ohne die erforderliche Zustimmung angelegt wurde, löschen wir es.]",
      },
      {
        heading: "Widerspruchsrecht (Art. 21 DSGVO)",
        text: `Soweit wir Daten auf Grundlage berechtigter Interessen verarbeiten — das betrifft die Sicherheitsprotokolle, die Bestätigung von Kontaktdaten und die cookielose Reichweitenmessung — hast du das Recht, dieser Verarbeitung jederzeit aus Gründen zu widersprechen, die sich aus deiner besonderen Situation ergeben. Wir verarbeiten die Daten dann nicht weiter, es sei denn, wir können zwingende schutzwürdige Gründe nachweisen. Der Widerspruch genügt formlos an ${ANBIETER.emailDatenschutz}.`,
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
        text: `Diese Bedingungen gelten für die Nutzung von WerkPair (${ANBIETER.domain}), einem Angebot der ${ANBIETER.name}, ${ANBIETER.strasse}, ${ANBIETER.plz} ${ANBIETER.ort}. Vertragspartner ist die ${ANBIETER.name}.`,
      },
      {
        heading: "Zustandekommen des Nutzungsvertrags",
        text: "Der Nutzungsvertrag kommt zustande, wenn du die Registrierung abschließt und dabei diesen Bedingungen sowie der Datenschutzerklärung zustimmst. Zeitpunkt und Fassungsstand der Zustimmung werden bei deinem Konto gespeichert; den Fassungsstand findest du am Ende dieser Bedingungen. Ändern wir die Bedingungen, teilen wir das mit angemessener Frist mit.",
      },
      {
        heading: "Leistung von WerkPair",
        text: "WerkPair ist eine Vermittlungsplattform: Wir bringen Handwerker:innen und Betriebe zusammen, berechnen die Übereinstimmung zwischen Profil und Stellenanforderungen und ermöglichen eine diskrete Kontaktaufnahme. Für Handwerker:innen ist die Nutzung kostenlos. Wir sind weder Arbeitsvermittler im Sinne einer Arbeitsverwaltung noch Vertragspartei eines etwaigen Arbeitsverhältnisses.",
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
        heading: "Mindestalter und Minderjährige",
        text: "Für den Abschluss des Nutzungsvertrags musst du geschäftsfähig sein. Bist du noch nicht 18 Jahre alt, brauchst du die Zustimmung deiner Erziehungsberechtigten; mit der Registrierung bestätigst du, dass diese vorliegt. Erfahren wir, dass sie fehlt, können wir das Konto sperren oder löschen.",
      },
      {
        heading: "Zulässige Anforderungen in Inseraten",
        text: "Anforderungen dürfen nur gestellt werden, soweit sie für die konkrete Tätigkeit sachlich erforderlich sind. Das gilt besonders für das geforderte Sprachniveau: Es darf sich nur an dem orientieren, was die Arbeit tatsächlich verlangt — ein pauschal hoch angesetztes Niveau kann eine mittelbare Benachteiligung wegen der ethnischen Herkunft darstellen (§ 3 Abs. 2 AGG). Betriebe tragen für ihre Anforderungen die Verantwortung; wir stellen lediglich das Werkzeug bereit und behalten uns vor, offensichtlich unzulässige Inserate zu entfernen.",
      },
      {
        heading: "Inhalte der Nutzer:innen",
        text: "Für eingestellte Inhalte — Profilangaben, Inserate, Logos, Bilder und Unterlagen — bleibst du verantwortlich. Du sicherst zu, dass du die erforderlichen Rechte hast und keine Rechte Dritter verletzt. Du räumst uns das einfache, räumlich unbeschränkte und auf die Dauer der Veröffentlichung begrenzte Recht ein, diese Inhalte zum Betrieb der Plattform zu speichern, anzuzeigen und an die jeweils vorgesehenen Empfänger zu übermitteln. Weitergehende Rechte erwerben wir nicht. Nimmst du Inhalte zurück oder löschst dein Konto, endet dieses Recht.",
      },
      {
        heading: "Freistellung",
        text: "Verletzt du mit eingestellten Inhalten oder mit der Nutzung der Plattform Rechte Dritter, stellst du uns von den daraus entstehenden Ansprüchen frei, soweit du die Verletzung zu vertreten hast. Das umfasst die Kosten einer angemessenen Rechtsverteidigung. Wir informieren dich unverzüglich über geltend gemachte Ansprüche und geben dir Gelegenheit zur Stellungnahme.",
      },
      {
        heading: "Vertragssprache und Vertragstext",
        text: "Vertragssprache ist Deutsch. Den Text dieser Bedingungen speichern wir mit dem Fassungsstand, dem du zugestimmt hast; du kannst ihn jederzeit auf dieser Seite abrufen und über deinen Datenexport nachvollziehen, welcher Fassung du wann zugestimmt hast.",
      },
      {
        heading: "Laufzeit und Kündigung",
        text: "Der Nutzungsvertrag läuft auf unbestimmte Zeit. Du kannst ihn jederzeit ohne Frist beenden, indem du dein Konto löschst. Wir können ihn mit einer Frist von 30 Tagen in Textform kündigen; das Recht zur außerordentlichen Kündigung aus wichtigem Grund — insbesondere bei erheblichen Verstößen gegen diese Bedingungen — bleibt unberührt.",
      },
      {
        heading: "Höhere Gewalt",
        text: "Ereignisse außerhalb unseres Einflussbereichs — etwa Ausfälle von Strom- oder Netzinfrastruktur, Störungen bei eingesetzten Dienstleistern, Naturereignisse, Streiks oder behördliche Anordnungen — befreien uns für ihre Dauer von der Leistungspflicht. Dauert die Störung länger als 30 Tage, können beide Seiten den Vertrag beenden.",
      },
      {
        heading: "Übertragung des Vertrags",
        text: "Wir dürfen unsere Rechte und Pflichten aus diesem Vertrag auf ein verbundenes Unternehmen oder einen Rechtsnachfolger übertragen; in diesem Fall informieren wir dich rechtzeitig in Textform und du kannst den Vertrag zum Zeitpunkt der Übertragung beenden. Du kannst deine Rechte aus diesem Vertrag nur mit unserer Zustimmung übertragen; dein Konto ist nicht übertragbar.",
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
    id: "barrierefreiheit",
    title: "Barrierefreiheit",
    blocks: [
      {
        heading: "Warum das hier steht",
        text: "Seit dem 28. Juni 2025 verpflichtet das Barrierefreiheitsstärkungsgesetz (BFSG) Anbieter bestimmter digitaler Dienstleistungen für Verbraucher:innen dazu, diese barrierefrei anzubieten und darüber zu informieren. Wir gehen davon aus, dass unser Angebot darunter fällt, und machen den Stand deshalb offen.",
      },
      {
        heading: "Aktueller Stand",
        text: "Die Plattform ist derzeit NICHT vollständig barrierefrei. Aus einer internen Prüfung sind uns Einschränkungen bekannt, unter anderem bei der Bedienbarkeit ausschließlich über die Tastatur, bei der Beschriftung einzelner Bedienelemente für Screenreader, bei Farbkontrasten und bei Rückmeldungen an Hilfstechnologien. Wir arbeiten an der Behebung. Eine vollständige Bewertung nach EN 301 549 / WCAG 2.1 AA steht noch aus. [PRÜFBERICHT UND ZEITPLAN ERGÄNZEN, sobald die Bewertung vorliegt.]",
      },
      {
        heading: "Barriere melden",
        text: `Stößt du auf eine Barriere, schreib uns an ${ANBIETER.emailAllgemein} — bitte mit der Seite, dem verwendeten Gerät und, wenn möglich, der eingesetzten Hilfstechnologie. Wir melden uns zurück und nennen dir, wie wir damit umgehen. Wird eine Barriere nicht behoben, kannst du dich an die Marktüberwachungsstelle der Länder für die Barrierefreiheit von Produkten und Dienstleistungen (MLBF) wenden.`,
      },
      {
        heading: "Alternative Wege",
        text: `Solange einzelne Funktionen nicht barrierefrei erreichbar sind, helfen wir persönlich weiter: Schreib uns an ${ANBIETER.emailAllgemein}, und wir nehmen deine Angaben auf anderem Weg auf oder führen dich telefonisch bzw. schriftlich durch den Vorgang.`,
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies & lokale Speicherung",
    blocks: [
      {
        heading: "Keine Werbe- oder Tracking-Cookies",
        text: "WerkPair setzt keine Werbe-Cookies, kein geräteübergreifendes Tracking und keine Profilbildung zu Werbezwecken. Die Reichweitenmessung (Vercel Web Analytics) arbeitet ohne Cookies.",
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
