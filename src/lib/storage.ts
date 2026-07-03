import { LEGACY_STORAGE_KEY, STORAGE_KEY } from "@/lib/constants";
import type { BudgetSource, CartItem, CompletedResult, CurrencyCode, GameMode } from "@/types";

export type StoredGame = {
  name: string;
  mode: GameMode;
  cart: CartItem[];
  introShown: boolean;
  completedResult: CompletedResult | null;
  lastSessionAt: string;
  startingBudgetSek: number;
  currency: CurrencyCode;
  budgetSource: BudgetSource;
  hasStarted: boolean;
};

function parseStored(raw: string | null): Partial<StoredGame> | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed as Partial<StoredGame> : null;
  } catch {
    return null;
  }
}

export function loadGame(): Partial<StoredGame> | null {
  if (typeof window === "undefined") return null;
  try {
    return parseStored(window.localStorage.getItem(STORAGE_KEY))
      ?? parseStored(window.localStorage.getItem(LEGACY_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function saveGame(game: StoredGame): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  } catch {
    // Spelet fungerar även när lagring är blockerad.
  }
}

export function clearGame(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Återställ resten av klienttillståndet även om lagringen är blockerad.
  }
}
