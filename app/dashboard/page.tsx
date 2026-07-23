"use client";

// ─── Dashboard (nach Login) ───────────────────────────────────────────────────
// Validiert das JWT über GET /auth/me und zeigt die echten Kontodaten.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Hammer,
  LogOut,
  Mail,
  Phone,
  User as UserIcon,
  CalendarClock,
  ShieldCheck,
  Search,
  UserCog,
  Bell,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, hydrated, logout, setUser } = useAuth();
  const [checking, setChecking] = useState(true);

  // Auth-Guard + Token gegen /auth/me validieren
  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    let active = true;
    api.me(token).then((res) => {
      if (!active) return;
      if (res.ok) {
        setUser(res.data);
        setChecking(false);
      } else {
        // Token ungültig/abgelaufen → abmelden
        logout();
        router.replace("/login");
      }
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

  const profileItems = [
    { icon: UserIcon, label: "Name", value: `${user.firstName} ${user.lastName}`.trim() || "—" },
    { icon: Mail, label: "E-Mail", value: user.email },
    { icon: Phone, label: "Telefon", value: user.phone || "—" },
    { icon: CalendarClock, label: "Mitglied seit", value: fmtDate(user.createdAt) },
  ];

  const features = [
    { icon: Search, title: "Passende Jobs", desc: "Stellen, die zu deinem Profil passen — bald verfügbar." },
    { icon: Bell, title: "Vermittlungsanfragen", desc: "Betriebe, die dich kontaktieren möchten." },
    { icon: UserCog, title: "Profil bearbeiten", desc: "Gewerke, Erfahrung & Verfügbarkeit anpassen." },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F8F7F4", fontFamily: "var(--font-sans)" }}>
      {/* Navbar */}
      <div className="bg-primary">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent flex items-center justify-center">
              <Hammer className="w-4 h-4 text-primary" strokeWidth={2} />
            </div>
            <span className="text-white text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              PortaWerk
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
            Dein Dashboard
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white font-bold"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
          >
            Willkommen, {user.firstName || "zurück"}.
          </motion.h1>
          <p className="text-white/45 text-base mt-3 max-w-lg leading-relaxed">
            Dein Profil ist aktiv. Sobald passende Betriebe gefunden sind, erscheinen
            sie hier — wir melden uns zusätzlich persönlich.
          </p>
        </div>
      </div>

      {/* Inhalt */}
      <div className="max-w-6xl mx-auto px-6 lg:px-12 -mt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white mb-6"
          style={{ border: "1px solid #E5E7EB" }}
        >
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E5E7EB" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "rgba(26,26,46,0.4)" }}>
              Dein Konto
            </p>
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1"
              style={{ background: "rgba(34,197,94,0.10)", color: "#16A34A", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              <ShieldCheck className="w-3 h-3" />
              {user.status === "ACTIVE" ? "Aktiv" : user.status}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: "#F3F4F6" }}>
            {profileItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "rgba(26,26,46,0.4)" }}>
                      {item.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-primary leading-snug break-all">{item.value}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
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
