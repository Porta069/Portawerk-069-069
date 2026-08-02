"use client";

// ─── Live-E-Mail-Prüfung (debounced) ──────────────────────────────────────────
// Prüft beim Tippen, ob die E-Mail zustellbar ist (Syntax + MX-Record über das
// Backend). Netzwerkfehler blockieren nicht (Status bleibt "idle").

import { useEffect, useState } from "react";
import { api } from "./api";

export type EmailStatus = "idle" | "checking" | "valid" | "invalid";

const SYNTAX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── „Meintest du …?“ — Tippfehler in bekannten Domains erkennen ──────────────
// gmial.com, gmx.ed & Co. haben oft sogar gültige MX-Records fremder Squatter;
// der MX-Check allein fängt sie nicht. Kleine Edit-Distanz gegen die im
// Handwerk üblichsten Anbieter verhindert tote Kontakte.

const COMMON_DOMAINS = [
  "gmail.com", "googlemail.com", "gmx.de", "gmx.net", "web.de",
  "outlook.com", "outlook.de", "hotmail.com", "hotmail.de", "yahoo.com",
  "yahoo.de", "t-online.de", "icloud.com", "freenet.de", "aol.com",
];

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

/**
 * Liefert die vermutlich gemeinte Adresse ("max@gmail.com") oder null.
 * Schlägt nur vor, wenn die getippte Domain KEINE bekannte ist, aber einer
 * bekannten sehr nahe kommt (Edit-Distanz 1–2).
 */
export function suggestEmail(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at <= 0) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase();
  if (!domain || COMMON_DOMAINS.includes(domain)) return null;

  let best: { d: string; dist: number } | null = null;
  for (const d of COMMON_DOMAINS) {
    const dist = editDistance(domain, d);
    if (dist <= 2 && (!best || dist < best.dist)) best = { d, dist };
  }
  return best ? `${local}@${best.d}` : null;
}

export function useEmailCheck(email: string): {
  status: EmailStatus;
  reason: string | null;
} {
  const [status, setStatus] = useState<EmailStatus>("idle");
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    const e = email.trim();
    if (!SYNTAX.test(e)) {
      setStatus("idle");
      setReason(null);
      return;
    }
    let active = true;
    setStatus("checking");
    const t = setTimeout(async () => {
      const res = await api.checkEmail(e);
      if (!active) return;
      if (res.ok) {
        setStatus(res.data.deliverable ? "valid" : "invalid");
        setReason(res.data.reason);
      } else {
        // Backend nicht erreichbar → nicht blockieren.
        setStatus("idle");
        setReason(null);
      }
    }, 600);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [email]);

  return { status, reason };
}

/** Menschenlesbarer Hinweistext zu einem Prüf-Ergebnis. */
export function emailStatusMessage(status: EmailStatus, reason: string | null): string | null {
  if (status === "checking") return "E-Mail wird geprüft…";
  if (status === "valid") return "E-Mail-Adresse sieht gültig aus";
  if (status === "invalid") {
    if (reason === "disposable") return "Wegwerf-Adressen sind nicht erlaubt.";
    if (reason === "no_mx") return "Diese Domain kann keine E-Mails empfangen.";
    if (reason === "invalid_syntax") return "Diese E-Mail-Adresse ist ungültig.";
    return "Diese E-Mail-Adresse scheint nicht zu existieren.";
  }
  return null;
}
