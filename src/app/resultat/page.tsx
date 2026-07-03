import { ResultClient } from "@/components/result-client";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Resultat" };
export default function ResultPage() { return <Suspense fallback={<div className="shell min-h-[65vh] py-12"><div className="h-96 animate-pulse rounded-xl bg-white/5" /></div>}><ResultClient /></Suspense>; }
