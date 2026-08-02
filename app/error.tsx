"use client";

import { RotateCcw, LifeBuoy } from "lucide-react";
import Link from "next/link";

// ─── Laufzeitfehler im PortaWerk-Design ──────────────────────────────────────
// Fängt unerwartete Client-Fehler statt der weißen Next.js-Standardseite.
// Bewusst ohne technische Details — die landen in der Konsole, nicht beim Nutzer.

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#1A1A2E", fontFamily: "var(--font-sans)" }}
    >
      <div className="relative max-w-lg w-full text-center py-16">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232,168,56,0.16) 0%, transparent 68%)" }}
        />
        <div className="relative">
          <span
            className="inline-flex items-center justify-center w-14 h-14 mb-8"
            style={{ background: "#E8A838" }}
          >
            <LifeBuoy className="w-6 h-6" style={{ color: "#1A1A2E" }} />
          </span>
          <p
            className="text-[13px] font-semibold uppercase tracking-[0.22em] mb-3"
            style={{ color: "#E8A838" }}
          >
            Unerwarteter Fehler
          </p>
          <h1
            className="text-white font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 5vw, 2.8rem)", lineHeight: 1.15 }}
          >
            Da ist uns etwas durchgerutscht.
          </h1>
          <p className="text-[15px] leading-relaxed mb-9" style={{ color: "rgba(255,255,255,0.55)" }}>
            Ein erneuter Versuch behebt das meistens. Deine Daten sind davon
            nicht betroffen.
            {error.digest && (
              <span className="block mt-2 text-[11.5px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                Referenz: {error.digest}
              </span>
            )}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-[14.5px] font-bold"
              style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
            >
              <RotateCcw className="w-4 h-4" />
              Erneut versuchen
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-[14.5px] font-semibold"
              style={{ border: "1.5px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.85)" }}
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
