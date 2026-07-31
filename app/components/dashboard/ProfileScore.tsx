"use client";

// ─── Profil-Score ─────────────────────────────────────────────────────────────
// Bewusst nicht "10 % fehlen", sondern der bezifferte Gegenwert:
// "+23 passende Stellen". Eine nackte Prozentzahl motiviert nur, wenn man weiß,
// was sie einem bringt.

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import type { ProfileScore as Score } from "@/lib/types";

export default function ProfileScore({ score }: { score: Score }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const top = score.gaps[0];
  const potential = score.gaps.reduce((sum, g) => sum + g.extraJobs, 0);

  return (
    <div
      className="rounded-3xl bg-white p-6"
      style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 10px 30px -24px rgba(26,26,46,0.5)" }}
    >
      <h2
        className="text-primary font-bold text-[17px] mb-5"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Dein Profil
      </h2>

      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0" style={{ width: 124, height: 124 }}>
          <svg width="124" height="124" viewBox="0 0 124 124" className="-rotate-90">
            <circle cx="62" cy="62" r={r} fill="none" stroke="#F1EEE8" strokeWidth="11" />
            <motion.circle
              cx="62"
              cy="62"
              r={r}
              fill="none"
              stroke="#E8A838"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ - (circ * score.percent) / 100 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-[26px] font-bold tabular-nums text-primary leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {score.percent}%
            </span>
            <span className="text-[10px] mt-1" style={{ color: "rgba(26,26,46,0.4)" }}>
              vollständig
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {score.gaps.length === 0 ? (
            <p className="inline-flex items-center gap-2 text-[14px] font-semibold" style={{ color: "#16A34A" }}>
              <Check className="w-4 h-4" strokeWidth={3} />
              Vollständig — du siehst alle passenden Stellen.
            </p>
          ) : (
            <>
              <p className="text-[14px] leading-relaxed" style={{ color: "rgba(26,26,46,0.65)" }}>
                Vervollständige dein Profil und schalte bis zu{" "}
                <strong className="text-primary">{potential} weitere Stellen</strong> frei.
              </p>
              {top && (
                <Link
                  href={top.href}
                  className="group inline-flex items-center gap-2 mt-3 rounded-full px-4 py-2.5 text-[13px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "#E8A838",
                    color: "#1A1A2E",
                    fontFamily: "var(--font-display)",
                    boxShadow: "0 12px 24px -14px rgba(232,168,56,0.9)",
                  }}
                >
                  {top.label}
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[11px] tabular-nums"
                    style={{ background: "rgba(26,26,46,0.14)" }}
                  >
                    +{top.extraJobs}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {score.gaps.length > 1 && (
        <ul className="mt-5 space-y-1.5" style={{ borderTop: "1px solid #F1EEE8", paddingTop: 14 }}>
          {score.gaps.slice(1, 4).map((g) => (
            <li key={g.id}>
              <Link
                href={g.href}
                className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-[13px] transition-colors"
                style={{ color: "rgba(26,26,46,0.65)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(232,168,56,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span className="truncate">{g.label}</span>
                <span
                  className="flex-shrink-0 font-semibold tabular-nums"
                  style={{ color: "#B47B18" }}
                >
                  +{g.extraJobs}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
