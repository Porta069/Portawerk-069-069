"use client";

// ─── Unternehmensprofil (Arbeitgeber) ────────────────────────────────────────
// Links bearbeiten, rechts sofort sehen, wie das Angebot beim Handwerker
// ankommt. Der Betrieb soll nicht raten müssen, wie er dasteht — deshalb ist
// die Vorschau kein Extra, sondern steht gleichberechtigt daneben und
// aktualisiert sich beim Tippen.
//
// ── Zur Gestaltung ──────────────────────────────────────────────────────────
// Die Seite begann als einzige im Bereich mit einer nackten Überschrift auf
// Papierton, führte sieben gleich aussehende weisse Kästen untereinander und
// hatte den Speichern-Knopf ganz oben — also ausser Sicht, sobald man am
// letzten Feld arbeitete.
//
// Jetzt: dunkles Band mit Foto wie nebenan, darin die Profilstärke als
// Kennzahl der Seite. Die sieben Kästen sind fünf nummerierte Schritte
// geworden (Logo gehört zum Betrieb, Leistungen zu den Arbeitsbedingungen),
// die Felder tragen den Stil des Inserate-Editors mit goldenem Fokus, und die
// Aktionsleiste klebt unten mit.

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Building2, MapPin, Phone, Mail, Globe, Users, CalendarDays, Loader2, Check,
  Save, Eye, Sparkles, Home, Palmtree, ImagePlus, Trash2, AlertCircle,
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

/** Pflichtfelder des Unternehmensprofils. */
function fieldErrors(p: EmployerProfile): Partial<Record<keyof EmployerProfile, string>> {
  const e: Partial<Record<keyof EmployerProfile, string>> = {};
  if (!p.firmenname.trim()) e.firmenname = "Ohne Firmennamen erscheint Ihr Angebot namenlos.";
  if (!/^\d{5}$/.test(p.plz)) e.plz = "Fünfstellige Postleitzahl — sie steuert die Kandidatensuche.";
  if (!p.ort.trim()) e.ort = "Bitte den Ort angeben.";
  return e;
}

const inputCls =
  "wp-feld w-full rounded-2xl bg-white text-primary text-[15px] px-4 py-3.5 placeholder:text-primary/25";
const inputStyle = { border: "1.5px solid #E9E7E1" } as const;

/**
 * Dunkles Band über die volle Fensterbreite — dieselbe Bauform wie in den
 * Bewerbungen und Anfragen. `.vollbreite` bricht aus dem zentrierten
 * Inhaltsbereich aus, `-mt-10` hebt den Abstand des Layouts auf.
 */
function Band({ children }: { children: React.ReactNode }) {
  return (
    <div className="vollbreite relative overflow-hidden -mt-10 mb-8" style={{ background: "#1A1A2E" }}>
      <Image
        src="/images/tischler-hobel.jpg"
        alt=""
        fill
        sizes="100vw"
        priority
        className="object-cover"
        style={{ objectPosition: "center 46%" }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(96deg, rgba(20,20,36,0.96) 0%, rgba(20,20,36,0.9) 44%, rgba(20,20,36,0.72) 100%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-8 sm:py-10">{children}</div>
    </div>
  );
}

/**
 * Abschnitt mit vorangestellter Ordnungszahl — wie im Inserate-Editor.
 *
 * Die grosse blasse Ziffer gliedert ein langes Formular, ohne eine Zeile Text
 * zu kosten. Vorher standen sieben gleich aussehende weisse Kästen
 * untereinander; man wusste beim Scrollen nie, wo man ist.
 */
function Schritt({
  nr,
  titel,
  hinweis,
  children,
}: {
  nr: string;
  titel: string;
  hinweis?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="relative overflow-hidden rounded-3xl p-5 sm:p-7"
      style={{
        background: "linear-gradient(158deg, #FFFFFF 0%, #FDFCF8 62%, #F9F5EC 100%)",
        border: "1.5px solid #EDE8DC",
        boxShadow: "0 14px 36px -28px rgba(26,26,46,0.55)",
      }}
    >
      <span
        aria-hidden
        className="absolute pointer-events-none select-none font-bold leading-none"
        style={{
          right: 18,
          top: 4,
          fontFamily: "var(--font-display)",
          fontSize: 84,
          color: "rgba(26,26,46,0.035)",
        }}
      >
        {nr}
      </span>
      <div className="relative mb-5">
        <p
          className="inline-flex items-center gap-2.5 text-[10.5px] font-bold uppercase tracking-[0.18em] mb-1.5"
          style={{ color: "#B47B18" }}
        >
          <span className="w-5 h-[2px] rounded-full" style={{ background: "#E8A838" }} />
          Schritt {nr}
        </p>
        <h2
          className="text-primary font-bold text-[19px] leading-snug"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {titel}
        </h2>
        {hinweis && (
          <p className="text-[13.5px] mt-1 max-w-xl leading-relaxed" style={{ color: "rgba(26,26,46,0.55)" }}>
            {hinweis}
          </p>
        )}
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}

/**
 * Auswahlknopf für Montage und Leistungen.
 *
 * Mit Häkchen statt reiner Farbumkehr: ohne es muss man aus der Farbe erraten,
 * ob dunkel nun gewählt oder anklickbar heisst. Derselbe Baustein wie im
 * Anforderungsprofil der Inserate.
 */
function Wahlchip({
  an,
  onClick,
  children,
}: {
  an: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={an}
      className="inline-flex items-center gap-2 rounded-full pl-2.5 pr-4 py-2.5 text-[13.5px] font-medium transition-[background,border-color,color,transform] duration-150 hover:-translate-y-px"
      style={{
        background: an ? "#1A1A2E" : "#FFFFFF",
        color: an ? "#FFFFFF" : "rgba(26,26,46,0.62)",
        border: `1.5px solid ${an ? "#1A1A2E" : "#E9E7E1"}`,
      }}
    >
      <span
        className="w-[15px] h-[15px] rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
        style={{
          background: an ? "#E8A838" : "transparent",
          border: `1.5px solid ${an ? "#E8A838" : "#DDD9D1"}`,
        }}
      >
        {an && <Check className="w-[9px] h-[9px]" strokeWidth={4} style={{ color: "#1A1A2E" }} />}
      </span>
      {children}
    </button>
  );
}

function Label({
  children,
  hint,
  optional,
  required,
}: {
  children: React.ReactNode;
  hint?: string;
  optional?: boolean;
  required?: boolean;
}) {
  return (
    <label className="block mb-2">
      <span
        className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.13em] font-bold"
        style={{ color: "rgba(26,26,46,0.42)" }}
      >
        {children}
        {required && <span style={{ color: "#EF4444" }}>*</span>}
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
  /** Erst nach einem Speicherversuch werden Pflichtfelder markiert. */
  const [showErrors, setShowErrors] = useState(false);

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

    // Pflichtfelder pruefen — ohne Firmenname und Standort kann weder das
    // Angebot noch die Kandidatensuche sinnvoll arbeiten.
    const errs = fieldErrors(p);
    if (Object.keys(errs).length > 0) {
      setShowErrors(true);
      setError("Bitte füllen Sie die rot markierten Pflichtfelder aus.");
      // Zum ersten fehlenden Feld springen, es kann ausserhalb des Bilds liegen.
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>("[data-invalid='true']")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    setShowErrors(false);
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
  const errs = showErrors ? fieldErrors(p) : {};

  /** Rahmen, Aufleuchten und Sprungmarke fuer ein Pflichtfeld. */
  const fieldProps = (key: keyof EmployerProfile) => {
    const bad = !!errs[key];
    return {
      "data-invalid": bad ? "true" : undefined,
      className: `${inputCls}${bad ? " pw-field-error" : ""}`,
      style: { border: `1.5px solid ${bad ? "#EF4444" : "#E9E7E1"}` },
    };
  };

  return (
    <div>
      {/* ══ Kopf ══ */}
      <Band>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] mb-3"
              style={{ color: "#E8A838" }}
            >
              <span className="w-6 h-[2px] bg-accent" />
              {p.firmenname || user?.companyName || "Ihr Betrieb"}
            </span>
            <h1
              className="text-white font-bold leading-tight"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3.4vw, 2.7rem)" }}
            >
              Unternehmensprofil
            </h1>
            <p className="text-[15px] mt-2 max-w-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
              Diese Angaben sehen Handwerker, wenn Sie ihnen ein Angebot schicken.
            </p>
          </div>

          {/* Die Profilstaerke ist die Kennzahl dieser Seite — sie gehoert
              nach oben, nicht in eine weisse Kachel neben die Vorschau. */}
          <div
            className="min-w-[252px] rounded-2xl px-5 py-4"
            style={{
              background: "rgba(20,20,36,0.55)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(3px)",
            }}
          >
            <div className="flex items-baseline justify-between gap-3 mb-2.5">
              <p className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.42)" }}>
                Profilstärke
              </p>
              <p style={{ fontFamily: "var(--font-display)" }}>
                <span
                  className="text-[26px] font-bold tabular-nums leading-none"
                  style={{ color: score >= 80 ? "#6EE7A0" : "#E8A838" }}
                >
                  {score}
                </span>
                <span className="text-[14px] font-bold ml-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  %
                </span>
              </p>
            </div>
            <span
              aria-hidden
              className="block overflow-hidden rounded-full"
              style={{ height: 4, background: "rgba(255,255,255,0.12)" }}
            >
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="block h-full rounded-full"
                style={{
                  background:
                    score >= 80
                      ? "linear-gradient(90deg, #15803D 0%, #22C55E 100%)"
                      : "linear-gradient(90deg, #B47B18 0%, #E8A838 60%, #F6D08A 100%)",
                }}
              />
            </span>
            {gaps.length === 0 ? (
              <p className="inline-flex items-center gap-1.5 text-[12px] mt-3" style={{ color: "#6EE7A0" }}>
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                Vollständig
              </p>
            ) : (
              <p className="text-[12px] mt-3" style={{ color: "rgba(255,255,255,0.6)" }}>
                <span className="font-semibold text-white">Als Nächstes:</span> {gaps[0].label}
              </p>
            )}
          </div>
        </div>
      </Band>

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
          <Schritt
            nr="01"
            titel="Ihr Betrieb"
            hinweis="Name und Kurzbeschreibung stehen im Angebot ganz oben — das liest der Handwerker zuerst."
          >
            <div className="space-y-4">
              <div>
                <Label required>Firmenname</Label>
                <input
                  {...fieldProps("firmenname")}
                  value={p.firmenname}
                  onChange={(e) => set("firmenname", e.target.value)}
                  placeholder="Muster Elektrotechnik GmbH"
                />
                {errs.firmenname && (
                  <p className="text-[12.5px] mt-1.5" style={{ color: "#EF4444" }}>
                    {errs.firmenname}
                  </p>
                )}
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
          </Schritt>

          <Schritt
            nr="02"
            titel="Standort"
            hinweis="Pflichtangabe — sie bestimmt, welche Kandidaten Ihnen vorgeschlagen werden."
          >
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
                  <Label required>PLZ</Label>
                  <input
                    {...fieldProps("plz")}
                    className={`${fieldProps("plz").className} tabular-nums`}
                    inputMode="numeric"
                    maxLength={5}
                    value={p.plz}
                    onChange={(e) => set("plz", e.target.value.replace(/\D/g, "").slice(0, 5))}
                    placeholder="80331"
                  />
                </div>
                <div>
                  <Label required>Ort</Label>
                  <input
                    {...fieldProps("ort")}
                    value={p.ort}
                    onChange={(e) => set("ort", e.target.value)}
                    placeholder="München"
                  />
                </div>
              </div>
              {(errs.plz || errs.ort) && (
                <p className="text-[12.5px]" style={{ color: "#EF4444" }}>
                  {errs.plz ?? errs.ort}
                </p>
              )}
            </div>
          </Schritt>

          <Schritt
            nr="03"
            titel="Logo und Ansprechpartner"
            hinweis="Handwerker bewerben sich bei Menschen, nicht bei einer GmbH. Beides ist freiwillig und wirkt trotzdem."
          >
            <div
              className="flex items-center gap-4 pb-6 mb-6"
              style={{ borderBottom: "1px solid #EDE8DC" }}
            >
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
          </Schritt>

          <Schritt
            nr="04"
            titel="Arbeitsbedingungen"
            hinweis="Die Punkte, nach denen Handwerker zuerst filtern — oft wichtiger als hundert Euro mehr."
          >
            <div className="space-y-6">
              <div>
                <Label>Montageaufkommen</Label>
                <div className="flex flex-wrap gap-2">
                  {MONTAGE_OPTIONEN.map((m) => (
                    <Wahlchip
                      key={m}
                      an={p.montage === m}
                      onClick={() => set("montage", p.montage === m ? "" : m)}
                    >
                      {m}
                    </Wahlchip>
                  ))}
                </div>
              </div>

              <div className="sm:max-w-[220px]">
                <Label optional>Urlaubstage pro Jahr</Label>
                <span className="relative block">
                  <input
                    className={`${inputCls} pr-16 tabular-nums`}
                    style={inputStyle}
                    inputMode="numeric"
                    maxLength={2}
                    value={p.urlaubstage}
                    onChange={(e) => set("urlaubstage", e.target.value.replace(/\D/g, "").slice(0, 2))}
                    placeholder="30"
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold pointer-events-none"
                    style={{ color: "rgba(26,26,46,0.35)" }}
                  >
                    Tage
                  </span>
                </span>
              </div>

              <div className="pt-6" style={{ borderTop: "1px solid #EDE8DC" }}>
                <Label optional hint="Erscheinen als Marken im Angebot — drei oder mehr wirken am besten">
                  Was Sie bieten
                </Label>
                <div className="flex flex-wrap gap-2">
                  {BENEFIT_OPTIONEN.map((b) => (
                    <Wahlchip key={b} an={p.benefits.includes(b)} onClick={() => toggleBenefit(b)}>
                      {b}
                    </Wahlchip>
                  ))}
                </div>
              </div>
            </div>
          </Schritt>

          <Schritt
            nr="05"
            titel="Über uns"
            hinweis="Gerne ausführlich: Geschichte, Projekte, Team, Arbeitsweise. Handwerker lesen das, bevor sie zusagen."
          >
            <textarea
              rows={10}
              className={`${inputCls} resize-y`}
              style={inputStyle}
              value={p.beschreibung}
              onChange={(e) => set("beschreibung", e.target.value)}
              placeholder={
                "Wir sind ein Familienbetrieb mit 25 Mitarbeitern und arbeiten überwiegend im Raum München …\n\nMehrere Absätze sind ausdrücklich erwünscht."
              }
            />
          </Schritt>

          {/* ── Aktionsleiste ──
              Klebt am unteren Rand. Der Speichern-Knopf stand zuvor ganz oben
              und war ausser Sicht, sobald man am letzten Feld arbeitete. */}
          <div className="sticky bottom-4 z-30 pt-1">
            <div
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl px-5 py-4 sm:px-6"
              style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(10px)",
                border: "1.5px solid #EDE8DC",
                boxShadow: "0 22px 44px -26px rgba(26,26,46,0.6)",
              }}
            >
              <p className="text-[13px]" style={{ color: "rgba(26,26,46,0.5)" }}>
                Die Vorschau ändert sich beim Tippen — gespeichert wird erst hier.
              </p>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-bold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                style={{
                  background: saved ? "#16A34A" : "#E8A838",
                  color: saved ? "white" : "#1A1A2E",
                  fontFamily: "var(--font-display)",
                  boxShadow: "0 16px 32px -16px rgba(232,168,56,0.85)",
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
          </div>
        </div>

        {/* ══ Vorschau ══ */}
        <div className="space-y-5 lg:sticky lg:top-[92px]">
          {/* ── Was noch fehlt ──
              Die Prozentzahl steht oben im Band; hier stehen die konkreten
              Schritte dorthin. Zuvor war beides in derselben weissen Kachel,
              und die Zahl nahm der Liste die Aufmerksamkeit. */}
          {gaps.length > 0 && (
            <div
              className="rounded-3xl p-5"
              style={{
                background: "linear-gradient(158deg, #FFFFFF 0%, #FDFBF6 60%, #F9F4E8 100%)",
                border: "1.5px solid #EDE8DC",
                boxShadow: "0 12px 30px -26px rgba(26,26,46,0.5)",
              }}
            >
              <p
                className="inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.16em] mb-3.5"
                style={{ color: "#B47B18" }}
              >
                <span className="w-5 h-[2px] rounded-full" style={{ background: "#E8A838" }} />
                Das fehlt noch
              </p>
              <ul className="space-y-3">
                {gaps.slice(0, 3).map((g, i) => (
                  <li key={g.label} className="flex items-start gap-3">
                    <span
                      className="flex items-center justify-center flex-shrink-0 rounded-full text-[10.5px] font-bold tabular-nums"
                      style={{
                        width: 20,
                        height: 20,
                        marginTop: 1,
                        background: "rgba(232,168,56,0.16)",
                        color: "#B47B18",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                        {g.label}
                      </span>
                      <span className="block text-[12.5px] mt-0.5 leading-relaxed" style={{ color: "rgba(26,26,46,0.5)" }}>
                        {g.hint}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                  {p.urlaubstage && <PreviewChip icon={Palmtree}>{p.urlaubstage} Urlaubstage</PreviewChip>}
                  {p.benefits.map((b) => (
                    <PreviewChip key={b} icon={Sparkles}>
                      {b}
                    </PreviewChip>
                  ))}
                </div>

                {p.beschreibung ? (
                  <p
                    className="text-[13px] leading-relaxed whitespace-pre-line"
                    style={{ color: "rgba(26,26,46,0.65)" }}
                  >
                    {p.beschreibung}
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
              So sieht Ihr Betrieb im Angebot aus — die Vorschau ändert sich beim Tippen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
