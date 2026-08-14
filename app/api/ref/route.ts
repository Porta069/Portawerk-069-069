import { NextRequest, NextResponse } from "next/server";
import { REF_COOKIE } from "@/lib/referral";

// ─── Zugeordneten Werber auslesen ────────────────────────────────────────────
// Das Attributions-Cookie ist httpOnly, damit es kein fremdes Skript im Browser
// abgreifen kann. Diese Route derselben Herkunft liest es server-seitig und
// gibt ausschließlich die Partner-ID heraus — nichts anderes steht drin.

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const partnerId = req.cookies.get(REF_COOKIE)?.value ?? null;
  return NextResponse.json(
    { partnerId },
    { headers: { "Cache-Control": "no-store" } },
  );
}
