"use client";

// ─── Jobangebot ───────────────────────────────────────────────────────────────
// Die Bewerbungsrichtung ist umgedreht: der Betrieb bewirbt sich beim
// Handwerker. Annehmen und Ablehnen sind gleichwertig sichtbar — wer ablehnen
// darf, entscheidet leichter. Vor dem Annehmen erklärt ein Dialog, welche Daten
// dadurch freigegeben werden; das ist unser Diskretionsversprechen, eingelöst.

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2, ShieldCheck, MailOpen, Quote } from "lucide-react";
import type { JobOffer } from "@/lib/types";
import { DECLINE_REASONS, type DeclineReason } from "@/lib/jobsService";
import JobCard from "./JobCard";

// ─── Freigabe-Dialog vor dem Annehmen ────────────────────────────────────────
function AcceptDialog({
  offer,
  busy,
  onCancel,
  onConfirm,
}: {
  offer: JobOffer;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
      style={{ background: "rgba(12, 51, 48,0.55)", backdropFilter: "blur(3px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label="Angebot annehmen"
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white"
        style={{ boxShadow: "0 40px 80px -30px rgba(12, 51, 48,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 p-6">
          <span
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(249, 173, 7,0.16)" }}
          >
            <ShieldCheck className="w-5 h-5" style={{ color: "#8A5F04" }} />
          </span>
          {/* Bewusst knapp: nur was die Entscheidung wirklich beeinflusst. */}
          <div className="min-w-0">
            <h3
              className="text-primary font-bold text-[18px] leading-snug mb-1.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Profil freigeben?
            </h3>
            <p className="text-[14px] leading-relaxed" style={{ color: "rgba(12, 51, 48,0.62)" }}>
              <strong className="text-primary">{offer.job.employer}</strong> sieht dann
              deinen Namen und deine Kontaktdaten. Jederzeit widerrufbar.
            </p>
          </div>
        </div>

        <div
          className="flex flex-col-reverse sm:flex-row gap-3 px-6 py-5"
          style={{ background: "var(--color-surface)" }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full px-5 py-3.5 text-[14px] font-semibold transition-colors"
            style={{ border: "1.5px solid #D9D3C6", color: "rgba(12, 51, 48,0.6)", background: "white" }}
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
            style={{
              background: "#16A34A",
              color: "white",
              fontFamily: "var(--font-display)",
              boxShadow: "0 14px 28px -14px rgba(22,163,74,0.9)",
            }}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={3} />}
            Annehmen
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Ablehn-Dialog mit Grund ─────────────────────────────────────────────────
function DeclineDialog({
  busy,
  onCancel,
  onConfirm,
}: {
  busy: boolean;
  onCancel: () => void;
  onConfirm: (reason: DeclineReason) => void;
}) {
  const [reason, setReason] = useState<DeclineReason | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
      style={{ background: "rgba(12, 51, 48,0.55)", backdropFilter: "blur(3px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label="Angebot ablehnen"
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6"
        style={{ boxShadow: "0 40px 80px -30px rgba(12, 51, 48,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-primary font-bold text-[18px] mb-1.5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Warum passt es nicht?
        </h3>
        <p className="text-[13.5px] mb-5" style={{ color: "rgba(12, 51, 48,0.55)" }}>
          Bleibt unter uns — hilft uns nur, dir Besseres zu zeigen.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {DECLINE_REASONS.map((r) => {
            const active = reason === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setReason(r.value)}
                className="rounded-full px-4 py-2.5 text-[13px] font-medium transition-all duration-200"
                style={{
                  background: active ? "#0C3330" : "white",
                  color: active ? "white" : "rgba(12, 51, 48,0.6)",
                  border: `1.5px solid ${active ? "#0C3330" : "#E4DFD3"}`,
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full px-5 py-3.5 text-[14px] font-semibold"
            style={{ border: "1.5px solid #D9D3C6", color: "rgba(12, 51, 48,0.6)" }}
          >
            Zurück
          </button>
          <button
            type="button"
            onClick={() => reason && onConfirm(reason)}
            disabled={!reason || busy}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-bold transition-all disabled:opacity-40"
            style={{ background: "#0C3330", color: "white", fontFamily: "var(--font-display)" }}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" strokeWidth={3} />}
            Ablehnen
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Karte ───────────────────────────────────────────────────────────────────
export default function OfferCard({
  offer,
  onRespond,
}: {
  offer: JobOffer;
  onRespond: (decision: "angenommen" | "abgelehnt", reason?: DeclineReason) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [dialog, setDialog] = useState<null | "accept" | "decline">(null);
  const [busy, setBusy] = useState(false);

  const respond = async (decision: "angenommen" | "abgelehnt", reason?: DeclineReason) => {
    setBusy(true);
    await onRespond(decision, reason);
    setBusy(false);
    setDialog(null);
  };

  const decided = offer.status !== "neu";

  return (
    <div className="space-y-3">
      {/* Persönliche Nachricht des Betriebs — mit Neugier-Lücke */}
      <div
        className="rounded-3xl bg-white p-5 sm:p-6"
        style={{ border: "1.5px solid #E4DFD3", boxShadow: "0 10px 30px -24px rgba(12, 51, 48,0.5)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: "rgba(249, 173, 7,0.14)" }}
          >
            <Image src={offer.job.image} alt="" width={36} height={36} className="object-cover w-full h-full" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-primary truncate">
              Nachricht von {offer.job.employer}
            </p>
            <p className="text-[11px]" style={{ color: "rgba(12, 51, 48,0.42)" }}>
              {offer.contactPerson} · {offer.receivedAt}
            </p>
          </div>
        </div>

        <div className="relative">
          <Quote className="w-4 h-4 mb-1.5" style={{ color: "rgba(249, 173, 7,0.7)" }} />
          <p
            className="text-[14px] leading-relaxed"
            style={{
              color: "rgba(12, 51, 48,0.72)",
              ...(expanded
                ? {}
                : {
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
                  }),
            }}
          >
            Hallo, {offer.message}
          </p>
          {!expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-bold"
              style={{ color: "#8A5F04" }}
            >
              <MailOpen className="w-3.5 h-3.5" />
              Ganze Nachricht lesen
            </button>
          )}
        </div>
      </div>

      <JobCard
        job={offer.job}
        highlight={!decided}
        footer={
          decided ? (
            <p
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold"
              style={
                offer.status === "angenommen"
                  ? { background: "rgba(22,163,74,0.12)", color: "#16A34A" }
                  : { background: "rgba(12, 51, 48,0.06)", color: "rgba(12, 51, 48,0.5)" }
              }
            >
              {offer.status === "angenommen" ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={3} />
                  Angenommen — der Betrieb meldet sich bei dir
                </>
              ) : (
                <>
                  <X className="w-4 h-4" strokeWidth={3} />
                  Abgelehnt
                </>
              )}
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setDialog("accept")}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
                style={{
                  background: "#16A34A",
                  color: "white",
                  fontFamily: "var(--font-display)",
                  boxShadow: "0 14px 28px -16px rgba(22,163,74,0.9)",
                }}
              >
                <Check className="w-4 h-4" strokeWidth={3} />
                Annehmen
              </button>
              <button
                type="button"
                onClick={() => setDialog("decline")}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-semibold transition-colors"
                style={{ border: "1.5px solid #D9D3C6", color: "rgba(12, 51, 48,0.6)", background: "white" }}
              >
                Passt nicht
              </button>
            </div>
          )
        }
      />

      <AnimatePresence>
        {dialog === "accept" && (
          <AcceptDialog
            offer={offer}
            busy={busy}
            onCancel={() => setDialog(null)}
            onConfirm={() => respond("angenommen")}
          />
        )}
        {dialog === "decline" && (
          <DeclineDialog
            busy={busy}
            onCancel={() => setDialog(null)}
            onConfirm={(reason) => respond("abgelehnt", reason)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
