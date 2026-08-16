"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";
import Logo from "@/app/components/Logo";

// Drei Zielgruppen-Welten, umschaltbar über die Kopfleiste.
const AUDIENCES = [
  { href: "/", label: "Für Handwerker" },
  { href: "/arbeitgeber", label: "Für Arbeitgeber" },
  { href: "/verdienen", label: "Verdiene durch Empfehlungen" },
];

// Kontextabhängige Konto-Aktionen je Zielgruppe.
function ctaFor(pathname: string) {
  if (pathname.startsWith("/arbeitgeber")) {
    return {
      login: "/unternehmen/login",
      loginLabel: "Unternehmen-Login",
      label: "Kontakt aufnehmen",
      href: "mailto:kontakt@porta-werk.de",
    };
  }
  if (pathname.startsWith("/verdienen")) {
    // Eigener Partner-Login/-Register, damit es NICHT mit dem Haupt-Login /
    // der Handwerker-Registrierung verwechselt wird.
    return {
      login: "/verdienen/login",
      loginLabel: "Partner-Login",
      label: "Partner werden",
      href: "/verdienen/partner",
    };
  }
  return {
    login: "/login",
    loginLabel: "Login",
    label: "Jetzt registrieren",
    href: "/registrieren",
  };
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cta = ctaFor(pathname);

  // Angemeldete Handwerker sollen jederzeit zurueck in ihren Bereich wechseln
  // koennen — sonst ist die Verdienen-Sektion eine Sackgasse.
  const { user, hydrated } = useAuth();
  const showDashboard = hydrated && !!user && !pathname.startsWith("/dashboard");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-[#E4DFD3] ${
        scrolled ? "shadow-[0_2px_16px_rgba(12,51,48,0.10)]" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            {/* Weiß statt dunkel: nur auf hellem Grund zeigt das Logo sein
                Petrol (7,5:1). Auf der früheren dunklen Leiste lag es bei
                2,3:1 — dort musste „WERK" weiß gesetzt werden. */}
            <Logo
              height={26}
              priority
              className="transition-transform duration-300 group-hover:scale-95"
            />
          </Link>

          {/* Zielgruppen-Tabs */}
          <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {AUDIENCES.map((a) => {
              const active = isActive(pathname, a.href);
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  className={`relative px-4 py-2 text-sm transition-colors duration-200 whitespace-nowrap ${
                    active ? "text-primary font-semibold" : "text-primary/55 hover:text-primary"
                  }`}
                >
                  {a.label}
                  {active && (
                    <span className="absolute left-4 right-4 -bottom-0.5 h-[2px] bg-accent" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Konto-Aktionen (kontextabhängig) */}
          <div className="hidden lg:flex items-center gap-5 flex-shrink-0">
            {showDashboard ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-primary/55 hover:text-primary text-sm transition-colors duration-200 whitespace-nowrap"
              >
                <LayoutDashboard className="w-4 h-4" />
                Meine Bewerbungen
              </Link>
            ) : (
              <Link
                href={cta.login}
                className="text-primary/55 hover:text-primary text-sm transition-colors duration-200"
              >
                {cta.loginLabel}
              </Link>
            )}
            <Link
              href={cta.href}
              className="bg-accent text-primary text-sm font-semibold px-5 py-2.5 hover:bg-amber-400 transition-colors duration-200 whitespace-nowrap"
            >
              {cta.label}
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-primary p-1"
            aria-label="Menü öffnen"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden bg-white border-t border-[#E4DFD3] overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-1">
              {AUDIENCES.map((a) => {
                const active = isActive(pathname, a.href);
                return (
                  <Link
                    key={a.href}
                    href={a.href}
                    onClick={() => setMobileOpen(false)}
                    className={`py-2.5 text-base transition-colors ${
                      active ? "text-[#8A5F04] font-semibold" : "text-primary/70 hover:text-primary"
                    }`}
                  >
                    {a.label}
                  </Link>
                );
              })}
              <div className="h-px bg-[#E4DFD3] my-3" />
              {showDashboard ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-2 py-2 text-base text-primary/70 hover:text-primary transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Meine Bewerbungen
                </Link>
              ) : (
                <Link
                  href={cta.login}
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-base text-primary/70 hover:text-primary transition-colors"
                >
                  {cta.loginLabel}
                </Link>
              )}
              <Link
                href={cta.href}
                onClick={() => setMobileOpen(false)}
                className="bg-accent text-primary font-semibold px-5 py-3 text-center mt-1 hover:bg-amber-400 transition-colors"
              >
                {cta.label}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
