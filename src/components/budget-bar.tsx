"use client";

import { MoneyDisplay } from "@/components/money-display";
import { useGame } from "@/context/game-context";
import { useLanguage } from "@/i18n/language-context";
import { formatPercent } from "@/lib/format";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export function BudgetBar() {
  const { startingBudgetSek, total, remaining, spentRatio, totalQuantity, currency } = useGame();
  const { t, locale } = useLanguage();
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <div className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2 xl:grid-cols-4">
          <span className="min-w-0 text-white/45">{t("budget.budget")} <strong className="ml-1 text-white"><MoneyDisplay valueSek={startingBudgetSek} currency={currency} compactClassName="text-white/40 font-normal" /></strong></span>
          <span className="min-w-0 text-white/45">{t("budget.spent")} <strong className="ml-1 text-white"><MoneyDisplay valueSek={total} currency={currency} compactClassName="text-white/40 font-normal" /></strong></span>
          <span className="min-w-0 text-white/45">{t("budget.remaining")} <strong className="ml-1 text-[var(--gold)]"><MoneyDisplay valueSek={remaining} currency={currency} compactClassName="text-white/40 font-normal" /></strong></span>
          <span className="text-white/45">{t("budget.used")} <strong className="ml-1 text-white">{formatPercent(spentRatio, 1, locale)}</strong></span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${Math.min(100, spentRatio * 100)}%` }} /></div>
      </div>
      <Link href="/varukorg" className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[var(--gold)] px-4 text-xs font-bold text-black"><ShoppingBag className="h-4 w-4" /> {t("budget.items", { count: totalQuantity.toLocaleString(locale) })}</Link>
    </div>
  );
}
