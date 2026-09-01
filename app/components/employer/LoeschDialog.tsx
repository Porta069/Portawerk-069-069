"use client";

// ─── Endgültiges Löschen eines Inserats ───────────────────────────────────────
// Ein Bestätigungsfenster ist nur so gut wie das, was es zeigt. „Sind Sie
// sicher?" beantwortet niemand mit Nein — die Frage trägt keine Information.
// Deshalb steht hier der Titel der Stelle (habe ich die richtige Karte
// erwischt?) und darunter, was genau mitverschwindet, mit echten Zahlen aus
// der Datenbank.
//
// Zwei bewusste Abweichungen vom sonstigen Design:
//
//   1. Der Löschknopf ist NICHT im Akzentgelb. Gelb heißt in dieser Anwendung
//      überall „weiter, das ist der richtige Weg". Ein Löschknopf in derselben
//      Farbe würde aus Gewohnheit geklickt.
//   2. „Behalten" ist der auffällige, vorausgewählte Knopf. Bei einer Aktion
//      ohne Rückweg gehört das Gewicht auf die harmlose Seite; ein Fehlklick
//      darf nicht die teure Richtung nehmen.
//
// Der Ton richtet sich nach der Lage: Hängen keine Bewerbungen daran, ist das
// Löschen eines Entwurfs harmlos und wird nicht dramatisiert. Hängen welche
// daran, färbt sich der Block rot. Wer immer warnt, dem glaubt niemand mehr.

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import type { EmployerJob } from "@/lib/types";

export default function LoeschDialog({
  job,
  busy,
  onClose,
  onConfirm,
}: {
  /** Das zu löschende Inserat — `null` schließt den Dialog. */
  job: EmployerJob | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const behalten = useRef<HTMLButtonElement>(null);

  // Escape schließt. Bei einer Aktion ohne Rückweg muss der Ausgang immer
  // erreichbar sein — auch ohne Maus.
  useEffect(() => {
    if (!job) return;
    const zu = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", zu);
    return () => window.removeEventListener("keydown", zu);
  }, [job, busy, onClose]);

  // Der Fokus landet auf „Behalten", nicht auf dem Löschknopf. Wer den Dialog
  // mit der Tastatur öffnet und reflexhaft Enter drückt, behält seine Stelle.
  useEffect(() => {
    if (job) behalten.current?.focus();
  }, [job]);

  const bewerbungen = job?.applications ?? 0;
  const angebote = job?.angebote ?? 0;
  const merkungen = job?.merkungen ?? 0;
  const haengtDran = bewerbungen + angebote + merkungen;
  const ernst = bewerbungen > 0;

  const posten = [
    { n: bewerbungen, ein: "Bewerbung", viele: "Bewerbungen" },
    { n: angebote, ein: "verschicktes Angebot", viele: "verschickte Angebote" },
    { n: merkungen, ein: "Merkung durch Handwerker", viele: "Merkungen durch Handwerker" },
  ].filter((p) => p.n > 0);

  return (
    <AnimatePresence>
      {job && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6"
          style={{ background: "rgba(26,26,46,0.55)", backdropFilter: "blur(3px)" }}
          onClick={() => !busy && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="loesch-titel"
            aria-describedby="loesch-folgen"
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white"
            style={{ boxShadow: "0 40px 80px -30px rgba(26,26,46,0.6)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Rote Oberkante statt eines gelben Akzents: Das Fenster gehört
                sichtbar zur Familie, aber nicht zu den guten Nachrichten. */}
            <div style={{ height: 3, background: "#B91C1C" }} />

            <div className="p-6 sm:p-7">
              <div className="flex items-start gap-3.5">
                <span
                  className="flex-shrink-0 inline-flex items-center justify-center rounded-full"
                  style={{ width: 40, height: 40, background: "rgba(185,28,28,0.08)" }}
                >
                  <Trash2 className="w-[18px] h-[18px]" style={{ color: "#B91C1C" }} />
                </span>
                <div className="min-w-0">
                  <h2
                    id="loesch-titel"
                    className="text-[19px] font-bold text-primary leading-snug"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Inserat endgültig löschen?
                  </h2>
                  {/* Der Titel bricht um statt abzuschneiden — man muss lesen
                      können, WELCHE Stelle gleich verschwindet. */}
                  <p className="text-[13.5px] mt-1 break-words" style={{ color: "rgba(26,26,46,0.55)" }}>
                    „{job.title}“
                  </p>
                </div>
              </div>

              <div id="loesch-folgen" className="mt-5">
                {haengtDran > 0 ? (
                  <div
                    className="rounded-2xl px-4 py-3.5"
                    style={{
                      background: ernst ? "rgba(185,28,28,0.05)" : "#F7F5F0",
                      border: `1px solid ${ernst ? "rgba(185,28,28,0.18)" : "#E9E7E1"}`,
                    }}
                  >
                    <p
                      className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] mb-2"
                      style={{ color: ernst ? "#B91C1C" : "rgba(26,26,46,0.45)" }}
                    >
                      {ernst && <AlertTriangle className="w-3.5 h-3.5" />}
                      Wird mitgelöscht
                    </p>
                    <ul className="space-y-1">
                      {posten.map((p) => (
                        <li
                          key={p.viele}
                          className="text-[13.5px] text-primary flex items-baseline gap-2"
                        >
                          <span className="font-bold tabular-nums">{p.n}</span>
                          <span>{p.n === 1 ? p.ein : p.viele}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-[13.5px]" style={{ color: "rgba(26,26,46,0.6)" }}>
                    An dieser Stelle hängen keine Bewerbungen, Angebote oder
                    Merkungen. Es geht nichts weiter verloren.
                  </p>
                )}

                <p className="text-[13px] mt-3.5" style={{ color: "rgba(26,26,46,0.55)" }}>
                  {ernst ? (
                    <>
                      Die Bewerbungen verschwinden damit auch bei den Handwerkern,
                      die sie geschrieben haben. Das lässt sich nicht rückgängig
                      machen. Wenn Sie die Stelle nur nicht mehr zeigen wollen,
                      schließen Sie hier und wählen stattdessen <b>Einlagern</b>.
                    </>
                  ) : (
                    <>
                      Das lässt sich nicht rückgängig machen. Wenn Sie das Inserat
                      später noch einmal brauchen könnten, wählen Sie stattdessen{" "}
                      <b>Einlagern</b>.
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 mt-6">
                <button
                  ref={behalten}
                  type="button"
                  disabled={busy}
                  onClick={onClose}
                  className="flex-1 min-w-[130px] rounded-full px-5 py-3 text-[14px] font-bold text-primary transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  style={{ background: "#F0EDE6" }}
                >
                  Behalten
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={onConfirm}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-colors duration-200 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ border: "1.5px solid rgba(185,28,28,0.35)", color: "#B91C1C" }}
                >
                  {busy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Endgültig löschen
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
