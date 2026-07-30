"use client";

import { useState } from "react";
import { Link2, Copy, Check, Share2, Sparkles } from "lucide-react";

const BASE = "portawerk.de/r/";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

export default function AffiliateGenerator() {
  const [telefon, setTelefon] = useState("");
  const [wunsch, setWunsch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const slug = slugify(wunsch);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (telefon.replace(/\D/g, "").length < 6) {
      setError("Bitte gib eine gültige Telefonnummer ein.");
      return;
    }
    if (slug.length < 3) {
      setError("Wähle einen Wunsch-Link mit mindestens 3 Zeichen.");
      return;
    }
    setLink(BASE + slug);
  };

  const copy = () => {
    if (!link) return;
    navigator.clipboard?.writeText("https://" + link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const share = () => {
    if (!link) return;
    const text = encodeURIComponent(
      `Such einen neuen Job im Handwerk? Über diesen Link findest du kostenlos einen: https://${link}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
  };

  // ── Fertiger Link ──
  if (link) {
    return (
      <div className="bg-white rounded-3xl border border-border shadow-[0_28px_64px_-32px_rgba(26,26,46,0.4)] p-8 sm:p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-7 h-7 text-accent" strokeWidth={2} />
        </div>
        <h3 className="text-primary font-bold text-2xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Dein Link ist bereit
        </h3>
        <p className="text-muted text-sm mb-6">Teil ihn — und verdiene bei jeder Vermittlung.</p>

        <div className="flex items-stretch max-w-md mx-auto rounded-xl border border-accent/40 overflow-hidden mb-4" style={{ background: "var(--color-surface)" }}>
          <span className="flex-1 flex items-center px-4 py-3.5 text-primary font-semibold text-sm sm:text-base truncate">
            {link}
          </span>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 px-5 bg-accent text-primary font-semibold text-sm inline-flex items-center gap-2 hover:bg-amber-400 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Kopiert" : "Kopieren"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white font-semibold px-6 py-3 text-sm hover:bg-accent hover:text-primary transition-colors"
          >
            <Share2 className="w-4 h-4" /> Per WhatsApp teilen
          </button>
          <button
            type="button"
            onClick={() => { setLink(null); setWunsch(""); }}
            className="text-accent font-semibold text-sm hover:text-amber-600 transition-colors px-4"
          >
            Anderen Link erstellen
          </button>
        </div>
        <p className="text-muted text-xs mt-6">
          Hinweis: Bei der finalen Registrierung wird geprüft, ob dein Wunsch-Link noch
          frei ist. Auszahlung nur bei erfolgreicher Vermittlung.
        </p>
      </div>
    );
  }

  // ── Formular ──
  return (
    <form onSubmit={handleCreate} className="bg-white rounded-3xl border border-border shadow-[0_28px_64px_-32px_rgba(26,26,46,0.4)] p-8 sm:p-10">
      <h3 className="text-primary font-bold text-2xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Hol dir deinen Link
      </h3>
      <p className="text-muted text-sm mb-6">
        Nummer eingeben, Wunsch-Link wählen — fertig. Kostenlos.
      </p>

      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="tel" className="block text-primary text-sm font-medium mb-1.5">Telefonnummer</label>
          <input
            id="tel"
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            placeholder="+49 …"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-primary text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="wunsch" className="block text-primary text-sm font-medium mb-1.5">Dein Wunsch-Link</label>
          <div className="flex items-stretch rounded-xl border border-border overflow-hidden focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25 transition-colors">
            <span className="flex items-center pl-4 pr-1 text-muted text-sm bg-transparent select-none">{BASE}</span>
            <input
              id="wunsch"
              type="text"
              value={wunsch}
              onChange={(e) => setWunsch(e.target.value)}
              placeholder="dein-name"
              className="flex-1 py-3 pr-4 text-primary text-sm bg-transparent focus:outline-none"
            />
          </div>
          {slug && (
            <p className="text-muted text-xs mt-2">
              Dein Link: <span className="text-primary font-semibold">{BASE}{slug}</span>
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-red-600 text-xs mt-4">{error}</p>}

      <button
        type="submit"
        className="group mt-6 w-full rounded-full bg-accent text-primary font-bold py-4 text-base hover:bg-amber-400 transition-colors inline-flex items-center justify-center gap-2.5"
      >
        <Link2 className="w-5 h-5" />
        Link erstellen
      </button>
    </form>
  );
}
