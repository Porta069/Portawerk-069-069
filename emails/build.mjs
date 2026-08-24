// ─── Generator für die Transaktionsmails ─────────────────────────────────────
// Erzeugt aus emails/inhalte.mjs:
//   emails/vorlagen/<slug>-<du|sie>.html   versandfertig, mit {{platzhaltern}}
//   emails/vorschau/<slug>.html            beide Fassungen untereinander
//   emails/pdf/<slug>.pdf                  daraus gedruckt, zur Freigabe
//
// Alles aus einer Quelle, damit die neun Mails garantiert denselben Stil haben.
// Kein Framework: E-Mail-Clients verstehen weder Flexbox noch Grid, deshalb
// Tabellen und ausschliesslich Inline-Styles.

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { MAILS } from "./inhalte.mjs";

const HIER = dirname(fileURLToPath(import.meta.url));
const WURZEL = join(HIER, "..");

// ── Markenwerte ──────────────────────────────────────────────────────────────
const GOLD = "#F9AD07";
const PETROL = "#115F5B";
const PETROL_DUNKEL = "#0C4643";
const TEXT = "#16302E";
const TEXT_LEISE = "#5A6E6C";
const PAPIER = "#F4F1EA";
const LINIE = "#E4E0D6";

/** Logo im Netz — muss unter dieser Adresse erreichbar sein. */
const LOGO_URL = "https://werkpair.de/images/werkpair-logo.png";
/** Fürs PDF eingebettet, damit die Vorschau auch offline stimmt. */
const LOGO_BASE64 =
  "data:image/png;base64," +
  readFileSync(join(WURZEL, "public/images/werkpair-logo.png")).toString("base64");

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── Bausteine ────────────────────────────────────────────────────────────────

function absatz(text) {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:${TEXT};">${esc(text)}</p>`;
}

function liste(punkte) {
  const zeilen = punkte
    .map(
      (p) => `<tr>
        <td width="20" valign="top" style="padding:0 0 10px;font-size:16px;line-height:1.65;color:${GOLD};">&bull;</td>
        <td style="padding:0 0 10px;font-size:15px;line-height:1.6;color:${TEXT};">${esc(p)}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px;">${zeilen}</table>`;
}

function knopf(label, href) {
  // Zweifarbig wie das Logo: goldene Fläche, petrolfarbene Schrift.
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 22px;">
    <tr>
      <td align="center" bgcolor="${GOLD}" style="border-radius:8px;">
        <a href="${href}" style="display:inline-block;padding:15px 32px;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;color:${PETROL_DUNKEL};text-decoration:none;border-radius:8px;">${esc(label)}</a>
      </td>
    </tr>
  </table>`;
}

function ersatzlink(href) {
  return `<p style="margin:0 0 22px;font-size:13px;line-height:1.6;color:${TEXT_LEISE};">
    Knopf funktioniert nicht? Kopier diese Adresse in deinen Browser:<br>
    <span style="color:${PETROL};word-break:break-all;">${href}</span>
  </p>`;
}

function kasten(text, ton) {
  const farben = {
    warnung: { bg: "#FDF4E0", rand: GOLD, schrift: "#7A5405" },
    info: { bg: "#EEF4F3", rand: PETROL, schrift: PETROL_DUNKEL },
    ablauf: { bg: "#F7F5F0", rand: LINIE, schrift: TEXT_LEISE },
  }[ton];
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px;">
    <tr>
      <td style="background:${farben.bg};border-left:4px solid ${farben.rand};padding:14px 18px;border-radius:0 6px 6px 0;">
        <p style="margin:0;font-size:14px;line-height:1.6;color:${farben.schrift};">${esc(text)}</p>
      </td>
    </tr>
  </table>`;
}

/** Kopf mit Logo — auf Weiss, darunter die zweifarbige Markenkante. */
function kopf(logo) {
  return `<tr>
    <td align="center" style="background:#FFFFFF;padding:30px 32px 24px;">
      <img src="${logo}" width="200" alt="WerkPair" style="display:block;border:0;width:200px;max-width:200px;height:auto;">
    </td>
  </tr>
  <tr>
    <td style="font-size:0;line-height:0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td width="38%" height="5" bgcolor="${GOLD}" style="font-size:0;line-height:0;">&nbsp;</td>
          <td width="62%" height="5" bgcolor="${PETROL}" style="font-size:0;line-height:0;">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function fuss(duzen) {
  const anrede = duzen
    ? "Diese E-Mail wurde automatisch versendet. Antworten auf diese Adresse werden nicht gelesen — schreib uns stattdessen an {{email_support}}."
    : "Diese E-Mail wurde automatisch versendet. Antworten auf diese Adresse werden nicht gelesen — schreiben Sie uns stattdessen an {{email_support}}.";
  const phishing = duzen
    ? "WerkPair fragt dich niemals per E-Mail oder Telefon nach deinem Passwort."
    : "WerkPair fragt Sie niemals per E-Mail oder Telefon nach Ihrem Passwort.";

  return `<tr>
    <td style="background:${PETROL};padding:26px 32px;">
      <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.72);">${esc(anrede)}</p>
      <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:${GOLD};">${esc(phishing)}</p>
      <p style="margin:0 0 14px;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.55);">
        WerkPair — eine Marke der {{firma_name}}<br>
        {{firma_strasse}}, {{firma_plz}} {{firma_ort}}<br>
        Rechtsform: {{firma_rechtsform}} &middot; Vertreten durch: {{firma_vertretung}}<br>
        Registergericht: {{firma_registergericht}} &middot; {{firma_registernummer}}<br>
        USt-IdNr.: {{firma_ustid}}
      </p>
      <p style="margin:0;font-size:12px;line-height:1.7;">
        <a href="{{link_impressum}}" style="color:rgba(255,255,255,0.8);text-decoration:underline;">Impressum</a>
        <span style="color:rgba(255,255,255,0.35);"> &nbsp;|&nbsp; </span>
        <a href="{{link_datenschutz}}" style="color:rgba(255,255,255,0.8);text-decoration:underline;">Datenschutz</a>
        <span style="color:rgba(255,255,255,0.35);"> &nbsp;|&nbsp; </span>
        <a href="{{link_agb}}" style="color:rgba(255,255,255,0.8);text-decoration:underline;">Nutzungsbedingungen</a>
      </p>
    </td>
  </tr>`;
}

// ── Eine Mail rendern ────────────────────────────────────────────────────────
function rendern(mail, variante, { logo, standalone }) {
  const f = mail[variante];
  const duzen = variante === "du";
  const betreff = mail.betreff[variante];
  const preheader = mail.preheader[variante];

  const koerper = [
    `<p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${PETROL};font-weight:bold;">${esc(f.eyebrow)}</p>`,
    `<h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;color:${PETROL_DUNKEL};font-weight:bold;">${esc(f.titel)}</h1>`,
    ...f.absaetze.map(absatz),
    f.liste ? liste(f.liste) : "",
    f.cta ? knopf(f.cta.label, f.cta.platzhalter) : "",
    f.cta ? ersatzlink(f.cta.platzhalter) : "",
    f.ablauf ? kasten(f.ablauf, "ablauf") : "",
    f.warnung ? kasten(f.warnung, "warnung") : "",
    f.hinweis ? kasten(f.hinweis, "info") : "",
    `<p style="margin:18px 0 0;font-size:15px;line-height:1.65;color:${TEXT_LEISE};">${
      duzen ? "Dein Team von WerkPair" : "Ihr Team von WerkPair"
    }</p>`,
  ].join("\n");

  const karte = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid ${LINIE};">
    ${kopf(logo)}
    <tr><td style="padding:34px 40px 30px;">${koerper}</td></tr>
    ${fuss(duzen)}
  </table>`;

  if (!standalone) return karte;

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(betreff)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPIER};">
<div style="display:none;font-size:1px;color:${PAPIER};max-height:0;overflow:hidden;">${esc(preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${PAPIER};font-family:Helvetica,Arial,sans-serif;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      ${karte}
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Freigabe-Dokument: beide Fassungen untereinander, mit Kopfzeile. */
function vorschau(mail) {
  const blocks = ["du", "sie"]
    .map((v, i) => {
      const label = v === "du" ? "Fassung für Handwerker (du)" : "Fassung für Betriebe (Sie)";
      const umbruch = i === 0 ? ' class="seitenumbruch"' : "";
      return `<tr><td align="center" style="padding:26px 16px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;">
          <tr><td style="padding:0 0 10px;font-family:Helvetica,Arial,sans-serif;">
            <span style="display:inline-block;background:${PETROL};color:#fff;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;padding:6px 12px;border-radius:4px;font-weight:bold;">${label}</span>
            <span style="font-size:12px;color:${TEXT_LEISE};margin-left:10px;">Betreff: ${esc(mail.betreff[v])}</span>
          </td></tr>
        </table>
      </td></tr>
      <tr><td align="center"${umbruch} style="padding:0 16px 20px;">${rendern(mail, v, { logo: LOGO_BASE64, standalone: false })}</td></tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>${esc(mail.name)}</title>
<style>
  @page { margin: 10mm 0; }
  /* Eine Fassung pro Seite: verkleinert, damit die Karte sicher passt. */
  @media print {
    body { zoom: 0.72; }
    .seitenumbruch { page-break-after: always; break-after: page; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${PAPIER};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${PAPIER};font-family:Helvetica,Arial,sans-serif;">
  <tr><td align="center" style="padding:30px 16px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;">
      <tr><td style="padding:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${TEXT_LEISE};">WerkPair &middot; Transaktionsmail</td></tr>
      <tr><td style="padding:0 0 18px;font-size:24px;font-weight:bold;color:${PETROL_DUNKEL};">${esc(mail.name)}</td></tr>
    </table>
  </td></tr>
  ${blocks}
  <tr><td align="center" style="padding:6px 16px 34px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;">
      <tr><td style="font-size:11px;line-height:1.7;color:${TEXT_LEISE};border-top:1px solid ${LINIE};padding-top:12px;">
        Entwurf zur Freigabe. Werte in {{doppelten Klammern}} setzt das System beim Versand ein.
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

// ── Erzeugen ─────────────────────────────────────────────────────────────────
const ordner = {
  vorlagen: join(HIER, "vorlagen"),
  vorschau: join(HIER, "vorschau"),
  pdf: join(HIER, "pdf"),
};
Object.values(ordner).forEach((d) => mkdirSync(d, { recursive: true }));

let anzahl = 0;
for (const mail of MAILS) {
  for (const v of ["du", "sie"]) {
    writeFileSync(
      join(ordner.vorlagen, `${mail.slug}-${v}.html`),
      rendern(mail, v, { logo: LOGO_URL, standalone: true }),
      "utf8"
    );
    anzahl++;
  }
  const p = join(ordner.vorschau, `${mail.slug}.html`);
  writeFileSync(p, vorschau(mail), "utf8");

  execFileSync(CHROME, [
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${join(ordner.pdf, `${mail.slug}.pdf`)}`,
    `file://${p}`,
  ], { stdio: "ignore" });

  console.log(`✓ ${mail.slug}`);
}

console.log(`\n${MAILS.length} PDFs, ${anzahl} HTML-Vorlagen erzeugt.`);
