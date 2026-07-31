"use client";

// ─── Arbeitsorte-Karte ────────────────────────────────────────────────────────
// Leaflet + OpenStreetMap (kostenlos, kein API-Key). Man kann Orte auf der Karte
// anklicken ODER über die Suche hinzufügen. Ausgewählte Orte erscheinen als
// Marker + Umkreis-Kreis und in einer Tabelle mit Radius-Regler. Alles clean.

import "leaflet/dist/leaflet.css";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Search, X, Loader2, Trash2, MapPin, Plus } from "lucide-react";
import type { WorkLocation } from "@/lib/types";

const GERMANY_CENTER: [number, number] = [51.163, 10.447];

const markerIcon = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;transform:rotate(-45deg);border-radius:50% 50% 50% 0;background:#E8A838;border:2px solid #1A1A2E;box-shadow:0 2px 5px rgba(0,0,0,.35)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
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
      {/* Suchleiste */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9CA3AF" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setShowResults(true)}
          placeholder="Ort suchen (z. B. München, 80331, Landkreis …)"
          className="w-full bg-white text-primary text-sm pl-10 pr-9 py-3 outline-none transition-all placeholder:text-primary/30"
          style={{ border: "1.5px solid #E5E7EB", fontFamily: "var(--font-sans)" }}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {searching ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#E8A838" }} />
          ) : query ? (
            <button onClick={() => { setQuery(""); setResults([]); }} aria-label="Leeren">
              <X className="w-4 h-4 text-muted" />
            </button>
          ) : null}
        </span>

        {showResults && results.length > 0 && (
          <div className="absolute z-[1000] left-0 right-0 mt-1 bg-white shadow-lg max-h-60 overflow-auto" style={{ border: "1px solid #E5E7EB" }}>
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => pickResult(r)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-surface transition-colors"
                style={{ color: "rgba(26,26,46,0.8)" }}
              >
                <Plus className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#E8A838" }} />
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Karte */}
      <div className="relative" style={{ border: "1.5px solid #E5E7EB" }}>
        {adding && (
          <div className="absolute z-[1000] top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-primary text-white text-xs px-3 py-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#E8A838" }} />
            Ort wird ermittelt…
          </div>
        )}
        <MapContainer
          center={GERMANY_CENTER}
          zoom={6}
          scrollWheelZoom
          style={{ height: 340, width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onClick={handleMapClick} />
          <FlyTo target={flyTarget} />
          {value.map((l) => (
            <Fragment key={l.id}>
              <Marker position={[l.lat, l.lng]} icon={markerIcon} />
              <Circle
                center={[l.lat, l.lng]}
                radius={l.radiusKm * 1000}
                pathOptions={{ color: "#E8A838", fillColor: "#E8A838", fillOpacity: 0.12, weight: 1.5 }}
              />
            </Fragment>
          ))}
        </MapContainer>
      </div>
      <p className="text-[11px] mt-2 flex items-center gap-1.5" style={{ color: "rgba(107,114,128,0.8)" }}>
        <MapPin className="w-3 h-3" style={{ color: "#E8A838" }} />
        Tipp: Auf die Karte tippen ODER oben suchen, um Arbeitsorte hinzuzufügen.
      </p>

      {/* Tabelle mit Radius-Reglern */}
      {value.length > 0 && (
        <div className="mt-4 bg-white" style={{ border: "1px solid #E5E7EB" }}>
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: "1px solid #E5E7EB" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "rgba(26,26,46,0.45)" }}>
              Deine Arbeitsorte ({value.length})
            </p>
          </div>
          <ul>
            {value.map((l, i) => (
              <li key={l.id} className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3" style={{ borderBottom: i < value.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                <div className="flex items-center gap-2.5 sm:w-56 flex-shrink-0">
                  <span className="w-6 h-6 flex items-center justify-center flex-shrink-0" style={{ background: "rgba(232,168,56,0.12)" }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
                  </span>
                  <span className="text-sm font-medium text-primary truncate">{l.label}</span>
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="range"
                    min={5}
                    max={150}
                    step={5}
                    value={l.radiusKm}
                    onChange={(e) => setRadius(l.id, Number(e.target.value))}
                    className="flex-1 h-[3px] appearance-none cursor-pointer"
                    style={{ accentColor: "#E8A838", background: `linear-gradient(to right, #E8A838 ${((l.radiusKm - 5) / 145) * 100}%, #E5E7EB ${((l.radiusKm - 5) / 145) * 100}%)` }}
                  />
                  <span className="text-sm font-semibold text-primary tabular-nums w-16 text-right">{l.radiusKm} km</span>
                  <button onClick={() => remove(l.id)} className="text-muted hover:text-red-500 transition-colors flex-shrink-0" aria-label="Entfernen">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
