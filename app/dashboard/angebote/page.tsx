"use client";

// ─── Jobangebote ──────────────────────────────────────────────────────────────
// Hier bewirbt sich der Betrieb beim Handwerker. Nach der Entscheidung folgt
// der Empfehlungs-Anstoß: nach einer Zusage im Hochgefühl, nach einer Absage
// als Ausweg aus der Sackgasse.

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, ShieldCheck, Check, X } from "lucide-react";
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
      style={{ border: "1.5px solid #E9E7E1" }}
    >
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(232,168,56,0.14)" }}
      >
        <ShieldCheck className="w-4.5 h-4.5" style={{ color: "#B47B18" }} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14.5px] font-bold text-primary leading-snug">
          {request.company}
        </p>
        <p className="text-[13px]" style={{ color: "rgba(26,26,46,0.55)" }}>
          möchte dich für „{request.position}“ kontaktieren · {request.sentAt}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#E8A838" }} />
        ) : (
          <>
            <button
              type="button"
              onClick={() => decide("freigeben")}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-bold"
              style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
            >
              <Check className="w-3.5 h-3.5" />
              Kontakt freigeben
            </button>
            <button
              type="button"
              onClick={() => decide("ablehnen")}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold"
              style={{ border: "1.5px solid #E0DDD6", color: "rgba(26,26,46,0.6)", background: "white" }}
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
      {/* ── Statuspanel ─────────────────────────────────────────────────────
          Randlos, dunkel, mit Foto — dieselbe Bauform wie Übersicht und
          Merkliste. Die Überschrift beschreibt die Lage, statt nur den
          Seitennamen zu wiederholen. */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="vollbreite relative overflow-hidden -mt-10 mb-10"
        style={{ background: "#1A1A2E" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.032) 0 1px, transparent 1px 34px)," +
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.032) 0 1px, transparent 1px 34px)",
          }}
        />

        <div aria-hidden className="absolute inset-y-0 right-0 w-[46%] hidden md:block">
          <Image
            src="/images/hero-team-werkstatt.jpg"
            alt=""
            fill
            sizes="46vw"
            className="object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, #1A1A2E 2%, rgba(26,26,46,0.9) 32%, rgba(26,26,46,0.45) 100%)",
            }}
          />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 py-10 sm:py-14">
          <div className="flex items-center justify-between gap-8">
            <div className="min-w-0 max-w-[34rem]">
              <div className="flex items-center gap-2.5 mb-5">
                <span
                  className="punkt-glut rounded-full flex-shrink-0"
                  style={{ width: 8, height: 8, background: "#E8A838" }}
                />
                <span
                  className="text-[10px] font-semibold uppercase"
                  style={{ color: "#E8A838", letterSpacing: "0.22em" }}
                >
                  {offen.length > 0 ? `${offen.length} neu` : "Profil läuft mit"}
                </span>
              </div>

              <h1
                className="font-bold leading-[1.12] mb-3"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.75rem, 3.3vw, 2.6rem)",
                  color: "#FFFFFF",
                }}
              >
                {offers.length === 0
                  ? "Betriebe suchen gerade nach dir."
                  : offen.length === 1
                    ? "Ein Betrieb möchte dich einstellen."
                    : offen.length > 1
                      ? `${offen.length} Betriebe möchten dich einstellen.`
                      : "Deine Jobangebote"}
              </h1>

              <p
                className="text-[15px] leading-relaxed mb-7 max-w-[32rem]"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Du entscheidest, wer dein Profil sehen darf.
              </p>

              {offers.length === 0 && (
                <Link
                  href="/dashboard/jobboerse"
                  className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-[14px] font-bold rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "#E8A838",
                    color: "#1A1A2E",
                    fontFamily: "var(--font-display)",
                    boxShadow: "0 16px 32px -16px rgba(232,168,56,0.85)",
                  }}
                >
                  Selbst Stellen ansehen
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              )}
            </div>

            {offen.length > 0 && (
              <div
                className="hidden lg:flex flex-col items-center justify-center flex-shrink-0"
                style={{
                  width: 168,
                  height: 168,
                  background:
                    "radial-gradient(circle, rgba(26,26,46,0.92) 44%, rgba(26,26,46,0) 74%)",
                }}
              >
                <span
                  className="font-black tabular-nums leading-none"
                  style={{ fontFamily: "var(--font-display)", fontSize: "4.5rem", color: "#E8A838" }}
                >
                  {offen.length}
                </span>
                <span
                  className="text-[9.5px] font-semibold uppercase mt-2"
                  style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.2em" }}
                >
                  offen
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Offene Kontaktanfragen — Diskretionsversprechen in Aktion */}
      {offeneAnfragen.length > 0 && (
        <section className="mb-8">
          <h2
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] mb-4"
            style={{ color: "#B47B18" }}
          >
            <span className="w-6 h-[2px]" style={{ background: "#E8A838" }} />
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
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
        </div>
      ) : offers.length === 0 ? (
        // Leer ist am Anfang der Normalfall, nicht der Sonderfall. Statt eines
        // Kastens mit drei Zeilen Fliesstext steht hier der Ablauf — dieselbe
        // Form wie "So läuft's" auf der Übersicht.
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {/* ── Wartezustand ────────────────────────────────────────────────
              Statt eines Symbols in einem getönten Kreis — die Standardform,
              an der man jeden generierten Leerzustand erkennt — stehen hier
              zwei leere Karten in der Form der echten Angebote. Sie heben und
              senken sich kaum merklich, ein heller Streifen läuft durch. Man
              sieht dadurch, WO das Angebot erscheinen wird, und dass die Seite
              darauf wartet statt kaputt zu sein. */}
          <div className="relative mb-11">
            <div aria-hidden className="space-y-4">
              {[
                { hoehe: 132, verzug: "0s", deckung: 1 },
                { hoehe: 116, verzug: "0.9s", deckung: 0.5 },
                { hoehe: 100, verzug: "1.8s", deckung: 0.22 },
              ].map((k, i) => (
                <div
                  key={i}
                  className="wartekarte relative overflow-hidden rounded-3xl"
                  style={
                    {
                      height: k.hoehe,
                      opacity: k.deckung,
                      background: "#FFFFFF",
                      border: "1.5px solid #EDE8DC",
                      "--verzug": k.verzug,
                    } as CSSProperties
                  }
                >
                  {/* Angedeutete Zeilen — die Form einer Angebotskarte. */}
                  <div className="flex gap-4 p-5">
                    <span
                      className="rounded-2xl flex-shrink-0"
                      style={{ width: 72, height: 72, background: "#F4F1EA" }}
                    />
                    <span className="flex-1 min-w-0 space-y-2.5 pt-1">
                      <span className="block rounded-full" style={{ width: "42%", height: 13, background: "#F1EDE4" }} />
                      <span className="block rounded-full" style={{ width: "26%", height: 10, background: "#F4F1EA" }} />
                      <span className="block rounded-full" style={{ width: "58%", height: 10, background: "#F4F1EA" }} />
                    </span>
                  </div>
                  <span
                    className="warte-glanz absolute inset-y-0 w-1/3 pointer-events-none"
                    style={
                      {
                        background:
                          "linear-gradient(90deg, transparent, rgba(232,168,56,0.13), transparent)",
                        "--verzug": k.verzug,
                      } as CSSProperties
                    }
                  />
                </div>
              ))}
            </div>

            {/* Die Botschaft liegt über den Karten, mit weichem Übergang nach
                unten — dadurch verlaufen die Platzhalter darunter und drängen
                sich nicht auf. */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
              style={{
                background:
                  "linear-gradient(180deg, rgba(248,247,244,0.35) 0%, rgba(248,247,244,0.9) 45%, #F8F7F4 100%)",
              }}
            >
              <span className="inline-flex items-center gap-2.5 mb-3">
                <span
                  className="punkt-glut rounded-full flex-shrink-0"
                  style={{ width: 8, height: 8, background: "#E8A838" }}
                />
                <span
                  className="text-[9.5px] font-semibold uppercase"
                  style={{ color: "#B47B18", letterSpacing: "0.2em" }}
                >
                  Betriebe suchen gerade
                </span>
              </span>
              <p
                className="text-primary font-bold leading-tight"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.25rem, 2.6vw, 1.7rem)" }}
              >
                Noch kein Angebot da
              </p>
              <p className="text-[14px] mt-1.5" style={{ color: "rgba(26,26,46,0.55)" }}>
                Sobald sich ein Betrieb meldet, steht es hier.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span
              className="text-[9.5px] font-semibold uppercase flex-shrink-0"
              style={{ color: "#B47B18", letterSpacing: "0.2em" }}
            >
              So kommt ein Angebot
            </span>
            <span className="h-px flex-1" style={{ background: "#E4E1DA" }} />
          </div>

          <ol className="grid sm:grid-cols-3 gap-x-5 gap-y-6">
            {[
              { titel: "Betrieb findet dich", text: "Anonym, ohne deinen Namen" },
              { titel: "Betrieb bietet dir eine Stelle an", text: "Mit Lohn und Fahrzeit" },
              { titel: "Du sagst zu oder ab", text: "Erst bei Zusage bekommt der Betrieb deine Nummer" },
            ].map((s2, i) => (
              <li key={s2.titel} className="relative flex gap-3 sm:block">
                {i < 2 && (
                  <span
                    aria-hidden
                    className="hidden sm:block absolute h-px"
                    style={{ left: 30, right: -20, top: 11, background: "rgba(26,26,46,0.13)" }}
                  />
                )}
                <span
                  className="relative z-10 flex-shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold tabular-nums"
                  style={{
                    width: 22,
                    height: 22,
                    background: "rgba(232,168,56,0.18)",
                    color: "#B47B18",
                  }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 sm:mt-3">
                  <p className="text-[13.5px] font-bold leading-snug text-primary">{s2.titel}</p>
                  <p className="text-[12.5px] leading-snug mt-0.5" style={{ color: "rgba(26,26,46,0.55)" }}>
                    {s2.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </motion.section>
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
