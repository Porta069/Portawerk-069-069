import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import VerdienenContent from "../components/VerdienenContent";

export const metadata: Metadata = {
  title: "Verdienen — Handwerker empfehlen & Prämie kassieren | WerkPair",
  description:
    "Empfiehl Handwerker und verdiene mit. Erstelle deinen persönlichen Empfehlungs-Link, teil ihn — findet jemand über dich einen Job, bekommst du eine feste Prämie. Kostenlos & erfolgsbasiert. Mit Verdienst-Rechner.",
};

export default function VerdienenPage() {
  return (
    <main>
      <Navbar />
      <VerdienenContent />
      <Footer />
    </main>
  );
}
