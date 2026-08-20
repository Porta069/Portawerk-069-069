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
  halo = false,
  className,
}: {
  /** Höhe in Pixeln; die Breite folgt dem Seitenverhältnis. */
  height?: number;
  /** `hell` = für dunkle Untergründe, `dunkel` = für helle. */
  variant?: "hell" | "dunkel";
  priority?: boolean;
  /**
   * Weicher weißer Schein hinter dem Schriftzug — für dunkle Kopfleisten.
   *
   * Das Grün des Wortteils „WERK" erreicht auf Navy nur 2,3:1 Kontrast und
   * tritt dadurch spürbar zurück. Der Schein hebt den Schriftzug an, ohne
   * ihn in einen sichtbaren Kasten zu setzen: eine Ellipse, die zur Mitte
   * hin fast deckend ist und nach außen vollständig ausläuft, zusätzlich
   * weichgezeichnet. Dadurch gibt es keine Kante, an der die Leiste bricht.
   */
  halo?: boolean;
  className?: string;
}) {
  const width = Math.round(height * VERHAELTNIS);

  const bild = (
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

  if (!halo) return bild;

  // Der Schein wächst mit der Logohöhe mit, damit er bei 22 px genauso sitzt
  // wie bei 40 px.
  const luftX = Math.round(height * 1.15);
  const luftY = Math.round(height * 0.95);

  return (
    <span className="relative inline-flex items-center justify-center">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          left: -luftX,
          right: -luftX,
          top: -luftY,
          bottom: -luftY,
          // Flacher Verlauf mit vielen Stufen: so entsteht keine sichtbare
          // Kante, an der die Leiste bricht. Deckkraft bewusst unter 0,8 —
          // es soll aufhellen, nicht als Flaeche auffallen.
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.80) 28%, rgba(255,255,255,0.52) 46%, rgba(255,255,255,0.24) 60%, rgba(255,255,255,0.10) 74%, rgba(255,255,255,0.03) 86%, rgba(255,255,255,0) 100%)",
          filter: `blur(${Math.max(8, Math.round(height * 0.5))}px)`,
        }}
      />
      <span className="relative">{bild}</span>
    </span>
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
