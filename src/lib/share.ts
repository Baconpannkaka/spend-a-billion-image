import { isCurrencyCode } from "@/data/currencies";
import { isBudgetSource } from "@/lib/budget";
import { MAX_BUDGET_SEK, MAX_SHARED_QUANTITY, SHARE_VERSION } from "@/lib/constants";
import type { BudgetSource, CartItem, CurrencyCode, GameMode, Product, SharePayloadV3 } from "@/types";

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(encoded: string): string {
  const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function isGameMode(value: unknown): value is GameMode {
  return value === "luxury" || value === "everyday";
}

export function encodeShareData(
  mode: GameMode,
  name: string,
  cart: CartItem[],
  budgetSek: number,
  currency: CurrencyCode,
  budgetSource: BudgetSource,
  timestamp = Date.now(),
): string {
  const payload: SharePayloadV3 = {
    v: SHARE_VERSION,
    m: mode,
    n: name.trim().slice(0, 60) || "Future Shopper",
    i: cart.map((item) => [item.productId, item.quantity]),
    b: Math.min(MAX_BUDGET_SEK, Math.max(1, Math.round(budgetSek))),
    c: currency,
    s: budgetSource,
    t: timestamp,
  };
  return toBase64Url(JSON.stringify(payload));
}

export function peekShareMode(encoded: string): GameMode | null {
  try {
    if (!encoded || encoded.length > 40_000) return null;
    const parsed: unknown = JSON.parse(fromBase64Url(encoded));
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Partial<SharePayloadV3>;
    return candidate.v === SHARE_VERSION && isGameMode(candidate.m) ? candidate.m : null;
  } catch {
    return null;
  }
}

export function decodeShareData(
  encoded: string,
  products: Product[],
): { mode: GameMode; name: string; cart: CartItem[]; timestamp?: number; startingBudgetSek: number; currency: CurrencyCode; budgetSource: BudgetSource } | null {
  try {
    if (!encoded || encoded.length > 40_000) return null;
    const parsed: unknown = JSON.parse(fromBase64Url(encoded));
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Record<string, unknown>;
    if (candidate.v !== SHARE_VERSION || !isGameMode(candidate.m) || typeof candidate.n !== "string" || !Array.isArray(candidate.i)) return null;
    if (typeof candidate.b !== "number" || !Number.isFinite(candidate.b) || candidate.b <= 0) return null;
    if (!isCurrencyCode(candidate.c) || !isBudgetSource(candidate.s)) return null;

    const mode = candidate.m;
    const startingBudgetSek = Math.min(MAX_BUDGET_SEK, Math.max(1, Math.round(candidate.b)));
    const validProducts = products.filter((product) => product.mode === mode);
    const validIds = new Set(validProducts.map((product) => product.id));
    const quantities = new Map<string, number>();

    for (const entry of candidate.i) {
      if (!Array.isArray(entry) || entry.length !== 2) continue;
      const [productId, rawQuantity] = entry;
      if (typeof productId !== "string" || !validIds.has(productId)) continue;
      if (typeof rawQuantity !== "number" || !Number.isFinite(rawQuantity)) continue;
      const quantity = Math.min(MAX_SHARED_QUANTITY, Math.floor(rawQuantity));
      if (quantity <= 0) continue;
      quantities.set(productId, Math.min(MAX_SHARED_QUANTITY, (quantities.get(productId) ?? 0) + quantity));
    }

    const priceById = new Map(validProducts.map((product) => [product.id, product.priceSek]));
    let remainingBudget = startingBudgetSek;
    const cart = Array.from(quantities).flatMap(([productId, requestedQuantity]) => {
      const price = priceById.get(productId);
      if (!price || remainingBudget < price) return [];
      const quantity = Math.min(requestedQuantity, Math.floor(remainingBudget / price));
      if (quantity <= 0) return [];
      remainingBudget -= price * quantity;
      return [{ productId, quantity }];
    });
    if (cart.length === 0) return null;

    return {
      mode,
      name: candidate.n.trim().slice(0, 60) || "Future Shopper",
      cart,
      startingBudgetSek,
      currency: candidate.c,
      budgetSource: candidate.s,
      timestamp: typeof candidate.t === "number" && Number.isFinite(candidate.t) ? candidate.t : undefined,
    };
  } catch {
    return null;
  }
}
