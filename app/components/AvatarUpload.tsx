"use client";

// ─── Profilbild-Upload (optional) ─────────────────────────────────────────────
// Verkleinert das Bild clientseitig auf ~256px (JPEG) → kleines Data-URL, das
// direkt in der DB (User.avatar) gespeichert wird — kein Object-Storage nötig.

import { useRef, useState } from "react";
import { Camera, Trash2, Loader2, User } from "lucide-react";

function resizeToDataUrl(file: File, max = 256, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
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
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function AvatarUpload({
  value,
  onChange,
  size = 88,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  size?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pick = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErr("Bitte ein Bild auswählen.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      onChange(await resizeToDataUrl(file));
    } catch {
      setErr("Bild konnte nicht verarbeitet werden.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div
        onClick={() => inputRef.current?.click()}
        className="relative flex-shrink-0 cursor-pointer overflow-hidden group"
        style={{ width: size, height: size, borderRadius: "50%", border: "2px solid #E5E7EB", background: "#F8F7F4" }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Profilbild" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-8 h-8" style={{ color: "#D1D5DB" }} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(26,26,46,0.45)" }}>
          {busy ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Camera className="w-5 h-5 text-white" />}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            style={{ border: "1.5px solid #E5E7EB", color: "rgba(26,26,46,0.7)" }}
          >
            <Camera className="w-3.5 h-3.5" />
            {value ? "Ändern" : "Foto hochladen"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm transition-colors"
              style={{ color: "rgba(107,114,128,0.8)" }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Entfernen
            </button>
          )}
        </div>
        <p className="text-[11px] mt-1.5" style={{ color: "rgba(107,114,128,0.7)" }}>
          Optional · als Referenzbild · JPG/PNG
        </p>
        {err && <p className="text-[11px] mt-1" style={{ color: "#EF4444" }}>{err}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) pick(e.target.files[0]); e.target.value = ""; }}
      />
    </div>
  );
}
