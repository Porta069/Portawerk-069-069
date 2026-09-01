"use client";

// ─── Fehler im Wurzel-Layout ─────────────────────────────────────────────────
// `error.tsx` fängt Fehler INNERHALB des Layouts. Bricht das Layout selbst —
// eine fehlgeschlagene Schriftart, ein Fehler im AuthProvider —, greift es
// nicht mehr, und Next zeigt seine nackte weiße Standardseite mit englischem
// Text. Genau das ist der Fall, in dem ein Besucher am ehesten denkt, die
// Seite sei kaputt oder unseriös.
//
// Diese Datei ersetzt ihr eigenes `<html>` und `<body>` — sie läuft, wenn das
// echte Layout nicht mehr da ist. Deshalb auch keine Schrift-Variablen und
// keine Tailwind-Klassenlogik aus dem Layout, sondern feste Werte: Alles, was
// hier auf etwas anderes angewiesen wäre, könnte genau das sein, was fehlt.

import { RotateCcw, LifeBuoy } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body style={{ margin: 0 }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            background: "#1A1A2E",
            fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          }}
        >
          <div style={{ maxWidth: 520, width: "100%", textAlign: "center", padding: "64px 0" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                marginBottom: 32,
                background: "#E8A838",
              }}
            >
              <LifeBuoy width={24} height={24} style={{ color: "#1A1A2E" }} />
            </span>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: "#E8A838",
                margin: "0 0 12px",
              }}
            >
              Unerwarteter Fehler
            </p>
            <h1
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: "clamp(1.9rem, 5vw, 2.8rem)",
                lineHeight: 1.15,
                margin: "0 0 16px",
              }}
            >
              Da ist uns etwas durchgerutscht.
            </h1>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.55)",
                margin: "0 0 36px",
              }}
            >
              Ein erneuter Versuch behebt das meistens. Deine Daten sind davon
              nicht betroffen.
              {error.digest && (
                <span style={{ display: "block", marginTop: 8, fontSize: 11.5, color: "rgba(255,255,255,0.35)" }}>
                  Referenz: {error.digest}
                </span>
              )}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 24px",
                  fontSize: 14.5,
                  fontWeight: 700,
                  background: "#E8A838",
                  color: "#1A1A2E",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <RotateCcw width={16} height={16} />
                Erneut versuchen
              </button>
              {/* Bewusst ein <a> und kein <Link>: Der Router gehört zum Layout,
                  das hier gerade nicht funktioniert. Ein harter Seitenwechsel
                  lädt die Anwendung sauber neu. */}
              <a
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 24px",
                  fontSize: 14.5,
                  fontWeight: 600,
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  color: "rgba(255,255,255,0.85)",
                  textDecoration: "none",
                }}
              >
                Zur Startseite
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
