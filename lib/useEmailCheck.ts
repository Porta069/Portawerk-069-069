"use client";

// ─── Live-E-Mail-Prüfung (debounced) ──────────────────────────────────────────
// Prüft beim Tippen, ob die E-Mail zustellbar ist (Syntax + MX-Record über das
// Backend). Netzwerkfehler blockieren nicht (Status bleibt "idle").

import { useEffect, useState } from "react";
import { api } from "./api";

export type EmailStatus = "idle" | "checking" | "valid" | "invalid";

const SYNTAX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
