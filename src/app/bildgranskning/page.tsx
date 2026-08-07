import { ImageReviewClient } from "@/components/image-review-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin – bildgranskning",
  robots: { index: false, follow: false },
};
export const dynamic = "force-static";

export default function ImageReviewPage() {
  return <section className="bg-[var(--paper)] py-12 text-[var(--ink)]">
    <div className="shell max-w-[1560px]">
      <p className="eyebrow text-[var(--gold-dark)]">Admin · internt kvalitetsverktyg</p>
      <h1 className="mt-3 font-display text-5xl md:text-6xl">Granska produktbilder</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-black/55">Markera många bilder samtidigt, godkänn eller neka och skicka besluten direkt till GitHub. Nekade kandidater sparas som feedback så att samma felträff inte väljs igen vid nästa import.</p>
      <ImageReviewClient />
    </div>
  </section>;
}
