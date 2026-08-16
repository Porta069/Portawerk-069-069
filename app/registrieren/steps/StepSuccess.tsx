"use client";

// ─── Erfolgs-Schritt ──────────────────────────────────────────────────────────

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, LayoutDashboard, ArrowRight } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";

export default function StepSuccess() {
  const { data, reset } = useRegistration();
  const firstName = data.contact.firstName.trim() || "Handwerker:in";

  return (
    <div className="flex flex-col items-center text-center py-14 max-w-lg mx-auto">
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.1 }}
        className="w-20 h-20 flex items-center justify-center mb-8"
        style={{ background: "#F9AD07" }}
      >
        <Check className="w-10 h-10" style={{ color: "#0C3330" }} strokeWidth={3} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="font-bold text-primary mb-4"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
      >
        Willkommen, {firstName}!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="text-base leading-relaxed mb-10"
        style={{ color: "#5F6F6A" }}
      >
        Dein Handwerker-Profil wurde erstellt. Unser Team gleicht dich jetzt mit
        passenden Betrieben ab und meldet sich persönlich bei dir.
      </motion.p>

      {/* Nächste Schritte */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="w-full bg-white mb-8"
        style={{ border: "1px solid #DFE3E0" }}
      >
        <div className="px-6 py-4" style={{ borderBottom: "1px solid #DFE3E0" }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "rgba(12, 51, 48,0.4)" }}>
            Was passiert als nächstes?
          </p>
        </div>
        {[
          { n: "01", text: "Wir prüfen dein Profil & deine Angaben intern" },
          { n: "02", text: "Passende Betriebe in deiner Region werden identifiziert" },
          { n: "03", text: "Wir melden uns persönlich — du entscheidest, ob wir dich vorstellen" },
        ].map((item, i, arr) => (
          <div
            key={item.n}
            className="flex items-start gap-4 px-6 py-4"
            style={{ borderBottom: i < arr.length - 1 ? "1px solid #EFF2F0" : "none" }}
          >
            <span className="text-[11px] font-bold flex-shrink-0 mt-0.5" style={{ color: "#F9AD07", fontFamily: "var(--font-display)" }}>
              {item.n}
            </span>
            <p className="text-sm text-left" style={{ color: "rgba(12, 51, 48,0.65)" }}>
              {item.text}
            </p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <Link
          href="/dashboard"
          onClick={() => reset()}
          className="group inline-flex items-center gap-3 font-semibold px-8 py-4 text-sm transition-all duration-200"
          style={{ background: "#F9AD07", color: "#0C3330", fontFamily: "var(--font-display)" }}
        >
          <LayoutDashboard className="w-4 h-4" />
          Zum Dashboard
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
        <Link
          href="/"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 text-sm transition-colors duration-200"
          style={{ color: "rgba(12, 51, 48,0.45)" }}
        >
          Zurück zur Startseite
        </Link>
      </motion.div>
    </div>
  );
}
