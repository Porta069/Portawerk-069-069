import type { Metadata } from "next";
import PartnerDashboard from "@/app/components/PartnerDashboard";

export const metadata: Metadata = {
  title: "Partner-Dashboard · WerkPair",
  description:
    "Dein Überblick als WerkPair-Partner: verdientes Geld, geworbene und vermittelte Kandidaten, Einnahmen-Verlauf und Conversion-Rate.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <PartnerDashboard />;
}
