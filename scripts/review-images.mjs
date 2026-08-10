import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST_FILE = path.join(ROOT, "public", "data", "image-manifest.json");
const REVIEW_FILE = path.join(ROOT, "public", "data", "image-review.json");
const FEEDBACK_FILE = path.join(ROOT, "data", "image-feedback.json");

function parseArgs(argv) {
  const args = { action: "approve-all", ids: [] };
  for (const raw of argv) {
    const [key, value = ""] = raw.replace(/^--/, "").split("=");
    if (key === "action") args.action = value;
    if (key === "ids") args.ids = value.split(/[\s,;]+/).map((id) => id.trim()).filter(Boolean);
  }
  const allowed = ["approve-all", "approve-ids", "reject-ids", "reset-ids"];
  if (!allowed.includes(args.action)) throw new Error(`Ogiltig action: ${args.action}`);
  if (args.action !== "approve-all" && args.ids.length === 0) throw new Error("Ange minst ett produkt-id via --ids=...");
  return args;
}

async function readJson(filename, fallback) {
  try { return JSON.parse(await readFile(filename, "utf8")); }
  catch { return fallback; }
}

const args = parseArgs(process.argv.slice(2));
const [manifest, review, feedback] = await Promise.all([
  readJson(MANIFEST_FILE, { version: 2, generatedAt: "", images: [] }),
  readJson(REVIEW_FILE, { version: 2, generatedAt: "", items: [] }),
  readJson(FEEDBACK_FILE, { version: 1, updatedAt: "", products: {} }),
]);

const imageMap = new Map(manifest.images.map((image) => [image.productId, image]));
const reviewMap = new Map(review.items.map((item) => [item.productId, item]));
const ids = args.action === "approve-all"
  ? manifest.images.filter((image) => image.status === "unreviewed").map((image) => image.productId)
  : args.ids;
const now = new Date().toISOString();
let changed = 0;

for (const id of ids) {
  const image = imageMap.get(id);
  const item = reviewMap.get(id);
  if (!image) {
    console.warn(`${id}: ingen importerad bild hittades.`);
    continue;
  }

  const productFeedback = feedback.products[id] ?? { approved: [], rejected: [] };
  const feedbackEntry = {
    sourceUrl: image.sourceUrl,
    commonsTitle: image.sourceTitle ?? image.commonsTitle ?? item?.selected?.title ?? "",
    sourceTitle: image.sourceTitle ?? image.commonsTitle ?? item?.selected?.title ?? "",
    sourceType: image.sourceType ?? item?.selected?.sourceType ?? "commons",
    provider: image.provider ?? item?.selected?.provider ?? "Wikimedia Commons",
    score: image.score ?? item?.score ?? 0,
    confidence: image.confidence ?? item?.confidence ?? "none",
    query: item?.query ?? "",
    reviewedAt: now,
  };

  if (args.action.startsWith("approve")) {
    image.status = "approved";
    image.reviewedAt = now;
    if (item) { item.status = "approved"; item.reviewedAt = now; }
    if (!productFeedback.approved.some((entry) => entry.sourceUrl === feedbackEntry.sourceUrl)) productFeedback.approved.push(feedbackEntry);
    productFeedback.lastDecision = "approved";
  } else if (args.action === "reject-ids") {
    image.status = "rejected";
    image.reviewedAt = now;
    if (item) { item.status = "rejected"; item.reviewedAt = now; }
    if (!productFeedback.rejected.some((entry) => entry.sourceUrl === feedbackEntry.sourceUrl)) productFeedback.rejected.push(feedbackEntry);
    productFeedback.lastDecision = "rejected";
  } else if (args.action === "reset-ids") {
    imageMap.delete(id);
    reviewMap.delete(id);
    if (image.path) await rm(path.join(ROOT, "public", image.path.replace(/^\//, "")), { force: true });
    productFeedback.lastDecision = "reset";
  }

  productFeedback.updatedAt = now;
  feedback.products[id] = productFeedback;
  changed += 1;
}

manifest.generatedAt = now;
manifest.images = [...imageMap.values()].sort((a, b) => a.productId.localeCompare(b.productId));
review.generatedAt = now;
review.items = [...reviewMap.values()].sort((a, b) => a.productId.localeCompare(b.productId));
feedback.updatedAt = now;

await Promise.all([
  writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2)),
  writeFile(REVIEW_FILE, JSON.stringify(review, null, 2)),
  writeFile(FEEDBACK_FILE, JSON.stringify(feedback, null, 2)),
]);
console.log(`${changed} bildposter uppdaterades (${args.action}).`);
