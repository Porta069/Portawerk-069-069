import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { REF_COOKIE, REF_MAX_AGE_SECONDS } from "@/lib/referral";

// ─── Empfehlungs-Link: werkpair.de/r/<slug> ─────────────────────────────────
//
// Der Slug wird vom Backend gegen einen AKTIVEN Partner geprüft. Nur wenn er
// einem gehört, wird der Klick gezählt und die Zuordnung gesetzt — vorher
// landete jeder erfundene Slug in der Statistik.
//
// Die Zuordnung liegt in einem Cookie statt im Adressparameter: Zwischen Klick
// und abgeschlossener Registrierung liegen mehrere Schritte, oft ein
// Seitenwechsel und manchmal ein Tag Pause. Ein `?ref=` überlebt das nicht,
// ein Cookie schon.

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = (params.slug || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 20);

  let partnerId: string | null = null;
  if (slug.length >= 3) {
    try {
      const res = await fetch(`${API_BASE_URL}/partner/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const data = (await res.json()) as { ok?: boolean; partnerId?: string };
        if (data.ok && data.partnerId) partnerId = data.partnerId;
      }
    } catch {
      /* Die Weiterleitung darf daran nicht scheitern. */
    }
  }

  const antwort = NextResponse.redirect(new URL("/registrieren", req.url));

  // First-Touch: Wer über zwei Links kommt, gehört dem ersten Werber. Ein
  // späterer Klick überschreibt die Zuordnung deshalb nicht.
  const schonZugeordnet = req.cookies.get(REF_COOKIE)?.value;
  if (partnerId && !schonZugeordnet) {
    antwort.cookies.set(REF_COOKIE, partnerId, {
      httpOnly: true,
      sameSite: "lax",
      secure: req.nextUrl.protocol === "https:",
      path: "/",
      maxAge: REF_MAX_AGE_SECONDS,
    });
  }
  return antwort;
}
