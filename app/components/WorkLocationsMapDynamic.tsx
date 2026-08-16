"use client";

// Dynamischer Import der Leaflet-Karte (nur im Browser — kein SSR).

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const WorkLocationsMapDynamic = dynamic(() => import("./WorkLocationsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center gap-2 py-16" style={{ border: "1.5px solid #E5E7EB", background: "white" }}>
      <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#E8A838" }} />
      <span className="text-sm" style={{ color: "#6B7280" }}>Karte wird geladen…</span>
    </div>
  ),
});

export default WorkLocationsMapDynamic;
