import { ProductDetailClient } from "@/components/product-detail-client";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Produkt" };
export default function ProductPage() { return <Suspense fallback={<div className="shell min-h-[65vh] py-12"><div className="h-[32rem] animate-pulse rounded-xl bg-white/5" /></div>}><ProductDetailClient /></Suspense>; }
