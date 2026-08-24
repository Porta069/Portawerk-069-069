import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ArbeitgeberContent from "../components/ArbeitgeberContent";

export const metadata: Metadata = {
  title: "Handwerker & Fachkräfte finden für Ihren Betrieb | WerkPair",
  description:
    "Qualifizierte Handwerker für Ihren Betrieb: Elektriker, SHK-Spezialisten, Maler & mehr — vorgeprüft und passgenau. Sie zahlen nur bei erfolgreicher Einstellung. Keine Vorabkosten, Rückerstattung bei Nichtantritt. Jetzt kostenlos anfragen.",
  keywords: [
    "Handwerker finden",
    "Fachkräfte für Handwerksbetriebe",
    "Personalvermittlung Handwerk",
    "Elektriker einstellen",
    "SHK Fachkräfte finden",
    "Handwerker Personalvermittlung erfolgsbasiert",
    "Mitarbeiter Handwerk finden",
    "WerkPair für Arbeitgeber",
  ],
};

export default function ArbeitgeberPage() {
  return (
    <main>
      <Navbar />
      <ArbeitgeberContent />
      <Footer />
    </main>
  );
}
