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

function parseArgs(argv) {
  const result = {
    scope: "sample",
    limit: 30,
    approvalMode: "review",
    overwrite: false,
    dryRun: false,
    candidates: 10,
    delayMs: 350,
  };
  for (const raw of argv) {
    const [key, value = "true"] = raw.replace(/^--/, "").split("=");
    if (key === "scope") result.scope = value;
    else if (key === "limit") { const parsed = Number(value); result.limit = Number.isFinite(parsed) && parsed >= 0 ? parsed : 30; }
    else if (key === "approval-mode") result.approvalMode = value;
    else if (key === "overwrite") result.overwrite = value === "true";
    else if (key === "dry-run") result.dryRun = value === "true";
    else if (key === "candidates") result.candidates = Math.min(20, Math.max(3, Number(value) || 10));
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

function selectProducts(catalogs, options) {
  const allVerified = catalogs.flatMap((catalog) => catalog.products.filter((product) => product.dataQuality === "verified"));
  if (options.scope === "sample") {
    const total = options.limit === 0 ? Math.min(30, allVerified.length) : Math.min(options.limit, allVerified.length);
    const luxury = allVerified.filter((product) => product.mode === "luxury");
    const everyday = allVerified.filter((product) => product.mode === "everyday");
    const luxuryLimit = Math.ceil(total / 2);
    const everydayLimit = total - luxuryLimit;
    const left = selectStratified(luxury, Math.min(luxuryLimit, luxury.length));
    const right = selectStratified(everyday, Math.min(everydayLimit, everyday.length));
    const interleaved = [];
    for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
      if (left[index]) interleaved.push(left[index]);
      if (right[index]) interleaved.push(right[index]);
    }
    return interleaved.slice(0, total);
  }
  const scoped = options.scope === "luxury" || options.scope === "everyday"
    ? allVerified.filter((product) => product.mode === options.scope)
    : allVerified;
  if (options.scope === "all") return options.limit === 0 ? scoped : scoped.slice(0, options.limit);
  const limit = options.limit === 0 ? scoped.length : Math.min(options.limit, scoped.length);
  return selectStratified(scoped, limit);
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
  const args = tool === "magick"
    ? [input, "-auto-orient", "-resize", "1600x1200>", "-strip", "-quality", "82", output]
    : [input, "-auto-orient", "-resize", "1600x1200>", "-strip", "-quality", "82", output];
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
  };
}

function statusFor(confidence, mode) {
  if (mode === "approve") return "approved";
  if (mode === "high-confidence" && confidence === "high") return "approved";
  return "unreviewed";
}

const options = parseArgs(process.argv.slice(2));
await mkdir(IMAGE_DIR, { recursive: true });
await mkdir(TEMP_DIR, { recursive: true });
const [luxury, everyday, manifest, review, overrides] = await Promise.all([
  readJson(path.join(DATA_DIR, "catalog-luxury.json"), null),
  readJson(path.join(DATA_DIR, "catalog-everyday.json"), null),
  readJson(MANIFEST_FILE, { version: 2, generatedAt: "", images: [] }),
  readJson(REVIEW_FILE, { version: 2, generatedAt: "", items: [] }),
  readJson(OVERRIDES_FILE, {}),
]);
if (!luxury || !everyday) throw new Error("Produktkatalogerna saknas. Kör npm run catalog:generate först.");

const selected = selectProducts([luxury, everyday], options);
const existingMap = new Map(manifest.images.map((image) => [image.productId, image]));
const reviewMap = new Map(review.items.map((item) => [item.productId, item]));
const report = { version: 1, startedAt: new Date().toISOString(), options, totalSelected: selected.length, imported: 0, skipped: 0, noMatch: 0, errors: 0, results: [] };

console.log(`Importerar bilder för ${selected.length} verifierade produkter (${options.scope}).`);
for (let index = 0; index < selected.length; index += 1) {
  const product = selected[index];
  const current = existingMap.get(product.id);
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
  try {
    let ranked = [];
    if (override.commonsTitle) {
      const exact = await getCommonsFile(override.commonsTitle);
      ranked = exact ? filterAndRankCandidates(product, [exact]) : [];
    } else {
      for (const query of queries) {
        const candidates = await searchCommons(query, { limit: options.candidates });
        ranked = filterAndRankCandidates(product, candidates);
        if (ranked.length > 0 && ranked[0].score >= 62) break;
        if (options.delayMs) await sleep(options.delayMs);
      }
    }

    const selectedCandidate = ranked[0];
    if (!selectedCandidate) {
      const item = {
        productId: product.id,
        mode: product.mode,
        productName: product.name,
        brand: product.brand ?? "",
        categoryLabel: product.categoryLabel,
        query: queries[0],
        status: "no-match",
        confidence: "none",
        score: 0,
        importedAt: new Date().toISOString(),
        selected: null,
        alternatives: [],
        notes: ["Ingen återanvändbar kandidat klarade licens- och relevanskontrollen."],
      };
      reviewMap.set(product.id, item);
      report.noMatch += 1;
      report.results.push({ productId: product.id, outcome: "no-match", query: queries[0] });
      continue;
    }

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
      query: queries[0],
      status: imageStatus === "approved" ? "approved" : "pending",
      confidence,
      score: selectedCandidate.score,
      importedAt: imageRecord.importedAt,
      selected: { ...candidateSummary(selectedCandidate), path: outputRelative },
      alternatives: ranked.slice(1, 4).map(candidateSummary),
      notes: imageStatus === "approved" ? ["Automatiskt godkänd enligt valt workflow-läge."] : ["Kontrollera att bilden visar rätt produkt innan godkännande."],
    });
    report.imported += 1;
    report.results.push({ productId: product.id, outcome: "imported", status: imageStatus, confidence, score: selectedCandidate.score, commonsTitle: selectedCandidate.title });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    reviewMap.set(product.id, {
      productId: product.id,
      mode: product.mode,
      productName: product.name,
      brand: product.brand ?? "",
      categoryLabel: product.categoryLabel,
      query: queries[0],
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
  const nextReview = { version: 2, generatedAt: report.finishedAt, items: [...reviewMap.values()].sort((a, b) => a.productId.localeCompare(b.productId)) };
  await Promise.all([
    writeFile(MANIFEST_FILE, JSON.stringify(nextManifest, null, 2)),
    writeFile(REVIEW_FILE, JSON.stringify(nextReview, null, 2)),
    writeFile(REPORT_FILE, JSON.stringify(report, null, 2)),
  ]);
}
await rm(TEMP_DIR, { recursive: true, force: true });
console.log(`Klart: ${report.imported} importerade, ${report.skipped} hoppades över, ${report.noMatch} utan träff, ${report.errors} fel.`);
const errorRatio = report.totalSelected > 0 ? report.errors / report.totalSelected : 0;
if (errorRatio > 0.25) {
  throw new Error(`Bildimporten avbröts eftersom ${Math.round(errorRatio * 100)} % av produkterna gav tekniska fel.`);
}
