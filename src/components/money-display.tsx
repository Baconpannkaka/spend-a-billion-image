"use client";

import { useLanguage } from "@/i18n/language-context";
import { getMoneyDisplayFromSek } from "@/lib/format";
import type { CurrencyCode } from "@/types";

export function MoneyDisplay({ valueSek, currency, compactClassName = "", fullClassName = "", compactThreshold = 10_000_000 }: { valueSek: number; currency: CurrencyCode; compactClassName?: string; fullClassName?: string; compactThreshold?: number }) {
  const { locale } = useLanguage();
  const display = getMoneyDisplayFromSek(valueSek, currency, locale, compactThreshold);
  return <span className="inline-flex flex-wrap items-baseline gap-x-1.5"><span className={fullClassName}>{display.full}</span>{display.compact && <span className={compactClassName}>({display.compact})</span>}</span>;
}
