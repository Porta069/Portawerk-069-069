"use client";

// ─── Inserate-Verwaltung (Arbeitgeber) ───────────────────────────────────────
// Anlegen und Bearbeiten von Job-Inseraten inklusive Matching-Kriterien:
// Für jede Katalogfrage kann der Betrieb eine Wunsch-Antwort hinterlegen —
// als Einzelwert ODER Range (z. B. Erfahrung 6–10) — und eine Gewichtung 1–5.
// Score eines Kandidaten = 100 × (1 − Σ(Gewicht × Differenz) / Σ(Gewicht × maxDifferenz)).
// Antworten innerhalb der Range kosten nichts; außerhalb zählt der Abstand zur
// nächstgelegenen Grenze.
//
// ── Zur Gestaltung ──────────────────────────────────────────────────────────
// Die Seite sah zuvor aus wie eine Verwaltungstabelle aus einem Baukasten:
// weisse Rechtecke mit Text links und einer Knopfreihe rechts, darüber eine
// nackte Überschrift auf Papierton. Sechs Dinge lagen im Argen:
//
//   1. Kein Kopf. Jede andere Seite des Bereichs beginnt mit dem dunklen,
//      randlosen Band — hier fing die Seite mitten im Nichts an.
//   2. Die wichtigste Zahl (eingegangene Bewerbungen) war die kleinste
//      Schrift der Karte, versteckt in einer grauen Pille.
//   3. Die Karten waren reinweiss und flach: kein Verlauf, keine Kante, kein
//      Anhalt, was hier eigentlich verwaltet wird.
//   4. Die Kriterien standen als grelle rote Pillen darunter, obwohl sie das
//      Herz des Inserats sind — sie sahen aus wie Fehlermeldungen.
//   5. Der Leerzustand war ein Symbol im Kreis über zwei Zeilen Text, also
//      genau die Form, an der man jede generierte Oberfläche erkennt.
//   6. Der Editor: drei gleich aussehende weisse Kästen, Systemschrift in
//      jedem Auswahlfeld, und der Speichern-Knopf ganz unten ausser Sicht.
//
// Alle Knöpfe und Abläufe sind dieselben geblieben — nur Anordnung, Gewicht
// und Zeichnung sind neu. Am Backend wurde nichts angefasst.

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Loader2, Pencil, Archive, Scale, ChevronLeft, Wrench,
  AlertCircle, Check, Users, Sparkles, Bot, MapPin, Wallet, FileText,
  Clock3, Eye, EyeOff, PenLine, AlertTriangle } from "lucide-react";
import {
  listMyJobs, saveJob, setJobStatus,
  MONTAGE_OPTIONEN,
} from "@/lib/employerService";
import { getKatalog, type Katalog } from "@/lib/catalogService";
import { useAuth } from "@/app/context/AuthContext";
import AnforderungsEditor, { LEERE_ANFORDERUNG } from "@/app/components/employer/AnforderungsEditor";
import Auswahl from "@/app/components/dashboard/Auswahl";
import Wartezustand from "@/app/components/dashboard/Wartezustand";
import type {
  EmployerJob, EmployerJobInput, Anforderungsprofil,
  EmployerJobStatus,
} from "@/lib/types";

// ── Kleine Bausteine im Stil des Bereichs ────────────────────────────────────

/**
 * Dunkles Band über die volle Fensterbreite — dieselbe Bauform wie in der
 * Kandidatensuche nebenan. `.vollbreite` bricht aus dem zentrierten
 * Inhaltsbereich aus, `-mt-10` hebt den Abstand des Layouts auf, damit das
 * Band direkt unter der Kopfleiste sitzt und nicht ausgeschnitten wirkt.
 */
function Band({ children }: { children: React.ReactNode }) {
  return (
    <div className="vollbreite relative overflow-hidden -mt-10 mb-8" style={{ background: "#1A1A2E" }}>
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 34px)," +
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 34px)",
        }}
      />
      <div
        aria-hidden
        className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,168,56,0.2) 0%, transparent 68%)" }}
      />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-8 sm:py-10">{children}</div>
    </div>
  );
}

/**
 * Abschnitt im Editor mit vorangestellter Ordnungszahl.
 *
 * Die Ziffer ist gross und blass und sitzt in der linken Spalte: sie gliedert
 * ein langes Formular in vier überschaubare Schritte, ohne eine Zeile Text zu
 * kosten. Vorher standen vier gleich aussehende weisse Kästen untereinander —
 * man wusste beim Scrollen nie, wo man ist.
 */
function Schritt({
  nr,
  titel,
  hinweis,
  rechts,
  children,
}: {
  nr: string;
  titel: string;
  hinweis?: string;
  rechts?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="relative overflow-hidden rounded-3xl p-5 sm:p-7"
      style={{
        background: "linear-gradient(158deg, #FFFFFF 0%, #FDFCF8 62%, #F9F5EC 100%)",
        border: "1.5px solid #EDE8DC",
        boxShadow: "0 14px 36px -28px rgba(26,26,46,0.55)",
      }}
    >
      <span
        aria-hidden
        className="absolute pointer-events-none select-none font-bold leading-none"
        style={{
          right: 18,
          top: 4,
          fontFamily: "var(--font-display)",
          fontSize: 84,
          color: "rgba(26,26,46,0.035)",
        }}
      >
        {nr}
      </span>
      <div className="relative flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <p
            className="inline-flex items-center gap-2.5 text-[10.5px] font-bold uppercase tracking-[0.18em] mb-1.5"
            style={{ color: "#B47B18" }}
          >
            <span className="w-5 h-[2px] rounded-full" style={{ background: "#E8A838" }} />
            Schritt {nr}
          </p>
          <h2
            className="text-primary font-bold text-[19px] leading-snug"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {titel}
          </h2>
          {hinweis && (
            <p className="text-[13.5px] mt-1 max-w-xl leading-relaxed" style={{ color: "rgba(26,26,46,0.55)" }}>
              {hinweis}
            </p>
          )}
        </div>
        {rechts}
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}

function Field({
  label,
  hinweis,
  children,
  grow = false,
}: {
  label: string;
  hinweis?: string;
  children: React.ReactNode;
  grow?: boolean;
}) {
  return (
    <label className={`block ${grow ? "flex-1 min-w-[200px]" : ""}`}>
      <span
        className="block text-[11px] font-bold uppercase tracking-[0.13em] mb-2"
        style={{ color: "rgba(26,26,46,0.42)" }}
      >
        {label}
      </span>
      {children}
      {hinweis && (
        <span className="block text-[12px] mt-1.5" style={{ color: "rgba(26,26,46,0.42)" }}>
          {hinweis}
        </span>
      )}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1.5px solid #E9E7E1",
  background: "white",
};

const inputClass =
  "wp-feld w-full rounded-2xl text-primary text-[14.5px] px-4 py-3 placeholder:text-primary/25";

/**
 * Zahlenfeld mit Einheit am rechten Rand.
 *
 * "3.600" ohne Angabe der Einheit ist mehrdeutig — Monat, Jahr, Stunde? Die
 * Einheit steht deshalb im Feld statt in der Beschriftung, wo sie beim
 * Ausfüllen sichtbar bleibt.
 */
function Zahlfeld({
  wert,
  onChange,
  platzhalter,
  einheit,
  max,
}: {
  wert: number | undefined;
  onChange: (v: number | undefined) => void;
  platzhalter: string;
  einheit: string;
  max?: number;
}) {
  return (
    <span className="relative block">
      <input
        type="number"
        min={0}
        max={max}
        value={wert ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        placeholder={platzhalter}
        className={`${inputClass} pr-16 tabular-nums`}
        style={inputStyle}
      />
      <span
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold pointer-events-none"
        style={{ color: "rgba(26,26,46,0.35)" }}
      >
        {einheit}
      </span>
    </span>
  );
}

/**
 * Segment-Auswahl (z. B. Ja / Nein).
 *
 * Der dunkle Reiter gleitet mit `layoutId` zur neuen Stelle, statt an der
 * alten zu verschwinden und an der neuen aufzutauchen. Der Unterschied ist
 * winzig und trägt trotzdem den halben Eindruck von Wertigkeit.
 */
function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  gruppe,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  /** Eigener Name je Gruppe — sonst gleitet der Reiter zwischen den Gruppen. */
  gruppe: string;
}) {
  return (
    <div
      className="inline-flex flex-wrap rounded-full p-1 gap-1"
      style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.05)" }}
    >
      {options.map((o) => {
        const an = value === o.value;
        return (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className="relative rounded-full px-4 py-2 text-[13px] font-semibold transition-colors"
            style={{ color: an ? "white" : "rgba(26,26,46,0.55)" }}
          >
            {an && (
              <motion.span
                layoutId={`seg-${gruppe}`}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 rounded-full"
                style={{ background: "#1A1A2E" }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Kriterien-Editor ─────────────────────────────────────────────────────────

// Das Gewerk startet leer statt auf dem ersten Listeneintrag: Eine Vorauswahl
// wird beim Durchklicken uebersehen, und dann steht in jedem zweiten Inserat
// „Elektrotechnik", weil niemand hingesehen hat.
const EMPTY: EmployerJobInput = {
  title: "",
  gewerk: "",
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
          gewerke: job.gewerke ?? [],
          berufe: job.berufe ?? [],
          abschlussMin: job.abschlussMin ?? null,
          meisterErwuenscht: job.meisterErwuenscht ?? false,
          aufgaben: job.aufgaben ?? [],
          aufgabenMin: job.aufgabenMin ?? 0,
          bezeichnungTags: job.bezeichnungTags ?? [],
          erfahrungMin: job.erfahrungMin ?? null,
          erfahrungMax: job.erfahrungMax ?? null,
          fuehrungGefordert: job.fuehrungGefordert ?? false,
          budgetMonatCents: job.budgetMonatCents ?? null,
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

  // Die Gewerke kommen aus demselben Katalog, den der Handwerker bei der
  // Anmeldung durchlaeuft. Vorher stand hier eine zweite, aeltere Liste
  // ("Elektriker / Elektroniker" statt "Elektrotechnik"): Der Betrieb waehlte
  // sein Gewerk einmal hier und ein zweites Mal weiter unten bei den
  // Kriterien — und nur die zweite Wahl hat beim Matching gezaehlt.
  const [katalog, setKatalog] = useState<Katalog | null>(null);
  useEffect(() => {
    void getKatalog().then((res) => {
      if (res.ok) setKatalog(res.data);
    });
  }, []);

  const katalogGewerke = katalog?.gewerke ?? [];
  const istKatalogGewerk = katalogGewerke.some((g) => g.value === form.gewerk);

  // Ein gespeichertes Gewerk aus der alten Liste bekommt einen eigenen Eintrag.
  // Sonst stuende im Feld "Bitte waehlen" und ein unbedachtes Speichern wuerde
  // die Angabe eines bestehenden Inserats ueberschreiben.
  const gewerkOptionen = [
    ...katalogGewerke.map((g) => ({ value: g.value, label: g.label })),
    ...(form.gewerk && katalog && !istKatalogGewerk
      ? [{ value: form.gewerk, label: `${form.gewerk} (alte Bezeichnung)` }]
      : []),
  ];

  // Wie viele Muss-Kriterien gesetzt sind — die Zahl steht im Band, damit
  // niemand versehentlich den halben Markt aussperrt.
  const ausschluesse = [
    anforderung.gewerke.length > 0 || istKatalogGewerk,
    !!anforderung.abschlussMin,
    anforderung.aufgabenMin > 0,
    anforderung.fuehrungGefordert,
    anforderung.budgetMonatCents != null && !!form.salaryMax,
    !!anforderung.montageMin,
    !!anforderung.deutschMin,
  ].filter(Boolean).length;

  const submit = async () => {
    if (form.title.trim().length < 3) {
      setError("Bitte gib einen Titel mit mindestens 3 Zeichen an.");
      return;
    }
    if (!form.gewerk.trim()) {
      setError("Bitte wähle ein Gewerk — daran erkennt der Handwerker die Stelle.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await saveJob(
      {
        ...form,
        // Leer gelassene Gewerke hiessen bisher „alle Gewerke" — dann bekaeme
        // ein Fliesenleger die Elektriker-Stelle zu sehen. Das Gewerk aus den
        // Eckdaten ist die verlaessliche Untergrenze.
        //
        // Nur wenn es im Katalog steht: Ein Inserat aus der alten Liste traegt
        // dort „Elektriker / Elektroniker", und der Server weist unbekannte
        // Gewerke mit einem Fehler ab — das Speichern wuerde scheitern.
        gewerke: anforderung.gewerke.length
          ? anforderung.gewerke
          : istKatalogGewerk
            ? [form.gewerk]
            : [],
        berufe: anforderung.berufe,
        abschlussMin: anforderung.abschlussMin ?? undefined,
        meisterErwuenscht: anforderung.meisterErwuenscht,
        aufgaben: anforderung.aufgaben,
        aufgabenMin: anforderung.aufgabenMin,
        bezeichnungTags: anforderung.bezeichnungTags,
        erfahrungMin: anforderung.erfahrungMin ?? undefined,
        erfahrungMax: anforderung.erfahrungMax ?? undefined,
        fuehrungGefordert: anforderung.fuehrungGefordert,
        // Immer aus dem veroeffentlichten Rahmen neu gerechnet, nie aus dem
        // Zustand uebernommen: Wer „Gehalt bis" nachtraeglich aendert, soll
        // nicht mit einer alten Grenze weitersuchen.
        budgetMonatCents:
          anforderung.budgetMonatCents != null && form.salaryMax
            ? Math.round(form.salaryMax * 100)
            : undefined,
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
      {/* ══ Kopf ══
          Der Zurück-Weg gehört in die obere linke Ecke des Bandes, gross genug
          zum Treffen. Als graue Textzeile über der Überschrift wurde er
          übersehen — dieselbe Rückmeldung gab es schon beim Partner-Funnel. */}
      <Band>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-full pl-3 pr-5 py-2.5 mb-6 text-[14px] font-semibold transition-colors"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.16)",
            color: "rgba(255,255,255,0.86)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.16)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        >
          <ChevronLeft className="w-5 h-5" />
          Zurück zu allen Inseraten
        </button>

        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <span
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] mb-3"
              style={{ color: "#E8A838" }}
            >
              <span className="w-6 h-[2px] bg-accent" />
              {job ? "Inserat bearbeiten" : "Neues Inserat"}
            </span>
            <h1
              className="text-white font-bold leading-tight"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3.4vw, 2.7rem)" }}
            >
              {job ? job.title || "Ohne Titel" : "Stelle ausschreiben"}
            </h1>
            <p className="text-[15px] mt-2 max-w-xl" style={{ color: "rgba(255,255,255,0.5)" }}>
              Eckdaten der Stelle plus Ihre Wunsch-Antworten mit Gewichtung — daraus
              entsteht der Match-Score jedes Kandidaten.
            </p>
          </div>

          {/* Wie streng das Inserat eingestellt ist. Steht oben, weil es beim
              Ausfüllen ständig die Frage im Kopf ist — und mit einem Satz
              dabei, was die Zahl bewirkt. Eine nackte Ziffer neben dem Wort
              "Ausschlusskriterien" hat niemand verstanden. */}
          <div
            className="rounded-2xl px-5 py-4 min-w-[168px]"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <Scale className="w-4 h-4 mb-2" style={{ color: "#E8A838" }} />
            <p
              className="text-[22px] font-bold tabular-nums text-white leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {ausschluesse}
            </p>
            <p className="text-[11px] mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              {ausschluesse === 1 ? "Muss-Kriterium" : "Muss-Kriterien"}
            </p>
            <p className="text-[10.5px] mt-2 max-w-[150px] leading-snug" style={{ color: "rgba(255,255,255,0.32)" }}>
              {ausschluesse === 0
                ? "Alle Handwerker sehen die Stelle."
                : "Wer die nicht erfüllt, sieht die Stelle nicht."}
            </p>
          </div>
        </div>
      </Band>

      <div className="space-y-5">
        {/* ── 01 Eckdaten ── */}
        <Schritt
          nr="01"
          titel="Eckdaten der Stelle"
          hinweis="Das sieht der Handwerker zuerst — Titel, Ort und Bezahlung entscheiden, ob er weiterliest."
        >
          <div className="space-y-5">
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
              <Field
                label="Gewerk *"
                hinweis="Dieselben Gewerke, aus denen der Handwerker bei der Anmeldung wählt."
                grow
              >
                <Auswahl
                  wert={form.gewerk || null}
                  optionen={gewerkOptionen}
                  leerLabel={katalog ? "Bitte wählen" : "Wird geladen …"}
                  onChange={(v) => {
                    set("gewerk", v ?? "");
                    // Das gewählte Gewerk gleich als Kriterium übernehmen,
                    // solange der Betrieb dort noch nichts eingegrenzt hat.
                    // Sonst müsste er dieselbe Angabe zweimal machen.
                    setAnforderung((a) =>
                      a.gewerke.length === 0 && v ? { ...a, gewerke: [v] } : a
                    );
                  }}
                  breit
                />
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
            <Field
              label="Beschreibung der Stelle"
              hinweis="Kurz und konkret. Handwerker lesen keine Prosa — Aufgaben, Team, Projekte."
            >
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
              <Field label="Gehalt von" grow>
                <Zahlfeld
                  wert={form.salaryMin}
                  onChange={(v) => set("salaryMin", v)}
                  platzhalter="2800"
                  einheit="€ / Monat"
                />
              </Field>
              <Field label="Gehalt bis" grow>
                <Zahlfeld
                  wert={form.salaryMax}
                  onChange={(v) => set("salaryMax", v)}
                  platzhalter="3600"
                  einheit="€ / Monat"
                />
              </Field>
            </div>
          </div>
        </Schritt>

        {/* ── 02 Rahmenbedingungen ── */}
        <Schritt
          nr="02"
          titel="Rahmenbedingungen"
          hinweis="Fahrzeit und Montage sind für Handwerker oft wichtiger als hundert Euro mehr."
        >
          <div className="space-y-6">
            <div>
              <span
                className="block text-[11px] font-bold uppercase tracking-[0.13em] mb-2.5"
                style={{ color: "rgba(26,26,46,0.42)" }}
              >
                Montageaufkommen
              </span>
              <Segmented
                gruppe="montage"
                value={form.montage ?? MONTAGE_OPTIONEN[0]}
                options={MONTAGE_OPTIONEN.map((m) => ({ value: m, label: m }))}
                onChange={(v) => set("montage", v)}
              />
            </div>
            <div className="flex flex-wrap gap-x-10 gap-y-6">
              <div>
                <span
                  className="block text-[11px] font-bold uppercase tracking-[0.13em] mb-2.5"
                  style={{ color: "rgba(26,26,46,0.42)" }}
                >
                  Fahrzeit ist Arbeitszeit
                </span>
                <Segmented
                  gruppe="fahrzeit"
                  value={form.fahrzeitIstArbeitszeit ? "ja" : "nein"}
                  options={[
                    { value: "ja", label: "Ja" },
                    { value: "nein", label: "Nein" },
                  ]}
                  onChange={(v) => set("fahrzeitIstArbeitszeit", v === "ja")}
                />
              </div>
              <div>
                <span
                  className="block text-[11px] font-bold uppercase tracking-[0.13em] mb-2.5"
                  style={{ color: "rgba(26,26,46,0.42)" }}
                >
                  Arbeitstag startet
                </span>
                <Segmented
                  gruppe="startpunkt"
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
                <Zahlfeld
                  wert={form.urlaubstage}
                  onChange={(v) => set("urlaubstage", v)}
                  platzhalter="30"
                  einheit="Tage"
                  max={60}
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
        </Schritt>

        {/* ── 03 Matching-Kriterien ── */}
        <Schritt
          nr="03"
          titel="Wen Sie suchen"
          hinweis="Dieselben Angaben, die Handwerker bei der Anmeldung machen. Leer gelassen heisst überall: ist uns egal."
          rechts={
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] flex-shrink-0"
              style={{ background: "#FBF0DC", border: "1px solid rgba(232,168,56,0.35)", color: "#B47B18" }}
            >
              <Scale className="w-3 h-3" />
              {ausschluesse} × Muss
            </span>
          }
        >
          <AnforderungsEditor
            wert={anforderung}
            onChange={setAnforderung}
            gehaltBis={form.salaryMax}
          />
        </Schritt>

        {/* ── Aktionsleiste ──
            Klebt am unteren Rand statt am Ende der Seite. Bei einem Formular
            dieser Länge lag der Speichern-Knopf sonst weit ausserhalb des
            Sichtfelds, sobald man an den Kriterien arbeitete. */}
        <div className="sticky bottom-4 z-30 pt-1">
          <div
            className="flex flex-wrap items-center justify-between gap-4 rounded-3xl px-5 py-4 sm:px-6"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(10px)",
              border: "1.5px solid #EDE8DC",
              boxShadow: "0 22px 44px -26px rgba(26,26,46,0.6)",
            }}
          >
            <div>
              <span
                className="block text-[11px] font-bold uppercase tracking-[0.13em] mb-2"
                style={{ color: "rgba(26,26,46,0.42)" }}
              >
                Sichtbarkeit
              </span>
              <Segmented
                gruppe="status"
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
                className="rounded-full px-5 py-3.5 text-[14px] font-semibold transition-colors"
                style={{ border: "1.5px solid #E0DDD6", color: "rgba(26,26,46,0.6)", background: "white" }}
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[14.5px] font-bold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                style={{
                  background: "#E8A838",
                  color: "#1A1A2E",
                  fontFamily: "var(--font-display)",
                  boxShadow: "0 16px 32px -16px rgba(232,168,56,0.85)",
                }}
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={3} />}
                {job ? "Änderungen speichern" : "Inserat veröffentlichen"}
              </button>
            </div>
          </div>

          {error && (
            <p
              className="flex items-center gap-2 text-[13px] mt-3 rounded-2xl px-4 py-3"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#B91C1C" }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Übersicht ────────────────────────────────────────────────────────────────

/**
 * Die vier Abschnitte der Übersicht, in der Reihenfolge, in der sie jemanden
 * interessieren: Was läuft, was liegt halbfertig herum, was ruht, was ist weg.
 */
const ABSCHNITTE: {
  status: EmployerJobStatus;
  titel: string;
  hinweis: string;
}[] = [
  { status: "ACTIVE", titel: "Aktiv", hinweis: "für Handwerker sichtbar" },
  { status: "DRAFT", titel: "Entwürfe", hinweis: "noch nicht veröffentlicht" },
  { status: "PAUSED", titel: "Pausiert", hinweis: "vorübergehend ausgeblendet" },
  { status: "ARCHIVED", titel: "Archiv", hinweis: "eingelagert, jederzeit wiederherstellbar" },
];

const STATUS_MELDUNG: Record<EmployerJobStatus, string> = {
  ACTIVE: "Inserat ist veröffentlicht und für Handwerker sichtbar.",
  DRAFT: "Inserat liegt wieder in den Entwürfen.",
  PAUSED: "Inserat ist pausiert und vorübergehend nicht sichtbar.",
  ARCHIVED: "Inserat eingelagert. Sie finden es im Archiv wieder.",
};

/**
 * Was man mit einem Inserat im jeweiligen Zustand tun kann.
 *
 * Der frühere Zustand kannte genau eine Aktion — archivieren, ohne Rückweg.
 * Wichtig ist die Trennung von `haupt` und `neben`: Die Hauptaktion ist die,
 * die man in diesem Zustand fast immer will, und steht als gefüllter Knopf da.
 */
const AKTIONEN: Record<
  EmployerJobStatus,
  { haupt?: { status: EmployerJobStatus; label: string }; neben: { status: EmployerJobStatus; label: string; frage?: string }[] }
> = {
  DRAFT: {
    haupt: { status: "ACTIVE", label: "Veröffentlichen" },
    neben: [{ status: "ARCHIVED", label: "Einlagern" }],
  },
  ACTIVE: {
    neben: [
      { status: "PAUSED", label: "Pausieren" },
      {
        status: "ARCHIVED",
        label: "Einlagern",
        frage: "Inserat einlagern? Es ist danach nicht mehr sichtbar, bleibt aber im Archiv erhalten.",
      },
    ],
  },
  PAUSED: {
    haupt: { status: "ACTIVE", label: "Wieder aktivieren" },
    neben: [{ status: "ARCHIVED", label: "Einlagern" }],
  },
  ARCHIVED: {
    haupt: { status: "DRAFT", label: "Wiederherstellen" },
    neben: [],
  },
};

const STATUS_CHIP: Record<
  string,
  { label: string; bg: string; color: string; punkt: string; icon: typeof Eye }
> = {
  ACTIVE: { label: "Aktiv", bg: "rgba(22,163,74,0.1)", color: "#15803D", punkt: "#16A34A", icon: Eye },
  PAUSED: { label: "Pausiert", bg: "rgba(232,168,56,0.16)", color: "#8A5B0F", punkt: "#E8A838", icon: EyeOff },
  DRAFT: { label: "Entwurf", bg: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.55)", punkt: "rgba(26,26,46,0.3)", icon: PenLine },
};

/** „vor 3 Tagen“ statt eines Datums — Betriebe denken in Abständen. */
function seit(iso: string): string {
  const tage = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (!Number.isFinite(tage) || tage < 0) return "";
  if (tage === 0) return "heute geändert";
  if (tage === 1) return "gestern geändert";
  if (tage < 31) return `vor ${tage} Tagen geändert`;
  const monate = Math.floor(tage / 30);
  return `vor ${monate} Monat${monate > 1 ? "en" : ""} geändert`;
}

function InseratKarte({
  job,
  busy,
  onEdit,
  onStatus,
}: {
  job: EmployerJob;
  busy: boolean;
  onEdit: () => void;
  onStatus: (status: EmployerJobStatus) => void;
}) {
  const chip = STATUS_CHIP[job.status] ?? STATUS_CHIP.DRAFT;
  const aktionen = AKTIONEN[job.status] ?? AKTIONEN.DRAFT;
  const StatusIcon = chip.icon;
  const aktiv = job.status === "ACTIVE";
  const bewerbungen = job.applications ?? 0;

  // Muss-Kriterien zuerst und farblich abgesetzt: sie bestimmen, WER das
  // Inserat überhaupt sieht. Früher trugen sie ein Warndreieck und Rot —
  // drei davon nebeneinander lasen sich wie Fehlermeldungen. Jetzt genügt ein
  // roter Punkt; die Aussage bleibt, der Lärm ist weg.
  const harte: string[] = [];
  if (job.gewerke?.length) harte.push(`${job.gewerke.length} Gewerk${job.gewerke.length > 1 ? "e" : ""}`);
  if (job.abschlussMin) harte.push("Mindest-Abschluss");
  if (job.aufgabenMin > 0) harte.push(`${job.aufgabenMin} Pflicht-Aufgabe${job.aufgabenMin > 1 ? "n" : ""}`);
  if (job.montageMin) harte.push("Montagebereitschaft");
  if (job.deutschMin) harte.push("Sprachniveau");

  const weiche: string[] = [];
  if (job.aufgaben?.length) weiche.push(`${job.aufgaben.length} Aufgabenbereiche`);
  if (job.erfahrungMin || job.erfahrungMax) weiche.push("Erfahrung");
  if (job.berufe?.length) weiche.push("Ausbildungsberuf");
  if (job.gebotenes?.length) weiche.push(`${job.gebotenes.length} Angebote`);
  if (job.fuehrerscheinMin) weiche.push("Führerschein");

  const eckdaten = [
    { icon: Wrench, text: job.gewerk },
    job.city ? { icon: MapPin, text: job.city } : null,
    job.salaryMax != null && job.salaryMax > 0
      ? {
          icon: Wallet,
          text: `${(job.salaryMin ?? 0).toLocaleString("de-DE")}–${job.salaryMax.toLocaleString("de-DE")} €`,
        }
      : null,
  ].filter(Boolean) as { icon: typeof Wrench; text: string }[];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-3xl transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1"
      style={{
        // Warmer Verlauf statt Reinweiss — dieselbe Zeichnung wie die Kacheln
        // auf der Übersicht. Pausiert und Entwurf bleiben blasser, damit man
        // die aktiven Inserate beim Überfliegen sofort findet.
        background: aktiv
          ? "linear-gradient(158deg, #FFFFFF 0%, #FDFCF8 58%, #F8F3E8 100%)"
          : "linear-gradient(158deg, #FDFDFC 0%, #F9F8F5 100%)",
        border: `1.5px solid ${aktiv ? "#EDE8DC" : "#EBE9E4"}`,
        boxShadow: "0 14px 36px -28px rgba(26,26,46,0.55)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#E8A838";
        e.currentTarget.style.boxShadow = "0 22px 44px -24px rgba(232,168,56,0.55)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = aktiv ? "#EDE8DC" : "#EBE9E4";
        e.currentTarget.style.boxShadow = "0 14px 36px -28px rgba(26,26,46,0.55)";
      }}
    >
      {/* Goldkante oben: im Ruhezustand ein Stück, beim Überfahren läuft sie
          durch — dasselbe Detail wie bei den Kennzahlen der Übersicht. */}
      <span
        aria-hidden
        className="absolute top-0 left-0 h-[3px] transition-[width] duration-300 ease-out group-hover:!w-full"
        style={{
          width: aktiv ? "34%" : "0%",
          background: "linear-gradient(90deg, #E8A838 0%, rgba(232,168,56,0.15) 100%)",
        }}
      />

      <div className="flex flex-col sm:flex-row">
        {/* ── Inhalt ── */}
        <div className="flex-1 min-w-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <h2
              className="text-primary font-bold text-[20px] leading-snug"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {job.title}
            </h2>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em]"
              style={{ background: chip.bg, color: chip.color }}
            >
              {/* Der Punkt pulst nur bei aktiven Inseraten — er zeigt, dass
                  gerade wirklich jemand die Stelle sehen kann. */}
              <span
                className={`w-1.5 h-1.5 rounded-full ${aktiv ? "punkt-glut" : ""}`}
                style={{ background: chip.punkt }}
              />
              {chip.label}
            </span>
            {job.source !== "SELF" && (
              <span
                title="Von WerkPair für Sie angelegt"
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em]"
                style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.55)" }}
              >
                <Bot className="w-3 h-3" />
                {job.source === "AI" ? "KI-angelegt" : "Von WerkPair angelegt"}
              </span>
            )}
          </div>

          {/* Eckdaten mit Zeichen statt einer punktgetrennten Textzeile —
              beim Überfliegen erkennt man Ort und Gehalt am Symbol. */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-4">
            {eckdaten.map((e) => {
              const Icon = e.icon;
              return (
                <span
                  key={e.text}
                  className="inline-flex items-center gap-1.5 text-[13.5px]"
                  style={{ color: "rgba(26,26,46,0.6)" }}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#E8A838" }} />
                  {e.text}
                </span>
              );
            })}
          </div>

          {job.description && (
            <p
              className="text-[13.5px] leading-relaxed mb-4 max-w-2xl"
              style={{
                color: "rgba(26,26,46,0.58)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {job.description}
            </p>
          )}

          {harte.length === 0 && weiche.length === 0 ? (
            <p
              className="inline-flex items-center gap-1.5 text-[12.5px]"
              style={{ color: "rgba(26,26,46,0.45)" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Kein Anforderungsprofil — alle Handwerker sehen 100 %.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {harte.map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium"
                  style={{ background: "rgba(185,28,28,0.06)", color: "#9B2C2C" }}
                  title="Muss-Kriterium — wer das nicht erfüllt, sieht das Inserat nicht"
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#C0392B" }} />
                  {h}
                </span>
              ))}
              {weiche.map((w) => (
                <span
                  key={w}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium"
                  style={{ background: "rgba(26,26,46,0.045)", color: "rgba(26,26,46,0.62)" }}
                  title="Zählt Punkte — sperrt niemanden aus, sortiert nur die Liste"
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#E8A838" }} />
                  {w}
                </span>
              ))}
            </div>
          )}

          {job.updatedAt && (
            <p
              className="inline-flex items-center gap-1.5 text-[11.5px] mt-4"
              style={{ color: "rgba(26,26,46,0.35)" }}
            >
              <Clock3 className="w-3 h-3" />
              {seit(job.updatedAt)}
            </p>
          )}
        </div>

        {/* ── Rechte Spalte ──
            Eigener, abgesetzter Bereich statt einer Knopfreihe am Zeilenende.
            Die Bewerberzahl war zuvor die kleinste Schrift der Karte, obwohl
            sie der Grund ist, warum man hier überhaupt nachsieht. */}
        <div
          className="flex flex-row sm:flex-col items-center sm:items-stretch justify-between gap-4 p-5 sm:py-6 sm:px-6 sm:w-[220px] flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.5)",
            borderTop: "1px solid #F0EDE5",
            borderLeft: "1px solid #F0EDE5",
          }}
        >
          <div className="sm:text-center">
            <p
              className="text-[38px] font-bold tabular-nums leading-none"
              style={{
                fontFamily: "var(--font-display)",
                color: bewerbungen > 0 ? "#B47B18" : "rgba(26,26,46,0.28)",
              }}
            >
              {bewerbungen}
            </p>
            <p
              className="inline-flex items-center gap-1.5 text-[11.5px] mt-2"
              style={{ color: "rgba(26,26,46,0.45)" }}
            >
              <Users className="w-3.5 h-3.5" style={{ color: bewerbungen > 0 ? "#E8A838" : "rgba(26,26,46,0.3)" }} />
              {bewerbungen === 1 ? "Bewerbung" : "Bewerbungen"}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:w-full">
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[13.5px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
              style={{ background: "#1A1A2E", color: "white" }}
            >
              <Pencil className="w-3.5 h-3.5" />
              Bearbeiten
            </button>
            {/* Die Hauptaktion hängt am Zustand: ein Entwurf will
                veröffentlicht, ein Archiviertes wiederhergestellt werden. */}
            {aktionen.haupt && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onStatus(aktionen.haupt!.status)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[13.5px] font-bold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: "#E8A838", color: "#1A1A2E" }}
              >
                {busy ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                )}
                {aktionen.haupt.label}
              </button>
            )}
            {aktionen.neben.map((n) => (
              <button
                key={n.status}
                type="button"
                disabled={busy}
                onClick={() => {
                  // Einlagern fragt nach. Es ist die einzige Aktion, die eine
                  // laufende Stelle aus der Sicht der Handwerker nimmt.
                  if (n.frage && !window.confirm(n.frage)) return;
                  onStatus(n.status);
                }}
                title={n.label}
                aria-label={n.label}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 h-10 flex-shrink-0 text-[13px] font-medium transition-colors disabled:opacity-50"
                style={{ border: "1.5px solid #E0DDD6", color: "rgba(26,26,46,0.55)", background: "white" }}
              >
                {n.status === "ARCHIVED" ? (
                  <Archive className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
                {n.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statuszeichen als Wasserzeichen, am Rand angeschnitten. */}
      <StatusIcon
        aria-hidden
        className="absolute pointer-events-none transition-transform duration-500 group-hover:scale-110"
        style={{ left: -14, bottom: -16, width: 88, height: 88, color: "rgba(26,26,46,0.028)" }}
        strokeWidth={1.1}
      />
    </motion.article>
  );
}

export default function InseratePage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<EmployerJob[] | null>(null);
  const [editing, setEditing] = useState<EmployerJob | null | "new">(null);
  const [statusBusy, setStatusBusy] = useState<string | null>(null);
  const [hinweis, setHinweis] = useState<{ art: "ok" | "fehler"; text: string } | null>(null);
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

  // Vorher: `if (res.ok) load()` — schlug der Aufruf fehl, passierte sichtbar
  // gar nichts. Der Nutzer klickte, die Karte blieb stehen, und er hatte keine
  // Ahnung, ob es geklappt hat. Jetzt trägt jeder Ausgang eine Antwort.
  const handleStatus = async (id: string, status: EmployerJobStatus) => {
    setStatusBusy(id);
    setHinweis(null);
    const res = await setJobStatus(id, status);
    setStatusBusy(null);
    if (!res.ok) {
      setHinweis({ art: "fehler", text: res.error });
      return;
    }
    setHinweis({ art: "ok", text: STATUS_MELDUNG[status] });
    load();
  };

  const zahlen = useMemo(() => {
    if (!jobs?.length) return null;
    return {
      aktiv: jobs.filter((j) => j.status === "ACTIVE").length,
      bewerbungen: jobs.reduce((s, j) => s + (j.applications ?? 0), 0),
      ruhend: jobs.filter((j) => j.status !== "ACTIVE").length,
    };
  }, [jobs]);

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
      {/* ══ Kopf ══ */}
      <Band>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] mb-3"
              style={{ color: "#E8A838" }}
            >
              <span className="w-6 h-[2px] bg-accent" />
              {user?.companyName || "Ihr Betrieb"}
            </span>
            <h1
              className="text-white font-bold leading-tight"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3.4vw, 2.7rem)" }}
            >
              Ihre Inserate
            </h1>
            <p className="text-[15px] mt-2 max-w-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
              Jedes Inserat trägt Ihre Wunsch-Antworten und Gewichtungen — daraus
              rechnet WerkPair den Match-Score jedes Handwerkers.
            </p>

            <button
              type="button"
              onClick={() => setEditing("new")}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 mt-6 text-[15px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                background: "#E8A838",
                color: "#1A1A2E",
                fontFamily: "var(--font-display)",
                boxShadow: "0 16px 34px -16px rgba(232,168,56,0.9)",
              }}
            >
              <Plus className="w-4 h-4" strokeWidth={2.8} />
              Neues Inserat
            </button>
          </div>

          {zahlen && (
            <div className="flex flex-wrap gap-2.5">
              {[
                { icon: Eye, v: String(zahlen.aktiv), l: "Aktiv sichtbar" },
                { icon: Users, v: String(zahlen.bewerbungen), l: "Bewerbungen" },
                { icon: EyeOff, v: String(zahlen.ruhend), l: "Pausiert / Entwurf" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.l}
                    className="rounded-2xl px-4 py-3 min-w-[112px]"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  >
                    <Icon className="w-3.5 h-3.5 mb-1.5" style={{ color: "#E8A838" }} />
                    <p
                      className="text-[19px] font-bold tabular-nums text-white leading-none"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {s.v}
                    </p>
                    <p className="text-[10.5px] mt-1" style={{ color: "rgba(255,255,255,0.42)" }}>
                      {s.l}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Band>

      {error && (
        <div
          className="rounded-2xl px-4 py-3.5 mb-5 text-[13.5px]"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#B91C1C" }}
        >
          {error}
        </div>
      )}

      {jobs === null ? (
        // Skelettkarten statt eines Kringels in der Mitte: sie zeigen, wo die
        // Inserate erscheinen werden, und die Seite wirkt nicht leer.
        <div className="space-y-4">
          {(error ? [] : [0, 1]).map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl"
              style={{ height: 176, background: "#FBFAF7", border: "1.5px solid #EDEAE4" }}
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Wartezustand
          marke="Noch kein Inserat"
          titel="Hier entsteht Ihre erste Stelle"
          text="Mit Gewichtungen berechnet WerkPair für jeden Handwerker einen nachvollziehbaren Match-Score."
          icon={<FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#B47B18" }} />}
          aktion={
            <button
              type="button"
              onClick={() => setEditing("new")}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[14.5px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                background: "#E8A838",
                color: "#1A1A2E",
                fontFamily: "var(--font-display)",
                boxShadow: "0 16px 32px -16px rgba(232,168,56,0.85)",
              }}
            >
              <Plus className="w-4 h-4" strokeWidth={2.6} />
              Erstes Inserat anlegen
            </button>
          }
        />
      ) : (
        <div className="space-y-10">
          {/* Rückmeldung zur letzten Statusänderung. Ohne sie klickt man und
              weiß nicht, ob etwas passiert ist — das war der eigentliche
              Grund, warum der Archivieren-Knopf als kaputt galt. */}
          {hinweis && (
            <div
              className="flex items-start gap-2.5 rounded-2xl px-4 py-3.5"
              role="status"
              style={
                hinweis.art === "ok"
                  ? { background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.25)" }
                  : { background: "rgba(185,28,28,0.06)", border: "1px solid rgba(185,28,28,0.2)" }
              }
            >
              {hinweis.art === "ok" ? (
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={3} style={{ color: "#16A34A" }} />
              ) : (
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#B91C1C" }} />
              )}
              <p className="text-[13px]" style={{ color: hinweis.art === "ok" ? "#15803D" : "#B91C1C" }}>
                {hinweis.text}
              </p>
              <button
                type="button"
                onClick={() => setHinweis(null)}
                aria-label="Hinweis schließen"
                className="ml-auto text-[12px] flex-shrink-0"
                style={{ color: "rgba(26,26,46,0.4)" }}
              >
                schließen
              </button>
            </div>
          )}

          {/* Nach Status gruppiert statt einer langen Liste. Vorher standen
              aktive Stellen, Entwürfe und Pausiertes durcheinander, und
              Archiviertes war überhaupt nicht mehr auffindbar. */}
          {ABSCHNITTE.map((a) => {
            const teil = jobs.filter((j) => j.status === a.status);
            if (teil.length === 0) return null;
            return (
              <section key={a.status}>
                <div className="flex items-baseline gap-2.5 mb-3.5">
                  <h2
                    className="text-[15px] font-bold text-primary"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {a.titel}
                  </h2>
                  <span
                    className="text-[12.5px] tabular-nums"
                    style={{ color: "rgba(26,26,46,0.4)" }}
                  >
                    {teil.length}
                  </span>
                  <span
                    className="text-[12.5px] flex-1 min-w-0 truncate"
                    style={{ color: "rgba(26,26,46,0.45)" }}
                  >
                    {a.hinweis}
                  </span>
                </div>
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {teil.map((job) => (
                      <InseratKarte
                        key={job.id}
                        job={job}
                        busy={statusBusy === job.id}
                        onEdit={() => setEditing(job)}
                        onStatus={(s) => handleStatus(job.id, s)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
