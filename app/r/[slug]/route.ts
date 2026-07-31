import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

// ─── Empfehlungs-Link: portawerk.de/r/<slug> ─────────────────────────────────
// Zählt den Klick (best-effort) und leitet den Besucher zur Registrierung
// weiter, wobei der Werber-Slug als ?ref=<slug> mitgegeben wird. Die
// Registrierung übernimmt ihn und schickt ihn beim Abschluss als referredBy —
// so entsteht im Backend die Referral-Verknüpfung zum Partner.

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = (params.slug || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 20);

  // Klick zählen — darf den Redirect nicht aufhalten.
  if (slug.length >= 3) {
    try {
      await fetch(`${API_BASE_URL}/partner/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
        signal: AbortSignal.timeout(1500),
      });
    } catch {
      /* Klick-Tracking ist best-effort */
    }
  }

  const url = new URL("/registrieren", req.url);
  if (slug.length >= 3) url.searchParams.set("ref", slug);
  return NextResponse.redirect(url);
}
