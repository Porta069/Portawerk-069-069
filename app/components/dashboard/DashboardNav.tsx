"use client";

// ─── Dashboard-Navigation ─────────────────────────────────────────────────────
// Baugleich zur Hauptleiste (app/components/Navbar.tsx): eine Zeile, 80 px hoch,
// Logo links, Bereiche mittig, Konto-Aktionen rechts. Fünf Bereiche — die
// ersten vier bilden den Bewerbungsweg ab, "Verdienen" ist unser struktureller
// Unterschied: der Handwerker ist nicht nur Kandidat, sondern kann vermitteln.

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, Settings, LogOut, Menu, X } from "lucide-react";

export interface NavBadges {
  angebote?: number;
  bewerbungen?: number;
}

const AREAS: { href: string; label: string; key?: keyof NavBadges }[] = [
  { href: "/dashboard", label: "Übersicht" },
  { href: "/dashboard/jobboerse", label: "Jobbörse" },
  { href: "/dashboard/angebote", label: "Angebote", key: "angebote" },
  { href: "/dashboard/bewerbungen", label: "Bewerbungen", key: "bewerbungen" },
  { href: "/verdienen/dashboard", label: "Verdienen" },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}

/** Zähler-Badge — gold auf dunkel, gut lesbar. */
function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="ml-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-bold tabular-nums align-middle"
      style={{ minWidth: 20, height: 20, padding: "0 6px", background: "#E8A838", color: "#1A1A2E" }}
    >
      {count}
    </span>
  );
}

export default function DashboardNav({
  badges = {},
  onLogout,
}: {
  badges?: NavBadges;
  onLogout: () => void;
}) {
  const pathname = usePathname() || "/dashboard";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-[#1A1A2E] shadow-[0_2px_16px_rgba(0,0,0,0.18)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="relative flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-9 h-9 bg-accent flex items-center justify-center transition-transform duration-300 group-hover:scale-95">
              <Hammer className="w-4 h-4 text-primary" strokeWidth={2} />
            </div>
            <span
              className="text-white text-xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              PortaWerk
            </span>
          </Link>

          {/* Bereiche — mittig, wie die Zielgruppen-Tabs der Hauptleiste */}
          <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {AREAS.map((a) => {
              const active = isActive(pathname, a.href);
              const count = a.key ? badges[a.key] ?? 0 : 0;
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  className={`relative px-4 py-2 text-sm transition-colors duration-200 whitespace-nowrap ${
                    active ? "text-white font-semibold" : "text-white/55 hover:text-white"
                  }`}
                >
                  {a.label}
                  <Badge count={count} />
                  {active && <span className="absolute left-4 right-4 -bottom-0.5 h-[2px] bg-accent" />}
                </Link>
              );
            })}
          </nav>

          {/* Konto-Aktionen */}
          <div className="hidden lg:flex items-center gap-5 flex-shrink-0">
            <Link
              href="/einstellungen"
              className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm transition-colors duration-200"
            >
              <Settings className="w-4 h-4" />
              Einstellungen
            </Link>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 bg-accent text-primary text-sm font-semibold px-5 py-2.5 hover:bg-amber-400 transition-colors duration-200 whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              Abmelden
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-1"
            aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobiles Menü */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden bg-[#1A1A2E]"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col">
              {AREAS.map((a) => {
                const active = isActive(pathname, a.href);
                const count = a.key ? badges[a.key] ?? 0 : 0;
                return (
                  <Link
                    key={a.href}
                    href={a.href}
                    onClick={() => setMobileOpen(false)}
                    className={`py-3 text-base transition-colors ${
                      active ? "text-white font-semibold" : "text-white/60"
                    }`}
                  >
                    {a.label}
                    <Badge count={count} />
                  </Link>
                );
              })}
              <div className="mt-3 pt-4 flex flex-col gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <Link
                  href="/einstellungen"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-2 text-white/60 text-base"
                >
                  <Settings className="w-4 h-4" />
                  Einstellungen
                </Link>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center justify-center gap-2 bg-accent text-primary text-sm font-semibold px-5 py-3 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Abmelden
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
