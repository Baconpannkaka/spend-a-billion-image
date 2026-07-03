import { sekToCurrency } from "@/data/currencies";
import type { CurrencyCode } from "@/types";

export function formatMoneyValue(value: number, currency: CurrencyCode, maximumFractionDigits = 0, locale = "sv-SE"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatMoneyFromSek(valueSek: number, currency: CurrencyCode, locale = "sv-SE"): string {
  return formatMoneyValue(sekToCurrency(valueSek, currency), currency, 0, locale);
}

export function formatSek(value: number, locale = "sv-SE"): string {
  return formatMoneyFromSek(value, "SEK", locale);
}

export function formatNumber(value: number, locale = "sv-SE"): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

export function formatCompactMoneyFromSek(valueSek: number, currency: CurrencyCode, locale = "sv-SE"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(sekToCurrency(valueSek, currency));
}

export function getMoneyDisplayFromSek(valueSek: number, currency: CurrencyCode, locale = "sv-SE", compactThreshold = 10_000_000): { full: string; compact?: string } {
  const converted = sekToCurrency(valueSek, currency);
  const full = formatMoneyValue(converted, currency, 0, locale);
  if (Math.abs(converted) < compactThreshold) return { full };
  const compact = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(converted);
  return compact === full ? { full } : { full, compact };
}

export function formatMoneyWithCompactFromSek(valueSek: number, currency: CurrencyCode, locale = "sv-SE", compactThreshold = 10_000_000): string {
  const display = getMoneyDisplayFromSek(valueSek, currency, locale, compactThreshold);
  return display.compact ? `${display.full} (${display.compact})` : display.full;
}

export function formatPercent(value: number, decimals = 1, locale = "sv-SE"): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}
