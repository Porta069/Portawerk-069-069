"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Hammer, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { href: "#wie-es-funktioniert", label: "Wie es funktioniert" },
  { href: "#praemie", label: "200€ Prämie" },
  { href: "#faq", label: "Fragen" },
  { href: "#betriebe", label: "Für Betriebe" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-accent flex items-center justify-center transition-transform duration-300 group-hover:scale-95">
              <Hammer className="w-4 h-4 text-primary" strokeWidth={2} />
            </div>
            <span className="text-white text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              PortaWerk
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/60 hover:text-white text-sm transition-colors duration-200 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
            {/* Trenner zwischen Navigation und Konto-Aktionen */}
            <span className="w-px h-5 bg-white/15" />
            <Link
              href="/login"
              className="text-white/60 hover:text-white text-sm transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              href="/registrieren"
              className="bg-accent text-primary text-sm font-semibold px-5 py-2.5 hover:bg-amber-400 transition-colors duration-200 whitespace-nowrap"
            >
              Jetzt registrieren
            </Link>
          </nav>

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
            <div className="px-6 py-6 flex flex-col gap-5">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-white/70 text-base hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-white/70 text-base hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/registrieren"
                onClick={() => setMobileOpen(false)}
                className="bg-accent text-primary font-semibold px-5 py-3 text-center mt-1 hover:bg-amber-400 transition-colors"
              >
                Jetzt registrieren
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
