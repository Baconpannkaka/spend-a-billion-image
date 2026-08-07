"use client";

import { withBasePath } from "@/lib/assets";
import type { ImageReviewItem, ImageReviewQueue } from "@/types";
import {
  Check,
  CheckCheck,
  ExternalLink,
  ImageOff,
  KeyRound,
  RefreshCw,
  RotateCcw,
  SearchX,
  ShieldCheck,
  Sparkles,
  Square,
  SquareCheckBig,
  TriangleAlert,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type ReviewFilter = "pending" | "no-match" | "error" | "approved" | "rejected" | "all";
type Decision = "approve" | "reject";

const REPOSITORY = "Baconpannkaka/spend-a-billion-image";
const REVIEW_WORKFLOW = "review-images.yml";
const IMPORT_WORKFLOW = "import-images.yml";
const TOKEN_KEY = "spend-a-billion-admin-token";

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

async function dispatchWorkflow(token: string, workflow: string, inputs: Record<string, string>) {
  const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/actions/workflows/${workflow}/dispatches`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref: "main", inputs }),
  });

  if (!response.ok) {
    let message = `GitHub svarade ${response.status}.`;
    try {
      const data = await response.json() as { message?: string };
      if (data.message) message = data.message;
    } catch {
      // Ignore malformed error body.
    }
    throw new Error(message);
  }
}

export function ImageReviewClient() {
  const [queue, setQueue] = useState<ImageReviewQueue | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<ReviewFilter>("pending");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [batchSize, setBatchSize] = useState(50);

  function loadQueue() {
    setError("");
    fetch(`${withBasePath("/data/image-review.json")}?v=${Date.now()}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Kunde inte läsa granskningskön.");
        return response.json() as Promise<ImageReviewQueue>;
      })
      .then(setQueue)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Ett okänt fel uppstod."));
  }

  useEffect(() => {
    loadQueue();
    const saved = window.sessionStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  const counts = useMemo(() => {
    const result: Record<ReviewFilter, number> = { pending: 0, "no-match": 0, error: 0, approved: 0, rejected: 0, all: 0 };
    for (const item of queue?.items ?? []) {
      result[item.status] += 1;
      result.all += 1;
    }
    return result;
  }, [queue]);

  const visible = useMemo(
    () => (queue?.items ?? []).filter((item) => filter === "all" || item.status === filter),
    [filter, queue],
  );

  const actionable = useMemo(() => visible.filter((item) => item.status === "pending"), [visible]);
  const approveIds = useMemo(() => Object.entries(decisions).filter(([, value]) => value === "approve").map(([id]) => id), [decisions]);
  const rejectIds = useMemo(() => Object.entries(decisions).filter(([, value]) => value === "reject").map(([id]) => id), [decisions]);

  function persistToken(value: string) {
    setToken(value);
    if (value.trim()) window.sessionStorage.setItem(TOKEN_KEY, value.trim());
    else window.sessionStorage.removeItem(TOKEN_KEY);
  }

  function toggleSelected(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(actionable.map((item) => item.productId)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function applyDecision(decision: Decision) {
    if (selected.size === 0) return;
    setDecisions((current) => {
      const next = { ...current };
      for (const id of selected) next[id] = decision;
      return next;
    });
    setSelected(new Set());
  }

  function setSingleDecision(id: string, decision: Decision) {
    setDecisions((current) => ({ ...current, [id]: decision }));
  }

  function undoDecision(id: string) {
    setDecisions((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  async function submitDecisions() {
    if (!token.trim()) {
      setError("Klistra in en GitHub-token först. Den sparas bara i den här webbläsarfliken.");
      return;
    }
    if (approveIds.length === 0 && rejectIds.length === 0) return;

    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (approveIds.length > 0) {
        await dispatchWorkflow(token.trim(), REVIEW_WORKFLOW, {
          action: "approve-ids",
          product_ids: approveIds.join(","),
        });
      }
      if (rejectIds.length > 0) {
        await dispatchWorkflow(token.trim(), REVIEW_WORKFLOW, {
          action: "reject-ids",
          product_ids: rejectIds.join(","),
        });
      }
      setDecisions({});
      setNotice(`Skickat till GitHub: ${approveIds.length} godkända och ${rejectIds.length} nekade. Uppdateringen publiceras automatiskt när workflowet är klart.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Kunde inte skicka besluten till GitHub.");
    } finally {
      setBusy(false);
    }
  }

  async function importNextBatch() {
    if (!token.trim()) {
      setError("Klistra in en GitHub-token först.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await dispatchWorkflow(token.trim(), IMPORT_WORKFLOW, {
        scope: "all",
        limit: String(batchSize),
        approval_mode: "review",
        overwrite: "false",
      });
      setNotice(`Ny import av upp till ${batchSize} produkter har startats. Avvisade bilder och obehandlade produkter prioriteras.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Kunde inte starta en ny bildimport.");
    } finally {
      setBusy(false);
    }
  }

  if (!queue && !error) return <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-6 text-sm text-black/60"><RefreshCw className="h-4 w-4 animate-spin" /> Läser granskningskön…</div>;

  return <>
    <div className="mt-7 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-sm font-semibold"><KeyRound className="h-4 w-4 text-[var(--gold-dark)]" />Adminanslutning till GitHub</div>
          <p className="mt-1 text-xs leading-5 text-black/50">Använd en fine-grained GitHub-token med Actions: Read and write för detta repository. Token lagras endast i sessionStorage och försvinner när webbläsarsessionen avslutas.</p>
        </div>
        <div className="flex w-full max-w-xl gap-2">
          <input type="password" value={token} onChange={(event) => persistToken(event.target.value)} placeholder="github_pat_…" autoComplete="off" className="min-w-0 flex-1 rounded-md border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40" />
          {token && <button type="button" onClick={() => persistToken("")} className="rounded-md border border-black/10 px-3 text-xs font-semibold hover:bg-black/5">Glöm token</button>}
        </div>
      </div>
    </div>

    {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><TriangleAlert className="mr-2 inline h-4 w-4" />{error}</div>}
    {notice && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><ShieldCheck className="mr-2 inline h-4 w-4" />{notice}</div>}

    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {(["pending", "no-match", "error", "approved", "rejected", "all"] as ReviewFilter[]).map((status) => (
        <button key={status} type="button" onClick={() => { setFilter(status); clearSelection(); }} className={`rounded-lg border p-3 text-left transition ${filter === status ? "border-black bg-black text-white" : "border-black/10 bg-white hover:border-black/30"}`}>
          <span className="block text-2xl font-semibold">{counts[status]}</span>
          <span className={`text-xs ${filter === status ? "text-white/65" : "text-black/50"}`}>{labels[status]}</span>
        </button>
      ))}
    </div>

    <div className="sticky top-16 z-30 mt-5 rounded-xl border border-black/10 bg-[rgba(250,248,241,.96)] p-3 shadow-sm backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={selectAllVisible} disabled={actionable.length === 0} className="secondary-button disabled:opacity-40"><SquareCheckBig className="h-4 w-4" />Markera alla synliga</button>
        <button type="button" onClick={clearSelection} disabled={selected.size === 0} className="secondary-button disabled:opacity-40"><Square className="h-4 w-4" />Avmarkera</button>
        <span className="mx-1 text-xs text-black/45">{selected.size} markerade</span>
        <button type="button" onClick={() => applyDecision("approve")} disabled={selected.size === 0} className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"><Check className="mr-1 inline h-4 w-4" />Godkänn markerade</button>
        <button type="button" onClick={() => applyDecision("reject")} disabled={selected.size === 0} className="rounded-md bg-rose-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"><X className="mr-1 inline h-4 w-4" />Neka markerade</button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-emerald-800">{approveIds.length} godkänn</span>
          <span className="text-xs font-semibold text-rose-800">{rejectIds.length} neka</span>
          <button type="button" onClick={submitDecisions} disabled={busy || (approveIds.length === 0 && rejectIds.length === 0)} className="primary-button disabled:cursor-not-allowed disabled:opacity-40"><CheckCheck className="h-4 w-4" />{busy ? "Arbetar…" : "Verkställ beslut"}</button>
        </div>
      </div>
    </div>

    <div className="mt-5 flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-sm font-semibold">Nästa batch</p><p className="mt-1 text-xs text-black/50">När du är klar hämtas nya kandidater för avvisade och ännu obehandlade produkter.</p></div>
      <div className="flex items-center gap-2">
        <select value={batchSize} onChange={(event) => setBatchSize(Number(event.target.value))} className="rounded-md border border-black/15 bg-white px-3 py-2 text-sm">
          {[25, 50, 100].map((value) => <option key={value} value={value}>{value} bilder</option>)}
        </select>
        <button type="button" onClick={importNextBatch} disabled={busy} className="secondary-button disabled:opacity-40"><Sparkles className="h-4 w-4" />Gör ny inläsning</button>
        <button type="button" onClick={loadQueue} disabled={busy} className="secondary-button disabled:opacity-40"><RefreshCw className="h-4 w-4" />Uppdatera listan</button>
      </div>
    </div>

    {visible.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-black/20 bg-white/50 p-10 text-center"><ImageOff className="mx-auto h-7 w-7 text-black/35" /><h2 className="mt-3 font-display text-3xl">Inget att visa här</h2><p className="mt-2 text-sm text-black/50">Kör bildimporten eller välj ett annat filter.</p></div> : <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {visible.map((item) => {
        const isSelected = selected.has(item.productId);
        const decision = decisions[item.productId];
        const canReview = item.status === "pending";
        return <article key={item.productId} className={`overflow-hidden rounded-xl border bg-white shadow-sm transition ${decision === "approve" ? "border-emerald-500 ring-2 ring-emerald-200" : decision === "reject" ? "border-rose-500 ring-2 ring-rose-200" : isSelected ? "border-black ring-2 ring-black/15" : "border-black/10"}`}>
          <button type="button" onClick={() => canReview && toggleSelected(item.productId)} disabled={!canReview} className="relative block aspect-[4/3] w-full bg-[#171713] text-left disabled:cursor-default">
            {item.selected?.path ? <Image src={withBasePath(item.selected.path)} alt={`Föreslagen bild för ${item.productName}`} fill sizes="(min-width:1536px) 25vw, (min-width:1280px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover" /> : <div className="grid h-full place-items-center text-center text-white/45">{item.status === "no-match" ? <SearchX className="h-10 w-10" /> : <TriangleAlert className="h-10 w-10" />}</div>}
            <div className="absolute left-3 top-3"><StatusBadge item={item} /></div>
            {item.confidence !== "none" && <div className="absolute right-3 top-3 rounded-full bg-black/75 px-2 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-white">{item.confidence} · {Math.round(item.score)}</div>}
            {canReview && <div className={`absolute bottom-3 left-3 grid h-8 w-8 place-items-center rounded-md border-2 ${isSelected ? "border-white bg-black text-white" : "border-white/80 bg-black/40 text-transparent"}`}>{isSelected ? <Check className="h-5 w-5" /> : <Square className="h-5 w-5" />}</div>}
            {decision && <div className={`absolute bottom-3 right-3 rounded-md px-3 py-2 text-xs font-bold text-white ${decision === "approve" ? "bg-emerald-700" : "bg-rose-700"}`}>{decision === "approve" ? "GODKÄNN" : "NEKA"}</div>}
          </button>
          <div className="p-4">
            <p className="font-mono text-[10px] text-black/40">{item.productId}</p>
            <h2 className="mt-1 font-display text-2xl leading-tight">{item.productName}</h2>
            <p className="mt-1 text-xs text-black/45">{item.brand || item.categoryLabel}</p>
            {item.selected ? <div className="mt-4 space-y-2 text-xs leading-5 text-black/60">
              <p><strong className="text-black/75">Licens:</strong> {item.selected.license}</p>
              <p><strong className="text-black/75">Fotograf:</strong> {item.selected.creator || "Ej angivet"}</p>
              <a href={item.selected.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[var(--gold-dark)] underline">Öppna Commons-filen <ExternalLink className="h-3 w-3" /></a>
            </div> : <p className="mt-4 text-xs leading-5 text-black/55">{item.notes.join(" ")}</p>}
            {canReview && <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSingleDecision(item.productId, "approve")} className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100"><Check className="mr-1 inline h-4 w-4" />Godkänn</button>
              <button type="button" onClick={() => setSingleDecision(item.productId, "reject")} className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-900 hover:bg-rose-100"><X className="mr-1 inline h-4 w-4" />Neka</button>
            </div>}
            {decision && <button type="button" onClick={() => undoDecision(item.productId)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-black/45 underline"><RotateCcw className="h-3 w-3" />Ångra beslut</button>}
          </div>
        </article>;
      })}
    </div>}
  </>;
}
