// ─── Texte der Transaktionsmails ─────────────────────────────────────────────
// Je Mail zwei Fassungen: `du` für Handwerker, `sie` für Betriebe — genau wie
// in der Anwendung. Platzhalter in {{doppelten Klammern}} setzt das Backend.
//
// Sicherheitsangaben bewusst nur mit Zeitpunkt, ohne IP und Gerät (so
// entschieden) — das Backend muss dafür kein zusätzliches Feld liefern.

/** @typedef {{ eyebrow: string, titel: string, absaetze: string[], cta?: {label: string, platzhalter: string}, hinweis?: string, warnung?: string, liste?: string[], ablauf?: string }} Fassung */

export const MAILS = [
  // ── 1 ──────────────────────────────────────────────────────────────────────
  {
    slug: "passwort-zuruecksetzen",
    name: "Passwort zurücksetzen",
    betreff: {
      du: "Passwort zurücksetzen — dein Link von WerkPair",
      sie: "Passwort zurücksetzen — Ihr Link von WerkPair",
    },
    preheader: {
      du: "Der Link ist {{gueltig_minuten}} Minuten gültig.",
      sie: "Der Link ist {{gueltig_minuten}} Minuten gültig.",
    },
    du: {
      eyebrow: "Passwort",
      titel: "Setz dein Passwort neu",
      absaetze: [
        "Hallo {{vorname}}, für dein WerkPair-Konto wurde am {{zeitpunkt}} ein neues Passwort angefordert.",
        "Klick auf den Knopf, dann kannst du direkt ein neues vergeben.",
      ],
      cta: { label: "Neues Passwort vergeben", platzhalter: "{{link}}" },
      ablauf: "Der Link ist {{gueltig_minuten}} Minuten gültig und lässt sich nur einmal verwenden.",
      warnung:
        "Warst du das nicht? Dann ignorier diese E-Mail — dein Passwort bleibt unverändert. Wenn dir das öfter passiert, meld dich bei uns.",
    },
    sie: {
      eyebrow: "Passwort",
      titel: "Setzen Sie Ihr Passwort neu",
      absaetze: [
        "Guten Tag {{vorname}}, für Ihr WerkPair-Konto wurde am {{zeitpunkt}} ein neues Passwort angefordert.",
        "Klicken Sie auf den Knopf, um ein neues Passwort zu vergeben.",
      ],
      cta: { label: "Neues Passwort vergeben", platzhalter: "{{link}}" },
      ablauf: "Der Link ist {{gueltig_minuten}} Minuten gültig und nur einmal verwendbar.",
      warnung:
        "Waren Sie das nicht? Dann ignorieren Sie diese E-Mail — Ihr Passwort bleibt unverändert. Sollte das wiederholt vorkommen, melden Sie sich bei uns.",
    },
  },

  // ── 2 ──────────────────────────────────────────────────────────────────────
  {
    slug: "passwort-geaendert",
    name: "Passwort wurde geändert",
    betreff: {
      du: "Dein Passwort wurde geändert",
      sie: "Ihr Passwort wurde geändert",
    },
    preheader: {
      du: "Am {{zeitpunkt}} — warst du das nicht, handle bitte sofort.",
      sie: "Am {{zeitpunkt}} — waren Sie das nicht, handeln Sie bitte sofort.",
    },
    du: {
      eyebrow: "Sicherheit",
      titel: "Dein Passwort wurde geändert",
      absaetze: [
        "Hallo {{vorname}}, das Passwort deines WerkPair-Kontos wurde am {{zeitpunkt}} geändert.",
        "Wenn du das selbst warst, ist alles in Ordnung — du musst nichts weiter tun.",
      ],
      warnung:
        "Warst du das nicht? Dann ist dein Konto möglicherweise fremd genutzt worden. Setz sofort ein neues Passwort und schreib uns an {{email_support}}.",
      cta: { label: "Passwort zurücksetzen", platzhalter: "{{link}}" },
      hinweis: "Wir fragen dich niemals per E-Mail nach deinem Passwort.",
    },
    sie: {
      eyebrow: "Sicherheit",
      titel: "Ihr Passwort wurde geändert",
      absaetze: [
        "Guten Tag {{vorname}}, das Passwort Ihres WerkPair-Kontos wurde am {{zeitpunkt}} geändert.",
        "Waren Sie das selbst, ist alles in Ordnung — es sind keine weiteren Schritte nötig.",
      ],
      warnung:
        "Waren Sie das nicht? Dann wurde Ihr Konto möglicherweise fremd genutzt. Setzen Sie umgehend ein neues Passwort und schreiben Sie uns an {{email_support}}.",
      cta: { label: "Passwort zurücksetzen", platzhalter: "{{link}}" },
      hinweis: "Wir fragen Sie niemals per E-Mail nach Ihrem Passwort.",
    },
  },

  // ── 3 ──────────────────────────────────────────────────────────────────────
  {
    slug: "email-aendern",
    name: "E-Mail-Adresse ändern (Bestätigung)",
    betreff: {
      du: "Bestätige deine neue E-Mail-Adresse",
      sie: "Bestätigen Sie Ihre neue E-Mail-Adresse",
    },
    preheader: {
      du: "Ein Klick, dann gilt {{email_neu}}.",
      sie: "Ein Klick, dann gilt {{email_neu}}.",
    },
    du: {
      eyebrow: "E-Mail-Adresse",
      titel: "Bestätige deine neue Adresse",
      absaetze: [
        "Hallo {{vorname}}, du möchtest die E-Mail-Adresse deines Kontos ändern — von {{email_alt}} auf {{email_neu}}.",
        "Damit niemand Fremdes das tun kann, brauchen wir eine Bestätigung von der neuen Adresse.",
      ],
      cta: { label: "Neue Adresse bestätigen", platzhalter: "{{link}}" },
      ablauf: "Der Link ist {{gueltig_minuten}} Minuten gültig. Bis zur Bestätigung bleibt deine bisherige Adresse aktiv.",
      warnung:
        "Warst du das nicht? Dann klick nicht auf den Knopf und schreib uns an {{email_support}}. Ohne Bestätigung ändert sich nichts.",
    },
    sie: {
      eyebrow: "E-Mail-Adresse",
      titel: "Bestätigen Sie Ihre neue Adresse",
      absaetze: [
        "Guten Tag {{vorname}}, Sie möchten die E-Mail-Adresse Ihres Kontos ändern — von {{email_alt}} auf {{email_neu}}.",
        "Damit das niemand Fremdes veranlassen kann, benötigen wir eine Bestätigung von der neuen Adresse.",
      ],
      cta: { label: "Neue Adresse bestätigen", platzhalter: "{{link}}" },
      ablauf: "Der Link ist {{gueltig_minuten}} Minuten gültig. Bis zur Bestätigung bleibt Ihre bisherige Adresse aktiv.",
      warnung:
        "Waren Sie das nicht? Klicken Sie den Knopf nicht an und schreiben Sie uns an {{email_support}}. Ohne Bestätigung ändert sich nichts.",
    },
  },

  // ── 4 ──────────────────────────────────────────────────────────────────────
  {
    slug: "email-geaendert",
    name: "E-Mail-Adresse wurde geändert",
    betreff: {
      du: "Deine E-Mail-Adresse wurde geändert",
      sie: "Ihre E-Mail-Adresse wurde geändert",
    },
    preheader: {
      du: "Ab sofort gilt {{email_neu}}.",
      sie: "Ab sofort gilt {{email_neu}}.",
    },
    du: {
      eyebrow: "Sicherheit",
      titel: "Deine E-Mail-Adresse wurde geändert",
      absaetze: [
        "Hallo {{vorname}}, die E-Mail-Adresse deines WerkPair-Kontos wurde am {{zeitpunkt}} geändert.",
        "Ab sofort erreichen wir dich unter {{email_neu}}. Diese Nachricht geht zur Sicherheit auch an deine bisherige Adresse {{email_alt}}.",
      ],
      warnung:
        "Warst du das nicht? Dann melde dich sofort bei {{email_support}} — wir machen die Änderung rückgängig und sichern dein Konto.",
      hinweis: "Deine Anmeldung funktioniert ab jetzt nur noch mit der neuen Adresse.",
    },
    sie: {
      eyebrow: "Sicherheit",
      titel: "Ihre E-Mail-Adresse wurde geändert",
      absaetze: [
        "Guten Tag {{vorname}}, die E-Mail-Adresse Ihres WerkPair-Kontos wurde am {{zeitpunkt}} geändert.",
        "Ab sofort erreichen wir Sie unter {{email_neu}}. Diese Nachricht geht zur Sicherheit auch an Ihre bisherige Adresse {{email_alt}}.",
      ],
      warnung:
        "Waren Sie das nicht? Melden Sie sich umgehend bei {{email_support}} — wir machen die Änderung rückgängig und sichern Ihr Konto.",
      hinweis: "Die Anmeldung funktioniert ab sofort nur noch mit der neuen Adresse.",
    },
  },

  // ── 5 ──────────────────────────────────────────────────────────────────────
  {
    slug: "nutzungsbedingungen-aenderung",
    name: "Nutzungsbedingungen werden geändert",
    betreff: {
      du: "Wir ändern unsere Nutzungsbedingungen zum {{inkrafttreten}}",
      sie: "Wir ändern unsere Nutzungsbedingungen zum {{inkrafttreten}}",
    },
    preheader: {
      du: "Was sich ändert, in drei Punkten — und was du tun kannst.",
      sie: "Was sich ändert, in drei Punkten — und was Sie tun können.",
    },
    du: {
      eyebrow: "Nutzungsbedingungen",
      titel: "Unsere Bedingungen ändern sich",
      absaetze: [
        "Hallo {{vorname}}, zum {{inkrafttreten}} gilt eine neue Fassung unserer Nutzungsbedingungen (Fassung {{version}}).",
        "Das ändert sich konkret:",
      ],
      liste: ["{{aenderung_1}}", "{{aenderung_2}}", "{{aenderung_3}}"],
      cta: { label: "Neue Fassung lesen", platzhalter: "{{link}}" },
      ablauf:
        "Du kannst den Änderungen bis zum {{widerspruch_frist}} widersprechen. Widersprichst du nicht und nutzt dein Konto weiter, gelten sie ab dem {{inkrafttreten}}.",
      hinweis:
        "Wenn du nicht einverstanden bist, kannst du dein Konto jederzeit kostenlos löschen — schreib uns dazu an {{email_support}}.",
    },
    sie: {
      eyebrow: "Nutzungsbedingungen",
      titel: "Unsere Bedingungen ändern sich",
      absaetze: [
        "Guten Tag {{vorname}}, zum {{inkrafttreten}} gilt eine neue Fassung unserer Nutzungsbedingungen (Fassung {{version}}).",
        "Das ändert sich konkret:",
      ],
      liste: ["{{aenderung_1}}", "{{aenderung_2}}", "{{aenderung_3}}"],
      cta: { label: "Neue Fassung lesen", platzhalter: "{{link}}" },
      ablauf:
        "Sie können den Änderungen bis zum {{widerspruch_frist}} widersprechen. Widersprechen Sie nicht und nutzen Ihr Konto weiter, gelten sie ab dem {{inkrafttreten}}.",
      hinweis:
        "Sind Sie nicht einverstanden, können Sie Ihr Konto jederzeit kostenfrei löschen — schreiben Sie uns an {{email_support}}.",
    },
  },

  // ── 6 ──────────────────────────────────────────────────────────────────────
  {
    slug: "email-verifizierung",
    name: "E-Mail-Verifizierung",
    betreff: {
      du: "Bestätige deine E-Mail-Adresse",
      sie: "Bestätigen Sie Ihre E-Mail-Adresse",
    },
    preheader: {
      du: "Ein Klick, dann bist du startklar.",
      sie: "Ein Klick, dann sind Sie startklar.",
    },
    du: {
      eyebrow: "Willkommen",
      titel: "Nur noch ein Klick",
      absaetze: [
        "Hallo {{vorname}}, schön dass du dabei bist. Bestätige kurz deine E-Mail-Adresse, dann ist dein Profil aktiv.",
        "Danach melden sich passende Betriebe direkt bei dir — deine Daten sieht niemand, bevor du zustimmst.",
      ],
      cta: { label: "E-Mail-Adresse bestätigen", platzhalter: "{{link}}" },
      ablauf: "Der Link ist {{gueltig_stunden}} Stunden gültig.",
      hinweis:
        "Du hast dich nicht bei WerkPair registriert? Dann ignorier diese E-Mail — ohne Bestätigung wird kein Profil aktiv.",
    },
    sie: {
      eyebrow: "Willkommen",
      titel: "Nur noch ein Klick",
      absaetze: [
        "Guten Tag {{vorname}}, willkommen bei WerkPair. Bestätigen Sie kurz Ihre E-Mail-Adresse, dann ist Ihr Zugang aktiv.",
        "Danach können Sie Fachkräfte in Ihrem Umkreis suchen und anfragen.",
      ],
      cta: { label: "E-Mail-Adresse bestätigen", platzhalter: "{{link}}" },
      ablauf: "Der Link ist {{gueltig_stunden}} Stunden gültig.",
      hinweis:
        "Sie haben sich nicht bei WerkPair registriert? Dann ignorieren Sie diese E-Mail — ohne Bestätigung wird kein Zugang aktiv.",
    },
  },

  // ── 7 ──────────────────────────────────────────────────────────────────────
  {
    slug: "account-gesperrt",
    name: "Konto gesperrt (Verstoß)",
    betreff: {
      du: "Dein WerkPair-Konto wurde gesperrt",
      sie: "Ihr WerkPair-Konto wurde gesperrt",
    },
    preheader: {
      du: "Grund, Regel und Widerspruchsweg in dieser Nachricht.",
      sie: "Grund, Regel und Widerspruchsweg in dieser Nachricht.",
    },
    du: {
      eyebrow: "Kontostatus",
      titel: "Dein Konto wurde gesperrt",
      absaetze: [
        "Hallo {{vorname}}, wir haben dein WerkPair-Konto am {{zeitpunkt}} gesperrt.",
        "Grund: {{grund}}",
        "Damit verstößt die Nutzung gegen {{regel}} unserer Nutzungsbedingungen.",
      ],
      liste: [
        "Dein Profil ist für Betriebe nicht mehr sichtbar.",
        "Laufende Anfragen und Angebote sind pausiert.",
        "Deine Daten bleiben gespeichert, solange die Sperre geprüft wird.",
      ],
      cta: { label: "Widerspruch einlegen", platzhalter: "{{link}}" },
      ablauf:
        "Du kannst der Sperre bis zum {{widerspruch_frist}} widersprechen. Schreib uns dazu an {{email_support}} — wir prüfen jeden Fall persönlich und melden uns zurück.",
      hinweis:
        "Hältst du die Sperre für einen Irrtum, sag es uns. Fehler passieren, und wir heben Sperren auf, wenn sie unberechtigt waren.",
    },
    sie: {
      eyebrow: "Kontostatus",
      titel: "Ihr Konto wurde gesperrt",
      absaetze: [
        "Guten Tag {{vorname}}, wir haben Ihr WerkPair-Konto am {{zeitpunkt}} gesperrt.",
        "Grund: {{grund}}",
        "Damit verstößt die Nutzung gegen {{regel}} unserer Nutzungsbedingungen.",
      ],
      liste: [
        "Ihre Inserate sind nicht mehr sichtbar.",
        "Laufende Anfragen sind pausiert.",
        "Ihre Daten bleiben gespeichert, solange die Sperre geprüft wird.",
      ],
      cta: { label: "Widerspruch einlegen", platzhalter: "{{link}}" },
      ablauf:
        "Sie können der Sperre bis zum {{widerspruch_frist}} widersprechen. Schreiben Sie uns an {{email_support}} — wir prüfen jeden Fall persönlich und melden uns zurück.",
      hinweis:
        "Halten Sie die Sperre für einen Irrtum, teilen Sie uns das mit. Wir heben Sperren auf, wenn sie unberechtigt waren.",
    },
  },

  // ── 8 ──────────────────────────────────────────────────────────────────────
  {
    slug: "account-geloescht",
    name: "Konto gelöscht (mit Grund)",
    betreff: {
      du: "Dein WerkPair-Konto wurde gelöscht",
      sie: "Ihr WerkPair-Konto wurde gelöscht",
    },
    preheader: {
      du: "Was gelöscht wurde, was bleibt — und warum.",
      sie: "Was gelöscht wurde, was bleibt — und warum.",
    },
    du: {
      eyebrow: "Kontostatus",
      titel: "Dein Konto wurde gelöscht",
      absaetze: [
        "Hallo {{vorname}}, dein WerkPair-Konto wurde am {{zeitpunkt}} gelöscht.",
        "Grund: {{grund}}",
      ],
      liste: [
        "Profil, Lebenslauf und Unterlagen sind entfernt.",
        "Laufende Anfragen und Angebote sind beendet.",
        "Betriebe können dich nicht mehr finden oder kontaktieren.",
        "Abrechnungsdaten bewahren wir gesetzlich bedingt {{aufbewahrung}} auf, danach werden auch sie gelöscht.",
      ],
      hinweis:
        "Du kannst dich jederzeit neu registrieren — es entsteht dann ein frisches Profil ohne deine früheren Daten.",
      ablauf:
        "Fragen zur Löschung beantworten wir unter {{email_datenschutz}}.",
    },
    sie: {
      eyebrow: "Kontostatus",
      titel: "Ihr Konto wurde gelöscht",
      absaetze: [
        "Guten Tag {{vorname}}, Ihr WerkPair-Konto wurde am {{zeitpunkt}} gelöscht.",
        "Grund: {{grund}}",
      ],
      liste: [
        "Unternehmensprofil und Inserate sind entfernt.",
        "Laufende Anfragen sind beendet.",
        "Fachkräfte können Sie nicht mehr finden oder kontaktieren.",
        "Abrechnungsdaten bewahren wir gesetzlich bedingt {{aufbewahrung}} auf, danach werden auch sie gelöscht.",
      ],
      hinweis:
        "Sie können sich jederzeit neu registrieren — es entsteht dann ein frisches Profil ohne Ihre früheren Daten.",
      ablauf: "Fragen zur Löschung beantworten wir unter {{email_datenschutz}}.",
    },
  },

  // ── 9 ──────────────────────────────────────────────────────────────────────
  {
    slug: "daten-export",
    name: "Datenexport bereit",
    betreff: {
      du: "Dein Datenexport ist bereit",
      sie: "Ihr Datenexport ist bereit",
    },
    preheader: {
      du: "Download {{ablauf_tage}} Tage verfügbar.",
      sie: "Download {{ablauf_tage}} Tage verfügbar.",
    },
    du: {
      eyebrow: "Datenschutz",
      titel: "Dein Datenexport ist bereit",
      absaetze: [
        "Hallo {{vorname}}, du hast am {{zeitpunkt}} eine Kopie deiner Daten angefordert. Sie liegt jetzt zum Download bereit.",
        "Die Datei enthält alles, was wir zu dir gespeichert haben — Profil, Antworten, Arbeitsorte, Anfragen und Nachrichten.",
      ],
      cta: { label: "Daten herunterladen", platzhalter: "{{download_link}}" },
      ablauf:
        "Der Download ist {{ablauf_tage}} Tage verfügbar, danach löschen wir die Datei automatisch. Du kannst jederzeit einen neuen Export anfordern.",
      warnung:
        "Die Datei enthält persönliche Daten. Leite sie nicht weiter und speichere sie nur dort, wo niemand sonst Zugriff hat.",
      hinweis: "Rechtsgrundlage: Auskunftsrecht nach Art. 15 DSGVO.",
    },
    sie: {
      eyebrow: "Datenschutz",
      titel: "Ihr Datenexport ist bereit",
      absaetze: [
        "Guten Tag {{vorname}}, Sie haben am {{zeitpunkt}} eine Kopie Ihrer Daten angefordert. Sie liegt jetzt zum Download bereit.",
        "Die Datei enthält alles, was wir zu Ihnen gespeichert haben — Unternehmensprofil, Inserate, Anfragen und Nachrichten.",
      ],
      cta: { label: "Daten herunterladen", platzhalter: "{{download_link}}" },
      ablauf:
        "Der Download ist {{ablauf_tage}} Tage verfügbar, danach löschen wir die Datei automatisch. Sie können jederzeit einen neuen Export anfordern.",
      warnung:
        "Die Datei enthält personenbezogene Daten. Leiten Sie sie nicht weiter und speichern Sie sie nur zugriffsgeschützt.",
      hinweis: "Rechtsgrundlage: Auskunftsrecht nach Art. 15 DSGVO.",
    },
  },
];
