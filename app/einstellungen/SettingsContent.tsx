"use client";

// ─── Einstellungen / Profil (Bewerber) ────────────────────────────────────────
// Konto, Profil-Antworten, Sicherheit, Sprache, Hilfe, Rechtliches, Daten.
// Design orientiert sich an der Mainpage (Navy/Gold, Playfair + Inter).

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, User as UserIcon, ListChecks, ShieldCheck,
  Languages, LifeBuoy, Scale, Database, LogOut, Loader2, Check, Eye, EyeOff,
  Download, Trash2, Mail, ChevronDown, ChevronRight, Monitor, MapPin, AlertCircle,
} from "lucide-react";
import WorkLocationsMap from "@/app/components/WorkLocationsMapDynamic";
import AvatarUpload from "@/app/components/AvatarUpload";
import type { WorkLocation } from "@/lib/types";
import { useAuth } from "@/app/context/AuthContext";
import { useI18n, LANGUAGES, type Lang } from "@/lib/i18n";
import { api, type AuthSession, type PublicUser } from "@/lib/api";
import {
  getKatalog,
  bereichVon,
  bereichWechseln,
  LEERES_PROFIL,
  type Katalog,
  type Handwerkerprofil,
} from "@/lib/catalogService";
import { evaluatePassword } from "@/lib/password";
import { matchingSections, type SettingsSectionId } from "@/lib/settingsSearch";
import PasswordStrength from "@/app/components/PasswordStrength";
import { Field, PrimaryButton } from "@/app/components/ui";
import Logo from "@/app/components/Logo";

type T = (key: string) => string;

const SECTION_META: { id: SettingsSectionId; icon: typeof UserIcon }[] = [
  { id: "account", icon: UserIcon },
  { id: "orte", icon: MapPin },
  { id: "answers", icon: ListChecks },
  { id: "security", icon: ShieldCheck },
  { id: "language", icon: Languages },
  { id: "help", icon: LifeBuoy },
  { id: "legal", icon: Scale },
  { id: "data", icon: Database },
];

function SectionCard({
  id, title, desc, icon: Icon, children, open, onToggle,
}: {
  id: string; title: string; desc: string; icon: typeof UserIcon;
  children: React.ReactNode; open: boolean; onToggle: () => void;
}) {
  return (
    <div id={id} className="bg-white scroll-mt-24" style={{ border: "1px solid #DFE3E0" }}>
      <button onClick={onToggle} className="w-full flex items-center gap-4 px-6 py-5 text-left">
        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(249, 173, 7,0.1)" }}>
          <Icon className="w-5 h-5" style={{ color: "#F9AD07" }} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-primary font-bold" style={{ fontFamily: "var(--font-display)" }}>{title}</p>
          <p className="text-[13px]" style={{ color: "#5F6F6A" }}>{desc}</p>
        </div>
        {open ? <ChevronDown className="w-5 h-5 text-muted" /> : <ChevronRight className="w-5 h-5 text-muted" />}
      </button>
      {open && <div className="px-6 pb-6 pt-1" style={{ borderTop: "1px solid #EFF2F0" }}>{children}</div>}
    </div>
  );
}

function Msg({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <p className="text-sm mt-3 flex items-center gap-1.5" style={{ color: ok ? "#16A34A" : "#EF4444" }}>
      {ok && <Check className="w-3.5 h-3.5" strokeWidth={3} />}{children}
    </p>
  );
}

// ── Konto ─────────────────────────────────────────────────────────────────────
function AccountSection({ token, t, user, setUser }: { token: string; t: T; user: PublicUser; setUser: (u: PublicUser) => void }) {
  const [fn, setFn] = useState(user.firstName);
  const [ln, setLn] = useState(user.lastName);
  const [ph, setPh] = useState(user.phone);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [emailPw, setEmailPw] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const dirty = fn !== user.firstName || ln !== user.lastName || ph !== user.phone;

  const save = async () => {
    setSaving(true); setMsg(null);
    const res = await api.updateProfile(token, { firstName: fn, lastName: ln, phone: ph });
    setSaving(false);
    if (res.ok) { setUser(res.data); setMsg({ ok: true, text: t("btn.saved") }); }
    else setMsg({ ok: false, text: res.error });
  };
  const changeEmail = async () => {
    setEmailBusy(true); setEmailMsg(null);
    const res = await api.changeEmail(token, emailPw, newEmail);
    setEmailBusy(false);
    if (res.ok) { setUser(res.data); setNewEmail(""); setEmailPw(""); setEmailMsg({ ok: true, text: t("btn.saved") }); }
    else setEmailMsg({ ok: false, text: res.error });
  };

  const saveAvatar = async (dataUrl: string | null) => {
    const res = await api.updateProfile(token, { avatar: dataUrl ?? "" });
    if (res.ok) setUser(res.data);
  };

  return (
    <div className="pt-3 space-y-5">
      {/* Profilbild */}
      <AvatarUpload value={user.avatar} onChange={saveAvatar} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t("field.firstName")} value={fn} onChange={setFn} />
        <Field label={t("field.lastName")} value={ln} onChange={setLn} />
      </div>
      <Field label={t("field.phone")} type="tel" value={ph} onChange={setPh} />
      <div className="flex items-center gap-3">
        <PrimaryButton onClick={save} disabled={!dirty} loading={saving}>{t("btn.save")}</PrimaryButton>
        {msg && <Msg ok={msg.ok}>{msg.text}</Msg>}
      </div>

      <div className="pt-5 mt-2" style={{ borderTop: "1px solid #EFF2F0" }}>
        <p className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-1" style={{ color: "rgba(12, 51, 48,0.45)" }}>{t("field.email")}</p>
        <p className="text-sm mb-3" style={{ color: "#5F6F6A" }}>{user.email}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("btn.changeEmail")} type="email" value={newEmail} onChange={setNewEmail} placeholder="neu@beispiel.de" />
          <Field label={t("field.password")} type="password" value={emailPw} onChange={setEmailPw} />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={changeEmail} disabled={!newEmail || !emailPw || emailBusy}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
            style={{ background: "#0C3330", color: "white", fontFamily: "var(--font-display)" }}>
            {emailBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}{t("btn.changeEmail")}
          </button>
          {emailMsg && <Msg ok={emailMsg.ok}>{emailMsg.text}</Msg>}
        </div>
      </div>

      {/* Verifizierungs-Status */}
      <div className="pt-5 mt-2" style={{ borderTop: "1px solid #EFF2F0" }}>
        <p className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-3" style={{ color: "rgba(12, 51, 48,0.45)" }}>Verifizierung</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {([["E-Mail", user.emailVerified], ["Telefon", user.phoneVerified]] as const).map(([lbl, ok]) => (
            <div key={lbl} className="flex items-center gap-2 px-3 py-2.5 text-sm" style={{ border: "1px solid #DFE3E0", color: ok ? "#16A34A" : "rgba(12, 51, 48,0.6)" }}>
              {ok ? <Check className="w-4 h-4" strokeWidth={3} /> : <AlertCircle className="w-4 h-4" style={{ color: "#F9AD07" }} />}
              {lbl}: {ok ? "bestätigt" : "offen"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Profil-Antworten ──────────────────────────────────────────────────────────
// Dieselben zehn Fragen wie in der Registrierung. Wer sie hier nachschärft,
// verändert unmittelbar, welche Stellen er überhaupt zu sehen bekommt —
// deshalb steht der Hinweis dabei und nicht im Kleingedruckten.
function AnswersSection({ token, t }: { token: string; t: T }) {
  const [profil, setProfil] = useState<Handwerkerprofil>(LEERES_PROFIL);
  const [katalog, setKatalog] = useState<Katalog | null>(null);
  const [base, setBase] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [exp, kat] = await Promise.all([api.exportData(token), getKatalog()]);
      if (!active) return;
      if (exp.ok) {
        const pd = (exp.data.onboardingAnswers ?? {}) as Record<string, unknown>;
        setBase(pd);
        // Der Wizard legt das Profil unter einem Schritt-Schlüssel ab, ältere
        // Speicherungen direkt unter `profil` — beide Wege lesen.
        const ausSchritt = Object.values(pd).find(
          (v) => !!v && typeof v === "object" && "profil" in (v as object)
        ) as { profil?: Handwerkerprofil } | undefined;
        const gefunden = (pd.profil as Handwerkerprofil | undefined) ?? ausSchritt?.profil;
        if (gefunden) setProfil({ ...LEERES_PROFIL, ...gefunden });
      }
      if (kat.ok) setKatalog(kat.data);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [token]);

  const save = async () => {
    setSaving(true); setMsg(null);
    // Frischen Stand holen, damit z. B. Arbeitsorte nicht überschrieben werden.
    const cur = await api.exportData(token);
    const fresh = (cur.ok ? (cur.data.onboardingAnswers ?? base) : base) as Record<string, unknown>;
    const res = await api.updateProfile(token, { profileData: { ...fresh, profil } });
    setSaving(false);
    if (res.ok) setBase(fresh);
    setMsg(res.ok ? { ok: true, text: t("btn.saved") } : { ok: false, text: res.error });
  };

  if (loading || !katalog) {
    return <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#F9AD07" }} /></div>;
  }

  const bereich = bereichVon(katalog, profil.bereich);
  const set = (p: Partial<Handwerkerprofil>) => setProfil((v) => ({ ...v, ...p }));

  const Chips = ({
    optionen,
    gewaehlt,
    onToggle,
    max,
  }: {
    optionen: { value: string; label: string }[];
    gewaehlt: string[];
    onToggle: (v: string) => void;
    max?: number;
  }) => (
    <div className="flex flex-wrap gap-1.5">
      {optionen.map((o) => {
        const an = gewaehlt.includes(o.value);
        const gesperrt = !an && max != null && gewaehlt.length >= max;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => !gesperrt && onToggle(o.value)}
            aria-pressed={an}
            className="rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors"
            style={{
              background: an ? "#0C3330" : "#FFFFFF",
              border: `1.5px solid ${an ? "#0C3330" : "#E4DFD3"}`,
              color: an ? "#FFFFFF" : "rgba(12, 51, 48,0.65)",
              opacity: gesperrt ? 0.4 : 1,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );

  const Zeile = ({ titel, children }: { titel: string; children: React.ReactNode }) => (
    <div>
      <p className="text-[13px] font-semibold text-primary mb-2">{titel}</p>
      {children}
    </div>
  );

  const auswahl = (
    wert: string | null,
    optionen: { value: string; label: string }[],
    onChange: (v: string) => void
  ) => (
    <select
      value={wert ?? ""}
      onChange={(e) => onChange(e.target.value)}
      style={{
        border: "1.5px solid #E4DFD3", borderRadius: 12, padding: "8px 12px",
        fontSize: 13.5, background: "#fff", color: "#0C3330", minWidth: 220,
      }}
    >
      <option value="" disabled>Bitte wählen</option>
      {optionen.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );

  return (
    <div className="pt-3 space-y-7">
      <p className="text-[13px] leading-relaxed" style={{ color: "rgba(12, 51, 48,0.55)" }}>
        Diese Angaben entscheiden, welche Stellen dir angezeigt werden. Änderst
        du sie, ändert sich sofort deine Jobbörse.
      </p>

      <Zeile titel="Ausbildungsbereich">
        {auswahl(profil.bereich, katalog.bereiche, (v) =>
          setProfil((alt) => bereichWechseln(alt, v, katalog))
        )}
      </Zeile>

      <Zeile titel="Ausbildungsstand">
        {auswahl(profil.ausbildungsstatus, katalog.ausbildungsstatus, (v) =>
          set({ ausbildungsstatus: v, ...(v === "keine" ? { beruf: null } : {}) })
        )}
      </Zeile>

      {bereich && profil.ausbildungsstatus && profil.ausbildungsstatus !== "keine" && (
        <Zeile titel="Ausbildungsberuf">
          {auswahl(profil.beruf, bereich.berufe, (v) => set({ beruf: v }))}
        </Zeile>
      )}

      {bereich && (
        <Zeile titel="Aufgabenbereiche mit Erfahrung">
          <Chips
            optionen={bereich.aufgaben}
            gewaehlt={profil.aufgaben}
            onToggle={(v) =>
              set({
                aufgaben: profil.aufgaben.includes(v)
                  ? profil.aufgaben.filter((x) => x !== v)
                  : [...profil.aufgaben, v],
              })
            }
          />
        </Zeile>
      )}

      <Zeile titel="Berufserfahrung">
        {auswahl(profil.erfahrung, katalog.erfahrung, (v) => set({ erfahrung: v }))}
      </Zeile>

      <Zeile titel={`Was dir wichtig ist (bis zu ${katalog.prioritaetenMax})`}>
        <Chips
          optionen={katalog.prioritaeten}
          gewaehlt={profil.prioritaeten}
          max={katalog.prioritaetenMax}
          onToggle={(v) =>
            set({
              prioritaeten: profil.prioritaeten.includes(v)
                ? profil.prioritaeten.filter((x) => x !== v)
                : [...profil.prioritaeten, v],
            })
          }
        />
      </Zeile>

      <Zeile titel="Montagebereitschaft">
        {auswahl(profil.montage, katalog.montage, (v) => set({ montage: v }))}
      </Zeile>

      <Zeile titel="Führerschein">
        {auswahl(profil.fuehrerschein, katalog.fuehrerschein, (v) => set({ fuehrerschein: v }))}
      </Zeile>

      <Zeile titel="Deutschkenntnisse">
        {auswahl(profil.deutsch, katalog.deutsch, (v) => set({ deutsch: v }))}
      </Zeile>

      <Zeile titel="Gewünschter Start">
        {auswahl(profil.start, katalog.start, (v) => set({ start: v }))}
      </Zeile>

      <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid #EFF2F0" }}>
        <PrimaryButton onClick={save} loading={saving}>{t("btn.save")}</PrimaryButton>
        {msg && <Msg ok={msg.ok}>{msg.text}</Msg>}
      </div>
    </div>
  );
}

// ── Arbeitsorte ───────────────────────────────────────────────────────────────
function OrteSection({ token, t }: { token: string; t: T }) {
  const [locs, setLocs] = useState<WorkLocation[]>([]);
  const [base, setBase] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    api.exportData(token).then((exp) => {
      if (!active) return;
      if (exp.ok) {
        const pd = (exp.data.onboardingAnswers ?? {}) as Record<string, { workLocations?: WorkLocation[] }>;
        setBase(pd);
        setLocs(pd["3"]?.workLocations ?? []);
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [token]);

  const save = async () => {
    setSaving(true); setMsg(null);
    // Frischen Stand holen, damit andere Bereiche nicht überschrieben werden.
    const cur = await api.exportData(token);
    const fresh = (cur.ok ? (cur.data.onboardingAnswers ?? base) : base) as Record<string, unknown>;
    const profileData = { ...fresh, "3": { ...((fresh["3"] as object) || {}), workLocations: locs } };
    const res = await api.updateProfile(token, { profileData });
    setSaving(false);
    if (res.ok) setBase(fresh);
    setMsg(res.ok ? { ok: true, text: t("btn.saved") } : { ok: false, text: res.error });
  };

  if (loading)
    return <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#F9AD07" }} /></div>;

  return (
    <div className="pt-3 space-y-5">
      <WorkLocationsMap value={locs} onChange={setLocs} />
      <div className="flex items-center gap-3 pt-2">
        <PrimaryButton onClick={save} loading={saving}>{t("btn.save")}</PrimaryButton>
        {msg && <Msg ok={msg.ok}>{msg.text}</Msg>}
      </div>
    </div>
  );
}

// ── Sicherheit ────────────────────────────────────────────────────────────────
function SecuritySection({ token, t, lang, onSession, onLogout }: {
  token: string; t: T; lang: Lang; onSession: (s: AuthSession) => void; onLogout: () => void;
}) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [activity, setActivity] = useState<{ at: string; action: string; device: string | null }[] | null>(null);

  useEffect(() => {
    let active = true;
    api.activity(token).then((r) => { if (active) setActivity(r.ok ? r.data : []); });
    return () => { active = false; };
  }, [token]);

  const pw = evaluatePassword(next);
  const change = async () => {
    if (!pw.valid) return;
    setBusy(true); setMsg(null);
    const res = await api.changePassword(token, cur, next);
    setBusy(false);
    if (res.ok) { onSession(res.data); setCur(""); setNext(""); setMsg({ ok: true, text: t("btn.saved") }); }
    else setMsg({ ok: false, text: res.error });
  };
  const label: Record<string, string> = {
    "auth.login": "Anmeldung", "auth.logout": "Abmeldung",
    "user.password_changed": "Passwort geändert", "auth.login_failed": "Fehlversuch",
  };

  return (
    <div className="pt-3 space-y-8">
      <div className="space-y-4">
        <Field label={t("field.currentPassword")} type="password" value={cur} onChange={setCur} />
        <div>
          <label className="block text-[10px] uppercase tracking-[0.16em] font-semibold mb-2" style={{ color: "rgba(12, 51, 48,0.45)" }}>{t("field.newPassword")}</label>
          <div className="relative">
            <input type={show ? "text" : "password"} value={next} onChange={(e) => setNext(e.target.value)}
              className="w-full bg-white text-primary text-sm px-4 py-3.5 pr-11 outline-none"
              style={{ border: `1.5px solid ${next ? (pw.valid ? "#22C55E" : "#0C3330") : "#DFE3E0"}`, fontFamily: "var(--font-sans)" }} />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
          </div>
          <PasswordStrength password={next} />
        </div>
        <div className="flex items-center gap-3">
          <PrimaryButton onClick={change} disabled={!cur || !pw.valid} loading={busy}>{t("btn.changePassword")}</PrimaryButton>
          {msg && <Msg ok={msg.ok}>{msg.text}</Msg>}
        </div>
      </div>

      <div className="pt-6" style={{ borderTop: "1px solid #EFF2F0" }}>
        <p className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-3 flex items-center gap-2" style={{ color: "rgba(12, 51, 48,0.45)" }}>
          <Monitor className="w-3.5 h-3.5" style={{ color: "#F9AD07" }} />{t("security.activity")}
        </p>
        {activity === null ? (
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#F9AD07" }} />
        ) : activity.length === 0 ? (
          <p className="text-sm" style={{ color: "#5F6F6A" }}>{t("security.noActivity")}</p>
        ) : (
          <ul className="space-y-2">
            {activity.map((a, i) => (
              <li key={i} className="flex items-center justify-between text-[13px] px-3 py-2 gap-3" style={{ background: "#F5F2EC" }}>
                <span className="text-primary truncate">{label[a.action] ?? a.action}</span>
                <span className="flex-shrink-0" style={{ color: "#5F6F6A" }}>{new Date(a.at).toLocaleString(lang)}</span>
              </li>
            ))}
          </ul>
        )}
        <button onClick={onLogout} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold" style={{ border: "1.5px solid #DFE3E0", color: "rgba(12, 51, 48,0.7)" }}>
          <LogOut className="w-4 h-4" />{t("btn.logoutAll")}
        </button>
        <p className="text-[11px] mt-2" style={{ color: "rgba(95, 111, 106,0.7)" }}>{t("security.logoutAllHint")}</p>
      </div>
    </div>
  );
}

// ── Hilfe ─────────────────────────────────────────────────────────────────────
function HelpSection({ t }: { t: T }) {
  const faqs = [
    { q: "Wie werde ich vermittelt?", a: "Nach der Registrierung prüft unser Team dein Profil und stellt dich passenden Betrieben diskret vor — erst mit deiner Zustimmung." },
    { q: "Ist das kostenlos?", a: "Ja, für Handwerker:innen ist PortaWerk komplett kostenlos." },
    { q: "Wer sieht meine Daten?", a: "Niemand ohne deine Zustimmung. Betriebe sehen dein Profil erst, wenn du pro Betrieb zustimmst." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="pt-3">
      <p className="text-primary font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>{t("help.title")}</p>
      <div className="space-y-2">
        {faqs.map((f, i) => (
          <div key={i} style={{ border: "1px solid #DFE3E0" }}>
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-primary">
              {f.q}{open === i ? <ChevronDown className="w-4 h-4 text-muted" /> : <ChevronRight className="w-4 h-4 text-muted" />}
            </button>
            {open === i && <p className="px-4 pb-3 text-[13px] leading-relaxed" style={{ color: "#5F6F6A" }}>{f.a}</p>}
          </div>
        ))}
      </div>
      <a href="mailto:support@porta-werk.de" className="inline-flex items-center gap-2 mt-4 text-sm font-semibold" style={{ color: "#F9AD07" }}>
        <Mail className="w-4 h-4" />{t("help.contact")}
      </a>
      <p className="text-[11px] mt-3" style={{ color: "rgba(95, 111, 106,0.6)" }}>Weitere Hilfe folgt — später verbunden mit dem Admin-Bereich.</p>
    </div>
  );
}

// ── Daten ─────────────────────────────────────────────────────────────────────
function DataSection({ token, t, onDeleted }: { token: string; t: T; onDeleted: () => void }) {
  const [exporting, setExporting] = useState(false);
  const [delPw, setDelPw] = useState("");
  const [delBusy, setDelBusy] = useState(false);
  const [delErr, setDelErr] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);

  const doExport = async () => {
    setExporting(true);
    const res = await api.exportData(token);
    setExporting(false);
    if (res.ok) {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "portawerk-daten.json"; a.click();
      URL.revokeObjectURL(url);
    }
  };
  const doDelete = async () => {
    setDelBusy(true); setDelErr(null);
    const res = await api.deleteAccount(token, delPw);
    setDelBusy(false);
    if (res.ok) onDeleted();
    else setDelErr(res.error);
  };

  return (
    <div className="pt-3 space-y-6">
      <div>
        <p className="text-sm mb-3" style={{ color: "#5F6F6A" }}>{t("danger.exportHint")}</p>
        <button onClick={doExport} disabled={exporting} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold" style={{ border: "1.5px solid #DFE3E0", color: "rgba(12, 51, 48,0.75)" }}>
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}{t("btn.export")}
        </button>
      </div>
      <div className="pt-5" style={{ borderTop: "1px solid #EFF2F0" }}>
        <p className="text-sm mb-3" style={{ color: "#5F6F6A" }}>{t("danger.deleteHint")}</p>
        {!confirmDel ? (
          <button onClick={() => setConfirmDel(true)} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold" style={{ border: "1.5px solid rgba(239,68,68,0.4)", color: "#DC2626" }}>
            <Trash2 className="w-4 h-4" />{t("btn.delete")}
          </button>
        ) : (
          <div className="space-y-3 p-4" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <p className="text-sm font-medium" style={{ color: "#B91C1C" }}>{t("danger.deleteConfirm")}</p>
            <input type="password" value={delPw} onChange={(e) => setDelPw(e.target.value)} placeholder={t("field.password")}
              className="w-full bg-white text-sm px-4 py-3 outline-none" style={{ border: "1.5px solid #DFE3E0" }} />
            {delErr && <p className="text-sm" style={{ color: "#EF4444" }}>{delErr}</p>}
            <div className="flex items-center gap-3">
              <button onClick={doDelete} disabled={!delPw || delBusy} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold disabled:opacity-40" style={{ background: "#DC2626", color: "white" }}>
                {delBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}{t("btn.delete")}
              </button>
              <button onClick={() => { setConfirmDel(false); setDelPw(""); setDelErr(null); }} className="text-sm" style={{ color: "#5F6F6A" }}>{t("btn.cancel")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
export default function SettingsContent() {
  const router = useRouter();
  const { user, token, hydrated, logout, setUser, login } = useAuth();
  const { t, lang, setLang } = useI18n();

  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>("account");

  useEffect(() => {
    if (!hydrated) return;
    if (!token) { router.replace("/login"); return; }
    let active = true;
    (async () => {
      const me = await api.me(token);
      if (!active) return;
      if (!me.ok) { logout(); router.replace("/login"); return; }
      setUser(me.data);
      setReady(true);
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, token]);

  const shown = useMemo(() => matchingSections(search), [search]);
  const visible = (id: SettingsSectionId) => shown === null || shown.has(id);

  const doLogout = async () => { if (token) await api.logout(token); logout(); router.push("/"); };

  if (!hydrated || !ready || !token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F2EC" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#F9AD07" }} />
      </div>
    );
  }

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <div className="min-h-screen" style={{ background: "#F5F2EC", fontFamily: "var(--font-sans)" }}>
      <div className="sticky top-0 z-50 bg-white border-b border-[#E4DFD3]">
        <div className="max-w-3xl mx-auto px-6 h-[68px] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Logo height={24} />
          </Link>
          <button onClick={doLogout} className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(12, 51, 48,0.6)" }}>
            <LogOut className="w-4 h-4" />{t("btn.logout")}
          </button>
        </div>
      </div>

      <div className="bg-primary pb-16">
        <div className="max-w-3xl mx-auto px-6 pt-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[12px] mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
            <ArrowLeft className="w-3.5 h-3.5" />Dashboard
          </Link>
          <h1 className="text-white font-bold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 4vw, 2.8rem)" }}>{t("settings.title")}</h1>
          <p className="text-white/45 text-base mt-2">{t("settings.subtitle")}</p>
          <div className="relative mt-7">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search.placeholder")}
              className="w-full bg-white/10 text-white placeholder:text-white/40 text-sm pl-11 pr-4 py-3.5 outline-none focus:bg-white/15 transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.15)" }} />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-8 pb-16 space-y-4">
        {shown !== null && shown.size === 0 && (
          <div className="bg-white px-6 py-10 text-center" style={{ border: "1px solid #DFE3E0" }}>
            <p className="text-sm" style={{ color: "#5F6F6A" }}>{t("search.none")} &bdquo;{search}&ldquo;</p>
          </div>
        )}

        {SECTION_META.map(({ id, icon }) =>
          visible(id) ? (
            <SectionCard key={id} id={id} icon={icon} title={t(`sec.${id}`)} desc={t(`sec.${id}.desc`)}
              open={openId === id || shown !== null} onToggle={() => toggle(id)}>
              {id === "account" && <AccountSection token={token} t={t} user={user} setUser={setUser} />}
              {id === "orte" && <OrteSection token={token} t={t} />}
              {id === "answers" && <AnswersSection token={token} t={t} />}
              {id === "security" && <SecuritySection token={token} t={t} lang={lang} onSession={login} onLogout={doLogout} />}
              {id === "language" && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {LANGUAGES.map((l) => (
                    <button key={l.code} onClick={() => setLang(l.code)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all"
                      style={{ border: `1.5px solid ${lang === l.code ? "#F9AD07" : "#DFE3E0"}`, background: lang === l.code ? "rgba(249, 173, 7,0.06)" : "white", color: lang === l.code ? "#0C3330" : "rgba(12, 51, 48,0.6)" }}>
                      <span className="text-lg">{l.flag}</span>{l.label}
                      {lang === l.code && <Check className="w-4 h-4 ml-auto" style={{ color: "#F9AD07" }} strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              )}
              {id === "help" && <HelpSection t={t} />}
              {id === "legal" && (
                <div className="pt-2 grid gap-2">
                  {[
                    { href: "/rechtliches#datenschutz", label: "Datenschutzerklärung" },
                    { href: "/rechtliches#nutzungsbedingungen", label: "Nutzungsbedingungen" },
                    { href: "/rechtliches#impressum", label: "Impressum" },
                    { href: "/rechtliches#cookies", label: "Cookie-Richtlinie" },
                  ].map((x) => (
                    <Link key={x.href} href={x.href} target="_blank" className="flex items-center justify-between px-4 py-3 text-sm hover:bg-surface transition-colors" style={{ border: "1px solid #DFE3E0", color: "rgba(12, 51, 48,0.75)" }}>
                      {x.label}<ChevronRight className="w-4 h-4 text-muted" />
                    </Link>
                  ))}
                </div>
              )}
              {id === "data" && <DataSection token={token} t={t} onDeleted={() => { logout(); router.push("/"); }} />}
            </SectionCard>
          ) : null
        )}

        <p className="text-center text-[11px] pt-6" style={{ color: "rgba(12, 51, 48,0.35)" }}>🇩🇪 {t("madeIn")}</p>
      </div>
    </div>
  );
}
