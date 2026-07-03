import { getAchievements } from "@/lib/achievements";
import type { Product } from "@/types";
import { describe, expect, it } from "vitest";

const card: Product = { id: "card", mode: "luxury", slug: "card", name: "Pokémon PSA", categoryId: "samlarobjekt", categoryLabel: "Samlarobjekt", subcategoryId: "samlarkort", subcategoryLabel: "Samlarkort", priceSek: 900, shortDescription: "", description: "", facts: [], tags: [], collectible: { franchise: "Pokémon", set: "Base", year: "1999", cardNumber: "4", language: "Engelska", gradingCompany: "PSA", grade: 10 } };

describe("achievements", () => {
  it("upptäcker PSA-kort och nästan perfekt spendering", () => {
    const ids = getAchievements([{ productId: "card", quantity: 1 }], [card], 900).map((achievement) => achievement.id);
    expect(ids).toContain("psa");
    expect(ids).toContain("perfekt");
  });
});
