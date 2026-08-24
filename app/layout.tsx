import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./context/AuthContext";
import BackendStatus from "./components/BackendStatus";

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

export const metadata: Metadata = {
  // Basis für absolute OG-/Canonical-URLs (Link-Vorschau in WhatsApp & Co.).
  metadataBase: new URL("https://werkpair-two.vercel.app"),
  title: {
    default: "WerkPair — Handwerker-Jobs finden, ohne dich zu bewerben",
    template: "%s · WerkPair",
  },
  description:
    "Kostenlose Jobvermittlung fürs Handwerk: Wir suchen die Jobs für dich, die Betriebe bewerben sich bei dir. Lebenslauf gratis, diskret & anonym, 200 € Startprämie. Elektriker, SHK, Maler, Tischler & mehr.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "WerkPair",
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
        <AuthProvider>
          {children}
          <BackendStatus />
        </AuthProvider>
        {/* Cookiefreie Seitenaufruf-Statistik (Vercel Web Analytics). */}
        <Analytics />
      </body>
    </html>
  );
}
