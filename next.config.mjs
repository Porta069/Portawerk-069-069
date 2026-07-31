/** @type {import('next').NextConfig} */

// Backend-Origin aus der Env ableiten, damit connect-src IMMER passt.
const apiOrigin = (() => {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_API_URL ??
        "https://portbackend-069-069.onrender.com/api/v1"
    ).origin;
  } catch {
    return "https://portbackend-069-069.onrender.com";
  }
})();

// Im Dev-Server laeuft alles ueber http://localhost — dort duerfen weder
// `upgrade-insecure-requests` noch HSTS gesetzt werden, sonst zwingt der Browser
// CSS/Bilder/JS auf https, die es lokal nicht gibt: die Seite bleibt unformatiert.
const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy.
// - script-src 'unsafe-inline': Next.js injiziert Inline-Hydration-Skripte.
// - script-src 'unsafe-eval': nur im Dev noetig (React Refresh / HMR nutzt eval).
// - style-src 'unsafe-inline': die App nutzt Inline-Styles + Leaflet injiziert CSS.
// - Der eigentliche Schutzwert liegt in connect-src/img-src/form-action:
//   selbst injizierter JS-Code kann Tokens nicht an fremde Hosts exfiltrieren.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Kartenkacheln: deutschsprachige OSM-Kacheln (tile.openstreetmap.de),
  // dazu die internationalen OSM-/CARTO-Hosts als Rückfallebene.
  "img-src 'self' data: blob: https://tile.openstreetmap.de https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com",
  `connect-src 'self' ${apiOrigin} https://nominatim.openstreetmap.org${
    isDev ? " ws://localhost:* http://localhost:*" : ""
  }`,
  "font-src 'self' data:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" },
];

const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
