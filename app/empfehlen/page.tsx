import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EmpfehlenContent from "../components/EmpfehlenContent";

export const metadata: Metadata = {
  title: "Empfehlen & verdienen — Partnerprogramm | PortaWerk",
  description:
    "Empfiehl Handwerker und verdiene mit. Teil deinen Link — findet jemand über dich einen Job, bekommst du eine feste Belohnung. Kostenlos & erfolgsbasiert.",
};

export default function EmpfehlenPage() {
  return (
    <main>
      <Navbar />
      <EmpfehlenContent />
      <Footer />
    </main>
  );
}
