"use client";

import { useLanguage } from "@/i18n/language-context";
import { withBasePath } from "@/lib/assets";
import { getProductPlaceholderSprite, PLACEHOLDER_SPRITE_COLUMNS, PLACEHOLDER_SPRITE_PATH, PLACEHOLDER_SPRITE_ROWS } from "@/lib/product-placeholder-image";
import { getProductText } from "@/lib/product-text";
import { Gem, Home, Plane, ShoppingBag, Smartphone, Sparkles, Watch, Waves } from "lucide-react";
import type { Product } from "@/types";

const icons = [Gem, Home, Plane, ShoppingBag, Smartphone, Sparkles, Watch, Waves];

function spritePosition(index: number, total: number): string {
  if (total <= 1) return "0%";
  return `${(index / (total - 1)) * 100}%`;
}

export function ProductPlaceholder({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { language } = useLanguage();
  const copy = getProductText(product, language);
  const sprite = getProductPlaceholderSprite(product);

  if (sprite) {
    return (
      <div
        role="img"
        aria-label={`${copy.categoryLabel}: ${copy.subcategoryLabel} – illustrationsbild`}
        className="h-full w-full bg-[#f1eee6] bg-no-repeat"
        style={{
          backgroundImage: `url("${withBasePath(PLACEHOLDER_SPRITE_PATH)}")`,
          backgroundSize: `${PLACEHOLDER_SPRITE_COLUMNS * 100}% ${PLACEHOLDER_SPRITE_ROWS * 100}%`,
          backgroundPosition: `${spritePosition(sprite.column, PLACEHOLDER_SPRITE_COLUMNS)} ${spritePosition(sprite.row, PLACEHOLDER_SPRITE_ROWS)}`,
        }}
      />
    );
  }

  const Icon = icons[Math.abs(product.categoryId.length + product.name.length) % icons.length];
  return (
    <div className={`placeholder-card placeholder-${product.mode} ${compact ? "p-3" : "p-5"}`}>
      <div className="flex items-start justify-between gap-3"><Icon className="h-5 w-5 text-white/55" /><span className="text-[10px] font-bold uppercase tracking-[.14em] text-white/40">{copy.subcategoryLabel}</span></div>
      <div><p className="max-w-[18rem] font-display text-xl leading-tight text-white md:text-2xl">{copy.name}</p><p className="mt-2 text-xs text-white/45">Bildplats · {product.id}</p></div>
    </div>
  );
}
