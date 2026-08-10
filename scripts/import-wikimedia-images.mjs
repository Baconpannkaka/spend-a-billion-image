import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import {
  buildSearchQueries,
  confidenceFromScore,
  downloadCandidate,
  filterAndRankCandidates,
  getCommonsFile,
  IMAGE_SEARCH_VERSION,
  normalizeForImageSearch,
  searchCommons,
} from "./lib/wikimedia-images.mjs";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const DATA_DIR = path.join(PUBLIC, "data");
const IMAGE_DIR = path.join(PUBLIC, "product-images");
const TEMP_DIR = path.join(ROOT, ".tmp", "image-import");
const MANIFEST_FILE = path.join(DATA_DIR, "image-manifest.json");
const REVIEW_FILE = path.join(DATA_DIR, "image-review.json");
const REPORT_FILE = path.join(DATA_DIR, "image-import-report.json");
const OVERRIDES_FILE = path.join(ROOT, "data", "image-overrides.json");
const FEEDBACK_FILE = path.join(ROOT, "data", "image-feedback.json");

const LEARNABLE_CONTEXT_TERMS = [
  "engine", "interior", "dashboard", "cockpit", "steering wheel", "wheel only",
  "launch event", "product launch", "keynote", "inside store", "shop display",
  "logo", "diagram", "poster", "screenshot",
];
const MAX_REJECT_RETRIES = 4;

function parseArgs(argv) {
  const result = {
    scope: "sample",
    limit: 30,
    approvalMode: "review",
    overwrite: false,
    dryRun: false,
    candidates: 12,
    delayMs: 350,
  };
  for (const raw of argv) {
    const [key, value = "true"] = raw.replace(/^--/, "").split("=");
    if (key === "scope") result.scope = value;
    else if (key === "limit") { const parsed = Number(value); result.limit = Number.isFinite(parsed) && parsed >= 0 ? parsed : 30; }
    else if (key === "approval-mode") result.approvalMode = value;
    else if (key === "overwrite") result.overwrite = value === "true";
    else if (key === "dry-run") result.dryRun = value === "true";
    else if (key === "candidates") result.candidates = Math.min(20, Math.max(3, Number(value) || 12));
    else if (key === "delay-ms") result.delayMs = Math.max(0, Number(value) || 0);
  }
  if (!["sample", "all", "luxury", "everyday"].includes(result.scope)) throw new Error(`Ogiltig scope: ${result.scope}`);
  if (!["review", "high-confidence", "approve"].includes(result.approvalMode)) throw new Error(`Ogiltigt approval-mode: ${result.approvalMode}`);
  return result;
}

async function readJson(filename, fallback) {
  try { return JSON.parse(await readFile(filename, "utf8")); }
  catch { return fallback; }
}

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

function selectStratified(products, limit) {
  if (limit <= 0 || products.length === 0) return [];
  const groups = new Map();
  for (const product of products) {
    const key = `${product.mode}:${product.categoryId}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(product);
  }
  const selected = [];
  const queues = [...groups.values()];
  let cursor = 0;
  while (selected.length < limit && queues.some((queue) => queue.length > 0)) {
    const queue = queues[cursor % queues.length];
    if (queue.length > 0) selected.push(queue.shift());
    cursor += 1;
  }
  return selected;
}

function isCompleted(current) {
  return current && ["approved", "unreviewed"].includes(current.status);
}

function classifyProduct(product, options, existingMap, reviewMap, feedback) {
  if (options.overwrite) return "fresh";
  const current = existingMap.get(product.id);
  if (isCompleted(current)) return "done";

  const item = reviewMap.get(product.id);
  if (!item) return "fresh";
  if (item.status === "rejected") {
    const rejectedCount = feedback.products?.[product.id]?.rejected?.length ?? 0;
    return rejectedCount < MAX_REJECT_RETRIES ? "rejected" : "exhausted";
  }
  if (item.status === "no-match") {
    return Number(item.searchVersion ?? 0) < IMAGE_SEARCH_VERSION ? "upgrade-retry" : "exhausted";
  }
  if (item.status === "error") return "error-retry";
  return "fresh";
}

function selectProducts(catalogs, options, existingMap, reviewMap, feedback) {
  const verified = catalogs.flatMap((catalog) => catalog.products.filter((product) => product.dataQuality === "verified"));
  const scoped = options.scope === "luxury" || options.scope === "everyday"
    ? verified.filter((product) => product.mode === options.scope)
    : verified;

  const buckets = {
    rejected: [],
    "upgrade-retry": [],
    "error-retry": [],
    fresh: [],
    exhausted: [],
    done: [],
  };
  for (const product of scoped) {
    buckets[classifyProduct(product, options, existingMap, reviewMap, feedback)].push(product);
  }

  const eligibleCount = buckets.rejected.length + buckets["upgrade-retry"].length + buckets["error-retry"].length + buckets.fresh.length;
  const requested = options.limit === 0 ? eligibleCount : Math.min(options.limit, eligibleCount);
  if (requested === 0) {
    return { products: [], selectionStats: { ...Object.fromEntries(Object.entries(buckets).map(([key, values]) => [key, values.length])), selected: 0 } };
  }

  const ordered = {
    rejected: selectStratified(buckets.rejected, buckets.rejected.length),
    "upgrade-retry": selectStratified(buckets["upgrade-retry"], buckets["upgrade-retry"].length),
    "error-retry": selectStratified(buckets["error-retry"], buckets["error-retry"].length),
    fresh: selectStratified(buckets.fresh, buckets.fresh.length),
  };
  const chosen = [];
  const chosenIds = new Set();

  function take(reason, amount) {
    const queue = ordered[reason];
    let taken = 0;
    while (queue.length > 0 && chosen.length < requested && taken < amount) {
      const product = queue.shift();
      if (!chosenIds.has(product.id)) {
        chosen.push(product);
        chosenIds.add(product.id);
        taken += 1;
      }
    }
  }

  take("rejected", Math.ceil(requested * 0.2));
  take("upgrade-retry", Math.ceil(requested * 0.4));
  take("error-retry", Math.ceil(requested * 0.1));
  take("fresh", requested - chosen.length);

  while (chosen.length < requested) {
    const before = chosen.length;
    for (const reason of ["rejected", "upgrade-retry", "fresh", "error-retry"]) {
      take(reason, requested - chosen.length);
      if (chosen.length >= requested) break;
    }
    if (chosen.length === before) break;
  }

  const reasonCounts = { rejected: 0, "upgrade-retry": 0, "error-retry": 0, fresh: 0 };
  for (const product of chosen) {
    const reason = classifyProduct(product, options, existingMap, reviewMap, feedback);
    if (reason in reasonCounts) reasonCounts[reason] += 1;
  }

  return {
    products: chosen,
    selectionStats: {
      ...reasonCounts,
      exhausted: buckets.exhausted.length,
      done: buckets.done.length,
      selected: chosen.length,
    },
  };
}

function deriveLearnedBadTerms(feedback) {
  const counts = new Map(LEARNABLE_CONTEXT_TERMS.map((term) => [term, { approved: 0, rejected: 0 }]));
  for (const entry of Object.values(feedback.products ?? {})) {
    for (const decision of ["approved", "rejected"]) {
      for (const item of entry?.[decision] ?? []) {
        const text = normalizeForImageSearch(`${item.commonsTitle ?? ""} ${item.sourceUrl ?? ""}`);
        for (const term of LEARNABLE_CONTEXT_TERMS) {
          if (text.includes(normalizeForImageSearch(term))) counts.get(term)[decision] += 1;
        }
      }
    }
  }
  return [...counts.entries()]
    .filter(([, value]) => value.rejected >= 1 && value.rejected > value.approved * 1.5)
    .map(([term]) => term);
}

function commandExists(command) {
  return new Promise((resolve) => {
    const child = spawn(command, ["-version"], { stdio: "ignore" });
    child.once("error", () => resolve(false));
    child.once("exit", (code) => resolve(code === 0));
  });
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve(stdout.trim()) : reject(new Error(stderr.trim() || `${command} avslutades med kod ${code}`)));
  });
}

async function convertToWebp(input, output) {
  const tool = await commandExists("magick") ? "magick" : await commandExists("convert") ? "convert" : null;
  if (!tool) throw new Error("ImageMagick saknas. Installera ImageMagick eller kör GitHub-workflowet.");
  const args = [input, "-auto-orient", "-resize", "1600x1200>", "-strip", "-quality", "82", output];
  await run(tool, args);
  const identifyArgs = tool === "magick" ? ["identify", "-format", "%w,%h", output] : ["-format", "%w,%h", output];
  const dimensions = tool === "magick" ? await run(tool, identifyArgs) : await run("identify", identifyArgs);
  const [width, height] = dimensions.split(",").map(Number);
  return { width, height };
}

function candidateSummary(candidate) {
  return {
    title: candidate.title,
    sourceUrl: candidate.sourceUrl,
    creator: candidate.metadata.creator,
    license: candidate.metadata.license,
    licenseUrl: candidate.metadata.licenseUrl,
    width: candidate.width,
    height: candidate.height,
    score: candidate.score,
    query: candidate.matchedQuery,
  };
}

function statusFor(confidence, mode) {
  if (mode === "approve") return "approved";
  if (mode === "high-confidence" && confidence === "high") return "approved";
  return "unreviewed";
}

function removeRejectedCandidates(productId, ranked, feedback) {
  const rejected = feedback.products?.[productId]?.rejected ?? [];
  if (rejected.length === 0) return ranked;
  const blockedUrls = new Set(rejected.map((entry) => entry.sourceUrl).filter(Boolean));
  const blockedTitles = new Set(rejected.map((entry) => entry.commonsTitle).filter(Boolean));
  return ranked.filter((candidate) => !blockedUrls.has(candidate.sourceUrl) && !blockedTitles.has(candidate.title));
}

function mergeCandidates(target, ranked) {
  for (const candidate of ranked) {
    const key = candidate.sourceUrl || candidate.title;
    const current = target.get(key);
    if (!current || candidate.score > current.score) target.set(key, candidate);
  }
}

function rankMerged(target) {
  return [...target.values()].sort((a, b) => b.score - a.score || (b.width * b.height) - (a.width * a.height));
}

const options = parseArgs(process.argv.slice(2));
await mkdir(IMAGE_DIR, { recursive: true });
await mkdir(TEMP_DIR, { recursive: true });
const [luxury, everyday, manifest, review, overrides, feedback] = await Promise.all([
  readJson(path.join(DATA_DIR, "catalog-luxury.json"), null),
  readJson(path.join(DATA_DIR, "catalog-everyday.json"), null),
  readJson(MANIFEST_FILE, { version: 2, generatedAt: "", images: [] }),
  readJson(REVIEW_FILE, { version: 2, generatedAt: "", items: [] }),
  readJson(OVERRIDES_FILE, {}),
  readJson(FEEDBACK_FILE, { version: 1, updatedAt: "", products: {} }),
]);
if (!luxury || !everyday) throw new Error("Produktkatalogerna saknas. Kör npm run catalog:generate först.");

const existingMap = new Map(manifest.images.map((image) => [image.productId, image]));
const reviewMap = new Map(review.items.map((item) => [item.productId, item]));
const learnedBadTerms = deriveLearnedBadTerms(feedback);
const selection = selectProducts([luxury, everyday], options, existingMap, reviewMap, feedback);
const selected = selection.products;
const report = {
  version: 3,
  searchVersion: IMAGE_SEARCH_VERSION,
  startedAt: new Date().toISOString(),
  options,
  selectionStats: selection.selectionStats,
  learnedBadTerms,
  totalSelected: selected.length,
  imported: 0,
  skipped: 0,
  noMatch: 0,
  errors: 0,
  feedbackFiltered: 0,
  queryRequests: 0,
  results: [],
};

console.log(`Bildsök v${IMAGE_SEARCH_VERSION}: ${selected.length} verifierade produkter (${options.scope}).`);
console.log(`Urval: ${JSON.stringify(selection.selectionStats)}.`);
if (learnedBadTerms.length > 0) console.log(`Lärda negativa bildsignaler: ${learnedBadTerms.join(", ")}.`);

for (let index = 0; index < selected.length; index += 1) {
  const product = selected[index];
  const current = existingMap.get(product.id);
  const previousReview = reviewMap.get(product.id);
  const previousAttempts = Number(previousReview?.attemptCount ?? 0);
  const override = overrides[product.id] ?? {};
  console.log(`[${index + 1}/${selected.length}] ${product.id} ${product.name}`);

  if (override.skip === true) {
    report.skipped += 1;
    report.results.push({ productId: product.id, outcome: "skipped-by-override" });
    continue;
  }
  if (!options.overwrite && current && ["approved", "unreviewed"].includes(current.status)) {
    report.skipped += 1;
    report.results.push({ productId: product.id, outcome: "already-imported", status: current.status });
    continue;
  }

  const queries = buildSearchQueries(product, override.query);
  const attemptedQueries = [];
  try {
    let ranked = [];
    if (override.commonsTitle) {
      const exact = await getCommonsFile(override.commonsTitle);
      ranked = exact ? filterAndRankCandidates(product, [{ ...exact, matchedQuery: `override:${override.commonsTitle}` }]) : [];
      ranked = removeRejectedCandidates(product.id, ranked, feedback);
    } else {
      const merged = new Map();
      for (const query of queries) {
        attemptedQueries.push(query);
        report.queryRequests += 1;
        const candidates = await searchCommons(query, { limit: options.candidates });
        const scored = filterAndRankCandidates(
          product,
          candidates.map((candidate) => ({ ...candidate, matchedQuery: query })),
          { learnedBadTerms },
        );
        const afterFeedback = removeRejectedCandidates(product.id, scored, feedback);
        report.feedbackFiltered += scored.length - afterFeedback.length;
        mergeCandidates(merged, afterFeedback);
        ranked = rankMerged(merged);
        if (ranked[0]?.score >= 126) break;
        if (options.delayMs) await sleep(options.delayMs);
      }
    }

    const selectedCandidate = ranked[0];
    const attemptCount = previousAttempts + 1;
    if (!selectedCandidate) {
      const item = {
        productId: product.id,
        mode: product.mode,
        productName: product.name,
        brand: product.brand ?? "",
        categoryLabel: product.categoryLabel,
        query: attemptedQueries[0] ?? queries[0],
        queryHistory: attemptedQueries,
        searchVersion: IMAGE_SEARCH_VERSION,
        attemptCount,
        status: "no-match",
        confidence: "none",
        score: 0,
        importedAt: new Date().toISOString(),
        selected: null,
        alternatives: [],
        notes: [`Ingen återanvändbar kandidat klarade kontrollerna efter ${attemptedQueries.length || 1} sökstrategier i bildsök v${IMAGE_SEARCH_VERSION}. Produkten pausas tills söklogiken förbättras igen.`],
      };
      reviewMap.set(product.id, item);
      report.noMatch += 1;
      report.results.push({ productId: product.id, outcome: "no-match", queriesAttempted: attemptedQueries.length, searchVersion: IMAGE_SEARCH_VERSION });
      continue;
    }

    const matchedQuery = selectedCandidate.matchedQuery ?? attemptedQueries[0] ?? queries[0];
    const confidence = confidenceFromScore(selectedCandidate.score);
    const imageStatus = statusFor(confidence, options.approvalMode);
    const outputRelative = `/product-images/${product.id}.webp`;
    const outputFile = path.join(PUBLIC, outputRelative.replace(/^\//, ""));
    let dimensions = { width: selectedCandidate.width, height: selectedCandidate.height };

    if (!options.dryRun) {
      const tempFile = path.join(TEMP_DIR, `${product.id}.download`);
      const tempOutput = path.join(TEMP_DIR, `${product.id}.webp`);
      await downloadCandidate(selectedCandidate, tempFile);
      dimensions = await convertToWebp(tempFile, tempOutput);
      await rename(tempOutput, outputFile);
      await rm(tempFile, { force: true });
    }

    const imageRecord = {
      productId: product.id,
      path: outputRelative,
      alt: `${product.name} – produktbild`,
      sourceUrl: selectedCandidate.sourceUrl,
      creator: selectedCandidate.metadata.creator || "Ej angivet",
      license: selectedCandidate.metadata.license,
      licenseUrl: selectedCandidate.metadata.licenseUrl || undefined,
      status: imageStatus,
      width: dimensions.width,
      height: dimensions.height,
      importedAt: new Date().toISOString(),
      commonsTitle: selectedCandidate.title,
      confidence,
      score: selectedCandidate.score,
      sha1: selectedCandidate.sha1 || undefined,
      mime: "image/webp",
      reviewedAt: imageStatus === "approved" ? new Date().toISOString() : undefined,
    };
    existingMap.set(product.id, imageRecord);
    reviewMap.set(product.id, {
      productId: product.id,
      mode: product.mode,
      productName: product.name,
      brand: product.brand ?? "",
      categoryLabel: product.categoryLabel,
      query: matchedQuery,
      queryHistory: attemptedQueries,
      searchVersion: IMAGE_SEARCH_VERSION,
      attemptCount,
      status: imageStatus === "approved" ? "approved" : "pending",
      confidence,
      score: selectedCandidate.score,
      importedAt: imageRecord.importedAt,
      selected: { ...candidateSummary(selectedCandidate), path: outputRelative },
      alternatives: ranked.slice(1, 4).map(candidateSummary),
      notes: imageStatus === "approved"
        ? [`Automatiskt godkänd enligt valt workflow-läge med bildsök v${IMAGE_SEARCH_VERSION}.`]
        : [`Bildsök v${IMAGE_SEARCH_VERSION} valde bästa kandidaten efter ${attemptedQueries.length || 1} sökstrategier. Kontrollera att bilden är tillräckligt nära rätt produkt.`],
    });
    report.imported += 1;
    report.results.push({
      productId: product.id,
      outcome: "imported",
      status: imageStatus,
      confidence,
      score: selectedCandidate.score,
      commonsTitle: selectedCandidate.title,
      matchedQuery,
      queriesAttempted: attemptedQueries.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    reviewMap.set(product.id, {
      productId: product.id,
      mode: product.mode,
      productName: product.name,
      brand: product.brand ?? "",
      categoryLabel: product.categoryLabel,
      query: attemptedQueries[0] ?? queries[0],
      queryHistory: attemptedQueries,
      searchVersion: IMAGE_SEARCH_VERSION,
      attemptCount: previousAttempts + 1,
      status: "error",
      confidence: "none",
      score: 0,
      importedAt: new Date().toISOString(),
      selected: null,
      alternatives: [],
      notes: [message],
    });
    report.errors += 1;
    report.results.push({ productId: product.id, outcome: "error", message });
    console.error(`  Fel: ${message}`);
  }
  if (options.delayMs) await sleep(options.delayMs);
}

report.finishedAt = new Date().toISOString();
if (!options.dryRun) {
  const nextManifest = { version: 2, generatedAt: report.finishedAt, images: [...existingMap.values()].sort((a, b) => a.productId.localeCompare(b.productId)) };
  const nextReview = { version: 3, generatedAt: report.finishedAt, searchVersion: IMAGE_SEARCH_VERSION, items: [...reviewMap.values()].sort((a, b) => a.productId.localeCompare(b.productId)) };
  await Promise.all([
    writeFile(MANIFEST_FILE, JSON.stringify(nextManifest, null, 2)),
    writeFile(REVIEW_FILE, JSON.stringify(nextReview, null, 2)),
    writeFile(REPORT_FILE, JSON.stringify(report, null, 2)),
  ]);
}
await rm(TEMP_DIR, { recursive: true, force: true });
console.log(`Klart v${IMAGE_SEARCH_VERSION}: ${report.imported} importerade, ${report.skipped} hoppades över, ${report.noMatch} utan träff, ${report.errors} fel, ${report.feedbackFiltered} tidigare nekade kandidater filtrerades bort, ${report.queryRequests} sökningar.`);
const errorRatio = report.totalSelected > 0 ? report.errors / report.totalSelected : 0;
if (errorRatio > 0.25) {
  throw new Error(`Bildimporten avbröts eftersom ${Math.round(errorRatio * 100)} % av produkterna gav tekniska fel.`);
}
