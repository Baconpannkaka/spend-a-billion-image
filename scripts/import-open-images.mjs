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
  isSmartAutoApproveCandidate,
  normalizeForImageSearch,
  searchCommons,
  searchOpenverse,
} from "./lib/image-search-v3.mjs";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const DATA_DIR = path.join(PUBLIC, "data");
const IMAGE_DIR = path.join(PUBLIC, "product-images");
const TEMP_DIR = path.join(ROOT, ".tmp", "image-import-v3");
const MANIFEST_FILE = path.join(DATA_DIR, "image-manifest.json");
const REVIEW_FILE = path.join(DATA_DIR, "image-review.json");
const REPORT_FILE = path.join(DATA_DIR, "image-import-report.json");
const OVERRIDES_FILE = path.join(ROOT, "data", "image-overrides.json");
const FEEDBACK_FILE = path.join(ROOT, "data", "image-feedback.json");
const MAX_REJECT_RETRIES = 5;

const LEARNABLE_CONTEXT_TERMS = [
  "engine", "interior", "dashboard", "cockpit", "steering wheel", "wheel only",
  "launch event", "product launch", "keynote", "inside store", "shop display",
  "logo", "diagram", "poster", "screenshot",
];

function parseArgs(argv) {
  const result = { scope: "sample", limit: 30, approvalMode: "smart", overwrite: false, dryRun: false, candidates: 12, delayMs: 350 };
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
  if (!["review", "smart", "high-confidence", "approve"].includes(result.approvalMode)) throw new Error(`Ogiltigt approval-mode: ${result.approvalMode}`);
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
  if (item.status === "no-match") return Number(item.searchVersion ?? 0) < IMAGE_SEARCH_VERSION ? "upgrade-retry" : "exhausted";
  if (item.status === "error") return "error-retry";
  return "fresh";
}

function selectProducts(catalogs, options, existingMap, reviewMap, feedback) {
  const verified = catalogs.flatMap((catalog) => catalog.products.filter((product) => product.dataQuality === "verified"));
  const scoped = options.scope === "luxury" || options.scope === "everyday" ? verified.filter((product) => product.mode === options.scope) : verified;
  const duplicateIds = [...new Set(scoped.map((product) => product.id).filter((id, index, ids) => ids.indexOf(id) !== index))];
  const buckets = { rejected: [], "upgrade-retry": [], "error-retry": [], fresh: [], exhausted: [], done: [] };
  for (const product of scoped) buckets[classifyProduct(product, options, existingMap, reviewMap, feedback)].push(product);
  const eligibleCount = buckets.rejected.length + buckets["upgrade-retry"].length + buckets["error-retry"].length + buckets.fresh.length;
  const requested = options.limit === 0 ? eligibleCount : Math.min(options.limit, eligibleCount);
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
      if (!chosenIds.has(product.id)) { chosen.push(product); chosenIds.add(product.id); taken += 1; }
    }
  }
  take("rejected", Math.ceil(requested * 0.2));
  take("upgrade-retry", Math.ceil(requested * 0.65));
  take("error-retry", Math.ceil(requested * 0.05));
  take("fresh", requested - chosen.length);
  while (chosen.length < requested) {
    const before = chosen.length;
    for (const reason of ["upgrade-retry", "rejected", "fresh", "error-retry"]) {
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
    verifiedTotal: scoped.length,
    duplicateVerifiedIds: duplicateIds,
    selectionStats: { ...reasonCounts, exhausted: buckets.exhausted.length, done: buckets.done.length, selected: chosen.length },
  };
}

function deriveLearnedBadTerms(feedback) {
  const counts = new Map(LEARNABLE_CONTEXT_TERMS.map((term) => [term, { approved: 0, rejected: 0 }]));
  for (const entry of Object.values(feedback.products ?? {})) {
    for (const decision of ["approved", "rejected"]) {
      for (const item of entry?.[decision] ?? []) {
        const text = normalizeForImageSearch(`${item.commonsTitle ?? ""} ${item.sourceUrl ?? ""}`);
        for (const term of LEARNABLE_CONTEXT_TERMS) if (text.includes(normalizeForImageSearch(term))) counts.get(term)[decision] += 1;
      }
    }
  }
  return [...counts.entries()].filter(([, value]) => value.rejected >= 1 && value.rejected > value.approved * 1.5).map(([term]) => term);
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
    let stdout = ""; let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve(stdout.trim()) : reject(new Error(stderr.trim() || `${command} avslutades med kod ${code}`)));
  });
}

async function convertToWebp(input, output) {
  const tool = await commandExists("magick") ? "magick" : await commandExists("convert") ? "convert" : null;
  if (!tool) throw new Error("ImageMagick saknas. Kör GitHub-workflowet.");
  await run(tool, [input, "-auto-orient", "-resize", "1600x1200>", "-strip", "-quality", "82", output]);
  const dimensions = tool === "magick" ? await run(tool, ["identify", "-format", "%w,%h", output]) : await run("identify", ["-format", "%w,%h", output]);
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
    sourceType: candidate.sourceType,
    provider: candidate.provider,
    source: candidate.source,
    attribution: candidate.metadata.attribution,
  };
}

function statusFor(product, candidate, confidence, mode) {
  if (mode === "approve") return "approved";
  if (mode === "high-confidence" && confidence === "high") return "approved";
  if (mode === "smart" && isSmartAutoApproveCandidate(product, candidate)) return "approved";
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

function unique(values) { return [...new Set(values.filter(Boolean))]; }

function openverseQueries(queries) {
  return unique([queries[1], queries[3], queries[5], queries[0], queries[2]]).slice(0, 4);
}

async function searchSource({ product, queries, sourceType, search, merged, feedback, learnedBadTerms, report, options }) {
  for (const query of queries) {
    report.sourceRequests[sourceType] += 1;
    const candidates = await search(query, { limit: options.candidates });
    const scored = filterAndRankCandidates(product, candidates.map((candidate) => ({ ...candidate, matchedQuery: query })), { learnedBadTerms });
    const afterFeedback = removeRejectedCandidates(product.id, scored, feedback);
    report.feedbackFiltered += scored.length - afterFeedback.length;
    mergeCandidates(merged, afterFeedback);
    const ranked = rankMerged(merged);
    if (sourceType === "commons" && ranked[0]?.sourceType === "commons" && ranked[0]?.score >= 138) break;
    if (options.delayMs) await sleep(options.delayMs);
  }
}

async function saveCandidateImage(product, ranked, outputFile) {
  let lastError;
  for (const candidate of ranked.slice(0, 4)) {
    const tempFile = path.join(TEMP_DIR, `${product.id}.download`);
    const tempOutput = path.join(TEMP_DIR, `${product.id}.webp`);
    try {
      await rm(tempFile, { force: true });
      await rm(tempOutput, { force: true });
      await downloadCandidate(candidate, tempFile);
      const dimensions = await convertToWebp(tempFile, tempOutput);
      await rename(tempOutput, outputFile);
      await rm(tempFile, { force: true });
      return { candidate, dimensions };
    } catch (error) {
      lastError = error;
      console.warn(`  Kandidat från ${candidate.sourceType ?? "okänd källa"} kunde inte sparas: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw lastError ?? new Error("Ingen kandidat kunde laddas ned.");
}

const options = parseArgs(process.argv.slice(2));
await mkdir(IMAGE_DIR, { recursive: true });
await mkdir(TEMP_DIR, { recursive: true });
const [luxury, everyday, manifest, review, overrides, feedback] = await Promise.all([
  readJson(path.join(DATA_DIR, "catalog-luxury.json"), null),
  readJson(path.join(DATA_DIR, "catalog-everyday.json"), null),
  readJson(MANIFEST_FILE, { version: 2, generatedAt: "", images: [] }),
  readJson(REVIEW_FILE, { version: 3, generatedAt: "", items: [] }),
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
  version: 4,
  searchVersion: IMAGE_SEARCH_VERSION,
  startedAt: new Date().toISOString(),
  options,
  verifiedTotal: selection.verifiedTotal,
  duplicateVerifiedIds: selection.duplicateVerifiedIds,
  selectionStats: selection.selectionStats,
  learnedBadTerms,
  totalSelected: selected.length,
  imported: 0,
  autoApproved: 0,
  skipped: 0,
  noMatch: 0,
  errors: 0,
  feedbackFiltered: 0,
  sourceRequests: { commons: 0, openverse: 0 },
  sourceMatches: { commons: 0, openverse: 0 },
  results: [],
};

console.log(`Bildsök v${IMAGE_SEARCH_VERSION}: ${selected.length} av ${selection.verifiedTotal} verifierade produkter (${options.scope}).`);
console.log(`Urval: ${JSON.stringify(selection.selectionStats)}.`);
if (selection.duplicateVerifiedIds.length) console.warn(`Dubbla verifierade produkt-id:n: ${selection.duplicateVerifiedIds.join(", ")}`);
if (learnedBadTerms.length) console.log(`Lärda negativa bildsignaler: ${learnedBadTerms.join(", ")}.`);

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
    const merged = new Map();
    const previousWasOldNoMatch = previousReview?.status === "no-match" && Number(previousReview.searchVersion ?? 0) < IMAGE_SEARCH_VERSION;

    if (override.commonsTitle) {
      const exact = await getCommonsFile(override.commonsTitle);
      const ranked = exact ? filterAndRankCandidates(product, [{ ...exact, matchedQuery: `override:${override.commonsTitle}` }], { learnedBadTerms }) : [];
      mergeCandidates(merged, removeRejectedCandidates(product.id, ranked, feedback));
      report.sourceRequests.commons += 1;
    } else {
      if (!previousWasOldNoMatch) {
        attemptedQueries.push(...queries);
        await searchSource({ product, queries, sourceType: "commons", search: searchCommons, merged, feedback, learnedBadTerms, report, options });
      }
      let ranked = rankMerged(merged);
      if (!ranked[0] || ranked[0].score < 118) {
        const ovQueries = openverseQueries(queries);
        attemptedQueries.push(...ovQueries);
        await searchSource({ product, queries: ovQueries, sourceType: "openverse", search: searchOpenverse, merged, feedback, learnedBadTerms, report, options });
      }
    }

    let ranked = rankMerged(merged);
    const attemptCount = previousAttempts + 1;
    if (!ranked[0]) {
      reviewMap.set(product.id, {
        productId: product.id, mode: product.mode, productName: product.name, brand: product.brand ?? "", categoryLabel: product.categoryLabel,
        query: attemptedQueries[0] ?? queries[0], queryHistory: unique(attemptedQueries), searchVersion: IMAGE_SEARCH_VERSION, attemptCount,
        status: "no-match", confidence: "none", score: 0, importedAt: new Date().toISOString(), selected: null, alternatives: [],
        notes: ["Bildsök v3 hittade ingen tillräckligt relevant kandidat i de tillåtna öppna källorna. Produkten pausas till nästa sökversion."],
      });
      report.noMatch += 1;
      report.results.push({ productId: product.id, outcome: "no-match", queriesAttempted: unique(attemptedQueries).length, searchVersion: IMAGE_SEARCH_VERSION });
      continue;
    }

    const outputRelative = `/product-images/${product.id}.webp`;
    const outputFile = path.join(PUBLIC, outputRelative.replace(/^\//, ""));
    let selectedCandidate = ranked[0];
    let dimensions = { width: selectedCandidate.width, height: selectedCandidate.height };
    if (!options.dryRun) {
      const saved = await saveCandidateImage(product, ranked, outputFile);
      selectedCandidate = saved.candidate;
      dimensions = saved.dimensions;
      ranked = [selectedCandidate, ...ranked.filter((candidate) => candidate.sourceUrl !== selectedCandidate.sourceUrl)];
    }

    const matchedQuery = selectedCandidate.matchedQuery ?? attemptedQueries[0] ?? queries[0];
    const confidence = confidenceFromScore(selectedCandidate.score);
    const imageStatus = statusFor(product, selectedCandidate, confidence, options.approvalMode);
    if (imageStatus === "approved" && options.approvalMode === "smart") report.autoApproved += 1;
    report.sourceMatches[selectedCandidate.sourceType ?? "commons"] += 1;
    const now = new Date().toISOString();
    const imageRecord = {
      productId: product.id, path: outputRelative, alt: `${product.name} – produktbild`, sourceUrl: selectedCandidate.sourceUrl,
      creator: selectedCandidate.metadata.creator || "Ej angivet", license: selectedCandidate.metadata.license,
      licenseUrl: selectedCandidate.metadata.licenseUrl || undefined, status: imageStatus, width: dimensions.width, height: dimensions.height,
      importedAt: now, commonsTitle: selectedCandidate.title, sourceTitle: selectedCandidate.title,
      sourceType: selectedCandidate.sourceType ?? "commons", provider: selectedCandidate.provider, source: selectedCandidate.source,
      attribution: selectedCandidate.metadata.attribution || undefined, confidence, score: selectedCandidate.score,
      sha1: selectedCandidate.sha1 || undefined, mime: "image/webp", reviewedAt: imageStatus === "approved" ? now : undefined,
    };
    existingMap.set(product.id, imageRecord);
    reviewMap.set(product.id, {
      productId: product.id, mode: product.mode, productName: product.name, brand: product.brand ?? "", categoryLabel: product.categoryLabel,
      query: matchedQuery, queryHistory: unique(attemptedQueries), searchVersion: IMAGE_SEARCH_VERSION, attemptCount,
      status: imageStatus === "approved" ? "approved" : "pending", confidence, score: selectedCandidate.score, importedAt: now,
      selected: { ...candidateSummary(selectedCandidate), path: outputRelative }, alternatives: ranked.slice(1, 4).map(candidateSummary),
      notes: imageStatus === "approved"
        ? ["Bildsök v3 auto-godkände en mycket säker exakt Commons-träff. Openverse-träffar auto-godkänns aldrig."]
        : [`Bildsök v3 valde bästa kandidaten från ${selectedCandidate.sourceType === "openverse" ? "Openverse" : "Wikimedia Commons"}. Kontrollera produkten och licenskällan innan godkännande.`],
    });
    report.imported += 1;
    report.results.push({ productId: product.id, outcome: "imported", status: imageStatus, confidence, score: selectedCandidate.score, sourceType: selectedCandidate.sourceType, sourceTitle: selectedCandidate.title, matchedQuery });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    reviewMap.set(product.id, {
      productId: product.id, mode: product.mode, productName: product.name, brand: product.brand ?? "", categoryLabel: product.categoryLabel,
      query: queries[0], queryHistory: unique(attemptedQueries), searchVersion: IMAGE_SEARCH_VERSION, attemptCount: previousAttempts + 1,
      status: "error", confidence: "none", score: 0, importedAt: new Date().toISOString(), selected: null, alternatives: [], notes: [message],
    });
    report.errors += 1;
    report.results.push({ productId: product.id, outcome: "error", message });
    console.error(`  Fel: ${message}`);
  }
  if (options.delayMs) await sleep(options.delayMs);
}

report.finishedAt = new Date().toISOString();
if (!options.dryRun) {
  const nextManifest = { version: 3, generatedAt: report.finishedAt, images: [...existingMap.values()].sort((a, b) => a.productId.localeCompare(b.productId)) };
  const nextReview = { version: 4, generatedAt: report.finishedAt, searchVersion: IMAGE_SEARCH_VERSION, items: [...reviewMap.values()].sort((a, b) => a.productId.localeCompare(b.productId)) };
  await Promise.all([
    writeFile(MANIFEST_FILE, JSON.stringify(nextManifest, null, 2)),
    writeFile(REVIEW_FILE, JSON.stringify(nextReview, null, 2)),
    writeFile(REPORT_FILE, JSON.stringify(report, null, 2)),
  ]);
}
await rm(TEMP_DIR, { recursive: true, force: true });
console.log(`Klart v${IMAGE_SEARCH_VERSION}: ${report.imported} importerade (${report.autoApproved} auto-godkända), ${report.noMatch} utan träff, ${report.errors} fel. Commons ${report.sourceRequests.commons} sökningar/${report.sourceMatches.commons} valda, Openverse ${report.sourceRequests.openverse} sökningar/${report.sourceMatches.openverse} valda.`);
const errorRatio = report.totalSelected > 0 ? report.errors / report.totalSelected : 0;
if (errorRatio > 0.25) throw new Error(`Bildimporten avbröts eftersom ${Math.round(errorRatio * 100)} % av produkterna gav tekniska fel.`);
