"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hammer, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Drei Zielgruppen-Welten, umschaltbar über die Kopfleiste.
const AUDIENCES = [
  { href: "/", label: "Für Handwerker" },
  { href: "/arbeitgeber", label: "Für Arbeitgeber" },
  { href: "/empfehlen", label: "Empfehlen & verdienen" },
];

// Kontextabhängige Konto-Aktionen je Zielgruppe.
function ctaFor(pathname: string) {
  if (pathname.startsWith("/arbeitgeber")) {
    return {
      login: "/unternehmen/login",
      label: "Kontakt aufnehmen",
      href: "mailto:kontakt@portawerk.de",
    };
  }
  if (pathname.startsWith("/empfehlen")) {
    return { login: "/login", label: "Partner werden", href: "/empfehlen#partner" };
  }
  return { login: "/login", label: "Jetzt registrieren", href: "/registrieren" };
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cta = ctaFor(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#1A1A2E] ${
        scrolled ? "shadow-[0_2px_16px_rgba(0,0,0,0.18)]" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
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

          {/* Zielgruppen-Tabs */}
          <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {AUDIENCES.map((a) => {
              const active = isActive(pathname, a.href);
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  className={`relative px-4 py-2 text-sm transition-colors duration-200 whitespace-nowrap ${
                    active ? "text-white font-semibold" : "text-white/55 hover:text-white"
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
            <Link
              href={cta.login}
              className="text-white/55 hover:text-white text-sm transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              href={cta.href}
              className="bg-accent text-primary text-sm font-semibold px-5 py-2.5 hover:bg-amber-400 transition-colors duration-200 whitespace-nowrap"
            >
              {cta.label}
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-1"
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
            className="lg:hidden bg-[#1A1A2E] border-t border-white/10 overflow-hidden"
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
                      active ? "text-accent font-semibold" : "text-white/75 hover:text-white"
                    }`}
                  >
                    {a.label}
                  </Link>
                );
              })}
              <div className="h-px bg-white/10 my-3" />
              <Link
                href={cta.login}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-base text-white/75 hover:text-white transition-colors"
              >
                Login
              </Link>
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
