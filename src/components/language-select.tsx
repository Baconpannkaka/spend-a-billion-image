"use client";

import { useLanguage } from "@/i18n/language-context";
import { languageOptions } from "@/i18n/translations";
import type { LanguageCode } from "@/types";
import { Languages } from "lucide-react";

export function LanguageSelect() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <label className="relative flex items-center text-white/65">
      <Languages className="pointer-events-none absolute left-2.5 h-3.5 w-3.5" />
      <span className="sr-only">{t("select.language")}</span>
      <select aria-label={t("select.language")} value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)} className="h-9 w-16 rounded-md sm:w-auto border border-white/15 bg-white/5 pl-8 pr-2 text-xs font-semibold text-white outline-none focus:border-[var(--gold)]">
        {languageOptions.map((entry) => <option key={entry.code} value={entry.code} className="text-black">{entry.nativeLabel}</option>)}
      </select>
    </label>
  );
}
