"use client";

// ─── Partner-Einstellungen ────────────────────────────────────────────────────
// Vollständige Selbstverwaltung für Partner-Konten: persönliche Daten,
// Auszahlungsdaten, Passwort, Abmelden, Rechtliches und DSGVO (Export/Löschen).
// Gleiche Formensprache wie die Bewerber-Einstellungen (Navy-Kopf + Karten).

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, User as UserIcon, Wallet, ShieldCheck,
  Scale, Database, Loader2, Check, Copy, LogOut, Download, Trash2,
  ExternalLink, BadgeCheck, AlertTriangle, Lock,
} from "lucide-react";
import { api, partnerSession, type PublicPartner } from "@/lib/api";
import PasswordStrength from "@/app/components/PasswordStrength";
import { evaluatePassword } from "@/lib/password";
import Logo from "@/app/components/Logo";

// ── UI-Bausteine (Muster der Bewerber-Einstellungen) ──
const inputCls =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-primary text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 transition-colors placeholder:text-muted/70";
const labelCls = "block text-primary text-sm font-medium mb-1.5";

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  icon: typeof UserIcon;
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-4 p-5 sm:p-6 text-left hover:bg-[#FAF8F3] transition-colors"
      >
        <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--color-accent-soft)" }}>
          <Icon className="w-5 h-5 text-accent" strokeWidth={2} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-primary font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>{title}</span>
          <span className="block text-muted text-xs mt-0.5 truncate">{subtitle}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-border">{children}</div>
        </div>
      </div>
    </div>
  );
}

function SaveButton({ busy, done, label = "Speichern" }: { busy: boolean; done: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-full bg-accent text-primary font-bold px-6 py-3 text-sm hover:bg-amber-400 transition-colors disabled:opacity-60"
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : done ? <Check className="w-4 h-4" /> : null}
      {done ? "Gespeichert" : label}
    </button>
  );
}

function Msg({ text, kind }: { text: string; kind: "err" | "ok" }) {
  return (
    <p
      className="px-4 py-3 text-sm rounded-xl mt-4"
      style={
        kind === "err"
          ? { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#B91C1C" }
          : { background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.3)", color: "#15803D" }
      }
    >
      {text}
    </p>
  );
}

export default function PartnerSettings() {
  const router = useRouter();
  const [partner, setPartner] = useState<PublicPartner | null>(null);
  const [loadError, setLoadError] = useState(false);

  // Konto
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accBusy, setAccBusy] = useState(false);
  const [accDone, setAccDone] = useState(false);
  const [accMsg, setAccMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auszahlung
  const [iban, setIban] = useState("");
  const [holder, setHolder] = useState("");
  const [payBusy, setPayBusy] = useState(false);
  const [payDone, setPayDone] = useState(false);
  const [payMsg, setPayMsg] = useState<string | null>(null);

  // Passwort
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwDone, setPwDone] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  // Daten / Löschen
  const [exportBusy, setExportBusy] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [delPw, setDelPw] = useState("");
  const [delBusy, setDelBusy] = useState(false);
  const [delMsg, setDelMsg] = useState<string | null>(null);

  const applyPartner = useCallback((p: PublicPartner) => {
    setPartner(p);
    setName(p.name);
    setEmail(p.email ?? "");
    setPhone(p.phone);
    setIban(p.payout?.iban ?? "");
    setHolder(p.payout?.holder ?? "");
  }, []);

  const load = useCallback(() => {
    const token = partnerSession.get();
    if (!token) {
      router.replace("/verdienen/login");
      return;
    }
    setLoadError(false);
    api.partnerMe(token).then((r) => {
      if (r.ok) applyPartner(r.data);
      else if (r.status === 401) {
        partnerSession.clear();
        router.replace("/verdienen/login");
      } else setLoadError(true);
    });
  }, [router, applyPartner]);

  useEffect(() => { load(); }, [load]);

  const saveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = partnerSession.get();
    if (!token) return;
    setAccBusy(true); setAccMsg(null); setAccDone(false);
    const r = await api.partnerUpdateProfile(token, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    setAccBusy(false);
    if (r.ok) { applyPartner(r.data); setAccDone(true); setTimeout(() => setAccDone(false), 2500); }
    else setAccMsg(r.error);
  };

  const savePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = partnerSession.get();
    if (!token) return;
    setPayBusy(true); setPayMsg(null); setPayDone(false);
    const r = await api.partnerUpdatePayout(token, {
      iban: iban.replace(/\s+/g, "").toUpperCase(),
      holder: holder.trim(),
    });
    setPayBusy(false);
    if (r.ok) { applyPartner(r.data); setPayDone(true); setTimeout(() => setPayDone(false), 2500); }
    else setPayMsg(r.error);
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = partnerSession.get();
    if (!token) return;
    if (!evaluatePassword(pwNew).valid) {
      setPwMsg("Das neue Passwort erfüllt noch nicht alle Kriterien (siehe Liste).");
      return;
    }
    setPwBusy(true); setPwMsg(null); setPwDone(false);
    const r = await api.partnerChangePassword(token, pwCurrent, pwNew);
    setPwBusy(false);
    if (r.ok) {
      partnerSession.set(r.data.accessToken); // andere Geräte sind jetzt abgemeldet
      setPwCurrent(""); setPwNew("");
      setPwDone(true); setTimeout(() => setPwDone(false), 2500);
    } else setPwMsg(r.error);
  };

  const doExport = async () => {
    const token = partnerSession.get();
    if (!token) return;
    setExportBusy(true);
    const r = await api.partnerExport(token);
    setExportBusy(false);
    if (r.ok) {
      const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `portawerk-partner-daten-${partner?.slug ?? "export"}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  };

  const doDelete = async () => {
    const token = partnerSession.get();
    if (!token) return;
    setDelBusy(true); setDelMsg(null);
    const r = await api.partnerDeleteAccount(token, delPw);
    setDelBusy(false);
    if (r.ok) {
      partnerSession.clear();
      router.push("/verdienen");
    } else setDelMsg(r.error);
  };

  const doLogout = async () => {
    const token = partnerSession.get();
    if (token) await api.partnerLogout(token);
    partnerSession.clear();
    router.push("/verdienen");
  };

  const copyLink = () => {
    if (!partner) return;
    navigator.clipboard?.writeText("https://" + partner.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (!partner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-primary text-white px-6 text-center">
        {loadError ? (
          <>
            <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              Deine Einstellungen konnten nicht geladen werden.
            </p>
            <button onClick={load} className="mt-2 rounded-full bg-accent text-primary font-bold px-6 py-3 text-sm hover:bg-amber-400 transition-colors">
              Erneut versuchen
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-7 h-7 text-accent animate-spin" />
            <p className="text-white/60 text-sm">Einstellungen werden geladen …</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      {/* ── Navy-Kopf ── */}
      <div className="bg-primary pb-14">
        <div className="max-w-3xl mx-auto px-6">
          <div className="h-[68px] flex items-center justify-between">
            <Link href="/verdienen" className="flex items-center gap-2.5 group">
              <Logo height={24} variant="hell" className="transition-transform group-hover:scale-95" />
              <span className="text-white/40 text-sm hidden sm:inline ml-1">· Partner</span>
            </Link>
            <button
              onClick={doLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/5 text-sm font-medium px-4 py-2 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Abmelden
            </button>
          </div>
          <Link
            href="/verdienen/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 text-white/80 hover:text-primary hover:bg-accent hover:border-accent text-[12px] font-semibold px-3.5 py-1.5 mt-4 mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Zum Dashboard
          </Link>
          <h1 className="text-white font-bold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 4vw, 2.8rem)" }}>
            Partner-Einstellungen
          </h1>
          <p className="text-white/45 text-base mt-2">
            Deine Daten, deine Auszahlung, deine Sicherheit — alles an einem Ort.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-8 pb-16 space-y-4">
        {/* ══ Konto ══ */}
        <SectionCard icon={UserIcon} title="Konto & Kontakt" subtitle="Name, E-Mail, Telefonnummer und dein Empfehlungs-Link" defaultOpen>
          <form onSubmit={saveAccount} className="flex flex-col gap-5 mt-4">
            {/* Empfehlungs-Link (fix) */}
            <div>
              <span className={labelCls}>Dein Empfehlungs-Link</span>
              <div className="flex items-stretch rounded-xl border border-accent/40 overflow-hidden bg-white">
                <span className="flex-1 flex items-center px-4 py-3 text-primary font-semibold text-sm truncate">{partner.link}</span>
                <button type="button" onClick={copyLink} className="shrink-0 px-4 bg-accent text-primary font-semibold text-sm inline-flex items-center gap-1.5 hover:bg-amber-400 transition-colors">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "Kopiert" : "Kopieren"}
                </button>
              </div>
              <p className="text-muted text-xs mt-1.5">
                Der Link ist deine Partner-Identität und kann nicht geändert werden — er steht auf allen geteilten Karten.
              </p>
            </div>

            <div>
              <label className={labelCls} htmlFor="ps-name">Dein Name</label>
              <input id="ps-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className={labelCls} htmlFor="ps-mail">E-Mail <span className="text-muted font-normal">(optional)</span></label>
              <input id="ps-mail" type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@mail.de" />
            </div>
            <div>
              <label className={labelCls} htmlFor="ps-tel">Telefonnummer</label>
              <input id="ps-tel" type="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
              <p className="text-xs mt-1.5 inline-flex items-center gap-1.5">
                {partner.phoneVerified ? (
                  <span className="inline-flex items-center gap-1 text-[#15803D] font-medium"><BadgeCheck className="w-3.5 h-3.5" /> Nummer bestätigt</span>
                ) : (
                  <span className="text-muted">Nummer noch nicht bestätigt — bei Änderung erlischt eine Bestätigung.</span>
                )}
              </p>
            </div>

            {accMsg && <Msg text={accMsg} kind="err" />}
            <div><SaveButton busy={accBusy} done={accDone} /></div>
          </form>
        </SectionCard>

        {/* ══ Auszahlung ══ */}
        <SectionCard icon={Wallet} title="Auszahlung" subtitle="Bankverbindung für deine 100-€-Prämien">
          <form onSubmit={savePayout} className="flex flex-col gap-5 mt-4">
            <div>
              <label className={labelCls} htmlFor="ps-iban">IBAN</label>
              <input id="ps-iban" className={inputCls} value={iban} onChange={(e) => setIban(e.target.value)} placeholder="DE00 0000 0000 0000 0000 00" autoComplete="off" />
            </div>
            <div>
              <label className={labelCls} htmlFor="ps-holder">Kontoinhaber</label>
              <input id="ps-holder" className={inputCls} value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Vor- und Nachname" />
            </div>
            <p className="text-muted text-xs flex items-start gap-1.5">
              <Lock className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
              Deine Bankdaten werden ausschließlich für die Prämien-Auszahlung genutzt und nie öffentlich angezeigt.
            </p>
            {payMsg && <Msg text={payMsg} kind="err" />}
            <div><SaveButton busy={payBusy} done={payDone} /></div>
          </form>
        </SectionCard>

        {/* ══ Sicherheit ══ */}
        <SectionCard icon={ShieldCheck} title="Sicherheit" subtitle="Passwort ändern und Sitzungen verwalten">
          <form onSubmit={changePw} className="flex flex-col gap-5 mt-4">
            <div>
              <label className={labelCls} htmlFor="ps-pw-cur">Aktuelles Passwort</label>
              <input id="ps-pw-cur" type="password" className={inputCls} value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} autoComplete="current-password" />
            </div>
            <div>
              <label className={labelCls} htmlFor="ps-pw-new">Neues Passwort</label>
              <input id="ps-pw-new" type="password" className={inputCls} value={pwNew} onChange={(e) => setPwNew(e.target.value)} autoComplete="new-password" placeholder="Mind. 10 Zeichen" />
              <PasswordStrength password={pwNew} />
            </div>
            {pwMsg && <Msg text={pwMsg} kind="err" />}
            {pwDone && <Msg text="Passwort geändert. Andere Geräte wurden automatisch abgemeldet." kind="ok" />}
            <div><SaveButton busy={pwBusy} done={pwDone} label="Passwort ändern" /></div>
          </form>
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-primary text-sm font-semibold mb-1">Überall abmelden</p>
            <p className="text-muted text-xs mb-3">Meldet dich auf diesem und allen anderen Geräten ab.</p>
            <button onClick={doLogout} className="inline-flex items-center gap-2 rounded-full border border-border text-primary font-semibold px-5 py-2.5 text-sm hover:border-accent transition-colors">
              <LogOut className="w-4 h-4" /> Jetzt abmelden
            </button>
          </div>
        </SectionCard>

        {/* ══ Rechtliches ══ */}
        <SectionCard icon={Scale} title="Rechtliches" subtitle="Prämien-Bedingungen, Datenschutz, Nutzungsbedingungen, Impressum">
          <div className="mt-4 space-y-5">
            <div className="rounded-xl p-4" style={{ background: "var(--color-accent-soft)", border: "1px solid rgba(249, 173, 7,0.3)" }}>
              <p className="text-primary text-sm font-semibold mb-1.5">Deine Prämien-Bedingungen</p>
              <ul className="text-muted text-xs leading-relaxed space-y-1 list-disc list-inside">
                <li><span className="text-primary font-medium">100 € pro erfolgreicher Vermittlung</span> — fällig, sobald dein geworbener Handwerker über PortaWerk einen Job gefunden und die Einführungsphase (8 Wochen) bestanden hat.</li>
                <li>Auszahlung per Banküberweisung auf das hier hinterlegte Konto.</li>
                <li>Die Teilnahme ist kostenlos; Eigenwerbung über den eigenen Link wird nicht vergütet.</li>
              </ul>
            </div>
            <div>
              <p className="text-muted text-xs mb-3">
                Bei der Registrierung hast du eingewilligt, dass deine Daten zur Registrierung
                und Auszahlung genutzt werden. Alle Details:
              </p>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {[
                  { href: "/rechtliches#datenschutz", label: "Datenschutzerklärung" },
                  { href: "/rechtliches#nutzungsbedingungen", label: "Nutzungsbedingungen" },
                  { href: "/rechtliches#impressum", label: "Impressum" },
                  { href: "/rechtliches#cookies", label: "Cookies" },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="group flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-primary text-sm font-medium hover:border-accent transition-colors">
                    {l.label}
                    <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ══ Daten & Konto (DSGVO) ══ */}
        <SectionCard icon={Database} title="Deine Daten" subtitle="Datenexport (DSGVO) und Konto löschen">
          <div className="mt-4 space-y-6">
            <div>
              <p className="text-primary text-sm font-semibold mb-1">Datenexport</p>
              <p className="text-muted text-xs mb-3">
                Lade alle Daten herunter, die wir zu deinem Partner-Konto gespeichert haben
                (Konto, Empfehlungen, Link-Klicks) — als JSON-Datei.
              </p>
              <button onClick={doExport} disabled={exportBusy} className="inline-flex items-center gap-2 rounded-full border border-border text-primary font-semibold px-5 py-2.5 text-sm hover:border-accent transition-colors disabled:opacity-60">
                {exportBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Daten herunterladen
              </button>
            </div>
            <div className="pt-5 border-t border-border">
              <p className="text-primary text-sm font-semibold mb-1">Konto endgültig löschen</p>
              <p className="text-muted text-xs mb-3">
                Löscht dein Partner-Konto samt Empfehlungs-Historie unwiderruflich.
                Dein Link <span className="text-primary font-medium">{partner.link}</span> funktioniert danach nicht mehr;
                offene, noch nicht ausgezahlte Prämien verfallen.
              </p>
              <button onClick={() => { setShowDelete(true); setDelMsg(null); setDelPw(""); }} className="inline-flex items-center gap-2 rounded-full font-semibold px-5 py-2.5 text-sm transition-colors" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.35)", color: "#B91C1C" }}>
                <Trash2 className="w-4 h-4" /> Konto löschen
              </button>
            </div>
          </div>
        </SectionCard>

        <p className="text-muted text-xs text-center pt-4">Made in Germany 🇩🇪 · PortaWerk Partner-Programm</p>
      </div>

      {/* ══ Lösch-Bestätigung ══ */}
      <AnimatePresence>
        {showDelete && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={() => setShowDelete(false)} />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white rounded-2xl border border-border shadow-2xl p-7 max-w-sm w-full"
            >
              <span className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.08)" }}>
                <AlertTriangle className="w-5 h-5" style={{ color: "#B91C1C" }} strokeWidth={2} />
              </span>
              <h3 className="text-primary font-bold text-xl mb-2 text-center" style={{ fontFamily: "var(--font-display)" }}>Konto wirklich löschen?</h3>
              <p className="text-muted text-sm mb-5 text-center">
                Das kann nicht rückgängig gemacht werden. Bestätige mit deinem Passwort.
              </p>
              <input
                type="password"
                value={delPw}
                onChange={(e) => setDelPw(e.target.value)}
                placeholder="Dein Passwort"
                autoComplete="current-password"
                className={inputCls}
              />
              {delMsg && <Msg text={delMsg} kind="err" />}
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowDelete(false)} className="flex-1 rounded-full border border-border text-primary font-semibold py-3 text-sm hover:border-accent transition-colors">
                  Abbrechen
                </button>
                <button
                  onClick={doDelete}
                  disabled={!delPw || delBusy}
                  className="flex-1 rounded-full font-semibold py-3 text-sm transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  style={{ background: "#B91C1C", color: "#fff" }}
                >
                  {delBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Endgültig löschen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
