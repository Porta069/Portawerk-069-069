"use client";

// ─── Suchgebiet-Karte (Arbeitgeber) ──────────────────────────────────────────
// Gleiche Mechanik wie die Arbeitsorte-Karte der Handwerker, aber auf einen
// Punkt reduziert: der Betrieb hat genau einen Standort. Klick auf die Karte
// ODER Eingabe von PLZ / Ortsname setzt das Zentrum, der Radius wird als Kreis
// gezeigt. Kandidaten erscheinen als anonyme Punkte — Dichte auf einen Blick.

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Search, X, Loader2, Crosshair, Plus, Minus } from "lucide-react";
import {
  GERMANY_CENTER, GERMANY_BOUNDS, MIN_ZOOM, MAX_ZOOM, TILE_URL, OSM_COPYRIGHT_URL,
} from "@/lib/mapConfig";

export interface SearchArea {
  lat: number;
  lng: number;
  /** Anzeigename, z.B. "München, Bayern". */
  label: string;
  /** Fünfstellige PLZ, falls ermittelbar. */
  plz: string;
}

/** Betriebs-Pin — dunkel, klar vom goldenen Kandidatenpunkt unterscheidbar. */
const homeIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:30px;height:30px">
    <div style="position:absolute;inset:0;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#1A1A2E;border:2.5px solid #fff;box-shadow:0 6px 14px -4px rgba(26,26,46,.6)"></div>
    <div style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:8px;height:8px;border-radius:2px;background:#E8A838"></div>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

interface GeoHit {
  label: string;
  plz: string;
  lat: number;
  lng: number;
}

function toHit(d: {
  lat: string;
  lon: string;
  display_name?: string;
  address?: Record<string, string>;
}): GeoHit {
  const a = d.address ?? {};
  const place = a.city || a.town || a.village || a.municipality || a.suburb || a.county || "";
  const state = a.state ?? "";
  const label = place && state && place !== state ? `${place}, ${state}` : place || (d.display_name ?? "Ort").split(",")[0];
  return { label, plz: a.postcode ?? "", lat: parseFloat(d.lat), lng: parseFloat(d.lon) };
}

/** Sucht nach PLZ ODER Ortsname — Nominatim akzeptiert beides. */
async function geocode(q: string): Promise<GeoHit[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
    q
  )}&countrycodes=de&limit=6&addressdetails=1&accept-language=de`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const data = (await res.json()) as Parameters<typeof toHit>[0][];
  return data.map(toHit);
}

async function reverse(lat: number, lng: number): Promise<GeoHit> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1&accept-language=de`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const d = (await res.json()) as Parameters<typeof toHit>[0];
    return { ...toHit(d), lat, lng };
  } catch {
    return { label: `Standort (${lat.toFixed(2)}, ${lng.toFixed(2)})`, plz: "", lat, lng };
  }
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

/** Zentriert und zoomt so, dass der gewählte Radius komplett sichtbar ist. */
function FitRadius({ area, radiusKm }: { area: SearchArea | null; radiusKm: number }) {
  const map = useMap();
  useEffect(() => {
    if (!area) return;
    const circle = L.circle([area.lat, area.lng], { radius: radiusKm * 1000 });
    map.flyToBounds(circle.getBounds(), { padding: [36, 36], duration: 0.7 });
  }, [area, radiusKm, map]);
  return null;
}

function ZoomControls() {
  const map = useMap();
  const btn = "w-9 h-9 flex items-center justify-center transition-colors duration-150 text-primary";
  return (
    <div
      className="absolute z-[1000] right-3 bottom-3 flex flex-col overflow-hidden rounded-xl"
      style={{ background: "rgba(255,255,255,0.96)", boxShadow: "0 8px 22px -10px rgba(26,26,46,0.45)" }}
    >
      <button type="button" aria-label="Hineinzoomen" className={btn} onClick={() => map.zoomIn()}>
        <Plus className="w-4 h-4" strokeWidth={2.4} />
      </button>
      <span style={{ height: 1, background: "#EDEBE5" }} />
      <button type="button" aria-label="Herauszoomen" className={btn} onClick={() => map.zoomOut()}>
        <Minus className="w-4 h-4" strokeWidth={2.4} />
      </button>
    </div>
  );
}

export default function SearchAreaMap({
  area,
  radiusKm,
  candidatePoints = [],
  onChange,
}: {
  area: SearchArea | null;
  radiusKm: number;
  /** Grobe Kandidatenpunkte — nur Dichte, keine Adressen. */
  candidatePoints?: { lat: number; lng: number }[];
  onChange: (a: SearchArea) => void;
}) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<GeoHit[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [focused, setFocused] = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    const q = query.trim();
    // PLZ ab 5 Zeichen, Ortsnamen ab 3.
    if (q.length < 3) {
      setHits([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debRef.current = setTimeout(async () => {
      try {
        setHits(await geocode(q));
        setOpen(true);
      } catch {
        setHits([]);
      } finally {
        setSearching(false);
      }
    }, 420);
    return () => {
      if (debRef.current) clearTimeout(debRef.current);
    };
  }, [query]);

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      setLocating(true);
      const hit = await reverse(lat, lng);
      setLocating(false);
      onChange(hit);
    },
    [onChange]
  );

  const pick = (h: GeoHit) => {
    setOpen(false);
    setQuery("");
    setHits([]);
    onChange(h);
  };

  return (
    <div>
      {/* Suche: PLZ oder Ortsname */}
      <div className="relative mb-3">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none"
          style={{ color: focused ? "#E8A838" : "rgba(255,255,255,0.35)" }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setFocused(true);
            if (hits.length) setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          placeholder="Postleitzahl oder Ort — z. B. 80331 oder München"
          className="w-full rounded-full text-[15px] pl-12 pr-11 py-3.5 outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: `1.5px solid ${focused ? "#E8A838" : "rgba(255,255,255,0.16)"}`,
            color: "white",
          }}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2">
          {searching ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#E8A838" }} />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setHits([]);
              }}
              aria-label="Suche leeren"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </span>

        {open && hits.length > 0 && (
          <div
            className="absolute z-[1200] left-0 right-0 mt-2 overflow-hidden rounded-2xl bg-white"
            style={{ boxShadow: "0 20px 40px -18px rgba(26,26,46,0.5)" }}
          >
            {hits.map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(h)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-[14px] transition-colors"
                style={{ color: "rgba(26,26,46,0.82)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(232,168,56,0.09)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span className="truncate">{h.label}</span>
                {h.plz && (
                  <span className="text-[12px] tabular-nums flex-shrink-0" style={{ color: "rgba(26,26,46,0.45)" }}>
                    {h.plz}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Karte */}
      <div className="relative overflow-hidden rounded-2xl" style={{ boxShadow: "0 16px 40px -26px rgba(0,0,0,0.7)" }}>
        {locating && (
          <div
            className="absolute z-[1000] top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-medium"
            style={{ background: "rgba(26,26,46,0.94)", color: "white" }}
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#E8A838" }} />
            Standort wird ermittelt …
          </div>
        )}

        {!area && !locating && (
          <div
            className="absolute z-[1000] top-3 left-3 flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-medium pointer-events-none"
            style={{ background: "rgba(255,255,255,0.94)", color: "rgba(26,26,46,0.72)" }}
          >
            <Crosshair className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
            Auf die Karte tippen, um den Standort zu setzen
          </div>
        )}

        <MapContainer
          center={area ? [area.lat, area.lng] : GERMANY_CENTER}
          zoom={area ? 9 : 6}
          minZoom={MIN_ZOOM}
          maxBounds={GERMANY_BOUNDS}
          maxBoundsViscosity={1}
          scrollWheelZoom
          zoomControl={false}
          attributionControl={false}
          style={{ height: 320, width: "100%", background: "#EFECE6" }}
        >
          <TileLayer url={TILE_URL} maxZoom={MAX_ZOOM} className="pw-map-tiles" />
          <ClickHandler onClick={handleMapClick} />
          <ZoomControls />
          <FitRadius area={area} radiusKm={radiusKm} />

          {area && (
            <>
              <Circle
                center={[area.lat, area.lng]}
                radius={radiusKm * 1000}
                pathOptions={{ color: "#E8A838", fillColor: "#E8A838", fillOpacity: 0.12, weight: 2, opacity: 0.8 }}
              />
              <Marker position={[area.lat, area.lng]} icon={homeIcon} />
            </>
          )}

          {/* Kandidatendichte — bewusst nur Punkte, keine Identität */}
          {candidatePoints.map((p, i) => (
            <CircleMarker
              key={i}
              center={[p.lat, p.lng]}
              radius={6}
              pathOptions={{ color: "#fff", weight: 2, fillColor: "#E8A838", fillOpacity: 1 }}
            />
          ))}
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
    </div>
  );
}
