"use client";

// ─── Unternehmensprofil (Arbeitgeber) ────────────────────────────────────────
// Links bearbeiten, rechts sofort sehen, wie das Angebot beim Handwerker
// ankommt. Der Betrieb soll nicht raten müssen, wie er dasteht — deshalb ist
// die Vorschau kein Extra, sondern steht gleichberechtigt daneben und
// aktualisiert sich beim Tippen.

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Building2, MapPin, Phone, Mail, Globe, Users, CalendarDays, Loader2, Check,
  Save, Eye, Sparkles, Home, Timer, Palmtree, ImagePlus, Trash2, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import {
  getEmployerProfile, saveEmployerProfile, profileGaps, profileScore,
  BENEFIT_OPTIONEN, MONTAGE_OPTIONEN,
} from "@/lib/employerService";
import type { EmployerProfile } from "@/lib/types";

/**
 * Verkleinert das Logo auf max. 320 px Kantenlaenge. Transparenz bleibt
 * erhalten (PNG), sonst wird als JPEG komprimiert — so passt es sicher in
 * localStorage und spaeter in eine Datenbankspalte.
 */
function resizeLogo(file: File, max = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    // SVG braucht keine Rasterung.
    if (file.type === "image/svg+xml") {
      const r = new FileReader();
      r.onerror = () => reject(new Error("read"));
      r.onload = () => resolve(String(r.result));
      r.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("img"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("ctx"));
        ctx.drawImage(img, 0, 0, w, h);
        const keepAlpha = file.type === "image/png" || file.type === "image/webp";
        resolve(canvas.toDataURL(keepAlpha ? "image/png" : "image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const inputCls =
  "w-full rounded-2xl bg-white text-primary text-[15px] px-4 py-3.5 outline-none transition-all placeholder:text-primary/25";
const inputStyle = { border: "1.5px solid #E9E7E1" } as const;

function Label({
  children,
  hint,
  optional,
}: {
  children: React.ReactNode;
  hint?: string;
  optional?: boolean;
}) {
  return (
    <label className="block mb-2">
      <span
        className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-semibold"
        style={{ color: "rgba(26,26,46,0.45)" }}
      >
        {children}
        {optional && (
          <span className="normal-case tracking-normal font-medium" style={{ color: "rgba(26,26,46,0.32)" }}>
            (optional)
          </span>
        )}
      </span>
      {hint && (
        <span className="block text-[12px] mt-0.5" style={{ color: "rgba(26,26,46,0.4)" }}>
          {hint}
        </span>
      )}
    </label>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-3xl bg-white p-5 sm:p-6"
      style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 10px 30px -26px rgba(26,26,46,0.5)" }}
    >
      <h2
        className="text-primary font-bold text-[17px] mb-1"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      {desc && (
        <p className="text-[13px] mb-5" style={{ color: "rgba(26,26,46,0.5)" }}>
          {desc}
        </p>
      )}
      <div className={desc ? "" : "mt-5"}>{children}</div>
    </section>
  );
}

/** Chip in der Vorschau — identisch zur Darstellung im Jobangebot. */
function PreviewChip({ icon: Icon, children }: { icon?: typeof Home; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
      style={{ background: "rgba(26,26,46,0.05)", color: "rgba(26,26,46,0.72)" }}
    >
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#E8A838" }} />}
      {children}
    </span>
  );
}

export default function EmployerProfilePage() {
  const { user } = useAuth();
  const [p, setP] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  useEffect(() => {
    getEmployerProfile().then((res) => {
      if (res.ok) {
        // Firmenname aus dem Konto vorbelegen, wenn noch nichts hinterlegt ist.
        setP({
          ...res.data,
          firmenname: res.data.firmenname || user?.companyName || "",
          kontaktEmail: res.data.kontaktEmail || user?.email || "",
        });
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof EmployerProfile>(k: K, v: EmployerProfile[K]) => {
    setP((cur) => (cur ? { ...cur, [k]: v } : cur));
    setSaved(false);
  };

  const toggleBenefit = (b: string) => {
    if (!p) return;
    set("benefits", p.benefits.includes(b) ? p.benefits.filter((x) => x !== b) : [...p.benefits, b]);
  };

  /**
   * Logo wird clientseitig auf 320 px verkleinert. Vorher wurden grosse
   * Dateien schlicht abgelehnt — die Fehlermeldung stand oben auf der Seite,
   * waehrend der Nutzer unten am Logo-Feld sass und dachte, nichts passiert.
   * PNG bleibt PNG, damit transparente Logos nicht auf weissem Kasten landen.
   */
  const handleLogo = async (file: File | null) => {
    if (!file) return;
    setLogoError(null);
    if (!file.type.startsWith("image/")) {
      setLogoError("Bitte eine Bilddatei wählen (PNG, JPG, SVG oder WebP).");
      return;
    }
    setLogoBusy(true);
    try {
      const dataUrl = await resizeLogo(file);
      set("logo", dataUrl);
    } catch {
      setLogoError("Diese Datei konnte nicht gelesen werden. Versuch es mit PNG oder JPG.");
    } finally {
      setLogoBusy(false);
    }
  };

  const save = async () => {
    if (!p) return;
    setSaving(true);
    setError(null);
    const res = await saveEmployerProfile(p);
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2600);
    } else setError(res.error);
  };

  if (loading || !p) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
      </div>
    );
  }

  const score = profileScore(p);
  const gaps = profileGaps(p);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <h1
            className="text-primary font-bold mb-1"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)" }}
          >
            Unternehmensprofil
          </h1>
          <p className="text-[15px]" style={{ color: "rgba(26,26,46,0.55)" }}>
            Diese Angaben sehen Handwerker, wenn Sie ihnen ein Angebot schicken.
          </p>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-bold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
          style={{
            background: saved ? "#16A34A" : "#E8A838",
            color: saved ? "white" : "#1A1A2E",
            fontFamily: "var(--font-display)",
            boxShadow: "0 14px 28px -16px rgba(232,168,56,0.9)",
          }}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" strokeWidth={3} />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? "Gespeichert" : "Speichern"}
        </button>
      </div>

      {error && (
        <div
          className="rounded-2xl px-4 py-3.5 mb-6 text-[13.5px] flex items-start gap-2.5"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#B91C1C" }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] gap-6 items-start">
        {/* ══ Bearbeiten ══ */}
        <div className="space-y-5">
          <Section title="Grunddaten" desc="Name und Kurzbeschreibung stehen im Angebot ganz oben.">
            <div className="space-y-4">
              <div>
                <Label>Firmenname</Label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={p.firmenname}
                  onChange={(e) => set("firmenname", e.target.value)}
                  placeholder="Muster Elektrotechnik GmbH"
                />
              </div>
              <div>
                <Label optional hint="Ein Satz, der Ihren Betrieb beschreibt">Kurzbeschreibung</Label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={p.slogan}
                  onChange={(e) => set("slogan", e.target.value)}
                  placeholder="Familienbetrieb für Gebäudetechnik seit 1998"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label optional>Gegründet</Label>
                  <input
                    className={inputCls}
                    style={inputStyle}
                    inputMode="numeric"
                    maxLength={4}
                    value={p.gruendungsjahr}
                    onChange={(e) => set("gruendungsjahr", e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="1998"
                  />
                </div>
                <div>
                  <Label optional>Mitarbeiter</Label>
                  <input
                    className={inputCls}
                    style={inputStyle}
                    value={p.mitarbeiter}
                    onChange={(e) => set("mitarbeiter", e.target.value)}
                    placeholder="z. B. 25"
                  />
                </div>
              </div>
              <div>
                <Label optional>Website</Label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={p.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="www.beispiel.de"
                />
              </div>
            </div>
          </Section>

          <Section title="Standort" desc="Bestimmt, welche Kandidaten Ihnen vorgeschlagen werden.">
            <div className="space-y-4">
              <div>
                <Label optional>Straße & Hausnummer</Label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={p.strasse}
                  onChange={(e) => set("strasse", e.target.value)}
                  placeholder="Handwerkerstraße 12"
                />
              </div>
              <div className="grid sm:grid-cols-[140px_minmax(0,1fr)] gap-4">
                <div>
                  <Label>PLZ</Label>
                  <input
                    className={`${inputCls} tabular-nums`}
                    style={inputStyle}
                    inputMode="numeric"
                    maxLength={5}
                    value={p.plz}
                    onChange={(e) => set("plz", e.target.value.replace(/\D/g, "").slice(0, 5))}
                    placeholder="80331"
                  />
                </div>
                <div>
                  <Label>Ort</Label>
                  <input
                    className={inputCls}
                    style={inputStyle}
                    value={p.ort}
                    onChange={(e) => set("ort", e.target.value)}
                    placeholder="München"
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Logo" desc="Optional — erscheint im Angebot neben Ihrem Namen.">
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ background: "rgba(26,26,46,0.05)" }}
              >
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo} alt="Firmenlogo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-7 h-7" style={{ color: "rgba(26,26,46,0.25)" }} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2.5">
                  <label
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-semibold cursor-pointer transition-colors"
                    style={{ border: "1.5px solid #E9E7E1", color: "rgba(26,26,46,0.65)" }}
                  >
                    {logoBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                    {logoBusy ? "Wird verarbeitet …" : p.logo ? "Ersetzen" : "Logo hochladen"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={logoBusy}
                      onChange={(e) => {
                        void handleLogo(e.target.files?.[0] ?? null);
                        // zuruecksetzen, damit dieselbe Datei erneut waehlbar ist
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {p.logo && (
                    <button
                      type="button"
                      onClick={() => set("logo", "")}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-semibold"
                      style={{ color: "rgba(26,26,46,0.5)" }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Entfernen
                    </button>
                  )}
                </div>
                <p className="text-[12px] mt-2" style={{ color: logoError ? "#B91C1C" : "rgba(26,26,46,0.45)" }}>
                  {logoError ?? "PNG, JPG, SVG oder WebP — wird automatisch verkleinert."}
                </p>
              </div>
            </div>
          </Section>

          <Section title="Ansprechpartner" desc="Optional, aber wirksam — Handwerker bewerben sich bei Menschen, nicht bei einer GmbH.">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={p.kontaktName}
                  onChange={(e) => set("kontaktName", e.target.value)}
                  placeholder="Andreas Vogt"
                />
              </div>
              <div>
                <Label optional>Position</Label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={p.kontaktPosition}
                  onChange={(e) => set("kontaktPosition", e.target.value)}
                  placeholder="Betriebsleiter"
                />
              </div>
              <div>
                <Label>Telefon</Label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={p.kontaktTelefon}
                  onChange={(e) => set("kontaktTelefon", e.target.value)}
                  placeholder="+49 89 1234567"
                />
              </div>
              <div>
                <Label>E-Mail</Label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={p.kontaktEmail}
                  onChange={(e) => set("kontaktEmail", e.target.value)}
                  placeholder="kontakt@beispiel.de"
                />
              </div>
            </div>
          </Section>

          <Section
            title="Arbeitsbedingungen"
            desc="Die Punkte, nach denen Handwerker zuerst filtern."
          >
            <div className="space-y-5">
              <div>
                <Label>Montageaufkommen</Label>
                <div className="flex flex-wrap gap-2">
                  {MONTAGE_OPTIONEN.map((m) => {
                    const on = p.montage === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => set("montage", on ? "" : m)}
                        className="rounded-full px-4 py-2.5 text-[13.5px] font-medium transition-all duration-200"
                        style={{
                          background: on ? "#1A1A2E" : "white",
                          color: on ? "white" : "rgba(26,26,46,0.6)",
                          border: `1.5px solid ${on ? "#1A1A2E" : "#E9E7E1"}`,
                        }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label optional>Urlaubstage pro Jahr</Label>
                  <input
                    className={`${inputCls} tabular-nums`}
                    style={inputStyle}
                    inputMode="numeric"
                    maxLength={2}
                    value={p.urlaubstage}
                    onChange={(e) => set("urlaubstage", e.target.value.replace(/\D/g, "").slice(0, 2))}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label>Arbeitsbeginn</Label>
                  <div className="flex gap-2">
                    {(["Betrieb", "Haustür"] as const).map((s) => {
                      const on = p.startpunkt === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => set("startpunkt", s)}
                          className="flex-1 rounded-2xl py-3.5 text-[13.5px] font-medium transition-all duration-200"
                          style={{
                            background: on ? "#1A1A2E" : "white",
                            color: on ? "white" : "rgba(26,26,46,0.6)",
                            border: `1.5px solid ${on ? "#1A1A2E" : "#E9E7E1"}`,
                          }}
                        >
                          ab {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => set("fahrzeitIstArbeitszeit", !p.fahrzeitIstArbeitszeit)}
                className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors"
                style={{
                  background: p.fahrzeitIstArbeitszeit ? "rgba(232,168,56,0.12)" : "white",
                  border: `1.5px solid ${p.fahrzeitIstArbeitszeit ? "#E8A838" : "#E9E7E1"}`,
                }}
              >
                <span
                  className="w-[20px] h-[20px] rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    border: `1.5px solid ${p.fahrzeitIstArbeitszeit ? "#E8A838" : "#DDD9D1"}`,
                    background: p.fahrzeitIstArbeitszeit ? "#E8A838" : "transparent",
                  }}
                >
                  {p.fahrzeitIstArbeitszeit && <Check className="w-3 h-3 text-primary" strokeWidth={4} />}
                </span>
                <span className="text-[14px] font-medium text-primary">
                  Fahrzeit zählt als Arbeitszeit
                </span>
              </button>
            </div>
          </Section>

          <Section title="Leistungen" desc="Optional — erscheinen als Chips im Angebot, mindestens drei empfohlen.">
            <div className="flex flex-wrap gap-2">
              {BENEFIT_OPTIONEN.map((b) => {
                const on = p.benefits.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBenefit(b)}
                    className="rounded-full px-4 py-2.5 text-[13.5px] font-medium transition-all duration-200"
                    style={{
                      background: on ? "rgba(232,168,56,0.16)" : "white",
                      color: on ? "#8A5B0F" : "rgba(26,26,46,0.6)",
                      border: `1.5px solid ${on ? "#E8A838" : "#E9E7E1"}`,
                    }}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Über uns" desc="Optional — zwei bis drei Sätze reichen, ehrlich schlägt Werbetext.">
            <textarea
              rows={5}
              className={`${inputCls} resize-none`}
              style={inputStyle}
              value={p.ueberUns}
              onChange={(e) => set("ueberUns", e.target.value)}
              placeholder="Wir sind ein Familienbetrieb mit 25 Mitarbeitern und arbeiten überwiegend im Raum München …"
            />
          </Section>
        </div>

        {/* ══ Vorschau ══ */}
        <div className="space-y-5 lg:sticky lg:top-[92px]">
          {/* Profilstärke */}
          <div
            className="rounded-3xl bg-white p-5"
            style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 10px 30px -26px rgba(26,26,46,0.5)" }}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-[15px] font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                Profilstärke
              </p>
              <span
                className="text-[19px] font-bold tabular-nums"
                style={{ fontFamily: "var(--font-display)", color: score >= 80 ? "#15803D" : "#B47B18" }}
              >
                {score} %
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: "#F1EEE8" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: score >= 80 ? "#16A34A" : "#E8A838" }}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            {gaps.length === 0 ? (
              <p className="inline-flex items-center gap-2 text-[13.5px] font-semibold" style={{ color: "#15803D" }}>
                <Check className="w-4 h-4" strokeWidth={3} />
                Vollständig — so wirken Sie am überzeugendsten.
              </p>
            ) : (
              <ul className="space-y-2">
                {gaps.slice(0, 3).map((g) => (
                  <li key={g.label} className="flex items-start gap-2.5">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-1" style={{ color: "#E8A838" }} />
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-semibold text-primary">{g.label}</span>
                      <span className="block text-[12px]" style={{ color: "rgba(26,26,46,0.5)" }}>
                        {g.hint}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* So sehen Handwerker Sie */}
          <div>
            <p
              className="inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.16em] mb-3"
              style={{ color: "rgba(26,26,46,0.45)" }}
            >
              <Eye className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
              So sehen Handwerker Ihr Angebot
            </p>

            <div
              className="overflow-hidden rounded-3xl bg-white"
              style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 16px 40px -28px rgba(26,26,46,0.6)" }}
            >
              {/* Kopf im Stil des Jobangebots */}
              <div className="relative h-24">
                <Image src="/images/hero-team-werkstatt.jpg" alt="" fill sizes="400px" className="object-cover" />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(150deg, rgba(26,26,46,0.6) 0%, rgba(26,26,46,0.92) 100%)" }}
                />
                <div className="absolute inset-0 flex items-center gap-3 px-5">
                  <span
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.14)" }}
                  >
                    {p.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.logo} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-5 h-5" style={{ color: "rgba(255,255,255,0.6)" }} />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span
                      className="block text-white font-bold text-[16px] truncate"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {p.firmenname || "Ihr Firmenname"}
                    </span>
                    <span className="block text-[12px] truncate" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {p.slogan || "Kurzbeschreibung fehlt noch"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]" style={{ color: "rgba(26,26,46,0.6)" }}>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
                    {p.plz || "PLZ"} {p.ort || "Ort"}
                  </span>
                  {p.mitarbeiter && (
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
                      {p.mitarbeiter} Mitarbeiter
                    </span>
                  )}
                  {p.gruendungsjahr && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
                      seit {p.gruendungsjahr}
                    </span>
                  )}
                </p>

                {/* Rahmenbedingungen — exakt die Chips aus der Stellenkarte */}
                <div className="flex flex-wrap gap-2">
                  {p.montage ? (
                    <PreviewChip icon={Home}>{p.montage}</PreviewChip>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px]"
                      style={{ background: "rgba(239,68,68,0.07)", color: "#B91C1C" }}
                    >
                      Montageaufkommen fehlt
                    </span>
                  )}
                  {p.fahrzeitIstArbeitszeit && <PreviewChip icon={Timer}>Fahrzeit = Arbeitszeit</PreviewChip>}
                  <PreviewChip icon={MapPin}>Start ab {p.startpunkt}</PreviewChip>
                  {p.urlaubstage && <PreviewChip icon={Palmtree}>{p.urlaubstage} Urlaubstage</PreviewChip>}
                  {p.benefits.map((b) => (
                    <PreviewChip key={b} icon={Sparkles}>
                      {b}
                    </PreviewChip>
                  ))}
                </div>

                {p.ueberUns ? (
                  <p className="text-[13px] leading-relaxed" style={{ color: "rgba(26,26,46,0.65)" }}>
                    {p.ueberUns}
                  </p>
                ) : (
                  <p className="text-[13px] italic" style={{ color: "rgba(26,26,46,0.35)" }}>
                    Hier steht Ihr &bdquo;Über uns&ldquo;-Text — aktuell sieht der Handwerker
                    an dieser Stelle nichts.
                  </p>
                )}

                {/* Ansprechpartner */}
                <div className="pt-4" style={{ borderTop: "1px solid #F1EEE8" }}>
                  <p className="text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "rgba(26,26,46,0.4)" }}>
                    Ansprechpartner
                  </p>
                  {p.kontaktName ? (
                    <>
                      <p className="text-[14px] font-semibold text-primary">{p.kontaktName}</p>
                      {p.kontaktPosition && (
                        <p className="text-[12.5px]" style={{ color: "rgba(26,26,46,0.5)" }}>
                          {p.kontaktPosition}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[12.5px]" style={{ color: "rgba(26,26,46,0.55)" }}>
                        {p.kontaktTelefon && (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
                            {p.kontaktTelefon}
                          </span>
                        )}
                        {p.kontaktEmail && (
                          <span className="inline-flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
                            {p.kontaktEmail}
                          </span>
                        )}
                        {p.website && (
                          <span className="inline-flex items-center gap-1.5 truncate">
                            <Globe className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
                            {p.website}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-[13px] italic" style={{ color: "rgba(26,26,46,0.35)" }}>
                      Ohne Ansprechpartner wirkt das Angebot unpersönlich.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[12px] mt-3 leading-relaxed" style={{ color: "rgba(26,26,46,0.45)" }}>
              Die Vorschau aktualisiert sich beim Tippen. Gespeichert wird erst mit dem
              Knopf oben.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
