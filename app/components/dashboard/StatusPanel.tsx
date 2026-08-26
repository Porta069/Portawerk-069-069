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
// Randlos über die volle Fensterbreite, direkt unter der Kopfleiste: das Foto
// soll die Seite oben abschliessen. Als Kachel mit Rand ringsum schwamm es in
// der Fläche und wirkte wie ein Aushang statt wie der Kopf der Seite.

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";

export interface Lage {
  /** Der Satz, der die Lage beschreibt. Steht groß im Panel. */
  ueberschrift: string;
  /** Eine Zeile Einordnung darunter. */
  unterzeile: string;
  aktion: { label: string; href: string };
  /** Wartet etwas auf eine Entscheidung? Dann Gold statt Weiß. */
  dringend: boolean;
  /**
   * Wartezustand: die Statuszeile meldet dann, dass Betriebe gerade suchen,
   * und der Knopf bekommt eine Lupe. Liegt eine Zusage vor, wäre beides eine
   * Ablenkung von der Entscheidung.
   */
  zweiWege?: boolean;
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

/**
 * Radar — zeigt, dass gerade gesucht wird.
 *
 * Die rechte Hälfte des Banners war leer: alles klebte links, das Foto lief ins
 * Nichts. Hier steht jetzt ein Element, das genau das anzeigt, was die Seite
 * behauptet — dass in diesem Moment Betriebe suchen. Drei Wellen laufen aus der
 * Mitte nach aussen, im Kern glüht der Punkt in demselben Gold wie überall.
 *
 * Liegt ein Profilwert vor, sitzt der Ring im Kern statt des Punktes: dieselbe
 * Grafik, zwei Aussagen — es läuft, und so weit bist du.
 */
function Radar({ prozent }: { prozent: number | null }) {
  return (
    <div className="relative flex flex-col items-center flex-shrink-0" style={{ width: 172 }}>
      <div className="relative" style={{ width: 172, height: 172 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden
            className="radar-welle absolute inset-0 rounded-full"
            style={{
              border: "1.5px solid rgba(232,168,56,0.45)",
              animationDelay: `${i}s`,
            }}
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          {prozent !== null ? (
            <Ring prozent={prozent} />
          ) : (
            <span
              className="punkt-glut rounded-full"
              style={{ width: 16, height: 16, background: "#E8A838" }}
            />
          )}
        </div>
      </div>

      <p
        className="text-[9.5px] font-semibold uppercase text-center rounded-full px-3.5 py-1.5 -mt-1"
        style={{
          color: "rgba(255,255,255,0.75)",
          letterSpacing: "0.18em",
          // Ohne eigenen Grund steht die Zeile auf einer Werkbank und
          // verschwindet — der Punkt darüber trägt sich selbst, Text nicht.
          background: "rgba(26,26,46,0.72)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        Suche läuft
      </p>
    </div>
  );
}

export default function StatusPanel({
  lage,
  prozent,
}: {
  lage: Lage;
  /** Profilvollständigkeit; null = noch nicht geladen, dann kein Ring. */
  prozent: number | null;
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
      <div aria-hidden className="absolute inset-y-0 right-0 w-[54%] hidden md:block">
        {/* Bewusst hero-team-werkstatt statt hero-werkstatt: letzteres hat eine
            mittlere Helligkeit von 27 von 255 und wird hinter dem Verlauf zu
            einem dunklen Fleck, den niemand als Foto erkennt. */}
        <Image
          src="/images/hero-team-werkstatt.jpg"
          alt=""
          fill
          sizes="54vw"
          className="object-cover"
          style={{ objectPosition: "center 40%", filter: "brightness(1.16)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #1A1A2E 0%, rgba(26,26,46,0.86) 26%, rgba(26,26,46,0.34) 100%)",
          }}
        />
      </div>

      {/* Der Inhalt bleibt in der Spaltenbreite der Seite, obwohl die Fläche
          über das ganze Fenster läuft — sonst stünde die Überschrift am
          Fensterrand statt bündig zu allem darunter. */}
      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 py-11 sm:py-14">
        <div className="flex items-center gap-10 xl:gap-16">
          <div className="min-w-0 max-w-[36rem]">
            {/* Der Slogan steht ganz oben — vorher lag eine Kleinschriftzeile
                darüber, die ihn nach unten drückte und die Aussage doppelte. */}
            <h1
              className="font-bold leading-[1.12] mb-4"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3.3vw, 2.6rem)",
                color: lage.dringend ? "#E8A838" : "#FFFFFF",
              }}
            >
              {lage.ueberschrift}
            </h1>

            {/* Die Zeile darunter trägt jetzt den Live-Zustand: glühender Punkt
                und glühende Schrift, beide im selben 2,2-Sekunden-Takt. Damit
                sagt sie nicht nur, dass gesucht wird — man sieht es. */}
            <p
              className="flex items-start gap-3 text-[15px] leading-relaxed mb-7 max-w-[24rem]"
              style={{ color: lage.zweiWege ? "#E8A838" : "rgba(255,255,255,0.55)" }}
            >
              {lage.zweiWege && (
                <span
                  className="punkt-glut rounded-full flex-shrink-0 mt-[7px]"
                  style={{ width: 9, height: 9, background: "#E8A838" }}
                />
              )}
              <span className={lage.zweiWege ? "text-glut font-medium" : undefined}>
                {lage.unterzeile}
              </span>
            </p>

            <Link
              href={lage.aktion.href}
              className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-[14px] font-bold rounded-full transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                background: "#E8A838",
                color: "#1A1A2E",
                fontFamily: "var(--font-display)",
                boxShadow: "0 16px 32px -16px rgba(232,168,56,0.85)",
              }}
            >
              {lage.zweiWege && <Search className="w-4 h-4" />}
              {lage.aktion.label}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Nur im Wartezustand — liegt ein Angebot vor, wäre "Suche läuft"
              die falsche Botschaft; dann zeigt die rechte Seite den Ring. */}
          {/* Versetzt in die freie dunkle Fläche rechts neben dem Knopf. Ohne
              den Versatz sass das Radar auf dem Foto: dort verschwand es im
              Motiv, während der Bereich unter der Textzeile leer blieb.
              Gemessen bei 1600 px — Knopf endet bei x=410, Radar beginnt bei
              512, das Foto erst bei 736. */}
          <div className="hidden lg:block lg:-translate-x-32 lg:translate-y-10 xl:-translate-x-36 xl:translate-y-10">
            {lage.zweiWege ? (
              <Radar prozent={prozent} />
            ) : (
              prozent !== null && <Ring prozent={prozent} />
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
