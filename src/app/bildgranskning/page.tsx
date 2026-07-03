import { ImageReviewClient } from "@/components/image-review-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bildgranskning",
  robots: { index: false, follow: false },
};
export const dynamic = "force-static";

export default function ImageReviewPage() {
  return <section className="bg-[var(--paper)] py-12 text-[var(--ink)]"><div className="shell max-w-[1480px]"><p className="eyebrow text-[var(--gold-dark)]">Internt kvalitetsverktyg</p><h1 className="mt-3 font-display text-5xl md:text-6xl">Granska produktbilder</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-black/55">Här visas bilder som Wikimedia-importeraren har valt. Kontrollera att rätt modell syns innan bilden godkänns. Låg eller medelhög säkerhet ska alltid granskas extra noga.</p><ImageReviewClient /></div></section>;
}
