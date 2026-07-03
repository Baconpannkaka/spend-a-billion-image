"use client";

import { ProductMedia } from "@/components/product-media";
import { QuantityControl } from "@/components/quantity-control";
import { useGame } from "@/context/game-context";
import { useToast } from "@/context/toast-context";
import { useLanguage } from "@/i18n/language-context";
import { formatMoneyFromSek } from "@/lib/format";
import { getProductText } from "@/lib/product-text";
import type { Product } from "@/types";
import { ExternalLink, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function ProductCard({ product, returnTo }: { product: Product; returnTo?: string }) {
  const { addItem, currency, remaining } = useGame();
  const { showToast } = useToast();
  const { t, locale, language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const affordable = Math.floor(remaining / product.priceSek);
  const copy = getProductText(product, language);
  const productHref = `/produkt/?mode=${product.mode}&id=${product.id}${returnTo ? `&from=${encodeURIComponent(returnTo)}` : ""}`;

  function add() {
    const result = addItem(product.id, quantity);
    if (result.ok) showToast(t("product.added", { count: quantity, name: copy.name }), "success");
    else showToast(t("product.missing", { amount: formatMoneyFromSek(result.missing, currency, locale) }), "error");
  }

  return (
    <article className="product-card">
      <Link href={productHref} className="focus-ring block aspect-[4/3] overflow-hidden bg-[#1a1a17]" aria-label={`${t("product.open")}: ${copy.name}`}><ProductMedia product={product} compact /></Link>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3"><p className="truncate text-[10px] font-bold uppercase tracking-[.13em] text-[var(--gold-dark)]">{copy.categoryLabel} · {copy.subcategoryLabel}</p>{product.collectible && <span className="rounded bg-black px-1.5 py-0.5 text-[9px] font-bold text-white">{product.collectible.gradingCompany} {product.collectible.grade}</span>}</div>
        <Link href={productHref} className="mt-2 block"><h2 className="line-clamp-2 min-h-[2.8rem] font-display text-[1.35rem] leading-[1.05]">{copy.name}</h2></Link>
        <p className="mt-2 text-lg font-semibold">{formatMoneyFromSek(product.priceSek, currency, locale)}</p>
        <div className="mt-3 flex items-center gap-2"><QuantityControl value={quantity} onChange={setQuantity} compact max={Math.max(1, affordable)} /><button type="button" disabled={affordable < 1} onClick={add} className="focus-ring inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-[var(--ink)] px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-35"><ShoppingBag className="h-3.5 w-3.5" /> {t("product.add")}</button><Link href={productHref} aria-label={t("product.open")} className="focus-ring grid h-8 w-8 place-items-center rounded-md border border-black/15"><ExternalLink className="h-3.5 w-3.5" /></Link></div>
        <p className="mt-2 text-[11px] text-black/40">{affordable > 0 ? t("product.canAfford", { count: affordable.toLocaleString(locale) }) : t("product.outside")}</p>
      </div>
    </article>
  );
}
