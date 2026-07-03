import { getProductSearchText } from "@/lib/product-text";
import type { Product } from "@/types";

export type CatalogSort = "recommended" | "cheap" | "expensive" | "name";

const qualityRank = { verified: 3, curated: 2, generated: 1 } as const;

export function filterAndSortProducts(products: Product[], options: {
  search: string;
  categoryId: string;
  subcategoryId: string;
  affordableOnly: boolean;
  remainingBudgetSek: number;
  sort: CatalogSort;
}): Product[] {
  const query = options.search.trim().toLocaleLowerCase("sv");
  const result = products.filter((product) => {
    const haystack = getProductSearchText(product).toLocaleLowerCase("sv");
    return (!query || haystack.includes(query))
      && (options.categoryId === "all" || product.categoryId === options.categoryId)
      && (options.subcategoryId === "all" || product.subcategoryId === options.subcategoryId)
      && (!options.affordableOnly || product.priceSek <= options.remainingBudgetSek);
  });
  return [...result].sort((a, b) => {
    if (options.sort === "cheap") return a.priceSek - b.priceSek;
    if (options.sort === "expensive") return b.priceSek - a.priceSek;
    if (options.sort === "name") return a.name.localeCompare(b.name, "sv");
    const qualityDifference = qualityRank[b.dataQuality ?? "generated"] - qualityRank[a.dataQuality ?? "generated"];
    return qualityDifference
      || Number(Boolean(b.featured)) - Number(Boolean(a.featured))
      || a.id.localeCompare(b.id);
  });
}
