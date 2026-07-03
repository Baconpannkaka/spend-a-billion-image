"use client";

import { withBasePath } from "@/lib/assets";
import type { ImageReviewItem, ImageReviewQueue } from "@/types";
import { Check, Clipboard, ExternalLink, ImageOff, RefreshCw, SearchX, ShieldCheck, TriangleAlert } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type ReviewFilter = "pending" | "no-match" | "error" | "approved" | "rejected" | "all";

const labels: Record<ReviewFilter, string> = {
  pending: "Väntar",
  "no-match": "Utan träff",
  error: "Fel",
  approved: "Godkända",
  rejected: "Avvisade",
  all: "Alla",
};

function StatusBadge({ item }: { item: ImageReviewItem }) {
  const styles: Record<ImageReviewItem["status"], string> = {
    pending: "border-amber-300 bg-amber-50 text-amber-900",
    approved: "border-emerald-300 bg-emerald-50 text-emerald-900",
    rejected: "border-rose-300 bg-rose-50 text-rose-900",
    "no-match": "border-slate-300 bg-slate-50 text-slate-700",
    error: "border-red-300 bg-red-50 text-red-900",
  };
  return <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${styles[item.status]}`}>{labels[item.status]}</span>;
}

export function ImageReviewClient() {
  const [queue, setQueue] = useState<ImageReviewQueue | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<ReviewFilter>("pending");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(withBasePath("/data/image-review.json"), { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Kunde inte läsa granskningskön.");
        return response.json() as Promise<ImageReviewQueue>;
      })
      .then(setQueue)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Ett okänt fel uppstod."));
  }, []);

  const counts = useMemo(() => {
    const result: Record<ReviewFilter, number> = { pending: 0, "no-match": 0, error: 0, approved: 0, rejected: 0, all: 0 };
    for (const item of queue?.items ?? []) {
      result[item.status] += 1;
      result.all += 1;
    }
    return result;
  }, [queue]);

  const visible = useMemo(() => (queue?.items ?? []).filter((item) => filter === "all" || item.status === filter), [filter, queue]);
  const pendingIds = useMemo(() => (queue?.items ?? []).filter((item) => item.status === "pending").map((item) => item.productId), [queue]);

  async function copyIds() {
    if (pendingIds.length === 0) return;
    const value = pendingIds.join(",");
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900"><TriangleAlert className="h-5 w-5" /><p className="mt-2 font-semibold">{error}</p></div>;
  if (!queue) return <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-6 text-sm text-black/60"><RefreshCw className="h-4 w-4 animate-spin" /> Läser granskningskön…</div>;

  return <>
    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {(["pending", "no-match", "error", "approved", "all"] as ReviewFilter[]).map((status) => (
        <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-lg border p-3 text-left transition ${filter === status ? "border-black bg-black text-white" : "border-black/10 bg-white hover:border-black/30"}`}>
          <span className="block text-2xl font-semibold">{counts[status]}</span>
          <span className={`text-xs ${filter === status ? "text-white/65" : "text-black/50"}`}>{labels[status]}</span>
        </button>
      ))}
    </div>

    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 bg-white/65 p-3">
      <p className="text-xs leading-5 text-black/55">Godkänn via <strong>Actions → Review imported product images</strong>. Kopiera ID:n här och välj <strong>approve-ids</strong>, eller välj <strong>approve-all</strong> efter att hela listan har kontrollerats.</p>
      <button type="button" onClick={copyIds} disabled={pendingIds.length === 0} className="secondary-button shrink-0 disabled:cursor-not-allowed disabled:opacity-40"><Clipboard className="h-4 w-4" />{copied ? "Kopierat" : `Kopiera ${pendingIds.length} väntande ID:n`}</button>
    </div>

    {visible.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-black/20 bg-white/50 p-10 text-center"><ImageOff className="mx-auto h-7 w-7 text-black/35" /><h2 className="mt-3 font-display text-3xl">Inget att visa här</h2><p className="mt-2 text-sm text-black/50">Kör bildimporten eller välj ett annat filter.</p></div> : <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {visible.map((item) => <article key={item.productId} className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <div className="relative aspect-[4/3] bg-[#171713]">
          {item.selected?.path ? <Image src={withBasePath(item.selected.path)} alt={`Föreslagen bild för ${item.productName}`} fill sizes="(min-width:1280px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover" /> : <div className="grid h-full place-items-center text-center text-white/45">{item.status === "no-match" ? <SearchX className="h-10 w-10" /> : <TriangleAlert className="h-10 w-10" />}</div>}
          <div className="absolute left-3 top-3"><StatusBadge item={item} /></div>
          {item.confidence !== "none" && <div className="absolute right-3 top-3 rounded-full bg-black/75 px-2 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-white">{item.confidence} · {Math.round(item.score)}</div>}
        </div>
        <div className="p-4">
          <p className="font-mono text-[10px] text-black/40">{item.productId}</p>
          <h2 className="mt-1 font-display text-2xl leading-tight">{item.productName}</h2>
          <p className="mt-1 text-xs text-black/45">{item.brand || item.categoryLabel}</p>
          {item.selected ? <div className="mt-4 space-y-2 text-xs leading-5 text-black/60">
            <p><strong className="text-black/75">Licens:</strong> {item.selected.license}</p>
            <p><strong className="text-black/75">Fotograf:</strong> {item.selected.creator || "Ej angivet"}</p>
            <a href={item.selected.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[var(--gold-dark)] underline">Öppna Commons-filen <ExternalLink className="h-3 w-3" /></a>
          </div> : <p className="mt-4 text-xs leading-5 text-black/55">{item.notes.join(" ")}</p>}
          {item.alternatives.length > 0 && <details className="mt-4 border-t border-black/8 pt-3"><summary className="cursor-pointer text-xs font-semibold text-black/55">{item.alternatives.length} alternativa träffar</summary><div className="mt-2 space-y-2">{item.alternatives.map((candidate) => <a key={candidate.sourceUrl} href={candidate.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 text-xs text-black/55 underline"><span className="truncate">{candidate.title.replace(/^File:/, "")}</span><span>{Math.round(candidate.score)}</span></a>)}</div></details>}
          {item.status === "approved" && <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800"><ShieldCheck className="h-4 w-4" />Visas nu i shoppen</p>}
          {item.status === "pending" && <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-800"><Check className="h-4 w-4" />Väntar på manuell kontroll</p>}
        </div>
      </article>)}
    </div>}
  </>;
}
