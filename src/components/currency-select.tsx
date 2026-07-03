"use client";

import { currencies } from "@/data/currencies";
import { useGame } from "@/context/game-context";
import { useLanguage } from "@/i18n/language-context";

export function CurrencySelect({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency } = useGame();
  const { t } = useLanguage();
  return (
    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
      <span className={compact ? "sr-only" : "hidden sm:inline"}>{t("select.currency")}</span>
      <select
        aria-label={t("select.currency")}
        value={currency}
        onChange={(event) => setCurrency(event.target.value as typeof currency)}
        className="h-9 rounded-md border border-white/15 bg-white/5 px-2.5 text-sm font-semibold tracking-normal text-white outline-none focus:border-[var(--gold)]"
      >
        {currencies.map((entry) => <option key={entry.code} value={entry.code} className="text-black">{entry.code}</option>)}
      </select>
    </label>
  );
}
