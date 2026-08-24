import type { Metadata } from "next";
import PartnerFunnel from "../../components/PartnerFunnel";

export const metadata: Metadata = {
  title: "Partner werden — Empfehlungs-Link erstellen | WerkPair",
  description:
    "Registrier dich als WerkPair-Partner: Nummer bestätigen, Wunsch-Link wählen und bei jeder Vermittlung 100 € verdienen.",
};

export default function PartnerRegistrierenPage() {
  return (
    <main>
      <PartnerFunnel />
    </main>
  );
}
