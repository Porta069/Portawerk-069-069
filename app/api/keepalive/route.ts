// ─── Supabase Keep-Alive (Option B — bis Pro-Plan) ───────────────────────────
// Wird von einem Vercel-Cron (siehe vercel.json) täglich aufgerufen. Pingt das
// Supabase-Projekt direkt (schnell, kein Render-Kaltstart) → hält das
// Free-Projekt aktiv (pausiert sonst nach ~7 Tagen Inaktivität).
//
// Zusätzlich wird best-effort der Backend-Health angestoßen (weckt Render),
// ohne den täglichen Ablauf zu blockieren.
//
// Bei Supabase Pro: den Eintrag in vercel.json entfernen (oder diese Datei).

export const dynamic = "force-dynamic";

// Supabase-Projekt (Ref ist nicht geheim).
const SUPABASE = "https://bycrvqfvpidbjhjshxyf.supabase.co";
const BACKEND =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://portbackend-069-069.onrender.com/api/v1";

async function ping(url: string, ms: number): Promise<number | string> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(ms),
    });
    return res.status;
  } catch (err) {
    return err instanceof Error ? err.name : "error";
  }
}

export async function GET() {
  const at = new Date().toISOString();
  // Primär: Supabase direkt (schnell). Das hält das Projekt aktiv.
  const supabase = await ping(`${SUPABASE}/auth/v1/health`, 8000);
  // Best-effort: Backend wecken (kann kaltstarten) — nur kurz warten.
  const backend = await ping(`${BACKEND}/health`, 8000);
  // Jede HTTP-Antwort (auch 401) bedeutet: Supabase wurde erreicht → Aktivität.
  return Response.json({ ok: typeof supabase === "number", supabase, backend, at });
}
