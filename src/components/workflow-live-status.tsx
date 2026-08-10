"use client";

import { CheckCircle2, Clock3, ExternalLink, LoaderCircle, RefreshCw, TriangleAlert, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const REPOSITORY = "Baconpannkaka/spend-a-billion-image";

export type WorkflowKind = "import" | "review";
export type WorkflowRequest = { kind: WorkflowKind; requestedAt: number };

type WorkflowRun = {
  id: number;
  run_number: number;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  jobs_url: string;
};

type WorkflowStep = {
  name: string;
  status: string;
  conclusion: string | null;
  number: number;
};

type WorkflowJob = {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  steps?: WorkflowStep[];
};

type WorkflowState = {
  run: WorkflowRun | null;
  stage: string;
  error: string;
};

type Props = {
  token: string;
  request: WorkflowRequest | null;
  onCompleted: () => void;
};

const WORKFLOWS: Record<WorkflowKind, { file: string; label: string }> = {
  import: { file: "import-images.yml", label: "Bildimport" },
  review: { file: "review-images.yml", label: "Granskning & publicering" },
};

const STEP_LABELS: Record<string, string> = {
  "Set up job": "Startar GitHub-runner",
  "Check out repository": "Förbereder projektet",
  "Set up Node.js": "Förbereder byggmiljön",
  "Configure GitHub Pages": "Förbereder GitHub Pages",
  "Install dependencies": "Installerar beroenden",
  "Install image converter": "Installerar bildverktyg",
  "Generate product catalogs": "Genererar produktkataloger",
  "Import Wikimedia images": "Hämtar och matchar bilder",
  "Validate imported files": "Kontrollerar importerade bilder",
  "Apply review decision": "Verkställer bildbeslut",
  "Validate image data": "Kontrollerar bilddata",
  "Run full quality checks": "Kör kvalitetskontroller",
  "Build static site": "Bygger webbsidan",
  "Commit images and metadata": "Sparar bilder och metadata",
  "Commit decisions and feedback": "Sparar beslut och feedback",
  "Add import summary": "Skapar importöversikt",
  "Upload Pages artifact": "Förbereder publicering",
  "Deploy to GitHub Pages": "Publicerar webbsidan",
};

const EMPTY_STATE: WorkflowState = { run: null, stage: "", error: "" };

function githubHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function getJson<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, { headers: githubHeaders(token), cache: "no-store" });
  if (!response.ok) {
    let message = `GitHub svarade ${response.status}.`;
    try {
      const data = await response.json() as { message?: string };
      if (data.message) message = data.message;
    } catch {
      // Ignore malformed error bodies.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

function translatedStep(name = "") {
  return STEP_LABELS[name] ?? name || "Arbetar i GitHub";
}

async function readWorkflowState(kind: WorkflowKind, token: string): Promise<WorkflowState> {
  const workflow = WORKFLOWS[kind];
  const runs = await getJson<{ workflow_runs?: WorkflowRun[] }>(
    `https://api.github.com/repos/${REPOSITORY}/actions/workflows/${workflow.file}/runs?branch=main&event=workflow_dispatch&per_page=1`,
    token,
  );
  const run = runs.workflow_runs?.[0] ?? null;
  if (!run) return EMPTY_STATE;

  if (run.status === "queued" || run.status === "waiting" || run.status === "requested" || run.status === "pending") {
    return { run, stage: "Väntar på GitHub-runner", error: "" };
  }

  if (run.status === "completed" && run.conclusion === "success") {
    return { run, stage: "Klar och publicerad", error: "" };
  }

  let jobs: WorkflowJob[] = [];
  try {
    const payload = await getJson<{ jobs?: WorkflowJob[] }>(run.jobs_url, token);
    jobs = payload.jobs ?? [];
  } catch (reason) {
    if (run.status === "completed") {
      return { run, stage: "Körningen avslutades", error: reason instanceof Error ? reason.message : "Kunde inte läsa körningsdetaljer." };
    }
  }

  const allSteps = jobs.flatMap((job) => job.steps ?? []);
  const failedStep = allSteps.find((step) => step.conclusion === "failure");
  if (run.status === "completed") {
    const label = failedStep ? translatedStep(failedStep.name) : "GitHub-körningen";
    return { run, stage: `Fel i: ${label}`, error: "" };
  }

  const activeJob = jobs.find((job) => job.status === "in_progress") ?? jobs.find((job) => job.status === "queued");
  if (activeJob?.name === "deploy") return { run, stage: "Publicerar webbsidan", error: "" };

  const activeStep = activeJob?.steps?.find((step) => step.status === "in_progress")
    ?? activeJob?.steps?.find((step) => step.status === "queued" || step.status === "pending");
  if (activeStep) return { run, stage: translatedStep(activeStep.name), error: "" };

  const lastCompleted = [...allSteps].reverse().find((step) => step.status === "completed" && step.conclusion === "success");
  return { run, stage: lastCompleted ? `Efter: ${translatedStep(lastCompleted.name)}` : "Arbetar i GitHub", error: "" };
}

function isActive(run: WorkflowRun | null) {
  return Boolean(run && run.status !== "completed");
}

function isSuccess(run: WorkflowRun | null) {
  return Boolean(run && run.status === "completed" && run.conclusion === "success");
}

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("sv-SE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(date);
}

function WorkflowCard({ kind, state, request }: { kind: WorkflowKind; state: WorkflowState; request: WorkflowRequest | null }) {
  const { run } = state;
  const requestedButNotVisible = Boolean(
    request?.kind === kind
      && Date.now() - request.requestedAt < 30_000
      && (!run || new Date(run.created_at).getTime() < request.requestedAt - 5_000),
  );
  const active = requestedButNotVisible || isActive(run);
  const success = !requestedButNotVisible && isSuccess(run);
  const failed = Boolean(!requestedButNotVisible && run?.status === "completed" && run.conclusion && run.conclusion !== "success");
  const label = requestedButNotVisible ? "Startar körningen…" : state.stage || "Ingen körning hittad";

  return <div className={`rounded-xl border p-4 ${active ? "border-amber-300 bg-amber-50" : failed ? "border-red-200 bg-red-50" : success ? "border-emerald-200 bg-emerald-50" : "border-black/10 bg-white"}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.12em] text-black/45">{WORKFLOWS[kind].label}</p>
        <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
          {active ? <LoaderCircle className="h-4 w-4 animate-spin text-amber-700" /> : failed ? <XCircle className="h-4 w-4 text-red-700" /> : success ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : <Clock3 className="h-4 w-4 text-black/40" />}
          {label}
        </div>
        {state.error && <p className="mt-2 text-xs text-red-700">{state.error}</p>}
        {run && <p className="mt-2 text-[11px] text-black/45">Körning #{run.run_number} · senast ändrad {formatTime(run.updated_at)}</p>}
      </div>
      {run?.html_url && <a href={run.html_url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-black/55 underline">GitHub <ExternalLink className="h-3 w-3" /></a>}
    </div>
  </div>;
}

export function WorkflowLiveStatus({ token, request, onCompleted }: Props) {
  const [states, setStates] = useState<Record<WorkflowKind, WorkflowState>>({ import: EMPTY_STATE, review: EMPTY_STATE });
  const [pollError, setPollError] = useState("");
  const previous = useRef<Record<WorkflowKind, { id: number; status: string; conclusion: string | null } | null>>({ import: null, review: null });

  useEffect(() => {
    if (!token.trim()) {
      setPollError("");
      return;
    }

    let cancelled = false;
    async function poll() {
      try {
        const [importState, reviewState] = await Promise.all([
          readWorkflowState("import", token.trim()),
          readWorkflowState("review", token.trim()),
        ]);
        if (cancelled) return;

        const nextStates = { import: importState, review: reviewState };
        for (const kind of ["import", "review"] as WorkflowKind[]) {
          const nextRun = nextStates[kind].run;
          const previousRun = previous.current[kind];
          if (
            nextRun
            && nextRun.status === "completed"
            && nextRun.conclusion === "success"
            && previousRun
            && (previousRun.id !== nextRun.id || previousRun.status !== "completed")
          ) {
            onCompleted();
          }
          previous.current[kind] = nextRun ? { id: nextRun.id, status: nextRun.status, conclusion: nextRun.conclusion } : null;
        }

        setStates(nextStates);
        setPollError("");
      } catch (reason) {
        if (!cancelled) setPollError(reason instanceof Error ? reason.message : "Kunde inte läsa live-status från GitHub.");
      }
    }

    void poll();
    const timer = window.setInterval(() => void poll(), 5_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [token, request?.requestedAt, onCompleted]);

  if (!token.trim()) {
    return <div className="mt-4 flex items-center gap-2 rounded-xl border border-black/10 bg-white p-4 text-xs text-black/50"><RefreshCw className="h-4 w-4" />Ange GitHub-token ovan för att aktivera live-status.</div>;
  }

  return <div className="mt-4 rounded-xl border border-black/10 bg-white/60 p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold">Live-status</p>
        <p className="mt-1 text-xs text-black/45">Uppdateras automatiskt ungefär var femte sekund. Listan laddas om när en lyckad körning är färdigpublicerad.</p>
      </div>
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />Live</span>
    </div>
    {pollError && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"><TriangleAlert className="mr-1 inline h-4 w-4" />{pollError}</div>}
    <div className="mt-3 grid gap-3 lg:grid-cols-2">
      <WorkflowCard kind="import" state={states.import} request={request} />
      <WorkflowCard kind="review" state={states.review} request={request} />
    </div>
  </div>;
}
