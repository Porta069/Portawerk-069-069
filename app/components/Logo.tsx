import Image from "next/image";

// ─── Wortmarke WERKPAIR ───────────────────────────────────────────────────────
// Eine Stelle für das Logo. Vorher stand an zwei Dutzend Orten dieselbe
// Nachbildung — die wäre bei jeder Änderung wieder auseinandergelaufen.
//
// Die Marke trägt zwei Farben als exakte Volltöne: Gold #E8A838 („WERK",
// Schraubenschlüssel im K) und Petrol #005C5B („PAIR", Handschlag im R). Sie
// sind nach dem Skalieren gesetzt, damit in den ausgelieferten Dateien wirklich
// nur diese Werte stehen und nicht tausend Zwischentöne aus der JPEG-Vorlage.
//
// Das Gold ist derselbe Wert wie `--color-accent` in globals.css — dieselbe
// Farbe wie Abmelden-Knopf, Regler und Zähler-Badges. Vorher stand hier das
// Orange #FF9400 der Ursprungsvorlage; direkt neben dem goldenen Knopf in der
// Kopfleiste sahen die beiden Töne nach Versehen aus statt nach System.
// Die JPEG-Vorlagen (`*-original.jpeg`) tragen weiterhin das alte Orange.
//
// `hell` ist die Negativfassung für dunkle Flächen: dort steht „PAIR" in Creme
// statt Petrol — nicht aus Geschmack, sondern weil #005C5B auf dem Navy der
// Kopfleiste bei 1,7:1 liegt und verschwindet. „WERK" bleibt in beiden
// Fassungen Orange.
//
// `slogan` schaltet auf die Fassung mit „ab jetzt bewirbt sich das Handwerk bei
// DIR!". Sie ist deutlich flacher im Verhältnis (5:1 statt 8,8:1) und braucht
// entsprechend mehr Höhe — der Slogan nimmt rund 19 % davon ein. Unter etwa
// 40 px Gesamthöhe ist er nicht mehr zu lesen.
//
// Die Höhe wird vorgegeben, die Breite ergibt sich aus dem Seitenverhältnis.
// So steht die Fläche vor dem Laden fest und die Seite springt nicht.

const VERHAELTNIS_WORT = 1442 / 163; // 8,85 : 1
const VERHAELTNIS_SLOGAN = 1590 / 319; // 4,98 : 1

export default function Logo({
  height = 28,
  variant = "dunkel",
  slogan = false,
  priority = false,
  className,
}: {
  /** Höhe in Pixeln; die Breite folgt dem Seitenverhältnis. */
  height?: number;
  /** `hell` = für dunkle Untergründe, `dunkel` = für helle. */
  variant?: "hell" | "dunkel";
  /** Fassung mit Slogan. Braucht mindestens 40 px Höhe, sonst ist er unlesbar. */
  slogan?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const width = Math.round(height * (slogan ? VERHAELTNIS_SLOGAN : VERHAELTNIS_WORT));
  const datei = slogan
    ? variant === "hell"
      ? "/images/werkpair-logo-slogan-hell.png"
      : "/images/werkpair-logo-slogan.png"
    : variant === "hell"
      ? "/images/werkpair-logo-hell.png"
      : "/images/werkpair-logo.png";

  return (
    <Image
      src={datei}
      alt="WerkPair"
      width={width}
      height={height}
      priority={priority}
      className={className}
      // Feste Maße statt `fill`: kein Umbruch, kein Nachspringen des Layouts.
      style={{ height, width, objectFit: "contain" }}
    />
  );
}

/** Das Bildzeichen allein (Schraubenschlüssel aus dem K) — quadratisch. */
export function LogoZeichen({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/images/werkpair-zeichen.png"
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={className}
      style={{ height: size, width: size, objectFit: "contain" }}
    />
  );
}
