import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./context/AuthContext";
import BackendStatus from "./components/BackendStatus";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { ANBIETER } from "@/lib/legal";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Strukturierte Daten zur Organisation (schema.org).
 *
 * Anschrift und Adresse kommen aus `lib/legal.ts` — dieselbe Quelle wie das
 * Impressum. Zwei getrennt gepflegte Anschriften laufen sonst auseinander,
 * und ausgerechnet bei der Anbieterkennzeichnung fällt das niemandem auf.
 */
const ORGANISATION_DATEN = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  description:
    "Kostenlose Jobvermittlung fürs Handwerk: Betriebe bewerben sich bei Handwerkern statt umgekehrt.",
  address: {
    "@type": "PostalAddress",
    streetAddress: ANBIETER.strasse,
    postalCode: ANBIETER.plz,
    addressLocality: ANBIETER.ort,
    addressCountry: "DE",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: ANBIETER.emailAllgemein,
    contactType: "customer support",
    availableLanguage: ["de"],
  },
  areaServed: "DE",
};

export const metadata: Metadata = {
  // Basis für absolute OG-/Canonical-URLs (Link-Vorschau in WhatsApp & Co.).
  //
  // Hier stand die Vercel-Vorschauadresse `werkpair-two.vercel.app`. Die
  // liefert inzwischen 404 — damit zeigte das Vorschaubild JEDER geteilten
  // Link-Vorschau ins Leere, und das `canonical` wies Suchmaschinen auf eine
  // Adresse, die niemand erreicht. Die Adresse steht jetzt an einer Stelle.
  metadataBase: new URL(SITE_URL),
  // Ohne `canonical` konkurrieren die erreichbaren Adressen (werkpair.de,
  // www.werkpair.de, die alte Vercel-Adresse) in der Suche gegeneinander und
  // teilen sich die Bewertung, statt sie zu bündeln.
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Ohne diese Vorgaben kürzt Google die Vorschau nach eigenem Ermessen.
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  title: {
    default: "WerkPair — Handwerker-Jobs finden, ohne dich zu bewerben",
    template: "%s · WerkPair",
  },
  description:
    "Kostenlose Jobvermittlung fürs Handwerk: Wir suchen die Jobs für dich, die Betriebe bewerben sich bei dir. Lebenslauf gratis, diskret & anonym, 200 € Startprämie. Elektriker, SHK, Maler, Tischler & mehr.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: SITE_NAME,
    title: "WerkPair — Der Job findet dich",
    description:
      "Betriebe bewerben sich bei Handwerkern — diskret, anonym, kostenlos. Jetzt Profil anlegen und Angebote erhalten.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WerkPair — Der Job findet dich",
    description:
      "Betriebe bewerben sich bei Handwerkern — diskret, anonym, kostenlos.",
  },
  keywords: [
    "Handwerker Jobs",
    "Job im Handwerk",
    "Jobvermittlung Handwerk",
    "Handwerk Jobs ohne Bewerbung",
    "kostenloser Lebenslauf Handwerker",
    "Elektriker Job",
    "Installateur SHK Job",
    "Maler Job",
    "Tischler Job",
    "Handwerk Stellenangebote",
    "WerkPair",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${playfair.variable} ${inter.variable}`}>
        {/* ── Sprungmarke ──
            Wer mit der Tastatur navigiert, musste sich bisher auf JEDER Seite
            zuerst durch die komplette Kopfleiste tabben, bevor der Inhalt kam.
            Der Link ist unsichtbar, bis er den Fokus bekommt — dann steht er
            oben links. Verpflichtend nach WCAG 2.4.1 und die billigste
            Barrierefreiheits-Verbesserung überhaupt. */}
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2.5 focus:text-[14px] focus:font-bold focus:rounded-full"
          style={{ background: "#E8A838", color: "#1A1A2E" }}
        >
          Zum Inhalt springen
        </a>

        {/* Strukturierte Daten: Damit Google Name, Logo und Anschrift des
            Anbieters als zusammengehörig erkennt statt sie aus dem Fließtext
            zu raten. Grundlage für den Wissenspanel-Eintrag der Marke. */}
        <script
          type="application/ld+json"
          // Die Werte sind feste Konstanten aus `lib/legal.ts`. Das `<` wird
          // trotzdem maskiert: Sobald dort jemand einen Text mit „</script>"
          // einträgt — etwa in einer künftigen Beschreibung —, bräche der
          // sonst aus dem Skript-Element aus. Die Maskierung kostet nichts und
          // macht die Stelle unabhängig davon, was später in den Konstanten
          // steht.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORGANISATION_DATEN).replace(/</g, "\\u003c"),
          }}
        />

        <AuthProvider>
          <div id="inhalt">{children}</div>
          <BackendStatus />
        </AuthProvider>
        {/* Cookiefreie Seitenaufruf-Statistik (Vercel Web Analytics). */}
        <Analytics />
      </body>
    </html>
  );
}
