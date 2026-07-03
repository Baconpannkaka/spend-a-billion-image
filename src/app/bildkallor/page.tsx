import type { ImageManifest, ImageReviewQueue } from "@/types";
import { ExternalLink, Images, ImageIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import path from "node:path";

export const metadata: Metadata = { title: "Bildkällor" };
export const dynamic = "force-static";

function readJson<T>(filename: string, fallback: T): T {
  try { return JSON.parse(readFileSync(path.join(process.cwd(), "public", "data", filename), "utf8")) as T; }
  catch { return fallback; }
}

export default function ImageSourcesPage() {
  const manifest = readJson<ImageManifest>("image-manifest.json", { version: 2, generatedAt: "", images: [] });
  const review = readJson<ImageReviewQueue>("image-review.json", { version: 2, generatedAt: "", items: [] });
  const sourced = manifest.images.filter((image) => image.status === "approved");
  const pending = review.items.filter((item) => item.status === "pending").length;
  return <section className="bg-[var(--paper)] py-12 text-[var(--ink)]"><div className="shell max-w-6xl"><p className="eyebrow text-[var(--gold-dark)]">Automatiskt bildregister</p><h1 className="mt-3 font-display text-5xl md:text-6xl">Bildkällor</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-black/55">Godkända bilder läses från ett centralt manifest. Produkter utan godkänd bild använder automatiskt en kategoribaserad placeholder.</p>
    <div className="mt-6 flex flex-wrap gap-3"><div className="rounded-lg border border-black/10 bg-white px-4 py-3"><span className="block text-2xl font-semibold">{sourced.length}</span><span className="text-xs text-black/50">Godkända bilder</span></div><div className="rounded-lg border border-black/10 bg-white px-4 py-3"><span className="block text-2xl font-semibold">{pending}</span><span className="text-xs text-black/50">Väntar på granskning</span></div><Link href="/bildgranskning" className="secondary-button"><Images className="h-4 w-4" />Öppna bildgranskning</Link></div>
    {sourced.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-black/20 bg-white/55 p-10 text-center"><ImageIcon className="mx-auto h-7 w-7 text-black/35" /><h2 className="mt-3 font-display text-3xl">Inga externa bilder är godkända ännu</h2><p className="mt-2 text-sm text-black/50">Kör Wikimedia-importen och granska resultaten. Godkända bilder visas automatiskt här och i shoppen.</p></div> : <div className="mt-8 overflow-x-auto rounded-xl border border-black/10 bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-black/[.035]"><tr><th className="p-3">Produkt-id</th><th className="p-3">Fotograf</th><th className="p-3">Källa</th><th className="p-3">Licens</th></tr></thead><tbody>{sourced.map((image) => <tr key={image.productId} className="border-t border-black/8"><td className="p-3 font-mono text-xs">{image.productId}</td><td className="p-3">{image.creator ?? "Ej angivet"}</td><td className="p-3"><a href={image.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">Öppna <ExternalLink className="h-3 w-3" /></a></td><td className="p-3">{image.licenseUrl ? <a href={image.licenseUrl} target="_blank" rel="noreferrer" className="underline">{image.license}</a> : image.license}</td></tr>)}</tbody></table></div>}</div></section>;
}
