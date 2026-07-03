import { currencyToSek, isCurrencyCode } from "@/data/currencies";
import { wealthProfileById } from "@/data/wealth-profiles";
import { MAX_BUDGET_SEK, STARTING_BUDGET_SEK } from "@/lib/constants";
import type { BudgetSource, CurrencyCode, GameMode, GameSetup } from "@/types";

export function clampBudgetSek(value: number): number {
  if (!Number.isFinite(value)) return STARTING_BUDGET_SEK;
  return Math.min(MAX_BUDGET_SEK, Math.max(1, Math.round(value)));
}

export function createClassicSetup(currency: CurrencyCode): GameSetup {
  return { mode: "luxury", startingBudgetSek: STARTING_BUDGET_SEK, currency, budgetSource: { kind: "classic" } };
}

export function createPersonSetup(personId: string, currency: CurrencyCode): GameSetup | null {
  const person = wealthProfileById.get(personId);
  if (!person) return null;
  return {
    mode: "luxury",
    startingBudgetSek: clampBudgetSek(currencyToSek(person.netWorthUsd, "USD")),
    currency,
    budgetSource: { kind: "person", personId: person.id, personName: person.name },
  };
}

export function createPresetSetup(mode: GameMode, presetId: string, label: string, amount: number, currency: CurrencyCode): GameSetup {
  return {
    mode,
    startingBudgetSek: clampBudgetSek(currencyToSek(amount, currency)),
    currency,
    budgetSource: { kind: "everyday-preset", presetId, label },
  };
}

export function createCustomSetup(mode: GameMode, amount: number, currency: CurrencyCode): GameSetup | null {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return {
    mode,
    startingBudgetSek: clampBudgetSek(currencyToSek(amount, currency)),
    currency,
    budgetSource: { kind: "custom", label: "Egen shoppingbudget" },
  };
}

export function createStockSetup(input: {
  mode: GameMode;
  stockName: string;
  shares: number;
  targetPrice: number;
  quoteCurrency: CurrencyCode;
  currency: CurrencyCode;
}): GameSetup | null {
  const shares = Math.min(1_000_000_000, Math.floor(input.shares));
  const targetPrice = Math.min(1_000_000_000, input.targetPrice);
  if (!Number.isFinite(shares) || shares <= 0 || !Number.isFinite(targetPrice) || targetPrice <= 0) return null;
  const value = shares * targetPrice;
  if (!Number.isFinite(value)) return null;
  return {
    mode: input.mode,
    startingBudgetSek: clampBudgetSek(currencyToSek(value, input.quoteCurrency)),
    currency: input.currency,
    budgetSource: {
      kind: "stock",
      stockName: input.stockName.trim().slice(0, 40) || "Min aktie",
      shares,
      targetPrice,
      quoteCurrency: input.quoteCurrency,
    },
  };
}

export function getBudgetSourceLabel(source: BudgetSource): string {
  if (source.kind === "classic") return "Den klassiska miljarden";
  if (source.kind === "person") return `Lika rik som ${source.personName}`;
  if (source.kind === "everyday-preset") return source.label;
  if (source.kind === "custom") return source.label;
  return `${source.shares.toLocaleString("sv-SE")} aktier i ${source.stockName} vid ${source.targetPrice.toLocaleString("sv-SE")} ${source.quoteCurrency}`;
}

export function isBudgetSource(value: unknown): value is BudgetSource {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BudgetSource>;
  if (candidate.kind === "classic") return true;
  if (candidate.kind === "person") return typeof candidate.personId === "string" && typeof candidate.personName === "string";
  if (candidate.kind === "everyday-preset") return typeof candidate.presetId === "string" && typeof candidate.label === "string";
  if (candidate.kind === "custom") return typeof candidate.label === "string";
  return candidate.kind === "stock"
    && typeof candidate.stockName === "string"
    && typeof candidate.shares === "number"
    && Number.isFinite(candidate.shares)
    && candidate.shares > 0
    && typeof candidate.targetPrice === "number"
    && Number.isFinite(candidate.targetPrice)
    && candidate.targetPrice > 0
    && isCurrencyCode(candidate.quoteCurrency);
}
