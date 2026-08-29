// ─── Gemeinsame Kartenkonfiguration ──────────────────────────────────────────
// Eine Quelle für alle Karten (Arbeitsorte, Route), damit sie identisch
// aussehen und sich identisch verhalten.

import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

/** Geografische Mitte Deutschlands. */
export const GERMANY_CENTER: LatLngExpression = [51.163, 10.447];

/**
 * Deutschland — Grundlage fürs Einpassen beim Start (`fitBounds`).
 * Bewusst eng: der Ausschnitt soll das Land formatfüllend zeigen.
 */
export const GERMANY_BOUNDS: LatLngBoundsExpression = [
  [46.9, 5.4],
  [55.4, 15.6],
];

/**
 * Schiebe-Grenze der Karte — bewusst weiter als GERMANY_BOUNDS.
 *
 * Beide auf denselben Wert zu setzen war ein Fehler: beim Start zeigt die
 * Karte ganz Deutschland, der Ausschnitt füllt die Grenze also bereits aus.
 * Leaflet liess dann überhaupt kein Ziehen mehr zu — gemessen blieb die
 * Kartenmitte nach 200 px Ziehen exakt gleich, die Karte wirkte tot.
 *
 * Mit dem Zuschlag bleibt Spielraum, ohne dass man in fremde Länder abdriftet.
 * Optisch bleibt es ohnehin bei Deutschland: die Maske in MapShell deckt alles
 * ausserhalb der Landesgrenze ab.
 */
export const PAN_BOUNDS: LatLngBoundsExpression = [
  [44.5, 1.5],
  [57.5, 19.5],
];

/** Weiter herauszoomen als Deutschland ergibt für uns keinen Sinn. */
export const MIN_ZOOM = 5;
export const MAX_ZOOM = 19;

/**
 * Deutschsprachige OSM-Kacheln. Bewusst dieser Server und nicht CARTO:
 * Die internationalen Stile beschriften Städte englisch ("Munich", "Cologne"),
 * openstreetmap.de nutzt durchgehend die deutschen Namen. Die etwas kräftigere
 * Grundfärbung wird per CSS-Filter (.pw-map-tiles in globals.css) zurückgenommen.
 */
export const TILE_URL = "https://tile.openstreetmap.de/{z}/{x}/{y}.png";

/** Nach ODbL verpflichtend. */
export const OSM_COPYRIGHT_URL = "https://www.openstreetmap.org/copyright";
