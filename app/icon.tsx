import { ImageResponse } from "next/og";

// ─── Favicon ─────────────────────────────────────────────────────────────────
// Generiert zur Laufzeit: goldene Kachel mit navy „P“ — dieselbe Bildsprache
// wie die Logo-Kachel in der Kopfleiste.

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#E8A838",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            color: "#1A1A2E",
            fontFamily: "Georgia, serif",
            display: "flex",
            marginTop: -3,
          }}
        >
          P
        </div>
      </div>
    ),
    size
  );
}
