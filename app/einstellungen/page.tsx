"use client";

import { LanguageProvider } from "@/lib/i18n";
import SettingsContent from "./SettingsContent";

export default function EinstellungenPage() {
  return (
    <LanguageProvider>
      <SettingsContent />
    </LanguageProvider>
  );
}
