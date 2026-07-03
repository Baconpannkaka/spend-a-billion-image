import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST_FILE = path.join(ROOT, "public", "data", "image-manifest.json");
const REVIEW_FILE = path.join(ROOT, "public", "data", "image-review.json");

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

const args = parseArgs(process.argv.slice(2));
const manifest = JSON.parse(await readFile(MANIFEST_FILE, "utf8"));
const review = JSON.parse(await readFile(REVIEW_FILE, "utf8"));
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
  if (args.action.startsWith("approve")) {
    image.status = "approved";
    image.reviewedAt = now;
    if (item) { item.status = "approved"; item.reviewedAt = now; }
  } else if (args.action === "reject-ids") {
    image.status = "rejected";
    image.reviewedAt = now;
    if (item) { item.status = "rejected"; item.reviewedAt = now; }
  } else if (args.action === "reset-ids") {
    imageMap.delete(id);
    reviewMap.delete(id);
    if (image.path) await rm(path.join(ROOT, "public", image.path.replace(/^\//, "")), { force: true });
  }
  changed += 1;
}

manifest.generatedAt = now;
manifest.images = [...imageMap.values()].sort((a, b) => a.productId.localeCompare(b.productId));
review.generatedAt = now;
review.items = [...reviewMap.values()].sort((a, b) => a.productId.localeCompare(b.productId));
await Promise.all([
  writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2)),
  writeFile(REVIEW_FILE, JSON.stringify(review, null, 2)),
]);
console.log(`${changed} bildposter uppdaterades (${args.action}).`);
