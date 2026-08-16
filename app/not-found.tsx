import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

// ─── 404 im PortaWerk-Design ─────────────────────────────────────────────────
// Statt der Next.js-Standardseite: Navy-Bühne, goldene Marke, klare Auswege.

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#0C3330", fontFamily: "var(--font-sans)" }}
    >
      <div className="relative max-w-lg w-full text-center py-16">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(249, 173, 7,0.16) 0%, transparent 68%)" }}
        />
        <div className="relative">
          <span
            className="inline-flex items-center justify-center w-14 h-14 mb-8"
            style={{ background: "#F9AD07" }}
          >
            <Compass className="w-6 h-6" style={{ color: "#0C3330" }} />
          </span>
          <p
            className="text-[13px] font-semibold uppercase tracking-[0.22em] mb-3"
            style={{ color: "#F9AD07" }}
          >
            Fehler 404
          </p>
          <h1
            className="text-white font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 5vw, 2.8rem)", lineHeight: 1.15 }}
          >
            Diese Seite gibt es nicht — deinen nächsten Job schon.
          </h1>
          <p className="text-[15px] leading-relaxed mb-9" style={{ color: "rgba(255,255,255,0.55)" }}>
            Der Link ist veraltet oder vertippt. Von hier aus kommst du überall
            hin, wo es sich lohnt.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 px-6 py-3.5 text-[14.5px] font-bold"
              style={{ background: "#F9AD07", color: "#0C3330", fontFamily: "var(--font-display)" }}
            >
              Zur Startseite
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/dashboard/jobboerse"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-[14.5px] font-semibold"
              style={{ border: "1.5px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.85)" }}
            >
              Zur Jobbörse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
