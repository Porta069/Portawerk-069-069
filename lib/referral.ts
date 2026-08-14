// ─── Empfehlungs-Zuordnung ────────────────────────────────────────────────────
// Wer über einen Partner-Link kommt, bekommt ein Cookie mit der Partner-ID.
// Beim Abschluss der Registrierung wird sie mitgeschickt und im Backend zum
// Referral verknüpft.
//
// Das Cookie ist `httpOnly` — Browser-JavaScript kommt also nicht heran, und
// weil das Backend auf einer anderen Domain liegt, wird es auch nicht
// automatisch mitgesendet. Deshalb der kleine Umweg über `/api/ref`: eine
// server-seitige Route derselben Herkunft liest es aus und gibt nur die
// Partner-ID zurück.

export const REF_COOKIE = "pw_ref";

/** 60 Tage — lang genug für „ich meld mich später an", kurz genug zum Ablaufen. */
export const REF_MAX_AGE_SECONDS = 60 * 60 * 24 * 60;

/**
 * Liest die zugeordnete Partner-ID, falls eine vorliegt.
 * Fehler bleiben still: eine fehlende Zuordnung darf die Registrierung nie
 * aufhalten — sie kostet die Provision, nicht das Konto.
 */
export async function getReferralPartnerId(): Promise<string | null> {
  try {
    const res = await fetch("/api/ref", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { partnerId?: string | null };
    return data.partnerId ?? null;
  } catch {
    return null;
  }
}
