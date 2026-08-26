"use client";

// ─── Funken ───────────────────────────────────────────────────────────────────
// Kleine Lichtpunkte, die aus einer Fläche wegspringen. Liegen über dem Element
// und sind rein schmückend, deshalb aria-hidden und ohne Mauszeiger-Fang.
//
// Richtung, Grösse und Verzögerung stehen fest verdrahtet statt zufällig:
// Zufall spränge bei jedem Rendern um und wäre serverseitig ohnehin nicht
// reproduzierbar. Die Verzögerungen sind über den Zyklus verteilt, damit nie
// alle gleichzeitig starten.
//
// Der Lauf selbst steckt in `.funke` in globals.css — dort auch die Abschaltung
// bei `prefers-reduced-motion`.

import type { CSSProperties } from "react";

const FUNKEN = [
  { x: 8, y: 30, fx: "-30px", fy: "-26px", verzug: "0s", groesse: 5 },
  { x: 30, y: 12, fx: "14px", fy: "-34px", verzug: "0.3s", groesse: 4 },
  { x: 52, y: 70, fx: "-10px", fy: "32px", verzug: "0.6s", groesse: 5 },
  { x: 76, y: 22, fx: "30px", fy: "-24px", verzug: "0.9s", groesse: 4 },
  { x: 94, y: 52, fx: "36px", fy: "10px", verzug: "1.2s", groesse: 5 },
  { x: 18, y: 78, fx: "-24px", fy: "28px", verzug: "1.5s", groesse: 4 },
  { x: 64, y: 8, fx: "8px", fy: "-30px", verzug: "1.8s", groesse: 4 },
  { x: 44, y: 88, fx: "18px", fy: "26px", verzug: "2.1s", groesse: 5 },
];

export default function Funken({ className = "-inset-6" }: { className?: string }) {
  return (
    <span aria-hidden className={`absolute pointer-events-none ${className}`}>
      {FUNKEN.map((f, i) => (
        <span
          key={i}
          className="funke absolute rounded-full"
          style={
            {
              left: `${f.x}%`,
              top: `${f.y}%`,
              width: f.groesse,
              height: f.groesse,
              background: "#FFF6E0",
              boxShadow: "0 0 8px 2px rgba(232,168,56,0.95)",
              "--fx": f.fx,
              "--fy": f.fy,
              "--verzug": f.verzug,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
