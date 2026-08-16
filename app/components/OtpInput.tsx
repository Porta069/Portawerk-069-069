"use client";

// ─── OTP Input (6-stelliger Code) ─────────────────────────────────────────────

import { useRef, useState } from "react";

export default function OtpInput({
  value,
  onChange,
  error = false,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusIdx, setFocusIdx] = useState<number | null>(null);

  const get = (i: number) => value[i] || "";

  const set = (i: number, char: string) => {
    const arr = value.padEnd(6, " ").split("");
    arr[i] = char || " ";
    onChange(arr.join("").trimEnd());
    if (char && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (get(i)) {
        set(i, "");
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
        const arr = value.padEnd(6, " ").split("");
        arr[i - 1] = " ";
        onChange(arr.join("").trimEnd());
      }
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(p);
    refs.current[Math.min(p.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-3">
      {Array.from({ length: 6 }).map((_, i) => {
        const filled = !!get(i).trim();
        const active = focusIdx === i;
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={get(i).trim()}
            onChange={(e) => set(i, e.target.value.replace(/\D/g, "").slice(-1))}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={() => {
              setFocusIdx(i);
              refs.current[i]?.select();
            }}
            onBlur={() => setFocusIdx(null)}
            disabled={disabled}
            aria-label={`Ziffer ${i + 1}`}
            className="text-center font-bold outline-none bg-white transition-all duration-200 disabled:opacity-40"
            style={{
              width: "clamp(40px, 13vw, 54px)",
              height: "clamp(50px, 15vw, 64px)",
              fontSize: "clamp(1.2rem, 4vw, 1.65rem)",
              border: `2px solid ${
                error ? "#EF4444" : active ? "#E8A838" : filled ? "#1A1A2E" : "#E5E7EB"
              }`,
              boxShadow:
                active && !error
                  ? "0 0 0 3px rgba(232,168,56,0.10)"
                  : error
                  ? "0 0 0 3px rgba(239,68,68,0.08)"
                  : "none",
              fontFamily: "var(--font-display)",
              color: "#1A1A2E",
            }}
          />
        );
      })}
    </div>
  );
}
