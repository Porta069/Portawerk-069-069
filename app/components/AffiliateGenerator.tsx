"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";

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
  const router = useRouter();
  const [name, setName] = useState("");
  const slug = slugify(name);
  const valid = slug.length >= 2;

  const start = (e: React.FormEvent) => {
    e.preventDefault();
    if (valid) router.push(`/verdienen/partner?slug=${encodeURIComponent(slug)}`);
  };

  return (
    <form onSubmit={start} className="bg-white rounded-3xl shadow-[0_28px_64px_-28px_rgba(0,0,0,0.5)] p-7 sm:p-8">
      <p className="text-primary font-bold text-lg mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Erstell deinen Link
      </p>
      <p className="text-muted text-sm mb-5">Namen wählen — in unter einer Minute startklar.</p>

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
      <p className="text-muted text-xs mt-3 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-accent" /> Kostenlos · Nummer per SMS bestätigt
      </p>
    </form>
  );
}
