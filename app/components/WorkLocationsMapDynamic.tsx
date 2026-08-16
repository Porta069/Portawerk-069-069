"use client";

// Dynamischer Import der Leaflet-Karte (nur im Browser — kein SSR).

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const WorkLocationsMapDynamic = dynamic(() => import("./WorkLocationsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center gap-2 py-16" style={{ border: "1.5px solid #DFE3E0", background: "white" }}>
      <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#F9AD07" }} />
      <span className="text-sm" style={{ color: "#5F6F6A" }}>Karte wird geladen…</span>
    </div>
  ),
});

export default WorkLocationsMapDynamic;
