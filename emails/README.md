# Transaktionsmails PortaWerk

Neun Systemmails in einheitlichem Stil, je in zwei Fassungen: **du** für
Handwerker, **Sie** für Betriebe — genau wie in der Anwendung.

## Was hier liegt

| Ordner | Inhalt | Zweck |
|---|---|---|
| `pdf/` | 9 PDFs, je 2 Seiten | Freigabe, Weitergabe, Ausdruck |
| `vorlagen/` | 18 HTML-Dateien | **versandfertig**, mit Platzhaltern |
| `vorschau/` | 9 HTML-Dateien | Grundlage der PDFs, beide Fassungen |
| `inhalte.mjs` | alle Texte | einzige Quelle für Formulierungen |
| `build.mjs` | Generator | erzeugt alles neu |

Neu erzeugen nach Textänderungen:

```
node emails/build.mjs
```

Braucht Google Chrome für den PDF-Druck (Pfad steht oben in `build.mjs`).

## Die neun Mails

| Datei | Anlass |
|---|---|
| `passwort-zuruecksetzen` | Nutzer hat Passwort vergessen — Link |
| `passwort-geaendert` | Bestätigung nach Änderung |
| `email-aendern` | Bestätigungslink an die **neue** Adresse |
| `email-geaendert` | Meldung an **alte und neue** Adresse |
| `email-verifizierung` | Nach der Registrierung |
| `nutzungsbedingungen-aenderung` | Neue Fassung tritt in Kraft |
| `account-gesperrt` | Verstoß gegen die Nutzungsbedingungen |
| `account-geloescht` | Konto gelöscht, mit Grund |
| `daten-export` | Auskunft nach Art. 15 DSGVO steht bereit |

## Platzhalter

Das Backend ersetzt `{{...}}` beim Versand. Vollständige Liste:

**Immer**

| Platzhalter | Beispiel |
|---|---|
| `{{vorname}}` | Michael |
| `{{email_support}}` | kontakt@porta-werk.de |
| `{{link_impressum}}` `{{link_datenschutz}}` `{{link_agb}}` | vollständige URLs |
| `{{firma_name}}` `{{firma_strasse}}` `{{firma_plz}}` `{{firma_ort}}` | Anschrift |
| `{{firma_rechtsform}}` `{{firma_vertretung}}` | Impressumspflicht |
| `{{firma_registergericht}}` `{{firma_registernummer}}` `{{firma_ustid}}` | Impressumspflicht |

**Je nach Mail**

| Platzhalter | Wo |
|---|---|
| `{{link}}` | alle mit Knopf |
| `{{zeitpunkt}}` | alle sicherheitsrelevanten |
| `{{gueltig_minuten}}` | Passwort, E-Mail-Änderung |
| `{{gueltig_stunden}}` | Verifizierung |
| `{{email_alt}}` `{{email_neu}}` | E-Mail-Änderung |
| `{{version}}` `{{inkrafttreten}}` `{{widerspruch_frist}}` | Nutzungsbedingungen |
| `{{aenderung_1}}` `{{aenderung_2}}` `{{aenderung_3}}` | Nutzungsbedingungen |
| `{{grund}}` `{{regel}}` | Sperrung, Löschung |
| `{{aufbewahrung}}` | Löschung |
| `{{email_datenschutz}}` | Löschung |
| `{{download_link}}` `{{ablauf_tage}}` | Datenexport |

Die Betreffzeilen stehen in `inhalte.mjs` unter `betreff` — sie sind **nicht**
Teil der HTML-Datei und müssen beim Versand separat gesetzt werden.

## Technische Hinweise für den Versand

- **Logo:** wird über `https://porta-werk.de/images/portawerk-logo.png`
  geladen. Die Datei liegt unter `public/images/portawerk-logo.png` und ist
  nach dem Deployment dort erreichbar. Kein Base64 — das blockieren Gmail und
  Outlook.
- **Preheader:** die versteckte Zeile ganz oben erscheint in der Inbox-Vorschau
  neben dem Betreff. Nicht entfernen.
- **Aufbau:** Tabellen und Inline-Styles, keine Flexbox, kein Grid. So gebaut,
  weil Outlook nichts anderes zuverlässig darstellt.
- **Reine Textfassung:** noch nicht enthalten. Für gute Zustellraten sollte
  jede Mail zusätzlich als `text/plain` mitgeschickt werden.

## Bewusst nicht enthalten

- **IP-Adresse und Gerät** in Sicherheitsmails — so entschieden; das Backend
  muss dafür kein zusätzliches Feld liefern. Nachrüstbar.
- **Fotos** im Kopfbereich. Alle neun Mails sollen sofort als PortaWerk
  erkennbar sein; ein Motiv in der Sperrmail und keines in der Passwortmail
  hätte diesen Zusammenhalt gebrochen. Der Wiedererkennungswert liegt auf
  Logo, Gold-Petrol-Kante und Fußzeile.
- **Werbliche Elemente** wie der Empfehlungs-Hinweis. In einer Sperr- oder
  Löschmail wäre das unpassend, und die Mails sollen einheitlich bleiben.

## Rechtliches, noch zu klären

Die Fußzeile enthält Platzhalter für **Rechtsform, Vertretungsberechtigte,
Registergericht, Registernummer und USt-IdNr.** Diese Angaben fehlen bislang
auch im Impressum der Website (`lib/legal.ts`). Sie sind nach § 5 DDG Pflicht,
sobald das Angebot geschäftsmäßig betrieben wird — vor dem ersten echten
Versand einsetzen lassen.
