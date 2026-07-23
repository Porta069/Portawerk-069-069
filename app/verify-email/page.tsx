"use client";

// ─── E-Mail-Verifikation (Ziel des E-Mail-Links) ──────────────────────────────
// Wird über den in der Mail versendeten Link aufgerufen:
//   /verify-email?token=...&email=...
// Bestätigt den Token und meldet den Erfolg via localStorage an den offenen
// Registrierungs-Tab zurück (Storage-Event).

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Hammer, Check, X, Loader2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

const EMAIL_VERIFIED_KEY = "portawerk_email_verified";

type State = "loading" | "success" | "error";

function VerifyEmailInner() {
  const params = useSearchParams();
  // DEV: falls kein Token übergeben wird, nutzen wir einen Platzhalter,
  // damit der Happy-Path ohne echte Mail testbar ist.
  const token = params.get("token") ?? "dev-token";
  const email = params.get("email") ?? "";

  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await api.verifyEmail(token);
      if (!active) return;
      if (res.ok && res.data) {
        setState("success");
        try {
          localStorage.setItem(EMAIL_VERIFIED_KEY, email || "true");
        } catch {
          /* ignore */
        }
      } else {
        setState("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [token, email]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#F8F7F4", fontFamily: "var(--font-sans)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md text-center"
      >
        <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
          <div className="w-8 h-8 bg-accent flex items-center justify-center">
            <Hammer className="w-4 h-4 text-primary" strokeWidth={2} />
          </div>
          <span className="text-primary text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
            PortaWerk
          </span>
        </Link>

        <div className="bg-white px-8 py-12" style={{ border: "1px solid #E5E7EB" }}>
          {state === "loading" && (
            <>
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-6" style={{ color: "#E8A838" }} />
              <p className="text-primary font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                E-Mail wird bestätigt…
              </p>
            </>
          )}

          {state === "success" && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 mx-auto flex items-center justify-center mb-6"
                style={{ background: "#22C55E" }}
              >
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </motion.div>
              <h1
                className="text-primary font-bold text-2xl mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                E-Mail bestätigt!
              </h1>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "#6B7280" }}>
                Danke — deine E-Mail-Adresse ist verifiziert. Du kannst dieses Fenster
                schließen und im Registrierungs-Tab fortfahren, oder hier zurückkehren.
              </p>
              <Link
                href="/registrieren"
                className="group inline-flex items-center gap-2 font-semibold px-7 py-3.5 text-sm transition-all"
                style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
              >
                Zurück zur Registrierung
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </>
          )}

          {state === "error" && (
            <>
              <div
                className="w-16 h-16 mx-auto flex items-center justify-center mb-6"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                <X className="w-8 h-8" style={{ color: "#EF4444" }} strokeWidth={2.5} />
              </div>
              <h1
                className="text-primary font-bold text-2xl mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Verifikation fehlgeschlagen
              </h1>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "#6B7280" }}>
                Der Link ist ungültig oder abgelaufen. Fordere in der Registrierung
                einen neuen Verifikations-Link an.
              </p>
              <Link
                href="/registrieren"
                className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 text-sm transition-all"
                style={{ background: "#1A1A2E", color: "white", fontFamily: "var(--font-display)" }}
              >
                Zurück zur Registrierung
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8F7F4" }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
