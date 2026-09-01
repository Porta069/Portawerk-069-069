// ─── Adresse der Seite ────────────────────────────────────────────────────────
// EINE Quelle für die öffentliche Adresse. Sie steckt in den Metadaten, in
// robots.txt, in der Sitemap und in security.txt — läuft sie auseinander,
// zeigen Link-Vorschauen und Suchmaschinen auf die falsche Domain.
//
// Vorher stand in `layout.tsx` als `metadataBase` die Vercel-Vorschauadresse
// `werkpair-two.vercel.app`. Die ist inzwischen tot (404), also war das
// Vorschaubild JEDER geteilten Link-Vorschau — WhatsApp, LinkedIn, Slack —
// ein Bild, das es nicht gibt. Gleichzeitig wies das `canonical` Suchmaschinen
// auf eine Adresse, die niemand erreichen kann.
//
// `NEXT_PUBLIC_SITE_URL` erlaubt es, eine Vorschau-Umgebung auf sich selbst
// zeigen zu lassen. Ohne die Variable gilt die Produktionsadresse.

const roh = process.env.NEXT_PUBLIC_SITE_URL?.trim();

/** Öffentliche Basis-Adresse, ohne Schrägstrich am Ende. */
export const SITE_URL = (roh && /^https?:\/\//.test(roh) ? roh : "https://www.werkpair.de")
  .replace(/\/+$/, "");

export const SITE_NAME = "WerkPair";

/**
 * Bereiche hinter der Anmeldung.
 *
 * Sie stehen in robots.txt und fehlen in der Sitemap. Das ist keine
 * Zugriffskontrolle — die macht das Backend —, sondern verhindert, dass
 * Suchmaschinen Anmelde- und Kontoseiten indexieren und Nutzer aus der Suche
 * auf einer Seite landen, die ohne Sitzung leer ist.
 */
export const GESCHUETZTE_PFADE = [
  "/dashboard",
  "/einstellungen",
  "/unternehmen/anfragen",
  "/unternehmen/bewerbungen",
  "/unternehmen/dashboard",
  "/unternehmen/inserate",
  "/unternehmen/profil",
  "/unternehmen/vorschlaege",
  "/verdienen/dashboard",
  "/verdienen/einstellungen",
  "/verdienen/partner",
  "/verify-email",
  "/api",
];

/**
 * Öffentliche Seiten mit ihrer Bedeutung für die Sitemap.
 *
 * `/r/[slug]` fehlt bewusst: Das sind persönliche Empfehlungslinks einzelner
 * Partner. In einer Sitemap wären sie öffentlich auffindbar — genau das
 * Gegenteil ihres Zwecks.
 */
export const OEFFENTLICHE_SEITEN: { pfad: string; prioritaet: number; takt: "weekly" | "monthly" | "yearly" }[] = [
  { pfad: "/", prioritaet: 1.0, takt: "weekly" },
  { pfad: "/registrieren", prioritaet: 0.9, takt: "monthly" },
  { pfad: "/arbeitgeber", prioritaet: 0.8, takt: "monthly" },
  { pfad: "/verdienen", prioritaet: 0.7, takt: "monthly" },
  { pfad: "/unterlagen", prioritaet: 0.6, takt: "monthly" },
  { pfad: "/login", prioritaet: 0.4, takt: "yearly" },
  { pfad: "/unternehmen/login", prioritaet: 0.4, takt: "yearly" },
  { pfad: "/verdienen/login", prioritaet: 0.3, takt: "yearly" },
  { pfad: "/rechtliches", prioritaet: 0.3, takt: "yearly" },
];
