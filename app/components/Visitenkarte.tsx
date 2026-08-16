"use client";

import { useRef, useState } from "react";
import { toPng, toBlob } from "html-to-image";
import { Download, Copy, Check, Share2, MessageCircle, Loader2 } from "lucide-react";

// Support-WhatsApp aus der Env — nur wenn gesetzt wird die Zeile auf der Karte
// angezeigt (keine Platzhalter-Nummer auf echten Karten).
const WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[àáâä]/g, "a").replace(/[öó]/g, "o").replace(/[üú]/g, "u")
    .replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 20);

const PUNKTE = [
  "100 % kostenlos",
  "Kein Lebenslauf, keine Bewerbung",
  "Die Betriebe bewerben sich bei dir",
  "Wir kümmern uns um alles",
];

export default function Visitenkarte({ fixedSlug }: { fixedSlug?: string } = {}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<null | "dl" | "copy" | "share">(null);
  const [copied, setCopied] = useState(false);

  // Auf dem Partner-Dashboard steht der echte Slug fest; sonst wird er aus dem
  // eingegebenen Namen erzeugt.
  const slug = fixedSlug || slugify(name) || "dein-name";
  const link = `porta-werk.de/r/${slug}`;

  const render = () =>
    cardRef.current ? toBlob(cardRef.current, { pixelRatio: 3, cacheBust: true }) : Promise.resolve(null);

  const download = async () => {
    if (!cardRef.current) return;
    setBusy("dl");
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `portawerk-${slug}.png`;
      a.click();
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    setBusy("copy");
    try {
      const blob = await render();
      if (blob && navigator.clipboard && "ClipboardItem" in window) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } else {
        await download();
      }
    } catch {
      await download();
    } finally {
      setBusy(null);
    }
  };

  const share = async () => {
    setBusy("share");
    try {
      const blob = await render();
      const file = blob ? new File([blob], `portawerk-${slug}.png`, { type: "image/png" }) : null;
      const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
      if (file && nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], text: `Such einen Job im Handwerk? https://${link}` });
      } else {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`Such einen Job im Handwerk? Über meinen Link findest du kostenlos einen: https://${link}`)}`,
          "_blank",
          "noopener",
        );
      }
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      {/* ── Steuerung ── */}
      <div>
        <label htmlFor="vk-name" className="block text-primary text-sm font-medium mb-1.5">
          {fixedSlug ? "Dein Link auf der Karte" : "Dein Name auf der Karte"}
        </label>
        <div className="flex items-stretch rounded-xl border border-border overflow-hidden focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25 transition-colors max-w-sm mb-2">
          <span className="flex items-center pl-4 pr-1 text-muted text-sm select-none">porta-werk.de/r/</span>
          {fixedSlug ? (
            <span className="flex-1 py-3 pr-4 text-primary text-sm font-semibold truncate flex items-center">{slug}</span>
          ) : (
            <input
              id="vk-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="dein-name"
              autoComplete="off"
              className="flex-1 py-3 pr-4 text-primary text-sm bg-transparent focus:outline-none"
            />
          )}
        </div>
        <p className="text-muted text-sm mb-6">
          Deine fertige Karte — herunterladen, kopieren und an Handwerker schicken, die einen Job suchen.
        </p>

        <div className="flex flex-wrap gap-3">
          <button onClick={copy} disabled={!!busy} className="inline-flex items-center gap-2 rounded-full border border-border text-primary font-semibold px-6 py-3 text-sm hover:border-accent transition-colors disabled:opacity-60">
            {busy === "copy" ? <Loader2 className="w-4 h-4 animate-spin" /> : copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? "Kopiert" : "Kopieren"}
          </button>
          <button onClick={share} disabled={!!busy} className="inline-flex items-center gap-2 rounded-full bg-primary text-white font-semibold px-6 py-3 text-sm hover:bg-accent hover:text-primary transition-colors disabled:opacity-60">
            {busy === "share" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            Teilen
          </button>
        </div>
      </div>

      {/* ── Kartenvorschau: klickbar (lädt herunter) + Button darunter ── */}
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={download}
          disabled={!!busy}
          title="Klicken zum Herunterladen"
          aria-label="Affiliate-Bild herunterladen"
          className="max-w-full overflow-x-auto cursor-pointer disabled:cursor-wait rounded-[20px] transition-transform duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
        >
        <div
          ref={cardRef}
          className="relative overflow-hidden shrink-0 mx-auto"
          style={{
            width: 344,
            height: 468,
            borderRadius: 20,
            background:
              "radial-gradient(120% 80% at 100% 0%, #26263f 0%, #0C3330 55%), linear-gradient(160deg, #0C3330 0%, #14141f 100%)",
          }}
        >
          {/* Gitter-Textur */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
          {/* Gold-Glow */}
          <div style={{ position: "absolute", top: -60, right: -40, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(249, 173, 7,0.28) 0%, transparent 65%)" }} />

          {/* Handwerker (freigestellt) — plain <img>, damit html-to-image es exportiert */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/handwerker-cutout.png"
            alt=""
            style={{ position: "absolute", right: -10, bottom: 0, height: "58%", width: "auto", filter: "drop-shadow(-6px 8px 16px rgba(0,0,0,0.4))" }}
          />

          {/* Inhalt */}
          <div style={{ position: "absolute", inset: 0, padding: 20, display: "flex", flexDirection: "column" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, background: "#F9AD07", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/portawerk-logo-hell.png"
                  alt="PortaWerk"
                  style={{ height: 17, width: 122, objectFit: "contain" }}
                />
              </div>
              <div style={{ lineHeight: 1.1 }}>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, letterSpacing: "0.04em" }}>Jobvermittlung fürs Handwerk</p>
              </div>
            </div>

            {/* 200 € */}
            <div style={{ marginTop: 18, maxWidth: "66%" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ color: "#F9AD07", fontWeight: 900, fontSize: 58, lineHeight: 1, fontFamily: "var(--font-display), Georgia, serif" }}>200 €</span>
              </div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.25, marginTop: 6, fontFamily: "var(--font-display), Georgia, serif" }}>
                Belohnung, wenn du über uns deinen neuen Job findest.
              </p>
            </div>

            {/* Punkte */}
            <div style={{ marginTop: 14, maxWidth: "64%", display: "flex", flexDirection: "column", gap: 7 }}>
              {PUNKTE.map((p) => (
                <div key={p} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                  <span style={{ width: 15, height: 15, background: "rgba(249, 173, 7,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Check style={{ width: 10, height: 10, color: "#F9AD07" }} strokeWidth={3.5} />
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.88)", fontSize: 11.5, lineHeight: 1.3 }}>{p}</span>
                </div>
              ))}
            </div>

            {/* Unten: Link + WhatsApp */}
            <div style={{ marginTop: "auto", maxWidth: "72%" }}>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 9.5, marginBottom: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>Jetzt kostenlos anmelden</p>
              <div style={{ display: "inline-flex", alignItems: "center", background: "#F9AD07", color: "#0C3330", fontWeight: 800, fontSize: 12.5, padding: "8px 12px", borderRadius: 999, maxWidth: "100%" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link}</span>
              </div>
              {WHATSAPP && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 9 }}>
                  <MessageCircle style={{ width: 14, height: 14, color: "#25D366" }} strokeWidth={2.2} />
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 10.5 }}>Fragen? WhatsApp {WHATSAPP}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        </button>
        <button
          type="button"
          onClick={download}
          disabled={!!busy}
          className="inline-flex items-center gap-2 rounded-full bg-accent text-primary font-bold px-7 py-3.5 text-sm hover:bg-amber-400 transition-colors disabled:opacity-60 shadow-[0_10px_28px_-12px_rgba(249, 173, 7,0.6)]"
        >
          {busy === "dl" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Affiliate-Bild herunterladen
        </button>
      </div>
    </div>
  );
}
