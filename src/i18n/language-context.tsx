"use client";

import { getLanguageOption, translate, type TranslationKey } from "@/i18n/translations";
import type { LanguageCode } from "@/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const LANGUAGE_STORAGE_KEY = "spend-a-billion-language";

type LanguageContextValue = {
  language: LanguageCode;
  locale: string;
  direction: "ltr" | "rtl";
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguageCode(value: string | null): value is LanguageCode {
  return value === "sv" || value === "en" || value === "es" || value === "zh" || value === "hi" || value === "ar";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("sv");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (isLanguageCode(stored)) {
        const timer = window.setTimeout(() => setLanguageState(stored), 0);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // Språkvalet fungerar även när localStorage är blockerat.
    }
  }, []);

  const option = getLanguageOption(language);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = option.direction;
  }, [language, option.direction]);

  const setLanguage = useCallback((value: LanguageCode) => {
    setLanguageState(value);
    try { window.localStorage.setItem(LANGUAGE_STORAGE_KEY, value); } catch { /* no-op */ }
  }, []);

  const t = useCallback((key: TranslationKey, variables?: Record<string, string | number>) => translate(language, key, variables), [language]);
  const value = useMemo(() => ({ language, locale: option.locale, direction: option.direction, setLanguage, t }), [language, option.locale, option.direction, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
