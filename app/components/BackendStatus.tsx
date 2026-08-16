"use client";

// ─── Live-Server-Status ───────────────────────────────────────────────────────
// Pingt fortlaufend den Backend-Health-Endpunkt und zeigt an, ob man sich
// registrieren kann. Das wiederholte Anpingen wärmt den (schlafenden) Render-
// Free-Server zugleich auf. „Für's erste" — bei Render-Paid/Uptime-Pinger
// überflüssig, dann kann die Komponente wieder raus.

import { useEffect, useRef, useState } from "react";
import { Loader2, Check, AlertTriangle } from "lucide-react";

const BACKEND =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://portbackend-069-069.onrender.com/api/v1";

type Status = "checking" | "waking" | "ready" | "offline";

const META: Record<Status, { dot: string; text: string; textColor: string }> = {
  checking: { dot: "#94A09B", text: "Server wird geprüft…", textColor: "rgba(12, 51, 48,0.6)" },
  waking:   { dot: "#F9AD07", text: "Server startet… gleich bereit", textColor: "#8A5F04" },
  ready:    { dot: "#22C55E", text: "Server bereit — Registrierung möglich", textColor: "#16A34A" },
  offline:  { dot: "#EF4444", text: "Server nicht erreichbar", textColor: "#DC2626" },
};

export default function BackendStatus() {
  const [status, setStatus] = useState<Status>("checking");
  const failsRef = useRef(0);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const loop = async () => {
      let next: Status;
      try {
        const res = await fetch(`${BACKEND}/health`, {
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          failsRef.current = 0;
          next = "ready";
        } else {
          failsRef.current += 1;
          next = failsRef.current > 8 ? "offline" : "waking";
        }
      } catch {
        failsRef.current += 1;
        next = failsRef.current > 10 ? "offline" : "waking";
      }
      if (!active) return;
      setStatus(next);
      // Während des Aufwachens schnell pollen (wärmt zugleich auf); wenn bereit,
      // seltener (hält warm, ohne zu spammen).
      const delay = next === "ready" ? 45_000 : 3_500;
      timer = setTimeout(loop, delay);
    };

    loop();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const m = META[status];

  return (
    <div
      className="fixed left-4 bottom-24 md:bottom-4 z-40 select-none"
      role="status"
      aria-live="polite"
    >
      <div
        className="flex items-center gap-2.5 pl-2.5 pr-3.5 py-2 bg-white/95 backdrop-blur-sm shadow-lg"
        style={{ border: "1px solid #DFE3E0", borderRadius: 999 }}
      >
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
          {(status === "waking" || status === "checking") && (
            <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ background: m.dot }} />
          )}
          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: m.dot }} />
        </span>
        <span className="flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap" style={{ color: m.textColor }}>
          {status === "checking" && <Loader2 className="w-3 h-3 animate-spin" />}
          {status === "ready" && <Check className="w-3 h-3" strokeWidth={3} />}
          {status === "offline" && <AlertTriangle className="w-3 h-3" />}
          {m.text}
        </span>
      </div>
    </div>
  );
}
