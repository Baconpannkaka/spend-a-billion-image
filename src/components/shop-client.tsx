"use client";

import { AdPageLayout } from "@/components/ad-page-layout";
import { AdSlot } from "@/components/ad-slot";
import { BudgetBar } from "@/components/budget-bar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ProductCard } from "@/components/product-card";
import { useGame } from "@/context/game-context";
import { useLanguage } from "@/i18n/language-context";
import { filterAndSortProducts, type CatalogSort } from "@/lib/catalog-filter";
import { CATALOG_PAGE_SIZE } from "@/lib/constants";
import { getProductText } from "@/lib/product-text";
import { hasActiveShopFilters, parseShopFilters, serializeShopFilters, type ShopFilterState } from "@/lib/shop-query";
import { ChevronLeft, ChevronRight, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export function ShopClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, locale, language } = useLanguage();
  const { hydrated, hasStarted, catalogReady, mode, products, remaining, resetGame, budgetSourceLabel } = useGame();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const filters = useMemo(() => parseShopFilters(new URLSearchParams(searchParams.toString())), [searchParams]);

  function updateFilters(patch: Partial<ShopFilterState>) {
    const next = { ...filters, ...patch };
    const query = serializeShopFilters(next);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const categories = useMemo(() => {
    const map = new Map<string, { id: string; label: string; subcategories: Map<string, string> }>();
    for (const product of products) {
      const copy = getProductText(product, language);
      const current = map.get(product.categoryId) ?? { id: product.categoryId, label: copy.categoryLabel, subcategories: new Map<string, string>() };
      current.subcategories.set(product.subcategoryId, copy.subcategoryLabel);
      map.set(product.categoryId, current);
    }
    return Array.from(map.values());
  }, [products, language]);

  const subcategories = useMemo(() => filters.category === "all" ? [] : Array.from(categories.find((item) => item.id === filters.category)?.subcategories.entries() ?? []), [categories, filters.category]);
  const filtered = useMemo(() => filterAndSortProducts(products, {
    search: filters.search,
    categoryId: filters.category,
    subcategoryId: filters.subcategory,
    affordableOnly: filters.affordableOnly,
    remainingBudgetSek: remaining,
    sort: filters.sort,
  }), [products, filters.search, filters.category, filters.subcategory, filters.affordableOnly, remaining, filters.sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / CATALOG_PAGE_SIZE));
  const safePage = Math.min(filters.page, pages);
  const visible = filtered.slice((safePage - 1) * CATALOG_PAGE_SIZE, safePage * CATALOG_PAGE_SIZE);
  const currentQuery = serializeShopFilters({ ...filters, page: safePage });
  const returnTo = `${pathname}${currentQuery ? `?${currentQuery}` : ""}`;
  const activeFilters = hasActiveShopFilters(filters);
  const verifiedCount = useMemo(() => products.filter((product) => product.dataQuality === "verified").length, [products]);

  if (!hydrated || (hasStarted && !catalogReady)) return <div className="shell min-h-[70vh] py-12"><div className="h-28 animate-pulse rounded-xl bg-white/5" /><div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-xl bg-white/5" />)}</div></div>;
  if (!hasStarted) return <section className="bg-[var(--paper)] py-24 text-center text-[var(--ink)]"><div className="shell max-w-xl"><h1 className="font-display text-5xl">{t("shop.chooseMode")}</h1><p className="mt-4 text-black/55">{t("shop.chooseModeCopy")}</p><Link href="/" className="primary-button mt-6">{t("shop.toStart")}</Link></div></section>;

  return (
    <>
      <section className="border-b border-white/10 py-7"><div className="shell flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="eyebrow">{mode === "luxury" ? t("landing.luxury") : t("landing.everyday")} · {t("landing.products")}</p><h1 className="mt-2 font-display text-4xl text-white md:text-5xl">{mode === "luxury" ? t("shop.luxuryTitle") : t("shop.everydayTitle")}</h1><p className="mt-2 text-sm text-white/45">{budgetSourceLabel}</p></div><button type="button" onClick={() => setConfirmOpen(true)} className="secondary-dark-button"><RotateCcw className="h-4 w-4" /> {t("shop.newGame")}</button></div></section>
      <div className="sticky top-16 z-40 border-b border-white/10 bg-[rgba(12,12,11,.96)] py-2.5 backdrop-blur-xl"><div className="shell"><BudgetBar /></div></div>
      <section className="bg-[var(--paper)] py-7 text-[var(--ink)]"><div className="ad-shell"><AdPageLayout>
        <div className="filter-panel">
          <label className="block lg:col-span-2"><span className="sr-only">Sök produkter</span><input type="text" value={filters.search} onChange={(event) => updateFilters({ search: event.target.value, page: 1 })} placeholder={mode === "luxury" ? t("shop.searchLuxury") : t("shop.searchEveryday")} className="field" /></label>
          <label><span className="sr-only">Kategori</span><select value={filters.category} onChange={(event) => updateFilters({ category: event.target.value, subcategory: "all", page: 1 })} className="field"><option value="all">{t("shop.allCategories")}</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label><span className="sr-only">Underkategori</span><select value={filters.subcategory} onChange={(event) => updateFilters({ subcategory: event.target.value, page: 1 })} disabled={filters.category === "all"} className="field disabled:opacity-45"><option value="all">{t("shop.allSubcategories")}</option>{subcategories.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
          <label><span className="sr-only">Sortering</span><select value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value as CatalogSort, page: 1 })} className="field"><option value="recommended">{t("shop.recommended")}</option><option value="cheap">{t("shop.cheapest")}</option><option value="expensive">{t("shop.expensive")}</option><option value="name">{t("shop.name")}</option></select></label>
          <label className="flex h-10 items-center gap-2 rounded-md border border-black/10 bg-white px-3 text-xs font-semibold"><input type="checkbox" checked={filters.affordableOnly} onChange={(event) => updateFilters({ affordableOnly: event.target.checked, page: 1 })} className="h-4 w-4 accent-black" /> {t("shop.affordable")}</label>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-3"><p className="text-sm text-black/50">{t("shop.results", { count: filtered.length.toLocaleString(locale), page: safePage, pages })}</p>{activeFilters && <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="inline-flex items-center gap-1.5 rounded-md border border-black/12 bg-white px-2.5 py-1.5 text-xs font-bold text-black/60 hover:text-black"><X className="h-3.5 w-3.5" /> {t("shop.clear")}</button>}</div><p className="flex items-center gap-2 text-xs text-black/40"><SlidersHorizontal className="h-4 w-4" /> {verifiedCount.toLocaleString(locale)} kvalitetssäkrade verkliga produkter visas först</p></div>
        {visible.length > 0 ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">{visible.map((product) => <ProductCard key={product.id} product={product} returnTo={returnTo} />)}</div> : <div className="mt-6 rounded-xl border border-dashed border-black/20 bg-white/60 px-6 py-14 text-center"><h2 className="font-display text-3xl">{t("shop.empty")}</h2><p className="mt-2 text-sm text-black/50">{t("shop.emptyCopy")}</p>{activeFilters && <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="secondary-button mt-5"><X className="h-4 w-4" /> {t("shop.clear")}</button>}</div>}
        <AdSlot placement="shop-inline" className="mt-6" />
        {pages > 1 && <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Sidnavigering"><button type="button" disabled={safePage <= 1} onClick={() => { updateFilters({ page: safePage - 1 }); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="page-button"><ChevronLeft className="h-4 w-4" /> {t("shop.previous")}</button><span className="px-3 text-sm font-semibold">{safePage} / {pages}</span><button type="button" disabled={safePage >= pages} onClick={() => { updateFilters({ page: safePage + 1 }); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="page-button">{t("shop.next")} <ChevronRight className="h-4 w-4" /></button></nav>}
      </AdPageLayout></div></section>
      <ConfirmDialog open={confirmOpen} title={t("shop.confirmTitle")} description={t("shop.confirmCopy")} confirmLabel={t("shop.confirm")} onClose={() => setConfirmOpen(false)} onConfirm={() => { resetGame(); router.push("/"); }} />
    </>
  );
}
