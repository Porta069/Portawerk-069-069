import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ArbeitgeberContent from "../components/ArbeitgeberContent";

export const metadata: Metadata = {
  title: "Für Handwerksbetriebe — Personal finden | PortaWerk",
  description:
    "Vorgeprüfte Handwerker für Ihren Betrieb. Sie zahlen nur, wenn es klappt — keine Vorabkosten, keine Agenturgebühren. Diskret & schnell besetzen.",
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
