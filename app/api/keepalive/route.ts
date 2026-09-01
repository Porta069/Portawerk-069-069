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

export async function GET(req: Request) {
  // ── Zugang ──────────────────────────────────────────────────────────────
  // Die Route war ohne jede Prüfung öffentlich: Ein Aufruf löst zwei
  // ausgehende Anfragen aus, also konnte jeder darüber fremde Dienste
  // anstossen und Vercel-Aufrufe verbrauchen — die kosten Geld.
  //
  // Geprüft wird NUR, wenn `CRON_SECRET` gesetzt ist. Ohne die Variable
  // bleibt alles wie bisher, damit der tägliche Cron nicht in dem Moment
  // stehenbleibt, in dem diese Zeilen ausgeliefert werden. Sobald das
  // Geheimnis in Vercel hinterlegt ist (Vercel schickt es bei Cron-Läufen
  // automatisch als `Authorization: Bearer …` mit), ist die Route dicht.
  const geheim = process.env.CRON_SECRET;
  if (geheim && req.headers.get("authorization") !== `Bearer ${geheim}`) {
    return new Response("Not found", { status: 404 });
  }

  const at = new Date().toISOString();
  // Primär: Supabase direkt (schnell). Das hält das Projekt aktiv.
  const supabase = await ping(`${SUPABASE}/auth/v1/health`, 8000);
  // Best-effort: Backend wecken (kann kaltstarten) — nur kurz warten.
  const backend = await ping(`${BACKEND}/health`, 8000);
  // Jede HTTP-Antwort (auch 401) bedeutet: Supabase wurde erreicht → Aktivität.
  return Response.json({ ok: typeof supabase === "number", supabase, backend, at });
}
