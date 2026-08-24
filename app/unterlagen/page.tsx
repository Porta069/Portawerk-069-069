"use client";

// ─── Unterlagen einreichen (Datei-Uploads) ────────────────────────────────────
// Bewerbung mit CV/Foto/Zeugnissen an POST /applications. Erfordert eine
// OTP-Verifizierung (verificationToken) und eine DSGVO-Einwilligung.

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  FileText,
  X,
  Check,
  Loader2,
  ShieldCheck,
  Info,
  BadgeCheck,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";
import { GEWERKE, BUNDESLAENDER } from "@/lib/constants";
import { Field, SelectField, SectionLabel, PrimaryButton } from "@/app/components/ui";
import OtpInput from "@/app/components/OtpInput";
import Logo from "@/app/components/Logo";

const CONSENT_VERSION = "v1-2026-07";
const CONSENT_TEXT =
  "Ich willige ein, dass WerkPair meine Angaben und hochgeladenen Unterlagen zur Jobvermittlung verarbeitet. Eine Weitergabe an Betriebe erfolgt nur mit meiner ausdrücklichen Zustimmung.";

function fmtBytes(n: number) {
  return n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function FileRow({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white" style={{ border: "1px solid #E5E7EB" }}>
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ background: "rgba(232,168,56,0.1)" }}>
        <FileText className="w-4 h-4" style={{ color: "#E8A838" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-primary">{file.name}</p>
        <p className="text-[11px]" style={{ color: "#6B7280" }}>{fmtBytes(file.size)}</p>
      </div>
      <button onClick={onRemove} className="text-muted hover:text-red-500 transition-colors" aria-label="Entfernen">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function FilePicker({
  label, accept, multiple, files, onPick, onRemove, required,
}: {
  label: string; accept: string; multiple: boolean; files: File[];
  onPick: (fs: File[]) => void; onRemove: (i: number) => void; required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-2" style={{ color: "rgba(26,26,46,0.45)" }}>
        {label}{required && <span className="text-accent ml-0.5">*</span>}
      </p>
      <div
        onClick={() => ref.current?.click()}
        className="cursor-pointer flex flex-col items-center justify-center gap-2 py-7 transition-colors"
        style={{ border: "2px dashed #D1D5DB", background: "white" }}
      >
        <Upload className="w-5 h-5" style={{ color: "#9CA3AF" }} />
        <span className="text-sm" style={{ color: "rgba(26,26,46,0.7)" }}>Klicken zum Auswählen</span>
        <span className="text-[11px]" style={{ color: "#6B7280" }}>{accept}</span>
      </div>
      <input
        ref={ref} type="file" accept={accept} multiple={multiple} className="hidden"
        onChange={(e) => { if (e.target.files) onPick(Array.from(e.target.files)); e.target.value = ""; }}
      />
      {files.length > 0 && (
        <div className="mt-2 space-y-2">
          {files.map((f, i) => <FileRow key={i} file={f} onRemove={() => onRemove(i)} />)}
        </div>
      )}
    </div>
  );
}

export default function UnterlagenPage() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    firstName: "", lastName: "", birthDate: "", email: "", phone: "",
    profession: "", federalState: "",
  });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Prefill aus Konto
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone }));
  }, [user]);

  const [cv, setCv] = useState<File[]>([]);
  const [photo, setPhoto] = useState<File[]>([]);
  const [quals, setQuals] = useState<File[]>([]);
  const [consent, setConsent] = useState(false);

  // OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [verifToken, setVerifToken] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const sendOtp = async () => {
    setOtpBusy(true); setOtpError(null);
    const res = await api.requestOtp("email", form.email);
    setOtpBusy(false);
    if (res.ok) setOtpSent(true); else setOtpError(res.error);
  };
  const verify = async () => {
    if (otp.trim().length < 6) return;
    setOtpBusy(true); setOtpError(null);
    const res = await api.verifyOtp("email", form.email, otp.trim());
    setOtpBusy(false);
    if (res.ok && res.data?.verificationToken) setVerifToken(res.data.verificationToken);
    else { setOtpError(res.ok ? "Verifizierung fehlgeschlagen." : res.error); setOtp(""); }
  };

  const canSubmit =
    form.firstName && form.lastName && /^\d{4}-\d{2}-\d{2}$/.test(form.birthDate) &&
    form.email && form.phone && cv.length > 0 && consent && verifToken;

  const submit = async () => {
    if (!canSubmit || !verifToken) return;
    setSubmitting(true); setError(null);
    const fd = new FormData();
    fd.append("firstName", form.firstName);
    fd.append("lastName", form.lastName);
    fd.append("birthDate", form.birthDate);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    if (form.profession) fd.append("profession", form.profession);
    if (form.federalState) fd.append("federalState", form.federalState);
    fd.append("verificationToken", verifToken);
    fd.append("consent", "true");
    fd.append("consentText", CONSENT_TEXT);
    fd.append("consentVersion", CONSENT_VERSION);
    if (photo.length) fd.append("consentPhoto", "true");
    fd.append("cv", cv[0]);
    if (photo[0]) fd.append("photo", photo[0]);
    quals.forEach((q) => fd.append("qualifications", q));

    const res = await api.submitApplication(fd);
    setSubmitting(false);
    if (res.ok) setDone(true); else setError(res.error);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#F8F7F4" }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto flex items-center justify-center mb-8" style={{ background: "#E8A838" }}>
            <Check className="w-10 h-10 text-primary" strokeWidth={3} />
          </div>
          <h1 className="text-primary font-bold text-3xl mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Unterlagen eingegangen!
          </h1>
          <p className="text-base mb-8" style={{ color: "#6B7280" }}>
            Danke — dein Team prüft deine Unterlagen und meldet sich.
          </p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 text-sm" style={{ background: "#1A1A2E", color: "white", fontFamily: "var(--font-display)" }}>
            Zum Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F8F7F4", fontFamily: "var(--font-sans)" }}>
      <div className="sticky top-0 z-50 bg-primary">
        <div className="max-w-3xl mx-auto px-6 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo height={24} variant="hell" />
          </Link>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            <ArrowLeft className="w-3.5 h-3.5" />Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <span className="flex items-center gap-3 text-accent text-[10px] font-semibold tracking-[0.22em] uppercase mb-4">
          <span className="w-8 h-[2px] bg-accent" />Unterlagen einreichen
        </span>
        <h1 className="text-primary font-bold mb-6" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,4vw,2.5rem)" }}>
          Lade deine Unterlagen hoch
        </h1>

        {/* Dev-Hinweis */}
        <div className="flex items-start gap-3 px-4 py-3 mb-8" style={{ background: "rgba(232,168,56,0.07)", border: "1px solid rgba(232,168,56,0.25)" }}>
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#B47B18" }} />
          <p className="text-[12px] leading-relaxed" style={{ color: "rgba(26,26,46,0.7)" }}>
            <strong>Hinweis:</strong> Für den Upload ist eine E-Mail-Verifizierung nötig. Die Zustellung der Codes wird gerade eingerichtet — im Testbetrieb kann dieser Schritt noch nicht abgeschlossen werden.
          </p>
        </div>

        {/* Angaben */}
        <SectionLabel>Deine Angaben</SectionLabel>
        <div className="space-y-5 mb-10">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Vorname" value={form.firstName} onChange={set("firstName")} required />
            <Field label="Nachname" value={form.lastName} onChange={set("lastName")} required />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Geburtsdatum" type="date" value={form.birthDate} onChange={set("birthDate")} required />
            <Field label="Telefon" type="tel" value={form.phone} onChange={set("phone")} required />
          </div>
          <Field label="E-Mail" type="email" value={form.email} onChange={set("email")} required />
          <div className="grid sm:grid-cols-2 gap-5">
            <SelectField label="Gewerk" value={form.profession} onChange={set("profession")} options={GEWERKE} placeholder="optional" />
            <SelectField label="Bundesland" value={form.federalState} onChange={set("federalState")} options={BUNDESLAENDER} placeholder="optional" />
          </div>
        </div>

        {/* Dateien */}
        <SectionLabel>Dokumente</SectionLabel>
        <div className="space-y-6 mb-10">
          <FilePicker label="Lebenslauf" accept=".pdf,.doc,.docx" multiple={false} files={cv} onPick={(fs) => setCv([fs[0]])} onRemove={() => setCv([])} required />
          <FilePicker label="Profilfoto (optional)" accept=".jpg,.jpeg,.png" multiple={false} files={photo} onPick={(fs) => setPhoto([fs[0]])} onRemove={() => setPhoto([])} />
          <FilePicker label="Zeugnisse & Zertifikate (optional)" accept=".pdf,.jpg,.jpeg,.png" multiple files={quals} onPick={(fs) => setQuals((q) => [...q, ...fs])} onRemove={(i) => setQuals((q) => q.filter((_, x) => x !== i))} />
        </div>

        {/* Verifizierung */}
        <SectionLabel>E-Mail bestätigen</SectionLabel>
        <div className="bg-white p-6 mb-10" style={{ border: "1px solid #E5E7EB" }}>
          {verifToken ? (
            <p className="flex items-center gap-2 text-sm" style={{ color: "#16A34A" }}>
              <Check className="w-4 h-4" strokeWidth={3} />E-Mail bestätigt
            </p>
          ) : !otpSent ? (
            <button onClick={sendOtp} disabled={otpBusy || !form.email} className="flex items-center gap-2 font-semibold px-6 py-3 text-sm disabled:opacity-50" style={{ background: "#E8A838", color: "#1A1A2E", fontFamily: "var(--font-display)" }}>
              {otpBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}Code an E-Mail senden
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-[13px]" style={{ color: "#6B7280" }}>6-stelligen Code eingeben:</p>
              <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpError(null); }} error={!!otpError} disabled={otpBusy} />
              <button onClick={verify} disabled={otp.trim().length < 6 || otpBusy} className="flex items-center gap-2 font-semibold px-5 py-2.5 text-sm disabled:opacity-40" style={{ background: "#1A1A2E", color: "white", fontFamily: "var(--font-display)" }}>
                {otpBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Verifizieren
              </button>
            </div>
          )}
          <AnimatePresence>
            {otpError && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm mt-3" style={{ color: "#EF4444" }}>{otpError}</motion.p>}
          </AnimatePresence>
        </div>

        {/* Einwilligung */}
        <button onClick={() => setConsent((c) => !c)} className="flex items-start gap-3 w-full text-left px-4 py-4 mb-8" style={{ border: `1.5px solid ${consent ? "#E8A838" : "#E5E7EB"}`, background: consent ? "rgba(232,168,56,0.05)" : "white" }}>
          <span className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ border: `1.5px solid ${consent ? "#E8A838" : "#D1D5DB"}`, background: consent ? "#E8A838" : "white" }}>
            {consent && <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />}
          </span>
          <span className="text-sm leading-relaxed" style={{ color: "rgba(26,26,46,0.75)" }}>{CONSENT_TEXT}</span>
        </button>

        {error && (
          <div className="px-4 py-3 text-sm mb-6" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#B91C1C" }}>{error}</div>
        )}

        <div className="flex justify-end pt-6" style={{ borderTop: "1px solid #E5E7EB" }}>
          <PrimaryButton onClick={submit} disabled={!canSubmit} loading={submitting}>
            {submitting ? "Wird gesendet…" : "Unterlagen absenden"}
            {!submitting && <BadgeCheck className="w-4 h-4" />}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
