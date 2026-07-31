"use client";

// ─── Dashboard-Navigation ─────────────────────────────────────────────────────
// Fünf Bereiche. Die ersten vier bilden den Bewerbungsweg ab, "Verdienen" ist
// unser struktureller Unterschied: der Handwerker ist nicht nur Kandidat,
// sondern kann selbst vermitteln.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Search, Inbox, FileText, Euro, Settings, LogOut, Hammer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavBadges {
  angebote?: number;
  bewerbungen?: number;
}

const AREAS: { href: string; label: string; icon: LucideIcon; key?: keyof NavBadges }[] = [
  { href: "/dashboard", label: "Übersicht", icon: LayoutDashboard },
  { href: "/dashboard/jobboerse", label: "Jobbörse", icon: Search },
  { href: "/dashboard/angebote", label: "Angebote", icon: Inbox, key: "angebote" },
  { href: "/dashboard/bewerbungen", label: "Bewerbungen", icon: FileText, key: "bewerbungen" },
  { href: "/verdienen/dashboard", label: "Verdienen", icon: Euro },
];

export default function DashboardNav({
  badges = {},
  onLogout,
}: {
  badges?: NavBadges;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-primary">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="h-[68px] flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center transition-transform duration-200 group-hover:-rotate-6">
              <Hammer className="w-4 h-4 text-primary" strokeWidth={2.2} />
            </div>
            <span
              className="text-white text-lg font-bold tracking-tight hidden sm:block"
              style={{ fontFamily: "var(--font-display)" }}
            >
              PortaWerk
            </span>
          </Link>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/einstellungen"
              aria-label="Einstellungen"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.07)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
            >
              <Settings className="w-4 h-4" />
            </Link>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 text-sm font-medium rounded-full px-4 py-2 transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.07)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Abmelden</span>
            </button>
          </div>
        </div>

        {/* Bereiche */}
        <nav className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
          {AREAS.map((a) => {
            const active =
              a.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(a.href);
            const count = a.key ? badges[a.key] ?? 0 : 0;
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                className="relative flex items-center gap-2 px-3.5 py-3 text-[14px] font-semibold whitespace-nowrap transition-colors duration-200"
                style={{ color: active ? "#FFFFFF" : "rgba(255,255,255,0.45)" }}
              >
                <Icon className="w-4 h-4" strokeWidth={2.2} />
                {a.label}
                {count > 0 && (
                  <span
                    className="flex items-center justify-center rounded-full text-[10px] font-bold tabular-nums"
                    style={{ minWidth: 18, height: 18, padding: "0 5px", background: "#E8A838", color: "#1A1A2E" }}
                  >
                    {count}
                  </span>
                )}
                {active && (
                  <motion.span
                    layoutId="dash-nav-underline"
                    className="absolute left-2 right-2 -bottom-px h-[3px] rounded-full"
                    style={{ background: "#E8A838" }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.09)" }} />
    </header>
  );
}
