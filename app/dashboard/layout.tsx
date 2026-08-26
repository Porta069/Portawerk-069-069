"use client";

// ─── Dashboard-Hülle ──────────────────────────────────────────────────────────
// Auth-Guard und Navigation liegen hier, damit alle vier Bereiche denselben
// Rahmen teilen und die Prüfung nicht pro Seite wiederholt wird.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";
import { listOffers } from "@/lib/jobsService";
import DashboardNav, { type NavBadges } from "@/app/components/dashboard/DashboardNav";
import VerificationReminder from "@/app/components/VerificationReminder";

/**
 * Vorschau ohne Login — NUR im Dev-Server.
 *
 * Aufruf mit `?preview=1`. `process.env.NODE_ENV` ist im Produktions-Build
 * "production", die Bedingung also dort dauerhaft false: der Bypass existiert
 * live schlicht nicht, auch wenn jemand den Parameter anhängt.
 */
function useDevPreview(): boolean {
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    setPreview(new URLSearchParams(window.location.search).get("preview") === "1");
  }, []);
  return preview;
}

/** Anzeige-Nutzer für die Vorschau — es wird keine Session erzeugt. */
const PREVIEW_USER = {
  id: "preview",
  email: "vorschau@porta-werk.de",
  firstName: "Vorschau",
  lastName: "",
  phone: "+49 170 0000000",
  role: "APPLICANT" as const,
  companyName: null,
  emailVerified: true,
  phoneVerified: true,
  avatar: null,
  status: "ACTIVE",
  createdAt: new Date(0).toISOString(),
  lastLoginAt: null,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token, hydrated, logout, setUser } = useAuth();
  const [checking, setChecking] = useState(true);
  const [badges, setBadges] = useState<NavBadges>({});
  const devPreview = useDevPreview();

  // Auth-Guard + Token gegen /auth/me validieren.
  //
  // Die Prüfung läuft im HINTERGRUND: liegt aus der gespeicherten Sitzung
  // bereits ein passender Nutzer vor, wird der Bereich sofort gerendert und
  // die Seiten laden ihre Daten parallel zur Prüfung — das spart auf dem Handy
  // eine komplette Serverrunde vor dem ersten sichtbaren Inhalt. Schlägt die
  // Prüfung fehl, wird wie bisher ausgeloggt und umgeleitet.
  useEffect(() => {
    if (!hydrated) return;

    // Dev-Vorschau: Guard überspringen, Anzeige-Nutzer setzen, kein Token.
    if (devPreview) {
      setUser(PREVIEW_USER);
      setChecking(false);
      return;
    }

    if (!token) {
      router.replace("/login");
      return;
    }

    // Bekannter Nutzer aus der Sitzung → sofort anzeigen (bzw. umleiten).
    if (user) {
      if (user.role === "EMPLOYER") {
        router.replace("/unternehmen/dashboard");
        return;
      }
      setChecking(false);
    }

    let active = true;
    api.me(token).then((res) => {
      if (!active) return;
      if (res.ok) {
        if (res.data.role === "EMPLOYER") {
          router.replace("/unternehmen/dashboard");
          return;
        }
        setUser(res.data);
        setChecking(false);
      } else if (res.status === 401) {
        // Nur bei echter Ablehnung abmelden — ein Netzwerkaussetzer darf die
        // Sitzung nicht kosten.
        logout();
        router.replace("/login");
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, token, devPreview]);

  // Zähler für offene Angebote in der Navigation
  useEffect(() => {
    if (checking) return;
    let active = true;
    listOffers().then((res) => {
      if (!active || !res.ok) return;
      setBadges({ angebote: res.data.filter((o) => o.status === "neu").length });
    });
    return () => {
      active = false;
    };
  }, [checking]);

  const handleLogout = async () => {
    if (token) await api.logout(token);
    logout();
    router.push("/");
  };

  if (!hydrated || checking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
      </div>
    );
  }

  return (
    // `overflow-x: clip` erlaubt Seiten, mit `.vollbreite` aus dem zentrierten
    // Inhaltsbereich auszubrechen, ohne dass ein waagerechter Balken entsteht.
    // Bewusst clip statt hidden: hidden würde einen Scrollcontainer aufmachen
    // und die klebende Kopfleiste stünde nicht mehr.
    <div
      className="min-h-screen bg-surface overflow-x-clip"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {token && !devPreview && (
        <VerificationReminder user={user} token={token} onUpdate={setUser} />
      )}
      <DashboardNav badges={badges} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10">{children}</main>
    </div>
  );
}
