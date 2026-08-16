"use client";

// ─── Passwort-Stärke + Kriterien-Checkliste ───────────────────────────────────
// Zeigt einen Stärkebalken und eine Live-Checkliste der Pflichtkriterien.

import { Check, X } from "lucide-react";
import { evaluatePassword, PASSWORD_CRITERIA } from "@/lib/password";

export default function PasswordStrength({
  password,
  showCriteria = true,
}: {
  password: string;
  showCriteria?: boolean;
}) {
  const res = evaluatePassword(password);
  if (!password) return null;

  return (
    <div className="mt-2.5">
      {/* Stärkebalken (4 Segmente) */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-300"
              style={{ height: 4, background: i <= res.score ? res.color : "#DFE3E0" }}
            />
          ))}
        </div>
        <span className="text-[11px] font-semibold min-w-[52px] text-right" style={{ color: res.color }}>
          {res.label}
        </span>
      </div>

      {/* Kriterien-Checkliste */}
      {showCriteria && (
        <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1 mt-3">
          {PASSWORD_CRITERIA.map((c) => {
            const ok = res.checks[c.key];
            return (
              <li key={c.key} className="flex items-center gap-1.5 text-[11px]" style={{ color: ok ? "#16A34A" : "rgba(12, 51, 48,0.45)" }}>
                {ok ? (
                  <Check className="w-3 h-3 flex-shrink-0" strokeWidth={3} />
                ) : (
                  <X className="w-3 h-3 flex-shrink-0" style={{ color: "#C8CFCB" }} strokeWidth={2.5} />
                )}
                {c.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
