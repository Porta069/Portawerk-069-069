"use client";

// ─── Übersicht ────────────────────────────────────────────────────────────────
// Statusheimat: Begrüßung, Profil-Score mit beziffertem Nutzen, drei
// Schnellzugriffe, Aktivitätsfeed und die Verdienen-Kachel. Auth und Navigation
// liegen im Layout.

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Inbox, Search, FileText, ArrowRight, Sparkles, Clock3, Loader2, FlaskConical,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import {
  getProfileScore, listApplications, listOffers, JOBS_ARE_MOCKED,
} from "@/lib/jobsService";
import type { Application, JobOffer, ProfileScore as Score } from "@/lib/types";
import ProfileScore from "@/app/components/dashboard/ProfileScore";
import { AffiliateTile } from "@/app/components/dashboard/AffiliateTile";

const APP_STATUS_TEXT: Record<Application["status"], string> = {
  gesendet: "Bewerbung gesendet",
  gesehen: "Bewerbung angesehen",
  im_gespraech: "Im Gespräch",
  abgelehnt: "Abgesagt",
  zusage: "Zusage erhalten",
};

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [score, setScore] = useState<Score | null>(null);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      getProfileScore({
        gewerke: user?.role ? ["Elektriker / Elektroniker"] : undefined,
        erfahrungJahre: 8,
        phone: user?.phone || undefined,
        hasAvatar: !!user?.avatar,
        workLocations: 1,
      }),
      listOffers(),
      listApplications(),
    ]).then(([s, o, a]) => {
      if (!active) return;
      if (s.ok) setScore(s.data);
      if (o.ok) setOffers(o.data);
      if (a.ok) setApps(a.data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const openOffers = offers.filter((o) => o.status === "neu");

  const quick = [
    {
      href: "/dashboard/angebote",
      label: "Angebote",
      desc: openOffers.length ? `${openOffers.length} offen` : "Nichts Neues",
      icon: Inbox,
      badge: openOffers.length,
    },
    { href: "/dashboard/jobboerse", label: "Jobbörse", desc: "Stellen durchsuchen", icon: Search, badge: 0 },
    {
      href: "/dashboard/bewerbungen",
      label: "Bewerbungen",
      desc: `${apps.length} laufend`,
      icon: FileText,
      badge: 0,
    },
  ];

  // Aktivität aus Angeboten und Bewerbungen — verdichtet statt achtmal dieselbe Zeile.
  const activity = [
    ...offers.map((o) => ({
      id: `o-${o.id}`,
      title: `${o.job.employer} bietet dir „${o.job.title}" an`,
      meta: o.receivedAt,
      unread: o.status === "neu",
      href: "/dashboard/angebote",
    })),
    ...apps.map((a) => ({
      id: `a-${a.id}`,
      title: `${APP_STATUS_TEXT[a.status]} — ${a.job.title}`,
      meta: a.updatedAt,
      unread: false,
      href: "/dashboard/bewerbungen",
    })),
  ];

  return (
    <div>
      {JOBS_ARE_MOCKED && (
        <div
          className="flex items-start gap-3 rounded-2xl px-4 py-3 mb-6"
          style={{ background: "rgba(249, 173, 7,0.09)", border: "1px solid rgba(249, 173, 7,0.28)" }}
        >
          <FlaskConical className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#8A5F04" }} />
          <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(12, 51, 48,0.7)" }}>
            <strong>Demodaten:</strong> Für Stellen, Angebote und Bewerbungen gibt es noch
            keine Backend-Endpunkte. Die Oberfläche arbeitet gegen einen Mock und
            verhält sich bereits wie später im Betrieb.
          </p>
        </div>
      )}

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="text-primary font-bold mb-1"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)" }}
      >
        Willkommen, {user?.firstName || "zurück"}.
      </motion.h1>
      <p className="text-[15px] mb-8" style={{ color: "rgba(12, 51, 48,0.55)" }}>
        {openOffers.length > 0
          ? `${openOffers.length} ${openOffers.length === 1 ? "Betrieb möchte" : "Betriebe möchten"} dich einstellen.`
          : "Dein Profil ist aktiv. Wir melden uns, sobald ein Betrieb zu dir passt."}
      </p>

      {/* Schnellzugriffe */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {quick.map((q) => {
          const Icon = q.icon;
          return (
            <Link
              key={q.href}
              href={q.href}
              className="group relative flex items-center gap-3.5 rounded-2xl bg-white p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5"
              style={{ border: "1.5px solid #E4DFD3", boxShadow: "0 6px 20px -16px rgba(12, 51, 48,0.5)" }}
            >
              <span
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(249, 173, 7,0.13)" }}
              >
                <Icon className="w-[18px] h-[18px]" style={{ color: "#F9AD07" }} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold text-primary">{q.label}</span>
                <span className="block text-[12.5px]" style={{ color: "rgba(12, 51, 48,0.5)" }}>
                  {q.desc}
                </span>
              </span>
              {q.badge > 0 && (
                <span
                  className="flex items-center justify-center rounded-full text-[11px] font-bold tabular-nums flex-shrink-0"
                  style={{ minWidth: 22, height: 22, padding: "0 6px", background: "#F9AD07", color: "#0C3330" }}
                >
                  {q.badge}
                </span>
              )}
              <ArrowRight
                className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: "rgba(12, 51, 48,0.25)" }}
              />
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] gap-6 items-start">
        {/* Aktivität */}
        <section
          className="rounded-3xl bg-white overflow-hidden"
          style={{ border: "1.5px solid #E4DFD3", boxShadow: "0 10px 30px -24px rgba(12, 51, 48,0.5)" }}
        >
          <div className="px-6 py-4" style={{ borderBottom: "1px solid #EDE8DE" }}>
            <h2 className="text-primary font-bold text-[17px]" style={{ fontFamily: "var(--font-display)" }}>
              Letzte Aktivität
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#F9AD07" }} />
            </div>
          ) : activity.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Sparkles className="w-6 h-6 mx-auto mb-3" style={{ color: "#F9AD07" }} />
              <p className="text-[14px] font-semibold text-primary mb-1">Noch nichts passiert</p>
              <p className="text-[13px]" style={{ color: "rgba(12, 51, 48,0.5)" }}>
                Sobald ein Betrieb dein Profil sieht, erscheint es hier.
              </p>
            </div>
          ) : (
            <ul>
              {activity.map((a, i) => (
                <li key={a.id} style={{ borderTop: i > 0 ? "1px solid #F2EFE7" : "none" }}>
                  <Link
                    href={a.href}
                    className="flex items-start gap-3 px-6 py-4 transition-colors"
                    style={{ background: a.unread ? "rgba(249, 173, 7,0.06)" : "transparent" }}
                  >
                    <span
                      className="rounded-full flex-shrink-0 mt-1.5"
                      style={{
                        width: 7,
                        height: 7,
                        background: a.unread ? "#F9AD07" : "rgba(12, 51, 48,0.15)",
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-primary leading-snug">
                        {a.title}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 text-[11.5px] mt-0.5"
                        style={{ color: "rgba(12, 51, 48,0.42)" }}
                      >
                        <Clock3 className="w-3 h-3" />
                        {a.meta}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Rechte Spalte */}
        <div className="space-y-5">
          {score && <ProfileScore score={score} />}
          <AffiliateTile geworben={0} offenEuro={0} ausgezahltEuro={0} />
        </div>
      </div>
    </div>
  );
}
