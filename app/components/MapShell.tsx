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
  GERMANY_CENTER, GERMANY_BOUNDS, MIN_ZOOM, MAX_ZOOM, TILE_URL, OSM_COPYRIGHT_URL,
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
function GermanyMask() {
  return (
    <>
      <Polygon
        positions={[WORLD, GERMANY_OUTLINE]}
        pathOptions={{
          color: "transparent",
          // Exakt der Flächenton der Oberfläche (--color-surface).
          fillColor: "#F5F2EC",
          // Bewusst nicht deckend: die Umgebung bleibt als Andeutung erkennbar.
          fillOpacity: 0.9,
          weight: 0,
          interactive: false,
        }}
      />
      {/* Heller Halo — hebt die Kante vom Kartenbild ab */}
      <Polyline
        positions={GERMANY_OUTLINE}
        pathOptions={{
          color: "#FFFFFF",
          weight: 7,
          opacity: 0.9,
          lineJoin: "round",
          interactive: false,
          className: "pw-de-outline",
        }}
      />
      {/* Feine Kontur darüber */}
      <Polyline
        positions={GERMANY_OUTLINE}
        pathOptions={{
          color: "#0C3330",
          weight: 1.4,
          opacity: 0.26,
          lineJoin: "round",
          interactive: false,
        }}
      />
    </>
  );
}

/** Zeigt beim ersten Rendern ganz Deutschland. */
function FitGermany({ enabled }: { enabled: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled) return;
    map.fitBounds(GERMANY_BOUNDS as LatLngBoundsExpression, { padding: [26, 26] });
  }, [enabled, map]);
  return null;
}

export default function MapShell({
  height = 360,
  center = GERMANY_CENTER,
  zoom,
  /** Beim Start ganz Deutschland einpassen (statt fester Zoomstufe). */
  fitGermany = false,
  scrollWheelZoom = true,
  children,
}: {
  height?: number;
  center?: LatLngExpression;
  zoom?: number;
  fitGermany?: boolean;
  scrollWheelZoom?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom ?? 6}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      maxBounds={GERMANY_BOUNDS}
      maxBoundsViscosity={1}
      scrollWheelZoom={scrollWheelZoom}
      zoomControl={false}
      attributionControl={false}
      style={{ height, width: "100%", background: "#F5F2EC" }}
    >
      <TileLayer url={TILE_URL} maxZoom={MAX_ZOOM} className="pw-map-tiles" />
      <GermanyMask />
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
      className="absolute z-[10] bottom-2 left-3 rounded-full px-2.5 py-1 text-[10px] transition-colors"
      style={{ background: "rgba(255,255,255,0.85)", color: "rgba(12, 51, 48,0.5)" }}
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
      style={{ background: "rgba(255,255,255,0.96)", boxShadow: "0 8px 22px -10px rgba(12, 51, 48,0.45)" }}
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
