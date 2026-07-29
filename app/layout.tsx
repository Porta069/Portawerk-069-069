import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

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
  title: "PortaWerk — Handwerker-Jobs finden, ohne dich zu bewerben",
  description:
    "Kostenlose Jobvermittlung fürs Handwerk: Wir suchen die Jobs für dich, die Betriebe bewerben sich bei dir. Lebenslauf gratis, diskret & anonym, 200 € Startprämie. Elektriker, SHK, Maler, Tischler & mehr.",
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
    "PortaWerk",
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
