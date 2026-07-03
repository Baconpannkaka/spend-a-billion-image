import { hasActiveShopFilters, parseShopFilters, serializeShopFilters } from "@/lib/shop-query";
import { describe, expect, it } from "vitest";

describe("shop query state", () => {
  it("round-trips filters through the URL", () => {
    const query = serializeShopFilters({ search: "Bugatti", category: "cars", subcategory: "hypercar", sort: "expensive", affordableOnly: true, page: 3 });
    expect(parseShopFilters(new URLSearchParams(query))).toEqual({ search: "Bugatti", category: "cars", subcategory: "hypercar", sort: "expensive", affordableOnly: true, page: 3 });
  });

  it("sanitizes invalid values", () => {
    expect(parseShopFilters(new URLSearchParams("sort=nope&page=-2"))).toMatchObject({ sort: "recommended", page: 1 });
  });

  it("detects active filters", () => {
    expect(hasActiveShopFilters(parseShopFilters(new URLSearchParams()))).toBe(false);
    expect(hasActiveShopFilters(parseShopFilters(new URLSearchParams("q=watch")))).toBe(true);
  });
});
