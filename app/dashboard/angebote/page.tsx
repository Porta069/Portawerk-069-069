"use client";

// ─── Jobangebote ──────────────────────────────────────────────────────────────
// Hier bewirbt sich der Betrieb beim Handwerker. Nach der Entscheidung folgt
// der Empfehlungs-Anstoß: nach einer Zusage im Hochgefühl, nach einer Absage
// als Ausweg aus der Sackgasse.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Inbox, Loader2, ArrowRight, ShieldCheck, Check, X } from "lucide-react";
import {
  listOffers, respondToOffer, listContactRequests, respondContactRequest,
  type DeclineReason,
} from "@/lib/jobsService";
import type { JobOffer, WorkerContactRequest } from "@/lib/types";
import OfferCard from "@/app/components/dashboard/OfferCard";
import { AffiliateNudge } from "@/app/components/dashboard/AffiliateTile";

/** Ein Betrieb möchte Kontaktdaten sehen — der Handwerker entscheidet. */
function ContactRequestRow({
  request,
  onRespond,
}: {
  request: WorkerContactRequest;
  onRespond: (decision: "freigeben" | "ablehnen") => void;
}) {
  const [busy, setBusy] = useState(false);
  const decide = async (d: "freigeben" | "ablehnen") => {
    setBusy(true);
    await onRespond(d);
    setBusy(false);
  };

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl bg-white px-5 py-4"
      style={{ border: "1.5px solid #E4DFD3" }}
    >
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(249, 173, 7,0.14)" }}
      >
        <ShieldCheck className="w-4.5 h-4.5" style={{ color: "#8A5F04" }} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14.5px] font-bold text-primary leading-snug">
          {request.company}
        </p>
        <p className="text-[13px]" style={{ color: "rgba(12, 51, 48,0.55)" }}>
          möchte dich für „{request.position}“ kontaktieren · {request.sentAt}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#F9AD07" }} />
        ) : (
          <>
            <button
              type="button"
              onClick={() => decide("freigeben")}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-bold"
              style={{ background: "#F9AD07", color: "#0C3330", fontFamily: "var(--font-display)" }}
            >
              <Check className="w-3.5 h-3.5" />
              Kontakt freigeben
            </button>
            <button
              type="button"
              onClick={() => decide("ablehnen")}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold"
              style={{ border: "1.5px solid #D9D3C6", color: "rgba(12, 51, 48,0.6)", background: "white" }}
            >
              <X className="w-3.5 h-3.5" />
              Ablehnen
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AngebotePage() {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [requests, setRequests] = useState<WorkerContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  /** Zuletzt getroffene Entscheidung — steuert den passenden Anstoß. */
  const [lastDecision, setLastDecision] = useState<"angenommen" | "abgelehnt" | null>(null);

  const load = () => {
    listOffers().then((res) => {
      if (res.ok) setOffers(res.data);
      setLoading(false);
    });
    listContactRequests().then((res) => {
      if (res.ok) setRequests(res.data);
    });
  };

  useEffect(load, []);

  const handleContactRespond = async (
    id: string,
    decision: "freigeben" | "ablehnen"
  ) => {
    const res = await respondContactRequest(id, decision);
    if (res.ok) load();
  };

  const offeneAnfragen = requests.filter((r) => r.status === "angefragt");

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
      <p className="text-[15px] mb-7" style={{ color: "rgba(12, 51, 48,0.55)" }}>
        Diese Betriebe möchten dich einstellen — du entscheidest, wer dein Profil sehen darf.
      </p>

      {/* Offene Kontaktanfragen — Diskretionsversprechen in Aktion */}
      {offeneAnfragen.length > 0 && (
        <section className="mb-8">
          <h2
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] mb-4"
            style={{ color: "#8A5F04" }}
          >
            <span className="w-6 h-[2px]" style={{ background: "#F9AD07" }} />
            Kontaktanfragen · {offeneAnfragen.length}
          </h2>
          <div className="space-y-3">
            {offeneAnfragen.map((r) => (
              <ContactRequestRow
                key={r.id}
                request={r}
                onRespond={(d) => handleContactRespond(r.id, d)}
              />
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#F9AD07" }} />
        </div>
      ) : offers.length === 0 ? (
        <div
          className="rounded-3xl bg-white px-6 py-16 text-center"
          style={{ border: "1.5px solid #E4DFD3" }}
        >
          <Inbox className="w-7 h-7 mx-auto mb-4" style={{ color: "#F9AD07" }} />
          <p className="text-[16px] font-bold text-primary mb-1.5">Noch keine Angebote</p>
          <p className="text-[13.5px] mb-6 max-w-sm mx-auto leading-relaxed" style={{ color: "rgba(12, 51, 48,0.5)" }}>
            Je vollständiger dein Profil, desto häufiger wirst du gefunden. In der
            Zwischenzeit kannst du dich selbst auf Stellen bewerben.
          </p>
          <Link
            href="/dashboard/jobboerse"
            className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold"
            style={{ background: "#F9AD07", color: "#0C3330", fontFamily: "var(--font-display)" }}
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
                style={{ color: "#8A5F04" }}
              >
                <span className="w-6 h-[2px]" style={{ background: "#F9AD07" }} />
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
                style={{ color: "rgba(12, 51, 48,0.4)" }}
              >
                <span className="w-6 h-[2px]" style={{ background: "rgba(12, 51, 48,0.2)" }} />
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
