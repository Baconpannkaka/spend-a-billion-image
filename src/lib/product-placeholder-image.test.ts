import { getProductPlaceholderKey } from "@/lib/product-placeholder-image";
import type { Product } from "@/types";
import { describe, expect, it } from "vitest";

function product(overrides: Partial<Product>): Product {
  return {
    id: "test",
    mode: "everyday",
    slug: "test",
    name: "Testprodukt",
    categoryId: "hem",
    categoryLabel: "Hem",
    subcategoryId: "test",
    subcategoryLabel: "Test",
    priceSek: 100,
    shortDescription: "",
    description: "",
    facts: [],
    tags: [],
    ...overrides,
  };
}

describe("product placeholder image mapping", () => {
  it("täcker huvudkategorier i båda spellägena", () => {
    expect(getProductPlaceholderKey(product({ mode: "luxury", categoryId: "fordon" }))).toBe("supercar");
    expect(getProductPlaceholderKey(product({ mode: "luxury", categoryId: "konst" }))).toBe("art");
    expect(getProductPlaceholderKey(product({ categoryId: "barn-baby" }))).toBe("baby");
    expect(getProductPlaceholderKey(product({ categoryId: "bocker-media" }))).toBe("books-media");
  });

  it("väljer mer specifika motiv när produkttexten ger stöd", () => {
    expect(getProductPlaceholderKey(product({ mode: "luxury", categoryId: "mode", name: "Weekendbag" }))).toBe("handbag");
    expect(getProductPlaceholderKey(product({ categoryId: "elektronik", name: "Systemkamera" }))).toBe("camera");
    expect(getProductPlaceholderKey(product({ categoryId: "transport", name: "Takbox för bil" }))).toBe("supercar");
  });

  it("returnerar null för en helt okänd kategori", () => {
    expect(getProductPlaceholderKey(product({ categoryId: "okand" }))).toBeNull();
  });
});
