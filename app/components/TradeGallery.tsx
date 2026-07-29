"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

// Echte, handgeprüfte Handwerks-Fotografie (Quelle: Pexels, freie Lizenz).
// Bewusst KEINE Menschen als benannte "Kunden" ausgegeben — nur echte Arbeitsszenen,
// die die Gewerke authentisch zeigen, ohne eine falsche Behauptung aufzustellen.
const PHOTOS: { src: string; trade: string; alt: string }[] = [
  {
    src: "/images/elektriker-werkstatt.jpg",
    trade: "Elektrotechnik",
    alt: "Erfahrener Elektriker repariert konzentriert ein Gerät in seiner Werkstatt",
  },
  {
    src: "/images/shk-heizung.jpg",
    trade: "SHK · Heizung",
    alt: "Monteur montiert mit Rohrzange und Arbeitshandschuhen einen Heizkörper",
  },
  {
    src: "/images/tischler-hobel.jpg",
    trade: "Tischler",
    alt: "Tischler bearbeitet ein Werkstück mit dem Handhobel in der Holzwerkstatt",
  },
  {
    src: "/images/maler-leiter.jpg",
    trade: "Maler · Ausbau",
    alt: "Maler auf der Leiter klebt vor dem Streichen die Deckenkante ab",
  },
  {
    src: "/images/metallbau-schweisser.jpg",
    trade: "Metallbau",
    alt: "Metallbauer schweißt mit Schutzschild an einem Werkstück, Funken sprühen",
  },
  {
    src: "/images/maurer-ziegel.jpg",
    trade: "Maurer · Bau",
    alt: "Maurer setzt mit Kelle und Mörtel einen roten Ziegel entlang der Maurerschnur",
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
            Keine gestellten Hochglanz-Models, keine KI-Bilder. Echte Arbeit, echtes
            Werkzeug — so, wie du sie jeden Tag machst. Für dein Gewerk ist der
            passende Betrieb dabei.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {PHOTOS.map((photo, i) => (
            <motion.figure
              key={photo.src}
              initial={{ y: 28, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.6,
                delay: (i % 3) * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative aspect-[4/5] overflow-hidden bg-primary/5"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
              />
              {/* Lesbarkeits-Verlauf für das Label */}
              <div
                className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(26,26,46,0.72) 0%, transparent 100%)",
                }}
              />
              <figcaption className="absolute bottom-0 left-0 flex items-center gap-2 px-4 py-3.5">
                <span className="w-5 h-[2px] bg-accent" />
                <span className="text-white text-sm font-semibold tracking-wide">
                  {photo.trade}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        {/* Ehrlicher Authentizitäts-Hinweis — trifft genau den Nerv der Zielgruppe */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-2.5 mt-8 text-muted text-sm"
        >
          <Camera className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.75} />
          <span>
            Echte Handwerks-Fotografie —{" "}
            <span className="text-primary font-medium">keine KI, keine Stock-Klischees</span>.
          </span>
        </motion.div>
      </div>
    </section>
  );
}
