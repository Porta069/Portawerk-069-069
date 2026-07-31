// ─── Supabase Keep-Alive (Option B — bis Pro-Plan) ───────────────────────────
// Wird von einem Vercel-Cron (siehe vercel.json) täglich aufgerufen. Pingt den
// Backend-Health-Endpunkt, der eine echte DB-Abfrage macht → hält das
// Supabase-Free-Projekt aktiv (pausiert sonst nach ~7 Tagen Inaktivität).
//
// Bei Supabase Pro: den Eintrag in vercel.json entfernen (oder diese Datei).

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const BACKEND =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://portbackend-069-069.onrender.com/api/v1";

export async function GET() {
  const startedAt = new Date().toISOString();
  try {
    // Render-Free kann kaltstarten → großzügiges Timeout.
    const res = await fetch(`${BACKEND}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });
    return Response.json({
      ok: res.ok,
      status: res.status,
      backend: BACKEND,
      at: startedAt,
    });
  } catch (err) {
    // Nie hart fehlschlagen — der nächste Lauf versucht es erneut.
    return Response.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      at: startedAt,
    });
  }
}
