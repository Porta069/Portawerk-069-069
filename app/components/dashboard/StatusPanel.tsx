"use client";

// ─── Statuspanel der Übersicht ────────────────────────────────────────────────
// Beantwortet die eine Frage, mit der ein Handwerker sich einloggt: "Hat sich
// jemand gemeldet?" — in einem Satz, groß, ganz oben.
//
// Es ersetzt bewusst vier vorherige Elemente auf einmal: Überschrift,
// Unterzeile, die Profil-Score-Karte und die drei Schnellzugriff-Kacheln. Die
// Kacheln wiederholten exakt die Navigation zwei Zentimeter darüber — sechs
// Wege zu drei Seiten auf einem Bildschirm.
//
// Dunkel und scharfkantig, weil die Plattform das ist: Kopfleiste, Knöpfe und
// Startseite arbeiten ohne Eckenradius. Die Übersicht war mit ihren durchweg
// abgerundeten weißen Karten der einzige Bereich mit einer eigenen, weicheren
// Formensprache — genau das ließ sie wie ein Fremdkörper wirken.

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface Lage {
  /** Der Satz, der die Lage beschreibt. Steht groß im Panel. */
  ueberschrift: string;
  /** Eine Zeile Einordnung darunter. */
  unterzeile: string;
  aktion: { label: string; href: string };
  /** Wartet etwas auf eine Entscheidung? Dann Gold statt Weiß. */
  dringend: boolean;
}

/**
 * Vollständigkeitsring.
 *
 * Steckt im Panel statt in einer eigenen Karte daneben: der Wert ist Kontext
 * zum Status, keine zweite Meldung. Ohne Wert wird gar nichts gerendert —
 * ein Ring auf 0 % sähe nach Fehler aus.
 */
function Ring({ prozent }: { prozent: number }) {
  const r = 44;
  const umfang = 2 * Math.PI * r;
  return (
    <div
      className="relative flex-shrink-0"
      style={{
        width: 108,
        height: 108,
        // Der Ring liegt über dem Foto. Ohne diese Abdunklung steht die
        // Beschriftung auf einer Werkbank und ist nicht mehr zu lesen.
        background: "radial-gradient(circle, rgba(26,26,46,0.92) 46%, rgba(26,26,46,0) 74%)",
      }}
    >
      <svg width="108" height="108" viewBox="0 0 108 108" className="-rotate-90">
        <circle cx="54" cy="54" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <motion.circle
          cx="54"
          cy="54"
          r={r}
          fill="none"
          stroke="#E8A838"
          strokeWidth="2"
          strokeLinecap="square"
          strokeDasharray={umfang}
          initial={{ strokeDashoffset: umfang }}
          animate={{ strokeDashoffset: umfang - (umfang * prozent) / 100 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-[30px] font-bold tabular-nums text-white leading-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {prozent}
          <span className="text-[15px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            %
          </span>
        </span>
        <span
          className="text-[9px] uppercase mt-1.5"
          style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.18em" }}
        >
          Profil
        </span>
      </div>
    </div>
  );
}

export default function StatusPanel({
  lage,
  prozent,
  seit,
}: {
  lage: Lage;
  /** Profilvollständigkeit; null = noch nicht geladen, dann kein Ring. */
  prozent: number | null;
  /** "seit 3 Tagen" — nur wenn das Anmeldedatum plausibel ist. */
  seit?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      // Randlos über die volle Fensterbreite und ohne Abstand zur Kopfleiste:
      // das Foto soll die Seite oben abschliessen, nicht als Kachel darin
      // schwimmen. Das `-mt-10` hebt die Polsterung des Inhaltsbereichs auf.
      className="vollbreite relative overflow-hidden -mt-10 mb-10"
      style={{ background: "#1A1A2E" }}
    >
      {/* Feines Raster — gibt der Fläche Textur, ohne ein Muster zu werden.
          Reines CSS, kein Bild: kostet nichts und skaliert beliebig. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.032) 0 1px, transparent 1px 34px)," +
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.032) 0 1px, transparent 1px 34px)",
        }}
      />

      {/* Werkstattfoto rechts, in die Fläche auslaufend. Die Plattform arbeitet
          durchgehend mit echten Fotos — ohne eines wirkt der Bereich steril. */}
      <div aria-hidden className="absolute inset-y-0 right-0 w-[46%] hidden md:block">
        {/* Bewusst hero-team-werkstatt statt hero-werkstatt: letzteres hat eine
            mittlere Helligkeit von 27 von 255 und wird hinter dem Verlauf zu
            einem dunklen Fleck, den niemand als Foto erkennt. */}
        <Image
          src="/images/hero-team-werkstatt.jpg"
          alt=""
          fill
          sizes="46vw"
          className="object-cover"
          style={{ objectPosition: "center 40%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #1A1A2E 2%, rgba(26,26,46,0.9) 32%, rgba(26,26,46,0.5) 100%)",
          }}
        />
      </div>

      {/* Der Inhalt bleibt in der Spaltenbreite der Seite, obwohl die Fläche
          über das ganze Fenster läuft — sonst stünde die Überschrift am
          Fensterrand statt bündig zu allem darunter. */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-10 sm:py-14">
        <div className="flex items-center justify-between gap-8">
          <div className="min-w-0 max-w-[42rem]">
            {/* Statuszeile — der pulsierende Punkt signalisiert: es läuft.
                Wichtiger als es klingt: ohne Angebote sieht ein leeres
                Dashboard sonst kaputt aus statt wartend. */}
            <div className="flex items-center gap-2.5 mb-5">
              <span
                className="pulse-dot rounded-full flex-shrink-0"
                style={{ width: 7, height: 7, background: "#E8A838" }}
              />
              <span
                className="text-[10px] font-semibold uppercase"
                style={{ color: "#E8A838", letterSpacing: "0.22em" }}
              >
                Profil aktiv
              </span>
              {seit && (
                <>
                  <span className="h-px w-5" style={{ background: "rgba(232,168,56,0.35)" }} />
                  <span
                    className="text-[10px] uppercase"
                    style={{ color: "rgba(255,255,255,0.38)", letterSpacing: "0.16em" }}
                  >
                    {seit}
                  </span>
                </>
              )}
            </div>

            <h1
              className="font-bold leading-[1.12] mb-3"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3.3vw, 2.6rem)",
                color: lage.dringend ? "#E8A838" : "#FFFFFF",
              }}
            >
              {lage.ueberschrift}
            </h1>

            <p
              className="text-[14.5px] leading-relaxed mb-7 max-w-[34rem]"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {lage.unterzeile}
            </p>

            {/* Genau eine Handlung. Vorher standen hier drei gleichrangige
                Kacheln — wer alles gleich wichtig macht, führt niemanden. */}
            <Link
              href={lage.aktion.href}
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 text-[14px] font-bold transition-colors duration-200"
              style={{
                background: "#E8A838",
                color: "#1A1A2E",
                fontFamily: "var(--font-display)",
              }}
            >
              {lage.aktion.label}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {prozent !== null && (
            <div className="hidden lg:block">
              <Ring prozent={prozent} />
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
