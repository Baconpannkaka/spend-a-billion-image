import type { CartItem, Product } from "@/types";

export function addToCart(cart: CartItem[], productId: string, quantity = 1): CartItem[] {
  const safeQuantity = Math.max(1, Math.floor(quantity));
  const existing = cart.find((item) => item.productId === productId);
  if (!existing) return [...cart, { productId, quantity: safeQuantity }];
  return cart.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + safeQuantity } : item);
}

export function setCartQuantity(cart: CartItem[], productId: string, quantity: number): CartItem[] {
  const safeQuantity = Math.floor(quantity);
  if (safeQuantity <= 0) return removeFromCart(cart, productId);
  return cart.map((item) => item.productId === productId ? { ...item, quantity: safeQuantity } : item);
}

export function removeFromCart(cart: CartItem[], productId: string): CartItem[] {
  return cart.filter((item) => item.productId !== productId);
}

export function getCartTotal(cart: CartItem[], products: Product[]): number {
  const prices = new Map(products.map((product) => [product.id, product.priceSek]));
  return cart.reduce((total, item) => total + (prices.get(item.productId) ?? 0) * item.quantity, 0);
}

export function getRemainingBudget(cart: CartItem[], products: Product[], startingBudgetSek: number): number {
  return Math.max(0, startingBudgetSek - getCartTotal(cart, products));
}

export function getSpentRatio(cart: CartItem[], products: Product[], startingBudgetSek: number): number {
  if (startingBudgetSek <= 0) return 0;
  return Math.min(1, getCartTotal(cart, products) / startingBudgetSek);
}

export function getTotalQuantity(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

export function canAddQuantity(cart: CartItem[], products: Product[], productId: string, quantity: number, budgetSek: number): boolean {
  const product = products.find((entry) => entry.id === productId);
  if (!product || quantity <= 0 || !Number.isFinite(quantity)) return false;
  return getCartTotal(cart, products) + product.priceSek * Math.floor(quantity) <= budgetSek;
}

export function getAffordableQuantity(remainingBudgetSek: number, productPriceSek: number): number {
  if (remainingBudgetSek <= 0 || productPriceSek <= 0) return 0;
  return Math.max(0, Math.floor(remainingBudgetSek / productPriceSek));
}

export function sanitizeCartToBudget(cart: unknown[], products: Product[], budgetSek: number): CartItem[] {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const quantities = new Map<string, number>();

  for (const raw of cart) {
    if (!raw || typeof raw !== "object") continue;
    const candidate = raw as Partial<CartItem>;
    if (typeof candidate.productId !== "string" || !productMap.has(candidate.productId)) continue;
    if (typeof candidate.quantity !== "number" || !Number.isFinite(candidate.quantity)) continue;
    const quantity = Math.min(100_000, Math.max(0, Math.floor(candidate.quantity)));
    if (quantity > 0) quantities.set(candidate.productId, Math.min(100_000, (quantities.get(candidate.productId) ?? 0) + quantity));
  }

  let remaining = Math.max(0, budgetSek);
  const result: CartItem[] = [];
  for (const [productId, requested] of quantities) {
    const product = productMap.get(productId);
    if (!product || product.priceSek > remaining) continue;
    const quantity = Math.min(requested, Math.floor(remaining / product.priceSek));
    if (quantity <= 0) continue;
    result.push({ productId, quantity });
    remaining -= product.priceSek * quantity;
  }
  return result;
}
