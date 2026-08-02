"use client";

// Dynamischer Import der Leaflet-Karte (nur im Browser — kein SSR).

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Typ durchreichen, damit Aufrufer nur diesen Wrapper importieren muessen.
export type { SearchArea } from "./SearchAreaMap";

const SearchAreaMapDynamic = dynamic(() => import("./SearchAreaMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center gap-2 rounded-2xl py-24"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#E8A838" }} />
      <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.55)" }}>
        Karte wird geladen …
      </span>
    </div>
  ),
});

export default SearchAreaMapDynamic;
