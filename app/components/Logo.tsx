import Image from "next/image";

// ─── Wortmarke PORTAWERK ──────────────────────────────────────────────────────
// Eine Stelle für das Logo. Vorher stand an zwei Dutzend Orten dieselbe
// Nachbildung aus Hammer-Symbol und Schriftzug — die wäre bei jeder Änderung
// wieder auseinandergelaufen.
//
// Zwei Fassungen, weil der Schriftzug zweifarbig ist: „WERK" ist dunkles
// Petrol (#125E5A) und auf dunklem Grund praktisch unsichtbar. Die Fassung
// `hell` ersetzt genau diesen Teil durch Weiß; das Gold bleibt.
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
