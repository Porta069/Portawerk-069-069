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
// Beide Fassungen sind derzeit IDENTISCH: Auf ausdrücklichen Wunsch behält das
// Logo auch auf dunklem Grund seine Markenfarben. Das Grün erreicht dort nur
// einen Kontrast von 2,3:1 gegenüber 17:1 bei Weiß — „WERK" tritt also spürbar
// zurück. Für ein Logo ist das zulässig (Logotypen sind von den
// Kontrastanforderungen ausgenommen), aber es ist eine bewusste Entscheidung.
// Soll auf dunklen Flächen wieder Weiß stehen, genügt es,
// `portawerk-logo-hell.png` neu zu erzeugen — die 15 Einbaustellen bleiben
// unberührt.
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
