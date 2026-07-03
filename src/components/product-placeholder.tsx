"use client";

import { useLanguage } from "@/i18n/language-context";
import { getProductText } from "@/lib/product-text";
import { Gem, Home, Plane, ShoppingBag, Smartphone, Sparkles, Watch, Waves } from "lucide-react";
import type { Product } from "@/types";

const icons = [Gem, Home, Plane, ShoppingBag, Smartphone, Sparkles, Watch, Waves];

export function ProductPlaceholder({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { language } = useLanguage();
  const copy = getProductText(product, language);
  const Icon = icons[Math.abs(product.categoryId.length + product.name.length) % icons.length];
  return (
    <div className={`placeholder-card placeholder-${product.mode} ${compact ? "p-3" : "p-5"}`}>
      <div className="flex items-start justify-between gap-3"><Icon className="h-5 w-5 text-white/55" /><span className="text-[10px] font-bold uppercase tracking-[.14em] text-white/40">{copy.subcategoryLabel}</span></div>
      <div><p className="max-w-[18rem] font-display text-xl leading-tight text-white md:text-2xl">{copy.name}</p><p className="mt-2 text-xs text-white/45">Bildplats · {product.id}</p></div>
    </div>
  );
}
