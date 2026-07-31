"use client";

// ─── Mehrsprachigkeit (Einstellungsbereich) ───────────────────────────────────
// Leichtgewichtige i18n ohne Fremd-Library. Aktuell für den Einstellungs-/
// Profilbereich; die Sprache wird in localStorage gespeichert und kann später
// auf die ganze App ausgeweitet werden.

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Lang = "de" | "en" | "fr" | "es";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

type Dict = Record<string, Record<Lang, string>>;

// prettier-ignore
const DICT: Dict = {
  "settings.title":        { de: "Einstellungen", en: "Settings", fr: "Paramètres", es: "Ajustes" },
  "settings.subtitle":     { de: "Verwalte dein Konto, deine Daten und Sicherheit.", en: "Manage your account, data and security.", fr: "Gérez votre compte, vos données et votre sécurité.", es: "Administra tu cuenta, datos y seguridad." },
  "search.placeholder":    { de: "Einstellungen durchsuchen…", en: "Search settings…", fr: "Rechercher un paramètre…", es: "Buscar ajustes…" },
  "search.none":           { de: "Keine Treffer für", en: "No results for", fr: "Aucun résultat pour", es: "Sin resultados para" },

  "sec.account":           { de: "Konto", en: "Account", fr: "Compte", es: "Cuenta" },
  "sec.account.desc":      { de: "Name, E-Mail und Telefon", en: "Name, email and phone", fr: "Nom, e-mail et téléphone", es: "Nombre, correo y teléfono" },
  "sec.answers":           { de: "Profil-Antworten", en: "Profile answers", fr: "Réponses du profil", es: "Respuestas del perfil" },
  "sec.answers.desc":      { de: "Deine Angaben aus der Registrierung", en: "Your answers from sign-up", fr: "Vos réponses lors de l’inscription", es: "Tus respuestas del registro" },
  "sec.security":          { de: "Sicherheit", en: "Security", fr: "Sécurité", es: "Seguridad" },
  "sec.security.desc":     { de: "Passwort und Anmeldeaktivität", en: "Password and login activity", fr: "Mot de passe et activité de connexion", es: "Contraseña y actividad de inicio" },
  "sec.language":          { de: "Sprache", en: "Language", fr: "Langue", es: "Idioma" },
  "sec.language.desc":     { de: "App-Sprache wählen", en: "Choose the app language", fr: "Choisir la langue", es: "Elegir el idioma" },
  "sec.help":              { de: "Hilfe", en: "Help", fr: "Aide", es: "Ayuda" },
  "sec.help.desc":         { de: "Häufige Fragen & Support", en: "FAQ & support", fr: "FAQ & assistance", es: "Preguntas frecuentes y soporte" },
  "sec.legal":             { de: "Rechtliches", en: "Legal", fr: "Mentions légales", es: "Legal" },
  "sec.legal.desc":        { de: "Datenschutz & Nutzungsbedingungen", en: "Privacy & terms", fr: "Confidentialité & conditions", es: "Privacidad y términos" },
  "sec.data":              { de: "Deine Daten", en: "Your data", fr: "Vos données", es: "Tus datos" },
  "sec.data.desc":         { de: "Export & Konto löschen", en: "Export & delete account", fr: "Export & suppression du compte", es: "Exportar y eliminar cuenta" },

  "field.firstName":       { de: "Vorname", en: "First name", fr: "Prénom", es: "Nombre" },
  "field.lastName":        { de: "Nachname", en: "Last name", fr: "Nom", es: "Apellido" },
  "field.email":           { de: "E-Mail-Adresse", en: "Email address", fr: "Adresse e-mail", es: "Correo electrónico" },
  "field.phone":           { de: "Telefonnummer", en: "Phone number", fr: "Numéro de téléphone", es: "Número de teléfono" },
  "field.currentPassword": { de: "Aktuelles Passwort", en: "Current password", fr: "Mot de passe actuel", es: "Contraseña actual" },
  "field.newPassword":     { de: "Neues Passwort", en: "New password", fr: "Nouveau mot de passe", es: "Nueva contraseña" },
  "field.password":        { de: "Passwort", en: "Password", fr: "Mot de passe", es: "Contraseña" },

  "btn.save":              { de: "Speichern", en: "Save", fr: "Enregistrer", es: "Guardar" },
  "btn.saved":             { de: "Gespeichert ✓", en: "Saved ✓", fr: "Enregistré ✓", es: "Guardado ✓" },
  "btn.cancel":            { de: "Abbrechen", en: "Cancel", fr: "Annuler", es: "Cancelar" },
  "btn.edit":             { de: "Bearbeiten", en: "Edit", fr: "Modifier", es: "Editar" },
  "btn.changePassword":    { de: "Passwort ändern", en: "Change password", fr: "Changer le mot de passe", es: "Cambiar contraseña" },
  "btn.changeEmail":       { de: "E-Mail ändern", en: "Change email", fr: "Changer l’e-mail", es: "Cambiar correo" },
  "btn.logout":            { de: "Abmelden", en: "Log out", fr: "Se déconnecter", es: "Cerrar sesión" },
  "btn.logoutAll":         { de: "Auf allen Geräten abmelden", en: "Log out everywhere", fr: "Déconnecter partout", es: "Cerrar sesión en todos" },
  "btn.export":            { de: "Meine Daten exportieren", en: "Export my data", fr: "Exporter mes données", es: "Exportar mis datos" },
  "btn.delete":            { de: "Konto löschen", en: "Delete account", fr: "Supprimer le compte", es: "Eliminar cuenta" },

  "security.activity":     { de: "Anmeldeaktivität", en: "Login activity", fr: "Activité de connexion", es: "Actividad de inicio" },
  "security.noActivity":   { de: "Noch keine Aktivität aufgezeichnet.", en: "No activity recorded yet.", fr: "Aucune activité enregistrée.", es: "Sin actividad registrada." },
  "security.logoutAllHint":{ de: "Meldet alle anderen Sitzungen ab. Diese bleibt aktiv.", en: "Signs out all other sessions. This one stays active.", fr: "Déconnecte toutes les autres sessions.", es: "Cierra las demás sesiones." },

  "help.title":            { de: "Hilfe-Center", en: "Help center", fr: "Centre d’aide", es: "Centro de ayuda" },
  "help.contact":          { de: "Support kontaktieren", en: "Contact support", fr: "Contacter le support", es: "Contactar soporte" },

  "danger.exportHint":     { de: "Lade alle über dich gespeicherten Daten als Datei herunter (DSGVO).", en: "Download everything we store about you (GDPR).", fr: "Téléchargez toutes vos données (RGPD).", es: "Descarga todos tus datos (RGPD)." },
  "danger.deleteHint":     { de: "Löscht dein Konto und alle Daten unwiderruflich.", en: "Permanently deletes your account and all data.", fr: "Supprime définitivement votre compte.", es: "Elimina tu cuenta permanentemente." },
  "danger.deleteConfirm":  { de: "Zum Bestätigen dein Passwort eingeben:", en: "Enter your password to confirm:", fr: "Entrez votre mot de passe pour confirmer :", es: "Introduce tu contraseña para confirmar:" },

  "madeIn":                { de: "Made in Germany", en: "Made in Germany", fr: "Made in Germany", es: "Made in Germany" },
};

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = "portawerk_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved && ["de", "en", "fr", "es"].includes(saved)) setLangState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string) => DICT[key]?.[lang] ?? DICT[key]?.de ?? key,
    [lang]
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n muss innerhalb von <LanguageProvider> genutzt werden.");
  return ctx;
}
