import { addToCart, canAddQuantity, getAffordableQuantity, getCartTotal, getRemainingBudget, removeFromCart, setCartQuantity } from "@/lib/cart";
import type { Product } from "@/types";
import { describe, expect, it } from "vitest";

const products: Product[] = [
  { id: "lux-1", mode: "luxury", slug: "a", name: "A", categoryId: "x", categoryLabel: "X", subcategoryId: "y", subcategoryLabel: "Y", priceSek: 100, shortDescription: "", description: "", facts: [], tags: [] },
  { id: "lux-2", mode: "luxury", slug: "b", name: "B", categoryId: "x", categoryLabel: "X", subcategoryId: "y", subcategoryLabel: "Y", priceSek: 250, shortDescription: "", description: "", facts: [], tags: [] },
];

describe("cart", () => {
  it("räknar total och återstående budget", () => {
    const cart = [{ productId: "lux-1", quantity: 2 }, { productId: "lux-2", quantity: 1 }];
    expect(getCartTotal(cart, products)).toBe(450);
    expect(getRemainingBudget(cart, products, 1_000)).toBe(550);
  });
  it("hindrar överskriden budget", () => expect(canAddQuantity([], products, "lux-2", 5, 1_000)).toBe(false));
  it("hanterar plus, minus och borttagning", () => {
    expect(addToCart([], "lux-1", 2)).toEqual([{ productId: "lux-1", quantity: 2 }]);
    expect(setCartQuantity([{ productId: "lux-1", quantity: 2 }], "lux-1", 1)).toEqual([{ productId: "lux-1", quantity: 1 }]);
    expect(removeFromCart([{ productId: "lux-1", quantity: 1 }], "lux-1")).toEqual([]);
  });
  it("beräknar maxantal", () => expect(getAffordableQuantity(999, 250)).toBe(3));
});
