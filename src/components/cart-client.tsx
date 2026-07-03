"use client";

import { MoneyDisplay } from "@/components/money-display";
import { ProductMedia } from "@/components/product-media";
import { QuantityControl } from "@/components/quantity-control";
import { useGame } from "@/context/game-context";
import { useToast } from "@/context/toast-context";
import { useLanguage } from "@/i18n/language-context";
import { formatMoneyFromSek, formatPercent } from "@/lib/format";
import { getProductText } from "@/lib/product-text";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";

export function CartClient() {
  const { hydrated, catalogReady, cart, products, currency, total, remaining, spentRatio, startingBudgetSek, totalQuantity, updateQuantity, removeItem } = useGame();
  const { showToast } = useToast();
  const { t, locale, language } = useLanguage();
  const productMap = new Map(products.map((product) => [product.id, product]));
  const entries = cart.flatMap((item) => {
    const product = productMap.get(item.productId);
    return product ? [{ item, product, subtotal: product.priceSek * item.quantity, copy: getProductText(product, language) }] : [];
  });

  if (!hydrated || (cart.length > 0 && !catalogReady)) return <div className="shell min-h-[65vh] py-12"><div className="h-72 animate-pulse rounded-xl bg-white/5" /></div>;
  if (entries.length === 0) return <section className="bg-[var(--paper)] py-24 text-center text-[var(--ink)]"><div className="shell max-w-xl"><h1 className="font-display text-5xl">{t("cart.empty")}</h1><p className="mt-4 text-black/55">{t("cart.emptyCopy")}</p><Link href="/shop" className="primary-button mt-6"><ArrowLeft className="h-4 w-4" /> {t("nav.shop")}</Link></div></section>;

  return (
    <section className="bg-[var(--paper)] py-8 text-[var(--ink)]"><div className="shell">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><p className="eyebrow text-[var(--gold-dark)]">{t("cart.eyebrow")}</p><h1 className="mt-2 font-display text-5xl">{t("cart.title")}</h1></div><Link href="/shop" className="secondary-button"><ArrowLeft className="h-4 w-4" /> {t("cart.continue")}</Link></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
          <div className="hidden grid-cols-[64px_1fr_120px_160px_42px] gap-3 border-b border-black/10 bg-black/[.025] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.13em] text-black/40 md:grid"><span>{t("cart.product")}</span><span></span><span>{t("cart.quantity")}</span><span className="text-right">{t("cart.subtotal")}</span><span></span></div>
          {entries.map(({ item, product, subtotal, copy }) => <article key={product.id} className="grid gap-3 border-b border-black/8 p-3 last:border-0 md:grid-cols-[64px_1fr_120px_160px_42px] md:items-center">
            <div className="h-14 overflow-hidden rounded-md bg-black"><ProductMedia product={product} compact /></div>
            <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--gold-dark)]">{copy.categoryLabel} · {copy.subcategoryLabel}</p><Link href={`/produkt/?mode=${product.mode}&id=${product.id}`} className="mt-1 block truncate font-display text-lg">{copy.name}</Link><p className="mt-1 text-xs text-black/45">{formatMoneyFromSek(product.priceSek, currency, locale)} / st</p></div>
            <QuantityControl value={item.quantity} onChange={(value) => { const result = updateQuantity(product.id, value); if (!result.ok) showToast(t("product.missing", { amount: formatMoneyFromSek(result.missing, currency, locale) }), "error"); }} compact max={100_000} />
            <p className="font-display text-lg md:text-right">{formatMoneyFromSek(subtotal, currency, locale)}</p>
            <button type="button" aria-label={`Ta bort ${copy.name}`} onClick={() => removeItem(product.id)} className="focus-ring grid h-9 w-9 place-items-center rounded-md border border-black/10 text-black/45 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
          </article>)}
        </div>
        <aside className="rounded-xl bg-[var(--ink)] p-5 text-white xl:sticky xl:top-24">
          <h2 className="font-display text-3xl">{t("cart.summary")}</h2>
          <dl className="mt-5 divide-y divide-white/10 text-sm">
            <div className="grid grid-cols-[1fr_minmax(0,1.6fr)] gap-4 py-3"><dt className="text-white/50">{t("cart.total")}</dt><dd className="min-w-0 text-right font-semibold text-white"><MoneyDisplay valueSek={total} currency={currency} compactClassName="block text-[10px] font-normal text-white/40" /></dd></div>
            <div className="grid grid-cols-[1fr_minmax(0,1.6fr)] gap-4 py-3"><dt className="text-white/50">{t("budget.remaining")}</dt><dd className="min-w-0 text-right font-semibold text-[var(--gold)]"><MoneyDisplay valueSek={remaining} currency={currency} compactClassName="block text-[10px] font-normal text-white/40" /></dd></div>
            <div className="grid grid-cols-2 gap-4 py-3"><dt className="text-white/50">{t("cart.shareUsed")}</dt><dd className="text-right font-semibold">{formatPercent(spentRatio, 1, locale)}</dd></div>
            <div className="grid grid-cols-2 gap-4 py-3"><dt className="text-white/50">{t("budget.budget")}</dt><dd className="text-right font-semibold"><MoneyDisplay valueSek={startingBudgetSek} currency={currency} compactClassName="block text-[10px] font-normal text-white/40" /></dd></div>
            <div className="grid grid-cols-2 gap-4 py-3"><dt className="text-white/50">{t("cart.quantity")}</dt><dd className="text-right font-semibold">{totalQuantity.toLocaleString(locale)}</dd></div>
          </dl>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${Math.min(100, spentRatio * 100)}%` }} /></div>
          <Link href="/kassa" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--gold)] px-4 text-sm font-bold text-black">{t("cart.checkout")} <ArrowRight className="h-4 w-4" /></Link>
        </aside>
      </div>
    </div></section>
  );
}
