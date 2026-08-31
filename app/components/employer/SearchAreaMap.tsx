"use client";

// ─── Suchgebiet-Karte (Arbeitgeber) ──────────────────────────────────────────
// Gleiche Mechanik wie die Arbeitsorte-Karte der Handwerker, aber auf einen
// Punkt reduziert: der Betrieb hat genau einen Standort. Klick auf die Karte
// ODER Eingabe von PLZ / Ortsname setzt das Zentrum, der Radius wird als Kreis
// gezeigt. Kandidaten erscheinen als anonyme Punkte — Dichte auf einen Blick.

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Marker, Circle, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Search, X, Loader2, Crosshair, MapPin, Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { liegtInDeutschland } from "@/lib/germanyOutline";
import MapShell, { MapAttribution, MapZoom } from "@/app/components/MapShell";

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
    if (!Number.isFinite(area.lat) || !Number.isFinite(area.lng)) return;

    // Bewusst ueber LatLng.toBounds statt ueber einen L.circle: ein Kreis, der
    // nicht auf der Karte liegt, hat weder _map noch _point — sein getBounds()
    // greift intern darauf zu und wirft. toBounds ist eine reine Rechnung.
    const bounds = L.latLng(area.lat, area.lng).toBounds(radiusKm * 2000);

    try {
      map.flyToBounds(bounds, { padding: [36, 36], duration: 0.7 });
    } catch {
      // Karte noch nicht vermessen — dann wenigstens zentrieren.
      map.setView([area.lat, area.lng], map.getZoom());
    }
  }, [area, radiusKm, map]);
  return null;
}

export default function SearchAreaMap({
  area,
  radiusKm,
  candidatePoints = [],
  onChange,
  onRadiusChange,
  onClear,
}: {
  area: SearchArea | null;
  radiusKm: number;
  /** Grobe Kandidatenpunkte — nur Dichte, keine Adressen. */
  candidatePoints?: { lat: number; lng: number }[];
  onChange: (a: SearchArea) => void;
  onRadiusChange?: (km: number) => void;
  onClear?: () => void;
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

  // Kurzmeldung nach einem Klick ausserhalb Deutschlands.
  const [ausland, setAusland] = useState(false);
  useEffect(() => {
    if (!ausland) return;
    const t = setTimeout(() => setAusland(false), 4000);
    return () => clearTimeout(t);
  }, [ausland]);

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      // Die Maske deckt die Nachbarlaender nur optisch ab — Klicks nahm die
      // Karte dort trotzdem entgegen und legte einen Suchbereich in Frankreich
      // oder Polen an. Wir vermitteln ausschliesslich in Deutschland.
      if (!liegtInDeutschland(lat, lng)) {
        setAusland(true);
        return;
      }
      setAusland(false);
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
            className="absolute z-[20] left-0 right-0 mt-2 overflow-hidden rounded-2xl bg-white"
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
            className="absolute z-[10] top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-medium"
            style={{ background: "rgba(26,26,46,0.94)", color: "white" }}
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#E8A838" }} />
            Standort wird ermittelt …
          </div>
        )}

        {!area && !locating && !ausland && (
          <div
            className="absolute z-[10] top-3 left-3 flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-medium pointer-events-none"
            style={{ background: "rgba(255,255,255,0.94)", color: "rgba(26,26,46,0.72)" }}
          >
            <Crosshair className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
            Auf die Karte tippen, um den Standort zu setzen
          </div>
        )}

        {/* Klick ausserhalb Deutschlands — die Meldung sagt, warum nichts
            passiert ist, statt den Klick stumm zu verschlucken. */}
        <AnimatePresence>
          {ausland && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="absolute z-[20] top-3 left-1/2 -translate-x-1/2 flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[12.5px] font-medium pointer-events-none max-w-[calc(100%-24px)]"
              style={{
                background: "rgba(26,26,46,0.95)",
                color: "white",
                border: "1px solid rgba(232,168,56,0.5)",
                boxShadow: "0 14px 30px -14px rgba(0,0,0,0.7)",
              }}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#E8A838" }} />
              Wir vermitteln derzeit nur innerhalb Deutschlands.
            </motion.div>
          )}
        </AnimatePresence>

        <MapShell
          height={340}
          center={area ? [area.lat, area.lng] : undefined}
          zoom={area ? 9 : undefined}
          fitGermany={!area}
        >
          <ClickHandler onClick={handleMapClick} />
          <MapZoom />
          <FitRadius area={area} radiusKm={radiusKm} />

          {area && (
            <>
              <Circle
                center={[area.lat, area.lng]}
                radius={radiusKm * 1000}
                pathOptions={{ color: "#E8A838", fillColor: "#E8A838", fillOpacity: 0.16, weight: 2, opacity: 0.85 }}
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
        </MapShell>

        <MapAttribution />
      </div>

      {/* ── Gewählter Bereich — identisch zur Arbeitsorte-Karte der Registrierung ── */}
      {area && (
        <div className="mt-4 space-y-2.5">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Dein Suchgebiet
          </p>
          <div
            className="rounded-2xl bg-white p-4"
            style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 2px 10px -8px rgba(26,26,46,0.2)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(232,168,56,0.14)" }}
              >
                <MapPin className="w-4 h-4" style={{ color: "#E8A838" }} />
              </span>
              <span className="text-[14px] font-semibold text-primary truncate flex-1">
                {area.label}
                {area.plz && (
                  <span className="font-normal tabular-nums" style={{ color: "rgba(26,26,46,0.45)" }}>
                    {" "}· {area.plz}
                  </span>
                )}
              </span>
              <span
                className="rounded-full px-2.5 py-1 text-[12px] font-bold tabular-nums flex-shrink-0"
                style={{ background: "rgba(26,26,46,0.06)", color: "#1A1A2E" }}
              >
                {radiusKm} km
              </span>
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  aria-label="Suchgebiet entfernen"
                  className="flex-shrink-0 transition-colors"
                  style={{ color: "rgba(26,26,46,0.3)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(26,26,46,0.3)")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <input
              type="range"
              min={5}
              max={150}
              step={5}
              value={Math.min(150, radiusKm)}
              aria-label={`Suchradius um ${area.label}`}
              onChange={(e) => onRadiusChange?.(Number(e.target.value))}
              className="w-full h-[4px] appearance-none cursor-pointer rounded-full"
              style={{
                accentColor: "#E8A838",
                background: `linear-gradient(to right, #E8A838 ${
                  ((Math.min(150, radiusKm) - 5) / 145) * 100
                }%, #E9E7E1 ${((Math.min(150, radiusKm) - 5) / 145) * 100}%)`,
              }}
            />
            <div
              className="flex justify-between mt-1.5 text-[10px] tabular-nums"
              style={{ color: "rgba(26,26,46,0.35)" }}
            >
              <span>5 km</span>
              <span>150 km</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
