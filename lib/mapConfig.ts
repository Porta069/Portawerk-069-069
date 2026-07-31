// ─── Gemeinsame Kartenkonfiguration ──────────────────────────────────────────
// Eine Quelle für alle Karten (Arbeitsorte, Route), damit sie identisch
// aussehen und sich identisch verhalten.

import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

/** Geografische Mitte Deutschlands. */
export const GERMANY_CENTER: LatLngExpression = [51.163, 10.447];

/**
 * Begrenzung auf Deutschland (mit etwas Rand, damit Grenzregionen nicht
 * abgeschnitten wirken). Die Karte lässt sich nicht darüber hinaus schieben —
 * wir vermitteln ausschließlich innerhalb Deutschlands.
 */
export const GERMANY_BOUNDS: LatLngBoundsExpression = [
  [46.9, 5.4],
  [55.4, 15.6],
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
