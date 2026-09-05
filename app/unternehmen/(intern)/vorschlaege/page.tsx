"use client";

// ─── Vorschläge (Arbeitgeber) ────────────────────────────────────────────────
// Der umgekehrte Weg zur Kandidatensuche: Nicht der Betrieb sucht, sondern wir
// legen ihm jemanden auf den Tisch — von Hand aus dem Admin-Dashboard oder
// automatisch, wenn ein neues Profil zu einer offenen Stelle passt.
//
// Was hier NICHT passiert: Kontaktdaten herausgeben. Ein Vorschlag ist kein
// Grund, das Diskretionsversprechen aufzuweichen. Der Steckbrief ist derselbe
// anonyme wie in der Suche; Namen und Nummern gibt es erst, wenn der Handwerker
// eine Kontaktanfrage angenommen hat.
//
// Zur Gliederung: Offene Vorschläge stehen oben, Vorgemerktes darunter,
// Abgelehntes ganz unten und eingeklappt. Abgelehnte verschwinden bewusst
// NICHT — ein versehentliches Ablehnen wäre sonst ein Löschen ohne Rückweg,
// dieselbe Falle wie früher bei den archivierten Inseraten.

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Sparkles, Bot, UserRoundCheck, MapPin, Clock3, Wrench,
  ThumbsUp, Undo2, X, ChevronDown, ShieldCheck, Check, Briefcase,
} from "lucide-react";
import {
  listSuggestions, setSuggestionStatus, requestContact,
  type Vorschlag, type VorschlagStatus,
} from "@/lib/employerService";
import ScoreExplainer from "@/app/components/ScoreExplainer";
import Wartezustand from "@/app/components/dashboard/Wartezustand";
import { gewerkBild } from "@/lib/gewerkBilder";

// Offen = alles, was der Betrieb noch nicht beantwortet hat. NEW und SEEN
// liegen im selben Topf: „gesehen" ist keine Entscheidung, nur eine Notiz.
const ABSCHNITTE: {
  key: "offen" | "vorgemerkt" | "abgelehnt";
  titel: string;
  hinweis: string;
  stati: VorschlagStatus[];
  zu?: boolean;
}[] = [
  {
    key: "offen",
    titel: "Neu für Sie",
    hinweis: "Ausgewählt, weil das Profil zu einer Ihrer Stellen passt.",
    stati: ["NEW", "SEEN"],
  },
  {
    key: "vorgemerkt",
    titel: "Vorgemerkt",
    hinweis: "Die haben Sie sich für später zurückgelegt.",
    stati: ["INTERESTED"],
  },
  {
    key: "abgelehnt",
    titel: "Abgelehnt",
    hinweis: "Bleiben hier stehen, falls Sie es sich anders überlegen.",
    stati: ["DECLINED"],
    zu: true,
  },
];

export default function VorschlaegePage() {
  const [alle, setAlle] = useState<Vorschlag[] | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [hinweis, setHinweis] = useState<{ art: "ok" | "fehler"; text: string } | null>(null);
  const [offenAbgelehnt, setOffenAbgelehnt] = useState(false);

  const laden = async () => {
    const res = await listSuggestions();
    if (!res.ok) {
      setFehler(res.error);
      setAlle([]);
      return;
    }
    setFehler(null);
    setAlle(res.data);
  };

  useEffect(() => {
    void laden();
  }, []);

  const antworten = async (v: Vorschlag, status: VorschlagStatus, meldung: string) => {
    setBusy(v.id);
    setHinweis(null);
    const res = await setSuggestionStatus(v.id, status);
    setBusy(null);
    if (!res.ok) {
      setHinweis({ art: "fehler", text: res.error });
      return;
    }
    // Statt neu zu laden nur die eine Karte umsetzen: Die Liste soll unter der
    // Hand nicht springen, während man sie durchgeht.
    setAlle((l) => l?.map((x) => (x.id === v.id ? { ...x, status } : x)) ?? l);
    setHinweis({ art: "ok", text: meldung });
  };

  const kontaktAnfragen = async (v: Vorschlag) => {
    setBusy(v.id);
    setHinweis(null);
    // Die Position ist serverseitig Pflicht (mindestens zwei Zeichen). Ein
    // allgemeiner Vorschlag trägt keine Stelle — dann steht hier, worum es
    // geht, statt dass die Anfrage am Formatfehler scheitert.
    const res = await requestContact(
      v.kandidat.id,
      v.stelle?.titel || "Allgemeine Anfrage",
    );
    setBusy(null);
    if (!res.ok) {
      setHinweis({ art: "fehler", text: res.error });
      return;
    }
    // Ein angefragter Kandidat ist gleichzeitig als interessant erledigt —
    // sonst müsste der Betrieb zwei Knöpfe für einen Gedanken drücken.
    setAlle((l) =>
      l?.map((x) =>
        x.id === v.id
          ? { ...x, status: "INTERESTED", kandidat: { ...x.kandidat, status: "angefragt" } }
          : x,
      ) ?? l,
    );
    setHinweis({
      art: "ok",
      text: "Anfrage ist raus. Kontaktdaten bekommen Sie, sobald der Handwerker zustimmt.",
    });
  };

  const gruppen = useMemo(() => {
    if (!alle) return null;
    return ABSCHNITTE.map((a) => ({
      ...a,
      eintraege: alle.filter((v) => a.stati.includes(v.status)),
    }));
  }, [alle]);

  const offene = gruppen?.find((g) => g.key === "offen")?.eintraege.length ?? 0;

  return (
    <div>
      {/* ── Kopfband, baugleich zu Inseraten und Suche ── */}
      <div className="vollbreite relative overflow-hidden -mt-10 mb-8" style={{ background: "#1A1A2E" }}>
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 34px)," +
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 34px)",
          }}
        />
        <div
          aria-hidden
          className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232,168,56,0.2) 0%, transparent 68%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-8 sm:py-10">
          <p className="inline-flex items-center gap-2 text-[10.5px] max-lg:text-[11.5px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: "#E8A838" }}>
            <Sparkles className="w-3.5 h-3.5" />
            Vorschläge
          </p>
          <h1 className="text-white font-bold text-[26px] sm:text-[32px] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Kandidaten, die wir für Sie herausgesucht haben
          </h1>
          <p className="text-[14px] mt-2 max-w-2xl leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            {offene > 0
              ? `${offene} neue${offene === 1 ? "r Vorschlag wartet" : " Vorschläge warten"} auf Ihre Rückmeldung. Die Profile bleiben anonym, bis der Handwerker einer Kontaktaufnahme zustimmt.`
              : "Sobald ein passendes Profil auftaucht, landet es hier — Sie müssen nicht selbst suchen."}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {hinweis && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 rounded-2xl px-4 py-3 mb-6"
            style={{
              background: hinweis.art === "ok" ? "rgba(22,163,74,0.07)" : "rgba(185,28,28,0.06)",
              border: `1px solid ${hinweis.art === "ok" ? "rgba(22,163,74,0.22)" : "rgba(185,28,28,0.2)"}`,
            }}
          >
            {hinweis.art === "ok" ? (
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#16A34A" }} strokeWidth={3} />
            ) : (
              <X className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#B91C1C" }} />
            )}
            <p className="text-[13.5px]" style={{ color: hinweis.art === "ok" ? "#15803D" : "#B91C1C" }}>
              {hinweis.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!alle ? (
        <div className="flex items-center gap-2.5 py-20 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#E8A838" }} />
          <span className="text-[13.5px]" style={{ color: "rgba(26,26,46,0.55)" }}>
            Vorschläge werden geladen …
          </span>
        </div>
      ) : fehler ? (
        <div
          className="rounded-2xl px-4 py-3.5"
          style={{ background: "rgba(185,28,28,0.06)", border: "1px solid rgba(185,28,28,0.2)" }}
        >
          <p className="text-[13.5px]" style={{ color: "#B91C1C" }}>{fehler}</p>
        </div>
      ) : alle.length === 0 ? (
        <Wartezustand
          marke="Noch nichts vorgeschlagen"
          titel="Hier erscheinen Kandidaten, die zu Ihren Stellen passen"
          text="Wir schauen die neuen Profile durch und legen Ihnen passende hier ab — von Hand und automatisch. Je genauer Ihre Inserate die Anforderungen beschreiben, desto treffender werden die Vorschläge."
          icon={<Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#B47B18" }} />}
        />
      ) : (
        <div className="space-y-10">
          {gruppen!.map((g) => {
            if (!g.eintraege.length) return null;
            const eingeklappt = g.zu && !offenAbgelehnt;
            return (
              <section key={g.key}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                  <div>
                    <h2
                      className="text-primary font-bold text-[19px] leading-snug"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {g.titel}
                      <span className="ml-2 text-[13px] font-medium tabular-nums" style={{ color: "rgba(26,26,46,0.4)" }}>
                        {g.eintraege.length}
                      </span>
                    </h2>
                    <p className="text-[13px] mt-0.5" style={{ color: "rgba(26,26,46,0.5)" }}>
                      {g.hinweis}
                    </p>
                  </div>
                  {g.zu && (
                    <button
                      type="button"
                      onClick={() => setOffenAbgelehnt((o) => !o)}
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:text-primary"
                      style={{ color: "rgba(26,26,46,0.5)" }}
                    >
                      {eingeklappt ? "Anzeigen" : "Ausblenden"}
                      <ChevronDown
                        className="w-3.5 h-3.5 transition-transform duration-300"
                        style={{ transform: eingeklappt ? "none" : "rotate(180deg)" }}
                      />
                    </button>
                  )}
                </div>

                {!eingeklappt && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {g.eintraege.map((v) => (
                      <VorschlagKarte
                        key={v.id}
                        v={v}
                        busy={busy === v.id}
                        onMerken={() => antworten(v, "INTERESTED", "Vorgemerkt.")}
                        onAblehnen={() => antworten(v, "DECLINED", "Abgelehnt — bleibt unten stehen.")}
                        onZurueck={() => antworten(v, "NEW", "Wieder in „Neu für Sie“.")}
                        onKontakt={() => kontaktAnfragen(v)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VorschlagKarte({
  v,
  busy,
  onMerken,
  onAblehnen,
  onZurueck,
  onKontakt,
}: {
  v: Vorschlag;
  busy: boolean;
  onMerken: () => void;
  onAblehnen: () => void;
  onZurueck: () => void;
  onKontakt: () => void;
}) {
  const k = v.kandidat;
  const abgelehnt = v.status === "DECLINED";
  const frei = k.freigegeben;
  const angefragt = k.status === "angefragt";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: "linear-gradient(158deg, #FFFFFF 0%, #FDFCF8 62%, #F9F5EC 100%)",
        border: "1.5px solid #EDE8DC",
        boxShadow: "0 14px 36px -28px rgba(26,26,46,0.55)",
        // Abgelehntes bleibt lesbar, tritt aber zurück.
        opacity: abgelehnt ? 0.72 : 1,
      }}
    >
      <div className="flex gap-4 p-5">
        {/* Gewerkebild statt Portrait — die Person bleibt anonym. */}
        <div className="relative flex-shrink-0 rounded-2xl overflow-hidden" style={{ width: 76, height: 76 }}>
          <Image src={gewerkBild(k.bereich)} alt="" fill sizes="76px" className="object-cover" />
          <div className="absolute inset-0" style={{ background: "rgba(26,26,46,0.18)" }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-primary font-bold text-[16px] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              {frei ? frei.name : k.handle}
            </h3>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] max-lg:text-[11.5px] font-bold uppercase tracking-[0.09em]"
              style={
                v.quelle === "AUTOMATION"
                  ? { background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.55)" }
                  : { background: "rgba(232,168,56,0.16)", color: "#8A5B0F" }
              }
            >
              {v.quelle === "AUTOMATION" ? <Bot className="w-3 h-3" /> : <UserRoundCheck className="w-3 h-3" />}
              {v.quelle === "AUTOMATION" ? "Automatisch" : "Handverlesen"}
            </span>
          </div>

          <p className="text-[13px] mt-0.5" style={{ color: "rgba(26,26,46,0.55)" }}>
            {k.bereich}
            {k.erfahrung ? ` · ${k.erfahrung}` : ""}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[12.5px]" style={{ color: "rgba(26,26,46,0.5)" }}>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {k.region}
              {k.distanceKm != null ? ` · ${k.distanceKm} km` : ""}
            </span>
            {k.start && (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="w-3.5 h-3.5" />
                {k.start}
              </span>
            )}
          </div>
        </div>

        {/* Score als Zahl mit Rechenweg — dieselbe Anzeige wie in der Suche. */}
        <div className="flex-shrink-0 text-right">
          <p className="text-[26px] font-bold leading-none tabular-nums" style={{ fontFamily: "var(--font-display)", color: "#1A1A2E" }}>
            {k.matchScore}
          </p>
          <p className="text-[10px] max-lg:text-[11px] uppercase tracking-[0.12em] font-bold mt-0.5" style={{ color: "rgba(26,26,46,0.35)" }}>
            Passung
          </p>
          <ScoreExplainer breakdown={k.matchBreakdown} subject={k.handle} />
        </div>
      </div>

      {/* ── Warum dieser Vorschlag ── */}
      {(v.begruendung || v.stelle) && (
        <div className="px-5 pb-4">
          <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(26,26,46,0.03)" }}>
            {v.stelle && (
              <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold mb-1" style={{ color: "#B47B18" }}>
                <Briefcase className="w-3.5 h-3.5" />
                Zu Ihrer Stelle „{v.stelle.titel}“
              </p>
            )}
            {v.begruendung && (
              <p className="text-[13.5px] leading-relaxed" style={{ color: "rgba(26,26,46,0.68)" }}>
                {v.begruendung}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Aufgaben als Chips ── */}
      {k.aufgaben.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-1.5">
          {k.aufgaben.slice(0, 5).map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px]"
              style={{ background: "white", border: "1px solid #E9E7E1", color: "rgba(26,26,46,0.62)" }}
            >
              <Wrench className="w-3 h-3" style={{ color: "rgba(26,26,46,0.3)" }} />
              {a}
            </span>
          ))}
          {k.aufgaben.length > 5 && (
            <span className="inline-flex items-center px-2 py-1 text-[12px]" style={{ color: "rgba(26,26,46,0.4)" }}>
              +{k.aufgaben.length - 5}
            </span>
          )}
        </div>
      )}

      {/* ── Freigegebene Kontaktdaten, falls der Handwerker zugestimmt hat ── */}
      {frei && (
        <div className="mx-5 mb-4 rounded-2xl px-4 py-3" style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)" }}>
          <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold mb-1" style={{ color: "#15803D" }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            Kontakt freigegeben
          </p>
          <p className="text-[13.5px] text-primary">
            {frei.telefon} · {frei.email}
          </p>
        </div>
      )}

      {/* ── Aktionen ── */}
      <div className="flex flex-wrap gap-2 px-5 pb-5">
        {abgelehnt ? (
          <button
            type="button"
            disabled={busy}
            onClick={onZurueck}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors disabled:opacity-50"
            style={{ border: "1.5px solid #E0DDD6", color: "rgba(26,26,46,0.6)", background: "white" }}
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Undo2 className="w-3.5 h-3.5" />}
            Zurückholen
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={busy || angefragt || !!frei}
              onClick={onKontakt}
              className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[13.5px] font-bold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              style={{ background: "#E8A838", color: "#1A1A2E" }}
            >
              {busy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.6} />
              )}
              {frei ? "Kontakt freigegeben" : angefragt ? "Anfrage läuft" : "Kontakt anfragen"}
            </button>
            {v.status !== "INTERESTED" && (
              <button
                type="button"
                disabled={busy}
                onClick={onMerken}
                title="Vormerken"
                aria-label="Vormerken"
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 h-10 text-[13px] font-medium transition-colors disabled:opacity-50"
                style={{ border: "1.5px solid #E0DDD6", color: "rgba(26,26,46,0.6)", background: "white" }}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Vormerken
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={onAblehnen}
              title="Passt nicht"
              aria-label="Passt nicht"
              className="inline-flex items-center justify-center rounded-full w-10 h-10 flex-shrink-0 transition-colors disabled:opacity-50"
              style={{ border: "1.5px solid #E0DDD6", color: "rgba(26,26,46,0.45)", background: "white" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </motion.article>
  );
}
