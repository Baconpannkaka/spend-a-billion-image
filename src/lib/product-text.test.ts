import { getProductText } from "@/lib/product-text";
import type { Product } from "@/types";
import { describe, expect, it } from "vitest";

const product: Product = {
  id: "lux-000001",
  mode: "luxury",
  slug: "takvaning",
  name: "Takvåning i Monaco",
  categoryId: "fastigheter",
  categoryLabel: "Fastigheter",
  subcategoryId: "stadsvaningar",
  subcategoryLabel: "Stadsvåningar",
  priceSek: 10,
  shortDescription: "Svensk text",
  description: "Svensk beskrivning",
  facts: ["Fakta"],
  tags: [],
  nameKind: "translatable",
  localizations: { en: { name: "Penthouse in Monaco" } },
};

describe("product text", () => {
  it("översätter generiska produktnamn men behåller säker fallback", () => {
    const translated = getProductText(product, "en");
    expect(translated.name).toBe("Penthouse in Monaco");
    expect(translated.description).toContain("approximate entertainment listing");
  });
});
