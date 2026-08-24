import { readFileSync } from "fs";
import { join } from "path";
import { ImageResponse } from "next/og";

// ─── Open-Graph-Bild (Link-Vorschau) ─────────────────────────────────────────
// Das Bild, das WhatsApp, iMessage & Co. beim Teilen eines WerkPair-Links
// zeigen — für eine Plattform, die über Empfehlungslinks wächst, ist das
// Werbefläche: Navy-Grund, goldene Marke, das Kernversprechen als Headline.

export const alt =
  "WerkPair — Der Job findet dich. Betriebe bewerben sich bei Handwerkern.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  // Die Wortmarke wird als Datei eingebettet: `next/og` rendert serverseitig
  // und kann keine Datei über einen Pfad nachladen — ein relativer `src`
  // bliebe schlicht leer.
  const logo = readFileSync(
    join(process.cwd(), "public/images/werkpair-logo-hell.png"),
  ).toString("base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1A1A2E",
          padding: 72,
          position: "relative",
        }}
      >
        {/* Goldener Glow oben rechts — wie im Arbeitgeber-Kommandopult */}
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -160,
            width: 640,
            height: 640,
            borderRadius: 640,
            background:
              "radial-gradient(circle, rgba(232,168,56,0.28) 0%, rgba(26,26,46,0) 68%)",
            display: "flex",
          }}
        />

        {/* Marke */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${logo}`}
            width={504}
            height={70}
            alt="WerkPair"
          />
        </div>

        {/* Kernversprechen */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              width: 88,
              height: 6,
              background: "#E8A838",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.08,
              fontFamily: "Georgia, serif",
              display: "flex",
            }}
          >
            Der Job findet dich.
          </div>
          <div
            style={{
              fontSize: 32,
              color: "rgba(255,255,255,0.65)",
              display: "flex",
            }}
          >
            Betriebe bewerben sich bei Handwerkern — diskret, anonym, kostenlos.
          </div>
        </div>

        {/* Fußzeile */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {["Elektrik", "SHK", "Maler", "Tischler", "Metall", "Dach"].map(
            (g) => (
              <div
                key={g}
                style={{
                  display: "flex",
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: "2px solid rgba(232,168,56,0.5)",
                  color: "#E8A838",
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                {g}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
