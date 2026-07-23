// ─── Rechtliche Informationen & Bedingungen ──────────────────────────────────
// Scrollbare Seite mit Datenschutz, Nutzungsbedingungen, Impressum & Cookies.
// ACHTUNG: Platzhalter-Texte — vor Live-Gang anwaltlich prüfen lassen.

import Link from "next/link";
import { Hammer, ArrowLeft, AlertTriangle } from "lucide-react";
import { legalSections } from "@/lib/legal";

export const metadata = {
  title: "Rechtliches — PortaWerk",
  description: "Datenschutzerklärung, Nutzungsbedingungen, Impressum und Cookie-Richtlinie.",
};

export default function RechtlichesPage() {
  const sections = legalSections();

  return (
    <div className="min-h-screen" style={{ background: "#F8F7F4", fontFamily: "var(--font-sans)" }}>
      {/* ── Navbar ── */}
      <div className="sticky top-0 z-50 bg-primary">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent flex items-center justify-center">
              <Hammer className="w-4 h-4 text-primary" strokeWidth={2} />
            </div>
            <span className="text-white text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              PortaWerk
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Startseite
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-14">
        <span className="flex items-center gap-3 text-accent text-[10px] font-semibold tracking-[0.22em] uppercase mb-5">
          <span className="w-8 h-[2px] bg-accent" />
          Rechtliches
        </span>
        <h1
          className="text-primary font-bold leading-tight mb-6"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)" }}
        >
          Informationen & Bedingungen
        </h1>

        {/* Platzhalter-Warnung */}
        <div
          className="flex items-start gap-3 px-5 py-4 mb-10"
          style={{ background: "rgba(232,168,56,0.08)", border: "1px solid rgba(232,168,56,0.3)" }}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#B47B18" }} />
          <p className="text-[13px] leading-relaxed" style={{ color: "rgba(26,26,46,0.65)" }}>
            <strong>Hinweis:</strong> Alle folgenden Texte sind Platzhalter und müssen
            vor dem Live-Gang von einer Rechtsanwältin oder einem Rechtsanwalt geprüft
            und angepasst werden.
          </p>
        </div>

        {/* Inhaltsverzeichnis */}
        <nav className="flex flex-wrap gap-2 mb-14">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-xs text-primary/70 border border-border px-3 py-1.5 hover:border-accent hover:text-primary transition-colors"
            >
              {s.title}
            </a>
          ))}
        </nav>

        {/* Abschnitte */}
        <div className="space-y-16">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              style={{ scrollMarginTop: "88px" }}
            >
              <h2
                className="text-primary font-bold text-2xl md:text-3xl mb-6 pb-3"
                style={{ fontFamily: "var(--font-display)", borderBottom: "2px solid #E8A838" }}
              >
                {section.title}
              </h2>
              <div className="space-y-6">
                {section.blocks.map((block, i) => (
                  <div key={i}>
                    {block.heading && (
                      <h3 className="text-primary font-semibold text-base mb-1.5">
                        {block.heading}
                      </h3>
                    )}
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(26,26,46,0.6)" }}>
                      {block.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8" style={{ borderTop: "1px solid #E5E7EB" }}>
          <Link
            href="/registrieren"
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: "#E8A838" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Registrierung
          </Link>
        </div>
      </div>
    </div>
  );
}
