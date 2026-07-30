"use client";

import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

const FACHKRAEFTE = [
  "Elektriker / Elektroniker",
  "Anlagenmechaniker SHK",
  "Heizung / Lüftung / Klima",
  "Maler & Lackierer",
  "Tischler / Schreiner",
  "Maurer / Betonbauer",
  "Dachdecker",
  "Metallbauer / Schlosser",
  "Anderes Gewerk",
];

type Fields = {
  firma: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  fachkraft: string;
  nachricht: string;
};

const EMPTY: Fields = {
  firma: "",
  vorname: "",
  nachname: "",
  email: "",
  telefon: "",
  fachkraft: FACHKRAEFTE[0],
  nachricht: "",
};

const inputBase =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-primary text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 transition-colors placeholder:text-muted/70";
const labelBase = "block text-primary text-sm font-medium mb-1.5";

export default function ArbeitgeberForm({
  options,
  presetFachkraft,
  shimmerSignal = 0,
}: {
  options?: string[];
  presetFachkraft?: string;
  shimmerSignal?: number;
} = {}) {
  const [f, setF] = useState<Fields>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [shimmering, setShimmering] = useState(false);

  const opts = options && options.length > 0 ? options : FACHKRAEFTE;

  // Ausgewählte Fachkraft aus der Sektion ins Formular übernehmen.
  useEffect(() => {
    if (presetFachkraft) setF((p) => ({ ...p, fachkraft: presetFachkraft }));
  }, [presetFachkraft]);

  // Einmaliger Glanz-Effekt, sobald eine Fachkraft ausgewählt wurde.
  useEffect(() => {
    if (shimmerSignal > 0) {
      setShimmering(true);
      const t = setTimeout(() => setShimmering(false), 1200);
      return () => clearTimeout(t);
    }
  }, [shimmerSignal]);

  const set = (key: keyof Fields) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setF((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!f.firma.trim() || !f.vorname.trim() || !f.nachname.trim()) {
      setError("Bitte Firma, Vor- und Nachname ausfüllen.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
      setError("Bitte eine gültige E-Mail-Adresse angeben.");
      return;
    }
    if (!f.telefon.trim()) {
      setError("Bitte eine Telefonnummer angeben, damit wir Sie erreichen.");
      return;
    }
    if (!consent) {
      setError("Bitte stimmen Sie der Verarbeitung Ihrer Daten zu.");
      return;
    }

    setSending(true);
    // Frontend-only: Anfrage per vorbefüllter E-Mail. Sobald das Backend steht,
    // wird hier stattdessen an den API-Endpunkt gepostet.
    const subject = `Personalanfrage — ${f.firma}`;
    const body = [
      `Firma: ${f.firma}`,
      `Ansprechpartner: ${f.vorname} ${f.nachname}`,
      `E-Mail: ${f.email}`,
      `Telefon: ${f.telefon}`,
      `Gesuchte Fachkraft: ${f.fachkraft}`,
      "",
      `Nachricht: ${f.nachricht || "—"}`,
    ].join("\n");

    window.location.href = `mailto:kontakt@portawerk.de?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    setTimeout(() => {
      setSending(false);
      setDone(true);
    }, 600);
  };

  if (done) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_24px_60px_-24px_rgba(0,0,0,0.4)] p-8 sm:p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-7 h-7 text-accent" strokeWidth={2} />
        </div>
        <h3 className="text-primary font-bold text-2xl mb-3" style={{ fontFamily: "var(--font-display)" }}>
          Anfrage bereit zum Senden
        </h3>
        <p className="text-muted text-sm leading-relaxed mb-6">
          Wir haben Ihre Anfrage in einer E-Mail vorbereitet. Schicken Sie sie einfach
          ab — wir melden uns innerhalb von 24 Stunden mit passenden Fachkräften.
        </p>
        <button
          type="button"
          onClick={() => {
            setF(EMPTY);
            setConsent(false);
            setDone(false);
          }}
          className="text-accent font-semibold text-sm hover:text-amber-600 transition-colors"
        >
          Weitere Anfrage stellen
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)] p-6 sm:p-8"
      noValidate
    >
      <p className="text-primary font-bold text-lg mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Fachkräfte-Anfrage
      </p>
      <p className="text-muted text-sm mb-6">Kostenlos &amp; unverbindlich — Antwort in 24 h.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelBase} htmlFor="firma">Firmenname</label>
          <input id="firma" className={inputBase} value={f.firma} onChange={set("firma")} placeholder="Ihr Betrieb" />
        </div>
        <div>
          <label className={labelBase} htmlFor="vorname">Vorname</label>
          <input id="vorname" className={inputBase} value={f.vorname} onChange={set("vorname")} placeholder="Vorname" />
        </div>
        <div>
          <label className={labelBase} htmlFor="nachname">Nachname</label>
          <input id="nachname" className={inputBase} value={f.nachname} onChange={set("nachname")} placeholder="Nachname" />
        </div>
        <div>
          <label className={labelBase} htmlFor="email">E-Mail-Adresse</label>
          <input id="email" type="email" className={inputBase} value={f.email} onChange={set("email")} placeholder="name@firma.de" />
        </div>
        <div>
          <label className={labelBase} htmlFor="telefon">Telefonnummer</label>
          <input id="telefon" type="tel" className={inputBase} value={f.telefon} onChange={set("telefon")} placeholder="+49 …" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelBase} htmlFor="fachkraft">Welche Fachkraft suchen Sie?</label>
          <div className="relative rounded-xl overflow-hidden">
            <select id="fachkraft" className={inputBase} value={f.fachkraft} onChange={set("fachkraft")}>
              {opts.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {shimmering && (
              <span
                aria-hidden="true"
                className="shimmer-once pointer-events-none absolute top-0 left-0 z-10 h-full w-1/3 bg-gradient-to-r from-transparent via-accent/50 to-transparent"
              />
            )}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className={labelBase} htmlFor="nachricht">Nachricht <span className="text-muted font-normal">(optional)</span></label>
          <textarea id="nachricht" rows={3} className={inputBase} value={f.nachricht} onChange={set("nachricht")} placeholder="Standort, Umfang, Wunschtermin …" />
        </div>
      </div>

      <label className="flex items-start gap-3 mt-5 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#E8A838] flex-shrink-0"
        />
        <span className="text-muted text-xs leading-relaxed">
          Ich bin einverstanden, dass meine Daten zur Bearbeitung meiner Anfrage genutzt
          werden. Details in der{" "}
          <a href="/rechtliches#datenschutz" className="text-accent underline underline-offset-2">Datenschutzerklärung</a>.
        </span>
      </label>

      {error && <p className="text-red-600 text-xs mt-3">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="group mt-6 w-full rounded-full bg-accent text-primary font-bold py-4 text-base hover:bg-amber-400 transition-colors duration-200 inline-flex items-center justify-center gap-2.5 disabled:opacity-70"
      >
        {sending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Wird vorbereitet …
          </>
        ) : (
          <>
            Anfrage senden
            <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}
