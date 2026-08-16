import Image from "next/image";

// ─── Wortmarke PORTAWERK ──────────────────────────────────────────────────────
// Eine Stelle für das Logo. Vorher stand an zwei Dutzend Orten dieselbe
// Nachbildung aus Hammer-Symbol und Schriftzug — die wäre bei jeder Änderung
// wieder auseinandergelaufen.
//
// Der Schriftzug trägt die beiden Markenfarben — Gold #F9AD07 und Grün
// #115F5B — als exakte Volltöne. Sie sind nach dem Skalieren gesetzt, damit in
// den ausgelieferten Dateien wirklich nur diese zwei Werte stehen und nicht
// tausend Zwischentöne aus der JPEG-Vorlage.
//
// Die Farbwahl der Website richtet sich nach diesen beiden Werten, nicht
// umgekehrt — deshalb steht das Logo auf Kopfleiste, Fußzeile und allen hellen
// Flächen in seinen Originalfarben (Petrol auf Weiß: 7,5:1).
//
// `hell` ist die NEGATIVFASSUNG für die tiefen Petrol-Flächen (Login-Panels,
// interne Kopfleisten). Dort steht „WERK" in Creme statt Petrol — nicht aus
// Geschmack, sondern weil #115F5B auf #0C3330 einen Kontrast von 1,7:1 hat und
// schlicht verschwindet. „PORTA" bleibt in beiden Fassungen Marken-Gold.
//
// Die Höhe wird vorgegeben, die Breite ergibt sich aus dem Seitenverhältnis
// (7,2 : 1). So steht die Fläche vor dem Laden fest und die Seite springt
// beim Erscheinen des Bildes nicht.

const VERHAELTNIS = 1555 / 216;

export default function Logo({
  height = 28,
  variant = "dunkel",
  priority = false,
  className,
}: {
  /** Höhe in Pixeln; die Breite folgt dem Seitenverhältnis. */
  height?: number;
  /** `hell` = für dunkle Untergründe, `dunkel` = für helle. */
  variant?: "hell" | "dunkel";
  priority?: boolean;
  className?: string;
}) {
  const width = Math.round(height * VERHAELTNIS);
  return (
    <Image
      src={
        variant === "hell"
          ? "/images/portawerk-logo-hell.png"
          : "/images/portawerk-logo.png"
      }
      alt="PortaWerk"
      width={width}
      height={height}
      priority={priority}
      className={className}
      // Feste Maße statt `fill`: kein Umbruch, kein Nachspringen des Layouts.
      style={{ height, width, objectFit: "contain" }}
    />
  );
}

/** Das Bildzeichen allein (Lupe mit Handwerkern) — quadratisch. */
export function LogoZeichen({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/images/portawerk-zeichen.png"
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={className}
      style={{ height: size, width: size, objectFit: "contain" }}
    />
  );
}
