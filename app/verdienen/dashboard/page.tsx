import type { Metadata } from "next";
import PartnerDashboard from "@/app/components/PartnerDashboard";

export const metadata: Metadata = {
  title: "Partner-Dashboard · PortaWerk",
  description:
    "Dein Überblick als PortaWerk-Partner: verdientes Geld, geworbene und vermittelte Kandidaten, Einnahmen-Verlauf und Conversion-Rate.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <PartnerDashboard />;
}
