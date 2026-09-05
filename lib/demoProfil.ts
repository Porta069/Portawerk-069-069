// ─── Beispiel-Unternehmensprofil für die Gestaltung ──────────────────────────
// NUR fürs Ansehen der Profilseite. Wird ausschliesslich über `?demo=1` im
// Entwicklungsmodus gezeigt und rührt weder Backend noch gespeicherte Daten
// an: nichts wird geladen, nichts geschrieben.
//
// Warum es das gibt: ohne Anmeldung antwortet das Backend mit 401. Die
// Profilseite hat dafür keinen Fehlerzustand — sie dreht endlos den
// Ladekringel, man sieht also gar nichts.
//
// Der Betrieb ist erfunden.

import type { EmployerProfile } from "./types";

export function demoAktiv(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV === "production") return false;
  const v = new URLSearchParams(window.location.search).get("demo");
  return v === "1" || v === "leer";
}

/** `?demo=leer` — frisch angelegtes Konto, noch nichts ausgefüllt. */
export function demoLeer(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV === "production") return false;
  return new URLSearchParams(window.location.search).get("demo") === "leer";
}

export const DEMO_PROFIL_LEER: EmployerProfile = {
  firmenname: "",
  slogan: "",
  beschreibung: "",
  gruendungsjahr: "",
  mitarbeiter: "",
  strasse: "",
  plz: "",
  ort: "",
  website: "",
  ueberUns: "",
  kontaktName: "",
  kontaktPosition: "",
  kontaktTelefon: "",
  kontaktEmail: "",
  benefits: [],
  montage: "",
  urlaubstage: "",
  logo: "",
};

export const DEMO_PROFIL: EmployerProfile = {
  firmenname: "Muster Elektrotechnik GmbH",
  slogan: "Elektrotechnik für Gewerbe und Industrie — seit drei Generationen",
  beschreibung:
    "Wir planen und bauen Schaltanlagen, Gebäudetechnik und Photovoltaik im Umkreis von 60 Kilometern. Feste Teams, kein Notdienst, jeder Monteur fährt seinen eigenen Wagen.",
  gruendungsjahr: "1968",
  mitarbeiter: "38",
  strasse: "Industriestraße 14",
  plz: "37079",
  ort: "Göttingen",
  website: "www.muster-elektrotechnik.de",
  ueberUns:
    "Angefangen hat es 1968 in einer Doppelgarage. Heute sind wir 38 Leute, davon zwölf Gesellen, die seit über zehn Jahren dabei sind.\n\nWir arbeiten fast ausschliesslich für Betriebe in der Region — kein Grossbaustellen-Geschäft, keine Wochenenden, keine Montage über Nacht. Wer bei uns anfängt, weiss morgens, wo er abends ist.",
  kontaktName: "Andrea Vogt",
  kontaktPosition: "Personalleitung",
  kontaktTelefon: "0551 1234560",
  kontaktEmail: "bewerbung@muster-elektrotechnik.de",
  benefits: ["Firmenwagen", "30 Tage Urlaub", "Weiterbildung", "Kein Notdienst", "Werkzeug gestellt"],
  montage: "Jeden Abend zuhause",
  urlaubstage: "30",
  logo: "",
};
