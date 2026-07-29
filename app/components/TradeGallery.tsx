"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Hammer, ArrowRight } from "lucide-react";

// Echte, handgeprüfte Handwerks-Fotografie (Quelle: Pexels, freie Lizenz).
// Jedes Bild ist klickbar und startet die Registrierung mit vorausgewähltem Gewerk.
// `value` = exakter GEWERKE-Wert aus lib/constants (für die Vorbelegung im Funnel).
const PHOTOS: { src: string; trade: string; value: string; alt: string }[] = [
  {
    src: "/images/elektriker-werkstatt.jpg",
    trade: "Elektriker",
    value: "Elektriker / Elektroniker",
    alt: "Elektriker bei der Arbeit an einem Gerät in der Werkstatt",
  },
  {
    src: "/images/shk-heizung.jpg",
    trade: "Heizung & Sanitär",
    value: "Installateur / Klempner (SHK)",
    alt: "Monteur montiert einen Heizkörper",
  },
  {
    src: "/images/tischler-hobel.jpg",
    trade: "Tischler",
    value: "Tischler / Schreiner",
    alt: "Tischler bearbeitet ein Werkstück mit dem Handhobel",
  },
  {
    src: "/images/maler-leiter.jpg",
    trade: "Maler",
    value: "Maler & Lackierer",
    alt: "Maler streicht eine Wand von der Leiter aus",
  },
  {
    src: "/images/metallbau-schweisser.jpg",
    trade: "Metallbauer",
    value: "Metallbauer / Schlosser",
    alt: "Metallbauer beim Schweißen",
  },
  {
    src: "/images/maurer-ziegel.jpg",
    trade: "Maurer",
    value: "Maurer / Betonbauer",
    alt: "Maurer setzt einen Ziegel mit der Kelle",
  },
];

export default function TradeGallery() {
  return (
    <section className="py-28" style={{ background: "var(--color-surface)" }} id="handwerk">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 max-w-2xl"
        >
          <span className="flex items-center gap-3 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-5">
            <span className="w-8 h-[2px] bg-accent" />
            Für alle Gewerke
          </span>
          <h2
            className="text-primary font-bold text-4xl md:text-5xl leading-tight mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            So sieht dein Handwerk aus
          </h2>
          <p className="text-muted text-lg leading-relaxed">
            Ob auf der Baustelle, in der Werkstatt oder beim Kunden vor Ort — hier
            findest du Betriebe, die zu deinem Gewerk passen. Such dir deins aus und
            leg los.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {PHOTOS.map((photo, i) => (
            <motion.div
              key={photo.src}
              initial={{ y: 28, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.6,
                delay: (i % 3) * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={`/registrieren?gewerk=${encodeURIComponent(photo.value)}`}
                aria-label={`Als ${photo.trade} bewerben`}
                className="group relative block aspect-[4/5] overflow-hidden bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                />
                {/* Lesbarkeits-Verlauf */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(26,26,46,0.78) 0%, rgba(26,26,46,0.15) 42%, transparent 68%)",
                  }}
                />
                {/* Label + Hover-CTA */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-2">
                  <span
                    className="text-white text-base md:text-lg font-semibold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {photo.trade}
                  </span>
                  <span className="flex items-center gap-1 text-accent text-xs font-semibold opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Bewerben
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Auffangen: Gewerk nicht dabei? */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-2.5 mt-8 text-muted text-sm"
        >
          <Hammer className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.75} />
          <span>
            Dein Gewerk ist nicht dabei?{" "}
            <Link href="/registrieren" className="text-primary font-medium underline underline-offset-2 hover:text-accent transition-colors">
              Wir vermitteln in allen Handwerksberufen
            </Link>
            .
          </span>
        </motion.div>
      </div>
    </section>
  );
}
