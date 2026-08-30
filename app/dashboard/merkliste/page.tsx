"use client";

// ─── Merkliste ────────────────────────────────────────────────────────────────
// Die im Profil gespeicherten Stellen (Herz auf der Stellenkarte). Von hier
// aus geht alles weiter wie in der Jobbörse: Details ansehen, vergleichen,
// bewerben — oder wieder entfernen.

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Loader2, ArrowRight, Send, Check, X, GitCompareArrows, Wallet, Clock3,
} from "lucide-react";
import { listFavorites, setFavorite, applyToJob, getWorkLocations } from "@/lib/jobsService";
import type { Job, WorkLocation } from "@/lib/types";
import JobCard from "@/app/components/dashboard/JobCard";
import JobDetailDialog from "@/app/components/dashboard/JobDetailDialog";
import CompareDialog from "@/app/components/dashboard/CompareDialog";
import Wartezustand from "@/app/components/dashboard/Wartezustand";

/** Bewerben-Button mit Zustand (wie in der Jobbörse). */
function ApplyButton({ jobId }: { jobId: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "already">("idle");

  const apply = async () => {
    if (state === "busy" || state === "done") return;
    setState("busy");
    const res = await applyToJob(jobId);
    if (res.ok) setState("done");
    else if (res.error.includes("bereits")) setState("already");
    else setState("idle");
  };

  if (state === "done" || state === "already") {
    return (
      <span
        className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold"
        style={{ background: "rgba(22,163,74,0.12)", color: "#15803D", fontFamily: "var(--font-display)" }}
      >
        <Check className="w-4 h-4" />
        {state === "done" ? "Bewerbung gesendet" : "Bereits beworben"}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={apply}
      disabled={state === "busy"}
      className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
      style={{ background: "#1A1A2E", color: "white", fontFamily: "var(--font-display)" }}
    >
      {state === "busy" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      Diskret bewerben
    </button>
  );
}

export default function MerklistePage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [locations, setLocations] = useState<WorkLocation[]>([]);

  useEffect(() => {
    listFavorites().then((res) => {
      if (res.ok) setJobs(res.data);
      else setJobs([]);
    });
    getWorkLocations().then((res) => {
      if (res.ok) setLocations(res.data);
    });
  }, []);

  /** Entfernen nimmt die Karte direkt aus der Liste. */
  const removeFavorite = (job: Job) => {
    setJobs((cur) => (cur ?? []).filter((j) => j.id !== job.id));
    setCompareIds((cur) => cur.filter((id) => id !== job.id));
    setDetailJob((cur) => (cur?.id === job.id ? null : cur));
    void setFavorite(job.id, false);
  };

  const toggleCompare = (job: Job) =>
    setCompareIds((cur) =>
      cur.includes(job.id) ? cur.filter((id) => id !== job.id) : [...cur, job.id]
    );

  const compareJobs = (jobs ?? []).filter((j) => compareIds.includes(j.id));

  // Kennzahlen aus den gemerkten Stellen — rein abgeleitet, kein zusätzlicher
  // Aufruf. Sie beantworten die Fragen, die man sich vor einer Bewerbung
  // stellt: Was ist das Beste dabei? Was liegt am nächsten?
  const liste = jobs ?? [];
  const bestesGehalt = liste.length
    ? Math.max(...liste.map((j) => j.salaryMax || j.salaryMin || 0))
    : 0;
  const kuerzesteFahrt = liste.length
    ? Math.min(...liste.map((j) => j.travelMinutes).filter((m) => m > 0))
    : 0;

  return (
    <div>
      {/* ── Statuspanel ─────────────────────────────────────────────────────
          Randlos über die volle Fensterbreite, direkt unter der Kopfleiste —
          dieselbe Bauform wie die Übersicht. Die Überschrift beschreibt die
          Lage statt nur den Seitennamen zu wiederholen. */}
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
            src="/images/tischler-hobel.jpg"
            alt=""
            fill
            sizes="46vw"
            className="object-cover"
            style={{ objectPosition: "center 45%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, #1A1A2E 2%, rgba(26,26,46,0.9) 32%, rgba(26,26,46,0.45) 100%)",
            }}
          />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 py-10 sm:py-14">
          <div className="flex items-center justify-between gap-8">
            <div className="min-w-0 max-w-[34rem]">
              <div className="flex items-center gap-2.5 mb-5">
                <Heart
                  className="w-4 h-4 flex-shrink-0"
                  fill="#E8A838"
                  strokeWidth={0}
                />
                <span
                  className="text-[10px] font-semibold uppercase"
                  style={{ color: "#E8A838", letterSpacing: "0.22em" }}
                >
                  Merkliste
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
                {liste.length === 0
                  ? "Hier sammelst du, was dich interessiert."
                  : liste.length === 1
                    ? "Eine Stelle wartet auf deine Entscheidung."
                    : `${liste.length} Stellen warten auf deine Entscheidung.`}
              </h1>

              <p
                className="text-[15px] leading-relaxed mb-7 max-w-[32rem]"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {liste.length === 0
                  ? "Tipp in der Jobbörse auf das Herz — die Stelle landet hier."
                  : "Lass dir Zeit. Gemerkte Stellen laufen dir nicht weg."}
              </p>

              <Link
                href="/dashboard/jobboerse"
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-[14px] font-bold rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                style={{
                  background: "#E8A838",
                  color: "#1A1A2E",
                  fontFamily: "var(--font-display)",
                  boxShadow: "0 16px 32px -16px rgba(232,168,56,0.85)",
                }}
              >
                {liste.length === 0 ? "Stellen ansehen" : "Weitere Stellen ansehen"}
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Zähler im Panel — grösstes Element, sagt sofort, wie viel hier
                liegt. */}
            {liste.length > 0 && (
              <div
                className="hidden lg:flex flex-col items-center justify-center flex-shrink-0"
                style={{
                  width: 168,
                  height: 168,
                  // Der Zähler liegt über dem Werkstattfoto. Ohne diese
                  // Abdunklung steht er auf einer Hobelbank und ist nicht mehr
                  // zu lesen.
                  background:
                    "radial-gradient(circle, rgba(26,26,46,0.92) 44%, rgba(26,26,46,0) 74%)",
                }}
              >
                <span
                  className="font-black tabular-nums leading-none"
                  style={{ fontFamily: "var(--font-display)", fontSize: "4.5rem", color: "#E8A838" }}
                >
                  {liste.length}
                </span>
                <span
                  className="text-[9.5px] font-semibold uppercase mt-2"
                  style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.2em" }}
                >
                  gemerkt
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* ── Kennzahlen ──────────────────────────────────────────────────────
          Abgeleitet aus den gemerkten Stellen, kein zusätzlicher Aufruf.
          Warmer Verlauf und Werkzeug-Wasserzeichen wie die Karten der
          Übersicht. */}
      {liste.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-10">
          {[
            {
              label: "Gemerkt",
              wert: String(liste.length),
              zusatz: liste.length === 1 ? "Stelle" : "Stellen",
              icon: Heart,
            },
            {
              label: "Bester Lohn",
              wert: bestesGehalt ? `${bestesGehalt.toLocaleString("de-DE")} €` : "—",
              zusatz: bestesGehalt ? "im Monat" : "keine Angabe",
              icon: Wallet,
            },
            {
              label: "Nächste Stelle",
              wert: kuerzesteFahrt ? `${kuerzesteFahrt}` : "—",
              zusatz: kuerzesteFahrt ? "Minuten Fahrt" : "keine Angabe",
              icon: Clock3,
            },
          ].map((k, i) => {
            const Werkzeug = k.icon;
            return (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 + i * 0.05 }}
                className="relative overflow-hidden rounded-2xl p-6 last:col-span-2 lg:last:col-span-1"
                style={{
                  background: "linear-gradient(158deg, #FFFFFF 0%, #FCFAF4 56%, #F6F0E2 100%)",
                  border: "1.5px solid #EDE8DC",
                  boxShadow: "0 10px 26px -20px rgba(26,26,46,0.6)",
                }}
              >
                <span
                  aria-hidden
                  className="absolute top-0 left-0 h-[3px]"
                  style={{
                    width: "36%",
                    background: "linear-gradient(90deg, #E8A838 0%, rgba(232,168,56,0.15) 100%)",
                  }}
                />
                <Werkzeug
                  aria-hidden
                  className="absolute pointer-events-none"
                  style={{
                    right: -16,
                    bottom: -12,
                    width: 92,
                    height: 92,
                    color: "rgba(26,26,46,0.07)",
                  }}
                  strokeWidth={1.1}
                />
                <p
                  className="relative text-[9.5px] font-semibold uppercase mb-2"
                  style={{ color: "rgba(26,26,46,0.45)", letterSpacing: "0.19em" }}
                >
                  {k.label}
                </p>
                <p
                  className="relative text-[34px] font-bold tabular-nums leading-none text-primary"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {k.wert}
                </p>
                <p className="relative text-[12.5px] mt-2" style={{ color: "rgba(26,26,46,0.5)" }}>
                  {k.zusatz}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Liste ── */}
      {jobs === null ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl bg-white"
              style={{ height: 190, border: "1.5px solid #EDEAE4" }}
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        // Leer ist hier der Normalfall am ersten Tag. Erst der Befund als
        // wartender Kartenstapel — er zeigt, dass nichts gemerkt ist und wo
        // die erste Stelle landen wird —, dann die Anleitung.
        <section>
          <Wartezustand
            marke="Merkliste leer"
            titel="Noch nichts gemerkt"
            text="Tipp in der Jobbörse auf das Herz einer Stelle."
            icon={<Heart className="w-3.5 h-3.5 flex-shrink-0" fill="#B47B18" strokeWidth={0} />}
            abstandUnten="lg:mb-24"
          />

          <div className="flex items-center gap-4 mb-6">
            <span
              className="text-[9.5px] font-semibold uppercase flex-shrink-0"
              style={{ color: "#B47B18", letterSpacing: "0.2em" }}
            >
              So geht&rsquo;s
            </span>
            <span className="h-px flex-1" style={{ background: "#E4E1DA" }} />
          </div>

          <ol className="grid sm:grid-cols-3 gap-x-5 gap-y-6">
            {[
              { titel: "Herz antippen", text: "In der Jobbörse an jeder Stelle" },
              { titel: "In Ruhe vergleichen", text: "Lohn, Fahrzeit, Bedingungen" },
              { titel: "Dann bewerben", text: "Diskret, wann du willst" },
            ].map((s, i) => (
              <li key={s.titel} className="relative flex gap-3 sm:block">
                {i < 2 && (
                  <span
                    aria-hidden
                    className="hidden sm:block absolute h-px"
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
                  <p className="text-[13.5px] font-bold leading-snug text-primary">{s.titel}</p>
                  <p className="text-[12.5px] leading-snug mt-0.5" style={{ color: "rgba(26,26,46,0.55)" }}>
                    {s.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-5">
            <span
              className="text-[9.5px] font-semibold uppercase flex-shrink-0"
              style={{ color: "#B47B18", letterSpacing: "0.2em" }}
            >
              Deine gemerkten Stellen
            </span>
            <span className="h-px flex-1" style={{ background: "#E4E1DA" }} />
          </div>
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                footer={<ApplyButton jobId={job.id} />}
                onOpen={setDetailJob}
                onToggleFavorite={removeFavorite}
                compareSelected={compareIds.includes(job.id)}
                onToggleCompare={toggleCompare}
                workLocations={locations}
              />
            ))}
          </div>
        </>
      )}

      <JobDetailDialog
        job={detailJob}
        onClose={() => setDetailJob(null)}
        onToggleFavorite={removeFavorite}
        footer={detailJob ? <ApplyButton jobId={detailJob.id} /> : null}
      />

      <CompareDialog
        jobs={compareJobs}
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        onRemove={(id) => {
          setCompareIds((cur) => {
            const next = cur.filter((x) => x !== id);
            if (next.length === 0) setCompareOpen(false);
            return next;
          });
        }}
      />

      <AnimatePresence>
        {compareIds.length > 0 && !compareOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[90] flex flex-wrap items-center justify-center gap-3 rounded-full pl-5 pr-2 py-2 max-w-[calc(100vw-24px)]"
            style={{ background: "#1A1A2E", boxShadow: "0 20px 50px -20px rgba(26,26,46,0.8)" }}
          >
            <span className="text-white text-[13.5px] whitespace-nowrap">
              <strong className="tabular-nums">{compareIds.length}</strong>{" "}
              {compareIds.length === 1 ? "Betrieb" : "Betriebe"} ausgewählt
            </span>
            <button
              type="button"
              onClick={() => setCompareOpen(true)}
              disabled={compareIds.length < 2}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-bold disabled:opacity-50"
              style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
            >
              <GitCompareArrows className="w-4 h-4" />
              {compareIds.length < 2 ? "Noch 1 wählen" : "Vergleichen"}
            </button>
            <button
              type="button"
              onClick={() => setCompareIds([])}
              aria-label="Auswahl leeren"
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.12)", color: "white" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
