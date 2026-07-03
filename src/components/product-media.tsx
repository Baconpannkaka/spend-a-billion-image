"use client";

import { useCatalogContext } from "@/catalog/catalog-context";
import { ProductPlaceholder } from "@/components/product-placeholder";
import Image from "next/image";
import { withBasePath } from "@/lib/assets";
import type { Product } from "@/types";

export function ProductMedia({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { getImage } = useCatalogContext();
  const image = getImage(product.id);
  if (!image) return <ProductPlaceholder product={product} compact={compact} />;
  return <Image src={withBasePath(image.path)} alt={image.alt} width={image.width ?? 1200} height={image.height ?? 900} className="h-full w-full object-cover" />;
}
