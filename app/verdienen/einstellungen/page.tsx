import type { Metadata } from "next";
import PartnerSettings from "./PartnerSettings";

export const metadata: Metadata = {
  title: "Partner-Einstellungen · WerkPair",
  description:
    "Verwalte dein Partner-Konto: persönliche Daten, Auszahlungsdaten, Passwort, Datenexport und Rechtliches.",
  robots: { index: false, follow: false },
};

export default function PartnerSettingsPage() {
  return <PartnerSettings />;
}
