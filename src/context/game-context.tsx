"use client";

import { useCatalogContext } from "@/catalog/catalog-context";
import { isCurrencyCode } from "@/data/currencies";
import {
  addToCart,
  canAddQuantity,
  getCartTotal,
  getRemainingBudget,
  getSpentRatio,
  getTotalQuantity,
  removeFromCart,
  sanitizeCartToBudget,
  setCartQuantity,
} from "@/lib/cart";
import { clampBudgetSek, createClassicSetup, getBudgetSourceLabel, isBudgetSource } from "@/lib/budget";
import { clearGame, loadGame, saveGame } from "@/lib/storage";
import type { BudgetSource, CartItem, CompletedResult, CurrencyCode, GameMode, GameSetup, Product } from "@/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type AddResult = { ok: true } | { ok: false; missing: number };

type GameContextValue = {
  hydrated: boolean;
  catalogReady: boolean;
  name: string;
  setName: (name: string) => void;
  mode: GameMode;
  cart: CartItem[];
  introShown: boolean;
  setIntroShown: (shown: boolean) => void;
  completedResult: CompletedResult | null;
  startingBudgetSek: number;
  currency: CurrencyCode;
  budgetSource: BudgetSource;
  budgetSourceLabel: string;
  hasStarted: boolean;
  products: Product[];
  total: number;
  remaining: number;
  spentRatio: number;
  totalQuantity: number;
  setCurrency: (currency: CurrencyCode) => void;
  startGame: (setup: GameSetup) => Promise<void>;
  addItem: (productId: string, quantity?: number) => AddResult;
  updateQuantity: (productId: string, quantity: number) => AddResult;
  removeItem: (productId: string) => void;
  completePurchase: () => CompletedResult;
  resetGame: () => void;
  startChallenge: (result: Omit<CompletedResult, "completedAt">) => Promise<void>;
};

const GameContext = createContext<GameContextValue | null>(null);
const defaultSetup = createClassicSetup("SEK");

function isGameMode(value: unknown): value is GameMode {
  return value === "luxury" || value === "everyday";
}

function normalizeCompletedResult(value: unknown, products: Product[], fallback: GameSetup): CompletedResult | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<CompletedResult>;
  if (typeof candidate.name !== "string" || !Array.isArray(candidate.cart)) return null;
  const mode = isGameMode(candidate.mode) ? candidate.mode : fallback.mode;
  if (mode !== fallback.mode) return null;
  const startingBudgetSek = typeof candidate.startingBudgetSek === "number" && candidate.startingBudgetSek > 0
    ? clampBudgetSek(candidate.startingBudgetSek)
    : fallback.startingBudgetSek;
  const currency = isCurrencyCode(candidate.currency) ? candidate.currency : fallback.currency;
  const budgetSource = isBudgetSource(candidate.budgetSource) ? candidate.budgetSource : fallback.budgetSource;
  const cart = sanitizeCartToBudget(candidate.cart, products, startingBudgetSek);
  if (cart.length === 0) return null;
  return {
    name: candidate.name.trim().slice(0, 60) || "Future Shopper",
    mode,
    cart,
    completedAt: typeof candidate.completedAt === "string" ? candidate.completedAt : new Date(0).toISOString(),
    startingBudgetSek,
    currency,
    budgetSource,
  };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { catalogs, ensureCatalog } = useCatalogContext();
  const [hydrated, setHydrated] = useState(false);
  const [name, setNameState] = useState("Future Shopper");
  const [mode, setMode] = useState<GameMode>(defaultSetup.mode);
  const [cart, setCart] = useState<CartItem[]>([]);
  const cartRef = useRef<CartItem[]>([]);
  const [introShown, setIntroShown] = useState(false);
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null);
  const [startingBudgetSek, setStartingBudgetSek] = useState(defaultSetup.startingBudgetSek);
  const budgetRef = useRef(defaultSetup.startingBudgetSek);
  const [currency, setCurrencyState] = useState<CurrencyCode>(defaultSetup.currency);
  const [budgetSource, setBudgetSource] = useState<BudgetSource>(defaultSetup.budgetSource);
  const [hasStarted, setHasStarted] = useState(false);

  const products = useMemo(() => catalogs[mode]?.products ?? [], [catalogs, mode]);
  const productsRef = useRef<Product[]>([]);
  useEffect(() => { productsRef.current = products; }, [products]);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const stored = loadGame();
      const loadedMode: GameMode = isGameMode(stored?.mode) ? stored.mode : "luxury";
      const loadedCurrency = isCurrencyCode(stored?.currency) ? stored.currency : "SEK";
      const loadedBudget = typeof stored?.startingBudgetSek === "number" && stored.startingBudgetSek > 0
        ? clampBudgetSek(stored.startingBudgetSek)
        : defaultSetup.startingBudgetSek;
      const loadedSource = isBudgetSource(stored?.budgetSource) ? stored.budgetSource : defaultSetup.budgetSource;
      const shouldLoadCatalog = Boolean(stored?.hasStarted)
        || (Array.isArray(stored?.cart) && stored.cart.length > 0)
        || Boolean(stored?.completedResult);
      const catalog = shouldLoadCatalog ? await ensureCatalog(loadedMode).catch(() => null) : null;
      if (cancelled) return;
      const catalogProducts = catalog?.products ?? [];
      const storedCart = sanitizeCartToBudget(Array.isArray(stored?.cart) ? stored.cart : [], catalogProducts, loadedBudget);
      const setup: GameSetup = { mode: loadedMode, startingBudgetSek: loadedBudget, currency: loadedCurrency, budgetSource: loadedSource };

      setMode(loadedMode);
      setCurrencyState(loadedCurrency);
      setStartingBudgetSek(loadedBudget);
      budgetRef.current = loadedBudget;
      setBudgetSource(loadedSource);
      setNameState(typeof stored?.name === "string" ? stored.name.slice(0, 60) : "Future Shopper");
      cartRef.current = storedCart;
      setCart(storedCart);
      setIntroShown(Boolean(stored?.introShown));
      setCompletedResult(normalizeCompletedResult(stored?.completedResult, catalogProducts, setup));
      setHasStarted(Boolean(stored?.hasStarted) || storedCart.length > 0);
      setHydrated(true);
    }
    void hydrate();
    return () => { cancelled = true; };
  }, [ensureCatalog]);

  useEffect(() => {
    if (!hydrated) return;
    saveGame({
      name,
      mode,
      cart,
      introShown,
      completedResult,
      lastSessionAt: new Date().toISOString(),
      startingBudgetSek,
      currency,
      budgetSource,
      hasStarted,
    });
  }, [hydrated, name, mode, cart, introShown, completedResult, startingBudgetSek, currency, budgetSource, hasStarted]);

  const total = useMemo(() => getCartTotal(cart, products), [cart, products]);
  const remaining = useMemo(() => getRemainingBudget(cart, products, startingBudgetSek), [cart, products, startingBudgetSek]);
  const spentRatio = useMemo(() => getSpentRatio(cart, products, startingBudgetSek), [cart, products, startingBudgetSek]);
  const totalQuantity = useMemo(() => getTotalQuantity(cart), [cart]);
  const budgetSourceLabel = useMemo(() => getBudgetSourceLabel(budgetSource), [budgetSource]);
  const catalogReady = products.length === 10_000;

  const setName = useCallback((value: string) => setNameState(value.slice(0, 60)), []);
  const setCurrency = useCallback((value: CurrencyCode) => setCurrencyState(value), []);

  const startGame = useCallback(async (setup: GameSetup) => {
    const catalog = await ensureCatalog(setup.mode);
    const safeBudget = clampBudgetSek(setup.startingBudgetSek);
    productsRef.current = catalog.products;
    setMode(setup.mode);
    budgetRef.current = safeBudget;
    setStartingBudgetSek(safeBudget);
    setCurrencyState(setup.currency);
    setBudgetSource(setup.budgetSource);
    cartRef.current = [];
    setCart([]);
    setCompletedResult(null);
    setIntroShown(false);
    setHasStarted(true);
  }, [ensureCatalog]);

  const addItem = useCallback((productId: string, quantity = 1): AddResult => {
    const current = cartRef.current;
    const activeProducts = productsRef.current;
    const product = activeProducts.find((entry) => entry.id === productId);
    const safeQuantity = Math.max(1, Math.floor(quantity));
    const currentTotal = getCartTotal(current, activeProducts);
    if (!product || !canAddQuantity(current, activeProducts, productId, safeQuantity, budgetRef.current)) {
      return { ok: false, missing: product ? Math.max(0, currentTotal + product.priceSek * safeQuantity - budgetRef.current) : 0 };
    }
    const next = addToCart(current, productId, safeQuantity);
    cartRef.current = next;
    setCart(next);
    setCompletedResult(null);
    return { ok: true };
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number): AddResult => {
    const current = cartRef.current;
    const activeProducts = productsRef.current;
    if (quantity <= 0) {
      const next = setCartQuantity(current, productId, 0);
      cartRef.current = next;
      setCart(next);
      setCompletedResult(null);
      return { ok: true };
    }
    const currentQuantity = current.find((item) => item.productId === productId)?.quantity ?? 0;
    if (quantity > currentQuantity && !canAddQuantity(current, activeProducts, productId, quantity - currentQuantity, budgetRef.current)) {
      const product = activeProducts.find((entry) => entry.id === productId);
      const currentTotal = getCartTotal(current, activeProducts);
      return { ok: false, missing: product ? Math.max(0, currentTotal + product.priceSek * (quantity - currentQuantity) - budgetRef.current) : 0 };
    }
    const next = setCartQuantity(current, productId, quantity);
    cartRef.current = next;
    setCart(next);
    setCompletedResult(null);
    return { ok: true };
  }, []);

  const removeItem = useCallback((productId: string) => {
    const next = removeFromCart(cartRef.current, productId);
    cartRef.current = next;
    setCart(next);
    setCompletedResult(null);
  }, []);

  const completePurchase = useCallback(() => {
    const result: CompletedResult = {
      name: name.trim() || "Future Shopper",
      mode,
      cart: cartRef.current,
      completedAt: new Date().toISOString(),
      startingBudgetSek: budgetRef.current,
      currency,
      budgetSource,
    };
    setCompletedResult(result);
    return result;
  }, [name, mode, currency, budgetSource]);

  const resetGame = useCallback(() => {
    clearGame();
    setNameState("Future Shopper");
    cartRef.current = [];
    setCart([]);
    setIntroShown(false);
    setCompletedResult(null);
    budgetRef.current = defaultSetup.startingBudgetSek;
    setStartingBudgetSek(defaultSetup.startingBudgetSek);
    setBudgetSource(defaultSetup.budgetSource);
    setHasStarted(false);
  }, []);

  const startChallenge = useCallback(async (result: Omit<CompletedResult, "completedAt">) => {
    await startGame({
      mode: result.mode,
      startingBudgetSek: result.startingBudgetSek,
      currency: result.currency,
      budgetSource: result.budgetSource,
    });
    setNameState("Future Challenger");
    setIntroShown(true);
  }, [startGame]);

  const value = useMemo<GameContextValue>(() => ({
    hydrated,
    catalogReady,
    name,
    setName,
    mode,
    cart,
    introShown,
    setIntroShown,
    completedResult,
    startingBudgetSek,
    currency,
    budgetSource,
    budgetSourceLabel,
    hasStarted,
    products,
    total,
    remaining,
    spentRatio,
    totalQuantity,
    setCurrency,
    startGame,
    addItem,
    updateQuantity,
    removeItem,
    completePurchase,
    resetGame,
    startChallenge,
  }), [hydrated, catalogReady, name, setName, mode, cart, introShown, completedResult, startingBudgetSek, currency, budgetSource, budgetSourceLabel, hasStarted, products, total, remaining, spentRatio, totalQuantity, setCurrency, startGame, addItem, updateQuantity, removeItem, completePurchase, resetGame, startChallenge]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame måste användas inom GameProvider");
  return context;
}
