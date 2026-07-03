import { access, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const manifestFile = path.join(ROOT, "public", "data", "image-manifest.json");
const reviewFile = path.join(ROOT, "public", "data", "image-review.json");
const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
const review = JSON.parse(await readFile(reviewFile, "utf8"));

if (!Array.isArray(manifest.images)) throw new Error("Bildmanifestet saknar images-lista.");
if (!Array.isArray(review.items)) throw new Error("Bildgranskningen saknar items-lista.");
const ids = new Set();
let approved = 0;
let unreviewed = 0;
for (const image of manifest.images) {
  if (!image.productId || ids.has(image.productId)) throw new Error(`Dubbelt eller tomt bild-id: ${image.productId}`);
  ids.add(image.productId);
  if (!/^(lux|everyday)-\d{6}$/.test(image.productId)) throw new Error(`Ogiltigt bild-id: ${image.productId}`);
  if (!["placeholder", "unreviewed", "approved", "rejected"].includes(image.status)) throw new Error(`Ogiltig bildstatus för ${image.productId}`);
  if (["approved", "unreviewed"].includes(image.status)) {
    if (!image.path || !image.alt || !image.sourceUrl || !image.license) throw new Error(`Bild ${image.productId} saknar metadata.`);
    await access(path.join(ROOT, "public", image.path.replace(/^\//, "")));
  }
  if (image.status === "approved") approved += 1;
  if (image.status === "unreviewed") unreviewed += 1;
}

const reviewIds = new Set();
for (const item of review.items) {
  if (!item.productId || reviewIds.has(item.productId)) throw new Error(`Dubbelt eller tomt gransknings-id: ${item.productId}`);
  reviewIds.add(item.productId);
  if (!["pending", "approved", "rejected", "no-match", "error"].includes(item.status)) throw new Error(`Ogiltig granskningsstatus för ${item.productId}`);
  if (!["high", "medium", "low", "none"].includes(item.confidence)) throw new Error(`Ogiltig confidence för ${item.productId}`);
  if (!Array.isArray(item.alternatives) || !Array.isArray(item.notes)) throw new Error(`Granskningspost ${item.productId} har fel format.`);
  if (["pending", "approved"].includes(item.status) && !item.selected) throw new Error(`Granskningspost ${item.productId} saknar vald kandidat.`);
}
console.log(`Bildmanifest: ${manifest.images.length} poster (${approved} godkända, ${unreviewed} väntar). Granskningskö: ${review.items.length}.`);
