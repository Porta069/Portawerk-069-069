"use client";

import { useState } from "react";
import { Copy, Check, Share2, Sparkles, ArrowRight } from "lucide-react";

const BASE = "portawerk.de/r/";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[àáâä]/g, "a")
    .replace(/[öó]/g, "o")
    .replace(/[üú]/g, "u")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);

export default function AffiliateGenerator() {
  const [name, setName] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const slug = slugify(name);
  const valid = slug.length >= 2;

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (valid) setLink(BASE + slug);
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
      `Such einen Job im Handwerk? Über meinen Link findest du kostenlos einen: https://${link}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
  };

  if (link) {
    return (
      <div className="bg-white rounded-3xl shadow-[0_28px_64px_-28px_rgba(0,0,0,0.5)] p-7 sm:p-8">
        <div className="flex items-center gap-2.5 mb-4">
          <Sparkles className="w-5 h-5 text-accent" strokeWidth={2} />
          <p className="text-primary font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>
            Dein Link ist fertig
          </p>
        </div>

        <div className="flex items-stretch rounded-xl border border-accent/40 overflow-hidden mb-4" style={{ background: "var(--color-surface)" }}>
          <span className="flex-1 flex items-center px-4 py-3.5 text-primary font-semibold text-sm sm:text-base truncate">
            {link}
          </span>
          <button
            type="button"
            onClick={copy}
            aria-label="Link kopieren"
            className="shrink-0 px-5 bg-accent text-primary font-semibold text-sm inline-flex items-center gap-2 hover:bg-amber-400 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Kopiert" : "Kopieren"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={share}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white font-semibold px-6 py-3 text-sm hover:bg-accent hover:text-primary transition-colors"
          >
            <Share2 className="w-4 h-4" /> Per WhatsApp teilen
          </button>
          <button
            type="button"
            onClick={() => { setLink(null); setName(""); }}
            className="text-accent font-semibold text-sm hover:text-amber-600 transition-colors px-4 py-3"
          >
            Neuer Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={create} className="bg-white rounded-3xl shadow-[0_28px_64px_-28px_rgba(0,0,0,0.5)] p-7 sm:p-8">
      <p className="text-primary font-bold text-lg mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Erstell deinen Link
      </p>
      <p className="text-muted text-sm mb-5">Einfach deinen Namen eingeben — fertig.</p>

      <div className="flex items-stretch rounded-xl border border-border overflow-hidden focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25 transition-colors mb-2">
        <span className="flex items-center pl-4 pr-1 text-muted text-sm select-none">{BASE}</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="dein-name"
          aria-label="Dein Name für den Link"
          autoComplete="off"
          className="flex-1 py-3.5 pr-4 text-primary text-sm sm:text-base bg-transparent focus:outline-none"
        />
      </div>
      {slug && (
        <p className="text-muted text-xs mb-4">
          Vorschau: <span className="text-primary font-semibold">{BASE}{slug}</span>
        </p>
      )}

      <button
        type="submit"
        disabled={!valid}
        className="group mt-2 w-full rounded-full bg-accent text-primary font-bold py-4 text-base hover:bg-amber-400 transition-colors inline-flex items-center justify-center gap-2.5 disabled:opacity-50"
      >
        Link erstellen
        <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
      </button>
    </form>
  );
}
