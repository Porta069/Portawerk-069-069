"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// Fixe CTA-Leiste unten — nur mobil, erscheint nach dem Hero.
// Handwerker surfen überwiegend am Handy: die Aktion bleibt so immer in Daumen-Reichweite.
export default function StickyMobileCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.7);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3"
          style={{
            background: "rgba(26,26,46,0.96)",
            backdropFilter: "blur(8px)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
          }}
        >
          <Link
            href="/registrieren"
            className="flex items-center justify-center gap-2.5 w-full bg-accent text-primary font-semibold py-3.5 text-base"
          >
            Kostenlos bewerben
            <span className="text-primary/60 font-normal text-sm">· 200 € Prämie</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
