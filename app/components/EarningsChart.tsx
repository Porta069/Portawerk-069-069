"use client";

// ─── Einnahmen-Verlauf ────────────────────────────────────────────────────────
// Eine Serie (Monats-Einnahmen) als Flächen-Chart: sanfte Kurve in Marken-Gold,
// Gradient-Fläche, hervorgehobener Endpunkt, dezentes Grid, Hover-Crosshair +
// Tooltip. Farben/Marken nach den dataviz-Richtlinien (Text in Ink-Tönen, Fläche
// in der Marken-Farbe, Grid recessiv).

import { useEffect, useRef, useState } from "react";

type Pt = { m: string; v: number };
const fmt = (n: number) => n.toLocaleString("de-DE");

// Catmull-Rom → Bézier: sanfte Kurve durch alle Punkte.
function smooth(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export default function EarningsChart({ data }: { data: Pt[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(680);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect.width;
      if (cw) setW(cw);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = 280;
  const PL = 46, PR = 18, PT = 36, PB = 30;
  const n = data.length;
  const iw = Math.max(w - PL - PR, 10);
  const ih = H - PT - PB;
  const maxV = Math.max(...data.map((d) => d.v), 1);
  const yTop = Math.max(Math.ceil(maxV / 300) * 300, 300);
  const step = n > 1 ? iw / (n - 1) : iw;

  const px = (i: number) => PL + step * i;
  const py = (v: number) => PT + (1 - v / yTop) * ih;
  const pts = data.map((d, i) => ({ ...d, x: px(i), y: py(d.v) }));

  const line = smooth(pts);
  const area = n > 1 ? `${line} L ${px(n - 1)},${PT + ih} L ${px(0)},${PT + ih} Z` : "";
  const grid = [0, 0.5, 1];
  const last = n - 1;
  const showBubble = hover === null ? last : hover;

  return (
    <div ref={wrapRef} className="relative w-full select-none" style={{ height: H }}>
      <svg width={w} height={H} className="block overflow-visible">
        <defs>
          <linearGradient id="ec-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8A838" stopOpacity="0.30" />
            <stop offset="55%" stopColor="#E8A838" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#E8A838" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid + Y-Beschriftung */}
        {grid.map((g) => {
          const gy = PT + g * ih;
          return (
            <g key={g}>
              <line
                x1={PL} y1={gy} x2={w - PR} y2={gy}
                stroke="#EAE7E0" strokeWidth={1}
                strokeDasharray={g === 1 ? undefined : "3 5"}
              />
              <text x={PL - 10} y={gy + 3.5} textAnchor="end" fontSize="10.5" fill="#9AA0AA">
                {fmt(yTop * (1 - g))}
              </text>
            </g>
          );
        })}

        {/* Fläche + Linie */}
        {area && <path d={area} fill="url(#ec-fill)" />}
        <path d={line} fill="none" stroke="#E8A838" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Crosshair */}
        {hover !== null && (
          <line x1={pts[hover].x} y1={PT} x2={pts[hover].x} y2={PT + ih} stroke="#1A1A2E" strokeOpacity={0.14} strokeWidth={1} strokeDasharray="4 4" />
        )}

        {/* X-Beschriftung */}
        {pts.map((p, i) => (
          <text
            key={p.m} x={p.x} y={H - 8} textAnchor="middle" fontSize="11"
            fill={hover === i ? "#1A1A2E" : "#9AA0AA"} fontWeight={hover === i ? 700 : 400}
          >
            {p.m}
          </text>
        ))}

        {/* Punkte */}
        {pts.map((p, i) => {
          const emph = i === last || hover === i;
          if (!emph) return <circle key={p.m} cx={p.x} cy={p.y} r={3} fill="#fff" stroke="#E8A838" strokeWidth={2} />;
          return (
            <g key={p.m}>
              <circle cx={p.x} cy={p.y} r={10} fill="#E8A838" opacity={0.16} />
              <circle cx={p.x} cy={p.y} r={5.5} fill="#E8A838" stroke="#fff" strokeWidth={2.5} />
            </g>
          );
        })}
      </svg>

      {/* Wert-Bubble (Endpunkt bzw. Hover) */}
      <div
        className={`pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl px-3 py-1.5 shadow-lg whitespace-nowrap ${
          hover === null ? "bg-accent text-primary" : "bg-primary text-white"
        }`}
        style={{ left: pts[showBubble].x, top: pts[showBubble].y - 14 }}
      >
        {hover !== null && (
          <span className="block text-[10px] uppercase tracking-wide text-white/50 leading-none mb-0.5">{pts[showBubble].m}</span>
        )}
        <span className="block text-sm font-bold leading-none">{fmt(pts[showBubble].v)} €</span>
      </div>

      {/* Hover-Fläche */}
      <div
        className="absolute"
        style={{ left: PL, top: PT, width: iw, height: ih }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          let i = Math.round((e.clientX - rect.left) / step);
          i = Math.max(0, Math.min(n - 1, i));
          setHover(i);
        }}
        onMouseLeave={() => setHover(null)}
      />
    </div>
  );
}
