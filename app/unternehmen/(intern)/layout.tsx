"use client";

// ─── Hülle des Arbeitgeber-Bereichs ──────────────────────────────────────────
// Liegt in der Routengruppe (intern), damit /unternehmen/login NICHT vom
// Auth-Guard erfasst wird. Die URLs bleiben /unternehmen/dashboard und
// /unternehmen/anfragen — Routengruppen erscheinen nicht im Pfad.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";
import { listRequests, listEmployerApplications } from "@/lib/employerService";
import EmployerNav from "@/app/components/employer/EmployerNav";

/** Vorschau ohne Login — nur im Dev-Server, siehe app/dashboard/layout.tsx. */
function useDevPreview(): boolean {
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    setPreview(new URLSearchParams(window.location.search).get("preview") === "1");
  }, []);
  return preview;
}

const PREVIEW_EMPLOYER = {
  id: "preview-employer",
  email: "vorschau@betrieb.de",
  firstName: "Vorschau",
  lastName: "",
  phone: "",
  role: "EMPLOYER" as const,
  companyName: "Muster Elektrotechnik GmbH",
  emailVerified: true,
  phoneVerified: true,
  avatar: null,
  status: "ACTIVE",
  createdAt: new Date(0).toISOString(),
  lastLoginAt: null,
};

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token, hydrated, logout, setUser } = useAuth();
  const [checking, setChecking] = useState(true);
  const [openRequests, setOpenRequests] = useState(0);
  const [newApplications, setNewApplications] = useState(0);
  const devPreview = useDevPreview();

  useEffect(() => {
    if (!hydrated) return;

    if (devPreview) {
      setUser(PREVIEW_EMPLOYER);
      setChecking(false);
      return;
    }

    if (!token) {
      router.replace("/unternehmen/login");
      return;
    }

    // Bekannter Betrieb aus der Sitzung → sofort rendern, Prüfung läuft
    // parallel weiter (spart eine Serverrunde vor dem ersten Inhalt).
    if (user) {
      if (user.role !== "EMPLOYER") {
        router.replace("/dashboard");
        return;
      }
      setChecking(false);
    }

    let active = true;
    api.me(token).then((res) => {
      if (!active) return;
      if (!res.ok) {
        // Nur bei echter Ablehnung abmelden, nicht bei Netzwerkaussetzern.
        if (res.status === 401) {
          logout();
          router.replace("/unternehmen/login");
        }
        return;
      }
      if (res.data.role !== "EMPLOYER") {
        // Handwerker gehören ins Kandidaten-Dashboard.
        router.replace("/dashboard");
        return;
      }
      setUser(res.data);
      setChecking(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, token, devPreview]);

  useEffect(() => {
    if (checking) return;
    listRequests().then((res) => {
      if (res.ok) setOpenRequests(res.data.filter((r) => r.status === "angefragt").length);
    });
    listEmployerApplications().then((res) => {
      if (res.ok) setNewApplications(res.data.filter((a) => a.status === "gesendet").length);
    });
  }, [checking]);

  const handleLogout = async () => {
    if (token) await api.logout(token);
    logout();
    router.push("/arbeitgeber");
  };

  if (!hydrated || checking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface" style={{ fontFamily: "var(--font-sans)" }}>
      <EmployerNav
        companyName={user.companyName || `${user.firstName} ${user.lastName}`.trim()}
        openRequests={openRequests}
        newApplications={newApplications}
        onLogout={handleLogout}
      />
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10">{children}</main>
    </div>
  );
}
