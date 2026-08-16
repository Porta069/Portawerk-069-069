"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import Logo from "@/app/components/Logo";

const NAV = [
  { href: "/", label: "Für Handwerker" },
  { href: "/arbeitgeber", label: "Für Arbeitgeber" },
  { href: "/verdienen", label: "Verdiene durch Empfehlungen" },
];

const LEGAL = [
  { href: "/rechtliches#datenschutz", label: "Datenschutzerklärung" },
  { href: "/rechtliches#nutzungsbedingungen", label: "Nutzungsbedingungen" },
  { href: "/rechtliches#impressum", label: "Impressum" },
  { href: "/rechtliches#cookies", label: "Cookie-Richtlinie" },
  // Nach dem BFSG muss die Information zur Barrierefreiheit auffindbar sein —
  // ein Abschnitt, den niemand verlinkt, erfüllt das nicht.
  { href: "/rechtliches#barrierefreiheit", label: "Barrierefreiheit" },
];

export default function Footer() {
  return (
    <footer className="bg-[#D6E6E2]" style={{ borderTop: "3px solid #F9AD07" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid md:grid-cols-3 gap-10 pb-12 border-b border-[#B9D3CD]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-5">
              <Logo height={24} />
            </Link>
            <p className="text-primary/70 text-sm leading-relaxed">
              Diskrete Jobvermittlung fürs Handwerk.
              <br />
              Teil von PortaJobs.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[#6E4A03] text-[10px] uppercase tracking-wider font-semibold mb-5">
              Navigation
            </p>
            <ul className="space-y-3.5">
              {NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary/70 text-sm hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/login" className="text-primary/70 text-sm hover:text-primary transition-colors duration-200">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/unternehmen/login" className="text-primary/70 text-sm hover:text-primary transition-colors duration-200">
                  Firmen-Login
                </Link>
              </li>
              <li>
                <Link href="/registrieren" className="text-[#8A5F04] text-sm font-semibold hover:text-primary transition-colors duration-200">
                  Jetzt registrieren
                </Link>
              </li>
            </ul>
          </div>

          {/* Netzwerk + Rechtliches */}
          <div>
            <p className="text-[#6E4A03] text-[10px] uppercase tracking-wider font-semibold mb-5">
              Netzwerk
            </p>
            <a
              href="https://porta-jobs.de"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary/70 text-sm hover:text-primary transition-colors duration-200 mb-8"
            >
              porta-jobs.de — Job-Hub
              <ExternalLink className="w-3 h-3" />
            </a>

            <p className="text-[#6E4A03] text-[10px] uppercase tracking-wider font-semibold mb-5">
              Rechtliches
            </p>
            <ul className="space-y-3.5">
              {LEGAL.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary/70 text-sm hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-primary/70 text-xs">
            © {new Date().getFullYear()} PortaWerk — ein Angebot von porta-jobs.de
          </p>
          <p className="text-primary/70 text-xs">Handwerk · Bau · Ausbau · Elektro · SHK</p>
        </div>
      </div>
    </footer>
  );
}
