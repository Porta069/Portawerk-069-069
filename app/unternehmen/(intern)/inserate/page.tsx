"use client";

// ─── Inserate-Verwaltung (Arbeitgeber) ───────────────────────────────────────
// Anlegen und Bearbeiten von Job-Inseraten inklusive Matching-Kriterien:
// Für jede Katalogfrage kann der Betrieb eine Wunsch-Antwort hinterlegen —
// als Einzelwert ODER Range (z. B. Erfahrung 6–10) — und eine Gewichtung 1–5.
// Score eines Kandidaten = 100 × (1 − Σ(Gewicht × Differenz) / Σ(Gewicht × maxDifferenz)).
// Antworten innerhalb der Range kosten nichts; außerhalb zählt der Abstand zur
// nächstgelegenen Grenze.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Loader2, Pencil, Archive, FileText, Scale, ChevronLeft,
  AlertCircle, Check, Users, Sparkles, Bot, AlertTriangle,
} from "lucide-react";
import {
  listMyJobs, saveJob, archiveJob,
  MONTAGE_OPTIONEN,
} from "@/lib/employerService";
import { GEWERKE } from "@/lib/constants";
import AnforderungsEditor, { LEERE_ANFORDERUNG } from "@/app/components/employer/AnforderungsEditor";
import type {
  EmployerJob, EmployerJobInput, Anforderungsprofil,
} from "@/lib/types";

// ── Kleine Bausteine im Stil des Bereichs ────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10.5px] font-bold uppercase tracking-[0.16em] mb-3"
      style={{ color: "rgba(26,26,46,0.45)" }}
    >
      {children}
    </p>
  );
}

function Field({
  label,
  children,
  grow = false,
}: {
  label: string;
  children: React.ReactNode;
  grow?: boolean;
}) {
  return (
    <label className={`block ${grow ? "flex-1 min-w-[180px]" : ""}`}>
      <span className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.6)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1.5px solid #E9E7E1",
  background: "white",
};

const inputClass =
  "w-full rounded-xl text-primary text-[14.5px] px-3.5 py-2.5 outline-none transition-colors focus:border-accent placeholder:text-primary/25";

/** Segment-Auswahl (z. B. Ja / Nein / Egal). */
function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="inline-flex rounded-full p-1 gap-1"
      style={{ background: "rgba(26,26,46,0.05)" }}
    >
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className="rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors"
          style={{
            background: value === o.value ? "#1A1A2E" : "transparent",
            color: value === o.value ? "white" : "rgba(26,26,46,0.55)",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Kriterien-Editor ─────────────────────────────────────────────────────────

const EMPTY: EmployerJobInput = {
  title: "",
  gewerk: GEWERKE[0],
  description: "",
  city: "",
  montage: MONTAGE_OPTIONEN[0],
  fahrzeitIstArbeitszeit: true,
  startpunkt: "Betrieb",
  startText: "Ab sofort",
  status: "ACTIVE",
};

function JobEditor({
  job,
  onDone,
  onCancel,
}: {
  job: EmployerJob | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<EmployerJobInput>(() =>
    job
      ? {
          title: job.title,
          gewerk: job.gewerk,
          description: job.description,
          city: job.city,
          salaryMin: job.salaryMin ?? undefined,
          salaryMax: job.salaryMax ?? undefined,
          montage: job.montage || MONTAGE_OPTIONEN[0],
          fahrzeitIstArbeitszeit: job.fahrzeitIstArbeitszeit,
          startpunkt: (job.startpunkt as "Haustür" | "Betrieb") || "Betrieb",
          urlaubstage: job.urlaubstage ?? undefined,
          startText: job.startText,
          status: job.status,
        }
      : EMPTY
  );
  const [anforderung, setAnforderung] = useState<Anforderungsprofil>(() =>
    job
      ? {
          bereiche: job.bereiche ?? [],
          berufe: job.berufe ?? [],
          ausbildungMin: job.ausbildungMin ?? null,
          aufgaben: job.aufgaben ?? [],
          aufgabenMin: job.aufgabenMin ?? 0,
          erfahrungMin: job.erfahrungMin ?? null,
          erfahrungMax: job.erfahrungMax ?? null,
          montageMin: job.montageMin ?? null,
          fuehrerscheinMin: job.fuehrerscheinMin ?? null,
          deutschMin: job.deutschMin ?? null,
          gebotenes: job.gebotenes ?? [],
          startBis: job.startBis ?? null,
          gewichte: job.gewichte ?? null,
        }
      : { ...LEERE_ANFORDERUNG }
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof EmployerJobInput>(k: K, v: EmployerJobInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Wie viele Ausschlusskriterien gesetzt sind — die Zahl steht in der
  // Kopfzeile, damit niemand versehentlich den halben Markt aussperrt.
  const ausschluesse = [
    anforderung.bereiche.length > 0,
    !!anforderung.ausbildungMin,
    anforderung.aufgabenMin > 0,
    !!anforderung.montageMin,
    !!anforderung.deutschMin,
  ].filter(Boolean).length;

  const submit = async () => {
    if (form.title.trim().length < 3) {
      setError("Bitte gib einen Titel mit mindestens 3 Zeichen an.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await saveJob(
      {
        ...form,
        bereiche: anforderung.bereiche,
        berufe: anforderung.berufe,
        ausbildungMin: anforderung.ausbildungMin ?? undefined,
        aufgaben: anforderung.aufgaben,
        aufgabenMin: anforderung.aufgabenMin,
        erfahrungMin: anforderung.erfahrungMin ?? undefined,
        erfahrungMax: anforderung.erfahrungMax ?? undefined,
        montageMin: anforderung.montageMin ?? undefined,
        fuehrerscheinMin: anforderung.fuehrerscheinMin ?? undefined,
        deutschMin: anforderung.deutschMin ?? undefined,
        gebotenes: anforderung.gebotenes,
        startBis: anforderung.startBis ?? undefined,
        gewichte: anforderung.gewichte ?? undefined,
      },
      job?.id
    );
    setBusy(false);
    if (res.ok) onDone();
    else setError(res.error);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold mb-5"
        style={{ color: "rgba(26,26,46,0.5)" }}
      >
        <ChevronLeft className="w-4 h-4" />
        Zurück zur Übersicht
      </button>

      <h1
        className="text-primary font-bold mb-1"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}
      >
        {job ? "Inserat bearbeiten" : "Neues Inserat"}
      </h1>
      <p className="text-[14.5px] mb-7" style={{ color: "rgba(26,26,46,0.55)" }}>
        Eckdaten der Stelle plus Ihre Wunsch-Antworten mit Gewichtung — daraus
        entsteht der Match-Score jedes Kandidaten.
      </p>

      <div className="space-y-6">
        {/* ── Eckdaten ── */}
        <section
          className="rounded-3xl bg-white p-5 sm:p-6"
          style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 10px 30px -24px rgba(26,26,46,0.5)" }}
        >
          <SectionTitle>Eckdaten</SectionTitle>
          <div className="space-y-4">
            <Field label="Stellentitel *">
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="z. B. Elektriker Gebäudetechnik (m/w/d)"
                className={inputClass}
                style={inputStyle}
              />
            </Field>
            <div className="flex flex-wrap gap-4">
              <Field label="Gewerk *" grow>
                <select
                  value={form.gewerk}
                  onChange={(e) => set("gewerk", e.target.value)}
                  className={inputClass}
                  style={{ ...inputStyle, appearance: "none" }}
                >
                  {GEWERKE.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </Field>
              <Field label="Einsatzort (Stadt)" grow>
                <input
                  value={form.city ?? ""}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="z. B. München"
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>
            </div>
            <Field label="Beschreibung der Stelle">
              <textarea
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                placeholder="Aufgaben, Team, Projekte — was macht diesen Job aus?"
                className={`${inputClass} resize-y`}
                style={inputStyle}
              />
            </Field>
            <div className="flex flex-wrap gap-4">
              <Field label="Gehalt von (€ brutto/Monat)" grow>
                <input
                  type="number"
                  min={0}
                  value={form.salaryMin ?? ""}
                  onChange={(e) =>
                    set("salaryMin", e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="2.800"
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>
              <Field label="Gehalt bis" grow>
                <input
                  type="number"
                  min={0}
                  value={form.salaryMax ?? ""}
                  onChange={(e) =>
                    set("salaryMax", e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="3.600"
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* ── Rahmenbedingungen ── */}
        <section
          className="rounded-3xl bg-white p-5 sm:p-6"
          style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 10px 30px -24px rgba(26,26,46,0.5)" }}
        >
          <SectionTitle>Rahmenbedingungen</SectionTitle>
          <div className="space-y-5">
            <div>
              <span className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.6)" }}>
                Montageaufkommen
              </span>
              <Segmented
                value={form.montage ?? MONTAGE_OPTIONEN[0]}
                options={MONTAGE_OPTIONEN.map((m) => ({ value: m, label: m }))}
                onChange={(v) => set("montage", v)}
              />
            </div>
            <div className="flex flex-wrap gap-x-10 gap-y-5">
              <div>
                <span className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.6)" }}>
                  Fahrzeit ist Arbeitszeit
                </span>
                <Segmented
                  value={form.fahrzeitIstArbeitszeit ? "ja" : "nein"}
                  options={[
                    { value: "ja", label: "Ja" },
                    { value: "nein", label: "Nein" },
                  ]}
                  onChange={(v) => set("fahrzeitIstArbeitszeit", v === "ja")}
                />
              </div>
              <div>
                <span className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.6)" }}>
                  Arbeitstag startet
                </span>
                <Segmented
                  value={form.startpunkt ?? "Betrieb"}
                  options={[
                    { value: "Haustür" as const, label: "an der Haustür" },
                    { value: "Betrieb" as const, label: "am Betrieb" },
                  ]}
                  onChange={(v) => set("startpunkt", v)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <Field label="Urlaubstage" grow>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={form.urlaubstage ?? ""}
                  onChange={(e) =>
                    set("urlaubstage", e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="30"
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>
              <Field label="Start" grow>
                <input
                  value={form.startText ?? ""}
                  onChange={(e) => set("startText", e.target.value)}
                  placeholder="Ab sofort"
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* ── Matching-Kriterien ── */}
        <section
          className="rounded-3xl bg-white p-5 sm:p-6"
          style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 10px 30px -24px rgba(26,26,46,0.5)" }}
        >
          <div className="flex items-start justify-between gap-4 mb-1">
            <SectionTitle>Matching-Kriterien</SectionTitle>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em]"
              style={{ background: "rgba(232,168,56,0.14)", color: "#B47B18" }}
            >
              <Scale className="w-3 h-3" />
              {ausschluesse} {ausschluesse === 1 ? "Ausschluss" : "Ausschlüsse"}
            </span>
          </div>
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: "rgba(26,26,46,0.55)" }}>
            Dieselben Angaben, die Handwerker bei der Registrierung machen. Rot
            markierte Felder blenden das Inserat bei allen aus, die sie nicht
            erfüllen — der Rest zählt Punkte und bestimmt die Reihenfolge.
            Leer gelassen heißt überall: ist uns egal.
          </p>
          <AnforderungsEditor wert={anforderung} onChange={setAnforderung} />
        </section>

        {/* ── Status + Aktionen ── */}
        <section
          className="rounded-3xl bg-white p-5 sm:p-6"
          style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 10px 30px -24px rgba(26,26,46,0.5)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.6)" }}>
                Status
              </span>
              <Segmented
                value={form.status ?? "ACTIVE"}
                options={[
                  { value: "ACTIVE" as const, label: "Aktiv" },
                  { value: "PAUSED" as const, label: "Pausiert" },
                  { value: "DRAFT" as const, label: "Entwurf" },
                ]}
                onChange={(v) => set("status", v)}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full px-5 py-3 text-[14px] font-semibold"
                style={{ border: "1.5px solid #E0DDD6", color: "rgba(26,26,46,0.6)", background: "white" }}
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14.5px] font-bold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {job ? "Änderungen speichern" : "Inserat veröffentlichen"}
              </button>
            </div>
          </div>
          {error && (
            <p
              className="flex items-center gap-2 text-[13px] mt-4"
              style={{ color: "#B91C1C" }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}
        </section>
      </div>
    </motion.div>
  );
}

// ── Übersicht ────────────────────────────────────────────────────────────────

const STATUS_CHIP: Record<string, { label: string; bg: string; color: string }> = {
  ACTIVE: { label: "Aktiv", bg: "rgba(22,163,74,0.12)", color: "#15803D" },
  PAUSED: { label: "Pausiert", bg: "rgba(232,168,56,0.16)", color: "#8A5B0F" },
  DRAFT: { label: "Entwurf", bg: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.55)" },
};

export default function InseratePage() {
  const [jobs, setJobs] = useState<EmployerJob[] | null>(null);
  const [editing, setEditing] = useState<EmployerJob | null | "new">(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    listMyJobs().then((res) => {
      if (res.ok) setJobs(res.data);
      else setError(res.error);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleArchive = async (id: string) => {
    const res = await archiveJob(id);
    if (res.ok) load();
  };

  if (editing !== null) {
    return (
      <JobEditor
        job={editing === "new" ? null : editing}
        onDone={() => {
          setEditing(null);
          load();
        }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <h1
            className="text-primary font-bold mb-1"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)" }}
          >
            Ihre Inserate
          </h1>
          <p className="text-[15px]" style={{ color: "rgba(26,26,46,0.55)" }}>
            Stellen samt Wunsch-Antworten und Gewichtungen — die Grundlage jedes
            Match-Scores.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14.5px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
          style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.6} />
          Neues Inserat
        </button>
      </div>

      {error && (
        <div
          className="rounded-2xl px-4 py-3.5 mb-5 text-[13.5px]"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#B91C1C" }}
        >
          {error}
        </div>
      )}

      {jobs === null ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8A838" }} />
        </div>
      ) : jobs.length === 0 ? (
        <div
          className="rounded-3xl bg-white px-6 py-20 text-center"
          style={{ border: "1.5px solid #E9E7E1" }}
        >
          <FileText className="w-8 h-8 mx-auto mb-4" style={{ color: "#E8A838" }} />
          <p className="text-[18px] font-bold text-primary mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
            Noch kein Inserat
          </p>
          <p className="text-[14px] max-w-md mx-auto leading-relaxed mb-6" style={{ color: "rgba(26,26,46,0.5)" }}>
            Mit einem Inserat inklusive Gewichtungen berechnet PortaWerk für jeden
            Kandidaten einen nachvollziehbaren Match-Score — und schlägt Ihre
            Stelle passenden Handwerkern vor.
          </p>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[14.5px] font-bold"
            style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.6} />
            Erstes Inserat anlegen
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {jobs.map((job) => {
              const chip = STATUS_CHIP[job.status] ?? STATUS_CHIP.DRAFT;
              return (
                <motion.article
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-3xl bg-white p-5 sm:p-6"
                  style={{ border: "1.5px solid #E9E7E1", boxShadow: "0 10px 30px -24px rgba(26,26,46,0.5)" }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-1">
                        <h2
                          className="text-primary font-bold text-[18px] leading-snug"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {job.title}
                        </h2>
                        <span
                          className="rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em]"
                          style={{ background: chip.bg, color: chip.color }}
                        >
                          {chip.label}
                        </span>
                        {job.source !== "SELF" && (
                          <span
                            title="Von PortaWerk für Sie angelegt"
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em]"
                            style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.55)" }}
                          >
                            <Bot className="w-3 h-3" />
                            {job.source === "AI" ? "KI-angelegt" : "Von PortaWerk angelegt"}
                          </span>
                        )}
                      </div>
                      <p className="text-[13px]" style={{ color: "rgba(26,26,46,0.55)" }}>
                        {job.gewerk}
                        {job.city && ` · ${job.city}`}
                        {job.salaryMax != null &&
                          job.salaryMax > 0 &&
                          ` · ${(job.salaryMin ?? 0).toLocaleString("de-DE")}–${job.salaryMax.toLocaleString("de-DE")} €`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12.5px] font-semibold tabular-nums"
                        style={{ background: "rgba(26,26,46,0.05)", color: "rgba(26,26,46,0.65)" }}
                        title="Eingegangene Bewerbungen"
                      >
                        <Users className="w-3.5 h-3.5" style={{ color: "#E8A838" }} />
                        {job.applications ?? 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditing(job)}
                        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition-colors"
                        style={{ background: "#1A1A2E", color: "white" }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Bearbeiten
                      </button>
                      <button
                        type="button"
                        onClick={() => handleArchive(job.id)}
                        title="Inserat archivieren"
                        aria-label="Inserat archivieren"
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                        style={{ border: "1.5px solid #E0DDD6", color: "rgba(26,26,46,0.5)" }}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Anforderungsprofil in Kurzform — der Kern des Inserats */}
                  {(() => {
                    // Ausschlüsse zuerst und farblich abgesetzt: sie bestimmen,
                    // WER das Inserat überhaupt sieht.
                    const harte: string[] = [];
                    if (job.bereiche?.length) harte.push(`${job.bereiche.length} Ausbildungsbereich${job.bereiche.length > 1 ? "e" : ""}`);
                    if (job.ausbildungMin) harte.push("Mindest-Abschluss");
                    if (job.aufgabenMin > 0) harte.push(`${job.aufgabenMin} Pflicht-Aufgabenbereich${job.aufgabenMin > 1 ? "e" : ""}`);
                    if (job.montageMin) harte.push("Montagebereitschaft");
                    if (job.deutschMin) harte.push("Sprachniveau");

                    const weiche: string[] = [];
                    if (job.aufgaben?.length) weiche.push(`${job.aufgaben.length} Aufgabenbereiche`);
                    if (job.erfahrungMin || job.erfahrungMax) weiche.push("Erfahrung");
                    if (job.berufe?.length) weiche.push("Ausbildungsberuf");
                    if (job.gebotenes?.length) weiche.push(`${job.gebotenes.length} Angebote`);
                    if (job.fuehrerscheinMin) weiche.push("Führerschein");

                    if (harte.length === 0 && weiche.length === 0) {
                      return (
                        <p
                          className="inline-flex items-center gap-1.5 text-[12.5px] mt-4"
                          style={{ color: "rgba(26,26,46,0.45)" }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Kein Anforderungsprofil — alle Handwerker sehen 100 %.
                        </p>
                      );
                    }
                    return (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {harte.map((h) => (
                          <span
                            key={h}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
                            style={{ background: "rgba(185,28,28,0.08)", color: "#B91C1C" }}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {h}
                          </span>
                        ))}
                        {weiche.map((w) => (
                          <span
                            key={w}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
                            style={{ background: "rgba(232,168,56,0.1)", color: "#8A5B0F" }}
                          >
                            <Scale className="w-3 h-3" />
                            {w}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
