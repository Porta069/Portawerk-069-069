"use client";

// ─── Kandidatenkarte (Arbeitgeber-Sicht) ─────────────────────────────────────
// Fachlich vollständig, aber personenlos: kein Name, kein Foto, keine Adresse,
// keine Kontaktdaten. Das ist kein Anzeigefehler, sondern das Kernversprechen —
// erst wenn der Kandidat zustimmt, wird das Profil freigegeben.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Euro, CalendarDays, Award, Clock3, UserRound, Send, Check, Loader2,
  ShieldCheck, X, Target,
} from "lucide-react";
import type { Candidate } from "@/lib/types";

function euro(n: number) {
  return n.toLocaleString("de-DE");
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
      style={{ background: "rgba(26,26,46,0.05)", color: "rgba(26,26,46,0.72)" }}
    >
      {children}
    </span>
  );
}

/** Anfrage-Dialog: knapp, erklärt nur, was der Klick auslöst. */
function RequestDialog({
  candidate,
  busy,
  onCancel,
  onConfirm,
}: {
  candidate: Candidate;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (position: string) => void;
}) {
  const [position, setPosition] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-5"
      style={{ background: "rgba(26,26,46,0.55)", backdropFilter: "blur(3px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label="Kontakt anfragen"
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white"
        style={{ boxShadow: "0 40px 80px -30px rgba(26,26,46,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 p-6">
          <span
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(232,168,56,0.16)" }}
          >
            <ShieldCheck className="w-5 h-5" style={{ color: "#B47B18" }} />
          </span>
          <div className="min-w-0">
            <h3
              className="text-primary font-bold text-[18px] leading-snug mb-1.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Kontakt anfragen
            </h3>
            <p className="text-[14px] leading-relaxed" style={{ color: "rgba(26,26,46,0.62)" }}>
              <strong className="text-primary">{candidate.handle}</strong> bekommt dein
              Angebot und entscheidet selbst. Erst bei Zusage siehst du Name und
              Kontaktdaten.
            </p>
          </div>
        </div>

        <div className="px-6 pb-5">
          <label
            className="block text-[10px] uppercase tracking-[0.16em] font-semibold mb-2"
            style={{ color: "rgba(26,26,46,0.45)" }}
          >
            Für welche Stelle?
          </label>
          <input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="z. B. Elektriker Gebäudetechnik"
            className="w-full rounded-2xl bg-white text-primary text-[15px] px-4 py-3.5 outline-none"
            style={{ border: "1.5px solid #E9E7E1" }}
          />
        </div>

        <div
          className="flex flex-col-reverse sm:flex-row gap-3 px-6 py-5"
          style={{ background: "var(--color-surface)" }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full px-5 py-3.5 text-[14px] font-semibold"
            style={{ border: "1.5px solid #E0DDD6", color: "rgba(26,26,46,0.6)", background: "white" }}
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={() => onConfirm(position.trim() || "Offene Stelle")}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
            style={{
              background: "#E8A838",
              color: "#1A1A2E",
              fontFamily: "var(--font-display)",
              boxShadow: "0 14px 28px -14px rgba(232,168,56,0.9)",
            }}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Anfrage senden
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CandidateCard({
  candidate,
  onRequest,
}: {
  candidate: Candidate;
  onRequest?: (position: string) => Promise<void>;
}) {
  const [dialog, setDialog] = useState(false);
  const [busy, setBusy] = useState(false);
  const c = candidate;

  const confirm = async (position: string) => {
    if (!onRequest) return;
    setBusy(true);
    await onRequest(position);
    setBusy(false);
    setDialog(false);
  };

  const statusLabel: Record<Candidate["status"], { text: string; bg: string; color: string } | null> = {
    verfuegbar: null,
    angefragt: { text: "Anfrage läuft — Kandidat entscheidet", bg: "rgba(232,168,56,0.16)", color: "#B47B18" },
    freigegeben: { text: "Profil freigegeben", bg: "rgba(22,163,74,0.12)", color: "#15803D" },
    abgelehnt: { text: "Kandidat hat abgelehnt", bg: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.5)" },
  };
  const st = statusLabel[c.status];

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl bg-white p-5 sm:p-6"
      style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 10px 30px -24px rgba(26,26,46,0.5)" }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Bewusst eine Silhouette statt eines Fotos */}
          <span
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(26,26,46,0.06)" }}
          >
            <UserRound className="w-5 h-5" style={{ color: "rgba(26,26,46,0.35)" }} />
          </span>
          <div className="min-w-0">
            <h3
              className="text-primary font-bold text-[18px] leading-snug truncate"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {c.handle}
            </h3>
            <p className="text-[13px] truncate" style={{ color: "rgba(26,26,46,0.55)" }}>
              {c.gewerk}
            </p>
          </div>
        </div>

        <span
          className="flex flex-col items-end flex-shrink-0 rounded-xl px-3 py-1.5"
          style={{ background: "rgba(232,168,56,0.12)" }}
        >
          <span
            className="inline-flex items-center gap-1.5 text-[15px] font-bold tabular-nums"
            style={{ fontFamily: "var(--font-display)", color: "#1A1A2E" }}
          >
            <Target className="w-4 h-4" style={{ color: "#E8A838" }} />
            {c.matchScore} %
          </span>
          <span className="text-[10px]" style={{ color: "rgba(26,26,46,0.45)" }}>
            Übereinstimmung
          </span>
        </span>
      </div>

      {/* Kennzahlen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        {[
          { label: "Erfahrung", value: `${c.erfahrungJahre} J.` },
          { label: "Entfernung", value: `${c.distanceKm} km` },
          { label: "Sucht bis", value: `${c.radiusKm} km` },
          { label: "Verfügbar", value: c.verfuegbarAb.replace("Ab ", "") },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl px-3 py-2.5" style={{ background: "var(--color-surface)" }}>
            <p
              className="text-[16px] font-bold tabular-nums text-primary leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {s.value}
            </p>
            <p className="text-[10.5px] mt-1" style={{ color: "rgba(26,26,46,0.45)" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Gehaltsvorstellung */}
      <div className="rounded-2xl px-4 py-3 mb-4" style={{ background: "rgba(232,168,56,0.09)" }}>
        <span
          className="inline-flex items-center gap-1.5 text-[17px] font-bold tabular-nums text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <Euro className="w-4 h-4" style={{ color: "#E8A838" }} />
          {euro(c.gehaltVon)} – {euro(c.gehaltBis)}
        </span>
        <span className="text-[11.5px] ml-2" style={{ color: "rgba(26,26,46,0.5)" }}>
          Gehaltsvorstellung, brutto/Monat
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Chip>
          <MapPin className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
          {c.region}
        </Chip>
        <Chip>
          <CalendarDays className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
          {c.verfuegbarAb}
        </Chip>
        {c.zertifikate.map((z) => (
          <Chip key={z}>
            <Award className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
            {z}
          </Chip>
        ))}
        {c.bereitschaft.map((b) => (
          <Chip key={b}>{b}</Chip>
        ))}
      </div>

      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] mb-5" style={{ color: "rgba(26,26,46,0.45)" }}>
        <span>Wichtig: {c.praeferenz}</span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="w-3.5 h-3.5" />
          zuletzt aktiv {c.zuletztAktiv}
        </span>
      </p>

      {/* Aktion */}
      {st ? (
        <p
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold"
          style={{ background: st.bg, color: st.color }}
        >
          {c.status === "freigegeben" ? (
            <Check className="w-4 h-4" strokeWidth={3} />
          ) : c.status === "abgelehnt" ? (
            <X className="w-4 h-4" strokeWidth={3} />
          ) : (
            <Clock3 className="w-4 h-4" />
          )}
          {st.text}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setDialog(true)}
          className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
          style={{
            background: "#1A1A2E",
            color: "white",
            fontFamily: "var(--font-display)",
          }}
        >
          <Send className="w-4 h-4" />
          Interesse — Kontakt anfragen
        </button>
      )}

      <AnimatePresence>
        {dialog && (
          <RequestDialog
            candidate={c}
            busy={busy}
            onCancel={() => setDialog(false)}
            onConfirm={confirm}
          />
        )}
      </AnimatePresence>
    </motion.article>
  );
}
