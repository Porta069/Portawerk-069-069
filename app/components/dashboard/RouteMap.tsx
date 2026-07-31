"use client";

// ─── Routenkarte zur Arbeitsstelle ────────────────────────────────────────────
// Zeigt den tatsächlichen Fahrtweg vom nächstgelegenen Arbeitsort des Nutzers
// zum Betrieb. Die Fahrtzeit ist im Handwerk das konkreteste Entscheidungs-
// argument — Luftlinie sagt nichts, 42 Minuten schon.
//
// Routing über den öffentlichen OSRM-Dienst (kein Schlüssel nötig). Schlägt er
// fehl, wird die Luftlinie als gerade Verbindung gezeichnet und das ehrlich
// beschriftet, statt eine Route zu erfinden.

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Car, Loader2, Ruler, AlertCircle } from "lucide-react";
import type { Job } from "@/lib/types";
import {
  GERMANY_BOUNDS, MIN_ZOOM, MAX_ZOOM, TILE_URL, OSM_COPYRIGHT_URL,
} from "@/lib/mapConfig";

function pin(letter: string, bg: string, fg: string) {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:30px;height:30px">
      <div style="position:absolute;inset:0;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${bg};border:2.5px solid #fff;box-shadow:0 6px 14px -4px rgba(26,26,46,.55)"></div>
      <span style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);font:700 13px/1 system-ui;color:${fg}">${letter}</span>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
}

const startIcon = pin("A", "#1A1A2E", "#FFFFFF");
const endIcon = pin("B", "linear-gradient(145deg,#F0B94A,#E8A838)", "#1A1A2E");

/** Passt den Ausschnitt auf die gesamte Route an. */
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    map.fitBounds(L.latLngBounds(points), { padding: [44, 44] });
  }, [points, map]);
  return null;
}

interface RouteResult {
  points: [number, number][];
  minutes: number;
  km: number;
  /** true = echte Straßenroute, false = Luftlinie als Notbehelf. */
  real: boolean;
}

export default function RouteMap({ job }: { job: Job }) {
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const from = `${job.startLng},${job.startLat}`;
    const to = `${job.lng},${job.lat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${from};${to}?overview=full&geometries=geojson`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const r = d?.routes?.[0];
        if (!r?.geometry?.coordinates) throw new Error("keine Route");
        setRoute({
          points: (r.geometry.coordinates as [number, number][]).map(
            ([lng, lat]) => [lat, lng] as [number, number]
          ),
          minutes: Math.round(r.duration / 60),
          km: Math.round((r.distance / 1000) * 10) / 10,
          real: true,
        });
      })
      .catch(() => {
        if (!active) return;
        // Notbehelf: gerade Linie, klar als Luftlinie gekennzeichnet.
        setRoute({
          points: [
            [job.startLat, job.startLng],
            [job.lat, job.lng],
          ],
          minutes: job.travelMinutes,
          km: job.distanceKm,
          real: false,
        });
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [job]);

  return (
    <div>
      {/* Kennzahlen */}
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5"
          style={{ background: "rgba(232,168,56,0.14)" }}
        >
          <Car className="w-4 h-4" style={{ color: "#E8A838" }} />
          <span
            className="text-[17px] font-bold tabular-nums text-primary"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {loading ? "…" : `${route?.minutes} Min.`}
          </span>
        </span>
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5"
          style={{ background: "rgba(26,26,46,0.05)" }}
        >
          <Ruler className="w-4 h-4" style={{ color: "rgba(26,26,46,0.4)" }} />
          <span className="text-[14px] font-semibold tabular-nums" style={{ color: "rgba(26,26,46,0.65)" }}>
            {loading ? "…" : `${route?.km.toLocaleString("de-DE")} km`}
          </span>
        </span>
      </div>

      <p className="text-[13px] mb-4" style={{ color: "rgba(26,26,46,0.55)" }}>
        Von <strong className="text-primary">{job.startLabel}</strong> zu{" "}
        <strong className="text-primary">{job.employer}</strong> in {job.city}
        {job.conditions.fahrzeitIstArbeitszeit && (
          <> — die Fahrzeit zählt hier als Arbeitszeit.</>
        )}
      </p>

      {/* Karte */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ boxShadow: "0 16px 40px -26px rgba(26,26,46,0.6)" }}
      >
        {loading && (
          <div
            className="absolute inset-0 z-[1000] flex items-center justify-center gap-2"
            style={{ background: "rgba(255,255,255,0.75)" }}
          >
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#E8A838" }} />
            <span className="text-[13px]" style={{ color: "rgba(26,26,46,0.6)" }}>
              Route wird berechnet …
            </span>
          </div>
        )}

        <MapContainer
          center={[(job.startLat + job.lat) / 2, (job.startLng + job.lng) / 2]}
          zoom={9}
          minZoom={MIN_ZOOM}
          maxBounds={GERMANY_BOUNDS}
          maxBoundsViscosity={1}
          scrollWheelZoom={false}
          zoomControl={false}
          attributionControl={false}
          style={{ height: 340, width: "100%", background: "#EFECE6" }}
        >
          <TileLayer url={TILE_URL} maxZoom={MAX_ZOOM} className="pw-map-tiles" />
          {route && (
            <>
              {/* Schatten unter der Route für Kontrast auf hellen Flächen */}
              <Polyline
                positions={route.points}
                pathOptions={{ color: "#1A1A2E", weight: 8, opacity: 0.18 }}
              />
              <Polyline
                positions={route.points}
                pathOptions={{
                  color: "#E8A838",
                  weight: 5,
                  opacity: 0.95,
                  dashArray: route.real ? undefined : "8 10",
                }}
              />
              <Marker position={[job.startLat, job.startLng]} icon={startIcon} />
              <Marker position={[job.lat, job.lng]} icon={endIcon} />
              <FitBounds points={route.points} />
            </>
          )}
        </MapContainer>

        <a
          href={OSM_COPYRIGHT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute z-[1000] bottom-2 left-3 rounded-full px-2.5 py-1 text-[10px]"
          style={{ background: "rgba(255,255,255,0.82)", color: "rgba(26,26,46,0.5)" }}
        >
          © OpenStreetMap
        </a>
      </div>

      {route && !route.real && (
        <p
          className="flex items-start gap-2 text-[12px] mt-3"
          style={{ color: "rgba(26,26,46,0.55)" }}
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#B47B18" }} />
          Der Routendienst war nicht erreichbar — gezeigt ist die Luftlinie, die Zeit
          ist ein Schätzwert.
        </p>
      )}
    </div>
  );
}
