import { filterAndSortProducts } from "@/lib/catalog-filter";
import type { Product } from "@/types";
import { describe, expect, it } from "vitest";

const products: Product[] = [
  { id: "a", mode: "everyday", slug: "mobil", name: "Mobil Pro", categoryId: "mobil", categoryLabel: "Mobil", subcategoryId: "smartphones", subcategoryLabel: "Smartphones", priceSek: 10_000, shortDescription: "", description: "", facts: [], tags: ["telefon"], featured: true },
  { id: "b", mode: "everyday", slug: "skal", name: "Mobilskal", categoryId: "mobil", categoryLabel: "Mobil", subcategoryId: "skal", subcategoryLabel: "Skal", priceSek: 200, shortDescription: "", description: "", facts: [], tags: ["telefon"] },
];

describe("catalog filter", () => {
  it("söker, filtrerar budget och sorterar", () => {
    const result = filterAndSortProducts(products, { search: "telefon", categoryId: "mobil", subcategoryId: "all", affordableOnly: true, remainingBudgetSek: 1_000, sort: "cheap" });
    expect(result.map((product) => product.id)).toEqual(["b"]);
  });
});
