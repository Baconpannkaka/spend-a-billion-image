import { decodeShareData, encodeShareData, peekShareMode } from "@/lib/share";
import type { Product } from "@/types";
import { describe, expect, it } from "vitest";

const products: Product[] = [{ id: "lux-000001", mode: "luxury", slug: "a", name: "A", categoryId: "x", categoryLabel: "X", subcategoryId: "y", subcategoryLabel: "Y", priceSek: 100, shortDescription: "", description: "", facts: [], tags: [] }];

describe("share", () => {
  it("serialiserar och avkodar v3", () => {
    const encoded = encodeShareData("luxury", "Albin", [{ productId: "lux-000001", quantity: 2 }], 1_000, "SEK", { kind: "classic" }, 123);
    expect(peekShareMode(encoded)).toBe("luxury");
    expect(decodeShareData(encoded, products)?.cart).toEqual([{ productId: "lux-000001", quantity: 2 }]);
  });
  it("ignorerar okända produkter och trasig data", () => {
    expect(decodeShareData("trasig", products)).toBeNull();
    const encoded = encodeShareData("luxury", "X", [{ productId: "unknown", quantity: -4 }], 1_000, "SEK", { kind: "classic" });
    expect(decodeShareData(encoded, products)).toBeNull();
  });
});
