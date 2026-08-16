"use client";

// ─── E-Mail-Verifizierung (Info) ──────────────────────────────────────────────
// Die Verifizierung läuft jetzt direkt in der Registrierung über 6-stellige
// OTP-Codes (E-Mail + SMS). Diese Route bleibt nur als freundlicher Hinweis.

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Info } from "lucide-react";
import Logo from "@/app/components/Logo";

export default function VerifyEmailPage() {
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
          <Logo height={24} priority />
        </Link>

        <div className="bg-white px-8 py-12" style={{ border: "1px solid #E5E7EB" }}>
          <div
            className="w-14 h-14 mx-auto flex items-center justify-center mb-6"
            style={{ background: "rgba(232,168,56,0.12)" }}
          >
            <Info className="w-6 h-6" style={{ color: "#E8A838" }} />
          </div>
          <h1 className="text-primary font-bold text-2xl mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Verifizierung läuft in der Registrierung
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#6B7280" }}>
            E-Mail und Telefon werden direkt während der Registrierung mit einem
            6-stelligen Code bestätigt — du brauchst keinen separaten Link.
          </p>
          <Link
            href="/registrieren"
            className="group inline-flex items-center gap-2 font-semibold px-7 py-3.5 text-sm transition-all"
            style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
          >
            Zur Registrierung
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
