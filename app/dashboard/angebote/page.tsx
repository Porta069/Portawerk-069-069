"use client";

// ─── Jobangebote ──────────────────────────────────────────────────────────────
// Hier bewirbt sich der Betrieb beim Handwerker. Nach der Entscheidung folgt
// der Empfehlungs-Anstoß: nach einer Zusage im Hochgefühl, nach einer Absage
// als Ausweg aus der Sackgasse.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Inbox, Loader2, ArrowRight } from "lucide-react";
import { listOffers, respondToOffer, type DeclineReason } from "@/lib/jobsService";
import type { JobOffer } from "@/lib/types";
import OfferCard from "@/app/components/dashboard/OfferCard";
import { AffiliateNudge } from "@/app/components/dashboard/AffiliateTile";

export default function AngebotePage() {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  /** Zuletzt getroffene Entscheidung — steuert den passenden Anstoß. */
  const [lastDecision, setLastDecision] = useState<"angenommen" | "abgelehnt" | null>(null);

  const load = () => {
    listOffers().then((res) => {
      if (res.ok) setOffers(res.data);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleRespond = async (
    offerId: string,
    decision: "angenommen" | "abgelehnt",
    reason?: DeclineReason
  ) => {
    const res = await respondToOffer(offerId, decision, reason);
    if (res.ok) {
      setLastDecision(decision);
      load();
    }
  };

  const offen = offers.filter((o) => o.status === "neu");
  const erledigt = offers.filter((o) => o.status !== "neu");

  return (
    <div>
      <h1
        className="text-primary font-bold mb-1"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)" }}
      >
        Deine Jobangebote
      </h1>
      <p className="text-[15px] mb-7" style={{ color: "rgba(26,26,46,0.55)" }}>
        Diese Betriebe möchten dich einstellen — du entscheidest, wer dein Profil sehen darf.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
        </div>
      ) : offers.length === 0 ? (
        <div
          className="rounded-3xl bg-white px-6 py-16 text-center"
          style={{ border: "1.5px solid #E9E7E1" }}
        >
          <Inbox className="w-7 h-7 mx-auto mb-4" style={{ color: "#E8A838" }} />
          <p className="text-[16px] font-bold text-primary mb-1.5">Noch keine Angebote</p>
          <p className="text-[13.5px] mb-6 max-w-sm mx-auto leading-relaxed" style={{ color: "rgba(26,26,46,0.5)" }}>
            Je vollständiger dein Profil, desto häufiger wirst du gefunden. In der
            Zwischenzeit kannst du dich selbst auf Stellen bewerben.
          </p>
          <Link
            href="/dashboard/jobboerse"
            className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold"
            style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
          >
            Zur Jobbörse
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {offen.length > 0 && (
            <section>
              <h2
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] mb-4"
                style={{ color: "#B47B18" }}
              >
                <span className="w-6 h-[2px]" style={{ background: "#E8A838" }} />
                Neu · {offen.length}
              </h2>
              <div className="space-y-6">
                {offen.map((o) => (
                  <OfferCard
                    key={o.id}
                    offer={o}
                    onRespond={(d, r) => handleRespond(o.id, d, r)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empfehlungs-Anstoß direkt nach der Entscheidung */}
          {lastDecision && (
            <AffiliateNudge tone={lastDecision === "angenommen" ? "win" : "consolation"} />
          )}

          {erledigt.length > 0 && (
            <section>
              <h2
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] mb-4"
                style={{ color: "rgba(26,26,46,0.4)" }}
              >
                <span className="w-6 h-[2px]" style={{ background: "rgba(26,26,46,0.2)" }} />
                Bereits entschieden
              </h2>
              <div className="space-y-6">
                {erledigt.map((o) => (
                  <OfferCard
                    key={o.id}
                    offer={o}
                    onRespond={(d, r) => handleRespond(o.id, d, r)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
