"use client";

// ─── Gestellte Kontaktanfragen (Arbeitgeber) ─────────────────────────────────
// Nach Status gruppiert. Solange eine Anfrage offen ist, bleibt der Kandidat
// anonym — die Karte zeigt das unverändert an.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Send, Clock3, Check, X, ArrowRight, Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { listRequests } from "@/lib/employerService";
import type { ContactRequest } from "@/lib/types";
import CandidateCard from "@/app/components/employer/CandidateCard";
import Wartezustand from "@/app/components/dashboard/Wartezustand";

const GROUPS: {
  status: ContactRequest["status"];
  label: string;
  note: string;
  color: string;
  bg: string;
  icon: LucideIcon;
}[] = [
  {
    status: "freigegeben",
    label: "Profil freigegeben",
    note: "Der Kandidat hat zugestimmt — Kontaktdaten liegen in deinem Postfach.",
    color: "#15803D",
    bg: "rgba(22,163,74,0.14)",
    icon: Check,
  },
  {
    status: "angefragt",
    label: "Anfrage läuft",
    note: "Der Kandidat entscheidet noch. Bis dahin bleibt das Profil anonym.",
    color: "#B47B18",
    bg: "rgba(232,168,56,0.16)",
    icon: Clock3,
  },
  {
    status: "abgelehnt",
    label: "Abgelehnt",
    note: "Diesmal kein Interesse — der Grund wird uns anonym übermittelt.",
    color: "rgba(26,26,46,0.55)",
    bg: "rgba(26,26,46,0.06)",
    icon: X,
  },
];

export default function EmployerRequestsPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listRequests().then((res) => {
      if (res.ok) setRequests(res.data);
      setLoading(false);
    });
  }, []);

  const grouped = GROUPS.map((g) => ({
    ...g,
    items: requests.filter((r) => r.status === g.status),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <h1
        className="text-primary font-bold mb-1"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)" }}
      >
        Meine Anfragen
      </h1>
      <p className="text-[15px] mb-7" style={{ color: "rgba(26,26,46,0.55)" }}>
        Alle Kandidaten, bei denen du Interesse angemeldet hast.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
        </div>
      ) : requests.length === 0 ? (
        // Derselbe wartende Stapel wie bei den Bewerbungen: die
        // Platzhalterkarten tragen die Bildkachel, weil auch die
        // Kandidatenkarten hier links ein Gewerkfoto haben.
        <Wartezustand
          mitBild
          marke="Noch keine Anfrage"
          titel="Hier stehen deine Anfragen"
          text="Sobald du bei einem Handwerker Interesse anmeldest, siehst du hier, wie er entschieden hat."
          icon={<Inbox className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#B47B18" }} />}
          aktion={
            <Link
              href="/unternehmen/dashboard"
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[14.5px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                background: "#E8A838",
                color: "#1A1A2E",
                fontFamily: "var(--font-display)",
                boxShadow: "0 16px 32px -16px rgba(232,168,56,0.85)",
              }}
            >
              <Send className="w-4 h-4" />
              Kandidaten suchen
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          }
        />
      ) : (
        <div className="space-y-9">
          {grouped.map((g) => {
            const Icon = g.icon;
            return (
              <section key={g.status}>
                <div
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl px-4 py-3.5 mb-4"
                  style={{ background: g.bg }}
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.7)" }}
                  >
                    <Icon className="w-[18px] h-[18px]" style={{ color: g.color }} strokeWidth={2.6} />
                  </span>
                  <h2
                    className="text-[18px] font-bold leading-none"
                    style={{ fontFamily: "var(--font-display)", color: g.color }}
                  >
                    {g.label}
                  </h2>
                  <span
                    className="flex items-center justify-center rounded-full text-[12px] font-bold tabular-nums"
                    style={{ minWidth: 24, height: 24, padding: "0 7px", background: g.color, color: "white" }}
                  >
                    {g.items.length}
                  </span>
                  <span className="text-[13px] w-full sm:w-auto sm:ml-1" style={{ color: "rgba(26,26,46,0.6)" }}>
                    {g.note}
                  </span>
                </div>

                {/* Volle Breite: die Karte ist eine breite Zeile — in zwei Spalten
                    gequetscht brechen die Kennzahlen ab ("9." statt "9 Jahre"). */}
                <div className="space-y-5">
                  {g.items.map((r) => (
                    <div key={r.id}>
                      <p className="text-[12.5px] mb-2 ml-1" style={{ color: "rgba(26,26,46,0.45)" }}>
                        Angefragt für <strong className="text-primary">{r.position}</strong> · {r.sentAt}
                      </p>
                      <CandidateCard candidate={r.candidate} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
