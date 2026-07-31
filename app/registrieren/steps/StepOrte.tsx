"use client";

// ─── Schritt 3 — Arbeitsorte (Karte) ──────────────────────────────────────────

import { ArrowRight } from "lucide-react";
import { useRegistration } from "@/app/context/RegistrationContext";
import { api } from "@/lib/api";
import WorkLocationsMap from "@/app/components/WorkLocationsMapDynamic";
import { PrimaryButton, SectionLabel } from "@/app/components/ui";

export default function StepOrte() {
  const { data, setWorkLocations, next } = useRegistration();

  const proceed = () => {
    // Arbeitsorte opak als Wizard-Step 3 speichern (blockiert bei Fehler nicht).
    if (data.draftToken) {
      void api.saveStep(data.draftToken, 3, { workLocations: data.workLocations });
    }
    next();
  };

  return (
    <div className="max-w-2xl">
      <SectionLabel>Wo möchtest du arbeiten?</SectionLabel>
      <p className="text-sm leading-relaxed mb-6" style={{ color: "#6B7280" }}>
        Wähle beliebig viele Orte auf der Karte oder über die Suche. Für jeden Ort
        stellst du deinen gewünschten Arbeitsradius ein — so finden wir passende
        Betriebe in deiner Umgebung.
      </p>

      <WorkLocationsMap value={data.workLocations} onChange={setWorkLocations} />

      <div
        className="mt-10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{ borderTop: "1px solid #E5E7EB" }}
      >
        <p className="text-[11px]" style={{ color: "rgba(107,114,128,0.7)" }}>
          {data.workLocations.length > 0
            ? `${data.workLocations.length} Arbeitsort${data.workLocations.length > 1 ? "e" : ""} gewählt`
            : "Optional — du kannst das auch später im Profil ergänzen."}
        </p>
        <PrimaryButton onClick={proceed}>
          Weiter zur Verifizierung
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </PrimaryButton>
      </div>
    </div>
  );
}
