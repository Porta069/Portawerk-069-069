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

// Content-Security-Policy.
// - script-src 'unsafe-inline': Next.js injiziert Inline-Hydration-Skripte.
// - style-src 'unsafe-inline': die App nutzt Inline-Styles + Leaflet injiziert CSS.
// - Der eigentliche Schutzwert liegt in connect-src/img-src/form-action:
//   selbst injizierter JS-Code kann Tokens nicht an fremde Hosts exfiltrieren.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
  `connect-src 'self' ${apiOrigin} https://nominatim.openstreetmap.org`,
  "font-src 'self' data:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
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
