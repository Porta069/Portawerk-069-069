# Bilder-Einkaufsliste

Stand: 03.09.2026. Reihenfolge = Reihenfolge der Seiten, jedes Bild steht bei
seinem ersten Auftreten. Spalte "Release" sagt, ob eine Person erkennbar ist
und damit ein Model Release gebraucht wird.

## 1 — Startseite `/`

| # | Datei | Format | Motiv | Release |
|---|---|---|---|---|
| 1 | hero-team-werkstatt.jpg | 1920×1280 (3:2 quer) | Zwei junge Handwerker an der Werkbank, helle Werkstatt, Froschperspektive, Latzhose, Tageslicht, beide schauen aufs Werkstueck | ja |
| 2 | elektriker-werkstatt.jpg | 1200×2133 (9:16 hoch) | Aelterer Mann, Brille auf der Stirn, verdrahtet Klemmleiste mit rotem Schraubendreher | ja |
| 3 | shk-heizung.jpg | 1200×800 (3:2 quer) | Zwei behandschuhte Haende montieren Verschraubung am weissen Heizkoerper, blaue Rohrzangen | nein |
| 4 | maler-leiter.jpg | 1200×1797 (2:3 hoch) | Maler von hinten auf Alu-Stehleiter, klebt Decke ab, Folie an der Wand, leerer Raum | nein (Rueckenansicht) |
| 5 | tischler-hobel.jpg | 1200×803 (3:2 quer) | Tischler hobelt rundes Werkstueck, Gesicht oben angeschnitten, warmer Filmlook | grenzwertig |
| 6 | metallbau-schweisser.jpg | 1200×1523 (4:5 hoch) | Schweisser mit Lederhut/Schirm, blauer Lichtbogen, Funken, dunkle Halle. Achtung: Firmenlogo auf dem Pullover | ja |
| 7 | maurer-ziegel.jpg | 1200×800 (3:2 quer) | Haende setzen roten Ziegel ins Moertelbett, Kelle und Richtschnur, nah | nein |
| 8 | thomas.jpg | 600×400 | Portrait: Mann mit Beanie und gruener Steppweste im Lager, Blick in die Kamera | ja + UWG |
| 9 | kevin.jpg | 600×900 | Portrait: Mann mit weissem Helm, Brille, orange Warnweste, laechelt zur Seite | ja + UWG |
| 10 | andreas.jpg | 600×900 | Portrait: Maler mit Cap und Schutzbrille, farbbespritztes Hemd, dunkler Hintergrund | ja + UWG |

Bild 1 taucht spaeter auf fast jeder Innenseite wieder auf (Bewerbungen,
Profil, Angebote, Statuskarte, Registrierung) — dort aber stark abgedunkelt.
Es ist damit das wichtigste Bild im Einkauf.

## 2 — Arbeitgeberseite `/arbeitgeber`

| # | Datei | Format | Motiv | Release |
|---|---|---|---|---|
| 11 | arbeitgeber-chef.png | 499×488, freigestellt | Mann im Karohemd zeigt mit beiden Zeigefingern zur Seite, lacht in die Kamera | ja |

## 3 — Verdienen `/verdienen`

| # | Datei | Format | Motiv | Release |
|---|---|---|---|---|
| 12 | geld.jpg | 1400×1867 (3:4 hoch) | Gefaecherte 50-Euro-Scheine, formatfuellend | nein (aber EZB-Regeln) |

## 4 — Dashboard `/dashboard` (Login noetig)

| # | Datei | Format | Motiv | Release |
|---|---|---|---|---|
| 13 | geld-100.jpg | 1400×1050 (4:3 quer) | Makro zweier 100-Euro-Scheine, diagonal uebereinander | nein (aber EZB-Regeln) |

## 5 — Partner-Dashboard `/verdienen/dashboard` (Login noetig)

| # | Datei | Format | Motiv | Release |
|---|---|---|---|---|
| 14 | handwerker-cutout.png | 416×797, freigestellt | Bauarbeiter mit weissem Helm und oranger Warnweste, Haende in den Taschen. Identisch mit Nr. 9 | ja |

## Nicht nachkaufen

- `hero-werkstatt.jpg` — nur Rueckfallbild in `jobsService.ts`, erscheint auf
  keiner Seite, solange jedes Gewerk zu einem Muster passt.
- `elektrik-steckdose.jpg`, `elektrik-sicherungskasten.jpg` — nirgends
  eingebunden.
- Alles unter `freigestellt/` — daraus abgeleitet, muss nach dem Kauf neu
  freigestellt werden.

## Beim Kauf beachten

- Personenbilder (1, 2, 5, 6, 8, 9, 10, 11, 14) bei einem Anbieter mit
  Model Release und Haftungsfreistellung kaufen: Adobe Stock, iStock,
  Getty. Gratis-Plattformen liefern das nicht.
- Bilder ohne erkennbare Personen (3, 4, 7, 12, 13) sind unkritisch; dort
  reicht auch weiterhin eine Gratis-Quelle, solange die Herkunft
  dokumentiert wird.
- Immer die groesste JPEG-Stufe kaufen: alle Bilder laufen ueber
  `object-cover` und werden beschnitten.
- Standardlizenz deckt Web und Social. Die Visitenkarte (14) wird als PNG
  heruntergeladen und weiterverbreitet — dort die Lizenzbedingungen zur
  Weitergabe pruefen, im Zweifel Extended License.
- Zu jedem gekauften Bild Rechnung, Lizenz-PDF und Bild-ID in
  `BILDNACHWEIS.md` eintragen.

## Was der Kauf nicht loest

Die Testimonials (8, 9, 10). Ein Model Release erlaubt die Abbildung der
Person in Werbung — er erlaubt nicht, ihr einen erfundenen Namen und ein
erfundenes Zitat zuzuschreiben und das als echte Kundenstimme auszugeben.
Das bleibt ein Verstoss gegen Par. 5 UWG, egal wie teuer das Foto war.
Entweder echte Kunden mit schriftlicher Freigabe, oder der Abschnitt bleibt
ohne Gesichter.
