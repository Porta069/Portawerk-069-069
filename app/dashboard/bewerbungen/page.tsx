"use client";

// ─── Bewerbungen ──────────────────────────────────────────────────────────────
// Nach Status gruppiert. Eine Absage ist bewusst keine Sackgasse: darunter
// stehen sofort ähnliche Stellen und der Empfehlungs-Anstoß — der Moment mit
// der höchsten Abbruchgefahr wird so wieder zu einem Weg nach vorn.

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Loader2, ArrowRight, Check, Eye, MessagesSquare, X, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { listApplications, similarJobs } from "@/lib/jobsService";
import type { Application, ApplicationStatus, Job } from "@/lib/types";
import JobCard from "@/app/components/dashboard/JobCard";
import { AffiliateNudge } from "@/app/components/dashboard/AffiliateTile";

const STATUS: Record<
  ApplicationStatus,
  { label: string; note: string; color: string; bg: string; icon: LucideIcon }
> = {
  gesendet: {
    label: "Eingegangen",
    note: "Beim Betrieb angekommen — noch nicht geöffnet.",
    color: "rgba(26,26,46,0.6)",
    bg: "rgba(26,26,46,0.06)",
    icon: Send,
  },
  gesehen: {
    label: "Angesehen",
    note: "Der Betrieb hat deine Bewerbung geöffnet.",
    color: "#B47B18",
    bg: "rgba(232,168,56,0.16)",
    icon: Eye,
  },
  im_gespraech: {
    label: "Im Gespräch",
    note: "Der Betrieb ist auf dich zugekommen.",
    color: "#1D4ED8",
    bg: "rgba(29,78,216,0.12)",
    icon: MessagesSquare,
  },
  zusage: {
    label: "Zusage",
    note: "Du hast die Stelle bekommen.",
    color: "#15803D",
    bg: "rgba(22,163,74,0.14)",
    icon: Check,
  },
  abgelehnt: {
    label: "Absage",
    note: "Diesmal hat es nicht gepasst.",
    color: "rgba(26,26,46,0.55)",
    bg: "rgba(26,26,46,0.06)",
    icon: X,
  },
};

const ORDER: ApplicationStatus[] = ["zusage", "im_gespraech", "gesehen", "gesendet", "abgelehnt"];

function StatusPill({ status }: { status: ApplicationStatus }) {
  const s = STATUS[status];
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
      {s.label}
    </span>
  );
}

export default function BewerbungenPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [similar, setSimilar] = useState<Job[]>([]);

  useEffect(() => {
    let active = true;
    listApplications().then((res) => {
      if (!active) return;
      if (res.ok) {
        setApps(res.data);
        // Für die erste Absage direkt Alternativen laden.
        const rejected = res.data.find((a) => a.status === "abgelehnt");
        if (rejected) {
          similarJobs(rejected.job).then((s) => {
            if (active && s.ok) setSimilar(s.data);
          });
        }
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const grouped = ORDER.map((status) => ({
    status,
    items: apps.filter((a) => a.status === status),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <h1
        className="text-primary font-bold mb-1"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)" }}
      >
        Deine Bewerbungen
      </h1>
      <p className="text-[15px] mb-7" style={{ color: "rgba(26,26,46,0.55)" }}>
        Wo du dich beworben hast — und wie weit der Betrieb ist.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
        </div>
      ) : apps.length === 0 ? (
        <div className="rounded-3xl bg-white px-6 py-16 text-center" style={{ border: "1.5px solid #E9E7E1" }}>
          <FileText className="w-7 h-7 mx-auto mb-4" style={{ color: "#E8A838" }} />
          <p className="text-[16px] font-bold text-primary mb-1.5">Noch keine Bewerbung</p>
          <p className="text-[13.5px] mb-6" style={{ color: "rgba(26,26,46,0.5)" }}>
            Such dir in der Jobbörse eine Stelle — du bewirbst dich diskret.
          </p>
          <Link
            href="/dashboard/jobboerse"
            className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold"
            style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
          >
            Zur Jobbörse
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        <div className="space-y-9">
          {grouped.map((g) => (
            <section key={g.status}>
              {/* Statusleiste — gleiche Kennzeichnung wie in den Karten,
                  nur groß genug, um den Stand auf einen Blick zu erfassen. */}
              <div
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl px-4 py-3.5 mb-4"
                style={{ background: STATUS[g.status].bg }}
              >
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.7)" }}
                >
                  {(() => {
                    const Icon = STATUS[g.status].icon;
                    return <Icon className="w-[18px] h-[18px]" style={{ color: STATUS[g.status].color }} strokeWidth={2.6} />;
                  })()}
                </span>
                <h2
                  className="text-[18px] font-bold leading-none"
                  style={{ fontFamily: "var(--font-display)", color: STATUS[g.status].color }}
                >
                  {STATUS[g.status].label}
                </h2>
                <span
                  className="flex items-center justify-center rounded-full text-[12px] font-bold tabular-nums"
                  style={{
                    minWidth: 24,
                    height: 24,
                    padding: "0 7px",
                    background: STATUS[g.status].color,
                    color: "white",
                  }}
                >
                  {g.items.length}
                </span>
                <span className="text-[13px] w-full sm:w-auto sm:ml-1" style={{ color: "rgba(26,26,46,0.6)" }}>
                  {STATUS[g.status].note}
                </span>
              </div>

              <div className="space-y-4">
                {g.items.map((a) => (
                  <JobCard
                    key={a.id}
                    job={a.job}
                    footer={
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusPill status={a.status} />
                        <span className="text-[12px]" style={{ color: "rgba(26,26,46,0.4)" }}>
                          aktualisiert {a.updatedAt}
                        </span>
                      </div>
                    }
                  />
                ))}
              </div>

              {/* Absage ist keine Sackgasse */}
              {g.status === "abgelehnt" && (
                <div className="mt-5 space-y-4">
                  <AffiliateNudge tone="consolation" />
                  {similar.length > 0 && (
                    <div
                      className="rounded-3xl p-5"
                      style={{ background: "white", border: "1.5px solid #E9E7E1" }}
                    >
                      <p className="text-[14px] font-bold text-primary mb-3">
                        Diese {similar.length} Stellen passen ähnlich gut
                      </p>
                      <ul className="space-y-2">
                        {similar.map((j) => (
                          <li key={j.id}>
                            <Link
                              href="/dashboard/jobboerse"
                              className="group flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-colors"
                              style={{ background: "var(--color-surface)" }}
                            >
                              <span className="min-w-0">
                                <span className="block text-[14px] font-semibold text-primary truncate">
                                  {j.title}
                                </span>
                                <span className="block text-[12px]" style={{ color: "rgba(26,26,46,0.5)" }}>
                                  {j.employer} · {j.travelMinutes} Min. · {j.salaryMin.toLocaleString("de-DE")}–
                                  {j.salaryMax.toLocaleString("de-DE")} €
                                </span>
                              </span>
                              <ArrowRight
                                className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                                style={{ color: "#E8A838" }}
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
