import type { CatalogSort } from "@/lib/catalog-filter";

export type ShopFilterState = {
  search: string;
  category: string;
  subcategory: string;
  sort: CatalogSort;
  affordableOnly: boolean;
  page: number;
};

export const DEFAULT_SHOP_FILTERS: ShopFilterState = {
  search: "",
  category: "all",
  subcategory: "all",
  sort: "recommended",
  affordableOnly: false,
  page: 1,
};

const validSorts = new Set<CatalogSort>(["recommended", "cheap", "expensive", "name"]);

export function parseShopFilters(params: URLSearchParams): ShopFilterState {
  const sortValue = params.get("sort") as CatalogSort | null;
  const pageValue = Number(params.get("page"));
  return {
    search: (params.get("q") ?? "").slice(0, 120),
    category: params.get("cat") || "all",
    subcategory: params.get("sub") || "all",
    sort: sortValue && validSorts.has(sortValue) ? sortValue : "recommended",
    affordableOnly: params.get("aff") === "1",
    page: Number.isInteger(pageValue) && pageValue > 0 ? Math.min(pageValue, 10_000) : 1,
  };
}

export function serializeShopFilters(filters: ShopFilterState): string {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("q", filters.search.trim());
  if (filters.category !== "all") params.set("cat", filters.category);
  if (filters.subcategory !== "all") params.set("sub", filters.subcategory);
  if (filters.sort !== "recommended") params.set("sort", filters.sort);
  if (filters.affordableOnly) params.set("aff", "1");
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function hasActiveShopFilters(filters: ShopFilterState): boolean {
  return Boolean(filters.search.trim() || filters.category !== "all" || filters.subcategory !== "all" || filters.sort !== "recommended" || filters.affordableOnly || filters.page > 1);
}
