"use client";

// ─── Merkliste ────────────────────────────────────────────────────────────────
// Die im Profil gespeicherten Stellen (Herz auf der Stellenkarte). Von hier
// aus geht alles weiter wie in der Jobbörse: Details ansehen, vergleichen,
// bewerben — oder wieder entfernen.

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Loader2, ArrowRight, Send, Check, X, GitCompareArrows,
} from "lucide-react";
import { listFavorites, setFavorite, applyToJob, getWorkLocations } from "@/lib/jobsService";
import type { Job, WorkLocation } from "@/lib/types";
import JobCard from "@/app/components/dashboard/JobCard";
import JobDetailDialog from "@/app/components/dashboard/JobDetailDialog";
import CompareDialog from "@/app/components/dashboard/CompareDialog";

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
      style={{ background: "#0C3330", color: "white", fontFamily: "var(--font-display)" }}
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

  return (
    <div>
      <h1
        className="text-primary font-bold mb-1"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)" }}
      >
        Deine Merkliste
      </h1>
      <p className="text-[15px] mb-7" style={{ color: "rgba(12, 51, 48,0.55)" }}>
        Gespeicherte Stellen aus der Jobbörse — vergleichen, ansehen, bewerben.
      </p>

      {jobs === null ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#F9AD07" }} />
        </div>
      ) : jobs.length === 0 ? (
        <div
          className="rounded-3xl bg-white px-6 py-16 text-center"
          style={{ border: "1.5px solid #E4DFD3" }}
        >
          <Heart className="w-7 h-7 mx-auto mb-4" style={{ color: "#F9AD07" }} />
          <p className="text-[16px] font-bold text-primary mb-1.5">Noch nichts gemerkt</p>
          <p className="text-[13.5px] mb-6 max-w-sm mx-auto leading-relaxed" style={{ color: "rgba(12, 51, 48,0.5)" }}>
            Tipp in der Jobbörse auf das Herz einer Stelle — sie landet dann hier
            in deinem Profilbereich.
          </p>
          <Link
            href="/dashboard/jobboerse"
            className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold"
            style={{ background: "#F9AD07", color: "#0C3330", fontFamily: "var(--font-display)" }}
          >
            Zur Jobbörse
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        <>
          <p className="text-[13px] mb-4" style={{ color: "rgba(12, 51, 48,0.45)" }}>
            {jobs.length} {jobs.length === 1 ? "gemerkte Stelle" : "gemerkte Stellen"}
          </p>
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
            style={{ background: "#0C3330", boxShadow: "0 20px 50px -20px rgba(12, 51, 48,0.8)" }}
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
              style={{ background: "#F9AD07", color: "#0C3330", fontFamily: "var(--font-display)" }}
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
