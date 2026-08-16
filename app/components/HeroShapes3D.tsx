"use client";

import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

type MV = MotionValue<number>;

/* ─────────────────────────────────────────────────────────────
   CSS 3D Wireframe Cube
   Uses preserve-3d on the rotating container so 6 face-divs
   live in actual 3D space.
───────────────────────────────────────────────────────────────*/
function Cube({
  rotX,
  rotY,
  y,
  size = 80,
  opacity = 1,
}: {
  rotX: MV;
  rotY: MV;
  y: MV;
  size?: number;
  opacity?: number;
}) {
  const h = size / 2;

  const faceTransforms = [
    `translateZ(${h}px)`,                    // front
    `rotateY(180deg) translateZ(${h}px)`,    // back
    `rotateY(90deg)  translateZ(${h}px)`,    // right
    `rotateY(-90deg) translateZ(${h}px)`,    // left
    `rotateX(90deg)  translateZ(${h}px)`,    // top
    `rotateX(-90deg) translateZ(${h}px)`,    // bottom
  ];

  return (
    // perspective must live on the PARENT of the preserve-3d element
    <div style={{ perspective: "900px", opacity }}>
      <motion.div
        style={{
          width: size,
          height: size,
          position: "relative",
          transformStyle: "preserve-3d",
          rotateX: rotX,
          rotateY: rotY,
          y,
        }}
      >
        {faceTransforms.map((transform, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              transform,
              border: "1.5px solid rgba(249, 173, 7,0.38)",
              background:
                i < 2
                  ? "rgba(249, 173, 7,0.05)"
                  : "rgba(12, 51, 48,0.2)",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Ring (circle that tilts via rotateX, giving an ellipse illusion)
───────────────────────────────────────────────────────────────*/
function Ring({
  rotX,
  y,
  size = 100,
  strokeWidth = 2,
}: {
  rotX: MV;
  y: MV;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <motion.div style={{ rotateX: rotX, y, perspective: "600px" }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `${strokeWidth}px solid rgba(249, 173, 7,0.32)`,
          boxShadow: "inset 0 0 20px rgba(249, 173, 7,0.04)",
        }}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Diamond — a square rotated 45° in 2D, spins on Z via scroll
───────────────────────────────────────────────────────────────*/
function Diamond({
  rotZ,
  y,
  size = 40,
}: {
  rotZ: MV;
  y: MV;
  size?: number;
}) {
  return (
    <motion.div
      style={{ rotate: rotZ, y, display: "inline-block" }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: "1.5px solid rgba(249, 173, 7,0.45)",
          transform: "rotate(45deg)",
          background: "rgba(249, 173, 7,0.03)",
        }}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Thin floating rectangle — tilts on Y axis (like a card flipping)
───────────────────────────────────────────────────────────────*/
function TiltPlane({
  rotY,
  rotX,
  y,
  width = 60,
  height = 40,
}: {
  rotY: MV;
  rotX: MV;
  y: MV;
  width?: number;
  height?: number;
}) {
  return (
    <div style={{ perspective: "700px" }}>
      <motion.div
        style={{
          width,
          height,
          rotateY: rotY,
          rotateX: rotX,
          y,
          border: "1px solid rgba(249, 173, 7,0.28)",
          background: "rgba(249, 173, 7,0.04)",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main export — places all shapes in the hero background
───────────────────────────────────────────────────────────────*/
export default function HeroShapes3D() {
  const { scrollY } = useScroll();

  // ── Large cube (top-right) ──────────────────────────────────
  const c1RotY = useTransform(scrollY, [0, 900], [22, 230]);
  const c1RotX = useTransform(scrollY, [0, 900], [18, 108]);
  const c1Y    = useTransform(scrollY, [0, 900], [0, -200]);

  // ── Small cube (bottom-left) ────────────────────────────────
  const c2RotY = useTransform(scrollY, [0, 700], [-8, -175]);
  const c2RotX = useTransform(scrollY, [0, 700], [28, 115]);
  const c2Y    = useTransform(scrollY, [0, 700], [0, -95]);

  // ── Large ring (left, tilts to upright) ────────────────────
  const r1RotX = useTransform(scrollY, [0, 650], [75, 5]);
  const r1Y    = useTransform(scrollY, [0, 650], [0, -120]);

  // ── Small ring (right of headline) ─────────────────────────
  const r2RotX = useTransform(scrollY, [0, 500], [65, -15]);
  const r2Y    = useTransform(scrollY, [0, 500], [0, -65]);

  // ── Diamond 1 (mid-right) ──────────────────────────────────
  const d1RotZ = useTransform(scrollY, [0, 750], [0, 150]);
  const d1Y    = useTransform(scrollY, [0, 750], [0, -85]);

  // ── Diamond 2 (upper, tiny) ────────────────────────────────
  const d2RotZ = useTransform(scrollY, [0, 600], [45, -100]);
  const d2Y    = useTransform(scrollY, [0, 600], [0, -50]);

  // ── Tilt plane (center-left) ───────────────────────────────
  const p1RotY = useTransform(scrollY, [0, 600], [25, 160]);
  const p1RotX = useTransform(scrollY, [0, 600], [10, 55]);
  const p1Y    = useTransform(scrollY, [0, 600], [0, -70]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">

      {/* ── Large cube — top right ── */}
      <div
        className="absolute hidden md:block"
        style={{ top: "15%", right: "8%" }}
      >
        <Cube rotX={c1RotX} rotY={c1RotY} y={c1Y} size={88} />
      </div>

      {/* ── Small cube — bottom left ── */}
      <div
        className="absolute hidden lg:block"
        style={{ bottom: "20%", left: "4.5%" }}
      >
        <Cube rotX={c2RotX} rotY={c2RotY} y={c2Y} size={46} opacity={0.8} />
      </div>

      {/* ── Large ring — left center ── */}
      <div
        className="absolute hidden sm:block"
        style={{ top: "46%", left: "3%" }}
      >
        <Ring rotX={r1RotX} y={r1Y} size={100} strokeWidth={2} />
      </div>

      {/* ── Small ring — right of headline ── */}
      <div
        className="absolute hidden md:block"
        style={{ top: "36%", right: "20%" }}
      >
        <Ring rotX={r2RotX} y={r2Y} size={58} strokeWidth={1.5} />
      </div>

      {/* ── Diamond 1 — mid right ── */}
      <div
        className="absolute hidden sm:block"
        style={{ top: "64%", right: "14%" }}
      >
        <Diamond rotZ={d1RotZ} y={d1Y} size={42} />
      </div>

      {/* ── Diamond 2 — upper center-left, tiny ── */}
      <div
        className="absolute hidden md:block"
        style={{ top: "20%", left: "26%" }}
      >
        <Diamond rotZ={d2RotZ} y={d2Y} size={22} />
      </div>

      {/* ── Tilt plane — center left ── */}
      <div
        className="absolute hidden lg:block"
        style={{ top: "55%", left: "14%" }}
      >
        <TiltPlane rotY={p1RotY} rotX={p1RotX} y={p1Y} width={68} height={44} />
      </div>
    </div>
  );
}
