"use client";

// ─── Kandidatenkarte (Arbeitgeber-Sicht) ─────────────────────────────────────
// Breite Zeile statt schmaler Kachel: ein Chef scannt von links nach rechts —
// wer, wie weit, wie erfahren, was kostet er, was ist der nächste Schritt.
//
// Das Bild links zeigt das GEWERK, nie die Person. Es ist bewusst abgedunkelt
// und trägt den Vermerk "Anonymes Profil", damit kein Zweifel entsteht. Name,
// Foto und Kontaktdaten gibt ausschließlich der Kandidat frei.

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, CalendarDays, Award, Clock3, Send, Check, Loader2,
  ShieldCheck, X, Route, Briefcase, Star, ChevronRight, Eye, Heart, Sparkles, Phone, Mail,
  Truck,
} from "lucide-react";
import type { Candidate } from "@/lib/types";
import ScoreExplainer from "@/app/components/ScoreExplainer";

/** Symbolbild je Gewerk — echtes Foto, aber niemals die Person. */
const TRADE_IMAGE: Record<string, string> = {
  "Elektriker / Elektroniker": "/images/elektriker-werkstatt.jpg",
  "Installateur / Klempner (SHK)": "/images/shk-heizung.jpg",
  "Heizungs- & Lüftungsbauer": "/images/shk-heizung.jpg",
  "Maler & Lackierer": "/images/maler-leiter.jpg",
  "Tischler / Schreiner": "/images/tischler-hobel.jpg",
  "Maurer / Betonbauer": "/images/maurer-ziegel.jpg",
  "Metallbauer / Schlosser": "/images/metallbau-schweisser.jpg",
  "Dachdecker": "/images/hero-team-werkstatt.jpg",
};
const FALLBACK_IMAGE = "/images/hero-team-werkstatt.jpg";

function Fact({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof MapPin;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(249, 173, 7,0.13)" }}
      >
        <Icon className="w-[18px] h-[18px]" style={{ color: "#8A5F04" }} strokeWidth={2.2} />
      </span>
      <span className="min-w-0">
        <span
          className="block text-[17px] font-bold tabular-nums text-primary leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value}
        </span>
        <span className="block text-[11.5px] mt-1" style={{ color: "rgba(12, 51, 48,0.45)" }}>
          {label}
        </span>
      </span>
    </div>
  );
}

function Tag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "gold" }) {
  const gold = tone === "gold";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium"
      style={{
        background: gold ? "rgba(249, 173, 7,0.15)" : "rgba(12, 51, 48,0.05)",
        color: gold ? "#6E4A03" : "rgba(12, 51, 48,0.68)",
      }}
    >
      {children}
    </span>
  );
}

// ─── Volles Profil ───────────────────────────────────────────────────────────
function ProfileDialog({
  candidate,
  onClose,
  onRequest,
}: {
  candidate: Candidate;
  onClose: () => void;
  onRequest?: () => void;
}) {
  const c = candidate;
  const img = TRADE_IMAGE[c.bereich] ?? FALLBACK_IMAGE;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{ background: "rgba(12, 51, 48,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={`Profil ${c.handle}`}
        className="w-full max-w-3xl my-auto overflow-hidden rounded-3xl bg-white"
        style={{ boxShadow: "0 50px 90px -30px rgba(12, 51, 48,0.65)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kopf */}
        <div className="relative h-40 sm:h-48">
          <Image src={img} alt="" fill sizes="768px" className="object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(160deg, rgba(12, 51, 48,0.72) 0%, rgba(12, 51, 48,0.94) 75%)" }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.16)", color: "white" }}
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute inset-x-0 bottom-0 p-6">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] mb-2.5"
              style={{ background: "rgba(249, 173, 7,0.22)", color: "#FBDA9A" }}
            >
              <ShieldCheck className="w-3 h-3" />
              Anonymes Profil
            </span>
            <h2
              className="text-white font-bold text-[26px] leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {c.handle}
            </h2>
            <p className="text-[14px] mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
              {c.bereich} · {c.region}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Briefcase, value: c.erfahrung ?? "—", label: "Erfahrung" },
              { icon: Route, value: c.distanceKm != null ? `${c.distanceKm} km` : "—", label: "Anfahrt zu Ihnen" },
              { icon: MapPin, value: c.radiusKm != null ? `${c.radiusKm} km` : "—", label: "Sein Suchradius" },
              { icon: CalendarDays, value: c.start ?? "—", label: "Kann starten" },
            ].map((f) => (
              <div key={f.label} className="rounded-2xl p-4" style={{ background: "var(--color-surface)" }}>
                <Fact icon={f.icon} value={f.value} label={f.label} />
              </div>
            ))}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] mb-2.5" style={{ color: "rgba(12, 51, 48,0.4)" }}>
              Ausbildung
            </p>
            <div className="flex flex-wrap gap-2">
              {c.ausbildung && (
                <Tag tone="gold">
                  <Award className="w-3.5 h-3.5" />
                  {c.ausbildung}
                </Tag>
              )}
              {c.beruf && <Tag>{c.beruf}</Tag>}
            </div>
          </div>

          {c.aufgaben.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] mb-2.5" style={{ color: "rgba(12, 51, 48,0.4)" }}>
                Erfahrung in
              </p>
              <div className="flex flex-wrap gap-2">
                {c.aufgaben.map((a) => (
                  <Tag key={a}>{a}</Tag>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] mb-2.5" style={{ color: "rgba(12, 51, 48,0.4)" }}>
              Rahmenbedingungen
            </p>
            <div className="flex flex-wrap gap-2">
              {c.montage && <Tag>Montage: {c.montage}</Tag>}
              {c.fuehrerschein && <Tag>{c.fuehrerschein}</Tag>}
              {c.deutsch && <Tag>Deutsch: {c.deutsch}</Tag>}
            </div>
          </div>

          {c.prioritaeten.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] mb-2.5" style={{ color: "rgba(12, 51, 48,0.4)" }}>
                Worauf es ihm ankommt
              </p>
              <div className="flex flex-wrap gap-2">
                {c.prioritaeten.map((x) => (
                  <Tag key={x}>{x}</Tag>
                ))}
              </div>
            </div>
          )}

          {c.freigegeben ? (
            <div
              className="rounded-2xl px-5 py-4"
              style={{ background: "rgba(22,163,74,0.09)", border: "1px solid rgba(22,163,74,0.3)" }}
            >
              <p className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: "#15803D" }}>
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                Freigegeben
              </p>
              <p className="text-[19px] font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                {c.freigegeben.name}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5 text-[14px]" style={{ color: "rgba(12, 51, 48,0.7)" }}>
                <a href={`tel:${c.freigegeben.telefon.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5">
                  <Phone className="w-4 h-4" style={{ color: "#15803D" }} />
                  {c.freigegeben.telefon}
                </a>
                <a href={`mailto:${c.freigegeben.email}`} className="inline-flex items-center gap-1.5">
                  <Mail className="w-4 h-4" style={{ color: "#15803D" }} />
                  {c.freigegeben.email}
                </a>
              </div>
            </div>
          ) : (
            <div
              className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
              style={{ background: "rgba(12, 51, 48,0.035)" }}
            >
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#F9AD07" }} />
              <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(12, 51, 48,0.6)" }}>
                Name, Foto und Kontaktdaten sind ausgeblendet. Sie werden sichtbar, sobald
                der Kandidat Ihre Anfrage annimmt.
              </p>
            </div>
          )}
        </div>

        {c.status === "verfuegbar" && onRequest && (
          <div className="px-6 py-5 flex flex-col sm:flex-row gap-3" style={{ background: "var(--color-surface)" }}>
            <button
              type="button"
              onClick={onClose}
              className="sm:flex-1 rounded-full px-5 py-3.5 text-[14px] font-semibold"
              style={{ border: "1.5px solid #D9D3C6", color: "rgba(12, 51, 48,0.6)", background: "white" }}
            >
              Zurück zur Liste
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequest();
              }}
              className="sm:flex-1 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[15px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                background: "#F9AD07",
                color: "#0C3330",
                fontFamily: "var(--font-display)",
                boxShadow: "0 14px 28px -14px rgba(249, 173, 7,0.9)",
              }}
            >
              <Send className="w-4 h-4" />
              Kontakt anfragen
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Anfrage-Dialog ──────────────────────────────────────────────────────────
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
      className="fixed inset-0 z-[130] flex items-center justify-center p-5"
      style={{ background: "rgba(12, 51, 48,0.6)", backdropFilter: "blur(4px)" }}
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
          <div className="min-w-0">
            <h3
              className="text-primary font-bold text-[18px] leading-snug mb-1.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Kontakt anfragen
            </h3>
            <p className="text-[14px] leading-relaxed" style={{ color: "rgba(12, 51, 48,0.62)" }}>
              <strong className="text-primary">{candidate.handle}</strong> entscheidet
              selbst. Erst bei Zusage sehen Sie Name und Kontaktdaten.
            </p>
          </div>
        </div>

        <div className="px-6 pb-5">
          <label
            className="block text-[10px] uppercase tracking-[0.16em] font-semibold mb-2"
            style={{ color: "rgba(12, 51, 48,0.45)" }}
          >
            Für welche Stelle?
          </label>
          <input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="z. B. Elektriker Gebäudetechnik"
            className="w-full rounded-2xl bg-white text-primary text-[15px] px-4 py-3.5 outline-none"
            style={{ border: "1.5px solid #E4DFD3" }}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 px-6 py-5" style={{ background: "var(--color-surface)" }}>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full px-5 py-3.5 text-[14px] font-semibold"
            style={{ border: "1.5px solid #D9D3C6", color: "rgba(12, 51, 48,0.6)", background: "white" }}
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={() => onConfirm(position.trim() || "Offene Stelle")}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
            style={{
              background: "#F9AD07",
              color: "#0C3330",
              fontFamily: "var(--font-display)",
              boxShadow: "0 14px 28px -14px rgba(249, 173, 7,0.9)",
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

// ─── Karte ───────────────────────────────────────────────────────────────────
export default function CandidateCard({
  candidate,
  onRequest,
}: {
  candidate: Candidate;
  onRequest?: (position: string) => Promise<void>;
}) {
  const [profile, setProfile] = useState(false);
  const [request, setRequest] = useState(false);
  const [busy, setBusy] = useState(false);
  const c = candidate;
  const img = TRADE_IMAGE[c.bereich] ?? FALLBACK_IMAGE;

  const confirm = async (position: string) => {
    if (!onRequest) return;
    setBusy(true);
    await onRequest(position);
    setBusy(false);
    setRequest(false);
  };

  const status: Record<Candidate["status"], { text: string; bg: string; color: string } | null> = {
    verfuegbar: null,
    angefragt: { text: "Anfrage läuft — Kandidat entscheidet", bg: "rgba(249, 173, 7,0.16)", color: "#6E4A03" },
    freigegeben: { text: "Profil freigegeben", bg: "rgba(22,163,74,0.14)", color: "#15803D" },
    abgelehnt: { text: "Kandidat hat abgelehnt", bg: "rgba(12, 51, 48,0.06)", color: "rgba(12, 51, 48,0.5)" },
  };
  const st = status[c.status];
  const top = c.matchScore >= 80;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setProfile(true)}
        className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1"
        style={{
          border: `1.5px solid ${top ? "rgba(249, 173, 7,0.55)" : "#E4DFD3"}`,
          boxShadow: "0 14px 40px -28px rgba(12, 51, 48,0.55)",
        }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Gewerk-Bild — bewusst nicht die Person */}
          <div className="relative w-full sm:w-[240px] h-44 sm:h-auto flex-shrink-0 overflow-hidden">
            <Image
              src={img}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 240px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(155deg, rgba(12, 51, 48,0.55) 0%, rgba(12, 51, 48,0.86) 100%)" }}
            />
            <div className="absolute inset-0 p-4 flex flex-col justify-between">
              <span
                className="inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em]"
                style={{ background: "rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.9)" }}
              >
                <ShieldCheck className="w-3 h-3" />
                Anonym
              </span>
              <div>
                <p
                  className="text-white font-bold text-[19px] leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {c.handle}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {c.bereich}
                </p>
              </div>
            </div>
          </div>

          {/* Inhalt */}
          <div className="flex-1 min-w-0 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <p className="inline-flex items-center gap-1.5 text-[13.5px]" style={{ color: "rgba(12, 51, 48,0.55)" }}>
                <MapPin className="w-4 h-4" style={{ color: "#F9AD07" }} />
                {c.region}
                <span className="mx-1" style={{ color: "rgba(12, 51, 48,0.2)" }}>·</span>
                <Clock3 className="w-3.5 h-3.5" />
                aktiv {c.zuletztAktiv}
              </p>

              {c.matchScore > 0 && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 flex-shrink-0"
                  style={{
                    background: top ? "rgba(249, 173, 7,0.2)" : "rgba(12, 51, 48,0.05)",
                    color: top ? "#6E4A03" : "rgba(12, 51, 48,0.6)",
                  }}
                >
                  {top ? <Star className="w-4 h-4" fill="currentColor" /> : <Sparkles className="w-4 h-4" />}
                  <span
                    className="text-[15px] font-bold tabular-nums"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {c.matchScore} %
                    <ScoreExplainer breakdown={c.matchBreakdown} subject={c.handle} />
                  </span>
                </span>
              )}
            </div>

            {/* Kernzahlen in einer Zeile — von links nach rechts lesbar */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-4 mb-5">
              <Fact icon={Briefcase} value={c.erfahrung ?? "—"} label="Erfahrung" />
              <Fact icon={Route} value={c.distanceKm != null ? `${c.distanceKm} km` : "—"} label="Anfahrt" />
              <Fact icon={CalendarDays} value={c.start ?? "—"} label="Kann starten" />
              <Fact icon={Truck} value={c.montage ?? "—"} label="Montage" />
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {c.ausbildung && (
                <Tag tone="gold">
                  <Award className="w-3.5 h-3.5" />
                  {c.ausbildung}
                </Tag>
              )}
              {c.aufgaben.slice(0, 3).map((a) => (
                <Tag key={a}>{a}</Tag>
              ))}
            </div>

            {/* Aktionen */}
            {c.freigegeben ? (
              <div
                className="rounded-2xl px-5 py-4"
                style={{ background: "rgba(22,163,74,0.09)", border: "1px solid rgba(22,163,74,0.3)" }}
              >
                <p
                  className="inline-flex items-center gap-2 text-[13px] font-bold mb-2"
                  style={{ color: "#15803D" }}
                >
                  <Check className="w-4 h-4" strokeWidth={3} />
                  Profil freigegeben — Sie dürfen Kontakt aufnehmen
                </p>
                <p className="text-[16px] font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                  {c.freigegeben.name}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[13px]" style={{ color: "rgba(12, 51, 48,0.65)" }}>
                  <a href={`tel:${c.freigegeben.telefon.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Phone className="w-3.5 h-3.5" style={{ color: "#15803D" }} />
                    {c.freigegeben.telefon}
                  </a>
                  <a href={`mailto:${c.freigegeben.email}`} className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Mail className="w-3.5 h-3.5" style={{ color: "#15803D" }} />
                    {c.freigegeben.email}
                  </a>
                </div>
              </div>
            ) : st ? (
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
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRequest(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[14.5px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "#F9AD07",
                    color: "#0C3330",
                    fontFamily: "var(--font-display)",
                    boxShadow: "0 14px 28px -16px rgba(249, 173, 7,0.95)",
                  }}
                >
                  <Heart className="w-4 h-4" />
                  Interesse anmelden
                </button>
                <span
                  className="inline-flex items-center gap-1.5 text-[14px] font-semibold transition-colors"
                  style={{ color: "rgba(12, 51, 48,0.5)" }}
                >
                  <Eye className="w-4 h-4" />
                  Profil ansehen
                  <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.article>

      <AnimatePresence>
        {profile && (
          <ProfileDialog
            candidate={c}
            onClose={() => setProfile(false)}
            onRequest={onRequest ? () => setRequest(true) : undefined}
          />
        )}
        {request && (
          <RequestDialog
            candidate={c}
            busy={busy}
            onCancel={() => setRequest(false)}
            onConfirm={confirm}
          />
        )}
      </AnimatePresence>
    </>
  );
}
