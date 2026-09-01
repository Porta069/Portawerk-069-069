"use client";

// ─── Navigation des Arbeitgeber-Bereichs ─────────────────────────────────────
// Baugleich zur Haupt- und Kandidaten-Leiste: eine Zeile, 80 px, Logo links,
// Bereiche mittig, Konto-Aktionen rechts.

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu, X, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Logo from "@/app/components/Logo";

const AREAS: { href: string; label: string; icon?: LucideIcon }[] = [
  { href: "/unternehmen/dashboard", label: "Kandidaten suchen" },
  { href: "/unternehmen/inserate", label: "Inserate" },
  { href: "/unternehmen/vorschlaege", label: "Vorschläge" },
  { href: "/unternehmen/bewerbungen", label: "Bewerbungen" },
  { href: "/unternehmen/anfragen", label: "Meine Anfragen" },
  // Zahnrad, damit erkennbar ist: hier werden Einstellungen gepflegt, es ist
  // kein weiterer Arbeitsbereich wie die beiden davor.
  { href: "/unternehmen/profil", label: "Unternehmensprofil", icon: Settings },
];

export default function EmployerNav({
  companyName,
  openRequests = 0,
  newApplications = 0,
  onLogout,
}: {
  companyName: string;
  openRequests?: number;
  /** Anzahl neuer (ungesehener) Bewerbungen — Badge am Nav-Punkt. */
  newApplications?: number;
  onLogout: () => void;
}) {
  const pathname = usePathname() || "";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-[#1A1A2E] shadow-[0_2px_16px_rgba(0,0,0,0.18)]">
      <div className="max-w-[1680px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-20 gap-4 xl:gap-8">
          {/* Einzug wie in der Dashboard-Leiste — siehe Begründung dort. */}
          <Link href="/arbeitgeber" className="flex items-center gap-3 group flex-shrink-0 xl:ml-8 2xl:ml-28">
            <Logo
              height={26}
              variant="hell"
              priority
              className="transition-transform duration-300 group-hover:scale-95"
            />
            <span
              className="hidden sm:inline text-[11px] font-semibold uppercase tracking-[0.16em] px-2 py-1 rounded"
              style={{ background: "rgba(232,168,56,0.16)", color: "#E8A838" }}
            >
              Betriebe
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center min-w-0">
            {AREAS.map((a) => {
              const active = pathname.startsWith(a.href);
              const badge = a.href.endsWith("anfragen")
                ? openRequests
                : a.href.endsWith("bewerbungen")
                  ? newApplications
                  : 0;
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  className={`relative inline-flex items-center gap-1.5 px-4 py-2 text-sm transition-colors duration-200 whitespace-nowrap ${
                    active ? "text-white font-semibold" : "text-white/55 hover:text-white"
                  }`}
                >
                  {a.icon && <a.icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.1} />}
                  {a.label}
                  {badge > 0 && (
                    <span
                      className="ml-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-bold tabular-nums align-middle"
                      style={{ minWidth: 20, height: 20, padding: "0 6px", background: "#E8A838", color: "#1A1A2E" }}
                    >
                      {badge}
                    </span>
                  )}
                  {active && <span className="absolute left-4 right-4 -bottom-0.5 h-[2px] bg-accent" />}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center justify-end gap-5 flex-shrink-0">
            <span
              className="text-white/55 text-sm truncate max-w-[240px] text-right"
              title={companyName}
            >
              {companyName}
            </span>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 bg-accent text-primary text-sm font-semibold px-5 py-2.5 hover:bg-amber-400 transition-colors duration-200"
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
            <div className="max-w-[1680px] mx-auto px-6 py-4 flex flex-col">
              {AREAS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  onClick={() => setMobileOpen(false)}
                  className={`inline-flex items-center gap-2 py-3 text-base ${
                    pathname.startsWith(a.href) ? "text-white font-semibold" : "text-white/60"
                  }`}
                >
                  {a.icon && <a.icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.1} />}
                  {a.label}
                </Link>
              ))}
              <button
                onClick={onLogout}
                className="mt-3 inline-flex items-center justify-center gap-2 bg-accent text-primary text-sm font-semibold px-5 py-3 w-full"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
