"use client";

// ─── Arbeitsorte-Karte ────────────────────────────────────────────────────────
// Leaflet mit den deutschsprachigen OSM-Kacheln (tile.openstreetmap.de), damit
// Ortsnamen auf Deutsch erscheinen. Die Farben werden per CSS-Filter
// zurückgenommen (.pw-map-tiles), sodass der goldene Arbeitsradius führt.
//
// Die Leaflet-Standardattribution ist abgeschaltet: der Leaflet-Hinweis ist
// rechtlich nicht erforderlich, die OSM-Nennung schon — die steht als eigener,
// dezenter Link unten links.
//
// Bedienung unverändert — Klick auf die Karte ODER Suche fügt einen Ort hinzu,
// jeder Ort bekommt seinen eigenen Radius.

import "leaflet/dist/leaflet.css";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Marker, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Search, X, Loader2, Trash2, MapPin, Plus, Crosshair } from "lucide-react";
import type { WorkLocation } from "@/lib/types";
import MapShell, { MapAttribution, MapZoom } from "./MapShell";

/** Gold-Pin mit weißem Ring und weichem Schlagschatten. */
const markerIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:28px;height:28px">
    <div style="position:absolute;inset:0;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:linear-gradient(145deg,#FBBF3C,#F9AD07);border:2.5px solid #fff;box-shadow:0 6px 14px -4px rgba(12, 51, 48,.55)"></div>
    <div style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:7px;height:7px;border-radius:50%;background:#0C3330"></div>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.round(Math.random() * 1e6)}`;

interface GeoResult {
  label: string;
  lat: number;
  lng: number;
}

function shortLabel(r: {
  display_name?: string;
  address?: Record<string, string>;
}): string {
  const a = r.address ?? {};
  const place =
    a.city || a.town || a.village || a.municipality || a.suburb || a.county;
  const state = a.state;
  if (place && state && place !== state) return `${place}, ${state}`;
  if (place) return place;
  return (r.display_name ?? "Unbekannter Ort").split(",").slice(0, 2).join(",");
}

async function geocodeSearch(q: string): Promise<GeoResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
    q
  )}&countrycodes=de&limit=6&addressdetails=1&accept-language=de`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    address?: Record<string, string>;
  }>;
  return data.map((d) => ({
    label: shortLabel(d),
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
  }));
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1&accept-language=de`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const d = (await res.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };
    return shortLabel(d);
  } catch {
    return `Ort (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
  }
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 10, { duration: 0.8 });
  }, [target, map]);
  return null;
}

export default function WorkLocationsMap({
  value,
  onChange,
}: {
  value: WorkLocation[];
  onChange: (locs: WorkLocation[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [adding, setAdding] = useState(false);
  const [focused, setFocused] = useState(false);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced Nominatim-Suche (Rate-Limit-freundlich).
  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debRef.current = setTimeout(async () => {
      try {
        const r = await geocodeSearch(q);
        setResults(r);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => {
      if (debRef.current) clearTimeout(debRef.current);
    };
  }, [query]);

  const exists = useCallback(
    (lat: number, lng: number) =>
      value.some((l) => Math.abs(l.lat - lat) < 0.02 && Math.abs(l.lng - lng) < 0.02),
    [value]
  );

  const addLocation = useCallback(
    (lat: number, lng: number, label: string) => {
      if (exists(lat, lng)) {
        setFlyTarget([lat, lng]);
        return;
      }
      onChange([...value, { id: uid(), label, lat, lng, radiusKm: 25 }]);
      setFlyTarget([lat, lng]);
    },
    [value, onChange, exists]
  );

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      setAdding(true);
      const label = await reverseGeocode(lat, lng);
      setAdding(false);
      addLocation(lat, lng, label);
    },
    [addLocation]
  );

  const pickResult = (r: GeoResult) => {
    setShowResults(false);
    setQuery("");
    setResults([]);
    addLocation(r.lat, r.lng, r.label);
  };

  const setRadius = (id: string, radiusKm: number) =>
    onChange(value.map((l) => (l.id === id ? { ...l, radiusKm } : l)));
  const remove = (id: string) => onChange(value.filter((l) => l.id !== id));

  return (
    <div>
      {/* ── Suche ── */}
      <div className="relative mb-3">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none"
          style={{ color: focused ? "#F9AD07" : "rgba(12, 51, 48,0.3)" }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setFocused(true);
            if (results.length) setShowResults(true);
          }}
          onBlur={() => setFocused(false)}
          placeholder="Ort oder PLZ suchen — z. B. München oder 80331"
          className="w-full rounded-full bg-white text-primary text-[14px] pl-12 pr-11 py-3.5 outline-none transition-all duration-200 placeholder:text-primary/25"
          style={{
            border: `1.5px solid ${focused ? "#F9AD07" : "#E4DFD3"}`,
            boxShadow: focused
              ? "0 0 0 4px rgba(249, 173, 7,0.12)"
              : "0 2px 10px -6px rgba(12, 51, 48,0.14)",
            fontFamily: "var(--font-sans)",
          }}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2">
          {searching ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#F9AD07" }} />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              aria-label="Suche leeren"
              style={{ color: "rgba(12, 51, 48,0.35)" }}
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </span>

        {showResults && results.length > 0 && (
          <div
            className="absolute z-[20] left-0 right-0 mt-2 overflow-hidden rounded-2xl bg-white"
            style={{ border: "1px solid #E4DFD3", boxShadow: "0 20px 40px -18px rgba(12, 51, 48,0.4)" }}
          >
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pickResult(r)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-[14px] transition-colors"
                style={{ color: "rgba(12, 51, 48,0.82)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(249, 173, 7,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(249, 173, 7,0.14)" }}
                >
                  <Plus className="w-3.5 h-3.5" style={{ color: "#F9AD07" }} />
                </span>
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Karte ── */}
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{ boxShadow: "0 18px 44px -26px rgba(12, 51, 48,0.55)" }}
      >
        {adding && (
          <div
            className="absolute z-[10] top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-medium"
            style={{ background: "rgba(12, 51, 48,0.94)", color: "white" }}
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#F9AD07" }} />
            Ort wird ermittelt…
          </div>
        )}

        {value.length === 0 && !adding && (
          <div
            className="absolute z-[10] top-3 left-3 flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-medium pointer-events-none"
            style={{ background: "rgba(255,255,255,0.94)", color: "rgba(12, 51, 48,0.72)", boxShadow: "0 8px 20px -12px rgba(12, 51, 48,0.5)" }}
          >
            <Crosshair className="w-3.5 h-3.5" style={{ color: "#F9AD07" }} />
            Tipp auf die Karte, um einen Arbeitsort zu setzen
          </div>
        )}

        <MapShell height={400} fitGermany>
          <ClickHandler onClick={handleMapClick} />
          <FlyTo target={flyTarget} />
          <MapZoom />
          {value.map((l) => (
            <Fragment key={l.id}>
              <Circle
                center={[l.lat, l.lng]}
                radius={l.radiusKm * 1000}
                pathOptions={{
                  color: "#F9AD07",
                  fillColor: "#F9AD07",
                  fillOpacity: 0.16,
                  weight: 2,
                  opacity: 0.85,
                }}
              />
              <Marker position={[l.lat, l.lng]} icon={markerIcon} />
            </Fragment>
          ))}
        </MapShell>

        {/* Pflichtangabe nach ODbL — dezent, ohne Leaflet-Werbung. */}
        <MapAttribution />
      </div>

      {/* ── Gewählte Orte ── */}
      {value.length > 0 && (
        <div className="mt-4 space-y-2.5">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "rgba(12, 51, 48,0.4)" }}
          >
            Deine Arbeitsorte ({value.length})
          </p>
          {value.map((l) => (
            <div
              key={l.id}
              className="rounded-2xl bg-white p-4"
              style={{ border: "1.5px solid #E4DFD3", boxShadow: "0 2px 10px -8px rgba(12, 51, 48,0.2)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(249, 173, 7,0.14)" }}
                >
                  <MapPin className="w-4 h-4" style={{ color: "#F9AD07" }} />
                </span>
                <span className="text-[14px] font-semibold text-primary truncate flex-1">
                  {l.label}
                </span>
                <span
                  className="rounded-full px-2.5 py-1 text-[12px] font-bold tabular-nums flex-shrink-0"
                  style={{ background: "rgba(12, 51, 48,0.06)", color: "#0C3330" }}
                >
                  {l.radiusKm} km
                </span>
                <button
                  type="button"
                  onClick={() => remove(l.id)}
                  aria-label={`${l.label} entfernen`}
                  className="flex-shrink-0 transition-colors"
                  style={{ color: "rgba(12, 51, 48,0.3)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(12, 51, 48,0.3)")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="range"
                min={5}
                max={150}
                step={5}
                value={l.radiusKm}
                aria-label={`Radius für ${l.label}`}
                onChange={(e) => setRadius(l.id, Number(e.target.value))}
                className="w-full h-[4px] appearance-none cursor-pointer rounded-full"
                style={{
                  accentColor: "#F9AD07",
                  background: `linear-gradient(to right, #F9AD07 ${
                    ((l.radiusKm - 5) / 145) * 100
                  }%, #E4DFD3 ${((l.radiusKm - 5) / 145) * 100}%)`,
                }}
              />
              <div className="flex justify-between mt-1.5 text-[10px] tabular-nums" style={{ color: "rgba(12, 51, 48,0.35)" }}>
                <span>5 km</span>
                <span>150 km</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
