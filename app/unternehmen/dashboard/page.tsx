"use client";

// ─── Firmen-Dashboard ─────────────────────────────────────────────────────────
// Nur für EMPLOYER-Konten. Validiert das JWT über /auth/me und prüft die Rolle.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  LogOut,
  Users,
  Search,
  FileText,
  Handshake,
  Mail,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";

export default function UnternehmenDashboardPage() {
  const router = useRouter();
  const { user, token, hydrated, logout, setUser } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace("/unternehmen/login");
      return;
    }
    let active = true;
    api.me(token).then((res) => {
      if (!active) return;
      if (!res.ok) {
        logout();
        router.replace("/unternehmen/login");
        return;
      }
      if (res.data.role !== "EMPLOYER") {
        // Bewerber gehören ins normale Dashboard.
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
  }, [hydrated, token]);

  const handleLogout = async () => {
    if (token) await api.logout(token);
    logout();
    router.push("/");
  };

  if (!hydrated || checking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8F7F4" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
      </div>
    );
  }

  const features = [
    { icon: Search, title: "Fachkräfte suchen", desc: "Vorselektierte Handwerker:innen nach Gewerk & Region finden." },
    { icon: Users, title: "Kandidaten-Pool", desc: "Für dich freigeschaltete Profile einsehen." },
    { icon: Handshake, title: "Anfragen stellen", desc: "Passende Fachkräfte kontaktieren — diskret über uns." },
    { icon: FileText, title: "Vertrag & Abrechnung", desc: "Deine Konditionen und Rechnungen im Blick." },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F8F7F4", fontFamily: "var(--font-sans)" }}>
      {/* Navbar */}
      <div className="bg-primary">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" strokeWidth={2} />
            </div>
            <span className="text-white text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              PortaWerk <span className="text-accent">Business</span>
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm transition-colors duration-200"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-primary pb-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 pt-8">
          <span className="flex items-center gap-3 text-accent text-[10px] font-semibold tracking-[0.22em] uppercase mb-4">
            <span className="w-8 h-[2px] bg-accent" />
            Firmen-Bereich
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white font-bold"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
          >
            Willkommen, {user.companyName || `${user.firstName} ${user.lastName}`.trim()}.
          </motion.h1>
          <p className="text-white/45 text-base mt-3 max-w-lg leading-relaxed">
            Dein Firmenzugang ist aktiv. Hier findest du bald passende Fachkräfte
            und kannst Anfragen stellen.
          </p>
        </div>
      </div>

      {/* Inhalt */}
      <div className="max-w-6xl mx-auto px-6 lg:px-12 -mt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white mb-6 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ border: "1px solid #E5E7EB" }}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: "rgba(26,26,46,0.4)" }}>
              Firmenkonto
            </p>
            <p className="text-primary font-semibold">{user.companyName || "—"}</p>
            <p className="text-sm mt-0.5 flex items-center gap-1.5" style={{ color: "#6B7280" }}>
              <Mail className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
              {user.email}
            </p>
          </div>
          <span
            className="self-start inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1"
            style={{ background: "rgba(34,197,94,0.10)", color: "#16A34A", border: "1px solid rgba(34,197,94,0.3)" }}
          >
            Partnerbetrieb
          </span>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                className="bg-white p-6 flex flex-col"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div className="w-11 h-11 flex items-center justify-center mb-5" style={{ background: "rgba(232,168,56,0.1)" }}>
                  <Icon className="w-5 h-5" style={{ color: "#E8A838" }} strokeWidth={1.75} />
                </div>
                <h3 className="text-primary font-bold text-base mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B7280" }}>
                  {f.desc}
                </p>
                <span
                  className="mt-auto self-start text-[10px] font-semibold uppercase tracking-[0.14em] px-2 py-1"
                  style={{ background: "rgba(26,26,46,0.05)", color: "rgba(26,26,46,0.4)" }}
                >
                  Bald verfügbar
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
