"use client";

import Link from "next/link";
import { ANBIETER } from "@/lib/legal";

// ─── Fußzeile ─────────────────────────────────────────────────────────────────
// Aufbau nach Vorlage: tiefes Petrol, vier Spalten mit fetter Überschrift und
// luftig gesetzten Links, darunter eine einzelne Zeile mit Copyright und den
// Pflichtangaben, durch senkrechte Striche getrennt.
//
// Kein Logo mehr — die Vorlage hat keins, und auf dieser Fläche wäre das Petrol
// des Schriftzugs ohnehin unsichtbar (1,3:1). Die Marke steht im Copyright.
//
// Die Anschrift kommt aus ANBIETER, damit Impressum und Fußzeile nicht
// auseinanderlaufen können. Eine Telefonnummer steht bewusst NICHT hier: es
// gibt noch keine. Sobald sie feststeht, gehört sie in ANBIETER und erscheint
// dann an beiden Stellen.

const SPALTEN: { titel: string; eintraege: { href: string; label: string }[] }[] = [
  {
    titel: "Für Handwerker",
    eintraege: [
      { href: "/", label: "So funktioniert es" },
      { href: "/registrieren", label: "Kostenlos registrieren" },
      { href: "/login", label: "Login" },
      { href: "/unterlagen", label: "Unterlagen einreichen" },
    ],
  },
  {
    titel: "Für Betriebe",
    eintraege: [
      { href: "/arbeitgeber", label: "Fachkräfte finden" },
      { href: "/unternehmen/login", label: "Firmen-Login" },
      { href: "mailto:kontakt@porta-werk.de", label: "Zugang anfragen" },
    ],
  },
  {
    titel: "Empfehlungen",
    eintraege: [
      { href: "/verdienen", label: "Verdiene durch Empfehlungen" },
      { href: "/verdienen/partner", label: "Partner werden" },
      { href: "/verdienen/login", label: "Partner-Login" },
    ],
  },
];

const RECHTLICHES = [
  { href: "/rechtliches#impressum", label: "Impressum" },
  { href: "/rechtliches#datenschutz", label: "Datenschutzerklärung" },
  { href: "/rechtliches#nutzungsbedingungen", label: "Allgemeine Geschäftsbedingungen" },
  { href: "/rechtliches#cookies", label: "Cookie-Richtlinie" },
  // Nach dem BFSG muss die Information zur Barrierefreiheit auffindbar sein —
  // ein Abschnitt, den niemand verlinkt, erfüllt das nicht.
  { href: "/rechtliches#barrierefreiheit", label: "Barrierefreiheit" },
];

const ueberschrift = "text-white font-semibold text-[15px] mb-4 sm:mb-7";
const zeile = "text-white/85 text-[15px] hover:text-white transition-colors duration-200 max-lg:inline-block max-lg:py-1";

export default function Footer() {
  return (
    <footer style={{ background: "#124A47" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-14 pb-10 sm:pt-20 sm:pb-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-9 sm:gap-y-14">
          {/* Anschrift — dieselbe Quelle wie das Impressum */}
          <div>
            <p className={ueberschrift}>Unternehmen</p>
            <address className="not-italic space-y-3.5">
              <p className="text-white/85 text-[15px]">{ANBIETER.name}</p>
              <p className="text-white/85 text-[15px]">{ANBIETER.strasse}</p>
              <p className="text-white/85 text-[15px]">
                {ANBIETER.plz} {ANBIETER.ort}
              </p>
              <p className="text-white/85 text-[15px]">{ANBIETER.land}</p>
              <p>
                <a href={`mailto:${ANBIETER.emailAllgemein}`} className={zeile}>
                  {ANBIETER.emailAllgemein}
                </a>
              </p>
            </address>
          </div>

          {SPALTEN.map((spalte) => (
            <div key={spalte.titel}>
              <p className={ueberschrift}>{spalte.titel}</p>
              <ul className="space-y-3.5 max-lg:space-y-2">
                {spalte.eintraege.map((e) => (
                  <li key={e.href + e.label}>
                    {e.href.startsWith("mailto:") ? (
                      <a href={e.href} className={zeile}>
                        {e.label}
                      </a>
                    ) : (
                      <Link href={e.href} className={zeile}>
                        {e.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Schlusszeile: Copyright und Pflichtangaben, durch Striche getrennt.
            Bewusst INLINE und nicht als Flex-Zeile: Flex-Kinder schrumpfen
            nicht unter ihre Inhaltsbreite, dadurch schob „Allgemeine
            Geschäftsbedingungen" auf dem Telefon die ganze Seite breiter.
            Inline-Elemente brechen an den Leerzeichen ganz von selbst um. */}
        <div className="mt-10 sm:mt-14 text-white/85 text-[15px] leading-loose max-lg:flex max-lg:flex-wrap max-lg:gap-x-5 max-lg:gap-y-0 max-lg:leading-relaxed">
          <span className="max-lg:w-full max-lg:mb-1.5">
            Copyright {new Date().getFullYear()} © {ANBIETER.name}
          </span>
          {RECHTLICHES.map((r) => (
            <span key={r.href}>
              <span aria-hidden className="text-white/40 mx-2.5 max-lg:hidden">
                |
              </span>
              <Link href={r.href} className="hover:text-white transition-colors duration-200 max-lg:inline-block max-lg:py-1.5">
                {r.label}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
