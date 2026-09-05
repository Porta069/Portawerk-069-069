"use client";

// ─── Gemeinsame Karten-Basis ─────────────────────────────────────────────────
// Eine Quelle für alle Karten der Plattform (Arbeitsorte, Route, Suchgebiet).
//
// Zwei Dinge unterscheiden sie von einer Standard-Leaflet-Karte:
//
// 1. MASKE: Alles ausserhalb Deutschlands wird abgedeckt. Technisch ein Polygon
//    mit Loch — Aussenring umspannt die Welt, Innenring ist der deutsche
//    Grenzverlauf. Dadurch ist wirklich nur Deutschland zu sehen, kein
//    Nachbarland lenkt ab.
// 2. Deutsche Beschriftung über tile.openstreetmap.de, Farben per CSS-Filter
//    zurückgenommen.

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Polyline, useMap } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import {
  GERMANY_CENTER, GERMANY_BOUNDS, PAN_BOUNDS, MIN_ZOOM, MAX_ZOOM, TILE_URL, OSM_COPYRIGHT_URL,
} from "@/lib/mapConfig";
import { GERMANY_OUTLINE } from "@/lib/germanyOutline";

/** Rechteck weit über die Kartengrenzen hinaus — Aussenring der Maske. */
const WORLD: [number, number][] = [
  [-85, -180],
  [-85, 180],
  [85, 180],
  [85, -180],
];

/**
 * Legt Deutschland wie ein Blatt auf die Seite: aussen der Papierton der
 * Oberfläche, sodass die Nachbarländer nur noch als leiser Schemen
 * durchscheinen — Kontext ja, Ablenkung nein. Ein heller Halo entlang der
 * Grenze plus weicher Schlagschatten erzeugt Tiefe, damit es nicht wie ein
 * ausgestanztes graues Loch wirkt.
 *
 * Nicht anklickbar, damit Kartenklicks weiterhin durchgehen.
 */
function GermanyMask({ dunkel = false }: { dunkel?: boolean }) {
  return (
    <>
      <Polygon
        positions={[WORLD, GERMANY_OUTLINE]}
        pathOptions={{
          color: "transparent",
          // Exakt der Flächenton der Oberfläche (--color-surface).
          fillColor: dunkel ? "#1A1A2E" : "#F8F7F4",
          // Bewusst nicht deckend: die Umgebung bleibt als Andeutung erkennbar.
          // Fast deckend statt 0,9: in einem breiten Band ist Deutschland nur
          // ein Ausschnitt in der Mitte, und bei 0,9 blieben England, Polen und
          // die Ukraine gut lesbar. Die Karte soll Deutschland zeigen, nicht
          // halb Europa.
          fillOpacity: 0.97,
          weight: 0,
          interactive: false,
        }}
      />
      {/* Heller Halo — hebt die Kante vom Kartenbild ab */}
      <Polyline
        positions={GERMANY_OUTLINE}
        pathOptions={{
          // Auf dunklem Grund trägt kein weisser Halo — dort markiert Gold die
          // Grenze, passend zum Rest der Oberfläche.
          color: dunkel ? "#E8A838" : "#FFFFFF",
          weight: dunkel ? 4 : 7,
          opacity: dunkel ? 0.5 : 0.9,
          lineJoin: "round",
          interactive: false,
          className: "pw-de-outline",
        }}
      />
      {/* Feine Kontur darüber */}
      <Polyline
        positions={GERMANY_OUTLINE}
        pathOptions={{
          color: dunkel ? "#FFFFFF" : "#1A1A2E",
          weight: 1.4,
          opacity: dunkel ? 0.3 : 0.26,
          lineJoin: "round",
          interactive: false,
        }}
      />
    </>
  );
}

/**
 * Zeigt beim ersten Rendern ganz Deutschland — und nutzt dabei die verfügbare
 * Fläche wirklich aus.
 *
 * Leaflet rastet standardmässig auf ganze Zoomstufen (`zoomSnap: 1`). In einem
 * 540 px hohen Rahmen bräuchte Deutschland Stufe 5,94; gerundet wird auf 5, und
 * eine Stufe entspricht dem Faktor zwei. Das Land kam dadurch nur halb so gross
 * heraus wie möglich — es sah verloren aus, egal wie gross der Rahmen war. Mit
 * `zoomSnap: 0` (am MapContainer) sind Zwischenstufen erlaubt und fitBounds
 * trifft die Fläche genau.
 */
function FitGermany({ enabled }: { enabled: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled) return;
    map.fitBounds(GERMANY_BOUNDS as LatLngBoundsExpression, { padding: [18, 18] });
  }, [enabled, map]);
  return null;
}

/**
 * Eigener Mausrad-Zoom statt Leaflets `scrollWheelZoom`.
 *
 * Leaflet bildet das Radsignal über eine Sigmoid-Funktion ab und dämpft kleine
 * Werte stark. Das trifft Trackpads hart: die liefern viele winzige Deltas
 * statt weniger grosser. Dazu teilt Leaflet auf macOS zusätzlich durch
 * `devicePixelRatio * 3` — auf einem Retina-Bildschirm also durch sechs.
 *
 * Gemessen mit `zoomSnap: 0` bei devicePixelRatio 2, jeweils 20 Trackpad-
 * Wische: bei `wheelPxPerZoomLevel` 22 kamen 0,09 Zoomstufen heraus, bei 3
 * immer noch nur 0,63 — während dasselbe 3 dem Mausrad schon 3,83 Stufen für
 * drei Klicks gab. Ein einziger Wert kann beide Geräte nicht bedienen.
 *
 * Dieser Handler rechnet linear: gesammelte Pixel geteilt durch eine feste
 * Zahl ergeben die Zoomstufen — Trackpad und Mausrad landen damit auf
 * derselben Kurve. Nachgemessen: drei Radklicks (360 px) ergeben 2,8 Stufen,
 * ein kräftiger Trackpad-Wisch etwa dasselbe. Angewendet wird einmal pro
 * Bildaufbau: flüssig, und trotzdem geht kein Einzelereignis verloren.
 */
const PIXEL_PRO_ZOOMSTUFE = 130;

function RadZoom({ aktiv }: { aktiv: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!aktiv) return;
    const el = map.getContainer();
    let offen = 0;
    let punkt: ReturnType<typeof map.mouseEventToContainerPoint> | null = null;
    let bild = 0;

    const anwenden = () => {
      bild = 0;
      if (!offen || !punkt) return;
      const stufen = -offen / PIXEL_PRO_ZOOMSTUFE;
      offen = 0;
      map.setZoomAround(punkt, map.getZoom() + stufen, { animate: false });
    };

    const amRad = (e: WheelEvent) => {
      // Ohne preventDefault scrollt die Seite unter der Karte weg.
      e.preventDefault();
      // deltaMode: 0 = Pixel, 1 = Zeilen, 2 = Seiten.
      const px =
        e.deltaMode === 1
          ? e.deltaY * 16
          : e.deltaMode === 2
            ? e.deltaY * el.clientHeight
            : e.deltaY;
      offen += px;
      punkt = map.mouseEventToContainerPoint(e);
      if (!bild) bild = requestAnimationFrame(anwenden);
    };

    el.addEventListener("wheel", amRad, { passive: false });
    return () => {
      el.removeEventListener("wheel", amRad);
      if (bild) cancelAnimationFrame(bild);
    };
  }, [map, aktiv]);

  return null;
}

export default function MapShell({
  height = 360,
  center = GERMANY_CENTER,
  zoom,
  /** Beim Start ganz Deutschland einpassen (statt fester Zoomstufe). */
  fitGermany = false,
  scrollWheelZoom = true,
  dunkel = false,
  children,
}: {
  height?: number;
  center?: LatLngExpression;
  zoom?: number;
  fitGermany?: boolean;
  scrollWheelZoom?: boolean;
  /**
   * Dunkle Fassung für dunkle Flächen: die Kacheln werden invertiert und
   * entsättigt, die Maske aussen wird navy statt Papierton, die Landeskante
   * gold statt weiss. Ohne das läge ein weisses Rechteck in einem navyfarbenen
   * Panel — der Bruch, den man sofort sieht.
   */
  dunkel?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom ?? 6}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      maxBounds={PAN_BOUNDS}
      /* Elastisch statt starr: an der Grenze gibt die Karte nach und federt
         zurück, statt die Bewegung hart zu verschlucken. */
      maxBoundsViscosity={0.4}
      /* Zwischenstufen erlaubt — nötig, damit fitBounds Deutschland
         formatfüllend einpasst statt auf die nächstkleinere ganze Stufe zu
         runden. Das Mausrad übernimmt RadZoom, siehe oben. */
      zoomSnap={0}
      zoomDelta={1}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl={false}
      style={{ height, width: "100%", background: dunkel ? "#1A1A2E" : "#F8F7F4" }}
    >
      <TileLayer
        url={TILE_URL}
        maxZoom={MAX_ZOOM}
        className={dunkel ? "pw-map-tiles-dunkel" : "pw-map-tiles"}
      />
      <GermanyMask dunkel={dunkel} />
      <RadZoom aktiv={scrollWheelZoom} />
      <FitGermany enabled={fitGermany} />
      {children}
    </MapContainer>
  );
}

/** Pflichtangabe nach ODbL — gehört unter jede Karte. */
export function MapAttribution() {
  return (
    <a
      href={OSM_COPYRIGHT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute z-[10] bottom-2 left-3 rounded-full px-2.5 py-1 text-[10px] max-lg:text-[11px] transition-colors"
      style={{ background: "rgba(255,255,255,0.85)", color: "rgba(26,26,46,0.5)" }}
    >
      © OpenStreetMap
    </a>
  );
}

/** Einheitliche Zoom-Steuerung. */
export function MapZoom() {
  const map = useMap();
  const btn = "w-9 h-9 flex items-center justify-center transition-colors duration-150 text-primary";
  return (
    <div
      className="absolute z-[10] right-3 bottom-3 flex flex-col overflow-hidden rounded-xl"
      style={{ background: "rgba(255,255,255,0.96)", boxShadow: "0 8px 22px -10px rgba(26,26,46,0.45)" }}
    >
      <button type="button" aria-label="Hineinzoomen" className={btn} onClick={() => map.zoomIn()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <span style={{ height: 1, background: "#EDEBE5" }} />
      <button type="button" aria-label="Herauszoomen" className={btn} onClick={() => map.zoomOut()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
