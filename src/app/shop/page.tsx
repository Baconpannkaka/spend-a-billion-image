import { ShopClient } from "@/components/shop-client";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Shop", description: "Sök, filtrera och shoppa i din valda fantasikatalog." };
export default function ShopPage() {
  return <Suspense fallback={<div className="shell min-h-[70vh] py-12"><div className="h-28 animate-pulse rounded-xl bg-white/5" /></div>}><ShopClient /></Suspense>;
}
