"use client";

// ─── Bewerbungen ──────────────────────────────────────────────────────────────
// Nach Status gruppiert. Eine Absage ist bewusst keine Sackgasse: darunter
// stehen sofort ähnliche Stellen und der Empfehlungs-Anstoß — der Moment mit
// der höchsten Abbruchgefahr wird so wieder zu einem Weg nach vorn.

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Check, Eye, MessagesSquare, X, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { listApplications, similarJobs } from "@/lib/jobsService";
import type { Application, ApplicationStatus, Job } from "@/lib/types";
import JobCard from "@/app/components/dashboard/JobCard";
import { AffiliateNudge } from "@/app/components/dashboard/AffiliateTile";
import Wartezustand from "@/app/components/dashboard/Wartezustand";

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

  // Laufend = alles ausser Absagen. Die Zahl traegt Banner und Zaehler.
  const laufend = apps.filter((a) => a.status !== "abgelehnt").length;

  const grouped = ORDER.map((status) => ({
    status,
    items: apps.filter((a) => a.status === status),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      {/* ── Banner ──────────────────────────────────────────────────────────
          Randlos, dunkel, mit Foto — dieselbe Bauform wie Übersicht,
          Merkliste und Angebote. Die Überschrift beschreibt die Lage statt
          nur den Seitennamen zu wiederholen. */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="vollbreite relative overflow-hidden -mt-10 mb-10"
        style={{ background: "#1A1A2E" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.032) 0 1px, transparent 1px 34px)," +
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.032) 0 1px, transparent 1px 34px)",
          }}
        />

        <div aria-hidden className="absolute inset-y-0 right-0 w-[46%] hidden md:block">
          <Image
            src="/images/maurer-ziegel.jpg"
            alt=""
            fill
            sizes="46vw"
            className="object-cover"
            style={{ objectPosition: "center 42%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, #1A1A2E 2%, rgba(26,26,46,0.9) 32%, rgba(26,26,46,0.45) 100%)",
            }}
          />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 py-9 sm:py-11">
          <div className="flex items-center justify-between gap-8">
            <div className="min-w-0 max-w-[34rem]">
              <div className="flex items-center gap-2.5 mb-5">
                <span
                  className="punkt-glut rounded-full flex-shrink-0"
                  style={{ width: 8, height: 8, background: "#E8A838" }}
                />
                <span
                  className="text-[10px] max-lg:text-[11px] font-semibold uppercase"
                  style={{ color: "#E8A838", letterSpacing: "0.22em" }}
                >
                  {laufend > 0 ? `${laufend} laufend` : "Bewerbungen"}
                </span>
              </div>

              <h1
                className="font-bold leading-[1.12] mb-3"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.75rem, 3.3vw, 2.6rem)",
                  color: "#FFFFFF",
                }}
              >
                {apps.length === 0
                  ? "Hier siehst du, wie weit der Betrieb ist."
                  : laufend === 1
                    ? "Eine Bewerbung ist unterwegs."
                    : laufend > 1
                      ? `${laufend} Bewerbungen sind unterwegs.`
                      : "Deine Bewerbungen"}
              </h1>

              {apps.length === 0 && (
                <Link
                  href="/dashboard/jobboerse"
                  className="group inline-flex items-center justify-center gap-2.5 mt-7 px-6 py-3.5 text-[14px] font-bold rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "#E8A838",
                    color: "#1A1A2E",
                    fontFamily: "var(--font-display)",
                    boxShadow: "0 16px 32px -16px rgba(232,168,56,0.85)",
                  }}
                >
                  Stellen ansehen
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              )}
            </div>

            {laufend > 0 && (
              <div
                className="hidden lg:flex flex-col items-center justify-center flex-shrink-0"
                style={{
                  width: 168,
                  height: 168,
                  background:
                    "radial-gradient(circle, rgba(26,26,46,0.92) 44%, rgba(26,26,46,0) 74%)",
                }}
              >
                <span
                  className="font-black tabular-nums leading-none"
                  style={{ fontFamily: "var(--font-display)", fontSize: "4.5rem", color: "#E8A838" }}
                >
                  {laufend}
                </span>
                <span
                  className="text-[9.5px] max-lg:text-[11px] font-semibold uppercase mt-2"
                  style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.2em" }}
                >
                  laufend
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl bg-white"
              style={{ height: 170, border: "1.5px solid #EDEAE4" }}
            />
          ))}
        </div>
      ) : apps.length === 0 ? (
        // Wartezustand wie auf der Angebote-Seite: leere Karten in der Form
        // der echten Bewerbungen, die sich kaum merklich heben und senken.
        // Man sieht dadurch, wo die erste Bewerbung erscheinen wird.
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Wartezustand
            marke="Noch nichts unterwegs"
            titel="Noch keine Bewerbung"
            text="Such dir eine Stelle — du bewirbst dich diskret."
            icon={<FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#B47B18" }} />}
          />

          {/* Der Weg einer Bewerbung — dieselbe Form wie auf der
              Angebote-Seite. Die vier Stufen sind exakt die Status, die eine
              echte Bewerbung durchläuft. */}
          <div className="flex items-center gap-4 mb-6">
            <span
              className="text-[9.5px] max-lg:text-[11px] font-semibold uppercase flex-shrink-0"
              style={{ color: "#B47B18", letterSpacing: "0.2em" }}
            >
              So läuft eine Bewerbung
            </span>
            <span className="h-px flex-1" style={{ background: "#E4E1DA" }} />
          </div>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-6">
            {[
              { titel: "Du bewirbst dich", text: "Ein Klick, diskret" },
              { titel: "Betrieb sieht sie", text: "Meist in wenigen Tagen" },
              { titel: "Ihr kommt ins Gespräch", text: "Betrieb meldet sich bei dir" },
              { titel: "Zusage oder Absage", text: "Du siehst den Stand hier" },
            ].map((s2, i) => (
              <li key={s2.titel} className="relative flex gap-3 sm:block">
                {i < 3 && (
                  <span
                    aria-hidden
                    className="hidden lg:block absolute h-px"
                    style={{ left: 30, right: -20, top: 11, background: "rgba(26,26,46,0.13)" }}
                  />
                )}
                <span
                  className="relative z-10 flex-shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold tabular-nums"
                  style={{
                    width: 22,
                    height: 22,
                    background: "rgba(232,168,56,0.18)",
                    color: "#B47B18",
                  }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 sm:mt-3">
                  <p className="text-[13.5px] font-bold leading-snug text-primary">{s2.titel}</p>
                  <p className="text-[12.5px] leading-snug mt-0.5" style={{ color: "rgba(26,26,46,0.55)" }}>
                    {s2.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>
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
