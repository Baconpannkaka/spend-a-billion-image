"use client";

import { useCatalog } from "@/catalog/use-catalog";
import { ProductMedia } from "@/components/product-media";
import { QuantityControl } from "@/components/quantity-control";
import { useGame } from "@/context/game-context";
import { useToast } from "@/context/toast-context";
import { useLanguage } from "@/i18n/language-context";
import { formatMoneyFromSek } from "@/lib/format";
import { getProductText } from "@/lib/product-text";
import type { TranslationKey } from "@/i18n/translations";
import type { GameMode, Product } from "@/types";
import { ArrowLeft, BadgeCheck, ExternalLink, Info, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

function getSafeReturnPath(value: string | null): string {
  if (!value) return "/shop";
  try {
    const decoded = decodeURIComponent(value);
    return decoded === "/shop" || decoded.startsWith("/shop?") ? decoded : "/shop";
  } catch {
    return "/shop";
  }
}

function getQualityKey(product: Product): TranslationKey {
  if (product.dataQuality === "verified") return "product.realModel";
  if (product.dataQuality === "curated") return "product.curatedOffer";
  return "product.catalogVariation";
}

function getPriceKey(product: Product): TranslationKey {
  if (product.priceType === "official-retail") return "product.priceOfficial";
  if (product.priceType === "market-estimate") return "product.priceMarket";
  return "product.priceFantasy";
}

export function ProductDetailClient() {
  const params = useSearchParams();
  const modeParam = params.get("mode");
  const mode: GameMode = modeParam === "everyday" ? "everyday" : "luxury";
  const productId = params.get("id") ?? "";
  const returnPath = getSafeReturnPath(params.get("from"));
  const { catalog, state } = useCatalog(mode);
  const { addItem, currency, remaining, hasStarted, mode: activeMode } = useGame();
  const { showToast } = useToast();
  const { t, locale, language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const product = useMemo(() => catalog?.products.find((entry) => entry.id === productId), [catalog, productId]);

  if (state === "loading" || !catalog) {
    return <div className="shell min-h-[65vh] py-12"><div className="h-[32rem] animate-pulse rounded-xl bg-white/5" /></div>;
  }

  if (!product) {
    return (
      <section className="bg-[var(--paper)] py-24 text-center text-[var(--ink)]">
        <div className="shell max-w-xl">
          <h1 className="font-display text-5xl">{t("product.notFound")}</h1>
          <p className="mt-4 text-black/55">{t("product.notFoundCopy")}</p>
          <Link href={returnPath} className="primary-button mt-6">{t("nav.shop")}</Link>
        </div>
      </section>
    );
  }

  const selectedProduct = product;
  const copy = getProductText(selectedProduct, language);
  const canBuyHere = hasStarted && activeMode === selectedProduct.mode;
  const affordable = canBuyHere ? Math.floor(remaining / selectedProduct.priceSek) : 0;
  const priceDate = selectedProduct.priceCheckedAt
    ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${selectedProduct.priceCheckedAt}T00:00:00Z`))
    : null;
  const sourceUrl = selectedProduct.sourceUrls?.[0];
  const QualityIcon = selectedProduct.dataQuality === "verified" ? BadgeCheck : selectedProduct.dataQuality === "curated" ? Sparkles : Info;

  function add() {
    if (!canBuyHere) {
      showToast(t("product.startMatchingMode"), "error");
      return;
    }
    const result = addItem(selectedProduct.id, quantity);
    if (result.ok) showToast(t("product.added", { count: quantity, name: copy.name }), "success");
    else showToast(t("product.missing", { amount: formatMoneyFromSek(result.missing, currency, locale) }), "error");
  }

  return (
    <section className="bg-[var(--paper)] py-8 text-[var(--ink)]">
      <div className="shell">
        <Link href={returnPath} className="inline-flex items-center gap-2 text-sm font-semibold text-black/55 hover:text-black">
          <ArrowLeft className="h-4 w-4" /> {t("product.back")}
        </Link>

        <div className="mt-5 grid gap-7 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-black"><ProductMedia product={selectedProduct} /></div>
          <div className="lg:pt-2">
            <p className="eyebrow text-[var(--gold-dark)]">{copy.categoryLabel} · {copy.subcategoryLabel}</p>
            <h1 className="mt-2 font-display text-5xl leading-[.95] md:text-6xl">{copy.name}</h1>
            {selectedProduct.brand && <p className="mt-3 text-sm font-semibold text-black/45">{selectedProduct.brand}</p>}
            <p className="mt-5 font-display text-3xl">{formatMoneyFromSek(selectedProduct.priceSek, currency, locale)}</p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 font-semibold text-black/65">
                <QualityIcon className="h-3.5 w-3.5 text-[var(--gold-dark)]" /> {t(getQualityKey(selectedProduct))}
              </span>
              <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-black/55">{t(getPriceKey(selectedProduct))}</span>
            </div>

            <p className="mt-5 text-sm leading-7 text-black/60">{copy.description}</p>

            {selectedProduct.collectible && (
              <dl className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-white p-4 text-sm">
                <div><dt className="text-black/40">Franchise</dt><dd className="font-semibold">{selectedProduct.collectible.franchise}</dd></div>
                <div><dt className="text-black/40">Set</dt><dd className="font-semibold">{selectedProduct.collectible.set}</dd></div>
                <div><dt className="text-black/40">Gradering</dt><dd className="font-semibold">{selectedProduct.collectible.gradingCompany} {selectedProduct.collectible.grade}</dd></div>
                <div><dt className="text-black/40">Kortnummer</dt><dd className="font-semibold">{selectedProduct.collectible.cardNumber}</dd></div>
              </dl>
            )}

            <ul className="mt-5 grid gap-2 text-sm text-black/55">
              {copy.facts.map((fact) => <li key={fact} className="rounded-md border border-black/10 bg-white px-3 py-2">{fact}</li>)}
            </ul>

            {(sourceUrl || priceDate) && (
              <div className="mt-5 rounded-lg border border-black/10 bg-black/[.025] p-4 text-xs text-black/50">
                {priceDate && <p>{t("product.priceChecked", { date: priceDate })}</p>}
                {sourceUrl && (
                  <a href={sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 font-semibold text-black/65 underline decoration-black/20 underline-offset-4 hover:text-black">
                    {t("product.openSource")} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <QuantityControl value={quantity} onChange={setQuantity} max={Math.max(1, affordable)} />
              <button type="button" onClick={add} disabled={!canBuyHere || affordable < 1} className="primary-button disabled:opacity-35">
                <ShoppingBag className="h-4 w-4" /> {t("product.addCollection")}
              </button>
            </div>
            <p className="mt-3 text-xs text-black/40">
              {canBuyHere ? (affordable > 0 ? t("product.canAfford", { count: affordable.toLocaleString(locale) }) : t("product.outside")) : t("product.startMatchingMode")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
