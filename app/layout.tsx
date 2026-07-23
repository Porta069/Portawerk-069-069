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
  title: "PortaWerk — Handwerker-Jobs, diskret vermittelt",
  description:
    "Die Jobbörse fürs Handwerk. Elektriker, Installateure, Maler, Tischler & mehr — vorselektiert werden statt Bewerbungen schreiben. Diskret, kostenlos, persönlich.",
  keywords: [
    "Handwerker Jobs",
    "Elektriker Job",
    "Installateur Job",
    "Maler Job",
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
